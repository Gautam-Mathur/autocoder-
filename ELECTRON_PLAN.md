# AutoCoder Electron Desktop App - Implementation Plan

## Overview

AutoCoder runs as both a web application (Express + React on Replit) and an Electron desktop app for Windows/Mac/Linux. The desktop mode provides native file system access, real npm, and persistent project storage. The code generation is powered by two engines: a cloud-based 16-stage Pipeline Orchestrator coordinating 13 specialized AI modules, and a fully local AI engine with 8 custom-built subsystems and 394 templates that runs without any external API dependencies.

## Current Status (Feb 2026)

All items completed:

- [x] Electron main process + preload script
- [x] esbuild-based build pipeline (`scripts/build-electron.ts`)
- [x] IPC bridge for file I/O, npm install, dev server (12 channels)
- [x] Runner factory (auto-detects Electron vs browser)
- [x] Windows compatibility (cross-env, conditional reusePort)
- [x] Single command: `npm run electron:dev`
- [x] electron-builder config for Win/Mac/Linux packaging
- [x] 16-stage Pipeline Orchestrator with quality gates (cloud)
- [x] 13 specialized AI intelligence modules (cloud)
- [x] Local AI Engine with 8 subsystems (no external LLM dependencies)
- [x] 16-stage Local Pipeline (55-95ms execution, 92-94/100 quality)
- [x] 394 templates across 8 categories with smart token-based matching
- [x] Template Registry with O(1) token index lookups
- [x] Code quality grading (A+ through F) with 8-category analysis
- [x] Automated Vitest test generation for generated projects
- [x] Generation pattern learning with PostgreSQL storage
- [x] Continuous learning brain recording outcomes for future improvement
- [x] Interactive iterative editing (Project Context Manager + Targeted Code Editor)
- [x] Conversation Phase Handler with 'editing' phase and edit history persistence
- [x] Frontend edit notifications with color-coded file icons
- [x] Edit cascade detection (schema -> API -> components)
- [x] Compound color resolution (36 color variants via COMPOUND_COLOR_MAP + resolveColor())
- [x] Semantic bg-class handling (bg-background, bg-card) + Tailwind shade patterns
- [x] Edit history persistence via `editHistory` jsonb column in conversations schema
- [x] Smart file targeting scanning user messages for page/component names
- [x] Full E2E testing (API + Playwright) confirmed all editing features

### Platform Scale
- 64 server modules + 8 template files (~55,600 lines of server-side TypeScript)
- 78 React frontend components
- 148,000+ total source lines across 246 files
- 13 cloud AI intelligence modules + Pipeline Orchestrator (16 stages)
- 8 local AI subsystems + Local Pipeline Router (16 stages)
- 394 templates across 8 categories
- 23,624 lines in Local AI subsystem (engine + templates)
- 2,982 lines in Interactive Editing system (3 modules)
- 14 industry domain profiles + 30 template domain profiles
- 94/100 local pipeline quality (cloud: 99% A+ grade)

## Why Electron?

| Problem with WebContainer | Solution with Electron |
|---------------------------|------------------------|
| 16KB file write limit | Native file system - no limits |
| Virtual npm (slow, limited) | Real npm - full speed |
| Browser memory constraints | Native memory management |
| Lost state on refresh | Persistent local storage |
| Can't access local tools | Full system access |

**Note:** The web mode now uses **LiveCodeRunner** (browser-based Babel preview) which eliminates the 16KB limitation for previews. Electron is still preferred for full project builds with real npm.

**Local AI Advantage**: The fully local AI engine (no cloud dependencies) is especially valuable in Electron desktop mode where users may not have internet access. The local engine generates production-ready code in 55-95ms using 394 built-in templates and 8 deterministic subsystems.

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
|  |  |  Project Manager  |  |    |  |   AI Engines           |  |  |
|  |  |  * Workspace mgmt |  |    |  |   * Cloud (13 modules) |  |  |
|  |  +-------------------+  |    |  |   * Local (8 subsys)   |  |  |
|  |                         |    |  |   * 394 templates      |  |  |
|  +-------------------------+    |  +------------------------+  |  |
|                                 +------------------------------+  |
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

## Code Generation Engines

### Cloud Pipeline (13 AI Modules)
Requires internet and optional API keys (OpenAI, Google AI). Coordinates 13 specialized modules through a 16-stage pipeline orchestrator for deep semantic analysis, domain-aware design, and context-aware code generation. Best for complex, novel applications requiring advanced reasoning.

### Local AI Engine (Fully Offline)
Runs entirely on-device with zero external dependencies. 8 custom-built subsystems (TF-IDF, rule engine, scoring, templates, graph analysis, vector embeddings, intent parser, knowledge synthesizer) execute a 16-stage pipeline in 55-95ms. Uses 394 built-in templates across 8 categories for knowledge-driven generation. Best for rapid prototyping, offline development, and standard application patterns.

| Feature | Cloud Pipeline | Local Engine |
|---------|---------------|--------------|
| Internet Required | Yes | No |
| API Keys | Optional (OpenAI, Google) | None |
| Execution Time | Seconds | 55-95ms |
| Quality Score | 99% (A+) | 92-94/100 |
| Pipeline Stages | 16 | 16 |
| Templates | N/A (dynamic) | 394 across 8 categories |
| Best For | Complex/novel apps | Rapid prototyping, offline |
| Learning | PostgreSQL + file | PostgreSQL + file |

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
├── server/
│   ├── modules/
│   │   ├── local-ai-engine.ts          # Core engine (8 subsystems, 1,420 lines)
│   │   ├── template-registry.ts        # Smart template matching (275 lines)
│   │   ├── knowledge-stages.ts         # Stages 1,2,4,5,6,9,11 (998 lines)
│   │   ├── deterministic-stages.ts     # Stages 3,7,8,10,12,13 (1,160 lines)
│   │   ├── generation-stages.ts        # Stages 14,15 (957 lines)
│   │   ├── learning-stage.ts           # Stage 16 (372 lines)
│   │   ├── local-pipeline-router.ts    # Pipeline orchestration (543 lines)
│   │   ├── project-context-manager.ts  # File indexing & dependency graphs (595 lines)
│   │   ├── targeted-code-editor.ts     # Surgical file edits, 6 types, compound colors (1,660 lines)
│   │   ├── conversation-phase-handler.ts # 8-phase flow + editing (727 lines)
│   │   └── ... (55+ other modules)
│   └── templates/
│       ├── app-archetypes.ts           # 104 app pattern templates
│       ├── domain-profiles.ts          # 30 domain knowledge profiles
│       ├── architecture-patterns.ts    # 15 architecture references
│       ├── schema-templates.ts         # 40 database schema templates
│       ├── api-templates.ts            # 30 API route templates
│       ├── ui-component-templates.ts   # 50 UI component specs
│       ├── code-snippets.ts            # 100 code implementation patterns
│       └── test-patterns.ts            # 25 test generation patterns
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

## Windows Compatibility

- All npm scripts use `cross-env` for cross-platform environment variables
- Server auto-detects Windows and skips `reusePort` (prevents ENOTSUP)
- Close VS Code before running `npm install` (prevents EBUSY lock errors)
