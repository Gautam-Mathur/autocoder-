# AutoCoder - AI-Powered Code Generation Platform

## Overview

AutoCoder is a full-stack AI-powered code generation platform that takes natural language descriptions and produces production-ready, full-stack applications. It features 7 advanced AI-like intelligence modules (NLU, reasoning engine, context memory, live code analysis, code explanation, knowledge base, and continuous debugging) that operate 100% locally with zero external API dependencies. The platform includes a chat-based interface where users describe what they want, and the system generates multi-file projects with live preview capabilities.

The app runs as a web application (Express + React) with an optional Electron desktop mode for native file system access. It supports both cloud AI (OpenAI GPT-4o) and a built-in local template engine that works offline without API keys.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight client-side router)
- **State Management**: TanStack Query (React Query) for server state management
- **Styling**: Tailwind CSS with CSS variables for theming (light/dark mode support)
- **UI Components**: shadcn/ui (Radix UI primitives + Tailwind) in "new-york" style
- **Build Tool**: Vite with React plugin
- **Code Display**: Monaco-style editor integration, syntax highlighting
- **Key Pages**: Landing page (`/`), Chat interface (`/chat`), VAPT Dashboard (`/vapt`)
- **Path Aliases**: `@/` maps to `client/src/`, `@shared/` maps to `shared/`

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript (ESM modules, compiled with tsx for dev, esbuild for production)
- **API Pattern**: RESTful endpoints registered in `server/routes.ts`
- **Server Entry**: `server/index.ts` creates Express app with HTTP server
- **Dev Mode**: Vite middleware served through Express (`server/vite.ts`)
- **Production**: Static files served from `dist/public` (`server/static.ts`)
- **COOP/COEP Headers**: Set for WebContainer cross-origin isolation support
- **Request Limit**: 50MB JSON body limit for large code payloads

### Intelligence Modules (server/modules/)
The backend has 34 intelligence modules that provide AI-like capabilities:
- **NLU & Intent Recognition**: `natural-language-understanding.ts`, `enhanced-intent-recognition.ts`
- **Code Generation**: `advanced-code-generation.ts`, `deep-project-generator.ts`
- **Reasoning & Planning**: `advanced-reasoning.ts`, `planning-module.ts`
- **Memory & Context**: `context-memory.ts`, `context-window-manager.ts`, `conversational-context.ts`
- **Code Analysis**: `live-code-analysis.ts`, `code-explanation-engine.ts`, `universal-code-explanation.ts`
- **Debugging**: `continuous-debugger.ts`, `deep-debugging-engine.ts`
- **Security**: `security-module.ts`
- **Testing**: `testing-engine.ts`
- **Preview**: `preview-project-manager.ts` (manages live preview of generated projects)
- **Export**: `export-system.ts`
- **Knowledge**: `knowledge-base.ts`, `framework-patterns.ts`, `multi-language-templates.ts`

### Data Storage
- **Database**: PostgreSQL via Drizzle ORM (optional — falls back to in-memory storage when `DATABASE_URL` is not set)
- **Schema**: Defined in `shared/schema.ts` using Drizzle's `pgTable` definitions
- **ORM**: Drizzle ORM with `drizzle-zod` for validation schema generation
- **Migration Tool**: Drizzle Kit (`drizzle-kit push` for schema sync)
- **Key Tables**: `users`, `conversations`, `messages`, `projectFiles`, `projectPlans`, `intelRecords`, `testResults`, `securityScans`, `generationLogs`, VAPT-related tables
- **Storage Interface**: `server/storage.ts` defines `IStorage` interface with implementations for both database-backed and in-memory modes
- **Conversations** store project context (name, description, tech stack, features built, design preferences, security scores)

