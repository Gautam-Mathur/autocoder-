# AutoCoder - AI-Powered Code Generation Platform

## Overview
AutoCoder is an AI-powered, full-stack code generation platform that translates natural language descriptions into production-ready, multi-file React+Vite+TypeScript applications. It features a plan-driven generation pipeline with deep domain understanding across 14 industries, a chat-based interface, and advanced locally-operated AI intelligence modules. The platform supports both cloud AI and an offline local template engine, running as a web application with an optional Electron desktop mode for native file system access. Its core mission is to democratize full-stack application development by making it accessible through natural language.

## Recent Changes (Feb 2026)
- Upgraded from template-based to plan-driven code generation pipeline
- Added 14 industry domain profiles (consulting, manufacturing, healthcare, retail, education, real estate, HR, restaurant, fitness, logistics, finance, project management, CRM, inventory)
- Implemented Deep Understanding Engine with 5-level analysis, multi-domain blending, keyword-based entity inference
- Added 6-phase conversation state machine with deadlock recovery and 2-round clarification limit
- Plan-Driven Generator: 36 functions producing complete React+Vite+TypeScript projects from approved plans
- Post-Generation Validator: 50+ package checks, implicit dependency detection, smart stub generation
- Vite Error Auto-Fix: 11 error type analyzers with closed-loop debugging (3 retries)
- Added 7 new UI component generators (Dialog, Select, Label, Textarea, Tabs, tsconfig.json, tsconfig.node.json)
- Enhanced list pages with create dialogs, delete mutations, status filters
- Updated all documentation with accurate statistics

## User Preferences
Preferred communication style: Simple, everyday language.

## Platform Statistics
- Total Lines of Code: 372,575+
- Source Files: 28,046
- Server Modules: 41
- React Components: 71
- Domain Knowledge Profiles: 14 industries
- Documentation Files: 7 guides in docs/electron/

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter
- **State Management**: TanStack Query
- **Styling**: Tailwind CSS with CSS variables, shadcn/ui components
- **Build Tool**: Vite
- **Code Display**: Monaco-style editor integration
- **Key Pages**: Landing, Chat interface, VAPT Dashboard

### Backend
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript (ESM modules)
- **API Pattern**: RESTful endpoints
- **Security**: COOP/COEP headers for WebContainer isolation
- **Server Modules**: 41 intelligence modules in server/modules/

### Plan-Driven Code Generation Pipeline
The system uses a multi-phase intelligent approach:
1. **Domain Knowledge Library**: 14 industry domains (consulting, manufacturing, healthcare, retail, education, real estate, HR, restaurant, fitness, logistics, finance, project-management, CRM, inventory) with entities, workflows, roles, and page definitions (1,383 lines in domain-knowledge.ts).
2. **Deep Understanding Engine** (662 lines): A 5-level analysis pipeline that decomposes intent, detects domains (blending top 2 if within 0.15 confidence, generic fallback if unrecognized), extracts and infers entities via keyword matching, detects workflows, and manages clarification loops (max 2 rounds). Entity caps: small=4, medium=8, large=12.
3. **Plan Generator** (493 lines): Produces a comprehensive `ProjectPlan` including tech stack, module breakdown, data model, pages, API endpoints, workflows, user roles, and file blueprints.
4. **Plan-Driven Code Generator** (1,828 lines, 36 functions): Generates complete, runnable projects based on approved plans, including `package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`, `tailwind.config.js`, `main.tsx`, `App.tsx`, `index.css`, utility functions, TanStack Query client setup, and 10 UI components (Button, Card, Input, Badge, Toaster, Dialog, Select, Label, Textarea, Tabs). Generates Dashboard, List, Detail, and Generic page types plus a full backend (`schema.ts`, `db.ts`, `storage.ts`, `routes.ts`, `index.ts`).
5. **Conversation Phase Handler** (346 lines): Manages 6-phase flow (`initial -> understanding -> clarifying -> planning -> approval -> generating -> complete`) with phase recovery for stuck conversations and natural language approval/modification handling.

