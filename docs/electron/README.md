# AutoCoder Electron Documentation

Complete documentation for the AutoCoder Electron desktop application.

## Platform Statistics (Feb 2026)

| Metric | Value |
|--------|-------|
| **Source Lines of Code** | 121,000+ |
| **Source Files** | 225+ |
| **Server Modules** | 55 TypeScript modules (~47,000 lines) |
| **React Components** | 78 frontend components |
| **AI Intelligence Modules** | 13 specialized modules + Pipeline Orchestrator (16 stages) |
| **Domain Knowledge Profiles** | 14 industry domains |
| **Code Generation Quality** | 99% (A+ grade), 931/943 pts across 8 categories |
| **Pipeline Orchestrator** | 618 lines, coordinates 16 sequential stages |
| **Code Generation** | Plan-driven (2,628 lines) + Template fallback (3,624 lines) |
| **Test Suites** | 4 automated test files |
| **Electron Files** | 5 (main, preload, services) |

## AI Pipeline Architecture

The code generation pipeline operates as a **16-member AI development team**:

| Stage | Role | Lines | Purpose |
|-------|------|-------|---------|
| 1-3 | Management | Built-in | Scope validation, planning, review |
| 4 | Technical Analyst | 1,566 | Semantic analysis, entity relationships |
| 5 | System Architect | 457 | App pattern, folder structure, state management |
| 6 | UI/UX Designer | 696 | Domain-aware design system, color palette |
| 7 | Feature Analyst | 599 | Entity classification, feature mapping |
| 8 | Database Engineer | 553 | Schema design, indexes, constraints |
| 9 | API Architect | 566 | REST endpoints, validation, middleware |
| 10 | UI Engineer | 532 | Component tree, accessibility, hooks |
| 11 | Full-Stack Developer | 2,628 | Code generation (36 functions) |
| 12 | DevOps Engineer | 311 | Dependency management, bundle optimization |
| 13 | Code Reviewer | 462 | 8-category quality analysis, grading |
| 14 | QA Engineer | 1,214 | Vitest test generation |
| 15 | Release Engineer | 617 | Post-generation validation |
| 16 | Knowledge Manager | 834 | Pattern learning, error tracking |

## Documentation Index

| Document | Description | Audience |
|----------|-------------|----------|
| [01-WHY-AND-HOW.md](./01-WHY-AND-HOW.md) | Why Electron was chosen and how the architecture works | Everyone |
| [02-DEVELOPERS-GUIDE.md](./02-DEVELOPERS-GUIDE.md) | Code structure, development workflow, and extending the app | Developers |
| [03-PROBLEMS-AND-SOLUTIONS.md](./03-PROBLEMS-AND-SOLUTIONS.md) | Predicted issues and how to solve them | Developers, Support |
| [04-RUNNING-GUIDE.md](./04-RUNNING-GUIDE.md) | Step-by-step setup and running instructions | Everyone |
| [05-USERS-GUIDE.md](./05-USERS-GUIDE.md) | How to use AutoCoder as an end user | End Users |
| [06-TESTERS-GUIDE.md](./06-TESTERS-GUIDE.md) | Test cases, verification steps, and QA procedures | QA Testers |
| [07-TESTS-RUN.md](./07-TESTS-RUN.md) | Test execution results and reports | QA Testers |

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
|  |  * File System I/O      |IPC |  * Pipeline Orchestrator     |  |
|  |  * npm Operations       |    |    (16-stage AI team)        |  |
|  |  * Dev Server Manager   |    |  * 13 AI Intelligence Modules|  |
|  |  * Project Manager      |    |  * Pro Generator (fallback)  |  |
|  |  * Structured Logger    |    |  * LiveCodeRunner            |  |
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
| **Pipeline** (Primary) | 16-Stage Orchestrator: Understanding + Plan + 13 AI Modules + Generator + Validator | Complete React+Vite+TypeScript project with backend + tests | WebContainer with auto-fix |
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
