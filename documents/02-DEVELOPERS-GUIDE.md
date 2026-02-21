# Developer's Guide

## Project Structure

```
autocoder/
  client/                              # Frontend (React 18 + TypeScript)
    src/
      components/                      # Reusable UI components
        ui/                            # Base shadcn/ui components (20+ files)
          button.tsx                    # Button variants with loading states
          card.tsx                      # Card containers
          dialog.tsx                    # Modal dialogs
          dropdown-menu.tsx            # Dropdown menus
          input.tsx                     # Text inputs
          label.tsx                     # Form labels
          select.tsx                    # Select dropdowns
          textarea.tsx                 # Multi-line text input
          toast.tsx                     # Toast notifications
          tabs.tsx                      # Tab navigation
          badge.tsx                     # Status badges
          checkbox.tsx                 # Checkboxes
          progress.tsx                 # Progress bars
          scroll-area.tsx              # Scrollable containers
          separator.tsx                # Visual separators
          sheet.tsx                     # Slide-out panels
          sidebar.tsx                  # Sidebar layout component
          skeleton.tsx                 # Loading skeletons
          tooltip.tsx                  # Tooltips
        auto-run-preview.tsx           # Live preview panel with WebContainer
        chat-input.tsx                 # Chat message input with attachments
        chat-message.tsx               # Individual chat message rendering
        code-block.tsx                 # Syntax-highlighted code display
        code-preview.tsx               # Code file preview with tabs
        code-runner.tsx                # Code execution interface
        deployment-panel.tsx           # GitHub push and export UI
        dev-guide.tsx                  # Developer guidance component
        empty-state.tsx                # Empty state illustrations
        error-fixer-panel.tsx          # Auto-fix error interface
        execution-status.tsx           # Build/run status display
        file-panel.tsx                 # File explorer sidebar
        github-import.tsx              # GitHub repository import
        IntelligencePanel.tsx          # AI intelligence display
        live-code-runner.tsx           # Real-time code execution
        LogViewer.tsx                  # Structured log viewer
        preview-panel.tsx              # Preview container
        project-summary.tsx            # Project plan summary display
        terminal.tsx                   # Terminal emulator
        theme-provider.tsx             # Dark/light theme provider
        theme-toggle.tsx               # Theme switch button
        thinking-steps.tsx             # AI reasoning step display
        vite-preview.tsx               # Vite dev server preview
        vscode-ide.tsx                 # VS Code-style editor panel
      hooks/
        use-mobile.tsx                 # Mobile detection hook
        use-toast.ts                   # Toast notification hook
      lib/
        code-generator/                # Client-side code generation (26,243 lines)
          index.ts                     # Module exports
          engine.ts                    # Core generation engine (1,766 lines)
          templates.ts                 # 394 template definitions (3,391 lines)
          runnable-templates.ts        # Executable template variants (2,840 lines)
          saas-templates.ts            # SaaS-specific templates (4,330 lines)
          pro-generator.ts             # Professional code generator (3,624 lines)
          fullstack-generator.ts       # Full-stack app generator (2,823 lines)
          ai-fullstack-generator.ts    # AI-enhanced generator (122 lines)
          advanced-intelligence.ts     # Advanced AI capabilities (1,717 lines)
          code-brain.ts                # Code pattern brain (1,836 lines)
          code-validator.ts            # Client-side validation (959 lines)
          content-synthesizer.ts       # Content generation (972 lines)
          creativity-module.ts         # Creative variations (531 lines)
          debug-module.ts              # Debug utilities (1,170 lines)
          domain-templates.ts          # Domain-specific templates (762 lines)
          knowledge-base.ts            # Knowledge patterns (1,079 lines)
          learning-module.ts           # Client learning (368 lines)
          multi-language-templates.ts  # Multi-language support (829 lines)
          smart-enhancer.ts            # Smart code enhancements (589 lines)
          webapp-knowledge.ts          # Web app domain knowledge (814 lines)
          auto-tester.ts               # Automated testing (617 lines)
        code-runner/                   # Code execution runtime (10,497 lines)
          index.ts                     # Module exports
          webcontainer.ts              # WebContainer management (1,670 lines)
          auto-runner.ts               # Auto-run with error detection (1,070 lines)
          auto-fix-engine.ts           # Runtime auto-fix (431 lines)
          error-fixer.ts               # Error pattern matching (326 lines)
          logger.ts                    # Structured logging (342 lines)
          zip-export.ts                # Zip file generation (445 lines)
          deployment-guide.ts          # Deployment instructions (768 lines)
          electron-runner.ts           # Electron runtime bridge (260 lines)
          execution-manager.ts         # Execution lifecycle (572 lines)
          runner-factory.ts            # Runtime factory pattern (133 lines)
          ai-context.ts                # AI context for runner (341 lines)
          code-formatter.ts            # Code formatting (396 lines)
          collaboration.ts             # Collaboration features (361 lines)
          mobile-preview.ts            # Mobile device preview (330 lines)
          offline-mode.ts              # Offline capabilities (298 lines)
          progress-estimator.ts        # Build progress estimation (350 lines)
          template-customizer.ts       # Template customization (621 lines)
          test-generator.ts            # Test file generation (215 lines)
          test-runner.ts               # Test execution (367 lines)
          version-history.ts           # Version tracking (331 lines)
          vulnerability-scanner.ts     # Security scanning (437 lines)
        queryClient.ts                 # TanStack Query configuration
        utils.ts                       # Shared utilities (cn, formatting)
      pages/
        landing.tsx                    # Landing page with feature showcase
        chat.tsx                       # Main chat interface (primary workspace)
        vapt-dashboard.tsx             # VAPT security dashboard
        not-found.tsx                  # 404 error page
      App.tsx                          # Root component with Wouter routing
      main.tsx                         # Application entry point
      index.css                        # Global styles with CSS variables

  server/                              # Backend (Express + TypeScript ESM)
    index.ts                           # Server entry point and bootstrap
    routes.ts                          # All API endpoints (6,162 lines)
    storage.ts                         # Storage interface + implementations (901 lines)
    vite.ts                            # Vite dev server integration (DO NOT MODIFY)
    modules/                           # AI & code generation modules (70 files, 60,858 lines)
      # === CodeGen V2 Engine ===
      codegen-orchestrator.ts          # CodeGen V2 pipeline coordinator (978 lines)
      codegen-components.ts            # Component library with dependency tracking
      codegen-field-resolver.ts        # Smart field-to-component mapping
      codegen-page-builder.ts          # Composable page generation
      codegen-validator.ts             # Post-generation validation with auto-fix
      codegen-e2e-test.ts              # End-to-end test suite (3 scenarios)
      # === Pipeline ===
      pipeline-orchestrator.ts         # 16-stage pipeline with quality gates (746 lines)
      plan-driven-generator.ts         # Plan-driven code generation (2,771 lines)
      local-pipeline-router.ts         # Local pipeline routing
      deterministic-stages.ts          # Deterministic stage implementations
      generation-stages.ts             # Stage definitions and metadata
      # === AI Modules (13 specialized) ===
      design-system-engine.ts          # Design tokens, colors, typography (696 lines)
      architecture-planner.ts          # App patterns, folder structure (457 lines)
      functionality-engine.ts          # Entity features, CRUD specs (599 lines)
      schema-designer.ts               # Database schema design (553 lines)
      api-designer.ts                  # API route design (566 lines)
      component-composer.ts            # Component tree composition (532 lines)
      code-quality-engine.ts           # Quality scoring, issue detection (462 lines)
      dependency-resolver.ts           # Package resolution, optimization (311 lines)
      domain-synthesis-engine.ts       # Domain detection, entity extraction (696 lines)
      adaptive-clarification-engine.ts # Complexity assessment, questions (598 lines)
      test-generator.ts                # Test file generation (1,214 lines)
      deep-understanding-engine.ts     # Intent decomposition (804 lines)
      plan-generator.ts                # Project plan generation (500 lines)
      # === Local AI Engine ===
      local-ai-engine.ts               # Fully offline AI engine (1,419 lines)
      domain-knowledge.ts              # 14-industry domain library
      # === Learning ===
      generation-learning-engine.ts    # Learning engine with patterns (1,183 lines)
      # === Conversation ===
      conversation-phase-handler.ts    # 8-phase conversation flow
      clarification-engine.ts          # Prompt analysis and clarification
      enhanced-intent-recognition.ts   # Advanced intent recognition
      conversational-flexibility.ts    # Conversation flexibility handling
      # === Advanced AI ===
      advanced-code-generation.ts      # Advanced code generation
      advanced-reasoning.ts            # Advanced reasoning engine
      ai-code-refiner.ts               # AI code refinement
      ai-fullstack-generator.ts        # AI full-stack generation
      complete-code-intelligence.ts    # Complete code intelligence
      context-memory.ts                # Conversation memory
      contextual-reasoning-engine.ts   # Contextual reasoning
      context-window-manager.ts        # Context window management
      code-explanation-engine.ts       # Code explanation
      code-cleaner.ts                  # Code cleanup utilities
      deep-debugging-engine.ts         # Deep debugging engine
      continuous-debugger.ts           # Continuous debugging
      deep-project-generator.ts        # Deep project generation
      dependency-intelligence.ts       # Dependency intelligence
      export-system.ts                 # Export/download system
      framework-patterns.ts            # Framework pattern library
      preview-project-manager.ts       # Server-side preview management
      # ... and more

  shared/                              # Shared types between frontend & backend
    schema.ts                          # Drizzle schema + Zod validation (533 lines)

  scripts/
    scripts/
      github-push.ts                   # GitHub push via Octokit (full tree replacement)
      mega-stress-test.ts              # Main pipeline: 10,000 iterations
      module-stress-tests.ts           # Design/Architecture/Functionality: 2,000 each
      extended-module-stress-tests.ts  # 10 modules: 10,000 each
      stress-test-planning.ts          # Stress test planning utilities
      seed-domain-knowledge.ts         # Seed 14 industries with 103 entities
      generate-prewarm-snapshot.ts     # Generate pre-warm package snapshot
      build-electron.ts                # Electron build script

  electron/                            # Electron desktop mode
    main.ts                            # Electron main process
    preload.ts                         # Preload script for IPC bridge
    services/                          # Electron-specific services
    scripts/                           # Build and dev scripts
    npm-cache/                         # Persistent npm cache
    tsconfig.json                      # Electron TypeScript config
    tsconfig.preload.json              # Preload TypeScript config

  documents/                           # Project documentation (this directory)
  learning-data.json                   # Persistent learning data (6,583 patterns)
  dist-electron/                       # Electron build output
```

