# AutoCoder - AI-Powered Code Generation Platform

## Overview
AutoCoder is an AI-powered, full-stack code generation platform designed to create production-ready, multi-file React+Vite+TypeScript applications from natural language descriptions. It aims to democratize full-stack application development. The platform utilizes a 16-stage pipeline orchestrator coordinating 13 specialized AI modules, mimicking a full development team. It features deep domain understanding across 14 industries, a chat-based interface, and advanced local intelligence. It supports both cloud AI and an offline local template engine, operating as a web application with an optional Electron desktop mode for native file system access.

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
The system uses a multi-phase intelligent approach:
1.  **Domain Knowledge Library**: Comprehensive library covering 14 industry domains.
2.  **Deep Understanding Engine**: 5-level analysis for intent decomposition, domain detection, entity extraction, workflow detection, and clarification.
3.  **Plan Generator**: Creates a detailed `ProjectPlan` including tech stack, module breakdown, data model, pages, API endpoints, workflows, user roles, and file blueprints.
4.  **Plan-Driven Code Generator**: Generates complete, runnable projects including configuration, app structure, core and shared UI components, and full backend.
5.  **Conversation Phase Handler**: Manages a 6-phase conversation flow (initial → understanding → clarifying → planning → approval → generating → complete) with phase recovery, deadlock detection, and natural language approval/modification. Integrates the Pipeline Orchestrator.

### Pipeline Orchestrator & AI Module Team
The Pipeline Orchestrator coordinates 16 sequential stages, each representing a specialized team member with quality gates, metrics tracking, and error recovery:
-   **Stages**: Product Manager, Project Manager, Senior Advisor, Technical Analyst, System Architect, UI/UX Designer, Feature Analyst, Database Engineer, API Architect, UI Engineer, Full-Stack Developer, DevOps Engineer, Code Reviewer, QA Engineer, Release Engineer, Knowledge Manager.
Each stage produces a `StageResult` with quality score, warnings, errors, and output data, which are aggregated into an `OrchestrationResult`.

### AI Intelligence Modules (13 Modules)
1.  **Contextual Reasoning Engine**: Multi-dimensional semantic analysis for entity relationships, UI patterns, validation rules, and business logic.
2.  **Design System Engine**: Domain-aware visual design system generator, producing color palettes, typography, and component styles including dark mode.
3.  **Functionality Engine**: Entity-aware feature intelligence, classifying entities and mapping them to interactive features, CRUD enhancements, data display, and automation. Determines page layouts and generates feature specifications.
4.  **Architecture Planner**: Determines overall application architecture including pattern selection, folder structure, state management, authentication, data flow, performance, error handling, and routing.
5.  **Schema Designer**: Designs normalized relational schemas, including column types, indexing, foreign keys, junction tables, enums, constraints, soft delete, and audit trails.
6.  **API Designer**: Designs complete RESTful API layers, including CRUD routes, search endpoints, nested resources, batch operations, file uploads, pagination, Zod validation, middleware, rate limiting, and standardized error/response formats.
7.  **Component Composer**: Plans the complete component tree, including layout components, shared presentational components, per-entity container components, context boundaries, custom hooks, accessibility, responsive design, and animation.
8.  **Code Quality Engine**: Performs static analysis across 8 categories (TypeScript, React Patterns, Error Handling, UI States, Performance, Accessibility, Code Style, Security) with letter grading and issue reporting.
9.  **Dependency Resolver**: Scans generated code to select optimal NPM packages from a registry, estimates bundle size, detects conflicts, and suggests optimizations.
10. **Domain Synthesis Engine**: Dynamically synthesizes domain profiles for novel project descriptions by extracting entities, inferring workflows, and blending features from known domains.
11. **Adaptive Clarification Engine**: Manages clarification question depth based on project complexity, tracking information gaps and prioritizing questions.
12. **Generation Learning Engine**: Records generation patterns, outcomes, and user modifications for continuous improvement, applying learned patterns and error fixes proactively.
13. **Test Generator**: Generates comprehensive Vitest test files for API routes, components, validation, and relationships, integrated into the final output.

