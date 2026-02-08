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
-   **Contextual Reasoning Engine**: Performs semantic analysis of entity relationships, infers computed fields, detects UI patterns (e.g., Kanban, Calendar), and generates validation rules and business logic.
-   **Domain Synthesis Engine**: Dynamically synthesizes domain profiles from unrecognized descriptions using NLP patterns, fuzzy matching, and multi-domain blending.
-   **Adaptive Clarification Engine**: Implements complexity-driven question depth, tracks information gaps, prioritizes questions, and stops clarification when readiness is met, preventing redundant inquiries.
-   **Generation Learning Engine**: Records generation patterns and outcomes to a PostgreSQL database, tracks user preferences, and applies learned patterns to improve future generations. It includes bi-directional error learning to prevent recurring failures.
-   **Well-Known App Fast-Path**: Incorporates a mechanism to bypass clarification for 16 common app patterns, expediting generation for simple requests.

### Post-Generation Validation & Auto-Fix
-   **Post-Generation Validator** (601 lines): 50+ package dependency checks, implicit dependency detection, smart stub generation.
-   **Vite Error Fixer** (829 lines): 11 error type analyzers with closed-loop debugging.
-   **Auto-Run Preview** (641 lines): Client-side closed-loop debugging with auto-fix and preview refresh.

### Test Suite
-   **codegen-quality-test.ts** (759 lines): Per-entity quality validation across 5 apps, 6 categories. Current score: 99% (A+).
-   **intelligence-pipeline.test.ts**: 29 integration tests for full pipeline.
-   **e2e-pipeline-quality.ts** (572 lines): End-to-end pipeline quality.
-   **stress-test-30-builds.ts**: Bulk generation stress testing.

### Data Storage
-   **Database**: PostgreSQL via Drizzle ORM (optional, falls back to in-memory).
-   **Schema**: Drizzle ORM schema (316 lines, 19 tables) for users, conversations, project files, project plans, and 3 learning tables.

### Platform Statistics
-   Source Lines of Code: 117,000+
-   Source Files: 215+
-   Server Modules: 45
-   React Components: 71
-   AI Intelligence Modules: 4
-   Domain Knowledge Profiles: 14
-   Code Generation Quality: 99% (A+)

### Electron Desktop Mode
-   Enables native file system access and local execution of Node.js and npm commands.

### Code Runner System (Client-side)
-   Supports two modes: WebContainer for browser-based runtime and Electron for native file system access.
-   Features live preview with auto-fix, zip export, and test generation/execution.

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