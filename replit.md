# AutoCoder - AI-Powered Code Generation Assistant

## Overview

AutoCoder is a full-stack web application that empowers users to generate production-ready HTML, CSS, JavaScript, and React code from natural language descriptions. It offers a live preview and operates in two modes: an intelligent Cloud AI (GPT-4o via OpenAI) for context-aware generation and a built-in local template engine for offline use. The project aims to provide a comprehensive, intelligent coding assistant that not only generates code but also supports the entire development lifecycle, from planning and testing to deployment and security.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework & Libraries**: React 18 with TypeScript, Wouter for routing, TanStack Query for server state, Tailwind CSS for styling, shadcn/ui for UI components, Vite as build tool.
- **Key Features**: Component-based architecture, real-time streaming chat, live code preview in a sandboxed iframe, multi-tab VS Code-like IDE for file management and editing, integrated terminal with WebContainer, GitHub import, and file upload capabilities.
- **Preview Panel Tabs**: Includes Preview, Code, Debug, Intel (with security, tests, dependencies, transparency, logs), Test, Deploy, and IDE.

### Backend
- **Framework & Libraries**: Express.js with TypeScript, Node.js runtime.
- **API**: RESTful endpoints.
- **Core Functionality**: Conversation management, message storage, AI integration, context extraction for conversation continuity.
- **Multi-Language Backend Support**: Templates for Python (FastAPI, Flask), Go (Gin), and Rust (Actix-web).

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM.
- **Schema**: `conversations` (chat sessions), `messages` (chat content), `projectFiles` (generated code), `users` (authentication), plus VAPT tables (`vapt_assets`, `vapt_vulnerabilities`, `vapt_scans`, `vapt_schedules`, `vapt_audit_logs`, `vapt_team_members`).

### VAPT Dashboard (/vapt)
- **Overview**: Built-in Vulnerability Assessment and Penetration Testing dashboard with 8 tabs (Overview, Assets, Vulnerabilities, Scans, OWASP, Remediation, Reports, Audit).
- **Features**: Asset management, vulnerability scanning simulation, severity classification, OWASP Top 10 compliance tracking, remediation workflow, scan scheduling, risk scoring, and audit logging.
- **API**: RESTful endpoints with Zod validation at `/api/vapt/*` for assets, vulnerabilities, scans, schedules, team members, and audit logs.

### AI & Intelligence Modules
- **Code Generation**: Dual-mode AI system:
    - **Primary**: Local LLM (Ollama) - FREE, runs locally at localhost:11434
    - **Fallback**: OpenAI GPT-4o (cloud) - only used when local LLM unavailable
    - **Template Engine**: 20+ instant templates for offline use
- **LLM Training Context**: Specialized code training for local LLM (`server/modules/llm-training-context.ts`)
    - CODE_PATTERNS: React, Express, HTML, CSS, JavaScript utility patterns
    - PROJECT_EXAMPLES: Complete working examples (todo app, API server)
    - CODE_EDITING_PATTERNS: How to add functions, fix bugs, add features
    - ERROR_FIXES: Common error patterns and solutions
    - Task-specific prompts for generate/edit/fix/understand
- **Code Intelligence API** (local LLM required):
    - `POST /api/ai/understand` - Analyze code and explain what it does
    - `POST /api/ai/edit` - Modify code based on instructions
    - `POST /api/ai/fix` - Fix bugs and errors in code
    - `GET /api/ai/status` - Check if local LLM is available
- **Advanced AI Capabilities** (works offline):
    - `POST /api/ai/plan` - Multi-step reasoning: analyzes prompts, breaks into steps, generates architecture decisions, risk assessment, timeline estimates
    - `POST /api/ai/quick-analyze` - Fast intent/complexity analysis
    - `POST /api/ai/analyze-code` - Live code analysis: errors, warnings, complexity metrics, suggestions
    - `POST /api/ai/diagnose` - Error diagnosis with possible causes and fixes
    - `POST /api/ai/auto-fix` - Automatic code fixes for common issues
    - `POST /api/ai/learn` - Context memory: learns user preferences from interactions
    - `GET /api/ai/context/:userId` - Retrieve user preferences and history
    - `POST /api/ai/relevant-context` - Get relevant past context for new prompts
    - `GET /api/ai/patterns` - Framework patterns library (React, Python, Go, utilities)
    - `GET /api/ai/patterns/:id` - Get specific pattern with code template
