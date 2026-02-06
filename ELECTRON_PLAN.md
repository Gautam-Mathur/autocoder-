# AutoCoder Electron Desktop App - Implementation Plan

## Overview

AutoCoder runs as both a web application (Express + React on Replit) and an Electron desktop app for Windows/Mac/Linux. The desktop mode provides native file system access, real npm, and persistent project storage.

## Current Status (Feb 2026)

All items completed:

- [x] Electron main process + preload script
- [x] esbuild-based build pipeline (`scripts/build-electron.ts`)
- [x] IPC bridge for file I/O, npm install, dev server
- [x] Runner factory (auto-detects Electron vs browser)
- [x] Windows compatibility (cross-env, conditional reusePort)
- [x] Single command: `npm run electron:dev`
- [x] electron-builder config for Win/Mac/Linux packaging

## Why Electron?

| Problem with WebContainer | Solution with Electron |
|---------------------------|------------------------|
| 16KB file write limit | Native file system - no limits |
| Virtual npm (slow, limited) | Real npm - full speed |
| Browser memory constraints | Native memory management |
| Lost state on refresh | Persistent local storage |
| Can't access local tools | Full system access |

**Note:** The web mode now uses **LiveCodeRunner** (browser-based Babel preview) which eliminates the 16KB limitation for previews. Electron is still preferred for full project builds with real npm.

---

## Architecture

```
+------------------------------------------------------------------+
|                      ELECTRON APPLICATION                          |
|                                                                    |
|  +-------------------------+    +------------------------------+  |
|  |      MAIN PROCESS       |    |     RENDERER PROCESS         |  |
|  |     (Node.js runtime)   |    |     (Chromium window)        |  |
|  |                         |    |                              |  |
|  |  +-------------------+  |    |  +------------------------+  |  |
|  |  |  Local Runner     |  |    |  |   React Frontend       |  |  |
|  |  |  Service          |  |    |  |   (existing CodeAI UI) |  |  |
|  |  |                   |  |<-->|  |                        |  |  |
|  |  |  * File I/O       |  |IPC |  |  * Chat interface      |  |  |
|  |  |  * npm install    |  |    |  |  * Code generation     |  |  |
|  |  |  * Dev server     |  |    |  |  * Preview panel       |  |  |
|  |  |  * Process mgmt   |  |    |  |  * IDE features        |  |  |
|  |  +-------------------+  |    |  +------------------------+  |  |
|  |                         |    |                              |  |
|  |  +-------------------+  |    |  +------------------------+  |  |
|  |  |  Project Manager  |  |    |  |   Preview WebView      |  |  |
|  |  |  * Workspace mgmt |  |    |  |   (localhost preview)  |  |  |
|  |  +-------------------+  |    |  +------------------------+  |  |
|  +-------------------------+    +------------------------------+  |
|                                                                    |
|                         +------------------+                       |
|                         |  LOCAL FILE      |                       |
|                         |  SYSTEM          |                       |
|                         |  ~/AutoCoder/    |                       |
|                         |  projects/       |                       |
|                         +------------------+                       |
+------------------------------------------------------------------+
```

### IPC Channels

| Channel | Direction | Purpose |
|---------|-----------|---------|
| `runner:writeFiles` | Renderer -> Main | Write project files to disk |
| `runner:npmInstall` | Renderer -> Main | Run npm install |
| `runner:startServer` | Renderer -> Main | Start dev server |
| `runner:stopServer` | Renderer -> Main | Stop dev server |
| `runner:getStatus` | Renderer -> Main | Get server status |
| `runner:log` | Main -> Renderer | Stream logs to UI |
| `runner:serverReady` | Main -> Renderer | Notify when server is ready |
| `runner:progress` | Main -> Renderer | Stream npm install progress |
| `logger:entry` | Main -> Renderer | Stream structured log entries |
| `project:list` | Renderer -> Main | List all projects |
| `project:delete` | Renderer -> Main | Delete a project |
| `project:open` | Renderer -> Main | Open project folder |

---

## Directory Structure

