import { app, BrowserWindow, ipcMain, shell, IpcMainInvokeEvent } from 'electron';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { LocalRunner } from './services/local-runner.js';
import { ProjectManager } from './services/project-manager.js';
import { logger } from './services/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

let mainWindow: BrowserWindow | null = null;
const runner = new LocalRunner();
const projectManager = new ProjectManager();

// Send logs to renderer
logger.subscribe((entry) => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('logger:entry', entry);
  }
});

function createWindow() {
  logger.info('App', 'Creating main window', { isDev });
  
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    title: 'AutoCoder',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  if (isDev) {
    const devPort = process.env.DEV_PORT || '5100';
    const devUrl = `http://localhost:${devPort}`;
    logger.info('App', `Loading dev URL: ${devUrl}`);

    const waitForServer = async (url: string, maxRetries = 30, interval = 1000): Promise<boolean> => {
      for (let i = 0; i < maxRetries; i++) {
        try {
          const { net } = await import('electron');
          await new Promise<void>((resolve, reject) => {
            const request = net.request(url);
            request.on('response', () => resolve());
            request.on('error', () => reject());
            request.end();
          });
          return true;
        } catch {
          logger.info('App', `Waiting for dev server... (attempt ${i + 1}/${maxRetries})`);
          await new Promise(r => setTimeout(r, interval));
        }
      }
      return false;
    };

    waitForServer(devUrl).then(async (ready) => {
      if (ready && mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.loadURL(devUrl);
      } else {
        logger.error('App', `Dev server not available at ${devUrl} after 30 retries. Make sure to run "npm run dev" first.`);
        mainWindow?.loadURL(`data:text/html,<html><body style="font-family:sans-serif;padding:40px;background:#1a1a2e;color:#e0e0e0"><h1>Could not connect to dev server</h1><p>Make sure the web server is running first:</p><pre style="background:#16213e;padding:16px;border-radius:8px">npm run dev</pre><p>Then restart Electron:</p><pre style="background:#16213e;padding:16px;border-radius:8px">npm run electron:dev</pre><p>Tried connecting to: <strong>${devUrl}</strong></p><p>You can change the port with: <code>DEV_PORT=3000 npm run electron:dev</code></p></body></html>`);
      }
    });

    mainWindow.webContents.openDevTools();
  } else {
    const prodPath = path.join(__dirname, '../dist/index.html');
    logger.info('App', `Loading production file: ${prodPath}`);
    mainWindow.loadFile(prodPath);
  }

  mainWindow.webContents.on('did-fail-load', (_event, errorCode, errorDescription, validatedURL) => {
    logger.error('App', 'Failed to load URL', { errorCode, errorDescription, validatedURL });
    if (isDev) {
      logger.info('App', 'Tip: Make sure the dev server is running with "npm run dev" before starting Electron');
    }
  });

  mainWindow.webContents.on('did-finish-load', () => {
    logger.info('App', 'Page loaded successfully');
  });

  mainWindow.webContents.on('console-message', (_event, level, message, line, sourceId) => {
    const levels: Record<number, 'debug' | 'info' | 'warn' | 'error'> = {
      0: 'debug',
      1: 'info', 
      2: 'warn',
      3: 'error'
    };
    logger.log(levels[level] || 'info', 'Renderer', message, { line, sourceId });
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }: { url: string }) => {
    logger.info('App', `Opening external URL: ${url}`);
    shell.openExternal(url);
    return { action: 'deny' as const };
  });

  mainWindow.on('closed', () => {
    logger.info('App', 'Window closed');
    mainWindow = null;
    runner.cleanup();
  });
}

app.whenReady().then(() => {
  logger.info('App', 'Electron app ready', { 
    version: app.getVersion(),
    platform: process.platform,
    arch: process.arch,
    nodeVersion: process.version
  });
  
  logger.rotateLogs();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      logger.info('App', 'Activating - creating new window');
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  logger.info('App', 'All windows closed');
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  logger.info('App', 'App quitting');
  runner.cleanup();
});

// Uncaught exception handling
process.on('uncaughtException', (error) => {
  logger.error('Process', 'Uncaught exception', { 
    message: error.message, 
    stack: error.stack 
  });
});

process.on('unhandledRejection', (reason) => {
  logger.error('Process', 'Unhandled rejection', { reason: String(reason) });
});

