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
11. [LiveCodeRunner Troubleshooting](#11-livecoderunner-troubleshooting)

---

## 1. Development Issues

### 1.1 Electron Build Errors

**Description:** Electron build fails when running `npm run build:electron`.

**Note:** AutoCoder uses **esbuild** (not tsc) to compile Electron files. The build script is `scripts/build-electron.ts`.

**Common Symptoms:**
```
Error: Cannot find module 'electron'
esbuild: Build failed with errors
dist-electron/ directory is empty or missing
```

**Root Cause:** 
1. Electron package not installed
2. Node modules corrupted
3. Incorrect Node.js version (v24+ may have issues)

**Solution - Step by Step:**

```bash
# Step 1: Check Node.js version (use LTS, NOT v24+)
node --version
# If v24+, consider downgrading to v20.x LTS

# Step 2: Clean install all dependencies
rm -rf node_modules
npm cache clean --force
npm install

# Step 3: Verify Electron is installed
npm list electron
# Should show: electron@40.x.x

# Step 4: Build Electron with esbuild
npm run build:electron
```

**If Electron is not installed:**
```bash
# Install Electron explicitly
npm install electron electron-builder --save-dev

# Verify installation
npm list electron
# Should output: electron@40.x.x

# Now rebuild
npm run build:electron
```

**Node.js v24+ Users - IMPORTANT:**
Node.js v24 is not an LTS version and may have compatibility issues. **Downgrade to LTS:**
```bash
# Using nvm (recommended)
nvm install 20
nvm use 20
node --version  # Should show v20.x.x

# Clean reinstall
rm -rf node_modules
npm cache clean --force
npm install
npm run build:electron
```

**Windows PowerShell Users:**
If npm install fails with permission errors:
```powershell
# Run PowerShell as Administrator, then:
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
npm install electron electron-builder --save-dev
```

**If TS7006/TS7031 "implicit any" errors persist:**
The code needs explicit type annotations. The latest code in the repository has these fixed. Pull the latest:
```bash
git pull origin main
npm run build:electron
```

**Prevention:** 
- Use Node.js LTS versions (18.x or 20.x)
- Always run `npm install` before building
- Run `npm run build:electron` after modifying Electron files

---

### 1.2 ES Module Error: "exports is not defined"

**Description:** Electron throws error on startup about ES modules.

**Symptoms:**
```
ReferenceError: exports is not defined in ES module scope
This file is being treated as an ES module because it has a '.js' file extension 
and package.json contains "type": "module".
```

**Root Cause:** 
The project uses `"type": "module"` in package.json, but Electron TypeScript was configured to output CommonJS format which uses `exports`.

**Solution:**
This has been fixed in the latest code. Pull the latest version:
```bash
git pull origin main
npm run build:electron
npx electron dist-electron/main.js
```

**Manual Fix (if needed):**
Update `electron/tsconfig.json`:
```json
{
  "compilerOptions": {
    "module": "ESNext",           // Changed from "commonjs"
    "moduleResolution": "bundler" // Changed from "node"
  }
}
```

And update imports in `electron/main.ts` to use `.js` extensions:
```typescript
import { LocalRunner } from './services/local-runner.js';
import { ProjectManager } from './services/project-manager.js';
```

Also add `__dirname` replacement for ES modules:
```typescript
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
```

---

### 1.3 Electron Won't Start

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

# Build Electron with esbuild
npm run build:electron

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
npm run build:electron             # Build Electron second (uses esbuild)
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

---

## 11. LiveCodeRunner Troubleshooting

The `LiveCodeRunner` component (`client/src/components/live-code-runner.tsx`) provides in-browser preview of generated projects by transpiling JSX/TSX with Babel and rendering in a sandboxed iframe. Below are common issues and their solutions.

### 11.1 Blank Preview / No Output

**Description:** The preview iframe is empty or shows nothing.

**Symptoms:** Preview panel renders but displays a blank white area with no content.

**Root Cause 1:** All files were filtered out as backend files.
LiveCodeRunner excludes files whose paths match backend patterns: `server/`, `routes/`, `models/`, `controllers/`, `middleware/`, `services/`, `validators/`, `db/`, `migrations/`, `scripts/`, `prisma/`, `tests/`, `spec/`, `__tests__/`, and `e2e/`.

**Fix:** Check file paths in the generated project. Move frontend component files out of backend-named directories. For example, `server/components/App.tsx` will be filtered out — use `client/src/App.tsx` or `src/App.tsx` instead.

**Root Cause 2:** No `.jsx` or `.tsx` files exist in the project.
LiveCodeRunner only processes files ending in `.tsx`, `.jsx`, or `.js`. If the project contains only `.ts` files or configuration files, there is nothing to render.

**Fix:** Ensure at least one component file with a `.tsx` or `.jsx` extension exists in the project. The file must contain a React component with JSX markup.

---

### 11.2 Babel Transpilation Errors

**Description:** The preview shows a Babel error or fails to render components.

**Symptoms:** Console errors mentioning `SyntaxError` from Babel, or the preview shows an error overlay.

**Root Cause 1:** TypeScript syntax not fully stripped.
LiveCodeRunner uses regex-based stripping to remove TypeScript constructs before Babel processes the code. Complex generic types (e.g., `Record<string, Map<number, Set<T>>>`), `enum` declarations, `namespace` blocks, and `declare` statements may not be fully removed.

**Fix:** Simplify TypeScript usage in generated code:
- Use plain JS/JSX instead of complex TypeScript
- Avoid `enum` declarations (use plain objects or string unions instead)
- Avoid complex nested generic types
- Avoid `declare module`, `declare global`, and `namespace` blocks

**Root Cause 2:** JSX syntax errors such as unclosed tags or mismatched brackets.

**Fix:** Run the Code Validator (`client/src/lib/code-generator/code-validator.ts`) before preview to catch syntax issues. LiveCodeRunner does auto-fix some common issues (stray semicolons, tag case mismatches), but it cannot fix all malformed JSX.

---

### 11.3 Missing Components / Icons

**Description:** Components render as empty or throw "not defined" errors. Icons don't appear.

**Symptoms:** Parts of the UI are missing, or console shows `ReferenceError: ComponentName is not defined`.

**Root Cause 1:** The component is not in the 205+ mocked components list.
LiveCodeRunner provides mock implementations for common UI components (Button, Card, Input, Dialog, Table, Tabs, Form, Avatar, Badge, Select, etc.) and layout components (Router, Route, Link, Sidebar, Header, Footer, etc.). Components not in this list will be undefined.

**Fix:** Use only mocked components or fall back to simple HTML elements. Check the `builtInMocks` set in `live-code-runner.tsx` for the full list of available components.

**Root Cause 2:** The Lucide icon is not in the 60+ mocked icons list.
LiveCodeRunner mocks common Lucide icons (Check, X, Plus, Search, Home, User, Settings, Menu, Edit, Trash, Star, Heart, Bell, Mail, etc.). Icons not in this list will render as empty spans.

**Fix:** Check the `builtInIconsList` array in `live-code-runner.tsx` for available icons. Use an alternative icon from the mocked list, or use a simple HTML/SVG element instead.

---

### 11.4 Styling Issues (Tailwind Classes Not Working)

**Description:** Tailwind CSS classes have no effect on the rendered output.

**Symptoms:** Elements appear unstyled despite having Tailwind class names.

**Root Cause:** LiveCodeRunner embeds a subset of ~500 common Tailwind CSS utility classes directly in the generated HTML. Classes outside this subset will have no effect.

**Fix:** Stick to common Tailwind classes that are included in the embedded subset:
- **Layout:** `flex`, `grid`, `block`, `inline`, `hidden`, `relative`, `absolute`, `fixed`, `sticky`
- **Spacing:** `p-*`, `px-*`, `py-*`, `m-*`, `mx-*`, `my-*`, `gap-*` (values: 1-8)
- **Sizing:** `w-full`, `h-full`, `min-h-screen`, `max-w-*`
- **Typography:** `text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl`, `text-3xl`, `font-medium`, `font-semibold`, `font-bold`, `text-center`
- **Colors:** `text-white`, `text-gray-*`, `bg-white`, `bg-gray-*`, `bg-blue-*`, `bg-green-*`, `bg-red-*`
- **Borders:** `rounded`, `rounded-md`, `rounded-lg`, `rounded-full`, `border`, `border-gray-*`
- **Flexbox:** `items-center`, `justify-center`, `justify-between`, `flex-col`, `flex-row`, `flex-wrap`

**Not available:** Advanced Tailwind utilities such as `ring-*`, `divide-*`, `placeholder-*`, `backdrop-*`, `scroll-*`, and arbitrary value syntax (e.g., `w-[200px]`) are not included.

---

### 11.5 Import Errors

**Description:** Imports fail or referenced modules are undefined.

**Symptoms:** `ReferenceError` for imported values, or components fail to render due to missing dependencies.

**Root Cause 1:** Using npm packages that aren't mocked.
LiveCodeRunner strips all `import` statements and provides mocks for React, React Router, and shadcn/ui components. Packages like `axios`, `lodash`, `moment`, `date-fns`, `framer-motion`, `zustand`, etc. are not available.

**Fix:**
- Use `fetch()` instead of `axios` for HTTP requests
- Inline simple utility functions instead of importing `lodash`
- Use `new Date()` and `Intl.DateTimeFormat` instead of `moment` or `date-fns`
- Use CSS transitions/animations instead of `framer-motion`

**Root Cause 2:** Relative imports reference files that were filtered out as backend files.

**Fix:** Ensure all imported files are frontend files (not in `server/`, `routes/`, `models/`, etc.). LiveCodeRunner processes all qualifying frontend files and makes their exported components available in the same scope.

---

### 11.6 COEP/Cross-Origin Issues

**Description:** Babel CDN fails to load, or the iframe content is blocked.

**Symptoms:** Network errors for `unpkg.com/babel-standalone`, or the iframe shows a blank page with CSP errors in the console.

**Root Cause 1:** Babel CDN (`unpkg.com`) blocked by Content-Security-Policy headers.

**Fix:** LiveCodeRunner automatically falls back to a local proxy (`/api/babel-proxy`) when the CDN is blocked. Check the browser Network tab to verify the fallback is working. If neither CDN nor proxy works, Babel transpilation will fail silently.

**Root Cause 2:** `srcDoc` attribute blocked by Cross-Origin-Embedder-Policy (COEP).

**Fix:** LiveCodeRunner uses `blob:` URLs instead of `srcDoc` to bypass COEP restrictions. This is handled automatically. If you still see cross-origin issues, ensure the server is not setting overly restrictive COEP headers. The iframe uses the `sandbox` attribute with `allow-scripts` to maintain security.

---

### 11.7 Memory Leaks / Performance

**Description:** Browser memory usage grows over time, or the preview is slow to render.

**Symptoms:** Browser tab becomes sluggish, memory usage climbs in Task Manager, or preview takes several seconds to appear.

**Root Cause 1:** Blob URLs not being revoked.
Each preview render creates a new `blob:` URL for the iframe. If old URLs aren't revoked, they accumulate in memory.

**Fix:** LiveCodeRunner automatically revokes previous blob URLs after a 2-second delay (to allow the iframe to finish loading). If memory still leaks, check for multiple LiveCodeRunner instances being mounted simultaneously — each instance manages its own blob URLs independently.

**Root Cause 2:** Large projects (30+ files) are slow to process.
LiveCodeRunner processes all frontend files, strips TypeScript, applies syntax fixes, and concatenates them into a single HTML document. Projects with many files increase processing time.

**Fix:** Keep generated projects to 15-20 files or fewer. The Pro Generator (`client/src/lib/code-generator/pro-generator.ts`) is designed to limit output to this range. If previewing a large project, consider splitting it into smaller modules or previewing individual components.
