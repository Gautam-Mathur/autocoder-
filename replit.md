# AutoCoder - AI-Powered Code Generation Platform

## Overview
AutoCoder is an AI-powered, full-stack code generation platform designed to transform natural language descriptions into production-ready, multi-file React+Vite+TypeScript applications. Its core mission is to democratize full-stack application development, making it accessible through natural language input. The platform features a plan-driven generation pipeline with deep domain understanding across 14 industries, a chat-based interface, and advanced locally-operated AI intelligence modules. It supports both cloud AI and an offline local template engine, running as a web application with an optional Electron desktop mode for native file system access. The generated code quality has been validated at 99% (Grade A+) across diverse application types.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter
- **State Management**: TanStack Query
- **Styling**: Tailwind CSS with CSS variables, shadcn/ui components
- **Build Tool**: Vite
- **Key Pages**: Landing, Chat interface, VAPT Dashboard
- **UI/UX Decisions**: Incorporates smart inline "Add" forms for related child entities on detail pages, semantic inputs (e.g., currency fields, date pickers), dashboard KPIs with semantic type detection and formatting, and UI pattern pages (Kanban, Calendar, Card Grid) with a Table fallback and view toggle.

### Backend
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript (ESM modules)
- **API Pattern**: RESTful endpoints
- **Security**: COOP/COEP headers for WebContainer isolation

### Plan-Driven Code Generation Pipeline
The system employs a multi-phase intelligent approach:
1.  **Domain Knowledge Library**: Utilizes a comprehensive library of 14 industry domains with predefined entities, workflows, roles, and page definitions.
2.  **Deep Understanding Engine**: A 5-level analysis pipeline that interprets intent, detects domains (with multi-domain blending), extracts and infers entities, detects workflows, and manages clarification loops.
3.  **Plan Generator**: Creates a detailed ProjectPlan outlining the tech stack, module breakdown, data model, pages, API endpoints, workflows, user roles, and file blueprints.
4.  **Plan-Driven Code Generator**: Generates complete, runnable projects based on approved plans, including configuration files, main application structure, utility functions, and a set of core UI components. It also generates Dashboard, List, Detail (with inline child entity forms), and Generic page types, along with a full backend (schema, database, storage, routes).
5.  **Conversation Phase Handler**: Manages a 6-phase conversation flow (initial, understanding, clarifying, planning, approval, generating, complete) with phase recovery and natural language interaction.

### AI Intelligence Layer
-   **Contextual Reasoning Engine** (1,566 lines): Semantic analysis of entity relationships, computed field inference, UI pattern detection (Kanban, Calendar, Card Grid), validation rule generation, business logic discovery. Now includes architecture pattern detection (pagination, search/filter, sorting, infinite-scroll, optimistic-updates), cross-entity logic inference (status propagation, cascade updates, aggregate computation), smart validation rules (date ranges, conditional required, uniqueness, numeric bounds, string lengths), and code quality pattern identification (shared utilities, error boundaries, loading states, empty states, Zod schemas).
-   **Domain Synthesis Engine** (696 lines): Dynamically synthesizes domain profiles from unrecognized descriptions using NLP patterns, fuzzy matching, and multi-domain blending.
-   **Adaptive Clarification Engine** (598 lines): Complexity-driven question depth, information gap tracking, priority-based question ordering, and smart stop conditions.
-   **Generation Learning Engine** (834 lines): Records generation patterns and outcomes to PostgreSQL, tracks user preferences, applies learned patterns. Bi-directional error learning to prevent recurring failures.
-   **Test Generator** (1,214 lines): Generates Vitest test files alongside app code — API route tests (CRUD for each entity), component render tests, validation tests, relationship tests, plus vitest.config.ts and test setup with mock providers.
-   **Well-Known App Fast-Path**: Bypasses clarification for 16 common app patterns.

### Post-Generation Validation & Auto-Fix
-   **Post-Generation Validator** (601 lines): 50+ package dependency checks, implicit dependency detection, smart stub generation.
-   **Vite & Runtime Error Fixer** (1,526 lines): 11 build-time error analyzers plus 12 runtime error analyzers (null reference, not-a-function, invalid React child, re-render loops, hook violations, missing keys, network errors, hydration failures). Includes proactive safety patching via `generateRuntimeSafetyPatches()` and error classification via `classifyRuntimeError()`.
-   **Auto-Run Preview** (641 lines): Client-side closed-loop debugging with auto-fix and preview refresh.

