# CodeAI - AI-Powered Code Generation Assistant

## Overview

CodeAI is a full-stack web application that provides an AI-powered code generation assistant. Users can describe what they want to build in natural language, and the system generates production-ready HTML, CSS, JavaScript, and React code. The app features a chat interface with conversation history, project file management, and live code previews.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack Query (React Query) for server state
- **Styling**: Tailwind CSS with CSS variables for theming
- **UI Components**: shadcn/ui component library (Radix UI primitives)
- **Build Tool**: Vite with HMR support

The frontend follows a component-based architecture with:
- Pages in `client/src/pages/` (landing, chat, not-found)
- Reusable components in `client/src/components/`
- UI primitives in `client/src/components/ui/`
- Custom hooks in `client/src/hooks/`
- Theme support with dark/light mode toggle

### Backend Architecture
- **Runtime**: Node.js with Express 5
- **Language**: TypeScript (ESM modules)
- **API Pattern**: RESTful endpoints under `/api/`
- **Build**: esbuild for production bundling

The backend handles:
- Conversation CRUD operations
- Message storage and retrieval
- Project file management (create, update, delete)
- AI-powered code generation via OpenAI integration
- Project context extraction from conversations

### Data Storage
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Location**: `shared/schema.ts`
- **Migrations**: Generated via `drizzle-kit push`
- **Fallback**: In-memory storage (`MemStorage`) when database unavailable

Database tables:
- `users` - User authentication
- `conversations` - Chat sessions with project context
- `messages` - Individual chat messages
- `projectFiles` - Generated code files per conversation

### Key Design Patterns
1. **Shared Schema**: Types and schemas in `shared/` directory used by both frontend and backend
2. **API Request Helper**: Centralized `apiRequest` function in `client/src/lib/queryClient.ts`
3. **Streaming Responses**: AI responses support streaming for real-time display
4. **Project Context Persistence**: Conversations store project metadata (name, tech stack, features built)
5. **Permanent Preview Panel**: Replit-style preview panel that stays visible after code generation
   - Split layout: Chat on left (~55%), Preview on right (~45%)
   - Tabs: Preview (live HTML), Code (source view), Debug (live code analysis)
   - Features: Fullscreen mode, device simulation (desktop/tablet/mobile), refresh, open in new tab
   - Toggle button to show/hide the preview panel

### Local Code Generation Engine (OpenAI-Independent)
Located in `client/src/lib/code-generator/`:
- **engine.ts**: Main generation logic with template matching, domain detection, debug integration
- **templates.ts**: Code templates for HTML, CSS, JavaScript, React
- **knowledge-base.ts**: Sage Knowledge for understanding user intent
- **webapp-knowledge.ts**: Tech stacks, blueprints, and multi-language patterns
- **learning-module.ts**: Pattern learning from user interactions
- **creativity-module.ts**: Domain detection (VAPT, healthcare, e-commerce, finance) and customization
- **fullstack-generator.ts**: Complete multi-file app generation with Flask, SQLAlchemy, auth, CRUD
- **debug-module.ts**: Live code analysis, error detection, and learning from user fixes

### Debug Module Features
- **Live Code Observation**: Watches code changes in real-time
- **Error Detection**: Syntax, runtime, logic, and style issues for Python, JavaScript, HTML, CSS
- **Security Scanning**: SQL injection, XSS, hardcoded credentials
- **Code Smell Detection**: Anti-patterns like bare except, == True, eval()
- **Learning System**: Remembers user fixes and applies patterns to future suggestions
- **Debug Tab**: Shows stats (changes observed, fixes learned, issues found) and detailed error list

## External Dependencies

### AI Integration
- **OpenAI API**: Used for code generation via GPT models
- Requires `OPENAI_API_KEY` environment variable

### Database
- **PostgreSQL**: Primary database
- Requires `DATABASE_URL` environment variable
- Uses `connect-pg-simple` for session storage

### Third-Party Services
- **Google Fonts**: DM Sans, Fira Code, Geist Mono fonts loaded in HTML

### Key NPM Packages
- `drizzle-orm` / `drizzle-zod`: Database ORM and Zod schema generation
- `@tanstack/react-query`: Async state management
- `@radix-ui/*`: Accessible UI primitives
- `class-variance-authority`: Component variant styling
- `wouter`: Client-side routing
- `zod`: Runtime type validation