# AutoCoder Electron: Developer's Guide

## Introduction

This guide is for developers who want to understand, modify, or extend the AutoCoder Electron implementation. It covers the codebase structure, key components, development workflow, and best practices.

---

## Table of Contents

1. [Project Structure](#project-structure)
2. [Development Environment Setup](#development-environment-setup)
3. [Key Components Deep Dive](#key-components-deep-dive)
4. [Adding New Features](#adding-new-features)
5. [IPC Communication Patterns](#ipc-communication-patterns)
6. [State Management](#state-management)
7. [Error Handling Patterns](#error-handling-patterns)
8. [Testing Your Changes](#testing-your-changes)
9. [Build and Packaging](#build-and-packaging)
10. [Code Style and Conventions](#code-style-and-conventions)

---

## 1. Project Structure

```
autocoder/
├── electron/                        # Electron-specific code
│   ├── main.ts                      # Main process entry point
│   ├── preload.ts                   # IPC bridge (context bridge)
│   ├── tsconfig.json                # TypeScript config for Electron
│   └── services/
│       ├── local-runner.ts          # File system & npm operations
│       └── project-manager.ts       # Workspace management
│
├── client/                          # React frontend
│   └── src/
│       ├── lib/
│       │   └── code-runner/
│       │       ├── webcontainer.ts      # WebContainer (browser fallback)
│       │       ├── electron-runner.ts   # Electron IPC wrapper
│       │       └── runner-factory.ts    # Environment detection
│       ├── components/
│       ├── pages/
│       └── ...
│
├── server/                          # Express backend
│   └── ...
│
├── dist-electron/                   # Compiled Electron code
├── release/                         # Packaged desktop apps
│
├── electron-builder.json            # Desktop build config
├── scripts/
│   ├── electron-dev.sh              # Dev mode script
│   └── build-desktop.sh             # Production build script
│
└── docs/electron/                   # Documentation
```

---

## 2. Development Environment Setup

### Prerequisites

- Node.js 18+ (20 recommended)
- npm 8+
- Git
- A display environment (Electron requires a GUI)

### Initial Setup

```bash
# Clone the repository
git clone https://github.com/Gautam-Mathur/autocoder-.git
cd autocoder-

# Install all dependencies
npm install

# Build Electron TypeScript
npx tsc -p electron/tsconfig.json
```

### Running in Development

**Option A: Web-only Development (no Electron)**
```bash
npm run dev
# Opens at http://localhost:5000
# Uses WebContainer for preview (has limitations)
```

**Option B: Full Electron Development**
```bash
# Terminal 1: Start the web server
npm run dev

# Terminal 2: Run Electron
./scripts/electron-dev.sh
```

### Rebuilding Electron After Changes

When you modify files in `electron/`:

```bash
npx tsc -p electron/tsconfig.json
```

The compiled output goes to `dist-electron/`.

---

## 3. Key Components Deep Dive

### 3.1 Main Process (`electron/main.ts`)

The main process is the application's entry point. Key responsibilities:

```typescript
// Window creation
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });
  
  // Load the React app
  if (isDev) {
    mainWindow.loadURL('http://localhost:5000');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

// IPC handlers registration
ipcMain.handle('runner:writeFiles', async (event, projectName, files) => {
  // Handle file write requests from renderer
});
```

**Key Patterns:**
- Use `ipcMain.handle()` for request-response patterns
- Use `mainWindow.webContents.send()` for pushing updates to renderer
- Always return structured responses: `{ success: boolean, error?: string }`

### 3.2 Preload Script (`electron/preload.ts`)

The preload script creates a secure bridge between main and renderer:

```typescript
// Define the API interface
interface ElectronAPI {
  writeFiles: (projectName: string, files: Array<...>) => Promise<...>;
  npmInstall: (projectName: string) => Promise<...>;
  // ... more methods
}

// Expose to renderer via contextBridge
contextBridge.exposeInMainWorld('electronAPI', {
  writeFiles: (projectName, files) => 
    ipcRenderer.invoke('runner:writeFiles', projectName, files),
  // ... more methods
});
```

**Key Patterns:**
- Use `ipcRenderer.invoke()` for async request-response
- Use `ipcRenderer.on()` for event listeners (with cleanup)
- Always type the API interface for type safety

### 3.3 Local Runner Service (`electron/services/local-runner.ts`)

Handles actual file system and process operations:

```typescript
class LocalRunner {
  // Write files to disk
  async writeFiles(projectPath: string, files: ProjectFile[]): Promise<void> {
    for (const file of files) {
      const fullPath = path.join(projectPath, file.path);
      fs.mkdirSync(path.dirname(fullPath), { recursive: true });
      fs.writeFileSync(fullPath, file.content, 'utf-8');
    }
  }
  
  // Run npm install with streaming output
  async npmInstall(projectPath: string, onLog: LogCallback): Promise<RunResult> {
    return new Promise((resolve) => {
      const child = spawn('npm', ['install'], { cwd: projectPath });
      
      child.stdout.on('data', (data) => {
        onLog(`[npm] ${data.toString()}`);
      });
      
      child.on('close', (code) => {
        resolve({ success: code === 0 });
      });
    });
  }
}
```

**Key Patterns:**
- Use synchronous fs operations for reliability
- Create directories recursively before writing files
- Stream process output through callbacks
- Always handle process errors and exit codes

### 3.4 Electron Runner (`client/src/lib/code-runner/electron-runner.ts`)

Frontend wrapper that calls the Electron API:

```typescript
export function isElectronEnvironment(): boolean {
  return typeof window !== 'undefined' && 
         'electronAPI' in window && 
         window.electronAPI !== undefined;
}

export async function writeFiles(
  projectName: string, 
  files: ProjectFile[], 
  onLog?: LogCallback
): Promise<RunResult> {
  if (!isElectronEnvironment()) {
    return { success: false, error: 'Not running in Electron' };
  }
  
  const api = getElectronAPI();
  return api.writeFiles(projectName, files);
}
```

**Key Patterns:**
- Always check `isElectronEnvironment()` first
- Use a helper function to narrow types
- Provide fallback behavior for non-Electron environments

### 3.5 Runner Factory (`client/src/lib/code-runner/runner-factory.ts`)

Automatically selects the right runner based on environment:

```typescript
export function detectRunnerType(): RunnerType {
  if (isElectronEnvironment()) {
    return 'electron';
  }
  if (typeof window !== 'undefined') {
    return 'webcontainer';
  }
  return 'none';
}

export async function getRunner(): Promise<UnifiedRunner> {
  const runnerType = detectRunnerType();
  
  if (runnerType === 'electron') {
    const electronRunner = await import('./electron-runner');
    return { type: 'electron', ...electronRunner };
  }
  // ... other runners
}
```

**Key Patterns:**
- Use dynamic imports for code splitting
- Cache the runner instance
- Provide a unified interface across all runner types

---

## 4. Adding New Features

### Example: Adding a "Clear Cache" Feature

**Step 1: Add IPC handler in main process**

```typescript
// electron/main.ts
ipcMain.handle('project:clearCache', async (_event, projectName: string) => {
  try {
    const projectPath = projectManager.getProjectPath(projectName);
    const nodeModulesPath = path.join(projectPath, 'node_modules');
    
    if (fs.existsSync(nodeModulesPath)) {
      fs.rmSync(nodeModulesPath, { recursive: true, force: true });
    }
    
    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
});
```

**Step 2: Expose in preload script**

```typescript
// electron/preload.ts
contextBridge.exposeInMainWorld('electronAPI', {
  // ... existing methods
  clearCache: (projectName: string) => 
    ipcRenderer.invoke('project:clearCache', projectName),
});
```

**Step 3: Update type definitions**

```typescript
// electron/preload.ts (interface)
interface ElectronAPI {
  // ... existing methods
  clearCache: (projectName: string) => Promise<{ success: boolean; error?: string }>;
}

// client/src/lib/code-runner/electron-runner.ts
interface ElectronAPI {
  // ... same interface
  clearCache: (projectName: string) => Promise<{ success: boolean; error?: string }>;
}
```

**Step 4: Add frontend wrapper**

```typescript
// client/src/lib/code-runner/electron-runner.ts
export async function clearCache(projectName: string): Promise<RunResult> {
  if (!isElectronEnvironment()) {
    return { success: false, error: 'Not running in Electron' };
  }
  return getElectronAPI().clearCache(projectName);
}
```

**Step 5: Rebuild and test**

```bash
npx tsc -p electron/tsconfig.json
# Restart Electron
```

---

## 5. IPC Communication Patterns

### Request-Response Pattern

Use for one-off operations that return a result:

```typescript
// Main process
ipcMain.handle('channel:name', async (event, ...args) => {
  // Do work
  return { success: true, data: result };
});

// Preload
ipcRenderer.invoke('channel:name', arg1, arg2);
```

### Event Stream Pattern

Use for pushing updates to the renderer:

```typescript
// Main process
mainWindow.webContents.send('channel:event', eventData);

// Preload
onEvent: (callback) => {
  const handler = (event, data) => callback(data);
  ipcRenderer.on('channel:event', handler);
  return () => ipcRenderer.removeListener('channel:event', handler);
}
```

### Bidirectional Pattern

Use for long-running operations with progress:

```typescript
// Main process
ipcMain.handle('runner:longOperation', async (event, args) => {
  for (const step of steps) {
    mainWindow.webContents.send('runner:progress', step);
    await processStep(step);
  }
  return { success: true };
});
```

---

## 6. State Management

### Main Process State

Keep minimal state in the main process:

```typescript
class LocalRunner {
  private currentProcess: ChildProcess | null = null;
  private serverUrl: string | null = null;
  
  // Methods manage this state
}
```

### Renderer State

Use React state/context for UI state:

```typescript
const [isRunning, setIsRunning] = useState(false);
const [serverUrl, setServerUrl] = useState<string | null>(null);

useEffect(() => {
  const unsubscribe = window.electronAPI.onServerReady((url) => {
    setServerUrl(url);
    setIsRunning(true);
  });
  return unsubscribe;
}, []);
```

---

## 7. Error Handling Patterns

### Main Process Errors

Always catch and return structured errors:

```typescript
ipcMain.handle('runner:operation', async (event, args) => {
  try {
    const result = await doOperation(args);
    return { success: true, data: result };
  } catch (error) {
    console.error('Operation failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : String(error)
    };
  }
});
```

### Renderer Error Handling

```typescript
const result = await window.electronAPI.operation(args);

if (!result.success) {
  toast({
    title: 'Operation Failed',
    description: result.error,
    variant: 'destructive',
  });
  return;
}

// Continue with success case
```

---

## 8. Testing Your Changes

### Manual Testing Checklist

1. **File Operations**
   - [ ] Create a new project with multiple files
   - [ ] Verify files appear in `~/AutoCoder/projects/`
   - [ ] Check file contents match generated code

2. **npm Install**
   - [ ] Run npm install on a project with 10+ dependencies
   - [ ] Verify logs stream to UI in real-time
   - [ ] Check node_modules is created

3. **Dev Server**
   - [ ] Start dev server
   - [ ] Verify server URL is detected
   - [ ] Check preview loads correctly
   - [ ] Stop server and verify cleanup

4. **Project Management**
   - [ ] List projects
   - [ ] Delete a project
   - [ ] Open project folder in system file manager

---

## 9. Build and Packaging

### Development Build

```bash
# Build Electron TypeScript
npx tsc -p electron/tsconfig.json

# Output: dist-electron/
```

### Production Build

```bash
./scripts/build-desktop.sh

# This:
# 1. Builds React app (npm run build)
# 2. Builds Electron TypeScript
# 3. Packages with electron-builder
# 
# Output: release/
```

### Build Configuration

See `electron-builder.json` for platform-specific settings.

---

## 10. Code Style and Conventions

### TypeScript

- Use strict mode
- Define interfaces for all IPC payloads
- Use async/await over callbacks where possible

### Error Messages

- Be specific: "Failed to write file: /path/to/file"
- Include context: "npm install failed with exit code 1"
- Be actionable when possible

### Logging

- Use console.log for development
- Stream important events to renderer
- Prefix logs with component: `[AutoCoder]`, `[npm]`, `[dev]`

### File Naming

- Use kebab-case for files
- Use PascalCase for classes
- Use camelCase for functions and variables
