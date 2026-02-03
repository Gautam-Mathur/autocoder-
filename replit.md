# AutoCoder - AI-Powered Code Generation Assistant

## Overview

AutoCoder is a full-stack web application that provides an AI-powered code generation assistant. Users describe what they want to build in natural language, and the system generates production-ready HTML, CSS, JavaScript, and React code with live preview capabilities. The application operates in two modes: Cloud AI (GPT-4o via OpenAI) for intelligent context-aware generation, or a built-in local template engine that works offline without API keys.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack Query (React Query) for server state
- **Styling**: Tailwind CSS with CSS variables for theming
- **UI Components**: shadcn/ui built on Radix UI primitives
- **Build Tool**: Vite with hot module replacement

The frontend follows a component-based architecture with pages in `client/src/pages/` and reusable components in `client/src/components/`. The chat interface supports real-time streaming responses and includes a live code preview panel that renders generated HTML/CSS in a sandboxed iframe.

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Runtime**: Node.js with tsx for development
- **API Pattern**: RESTful endpoints under `/api/`
- **Database ORM**: Drizzle ORM with PostgreSQL dialect

The server handles conversation management, message storage, and AI integration. Routes are registered in `server/routes.ts`. The application extracts project context from conversations to maintain continuity across messages.

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Location**: `shared/schema.ts`
- **Key Tables**:
  - `conversations`: Stores chat sessions with project context (name, tech stack, features built)
  - `messages`: Stores individual messages with role (user/assistant) and content
  - `projectFiles`: Stores generated code files per conversation
  - `users`: Basic user authentication support

### Code Generation Engine
- **Primary**: OpenAI GPT-4o for intelligent, context-aware generation
- **Fallback**: Local template engine in `client/src/lib/code-generator/` with 20+ professional templates
- **Features**: Synonym expansion, fuzzy matching, typo tolerance via Levenshtein distance

### AI Integrations
The `server/replit_integrations/` folder contains modular AI capabilities:
- **audio/**: Voice chat with speech-to-text and text-to-speech streaming
- **chat/**: Standard text chat with OpenAI
- **image/**: Image generation using gpt-image-1
- **batch/**: Rate-limited batch processing utilities

### Intelligence Modules
The `server/modules/` folder contains 8 advanced AI intelligence modules:
- **clarification-engine.ts**: Analyzes user prompts for ambiguity and asks smart clarifying questions before code generation
- **planning-module.ts**: Generates architecture documentation, folder structure, and tech stack justification
- **testing-engine.ts**: Auto-generates unit tests and integration tests, validates build success
- **security-module.ts**: Scans for vulnerabilities, validates inputs, checks auth guards, provides security warnings
- **transparency-module.ts**: Logs what was generated, why decisions were made, and assumptions
- **intel-memory.ts**: Stores user preferences and architectural choices, learns from past generations
- **dependency-intelligence.ts**: Auto-detects dependencies, generates .env.example, warns about insecure configs
- **export-system.ts**: Downloads generated projects as zip files with all files, configs, and documentation

### Auto-Fix System
The preview panel includes an intelligent auto-fix system that:
- Transforms ES6 imports/exports to browser-compatible code
- Strips import statements (type, named, namespace, default, side-effect)
- Converts `export default` to `window` assignments for global access
- Detects React code and auto-injects React 18, ReactDOM, and Babel from CDN
- Provides React hooks globally (useState, useEffect, etc.)
- Auto-creates `#root` element and renders App component with fallback checks
- Catches and reports runtime errors with auto-fix suggestions

### Intelligence API Endpoints
- **POST /api/analyze-prompt**: Clarification engine analysis
- **POST /api/plan**: Architecture planning
- **POST /api/test**: Run automated tests
- **POST /api/security-scan**: Security vulnerability scanning
- **GET /api/transparency/:conversationId**: Get transparency reports
- **GET /api/intel/:conversationId**: Get intelligence records
- **POST /api/dependencies**: Dependency analysis
- **POST /api/export**: Generate project export zip

### Intelligence Panel UI
The preview panel includes an "Intel" tab that displays the IntelligencePanel component with 6 sub-tabs:
- **Overview/Stats**: Generation statistics and metrics
- **Security**: Security scan results and vulnerability reports
- **Tests**: Test execution results
- **Dependencies**: Dependency analysis and recommendations
- **Transparency**: Generation logs, assumptions, and change history
- **Logs**: Live application logger with filtering and statistics

### Logger System
The application includes a fully-featured logging system:
- **Backend Logger** (`server/modules/logger.ts`): Supports debug/info/success/warn/error levels with categories (API, AI, DB, Security, Chat, Perf)
- **Request Logging**: Automatic HTTP request/response logging with timing
- **LogViewer UI** (`client/src/components/LogViewer.tsx`): Real-time log viewer with live refresh, search, filtering by level/category, statistics, and export to JSON
- **API Endpoints**: GET /api/logs (with filters), GET /api/logs/stats, DELETE /api/logs

## External Dependencies

### AI Services
- **OpenAI API**: Primary AI provider for code generation and chat (GPT-4o model)
- **Environment Variables**: `AI_INTEGRATIONS_OPENAI_API_KEY`, `AI_INTEGRATIONS_OPENAI_BASE_URL`

### Database
- **PostgreSQL**: Primary database via `DATABASE_URL` environment variable
- **connect-pg-simple**: Session storage in PostgreSQL

### GitHub Integration
- **@octokit/rest**: GitHub API client for repository operations
- **Replit Connectors**: OAuth token management for GitHub access

### Key Frontend Libraries
- **@tanstack/react-query**: Server state management and caching
- **framer-motion**: Animations (implied by design docs)
- **lucide-react**: Icon library
- **react-icons**: Additional icons (Si* brand icons)
- **cmdk**: Command palette component

### Key Backend Libraries
- **drizzle-orm / drizzle-kit**: Database ORM and migrations
- **zod / drizzle-zod**: Schema validation
- **express-session**: Session management
- **nanoid**: Unique ID generation