# AutoCoder - AI-Powered Code Generation Platform

## Overview
AutoCoder is an AI-powered, full-stack code generation platform creating production-ready, multi-file React+Vite+TypeScript applications from natural language descriptions. It features a dual intelligence architecture: a cloud-based pipeline with 13 specialized AI modules and a fully local AI engine with a 16-stage deterministic pipeline. The platform aims to democratize full-stack application development, offering deep domain understanding across 14 industries, a chat-based interface, 394 built-in templates, and continuous learning capabilities. It operates as a web application with an optional Electron desktop mode for native file system access.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
-   **Framework**: React 18 with TypeScript, Wouter for routing, TanStack Query for state management.
-   **Styling**: Tailwind CSS with CSS variables, utilizing shadcn/ui components.
-   **Build Tool**: Vite.
-   **UI/UX Decisions**: Features inline "Add" forms, semantic inputs, dashboard KPIs with semantic type detection, and UI pattern pages (Kanban, Calendar, Card Grid) with Table fallback and view toggle.

### Backend
-   **Runtime**: Node.js with Express.js (TypeScript, ESM modules).
-   **API Pattern**: RESTful endpoints.
-   **Security**: COOP/COEP headers for WebContainer isolation.

### Plan-Driven Code Generation Pipeline
The system uses a multi-phase intelligent approach, including a Domain Knowledge Library, Deep Understanding Engine, Plan Generator, Plan-Driven Code Generator, and Conversation Phase Handler managing an 8-phase conversation flow.

### Pipeline Orchestrator & AI Module Team
The Pipeline Orchestrator coordinates 16 sequential stages, each representing a specialized team member (e.g., Product Manager, System Architect, Full-Stack Developer) with quality gates, metrics tracking, and error recovery.

### AI Intelligence Modules (Cloud)
AutoCoder includes 13 specialized cloud-based AI modules for advanced reasoning, design, functionality, architecture planning, schema design, API design, component composition, code quality analysis, dependency resolution, domain synthesis, adaptive clarification, generation learning, and test generation.

### Local AI Engine (Fully Offline)
A complete local intelligence system runs on typical developer hardware without cloud AI or neural network dependencies. It utilizes custom-built algorithms instead of LLMs, incorporating 8 core subsystems (e.g., TF-IDF Pattern Matcher, Rule-Based Reasoning Engine, Graph Analysis Engine, Template Selection System). This local engine executes a 16-stage pipeline generating complete projects.

### Interactive Iterative Editing System
Post-generation editing allows users to modify generated projects conversationally without full regeneration. Key components include a Project Context Manager, Targeted Code Editor for surgical file edits, and an extended Conversation Phase Handler with edit history tracking.

### Post-Generation Validation & Auto-Fix
Performs multi-pass validation, dependency checks, context-aware stub generation, cross-file consistency, and analyzes/fixes build-time and runtime errors. An auto-run preview system monitors for errors and applies patches.

### Well-Known App Fast-Path
Recognizes 16 common application patterns to expedite generation by bypassing clarification.

### Electron Desktop Mode
Provides native file system access, local Node.js/npm execution, bulk cache installs, and project persistence.

### Code Runner System (Client-side)
Supports WebContainer for browser runtime and Electron for native access, offering live preview, zip export, and test execution.

### Generation Learning Engine
Records generation patterns, outcomes, and user modifications for continuous improvement. Learning data is stored in PostgreSQL and a portable `learning-data.json` file, ensuring knowledge carries across deployments.

### CodeGen V2 Engine
Complete overhaul of code generation replacing a template-based approach with a dependency-tracked composable architecture. It includes six new modules: `codegen-components.ts` for pre-built components with dependency tracking, `codegen-field-resolver.ts` for smart field-to-component mapping, `codegen-page-builder.ts` for composable page generation with CRUD operations, `codegen-validator.ts` for post-generation validation, `codegen-orchestrator.ts` for pipeline orchestration, and `codegen-e2e-test.ts` for end-to-end testing.

**Warmup/Pre-flight Alignment (Feb 2026):**
-   Generated `tsconfig.node.json` alongside `tsconfig.json` so Vite doesn't crash on missing reference.
-   Toast system (`use-toast.ts`, `toaster.tsx`) exactly matches auto-runner's `CRITICAL_UI_FILES` — standalone `toast` export, `// @generated` marker, self-contained global state (no Radix dependency). Pre-flight patching is no longer needed.
-   Package versions in `AVAILABLE_DEPS`/`DEV_DEPS` synced to `PREWARM_BATCHES` in `webcontainer.ts` — prevents npm re-downloads on cached WebContainers.
-   `ProgressCallback` added to `generateProject()` and threaded through `plan-driven-generator.ts` into `pipeline-orchestrator.ts` for per-phase stage announcements (components, config, schema, pages, validation).

## External Dependencies

### Database
-   **PostgreSQL**: Primary relational database (Neon-backed on Replit), with fallback to in-memory storage. Used for pipeline execution tracking, generation learning persistence, edit history storage, and application data.

### AI/LLM Services
-   **OpenAI**: Optional GPT-4o integration (cloud pipeline only).
-   **Google Generative AI**: Optional generative AI capabilities (cloud pipeline only).
-   **Local AI Engine**: Fully offline alternative requiring zero external API keys.

### Key NPM Packages
-   **Frontend**: React 18, Wouter, TanStack Query, Radix UI, Tailwind CSS, Framer Motion, Recharts, Lucide React.
-   **Backend**: Express, Drizzle ORM, Zod, Passport, express-session, multer, nodemailer, ws.
-   **Utilities**: nanoid, date-fns, uuid, xlsx, jszip, archiver, adm-zip.
-   **Code Generation**: @webcontainer/api.
-   **Desktop**: electron, electron-builder.

### GitHub Integration
-   **@octokit/rest**: For GitHub API interactions, utilizing a full tree replacement push strategy with parallel batch uploads, integrated via Replit GitHub connector.

### Replit-Specific
-   **@replit/vite-plugin-runtime-error-modal**, **@replit/vite-plugin-cartographer**, **@replit/vite-plugin-dev-banner**: Replit development environment plugins.