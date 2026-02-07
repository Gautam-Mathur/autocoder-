# AutoCoder Electron: Developer's Guide

## Introduction

This guide is for developers who want to understand, modify, or extend the AutoCoder Electron implementation. It covers the codebase structure, key components, development workflow, and best practices.

---

## Table of Contents

1. [Project Structure](#project-structure)
2. [Development Environment Setup](#development-environment-setup)
3. [Key Components Deep Dive](#key-components-deep-dive)
4. [Pro Generator Architecture](#pro-generator-architecture)
5. [Code Validator Architecture](#code-validator-architecture)
6. [LiveCodeRunner Architecture](#livecoderunner-architecture)
7. [Server Modules Reference](#server-modules-reference)
8. [Database Layer](#database-layer)
9. [Adding New Features](#adding-new-features)
10. [IPC Communication Patterns](#ipc-communication-patterns)
11. [State Management](#state-management)
12. [Error Handling Patterns](#error-handling-patterns)
13. [Testing Your Changes](#testing-your-changes)
14. [Build and Packaging](#build-and-packaging)
15. [Code Style and Conventions](#code-style-and-conventions)

---

## 1. Project Structure

```
autocoder/
├── electron/                        # Electron source (TypeScript)
│   ├── main.ts                      # Main process entry point (ESM)
│   ├── preload.ts                   # IPC bridge (CommonJS)
│   ├── tsconfig.json                # TypeScript config for main.ts
│   ├── tsconfig.preload.json        # TypeScript config for preload.ts (CJS)
│   └── services/
│       ├── local-runner.ts          # File system & npm operations
│       ├── project-manager.ts       # Workspace management
│       └── logger.ts                # File-based logging with rotation
│
├── client/                          # React frontend
│   └── src/
│       ├── lib/
│       │   ├── code-generator/
│       │   │   ├── pro-generator.ts     # Template code generator (3,624 lines)
│       │   │   ├── code-validator.ts    # Auto-fix validation pipeline (955 lines)
│       │   │   └── ...                  # Other generator modules
│       │   └── code-runner/
│       │       ├── webcontainer.ts      # WebContainer (browser fallback)
│       │       ├── electron-runner.ts   # Electron IPC wrapper
│       │       └── runner-factory.ts    # Environment detection
│       ├── components/
│       │   ├── preview-panel.tsx        # Preview with LiveCodeRunner
│       │   └── live-code-runner.tsx     # Browser-based Babel preview (1,263 lines)
│       ├── pages/
│       └── ...
│
├── server/                          # Express backend
│   ├── modules/                     # 41 intelligence modules
│   │   ├── natural-language-understanding.ts
│   │   ├── enhanced-intent-recognition.ts
│   │   ├── advanced-code-generation.ts
│   │   ├── deep-project-generator.ts
│   │   ├── complete-code-intelligence.ts
│   │   └── ...
│   ├── storage.ts                   # Database layer (901 lines)
│   └── routes.ts                    # API endpoints
│
├── shared/
│   └── schema.ts                    # Drizzle ORM schema (266 lines, 16 tables)
│
├── scripts/
│   ├── build-electron.ts            # esbuild pipeline for Electron
│   └── github-push.ts               # GitHub push (full tree replace)
│
├── dist-electron/                   # Compiled Electron output (esbuild)
│   ├── main.js                      # From main.ts
│   ├── main.js.map
│   ├── preload.js                   # From preload.ts
│   └── preload.js.map
│
├── electron-builder.json            # Desktop packaging config
└── docs/electron/                   # Documentation (6 guides)
```

---

## 2. Development Environment Setup

### Prerequisites

- Node.js 18+ (20 recommended)
- npm 8+
- Git
- A display environment (Electron requires a GUI)

### Initial Setup

```bash
# Clone the repository
git clone https://github.com/Gautam-Mathur/autocoder-.git
cd autocoder-

# Install all dependencies
npm install

# Build Electron with esbuild
npm run build:electron
```

### Running in Development

**Option A: Web-only Development (no Electron)**
```bash
npm run dev
# Opens at http://localhost:5000
# Uses LiveCodeRunner for instant browser-based preview
```

**Option B: Full Electron Development**
```bash
# Single command (builds + launches):
npm run electron:dev
```

### Rebuilding Electron After Changes

When you modify files in `electron/`:

```bash
npm run build:electron
```

This runs `scripts/build-electron.ts` which uses **esbuild** to compile:
- `electron/main.ts` (ESM) -> `dist-electron/main.js` (ESM with createRequire banner)
- `electron/preload.ts` (CJS) -> `dist-electron/preload.js` (CJS)

Both output files use `external: ['electron']` and include source maps.

---

## 3. Key Components Deep Dive

### 3.1 Main Process (`electron/main.ts`)

The main process is the application's entry point. Key responsibilities:

```typescript
// Window creation
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });
  
  // Load the React app
  if (isDev) {
    mainWindow.loadURL('http://localhost:5000');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

// IPC handlers registration
ipcMain.handle('runner:writeFiles', async (event, projectName, files) => {
  // Handle file write requests from renderer
});
```

**Key Patterns:**
- Use `ipcMain.handle()` for request-response patterns
- Use `mainWindow.webContents.send()` for pushing updates to renderer
- Always return structured responses: `{ success: boolean, error?: string }`

### 3.2 Preload Script (`electron/preload.ts`)

The preload script creates a secure bridge between main and renderer:

```typescript
// Define the API interface
interface ElectronAPI {
  writeFiles: (projectName: string, files: Array<...>) => Promise<...>;
  npmInstall: (projectName: string) => Promise<...>;
  // ... more methods
}

// Expose to renderer via contextBridge
contextBridge.exposeInMainWorld('electronAPI', {
  writeFiles: (projectName, files) => 
    ipcRenderer.invoke('runner:writeFiles', projectName, files),
  // ... more methods
});
```

**Key Patterns:**
- Use `ipcRenderer.invoke()` for async request-response
- Use `ipcRenderer.on()` for event listeners (with cleanup)
- Always type the API interface for type safety

### 3.3 Local Runner Service (`electron/services/local-runner.ts`)

Handles actual file system and process operations:

```typescript
class LocalRunner {
  // Write files to disk
  async writeFiles(projectPath: string, files: ProjectFile[]): Promise<void> {
    for (const file of files) {
      const fullPath = path.join(projectPath, file.path);
      fs.mkdirSync(path.dirname(fullPath), { recursive: true });
      fs.writeFileSync(fullPath, file.content, 'utf-8');
    }
  }
  
  // Run npm install with streaming output
  async npmInstall(projectPath: string, onLog: LogCallback): Promise<RunResult> {
    return new Promise((resolve) => {
      const child = spawn('npm', ['install'], { cwd: projectPath });
      
      child.stdout.on('data', (data) => {
        onLog(`[npm] ${data.toString()}`);
      });
      
      child.on('close', (code) => {
        resolve({ success: code === 0 });
      });
    });
  }
}
```

**Key Patterns:**
- Use synchronous fs operations for reliability
- Create directories recursively before writing files
- Stream process output through callbacks
- Always handle process errors and exit codes

### 3.4 Electron Runner (`client/src/lib/code-runner/electron-runner.ts`)

Frontend wrapper that calls the Electron API:

```typescript
export function isElectronEnvironment(): boolean {
  return typeof window !== 'undefined' && 
         'electronAPI' in window && 
         window.electronAPI !== undefined;
}

export async function writeFiles(
  projectName: string, 
  files: ProjectFile[], 
  onLog?: LogCallback
): Promise<RunResult> {
  if (!isElectronEnvironment()) {
    return { success: false, error: 'Not running in Electron' };
  }
  
  const api = getElectronAPI();
  return api.writeFiles(projectName, files);
}
```

**Key Patterns:**
- Always check `isElectronEnvironment()` first
- Use a helper function to narrow types
- Provide fallback behavior for non-Electron environments

### 3.5 Runner Factory (`client/src/lib/code-runner/runner-factory.ts`)

Automatically selects the right runner based on environment:

```typescript
export function detectRunnerType(): RunnerType {
  if (isElectronEnvironment()) {
    return 'electron';
  }
  if (typeof window !== 'undefined') {
    return 'webcontainer';
  }
  return 'none';
}

export async function getRunner(): Promise<UnifiedRunner> {
  const runnerType = detectRunnerType();
  
  if (runnerType === 'electron') {
    const electronRunner = await import('./electron-runner');
    return { type: 'electron', ...electronRunner };
  }
  // ... other runners
}
```

**Key Patterns:**
- Use dynamic imports for code splitting
- Cache the runner instance
- Provide a unified interface across all runner types

---

## 4. Pro Generator Architecture

**File:** `client/src/lib/code-generator/pro-generator.ts` (3,624 lines)

The Pro Generator is the client-side template-based code generation engine used as a fallback. It takes a natural language prompt and produces a complete, runnable React+Vite+Tailwind project with multiple files. The primary code generation path is now the server-side plan-driven generator (`server/modules/plan-driven-generator.ts`, 1,828 lines) which uses the deep understanding engine and domain knowledge to produce custom TypeScript projects from approved plans.

### 4.1 Exports

| Export | Type | Description |
|--------|------|-------------|
| `analyzePrompt(input: string)` | Function | Parses natural language into structured `ProjectRequirements` |
| `generateProject(requirements)` | Function | Produces a `GeneratedProject` from requirements |
| `shouldUseProGenerator(input: string)` | Function | Returns `true` if the prompt describes an app (vs. a simple snippet) |

### 4.2 Core Types

```typescript
interface ProjectRequirements {
  appType: string;       // e.g. 'ecommerce', 'dashboard', 'blog'
  appName: string;       // extracted or inferred project name
  pages: string[];       // list of page/route names
  features: string[];    // detected features like 'auth', 'search', 'crud'
  dataModels: DataModel[]; // inferred data models with fields
  uiStyle: 'modern' | 'minimal' | 'bold' | 'corporate' | 'playful';
  hasBackend: boolean;
  hasAuth: boolean;
  hasDatabase: boolean;
  complexity: 'simple' | 'medium' | 'complex';
}

interface DataModel {
  name: string;
  fields: { name: string; type: string }[];
}

interface GeneratedFile {
  path: string;      // e.g. 'src/pages/HomePage.jsx'
  content: string;   // full file source code
  language: string;   // 'jsx', 'css', 'json', etc.
}

interface GeneratedProject {
  name: string;          // project name (kebab-case)
  description: string;   // human-readable description
  files: GeneratedFile[]; // typically 15-20 files
}
```

### 4.3 `analyzePrompt()` Pipeline

The prompt analysis function runs through several pattern-matching stages to extract structured requirements from free-form text:

**Stage 1: App Type Detection** — `APP_TYPE_PATTERNS` (19 app types)

Each key maps to a regex that matches relevant keywords:

| App Type | Example Trigger Words |
|----------|----------------------|
| `dashboard` | dashboard, admin panel, analytics view, metrics, kpi |
| `ecommerce` | e-commerce, shop, store, product, cart, checkout, marketplace |
| `blog` | blog, article, post, news, magazine, journal |
| `portfolio` | portfolio, resume, cv, personal site, showcase |
| `social` | social, feed, timeline, profile, follow, community |
| `saas` | saas, subscription, pricing, plan, tier, billing |
| `todo` | todo, task, kanban, checklist, planner |
| `chat` | chat, message, conversation, inbox, real-time |
| `crm` | crm, customer, contact, lead, pipeline, deal |
| `analytics` | analytics, report, chart, graph, data viz |
| `booking` | booking, appointment, schedule, calendar, reservation |
| `marketplace` | marketplace, listing, seller, buyer, auction |
| `cms` | cms, content management, editor, page builder |
| `game` | game, quiz, puzzle, trivia, score, leaderboard |
| `calculator` | calculator, converter, compute, math, formula |
| `form` | form, survey, questionnaire, poll, feedback |
| `landing` | landing, hero, marketing, launch, waitlist |
| `admin` | admin, management, back-office, control panel |
| `api` | api, endpoint, rest, graphql, backend |

**Stage 2: Feature Detection** — `FEATURE_PATTERNS`

Detects features like `auth`, `search`, `filtering`, `crud`, `dark-mode`, `responsive`, `notifications`, `real-time`, `file-upload`, `charts`, `export`, `pagination`, and `sorting`.

**Stage 3: UI Style Detection** — `UI_STYLE_PATTERNS`

Matches against `minimal`, `bold`, `corporate`, and `playful` keywords. Falls back to `'modern'` if no style is detected.

**Stage 4: Page Suggestions** — `PAGE_SUGGESTIONS` map

Each app type has a predefined set of suggested pages. For example:
- `dashboard` → `['Dashboard', 'Analytics', 'Settings', 'Profile']`
- `ecommerce` → `['Home', 'Products', 'Cart', 'Checkout', 'Product Detail']`
- `blog` → `['Home', 'Articles', 'Article Detail', 'About']`

**Stage 5: Data Model Inference**

Based on the detected app type, the analyzer infers appropriate data models. For example, an e-commerce app automatically gets `Product` and `Order` models with fields like `name`, `price`, `description`, `quantity`, etc.

### 4.4 `generateProject()` Pipeline

Once requirements are resolved, the generator builds a complete project through two phases:

**Phase 1: Scaffold files (common to all app types)**

| Generator Function | Output File | Notes |
|-------------------|-------------|-------|
| `genPackageJson(req)` | `package.json` | Conditional deps: adds `react-router-dom` if multi-page, `recharts` if charts feature, `lucide-react` for icons |
| `genViteConfig()` | `vite.config.js` | Standard React+Vite config with `@vitejs/plugin-react` |
| `genTailwindConfig()` | `tailwind.config.js` | Configured for `./src/**/*.{js,jsx}` content paths |
| `genPostcssConfig()` | `postcss.config.js` | Tailwind + autoprefixer |
| `genIndexHtml(req)` | `index.html` | Sets `<title>` to the app name |
| `genMainJsx()` | `src/main.jsx` | React 18 `createRoot` entry point |
| `genIndexCss(req)` | `src/index.css` | Tailwind directives + custom theme variables based on `uiStyle` |

**Phase 2: App-type-specific generators**

The generator dispatches to a specialized function based on `req.appType`:

| Function | App Type | Typical Output Files |
|----------|----------|---------------------|
| `generateEcommerceProject()` | ecommerce | App.jsx, HomePage, ProductsPage, CartPage, ProductCard, CartProvider, useSearch, SearchBar, FilterPanel, Navbar, product data |
| `generateDashboardProject()` | dashboard | App.jsx, DashboardPage, AnalyticsPage, Sidebar, StatCard, ChartWidget, DataTable, mock data |
| `generateTodoProject()` | todo | App.jsx, TodoApp, TodoItem, TodoForm, useTodos hook, filter/sort logic |
| `generateBlogProject()` | blog | App.jsx, HomePage, ArticlePage, ArticleCard, Sidebar, article data, markdown rendering |
| `generatePortfolioProject()` | portfolio | App.jsx, HeroSection, ProjectGrid, ProjectCard, About, Contact, skills data |
| `generateLandingProject()` | landing | App.jsx, Hero, Features, Pricing, Testimonials, CTA, Footer |
| `generateChatProject()` | chat | App.jsx, ChatWindow, MessageList, MessageInput, ChatSidebar, useMessages hook |
| `generateGenericProject()` | (fallback) | App.jsx with basic layout, routing, and placeholder pages |

Each app-type generator produces a self-contained set of JSX components, pages, hooks, data files, and an `App.jsx` that wires up `react-router-dom` routing for multi-page apps.

### 4.5 Helper Utilities

```typescript
capitalize(s: string): string    // 'hello' → 'Hello'
camelCase(s: string): string     // 'my-component' → 'myComponent'
kebabCase(s: string): string     // 'MyComponent' → 'my-component'
slugify(s: string): string       // 'Hello World!' → 'hello-world'
pluralize(s: string): string     // 'category' → 'categories', 'item' → 'items'
singularize(s: string): string   // 'categories' → 'category', 'items' → 'item'
```

These are used throughout the generators for naming consistency: file paths use `kebabCase`, component names use `capitalize`, route params use `slugify`, data collections use `pluralize`/`singularize`.

### 4.6 `shouldUseProGenerator()`

A gating function that returns `true` when the input describes an application (contains app-type keywords, feature keywords, or multi-page indicators) vs. a simple code snippet request. This is used by `server/routes.ts` to decide whether to route through the Pro Generator or a simpler code generation path.

---

## 5. Code Validator Architecture

**File:** `client/src/lib/code-generator/code-validator.ts` (758 lines)

The Code Validator ensures that generated code is syntactically correct and follows React/JSX best practices. It runs both validation checks (read-only, report errors) and auto-fix transformations (modify code to fix common issues).

### 5.1 Exports

| Export | Type | Description |
|--------|------|-------------|
| `autoFixCode(content, filePath)` | Function | Applies 8 sequential fixers to a single file's content, returns the fixed string |
| `validateGeneratedCode(files)` | Function | Runs 15 validation checks across all files, returns a `ValidationResult` |

### 5.2 Core Types

```typescript
interface ValidationError {
  file: string;       // file path where the error was found
  line: number;       // line number (1-indexed)
  message: string;    // human-readable description
  severity: 'error' | 'warning';
}

interface ValidationWarning {
  file: string;
  message: string;
}

interface ValidationResult {
  isValid: boolean;           // true if errors[] is empty
  errors: ValidationError[];
  warnings: ValidationWarning[];
  fixedFiles: { path: string; content: string }[];  // files modified by auto-fix
}
```

### 5.3 Validation Pipeline (15 Checks)

Each check function takes the file content, file path, and the `errors[]`/`warnings[]` arrays, appending any findings:

| # | Check Function | What It Detects |
|---|---------------|-----------------|
| 1 | `checkBalancedBrackets()` | Unmatched `()`, `{}`, `[]` — uses a stack-based parser that strips comments and strings first via `stripCommentsAndStrings()` |
| 2 | `checkBalancedQuotes()` | Unterminated string literals (single, double, backtick) |
| 3 | `checkStraySemicolons()` | Semicolons immediately after `return (`, inside JSX expressions, or between `=>` and `{` |
| 4 | `checkEmptyImports()` | Import statements with empty braces: `import {} from '...'` |
| 5 | `checkUndefinedNaNInJsx()` | Literal `undefined` or `NaN` rendered directly in JSX output |
| 6 | `checkDefaultExport()` | Missing `export default` in component files. **Skips** entry files (`main.jsx`, `index.jsx`) and context/provider/hook files (filenames containing `context`, `provider`, or `hook`) |
| 7 | `checkComponentReturnsJsx()` | Component functions that don't contain a `return` with JSX. **Skips** Context/Provider components and files using `createContext` |
| 8 | `checkDuplicateDeclarations()` | Multiple `const`/`let`/`function` declarations with the same name in the same file |
| 9 | `checkVoidElements()` | Void HTML elements (`<br>`, `<img>`, `<input>`, `<hr>`, etc.) that have closing tags or children in JSX |
| 10 | `checkClassVsClassName()` | HTML `class=` used instead of React's `className=` |
| 11 | `checkHtmlFor()` | HTML `for=` used instead of React's `htmlFor=` on `<label>` elements |
| 12 | `checkEventHandlerCasing()` | Lowercase event handlers (`onclick`, `onchange`) instead of camelCase (`onClick`, `onChange`) — checks 25+ event handler names |
| 13 | `checkKeyInMap()` | `.map()` calls in JSX that don't include a `key` prop on the returned element |
| 14 | `checkCrossFileImports()` | Import paths that reference files not present in the generated file set |
| 15 | `checkPackageJson()` | Validates `package.json` has required fields (`name`, `scripts`, `dependencies`) |

### 5.4 Context-Aware Parsing Utilities

The validator includes several helper functions that prevent false positives:

```typescript
isInsideString(content, index)          // checks if index is inside '', "", or ``
isInsideComment(content, index)         // checks // or /* */ comments
isInsideTemplateLiteral(content, index) // checks backtick strings
stripCommentsAndStrings(content)        // removes all comments and strings,
                                        // preserving template literal expressions
```

`stripCommentsAndStrings()` is particularly important for `checkBalancedBrackets()` — it handles nested template literal expressions (`${...}`) by tracking brace depth inside backtick strings.

### 5.5 Auto-Fix Pipeline (8 Fixers)

The `autoFixCode()` function runs these fixers in sequence, each transforming the content string:

| # | Fixer Function | What It Fixes |
|---|---------------|--------------|
| 1 | `fixStraySemicolons()` | Removes semicolons after `return (`, `=> {`, array/object openers |
| 2 | `fixDuplicateSemicolons()` | Collapses `;;` or `;;;` into single `;` |
| 3 | `fixVoidElements()` | Converts `<br></br>` to `<br />`, `<img ...></img>` to `<img ... />` for all 14 void elements |
| 4 | `fixClassToClassName()` | Replaces `class=` with `className=` (JSX files only) |
| 5 | `fixForToHtmlFor()` | Replaces `for=` with `htmlFor=` on label elements (JSX files only) |
| 6 | `fixReactImportTypos()` | Fixes case-sensitive React hook typos: `usestate` → `useState`, `useeffect` → `useEffect`, etc. (25+ known typos) |
| 7 | `fixMissingDefaultExport()` | Adds `export default ComponentName;` if a component function exists but isn't exported. Skips entry/context/provider/hook files |
| 8 | `fixUnclosedTags()` | Attempts to close unclosed HTML tags by scanning for unmatched opening tags |

### 5.6 Key Implementation Details

**`fixVoidElements()` — Depth-tracking parser:**
This fixer is careful not to corrupt arrow functions inside JSX attributes. It uses a brace-depth counter (`{}` depth tracking) so that `=>` inside an `onClick={() => ...}` attribute is not accidentally rewritten to `= />`. The parser only converts `>...</tag>` to ` />` when the element is at the correct depth and is a known void element.

**`checkDefaultExport()` — Smart skip logic:**
Entry files (`main.jsx`, `index.jsx`) typically use `ReactDOM.createRoot()` and don't export a component. Context and provider files often export named exports (`export const MyContext = createContext(...)`) rather than default exports. Hook files export functions, not components. The checker recognizes all these patterns and skips validation for them.

**`checkComponentReturnsJsx()` — Context-aware:**
Files that define a React Context (containing `createContext`) or Provider components (function names containing `Provider`) are skipped because they may return `children` directly or use `Context.Provider` wrapping without explicit JSX returns.

**Event handler casing map (25+ entries):**
```typescript
const EVENT_HANDLER_FIXES: Record<string, string> = {
  'onclick': 'onClick',
  'onchange': 'onChange',
  'onsubmit': 'onSubmit',
  'onfocus': 'onFocus',
  'onblur': 'onBlur',
  'onkeydown': 'onKeyDown',
  'onmouseenter': 'onMouseEnter',
  'ondragstart': 'onDragStart',
  // ... 17 more entries
};
```

---

## 6. LiveCodeRunner Architecture

**File:** `client/src/components/live-code-runner.tsx` (1,263 lines)

The LiveCodeRunner is a React component that provides instant in-browser preview of generated React projects without any build tools, bundlers, or servers. It transforms JSX/TSX files using inline Babel and renders them inside a sandboxed iframe via blob URLs.

### 6.1 Component Interface

```typescript
interface LiveCodeRunnerProps {
  files: GeneratedFile[];       // the complete set of generated files
  projectName?: string;         // display name (default: "Generated Project")
  showEditor?: boolean;         // whether to show a code editor alongside
  height?: string;              // iframe height (default: "500px")
}

function LiveCodeRunner({ files, projectName, height }: LiveCodeRunnerProps)
```

### 6.2 Key State

| State Variable | Type | Purpose |
|---------------|------|---------|
| `previewHtml` | `useMemo<string>` | The fully constructed HTML string, recomputed whenever `files` changes |
| `blobUrl` | `useState<string \| null>` | The current blob:// URL rendered in the iframe |
| `refreshKey` | `useState<number>` | Incremented to force iframe re-render |
| `iframeRef` | `useRef<HTMLIFrameElement>` | Reference to the iframe DOM element |

### 6.3 Preview Construction Pipeline

The `previewHtml` useMemo runs the following pipeline:

**Step 1: Filter files**
- Include only `.tsx`, `.jsx`, `.js` files
- Exclude config files (`.config.js`, `.config.ts`)
- Exclude backend paths (matching patterns: `server`, `controllers`, `middleware`, `models`, `routes`, `services`, `validators`, `e2e`, `tests`, `prisma`, `db`, `migrations`, `scripts`)
- Exclude test files (`.test.`, `.spec.`)

For HTML-only projects (no TSX/JSX files), a separate path inlines CSS and JS directly into the HTML, strips external `<script>` and `<link>` tags, and returns early.

**Step 2: Detect project type**
- Check if the project is a plain HTML project or a React project
- Identify the entry point (typically `src/main.jsx` or `src/App.jsx`)

**Step 3: Strip TypeScript**
- Remove type annotations, interfaces, type aliases
- Convert `.tsx` syntax to plain `.jsx`
- Remove `as` type assertions and generic type parameters

**Step 4: Mock imports**
The runner creates mock implementations for all external dependencies so the code can run without actual npm packages:

- **`builtInMocks` Set (205+ entries):** Mocked components and hooks from popular React libraries. Includes UI components (`Button`, `Card`, `Dialog`, `Input`, `Select`, `Tabs`, etc.), layout components (`Sidebar`, `Header`, `Footer`), form components, and utility hooks.

- **`builtInIconsList` (60+ entries):** Mocked Lucide React icons (`Check`, `X`, `Plus`, `Minus`, `ChevronUp`, `ChevronDown`, `ChevronLeft`, `ChevronRight`, `Search`, `Settings`, `User`, `Mail`, `Heart`, `Star`, `Trash`, etc.). Each icon is mocked as an inline SVG component.

- **React Router mocking:** `BrowserRouter`, `Routes`, `Route`, `Link`, `NavLink`, `useNavigate`, `useParams`, `useLocation`, `useSearchParams`, `Outlet`, and `Navigate` are all mocked. `Link` and `NavLink` render as `<a>` tags, `useNavigate` returns a no-op function, and `Routes`/`Route` renders matching components based on a simple path-matching algorithm.

- **Other mocked libraries:** `recharts` (Chart components render placeholder divs), `react-hook-form` (basic form state), `date-fns`, `axios` (returns empty data), `framer-motion` (renders children directly).

**Step 5: Inject CSS**
- Collects all `.css` files from the project
- Embeds ~500 compiled Tailwind utility classes in a `<style>` tag, covering:
  - Layout: `flex`, `grid`, `block`, `inline`, `hidden`, `absolute`, `relative`, `fixed`, `sticky`
  - Spacing: `p-*`, `m-*`, `gap-*` (0 through 96, including fractional)
  - Sizing: `w-*`, `h-*`, `min-w-*`, `max-w-*`, `min-h-*`, `max-h-*`
  - Typography: `text-xs` through `text-9xl`, `font-*`, `leading-*`, `tracking-*`
  - Colors: Full Tailwind palette for `text-*`, `bg-*`, `border-*`
  - Borders: `rounded-*`, `border-*`
  - Effects: `shadow-*`, `opacity-*`, `ring-*`
  - Transitions: `transition-*`, `duration-*`, `ease-*`
  - Responsive prefixes: `sm:`, `md:`, `lg:`, `xl:`

**Step 6: Construct HTML**
Assembles a complete HTML document with:
- `<head>`: Meta tags, embedded CSS styles
- `<body>`: Root `<div id="root">`, inline Babel-transformed scripts
- All component files concatenated and wrapped in Babel `type="text/babel"` script tags
- Entry point script that calls `ReactDOM.createRoot().render()`

**Step 7: Create blob URL**
```typescript
const blob = new Blob([html], { type: 'text/html' });
const newUrl = URL.createObjectURL(blob);
```

**Step 8: Render iframe**
The blob URL is set as the `src` of a sandboxed iframe.

### 6.4 Blob URL Lifecycle

To prevent memory leaks while avoiding flickering:

1. A new blob URL is created from the updated HTML
2. The new URL is set in state, causing the iframe to load it
3. The **old** blob URL is revoked after a 2-second delay (to allow the iframe to finish loading the new one before the old one is cleaned up)

```
files change → useMemo recomputes HTML → new blob URL created
  → setBlobUrl(newUrl) → iframe loads new URL
  → setTimeout(() => URL.revokeObjectURL(oldUrl), 2000)
```

### 6.5 Common Syntax Fix Preprocessing

Before Babel compilation, the runner applies several syntax fixes to generated code to handle common generator artifacts:

- Stray semicolons after `return (` or `=> (`
- Double/triple semicolons
- Semicolons inside JSX expressions
- Malformed import statements with semicolons or newlines inside braces
- Empty statements on their own lines

---

## 7. Server Modules Reference

**Directory:** `server/modules/` (41 modules)

All server-side intelligence is organized into focused modules. Each module exports pure functions (no side effects on import) and is consumed by `server/routes.ts`.

### 7.0 Plan-Driven Pipeline (New)

| Module | Lines | Description |
|--------|-------|-------------|
| **`deep-understanding-engine.ts`** | 662 | 5-level analysis pipeline: intent decomposition, multi-domain detection with blending, entity extraction with keyword inference, workflow detection, clarification management |
| **`conversation-phase-handler.ts`** | 346 | 6-phase state machine (initial -> understanding -> clarifying -> planning -> approval -> generating -> complete) with deadlock recovery and 2-round clarification limit |
| **`plan-generator.ts`** | 493 | Generates structured ProjectPlan objects from understanding data: tech stack, modules, data model, pages, API endpoints, workflows, user roles, file blueprints |
| **`plan-driven-generator.ts`** | 1,828 | 36 generator functions producing complete React+Vite+TypeScript projects from approved plans with full backend, UI components, and domain-specific pages |
| **`post-generation-validator.ts`** | 601 | Validates generated code: 50+ package dependency checks, implicit dependency detection, smart stub generation, runtime pattern validation |
| **`domain-knowledge.ts`** | 1,383 | 14 industry domain profiles with entities, workflows, roles, pages, KPIs, and integration points |
| **`vite-error-fixer.ts`** | 829 | Server-side auto-fix engine analyzing 11 error types from Vite build output and generating patches, stubs, and dependency fixes |

### 7.1 Natural Language Processing

| Module | Description |
|--------|-------------|
| **`natural-language-understanding.ts`** | Core NLU engine with synonym mappings and domain context resolution. Maps user terms to canonical forms (e.g., "webpage" → "web application", "auth" → "authentication"). Provides `analyzeNLU()`, `classifyIntent()`, `extractEntities()`, `parseSemantics()`, `analyzeSentiment()`. |
| **`enhanced-intent-recognition.ts`** | Intent classification with confidence scoring. Exports `recognizeIntent()` which returns an intent label and a 0-1 confidence score. Also provides `isQuestion()` for quick query type detection and `extractEntitiesEnhanced()` for richer entity extraction. |
| **`conversational-flexibility.ts`** | Context-aware conversation handling. Detects follow-up questions via `detectFollowUp()`, resolves pronoun references with `resolvePronouns()`, maintains conversation context with `updateContext()`, and generates clarification prompts when ambiguity is detected. |
| **`clarification-engine.ts`** | Ambiguity detection and clarifying question generation. Analyzes user prompts via `analyzePrompt()` to determine if additional information is needed, then produces structured clarification questions via `formatClarificationQuestions()`. |

### 7.2 Code Generation & Analysis

| Module | Description |
|--------|-------------|
| **`advanced-code-generation.ts`** | Server-side code generation orchestration. Wraps the generation pipeline and formats output as file trees (`formatProjectAsTree()`) or markdown (`formatProjectAsMarkdown()`). |
| **`deep-project-generator.ts`** | Legacy project generator (3,279 lines). Produces full-stack projects using a blueprint/feature system. Largely replaced by the client-side Pro Generator for most paths, but still used for server-side generation and complex multi-stack projects. Exports `generateDeepProject()`, `listBlueprints()`, `listFeatures()`. |
| **`complete-code-intelligence.ts`** | Pattern-based code intelligence engine (6,218 lines — the largest module). Provides deep code analysis, pattern recognition, refactoring suggestions, and code quality scoring. |
| **`live-code-analysis.ts`** | Real-time code structure parsing. Exports `analyzeCode()` for structure extraction, `diagnoseError()` for error analysis, and `autoFixCode()` for server-side auto-fix attempts. |
| **`ai-code-refiner.ts`** | AI-powered code refinement that applies style and quality improvements to generated code. |
| **`code-cleaner.ts`** | Dead code removal, unused import detection, and code formatting cleanup. |

### 7.3 Code Explanation

| Module | Description |
|--------|-------------|
| **`code-explanation-engine.ts`** | Line-by-line code explanation for JavaScript/TypeScript. Exports `explainCode()` for detailed explanations, `detectPatterns()` for design pattern recognition, and `summarizeCode()` for high-level summaries. |
| **`universal-code-explanation.ts`** | Multi-language code explanation engine. Extends the explanation engine to support Python, Java, Go, Rust, C/C++, and other languages via `explainCodeUniversal()`. |

### 7.4 Debugging

| Module | Description |
|--------|-------------|
| **`continuous-debugger.ts`** | Error pattern recognition with 10+ known error patterns (null reference, type mismatch, import errors, async/await issues, etc.). Maintains debug sessions via `continuousDebug()`, provides `parseError()` for structured error parsing, and tracks debug state with `getDebugStatus()` / `getDebugSession()`. |
| **`deep-debugging-engine.ts`** | Root cause analysis for complex multi-step errors. Exports `analyzeError()` for deep analysis, `parseStackTrace()` for stack trace decomposition, and `generateFixChain()` which produces an ordered list of fixes to apply. |

### 7.5 Planning & Reasoning

| Module | Description |
|--------|-------------|
| **`planning-module.ts`** | Project plan generation. Creates structured plans with tech stack recommendations, folder structures, architecture decisions, and security considerations. Exports `generateProjectPlan()` and `formatPlanAsMarkdown()`. |
| **`advanced-reasoning.ts`** | Problem decomposition and conflict detection. Breaks complex requirements into sub-tasks via `analyzeAndPlan()`, detects conflicting requirements, and provides `quickAnalysis()` for rapid assessments. |

### 7.6 Context & Memory

| Module | Description |
|--------|-------------|
| **`context-memory.ts`** | Conversation history tracking (retains up to 100 messages). Learns from interactions via `learnFromInteraction()`, retrieves context-aware preferences with `getContextPreferences()`, and provides `getRelevantContext()` for retrieving pertinent past interactions. |
| **`context-window-manager.ts`** | Token window management for LLM context limits. Creates context windows via `createContextWindow()`, adds content chunks with `addChunk()`, and provides `compressConversation()` to fit conversations within token limits. |
| **`intel-memory.ts`** | User preference learning system. Extracts user preferences, decisions, and patterns from conversations via `extractIntelFromMessages()`. Stores and retrieves learned intel with `storeIntel()` / `getIntel()`. Used to personalize future code generation. |

### 7.7 Security & Testing

| Module | Description |
|--------|-------------|
| **`security-module.ts`** | OWASP-aligned vulnerability scanning. Scans generated code for common vulnerabilities (XSS, SQL injection, insecure dependencies, hardcoded secrets, etc.) via `scanForVulnerabilities()`. Provides `getSecurityRecommendations()` for actionable fixes. |
| **`testing-engine.ts`** | Test generation and execution. Generates unit tests for components and functions via `generateTestsForCode()`, runs tests with `runTests()`, and validates builds with `validateBuild()`. |

### 7.8 Knowledge & Templates

| Module | Description |
|--------|-------------|
| **`knowledge-base.ts`** | Framework patterns and best practices encyclopedia. Provides `getConcept()`, `searchConcepts()`, `getBestPractices()`, and `getLearningPath()` for structured knowledge retrieval about React, Node.js, databases, and other technologies. |
| **`framework-patterns.ts`** | 500+ code patterns indexed by framework and category. `findPatterns()` searches by keyword, `getPattern()` retrieves a specific pattern, and `getAllPatterns()` returns the full catalog. Covers React, Express, database, authentication, and deployment patterns. |
| **`multi-language-templates.ts`** | Templates for multiple programming languages (1,257 lines). Provides starter templates, snippets, and boilerplate for JavaScript, TypeScript, Python, Go, Rust, Java, and more via `LANGUAGES`, `getLanguageById()`, `getSnippet()`. |

### 7.9 Project Management & Export

| Module | Description |
|--------|-------------|
| **`preview-project-manager.ts`** | Live preview management. Handles project preview sessions, temporary file storage, and preview server lifecycle for the in-browser preview experience. |
| **`export-system.ts`** | Project export in multiple formats. Exports `generateProjectExport()` (zip archive) and `generateDownloadData()` (text bundle). Supports full project export with all files, dependencies, and configuration. |
| **`dependency-intelligence.ts`** | Dependency analysis and management. Analyzes project dependencies via `analyzeDependencies()`, generates `.env.example` files with `generateEnvExample()`, and produces dependency reports with `formatDependencyReport()`. |

### 7.10 AI & Conversation

| Module | Description |
|--------|-------------|
| **`true-conversational-ai.ts`** | Stateful conversational AI engine. Manages multi-turn conversations with `createConversation()` / `processTurn()`. Learns user preferences with `learnPreferences()` and retrieves relevant memory with `getRelevantMemory()`. |
| **`transparency-module.ts`** | Change tracking and assumption logging. Extracts assumptions from user prompts via `extractAssumptions()`, logs all changes with `summarizeChanges()`, and formats transparency reports showing what the AI assumed vs. what was explicitly stated. |
| **`llm-training-context.ts`** | LLM context preparation (1,981 lines). Prepares structured context for LLM API calls, including conversation history, project state, and relevant knowledge base entries. |
| **`local-llm-client.ts`** | Client for local LLM inference. Provides an abstraction layer for running inference against locally hosted models as an alternative to cloud API calls. |
| **`ai-fullstack-generator.ts`** | AI-powered full-stack application generation that leverages LLM APIs for more creative and context-aware code generation compared to the pattern-based generators. |

### 7.11 Utilities

| Module | Description |
|--------|-------------|
| **`logger.ts`** | Structured logging with request correlation. Exports `logger` (for general logging) and `requestLogger` (Express middleware). |
| **`index.ts`** | Module barrel file that re-exports key functions from all modules for convenient importing. |

---

## 8. Database Layer

### 8.1 Schema

**File:** `shared/schema.ts` (266 lines)

The schema defines 16 database tables using Drizzle ORM with PostgreSQL:

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `users` | User accounts | `id` (UUID), `username`, `password` |
| `conversations` | Chat sessions with project context | `id`, `title`, `projectName`, `projectDescription`, `techStack[]`, `featuresBuilt[]`, `projectSummary`, `projectType`, `complexity`, `designStyle`, `colorPreferences[]`, `planGenerated`, `securityScore`, `testsPassed`, `testsFailed` |
| `messages` | Chat messages | `id`, `conversationId` (FK), `role`, `content`, `createdAt` |
| `project_files` | Generated code files | `id`, `conversationId` (FK), `path`, `content`, `language`, `createdAt`, `updatedAt` |
| `project_plans` | Architecture documentation | `id`, `conversationId` (FK), `summary`, `techStack` (JSONB), `architecture`, `folderStructure`, `designDecisions` (JSONB), `securityConsiderations[]` |
| `intel_records` | User preference learning | `id`, `conversationId` (FK), `type`, `category`, `key`, `value`, `confidence`, `source`, `usageCount` |
| `test_results` | Test execution outcomes | `id`, `conversationId` (FK), `targetFile`, `passed`, `failed`, `skipped`, `coverage`, `details` (JSONB) |
| `security_scans` | Vulnerability scan results | `id`, `conversationId` (FK), scan details |
| `generation_logs` | Code generation audit trail | `id`, `conversationId` (FK), generation metadata |
| `vapt_assets` | VAPT target assets | `id`, asset metadata |
| `vapt_vulnerabilities` | Discovered vulnerabilities | `id`, vulnerability details |
| `vapt_scans` | VAPT scan records | `id`, scan configuration and results |
| `vapt_schedules` | Scheduled scan configurations | `id`, schedule details |
| `vapt_audit_logs` | VAPT audit trail | `id`, audit entries |
| `vapt_team_members` | VAPT team management | `id`, member details |

Each table has corresponding Drizzle-Zod insert schemas and TypeScript types:

```typescript
export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  createdAt: true,
});
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = typeof conversations.$inferSelect;
```

### 8.2 Storage Interface

**File:** `server/storage.ts` (901 lines)

The `IStorage` interface defines all CRUD operations used by the application. It abstracts the database layer so that the API routes in `server/routes.ts` never interact with the database directly.

```typescript
export interface IStorage {
  // Conversations
  getConversation(id: number): Promise<Conversation | undefined>;
  getAllConversations(): Promise<Conversation[]>;
  createConversation(title: string): Promise<Conversation>;
  deleteConversation(id: number): Promise<void>;
  updateProjectContext(id: number, context: ProjectContext): Promise<Conversation | undefined>;
  
  // Messages
  getMessagesByConversation(conversationId: number): Promise<Message[]>;
  createMessage(conversationId: number, role: string, content: string): Promise<Message>;
  
  // Project Files
  getProjectFiles(conversationId: number): Promise<ProjectFile[]>;
  getProjectFile(id: number): Promise<ProjectFile | undefined>;
  createProjectFile(file: InsertProjectFile): Promise<ProjectFile>;
  updateProjectFile(id: number, content: string): Promise<ProjectFile | undefined>;
  deleteProjectFile(id: number): Promise<void>;
  deleteProjectFilesByConversation(conversationId: number): Promise<void>;
  upsertProjectFile(conversationId: number, path: string, content: string, language: string): Promise<ProjectFile>;
  
  // Project Plans
  getProjectPlan(conversationId: number): Promise<ProjectPlan | undefined>;
  createProjectPlan(plan: InsertProjectPlan): Promise<ProjectPlan>;
  
  // Intel Records
  getIntelRecords(conversationId: number): Promise<IntelRecord[]>;
  createIntelRecord(record: InsertIntelRecord): Promise<IntelRecord>;
  upsertIntelRecord(conversationId: number, key: string, category: string, value: string, type: string): Promise<IntelRecord>;
  
  // Test Results
  getTestResults(conversationId: number): Promise<TestResult[]>;
  createTestResult(result: InsertTestResult): Promise<TestResult>;
  
  // Security Scans
  getSecurityScans(conversationId: number): Promise<SecurityScan[]>;
  createSecurityScan(scan: InsertSecurityScan): Promise<SecurityScan>;
  getLatestSecurityScan(conversationId: number): Promise<SecurityScan | undefined>;
  
  // Generation Logs
  getGenerationLogs(conversationId: number): Promise<GenerationLog[]>;
  createGenerationLog(log: InsertGenerationLog): Promise<GenerationLog>;
  
  // VAPT Operations
  getVaptAssets(): Promise<VaptAsset[]>;
  createVaptAsset(asset: InsertVaptAsset): Promise<VaptAsset>;
  updateVaptAsset(id: number, asset: Partial<InsertVaptAsset>): Promise<VaptAsset>;
  deleteVaptAsset(id: number): Promise<void>;
  getVaptVulnerabilities(): Promise<VaptVulnerability[]>;
  getVaptScans(): Promise<VaptScan[]>;
  runVaptScan(id: number): Promise<VaptScan>;
  getVaptDashboardStats(): Promise<any>;
  seedVaptDemoData(): Promise<void>;
  // ... and more VAPT methods
}
```

### 8.3 Storage Implementations

**`DatabaseStorage` class — Production storage (Drizzle ORM + PostgreSQL)**

Uses the Drizzle ORM `db` instance imported from `server/db.ts`. All queries use Drizzle's type-safe query builder:

```typescript
export class DatabaseStorage implements IStorage {
  async getAllConversations(): Promise<Conversation[]> {
    return db.select().from(conversations).orderBy(desc(conversations.createdAt));
  }
  
  async createConversation(title: string): Promise<Conversation> {
    const [conv] = await db.insert(conversations).values({ title }).returning();
    return conv;
  }
  
  async deleteConversation(id: number): Promise<void> {
    await db.delete(conversations).where(eq(conversations.id, id));
  }
  
  async upsertProjectFile(conversationId: number, path: string, content: string, language: string): Promise<ProjectFile> {
    const existing = await db.select().from(projectFiles)
      .where(and(eq(projectFiles.conversationId, conversationId), eq(projectFiles.path, path)));
    if (existing.length > 0) {
      const [updated] = await db.update(projectFiles)
        .set({ content, updatedAt: new Date() })
        .where(eq(projectFiles.id, existing[0].id))
        .returning();
      return updated;
    }
    const [created] = await db.insert(projectFiles)
      .values({ conversationId, path, content, language })
      .returning();
    return created;
  }
}
```

**`MemStorage` class — Development/fallback storage (in-memory)**

Implements the same `IStorage` interface using plain JavaScript `Map` objects. Used when `DATABASE_URL` is not set, enabling development without a database:

```typescript
export class MemStorage implements IStorage {
  private conversations: Map<number, Conversation> = new Map();
  private messages: Map<number, Message> = new Map();
  private projectFiles: Map<number, ProjectFile> = new Map();
  // ... more maps for each entity
  private nextId: number = 1;
  
  async createConversation(title: string): Promise<Conversation> {
    const conv = { id: this.nextId++, title, createdAt: new Date(), /* ... */ };
    this.conversations.set(conv.id, conv);
    return conv;
  }
}
```

### 8.4 `ProjectContext` Interface

A special interface used for updating conversation-level project metadata:

```typescript
export interface ProjectContext {
  projectName?: string | null;
  projectDescription?: string | null;
  techStack?: string[] | null;
  featuresBuilt?: string[] | null;
  projectSummary?: string | null;
  lastCodeGenerated?: string | null;
  projectType?: string | null;
  complexity?: string | null;
  designStyle?: string | null;
  colorPreferences?: string[] | null;
  planGenerated?: boolean | null;
  securityScore?: number | null;
  testsPassed?: number | null;
  testsFailed?: number | null;
}
```

This is passed to `updateProjectContext(id, context)` to persist project-level metadata alongside conversation history, enabling the AI to maintain context across sessions.

---

## 9. Adding New Features

### Example: Adding a "Clear Cache" Feature

**Step 1: Add IPC handler in main process**

```typescript
// electron/main.ts
ipcMain.handle('project:clearCache', async (_event, projectName: string) => {
  try {
    const projectPath = projectManager.getProjectPath(projectName);
    const nodeModulesPath = path.join(projectPath, 'node_modules');
    
    if (fs.existsSync(nodeModulesPath)) {
      fs.rmSync(nodeModulesPath, { recursive: true, force: true });
    }
    
    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
});
```

**Step 2: Expose in preload script**

```typescript
// electron/preload.ts
contextBridge.exposeInMainWorld('electronAPI', {
  // ... existing methods
  clearCache: (projectName: string) => 
    ipcRenderer.invoke('project:clearCache', projectName),
});
```

**Step 3: Update type definitions**

```typescript
// electron/preload.ts (interface)
interface ElectronAPI {
  // ... existing methods
  clearCache: (projectName: string) => Promise<{ success: boolean; error?: string }>;
}

// client/src/lib/code-runner/electron-runner.ts
interface ElectronAPI {
  // ... same interface
  clearCache: (projectName: string) => Promise<{ success: boolean; error?: string }>;
}
```

**Step 4: Add frontend wrapper**

```typescript
// client/src/lib/code-runner/electron-runner.ts
export async function clearCache(projectName: string): Promise<RunResult> {
  if (!isElectronEnvironment()) {
    return { success: false, error: 'Not running in Electron' };
  }
  return getElectronAPI().clearCache(projectName);
}
```

**Step 5: Rebuild and test**

```bash
# Build Electron files using esbuild (NOT tsc)
npm run build:electron

# This runs scripts/build-electron.ts which uses esbuild to compile
# electron/main.ts and electron/preload.ts into dist-electron/

# Then restart Electron
npm run electron:dev
```

> **Note:** Do not use `npx tsc -p electron/tsconfig.json` for building. The project uses esbuild via `scripts/build-electron.ts` for faster builds and proper CJS output format. The `tsconfig.json` files are used for type checking only.

---

## 10. IPC Communication Patterns

### Request-Response Pattern

Use for one-off operations that return a result:

```typescript
// Main process
ipcMain.handle('channel:name', async (event, ...args) => {
  // Do work
  return { success: true, data: result };
});

// Preload
ipcRenderer.invoke('channel:name', arg1, arg2);
```

### Event Stream Pattern

Use for pushing updates to the renderer:

```typescript
// Main process
mainWindow.webContents.send('channel:event', eventData);

// Preload
onEvent: (callback) => {
  const handler = (event, data) => callback(data);
  ipcRenderer.on('channel:event', handler);
  return () => ipcRenderer.removeListener('channel:event', handler);
}
```

### Bidirectional Pattern

Use for long-running operations with progress:

```typescript
// Main process
ipcMain.handle('runner:longOperation', async (event, args) => {
  for (const step of steps) {
    mainWindow.webContents.send('runner:progress', step);
    await processStep(step);
  }
  return { success: true };
});
```

---

## 11. State Management

### Main Process State

Keep minimal state in the main process:

```typescript
class LocalRunner {
  private currentProcess: ChildProcess | null = null;
  private serverUrl: string | null = null;
  
  // Methods manage this state
}
```

### Renderer State

Use React state/context for UI state:

```typescript
const [isRunning, setIsRunning] = useState(false);
const [serverUrl, setServerUrl] = useState<string | null>(null);

useEffect(() => {
  const unsubscribe = window.electronAPI.onServerReady((url) => {
    setServerUrl(url);
    setIsRunning(true);
  });
  return unsubscribe;
}, []);
```

---

## 12. Error Handling Patterns

### Main Process Errors

Always catch and return structured errors:

```typescript
ipcMain.handle('runner:operation', async (event, args) => {
  try {
    const result = await doOperation(args);
    return { success: true, data: result };
  } catch (error) {
    console.error('Operation failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : String(error)
    };
  }
});
```

### Renderer Error Handling

```typescript
const result = await window.electronAPI.operation(args);

if (!result.success) {
  toast({
    title: 'Operation Failed',
    description: result.error,
    variant: 'destructive',
  });
  return;
}

// Continue with success case
```

---

## 13. Testing Your Changes

### Manual Testing Checklist

1. **File Operations**
   - [ ] Create a new project with multiple files
   - [ ] Verify files appear in `~/AutoCoder/projects/`
   - [ ] Check file contents match generated code

2. **npm Install**
   - [ ] Run npm install on a project with 10+ dependencies
   - [ ] Verify logs stream to UI in real-time
   - [ ] Check node_modules is created

3. **Dev Server**
   - [ ] Start dev server
   - [ ] Verify server URL is detected
   - [ ] Check preview loads correctly
   - [ ] Stop server and verify cleanup

4. **Project Management**
   - [ ] List projects
   - [ ] Delete a project
   - [ ] Open project folder in system file manager

---

## 14. Build and Packaging

### Development Build

```bash
# Build Electron with esbuild
npm run build:electron

# Output: dist-electron/main.js, dist-electron/preload.js
```

### Production Build

```bash
# Step 1: Build React app for production
npm run build

# Step 2: Build Electron
npm run build:electron

# Step 3: Package with electron-builder
npx electron-builder
```

Output goes to `release/` directory.

### Build Configuration

See `electron-builder.json` for platform-specific settings.

### Windows Notes

- All npm scripts use `cross-env` for cross-platform environment variables
- Server auto-detects Windows and skips `reusePort` (prevents ENOTSUP)
- Close VS Code before `npm install` (prevents EBUSY lock errors on Electron files)

---

## 15. Code Style and Conventions

### TypeScript

- Use strict mode
- Define interfaces for all IPC payloads
- Use async/await over callbacks where possible

### Error Messages

- Be specific: "Failed to write file: /path/to/file"
- Include context: "npm install failed with exit code 1"
- Be actionable when possible

### Logging

- Use console.log for development
- Stream important events to renderer
- Prefix logs with component: `[AutoCoder]`, `[npm]`, `[dev]`

### File Naming

- Use kebab-case for files
- Use PascalCase for classes
- Use camelCase for functions and variables
