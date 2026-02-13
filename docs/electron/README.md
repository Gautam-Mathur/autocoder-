# AutoCoder Electron Documentation

Complete documentation for the AutoCoder Electron desktop application.

## Platform Statistics (Feb 2026)

| Metric | Value |
|--------|-------|
| **Source Lines of Code** | 149,000+ |
| **Source Files** | 233+ |
| **Server Modules** | 64 TypeScript modules + 8 template files (~55,500 lines) |
| **React Components** | 71 frontend components |
| **Cloud AI Modules** | 13 specialized modules + Pipeline Orchestrator (16 stages) |
| **Local AI Engine** | 8 subsystems + 16-stage pipeline (23,624 lines) |
| **Interactive Editing** | 2,872 lines across 3 modules |
| **Template Library** | 394 templates across 8 categories |
| **Domain Knowledge** | 14 industry domains + 30 template domain profiles |
| **Cloud Pipeline Quality** | 99% (A+ grade), 931/943 pts across 8 categories |
| **Local Pipeline Quality** | 92-94/100 score, 55-95ms execution |
| **Local Pipeline Output** | 24-27 files, 746-889 lines, 39-45 tests per project |
| **Code Generation** | Plan-driven (2,628 lines) + Template fallback (3,624 lines) |
| **Learning Patterns** | 1,021+ patterns across 9 categories |
| **Electron Files** | 5 (main, preload, services) |

## Dual AI Architecture

AutoCoder features two independent code generation engines:

### Cloud Pipeline (Internet Required)
The cloud-based pipeline coordinates 13 specialized AI modules through a 16-stage orchestrator:

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

### Local AI Engine (Fully Offline)
The local engine runs entirely on-device without any cloud AI or neural network dependencies:

| Stage | Name | Type | Score |
|-------|------|------|-------|
| 1 | Intent Interpreter | AI + Rules | 89/100 |
| 2 | Strategic Planner | AI + Rules | 83/100 |
| 3 | Constraint Analyzer | Deterministic | 100/100 |
| 4 | Semantic Domain Modeler | AI + Rules | 80/100 |
| 5 | Architecture Synthesizer | AI + Rules | 100/100 |
| 6 | Adaptive UX Designer | AI + Rules | 85/100 |
| 7 | Feature Interaction Graph | Deterministic | 95/100 |
| 8 | Database Intelligence | Deterministic | 100/100 |
| 9 | API Designer | AI + Rules | 100/100 |
| 10 | Component Mapper | Deterministic | 100/100 |
| 11 | Code Synthesizer | AI + Rules | 100/100 |
| 12 | Dependency Optimizer | Deterministic | 85/100 |
| 13 | Static Auditor | Deterministic | 96/100 |
| 14 | Test Generator | AI + Rules | 100/100 |
| 15 | Runtime Simulator | AI + Rules | 100/100 |
| 16 | Learning Brain | AI + Rules | 90/100 |

**8 Core Subsystems**: TF-IDF Pattern Matcher, Rule-Based Reasoning Engine, Multi-Criteria Scoring Engine, Template Selection System (394 templates), Graph Analysis Engine, 384-Dimensional Vector Embeddings, Intent Parser, Knowledge Synthesizer.

**Template Library**: 104 App Archetypes, 30 Domain Profiles, 15 Architecture Patterns, 40 Schema Templates, 30 API Templates, 50 UI Components, 100 Code Snippets, 25 Test Patterns.

### Interactive Iterative Editing
Post-generation conversational editing system (2,872 lines across 3 modules):

| Module | Lines | Purpose |
|--------|-------|---------|
| Project Context Manager | 595 | File indexing, import/export tracking, dependency graphs |
| Targeted Code Editor | 1,550 | Surgical edits for 6 types: style, content, structure, feature, fix, refactor |
| Conversation Phase Handler | 727 | 8-phase conversation flow with 'editing' phase and edit history |

Features: Edit cascade detection (schema changes propagate to API/components), edit history persistence (last 50 entries), conversation context (last 6 messages) for intent classification, error-to-chat routing for conversational fixing.

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
|  |  * File System I/O      |IPC |  * Cloud Pipeline (13 mods)  |  |
|  |  * npm Operations       |    |  * Local AI Engine (8 sub)   |  |
|  |  * Dev Server Manager   |    |  * 394 Templates             |  |
|  |  * Project Manager      |    |  * Learning Brain            |  |
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
| **Cloud Pipeline** (Primary) | 16-Stage Orchestrator: 13 AI Modules + Generator + Validator | Complete React+Vite+TS project with backend + tests | WebContainer with auto-fix |
| **Local Pipeline** (Offline) | 16-Stage Local Engine: 8 Subsystems + 394 Templates | 24-27 files, 746-889 lines, 39-45 tests | WebContainer or Electron |
| **Template** (Fallback) | Pro Generator (3,624 lines) | 15-20 JSX files | LiveCodeRunner (Babel) |

## Key Benefits Over WebContainer

| Feature | WebContainer | Electron |
|---------|-------------|----------|
| File size limit | 16KB | Unlimited |
| npm speed | Slow | Native speed |
| Persistence | Lost on refresh | Permanent |
| System access | None | Full (sandboxed) |
| Offline mode | Limited | Full (Local AI Engine) |

## Local AI API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/local-pipeline/run` | POST | Execute full 16-stage local pipeline |
| `/api/local-pipeline/stages` | GET | Get stage definitions and metadata |
| `/api/local-ai/parse-intent` | POST | Parse natural language into structured intent |
| `/api/local-ai/search-similar` | POST | Semantic similarity search across knowledge base |
| `/api/local-ai/stats` | GET | Learning stats + template library stats |
| `/api/local-ai/feedback` | POST | Record user feedback for pipeline improvement |

## Windows Compatibility

- All npm scripts use `cross-env` for cross-platform environment variables
- Server auto-detects Windows and skips `reusePort` (prevents ENOTSUP)
- Close VS Code before running `npm install` (prevents EBUSY lock errors)
