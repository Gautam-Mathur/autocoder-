# AutoCoder - AI-Powered Code Generation Platform

## Overview
AutoCoder is an AI-powered, full-stack code generation platform designed to create production-ready, multi-file React+Vite+TypeScript applications from natural language descriptions. It features a dual intelligence architecture: a cloud-based pipeline with 13 specialized AI modules and a fully local AI engine with a 16-stage deterministic pipeline. The platform aims to democratize full-stack application development, offering deep domain understanding across 14 industries, a chat-based interface, 394 built-in templates, and continuous learning capabilities. It operates as a web application with an optional Electron desktop mode for native file system access.

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
4.  **Plan-Driven Code Generator**: Generates complete, runnable projects.
5.  **Conversation Phase Handler**: Manages an 8-phase conversation flow (initial, understanding, clarifying, planning, approval, generating, complete, editing) with phase recovery, deadlock detection, and natural language approval/modification.

### Pipeline Orchestrator & AI Module Team
The Pipeline Orchestrator coordinates 16 sequential stages, each representing a specialized team member with quality gates, metrics tracking, and error recovery: Product Manager, Project Manager, Senior Advisor, Technical Analyst, System Architect, UI/UX Designer, Feature Analyst, Database Engineer, API Architect, UI Engineer, Full-Stack Developer, DevOps Engineer, Code Reviewer, QA Engineer, Release Engineer, Knowledge Manager.

### AI Intelligence Modules (Cloud)
AutoCoder includes 13 specialized cloud-based AI modules for advanced reasoning, design, functionality, architecture planning, schema design, API design, component composition, code quality analysis, dependency resolution, domain synthesis, adaptive clarification, generation learning, and test generation.

### Local AI Engine (Fully Offline)
A complete local intelligence system designed to run on typical developer hardware without any cloud AI or neural network dependencies. It utilizes custom-built algorithms instead of LLMs, incorporating 8 core subsystems:
1.  **TF-IDF Pattern Matcher**: Token frequency scoring for semantic matching with O(1) token index lookups.
2.  **Rule-Based Reasoning Engine**: Deterministic if-then rule chains for domain detection, entity classification, and feature mapping.
3.  **Multi-Criteria Scoring Engine**: Weighted decision matrices for architecture selection and technology choices.
4.  **Template Selection System**: 394 templates across 8 categories with tokenized search indices.
5.  **Graph Analysis Engine**: Entity-relationship graphs with circular dependency detection and node centrality.
6.  **384-Dimensional Vector Embeddings**: Deterministic embeddings for cosine similarity without neural networks.
7.  **Intent Parser**: Natural language decomposition into structured intents via pattern matching.
8.  **Knowledge Synthesizer**: Combines all subsystem outputs into coherent, domain-aware project plans.

This local engine executes a 16-stage pipeline (55-95ms, 92-94/100 quality) generating 24-27 files with 39-45 tests per project.

**16 Local Pipeline Stages**: Intent Interpreter, Strategic Planner, Constraint Analyzer, Semantic Domain Modeler, Architecture Synthesizer, Adaptive UX Designer, Feature Interaction Graph, Database Intelligence, API Designer, Component Mapper, Code Synthesizer, Dependency Optimizer, Static Auditor, Test Generator, Runtime Simulator, Learning Brain.

**Template Library**: 104 App Archetypes, 30 Domain Profiles, 15 Architecture Patterns, 40 Schema Templates, 30 API Templates, 50 UI Components, 100 Code Snippets, 25 Test Patterns. Template Registry (`server/modules/template-registry.ts`) uses token overlap scoring (2pts exact, 1pt partial) for matching.

**Source Files**: `local-ai-engine.ts` (1,420 lines), `template-registry.ts` (275), `knowledge-stages.ts` (998), `deterministic-stages.ts` (1,160), `generation-stages.ts` (957), `learning-stage.ts` (372), `local-pipeline-router.ts` (543), 8 template files (17,899). Total: 23,624 lines.

**Local AI API Endpoints**: `POST /api/local-pipeline/run`, `GET /api/local-pipeline/stages`, `POST /api/local-ai/parse-intent`, `POST /api/local-ai/search-similar`, `GET /api/local-ai/stats`, `POST /api/local-ai/feedback`.

