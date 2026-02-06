# AutoCoder Electron: Guide to Run and Make This Work

## Introduction

This guide provides step-by-step instructions to get AutoCoder running on your machine. It covers both **Web Mode** (Replit/browser-based) and **Electron Mode** (desktop application), across all platforms (Windows, macOS, Linux).

---

## Table of Contents

1. [System Requirements](#1-system-requirements)
2. [Quick Start (5 Minutes)](#2-quick-start-5-minutes)
3. [Web Mode (Replit) Detailed Setup](#3-web-mode-replit-detailed-setup)
4. [Electron Mode Detailed Setup](#4-electron-mode-detailed-setup)
5. [Development Mode Setup](#5-development-mode-setup)
6. [Production Build Steps](#6-production-build-steps)
7. [First Run Walkthrough](#7-first-run-walkthrough)
8. [Verification Checklist](#8-verification-checklist)
9. [LiveCodeRunner Verification Checklist](#9-livecoderunner-verification-checklist)
10. [Platform-Specific Notes](#10-platform-specific-notes)
11. [Common Setup Issues](#11-common-setup-issues)

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
| Display | Required for Electron mode (not needed for web mode) |
| PostgreSQL | Optional (app falls back to in-memory storage) |

### Checking Your Environment

```bash
# Check Node.js version
node --version
# Should output: v18.x.x or higher

# Check npm version
npm --version
# Should output: 8.x.x or higher

# Check if display is available (Linux/Mac - Electron mode only)
echo $DISPLAY
# Should output something like :0 or :1

# Check Git version (needed for Electron mode)
git --version
# Should output: git version 2.x.x or higher
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

### Step 3: Choose Your Mode

**Web Mode (Replit / Browser):**
```bash
npm run dev
# Opens at http://localhost:5000
```

**Electron Mode (Desktop App):**
```bash
# If port 5000 is already in use, run the server on 5100:
PORT=5100 npm run dev
# Then in another terminal:
npm run electron:dev
# Electron defaults to port 5100 for local dev
```

### Step 4: Verify It Works

1. The interface should load (browser or Electron window)
2. You should see the AutoCoder landing page
3. Click "Start Building" to navigate to the chat interface
4. Type "Create a hello world React app"
5. Watch code generation in real-time
6. Check the Preview tab for the LiveCodeRunner rendering

---

## 3. Web Mode (Replit) Detailed Setup

Web mode runs AutoCoder entirely in the browser via Replit. No Electron or desktop environment is required.

### Prerequisites

| Requirement | Details |
|-------------|---------|
| Node.js | 18.0.0 or higher (LTS recommended) |
| npm | 8.0.0 or higher (comes with Node.js) |
| PostgreSQL | Optional - falls back to in-memory storage if unavailable |
| Browser | Chrome, Firefox, Edge, or Safari (modern versions) |

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Optional | PostgreSQL connection string. If not set, the app falls back to in-memory storage. Data will not persist across restarts without a database. |
| `GITHUB_TOKEN` | Optional | GitHub personal access token for pushing generated projects to GitHub repositories. |
| `SESSION_SECRET` | Optional | Secret key for Express session management. A default is used if not provided. |
| `PORT` | Optional | Server port. Defaults to `5000` in web mode. |

**Setting environment variables (Replit):**
Environment variables are configured through Replit's Secrets panel. No `.env` file is needed.

**Setting environment variables (local development):**
```bash
# Option 1: Export before running
export DATABASE_URL="postgresql://user:password@localhost:5432/autocoder"
export GITHUB_TOKEN="ghp_your_token_here"
npm run dev

# Option 2: Inline
DATABASE_URL="postgresql://..." npm run dev
```

### Start Command

```bash
npm run dev
```

This runs `tsx server/index.ts` under the hood, which:

1. **Express server starts** - The backend API server initializes on port 5000
2. **Vite dev middleware attaches** - Vite's development middleware is mounted on the Express app, providing Hot Module Replacement (HMR) for the React frontend
3. **Database connection attempts** - If `DATABASE_URL` is set, connects to PostgreSQL; otherwise falls back to in-memory storage
4. **Server binds to port 5000** - The unified server (API + frontend) listens on `0.0.0.0:5000`

**Expected console output on successful start:**
```
express serving on port 5000
```

### Verify Web Mode Is Working

Follow these steps in order to confirm everything is operational:

**Step 1: Visit the landing page**
- Navigate to `https://your-repl.replit.dev/` (Replit) or `http://localhost:5000` (local)
- You should see the AutoCoder landing page with a hero section and "Start Building" button

**Step 2: Navigate to the chat interface**
- Click "Start Building" on the landing page
- The URL should change to `/chat`
- You should see the chat input area, file panel, and preview panel

**Step 3: Test code generation**
- Type a prompt like "build a todo app" in the chat input
- Press Enter or click the send button
- You should see the AI processing your request and generating code in real-time
- Code files will appear in the chat as code blocks

**Step 4: Check the Preview tab**
- Click on the Preview tab in the right panel
- The LiveCodeRunner should render the generated application
- You should see a fully functional preview of the generated app (not a blank iframe)

**Step 5: Check the files panel**
- Click on the Files tab in the panel
- You should see 15-20 generated JSX/TSX files depending on complexity
- Files include components like `App.tsx`, page components, and utility files
- Each file should have syntax-highlighted code when clicked

---

## 4. Electron Mode Detailed Setup

Electron mode runs AutoCoder as a native desktop application with enhanced capabilities.

### Prerequisites

| Requirement | Details |
|-------------|---------|
| Node.js | 18.0.0 or higher (LTS recommended) |
| npm | 8.0.0 or higher |
| Git | 2.x or higher |
| Display | X11/Wayland (Linux), native (macOS/Windows) |

### Setup Steps

**Step 1: Clone and install**
```bash
git clone https://github.com/Gautam-Mathur/autocoder-.git
cd autocoder-
npm install
```

**Step 2: Build Electron**
```bash
npm run build:electron
```

This uses **esbuild** (NOT tsc) to compile TypeScript. The build process:
- Compiles `electron/main.ts` to `dist-electron/main.js` (ESM format)
- Compiles `electron/preload.ts` to `dist-electron/preload.js` (CJS format)
- Generates source maps (`.js.map` files) for debugging

**Build output:**
```
dist-electron/
├── main.js          # ESM - Electron main process
├── main.js.map      # Source map for main process
├── preload.js       # CJS - Preload script (bridge between main and renderer)
└── preload.js.map   # Source map for preload
```

**Step 3: Start development mode**
```bash
npm run electron:dev
```

This command:
1. Builds the Electron code with esbuild
2. Starts the Express web server
3. Launches the Electron window pointing to the dev server
4. Dev URL: `http://localhost:5000`

**What you see:**
- A native desktop window opens at 1400x900 resolution
- The UI is identical to web mode but running inside an Electron shell
- The title bar shows "AutoCoder"

### Electron-Specific Features

These features are only available in Electron mode (not in web/Replit mode):

| Feature | Web Mode | Electron Mode |
|---------|----------|---------------|
| File writes | Limited (in-memory/16KB limit) | Native file system (no size limit) |
| npm install | Not available | Real npm install in generated projects |
| Dev server | LiveCodeRunner preview only | Native dev server with full HMR |
| Project storage | In-memory / database | `~/AutoCoder/projects/` on disk |
| File system access | Browser sandbox | Full native access |

### Alternative Manual Start

If `npm run electron:dev` doesn't work, you can start components separately:

```bash
# Terminal 1: Start the web server
npm run dev

# Terminal 2: Build and launch Electron
npm run build:electron
cross-env NODE_ENV=development npx electron dist-electron/main.js
```

---

## 5. Development Mode Setup

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

## 6. Production Build Steps

### Web Production Build

For deploying the web version (Replit or any hosting platform):

```bash
# Step 1: Build the React frontend and Express backend for production
npm run build

# Step 2: Start the production server
npm start
```

**What happens:**
- Vite bundles the React frontend into `dist/public/`
- The Express server serves static files from `dist/` instead of using Vite dev middleware
- No HMR - changes require a rebuild
- Server binds to port 5000 by default

### Electron Production Build

For creating distributable desktop applications:

```bash
# Step 1: Build React app for production
npm run build

# Step 2: Build Electron with esbuild
npm run build:electron

# Step 3: Package with electron-builder using the project config
npx electron-builder --config electron-builder.json
```

### Output Files

| Platform | Output File | Location |
|----------|-------------|----------|
| macOS | `AutoCoder-1.0.0.dmg` | `release/` |
| Windows | `AutoCoder Setup 1.0.0.exe` (NSIS installer) | `release/` |
| Linux | `AutoCoder-1.0.0.AppImage` | `release/` |

```
release/
├── AutoCoder-1.0.0.dmg           # macOS disk image
├── AutoCoder Setup 1.0.0.exe     # Windows NSIS installer
├── AutoCoder-1.0.0.AppImage      # Linux portable executable
└── builder-debug.yml             # Build log
```

### Building for Specific Platforms

```bash
# macOS only
npx electron-builder --config electron-builder.json --mac

# Windows only
npx electron-builder --config electron-builder.json --win

# Linux only
npx electron-builder --config electron-builder.json --linux
```

### Cross-Platform Building

To build for other platforms:

```bash
# Build for Windows on macOS
npx electron-builder --config electron-builder.json --win --x64

# Build for macOS on macOS (can't cross-compile macOS from other platforms)
npx electron-builder --config electron-builder.json --mac
```

Note: Building macOS apps requires a macOS machine.

---

## 7. First Run Walkthrough

### What Happens on First Run

1. **Server process starts**
   - Express server initializes
   - Vite dev middleware attaches (development) or static files are served (production)
   - In Electron mode: creates the application window (1400x900)

2. **Database connection (if configured)**
   - If `DATABASE_URL` is set, connects to PostgreSQL
   - If not set, falls back to in-memory storage (data lost on restart)

3. **Project directory is created (Electron mode)**
   - `~/AutoCoder/projects/` is created automatically
   - This is where all generated projects will be stored

4. **React app loads**
   - Landing page appears with "Start Building" call-to-action
   - Chat interface loads when navigating to `/chat`
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

**In Web Mode (Replit):**
- The LiveCodeRunner automatically renders the generated code in the Preview tab
- No manual "Run" step needed - the preview updates as code is generated

**In Electron Mode:**
Click the "Run" button in the preview panel. This triggers:
1. Files are written to `~/AutoCoder/projects/react-todo-app/`
2. npm install runs
3. Dev server starts
4. Preview shows the running app

**Step 4: View Your Project**

**Electron mode** - Open your file explorer:
```
~/AutoCoder/projects/react-todo-app/
├── package.json
├── src/
│   ├── App.tsx
│   └── main.tsx
├── node_modules/
└── ...
```

**Web mode** - Check the Files panel in the UI to browse generated files.

---

## 8. Verification Checklist

After setup, verify everything works:

### Core Functionality (Both Modes)

- [ ] Landing page loads at the root URL
- [ ] "Start Building" navigates to `/chat`
- [ ] React UI loads correctly with all panels visible
- [ ] Chat input accepts text and sends prompts
- [ ] Code generation produces output with multiple files
- [ ] Preview panel shows the LiveCodeRunner rendering
- [ ] Files panel lists all generated files
- [ ] Theme toggle (light/dark) works correctly

### Web Mode Specific

- [ ] Server starts on port 5000 without errors
- [ ] Vite HMR works (changes to client code reflect immediately)
- [ ] Database connects if `DATABASE_URL` is set
- [ ] App works without database (in-memory fallback)

### Electron Mode Specific

- [ ] Electron window opens at 1400x900
- [ ] Files are written to `~/AutoCoder/projects/`
- [ ] npm install completes for generated projects
- [ ] Native dev server starts for generated projects
- [ ] Preview shows running app from the native dev server

### File System (Electron Mode)

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
# - Electron main process (Electron mode only)
# - Generated project dev server (if running, Electron mode only)
```

---

## 9. LiveCodeRunner Verification Checklist

The LiveCodeRunner is the in-browser code execution engine that renders generated React applications directly in the Preview panel. This is the primary preview method in web mode and does not require a native dev server.

### Functionality Checklist

- [ ] **Preview iframe loads (not blank)** - The preview area should show rendered HTML content, not a white/empty frame. If blank, check the browser console for errors.
- [ ] **CSS styling renders correctly (Tailwind classes applied)** - Generated components should have proper styling. Buttons should have backgrounds, text should be properly sized, layouts should use flexbox/grid as expected.
- [ ] **Interactive elements work (buttons respond to clicks)** - Click buttons, toggle switches, and other interactive elements. They should respond with visual feedback and trigger their associated actions (e.g., adding a todo item).
- [ ] **React Router navigation works (if multi-page)** - If the generated app has multiple pages/routes, clicking navigation links should switch views without a full page reload.
- [ ] **Icons render (Lucide icons show as SVGs)** - Generated code often uses Lucide React icons. These should render as proper SVG icons, not as missing image placeholders or text.
- [ ] **Dark theme applied correctly** - If the generated app includes dark mode, the theme should apply consistently across all components. No white flashes or unstyled elements.
- [ ] **Refresh button in preview bar works** - The refresh/reload button in the preview toolbar should re-render the application from scratch without losing the generated code.
- [ ] **Error messages display when code has issues** - If the generated code has syntax errors or runtime exceptions, the preview should show a meaningful error message instead of silently failing or showing a blank screen.

### Troubleshooting LiveCodeRunner Issues

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| Blank preview | Code has syntax errors | Check the error panel for compilation errors |
| Styles missing | Tailwind not processing | Verify the generated code includes proper class names |
| Icons not showing | Lucide import missing | Check that icon imports are present in generated files |
| Buttons don't respond | Event handlers missing | Review the generated code for onClick/onChange handlers |
| Router not working | Missing Router wrapper | Ensure App component wraps routes in a Router provider |
| Preview stuck loading | Infinite loop in code | Check for useEffect loops or infinite re-renders |

---

## 10. Platform-Specific Notes

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

## 11. Common Setup Issues

### Issue: "Cannot find module 'tsx'"

**Cause:** Dependencies not installed or corrupted `node_modules`.

**Solution:**
```bash
npm install
```

If that doesn't work, do a clean reinstall:
```bash
rm -rf node_modules
npm install
```

---

### Issue: "EADDRINUSE port 5000"

**Cause:** Another process is already using port 5000.

**Solution:**
```bash
# Find what's using port 5000
lsof -i :5000     # macOS/Linux
netstat -ano | findstr :5000   # Windows

# Kill the process
kill -9 <PID>     # macOS/Linux
taskkill /PID <PID> /F   # Windows

# Or change the port
PORT=3000 npm run dev
```

---

### Issue: "Database connection failed"

**Cause:** `DATABASE_URL` is set but the database is unreachable.

**Solution:**
```bash
# Option 1: Fix the database connection
# Verify your DATABASE_URL is correct
echo $DATABASE_URL
# Should look like: postgresql://user:password@host:5432/dbname

# Option 2: Remove DATABASE_URL to use in-memory storage
unset DATABASE_URL
npm run dev
# The app works fully without a database - data just won't persist across restarts
```

---

### Issue: "WebContainer not supported"

**Cause:** Some browsers or environments don't support WebContainers.

**This is expected behavior.** The LiveCodeRunner is the primary preview method and does not depend on WebContainers. WebContainer support is optional and used only as a secondary execution environment.

**What to do:** Use the LiveCodeRunner preview tab. It works in all modern browsers without WebContainer support.

---

### Issue: "Electron window blank"

**Cause:** The web server isn't running when Electron tries to load the UI.

**Solution:**
```bash
# Make sure the web server is running on port 5000 first
npm run dev

# Wait until you see "express serving on port 5000" in the console
# Then start Electron in a separate terminal
npm run build:electron
cross-env NODE_ENV=development npx electron dist-electron/main.js
```

If using `npm run electron:dev`, the script should handle this automatically. If the window is still blank:
1. Close the Electron window
2. Wait 5 seconds for the server to fully initialize
3. Re-run `npm run electron:dev`

---

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

| Action | Command |
|--------|---------|
| Install dependencies | `npm install` |
| Start web mode (dev) | `npm run dev` |
| Build Electron | `npm run build:electron` |
| Start Electron (dev) | `npm run electron:dev` |
| Build web for production | `npm run build` |
| Start web production | `npm start` |
| Build desktop app | `npm run build && npm run build:electron && npx electron-builder --config electron-builder.json` |
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
   - Open `~/AutoCoder/projects/` in your IDE (Electron mode)
   - Use the Files panel in the UI (Web mode)
   - Modify and extend the generated code

3. **Read the other documentation:**
   - Developer's Guide for code changes
   - Problems and Solutions for troubleshooting
