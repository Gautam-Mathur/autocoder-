# AutoCoder - AI-Powered Code Generation Platform

A comprehensive, intelligent code generation platform that produces production-ready, full-stack React applications. Features 7 advanced AI-like capabilities operating 100% locally with zero external API dependencies. Supports both web deployment on Replit and local Electron desktop app for Windows/Mac/Linux.

![AutoCoder Preview](https://img.shields.io/badge/AI-Powered-8b5cf6?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-22c55e?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Lines of Code](https://img.shields.io/badge/Lines-93K+-blue?style=for-the-badge)

---

## Platform Statistics

| Metric | Value |
|--------|-------|
| **Total Lines of Code** | 93,000+ |
| **Source Files** | 390+ |
| **AI Intelligence Modules** | 7 |
| **Code Generator** | Pro Generator (15-20 clean JSX files per project) |
| **Preview Engine** | LiveCodeRunner (browser-based Babel, instant preview) |
| **SaaS Templates** | 10+ complete stacks |
| **Runnable Templates** | 20+ instant projects |
| **Code Patterns** | 500+ |
| **Error Pattern Recognizers** | 10+ |
| **Synonym Mappings** | 40+ |
| **Domain Contexts** | 8 |

---

## What's New (Feb 2026)

### Pro Generator
- Replaced deep-project-generator with **Pro Generator** for all code paths
- Produces **15-20 clean JSX files** per project (instead of 149 TypeScript files)
- Compatible with browser-based Babel preview (LiveCodeRunner)
- Automatic validation pipeline via `code-validator.ts`

### LiveCodeRunner (Browser Preview)
- Instant in-browser preview using Babel transpilation
- No npm install overhead for previews
- Handles multi-file React projects with import resolution
- Strips TypeScript types, resolves relative imports

### GitHub Integration
- Secure authenticated pushes via Replit's GitHub connector (Octokit)
- Full tree replacement (no stale file accumulation)
- Parallel batch uploads with retry logic
- Auto token refresh, never cached

### Electron Desktop App
- esbuild-based build pipeline (`npm run build:electron`)
- Windows compatibility: `cross-env` for env vars, conditional `reusePort`
- Single command: `npm run electron:dev`

### Code Validator Fixes
- Void element auto-fixer respects JSX curly braces (no more `=> /&gt;` corruption)
- Dot-notation components (e.g., `TasksContext.Provider`) handled correctly
- Default export check skips entry/context/provider files

---

## 7 Advanced AI-Like Capabilities

All intelligence operates 100% locally with zero external API dependencies.

### 1. Natural Language Understanding (NLU)
- **Semantic Parsing** - Understands intent beyond keywords
- **40+ Synonym Mappings** - "webpage" = "site" = "page" = "landing"
- **8 Domain Contexts** - E-commerce, blog, social, dashboard, portfolio, SaaS, mobile, API
- **Ambiguity Handling** - Asks clarifying questions when requests are unclear
- **Confidence Scoring** - Rates understanding from 0-1 for each request

### 2. Reasoning Engine
- **Problem Decomposition** - Breaks complex tasks into manageable subtasks
- **Dependency Analysis** - Identifies what must be built first
- **Conflict Detection** - Spots incompatible requirements
- **Effort Estimation** - Calculates complexity scores (1-10)

### 3. Context Memory
- **Conversation History** - Tracks last 100 messages per session
- **Component Tracking** - Remembers all built components with aliases
- **Alias Resolution** - "the button" -> ButtonComponent
- **User Preference Extraction** - Learns coding style preferences

### 4. Error Analysis & Self-Correction
- **10+ Error Pattern Recognizers** (MODULE_NOT_FOUND, TYPE_ERROR, SYNTAX_ERROR, REACT_HOOKS_ERROR, etc.)
- **Root Cause Analysis** - Traces errors to their source
- **Auto-Fix Generation** - Provides confidence-scored fixes

### 5. Code Understanding
- **Structure Parsing** - Extracts imports, exports, hooks, state, props
- **Code Modification** - Safely edits existing code
- **Refactoring Support** - Extract components, add types, optimize performance

### 6. Creative Problem Solving
- **Novel Solution Generation** - Multiple approaches per problem
- **Pattern Combination** - Merges known patterns creatively
- **Pros/Cons Analysis** - Evaluates each solution

### 7. Explanation Generation
- **Code Explanations** - Line-by-line understanding
- **Concept Teaching** - Explains programming concepts
- **Best Practices** - Teaches industry standards

---

## System Architecture

```
+-------------------------------------------------------------------+
|                         AUTOCODER PLATFORM                          |
+-------------------------------------------------------------------+
|                                                                     |
|  +-------------------------------------------------------------+   |
|  |                   FRONTEND (React + TypeScript)              |   |
|  |  +-------------+ +-------------+ +-----------------------+  |   |
|  |  |   Chat UI   | |  Preview    | |  VS Code-like IDE     |  |   |
|  |  |  + Input    | |  Panel      | |  + Terminal           |  |   |
|  |  +-------------+ +-------------+ +-----------------------+  |   |
|  |  +-----------------------------------------------------------+  |
|  |  |  Pro Generator --> Code Validator --> LiveCodeRunner        |  |
|  |  |  (15-20 JSX)      (auto-fix)         (Babel preview)       |  |
|  |  +-----------------------------------------------------------+  |
|  +-------------------------------------------------------------+   |
|                                                                     |
|  +-------------------------------------------------------------+   |
|  |                   BACKEND (Express + Node.js)                |   |
|  |  +-----------------------------------------------------------+  |
|  |  |  Server Modules (20+)                                      |  |
|  |  |  * Pro Generator integration   * Complete Intelligence     |  |
|  |  |  * VAPT Security Scanner       * Context Memory            |  |
|  |  +-----------------------------------------------------------+  |
|  |  +-----------------------------------------------------------+  |
|  |  |  API Routes                                                |  |
|  |  |  * Conversations  * Messages  * Code Generation            |  |
|  |  |  * VAPT Scanning  * GitHub Push                            |  |
|  |  +-----------------------------------------------------------+  |
|  +-------------------------------------------------------------+   |
|                                                                     |
|  +-------------------------------------------------------------+   |
|  |  DATABASE (PostgreSQL + Drizzle ORM, optional in-memory)     |   |
|  +-------------------------------------------------------------+   |
+-------------------------------------------------------------------+
```

---

## Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 | UI Framework |
| TypeScript | Type Safety |
| Vite | Build Tool |
| Tailwind CSS | Styling |
| shadcn/ui | UI Components |
| TanStack Query | Server State |
| Wouter | Routing |
| Framer Motion | Animations |

### Backend
| Technology | Purpose |
|------------|---------|
| Express.js | Web Framework |
| Node.js | Runtime |
| Drizzle ORM | Database ORM |
| Zod | Validation |
| WebSocket | Real-time |

### Code Generation & Preview
| Technology | Purpose |
|------------|---------|
| Pro Generator | Multi-file React project generation (15-20 JSX files) |
| Code Validator | Auto-fix void elements, exports, JSX returns |
| LiveCodeRunner | Browser-based Babel preview (instant, no npm install) |
| Electron | Desktop app (native file system, no limits) |
| WebContainer | In-browser Node.js fallback |

### Database
| Technology | Purpose |
|------------|---------|
| PostgreSQL | Primary Database |
| In-Memory | Fallback Storage (when DATABASE_URL not set) |

---

## Running Modes

AutoCoder supports three running modes:

### 1. Web Mode (Default - Replit)
```bash
npm run dev
```
- Runs Express + Vite on port 5000
- Uses LiveCodeRunner for instant browser-based preview
- No file system limitations for preview (Babel-based)
- Best for cloud development on Replit

### 2. Electron Development Mode (Local Windows/Mac/Linux)
```bash
# Single command:
npm run electron:dev

# This builds Electron files with esbuild, then launches the desktop app
```
- Runs as desktop app
- Uses native file system (no limits)
- Full npm install and dev server for generated projects
- Projects saved to `~/AutoCoder/projects/`

### 3. Production Desktop Build
```bash
# Build the React app + Electron
npm run build
npm run build:electron
npx electron-builder
```
- Creates .exe (Windows), .dmg (Mac), .AppImage (Linux)
- Full offline capability

---

## Project Structure

```
autocoder/
├── client/                          # Frontend Application
│   └── src/
│       ├── components/              # React Components
│       │   ├── ui/                  # shadcn/ui components
│       │   ├── chat-*.tsx           # Chat interface
│       │   ├── preview-panel.tsx    # Code preview + LiveCodeRunner
│       │   └── live-code-runner.tsx # Browser-based Babel preview engine
│       ├── lib/
│       │   ├── code-generator/      # Code Generation Engine
│       │   │   ├── pro-generator.ts     # Main generator (15-20 JSX files)
│       │   │   ├── code-validator.ts    # Auto-fix validation pipeline
│       │   │   ├── engine.ts            # Legacy engine
│       │   │   ├── saas-templates.ts    # SaaS templates
│       │   │   └── runnable-templates.ts # Runnable project templates
│       │   └── code-runner/         # Code Execution
│       │       ├── electron-runner.ts   # Electron IPC wrapper
│       │       ├── runner-factory.ts    # Auto-detect environment
│       │       └── webcontainer.ts      # WebContainer fallback
│       └── pages/                   # App Pages (landing, chat, vapt)
│
├── server/                          # Backend Application
│   ├── modules/                     # 20+ Server Modules
│   │   ├── complete-code-intelligence.ts  # Pattern intelligence
│   │   ├── deep-project-generator.ts      # Legacy generator
│   │   └── ...more modules
│   ├── routes.ts                    # API Endpoints (uses Pro Generator)
│   └── storage.ts                   # Database Operations (IStorage interface)
│
├── electron/                        # Electron Desktop App
│   ├── main.ts                      # Main process (ESM)
│   ├── preload.ts                   # IPC bridge (CommonJS)
│   ├── tsconfig.json                # TypeScript config (main)
│   ├── tsconfig.preload.json        # TypeScript config (preload, CJS)
│   └── services/
│       ├── local-runner.ts          # File system & npm operations
│       ├── project-manager.ts       # Workspace management
│       └── logger.ts                # File-based logging with rotation
│
├── scripts/
│   ├── github-push.ts               # GitHub push (Replit connector, full tree replace)
│   └── build-electron.ts            # esbuild pipeline for Electron
│
├── dist-electron/                   # Compiled Electron output
│   ├── main.js                      # esbuild output (ESM -> CJS)
│   └── preload.js                   # esbuild output (CJS)
│
├── shared/
│   └── schema.ts                    # Database Schema (Drizzle pgTable)
│
├── docs/electron/                   # Electron documentation (6 guides)
├── electron-builder.json            # Desktop build config
└── package.json                     # All npm scripts
```

---

## NPM Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `npm run dev` | `cross-env NODE_ENV=development tsx server/index.ts` | Start web dev server (port 5000) |
| `npm run build` | `tsx script/build.ts` | Build React + Express for production |
| `npm start` | `cross-env NODE_ENV=production node dist/index.cjs` | Run production build |
| `npm run check` | `tsc` | TypeScript type checking |
| `npm run db:push` | `drizzle-kit push` | Sync database schema |
| `npm run build:electron` | `tsx scripts/build-electron.ts` | Compile Electron files with esbuild |
| `npm run electron:dev` | `build:electron && electron dist-electron/main.js` | Build + launch Electron desktop app |

---

## Environment Variables

All environment variables are **optional**:

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | No | PostgreSQL connection (uses in-memory if not set) |
| `OPENAI_API_KEY` | No | OpenAI API key (uses local engine if not set) |
| `SESSION_SECRET` | No | Session encryption key |
| `PORT` | No | Server port (defaults to 5000) |

---

## Getting Started

### Quick Start (Replit - Web Mode)
```bash
npm run dev
# Open http://localhost:5000
```

### Quick Start (Local - Electron Desktop)
```bash
# Clone the repository
git clone https://github.com/Gautam-Mathur/autocoder-.git
cd autocoder-

# Install dependencies
npm install

# Run Electron desktop app
npm run electron:dev
```

### Zero Configuration Required
- **No API keys needed** - All intelligence is local
- **No database required** - Uses in-memory storage by default
- **Works offline** - Pattern-based generation

---

## Usage Examples

### Generate a Landing Page
```
"Create a modern landing page for a fintech startup with hero, features, pricing, and testimonials"
```

### Build a Full SaaS
```
"Build a complete project management SaaS with user auth, task boards, team collaboration, and analytics"
```

### Get Code Explanation
```
"Explain how React useEffect cleanup functions work"
```

### Fix an Error
```
"Error: Cannot read property 'map' of undefined in my React component"
```

---

## How It Works

### Code Generation Flow (Pro Generator)

```
User Request --> NLU Parser --> Pro Generator --> Code Validator --> LiveCodeRunner
     |                              |                  |                  |
"Create a todo app"          Generates 15-20      Auto-fixes         Browser-based
                             clean JSX files     void elements,     Babel preview
                                                 exports, returns    (instant)
```

### Execution Flow (Electron Desktop)

```
Generated Files --> IPC --> Main Process --> Local File System
     |                          |
[package.json]          fs.writeFileSync()
[src/App.jsx]                |
[src/...]              ~/AutoCoder/projects/my-app/
                             |
                     npm install (real npm)
                             |
                     npm run dev
                             |
                     Preview at localhost:3000
```

---

## GitHub Integration

AutoCoder includes a built-in GitHub push system:

- Uses **Replit's GitHub connector** for secure OAuth token management
- **Full tree replacement** - pushes exactly what's in the workspace, no stale files
- **Parallel batch uploads** with retry logic (handles rate limits)
- **Auto token refresh** - never caches stale credentials
- Run with: `npx tsx scripts/github-push.ts`

---

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Preview not loading | Check if dev server is running, check console for errors |
| Files not appearing | Check `~/AutoCoder/projects/` directory (Electron mode) |
| npm install timeout | Check internet connection, retry |
| Windows EBUSY error | Close VS Code, delete node_modules, run `npm install` again |
| Windows ENOTSUP (reusePort) | Already fixed - server auto-detects Windows |

### Debug Mode

```bash
# Run with verbose logging
DEBUG=* npm run electron:dev
```

---

## Windows-Specific Notes

- Uses `cross-env` for all npm scripts (no Unix-only syntax)
- Server conditionally skips `reusePort` on Windows (prevents ENOTSUP error)
- Electron build uses esbuild (fast, cross-platform)
- Run Electron directly: `npm run electron:dev`

---

## License

MIT License - feel free to use this for personal or commercial projects.

## Author

Created by [Gautam Mathur](https://github.com/Gautam-Mathur)

---

<p align="center">
  <strong>93,000+ lines of code</strong> | <strong>390+ files</strong> | <strong>7 AI capabilities</strong> | <strong>100% Local</strong>
</p>

<p align="center">
  Built with passion using Replit Agent
</p>