---

## Key Technologies

### Frontend Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 18 | UI framework with hooks and functional components |
| TypeScript | 5.x | Type-safe development throughout |
| Tailwind CSS | 3.x | Utility-first styling |
| shadcn/ui | Latest | Accessible Radix-based component library |
| Wouter | 3.x | Lightweight client-side routing (NOT react-router) |
| TanStack Query | v5 | Server state management with caching and invalidation |
| react-hook-form | Latest | Form state management |
| Zod | 3.x | Schema validation |
| Lucide React | Latest | Icon library |
| Framer Motion | Latest | Animations and transitions |
| Recharts | Latest | Data visualization charts |

### Backend Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| Node.js | 20+ | Server runtime |
| Express.js | 4.x | HTTP server with RESTful API |
| TypeScript | 5.x | Type safety with ESM modules |
| Drizzle ORM | Latest | Type-safe database access |
| drizzle-zod | Latest | Zod schema generation from Drizzle tables |
| Zod | 3.x | Request validation |
| Passport | Latest | Authentication (session-based) |
| express-session | Latest | Session management |
| ws | Latest | WebSocket for real-time streaming |
| multer | Latest | File upload handling |
| nodemailer | Latest | Email sending |

### Code Execution

| Technology | Purpose |
|-----------|---------|
| @webcontainer/api | In-browser Node.js runtime for live previews |
| Electron | Native desktop runtime with file system access |
| electron-builder | Cross-platform desktop app distribution |

