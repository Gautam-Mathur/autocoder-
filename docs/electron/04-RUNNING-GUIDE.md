# AutoCoder Electron: Guide to Run and Make This Work

## Introduction

This guide provides step-by-step instructions to get AutoCoder Electron running on your machine. It covers all platforms (Windows, macOS, Linux) and different use cases.

---

## Table of Contents

1. [System Requirements](#1-system-requirements)
2. [Quick Start (5 Minutes)](#2-quick-start-5-minutes)
3. [Development Mode Setup](#3-development-mode-setup)
4. [Production Build Setup](#4-production-build-setup)
5. [First Run Walkthrough](#5-first-run-walkthrough)
6. [Verification Checklist](#6-verification-checklist)
7. [Platform-Specific Notes](#7-platform-specific-notes)
8. [Common Setup Issues](#8-common-setup-issues)

---

## 1. System Requirements

### Minimum Requirements

| Component | Requirement |
|-----------|-------------|
| Operating System | Windows 10+, macOS 10.15+, Ubuntu 20.04+ |
| Node.js | 18.0.0 - 22.x (NOT v24+, use LTS versions) |
| npm | 8.0.0 or higher |
| RAM | 4GB minimum, 8GB recommended |
| Disk Space | 2GB for app + space for projects |
| Display | Required (Electron needs GUI) |

### Checking Your Environment

```bash
# Check Node.js version
node --version
# Should output: v18.x.x or higher

# Check npm version
npm --version
# Should output: 8.x.x or higher

# Check if display is available (Linux/Mac)
echo $DISPLAY
# Should output something like :0 or :1
```

---

## 2. Quick Start (5 Minutes)

The fastest way to get AutoCoder running:

### Step 1: Clone the Repository

```bash
git clone https://github.com/Gautam-Mathur/autocoder-.git
cd autocoder-
```

### Step 2: Install Dependencies

```bash
npm install
```

This installs:
- React frontend dependencies
- Express backend dependencies
- Electron and electron-builder

**Verify Installation:**
```bash
# Check Node.js version (must be 18+, 20+ recommended)
node --version

# Check Electron is installed
npm list electron
# Should show: electron@40.x.x or similar
```

**Windows Users:** If using PowerShell, you may need to run as Administrator for global packages.

### Step 3: Run Electron Desktop App

```bash
# All-in-one command (builds Electron with esbuild + launches):
npm run electron:dev
```

This automatically:
1. Compiles `electron/main.ts` and `electron/preload.ts` with esbuild
2. Launches the Electron desktop app
3. Connects to the web server at localhost:5000

**Alternative (manual steps):**
```bash
# Build Electron separately
npm run build:electron

# Then launch
cross-env NODE_ENV=development npx electron dist-electron/main.js
```

### Step 5: Verify It Works

1. The Electron window should open
2. You should see the AutoCoder interface
3. Type "Create a hello world React app"
4. Click Run
5. Check `~/AutoCoder/projects/` for the generated files

---

## 3. Development Mode Setup

Development mode is for making changes to the codebase.

### Directory Structure After Setup

```
autocoder/
├── node_modules/           # Dependencies (created by npm install)
├── dist-electron/          # Compiled Electron output (esbuild)
│   ├── main.js             # From electron/main.ts
│   ├── main.js.map
│   ├── preload.js          # From electron/preload.ts
│   └── preload.js.map
├── electron/               # Electron source (TypeScript)
├── client/                 # React frontend source
├── server/                 # Express backend source
└── scripts/                # Build scripts (build-electron.ts, github-push.ts)
```

### Development Workflow

```
+-------------------------------------------------------------+
|                     DEVELOPMENT CYCLE                        |
+-------------------------------------------------------------+
|                                                              |
|  1. Make changes to code                                     |
|     - React (client/src/)     -> Auto hot-reload             |
|     - Express (server/)       -> Auto restart                |
|     - Electron (electron/)    -> Run: npm run build:electron |
|                                                              |
|  2. If you changed Electron code:                            |
|     $ npm run build:electron                                 |
|     -> Close and reopen Electron window                      |
|                                                              |
|  3. Test your changes                                        |
|                                                              |
|  4. Repeat                                                   |
+-------------------------------------------------------------+
```

### Starting Fresh

If something goes wrong:

```bash
# Stop all processes (Ctrl+C)

# Clear caches
rm -rf node_modules
rm -rf dist-electron

# Reinstall and rebuild
npm install
npm run build:electron

# Run again
npm run electron:dev
```

---

## 4. Production Build Setup

Production build creates distributable applications.

### Building for All Platforms

```bash
# Step 1: Build React app for production
npm run build

# Step 2: Build Electron with esbuild
npm run build:electron

# Step 3: Package with electron-builder
npx electron-builder
```

### Output Location

```
release/
├── AutoCoder-1.0.0.dmg           # macOS
├── AutoCoder Setup 1.0.0.exe     # Windows
├── AutoCoder-1.0.0.AppImage      # Linux
└── builder-debug.yml             # Build log
```

### Building for Specific Platforms

```bash
# macOS only
npx electron-builder --mac

# Windows only
npx electron-builder --win

# Linux only
npx electron-builder --linux
```

### Cross-Platform Building

To build for other platforms:

```bash
# Build for Windows on macOS
npx electron-builder --win --x64

# Build for macOS on macOS (can't cross-compile macOS from other platforms)
npx electron-builder --mac
```

Note: Building macOS apps requires a macOS machine.

---

## 5. First Run Walkthrough

### What Happens on First Run

1. **Electron main process starts**
   - Creates application window
   - Loads React frontend from localhost:5000 (dev) or bundled files (prod)

2. **Project directory is created**
   - `~/AutoCoder/projects/` is created automatically
   - This is where all generated projects will be stored

3. **React app loads**
   - Chat interface appears
   - Code generator engine initializes

### Your First Project

**Step 1: Generate Code**

In the chat input, type:
```
Create a simple React todo app with add and delete functionality
```

Click "Run" or press Enter.

**Step 2: Watch the Generation**

The AI will:
- Parse your request
- Generate code files
- Display them in the preview

**Step 3: Run the Generated Code**

Click the "Run" button in the preview panel. This triggers:
1. Files are written to `~/AutoCoder/projects/react-todo-app/`
2. npm install runs
3. Dev server starts
4. Preview shows the running app

**Step 4: View Your Project**

Open your file explorer:
```
~/AutoCoder/projects/react-todo-app/
├── package.json
├── src/
│   ├── App.tsx
│   └── main.tsx
├── node_modules/
└── ...
```

---

## 6. Verification Checklist

After setup, verify everything works:

### Core Functionality

- [ ] Electron window opens
- [ ] React UI loads correctly
- [ ] Chat input accepts text
- [ ] Code generation produces output
- [ ] Files are written to disk
- [ ] npm install completes
- [ ] Dev server starts
- [ ] Preview shows running app

### File System

```bash
# Check project directory was created
ls ~/AutoCoder/projects/
# Should list any projects you've created

# Check a generated project
ls ~/AutoCoder/projects/[project-name]/
# Should contain package.json, src/, etc.
```

### Process Check

```bash
# Check for running Node processes
ps aux | grep node

# Should see:
# - Vite dev server (npm run dev)
# - Electron main process
# - Generated project dev server (if running)
```

---

## 7. Platform-Specific Notes

### Windows

**Running Electron on Windows:**
```cmd
REM Single command (works in CMD, PowerShell, or Git Bash):
npm run electron:dev
```

**EBUSY Error During npm install:**
If you get `EBUSY` errors:
1. Close VS Code completely (it locks Electron files)
2. Close all terminals in the project folder
3. Run:
```cmd
rmdir /s /q node_modules
npm install
```

**Important Notes:**
- All npm scripts use `cross-env` for Windows compatibility
- Server auto-detects Windows and skips `reusePort` (prevents ENOTSUP)
- Windows Firewall may prompt on first run - allow Node.js access

### macOS

**Permissions:**
```bash
# Make scripts executable
chmod +x scripts/*.sh
```

**Gatekeeper:**
- First run may require: System Preferences → Security → Open Anyway
- Or right-click → Open

**M1/M2 Macs:**
- Native ARM support
- Use Node.js arm64 version

### Linux

**Display Server:**
```bash
# Check DISPLAY is set
echo $DISPLAY

# If empty, you may need:
export DISPLAY=:0
```

**Dependencies:**
```bash
# Ubuntu/Debian
sudo apt-get install build-essential libgtk-3-0 libnotify4 libnss3 libxss1 libxtst6 xdg-utils libatspi2.0-0 libsecret-1-0

# Fedora
sudo dnf install gtk3 libnotify nss libXScrnSaver
```

---

## 8. Common Setup Issues

### Issue: Electron Build Errors

**Note:** AutoCoder uses **esbuild** (not tsc) to build Electron. Run:
```bash
npm run build:electron
```

If this fails, ensure dependencies are installed:
```bash
npm install
npm run build:electron
```

**Full Reset:**
```bash
rm -rf node_modules
rm -rf dist-electron
npm cache clean --force
npm install
npm run build:electron
```

---

### Issue: "electron: command not found"

**Solution:**
```bash
# Electron is a local dependency, use npx
npx electron dist-electron/main.js

# Or just use the npm script:
npm run electron:dev
```

### Issue: "Cannot find module 'electron'"

**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

### Issue: White screen in Electron

**Solution:**
```bash
# Make sure web server is running first
npm run dev

# Wait for "serving on port 5000" before starting Electron
./scripts/electron-dev.sh
```

### Issue: "EACCES: permission denied"

**Solution:**
```bash
# Create the projects directory manually
mkdir -p ~/AutoCoder/projects

# Check permissions
chmod 755 ~/AutoCoder/projects
```

### Issue: npm install fails

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

### Issue: "display" or "screen" errors on Linux

**Solution:**
```bash
# Ensure X server is running
# If using SSH, you need X forwarding:
ssh -X user@host

# Or use xvfb for headless:
xvfb-run ./scripts/electron-dev.sh
```

---

## Quick Reference Commands

| Action | All Platforms |
|--------|--------------|
| Install dependencies | `npm install` |
| Build Electron | `npm run build:electron` |
| Start web server only | `npm run dev` |
| Start Electron (dev) | `npm run electron:dev` |
| Build desktop app | `npm run build && npm run build:electron && npx electron-builder` |
| Push to GitHub | `npx tsx scripts/github-push.ts` |
| Clean install | Delete `node_modules/` then `npm install` |
| View project files (Mac/Linux) | `ls ~/AutoCoder/projects/` |
| View project files (Windows) | `dir %USERPROFILE%\AutoCoder\projects` |

---

## Next Steps

After successfully running AutoCoder:

1. **Try generating different projects:**
   - "Create a blog with markdown support"
   - "Build an e-commerce product page"
   - "Make a dashboard with charts"

2. **Explore the generated code:**
   - Open `~/AutoCoder/projects/` in your IDE
   - Modify and extend the generated code

3. **Read the other documentation:**
   - Developer's Guide for code changes
   - Problems and Solutions for troubleshooting
