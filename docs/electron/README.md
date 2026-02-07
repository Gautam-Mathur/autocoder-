# AutoCoder Electron Documentation

Complete documentation for the AutoCoder Electron desktop application.

## Platform Statistics (Feb 2026)

| Metric | Value |
|--------|-------|
| **Total Lines of Code** | 372,575+ |
| **Source Files** | 28,046 |
| **Server Modules** | 41 intelligence modules |
| **React Components** | 71 frontend components |
| **Domain Knowledge Profiles** | 14 industry domains |
| **Code Generation** | Plan-driven (1,828 lines) + Template fallback (3,624 lines) |
| **Electron Files** | 5 (main, preload, services) |

## Documentation Index

| Document | Description | Audience |
|----------|-------------|----------|
| [01-WHY-AND-HOW.md](./01-WHY-AND-HOW.md) | Why Electron was chosen and how the architecture works | Everyone |
| [02-DEVELOPERS-GUIDE.md](./02-DEVELOPERS-GUIDE.md) | Code structure, development workflow, and extending the app | Developers |
| [03-PROBLEMS-AND-SOLUTIONS.md](./03-PROBLEMS-AND-SOLUTIONS.md) | Predicted issues and how to solve them | Developers, Support |
| [04-RUNNING-GUIDE.md](./04-RUNNING-GUIDE.md) | Step-by-step setup and running instructions | Everyone |
| [05-USERS-GUIDE.md](./05-USERS-GUIDE.md) | How to use AutoCoder as an end user | End Users |
| [06-TESTERS-GUIDE.md](./06-TESTERS-GUIDE.md) | Test cases, verification steps, and QA procedures | QA Testers |

## Quick Start

```bash
# Install
npm install

# Build Electron (uses esbuild, not tsc)
npm run build:electron

# Run Electron desktop app (all-in-one)
npm run electron:dev

# Or for web-only mode:
npm run dev    # Opens at http://localhost:5000
```

## Build System

AutoCoder uses **esbuild** to compile Electron files (not `tsc`):

| Command | What it does |
|---------|-------------|
| `npm run build:electron` | Compiles `electron/main.ts` + `electron/preload.ts` to `dist-electron/` |
| `npm run electron:dev` | Builds Electron + launches desktop app |
| `npm run dev` | Web-only mode (Replit, port 5000) |

## Architecture Overview

```
+------------------------------------------------------------------+
|                      ELECTRON APPLICATION                          |
|                                                                    |
|  +-------------------------+    +------------------------------+  |
|  |      MAIN PROCESS       |    |     RENDERER PROCESS         |  |
|  |                         |    |                              |  |
|  |  * Local Runner Service |<-->|  * React Frontend            |  |
|  |  * File System I/O      |IPC |  * Plan-Driven Pipeline      |  |
|  |  * npm Operations       |    |  * Pro Generator (fallback)  |  |
|  |  * Dev Server Manager   |    |  * LiveCodeRunner            |  |
|  +-------------------------+    +------------------------------+  |
|                                                                    |
|                    +----------------------+                        |
|                    |  ~/AutoCoder/projects |                       |
|                    +----------------------+                        |
+------------------------------------------------------------------+
```

## Code Generation Modes

| Mode | Engine | Output | Preview |
|------|--------|--------|---------|
| **Plan-Driven** (Primary) | Deep Understanding + Plan Generator + Plan-Driven Generator | Complete React+Vite+TypeScript project with backend | WebContainer with auto-fix |
| **Template** (Fallback) | Pro Generator (3,624 lines) | 15-20 JSX files | LiveCodeRunner (Babel) |

## Key Benefits Over WebContainer

| Feature | WebContainer | Electron |
|---------|-------------|----------|
| File size limit | 16KB | Unlimited |
| npm speed | Slow | Native speed |
| Persistence | Lost on refresh | Permanent |
| System access | None | Full (sandboxed) |

## Windows Compatibility

- All npm scripts use `cross-env` for cross-platform environment variables
- Server auto-detects Windows and skips `reusePort` (prevents ENOTSUP)
- Close VS Code before running `npm install` (prevents EBUSY lock errors)