- **Claude-Level Capabilities** (works offline):
    - `POST /api/ai/nlu` - Full NLU analysis: intent, entities, semantics, sentiment
    - `POST /api/ai/intent` - Intent classification only
    - `POST /api/ai/entities` - Entity extraction only
    - `POST /api/ai/explain` - Nuanced code explanation with pattern detection
    - `POST /api/ai/detect-patterns` - Detect design patterns and idioms in code
    - `GET /api/ai/concepts/:id` - Programming concept encyclopedia
    - `GET /api/ai/concepts?q=query` - Search programming concepts
    - `GET /api/ai/best-practices` - Best practices database
    - `GET /api/ai/best-practices/:id` - Specific best practice
    - `GET /api/ai/learning-path/:topic` - Learning paths for topics
    - `POST /api/ai/follow-up` - Follow-up detection with pronoun resolution
    - `POST /api/ai/context-update` - Update conversation context
    - `POST /api/ai/clarification` - Smart clarification generation
    - `POST /api/ai/response-hints` - Context-aware response hints
    - `GET /api/ai/conversation/:id/summary` - Conversation summary
- **ENHANCED Claude-Level Capabilities** (NEW - 7 modules, 100% offline):
    - **Enhanced Intent Recognition** (`server/modules/enhanced-intent-recognition.ts`):
        - 100+ patterns with fuzzy matching (Levenshtein distance)
        - Semantic clustering for related intents
        - Multi-intent detection with confidence scoring
        - Question type classification (who/what/why/how/when)
        - API: `POST /api/ai/enhanced/intent`
    - **Advanced Code Generation** (`server/modules/advanced-code-generation.ts`):
        - Multi-file project scaffolding for 20+ stacks
        - Supports: React, Next.js, Vue, Svelte, Python, Go, Rust, Java, etc.
        - Features: auth, database, API, styling, testing configuration
        - API: `POST /api/ai/enhanced/generate-project`
    - **Universal Code Explanation** (`server/modules/universal-code-explanation.ts`):
        - 20+ languages with 50+ AST-like patterns
        - Line-by-line analysis with concept identification
        - Data flow tracking and pattern detection
        - API: `POST /api/ai/enhanced/explain-code`
    - **Deep Debugging Engine** (`server/modules/deep-debugging-engine.ts`):
        - 20+ error patterns (TypeError, SyntaxError, network, etc.)
        - Stack trace parsing and variable tracking
        - Automated fix chains with confidence scoring
        - API: `POST /api/ai/enhanced/analyze-error`
    - **Context Window Manager** (`server/modules/context-window-manager.ts`):
        - Smart chunking with token estimation
        - 3-10x compression for conversation history
        - Simulates 100K+ token context for Claude-like memory
        - Relevance scoring for context retrieval
        - API: `POST /api/ai/enhanced/context/*`
    - **Multi-Language Templates** (`server/modules/multi-language-templates.ts`):
        - 36+ programming languages with syntax definitions
        - Code snippets, framework templates, best practices
        - Language-specific patterns and idioms
        - API: `GET /api/ai/enhanced/languages`, `POST /api/ai/enhanced/snippet`
    - **True Conversational AI** (`server/modules/true-conversational-ai.ts`):
        - Semantic memory with short-term and long-term storage
        - Topic tracking and coreference resolution
        - Personality adaptation based on user preferences
        - Response hints and clarification generation
        - API: `POST /api/ai/enhanced/conversation/*`
