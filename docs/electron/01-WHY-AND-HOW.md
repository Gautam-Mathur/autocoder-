# AutoCoder Electron: Why and How It Works

## Executive Summary

AutoCoder is transitioning from a browser-based WebContainer application to an Electron desktop application. This document explains the reasoning behind this decision and provides a deep technical explanation of how the system works.

---

## Part 1: Why Electron?

### The Problem with WebContainer

WebContainer is a browser-based technology that runs Node.js entirely in the browser. While innovative, it has fundamental limitations that cannot be overcome:

#### 1. 16KB File Write Limitation

**The Core Issue:**
WebContainer uses the browser's virtual file system, which has a hard limit of approximately 16KB per file write operation. This is a browser security constraint, not a WebContainer design choice.

**Impact on AutoCoder:**
```
package.json for a typical React project: ~2-3KB
package.json with 50+ dependencies: ~15-20KB  ← FAILS
node_modules structure: ~500MB+ ← IMPOSSIBLE
```

When users try to create projects with many dependencies, the file write fails silently or throws cryptic errors. This makes AutoCoder unreliable for real-world projects.

**Our Workaround Attempts:**
1. Batched dependency installation (write minimal package.json, install in groups)
2. Retry logic with exact content verification
3. Streaming file writes in chunks

**Result:** These workarounds add complexity and still fail for large projects. The fundamental limitation cannot be bypassed.

#### 2. Virtual npm is Slow and Limited

WebContainer's npm implementation is a simulation running in JavaScript. Compared to native npm:

| Operation | WebContainer | Native npm |
|-----------|-------------|------------|
| Install 10 packages | 45-60 seconds | 5-10 seconds |
| Install 50 packages | Often fails | 30-60 seconds |
| Cache utilization | None | Full system cache |
| Network efficiency | Single-threaded | Multi-threaded |

#### 3. Browser Memory Constraints

Browsers limit memory per tab to approximately 2-4GB. For complex projects:
- node_modules can exceed 500MB
- Build processes can consume 1-2GB
- Multiple projects become impossible

#### 4. Lost State on Refresh

WebContainer's virtual file system is ephemeral. When users:
- Refresh the page
- Close the tab
- Lose connection

All project files, installed dependencies, and progress are lost.

### What Changed: LiveCodeRunner + Electron

AutoCoder now has two solutions to the WebContainer limitations:

1. **LiveCodeRunner (Web Mode)** - Browser-based Babel transpilation that provides instant preview of React projects without npm install. This eliminates the 16KB limitation for previews and runs entirely in the browser.

2. **Electron (Desktop Mode)** - Native file system access with real npm for full project builds. This is the complete solution for running generated projects locally.

---

## Part 1.5: LiveCodeRunner Deep Dive

LiveCodeRunner is a 1,079-line React component (`client/src/components/live-code-runner.tsx`) that provides instant, zero-install previews of generated React projects directly in the browser. It achieves this by simulating an entire frontend build pipeline using regex-based transforms, mocked imports, embedded CSS, and in-browser Babel transpilation. This section explains every stage of its pipeline in detail.

### 1.5.1 File Filtering Pipeline

When the Pro Generator produces 15-20 files for a project, LiveCodeRunner must determine which files are relevant for a browser preview. Not all files can or should be rendered — backend code, test files, configuration, and database schemas must be excluded.

#### Backend File Detection

LiveCodeRunner uses **15 regex patterns** to identify and exclude backend/server-side files by their path:

```javascript
const backendPathPatterns = [
  /\bserver\b/i,        // server/, server.ts
  /\bcontrollers?\b/i,  // controllers/, controller.ts
  /\bmiddleware\b/i,    // middleware/, auth-middleware.ts
  /\bmodels?\b/i,       // models/, user-model.ts
  /\broutes?\b/i,       // routes/, api-routes.ts
  /\bservices?\b/i,     // services/, auth-service.ts
  /\bvalidators?\b/i,   // validators/, input-validator.ts
  /\be2e\b/i,           // e2e/, e2e-tests/
  /\btests?\b/i,        // tests/, test-utils.ts
  /\bspec\b/i,          // spec/, user.spec.ts
  /\b__tests__\b/i,     // __tests__/
  /\bprisma\b/i,        // prisma/, schema.prisma
  /\bdb\b/i,            // db/, database.ts
  /\bmigrations?\b/i,   // migrations/, 001-init.ts
  /\bscripts?\b/i       // scripts/, build-script.ts
];
```

Each file path is tested against all patterns. If any pattern matches, the file is excluded from the preview pipeline. This ensures that Express route handlers, Prisma schemas, database migrations, and test suites never reach the Babel transpiler.

#### File Extension Filtering