```
autocoder/
├── electron/                    # Electron source (TypeScript)
│   ├── main.ts                  # Main process entry point (ESM)
│   ├── preload.ts               # Preload script (CommonJS)
│   ├── tsconfig.json            # TypeScript config for main.ts
│   ├── tsconfig.preload.json    # TypeScript config for preload.ts
│   └── services/
│       ├── local-runner.ts      # File system & npm operations
│       ├── project-manager.ts   # Workspace management
│       └── logger.ts            # File-based logging with rotation
│
├── scripts/
│   ├── build-electron.ts        # esbuild pipeline for Electron
│   └── github-push.ts           # GitHub push (full tree replace)
│
├── dist-electron/               # Compiled Electron output
│   ├── main.js                  # esbuild output from main.ts
│   ├── main.js.map
│   ├── preload.js               # esbuild output from preload.ts
│   └── preload.js.map
│
├── client/                      # React frontend
│   └── src/
│       └── lib/code-runner/
│           ├── electron-runner.ts   # Electron IPC wrapper
│           ├── runner-factory.ts    # Auto-detect environment
│           └── webcontainer.ts      # Browser fallback
│
├── electron-builder.json        # Desktop packaging config
└── package.json                 # NPM scripts
```

---

## Build System

### Electron Build Pipeline (esbuild)

The build uses **esbuild** (not tsc) via `scripts/build-electron.ts`:

```bash
npm run build:electron
```

This compiles:
1. `electron/main.ts` (ESM) -> `dist-electron/main.js` (ESM, platform: node)
2. `electron/preload.ts` (CJS) -> `dist-electron/preload.js` (CJS, platform: node)

Both files use `external: ['electron']` since Electron provides its own runtime.

**Why esbuild instead of tsc?**
- 10x faster compilation
- Handles ESM -> CJS conversion automatically
- Bundles services inline (no separate service files needed)
- Source maps included

### NPM Scripts

| Script | What it does |
|--------|-------------|
| `npm run dev` | Start web dev server (Replit mode, port 5000) |
| `npm run build:electron` | Compile Electron files with esbuild |
| `npm run electron:dev` | Build + launch Electron desktop app |
| `npm run build` | Build React + Express for production |

### Running Electron

```bash
# All-in-one (builds + launches):
npm run electron:dev

# Or manually:
npm run build:electron
cross-env NODE_ENV=development npx electron dist-electron/main.js
```

---

## esbuild Build Pipeline (Deep Dive)

### Complete Build Script Source (`scripts/build-electron.ts`)

The entire build pipeline is a single ~40-line TypeScript file that uses esbuild's programmatic API:

```typescript
import * as esbuild from 'esbuild';

async function buildElectron() {
  console.log('Building Electron main process...');

  await esbuild.build({
    entryPoints: ['electron/main.ts'],
    bundle: true,
    platform: 'node',
    target: 'node18',
    format: 'esm',
    outfile: 'dist-electron/main.js',
    external: ['electron'],
    sourcemap: true,
    banner: {
      js: `import { createRequire } from 'module';const require = createRequire(import.meta.url);`,
    },
  });

  console.log('Building Electron preload script...');

  await esbuild.build({
    entryPoints: ['electron/preload.ts'],
    bundle: true,
    platform: 'node',
    target: 'node18',
    format: 'cjs',
    outfile: 'dist-electron/preload.js',
    external: ['electron'],
    sourcemap: true,
  });

  console.log('Electron build complete! Output in dist-electron/');
}

buildElectron().catch(err => {
  console.error('Build failed:', err);
  process.exit(1);
});
```

### Why main.ts Uses ESM Format

The main process is compiled with `format: 'esm'` for several reasons:

1. **`import.meta.url` for `__dirname`**: Node.js ESM modules do not have `__dirname` or `__filename` globals. Instead, `main.ts` derives them via:
   ```typescript
   const __filename = fileURLToPath(import.meta.url);
   const __dirname = path.dirname(__filename);
   ```
   This is the modern, standards-compliant way to get the current file's directory in ESM. It is used throughout the main process to resolve paths to `preload.js`, `dist/index.html`, and other resources relative to the compiled output location.

2. **Modern Node.js conventions**: Electron ships with a recent version of Node.js (v18+) that has full ESM support. Using ESM aligns with the ecosystem direction and enables top-level `await`, better tree-shaking, and strict module semantics.

### Why main.ts Needs the `createRequire` Banner

Even though `main.ts` itself is ESM, some of its bundled dependencies (or Node.js built-in modules accessed via `require()`) expect CommonJS semantics. The banner:

```javascript
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
```