---

## Development Setup

### Prerequisites

- Node.js 20+
- PostgreSQL database (automatically provided on Replit)
- npm (included with Node.js)

### Running Locally

```bash
npm install
npm run dev
```

This starts both the Express backend (port 5000) and Vite dev server with hot module replacement (HMR). The frontend is served at `http://localhost:5000`.

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string (auto-set on Replit) |
| `SESSION_SECRET` | Yes | Secret for Express session encryption |
| `OPENAI_API_KEY` | No | Enables cloud AI mode with GPT-4o |
| `GOOGLE_GENERATIVE_AI_API_KEY` | No | Enables Google Generative AI features |
| `CLOUD_SANDBOX_ENABLED` | No | Enables cloud sandbox execution (planned) |

If no AI keys are provided, the system automatically uses the local AI engine with zero degradation for standard CRUD applications.

---

## Understanding the Codebase

### Data Flow: User Message to Generated Code

```
User sends message via chat.tsx
    ↓
POST /api/conversations/:id/messages (routes.ts)
    ↓
Conversation Phase Handler determines current phase
  (initial → clarification → planning → generation → preview → iteration)
    ↓
If generation phase:
    plan-driven-generator.ts is invoked
        ↓
    pipeline-orchestrator.ts runs 16 stages sequentially
        ↓
    Stage 1-2: Product/Project Manager (requirements + planning)
    Stage 3: Senior Advisor (apply learned patterns from 6,583 patterns)
    Stage 4: Technical Analyst (semantic analysis + entity extraction)
    Stage 5: System Architect (architecture decisions)
    Stage 6: Schema Designer (database schema with Drizzle)
    Stage 7: API Architect (Express routes with Zod validation)
    Stage 8: Full-Stack Developer → codegen-orchestrator.ts (CodeGen V2)
        ↓
        codegen-components.ts   → Resolve component dependencies
        codegen-field-resolver.ts → Map fields to UI components
        codegen-page-builder.ts → Build pages with UI patterns
        codegen-validator.ts    → Validate + fix cross-file issues
        ↓
    Stage 9-13: Design, Functionality, Quality, Dependencies, Domain
    Stage 14: Integration Tester (test generation)
    Stage 15: Release Engineer (final validation + auto-fix)
    Stage 16: Knowledge Manager (record outcomes to learning engine)
        ↓
Files stored via storage.ts → returned to client
    ↓
auto-runner.ts picks up files → loads into WebContainer
    ↓
npm install (packages pre-cached) → vite dev server starts
    ↓
User sees live preview in browser
```