- **DEEP PROJECT GENERATOR** (NEW - Enterprise-level code generation):
    - **Deep Project Generator** (`server/modules/deep-project-generator.ts`):
        - Generates **standalone new projects** (not modifications to this repo)
        - 10 project blueprints (fullstack, SaaS, API, e-commerce, CMS, etc.)
        - Generates 50-130+ files per project (vs. previous 6-10)
        - 5 feature modules (auth, dashboard, CRUD, settings, notifications)
        - Recursive component generation with proper import chains
        - Full backend: routes, controllers, services, validators
        - Database layer: Drizzle schema with types
        - State management: hooks, stores, context providers
        - 20+ UI components auto-generated
        - Test file generation
        - API: `GET /api/ai/deep/blueprints`, `GET /api/ai/deep/features`, `POST /api/ai/deep/generate`
- **Code Cleaner**: Removes markdown artifacts and fixes common syntax issues from generated code
- **Intelligence Modules**:
    - **Clarification Engine**: Analyzes prompts for ambiguity.
    - **Planning Module**: Generates architecture and tech stack justifications.
    - **Testing Engine**: Auto-generates unit/integration tests.
    - **Security Module**: Scans for vulnerabilities.
    - **Transparency Module**: Logs generation decisions.
    - **Intel Memory**: Stores user preferences and architectural choices.
    - **Dependency Intelligence**: Auto-detects dependencies and warns about insecure configurations.
    - **Export System**: Facilitates project downloads.
- **AI Integrations**: Modular capabilities for audio (voice chat), chat (OpenAI), image (gpt-image-1), and batch processing.

### Code Runner & Auto-Fix System
- **Code Runner**: Browser-based execution via WebContainer for Node.js projects, deployment guide generation, test generation, and AI-powered error fixing.
- **Auto-Fix System**: Real-time error detection and automatic fixes within the preview panel, handling ES6 import/export transformations, React injection, and global variable provisioning, with support for browser-compatible code.
- **Extended Feature Modules**: Includes Version History (undo/redo, diff view), ZIP Export (pure JS, auto-generates project files), Mobile Preview (device presets, responsive testing), Test Runner (browser-based, 15+ matchers), Vulnerability Scanner (CVE database, security patterns), Code Formatter (multi-language, linting), AI Context Persistence, Template Customization, Offline Mode, Progress Estimator, and Real-time Collaboration.

### Logging System
- **Backend Logger**: Supports various levels and categories (API, AI, DB, Security, Chat, Perf).
- **LogViewer UI**: Real-time log viewer with filtering, statistics, and export.

## External Dependencies

### AI Services
- **OpenAI API**: For GPT-4o model access.

### Database
- **PostgreSQL**: Primary database.

### GitHub Integration
- **@octokit/rest**: GitHub API client.
- **Replit Connectors**: For GitHub OAuth token management.

### Key Frontend Libraries
- **@tanstack/react-query**: Server state management.
- **framer-motion**: Animations.
- **lucide-react, react-icons**: Icon libraries.
- **cmdk**: Command palette.

### Live Preview System (Updated 2026-02-04)
- **Architecture**: Uses blob URLs with sandboxed iframes to render generated React/TypeScript code in real-time.
- **CDN Scripts**: React 18, ReactDOM 18, and Babel from jsdelivr.net with `crossorigin="anonymous"` for CORS compatibility.
- **Security**: Sandboxed iframe with `allow-scripts allow-same-origin` to execute generated code safely.
- **Error Handling**: Global error handlers, timeout fallbacks, and visible error messages for transpilation failures.
- **COEP Compatibility**: Blob URLs bypass the parent page's Cross-Origin-Embedder-Policy restrictions.
- **JSX Cleanup**: Regex patterns fix common malformed syntax patterns (e.g., `return (;`) before Babel transpilation.

### Key Backend Libraries
- **drizzle-orm / drizzle-kit**: ORM and migrations.
- **zod / drizzle-zod**: Schema validation.
- **express-session**: Session management.
- **nanoid**: ID generation.