### Interactive Iterative Editing System
Post-generation editing allowing users to modify generated projects conversationally without full regeneration:
-   **Project Context Manager** (`server/modules/project-context-manager.ts`, 595 lines): Indexes project files, tracks imports/exports, builds dependency graphs, finds related files for cascade edits.
-   **Targeted Code Editor** (`server/modules/targeted-code-editor.ts`, 1,550 lines): Produces surgical file edits for 6 types: style, content, structure, feature, fix, refactor. Uses regex-based parsing for deterministic operation.
-   **Conversation Phase Handler** (`server/modules/conversation-phase-handler.ts`, 727 lines): Extended with 'editing' phase, edit history tracking (persisted to DB, last 50 entries), iterative modification support.
-   **Frontend**: Real-time edit notifications with file icons (FilePlus/FileCode/FileX), editing phase indicator, contextual input placeholder ("Describe what you'd like to change...").
-   **Edit Cascade Detection**: Schema changes trigger API and component updates; route changes update navigation.
-   **Edit History**: Persisted to conversation state via `updateProjectContext`, includes user message and file changes per entry.
-   **Conversation Context**: Last 6 messages passed to edit engine for intent classification and target resolution.

### Post-Generation Validation & Auto-Fix
Performs multi-pass validation, dependency checks, context-aware stub generation, cross-file consistency, and analyzes/fixes build-time and runtime errors. An auto-run preview system monitors for errors and applies patches. Error panel routes errors into chat for conversational fixing.

### Well-Known App Fast-Path
Recognizes 16 common application patterns to expedite generation by bypassing clarification.

### Electron Desktop Mode
Provides native file system access, local Node.js/npm execution, bulk cache installs, and project persistence at `~/AutoCoder/projects/`.

### Code Runner System (Client-side)
Supports WebContainer for browser runtime and Electron for native access, offering live preview, zip export, and test execution.

### Generation Learning Engine
Records generation patterns, outcomes, and user modifications for continuous improvement. Learning data is stored in PostgreSQL and a portable `learning-data.json` file, ensuring knowledge carries across deployments. It tracks over 1,000 patterns across various categories like entity-structure, workflow-design, UI-layout, and error-prevention.

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

## Platform Statistics
-   Source Lines of Code: 149,000+ | Source Files: 233+ | Server Modules: 64 | Template Files: 8 (394 templates)
-   Server Module Lines: 55,500+ | React Components: 71 frontend components
-   AI Modules: 13 cloud + 8 local subsystems | Local AI: 23,624 lines
-   Interactive Editing: 2,872 lines across 3 modules (Project Context Manager + Targeted Code Editor + Conversation Phase Handler)
-   Domain Knowledge: 14 industry domains + 30 template domain profiles
-   Quality: Local pipeline 94/100 (55-95ms) | Cloud pipeline 99% A+ grade
-   Learning Engine: 1,021+ patterns across 9 categories with PostgreSQL + file persistence

## Recent Changes
-   **Feb 13, 2026**: Added interactive iterative editing system. Project Context Manager (595 lines), Targeted Code Editor (1,550 lines), extended Conversation Phase Handler (727 lines). Frontend shows file edit notifications with color-coded icons. Edit history persisted to conversation state (last 50 entries). Conversation history (last 6 messages) passed to edit engine for better intent classification. Error panel routes errors into chat for conversational fixing.
-   **Feb 13, 2026**: Built Local AI Engine with 8 subsystems, 16-stage pipeline, 394 templates across 8 categories. Template registry with token-based matching integrated into all stages. 92-94/100 scores, 55-95ms execution. Added Local AI API endpoints. Pushed 269 files to GitHub.
-   **Feb 2026**: Added 6 cloud AI modules + Pipeline Orchestrator. 16-stage coordinated generation with fallback. Learning engine records orchestration metrics.
-   **Feb 2026**: Fixed Generation Learning Engine portability. File-based persistence, REST API, knowledge carries across deployments.
-   **Feb 2026**: Scaled Learning Engine to 1,021 patterns across 9 types.
