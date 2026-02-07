# AutoCoder - AI-Powered Code Generation Platform

A comprehensive, intelligent code generation platform that produces production-ready, full-stack React+Vite+TypeScript applications from natural language descriptions. Features a plan-driven generation pipeline with deep domain understanding across 14 industries, closed-loop auto-debugging, and comprehensive whitebox security scanning. Supports both web deployment on Replit and local Electron desktop app for Windows/Mac/Linux.

![AutoCoder Preview](https://img.shields.io/badge/AI-Powered-8b5cf6?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-22c55e?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Lines of Code](https://img.shields.io/badge/Lines-372K+-blue?style=for-the-badge)

---

## Platform Statistics

| Metric | Value |
|--------|-------|
| **Total Lines of Code** | 372,575+ |
| **Source Files** | 28,046 |
| **Server Modules** | 41 intelligence modules |
| **React Components** | 71 frontend components |
| **Domain Knowledge Profiles** | 14 industry domains |
| **Plan-Driven Generator** | 1,828 lines, 36 generator functions |
| **Deep Understanding Engine** | 662 lines, 5-level analysis pipeline |
| **Post-Generation Validator** | 601 lines, 50+ dependency packages |
| **Conversation Phase Handler** | 346 lines, 6-phase state machine |
| **Plan Generator** | 493 lines, structured ProjectPlan output |
| **Vite Error Fixer** | 829 lines, 11 error type analyzers |
| **Pro Generator (Client)** | 3,624 lines, template-based fallback |
| **Code Validator (Client)** | 955 lines, 15 checks + 8 auto-fixes |
| **LiveCodeRunner** | 1,263 lines, browser-based preview |
| **Auto-Run Preview** | 641 lines, closed-loop error detection |
| **Domain Knowledge Base** | 1,383 lines across 14 industries |
| **Electron Files** | 5 (desktop app support) |
| **Documentation Files** | 7 guides in docs/electron/ |

---

## What's New (Feb 2026)

### Plan-Driven Code Generation Pipeline (Major Upgrade)

AutoCoder has been upgraded from template-based generation to a fully intelligent, plan-driven system. The platform now deeply understands user requests, generates a detailed written plan for approval, and produces truly custom, production-ready, runnable React+Vite+TypeScript projects.

**Multi-Phase Conversation Flow:**
```
User Request -> Deep Understanding -> [Clarification (max 2 rounds)] -> Plan Generation
     -> User Approval -> Code Generation -> Post-Validation -> Auto-Fix
```

**Key Features:**
- **Deep Understanding Engine** - 5-level analysis: intent decomposition, multi-domain detection (top 2 blended if within 0.15 confidence), entity extraction with keyword inference, workflow detection, and clarification loops
- **14 Industry Domain Profiles** - Each with entities, workflows, roles, pages, KPIs, and integration points
- **Plan-First Approach** - Generates and presents a comprehensive ProjectPlan (tech stack, modules, data model, pages, API endpoints, workflows, user roles, file blueprints) for user review before any code is written
- **Natural Language Approval** - Users can approve, modify, or reject plans using natural language
- **Conversation Phase Management** - 6-phase state machine (initial -> understanding -> clarifying -> planning -> approval -> generating -> complete) with deadlock recovery
- **2-Round Clarification Limit** - Auto-proceeds with best assumptions after 2 rounds to prevent infinite loops
- **Phase Recovery** - Detects stuck conversations (generating without plan, clarifying without data) and restarts gracefully

### 14 Industry Domain Profiles

Each domain provides specialized entities, workflows, roles, pages, KPIs, and common integrations:

| Domain | ID | Key Entities | Workflows |
|--------|----|-------------|-----------|
| Consulting | `consulting` | Project, Milestone, Task, Timesheet, Client, Contract, Invoice | Project lifecycle, timesheet approval, billing |
| Manufacturing | `manufacturing` | Product, WorkOrder, Material, QualityCheck, Machine | Production pipeline, quality control |
| Healthcare | `healthcare` | Patient, Appointment, MedicalRecord, Doctor, Prescription | Patient flow, appointment scheduling |
| Retail | `retail` | Product, Order, Customer, Inventory, Promotion | Order fulfillment, inventory management |
| Education | `education` | Course, Lesson, Student, Assignment, Grade | Course enrollment, grading workflow |
| Real Estate | `realestate` | Property, Listing, Agent, Client, Transaction | Listing lifecycle, transaction pipeline |
| HR | `hr` | Employee, LeaveRequest, Department, Performance, Payroll | Leave approval, performance review |
| Restaurant | `restaurant` | MenuItem, Order, Table, Reservation, Staff | Order processing, table management |
| Fitness | `fitness` | Workout, Exercise, Member, Class, Trainer | Class booking, membership management |
| Logistics | `logistics` | Shipment, Route, Vehicle, Warehouse, Driver | Shipment tracking, route optimization |
| Finance | `finance` | Transaction, Budget, Account, Invoice, Report | Budget approval, reconciliation |
| Project Management | `project-management` | Project, Task, Sprint, Team, Milestone | Sprint planning, task workflow |
| CRM | `crm` | Contact, Lead, Deal, Pipeline, Activity | Lead qualification, deal pipeline |
| Inventory | `inventory` | Item, Warehouse, StockMovement, Supplier, PurchaseOrder | Stock replenishment, order fulfillment |

### Deep Understanding Engine

The 5-level analysis pipeline processes every user request:

1. **Intent Decomposition** - Extracts core intent, scope, complexity from natural language
2. **Domain Detection** - Matches against 14 industry profiles with confidence scoring; blends top 2 domains if within 0.15 confidence; falls back to generic if no domain matches
3. **Entity Extraction** - Domain-aware entity detection with keyword-based inference; context filtering to avoid irrelevant entities; entity caps (small=4, medium=8, large=12)
4. **Workflow Detection** - Identifies state machines, approval flows, and business processes from the domain
5. **Clarification Management** - Generates targeted questions when confidence is low; max 2 rounds with auto-proceed

### Plan-Driven Code Generator (36 Functions)

Generates complete, runnable React+Vite+TypeScript projects from approved plans:

**Configuration Files:**
- `package.json` with all required dependencies
- `tsconfig.json` and `tsconfig.node.json`
- `vite.config.ts` with React plugin
- `tailwind.config.js` with custom theming
- `postcss.config.js`

**Application Core:**
- `index.html` entry point
- `src/main.tsx` with React 18 createRoot + QueryClientProvider
- `src/App.tsx` with routing setup
- `src/index.css` with Tailwind directives and custom theme

**UI Components (10 Generated):**
- Button, Card, Input, Badge, Toaster (base components)
- Dialog, Select, Label, Textarea, Tabs (form/layout components)

**Backend:**
- `shared/schema.ts` - Drizzle ORM schema with all entities
- `server/db.ts` - Database connection setup
- `server/storage.ts` - IStorage interface with CRUD operations
- `server/routes.ts` - Express API endpoints
- `server/index.ts` - Server entry point

**Page Types:**
- **Dashboard** - KPI cards, charts, recent activity, overview
- **List Pages** - Data tables with create dialogs (form fields per entity), delete mutations with trash icons, status filter dropdowns, search
- **Detail Pages** - Full entity display with edit/delete functionality
- **Generic Pages** - Flexible layout for settings, profiles, etc.

**Shared Components:**
- DataTable - Reusable data table component
- KpiCard - Metrics display card
- StatusBadge - Dynamic status indicator

### Post-Generation Validator

Automatically validates all generated code after generation:

- **50+ Package Dependencies** - Validates imports against known package registry with versions
- **Implicit Dependency Detection** - Pattern-based detection for Recharts JSX, date-fns usage, framer-motion, react-hook-form, zodResolver
- **Smart Stub Generator** - Creates context-aware stubs: React components with JSX for `.tsx`, proper hook stubs, type exports, function exports
- **Runtime Pattern Validation** - Detects missing QueryClientProvider, duplicate `export default`, empty component returns
- **Cross-File Import Validation** - Ensures all imports reference files that exist in the generated project
- **Case-Insensitive Fallback** - Handles minor casing mismatches in exports

### Vite Error Auto-Fix (Closed-Loop Debugging)

**Client-Side Error Detection (`auto-run-preview.tsx`):**
- Monitors WebContainer preview via `postMessage` and regex pattern matching
- Detects 10+ error patterns from Vite build output
- Posts error details to backend auto-fix endpoint
- Applies returned fixes (patches, stubs, dependency additions)
- Refreshes preview automatically
- Max 3 retry attempts with UI badge indicators

**Server-Side Error Analysis (`vite-error-fixer.ts`, 11 Error Types):**

| Error Type | What It Fixes |
|------------|---------------|
| `missing_import` | Adds missing import statements |
| `missing_module` | Installs missing npm packages |
| `missing_file` | Creates stub files for missing references |
| `export_mismatch` | Fixes named/default export mismatches |
| `syntax` | Corrects common syntax errors |
| `reference_error` | Resolves undefined variable references |
| `jsx_error` | Fixes JSX-specific issues |
| `css_error` | Corrects CSS/Tailwind errors |
| `hook_violation` | Fixes React hook rule violations |
| `config` | Repairs Vite/TypeScript configuration issues |
| `dependency_conflict` | Resolves version conflicts |

### Conversation Phase Handler

6-phase state machine managing the full conversation lifecycle:

```
initial -> understanding -> clarifying -> planning -> approval -> generating -> complete
```

**Phase Recovery Mechanisms:**
- `generating` phase without plan data -> restart to `initial`
- `clarifying` phase without understanding data -> restart to `initial`
- Corrupted phase state -> graceful recovery with user notification
- 2-round clarification limit -> auto-proceed with best assumptions

### Contextual Understanding Engine (Client-Side)

The chatbot understands casual, conversational, non-technical user input without requiring prompt engineering expertise.

**Typo Tolerance (205+ corrections):**
- Handles common misspellings across all domains: "resturant", "recipies", "exersise", "fittness", "buisness", "budgit", "expences", "hosptial", "employes", "inventry", "playist", "ecomerce", "websit", and 190+ more
- Applied as the first step in normalization, before any domain detection runs

**Conversational Input Understanding:**
- Strips filler: "hey", "can you", "I want to", "help me make", "build me a"
- Expands vague language: "keep track of" -> "track manage dashboard", "something for" -> "app to"
- 12 intent phrase patterns: "track" -> dashboard, "sell" -> ecommerce, "share" -> social, "book" -> booking
- Domain-aware app naming

**Example prompts that work perfectly:**
```
"i wanna track my gym workouts"           -> FitTracker dashboard with Workout/Exercise models
"help me share recipies with frends"      -> RecipeHub social app with Recipe model
"something for my small bakery"           -> FoodSpot ecommerce with MenuItem/Order models
"keep track of my expences and budgit"    -> FinanceFlow dashboard with Transaction/Budget models
"can you make a thing to manage employes" -> TeamHub admin with Employee/LeaveRequest models
"build a consulting firm management app"  -> Full consulting platform with projects, timesheets, clients, billing
```

### Prompt Analysis Pipeline (Client-Side)
The `analyzePrompt` function runs a 6-stage pipeline:

```
User Input -> Typo Correction -> Conversational Stripping -> Synonym Expansion
     -> Domain Detection -> Intent Inference -> App Type Pattern Matching
```

### Pro Generator (Client-Side Template Fallback)
- **3,624 lines** of pure template-based code generation (zero API dependencies)
- Produces **15-20 clean JSX files** per project
- Compatible with browser-based Babel preview (LiveCodeRunner)
- Automatic validation pipeline via `code-validator.ts`
- Used as fallback when plan-driven pipeline is not active

### LiveCodeRunner (Browser Preview)
- Instant in-browser preview using Babel transpilation
- No npm install overhead for previews
- Handles multi-file React projects with import resolution
- Strips TypeScript types (nested generics up to 3 levels, `as Type` patterns)
- Runtime auto-fix for void elements and JSX issues

### GitHub Integration
- Secure authenticated pushes via Replit's GitHub connector (Octokit)
- Full tree replacement (no stale file accumulation)
- Parallel batch uploads with retry logic
- Auto token refresh, never cached

### Electron Desktop App
- esbuild-based build pipeline (`npm run build:electron`)
- Windows compatibility: `cross-env` for env vars, conditional `reusePort`
- Single command: `npm run electron:dev`
- Default port 5200 for generated projects and Electron local development
- Auto-run enabled: generated projects start automatically
- Generated project Vite configs use esbuild JSX for WebContainer compatibility

### Code Validator Fixes
- Void element auto-fixer respects JSX curly braces (no more `=> />` corruption)
- Dot-notation components (e.g., `TasksContext.Provider`) handled correctly
- Default export check skips entry/context/provider files
- React Router `<Link>` vs HTML `<link>` detection
- Missing container closing tags auto-inserted

---

## Intelligence Capabilities

### 1. Deep Understanding & Domain Intelligence
- **Deep Understanding Engine** - 5-level analysis pipeline with domain knowledge integration
- **14 Industry Domain Profiles** - Complete entity/workflow/role definitions per industry
- **Multi-Domain Blending** - Merges top 2 domains when confidence is close
- **Keyword-Based Entity Inference** - Falls back to keyword matching when no domain matches
- **Entity Caps** - Prevents over-generation: small=4, medium=8, large=12 entities
- **Contextual Understanding** - 205+ typo corrections, 17+ synonym mappings, 12 intent patterns
- **20 App Type Categories** - Dashboard, ecommerce, blog, portfolio, social, SaaS, todo, chat, CRM, analytics, booking, marketplace, CMS, game, calculator, form, landing, admin, API
- **Confidence Scoring** - Rates understanding from 0-1 for each request
- **Ambiguity Resolution** - Max 2 clarification rounds with auto-proceed

### 2. Plan Generation & Approval
- **Comprehensive Project Plans** - Tech stack, modules, data model, pages, APIs, workflows, roles
- **Plan Visualization** - Structured plan presented to user before code generation
- **Natural Language Modification** - Users can adjust plans conversationally
- **Phase State Machine** - 6-phase lifecycle with deadlock recovery

### 3. Code Generation
- **Plan-Driven Generator** - 36 generator functions producing custom TypeScript projects
- **Pro Generator (Fallback)** - 3,624-line template engine for 19 app types
- **Post-Generation Validation** - 50+ package checks, implicit dependency detection, smart stubs
- **Runtime Pattern Validation** - Missing providers, duplicate exports, empty components

### 4. Error Analysis & Auto-Fix
- **Vite Error Fixer** - 11 error type analyzers with fix generation
- **Closed-Loop Auto-Debugging** - Client detects errors -> backend analyzes -> fixes applied -> preview refreshes (3 retries)
- **Code Validator** - 15 checks + 8 auto-fix functions
- **Root Cause Analysis** - Traces errors to their source

### 5. Code Understanding & Memory
- **Structure Parsing** - Extracts imports, exports, hooks, state, props
- **Code Modification** - Safely edits existing code
- **Conversation History** - Tracks last 100 messages per session
- **Component Tracking** - Remembers all built components with aliases
- **User Preference Extraction** - Learns coding style preferences

### 6. Security & Testing
- **VAPT Dashboard** - Comprehensive vulnerability assessment and penetration testing
- **Whitebox Security Scanning** - Code-level vulnerability detection
- **Test Generation** - Automated test creation for generated code

### 7. Explanation & Teaching
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
|  |  |   Chat UI   | |  Preview    | |  VAPT Dashboard       |  |   |
|  |  |  + Input    | |  Panel      | |  + Security Scans     |  |   |
|  |  +-------------+ +-------------+ +-----------------------+  |   |
|  |  +-----------------------------------------------------------+  |
|  |  |  Plan-Driven Pipeline:                                      |  |
|  |  |  Understanding -> Plan -> Approval -> Generation -> Validate |  |
|  |  +-----------------------------------------------------------+  |
|  |  |  Fallback: Pro Generator -> Code Validator -> LiveCodeRunner |  |
|  |  +-----------------------------------------------------------+  |
|  +-------------------------------------------------------------+   |
|                                                                     |
|  +-------------------------------------------------------------+   |
|  |                   BACKEND (Express + Node.js)                |   |
|  |  +-----------------------------------------------------------+  |
|  |  |  Intelligence Modules (41)                                  |  |
|  |  |  * Deep Understanding Engine  * Plan Generator              |  |
|  |  |  * Plan-Driven Code Generator * Post-Generation Validator   |  |
|  |  |  * Conversation Phase Handler * Vite Error Fixer            |  |
|  |  |  * Domain Knowledge (14)      * VAPT Security Scanner       |  |
|  |  +-----------------------------------------------------------+  |
|  |  +-----------------------------------------------------------+  |
|  |  |  API Routes                                                |  |
|  |  |  * Conversations  * Messages  * Plan Generation             |  |
|  |  |  * Code Generation  * Auto-Fix  * VAPT  * GitHub Push       |  |
|  |  +-----------------------------------------------------------+  |
|  +-------------------------------------------------------------+   |
|                                                                     |
|  +-------------------------------------------------------------+   |
|  |  DATABASE (PostgreSQL + Drizzle ORM, optional in-memory)     |   |
|  |  * conversations, messages, projectFiles, projectPlans        |   |
|  |  * intelRecords, generationLogs, testResults, securityScans   |   |
|  |  * VAPT tables (assets, vulnerabilities, scans, schedules)    |   |
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
| Plan-Driven Generator | Custom TypeScript project generation from approved plans |
| Deep Understanding Engine | 5-level NLU with domain knowledge |
| Post-Generation Validator | Auto-validation with 50+ dependency checks |
| Vite Error Fixer | Closed-loop auto-debugging (11 error types) |
| Pro Generator | Template-based fallback (15-20 JSX files) |
| Code Validator | Auto-fix void elements, exports, JSX returns |
| LiveCodeRunner | Browser-based Babel preview (instant, no npm install) |
| WebContainer | In-browser Node.js runtime for full project preview |
| Electron | Desktop app (native file system, no limits) |

### Database
| Technology | Purpose |
|------------|---------|
| PostgreSQL | Primary Database (Neon-backed on Replit) |
| In-Memory | Fallback Storage (when DATABASE_URL not set) |

---

## Running Modes

AutoCoder supports three running modes:

### 1. Web Mode (Default - Replit)
```bash
npm run dev
```
- Runs Express + Vite on port 5000
- Uses WebContainer for full project preview with auto-run
- LiveCodeRunner as fallback for instant Babel-based preview
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
│       ├── components/              # 71 React Components
│       │   ├── ui/                  # shadcn/ui components
│       │   ├── chat-*.tsx           # Chat interface
│       │   ├── preview-panel.tsx    # Code preview + preview engines
│       │   ├── live-code-runner.tsx # Browser-based Babel preview engine
│       │   └── auto-run-preview.tsx # WebContainer preview with auto-fix
│       ├── lib/
│       │   ├── code-generator/      # Client-Side Code Generation
│       │   │   ├── pro-generator.ts     # Template generator (3,624 lines)
│       │   │   ├── code-validator.ts    # Auto-fix validation (955 lines)
│       │   │   ├── engine.ts            # Legacy engine
│       │   │   ├── saas-templates.ts    # SaaS templates
│       │   │   └── runnable-templates.ts # Runnable project templates
│       │   └── code-runner/         # Code Execution
│       │       ├── electron-runner.ts   # Electron IPC wrapper
│       │       ├── runner-factory.ts    # Auto-detect environment
│       │       └── webcontainer.ts      # WebContainer runtime
│       └── pages/                   # App Pages (landing, chat, vapt)
│
├── server/                          # Backend Application
│   ├── modules/                     # 41 Intelligence Modules
│   │   ├── deep-understanding-engine.ts    # 5-level NLU (662 lines)
│   │   ├── conversation-phase-handler.ts   # 6-phase state machine (346 lines)
│   │   ├── plan-generator.ts               # ProjectPlan creation (493 lines)
│   │   ├── plan-driven-generator.ts        # Code from plans (1,828 lines)
│   │   ├── post-generation-validator.ts    # Auto-validation (601 lines)
│   │   ├── domain-knowledge.ts             # 14 industry domains (1,383 lines)
│   │   ├── vite-error-fixer.ts             # Auto-fix engine (829 lines)
│   │   ├── complete-code-intelligence.ts   # Pattern intelligence
│   │   └── ...more modules
│   ├── routes.ts                    # API Endpoints
│   └── storage.ts                   # Database Operations (IStorage interface)
│
├── shared/
│   └── schema.ts                    # Database Schema (Drizzle, 266 lines)
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
│   ├── github-push.ts               # GitHub push (Replit connector)
│   └── build-electron.ts            # esbuild pipeline for Electron
│
├── dist-electron/                   # Compiled Electron output
│   ├── main.js                      # esbuild output (ESM)
│   └── preload.js                   # esbuild output (CJS)
│
├── docs/electron/                   # Electron documentation (7 guides)
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
- **Works offline** - Pattern-based and plan-driven generation

---

## Usage Examples

### Generate with Plan-Driven Pipeline
```
"Build a consulting firm management platform with project tracking, timesheets, and client billing"
```
The system will:
1. Analyze intent and detect the consulting domain
2. Extract relevant entities (Project, Milestone, Task, Timesheet, Client, Contract, Invoice)
3. Ask 0-2 clarifying questions
4. Generate a comprehensive plan showing all modules, pages, APIs, and data models
5. Wait for your approval
6. Generate a complete, runnable React+Vite+TypeScript project
7. Validate all code and fix any issues automatically

### Generate a Dashboard
```
"Create a modern analytics dashboard with real-time metrics, charts, and data filtering"
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

### Plan-Driven Generation Flow (Primary)

```
User Request --> Deep Understanding Engine --> Domain Detection --> Entity Extraction
     |                                              |
"Build a consulting     Matches 'consulting'    Extracts: Project, Task,
 management platform"   domain profile          Client, Timesheet, Invoice
     |                                              |
     v                                              v
Clarification (0-2 rounds) --> Plan Generator --> ProjectPlan
     |                              |
"Do you need billing?"      {techStack, modules, dataModel,
                             pages, endpoints, workflows, roles}
     |                              |
     v                              v
User Approval --> Plan-Driven Generator --> Post-Generation Validator
     |                    |                         |
"Looks good,         36 generator functions    50+ dependency checks,
 generate it"        produce complete project   smart stubs, runtime
                                                pattern validation
     |                                              |
     v                                              v
WebContainer Preview --> Auto-Fix Loop (max 3) --> Complete Project
```

### Template-Based Generation Flow (Fallback)

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
[src/App.tsx]                |
[src/...]              ~/AutoCoder/projects/my-app/
                             |
                     npm install (real npm)
                             |
                     npm run dev
                             |
                     Preview at localhost:5200
```

---

## Plan-Driven Generator Pipeline (Deep Dive)

The Plan-Driven Generator (`server/modules/plan-driven-generator.ts`) is a **1,828-line** code generation engine that converts approved `ProjectPlan` objects into complete, runnable React+Vite+TypeScript projects with full backend.

### `generateProjectFromPlan(plan: ProjectPlan): GeneratedFile[]`

Produces an array of `GeneratedFile` objects. Each file has `path` and `content` fields. The generator creates a complete, runnable project:

**36 Generator Functions:**

| Category | Functions | Output |
|----------|-----------|--------|
| Config | `generatePackageJson`, `generateViteConfig`, `generateTailwindConfig`, `generatePostcssConfig`, `generateTsConfig`, `generateTsConfigNode` | Build configuration |
| Entry | `generateIndexHtml`, `generateMainTsx`, `generateAppTsx`, `generateIndexCss` | Application entry points |
| UI Components | `generateUiButton`, `generateUiCard`, `generateUiInput`, `generateUiBadge`, `generateUiToaster`, `generateUiDialog`, `generateUiSelect`, `generateUiLabel`, `generateUiTextarea`, `generateUiTabs` | 10 reusable UI components |
| Utilities | `generateLibUtils`, `generateLibQueryClient`, `generateHookUseToast` | Shared utilities |
| Backend | `generateSchema`, `generateDb`, `generateStorageInterface`, `generateRoutes` | Full server with Drizzle ORM |
| Pages | `generatePageComponent`, `generateDashboardPage`, `generateListPage`, `generateDetailPage`, `generateGenericPage` | Domain-specific pages |
| Shared | `generateDataTable`, `generateKpiCard`, `generateStatusBadge` | Reusable display components |

### Page Generation Details

**List Pages Include:**
- Data table with all entity fields
- Create dialog with form fields (Label + Input per field)
- Delete mutation with trash icon and queryClient invalidation
- Status filter dropdown when entity has status field
- Search/filter functionality

**Detail Pages Include:**
- Full entity field display
- Edit functionality
- Delete with confirmation
- Related entity links

**Dashboard Pages Include:**
- KPI cards with domain-relevant metrics
- Charts (when recharts is available)
- Recent activity feed
- Quick action buttons

---

## Pro Generator Pipeline (Deep Dive - Client Fallback)

The Pro Generator (`client/src/lib/code-generator/pro-generator.ts`) is a **3,624-line** pure template-based code generation engine that converts natural language prompts into complete, multi-file React+Vite+Tailwind projects. It operates entirely without external API calls.

### `analyzePrompt(prompt: string): ProjectRequirements`

Parses natural language input through a **6-stage pipeline** to extract structured project requirements:

1. **Typo Correction** (205+ entries) - Fixes common misspellings before any matching
2. **Conversational Stripping** (5 patterns) - Removes filler phrases
3. **Synonym Expansion** (17+ mappings) - Expands vague language into specific terms
4. **Domain Detection** (12 industry profiles) - Matches against fitness, restaurant, recipe, finance, real estate, education, healthcare, travel, pet care, inventory, music, HR
5. **Intent Inference** (12 action-verb patterns) - "track" -> dashboard, "sell" -> ecommerce
6. **App Type Pattern Matching** (20 categories) - Final regex-based classification

### `generateProject(requirements: ProjectRequirements): GeneratedProject`

Produces 15-20 clean JSX files including package.json, Vite config, Tailwind config, HTML entry, React components, pages, and utilities.

---

## Code Validator Pipeline (Deep Dive)

The Code Validator (`client/src/lib/code-generator/code-validator.ts`) is a **955-line** validation and auto-fix engine that ensures generated code is syntactically correct and follows React best practices.

### 15 Validation Checks

| Check Function | What It Detects |
|----------------|-----------------|
| `checkBalancedBrackets` | Unmatched `(`, `)`, `{`, `}`, `[`, `]` with line number reporting |
| `checkBalancedQuotes` | Unclosed string literals (`'`, `"`, `` ` ``) |
| `checkStraySemicolons` | Semicolons in invalid positions |
| `checkEmptyImports` | Import statements with no specifiers |
| `checkUndefinedNaNInJsx` | Literal `undefined` or `NaN` rendered in JSX |
| `checkDefaultExport` | Missing `export default` (skips entry/context/provider files) |
| `checkComponentReturnsJsx` | React components that don't return JSX |
| `checkDuplicateDeclarations` | Multiple declarations with the same name |
| `checkVoidElements` | HTML void elements not self-closed in JSX |
| `checkClassVsClassName` | `class=` instead of `className=` |
| `checkHtmlFor` | `for=` instead of `htmlFor=` |
| `checkEventHandlerCasing` | Lowercase event handlers instead of camelCase |
| `checkKeyInMap` | Missing `key` prop in `.map()` rendered JSX |
| `checkCrossFileImports` | Imports referencing non-existent files |
| `checkPackageJson` | Valid JSON structure and required fields |

### 8 Auto-Fix Functions

| Fix Function | What It Corrects |
|--------------|------------------|
| `fixStraySemicolons` | Removes semicolons after `return (`, inside JSX, between `=>` and `{` |
| `fixDuplicateSemicolons` | Collapses `;;` or `;;;` into single `;` |
| `fixVoidElements` | Self-closes void HTML elements using depth-tracking JSX parser |
| `fixClassToClassName` | Replaces `class=` with `className=` in JSX |
| `fixForToHtmlFor` | Replaces `for=` with `htmlFor=` on label elements |
| `fixReactImportTypos` | Corrects misspelled React hook imports (13 typo mappings) |
| `fixMissingDefaultExport` | Adds `export default ComponentName;` |
| `fixUnclosedTags` | Closes unclosed JSX tags |

---

## LiveCodeRunner Technical Details (Deep Dive)

The LiveCodeRunner (`client/src/components/live-code-runner.tsx`) is a **1,263-line** browser-based preview engine that renders generated React projects instantly without any npm install or build step.

### Key Features
- **Backend File Filtering** - 15 backend path patterns excluded from preview
- **TypeScript Stripping** - Removes type annotations, interfaces, generics, `as` assertions
- **Import Mocking System** - 205+ mocked UI components, 60+ mocked Lucide icons, React Router v5/v6
- **Embedded Tailwind CSS** - ~500 utility classes compiled into preview
- **Babel Transpilation** - `@babel/standalone` from CDN for browser JSX
- **Blob URL Rendering** - Bypasses COEP/COI restrictions

---

## Database Schema Reference

All tables are defined in `shared/schema.ts` (266 lines) using Drizzle ORM's `pgTable` syntax. The database is PostgreSQL (Neon-backed on Replit) with an optional in-memory fallback.

### Core Tables

#### `users`
| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `varchar` (UUID) | PRIMARY KEY, default `gen_random_uuid()` |
| `username` | `text` | NOT NULL, UNIQUE |
| `password` | `text` | NOT NULL |

#### `conversations`
| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `serial` | PRIMARY KEY |
| `title` | `text` | NOT NULL |
| `createdAt` | `timestamp` | NOT NULL, default `CURRENT_TIMESTAMP` |
| `projectName` | `text` | nullable |
| `projectDescription` | `text` | nullable |
| `techStack` | `text[]` | nullable |
| `featuresBuilt` | `text[]` | nullable |
| `projectSummary` | `text` | nullable |
| `lastCodeGenerated` | `text` | nullable |
| `projectType` | `text` | nullable |
| `complexity` | `text` | nullable |
| `designStyle` | `text` | nullable |
| `colorPreferences` | `text[]` | nullable |
| `planGenerated` | `boolean` | default `false` |
| `securityScore` | `integer` | nullable |
| `testsPassed` | `integer` | nullable |
| `testsFailed` | `integer` | nullable |

#### `messages`
| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `serial` | PRIMARY KEY |
| `conversationId` | `integer` | NOT NULL, FK -> `conversations.id` (CASCADE) |
| `role` | `text` | NOT NULL (`user` or `assistant`) |
| `content` | `text` | NOT NULL |
| `createdAt` | `timestamp` | NOT NULL, default `CURRENT_TIMESTAMP` |

#### `projectFiles`
| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `serial` | PRIMARY KEY |
| `conversationId` | `integer` | NOT NULL, FK -> `conversations.id` (CASCADE) |
| `path` | `text` | NOT NULL |
| `content` | `text` | NOT NULL |
| `language` | `text` | NOT NULL |
| `createdAt` | `timestamp` | NOT NULL, default `CURRENT_TIMESTAMP` |
| `updatedAt` | `timestamp` | NOT NULL, default `CURRENT_TIMESTAMP` |

### Intelligence Tables

#### `projectPlans`
| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `serial` | PRIMARY KEY |
| `conversationId` | `integer` | NOT NULL, FK -> `conversations.id` (CASCADE) |
| `summary` | `text` | NOT NULL |
| `techStack` | `jsonb` | nullable |
| `architecture` | `text` | nullable |
| `folderStructure` | `text` | nullable |
| `designDecisions` | `jsonb` | nullable |
| `securityConsiderations` | `text[]` | nullable |
| `createdAt` | `timestamp` | NOT NULL, default `CURRENT_TIMESTAMP` |

#### `intelRecords`
| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `serial` | PRIMARY KEY |
| `conversationId` | `integer` | NOT NULL, FK -> `conversations.id` (CASCADE) |
| `type` | `text` | NOT NULL (preference, decision, pattern, mistake, context) |
| `category` | `text` | NOT NULL |
| `key` | `text` | NOT NULL |
| `value` | `text` | NOT NULL |
| `confidence` | `integer` | default `100` (0-100) |
| `source` | `text` | default `inferred` |
| `usageCount` | `integer` | default `0` |
| `createdAt` | `timestamp` | NOT NULL, default `CURRENT_TIMESTAMP` |

#### `testResults`
| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `serial` | PRIMARY KEY |
| `conversationId` | `integer` | NOT NULL, FK -> `conversations.id` (CASCADE) |
| `targetFile` | `text` | NOT NULL |
| `passed` | `integer` | default `0` |
| `failed` | `integer` | default `0` |
| `skipped` | `integer` | default `0` |
| `coverage` | `integer` | nullable (percentage) |
| `details` | `jsonb` | nullable |
| `createdAt` | `timestamp` | NOT NULL, default `CURRENT_TIMESTAMP` |

#### `securityScans`
| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `serial` | PRIMARY KEY |
| `conversationId` | `integer` | NOT NULL, FK -> `conversations.id` (CASCADE) |
| `score` | `integer` | NOT NULL (0-100) |
| `grade` | `text` | NOT NULL (A, B, C, D, F) |
| `issues` | `jsonb` | nullable |
| `passedChecks` | `text[]` | nullable |
| `createdAt` | `timestamp` | NOT NULL, default `CURRENT_TIMESTAMP` |

#### `generationLogs`
| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `serial` | PRIMARY KEY |
| `conversationId` | `integer` | NOT NULL, FK -> `conversations.id` (CASCADE) |
| `action` | `text` | NOT NULL |
| `targetFile` | `text` | nullable |
| `description` | `text` | NOT NULL |
| `linesChanged` | `integer` | nullable |
| `reasoning` | `text` | nullable |
| `assumptions` | `text[]` | nullable |
| `createdAt` | `timestamp` | NOT NULL, default `CURRENT_TIMESTAMP` |

### VAPT Tables

#### `vaptAssets`
Tracks assets under security assessment (web apps, APIs, servers, etc.).

#### `vaptVulnerabilities`
Records discovered vulnerabilities with severity, CVSS score, status, and remediation details.

#### `vaptScans`
Stores scan execution records with scan type, target, status, and findings.

#### `vaptSchedules`
Manages recurring scan schedules with cron-like scheduling configuration.

#### `vaptAuditLogs`
Immutable audit trail of all VAPT-related actions for compliance reporting.

#### `vaptTeamMembers`
Team member assignments and roles within the VAPT module.

---

## Full API Endpoint Reference

All API endpoints are defined in `server/routes.ts`. The server runs on Express.js and uses the `IStorage` interface for database operations.

### Conversations

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/conversations` | List all conversations |
| `POST` | `/api/conversations` | Create a new conversation |
| `GET` | `/api/conversations/:id` | Get conversation with messages |
| `DELETE` | `/api/conversations/:id` | Delete conversation (cascades) |
| `POST` | `/api/conversations/:id/messages` | Add user message |
| `POST` | `/api/conversations/:id/assistant-message` | Add assistant response |
| `PUT` | `/api/conversations/:id/context` | Update project context |

### Project Files

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/conversations/:id/files` | Get all project files |
| `POST` | `/api/conversations/:id/files` | Save a file |
| `DELETE` | `/api/conversations/:id/files` | Delete all files |
| `PUT` | `/api/files/:id` | Update a file |
| `DELETE` | `/api/files/:id` | Delete a file |
| `POST` | `/api/conversations/:id/files/bulk` | Bulk save files |

### AI / Code Generation

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/ai/understand` | Process input through NLU pipeline |
| `POST` | `/api/ai/edit` | Edit existing generated code |
| `POST` | `/api/ai/fix` | Auto-fix errors in generated code |
| `GET` | `/api/ai/status` | Get AI engine status |
| `POST` | `/api/ai/plan` | Generate a project plan |
| `POST` | `/api/ai/deep/generate` | Deep project generation |
| `POST` | `/api/ai/deep/generate-refined` | Refined generation with context |
| `POST` | `/api/conversations/:id/auto-fix` | Auto-fix runtime errors from preview |

### GitHub Integration

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/github/repos` | List user's GitHub repositories |
| `GET` | `/api/github/repos/:owner/:repo/contents` | Browse repository contents |
| `POST` | `/api/github/push` | Push project to GitHub |

### Preview System

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/preview/prepare/:id` | Prepare preview environment |
| `POST` | `/api/preview/start/:id` | Start preview dev server |
| `POST` | `/api/preview/stop` | Stop preview server |
| `GET` | `/api/preview/status` | Get preview status |

### Testing & Security

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/conversations/:id/test` | Run automated tests |
| `POST` | `/api/conversations/:id/security-scan` | Run security scan |

### VAPT

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/vapt/dashboard` | VAPT dashboard summary |
| `GET/POST` | `/api/vapt/assets` | List/register assets |
| `GET/PUT/DELETE` | `/api/vapt/assets/:id` | Manage asset |
| `GET/POST` | `/api/vapt/vulnerabilities` | List/record vulnerabilities |
| `GET/PUT/DELETE` | `/api/vapt/vulnerabilities/:id` | Manage vulnerability |
| `GET/POST` | `/api/vapt/scans` | List/initiate scans |
| `GET` | `/api/vapt/scans/:id` | Get scan results |
| `GET/POST` | `/api/vapt/schedules` | List/create schedules |
| `PUT/DELETE` | `/api/vapt/schedules/:id` | Manage schedule |
| `GET/POST` | `/api/vapt/team` | List/add team members |
| `PUT/DELETE` | `/api/vapt/team/:id` | Manage team member |
| `GET` | `/api/vapt/audit-logs` | Get audit trail |

---

## esbuild Pipeline Detail

The Electron build uses esbuild for fast, cross-platform compilation. The build script is at `scripts/build-electron.ts`.

### main.ts Compilation

```javascript
esbuild.build({
  entryPoints: ['electron/main.ts'],
  bundle: true,
  platform: 'node',
  target: 'node18',
  format: 'esm',
  outfile: 'dist-electron/main.js',
  external: ['electron'],
  sourcemap: true,
  banner: {
    js: `import { createRequire } from 'module';
         const require = createRequire(import.meta.url);`,
  },
});
```

### preload.ts Compilation

```javascript
esbuild.build({
  entryPoints: ['electron/preload.ts'],
  bundle: true,
  platform: 'node',
  target: 'node18',
  format: 'cjs',
  outfile: 'dist-electron/preload.js',
  external: ['electron'],
  sourcemap: true,
});
```

---

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License.
