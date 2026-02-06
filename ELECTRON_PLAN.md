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
1. `electron/main.ts` (ESM) -> `dist-electron/main.js` (CJS, platform: node)
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

---

## Important Notes

1. **Preload scripts MUST use CommonJS** - They run in a special Electron context that doesn't support ES modules
2. **main.ts uses ESM** - Uses `import.meta.url` for `__dirname` equivalent
3. **esbuild handles the conversion** - Both are compiled to CJS output for Node.js compatibility
4. **electron-builder.json** configures packaging for all three platforms
5. **Pro Generator** is used for code generation in both web and Electron modes
6. **LiveCodeRunner** provides instant preview in web mode; Electron mode uses real npm + dev server