### CodeGen V2 Module Flow

```
codegen-orchestrator.ts (978 lines)
  │
  ├── codegen-components.ts
  │   └── Component library with dependency tracking
  │       Each component declares: npm packages, local imports, peer components
  │       Example: DataTable → needs @tanstack/react-table, Button, Badge
  │
  ├── codegen-field-resolver.ts
  │   └── Maps entity fields to appropriate UI components:
  │       "status" → Select with color-coded badges
  │       "email"  → TextInput with email validation
  │       "date"   → DatePicker component
  │       "price"  → NumberInput with currency formatting
  │       "image"  → ImageUpload with preview
  │       "description" → Textarea
  │
  ├── codegen-page-builder.ts
  │   └── Builds pages using 5 UI patterns:
  │       Table     → Data-heavy entities (default)
  │       Kanban    → Entities with "status" field
  │       Calendar  → Entities with date fields
  │       Card Grid → Visual entities (products, profiles)
  │       Dashboard → KPI overview with charts
  │
  └── codegen-validator.ts
      └── Multi-pass validation:
          Pass 1: Check all imports resolve to existing files
          Pass 2: Check all npm packages are in package.json
          Pass 3: Check cross-file exports match imports
          Pass 4: Auto-fix missing files, broken paths, missing packages
          Pass 5: Re-validate after fixes
```

### Storage Interface

All data access goes through `IStorage` in `server/storage.ts`. This interface has two implementations:

- **DatabaseStorage** (production): Uses Drizzle ORM with Neon serverless PostgreSQL driver
- **MemStorage** (fallback): Map-based in-memory storage for when DB is unavailable

When adding new data operations:
1. Add the method to the `IStorage` interface
2. Implement in both `DatabaseStorage` and `MemStorage`
3. Use the interface in route handlers — never access the database directly
4. Use Drizzle-Zod schemas for request validation

### Database Schema (shared/schema.ts)

The schema defines these core tables:

| Table | Purpose |
|-------|---------|
| `users` | User accounts (if auth is enabled) |
| `conversations` | Chat conversations with project context |
| `messages` | Individual chat messages (user and assistant) |
| `projectFiles` | Generated code files with path and content |
| `generationLogs` | Pipeline execution logs and metrics |
| `intelligenceRecords` | AI reasoning and decision records |
| `vaptAssets` | VAPT vulnerability assessment assets |
| `vaptVulnerabilities` | Detected vulnerabilities |
| `vaptScans` | Security scan records |
| `vaptSchedules` | Scheduled scan configurations |
| `vaptTeamMembers` | Security team members |
| `vaptAuditLogs` | Security audit trail |

### Pre-warm System

The WebContainer pre-warm system in `webcontainer.ts` (1,670 lines) pre-installs 200+ packages in 4 tiers:

| Tier | Name | Packages | Timeout | Stall Timeout | Description |
|------|------|----------|---------|---------------|-------------|
| 1 | Core | 21 | 300s | 180s | React, Vite, TypeScript, Tailwind, TanStack Query |
| 2 | UI | 35 | 180s | 90s | Radix UI primitives, Framer Motion, date-fns |
| 3 | Server | 27 | 180s | 90s | Express, Drizzle, Passport, Recharts, DnD Kit |
| 4 | Extras | 57+ | 180s | 90s | Chart.js, Socket.io, Slate, Formik, xlsx |

Features:
- **Snapshot-first strategy**: Loads pre-built `node_modules` snapshot from `/cache/prewarm-snapshot.json.gz` for instant mounting
- **Fallback to npm**: If snapshot unavailable, runs npm install in 4 batches
- **Tab visibility detection**: Pauses stall timer when browser tab is hidden (WebContainer throttles background tabs)
- **Retry logic**: Each batch gets one retry with `node_modules`/`package-lock.json` cleared
- **Progress notifications**: Real-time status via structured logger

