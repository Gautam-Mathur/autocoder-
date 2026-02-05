import { app, BrowserWindow, ipcMain, shell, IpcMainInvokeEvent } from 'electron';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { LocalRunner } from './services/local-runner.js';
import { ProjectManager } from './services/project-manager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

let mainWindow: BrowserWindow | null = null;
const runner = new LocalRunner();
const projectManager = new ProjectManager();

function createWindow() {
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
    mainWindow.loadURL('http://localhost:5000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.webContents.setWindowOpenHandler(({ url }: { url: string }) => {
    shell.openExternal(url);
    return { action: 'deny' as const };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
    runner.cleanup();
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  runner.cleanup();
});

ipcMain.handle('runner:writeFiles', async (_event: IpcMainInvokeEvent, projectName: string, files: Array<{ path: string; content: string }>) => {
  try {
    const projectPath = await projectManager.ensureProject(projectName);
    await runner.writeFiles(projectPath, files);
    return { success: true, projectPath };
  } catch (error) {
    return { success: false, error: String(error) };
  }
});

ipcMain.handle('runner:npmInstall', async (_event: IpcMainInvokeEvent, projectName: string) => {
  try {
    const projectPath = projectManager.getProjectPath(projectName);
    const result = await runner.npmInstall(projectPath, (log) => {
      mainWindow?.webContents.send('runner:log', log);
    });
    return result;
  } catch (error) {
    return { success: false, error: String(error) };
  }
});

ipcMain.handle('runner:startServer', async (_event: IpcMainInvokeEvent, projectName: string) => {
  try {
    const projectPath = projectManager.getProjectPath(projectName);
    const result = await runner.startDevServer(projectPath, (log) => {
      mainWindow?.webContents.send('runner:log', log);
    });
    
    if (result.success) {
      mainWindow?.webContents.send('runner:serverReady', result.url);
    }
    
    return result;
  } catch (error) {
    return { success: false, error: String(error) };
  }
});

ipcMain.handle('runner:stopServer', async () => {
  try {
    await runner.stopDevServer();
    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
});

ipcMain.handle('runner:getStatus', async () => {
  return {
    isRunning: runner.isServerRunning(),
    url: runner.getServerUrl(),
  };
});

ipcMain.handle('project:list', async () => {
  return projectManager.listProjects();
});

ipcMain.handle('project:delete', async (_event: IpcMainInvokeEvent, projectName: string) => {
  try {
    await projectManager.deleteProject(projectName);
    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
});

ipcMain.handle('project:open', async (_event: IpcMainInvokeEvent, projectName: string) => {
  try {
    const projectPath = projectManager.getProjectPath(projectName);
    shell.openPath(projectPath);
    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
});

ipcMain.handle('isElectron', () => true);
