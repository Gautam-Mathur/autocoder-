# AutoCoder Electron Desktop App - Implementation Plan

## Overview

Transform AutoCoder from a browser-based WebContainer application to a full Electron desktop app. This eliminates the 16KB file write limitation and enables running large projects with unlimited dependencies.

## Why Electron?

| Problem with WebContainer | Solution with Electron |
|---------------------------|------------------------|
| 16KB file write limit | Native file system - no limits |
| Virtual npm (slow, limited) | Real npm - full speed |
| Browser memory constraints | Native memory management |
| Lost state on refresh | Persistent local storage |
| Can't access local tools | Full system access |

---

## Architecture

### High-Level Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                      ELECTRON APPLICATION                         │
│                                                                   │
│  ┌─────────────────────────┐    ┌──────────────────────────────┐ │
│  │      MAIN PROCESS       │    │     RENDERER PROCESS         │ │
│  │     (Node.js runtime)   │    │     (Chromium window)        │ │
│  │                         │    │                              │ │
│  │  ┌───────────────────┐  │    │  ┌────────────────────────┐  │ │
│  │  │  Local Runner     │  │    │  │   React Frontend       │  │ │
│  │  │  Service          │  │    │  │   (existing CodeAI UI) │  │ │
│  │  │                   │  │◄──►│  │                        │  │ │
│  │  │  • File I/O       │  │IPC │  │  • Chat interface      │  │ │
│  │  │  • npm install    │  │    │  │  • Code generation     │  │ │
│  │  │  • Dev server     │  │    │  │  • Preview panel       │  │ │
│  │  │  • Process mgmt   │  │    │  │  • IDE features        │  │ │
│  │  └───────────────────┘  │    │  └────────────────────────┘  │ │
│  │                         │    │                              │ │
│  │  ┌───────────────────┐  │    │  ┌────────────────────────┐  │ │
│  │  │  Project Manager  │  │    │  │   Preview WebView      │  │ │
│  │  │  • Workspace mgmt │  │    │  │   (localhost preview)  │  │ │
│  │  │  • Project state  │  │    │  │                        │  │ │
│  │  └───────────────────┘  │    │  └────────────────────────┘  │ │
│  └─────────────────────────┘    └──────────────────────────────┘ │
│                                                                   │
│                         ┌──────────────────┐                      │
│                         │  LOCAL FILE      │                      │
│                         │  SYSTEM          │                      │
│                         │  ~/AutoCoder/    │                      │
│                         │  projects/       │                      │
│                         └──────────────────┘                      │
└──────────────────────────────────────────────────────────────────┘
```

### Process Communication

```
┌─────────────┐     IPC Channels      ┌─────────────┐
│  Renderer   │ ◄─────────────────────► │    Main     │
│  (React)    │                        │  (Node.js)  │
└─────────────┘                        └─────────────┘
      │                                       │
      │  runner:writeFiles                    │
      │  runner:npmInstall                    │
      │  runner:startServer ─────────────────►│
      │  runner:stopServer                    │
      │  runner:getStatus                     │
      │                                       │
      │◄───────────────────────────────────── │
      │  runner:log                           │
      │  runner:serverReady                   │
      │  runner:error                         │
```

---

## Directory Structure

```
autocoder/
├── electron/                    # Electron-specific code
│   ├── main.ts                  # Main process entry point
│   ├── preload.ts               # Preload script (IPC bridge)
│   ├── services/
│   │   ├── local-runner.ts      # File system & npm operations
│   │   ├── project-manager.ts   # Workspace management
│   │   └── dev-server.ts        # Dev server management
│   └── utils/
│       └── ipc-handlers.ts      # IPC channel handlers
│
├── client/                      # Existing React frontend
│   └── src/
│       ├── lib/
│       │   └── code-runner/
│       │       ├── webcontainer.ts      # Keep for web fallback
│       │       ├── electron-runner.ts   # NEW: Electron IPC wrapper
│       │       └── runner-factory.ts    # NEW: Auto-detect environment
│       └── ...
│
├── electron-builder.json        # Electron builder config
└── package.json                 # Updated with electron scripts
```

---

## Implementation Details

### 1. Main Process (electron/main.ts)

Responsibilities:
- Create browser window
- Handle IPC from renderer
- Manage child processes (npm, dev server)
- File system operations

```typescript
// Pseudo-code structure
import { app, BrowserWindow, ipcMain } from 'electron';
import { LocalRunner } from './services/local-runner';