This is injected at the **top** of the compiled `dist-electron/main.js` output. It creates a `require()` function scoped to the current module's URL, which allows any CommonJS `require()` calls inside the bundle to resolve correctly. Without this banner, any dependency that uses `require()` internally would throw `ReferenceError: require is not defined` at runtime.

### Why preload.ts Uses CJS Format

The preload script is compiled with `format: 'cjs'` because:

1. **Electron's preload context restriction**: Electron's preload scripts run in a special sandboxed context between the main process and the renderer. This context **only supports CommonJS** (`require()` / `module.exports`). Attempting to use ESM (`import`/`export`) in a preload script will fail with a syntax error at runtime.

2. **`contextBridge` requirement**: The preload script must use `require('electron')` to access `contextBridge` and `ipcRenderer`. These APIs are injected by Electron's sandboxed preload environment and are only available via CommonJS requires.

3. **No banner needed**: Since CJS is the native format for preload scripts, there is no need for a `createRequire` banner shim.

### Why Both Use `external: ['electron']`

Both build configurations mark `electron` as external:

```typescript
external: ['electron']
```

This tells esbuild to **not bundle** the `electron` package into the output. Instead, `require('electron')` or `import ... from 'electron'` calls are left as-is in the compiled output. At runtime, Electron provides its own `electron` module (containing `app`, `BrowserWindow`, `ipcMain`, `ipcRenderer`, `contextBridge`, `shell`, etc.) through its internal module resolution. Bundling it would fail because the `electron` npm package is just a stub installer, not the actual runtime API.

### Build Output

The build produces four files in `dist-electron/`:

| File | Source | Format | Size (approx) |
|------|--------|--------|---------------|
| `main.js` | `electron/main.ts` + all services | ESM | ~15KB bundled |
| `main.js.map` | Source map for main.js | JSON | ~20KB |
| `preload.js` | `electron/preload.ts` | CJS | ~3KB bundled |
| `preload.js.map` | Source map for preload.js | JSON | ~4KB |

esbuild bundles all imported services (`local-runner.ts`, `project-manager.ts`, `logger.ts`) directly into `main.js`. This means the `dist-electron/` directory only needs two JS files - no separate service files, no `node_modules` resolution needed for local imports.

---

## Electron Main Process Deep Dive

### Source: `electron/main.ts` (~255 lines)

The main process is the Node.js backend of the Electron app. It manages the application lifecycle, creates windows, handles IPC communication, and orchestrates the LocalRunner and ProjectManager services.

### Window Creation

```typescript
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
}
```

Key configuration choices:
- **1400x900 default, 1024x768 minimum**: Sized for the IDE-like layout with chat panel, code editor, and preview pane side-by-side
- **`nodeIntegration: false`**: The renderer process (React app) cannot access Node.js APIs directly. This is a critical security measure that prevents XSS attacks from accessing the file system
- **`contextIsolation: true`**: The preload script runs in an isolated JavaScript context. The renderer cannot access the preload's `require()` or any Node.js globals. Communication is only possible through the explicitly exposed `electronAPI` on `window`

### Dev Mode vs Production Mode

```typescript
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

if (isDev) {
  const devUrl = 'http://localhost:5000';
  mainWindow.loadURL(devUrl);
  mainWindow.webContents.openDevTools();
} else {
  const prodPath = path.join(__dirname, '../dist/index.html');
  mainWindow.loadFile(prodPath);
}
```

- **Dev mode** (`NODE_ENV=development` or `app.isPackaged === false`): Loads the Vite dev server at `http://localhost:5000` and automatically opens Chrome DevTools for debugging. The Vite server provides hot module replacement (HMR) so React changes appear instantly without restarting Electron.
- **Production mode** (packaged app): Loads the pre-built `dist/index.html` file from disk. This is the output of `npm run build` which bundles the React frontend with Vite.

### Error Handling and Event Listeners

The main process sets up several critical event handlers:

```typescript
mainWindow.webContents.on('did-fail-load', (_event, errorCode, errorDescription, validatedURL) => {
  logger.error('App', 'Failed to load URL', { errorCode, errorDescription, validatedURL });
});
```

**`did-fail-load`**: Catches cases where the renderer fails to load (e.g., Vite dev server not running yet). Logs the error code and description for debugging.

```typescript
mainWindow.webContents.on('console-message', (_event, level, message, line, sourceId) => {
  const levels: Record<number, 'debug' | 'info' | 'warn' | 'error'> = {
    0: 'debug', 1: 'info', 2: 'warn', 3: 'error'
  };
  logger.log(levels[level] || 'info', 'Renderer', message, { line, sourceId });
});
```

