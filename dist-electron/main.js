import { createRequire } from 'module';const require = createRequire(import.meta.url);

// electron/main.ts
import { app as app2, BrowserWindow, ipcMain, shell } from "electron";
import * as path4 from "path";
import { fileURLToPath } from "url";

// electron/services/local-runner.ts
import { spawn } from "child_process";
import * as fs from "fs";
import * as path from "path";
var LocalRunner = class {
  currentProcess = null;
  serverUrl = null;
  serverPort = 3e3;
  async writeFiles(projectPath, files) {
    for (const file of files) {
      const fullPath = path.join(projectPath, file.path);
      const dir = path.dirname(fullPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(fullPath, file.content, "utf-8");
    }
  }
  countDependencies(projectPath) {
    try {
      const packageJsonPath = path.join(projectPath, "package.json");
      if (!fs.existsSync(packageJsonPath)) return 0;
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
      const deps = Object.keys(packageJson.dependencies || {}).length;
      const devDeps = Object.keys(packageJson.devDependencies || {}).length;
      return deps + devDeps;
    } catch {
      return 0;
    }
  }
  async npmInstall(projectPath, onLog, onProgress) {
    return new Promise((resolve) => {
      const totalDeps = this.countDependencies(projectPath);
      let installedCount = 0;
      let lastPercent = 0;
      onLog("[AutoCoder] Running npm install...");
      onProgress?.(0, `Starting installation (${totalDeps} packages)...`);
      const npm = process.platform === "win32" ? "npm.cmd" : "npm";
      const child = spawn(npm, ["install", "--progress"], {
        cwd: projectPath,
        shell: true,
        env: { ...process.env, FORCE_COLOR: "1" }
      });
      const updateProgress = (line) => {
        if (totalDeps === 0) {
          onProgress?.(50, "Installing packages...");
          return;
        }
        const addedMatch = line.match(/added (\d+) package/i);
        if (addedMatch) {
          installedCount = parseInt(addedMatch[1], 10);
          const percent = Math.min(Math.round(installedCount / Math.max(totalDeps, installedCount) * 100), 99);
          if (percent > lastPercent) {
            lastPercent = percent;
            onProgress?.(percent, `Installed ${installedCount} packages...`);
          }
          return;
        }
        const httpMatch = line.match(/http fetch (GET|POST)/i);
        if (httpMatch && lastPercent < 30) {
          lastPercent = Math.min(lastPercent + 2, 30);
          onProgress?.(lastPercent, "Fetching packages...");
          return;
        }
        const reifyMatch = line.match(/reify:/i);
        if (reifyMatch && lastPercent < 60) {
          lastPercent = Math.min(lastPercent + 5, 60);
          onProgress?.(lastPercent, "Extracting packages...");
          return;
        }
        const buildMatch = line.match(/timing build/i);
        if (buildMatch && lastPercent < 90) {
          lastPercent = Math.min(lastPercent + 3, 90);
          onProgress?.(lastPercent, "Building packages...");
        }
      };
      child.stdout?.on("data", (data) => {
        const lines = data.toString().split("\n").filter(Boolean);
        lines.forEach((line) => {
          onLog(`[npm] ${line}`);
          updateProgress(line);
        });
      });
      child.stderr?.on("data", (data) => {
        const lines = data.toString().split("\n").filter(Boolean);
        lines.forEach((line) => {
          onLog(`[npm] ${line}`);
          updateProgress(line);
        });
      });
      child.on("error", (error) => {
        onLog(`[AutoCoder] npm install failed: ${error.message}`);
        onProgress?.(0, `Error: ${error.message}`);
        resolve({ success: false, error: error.message });
      });
      child.on("close", (code) => {
        if (code === 0) {
          onLog("[AutoCoder] npm install completed successfully");
          onProgress?.(100, "Installation complete!");
          resolve({ success: true });
        } else {
          onLog(`[AutoCoder] npm install failed with code ${code}`);
          onProgress?.(0, `Failed with code ${code}`);
          resolve({ success: false, error: `npm install exited with code ${code}` });
        }
      });
    });
  }
  async startDevServer(projectPath, onLog) {
    if (this.currentProcess) {
      await this.stopDevServer();
    }
    return new Promise((resolve) => {
      const packageJsonPath = path.join(projectPath, "package.json");
      if (!fs.existsSync(packageJsonPath)) {
        resolve({ success: false, error: "package.json not found" });
        return;
      }
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
      const scripts = packageJson.scripts || {};
      let command = "npm";
      let args = ["run"];
      if (scripts.dev) {
        args.push("dev");
      } else if (scripts.start) {
        args.push("start");
      } else {
        resolve({ success: false, error: "No dev or start script found in package.json" });
        return;
      }
      onLog(`[AutoCoder] Starting dev server (port ${this.serverPort})...`);
      const npm = process.platform === "win32" ? "npm.cmd" : "npm";
      this.currentProcess = spawn(npm, args, {
        cwd: projectPath,
        shell: true,
        env: {
          ...process.env,
          PORT: String(this.serverPort),
          FORCE_COLOR: "1"
        }
      });
      let serverStarted = false;
      const urlPattern = /localhost:(\d+)|http:\/\/127\.0\.0\.1:(\d+)|http:\/\/0\.0\.0\.0:(\d+)/;
      const handleOutput = (data) => {
        const text = data.toString();
        const lines = text.split("\n").filter(Boolean);
        lines.forEach((line) => {
          onLog(`[dev] ${line}`);
          if (!serverStarted) {
            const match = line.match(urlPattern);
            if (match) {
              const port = match[1] || match[2] || match[3];
              this.serverUrl = `http://localhost:${port}`;
              serverStarted = true;
              onLog(`[AutoCoder] Dev server ready at ${this.serverUrl}`);
              resolve({ success: true, url: this.serverUrl });
            }
          }
        });
      };
      this.currentProcess.stdout?.on("data", handleOutput);
      this.currentProcess.stderr?.on("data", handleOutput);
      this.currentProcess.on("error", (error) => {
        onLog(`[AutoCoder] Dev server error: ${error.message}`);
        if (!serverStarted) {
          resolve({ success: false, error: error.message });
        }
      });
      this.currentProcess.on("close", (code) => {
        if (!serverStarted) {
          onLog(`[AutoCoder] Dev server exited with code ${code}`);
          resolve({ success: false, error: `Server exited with code ${code}` });
        }
        this.currentProcess = null;
        this.serverUrl = null;
      });
      setTimeout(() => {
        if (!serverStarted && this.currentProcess) {
          this.serverUrl = `http://localhost:${this.serverPort}`;
          onLog(`[AutoCoder] Assuming server ready at ${this.serverUrl}`);
          serverStarted = true;
          resolve({ success: true, url: this.serverUrl });
        }
      }, 1e4);
    });
  }
  async stopDevServer() {
    if (this.currentProcess) {
      if (process.platform === "win32") {
        spawn("taskkill", ["/pid", String(this.currentProcess.pid), "/f", "/t"]);
      } else {
        this.currentProcess.kill("SIGTERM");
      }
      this.currentProcess = null;
      this.serverUrl = null;
    }
  }
  isServerRunning() {
    return this.currentProcess !== null;
  }
  getServerUrl() {
    return this.serverUrl;
  }
  cleanup() {
    this.stopDevServer();
  }
};

// electron/services/project-manager.ts
import * as fs2 from "fs";
import * as path2 from "path";
import * as os from "os";
var ProjectManager = class {
  baseDir;
  constructor() {
    this.baseDir = path2.join(os.homedir(), "AutoCoder", "projects");
    this.ensureBaseDir();
  }
  ensureBaseDir() {
    if (!fs2.existsSync(this.baseDir)) {
      fs2.mkdirSync(this.baseDir, { recursive: true });
    }
  }
  getProjectPath(projectName) {
    const safeName = projectName.replace(/[^a-zA-Z0-9-_]/g, "-").toLowerCase();
    return path2.join(this.baseDir, safeName);
  }
  async ensureProject(projectName) {
    const projectPath = this.getProjectPath(projectName);
    if (!fs2.existsSync(projectPath)) {
      fs2.mkdirSync(projectPath, { recursive: true });
    }
    return projectPath;
  }
  async listProjects() {
    this.ensureBaseDir();
    try {
      const entries = fs2.readdirSync(this.baseDir, { withFileTypes: true });
      return entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort((a, b) => {
        const aPath = path2.join(this.baseDir, a);
        const bPath = path2.join(this.baseDir, b);
        const aStat = fs2.statSync(aPath);
        const bStat = fs2.statSync(bPath);
        return bStat.mtime.getTime() - aStat.mtime.getTime();
      });
    } catch {
      return [];
    }
  }
  async deleteProject(projectName) {
    const projectPath = this.getProjectPath(projectName);
    if (fs2.existsSync(projectPath)) {
      fs2.rmSync(projectPath, { recursive: true, force: true });
    }
  }
  async projectExists(projectName) {
    const projectPath = this.getProjectPath(projectName);
    return fs2.existsSync(projectPath);
  }
  getBaseDir() {
    return this.baseDir;
  }
};

// electron/services/logger.ts
import * as fs3 from "fs";
import * as path3 from "path";
import { app } from "electron";
var ElectronLogger = class {
  logDir;
  logFile;
  listeners = [];
  buffer = [];
  maxBufferSize = 1e3;
  minLevel = "debug";
  levelPriority = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3
  };
  constructor() {
    try {
      this.logDir = path3.join(app.getPath("userData"), "logs");
    } catch {
      this.logDir = path3.join(process.cwd(), "logs");
    }
    if (!fs3.existsSync(this.logDir)) {
      fs3.mkdirSync(this.logDir, { recursive: true });
    }
    const date = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    this.logFile = path3.join(this.logDir, `autocoder-${date}.log`);
    this.info("Logger", "Logger initialized", { logFile: this.logFile });
  }
  shouldLog(level) {
    return this.levelPriority[level] >= this.levelPriority[this.minLevel];
  }
  formatEntry(entry) {
    const dataStr = entry.data ? ` | ${JSON.stringify(entry.data)}` : "";
    return `[${entry.timestamp}] [${entry.level.toUpperCase()}] [${entry.category}] ${entry.message}${dataStr}`;
  }
  log(level, category, message, data) {
    if (!this.shouldLog(level)) return;
    const entry = {
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      level,
      category,
      message,
      data
    };
    const colors = {
      debug: "\x1B[36m",
      // Cyan
      info: "\x1B[32m",
      // Green
      warn: "\x1B[33m",
      // Yellow
      error: "\x1B[31m"
      // Red
    };
    const reset = "\x1B[0m";
    console.log(`${colors[level]}${this.formatEntry(entry)}${reset}`);
    try {
      fs3.appendFileSync(this.logFile, this.formatEntry(entry) + "\n");
    } catch (err) {
      console.error("Failed to write log:", err);
    }
    this.buffer.push(entry);
    if (this.buffer.length > this.maxBufferSize) {
      this.buffer.shift();
    }
    this.listeners.forEach((listener) => {
      try {
        listener(entry);
      } catch (err) {
        console.error("Log listener error:", err);
      }
    });
  }
  debug(category, message, data) {
    this.log("debug", category, message, data);
  }
  info(category, message, data) {
    this.log("info", category, message, data);
  }
  warn(category, message, data) {
    this.log("warn", category, message, data);
  }
  error(category, message, data) {
    this.log("error", category, message, data);
  }
  // IPC event logging
  ipc(channel, direction, data) {
    const arrow = direction === "in" ? ">>>" : "<<<";
    this.debug("IPC", `${arrow} ${channel}`, data);
  }
  // Process output logging (npm, dev server, etc.)
  process(source, output) {
    const lines = output.split("\n").filter(Boolean);
    lines.forEach((line) => {
      if (line.toLowerCase().includes("error")) {
        this.error(source, line);
      } else if (line.toLowerCase().includes("warn")) {
        this.warn(source, line);
      } else {
        this.info(source, line);
      }
    });
  }
  // Subscribe to log events
  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      const idx = this.listeners.indexOf(listener);
      if (idx >= 0) this.listeners.splice(idx, 1);
    };
  }
  // Get recent logs
  getRecentLogs(count = 100) {
    return this.buffer.slice(-count);
  }
  // Get logs by level
  getLogsByLevel(level) {
    return this.buffer.filter((e) => e.level === level);
  }
  // Get logs by category
  getLogsByCategory(category) {
    return this.buffer.filter((e) => e.category === category);
  }
  // Set minimum log level
  setMinLevel(level) {
    this.minLevel = level;
    this.info("Logger", `Log level set to ${level}`);
  }
  // Get log file path
  getLogFilePath() {
    return this.logFile;
  }
  // Clear buffer
  clearBuffer() {
    this.buffer = [];
    this.info("Logger", "Log buffer cleared");
  }
  // Rotate logs (keep last 7 days)
  rotateLogs() {
    try {
      const files = fs3.readdirSync(this.logDir).filter((f) => f.startsWith("autocoder-") && f.endsWith(".log")).sort();
      while (files.length > 7) {
        const oldest = files.shift();
        if (oldest) {
          fs3.unlinkSync(path3.join(this.logDir, oldest));
          this.info("Logger", `Deleted old log: ${oldest}`);
        }
      }
    } catch (err) {
      this.error("Logger", "Failed to rotate logs", { error: String(err) });
    }
  }
};
var logger = new ElectronLogger();