### Post-Generation Validation & Auto-Fix
- **Post-Generation Validator** (601 lines): 50+ package dependency checks, implicit dependency detection (Recharts, date-fns, framer-motion, react-hook-form, zodResolver), smart stub generation (React components with JSX for .tsx, hooks, types, functions), runtime pattern validation (missing QueryClientProvider, duplicate export default, empty components).
- **Vite Error Fixer** (829 lines): 11 error type analyzers (missing_import, missing_module, missing_file, export_mismatch, syntax, reference_error, jsx_error, css_error, hook_violation, config, dependency_conflict).
- **Auto-Run Preview** (641 lines): Client-side closed-loop debugging detecting Vite/build errors via regex patterns and `PREVIEW_ERROR` messages, posting to backend auto-fix, applying fixes, refreshing preview (max 3 retries with UI badges).

### Client-Side Code Generation (Fallback)
- **Pro Generator** (3,624 lines): Template-based engine for 19+ app types producing 15-20 JSX files
- **Code Validator** (955 lines): 15 checks + 8 auto-fixes for generated code
- **LiveCodeRunner** (1,263 lines): Browser-based Babel preview with mocked dependencies

### Other Intelligence Modules
- **Code Analysis**: Live analysis, explanation, and validation.
- **Debugging**: Continuous debugging engines integrated with auto-fix.
- **Security & Testing**: Modules for VAPT and test generation.
- **Preview & Export**: Manages live project previews and zip export.
- **Knowledge Base**: Stores framework patterns and multi-language templates.

### Data Storage
- **Database**: PostgreSQL via Drizzle ORM (optional, falls back to in-memory).
- **Schema**: Drizzle ORM schema (266 lines, 16 tables) for users, conversations, messages, project files, project plans, intel records, generation logs, test results, security scans, and VAPT tables.

### Electron Desktop Mode
- **Purpose**: Enables native file system access.
- **Processes**: Main process for window management, preload script for context bridge.
- **Services**: Local runner for file I/O and npm, project manager, logger.

### Code Runner System (Client-side)
- **Modes**: WebContainer for browser-based runtime, Electron for native file system.
- **Features**: Live preview with auto-fix, zip export, test generation and execution.

## Key Files
- `server/modules/deep-understanding-engine.ts` - 5-level NLU pipeline (662 lines)
- `server/modules/conversation-phase-handler.ts` - 6-phase state machine (346 lines)
- `server/modules/plan-generator.ts` - ProjectPlan creation (493 lines)
- `server/modules/plan-driven-generator.ts` - Code from plans (1,828 lines, 36 functions)
- `server/modules/post-generation-validator.ts` - Auto-validation (601 lines)
- `server/modules/domain-knowledge.ts` - 14 industry domains (1,383 lines)
- `server/modules/vite-error-fixer.ts` - Auto-fix engine (829 lines)
- `client/src/lib/code-generator/pro-generator.ts` - Template fallback (3,624 lines)
- `client/src/lib/code-generator/code-validator.ts` - Code validation (955 lines)
- `client/src/components/live-code-runner.tsx` - Babel preview (1,263 lines)
- `client/src/components/auto-run-preview.tsx` - WebContainer preview (641 lines)
- `server/routes.ts` - API endpoints
- `shared/schema.ts` - Database schema (266 lines)

## External Dependencies

### Database
- **PostgreSQL**: Primary database (Neon-backed on Replit).

### AI/LLM Services
- **OpenAI**: Optional GPT-4o integration.
- **Google Generative AI**: For generative AI capabilities.

### Key NPM Packages
- **Frontend**: React, Wouter, TanStack Query, Radix UI, Tailwind CSS, Framer Motion, Recharts.
- **Backend**: Express, Drizzle ORM, Zod, Passport, express-session, multer, nodemailer, ws.
- **Utilities**: nanoid, date-fns, uuid, xlsx, jszip.

### GitHub Integration
- **@octokit/rest**: For GitHub API integration (code pushing).

### WebContainer
- **@webcontainer/api**: For browser-based Node.js runtime and live code preview.

### Electron (Desktop Mode)
- **electron**: Desktop application framework.
- **electron-builder**: For cross-platform packaging.

### Replit-Specific
- **@replit/vite-plugin-runtime-error-modal**, **@replit/vite-plugin-cartographer**, **@replit/vite-plugin-dev-banner**: Development environment plugins.