### Test Suite
-   **codegen-quality-test.ts** (888 lines): Per-entity quality validation across 5 apps, 8 categories (Schema, Routes/CRUD, UI/Pages, Semantic, Relationships, Infrastructure, Testing, Intelligence). Current score: 99% (A+), 931/943 pts.
-   **intelligence-pipeline.test.ts**: 29 integration tests for full pipeline.
-   **e2e-pipeline-quality.ts** (572 lines): End-to-end pipeline quality.
-   **stress-test-30-builds.ts**: Bulk generation stress testing.

### Data Storage
-   **Database**: PostgreSQL via Drizzle ORM (optional, falls back to in-memory).
-   **Schema**: Drizzle ORM schema (316 lines, 19 tables) for users, conversations, project files, project plans, and 3 learning tables.

### Platform Statistics
-   Source Lines of Code: 120,000+
-   Source Files: 216+
-   Server Modules: 46
-   React Components: 71
-   AI Intelligence Modules: 5 (contextual reasoning, domain synthesis, adaptive clarification, generation learning, test generation)
-   Domain Knowledge Profiles: 14
-   Code Generation Quality: 99% (A+), 931/943 pts across 8 categories

### Electron Desktop Mode
-   Primary runtime target with native file system access and local Node.js/npm execution.
-   **Bulk Cache Install**: On code generation, the entire pre-built `node_modules` cache is bulk-copied into the project directory via `fs.cpSync`, then a lightweight `npm install --prefer-offline` verifies the dependency tree. This reduces install time from ~50s to ~5s for typical projects.
-   **3-Path Install Flow**: (1) All deps cached → bulk copy + quick verify, (2) Some missing → bulk copy + `npm install --prefer-offline`, (3) No cache → full `npm install`.
-   **Adaptive Pre-warm Timeout**: WebContainer pre-warm uses `max(60s, 90s - elapsed)` adaptive timeout instead of hard 10s to avoid killing in-progress installs.
-   **Pre-warm Batching**: 90 packages split into 6 batches (10, 9, 12, 14, 18, 21 packages). Stall detection filters npm spinner chars (`|/-\`) so only real progress resets the 90s stall timer. Per-batch timeout: 180s.

### Code Runner System (Client-side)
-   Supports two modes: WebContainer for browser-based runtime and Electron for native file system access.
-   Features live preview with auto-fix, zip export, and test generation/execution.
-   **Singleton Guard**: Module-level `activeRunId`/`activeRunPromise` prevents concurrent `autoRunProject()` calls; duplicate calls return the existing promise. Guard resets via `finally()` and `resetAutoRunGuard()` on stop/unmount.
-   **Pre-flight Verification**: Between npm install and dev server start, `preFlightVerifyCriticalFiles()` checks that critical UI files (toaster.tsx, use-toast.ts) have correct exports. Only fixes small generated files (< 3000 chars, no `// custom` or `// @user` markers) to avoid clobbering user content.

## External Dependencies

### Database
-   **PostgreSQL**: Primary database.

### AI/LLM Services
-   **OpenAI**: Optional GPT-4o integration.
-   **Google Generative AI**: For generative AI capabilities.

### Key NPM Packages
-   **Frontend**: React, Wouter, TanStack Query, Radix UI, Tailwind CSS, Framer Motion, Recharts.
-   **Backend**: Express, Drizzle ORM, Zod, Passport, express-session, multer, nodemailer, ws.
-   **Utilities**: nanoid, date-fns, uuid, xlsx, jszip.

### GitHub Integration
-   **@octokit/rest**: For GitHub API integration.

### WebContainer
-   **@webcontainer/api**: For browser-based Node.js runtime and live code preview.

### Electron (Desktop Mode)
-   **electron**: Desktop application framework.
-   **electron-builder**: For cross-platform packaging.

### Replit-Specific
-   **@replit/vite-plugin-runtime-error-modal**, **@replit/vite-plugin-cartographer**, **@replit/vite-plugin-dev-banner**: Development environment plugins.