**`console-message`**: Forwards all `console.log/warn/error` calls from the renderer process into the main process logger. This means all frontend logs are captured in the Electron log file alongside backend logs, making debugging much easier. The numeric level codes (0-3) map to standard log levels.

```typescript
mainWindow.webContents.setWindowOpenHandler(({ url }: { url: string }) => {
  shell.openExternal(url);
  return { action: 'deny' as const };
});
```

**External link handling**: When the React app tries to open a new window (e.g., clicking an external link), Electron intercepts it, opens the URL in the system's default browser via `shell.openExternal()`, and denies the new window creation. This prevents accidental navigation away from the app.

### Logger Integration

```typescript
logger.subscribe((entry) => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('logger:entry', entry);
  }
});
```

The main process subscribes to the logger service. Every log entry (from any source: Runner, npm, DevServer, App lifecycle) is forwarded to the renderer process via the `logger:entry` IPC channel. The renderer can display these in a LogViewer component, giving users visibility into what the backend is doing. The `!mainWindow.isDestroyed()` guard prevents crashes when sending to a closed window.

### Cleanup and Lifecycle

```typescript
mainWindow.on('closed', () => {
  mainWindow = null;
  runner.cleanup();
});

app.on('before-quit', () => {
  runner.cleanup();
});
```

When the window closes or the app quits, `runner.cleanup()` is called to kill any running child processes (dev servers, npm installs). This prevents orphaned Node.js processes from lingering after the app exits.

### Uncaught Exception Handling

```typescript
process.on('uncaughtException', (error) => {
  logger.error('Process', 'Uncaught exception', { message: error.message, stack: error.stack });
});

process.on('unhandledRejection', (reason) => {
  logger.error('Process', 'Unhandled rejection', { reason: String(reason) });
});
```

Global error handlers ensure that any uncaught exceptions or unhandled promise rejections are logged to the file-based logger rather than silently crashing the app.

### IPC Handler Pattern

All IPC handlers follow a consistent pattern with logging:

```typescript
ipcMain.handle('runner:writeFiles', async (_event, projectName, files) => {
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
```

Each handler:
1. Logs the incoming IPC call with parameters
2. Wraps the operation in try/catch
3. Delegates to the appropriate service (LocalRunner or ProjectManager)
4. Returns a consistent `{ success: boolean; error?: string }` response
5. Streams progress/logs to the renderer via `mainWindow.webContents.send()`

---

## Preload Script Deep Dive

### Source: `electron/preload.ts` (~95 lines)

The preload script is the secure bridge between Electron's main process (Node.js) and the renderer process (React app). It uses `contextBridge.exposeInMainWorld()` to selectively expose a safe API to the renderer.

### The `contextBridge` Pattern

```typescript
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', electronAPI);
```

This is the recommended Electron security pattern. Instead of enabling `nodeIntegration` (which would give the renderer full Node.js access), the preload script:
1. Imports `ipcRenderer` from Electron (available in the preload context)
2. Wraps each IPC call in a clean function
3. Exposes only those functions to `window.electronAPI`
4. The renderer can only call these specific methods - it cannot access `ipcRenderer` directly

### Type Interface

```typescript
interface ElectronAPI {
  writeFiles: (projectName: string, files: Array<{ path: string; content: string }>)
    => Promise<{ success: boolean; projectPath?: string; error?: string }>;
  npmInstall: (projectName: string)
    => Promise<{ success: boolean; error?: string }>;
  startServer: (projectName: string)
    => Promise<{ success: boolean; url?: string; error?: string }>;
  stopServer: ()
    => Promise<{ success: boolean; error?: string }>;
  getStatus: ()
    => Promise<{ isRunning: boolean; url: string | null }>;
  listProjects: ()
    => Promise<string[]>;
  deleteProject: (projectName: string)
    => Promise<{ success: boolean; error?: string }>;
  openProject: (projectName: string)
    => Promise<{ success: boolean; error?: string }>;
  isElectron: ()
    => Promise<boolean>;
  onLog: (callback: (log: string) => void) => () => void;
  onProgress: (callback: (data: { percent: number; message: string }) => void) => () => void;
  onServerReady: (callback: (url: string) => void) => () => void;
  onLogEntry: (callback: (entry: LogEntry) => void) => () => void;
  getLogs: (count?: number) => Promise<LogEntry[]>;
  getLogFile: () => Promise<string>;
  setLogLevel: (level: 'debug' | 'info' | 'warn' | 'error') => Promise<{ success: boolean }>;
}
```