### Post-Generation Validation & Auto-Fix
-   **Post-Generation Validator**: Performs multi-pass validation on generated files, checks dependencies, generates context-aware stubs for missing files, and ensures cross-file consistency.
-   **Vite & Runtime Error Fixer**: Analyzes build-time and runtime errors, applies proactive safety patching, and classifies errors for fix strategies.
-   **Auto-Run Preview**: Client-side debugging system that monitors WebContainer preview for errors, posts details to the auto-fix endpoint, applies patches, and refreshes the preview.

### Well-Known App Fast-Path
Recognizes 16 common application patterns to bypass clarification and immediately generate an optimized plan.

### Electron Desktop Mode
-   Primary runtime target with native file system access and local Node.js/npm execution.
-   Features bulk cache install for `node_modules` and adaptive pre-warm timeouts.
-   Projects stored at `~/AutoCoder/projects/` with full persistence.
-   IPC bridge for file I/O, npm operations, dev server management, and project management.
-   Security measures: `nodeIntegration: false`, `contextIsolation: true`, preload-based API exposure.

### Code Runner System (Client-side)
-   Supports WebContainer for browser runtime and Electron for native file system access.
-   Provides live preview, zip export, and test generation/execution.
-   Includes a singleton guard for `autoRunProject()` and pre-flight verification before dev server start.
-   Runner factory automatically detects environment and selects the appropriate runner.

## External Dependencies

### Database
-   **PostgreSQL**: Primary relational database (Neon-backed on Replit), with fallback to in-memory storage.

### AI/LLM Services
-   **OpenAI**: Optional GPT-4o integration.
-   **Google Generative AI**: For generative AI capabilities.

### Key NPM Packages
-   **Frontend**: React 18, Wouter, TanStack Query, Radix UI, Tailwind CSS, Framer Motion, Recharts, Lucide React icons.
-   **Backend**: Express, Drizzle ORM, Zod, Passport, express-session, multer, nodemailer, ws.
-   **Utilities**: nanoid, date-fns, uuid, xlsx, jszip, archiver, adm-zip.
-   **Code Generation**: @webcontainer/api.
-   **Desktop**: electron, electron-builder.

### GitHub Integration
-   **@octokit/rest**: For GitHub API interactions, utilizing a full tree replacement push strategy with parallel batch uploads.

### Replit-Specific
-   **@replit/vite-plugin-runtime-error-modal**, **@replit/vite-plugin-cartographer**, **@replit/vite-plugin-dev-banner**: Replit development environment plugins.

## Platform Statistics
-   Source Lines of Code: 121,000+
-   Source Files: 225+
-   Server Modules: 55
-   React Components: 78
-   AI Intelligence Modules: 13 specialized modules + Pipeline Orchestrator (16 stages)
-   Domain Knowledge Profiles: 14 industry domains
-   Code Generation Quality: 99% (A+ grade), 931/943 pts across 8 categories
-   Pipeline Stages: 16 sequential stages with quality gates
-   Plan-Driven Generator: 2,628 lines, 36 generator functions
-   Deep Understanding Engine: 776 lines, 5-level analysis pipeline
-   Post-Generation Validator: 617 lines, 50+ dependency packages
-   Conversation Phase Handler: 520 lines, 6-phase state machine with orchestrator integration
-   Vite Error Fixer: 1,526 lines, 23 error type analyzers (11 build-time + 12 runtime)

## Recent Changes
-   **Feb 2026**: Added 6 new specialized AI modules (Architecture Planner, Schema Designer, API Designer, Component Composer, Code Quality Engine, Dependency Resolver) and Pipeline Orchestrator. Integrated orchestrator into conversation-phase-handler for 16-stage coordinated generation. Added fallback to direct generation on orchestrator failure. Test files now merged into final output. Learning engine records orchestration metrics.