### Port Configuration
- **Replit**: Server defaults to port 5000 (required by Replit's port mapping). The `.replit` config maps port 5000 to external port 80.
- **Electron/Local**: Electron defaults to connecting on port 5100 (`electron/main.ts`). When running locally with another project on port 5000, start with `PORT=5100 npm run dev`.
- **Override**: Server reads `PORT` env var; Electron reads `DEV_PORT` env var.

### Electron Desktop Mode
- **Purpose**: Overcome WebContainer's 16KB file write limit and virtual npm limitations
- **Main Process**: `electron/main.ts` — creates BrowserWindow, registers IPC handlers
- **Preload**: `electron/preload.ts` — context bridge exposing `electronAPI` to renderer
- **Services**: `electron/services/local-runner.ts` (file I/O, npm install, dev server), `electron/services/project-manager.ts` (workspace management at `~/AutoCoder/projects/`), `electron/services/logger.ts` (file-based logging)
- **IPC Channels**: `runner:writeFiles`, `runner:npmInstall`, `runner:startServer`, `runner:stopServer`, `runner:getStatus`, `project:list`, `project:delete`, `project:open`
- **Build**: electron-builder configured in `electron-builder.json` for Mac (dmg), Windows (nsis), Linux (AppImage)
- **Environment Detection**: Runner factory pattern detects Electron vs browser and uses appropriate code runner

### Code Runner System (client-side)
- **WebContainer Mode**: Browser-based Node.js runtime via `@webcontainer/api`
- **Electron Mode**: Native file system operations via IPC
- **Runner Factory**: `runner-factory.ts` selects the appropriate runner based on environment
- **Auto Runner**: `auto-runner.ts` manages automatic project building and previewing
- **Features**: Live preview, zip export, test generation and execution

### Build System
- **Dev**: `tsx server/index.ts` with Vite middleware for HMR
- **Production Build**: Custom `script/build.ts` that runs Vite build for client and esbuild for server
- **Server Bundle**: esbuild bundles server code into `dist/index.cjs`, with select dependencies bundled (see allowlist in build script) and others kept external
- **Output**: Client → `dist/public/`, Server → `dist/index.cjs`

## External Dependencies

### Database
- **PostgreSQL**: Primary database, connected via `DATABASE_URL` environment variable. Uses `pg` (node-postgres) pool. Optional — app works without it using in-memory storage.

### AI/LLM Services
- **OpenAI**: Optional GPT-4o integration for cloud AI mode (falls back to local template engine). Uses `openai` npm package.
- **Google Generative AI**: `@google/generative-ai` package included in dependencies.

### Key NPM Packages
- **Frontend**: React, Wouter, TanStack Query, Radix UI (full suite), Tailwind CSS, Framer Motion, Recharts, Monaco-like editor, react-icons, lucide-react
- **Backend**: Express, Drizzle ORM, Zod, Passport (local auth), express-session, multer, nodemailer, ws (WebSocket)
- **Utilities**: nanoid, date-fns, uuid, xlsx, jszip, class-variance-authority, clsx
- **Dev Tools**: Vite, esbuild, TypeScript, tsx, drizzle-kit

### GitHub Integration
- **@octokit/rest**: GitHub API integration for pushing code to repositories. Uses Replit's connector system for OAuth tokens (`scripts/github-push.ts`).

### WebContainer
- **@webcontainer/api**: Browser-based Node.js runtime for live code preview. Requires COOP/COEP headers (set in server middleware).

### Electron (Desktop Mode)
- **electron**: Desktop app shell
- **electron-builder**: Cross-platform packaging (dmg, nsis, AppImage)

### Replit-Specific
- **@replit/vite-plugin-runtime-error-modal**: Error overlay in dev mode
- **@replit/vite-plugin-cartographer**: Dev tooling (only in Replit environment)
- **@replit/vite-plugin-dev-banner**: Dev banner (only in Replit environment)

## Recent Changes (Feb 2026)

### Pro Generator Integration
- Server-side message handler (`server/routes.ts`) now uses the Pro Generator (`client/src/lib/code-generator/pro-generator.ts`) instead of `deep-project-generator.ts` for chat-based code generation
- Produces 15-20 clean JSX files instead of 149 TypeScript files, compatible with browser-based Babel preview
- Validation pipeline runs automatically via `code-validator.ts` before files are saved

### Code Validator Fixes
- **Void element auto-fixer** (`fixVoidElements`): Uses depth-tracking parser that respects curly braces `{}` in JSX attributes, preventing arrow functions `=>` from being corrupted to `= />`
- **Void element detection** (`checkVoidElements`): Same depth-tracking approach to avoid false positives with React Router `<Link>` vs HTML `<link>`
- **Link casing fixer** (`fixLinkCasing`): Detects lowercase `<link to="...">` that should be React Router `<Link>` and fixes both opening and closing tags. Only triggers when `to=` attribute is present.
- **React Router link detection** (`isReactRouterLink`): Helper used by void element check/fix to skip `<link>` tags that are actually React Router `<Link>` components (have `to=` prop or `</Link>` closing tag)
- **Missing container closing tags** (`fixMissingClosingTags`): Auto-inserts missing `</Routes>`, `</Switch>`, `</BrowserRouter>` etc. by counting open vs close tags and inserting after the last `</Route>`
- **Default export check**: Skips entry files (main.jsx, index.jsx) and context/provider/hook files
- **Component JSX return check**: Skips Context/Provider components and files using createContext

### All Code Paths Unified on Pro Generator
- **Chat handler** (`server/routes.ts` line ~700): Uses `proAnalyzePrompt` + `proGenerateProject` with validation
- **Deep generate** (`/api/ai/deep/generate`): Now uses pro-generator instead of `generateDeepProject`
- **Deep generate refined** (`/api/ai/deep/generate-refined`): Now uses pro-generator instead of `generateDeepProjectWithAI`
- **File cleanup**: Chat handler clears old files before saving new ones (`deleteProjectFilesByConversation`) to prevent accumulation
- **Bulk delete endpoint**: `DELETE /api/conversations/:id/files` clears all project files for a conversation
- **Storage method**: `deleteProjectFilesByConversation(conversationId)` added to IStorage interface and both implementations