### Exposed Methods (Renderer -> Main)

| Method | IPC Channel | Purpose |
|--------|-------------|---------|
| `writeFiles(projectName, files)` | `runner:writeFiles` | Write an array of files to the project directory |
| `npmInstall(projectName)` | `runner:npmInstall` | Run `npm install` in the project directory |
| `startServer(projectName)` | `runner:startServer` | Start the dev server for the project |
| `stopServer()` | `runner:stopServer` | Stop the currently running dev server |
| `getStatus()` | `runner:getStatus` | Check if a dev server is running and get its URL |
| `listProjects()` | `project:list` | Get an array of all project directory names |
| `deleteProject(projectName)` | `project:delete` | Remove a project directory recursively |
| `openProject(projectName)` | `project:open` | Open the project folder in the system file manager |
| `isElectron()` | `isElectron` | Returns `true` (used for environment detection) |

### Event Listeners (Main -> Renderer)

The preload exposes event listener methods that return **cleanup functions**:

```typescript
onLog: (callback: (log: string) => void) => {
  const handler = (_event: any, log: string) => callback(log);
  ipcRenderer.on('runner:log', handler);
  return () => ipcRenderer.removeListener('runner:log', handler);
},

onServerReady: (callback: (url: string) => void) => {
  const handler = (_event: any, url: string) => callback(url);
  ipcRenderer.on('runner:serverReady', handler);
  return () => ipcRenderer.removeListener('runner:serverReady', handler);
},
```

Each listener:
1. Wraps the user callback in a handler that strips the Electron `_event` parameter
2. Registers the handler on the appropriate IPC channel via `ipcRenderer.on()`
3. Returns a cleanup function that removes the listener via `ipcRenderer.removeListener()`

This cleanup pattern is critical for React components that subscribe in `useEffect()` - the cleanup function is called on unmount to prevent memory leaks.

### Logger-Specific Methods

```typescript
onLogEntry: (callback) => { ... }   // Subscribe to structured log entries
getLogs: (count?) => ...              // Fetch recent log entries from main process
getLogFile: () => ...                 // Get the log file path on disk
setLogLevel: (level) => ...           // Change the minimum log level
```

These provide the renderer with full access to the structured logging system, enabling the LogViewer component to display real-time logs with filtering by level.

---

## Local Runner Service Deep Dive

### Source: `electron/services/local-runner.ts` (~251 lines)

The LocalRunner class is the core execution engine for the Electron app. It manages file system operations, npm package installation, and dev server lifecycle.

### Class Structure

```typescript
export class LocalRunner {
  private currentProcess: ChildProcess | null = null;
  private serverUrl: string | null = null;
  private serverPort = 5200;
}
```

The runner tracks a single child process (the dev server) and its URL. Only one dev server can run at a time per LocalRunner instance.

### `writeFiles()` - File System Operations

```typescript
async writeFiles(projectPath: string, files: Array<{ path: string; content: string }>): Promise<void> {
  for (const file of files) {
    const fullPath = path.join(projectPath, file.path);
    const dir = path.dirname(fullPath);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(fullPath, file.content, 'utf-8');
  }
}
```