Beyond path-based filtering, LiveCodeRunner only processes files with specific extensions:

| Included | Excluded |
|----------|----------|
| `.tsx` | `.config.js` |
| `.jsx` | `.config.ts` |
| `.js` | `package.json` |
| `.css` (separate pipeline) | `vite.config.js` |
| `.html` (HTML-only mode) | `.test.ts`, `.spec.ts` |

#### Project Type Detection

LiveCodeRunner detects three project types and handles each differently:

1. **HTML-only projects** — If an `.html` file exists and no `.tsx`/`.jsx` files are found, it renders the HTML directly with inlined CSS and JS. External `<script src="...">` tags and `<link>` tags are stripped since they cannot resolve in the sandbox. ES module `<script type="module">` tags are also removed.

2. **React/JSX projects** — The primary mode. TSX/JSX files are processed through the full pipeline: TypeScript stripping, import mocking, component assembly, Babel transpilation.

3. **Server-side-only projects** — If all files are filtered out as backend code, LiveCodeRunner returns an empty preview with an appropriate message.

### 1.5.2 TypeScript Stripping

Since Babel standalone does not handle TypeScript type annotations natively in production mode, LiveCodeRunner strips all TypeScript constructs using regex patterns before sending code to Babel. This is done entirely without an AST parser — pure string manipulation.

#### Type Annotation Removal

The following TypeScript constructs are removed:

**React-specific types:**
```javascript
code = code.replace(/:\s*React\.\w+(<[^>]+>)?/g, '');
```
Removes patterns like `: React.FC<Props>`, `: React.ReactNode`, `: React.ChangeEvent<HTMLInputElement>`.

**Primitive and common types:**
```javascript
code = code.replace(/:\s*(string|number|boolean|any|void|null|undefined|FC|
  FunctionComponent|ReactNode|HTMLAttributes|ComponentProps)(\[\])?(\s*\|[^=]+)?/g, '');
```
Handles union types (e.g., `string | null`), array types (e.g., `number[]`), and common React types.

**Object type annotations:**
```javascript
code = code.replace(/:\s*\{[^}]+\}(\s*\|[^=]+)?/g, '');
```
Strips inline object types like `{ name: string; age: number }`.

#### 60+ TypeScript Type Suffix Patterns

LiveCodeRunner recognizes and strips type annotations ending in any of these **60+ suffixes**:

```
Type, Props, State, Interface, Options, Config, Params, Args,
Response, Request, Handler, Error, Context, Ref, Data, Result,
Info, Payload, Schema, Enum, Event, Element, Component, Service,
Factory, Class, Module, Store, Reducer, Action, Dispatch,
Middleware, Hook, Util, Helper, Manager, Controller, Decorator,
Mixin, Observable, Subject, Subscriber, Observer, Iterator,
Generator, Promise, Callback, Listener, Emitter, Stream, Buffer,
Record, Map, Set, Tuple, Union, Intersection, Guard, Assertion,
Predicate, Validator, Serializer, Deserializer, Transformer,
Converter, Adapter, Wrapper, Proxy, Interceptor
```

