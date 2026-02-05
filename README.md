# AutoCoder - AI-Powered Code Generation Platform

A comprehensive, intelligent code generation platform that produces production-ready, full-stack applications. Features 7 advanced AI-like capabilities operating 100% locally with zero external API dependencies.

![AutoCoder Preview](https://img.shields.io/badge/AI-Powered-8b5cf6?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-22c55e?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Lines of Code](https://img.shields.io/badge/Lines-85K+-blue?style=for-the-badge)

---

## Platform Statistics

| Metric | Value |
|--------|-------|
| **Total Lines of Code** | 85,662+ |
| **TypeScript/TSX Files** | 173 |
| **AI Intelligence Modules** | 7 |
| **SaaS Templates** | 10+ complete stacks |
| **Runnable Templates** | 20+ instant projects |
| **Code Patterns** | 500+ |
| **Error Pattern Recognizers** | 10+ |
| **Synonym Mappings** | 40+ |
| **Domain Contexts** | 8 |

---

## 7 Advanced AI-Like Capabilities

All intelligence operates 100% locally with zero external API dependencies.

### 1. Natural Language Understanding (NLU)
- **Semantic Parsing** - Understands intent beyond keywords
- **40+ Synonym Mappings** - "webpage" = "site" = "page" = "landing"
- **8 Domain Contexts** - E-commerce, blog, social, dashboard, portfolio, SaaS, mobile, API
- **Ambiguity Handling** - Asks clarifying questions when requests are unclear
- **Confidence Scoring** - Rates understanding from 0-1 for each request

### 2. Reasoning Engine
- **Problem Decomposition** - Breaks complex tasks into manageable subtasks
- **Dependency Analysis** - Identifies what must be built first
- **Conflict Detection** - Spots incompatible requirements
- **Effort Estimation** - Calculates complexity scores (1-10)
- **Warnings & Suggestions** - Proactive issue identification

### 3. Context Memory
- **Conversation History** - Tracks last 100 messages per session
- **Component Tracking** - Remembers all built components with aliases
- **Alias Resolution** - "the button" → ButtonComponent
- **User Preference Extraction** - Learns coding style preferences
- **Session Persistence** - Maintains context across interactions

### 4. Error Analysis & Self-Correction
- **10+ Error Pattern Recognizers**:
  - MODULE_NOT_FOUND
  - REFERENCE_ERROR
  - NULL_REFERENCE
  - TYPE_ERROR
  - SYNTAX_ERROR
  - REACT_HOOKS_ERROR
  - IMPORT_ERROR
  - ASYNC_ERROR
  - STATE_UPDATE_ERROR
  - BUILD_ERROR
- **Root Cause Analysis** - Traces errors to their source
- **Auto-Fix Generation** - Provides confidence-scored fixes
- **Multi-Fix Suggestions** - Offers alternative solutions

### 5. Code Understanding
- **Structure Parsing** - Extracts imports, exports, hooks, state, props
- **Code Modification** - Safely edits existing code
- **Refactoring Support**:
  - Extract components
  - Extract custom hooks
  - Add TypeScript types
  - Simplify complex logic
  - Optimize performance

### 6. Creative Problem Solving
- **Novel Solution Generation** - Multiple approaches per problem
- **Pattern Combination** - Merges known patterns creatively
- **Pros/Cons Analysis** - Evaluates each solution
- **Complexity Scoring** - Rates implementation difficulty
- **Novelty Ratings** - Identifies innovative approaches
- **Common Problems Solved**:
  - Infinite scroll
  - Theming systems
  - Drag and drop
  - Undo/redo
  - Real-time sync
  - Offline support

### 7. Explanation Generation
- **Code Explanations** - Line-by-line understanding
- **Concept Teaching** - Explains programming concepts
- **Alternative Approaches** - Shows different ways to solve
- **Best Practices** - Teaches industry standards
- **Learning Paths** - Suggests next topics to learn

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         AUTOCODER PLATFORM                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                   FRONTEND (React + TypeScript)              │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐│   │
│  │  │   Chat UI   │ │  Preview    │ │   VS Code-like IDE      ││   │
│  │  │  + Input    │ │  Panel      │ │   + Terminal            ││   │
│  │  └─────────────┘ └─────────────┘ └─────────────────────────┘│   │
│  │  ┌─────────────────────────────────────────────────────────┐│   │
│  │  │              Code Generator Engine (1,662 lines)         ││   │
│  │  │  ┌─────────────────────────────────────────────────────┐││   │
│  │  │  │       Advanced Intelligence (1,717 lines)           │││   │
│  │  │  │  • NLU  • Reasoning  • Memory  • Error Analysis     │││   │
│  │  │  │  • Code Understanding  • Creativity  • Explanations │││   │
│  │  │  └─────────────────────────────────────────────────────┘││   │
│  │  │  ┌─────────────────────────────────────────────────────┐││   │
│  │  │  │         Code Brain (Pattern Matching)               │││   │
│  │  │  │  • 500+ patterns  • Fuzzy matching  • Templates     │││   │
│  │  │  └─────────────────────────────────────────────────────┘││   │
│  │  └─────────────────────────────────────────────────────────┘│   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                   BACKEND (Express + Node.js)                │   │
│  │  ┌─────────────────────────────────────────────────────────┐│   │
│  │  │              Server Modules                              ││   │
│  │  │  • AI Code Refiner      • Deep Project Generator        ││   │
│  │  │  • Complete Intelligence (6,218 lines)                  ││   │
│  │  │  • VAPT Security Scanner                                ││   │
│  │  └─────────────────────────────────────────────────────────┘│   │
│  │  ┌─────────────────────────────────────────────────────────┐│   │
│  │  │              API Routes                                  ││   │
│  │  │  • Conversations  • Messages  • Code Generation         ││   │
│  │  │  • VAPT Scanning  • GitHub Integration                  ││   │
│  │  └─────────────────────────────────────────────────────────┘│   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                   DATABASE (PostgreSQL + Drizzle)            │   │
│  │  • Conversations  • Messages  • Projects  • VAPT Data       │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Template Systems

### SaaS Templates (4,329 lines)
Complete production-ready SaaS applications:

| Template | Features | Files Generated |
|----------|----------|-----------------|
| **E-Commerce** | Products, Cart, Checkout, Payments, Orders | 50+ |
| **Project Management** | Tasks, Boards, Teams, Timeline, Reports | 50+ |
| **Learning Platform** | Courses, Lessons, Progress, Certificates | 50+ |
| **Social Network** | Profiles, Posts, Friends, Messaging, Feed | 50+ |
| **CRM System** | Contacts, Deals, Pipeline, Analytics | 50+ |
| **Booking System** | Appointments, Calendar, Reminders | 50+ |
| **Blog Platform** | Posts, Categories, Comments, SEO | 40+ |
| **Analytics Dashboard** | Charts, Reports, Data Viz, Exports | 40+ |
| **Inventory System** | Products, Stock, Orders, Suppliers | 45+ |
| **HR Platform** | Employees, Payroll, Leave, Performance | 50+ |

### Runnable Templates (2,839 lines)
Instant WebContainer-ready projects:

| Category | Templates |
|----------|-----------|
| **React Apps** | Todo, Dashboard, E-commerce, Blog, Portfolio |
| **Node.js APIs** | REST API, GraphQL, WebSocket, Auth Server |
| **Full-Stack** | MERN Stack, T3 Stack, Next.js |
| **Utilities** | CLI Tools, Scrapers, Bots |

---

## Code Intelligence Modules

### Complete Code Intelligence (6,218 lines)
11 major pattern sections:

1. **Project Blueprints** - Full application structures
2. **Framework Patterns** - React, Vue, Angular, Svelte
3. **Backend Patterns** - Express, Fastify, NestJS, Koa
4. **UI Components** - 100+ reusable components
5. **Authentication** - OAuth, JWT, Sessions, 2FA
6. **Database** - Postgres, MongoDB, Redis, Prisma
7. **Real-time** - WebSockets, SSE, Polling
8. **Payments** - Stripe, PayPal, Subscriptions
9. **Testing** - Jest, Vitest, Playwright, Cypress
10. **Security** - XSS, CSRF, SQL Injection, Rate Limiting
11. **Error Solutions** - 200+ common error fixes

### Deep Project Generator (3,279 lines)
- 10 project blueprints
- 5 feature modules per project
- Comprehensive file generation
- Database schema creation
- API endpoint scaffolding

---

## Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 | UI Framework |
| TypeScript | Type Safety |
| Vite | Build Tool |
| Tailwind CSS | Styling |
| shadcn/ui | UI Components |
| TanStack Query | Server State |
| Wouter | Routing |
| Framer Motion | Animations |

### Backend
| Technology | Purpose |
|------------|---------|
| Express.js | Web Framework |
| Node.js | Runtime |
| Drizzle ORM | Database ORM |
| Zod | Validation |
| WebSocket | Real-time |

### Database
| Technology | Purpose |
|------------|---------|
| PostgreSQL | Primary Database |
| In-Memory | Fallback Storage |

### Code Execution
| Technology | Purpose |
|------------|---------|
| Electron | Desktop App (native file system, no limits) |
| WebContainer | In-Browser fallback (16KB file limit) |
| Sandboxed iframe | Safe Preview |

---

## Running Modes

AutoCoder supports three running modes:

### 1. Web Development Mode (Default)
```bash
npm run dev
```
- Runs in browser with WebContainer
- Good for quick UI development
- Has 16KB file write limitation for previews

### 2. Electron Development Mode
```bash
# First, start the web server in one terminal:
npm run dev

# Then, in another terminal, run Electron:
./scripts/electron-dev.sh
```
- Runs as desktop app with hot reload
- Uses native file system (no limits)
- Best for testing large projects
- No need to build/package

### 3. Production Desktop App
```bash
./scripts/build-desktop.sh
```
- Builds packaged desktop app
- Creates installers for Windows/Mac/Linux
- Full offline capability

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                      ELECTRON APPLICATION                         │
│                                                                   │
│  ┌─────────────────────────┐    ┌──────────────────────────────┐ │
│  │      MAIN PROCESS       │    │     RENDERER PROCESS         │ │
│  │     (Node.js runtime)   │    │     (Chromium window)        │ │
│  │                         │    │                              │ │
│  │  • Local Runner Service │◄──►│  • React Frontend (CodeAI)  │ │
│  │  • File System I/O      │IPC │  • Code Generation Engine   │ │
│  │  • npm install          │    │  • Preview Panel            │ │
│  │  • Dev Server Manager   │    │  • VS Code-like IDE         │ │
│  │  • Project Workspace    │    │                              │ │
│  └─────────────────────────┘    └──────────────────────────────┘ │
│                                                                   │
│                    ┌──────────────────────┐                       │
│                    │  LOCAL FILE SYSTEM   │                       │
│                    │  ~/AutoCoder/projects│                       │
│                    │  (unlimited size)    │                       │
│                    └──────────────────────┘                       │
└──────────────────────────────────────────────────────────────────┘
```

### Why Electron?

| WebContainer (Browser) | Electron (Desktop) |
|------------------------|-------------------|
| 16KB file write limit | Unlimited file size |
| Virtual npm (slow) | Real npm (fast) |
| Lost on page refresh | Persistent projects |
| Browser memory limits | Native performance |

---

## Feature Highlights

### Live Code Preview
- Real-time HTML/CSS/JS rendering
- Sandboxed iframe for security
- Fullscreen mode
- Open in new tab
- Auto-refresh on changes

### VS Code-like IDE
- Multi-tab file editing
- Syntax highlighting
- File tree navigation
- Integrated terminal
- WebContainer support

### VAPT Dashboard
- Vulnerability scanning
- OWASP Top 10 tracking
- Asset management
- Remediation workflow
- Audit logging

### GitHub Integration
- Repository import
- File upload
- Code push
- Version control

### Export System
- ZIP download
- Individual files
- Full project export

---

## Getting Started

### Quick Start
```bash
# Clone the repository
git clone https://github.com/Gautam-Mathur/autocoder-.git
cd autocoder-

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open `http://localhost:5000` and start generating code!

### Zero Configuration Required
- **No API keys needed** - All intelligence is local
- **No database required** - Uses in-memory storage by default
- **Works offline** - Pattern-based generation

---

## Usage Examples

### Generate a Landing Page
```
"Create a modern landing page for a fintech startup with hero, features, pricing, and testimonials"
```

### Build a Full SaaS
```
"Build a complete project management SaaS with user auth, task boards, team collaboration, and analytics"
```

### Get Code Explanation
```
"Explain how React useEffect cleanup functions work"
```

### Fix an Error
```
"Error: Cannot read property 'map' of undefined in my React component"
```

### Creative Solutions
```
"What's the best way to implement infinite scroll with virtualization?"
```

---

## Project Structure

```
autocoder/
├── client/                          # Frontend Application
│   └── src/
│       ├── components/              # React Components
│       │   ├── ui/                  # shadcn/ui components
│       │   ├── chat-*.tsx           # Chat interface
│       │   ├── preview-panel.tsx    # Code preview
│       │   └── vscode-ide.tsx       # IDE component
│       ├── lib/
│       │   ├── code-generator/      # Code Generation Engine
│       │   │   ├── advanced-intelligence.ts  # 7 AI capabilities (1,717 lines)
│       │   │   ├── engine.ts        # Main engine (1,662 lines)
│       │   │   ├── code-brain.ts    # Pattern matching
│       │   │   ├── saas-templates.ts    # SaaS templates (4,329 lines)
│       │   │   └── runnable-templates.ts # Runnable projects (2,839 lines)
│       │   └── code-runner/         # Code Execution
│       │       ├── webcontainer.ts  # WebContainer service
│       │       └── test-generator.ts # Test generation
│       ├── pages/                   # App Pages
│       └── hooks/                   # Custom Hooks
├── server/                          # Backend Application
│   ├── modules/                     # Server Modules
│   │   ├── complete-code-intelligence.ts  # Intelligence (6,218 lines)
│   │   ├── deep-project-generator.ts      # Project gen (3,279 lines)
│   │   └── ai-code-refiner.ts             # Code refinement
│   ├── routes.ts                    # API Endpoints
│   └── storage.ts                   # Database Operations
├── shared/
│   └── schema.ts                    # Database Schema
└── scripts/
    └── push-github.ts               # GitHub integration
```

---

## Environment Variables

All environment variables are **optional**:

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | No | PostgreSQL connection (uses in-memory if not set) |
| `OPENAI_API_KEY` | No | OpenAI API key (uses local engine if not set) |
| `SESSION_SECRET` | No | Session encryption key |

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development

#### Web Development (Quick UI iteration)
```bash
# Start web development server
npm run dev

# Opens at http://localhost:5000
# Uses WebContainer for code preview
```

#### Electron Development (Full capability testing)
```bash
# Terminal 1: Start web server
npm run dev

# Terminal 2: Run Electron
./scripts/electron-dev.sh

# Opens desktop app window
# Uses native file system (no limits)
# React hot reload still works
```

#### Other Commands
```bash
# Type checking
npm run check

# Database push
npm run db:push

# Build desktop app
./scripts/build-desktop.sh

# Build Electron only
npx tsc -p electron/tsconfig.json
```

---

## Testing Guide

### Testing Without Building (Recommended for Development)

You don't need to build the full desktop app to test Electron functionality:

```bash
# 1. Install dependencies
npm install

# 2. Start web server (Terminal 1)
npm run dev

# 3. Run Electron (Terminal 2)
./scripts/electron-dev.sh
```

This runs:
- Vite dev server (hot reload for React)
- Electron main process (watches for changes)
- Full desktop app experience

### Testing Workflow

| What to Test | Command | Description |
|--------------|---------|-------------|
| UI/Frontend | `npm run dev` | Browser-based, fast reload |
| Electron + Native | `./scripts/electron-dev.sh` | Full desktop experience |
| Built App | `./scripts/build-desktop.sh` | Final packaged app |

### Manual Testing Steps

1. **Generate Code**
   - Open the app
   - Type "Create a React todo app with localStorage"
   - Click Run

2. **Verify File System**
   - Check `~/AutoCoder/projects/` for generated files
   - Verify package.json is complete (not truncated)

3. **Test npm Install**
   - Watch console for npm output
   - Verify node_modules is created

4. **Test Preview**
   - Dev server should start automatically
   - Preview should show the running app

---

## Electron Project Structure

```
autocoder/
├── electron/                    # Electron-specific code
│   ├── main.ts                  # Main process entry
│   ├── preload.ts               # IPC bridge
│   └── services/
│       ├── local-runner.ts      # File system & npm
│       ├── project-manager.ts   # Workspace management
│       └── dev-server.ts        # Dev server control
│
├── client/                      # React frontend (same as web)
│   └── src/
│       └── lib/code-runner/
│           ├── webcontainer.ts  # Browser fallback
│           ├── electron-runner.ts   # Electron IPC wrapper
│           └── runner-factory.ts    # Auto-detect environment
│
├── electron-builder.json        # Build configuration
└── package.json                 # Scripts for all modes
```

---

## How It Works

### Code Generation Flow

```
User Request → NLU Parser → Code Brain → Template Engine → Files
     ↓
"Create a todo app"
     ↓
Intent: { type: "react-app", features: ["todo", "localStorage"] }
     ↓
Pattern Match: todo-app template + localStorage pattern
     ↓
Generated Files: App.tsx, components/, package.json, etc.
```

### Execution Flow (Electron)

```
Generated Files → IPC → Main Process → Local File System
     ↓                      ↓
[package.json]         fs.writeFileSync()
[src/App.tsx]               ↓
[src/...]              ~/AutoCoder/projects/my-app/
                            ↓
                    npm install (real npm)
                            ↓
                    npm run dev
                            ↓
                    Preview at localhost:3000
```

---

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| `npm run electron:dev` fails | Run `npm install electron electron-builder --save-dev` |
| Preview not loading | Check if dev server started in console |
| Files not appearing | Check `~/AutoCoder/projects/` directory |
| npm install timeout | Check internet connection, retry |

### Debug Mode

```bash
# Run with verbose logging
DEBUG=* npm run electron:dev
```

---

## License

MIT License - feel free to use this for personal or commercial projects.

## Author

Created by [Gautam Mathur](https://github.com/Gautam-Mathur)

---

<p align="center">
  <strong>85,662+ lines of code</strong> | <strong>173 files</strong> | <strong>7 AI capabilities</strong> | <strong>100% Local</strong>
</p>

<p align="center">
  Built with passion using Replit Agent
</p>