// electron/main.ts
var __filename = fileURLToPath(import.meta.url);
var __dirname = path4.dirname(__filename);
var isDev = process.env.NODE_ENV === "development" || !app2.isPackaged;
var mainWindow = null;
var runner = new LocalRunner();
var projectManager = new ProjectManager();
logger.subscribe((entry) => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send("logger:entry", entry);
  }
});
function createWindow() {
  logger.info("App", "Creating main window", { isDev });
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    title: "AutoCoder",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path4.join(__dirname, "preload.js")
    }
  });
  if (isDev) {
    const devUrl = "http://localhost:5100";
    logger.info("App", `Loading dev URL: ${devUrl}`);
    mainWindow.loadURL(devUrl);
    mainWindow.webContents.openDevTools();
  } else {
    const prodPath = path4.join(__dirname, "../dist/index.html");
    logger.info("App", `Loading production file: ${prodPath}`);
    mainWindow.loadFile(prodPath);
  }
  mainWindow.webContents.on("did-fail-load", (_event, errorCode, errorDescription, validatedURL) => {
    logger.error("App", "Failed to load URL", { errorCode, errorDescription, validatedURL });
  });
  mainWindow.webContents.on("did-finish-load", () => {
    logger.info("App", "Page loaded successfully");
  });
  mainWindow.webContents.on("console-message", (_event, level, message, line, sourceId) => {
    const levels = {
      0: "debug",
      1: "info",
      2: "warn",
      3: "error"
    };
    logger.log(levels[level] || "info", "Renderer", message, { line, sourceId });
  });
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    logger.info("App", `Opening external URL: ${url}`);
    shell.openExternal(url);
    return { action: "deny" };
  });
  mainWindow.on("closed", () => {
    logger.info("App", "Window closed");
    mainWindow = null;
    runner.cleanup();
  });
}
app2.whenReady().then(() => {
  logger.info("App", "Electron app ready", {
    version: app2.getVersion(),
    platform: process.platform,
    arch: process.arch,
    nodeVersion: process.version
  });
  logger.rotateLogs();
  createWindow();
  app2.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      logger.info("App", "Activating - creating new window");
      createWindow();
    }
  });
});
app2.on("window-all-closed", () => {
  logger.info("App", "All windows closed");
  if (process.platform !== "darwin") {
    app2.quit();
  }
});
app2.on("before-quit", () => {
  logger.info("App", "App quitting");
  runner.cleanup();
});
process.on("uncaughtException", (error) => {
  logger.error("Process", "Uncaught exception", {
    message: error.message,
    stack: error.stack
  });
});
process.on("unhandledRejection", (reason) => {
  logger.error("Process", "Unhandled rejection", { reason: String(reason) });
});
ipcMain.handle("runner:writeFiles", async (_event, projectName, files) => {
  logger.ipc("runner:writeFiles", "in", { projectName, fileCount: files.length });
  try {
    const projectPath = await projectManager.ensureProject(projectName);
    await runner.writeFiles(projectPath, files);
    logger.info("Runner", `Wrote ${files.length} files to ${projectName}`);
    return { success: true, projectPath };
  } catch (error) {
    logger.error("Runner", "Failed to write files", { projectName, error: String(error) });
    return { success: false, error: String(error) };
  }
});
ipcMain.handle("runner:npmInstall", async (_event, projectName) => {
  logger.ipc("runner:npmInstall", "in", { projectName });
  try {
    const projectPath = projectManager.getProjectPath(projectName);
    const result = await runner.npmInstall(
      projectPath,
      (log) => {
        logger.process("npm", log);
        mainWindow?.webContents.send("runner:log", log);
      },
      (percent, message) => {
        logger.debug("npm", `Progress: ${percent}% - ${message}`);
        mainWindow?.webContents.send("runner:progress", { percent, message });
      }
    );
    logger.ipc("runner:npmInstall", "out", result);
    return result;
  } catch (error) {
    logger.error("Runner", "npm install failed", { projectName, error: String(error) });
    return { success: false, error: String(error) };
  }
});
ipcMain.handle("runner:startServer", async (_event, projectName) => {
  logger.ipc("runner:startServer", "in", { projectName });
  try {
    const projectPath = projectManager.getProjectPath(projectName);
    const result = await runner.startDevServer(projectPath, (log) => {
      logger.process("DevServer", log);
      mainWindow?.webContents.send("runner:log", log);
    });
    if (result.success) {
      logger.info("Runner", `Dev server started at ${result.url}`);
      mainWindow?.webContents.send("runner:serverReady", result.url);
    }
    logger.ipc("runner:startServer", "out", result);
    return result;
  } catch (error) {
    logger.error("Runner", "Failed to start server", { projectName, error: String(error) });
    return { success: false, error: String(error) };
  }
});
ipcMain.handle("runner:stopServer", async () => {
  logger.ipc("runner:stopServer", "in");
  try {
    await runner.stopDevServer();
    logger.info("Runner", "Dev server stopped");
    return { success: true };
  } catch (error) {
    logger.error("Runner", "Failed to stop server", { error: String(error) });
    return { success: false, error: String(error) };
  }
});
ipcMain.handle("runner:getStatus", async () => {
  const status = {
    isRunning: runner.isServerRunning(),
    url: runner.getServerUrl()
  };
  logger.ipc("runner:getStatus", "out", status);
  return status;
});
ipcMain.handle("project:list", async () => {
  logger.ipc("project:list", "in");
  const projects = await projectManager.listProjects();
  logger.ipc("project:list", "out", { count: projects.length });
  return projects;
});
ipcMain.handle("project:delete", async (_event, projectName) => {
  logger.ipc("project:delete", "in", { projectName });
  try {
    await projectManager.deleteProject(projectName);
    logger.info("Project", `Deleted project: ${projectName}`);
    return { success: true };
  } catch (error) {
    logger.error("Project", "Failed to delete project", { projectName, error: String(error) });
    return { success: false, error: String(error) };
  }
});
ipcMain.handle("project:open", async (_event, projectName) => {
  logger.ipc("project:open", "in", { projectName });
  try {
    const projectPath = projectManager.getProjectPath(projectName);
    logger.info("Project", `Opening project folder: ${projectPath}`);
    shell.openPath(projectPath);
    return { success: true };
  } catch (error) {
    logger.error("Project", "Failed to open project", { projectName, error: String(error) });
    return { success: false, error: String(error) };
  }
});
ipcMain.handle("isElectron", () => {
  logger.debug("App", "isElectron check: true");
  return true;
});
ipcMain.handle("logger:getLogs", async (_event, count) => {
  return logger.getRecentLogs(count);
});
ipcMain.handle("logger:getLogFile", async () => {
  return logger.getLogFilePath();
});
ipcMain.handle("logger:setLevel", async (_event, level) => {
  logger.setMinLevel(level);
  return { success: true };
});
//# sourceMappingURL=main.js.map