This regex matches patterns like `(props: UserProps)` → `(props)`, `(config: AppConfig)` → `(config)`, etc. The suffix-based approach avoids stripping object property assignments that look similar (e.g., `{icon: DollarSign}` is preserved because `DollarSign` doesn't end in a known type suffix).

#### TypeScript Keyword Removal

```javascript
code = code.replace(/\bas\s+const\b/g, '');           // "as const" assertions
code = code.replace(/\bsatisfies\s+\w+/g, '');        // "satisfies MyType"
code = code.replace(/\breadonly\s+/g, '');             // "readonly" modifier
code = code.replace(/\bkeyof\s+typeof\s+\w+/g, '""'); // "keyof typeof obj"
code = code.replace(/\bkeyof\s+\w+/g, '""');          // "keyof MyType"
```

#### Interface and Type Alias Removal

Complete `interface` and `type` declarations are stripped:
```javascript
code = code.replace(/interface\s+\w+(\s+extends\s+\w+)?\s*\{[\s\S]*?\}/g, '');
code = code.replace(/type\s+\w+\s*=\s*[^;]+;/g, '');
```

#### Generic Type Parameter Stripping

```javascript
code = code.replace(/<[A-Z]>/g, '');              // Single letter: <T>, <K>
code = code.replace(/<[A-Z],\s*[A-Z]>/g, '');     // Double: <K, V>
code = code.replace(/<(string|number|boolean|any|unknown|never|void|null|
  undefined|object)(\[\])?(,\s*(...))*>/g, '');    // Built-in type generics
```

Note: Only single-letter generics (e.g., `<T>`) are stripped to avoid accidentally removing JSX tags like `<Table>` or `<Tabs>`.

#### Other TypeScript Constructs

```javascript
// Remove enum, declare, namespace, abstract
code = code.replace(/\benum\s+\w+\s*\{[\s\S]*?\}/g, '');
code = code.replace(/\bnamespace\s+\w+\s*\{[\s\S]*?\}/g, '');
code = code.replace(/\babstract\s+class\b/g, 'class');
code = code.replace(/declare\s+module\s+['"][^'"]+['"]\s*\{[\s\S]*?\}/g, '');

// Remove non-null assertions
code = code.replace(/(\w)!\./g, '$1.');
code = code.replace(/(\w)!(?=[,;\)\]\s])/g, '$1');
```

### 1.5.3 Import Mocking System

This is the most complex part of LiveCodeRunner. In a real project, components import from `node_modules` (shadcn/ui, lucide-react, react-router-dom, etc.). Since there is no `node_modules` in the browser preview, LiveCodeRunner provides mock implementations for **205+ UI components** and **60+ icons**.

#### Step 1: Strip All Import Statements

```javascript
// Single-line imports: import { Button } from '@/components/ui/button';
code = code.replace(/^import\s+[\s\S]*?from\s+['"][^'"]*['"];?\s*$/gm, '');
// Side-effect imports: import './styles.css';
code = code.replace(/^import\s+['"][^'"]*['"];?\s*$/gm, '');
// require() calls
code = code.replace(/const\s+\w+\s*=\s*require\([^)]+\)\s*;?/g, '');
```

#### Step 2: Mock UI Components (205+)

LiveCodeRunner provides mock implementations for these component categories:

**Layout & Navigation:**
```
Router, Route, Routes, Link, NavLink, BrowserRouter, HashRouter,
MemoryRouter, Outlet, Navigate, Switch, Layout, Navbar, Sidebar,
Header, Footer
```

**Form Controls:**
```
Button, Input, Label, Textarea, Checkbox, Select, SelectTrigger,
SelectValue, SelectContent, SelectItem, Slider, Form, FormField,
FormItem, FormLabel, FormControl, FormDescription, FormMessage
```

**Data Display:**
```
Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter,
Badge, Avatar, AvatarImage, AvatarFallback, Table, TableHeader,
TableBody, TableRow, TableHead, TableCell, Progress
```

**Overlay & Feedback:**
```
Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle,
DialogDescription, DialogFooter, Tooltip, TooltipTrigger,
TooltipContent, TooltipProvider, DropdownMenu, DropdownMenuTrigger,
DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator
```

**Content Organization:**
```
Tabs, TabsList, TabsTrigger, TabsContent, ScrollArea, Separator,
QueryClient, QueryClientProvider
```

Each mocked component renders a semantically appropriate HTML element. For example:
- `Button` → `<button>` with appropriate styling
- `Card` → `<div>` with card-like CSS classes
- `Input` → `<input>` element
- `Link` → `<a>` tag
- `Dialog` → Visibility-togglable overlay `<div>`

#### Step 3: Mock Lucide Icons (60+)

LiveCodeRunner mocks **60+ Lucide React icons** as inline SVG elements:

```
Check, X, Plus, Minus, ChevronUp, ChevronDown, ChevronLeft,
ChevronRight, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Search,
Home, User, Users, Settings, Menu, Edit, Edit2, Trash, Trash2,
Copy, Eye, EyeOff, Lock, Unlock, Star, Heart, Bell, Mail,
Calendar, Download, Upload, File, Folder, Image, Camera, Phone,
MessageSquare, MessageCircle, Send, MoreHorizontal, MoreVertical,
Filter, RefreshCw, RotateCw, AlertCircle, AlertTriangle, Info,
CheckCircle, XCircle, Clock, MapPin, Globe, ShoppingCart,
CreditCard, DollarSign, Activity, BarChart, PieChart, TrendingUp,
TrendingDown, Zap, Sun, Moon, Cloud, Loader, Loader2, Sparkles,
Package, Box, Layers, Grid, List, Tag, Bookmark, Award, Gift,
Briefcase, Building, Clipboard, Terminal, Code, Database, Server,
Wifi, Bluetooth, Power, ExternalLink, LinkIcon, Paperclip, Play,
Pause, StopCircle, SkipBack, SkipForward, Volume2, VolumeX,
Maximize, Minimize, ZoomIn, ZoomOut, Printer, Save, Undo, Redo,
Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight,
HelpCircle
```

Each icon is rendered as an SVG placeholder with the `lucide` CSS class for consistent sizing (1em x 1em).

#### Step 4: React Router Mocking

LiveCodeRunner provides complete mocking for both React Router v5 and v6:

| Component/Hook | Mock Behavior |
|---|---|
| `BrowserRouter` | Wraps children in a `<div>` |
| `Routes` / `Switch` | Renders **all** child `Route` components (no actual routing) |
| `Route` | Renders its `element` prop or `children` |
| `Link` / `NavLink` | Renders as `<a>` tag with `href` |
| `Navigate` | Returns `null` (no-op redirect) |
| `Outlet` | Returns `null` |
| `useNavigate()` | Returns a no-op function |
| `useParams()` | Returns `{}` (empty object) |
| `useLocation()` | Returns `{ pathname: '/', search: '', hash: '' }` |
| `useSearchParams()` | Returns `[new URLSearchParams(), () => {}]` |
| `useMatch()` | Returns `null` |

This means in the preview, all routes are rendered simultaneously on a single page, giving users a complete visual overview of their application.

#### Step 5: Relative Import Resolution

For imports between project files (e.g., `import { Header } from './components/Header'`), LiveCodeRunner:

1. Strips the import statement
2. Looks up the referenced file in the component map
3. Inlines the component code in the correct order (shared components first, then pages, then App)

The component ordering ensures that dependencies are defined before they are used:
```
1. Shared/utility components (non-page files)
2. Page components (files containing "Page", "Home", "Dashboard", etc.)
3. App component (entry point, rendered last)
```

#### Step 6: Built-in Declaration Stripping

When user code re-declares a component that LiveCodeRunner already mocks (e.g., the user defines their own `Button` function), LiveCodeRunner renames the user's declaration to `__stripped_Button` to avoid conflicts. After all components are loaded, it optionally restores user overrides:

```javascript
try {
  if (typeof __stripped_Button !== 'undefined') {
    Button = __stripped_Button;
  }
} catch(e) {}
```

### 1.5.4 Embedded CSS System

LiveCodeRunner compiles approximately **500 Tailwind CSS utility classes** directly into the preview HTML as a `<style>` block. This eliminates the need for PostCSS, Tailwind CLI, or any build tooling.

#### Covered Utility Categories

| Category | Example Classes | Count |
|----------|----------------|-------|
| **Flexbox** | `flex`, `flex-col`, `flex-row`, `items-center`, `justify-between`, `flex-wrap`, `flex-1`, `flex-grow`, `flex-shrink-0` | ~25 |
| **Grid** | `grid`, `grid-cols-1` through `grid-cols-3`, `col-span-*` | ~10 |
| **Spacing (padding)** | `p-2`, `p-4`, `p-6`, `p-8`, `px-2`, `px-4`, `py-2`, `py-4`, `pt-*`, `pb-*` | ~30 |
| **Spacing (margin)** | `m-2`, `m-4`, `mb-2`, `mb-4`, `mb-6`, `mt-2`, `mt-4`, `ml-*`, `mr-*`, `mx-auto` | ~25 |
| **Spacing (gap)** | `gap-1`, `gap-2`, `gap-4`, `gap-6` | ~8 |
| **Typography (size)** | `text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl`, `text-3xl`, `text-4xl` | ~10 |
| **Typography (weight)** | `font-medium`, `font-semibold`, `font-bold` | ~5 |
| **Typography (alignment)** | `text-center`, `text-left`, `text-right` | ~3 |
| **Text colors** | `text-white`, `text-gray-500` through `text-gray-900`, `text-indigo-600`, `text-blue-600` | ~15 |
| **Background colors** | `bg-white`, `bg-gray-50` through `bg-gray-200`, `bg-indigo-500/600`, `bg-blue-500/600`, `bg-gray-800/900/950` | ~20 |
| **Border radius** | `rounded`, `rounded-md`, `rounded-lg`, `rounded-xl`, `rounded-2xl`, `rounded-full` | ~6 |
| **Border** | `border`, `border-gray-200`, `border-gray-300`, `border-gray-700` | ~8 |
| **Shadows** | `shadow`, `shadow-md`, `shadow-lg`, `shadow-xl` | ~4 |
| **Layout** | `w-full`, `h-full`, `min-h-screen`, `max-w-*`, `overflow-hidden`, `overflow-auto` | ~15 |
| **Position** | `relative`, `absolute`, `fixed`, `sticky`, `top-0`, `right-0`, `bottom-0`, `left-0` | ~10 |
| **Z-index** | `z-10`, `z-50` | ~2 |
| **Display** | `hidden`, `block`, `inline-block`, `inline-flex` | ~4 |
| **Opacity** | `opacity-50`, `opacity-80` | ~3 |
| **Cursor** | `cursor-pointer` | ~1 |
| **Transition** | `transition`, `duration-*`, `ease-*` | ~5 |
| **Hover states** | `hover:bg-gray-100`, `hover:bg-indigo-700` | ~10 |
| **Space between** | `space-y-2`, `space-y-4`, `space-y-6`, `space-x-2`, `space-x-4` | ~8 |
| **Dark theme** | Dark background (`bg-gray-950`), light text (`text-gray-100`) applied by default | ~15 |

#### Dark Theme Default

The preview renders with a dark theme by default:
```css
body {
  background-color: #030712;   /* bg-gray-950 */
  color: #f3f4f6;              /* text-gray-100 */
}
```

#### Component-Level Styles

Beyond utility classes, LiveCodeRunner injects styles for its mocked components:
- **Buttons** — Styled with padding, border-radius, background colors, hover states
- **Cards** — Border, border-radius, padding, subtle background
- **Badges** — Inline-flex, small padding, rounded-full, muted background
- **Inputs** — Full width, border, padding, focus ring
- **Modals/Dialogs** — Fixed position overlay, centered content, backdrop

#### User CSS Inlining

Any `.css` files in the project are concatenated and injected into the same `<style>` block after the Tailwind utilities, so user-written CSS can override defaults.

### 1.5.5 Babel Transpilation

LiveCodeRunner uses `@babel/standalone` to transpile JSX into JavaScript at runtime, entirely in the browser.

#### CDN Loading with Fallback Chain

Scripts are loaded with a multi-source fallback strategy:

```javascript
var SCRIPT_SOURCES = {
  react: [
    BASE_URL + '/api/preview-scripts/react',           // Local proxy (fastest)
    'https://cdn.jsdelivr.net/npm/react@18/umd/react.production.min.js',
    'https://unpkg.com/react@18/umd/react.production.min.js'
  ],
  'react-dom': [
    BASE_URL + '/api/preview-scripts/react-dom',
    'https://cdn.jsdelivr.net/npm/react-dom@18/umd/react-dom.production.min.js',
    'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js'
  ],
  babel: [
    BASE_URL + '/api/preview-scripts/babel',
    'https://cdn.jsdelivr.net/npm/@babel/standalone@7/babel.min.js',
    'https://unpkg.com/@babel/standalone@7/babel.min.js'
  ]
};
```

Each source is tried in order. If loading fails (network error, timeout), the next source is attempted. The local proxy (`/api/preview-scripts/`) serves as the primary source for reliability, with jsDelivr and unpkg as public CDN fallbacks.

#### In-Browser Transpilation

All user code is placed in `<script type="text/babel">` tags:

```html
<script type="text/babel">
  // Mocked components and icons defined here
  // User's shared components
  // User's page components
  // User's App component
  // ReactDOM.createRoot(document.getElementById('root')).render(<App />);
</script>
```

When Babel standalone loads, it automatically finds all `<script type="text/babel">` tags and transpiles them into standard JavaScript, converting JSX into `React.createElement()` calls.

#### Key Advantage: No Build Step

This approach means:
- No `npm install` required
- No Webpack/Vite/esbuild configuration
- No file system access needed
- Preview appears in under 1 second (after CDN scripts are cached)

### 1.5.6 Blob URL Rendering

The final preview is rendered using a Blob URL technique rather than `srcdoc` to avoid browser security restrictions.

#### Assembly Process

1. **HTML document is constructed** as a single string containing:
   - `<!DOCTYPE html>` declaration
   - `<head>` with meta tags, title, and embedded `<style>` block (~500 CSS utilities + user CSS)
   - `<body>` with `<div id="root">` (React mount point)
   - Script loader (fallback chain for React, ReactDOM, Babel)
   - `<script type="text/babel">` with all mocked components + user code

2. **Blob is created:**
   ```javascript
   const blob = new Blob([previewHtml], { type: 'text/html' });
   ```

3. **Object URL is generated:**
   ```javascript
   const url = URL.createObjectURL(blob);
   ```

4. **URL is set as iframe src:**
   ```html
   <iframe src={blobUrl} sandbox="allow-scripts allow-same-origin" />
   ```

#### Why Blob URL Instead of srcDoc?

Using `srcDoc` on iframes triggers **Cross-Origin-Embedder-Policy (COEP)** restrictions in some browsers. When a parent page sets COEP headers (common on platforms like Replit), `srcDoc` iframes cannot load external scripts (React, Babel from CDN). Blob URLs create a new origin context that bypasses COEP, allowing CDN script loading.

#### Memory Management

Previous Blob URLs are revoked after a 2-second delay to prevent memory leaks:

```javascript
useEffect(() => {
  if (previewHtml) {
    const blob = new Blob([previewHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const oldUrl = blobUrl;
    setBlobUrl(url);
    if (oldUrl) {
      setTimeout(() => URL.revokeObjectURL(oldUrl), 2000);
    }
  }
}, [previewHtml, refreshKey]);
```

The 2-second delay ensures the iframe has finished loading the new URL before the old one is freed.

### 1.5.7 Syntax Auto-Fix Engine

Before any transpilation, LiveCodeRunner runs an auto-fix pass on generated code to correct common syntax errors produced by the AI code generator.

#### Stray Semicolon Fixes

```javascript
code = code.replace(/return\s*\(\s*;+\s*/g, 'return (\n');     // return (;  → return (
code = code.replace(/\[\s*;+\s*/g, '[\n');                      // [;        → [
code = code.replace(/\{\s*;+\s*(?!})/g, '{\n');                 // {;        → {
code = code.replace(/=>\s*;+\s*/g, '=>\n');                     // =>;       → =>
code = code.replace(/;{2,}/g, ';');                             // ;;        → ;
```

#### JSX Tag Case Correction

Generated code sometimes produces lowercase HTML tags that should be component references:
```javascript
code = code.replace(/<button(?=[\s>\/])/g, '<Button');
code = code.replace(/<\/button>/gi, '</Button>');
code = code.replace(/<input(?=[\s>\/])/g, '<Input');
code = code.replace(/<select(?=[\s>\/])/g, '<Select');
code = code.replace(/<textarea(?=[\s>\/])/g, '<Textarea');
```

#### Malformed Tag Cleanup

```javascript
// Fix self-closing + closing tag combos: <Tag ... /></Tag> → <Tag ... />
code = code.replace(/\/>\s*<\/\w+>/g, '/>');
```

### 1.5.8 Error Handling

LiveCodeRunner implements multiple layers of error handling:

#### Runtime Errors

Errors inside the iframe are caught using a `window.onerror` handler injected into the preview HTML. When a runtime error occurs (e.g., undefined variable, null reference), the error message and stack trace are displayed in the preview area instead of a blank screen.

#### Babel Transpilation Errors

If the code has syntax errors that Babel cannot parse, the error is caught at transpilation time. The preview shows:
- The specific syntax error message from Babel
- The line number where the error occurred
- A suggestion to check the generated code

#### CDN Loading Failures

If all three CDN sources fail for any script (React, ReactDOM, or Babel), the preview displays a fallback error message explaining that scripts could not be loaded and suggesting the user check their network connection.

#### Graceful Degradation

The preview status updates throughout the loading process:
- "Loading preview..." (initial)
- "Loading react (1/3)..." (CDN fetch in progress)
- "Loading babel (2/3)..."
- "Transpiling..." (Babel processing)
- Final rendered preview or error message

### LiveCodeRunner Architecture Diagram

```
Pro Generator (15-20 JSX files)
     │
     ▼
Code Validator (auto-fix stray semicolons, tag mismatches)
     │
     ▼
LiveCodeRunner Pipeline
     │
     ├── 1. File Filtering
     │      ├── Exclude backend files (15 regex patterns)
     │      ├── Exclude config files (.config.js, vite.config.js)
     │      ├── Exclude test files (.test.*, .spec.*)
     │      └── Detect project type (HTML-only / React / server-only)
     │
     ├── 2. TypeScript Stripping
     │      ├── Remove type annotations (60+ type suffixes)
     │      ├── Remove interfaces, type aliases, enums
     │      ├── Remove generics (<T>, <Props>)
     │      ├── Remove 'as const', 'satisfies', 'readonly', 'keyof'
     │      └── Remove non-null assertions (!)
     │
     ├── 3. Import Processing
     │      ├── Strip all import/require statements
     │      ├── Mock 205+ UI components (Button, Card, Dialog, etc.)
     │      ├── Mock 60+ Lucide icons (Check, X, Plus, Search, etc.)
     │      ├── Mock React Router v5/v6 (BrowserRouter, Routes, Link, etc.)
     │      └── Inline relative imports from project files
     │
     ├── 4. Syntax Auto-Fix
     │      ├── Fix stray semicolons in returns, arrays, objects
     │      ├── Correct JSX tag case (button → Button)
     │      ├── Fix malformed self-closing tags
     │      └── Clean up double semicolons
     │
     ├── 5. CSS Assembly
     │      ├── Inject ~500 Tailwind utility classes
     │      ├── Apply dark theme defaults
     │      ├── Add component-level styles (buttons, cards, etc.)
     │      └── Inline user CSS files
     │
     ├── 6. HTML Document Construction
     │      ├── DOCTYPE + meta tags + viewport
     │      ├── <style> block with all CSS
     │      ├── <div id="root"> mount point
     │      ├── CDN fallback loader (React, ReactDOM, Babel)
     │      └── <script type="text/babel"> with assembled user code
     │
     ├── 7. Blob URL Creation
     │      ├── new Blob([html], { type: 'text/html' })
     │      ├── URL.createObjectURL(blob)
     │      └── Revoke previous blob URL after 2s
     │
     └── 8. Iframe Rendering
            ├── <iframe src={blobUrl} />
            ├── Sandboxed (allow-scripts, allow-same-origin)
            ├── Runtime error capture
            └── Loading status updates
```

---

### Why Electron Solves These Problems

Electron combines Chromium (browser rendering) with Node.js (native runtime). This gives us:

#### 1. Native File System Access
```javascript
// Before (WebContainer)
await webcontainer.fs.writeFile(path, content);  // 16KB limit

// After (Electron)
fs.writeFileSync(path, content);  // No limit
```

#### 2. Real npm
```javascript
// Before (WebContainer)
await webcontainer.spawn('npm', ['install']);  // Virtual, slow

// After (Electron)
spawn('npm', ['install'], { cwd: projectPath });  // Native, fast
```

#### 3. Persistent Storage
Projects are stored in:
```
~/AutoCoder/projects/
├── my-react-app/
│   ├── package.json
│   ├── src/
│   └── node_modules/  ← Persists between sessions
└── ecommerce-site/
    └── ...
```

#### 4. Full System Resources
- Native memory management
- Multi-threaded operations
- Access to system tools (git, npm, node)

---

## Part 2: How It Works

### Architecture Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                      ELECTRON APPLICATION                         │
│                                                                   │
│  ┌─────────────────────────┐    ┌──────────────────────────────┐ │
│  │      MAIN PROCESS       │    │     RENDERER PROCESS         │ │
│  │     (Node.js runtime)   │    │     (Chromium window)        │ │
│  │                         │    │                              │ │
│  │  ┌───────────────────┐  │    │  ┌────────────────────────┐  │ │
│  │  │  Local Runner     │  │    │  │   React Frontend       │  │ │
│  │  │  Service          │  │    │  │   (existing CodeAI UI) │  │ │
│  │  │                   │  │◄──►│  │                        │  │ │
│  │  │  • File I/O       │  │IPC │  │  • Chat interface      │  │ │
│  │  │  • npm install    │  │    │  │  • Code generation     │  │ │
│  │  │  • Dev server     │  │    │  │  • Preview panel       │  │ │
│  │  │  • Process mgmt   │  │    │  │  • IDE features        │  │ │
│  │  └───────────────────┘  │    │  └────────────────────────┘  │ │
│  │                         │    │                              │ │
│  │  ┌───────────────────┐  │    │  ┌────────────────────────┐  │ │
│  │  │  Project Manager  │  │    │  │   Preview WebView      │  │ │
│  │  │  • Workspace mgmt │  │    │  │   (localhost preview)  │  │ │
│  │  │  • Project state  │  │    │  │                        │  │ │
│  │  └───────────────────┘  │    │  └────────────────────────┘  │ │
│  └─────────────────────────┘    └──────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

### Process Model

Electron uses a multi-process architecture inspired by Chromium:

#### Main Process
- **Role:** The "backend" of the desktop app
- **Runtime:** Node.js with full system access
- **Responsibilities:**
  - Create and manage browser windows
  - Handle file system operations
  - Run npm and dev server processes
  - Manage IPC communication

#### Renderer Process
- **Role:** The "frontend" of the desktop app
- **Runtime:** Chromium (sandboxed)
- **Responsibilities:**
  - Display the React UI
  - Handle user interactions
  - Send commands to main process via IPC

#### Preload Script
- **Role:** Secure bridge between processes
- **Runtime:** Limited Node.js access
- **Responsibilities:**
  - Expose safe APIs to renderer
  - Translate renderer calls to main process IPC

### Communication Flow

```
┌─────────────────┐     contextBridge     ┌─────────────────┐
│   Renderer      │◄────────────────────►│    Preload      │
│   (React App)   │   window.electronAPI  │    Script       │
└─────────────────┘                       └─────────────────┘
                                                   │
                                                   │ ipcRenderer
                                                   ▼
                                          ┌─────────────────┐
                                          │   Main Process  │
                                          │   (Node.js)     │
                                          └─────────────────┘
                                                   │
                                                   │ fs, spawn
                                                   ▼
                                          ┌─────────────────┐
                                          │  Local System   │
                                          │  (Files, npm)   │
                                          └─────────────────┘
```

### IPC Channel Design

| Channel | Direction | Purpose |
|---------|-----------|---------|
| `runner:writeFiles` | Renderer → Main | Write project files to disk |
| `runner:npmInstall` | Renderer → Main | Run npm install |
| `runner:startServer` | Renderer → Main | Start dev server |
| `runner:stopServer` | Renderer → Main | Stop dev server |
| `runner:getStatus` | Renderer → Main | Get server status |
| `runner:log` | Main → Renderer | Stream logs to UI |
| `runner:serverReady` | Main → Renderer | Notify when server is ready |
| `project:list` | Renderer → Main | List all projects |
| `project:delete` | Renderer → Main | Delete a project |
| `project:open` | Renderer → Main | Open project folder |

### Code Execution Flow

When a user generates and runs code:

```
1. User: "Create a React todo app"
     │
     ▼
2. Code Generator produces files:
   - package.json
   - src/App.tsx
   - src/index.tsx
   - etc.
     │
     ▼
3. Renderer calls: window.electronAPI.writeFiles(projectName, files)
     │
     ▼
4. Preload translates to: ipcRenderer.invoke('runner:writeFiles', ...)
     │
     ▼
5. Main Process receives and writes files:
   ~/AutoCoder/projects/react-todo-app/
   ├── package.json
   ├── src/
   │   ├── App.tsx
   │   └── index.tsx
   └── ...
     │
     ▼
6. Renderer calls: window.electronAPI.npmInstall(projectName)
     │
     ▼
7. Main Process runs: spawn('npm', ['install'], { cwd: projectPath })
     │
     ├── Streams stdout/stderr to renderer via 'runner:log'
     │
     ▼
8. After install, renderer calls: window.electronAPI.startServer(projectName)
     │
     ▼
9. Main Process runs: spawn('npm', ['run', 'dev'], { cwd: projectPath })
     │
     ├── Detects "localhost:5200" in output
     ├── Sends 'runner:serverReady' with URL
     │
     ▼
10. Renderer shows preview iframe pointing to localhost:5200
```

### Security Model

Electron apps have significant system access. We implement these security measures:

#### 1. Context Isolation
```javascript
webPreferences: {
  nodeIntegration: false,      // Renderer cannot use Node
  contextIsolation: true,      // Preload runs in isolated context
  preload: path.join(__dirname, 'preload.js')
}
```

#### 2. Limited File System Access
```javascript
// Projects are sandboxed to ~/AutoCoder/projects/
const baseDir = path.join(os.homedir(), 'AutoCoder', 'projects');
```

#### 3. Controlled Process Execution
```javascript
// Only npm and node commands are allowed
// Always run in project directory context
spawn('npm', args, { cwd: projectPath });
```

#### 4. External Link Handling
```javascript
// External links open in system browser, not in app
mainWindow.webContents.setWindowOpenHandler(({ url }) => {
  shell.openExternal(url);
  return { action: 'deny' };
});
```

---

## Part 3: Comparison Summary

| Aspect | WebContainer | LiveCodeRunner (Web) | Electron (Desktop) |
|--------|-------------|---------------------|-------------------|
| File size limit | 16KB | None (Babel-based) | Unlimited |
| npm speed | Slow (virtual) | Not needed (instant) | Fast (native) |
| Dependencies | Limited | Simulated via CDN | Unlimited |
| Persistence | None | Database-backed | Full (disk) |
| Preview speed | Slow (30-60s) | Instant (<1s after cache) | Depends on npm install |
| Full project build | Limited | Preview only | Full build |
| System access | None | None (browser) | Full (sandboxed) |
| Distribution | Web URL | Web URL | .exe/.dmg/.AppImage |
| TypeScript support | Full (via virtual tsc) | Regex stripping (60+ type suffixes) | Full (native tsc/esbuild) |
| Import resolution | Virtual node_modules | 205+ mocked components + 60+ icons | Real node_modules |
| CSS framework support | Full (PostCSS pipeline) | ~500 embedded Tailwind utilities | Full (PostCSS/Tailwind CLI) |
| Error handling | Console + overlay | Runtime + Babel syntax + CDN fallback | Full dev server errors |
| File count limit | ~20-30 (memory bound) | No limit (filtered to frontend only) | Unlimited |
| Memory footprint | 500MB-2GB per tab | ~50-100MB (Blob + iframe) | Native (OS managed) |
| React Router | Full routing | All routes rendered simultaneously | Full routing |
| Hot reload | Virtual HMR | Manual refresh (re-render Blob) | Native Vite HMR |

---

## Conclusion

AutoCoder now uses a dual approach:

1. **Web mode (Replit)** uses the **Pro Generator** + **LiveCodeRunner** for instant browser-based previews via Babel transpilation. This eliminates the 16KB WebContainer limitation entirely for preview purposes.

2. **Desktop mode (Electron)** provides the complete experience with native file system access, real npm, and persistent project storage for full project builds.

Both modes share the same React frontend and code generation engine. The Pro Generator produces 15-20 clean JSX files that work with both LiveCodeRunner (instant preview) and Electron (full build).