Packages excluded from WebContainer (require native binaries): `sharp`, `better-sqlite3`, `bull`, `ioredis`.

### Learning Engine Integration

The Generation Learning Engine (`generation-learning-engine.ts`, 1,183 lines) integrates at 5 points:

1. **Startup**: Loads 6,583 patterns and 3,575 preferences from `learning-data.json`
2. **Pre-generation** (`applyLearnedPatterns`): Enhances project plans with:
   - Domain-specific entity suggestions from learned domain mappings
   - Field type enrichment from 680+ entity patterns with full field types
   - KPI suggestions from domain knowledge
   - Relationship inference from foreign key patterns
3. **Post-generation** (`recordGenerationOutcome`): Records success/failure with metadata
4. **Error recovery** (`learnFromErrors`): Records failure patterns for future avoidance
5. **Save** (`saveToFile` / `saveToDB`): Persists to both `learning-data.json` and PostgreSQL

---

## Code Conventions

### General Rules

- **No default exports** except for React pages and the App component
- **ESM modules** throughout (`import`/`export`, not `require`)
- **TypeScript strict mode** — all types explicit, no `any` without justification
- **Error handling**: All route handlers wrapped in try-catch with structured logging

### Frontend Conventions

- **Wouter** for routing (not react-router): `import { Link, useLocation } from 'wouter'`
- **TanStack Query v5** object syntax: `useQuery({ queryKey: ['key'] })` not `useQuery(['key'])`
- **react-hook-form** with `zodResolver` for all forms
- **shadcn/ui** components imported via `@/components/ui/...`
- **Lucide React** icons: `import { Settings, Plus, Trash } from 'lucide-react'`
- **No explicit React import** — Vite JSX transformer handles it
- **Environment variables**: `import.meta.env.VITE_*` (not `process.env`)
- **data-testid** attributes on all interactive and meaningful display elements

### Backend Conventions

- **Zod schemas** for all API request validation
- **Drizzle-zod** for generating insert schemas from database tables
- **Storage interface** for all data access — never query the database directly
- **Structured logging** with categories, levels, and timing data

### Styling Conventions

- **CSS variables** in `index.css` use HSL format: `--my-var: 23 10% 23%;` (space-separated, no `hsl()` wrapper)
- **Dark mode**: `darkMode: ["class"]` in Tailwind config with `.dark` CSS class on `document.documentElement`
- **Explicit light/dark variants**: `className="bg-white dark:bg-black text-black dark:text-white"` for non-utility-class styles

### File Naming

- Components: `PascalCase.tsx` (e.g., `IntelligencePanel.tsx`) or `kebab-case.tsx` (e.g., `chat-input.tsx`)
- Pages: `kebab-case.tsx` (e.g., `vapt-dashboard.tsx`)
- Utilities: `kebab-case.ts` (e.g., `query-client.ts`)
- Server modules: `kebab-case.ts` (e.g., `generation-learning-engine.ts`)

---

## Forbidden Changes

These files are critical infrastructure and must NOT be modified:

| File | Reason |
|------|--------|
| `server/vite.ts` | Vite dev server integration — already configured for frontend+backend on same port |
| `vite.config.ts` | Build configuration with all aliases — no proxy needed |
| `package.json` | Use `packager_install_tool` for package changes |
| `drizzle.config.ts` | Database migration configuration |

---

## Adding New Features

### Adding a New Page

1. Create `client/src/pages/my-page.tsx`
2. Register the route in `client/src/App.tsx` using Wouter
3. Add navigation link in the sidebar if applicable

### Adding a New API Endpoint

1. Add the route handler in `server/routes.ts`
2. Define Zod schemas for request validation
3. Use the storage interface for data operations
4. Add types to `shared/schema.ts` if new tables are needed

### Adding a New AI Module

1. Create `server/modules/my-module.ts`
2. Export the module's main function
3. Integrate into `pipeline-orchestrator.ts` at the appropriate stage
4. Add stress tests in `scripts/scripts/extended-module-stress-tests.ts`
5. Update documentation

### Adding a New Domain

1. Add domain knowledge to `server/modules/domain-knowledge.ts`
2. Seed entities via `scripts/scripts/seed-domain-knowledge.ts`
3. Add domain detection keywords to `domain-synthesis-engine.ts`
4. Run stress tests to validate: `npx tsx scripts/scripts/extended-module-stress-tests.ts`
