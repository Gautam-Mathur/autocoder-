# Developer's Guide

## Project Structure

```
autocoder/
  client/                          # Frontend (React + TypeScript)
    src/
      components/                  # Reusable UI components (shadcn/ui)
        ui/                        # Base shadcn components
        app-sidebar.tsx            # Application sidebar
        auto-run-preview.tsx       # Live preview panel
        deployment-panel.tsx       # GitHub push UI
        vscode-ide.tsx             # Code editor panel
      hooks/                       # Custom React hooks
      lib/
        code-runner/
          webcontainer.ts          # WebContainer management & pre-warm
          auto-runner.ts           # Auto-run preview with error detection
          logger.ts                # Client-side structured logging
        queryClient.ts             # TanStack Query configuration
        utils.ts                   # Shared utilities
      pages/
        chat.tsx                   # Main chat interface
        not-found.tsx              # 404 page
      App.tsx                      # Root component with routing

  server/                          # Backend (Express + TypeScript)
    index.ts                       # Server entry point
    routes.ts                      # All API endpoints (~3500 lines)
    storage.ts                     # Storage interface (PostgreSQL / in-memory)
    vite.ts                        # Vite dev server integration
    modules/                       # AI & code generation modules
      codegen-orchestrator.ts      # CodeGen V2 pipeline coordinator
      codegen-components.ts        # Component library with dependency tracking
      codegen-field-resolver.ts    # Smart field-to-component mapping
      codegen-page-builder.ts      # Composable page generation
      codegen-validator.ts         # Post-generation validation
      codegen-e2e-test.ts          # End-to-end test suite
      plan-driven-generator.ts     # Plan-driven code generation
      pipeline-orchestrator.ts     # 16-stage pipeline with quality gates
      local-ai-engine.ts           # Fully offline AI engine
      local-pipeline-router.ts     # Local pipeline routing
      domain-knowledge.ts          # 14-industry domain library
      deep-understanding-engine.ts  # Intent analysis & entity extraction
      plan-generator.ts            # Project plan generation
      conversation-phase-handler.ts # Multi-phase conversation flow
      generation-learning-engine.ts # Learning engine (patterns & outcomes)
      clarification-engine.ts      # Prompt analysis & clarification
      enhanced-intent-recognition.ts # Advanced intent recognition
      preview-project-manager.ts   # Server-side preview management

  shared/                          # Shared types between frontend & backend
    schema.ts                      # Drizzle schema & Zod validation

  scripts/
    scripts/
      github-push.ts              # GitHub push via Octokit

  documents/                       # Project documentation
  electron/                        # Electron desktop mode files
```

## Key Technologies

### Frontend Stack
- **React 18**: UI framework with hooks and functional components
- **TypeScript**: Type-safe development throughout
- **Tailwind CSS**: Utility-first styling with shadcn/ui components
- **Wouter**: Lightweight client-side routing (not react-router)
- **TanStack Query v5**: Server state management with caching and invalidation
- **react-hook-form**: Form state management with Zod validation
- **Lucide React**: Icon library

### Backend Stack
- **Express.js**: HTTP server with RESTful API
- **Drizzle ORM**: Type-safe database access
- **Zod + drizzle-zod**: Request validation from database schema
- **Passport**: Authentication (session-based)
- **WebSocket (ws)**: Real-time streaming for AI responses

### Code Execution
- **@webcontainer/api**: In-browser Node.js runtime
- **Electron**: Native desktop runtime with file system access

## Development Setup

### Prerequisites
- Node.js 20+
- PostgreSQL database (automatically provided on Replit)

### Running Locally
```bash
npm install
npm run dev
```

This starts both the Express backend (port 5000) and Vite dev server with hot reload.

### Environment Variables
| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `SESSION_SECRET` | Yes | Express session secret |
| `OPENAI_API_KEY` | No | Enables cloud AI mode (GPT-4o) |
| `GOOGLE_GENERATIVE_AI_API_KEY` | No | Enables Google AI capabilities |

If no AI keys are provided, the system automatically falls back to the local AI engine.

## Understanding the Codebase

### Data Flow: User Message to Generated Code

1. User sends a message via `chat.tsx`
2. `POST /api/conversations/:id/messages` receives it
3. Conversation phase handler determines the current phase (initial, clarification, planning, generation, etc.)
4. If in generation phase, `plan-driven-generator.ts` is invoked
5. `pipeline-orchestrator.ts` runs 16 stages in sequence
6. `codegen-orchestrator.ts` (CodeGen V2) generates all files
7. Files are stored via `storage.ts` and returned to the client
8. `auto-runner.ts` picks up the files and runs them in WebContainer
9. User sees the live preview

### CodeGen V2 Module Flow

```
codegen-orchestrator.ts
  |
  ├── codegen-components.ts     # Resolve component dependencies
  ├── codegen-field-resolver.ts  # Map fields to components
  ├── codegen-page-builder.ts    # Build pages with UI patterns
  └── codegen-validator.ts       # Validate & fix cross-file issues
```

### Storage Interface

All data access goes through `IStorage` in `server/storage.ts`. This interface has two implementations:
- **PostgreSQL** (production): Uses Drizzle ORM with Neon serverless driver
- **In-memory** (fallback): Simple Map-based storage for when DB is unavailable

When adding new data operations:
1. Add the method to `IStorage` interface
2. Implement in both `DatabaseStorage` and `MemStorage`
3. Use the interface in route handlers — never access the database directly

### Pre-warm System

The WebContainer pre-warm system (`webcontainer.ts`) pre-installs 140 packages in 4 tiers:

| Tier | Name | Packages | Timeout | Description |
|------|------|----------|---------|-------------|
| 1 | Core | 21 | 300s | React, Vite, TypeScript, Tailwind, TanStack Query |
| 2 | UI | 35 | 180s | Radix UI primitives, Framer Motion, date-fns |
| 3 | Server | 27 | 180s | Express, Drizzle, Passport, Recharts, DnD Kit |
| 4 | Extras | 57 | 180s | Chart.js, Socket.io, Slate, Formik, xlsx |

Packages excluded from WebContainer (native binaries): `sharp`, `better-sqlite3`, `bull`, `ioredis`.

## Code Conventions

- **No default exports** except for React pages and the App component
- **Zod schemas** for all API request validation
- **Drizzle-zod** for generating insert schemas from database tables
- **TanStack Query v5** object syntax: `useQuery({ queryKey: ['key'] })` not `useQuery(['key'])`
- **Wouter** for routing, not react-router
- **ESM modules** throughout (`import`/`export`, not `require`)
- **Error handling**: All route handlers wrapped in try-catch, errors logged with structured logger