const runner = new LocalRunner();

// IPC Handlers
ipcMain.handle('runner:writeFiles', (event, files) => runner.writeFiles(files));
ipcMain.handle('runner:npmInstall', (event, projectPath) => runner.npmInstall(projectPath));
ipcMain.handle('runner:startServer', (event, projectPath) => runner.startServer(projectPath));
ipcMain.handle('runner:stopServer', () => runner.stopServer());
```

### 2. Local Runner Service (electron/services/local-runner.ts)

Responsibilities:
- Write project files to disk
- Run npm install (real npm, no limits)
- Start/stop development server
- Stream logs back to renderer

```typescript
// Key methods
class LocalRunner {
  private projectsDir: string;  // ~/AutoCoder/projects/
  private currentProcess: ChildProcess | null;
  
  async writeFiles(files: ProjectFile[]): Promise<void>;
  async npmInstall(projectPath: string): Promise<void>;
  async startServer(projectPath: string): Promise<string>; // Returns localhost URL
  async stopServer(): Promise<void>;
}
```

### 3. Preload Script (electron/preload.ts)

Bridge between renderer and main process:

```typescript
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  writeFiles: (files) => ipcRenderer.invoke('runner:writeFiles', files),
  npmInstall: (path) => ipcRenderer.invoke('runner:npmInstall', path),
  startServer: (path) => ipcRenderer.invoke('runner:startServer', path),
  stopServer: () => ipcRenderer.invoke('runner:stopServer'),
  onLog: (callback) => ipcRenderer.on('runner:log', callback),
  onServerReady: (callback) => ipcRenderer.on('runner:serverReady', callback),
});
```

### 4. Electron Runner (client/src/lib/code-runner/electron-runner.ts)

Same interface as WebContainer, but calls Electron IPC:

```typescript
// Drop-in replacement for webcontainer.ts when in Electron
export async function writeFiles(files: ProjectFile[]): Promise<void> {
  return window.electronAPI.writeFiles(files);
}

export async function installDependencies(onLog: LogCallback): Promise<RunResult> {
  return window.electronAPI.npmInstall(currentProject);
}

export async function startDevServer(onLog: LogCallback): Promise<{ url: string }> {
  return window.electronAPI.startServer(currentProject);
}
```

### 5. Runner Factory (client/src/lib/code-runner/runner-factory.ts)

Auto-detect environment and use appropriate runner:

```typescript
export function getRunner() {
  if (typeof window !== 'undefined' && window.electronAPI) {
    return import('./electron-runner');
  }
  return import('./webcontainer');
}
```

---

## Development Modes

### Mode 1: Web Development (Current)
```bash
npm run dev
# Runs Vite + Express on localhost:5000
# Uses WebContainer for preview
# For quick iteration on UI
```

### Mode 2: Electron Development
```bash
npm run electron:dev
# Runs Vite + Electron together
# Uses native file system for preview
# Test Electron without building
```

### Mode 3: Production Build
```bash
npm run build:desktop
# Builds React app
# Packages with electron-builder
# Creates .exe/.dmg/.AppImage
```

---

## Build Configuration

### electron-builder.json
```json
{
  "appId": "com.autocoder.app",
  "productName": "AutoCoder",
  "directories": {
    "output": "dist-electron"
  },
  "files": [
    "dist/**/*",
    "electron/**/*"
  ],
  "mac": {
    "target": "dmg",
    "icon": "assets/icon.icns"
  },
  "win": {
    "target": "nsis",
    "icon": "assets/icon.ico"
  },
  "linux": {
    "target": "AppImage",
    "icon": "assets/icon.png"
  }
}
```

---

## Project Workspace

Generated projects are stored locally:

```
~/AutoCoder/
├── projects/
│   ├── my-react-app/
│   │   ├── package.json
│   │   ├── src/
│   │   └── node_modules/    # Real npm, persists
│   │
│   └── ecommerce-site/
│       ├── package.json
│       └── ...
│
└── config/
    └── settings.json        # App preferences
