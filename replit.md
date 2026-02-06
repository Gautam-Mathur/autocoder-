# AutoCoder - AI-Powered Code Generation Platform

## Overview

AutoCoder is a full-stack AI-powered code generation platform designed to transform natural language descriptions into production-ready, multi-file, full-stack applications. It integrates advanced AI-like intelligence modules that operate locally, providing a chat-based interface for users to generate and preview applications. The platform supports both cloud AI and an offline local template engine, running as a web application with an optional Electron desktop mode for native file system access. Its core vision is to democratize full-stack application development by making it accessible through natural language.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter
- **State Management**: TanStack Query
- **Styling**: Tailwind CSS with CSS variables, shadcn/ui for components
- **Build Tool**: Vite
- **Code Display**: Monaco-style editor integration with syntax highlighting
- **Key Pages**: Landing, Chat interface, VAPT Dashboard

### Backend
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript (ESM modules)
- **API Pattern**: RESTful endpoints
- **Dev Mode**: Vite middleware through Express
- **Production**: Serves static files from `dist/public`
- **Security**: COOP/COEP headers for WebContainer isolation

### Intelligence Modules
The backend features 34 intelligence modules including:
- **NLU & Intent Recognition**: For understanding natural language prompts.
- **Code Generation**: Advanced capabilities for generating complete projects.
- **Reasoning & Planning**: For structuring the development process.
- **Memory & Context**: To maintain conversational and project context.
- **Code Analysis**: Live analysis, explanation, and validation of generated code.
- **Debugging**: Continuous debugging engines.
- **Security & Testing**: Modules for vulnerability assessment, penetration testing (VAPT) and test generation.
- **Preview & Export**: Manages live project previews and export functionalities.
- **Knowledge Base**: Stores framework patterns and multi-language templates.

### Data Storage
- **Database**: PostgreSQL via Drizzle ORM (optional, falls back to in-memory)
- **Schema**: Defined using Drizzle's `pgTable` definitions for entities like users, conversations, messages, project files, and VAPT data.
- **ORM**: Drizzle ORM with `drizzle-zod` for validation.
- **Conversations**: Store comprehensive project context including tech stack, features, and security scores.

### Port Configuration
- **Server**: Defaults to port 5000 (Replit mapping).
- **Generated Projects**: Utilize port 5200 for Vite dev servers.
- **Electron/Local**: Connects on port 5200.

### Electron Desktop Mode
- **Purpose**: Enables native file system access, overcoming browser limitations.
- **Processes**: Main process for window management and IPC, preload script for context bridge.
- **Services**: Local runner for file I/O and npm, project manager for workspace handling, logger.
- **IPC Channels**: For file operations, npm commands, server control, and project management.

### Code Runner System (Client-side)
- **Modes**: WebContainer for browser-based runtime, Electron for native file system.
- **Runner Factory**: Selects appropriate runner based on environment.
- **Features**: Live preview, zip export, test generation and execution.

### Build System
- **Development**: `tsx` for server with Vite for HMR.
- **Production**: Custom build script using Vite for client and esbuild for server.
- **Output**: Client assets to `dist/public`, server bundle to `dist/index.cjs`.

## External Dependencies

### Database
- **PostgreSQL**: Primary database, configured via `DATABASE_URL`. Uses `pg` package.

### AI/LLM Services
- **OpenAI**: Optional GPT-4o integration.
- **Google Generative AI**: `@google/generative-ai` package.

### Key NPM Packages
- **Frontend**: React, Wouter, TanStack Query, Radix UI, Tailwind CSS, Framer Motion, Recharts.
- **Backend**: Express, Drizzle ORM, Zod, Passport, express-session, multer, nodemailer, ws.
- **Utilities**: nanoid, date-fns, uuid, xlsx, jszip.

### GitHub Integration
- **@octokit/rest**: For GitHub API integration (pushing code to repositories).

### WebContainer
- **@webcontainer/api**: For browser-based Node.js runtime and live code preview.

### Electron (Desktop Mode)
- **electron**: Desktop application framework.
- **electron-builder**: For cross-platform packaging.

### Replit-Specific
- **@replit/vite-plugin-runtime-error-modal**, **@replit/vite-plugin-cartographer**, **@replit/vite-plugin-dev-banner**: Development environment specific plugins.