- Iterates over each file in the array
- Constructs the full path by joining the project root with the relative file path
- Creates any missing parent directories recursively via `fs.mkdirSync(dir, { recursive: true })`
- Writes the file content synchronously as UTF-8 text
- No file size limits (unlike WebContainer's 16KB restriction)
- Synchronous writes ensure file ordering is preserved (important for projects where later files may depend on earlier ones)

### `npmInstall()` - Package Installation

```typescript
async npmInstall(projectPath: string, onLog: LogCallback, onProgress?: ProgressCallback):
  Promise<{ success: boolean; error?: string }>
```

This method spawns `npm install` as a child process and provides real-time progress tracking:

1. **Dependency counting**: Before starting, reads `package.json` to count total dependencies + devDependencies. This total is used to calculate installation progress percentage.

2. **Platform-aware npm binary**: Uses `npm.cmd` on Windows, `npm` on macOS/Linux.

3. **Progress tracking via output parsing**: The `updateProgress()` function parses npm's stdout/stderr output to estimate progress:
   - `http fetch GET/POST` lines -> 0-30% (fetching packages from registry)
   - `reify:` lines -> 30-60% (extracting packages to node_modules)
   - `timing build` lines -> 60-90% (building native modules)
   - `added N packages` line -> final percentage calculation

4. **Streaming output**: Both stdout and stderr are split into lines and forwarded to the `onLog` callback, which the main process relays to the renderer via IPC.

5. **Error handling**: The `child.on('error')` handler catches spawn failures (e.g., npm not found). The `child.on('close')` handler checks exit codes - code 0 means success, anything else is a failure.

### `startDevServer()` - Dev Server Management

```typescript
async startDevServer(projectPath: string, onLog: LogCallback):
  Promise<{ success: boolean; url?: string; error?: string }>
```

This method starts the project's dev server and detects when it's ready:

1. **Stop existing server**: If a dev server is already running, it is stopped first via `stopDevServer()`.

2. **Script detection**: Reads `package.json` and looks for a `dev` script first, then falls back to `start`. If neither exists, returns an error.

3. **URL pattern detection**: Watches stdout/stderr for URL patterns using a regex:
   ```typescript
   const urlPattern = /localhost:(\d+)|http:\/\/127\.0\.0\.1:(\d+)|http:\/\/0\.0\.0\.0:(\d+)/;
   ```
   This catches URLs from Vite (`localhost:5173`), Express (`0.0.0.0:5200`), Next.js (`localhost:5200`), and other common dev server output formats.

4. **Timeout fallback**: If no URL is detected within 10 seconds, the server is assumed to be running on the configured port (`this.serverPort`, default 5200). This handles servers that don't print their URL to stdout.

5. **Environment setup**: Sets `PORT` environment variable and `FORCE_COLOR=1` for colored terminal output in the log stream.

### `stopDevServer()` - Process Termination

```typescript
async stopDevServer(): Promise<void> {
  if (this.currentProcess) {
    if (process.platform === 'win32') {
      spawn('taskkill', ['/pid', String(this.currentProcess.pid), '/f', '/t']);
    } else {
      this.currentProcess.kill('SIGTERM');
    }
    this.currentProcess = null;
    this.serverUrl = null;
  }
}
```

- **Windows**: Uses `taskkill /f /t` to forcefully kill the process tree. The `/t` flag kills child processes too (important because `npm run dev` spawns a child node process). Without `/t`, the npm process would die but the actual Vite/Express server would be orphaned.
- **macOS/Linux**: Sends `SIGTERM` for graceful shutdown. The child process tree is typically handled by the OS process group.
- Resets `currentProcess` and `serverUrl` to null after stopping.

### `cleanup()` - Application Shutdown

```typescript
cleanup(): void {
  this.stopDevServer();
}
```

Called by the main process when the Electron window closes or the app quits. Ensures no child processes are left running after the app exits.

---

## Project Manager Deep Dive

### Source: `electron/services/project-manager.ts` (~70 lines)

The ProjectManager handles workspace organization, storing all generated projects under a single base directory.

### Base Directory

```typescript
constructor() {
  this.baseDir = path.join(os.homedir(), 'AutoCoder', 'projects');
  this.ensureBaseDir();
}
```

All projects are stored under `~/AutoCoder/projects/` (or `%USERPROFILE%\AutoCoder\projects\` on Windows). The constructor creates this directory if it doesn't exist. This location was chosen because:
- It's in the user's home directory (always writable)
- It's outside the app installation directory (survives app updates)
- It's easily discoverable by users who want to open projects in their own IDE

### `getProjectPath()` - Path Construction

```typescript
getProjectPath(projectName: string): string {
  const safeName = projectName.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase();
  return path.join(this.baseDir, safeName);
}
```

Sanitizes the project name by replacing any non-alphanumeric characters (except hyphens and underscores) with hyphens, and converting to lowercase. This prevents filesystem issues with special characters, spaces, or Unicode in project names. For example, `My Cool App!` becomes `my-cool-app-`.

### `ensureProject()` - Project Creation

```typescript
async ensureProject(projectName: string): Promise<string> {
  const projectPath = this.getProjectPath(projectName);
  if (!fs.existsSync(projectPath)) {
    fs.mkdirSync(projectPath, { recursive: true });
  }
  return projectPath;
}
```

Creates the project directory if it doesn't already exist, and returns the full path. Used by the `runner:writeFiles` IPC handler before writing files.

### `listProjects()` - Directory Listing

```typescript
async listProjects(): Promise<string[]> {
  const entries = fs.readdirSync(this.baseDir, { withFileTypes: true });
  return entries
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name)
    .sort((a, b) => {
      const aStat = fs.statSync(path.join(this.baseDir, a));
      const bStat = fs.statSync(path.join(this.baseDir, b));
      return bStat.mtime.getTime() - aStat.mtime.getTime();
    });
}
```

Lists all subdirectories in the base directory, sorted by **modification time** (most recent first). This gives users their most recently worked-on projects at the top of the list. Only directories are included (files at the base level are ignored).

### `deleteProject()` - Recursive Removal

```typescript
async deleteProject(projectName: string): Promise<void> {
  const projectPath = this.getProjectPath(projectName);
  if (fs.existsSync(projectPath)) {
    fs.rmSync(projectPath, { recursive: true, force: true });
  }
}
```

Uses `fs.rmSync` with `recursive: true` and `force: true` to remove the entire project directory tree, including `node_modules` (which can contain thousands of files). The `force` flag prevents errors on read-only files.

### `openProject()` - System File Manager

The `project:open` IPC handler in `main.ts` uses Electron's `shell.openPath()` to open the project directory in the system's default file manager (Explorer on Windows, Finder on macOS, Nautilus/Dolphin on Linux). This allows users to browse their generated projects in a familiar interface.

---

## Runner Factory Pattern

### Source: `client/src/lib/code-runner/runner-factory.ts`

The Runner Factory is the frontend's abstraction layer that allows the same React components to work in both Electron and browser environments without any code changes.

### Environment Detection

```typescript
import { isElectronEnvironment } from './electron-runner';

export type RunnerType = 'electron' | 'webcontainer' | 'none';

export function detectRunnerType(): RunnerType {
  if (isElectronEnvironment()) {
    return 'electron';
  }
  if (typeof window !== 'undefined') {
    return 'webcontainer';
  }
  return 'none';
}
```

The detection is simple and deterministic:
1. Check if `window.electronAPI` exists (set by the preload script) -> Electron mode
2. Check if `window` exists (we're in a browser) -> WebContainer mode
3. Neither -> No runner available (server-side rendering or Node.js context)

### `isElectronEnvironment()` Guard Function

```typescript
export function isElectronEnvironment(): boolean {
  return typeof window !== 'undefined'
    && 'electronAPI' in window
    && window.electronAPI !== undefined;
}
```

This function is used throughout the `electron-runner.ts` module as a guard before making any IPC calls. Every exported function checks this first and returns a graceful error if not in Electron. This prevents crashes when the same code runs in a browser.

### Dynamic Imports for Code Splitting

```typescript
export async function getRunner(): Promise<UnifiedRunner> {
  const runnerType = detectRunnerType();

  if (runnerType === 'electron') {
    const electronRunner = await import('./electron-runner');
    cachedRunner = { type: 'electron', ...electronRunner };
  } else if (runnerType === 'webcontainer') {
    const webcontainerModule = await import('./webcontainer');
    cachedRunner = { type: 'webcontainer', /* wrapper methods */ };
  }

  return cachedRunner;
}
```

The factory uses **dynamic `import()`** to load runner implementations lazily. This provides two benefits:
1. **Code splitting**: The Electron runner code is not included in the browser bundle, and the WebContainer code is not included in the Electron bundle. Vite automatically creates separate chunks.
2. **No import errors**: The WebContainer SDK would fail to import in Electron (and vice versa), so lazy loading ensures only the appropriate module is loaded.

### Unified Runner Interface

```typescript
export interface UnifiedRunner {
  type: RunnerType;
  writeFiles: (projectName: string, files: Array<{ path: string; content: string }>,
    onLog?: (log: string) => void) => Promise<{ success: boolean; error?: string }>;
  installDependencies: (projectName: string,
    onLog?: (log: string) => void) => Promise<{ success: boolean; error?: string }>;
  startDevServer: (projectName: string,
    onLog?: (log: string) => void) => Promise<{ success: boolean; url?: string; error?: string }>;
  stopDevServer: () => Promise<{ success: boolean; error?: string }>;
  getServerStatus: () => Promise<{ isRunning: boolean; url: string | null }>;
}
```

Both the Electron runner and WebContainer runner implement this same interface. React components call `getRunner()` once and then use the returned `UnifiedRunner` object without knowing which backend they're talking to. The interface covers the full project lifecycle:

1. `writeFiles()` - Write generated code to disk (or virtual FS)
2. `installDependencies()` - Run npm install (real or virtual)
3. `startDevServer()` - Launch the dev server
4. `stopDevServer()` - Kill the dev server
5. `getServerStatus()` - Check if a server is running

### Runner Capabilities

```typescript
export function getRunnerCapabilities(runnerType: RunnerType) {
  switch (runnerType) {
    case 'electron':
      return {
        hasFileSystem: true, hasNpm: true, hasDevServer: true,
        hasFileSizeLimit: false, maxFileSize: Infinity,
        description: 'Native file system with full npm support',
      };
    case 'webcontainer':
      return {
        hasFileSystem: true, hasNpm: true, hasDevServer: true,
        hasFileSizeLimit: true, maxFileSize: 16384,
        description: 'Browser-based virtual file system (16KB file limit)',
      };
    case 'none':
      return {
        hasFileSystem: false, hasNpm: false, hasDevServer: false,
        hasFileSizeLimit: false, maxFileSize: 0,
        description: 'No code execution available',
      };
  }
}
```

This function allows UI components to adapt based on the runner's capabilities. For example, the UI might show a warning about file size limits when using WebContainer, or disable npm-related features when no runner is available.

### Caching

```typescript
let cachedRunner: UnifiedRunner | null = null;

export function clearRunnerCache(): void {
  cachedRunner = null;
}
```

The runner instance is cached after first creation. This avoids re-detecting the environment and re-importing modules on every call. The cache can be manually cleared if the environment changes (rare, but possible during testing).

---

## Windows Compatibility

### Issues Fixed

1. **cross-env** - All npm scripts use `cross-env` for environment variables (no Unix-only `NODE_ENV=x` syntax)
2. **reusePort** - Server conditionally skips `reusePort` option on Windows (prevents ENOTSUP error)
3. **EBUSY error** - Close VS Code before running `npm install` (VS Code locks Electron files)

### Windows Setup

```cmd
git clone https://github.com/Gautam-Mathur/autocoder-.git
cd autocoder-

REM Install dependencies (close VS Code first!)
npm install

REM Run Electron
npm run electron:dev
```

### Troubleshooting Windows

| Issue | Solution |
|-------|----------|
| EBUSY during npm install | Close VS Code, delete node_modules, reinstall |
| ENOTSUP reusePort | Already fixed in server/index.ts |
| `cross-env` not found | Run `npm install` (it's a dependency) |
| Port 5000 in use | Set PORT env var: `set PORT=3000 && npm run dev` |

---

## Dev Server Port

- **Replit (web mode):** Port 5000 (default)
- **Electron (dev mode):** Connects to localhost:5000
- **Generated projects:** Port 3000 or next available

---

## Logging

Electron app logs are saved to:
- **Windows:** `%APPDATA%\autocoder\logs\autocoder-YYYY-MM-DD.log`
- **macOS:** `~/Library/Application Support/autocoder/logs/`
- **Linux:** `~/.config/autocoder/logs/`

The logger service (`electron/services/logger.ts`) provides:
- Structured log entries with timestamp, level, category, message, and optional data
- File-based logging with daily rotation
- Subscriber pattern for real-time log forwarding to the renderer
- Log level filtering (debug, info, warn, error)
- IPC-specific logging that tracks channel direction (in/out) and parameters

---

## Important Notes

1. **Preload scripts MUST use CommonJS** - They run in a special Electron context that doesn't support ES modules
2. **main.ts uses ESM** - Uses `import.meta.url` for `__dirname` equivalent
3. **esbuild handles the conversion** - Main process outputs ESM with createRequire banner; preload outputs CJS
4. **electron-builder.json** configures packaging for all three platforms
5. **Pro Generator** is used for code generation in both web and Electron modes
6. **LiveCodeRunner** provides instant preview in web mode; Electron mode uses real npm + dev server
7. **Security model** - nodeIntegration disabled, contextIsolation enabled, all IPC goes through contextBridge
8. **Single dev server** - Only one generated project's dev server can run at a time per Electron instance
9. **Process cleanup** - All child processes are killed on window close and app quit to prevent orphans
