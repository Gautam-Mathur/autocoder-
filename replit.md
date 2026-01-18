# replit.md

## Overview

CodeAI is a free AI-powered coding assistant web application with a built-in local code generation engine. It provides a chat interface where users can generate code, get templates, and build web applications. The tool works in two modes:
- **Cloud Mode** (on Replit): Uses GPT-4o for intelligent code generation
- **Local Mode** (anywhere): Uses built-in template engine - no API keys required

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript, bundled with Vite
- **Routing**: Wouter (lightweight client-side routing)
- **State Management**: TanStack React Query for server state and caching
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming (dark/light mode support)
- **Path Aliases**: `@/` maps to `client/src/`, `@shared/` maps to `shared/`
- **Local Code Generator**: `client/src/lib/code-generator/` - template-based engine

### Local Code Generator
- **Location**: `client/src/lib/code-generator/`
- **Engine**: Smart pattern matching with synonym expansion, fuzzy matching, and typo tolerance
- **Templates**: Modern, production-ready code with professional styling
- **HTML**: Landing pages, contact forms, card grids, navigation bars, dashboards
- **JavaScript**: Fetch API wrapper, localStorage manager, debounce/throttle, form validation, todo apps
- **React**: Counter component, forms with validation, modal dialogs, useFetch hook
- **CSS**: Flexbox layouts, CSS Grid patterns, animations & transitions

### Live Code Preview
- **Component**: `client/src/components/code-preview.tsx`
- **Security**: Uses iframe with srcdoc and sandbox="allow-scripts" (no same-origin access)
- **Features**: Toggle preview, fullscreen mode, open in new tab
- **Combined App Preview**: When AI generates multiple code blocks (HTML + CSS + JS), they are automatically combined into a single runnable preview with "Run App" button
- **Full App Generation**: AI is prompted to generate complete, interactive web apps with embedded CSS/JS for instant preview

### Single Page App (SPA) Generation
- **Pattern**: AI generates real SPAs with JavaScript navigation like professional web apps
- **Button Navigation**: Clickable nav buttons that switch views instantly (no page reloads)
- **View Sections**: All content in one HTML file with `.view` sections toggled via JavaScript
- **Active States**: Current tab is highlighted with `.active` class
- **Smooth Transitions**: Fade/slide animations between views using CSS keyframes
- **Navigation Styles**:
  - Top nav bar (default) - Horizontal buttons at top
  - Sidebar nav - Vertical navigation for dashboards
  - Tab bar - Underlined tabs below header
- **When Used**: Triggered when user asks for apps, websites, or multiple views/sections

### Multi-File Project Generation
- **Pattern**: AI generates complete project structures with multiple files
- **File Markers**: Uses `--- FILE: path/to/file.ext ---` syntax to separate files
- **Component**: `client/src/components/code-preview.tsx` contains `ProjectFilesPreview`
- **UI Features**: File tree sidebar on left, file content on right, copy buttons
- **Language Detection**: Auto-detects file type from extension for syntax highlighting
- **When Used**: Triggered when user asks for "full project", "full app", or organized multi-file structure

### AI Design Capabilities
- **Thinking Process**: AI mentally plans before coding (intent, visual strategy, interactions, components, technical approach)
- **Sophisticated Animations**: fadeInUp, pulse, glow, typing effects, blink cursors
- **Interactive Components**: Animated terminals, live dashboards, hero sections, cards with hover effects
- **Adaptive Design Presets**:
  - Cybersecurity: Dark theme (#0a0a0a), green accents (#00ff88), terminal aesthetics
  - Fitness: Energetic colors, progress rings, motivational elements
  - Finance: Clean/professional, data visualization, trust indicators
  - SaaS: Modern gradients, feature cards, conversion-focused
- **Quality Standards**: Every button has hover effects, cards have transforms, entrance animations on all elements

### Project Memory & Continuous Development
- **Persistent Context**: Each conversation stores project details (name, description, tech stack, features built)
- **Auto-Extraction**: System automatically extracts project info from user messages and AI responses
- **Feature Tracking**: Features like Navigation, Dashboard, Forms, Settings Panel are detected and tracked
- **Project Header**: Shows project name and feature count in header when context is available
- **Upgrade Intelligence**: AI understands previous work and suggests relevant upgrades
- **Consistent Styling**: AI maintains same colors, fonts, and component styles across all code in a project
- **Storage**: Project context stored in conversation (projectName, projectDescription, techStack, featuresBuilt, projectSummary, lastCodeGenerated)

### AI Contextual Intelligence
- **Context Extraction**: Extracts product name, purpose, audience, and features from user messages
- **Contextual Content**: Generates meaningful copy, badges, and status messages based on actual product details
- **Feature Badges**: Derives relevant badges from product capabilities (e.g., "ZERO CONFIG", "24/7 MONITORING")
- **Terminal Output**: Creates contextual terminal/status messages relevant to the product domain
- **Smart Suggestions**: Proposes next features that make sense for the specific project
- **No Placeholders**: Never uses generic "Lorem ipsum" or "Your Product Here" text

### Backend Architecture
- **Framework**: Express.js (v5) running on Node.js with TypeScript
- **API Design**: RESTful endpoints under `/api/` prefix
- **AI Integration**: OpenAI-compatible API via Replit AI Integrations (optional - falls back to local engine)
- **Build System**: esbuild for server bundling, Vite for client bundling
- **Development**: tsx for TypeScript execution, Vite dev server with HMR

### Data Storage
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Location**: `shared/schema.ts` contains all database table definitions
- **Tables**: 
  - `users` - User authentication (id, username, password)
  - `conversations` - Chat sessions (id, title, createdAt)
  - `messages` - Chat messages (id, conversationId, role, content, createdAt)
- **Migrations**: Drizzle Kit with `db:push` command for schema synchronization
- **Fallback**: MemStorage class in `server/storage.ts` provides in-memory storage when database is unavailable

### Key Design Patterns
- **Dual AI Mode**: Cloud AI on Replit, local template engine elsewhere
- **Shared Types**: Schema types are defined once in `shared/schema.ts` and used by both frontend and backend
- **API Request Utility**: Centralized `apiRequest` function in `client/src/lib/queryClient.ts` handles all API calls with error handling
- **Component Organization**: UI primitives in `components/ui/`, feature components at `components/` root level

## External Dependencies

### AI Services
- **Cloud Mode**: OpenAI-compatible API via Replit AI Integrations (optional)
- **Local Mode**: Built-in template engine - no external dependencies

### Database
- **PostgreSQL**: Primary database (optional - uses MemStorage fallback)
- **connect-pg-simple**: Session storage for Express sessions

### Key NPM Packages
- **Frontend**: React 18, TanStack Query, Radix UI components, Tailwind CSS, wouter, react-hook-form
- **Backend**: Express 5, Drizzle ORM, OpenAI SDK
- **Build Tools**: Vite, esbuild, tsx, TypeScript

### Environment Variables
- `DATABASE_URL` - PostgreSQL connection string (optional)
- `AI_INTEGRATIONS_OPENAI_API_KEY` - API key for cloud AI (optional - falls back to local engine)
- `AI_INTEGRATIONS_OPENAI_BASE_URL` - Base URL for cloud AI (optional)

## Running Locally

When downloaded and run locally without Replit environment variables, the app automatically uses the local template-based code generator. No API keys or configuration needed.
