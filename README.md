# AutoCoder - AI-Powered Code Generation Platform

A comprehensive, intelligent code generation platform that produces production-ready, full-stack React applications. Features 7 advanced AI-like capabilities operating 100% locally with zero external API dependencies. Supports both web deployment on Replit and local Electron desktop app for Windows/Mac/Linux.

![AutoCoder Preview](https://img.shields.io/badge/AI-Powered-8b5cf6?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-22c55e?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Lines of Code](https://img.shields.io/badge/Lines-92K+-blue?style=for-the-badge)

---

## Platform Statistics

| Metric | Value |
|--------|-------|
| **Total Lines of Code** | 92,000+ |
| **Source Files** | 400+ |
| **AI Intelligence Modules** | 34 server-side modules |
| **Code Generator** | Pro Generator (3,600+ lines, 15-20 clean JSX files per project) |
| **Preview Engine** | LiveCodeRunner (browser-based Babel, instant preview) |
| **SaaS Templates** | 10+ complete stacks |
| **Runnable Templates** | 20+ instant projects |
| **Code Patterns** | 500+ |
| **Error Pattern Recognizers** | 10+ |
| **App Type Patterns** | 20 categories |
| **Domain Profiles** | 12 industry-specific enrichment profiles |
| **Intent Phrase Patterns** | 12 action-verb-based app type inference |
| **Typo Corrections** | 205+ common misspellings auto-corrected |
| **Synonym Mappings** | 17+ conversational expansions |
| **Conversational Strips** | 5 filler-removal patterns |
| **UI Components** | 70 React components |
| **Electron Files** | 5 (desktop app support) |

---

## What's New (Feb 2026)

### Contextual Understanding Engine (NEW)
The chatbot now understands casual, conversational, non-technical user input without requiring prompt engineering expertise.

**Typo Tolerance (205+ corrections):**
- Handles common misspellings across all domains: "resturant", "recipies", "exersise", "fittness", "buisness", "budgit", "expences", "hosptial", "employes", "inventry", "playist", "ecomerce", "websit", and 190+ more
- Applied as the first step in normalization, before any domain detection runs
- Dictionary-based correction at word boundaries for speed and reliability

**12 Industry Domain Profiles:**
Each domain automatically provides specialized data models, pages, features, and UI styling:

| Domain | App Name | Data Models | UI Style |
|--------|----------|-------------|----------|
| Fitness | FitTracker | Workout, Exercise | Bold |
| Restaurant | FoodSpot | MenuItem, Order | Modern |
| Recipe | RecipeHub | Recipe | Playful |
| Finance | FinanceFlow | Transaction, Budget | Corporate |
| Real Estate | PropManager | Property | Corporate |
| Education | LearnHub | Course, Lesson | Modern |
| Healthcare | HealthConnect | Doctor, Appointment | Minimal |
| Travel | TravelPlanner | Destination, Trip | Playful |
| Pet Care | PetPal | Pet, Appointment | Playful |
| Inventory | StockManager | Item | Corporate |
| Music | MusicBox | Song, Playlist | Bold |
| HR | TeamHub | Employee, LeaveRequest | Corporate |

**Conversational Input Understanding:**
- Strips filler: "hey", "can you", "I want to", "help me make", "build me a"
- Expands vague language: "keep track of" -> "track manage dashboard", "something for" -> "app to"
- 12 intent phrase patterns: "track" -> dashboard, "sell" -> ecommerce, "share" -> social, "book" -> booking
- Domain-aware app naming: "gym tracker" -> FitTracker, "recipe sharing" -> RecipeHub

**Example prompts that now work perfectly:**
```
"i wanna track my gym workouts"           -> FitTracker dashboard with Workout/Exercise models
"help me share recipies with frends"      -> RecipeHub social app with Recipe model
"something for my small bakery"           -> FoodSpot ecommerce with MenuItem/Order models
"keep track of my expences and budgit"    -> FinanceFlow dashboard with Transaction/Budget models
"can you make a thing to manage employes" -> TeamHub admin with Employee/LeaveRequest models
"build a websit for my resturant"         -> FoodSpot ecommerce with MenuItem/Order models
"i need to organize my pets vet visits"   -> PetPal dashboard with Pet/Appointment models
```

### Prompt Analysis Pipeline
The `analyzePrompt` function now runs a 6-stage pipeline:

```
User Input -> Typo Correction -> Conversational Stripping -> Synonym Expansion
     -> Domain Detection -> Intent Inference -> App Type Pattern Matching
```

Each stage enriches the understanding:
1. **Typo Correction** - 205+ misspelling fixes
2. **Conversational Stripping** - Remove filler phrases
3. **Synonym Expansion** - Expand vague language into specific terms
4. **Domain Detection** - Match against 12 industry profiles (with plural handling)
5. **Intent Inference** - 12 action-verb patterns for app type
6. **Pattern Matching** - 20 app type regex patterns with false-positive guards

### Pro Generator
- Replaced deep-project-generator with **Pro Generator** for all code paths
- Produces **15-20 clean JSX files** per project (instead of 149 TypeScript files)
- Compatible with browser-based Babel preview (LiveCodeRunner)
- Automatic validation pipeline via `code-validator.ts`
- **3,600+ lines** of pure template-based code generation (zero API dependencies)

### LiveCodeRunner (Browser Preview)
- Instant in-browser preview using Babel transpilation
- No npm install overhead for previews
- Handles multi-file React projects with import resolution
- Strips TypeScript types (nested generics up to 3 levels, `as Type` patterns)
- Runtime auto-fix for void elements and JSX issues

### GitHub Integration
- Secure authenticated pushes via Replit's GitHub connector (Octokit)
- Full tree replacement (no stale file accumulation)
- Parallel batch uploads with retry logic
- Auto token refresh, never cached

### Electron Desktop App
- esbuild-based build pipeline (`npm run build:electron`)
- Windows compatibility: `cross-env` for env vars, conditional `reusePort`
- Single command: `npm run electron:dev`
- Default port 5100 for local development (avoids conflicts with port 5000)

### Code Validator Fixes
- Void element auto-fixer respects JSX curly braces (no more `=> />` corruption)
- Dot-notation components (e.g., `TasksContext.Provider`) handled correctly
- Default export check skips entry/context/provider files
- React Router `<Link>` vs HTML `<link>` detection
- Missing container closing tags auto-inserted (`</Routes>`, `</BrowserRouter>`, etc.)

---

## 7 Advanced AI-Like Capabilities

All intelligence operates 100% locally with zero external API dependencies.

### 1. Natural Language Understanding (NLU)
- **Contextual Understanding Engine** - 6-stage pipeline: typo correction -> filler stripping -> synonym expansion -> domain detection -> intent inference -> pattern matching
- **205+ Typo Corrections** - Handles misspellings like "resturant", "recipies", "exersise", "buisness"
- **12 Industry Domain Profiles** - Fitness, restaurant, recipe, finance, real estate, education, healthcare, travel, pet care, inventory, music, HR
- **17+ Synonym Mappings** - "keep track of" = "track manage dashboard", "something for" = "app to"
- **12 Intent Phrase Patterns** - Action-verb-based app type inference ("track" -> dashboard, "sell" -> ecommerce)
- **20 App Type Categories** - Dashboard, ecommerce, blog, portfolio, social, SaaS, todo, chat, CRM, analytics, booking, marketplace, CMS, game, calculator, form, landing, admin, API
- **Conversational Filler Removal** - Strips "hey", "can you", "I want to", "help me make"
- **Ambiguity Handling** - Asks clarifying questions when requests are unclear
- **Confidence Scoring** - Rates understanding from 0-1 for each request

### 2. Reasoning Engine
- **Problem Decomposition** - Breaks complex tasks into manageable subtasks
- **Dependency Analysis** - Identifies what must be built first
- **Conflict Detection** - Spots incompatible requirements
- **Effort Estimation** - Calculates complexity scores (1-10)

### 3. Context Memory
- **Conversation History** - Tracks last 100 messages per session
- **Component Tracking** - Remembers all built components with aliases
- **Alias Resolution** - "the button" -> ButtonComponent
- **User Preference Extraction** - Learns coding style preferences

### 4. Error Analysis & Self-Correction
- **10+ Error Pattern Recognizers** (MODULE_NOT_FOUND, TYPE_ERROR, SYNTAX_ERROR, REACT_HOOKS_ERROR, etc.)
- **Root Cause Analysis** - Traces errors to their source
- **Auto-Fix Generation** - Provides confidence-scored fixes

### 5. Code Understanding
- **Structure Parsing** - Extracts imports, exports, hooks, state, props
- **Code Modification** - Safely edits existing code
- **Refactoring Support** - Extract components, add types, optimize performance

### 6. Creative Problem Solving
- **Novel Solution Generation** - Multiple approaches per problem
- **Pattern Combination** - Merges known patterns creatively
- **Pros/Cons Analysis** - Evaluates each solution

### 7. Explanation Generation
- **Code Explanations** - Line-by-line understanding
- **Concept Teaching** - Explains programming concepts
- **Best Practices** - Teaches industry standards

---

## System Architecture

```
+-------------------------------------------------------------------+
|                         AUTOCODER PLATFORM                          |
+-------------------------------------------------------------------+
|                                                                     |
|  +-------------------------------------------------------------+   |
|  |                   FRONTEND (React + TypeScript)              |   |
|  |  +-------------+ +-------------+ +-----------------------+  |   |
|  |  |   Chat UI   | |  Preview    | |  VS Code-like IDE     |  |   |
|  |  |  + Input    | |  Panel      | |  + Terminal           |  |   |
|  |  +-------------+ +-------------+ +-----------------------+  |   |
|  |  +-----------------------------------------------------------+  |
|  |  |  Pro Generator --> Code Validator --> LiveCodeRunner        |  |
|  |  |  (15-20 JSX)      (auto-fix)         (Babel preview)       |  |
|  |  +-----------------------------------------------------------+  |
|  +-------------------------------------------------------------+   |
|                                                                     |
|  +-------------------------------------------------------------+   |
|  |                   BACKEND (Express + Node.js)                |   |
|  |  +-----------------------------------------------------------+  |
|  |  |  Server Modules (34)                                        |  |
|  |  |  * Pro Generator integration   * Complete Intelligence     |  |
|  |  |  * VAPT Security Scanner       * Context Memory            |  |
|  |  +-----------------------------------------------------------+  |
|  |  +-----------------------------------------------------------+  |
|  |  |  API Routes                                                |  |
|  |  |  * Conversations  * Messages  * Code Generation            |  |
|  |  |  * VAPT Scanning  * GitHub Push                            |  |
|  |  +-----------------------------------------------------------+  |
|  +-------------------------------------------------------------+   |
|                                                                     |
|  +-------------------------------------------------------------+   |
|  |  DATABASE (PostgreSQL + Drizzle ORM, optional in-memory)     |   |
|  +-------------------------------------------------------------+   |
+-------------------------------------------------------------------+
```

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

### Code Generation & Preview
| Technology | Purpose |
|------------|---------|
| Pro Generator | Multi-file React project generation (15-20 JSX files) |
| Code Validator | Auto-fix void elements, exports, JSX returns |
| LiveCodeRunner | Browser-based Babel preview (instant, no npm install) |
| Electron | Desktop app (native file system, no limits) |
| WebContainer | In-browser Node.js fallback |

### Database
| Technology | Purpose |
|------------|---------|
| PostgreSQL | Primary Database |
| In-Memory | Fallback Storage (when DATABASE_URL not set) |

---

## Running Modes

AutoCoder supports three running modes:

### 1. Web Mode (Default - Replit)
```bash
npm run dev
```
- Runs Express + Vite on port 5000
- Uses LiveCodeRunner for instant browser-based preview
- No file system limitations for preview (Babel-based)
- Best for cloud development on Replit

### 2. Electron Development Mode (Local Windows/Mac/Linux)
```bash
# Single command:
npm run electron:dev

# This builds Electron files with esbuild, then launches the desktop app
```
- Runs as desktop app
- Uses native file system (no limits)
- Full npm install and dev server for generated projects
- Projects saved to `~/AutoCoder/projects/`

### 3. Production Desktop Build
```bash
# Build the React app + Electron
npm run build
npm run build:electron
npx electron-builder
```
- Creates .exe (Windows), .dmg (Mac), .AppImage (Linux)
- Full offline capability

---

## Project Structure

```
autocoder/
├── client/                          # Frontend Application
│   └── src/
│       ├── components/              # React Components
│       │   ├── ui/                  # shadcn/ui components
│       │   ├── chat-*.tsx           # Chat interface
│       │   ├── preview-panel.tsx    # Code preview + LiveCodeRunner
│       │   └── live-code-runner.tsx # Browser-based Babel preview engine
│       ├── lib/
│       │   ├── code-generator/      # Code Generation Engine
│       │   │   ├── pro-generator.ts     # Main generator (15-20 JSX files)
│       │   │   ├── code-validator.ts    # Auto-fix validation pipeline
│       │   │   ├── engine.ts            # Legacy engine
│       │   │   ├── saas-templates.ts    # SaaS templates
│       │   │   └── runnable-templates.ts # Runnable project templates
│       │   └── code-runner/         # Code Execution
│       │       ├── electron-runner.ts   # Electron IPC wrapper
│       │       ├── runner-factory.ts    # Auto-detect environment
│       │       └── webcontainer.ts      # WebContainer fallback
│       └── pages/                   # App Pages (landing, chat, vapt)
│
├── server/                          # Backend Application
│   ├── modules/                     # 34 Server Modules
│   │   ├── complete-code-intelligence.ts  # Pattern intelligence
│   │   ├── deep-project-generator.ts      # Legacy generator
│   │   └── ...more modules
│   ├── routes.ts                    # API Endpoints (uses Pro Generator)
│   └── storage.ts                   # Database Operations (IStorage interface)
│
├── electron/                        # Electron Desktop App
│   ├── main.ts                      # Main process (ESM)
│   ├── preload.ts                   # IPC bridge (CommonJS)
│   ├── tsconfig.json                # TypeScript config (main)
│   ├── tsconfig.preload.json        # TypeScript config (preload, CJS)
│   └── services/
│       ├── local-runner.ts          # File system & npm operations
│       ├── project-manager.ts       # Workspace management
│       └── logger.ts                # File-based logging with rotation
│
├── scripts/
│   ├── github-push.ts               # GitHub push (Replit connector, full tree replace)
│   └── build-electron.ts            # esbuild pipeline for Electron
│
├── dist-electron/                   # Compiled Electron output
│   ├── main.js                      # esbuild output (ESM with createRequire banner)
│   └── preload.js                   # esbuild output (CJS)
│
├── shared/
│   └── schema.ts                    # Database Schema (Drizzle pgTable)
│
├── docs/electron/                   # Electron documentation (6 guides)
├── electron-builder.json            # Desktop build config
└── package.json                     # All npm scripts
```

---

## NPM Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `npm run dev` | `cross-env NODE_ENV=development tsx server/index.ts` | Start web dev server (port 5000) |
| `npm run build` | `tsx script/build.ts` | Build React + Express for production |
| `npm start` | `cross-env NODE_ENV=production node dist/index.cjs` | Run production build |
| `npm run check` | `tsc` | TypeScript type checking |
| `npm run db:push` | `drizzle-kit push` | Sync database schema |
| `npm run build:electron` | `tsx scripts/build-electron.ts` | Compile Electron files with esbuild |
| `npm run electron:dev` | `build:electron && electron dist-electron/main.js` | Build + launch Electron desktop app |

---

## Environment Variables

All environment variables are **optional**:

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | No | PostgreSQL connection (uses in-memory if not set) |
| `OPENAI_API_KEY` | No | OpenAI API key (uses local engine if not set) |
| `SESSION_SECRET` | No | Session encryption key |
| `PORT` | No | Server port (defaults to 5000) |

---

## Getting Started

### Quick Start (Replit - Web Mode)
```bash
npm run dev
# Open http://localhost:5000
```

### Quick Start (Local - Electron Desktop)
```bash
# Clone the repository
git clone https://github.com/Gautam-Mathur/autocoder-.git
cd autocoder-

# Install dependencies
npm install

# Run Electron desktop app
npm run electron:dev
```

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

---

## How It Works

### Code Generation Flow (Pro Generator)

```
User Request --> NLU Parser --> Pro Generator --> Code Validator --> LiveCodeRunner
     |                              |                  |                  |
"Create a todo app"          Generates 15-20      Auto-fixes         Browser-based
                             clean JSX files     void elements,     Babel preview
                                                 exports, returns    (instant)
```

### Execution Flow (Electron Desktop)

```
Generated Files --> IPC --> Main Process --> Local File System
     |                          |
[package.json]          fs.writeFileSync()
[src/App.jsx]                |
[src/...]              ~/AutoCoder/projects/my-app/
                             |
                     npm install (real npm)
                             |
                     npm run dev
                             |
                     Preview at localhost:3000
```

---

## Pro Generator Pipeline (Deep Dive)

The Pro Generator (`client/src/lib/code-generator/pro-generator.ts`) is a **3,600+ line** pure template-based code generation engine that converts natural language prompts into complete, multi-file React+Vite+Tailwind projects. It operates entirely without external API calls.

### `analyzePrompt(prompt: string): ProjectRequirements`

Parses natural language input through a **6-stage pipeline** to extract structured project requirements:

1. **Typo Correction** (205+ entries) - Fixes common misspellings before any matching
2. **Conversational Stripping** (5 patterns) - Removes filler phrases like "hey", "can you", "I want to"
3. **Synonym Expansion** (17+ mappings) - Expands vague language into specific terms
4. **Domain Detection** (12 industry profiles) - Matches against fitness, restaurant, recipe, finance, real estate, education, healthcare, travel, pet care, inventory, music, HR
5. **Intent Inference** (12 action-verb patterns) - "track" -> dashboard, "sell" -> ecommerce, "share" -> social
6. **App Type Pattern Matching** (20 categories) - Final regex-based classification

**App Type Detection (20 patterns):**

| Pattern Key | Regex Matches |
|-------------|---------------|
| `dashboard` | dashboard, admin panel, analytics view, overview, metrics, kpi |
| `ecommerce` | e-commerce, shop, store, product, cart, checkout, buy, sell, marketplace, retail |
| `blog` | blog, article, post, news, magazine, journal, writing, publication |
| `portfolio` | portfolio, resume, cv, personal site, showcase, gallery |
| `social` | social, feed, timeline, profile, follow, friend, community, network |
| `saas` | saas, subscription, pricing, plan, tier, billing, platform, service |
| `todo` | todo, task, kanban, checklist, planner, organizer |
| `chat` | chat, message, conversation, inbox, dm, real-time, websocket |
| `crm` | crm, customer, contact, lead, pipeline, deal, sales |
| `analytics` | analytics, report, chart, graph, data viz, visualization, insight |
| `booking` | booking, appointment, schedule, calendar, reservation, event |
| `marketplace` | marketplace, listing, seller, buyer, auction, classified |
| `cms` | cms, content management, editor, publish, page builder |
| `game` | game, quiz, puzzle, trivia, score, leaderboard, play |
| `calculator` | calculator, converter, compute, math, formula, unit |
| `form` | form, survey, questionnaire, poll, feedback, registration |
| `landing` | landing, hero, marketing, launch, coming soon, waitlist |
| `admin` | admin, management, back-office, control panel, settings |
| `api` | api, endpoint, rest, graphql, backend, server |

**Feature Extraction:** Detects features from the prompt including `auth`, `search`, `filtering`, `crud`, `dark-mode`, `responsive`, `notifications`, `real-time`, `file-upload`, `charts`, `export`, `pagination`, and `sorting`.

**UI Style Detection:** Classifies UI style as one of:
- `modern` (default) - Clean gradients, rounded corners, shadows
- `minimal` - Whitespace-heavy, flat, sparse
- `bold` - Vibrant colors, gradients, neon accents
- `corporate` - Professional, formal, enterprise styling
- `playful` - Fun, whimsical, creative, quirky

**Page Inference:** Uses the `PAGE_SUGGESTIONS` map to infer appropriate pages based on detected app type. For example, a `dashboard` app gets `['Dashboard', 'Analytics', 'Settings', 'Profile']`, while an `ecommerce` app gets `['Home', 'Products', 'Cart', 'Checkout', 'Orders']`.

**Data Model Detection:** Extracts data models (entities and their fields) from the prompt text by recognizing nouns and domain-specific terms.

### `generateProject(requirements: ProjectRequirements): GeneratedProject`

Produces a `GeneratedProject` object containing a `files` array. Each file has `path`, `content`, and `language` fields. The generator creates a complete, runnable React+Vite project:

**Generated File Structure:**

| File | Description |
|------|-------------|
| `package.json` | Conditional dependencies: always includes `react`, `react-dom`, `react-router-dom`; conditionally adds `recharts` (charts), `date-fns` (booking/calendar), `lucide-react` (icons) |
| `vite.config.js` | Standard Vite config with React plugin |
| `tailwind.config.js` | Tailwind configuration with custom color theme based on UI style |
| `postcss.config.js` | PostCSS with Tailwind and autoprefixer |
| `index.html` | HTML entry point with Vite script tag |
| `src/main.jsx` | React 18 `createRoot` entry point |
| `src/index.css` | Tailwind directives + custom styles matching UI style |
| `src/App.jsx` | Root component with React Router if multi-page, otherwise single-page layout |
| `src/pages/*.jsx` | Page components (e.g., `Dashboard.jsx`, `Products.jsx`, `Settings.jsx`) |
| `src/components/*.jsx` | Reusable UI components: `Navbar`, `Footer`, `Card`, `Button`, `Modal`, `Sidebar`, etc. |
| `src/utils/*.js` | Utility functions (formatters, validators, helpers) |

**Specialized Generators:** The engine includes dedicated generator functions per app type that produce domain-specific components and logic:
- `generateEcommerceProject()` - Product cards, cart system, checkout flow, order management
- `generateDashboardProject()` - Chart widgets, KPI cards, data tables, sidebar navigation
- `generateBlogProject()` - Article lists, post detail, markdown rendering, categories
- `generateTodoProject()` - Task lists, drag-and-drop, filters, priority levels
- `generateChatProject()` - Message bubbles, conversation list, input with send
- `generateSaasProject()` - Pricing tables, feature comparison, subscription management
- `generatePortfolioProject()` - Project showcase, skills grid, contact form, hero section
- `generateLandingProject()` - Hero with CTA, features grid, testimonials, pricing, footer
- And more for each of the 19 app types

### `formatProjectResponse(project: GeneratedProject): string`

Formats the `GeneratedProject` into markdown with file markers (`--- FILE: path ---`) that the chat interface parses to display individual files with syntax highlighting and copy buttons.

### `shouldUseProGenerator(input: string): boolean`

Gate function that returns `true` for any input containing coding signals such as:
- Action words: `build`, `create`, `make`, `generate`, `design`, `develop`, `code`
- Target words: `app`, `website`, `dashboard`, `page`, `component`, `project`, `site`

Returns `false` for inputs matching `TRIVIAL_PATTERNS` (greetings, general questions, explanations) to route those to the conversational AI instead.

---

## Code Validator Pipeline (Deep Dive)

The Code Validator (`client/src/lib/code-generator/code-validator.ts`) is a **758-line** validation and auto-fix engine that ensures generated code is syntactically correct and follows React best practices. It runs automatically after the Pro Generator produces files.

### 15 Validation Checks

| Check Function | What It Detects |
|----------------|-----------------|
| `checkBalancedBrackets` | Unmatched `(`, `)`, `{`, `}`, `[`, `]` with line number reporting |
| `checkBalancedQuotes` | Unclosed string literals (`'`, `"`, `` ` ``) |
| `checkStraySemicolons` | Semicolons in invalid positions (after `return (`, inside JSX, after `=>`) |
| `checkEmptyImports` | Import statements with no specifiers (`import {} from '...'`) |
| `checkUndefinedNaNInJsx` | Literal `undefined` or `NaN` rendered in JSX output |
| `checkDefaultExport` | Missing `export default` in component files (skips entry/context/provider files) |
| `checkComponentReturnsJsx` | React components that don't return JSX (missing return statement) |
| `checkDuplicateDeclarations` | Multiple `const`/`let`/`function` declarations with the same name in the same scope |
| `checkVoidElements` | HTML void elements (`<br>`, `<img>`, `<input>`, `<hr>`) not self-closed in JSX |
| `checkClassVsClassName` | Usage of HTML `class=` instead of React's `className=` |
| `checkHtmlFor` | Usage of HTML `for=` instead of React's `htmlFor=` on `<label>` elements |
| `checkEventHandlerCasing` | Lowercase event handlers (`onclick`) instead of React camelCase (`onClick`) |
| `checkKeyInMap` | Missing `key` prop in `.map()` rendered JSX elements |
| `checkCrossFileImports` | Import paths that reference files not present in the generated project |
| `checkPackageJson` | Validates that `package.json` has required fields and valid JSON structure |

### 8 Auto-Fix Functions

| Fix Function | What It Corrects |
|--------------|------------------|
| `fixStraySemicolons` | Removes semicolons after `return (`, inside JSX expressions, between `=>` and `{` |
| `fixDuplicateSemicolons` | Collapses `;;` or `;;;` into single `;` |
| `fixVoidElements` | Self-closes void HTML elements (`<br>` to `<br />`, `<img ...>` to `<img ... />`) using a **depth-tracking JSX parser** |
| `fixClassToClassName` | Replaces `class=` with `className=` in JSX (avoids strings/comments) |
| `fixForToHtmlFor` | Replaces `for=` with `htmlFor=` on label elements |
| `fixReactImportTypos` | Corrects misspelled React hook imports using 13 typo mappings |
| `fixMissingDefaultExport` | Adds `export default ComponentName;` to files missing a default export |
| `fixUnclosedTags` | Closes unclosed JSX tags by appending closing tags |

### Depth-Tracking Void Element Parser

The `fixVoidElements` function uses a special depth-tracking parser that monitors curly brace depth (`{}`) to distinguish between JSX context and JavaScript expression context. This prevents corrupting arrow functions:

```
Without depth tracking:  onClick={() =>  ...}  becomes  onClick={() = />  ...}   (BROKEN)
With depth tracking:     onClick={() => ...}   remains  onClick={() => ...}       (CORRECT)
```

The parser increments depth on `{` and decrements on `}`. Void element self-closing is only applied when the parser is at JSX depth (depth 0), not inside JavaScript expressions.

### Typo Correction Maps

**13 REACT_IMPORT_TYPOS mappings:**
`usestate` -> `useState`, `useeffect` -> `useEffect`, `usecontext` -> `useContext`, `usereducer` -> `useReducer`, `usecallback` -> `useCallback`, `usememo` -> `useMemo`, `useref` -> `useRef`, `uselayouteffect` -> `useLayoutEffect`, `useimperativehandle` -> `useImperativeHandle`, `usedebugvalue` -> `useDebugValue`, `useid` -> `useId`, `createcontext` -> `createContext`, `forwardref` -> `forwardRef`

**22 EVENT_HANDLER_FIXES mappings:**
`onclick` -> `onClick`, `onchange` -> `onChange`, `onsubmit` -> `onSubmit`, `oninput` -> `onInput`, `onfocus` -> `onFocus`, `onblur` -> `onBlur`, `onkeydown` -> `onKeyDown`, `onkeyup` -> `onKeyUp`, `onkeypress` -> `onKeyPress`, `onmousedown` -> `onMouseDown`, `onmouseup` -> `onMouseUp`, `onmouseover` -> `onMouseOver`, `onmouseout` -> `onMouseOut`, `onmouseenter` -> `onMouseEnter`, `onmouseleave` -> `onMouseLeave`, `ondoubleclick` -> `onDoubleClick`, `onscroll` -> `onScroll`, `ontouchstart` -> `onTouchStart`, `ontouchend` -> `onTouchEnd`, `ontouchmove` -> `onTouchMove`, `ondragstart` -> `onDragStart`, `ondrop` -> `onDrop`

---

## LiveCodeRunner Technical Details (Deep Dive)

The LiveCodeRunner (`client/src/components/live-code-runner.tsx`) is a **1,079-line** browser-based preview engine that renders generated React projects instantly without any npm install or build step.

### Backend File Filtering

Before rendering, the LiveCodeRunner filters out non-renderable files using **15 backend path patterns**:

```
/server/i, /controllers?/i, /middleware/i, /models?/i, /routes?/i,
/services?/i, /validators?/i, /e2e/i, /tests?/i, /spec/i,
/__tests__/i, /prisma/i, /db/i, /migrations?/i, /scripts?/i
```

Files matching these patterns, as well as `.config.js`, `.config.ts`, `.test.`, and `.spec.` files, are excluded from preview rendering.

### TypeScript Stripping

Since the browser-based Babel setup targets plain JSX, TypeScript annotations must be removed. The LiveCodeRunner applies regex-based stripping for:

| Pattern | What It Removes |
|---------|-----------------|
| Type annotations | `: string`, `: number`, `: boolean`, `: void`, `: any` |
| Interface/type declarations | `interface Foo { ... }`, `type Bar = ...` |
| Generic parameters | `<T>`, `<Props>`, `<React.FC<Props>>` |
| `as` assertions | `value as string`, `obj as const` |
| `satisfies` keyword | `config satisfies Schema` |
| `readonly` modifier | `readonly items: string[]` |
| `keyof` operator | `keyof typeof obj` |
| Import type statements | `import type { Foo } from '...'` |

### Import Mocking System

The LiveCodeRunner mocks external dependencies so generated code can render without actual npm packages installed:

**205+ Mocked UI Components:**
All common UI library components are mocked as simple `div`/`span` wrappers that render their children. Includes: `Button`, `Card`, `CardHeader`, `CardContent`, `CardFooter`, `Dialog`, `DialogTrigger`, `DialogContent`, `Input`, `Label`, `Select`, `SelectTrigger`, `SelectContent`, `SelectItem`, `Textarea`, `Badge`, `Avatar`, `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`, `Accordion`, `Alert`, `Checkbox`, `Switch`, `Slider`, `Progress`, `Tooltip`, `Popover`, `DropdownMenu`, `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableCell`, and many more.

**60+ Mocked Lucide Icons:**
Common icons are mocked as inline SVG elements: `Search`, `Menu`, `X`, `ChevronDown`, `ChevronRight`, `Plus`, `Minus`, `Edit`, `Trash`, `Save`, `Download`, `Upload`, `Settings`, `User`, `Home`, `Mail`, `Phone`, `Calendar`, `Clock`, `Star`, `Heart`, `Bell`, `Filter`, `ArrowLeft`, `ArrowRight`, `Check`, `AlertCircle`, `Info`, `Eye`, `EyeOff`, `Lock`, `Unlock`, `Globe`, `Link`, `ExternalLink`, `Copy`, `Clipboard`, `Share`, `Send`, `RefreshCw`, `MoreVertical`, `MoreHorizontal`, `ChevronUp`, `ChevronLeft`, `LogOut`, `LogIn`, `ShoppingCart`, `CreditCard`, `DollarSign`, `BarChart`, `PieChart`, `TrendingUp`, `Activity`, `Zap`, `Award`, `BookOpen`, `Layers`, `Layout`, `Grid`, `List`, and more.

**React Router Mocking (v5/v6):**
Complete mock implementations for both React Router versions:
- Components: `BrowserRouter`, `HashRouter`, `Routes`, `Route`, `Link`, `NavLink`, `Navigate`, `Outlet`
- Hooks: `useNavigate` (returns no-op function), `useParams` (returns empty object), `useLocation` (returns mock location), `useSearchParams`, `useMatch`

### Embedded Tailwind CSS Subset

The preview HTML includes an embedded subset of **~500 Tailwind CSS utility classes** compiled directly into a `<style>` tag. This covers the most commonly used utilities:
- Layout: `flex`, `grid`, `block`, `inline`, `hidden`, `relative`, `absolute`, `fixed`, `sticky`
- Spacing: `p-*`, `m-*`, `px-*`, `py-*`, `mx-*`, `my-*`, `gap-*` (0 through 16, plus auto)
- Sizing: `w-*`, `h-*`, `min-w-*`, `min-h-*`, `max-w-*`, `max-h-*`
- Typography: `text-xs` through `text-6xl`, `font-normal/medium/semibold/bold`, `text-left/center/right`
- Colors: `text-{color}-{shade}`, `bg-{color}-{shade}`, `border-{color}-{shade}` for common color palettes
- Borders: `rounded-*`, `border`, `border-*`, `ring-*`
- Effects: `shadow-*`, `opacity-*`, `transition-*`
- Responsive: `sm:`, `md:`, `lg:`, `xl:` prefixes for common utilities

### Babel Transpilation via CDN

The LiveCodeRunner loads `@babel/standalone` from a CDN to transpile JSX in the browser:

```
<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
```

All component code is concatenated, wrapped in a module system, and transpiled with the `react` preset. The transpiled JavaScript is then injected into the preview HTML.

### Blob URL Rendering

The final preview HTML (including styles, mocked dependencies, transpiled components, and the React mount point) is converted to a `Blob` with `text/html` MIME type. A Blob URL is created via `URL.createObjectURL()` and set as the `src` of an `<iframe>`. This approach:
- Bypasses COEP (Cross-Origin-Embedder-Policy) restrictions
- Bypasses COI (Cross-Origin-Isolation) restrictions
- Avoids `srcdoc` limitations in some browsers
- Allows clean URL revocation via `URL.revokeObjectURL()` on unmount

---

## Database Schema Reference

All tables are defined in `shared/schema.ts` using Drizzle ORM's `pgTable` syntax. The database is PostgreSQL (Neon-backed on Replit) with an optional in-memory fallback.

### Core Tables

#### `users`
| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `varchar` (UUID) | PRIMARY KEY, default `gen_random_uuid()` |
| `username` | `text` | NOT NULL, UNIQUE |
| `password` | `text` | NOT NULL |

#### `conversations`
| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `serial` | PRIMARY KEY |
| `title` | `text` | NOT NULL |
| `createdAt` | `timestamp` | NOT NULL, default `CURRENT_TIMESTAMP` |
| `projectName` | `text` | nullable |
| `projectDescription` | `text` | nullable |
| `techStack` | `text[]` | nullable |
| `featuresBuilt` | `text[]` | nullable |
| `projectSummary` | `text` | nullable |
| `lastCodeGenerated` | `text` | nullable |
| `projectType` | `text` | nullable (landing, dashboard, webapp, etc.) |
| `complexity` | `text` | nullable (simple, moderate, complex) |
| `designStyle` | `text` | nullable (minimal, modern, corporate, etc.) |
| `colorPreferences` | `text[]` | nullable |
| `planGenerated` | `boolean` | default `false` |
| `securityScore` | `integer` | nullable |
| `testsPassed` | `integer` | nullable |
| `testsFailed` | `integer` | nullable |

#### `messages`
| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `serial` | PRIMARY KEY |
| `conversationId` | `integer` | NOT NULL, FK -> `conversations.id` (CASCADE) |
| `role` | `text` | NOT NULL (`user` or `assistant`) |
| `content` | `text` | NOT NULL |
| `createdAt` | `timestamp` | NOT NULL, default `CURRENT_TIMESTAMP` |

#### `projectFiles`
| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `serial` | PRIMARY KEY |
| `conversationId` | `integer` | NOT NULL, FK -> `conversations.id` (CASCADE) |
| `path` | `text` | NOT NULL |
| `content` | `text` | NOT NULL |
| `language` | `text` | NOT NULL |
| `createdAt` | `timestamp` | NOT NULL, default `CURRENT_TIMESTAMP` |
| `updatedAt` | `timestamp` | NOT NULL, default `CURRENT_TIMESTAMP` |

### Intelligence Tables

#### `projectPlans`
| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `serial` | PRIMARY KEY |
| `conversationId` | `integer` | NOT NULL, FK -> `conversations.id` (CASCADE) |
| `summary` | `text` | NOT NULL |
| `techStack` | `jsonb` | nullable, array of `{ category, technology, justification }` |
| `architecture` | `text` | nullable |
| `folderStructure` | `text` | nullable |
| `designDecisions` | `jsonb` | nullable, array of `{ decision, rationale }` |
| `securityConsiderations` | `text[]` | nullable |
| `createdAt` | `timestamp` | NOT NULL, default `CURRENT_TIMESTAMP` |

#### `intelRecords`
| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `serial` | PRIMARY KEY |
| `conversationId` | `integer` | NOT NULL, FK -> `conversations.id` (CASCADE) |
| `type` | `text` | NOT NULL (preference, decision, pattern, mistake, context) |
| `category` | `text` | NOT NULL |
| `key` | `text` | NOT NULL |
| `value` | `text` | NOT NULL |
| `confidence` | `integer` | default `100` (0-100 scale) |
| `source` | `text` | default `inferred` (explicit, inferred, learned) |
| `usageCount` | `integer` | default `0` |
| `createdAt` | `timestamp` | NOT NULL, default `CURRENT_TIMESTAMP` |

#### `testResults`
| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `serial` | PRIMARY KEY |
| `conversationId` | `integer` | NOT NULL, FK -> `conversations.id` (CASCADE) |
| `targetFile` | `text` | NOT NULL |
| `passed` | `integer` | default `0` |
| `failed` | `integer` | default `0` |
| `skipped` | `integer` | default `0` |
| `coverage` | `integer` | nullable (percentage) |
| `details` | `jsonb` | nullable, array of `{ testId, testName, status, error? }` |
| `createdAt` | `timestamp` | NOT NULL, default `CURRENT_TIMESTAMP` |

#### `securityScans`
| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `serial` | PRIMARY KEY |
| `conversationId` | `integer` | NOT NULL, FK -> `conversations.id` (CASCADE) |
| `score` | `integer` | NOT NULL (0-100) |
| `grade` | `text` | NOT NULL (A, B, C, D, F) |
| `issues` | `jsonb` | nullable, array of `{ severity, type, description, file?, line? }` |
| `passedChecks` | `text[]` | nullable |
| `createdAt` | `timestamp` | NOT NULL, default `CURRENT_TIMESTAMP` |

#### `generationLogs`
| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `serial` | PRIMARY KEY |
| `conversationId` | `integer` | NOT NULL, FK -> `conversations.id` (CASCADE) |
| `action` | `text` | NOT NULL |
| `targetFile` | `text` | nullable |
| `description` | `text` | NOT NULL |
| `linesChanged` | `integer` | nullable |
| `reasoning` | `text` | nullable |
| `assumptions` | `text[]` | nullable |
| `createdAt` | `timestamp` | NOT NULL, default `CURRENT_TIMESTAMP` |

### VAPT (Vulnerability Assessment & Penetration Testing) Tables

#### `vaptAssets`
Tracks assets under security assessment (web apps, APIs, servers, etc.).

#### `vaptVulnerabilities`
Records discovered vulnerabilities with severity, CVSS score, status, and remediation details.

#### `vaptScans`
Stores scan execution records with scan type, target, status, and findings.

#### `vaptSchedules`
Manages recurring scan schedules with cron-like scheduling configuration.

#### `vaptAuditLogs`
Immutable audit trail of all VAPT-related actions for compliance reporting.

#### `vaptTeamMembers`
Team member assignments and roles within the VAPT module.

---

## Full API Endpoint Reference

All API endpoints are defined in `server/routes.ts`. The server runs on Express.js and uses the `IStorage` interface for database operations.

### Conversations

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/conversations` | List all conversations (ordered by creation date) |
| `POST` | `/api/conversations` | Create a new conversation (`{ title }`) |
| `GET` | `/api/conversations/:id` | Get a single conversation with all messages |
| `DELETE` | `/api/conversations/:id` | Delete a conversation and all associated data (cascades) |
| `POST` | `/api/conversations/:id/messages` | Add a user message to a conversation |
| `POST` | `/api/conversations/:id/assistant-message` | Add an assistant response to a conversation |
| `PUT` | `/api/conversations/:id/context` | Update project context (projectName, techStack, features, summary, etc.) |

### Project Files

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/conversations/:id/files` | Get all files for a conversation/project |
| `POST` | `/api/conversations/:id/files` | Save a single file (`{ path, content, language }`) |
| `DELETE` | `/api/conversations/:id/files` | Delete all files for a conversation |
| `PUT` | `/api/files/:id` | Update a specific file's content |
| `DELETE` | `/api/files/:id` | Delete a specific file |
| `POST` | `/api/conversations/:id/files/bulk` | Bulk save multiple files at once |

### AI / Code Generation

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/ai/understand` | Process natural language input through NLU + Pro Generator pipeline |
| `POST` | `/api/ai/edit` | Edit existing generated code based on instructions |
| `POST` | `/api/ai/fix` | Auto-fix errors in generated code |
| `GET` | `/api/ai/status` | Get AI engine status and capabilities |
| `POST` | `/api/ai/plan` | Generate a project architecture plan |
| `POST` | `/api/ai/deep/generate` | Deep project generation (full-stack) |
| `POST` | `/api/ai/deep/generate-refined` | Refined generation with additional context |

### GitHub Integration

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/github/repos` | List authenticated user's GitHub repositories |
| `GET` | `/api/github/repos/:owner/:repo/contents` | Browse repository file contents |
| `POST` | `/api/github/push` | Push current project files to a GitHub repository |

### Preview System

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/preview/prepare/:id` | Prepare preview environment for a conversation's project |
| `POST` | `/api/preview/start/:id` | Start the preview dev server |
| `POST` | `/api/preview/stop` | Stop the running preview server |
| `GET` | `/api/preview/status` | Get current preview server status |

### Testing & Security

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/conversations/:id/test` | Run automated tests on generated code |
| `POST` | `/api/conversations/:id/security-scan` | Run security vulnerability scan on generated code |

### VAPT (Vulnerability Assessment & Penetration Testing)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/vapt/dashboard` | Get VAPT dashboard summary (stats, recent scans, top vulnerabilities) |
| `GET` | `/api/vapt/assets` | List all tracked assets |
| `POST` | `/api/vapt/assets` | Register a new asset for scanning |
| `GET` | `/api/vapt/assets/:id` | Get asset details |
| `PUT` | `/api/vapt/assets/:id` | Update an asset |
| `DELETE` | `/api/vapt/assets/:id` | Remove an asset |
| `GET` | `/api/vapt/vulnerabilities` | List all discovered vulnerabilities |
| `POST` | `/api/vapt/vulnerabilities` | Record a new vulnerability |
| `GET` | `/api/vapt/vulnerabilities/:id` | Get vulnerability details |
| `PUT` | `/api/vapt/vulnerabilities/:id` | Update vulnerability status/details |
| `DELETE` | `/api/vapt/vulnerabilities/:id` | Remove a vulnerability record |
| `GET` | `/api/vapt/scans` | List all scan records |
| `POST` | `/api/vapt/scans` | Initiate a new scan |
| `GET` | `/api/vapt/scans/:id` | Get scan results |
| `GET` | `/api/vapt/schedules` | List scan schedules |
| `POST` | `/api/vapt/schedules` | Create a recurring scan schedule |
| `PUT` | `/api/vapt/schedules/:id` | Update a schedule |
| `DELETE` | `/api/vapt/schedules/:id` | Remove a schedule |
| `GET` | `/api/vapt/team` | List VAPT team members |
| `POST` | `/api/vapt/team` | Add a team member |
| `PUT` | `/api/vapt/team/:id` | Update team member role |
| `DELETE` | `/api/vapt/team/:id` | Remove a team member |
| `GET` | `/api/vapt/audit-logs` | Get audit trail of all VAPT actions |

---

## esbuild Pipeline Detail

The Electron build uses esbuild for fast, cross-platform compilation. The build script is at `scripts/build-electron.ts` (40 lines).

### main.ts Compilation

```javascript
esbuild.build({
  entryPoints: ['electron/main.ts'],
  bundle: true,           // Bundle all imports into single file
  platform: 'node',       // Target Node.js APIs
  target: 'node18',       // Node 18 syntax level
  format: 'esm',          // Output as ES Modules
  outfile: 'dist-electron/main.js',
  external: ['electron'], // Don't bundle Electron itself
  sourcemap: true,        // Generate source maps for debugging
  banner: {
    js: `import { createRequire } from 'module';
         const require = createRequire(import.meta.url);`,
  },
});
```

The `banner` adds a `createRequire` shim because the output is ESM format but some dependencies may use `require()`. This allows CommonJS `require()` calls to work inside an ESM context.

### preload.ts Compilation

```javascript
esbuild.build({
  entryPoints: ['electron/preload.ts'],
  bundle: true,           // Bundle all imports
  platform: 'node',       // Target Node.js APIs
  target: 'node18',       // Node 18 syntax level
  format: 'cjs',          // Output as CommonJS (required by Electron preload)
  outfile: 'dist-electron/preload.js',
  external: ['electron'], // Don't bundle Electron
  sourcemap: true,
});
```

The preload script **must** be CommonJS format because Electron's preload sandbox requires it. The main process uses ESM while the preload uses CJS - this dual-format setup is handled cleanly by having separate esbuild configurations.

### Output

Both compiled files land in `dist-electron/`:
- `dist-electron/main.js` - ESM bundle with createRequire shim
- `dist-electron/main.js.map` - Source map
- `dist-electron/preload.js` - CJS bundle
- `dist-electron/preload.js.map` - Source map

---

## GitHub Push System Detail

The GitHub push system (`scripts/github-push.ts`) provides a complete, reliable method to push the entire workspace to a GitHub repository using the Octokit REST API.

### Authentication Flow

1. Reads Replit connector credentials from `REPLIT_CONNECTORS_HOSTNAME`
2. Fetches OAuth token via Replit's connector API (`/api/v2/connection?include_secrets=true&connector_names=github`)
3. Checks token expiry (`expires_at`) before each operation
4. **Auto-refreshes** expired tokens by re-fetching from the connector (never caches stale credentials)
5. Creates an authenticated `Octokit` instance with the fresh token

### Push Pipeline

The push follows the Git data API flow (low-level tree manipulation, not the contents API):

```
1. getRef(heads/main)         -> Get current commit SHA
2. For each file:
   createBlob(content)        -> Upload file content, get blob SHA
3. createTree(blobs[])        -> Create new tree from all blob SHAs (NO base_tree)
4. createCommit(tree, parent) -> Create commit pointing to new tree
5. updateRef(heads/main)      -> Fast-forward branch to new commit
```

### Full Tree Replacement

The `createTree` call intentionally omits the `base_tree` parameter. This means the new tree contains **only** the files being pushed. Any files that existed in the previous commit but are no longer in the workspace are automatically removed. This prevents stale file accumulation that would occur with incremental tree updates.

### Parallel Batch Upload

Files are uploaded in parallel batches to maximize throughput while respecting GitHub API rate limits:

- **`BATCH_SIZE = 5`** - 5 files uploaded concurrently per batch
- **5 retries** per file with exponential backoff
- Retry on status codes: `403` (rate limit), `429` (too many requests), `502` (bad gateway), `503` (service unavailable)
- Backoff formula: `attempt * 3000ms` (3s, 6s, 9s, 12s, 15s)
- Failed files after all retries are logged as warnings but don't block the push
- Binary files are encoded as `base64`, text files as `utf-8`

### File Collection

The `getAllFiles()` function recursively walks the workspace directory, excluding:
- `.git`, `node_modules`, `.cache`, `.config`, `.upm`, `.replit`, `replit.nix`, `replit.md`, `.local`
- Symbolic links (to avoid infinite loops)

---

## GitHub Integration

AutoCoder includes a built-in GitHub push system:

- Uses **Replit's GitHub connector** for secure OAuth token management
- **Full tree replacement** - pushes exactly what's in the workspace, no stale files
- **Parallel batch uploads** with retry logic (handles rate limits)
- **Auto token refresh** - never caches stale credentials
- Run with: `npx tsx scripts/github-push.ts`

---

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Preview not loading | Check if dev server is running, check console for errors |
| Files not appearing | Check `~/AutoCoder/projects/` directory (Electron mode) |
| npm install timeout | Check internet connection, retry |
| Windows EBUSY error | Close VS Code, delete node_modules, run `npm install` again |
| Windows ENOTSUP (reusePort) | Already fixed - server auto-detects Windows |

### Debug Mode

```bash
# Run with verbose logging
DEBUG=* npm run electron:dev
```

---

## Windows-Specific Notes

- Uses `cross-env` for all npm scripts (no Unix-only syntax)
- Server conditionally skips `reusePort` on Windows (prevents ENOTSUP error)
- Electron build uses esbuild (fast, cross-platform)
- Run Electron directly: `npm run electron:dev`

---

## License

MIT License - feel free to use this for personal or commercial projects.

## Author

Created by [Gautam Mathur](https://github.com/Gautam-Mathur)

---

<p align="center">
  <strong>92,000+ lines of code</strong> | <strong>400+ files</strong> | <strong>34 intelligence modules</strong> | <strong>205+ typo corrections</strong> | <strong>12 domain profiles</strong> | <strong>100% Local</strong>
</p>

<p align="center">
  Built with passion using Replit Agent
</p>