// IPC Handlers with logging
ipcMain.handle('runner:writeFiles', async (_event: IpcMainInvokeEvent, projectName: string, files: Array<{ path: string; content: string }>) => {
  logger.ipc('runner:writeFiles', 'in', { projectName, fileCount: files.length });
  try {
    const projectPath = await projectManager.ensureProject(projectName);
    await runner.writeFiles(projectPath, files);
    logger.info('Runner', `Wrote ${files.length} files to ${projectName}`);
    return { success: true, projectPath };
  } catch (error) {
    logger.error('Runner', 'Failed to write files', { projectName, error: String(error) });
    return { success: false, error: String(error) };
  }
});

ipcMain.handle('runner:npmInstall', async (_event: IpcMainInvokeEvent, projectName: string) => {
  logger.ipc('runner:npmInstall', 'in', { projectName });
  try {
    const projectPath = projectManager.getProjectPath(projectName);
    const result = await runner.npmInstall(
      projectPath, 
      (log) => {
        logger.process('npm', log);
        mainWindow?.webContents.send('runner:log', log);
      },
      (percent, message) => {
        logger.debug('npm', `Progress: ${percent}% - ${message}`);
        mainWindow?.webContents.send('runner:progress', { percent, message });
      }
    );
    logger.ipc('runner:npmInstall', 'out', result);
    return result;
  } catch (error) {
    logger.error('Runner', 'npm install failed', { projectName, error: String(error) });
    return { success: false, error: String(error) };
  }
});

ipcMain.handle('runner:startServer', async (_event: IpcMainInvokeEvent, projectName: string) => {
  logger.ipc('runner:startServer', 'in', { projectName });
  try {
    const projectPath = projectManager.getProjectPath(projectName);
    const result = await runner.startDevServer(projectPath, (log) => {
      logger.process('DevServer', log);
      mainWindow?.webContents.send('runner:log', log);
    });
    
    if (result.success) {
      logger.info('Runner', `Dev server started at ${result.url}`);
      mainWindow?.webContents.send('runner:serverReady', result.url);
    }
    
    logger.ipc('runner:startServer', 'out', result);
    return result;
  } catch (error) {
    logger.error('Runner', 'Failed to start server', { projectName, error: String(error) });
    return { success: false, error: String(error) };
  }
});

ipcMain.handle('runner:stopServer', async () => {
  logger.ipc('runner:stopServer', 'in');
  try {
    await runner.stopDevServer();
    logger.info('Runner', 'Dev server stopped');
    return { success: true };
  } catch (error) {
    logger.error('Runner', 'Failed to stop server', { error: String(error) });
    return { success: false, error: String(error) };
  }
});

ipcMain.handle('runner:getStatus', async () => {
  const status = {
    isRunning: runner.isServerRunning(),
    url: runner.getServerUrl(),
  };
  logger.ipc('runner:getStatus', 'out', status);
  return status;
});

ipcMain.handle('project:list', async () => {
  logger.ipc('project:list', 'in');
  const projects = await projectManager.listProjects();
  logger.ipc('project:list', 'out', { count: projects.length });
  return projects;
});

ipcMain.handle('project:delete', async (_event: IpcMainInvokeEvent, projectName: string) => {
  logger.ipc('project:delete', 'in', { projectName });
  try {
    await projectManager.deleteProject(projectName);
    logger.info('Project', `Deleted project: ${projectName}`);
    return { success: true };
  } catch (error) {
    logger.error('Project', 'Failed to delete project', { projectName, error: String(error) });
    return { success: false, error: String(error) };
  }
});

ipcMain.handle('project:open', async (_event: IpcMainInvokeEvent, projectName: string) => {
  logger.ipc('project:open', 'in', { projectName });
  try {
    const projectPath = projectManager.getProjectPath(projectName);
    logger.info('Project', `Opening project folder: ${projectPath}`);
    shell.openPath(projectPath);
    return { success: true };
  } catch (error) {
    logger.error('Project', 'Failed to open project', { projectName, error: String(error) });
    return { success: false, error: String(error) };
  }
});

ipcMain.handle('isElectron', () => {
  logger.debug('App', 'isElectron check: true');
  return true;
});

// Logger IPC handlers
ipcMain.handle('logger:getLogs', async (_event: IpcMainInvokeEvent, count?: number) => {
  return logger.getRecentLogs(count);
});

ipcMain.handle('logger:getLogFile', async () => {
  return logger.getLogFilePath();
});

ipcMain.handle('logger:setLevel', async (_event: IpcMainInvokeEvent, level: 'debug' | 'info' | 'warn' | 'error') => {
  logger.setMinLevel(level);
  return { success: true };
});
