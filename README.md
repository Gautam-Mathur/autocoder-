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
| WebContainer | In-Browser Node.js |
| Sandboxed iframe | Safe Preview |

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
```bash
# Run in development mode
npm run dev

# Type checking
npm run check

# Database push
npm run db:push
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
