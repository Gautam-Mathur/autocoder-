# AutoCoder Electron: Predicted Problems and Solutions

## Introduction

This document catalogs potential problems that may arise during Electron development, deployment, and usage. Each problem includes:
- **Description:** What the problem is
- **Symptoms:** How to recognize it
- **Root Cause:** Why it happens
- **Solution:** How to fix it
- **Prevention:** How to avoid it in the future

---

## Table of Contents

1. [Development Issues](#1-development-issues)
2. [Build and Packaging Issues](#2-build-and-packaging-issues)
3. [Runtime Issues](#3-runtime-issues)
4. [File System Issues](#4-file-system-issues)
5. [npm Issues](#5-npm-issues)
6. [Dev Server Issues](#6-dev-server-issues)
7. [IPC Communication Issues](#7-ipc-communication-issues)
8. [Cross-Platform Issues](#8-cross-platform-issues)
9. [Performance Issues](#9-performance-issues)
10. [Security Issues](#10-security-issues)

---

## 1. Development Issues

### 1.1 TypeScript Compilation Errors

**Description:** Electron TypeScript fails to compile.

**Symptoms:**
```
error TS2307: Cannot find module './services/local-runner'
```

**Root Cause:** Missing or incorrect tsconfig paths, or missing type definitions.

**Solution:**
```bash
# Ensure electron/tsconfig.json exists and is correct
cat electron/tsconfig.json

# Rebuild
npx tsc -p electron/tsconfig.json

# If types are missing
npm install --save-dev @types/node
```

**Prevention:** Always run `npx tsc -p electron/tsconfig.json` after modifying Electron files.

---

### 1.2 Electron Won't Start

**Description:** Running Electron produces no window.

**Symptoms:**
```
./scripts/electron-dev.sh
# No output, no window
```

**Root Cause:** 
- Electron not installed
- dist-electron not built
- Web server not running
- Display not available

**Solution:**
```bash
# Check Electron is installed
npm list electron

# Ensure web server is running first
npm run dev  # In terminal 1

# Build Electron
npx tsc -p electron/tsconfig.json

# Check dist-electron exists
ls dist-electron/main.js

# Run with debug
DEBUG=* ./scripts/electron-dev.sh
```

**Prevention:** Always start web server before Electron.

---

### 1.3 Hot Reload Not Working

**Description:** Changes to React code don't appear in Electron.

**Symptoms:** UI doesn't update after saving files.

**Root Cause:** Vite HMR websocket connection issues.

**Solution:**
```bash
# Restart Electron
# Close the Electron window
# Run electron-dev.sh again

# Or, reload the window (Ctrl+R / Cmd+R in the Electron window)
```

**Prevention:** Ensure Vite dev server is running on localhost:5000 before starting Electron.

---

## 2. Build and Packaging Issues

### 2.1 electron-builder Fails

**Description:** `./scripts/build-desktop.sh` fails during packaging.

**Symptoms:**
```
Error: Cannot find module 'electron'
# or
Error: Application entry file "dist-electron/main.js" not found
```

**Root Cause:** Build order incorrect or missing files.

**Solution:**
```bash
# Ensure correct build order
npm run build                      # Build React first
npx tsc -p electron/tsconfig.json  # Build Electron second
npx electron-builder               # Package last

# Check files exist
ls dist/index.html
ls dist-electron/main.js
```

**Prevention:** Use `./scripts/build-desktop.sh` which runs commands in correct order.

---

### 2.2 Missing Icons

**Description:** Built app has generic/blank icons.

**Symptoms:** App icon is default Electron icon.

**Root Cause:** Icon files not in `build-resources/`.

**Solution:**
```bash
# Create icons directory
mkdir -p build-resources

# Add platform-specific icons:
# - icon.icns (macOS)
# - icon.ico (Windows)
# - icon.png (Linux, 512x512)
```

**Prevention:** Prepare icons before building.

---

### 2.3 Large Bundle Size

**Description:** Packaged app is unexpectedly large (500MB+).

**Symptoms:** `release/` folder contains huge files.

**Root Cause:** 
- node_modules included unnecessarily
- dev dependencies bundled
- unoptimized assets

**Solution:**
```json
// electron-builder.json - add files exclusions
{
  "files": [
    "dist/**/*",
    "dist-electron/**/*",
    "!**/node_modules/*/{CHANGELOG.md,README.md}",
    "!**/*.{ts,map}"
  ]
}
```

**Prevention:** Configure electron-builder to exclude unnecessary files.

---

## 3. Runtime Issues

### 3.1 White Screen on Launch

**Description:** App opens but shows blank white screen.

**Symptoms:** Window appears but content is white/empty.

**Root Cause:**
- React app not built
- Wrong URL loaded in production
- JavaScript errors preventing render

**Solution:**
```javascript
// In electron/main.ts, add error handling:
mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
  console.error('Failed to load:', errorDescription);
});

// Open DevTools to see errors
mainWindow.webContents.openDevTools();
```

**Prevention:** Add console logging and error handlers to main.ts.

---

### 3.2 Context Bridge Undefined

**Description:** `window.electronAPI` is undefined in renderer.

**Symptoms:**
```
TypeError: Cannot read properties of undefined (reading 'writeFiles')
```

**Root Cause:**
- Preload script not loaded
- contextBridge not exposing correctly
- Running in browser instead of Electron

**Solution:**
```javascript
// Check if in Electron
if (typeof window !== 'undefined' && 'electronAPI' in window) {
  // Electron code
} else {
  // Fallback for browser
}

// Verify preload path in main.ts
webPreferences: {
  preload: path.join(__dirname, 'preload.js'),  // Must be .js, not .ts
}
```

**Prevention:** Always use `isElectronEnvironment()` check before API calls.

---

## 4. File System Issues

### 4.1 Permission Denied

**Description:** Cannot write files to project directory.

**Symptoms:**
```
Error: EACCES: permission denied, mkdir '/home/user/AutoCoder'
```

**Root Cause:**
- No write permission to home directory
- Path contains special characters
- Antivirus blocking writes

**Solution:**
```bash
# Check permissions
ls -la ~/

# Create directory manually
mkdir -p ~/AutoCoder/projects

# On Windows, check antivirus exclusions
```

**Prevention:** Verify directory exists and is writable on app startup.

---

### 4.2 Files Not Appearing

**Description:** Files written but not visible in project folder.

**Symptoms:** `writeFiles` returns success but files aren't there.

**Root Cause:**
- Wrong project path
- Files written to different location
- File explorer cache

**Solution:**
```javascript
// Log the actual path
console.log('Writing to:', fullPath);

// Verify path construction
const projectPath = path.join(os.homedir(), 'AutoCoder', 'projects', projectName);
console.log('Project path:', projectPath);
```

**Prevention:** Add detailed logging in local-runner.ts.

---

### 4.3 Path Separators on Windows

**Description:** File paths don't work on Windows.

**Symptoms:**
```
Error: ENOENT: no such file or directory 'C:\Users\name\AutoCoder/projects'
```

**Root Cause:** Mixed path separators (/ vs \).

**Solution:**
```javascript
// Always use path.join()
const fullPath = path.join(projectPath, file.path);

// Never concatenate paths manually
// BAD: projectPath + '/' + fileName
// GOOD: path.join(projectPath, fileName)
```

**Prevention:** Use `path.join()` for all path operations.

---

## 5. npm Issues

### 5.1 npm Install Hangs

**Description:** npm install starts but never completes.

**Symptoms:** Log shows "Installing..." but no progress.

**Root Cause:**
- Network issues
- npm registry down
- Package resolution taking too long

**Solution:**
```javascript
// Add timeout in local-runner.ts
const timeout = setTimeout(() => {
  child.kill();
  resolve({ success: false, error: 'npm install timeout' });
}, 300000);  // 5 minute timeout

child.on('close', () => {
  clearTimeout(timeout);
  // ...
});
```

**Prevention:** Add timeout handling for npm operations.

---

### 5.2 npm Not Found

**Description:** npm command fails.

**Symptoms:**
```
Error: spawn npm ENOENT
```

**Root Cause:** npm not in PATH or not installed.

**Solution:**
```javascript
// Use full path on Windows
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';

// Or find npm path
const npmPath = process.platform === 'win32'
  ? path.join(process.env.APPDATA, 'npm', 'npm.cmd')
  : 'npm';
```

**Prevention:** Handle platform differences in command execution.

---

### 5.3 Package Install Failures

**Description:** Specific packages fail to install.

**Symptoms:**
```
npm ERR! code ERESOLVE
npm ERR! Could not resolve dependency
```

**Root Cause:** Conflicting peer dependencies or version issues.

**Solution:**
```javascript
// Try with legacy peer deps
spawn('npm', ['install', '--legacy-peer-deps'], { cwd: projectPath });

// Or force install
spawn('npm', ['install', '--force'], { cwd: projectPath });
```

**Prevention:** Generate compatible package.json files.

---

## 6. Dev Server Issues

### 6.1 Server URL Not Detected

**Description:** Dev server starts but URL isn't captured.

**Symptoms:** Preview panel shows "Waiting for server..." indefinitely.

**Root Cause:** URL pattern doesn't match server output.

**Solution:**
```javascript
// Expand URL detection patterns in local-runner.ts
const urlPatterns = [
  /localhost:(\d+)/,
  /http:\/\/127\.0\.0\.1:(\d+)/,
  /http:\/\/0\.0\.0\.0:(\d+)/,
  /Local:\s*http:\/\/localhost:(\d+)/,  // Vite format
  /ready on .*:(\d+)/,  // Next.js format
];

for (const pattern of urlPatterns) {
  const match = line.match(pattern);
  if (match) {
    // Found URL
  }
}
```

**Prevention:** Support multiple URL formats from different dev servers.

---

### 6.2 Port Already in Use

**Description:** Dev server fails to start.

**Symptoms:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Root Cause:** Previous process still running on port.

**Solution:**
```javascript
// Kill existing process before starting
async function killPort(port: number): Promise<void> {
  if (process.platform === 'win32') {
    spawn('cmd', ['/c', `netstat -ano | findstr :${port}`, '|', 'for', '/f', '"tokens=5"', '%a', 'in', '(\'more\')', 'do', 'taskkill', '/f', '/pid', '%a']);
  } else {
    spawn('fuser', ['-k', `${port}/tcp`]);
  }
}
```

**Prevention:** Stop previous server before starting new one.

---

### 6.3 Preview Not Loading

**Description:** Dev server running but preview shows error.

**Symptoms:** iframe shows connection refused or blank.

**Root Cause:**
- Server bound to wrong interface
- CORS issues
- SSL certificate issues

**Solution:**
```javascript
// Ensure server binds to all interfaces
env: {
  ...process.env,
  HOST: '0.0.0.0',  // Or 'localhost'
}
```

**Prevention:** Configure generated projects to bind to localhost.

---

## 7. IPC Communication Issues

### 7.1 IPC Response Timeout

**Description:** Renderer hangs waiting for IPC response.

**Symptoms:** UI freezes on operations.

**Root Cause:** Main process handler threw unhandled error or didn't return.

**Solution:**
```javascript
// Add timeout wrapper
async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  const timeout = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('Operation timed out')), ms);
  });
  return Promise.race([promise, timeout]);
}

// Use in renderer
const result = await withTimeout(
  window.electronAPI.npmInstall(projectName),
  300000
);
```

**Prevention:** Always wrap IPC calls with timeout.

---

### 7.2 Event Listener Memory Leak

**Description:** App slows down over time.

**Symptoms:** Memory usage grows, especially with many operations.

**Root Cause:** Event listeners not cleaned up.

**Solution:**
```typescript
// Always return cleanup function
onLog: (callback) => {
  const handler = (event, log) => callback(log);
  ipcRenderer.on('runner:log', handler);
  return () => ipcRenderer.removeListener('runner:log', handler);  // IMPORTANT
}

// Clean up in React
useEffect(() => {
  const unsubscribe = window.electronAPI.onLog(handleLog);
  return () => unsubscribe();  // Cleanup on unmount
}, []);
```

**Prevention:** Always implement cleanup functions for event listeners.

---

## 8. Cross-Platform Issues

### 8.1 Path Case Sensitivity

**Description:** Works on Windows but fails on Mac/Linux.

**Symptoms:** "File not found" on Mac/Linux for files that exist.

**Root Cause:** Windows is case-insensitive, Mac/Linux are case-sensitive.

**Solution:**
```javascript
// Always use consistent case
// BAD: sometimes 'Package.json', sometimes 'package.json'
// GOOD: always 'package.json'
```

**Prevention:** Standardize on lowercase filenames.

---

### 8.2 Line Endings

**Description:** Scripts fail on different platforms.

**Symptoms:**
```
bash: ./scripts/electron-dev.sh: /bin/bash^M: bad interpreter
```

**Root Cause:** Windows CRLF line endings in shell scripts.

**Solution:**
```bash
# Convert to Unix line endings
sed -i 's/\r$//' scripts/*.sh

# Or in git config
git config --global core.autocrlf input
```

**Prevention:** Configure .gitattributes for correct line endings.

---

## 9. Performance Issues

### 9.1 Slow File Writes

**Description:** Writing many files is slow.

**Symptoms:** "Writing files..." takes 10+ seconds.

**Root Cause:** Synchronous file operations blocking event loop.

**Solution:**
```javascript
// Use async operations
const fsPromises = require('fs').promises;

async function writeFiles(projectPath, files) {
  await Promise.all(files.map(async (file) => {
    const fullPath = path.join(projectPath, file.path);
    await fsPromises.mkdir(path.dirname(fullPath), { recursive: true });
    await fsPromises.writeFile(fullPath, file.content);
  }));
}
```

**Prevention:** Use async fs operations for large file sets.

---

### 9.2 High Memory Usage

**Description:** App uses excessive memory.

**Symptoms:** System slowdown, out of memory errors.

**Root Cause:**
- Multiple large node_modules in memory
- Not cleaning up child processes

**Solution:**
```javascript
// Always cleanup child processes
app.on('before-quit', () => {
  runner.cleanup();
});

// Limit concurrent operations
const pLimit = require('p-limit');
const limit = pLimit(3);  // Max 3 concurrent operations
```

**Prevention:** Implement proper cleanup and resource limits.

---

## 10. Security Issues

### 10.1 Arbitrary Code Execution

**Description:** User can execute arbitrary system commands.

**Risk:** Malicious input could run dangerous commands.

**Mitigation:**
```javascript
// Never pass user input directly to shell
// BAD
spawn('sh', ['-c', userInput]);

// GOOD - only allow specific commands
const allowedCommands = ['npm', 'node'];
if (!allowedCommands.includes(command)) {
  throw new Error('Command not allowed');
}
```

---

### 10.2 Path Traversal

**Description:** User could access files outside project directory.

**Risk:** Reading/writing arbitrary system files.

**Mitigation:**
```javascript
// Validate paths are within project directory
function isPathSafe(basePath, targetPath) {
  const resolved = path.resolve(basePath, targetPath);
  return resolved.startsWith(path.resolve(basePath));
}

if (!isPathSafe(projectPath, file.path)) {
  throw new Error('Invalid file path');
}
```

---

### 10.3 Node Integration Exposure

**Description:** Renderer has access to Node.js APIs.

**Risk:** XSS could lead to full system compromise.

**Mitigation:**
```javascript
// Always disable nodeIntegration and enable contextIsolation
webPreferences: {
  nodeIntegration: false,
  contextIsolation: true,
  preload: path.join(__dirname, 'preload.js'),
}
```

---

## Quick Reference: Common Error Codes

| Error | Likely Cause | First Step |
|-------|-------------|------------|
| ENOENT | File/path not found | Check path construction |
| EACCES | Permission denied | Check directory permissions |
| EADDRINUSE | Port in use | Kill existing process |
| ERESOLVE | npm dependency conflict | Try --legacy-peer-deps |
| spawn ENOENT | Command not found | Check PATH and command name |
| IPC timeout | Handler error | Add logging to main process |