```

---

## Migration Path

### What Changes
| Component | Before (WebContainer) | After (Electron) |
|-----------|----------------------|------------------|
| File writes | `webcontainer.fs.writeFile()` | `fs.writeFileSync()` via IPC |
| npm install | Virtual npm in browser | Real npm child process |
| Dev server | WebContainer spawn | Node child process |
| Preview | WebContainer iframe | WebView to localhost |
| File limit | 16KB | Unlimited |

### What Stays Same
- React frontend UI
- Code generation logic
- AI integration
- Chat interface
- All existing features

---

## Testing Strategy

### Test Without Building

Run Electron in dev mode:
```bash
npm run electron:dev
```

This runs:
1. Vite dev server for React (hot reload)
2. Electron main process (watches for changes)
3. Full Electron app with dev tools

### Test Specific Components

```bash
# Test local runner service
npm run test:electron

# Test IPC communication
npm run test:ipc
```

---

## Security Considerations

1. **File System Access**: Limited to ~/AutoCoder directory
2. **npm Commands**: Sandboxed to project directories
3. **No Remote Code**: All code generation is local
4. **Context Isolation**: Renderer can't access Node directly

---

## Timeline Estimate

| Task | Effort |
|------|--------|
| Electron setup & config | 2 hours |
| Local runner service | 3 hours |
| IPC bridge & handlers | 2 hours |
| Update auto-runner to use factory | 1 hour |
| Build scripts & packaging | 2 hours |
| Testing & debugging | 2 hours |
| **Total** | **~12 hours** |

---

## Success Criteria

1. ✅ Generate code → writes to local file system
2. ✅ npm install works for any size project
3. ✅ Dev server starts and preview works
4. ✅ Development mode works without building
5. ✅ Packaged app runs on Windows/Mac/Linux

---

## Run Guide (Windows/macOS/Linux)

### Prerequisites

- **Node.js 20 LTS** (NOT v24+) - [Download](https://nodejs.org/)
- **Git** - [Download](https://git-scm.com/)

### Initial Setup

```bash
# Clone the repository
git clone https://github.com/Gautam-Mathur/autocoder-.git
cd autocoder-

# Install dependencies
npm install
```

### Windows: EBUSY Error Fix

If you get this error during `npm install`:
```
npm error code EBUSY
npm error syscall rename
npm error path ...\node_modules\electron\...
```

**Solution:**
1. **Close VS Code completely** (it locks Electron files)
2. **Close all terminals** in the project folder
3. **Close any running Electron instances**
4. Open a fresh Command Prompt and run:

```cmd
cd C:\path\to\autocoder-
rmdir /s /q node_modules
del package-lock.json
npm install
```

> **Important:** VS Code must be closed before running npm install when Electron packages are involved.

### Build & Run Electron

After `npm install` succeeds:

```bash
# Step 1: Compile TypeScript
npx tsc -p electron/tsconfig.json
npx tsc -p electron/tsconfig.preload.json

# Step 2: Run Electron in dev mode
npm run electron:dev
```

**Or use the all-in-one script (macOS/Linux):**
```bash
chmod +x scripts/electron-dev.sh
./scripts/electron-dev.sh
```

**Windows equivalent:**
```cmd
rmdir /s /q dist-electron 2>nul
npx tsc -p electron/tsconfig.json
npx tsc -p electron/tsconfig.preload.json
npx electron dist-electron/main.js
```

### Dev Server Port

The dev server runs on **port 5100** (not 5000).

### Logging

Logs are saved to:
- **Windows:** `%APPDATA%\autocoder\logs\autocoder-YYYY-MM-DD.log`
- **macOS:** `~/Library/Application Support/autocoder/logs/`
- **Linux:** `~/.config/autocoder/logs/`

### Troubleshooting

| Issue | Solution |
|-------|----------|
| `Cannot find module 'electron'` | Run `npm install` first |
| EBUSY error | Close VS Code, then run `npm install` |
| TypeScript errors | Run `npm install` to get @types/electron |
| Preload script fails | Ensure preload uses CommonJS (require), not ES modules |
| Port 5100 in use | Kill the process: `npx kill-port 5100` |

### Project Structure

```
electron/
├── main.ts              # Main process (ESNext modules)
├── preload.ts           # Preload script (CommonJS!)
├── tsconfig.json        # Config for main.ts
├── tsconfig.preload.json # Config for preload.ts (CommonJS)
└── services/
    ├── logger.ts        # File logging with rotation
    ├── local-runner.ts  # npm/file operations
    └── project-manager.ts
```

### Important Notes

1. **Preload scripts MUST use CommonJS** - They run in a special Electron context that doesn't support ES modules
2. **Separate TypeScript configs** - main.ts uses ESNext, preload.ts uses CommonJS
3. **Delete dist-electron before recompiling** - Avoids stale output issues
