# AutoCoder: Complete Problems and Solutions

## Introduction

This document catalogs every problem encountered during AutoCoder development — both predicted issues and actual bugs discovered and fixed. Each problem includes:
- **Description:** What the problem is
- **Symptoms:** How to recognize it
- **Root Cause:** Why it happens
- **Solution:** How to fix it
- **Prevention:** How to avoid it in the future

---

## Table of Contents

### Part A: Actual Problems Encountered & Solved

12. [Code Generation Problems (Actual)](#12-code-generation-problems-actual)
13. [Code Validator Bugs (Actual)](#13-code-validator-bugs-actual)
14. [LiveCodeRunner Bugs (Actual)](#14-livecoderunner-bugs-actual)
15. [Natural Language Understanding Problems (Actual)](#15-natural-language-understanding-problems-actual)
16. [GitHub Push Problems (Actual)](#16-github-push-problems-actual)
17. [Server & Database Problems (Actual)](#17-server--database-problems-actual)
18. [File Accumulation Problems (Actual)](#18-file-accumulation-problems-actual)
19. [Electron Actual Issues (Actual)](#19-electron-actual-issues)
20. [WebContainer Actual Issues (Actual)](#20-webcontainer-actual-issues)

### Part B: Predicted Problems & Prevention (Electron-Focused)

1. [Development Issues](#1-development-issues)
2. [Build and Packaging Issues](#2-build-and-packaging-issues)
3. [Runtime Issues](#3-runtime-issues)
4. [File System Issues](#4-file-system-issues)
5. [npm Issues](#5-npm-issues)
6. [Dev Server Issues](#6-dev-server-issues)
7. [IPC Communication Issues](#7-ipc-communication-issues)
8. [Cross-Platform Issues](#8-cross-platform-issues)
9. [Performance Issues](#9-performance-issues)
10. [Security Issues](#10-security-issues)
11. [LiveCodeRunner Troubleshooting](#11-livecoderunner-troubleshooting)

---

# Part A: Actual Problems Encountered & Solved

These are real problems that were discovered and fixed during AutoCoder development. Each entry documents the exact bug, what caused it, and the implemented fix.

---

## 12. Code Generation Problems (Actual)

### 12.1 Deep Project Generator Produced 149 TypeScript Files

**Description:** The original `deep-project-generator.ts` produced ~149 TypeScript files per project, overwhelming the preview engine and confusing users.

**Symptoms:**
- Preview engine crashed or timed out trying to render 149 files
- TypeScript files caused Babel transpilation errors in browser preview
- Users couldn't navigate or understand the generated codebase
- Files included unnecessary boilerplate (test files, middleware, validators)

**Root Cause:** The deep project generator was designed for full-stack server-side projects with TypeScript. It generated controllers, middleware, models, routes, services, validators, tests — far more than needed for a browser-preview React app.

**Solution:** Built the **Pro Generator** (`client/src/lib/code-generator/pro-generator.ts`) — a 3,600+ line pure template-based engine that produces 15-20 clean JSX files per project. All three code generation endpoints were unified to use it:
- `/api/ai/understand` (chat handler)
- `/api/ai/deep/generate`
- `/api/ai/deep/generate-refined`

**Prevention:** The Pro Generator is hardcoded to produce JSX (not TypeScript) and limits output to essential files: `package.json`, `vite.config.js`, `tailwind.config.js`, `index.html`, `src/main.jsx`, `src/App.jsx`, page components, and shared UI components.

---

### 12.2 Generated Code Had Inconsistent File Structures

**Description:** Different app types produced wildly different folder structures. Some had deep nesting (`src/modules/auth/components/LoginForm.tsx`), others were flat (`Login.jsx`).

**Symptoms:**
- Import resolution failed in LiveCodeRunner because paths didn't match
- Users couldn't find files in the generated project
- Switching between app types broke previously working imports

**Root Cause:** Each app type generator was independently written with its own conventions. No standardized structure was enforced across generators.

**Solution:** Standardized all generated projects to use the same flat structure:
```
package.json, vite.config.js, tailwind.config.js, postcss.config.js,
index.html, src/main.jsx, src/index.css, src/App.jsx,
src/pages/*.jsx, src/components/*.jsx, src/utils/*.js
```

**Prevention:** All 19+ app type generators now follow the same file naming convention and folder structure.

---

### 12.3 App Type Detection Was Too Rigid

**Description:** The system only matched exact keywords like "ecommerce" or "dashboard". Natural language like "I want to sell things online" didn't match any pattern.

**Symptoms:**
- Prompts without exact keywords defaulted to a generic landing page
- Users had to guess the "right" words to trigger specific app types
- Related words like "sell", "buy", "shop" didn't trigger ecommerce detection

**Root Cause:** Original detection used simple `includes()` string checks instead of pattern matching with synonyms and related terms.

**Solution:** Multi-layered detection system:
- **20 app type regex patterns** with broad keyword sets (ecommerce matches "shop", "store", "product", "cart", "buy", "sell", "marketplace", "retail")
- **12 intent phrase patterns** that infer app type from action verbs ("sell" -> ecommerce, "track" -> dashboard, "book" -> booking, "share" -> social)
- **12 domain profiles** providing industry-specific enrichment when keywords like "gym", "restaurant", "recipe" are detected

**Prevention:** New app types should be added to all three layers: regex patterns, intent phrases, and domain profiles.

---

## 13. Code Validator Bugs (Actual)

### 13.1 Void Element Fixer Corrupted Arrow Functions (`=> />`)

**Description:** The `fixVoidElements` function was converting `=>` inside JSX event handlers into `= />`, breaking all interactive components.

**Symptoms:**
```jsx
// INPUT (correct):
<button onClick={() => handleClick()}>Click</button>

// OUTPUT (BROKEN):
<button onClick={() = /> handleClick()}>Click</button>
```
- Every component with event handlers broke after validation
- Console showed `SyntaxError: Unexpected token />`

**Root Cause:** The void element fixer looked for patterns like `<tag ...>` where `>` wasn't followed by content (indicating an unclosed void element). But inside JSX attributes like `onClick={() => ...}`, the `>` in `=>` was matched as the end of a tag, triggering the self-closing fix.

**Solution:** Implemented a **depth-tracking parser** in `fixVoidElements` (line ~143 in `code-validator.ts`). The parser tracks curly brace depth:
- `{` increments depth
- `}` decrements depth
- Void element fixing only runs at depth 0 (JSX context)
- At depth > 0 (inside JavaScript expressions), all `>` characters are skipped

```
depth 0: <div className="x">    -> check for void elements
depth 1: onClick={() =>          -> SKIP (inside JS expression)
depth 0: <br>                    -> fix to <br />
```

**Prevention:** Any future regex-based JSX transformations must use depth-tracking to avoid modifying code inside `{}` expressions.

---

### 13.2 Void Element Check False Positives with React Router `<Link>`

**Description:** HTML `<link>` is a void element, but React Router's `<Link>` component is not. The validator was incorrectly flagging `<Link to="/home">Home</Link>` as an unclosed void element.

**Symptoms:**
- Valid React Router `<Link>` components were reported as errors
- The fixer added `/>` to `<Link>`, breaking navigation: `<Link to="/home" />` (children removed)

**Root Cause:** The void element check iterated over all void element names including `link`. It didn't distinguish between HTML `<link>` (void, no children) and React Router `<Link>` (regular component with children).

**Solution:** Added `isReactRouterLink()` helper function (line ~567 in `code-validator.ts`) that uses depth-tracking to examine the tag's attributes and context:
- If the tag has a `to=` attribute → it's React Router's `<Link>`, skip it
- If followed by `</Link>` (capital L) → it's React Router's `<Link>`, skip it
- Otherwise → it's HTML `<link>`, apply void element rules

**Prevention:** When adding new void element names to the list, always check if there's a React component with the same name (case-insensitive) that should be excluded.

---

### 13.3 Link Casing Fixer Changed HTML `<link>` to `<Link>`

**Description:** A fixer meant to correct React Router link casing was changing ALL `<link>` tags to `<Link>`, including valid HTML `<link rel="stylesheet">` tags.

**Symptoms:**
- `<link rel="stylesheet" href="styles.css">` became `<Link rel="stylesheet" href="styles.css">`
- Stylesheets stopped loading because `<Link>` is a React component, not an HTML element

**Root Cause:** The `fixLinkCasing` function used a broad regex that matched any `<link` tag and uppercased it.

**Solution:** The fixer now only triggers when the `<link>` tag has a `to=` attribute (React Router-specific prop). HTML `<link>` elements use `href=`, `rel=` — never `to=`:
- `<link to="/home">Home</link>` → Fixed to `<Link to="/home">Home</Link>`
- `<link rel="stylesheet" href="styles.css">` → Left alone

**Prevention:** Tag casing fixers must check for distinguishing attributes before transforming.

---

### 13.4 Default Export Check Flagged Entry Files

**Description:** The validator required every `.jsx` file to have `export default`, but entry files (`main.jsx`, `index.jsx`) don't have default exports — they call `ReactDOM.createRoot()`.

**Symptoms:**
- False error: "Missing default export in main.jsx"
- The auto-fixer added `export default undefined;` to entry files, causing React errors

**Root Cause:** The check didn't exclude special files that serve as application entry points rather than reusable components.

**Solution:** `checkDefaultExport` now skips:
- Entry files: `main.jsx`, `index.jsx`, `main.tsx`, `index.tsx`
- Context files: any file containing `createContext`
- Provider files: any file with `Provider` in the component name
- Hook files: any file exporting custom hooks (`useXxx`)

**Prevention:** The skip list is checked first, before any export analysis runs.

---

### 13.5 Component JSX Return Check Flagged Context Providers

**Description:** The validator checked that React components return JSX. But Context Provider files like `ThemeContext.jsx` export a context object and a Provider wrapper, not a standalone component.

**Symptoms:**
- False error: "Component does not return JSX in ThemeContext.jsx"
- The check didn't understand that `<ThemeContext.Provider value={...}>{children}</ThemeContext.Provider>` is a valid pattern

**Root Cause:** The checker looked for `return (` followed by JSX in function bodies. Provider components often use different patterns like wrapping `children` prop.

**Solution:** `checkComponentReturnsJsx` now skips files that:
- Use `createContext`
- Have `Provider` in component names
- Are utility/helper files with no JSX
- Use arrow functions with implicit return (`=> (` or `=> <`)

**Prevention:** Component detection should distinguish between "component files" and "utility/context files" before applying component-specific rules.

---

### 13.6 Missing Container Closing Tags

**Description:** Generated code sometimes had `<Routes>`, `<Switch>`, or `<BrowserRouter>` without matching closing tags.

**Symptoms:**
- React error: "Expected corresponding JSX closing tag for Routes"
- Preview showed nothing because the entire component tree was invalid

**Root Cause:** The Pro Generator's template concatenation sometimes cut off at the end of a function, leaving container elements unclosed.

**Solution:** `fixMissingClosingTags` counts opening vs closing tags for container elements (`Routes`, `Switch`, `BrowserRouter`, `HashRouter`, `Router`). If opens > closes, missing closing tags are inserted after the last `</Route>`.

**Prevention:** Template generators should always pair opening and closing container tags in the same template string, never split across conditionals.

---

## 14. LiveCodeRunner Bugs (Actual)

### 14.1 TypeScript Annotations Caused Babel Errors

**Description:** Generated files with TypeScript syntax crashed the browser-based Babel transpilation because Babel was configured for JSX only.

**Symptoms:**
```
SyntaxError: Unexpected token ':' (at type annotation)
SyntaxError: Unexpected keyword 'interface'
```

**Root Cause:** The Pro Generator sometimes included TypeScript patterns (`: string`, `interface Props`, `as const`) in generated code. The LiveCodeRunner's Babel setup used the `react` preset, not `typescript`.

**Solution:** Regex-based TypeScript stripping applied before Babel runs:
- Simple annotations: `: string`, `: number`, `: boolean`, `: void`, `: any`
- Interface/type blocks: `interface Foo { ... }`, `type Bar = ...`
- Generics: `<T>`, `<Props>`, nested up to 3 levels (`Record<string, Map<number, Set<T>>>`)
- Cast expressions: `value as string`, `obj as const`
- Keywords: `satisfies`, `readonly`, `keyof`
- Import types: `import type { Foo } from '...'`

**Prevention:** Pro Generator should produce pure JSX without TypeScript. The stripper serves as a safety net.

---

### 14.2 External Packages Crashed Browser Preview

**Description:** Generated code imported npm packages (`lucide-react`, `recharts`, `react-router-dom`, `@radix-ui/*`) that don't exist in the browser environment.

**Symptoms:**
```
ReferenceError: Button is not defined
ReferenceError: useNavigate is not defined
```
- Preview showed blank screen or partial render

**Root Cause:** The browser has no `node_modules`. All `import` statements for external packages resolved to nothing.

**Solution:** Comprehensive import mocking system:
- **205+ mocked UI components** — `Button`, `Card`, `Dialog`, `Input`, `Table`, `Avatar`, `Badge`, `Select`, etc. rendered as `div`/`span` wrappers
- **60+ mocked Lucide icons** — `Search`, `Menu`, `Settings`, `User`, etc. as inline SVG
- **React Router v5/v6** — `BrowserRouter`, `Routes`, `Route`, `Link`, `useNavigate`, `useParams` with functional implementations
- **Recharts** — `BarChart`, `LineChart`, `PieChart`, `XAxis`, `YAxis` as basic wrappers

**Prevention:** When the Pro Generator adds a new package import, a corresponding mock should be added to LiveCodeRunner.

---

### 14.3 COEP Headers Blocked iframe Preview

**Description:** Preview HTML couldn't load in an iframe due to Cross-Origin-Embedder-Policy headers (required for WebContainer).

**Symptoms:**
- iframe showed blank or "blocked by COEP" error
- `srcdoc` attribute didn't work because of cross-origin isolation

**Root Cause:** The server sets `Cross-Origin-Embedder-Policy: require-corp` and `Cross-Origin-Opener-Policy: same-origin` for WebContainer support. These headers block cross-origin iframe content.

**Solution:** Blob URL approach:
1. Convert preview HTML to a `Blob` with `text/html` MIME type
2. Create URL via `URL.createObjectURL(blob)`
3. Set as iframe `src` (Blob URLs are same-origin by definition)
4. Revoke URL on unmount via `URL.revokeObjectURL()`

**Prevention:** All preview content must use Blob URLs, never `srcdoc` or external URLs.

---

### 14.4 Stray Semicolons Broke JSX Rendering

**Description:** The code generator produced semicolons in invalid positions, causing parse errors.

**Symptoms:**
```jsx
return (;           // SyntaxError after opening paren
  <div>;            // SyntaxError before JSX
    {items};        // SyntaxError inside expression
```

**Root Cause:** Template string concatenation in the Pro Generator sometimes left trailing semicolons from JavaScript statement endings that ended up inside JSX blocks.

**Solution:** LiveCodeRunner applies 7+ semicolon cleanup patterns:
- `return (;` → `return (`
- `return ;(` → `return (`
- `(;\n<` → `(\n<`
- `;\n<Component` → `\n<Component`
- `[;\n` → `[\n`
- `{;\n` → `{\n`
- `=> ;{` → `=> {`

**Prevention:** Pro Generator templates should end JavaScript blocks with semicolons only in statement positions, never before JSX.

---

### 14.5 No Tailwind CSS in Browser Preview

**Description:** Tailwind classes had no visual effect because there's no PostCSS/Tailwind build step in the browser.

**Symptoms:** All elements appeared unstyled despite correct Tailwind class names.

**Root Cause:** Tailwind CSS requires a build step to convert utility classes into actual CSS. The browser preview has no build pipeline.

**Solution:** Embedded ~500 Tailwind utility classes as a `<style>` tag in the preview HTML, covering:
- Layout, spacing, sizing, typography
- Color palettes for all common colors and shades
- Borders, shadows, transitions
- Responsive prefixes (`sm:`, `md:`, `lg:`, `xl:`)

**Prevention:** When Pro Generator uses a new Tailwind class, check if it's in the embedded subset. If not, add it.

---

### 14.6 Runtime Errors Were Silent

**Description:** When generated code had runtime errors, the preview showed a blank white screen with no error message.

**Symptoms:** Blank iframe, no console output, user had no idea what went wrong.

**Root Cause:** Errors in the iframe were not communicated back to the parent window.

**Solution:** Injected error-catching scripts into preview HTML:
- `window.onerror` catches synchronous errors
- `unhandledrejection` listener catches async errors
- Errors posted to parent via `window.parent.postMessage()`
- Parent component displays errors in a visible panel
- Auto-fix engine attempts common fixes automatically

**Prevention:** All preview HTML templates must include the error-catching script block.

---

### 14.7 Backend Files Crashed Browser Preview

**Description:** Full-stack projects included server files (`server.js`, `routes/api.js`) that used Node.js APIs (`require('express')`, `fs.readFileSync()`), crashing the browser.

**Symptoms:**
```
ReferenceError: require is not defined
ReferenceError: process is not defined
```

**Root Cause:** The file list passed to LiveCodeRunner included all project files, not just frontend files.

**Solution:** 15 backend path patterns filter non-renderable files before rendering:
```
/server/i, /controllers?/i, /middleware/i, /models?/i, /routes?/i,
/services?/i, /validators?/i, /e2e/i, /tests?/i, /spec/i,
/__tests__/i, /prisma/i, /db/i, /migrations?/i, /scripts?/i
```
Also excludes `.config.js`, `.config.ts`, `.test.`, `.spec.` files.

**Prevention:** Any new file category that's server-only should be added to the filter list.

---

## 15. Natural Language Understanding Problems (Actual)

### 15.1 Users Couldn't Use Conversational Language

**Description:** Prompts like "i wanna track my gym workouts" or "help me make something for my bakery" produced generic or incorrect results.

**Symptoms:**
- "build me a website for my restaurant" → generic landing page instead of restaurant app
- "can you help me track expenses" → no app type detected
- "something for managing my employees" → defaulted to todo app

**Root Cause:** The system only matched rigid patterns like "build a fitness dashboard". Conversational filler ("i wanna", "help me", "can you", "something for") wasn't stripped, and vague language ("track", "manage", "something for") wasn't expanded into actionable terms.

**Solution:** 6-stage prompt analysis pipeline:
1. **Typo Correction** (205+ entries) — Fix misspellings first
2. **Conversational Stripping** (5 patterns) — Remove "hey", "can you", "I want to", "help me make", "build me a"
3. **Synonym Expansion** (17+ mappings) — "keep track of" → "track manage dashboard", "something for" → "app to"
4. **Domain Detection** (12 profiles) — Match industry keywords
5. **Intent Inference** (12 patterns) — "track" → dashboard, "sell" → ecommerce
6. **Pattern Matching** (20 categories) — Final classification

**Prevention:** Test new prompts with conversational language before deploying.

---

### 15.2 Misspellings Broke Domain Detection

**Description:** Common misspellings prevented domain keyword matching: "resturant", "recipies", "exersise", "buisness", "budgit", "expences", "hosptial", "employes".

**Symptoms:**
- "build a resturant website" → no domain detected (should be restaurant)
- "recipie sharing app" → generic social app (should be recipe)
- "fittness tracker" → generic dashboard (should be fitness)

**Root Cause:** Domain detection used exact word matching. A single typo made the keyword invisible to the matcher.

**Solution:** Dictionary-based typo correction with 205+ entries across all 12 domains, applied as the first step before any matching:

| Domain | Example Corrections |
|--------|-------------------|
| Restaurant | resturant, restaraunt, restraunt, resteraunt, restuarant |
| Recipe | recipie, recipies, recipee, reciepe, recepie |
| Fitness | exersise, exersize, excercise, exercize, fittness, fitnes |
| Finance | buisness, busines, budgit, expences, expensies |
| Healthcare | hosptial, hospitl, heathcare, paitent, appointmnt |
| HR | employes, employess, emloyee, schedul, schedual |
| Education | educaton, lerning, assignmnt, curiculm |
| Travel | travell, destinaton, iternary, vacaton |
| Pet Care | vetinary, veternary, vetrinarian, vacination |
| Inventory | inventry, inventroy, warehous, shiping |
| Music | playist, playlst, favorit, favourit |
| E-commerce | ecomerce, ecommerc, shoping, paymnt, chekout, websit |

**Prevention:** When adding new domain keywords, also add common misspellings of those keywords to the typo correction dictionary.

---

### 15.3 Domain Detection Had False Matches

**Description:** Domain patterns matched incorrectly — "healthcare" matched petcare, "recipe" matched restaurant.

**Symptoms:**
- "healthcare appointment system" → detected as petcare (because "care" appeared)
- "recipe sharing app" → detected as restaurant (because food-related words overlapped)
- "workout tracker" → not detected as fitness (singular "workout" wasn't in keyword list)

**Root Cause:**
1. Domain patterns were checked in alphabetical order. More general domains (healthcare) matched before more specific ones (petcare)
2. Overlapping keywords caused cross-domain matches
3. Only singular forms were matched, missing plurals

**Solution:**
- **Reordered by specificity**: petcare checked before healthcare, recipe before restaurant
- **Word boundary anchors**: `\b` prevents partial matches ("care" inside "healthcare" won't match petcare's "pet care" pattern)
- **Plural handling**: Keywords match both forms: `recipe|recipes`, `workout|workouts`, `employee|employees`

**Prevention:** When adding new domains, place them in specificity order (most specific first) and test against overlapping keywords from other domains.

---

### 15.4 Generic Prompts Produced Generic Results

**Description:** "i wanna track my gym workouts" was detected as "dashboard" type but produced a generic dashboard with no fitness-specific content — no workout models, no exercise tracking, no progress charts.

**Symptoms:**
- Correct app type detected but generic data models (Item, User)
- Default app name "MyApp" instead of domain-specific name
- No domain-relevant pages or features
- Default "modern" styling for all apps

**Root Cause:** App type detection and domain enrichment were separate, disconnected systems. Detecting "dashboard" didn't trigger any fitness-specific customization.

**Solution:** **Domain enrichment overrides generic results.** Each of the 12 domain profiles provides:

| Override | Example (Fitness) |
|----------|------------------|
| App name | "FitTracker" instead of "MyApp" |
| Data models | `Workout { name, type, duration, calories, date }`, `Exercise { name, sets, reps, weight }` |
| Pages | Dashboard, Workouts, Exercises, Progress, Settings |
| Features | charts, calendar, filtering, responsive |
| UI style | Bold (energetic) instead of Modern (default) |

Domain enrichment takes priority over generic pattern-matched results.

**Prevention:** Every new domain profile must include all five overrides: appName, dataModels, pages, features, uiStyle.

---

## 16. GitHub Push Problems (Actual)

### 16.1 Rate Limits During 400+ File Push

**Description:** Pushing the full codebase (400+ files) to GitHub hit API rate limits, causing `403` and `429` errors mid-push.

**Symptoms:**
```
HttpError: API rate limit exceeded for user
HttpError: You have exceeded a secondary rate limit
```
- Push would succeed for first 100-200 files, then start failing
- Some files missing from repository after push

**Root Cause:** Each file requires a `createBlob` API call. 400+ concurrent calls exceeded GitHub's secondary rate limits (much lower than the 5,000/hour primary limit).

**Solution:** Parallel batch uploads with retry logic in `scripts/github-push.ts`:
- **Batch size: 5** concurrent uploads per batch
- **5 retries** per file with linear backoff
- **Retry on**: `403` (rate limit), `429` (too many requests), `502` (bad gateway), `503` (service unavailable)
- **Backoff**: `attempt * 3000ms` (3s, 6s, 9s, 12s, 15s)
- Failed files after all retries logged as warnings, don't block push
- **500ms delay** between batches

**Prevention:** Batch size kept at 5 (not higher) to stay under secondary rate limits.

---

### 16.2 Stale Files Accumulated in Repository

**Description:** Deleted or renamed local files persisted in the GitHub repository after pushing.

**Symptoms:**
- Old files from previous versions still visible on GitHub
- Renamed files appeared twice (old name + new name)
- Repository file count grew with every push

**Root Cause:** The `createTree` call included a `base_tree` parameter, which meant the new tree was merged on top of the existing tree. Files not in the new push were inherited from the old tree.

**Solution:** Removed the `base_tree` parameter from `createTree` (full tree replacement). The new tree contains ONLY the files being pushed. Files not in the workspace are automatically removed from the repository.

**Prevention:** Never use `base_tree` for full-workspace pushes. Only use it for partial/incremental updates.

---

### 16.3 OAuth Token Expired During Long Push

**Description:** The Replit GitHub connector OAuth token expired during a long push operation (uploading 400+ files could take several minutes).

**Symptoms:**
```
HttpError: Bad credentials (401)
```
- Push started successfully but failed partway through
- Re-running immediately worked (fresh token)

**Root Cause:** The token was fetched once at the start and cached. Long operations could exceed the token's lifetime.

**Solution:** `getAccessToken()` checks `expires_at` before every API call. If expired, it re-fetches from the Replit connector API. Token is never cached long-term.

**Prevention:** Always call `getAccessToken()` before each batch, not just once at the start.

---

### 16.4 Binary Files Corrupted During Upload

**Description:** Images, fonts, and other binary files in the repository were corrupted after push.

**Symptoms:**
- Images showed as broken/garbled on GitHub
- Font files were invalid
- Binary file sizes changed after push

**Root Cause:** All files were being read and uploaded with UTF-8 encoding. Binary content corrupted during UTF-8 encoding/decoding.

**Solution:** File type detection with appropriate encoding:
- Text files (`.ts`, `.js`, `.json`, `.md`, `.css`, `.html`): `utf-8` encoding
- Binary files (`.png`, `.jpg`, `.woff`, `.ttf`, etc.): `base64` encoding
- Git blob API `encoding` parameter set accordingly

**Prevention:** Always check file type before reading. Default to `base64` for unknown extensions.

---

## 17. Server & Database Problems (Actual)

### 17.1 Windows ENOTSUP on Server Start

**Description:** Server crashed on Windows with `ENOTSUP` error when trying to start.

**Symptoms:**
```
Error: listen ENOTSUP: operation not supported 0.0.0.0:5000
```

**Root Cause:** The server used `reusePort: true` in listen options. `SO_REUSEPORT` is a Linux/macOS feature — Windows doesn't support it.

**Solution:** Platform check before setting `reusePort` (line ~101-106 in `server/index.ts`):
```javascript
const isWindows = process.platform === 'win32';
httpServer.listen({
  port,
  host: '0.0.0.0',
  ...(isWindows ? {} : { reusePort: true }),
});
```

**Prevention:** Always check `process.platform` before using platform-specific socket options.

---

### 17.2 413 Request Entity Too Large

**Description:** Saving generated projects with 15-20 files of code returned a 413 error.

**Symptoms:**
```
PayloadTooLargeError: request entity too large
```

**Root Cause:** Express's default JSON body limit is 100KB. A full generated project (15-20 JSX files) easily exceeds this.

**Solution:** Set 50MB JSON limit:
```javascript
app.use(express.json({ limit: '50mb' }));
```

**Prevention:** Always set an appropriate body size limit for applications that handle code/file content.

---

### 17.3 npm Scripts Failed on Windows

**Description:** npm scripts like `NODE_ENV=development tsx server/index.ts` failed on Windows Command Prompt.

**Symptoms:**
```
'NODE_ENV' is not recognized as an internal or external command
```

**Root Cause:** Unix-style inline environment variables (`VAR=value command`) don't work on Windows cmd.

**Solution:** All npm scripts use `cross-env`:
```json
"dev": "cross-env NODE_ENV=development tsx server/index.ts"
```

**Prevention:** Never use bare `VAR=value` in npm scripts. Always wrap with `cross-env`.

---

## 18. File Accumulation Problems (Actual)

### 18.1 Old Generated Files Piled Up Across Regenerations

**Description:** When users asked to regenerate a project, new files were saved alongside old files, creating a confusing mix.

**Symptoms:**
- Conversation had 30-40+ files (mix of old restaurant app + new dashboard)
- Preview showed components from different app types simultaneously
- File list had duplicates with slightly different names

**Root Cause:** The chat handler saved new files without deleting the old ones. Each regeneration added 15-20 more files to the existing set.

**Solution:** Chat handler clears old files before saving new ones (line ~717 in `server/routes.ts`):
```javascript
await storage.deleteProjectFilesByConversation(conversationId);
```
Added:
- `deleteProjectFilesByConversation(conversationId)` method to `IStorage` interface and both implementations
- `DELETE /api/conversations/:id/files` bulk endpoint
- Both `/api/ai/deep/generate` and `/api/ai/deep/generate-refined` also clear before saving

**Prevention:** Every code generation endpoint must call `deleteProjectFilesByConversation` before saving new files.

---

## 19. Electron Actual Issues

### 19.1 Port 5000 Conflict on Local Development

**Description:** Port 5000 was occupied on local machines — macOS AirPlay Receiver uses port 5000 since Monterey, and Replit's proxy also binds to it.

**Symptoms:**
```
Error: listen EADDRINUSE: address already in use :::5000
```
- Electron couldn't connect to dev server
- Users had to manually figure out which port to use

**Root Cause:** Port 5000 is increasingly used by system services and other tools.

**Solution:** Electron defaults to port `5100`:
- `electron/main.ts` line ~41: `const devPort = process.env.DEV_PORT || '5100'`
- Server reads `PORT` env var, defaults to 5000 on Replit
- Users can override: `DEV_PORT=3000 npm run electron:dev`
- Error page shows which port was tried and how to change it

**Prevention:** Choose non-common ports for desktop dev defaults. Document port configuration clearly.

---

### 19.2 ESM vs CJS Conflict

**Description:** Electron needed main process as ESM but preload as CommonJS — single build config couldn't produce both.

**Symptoms:**
```
ReferenceError: exports is not defined in ES module scope
```

**Root Cause:** `package.json` has `"type": "module"`, making all `.js` files ESM by default. But Electron's preload sandbox requires CommonJS format.

**Solution:** Dual esbuild configuration in `scripts/build-electron.ts`:
- **main.ts** → `dist-electron/main.js` (ESM with `createRequire` banner)
- **preload.ts** → `dist-electron/preload.js` (CJS format)

The `createRequire` banner:
```javascript
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
```

**Prevention:** Always build preload as CJS regardless of project-level module type.

---

### 19.3 Race Condition: Electron Started Before Server

**Description:** `npm run electron:dev` launched Electron before the web server was ready, showing a blank window.

**Symptoms:** White/blank Electron window on startup.

**Root Cause:** Electron launched immediately after build, but the web server needed 2-5 seconds to initialize.

**Solution:** Polling connection check in `electron/main.ts`:
1. Try connecting to `http://localhost:5100`
2. Retry every 2 seconds, up to 15 attempts (30 seconds)
3. On success, load URL in BrowserWindow
4. On failure, show error page with instructions

**Prevention:** Desktop apps connecting to dev servers must implement connection polling, not assume the server is ready.

---

## 20. WebContainer Actual Issues

### 20.1 16KB File Write Limit

**Description:** WebContainer silently failed to write `package.json` files larger than ~16KB.

**Symptoms:**
- `npm install` ran but installed nothing (empty/truncated package.json)
- No error reported — silent failure
- Projects with many dependencies failed to build

**Root Cause:** WebContainer has an undocumented ~16KB limit on individual file write operations.

**Solution:** Batched install strategy in `auto-runner.ts` (line ~449):
1. Detect if `package.json` content exceeds 15KB (with buffer)
2. Write minimal `package.json` with only name, version, scripts
3. Store full dependency list separately
4. Install dependencies in batches via `npm install pkg1 pkg2 pkg3`

**Prevention:** Always check content size before writing to WebContainer. Use batched operations for large content.

---

### 20.2 SharedArrayBuffer Not Available

**Description:** WebContainer requires `SharedArrayBuffer`, which isn't available in all browsers.

**Symptoms:**
```
WebContainer is not supported in this browser
```
- Safari users couldn't use WebContainer
- Browsers without proper COOP/COEP headers couldn't use it

**Root Cause:** `SharedArrayBuffer` is gated behind cross-origin isolation headers for security (Spectre mitigation).

**Solution:** `isWebContainerSupported()` checks for `SharedArrayBuffer`. Falls back to LiveCodeRunner's Babel-based preview when unavailable.

**Prevention:** Always provide a non-WebContainer fallback path. Never assume WebContainer availability.

---

### 20.3 npm Install Failures

**Description:** `npm install` inside WebContainer failed for various reasons — network, package resolution, post-install scripts.

**Symptoms:**
- "Installing..." message stuck indefinitely
- Error: "Could not resolve dependency"
- Post-install scripts trying to run native binaries failed

**Root Cause:** WebContainer's virtual npm environment can't handle all packages, especially those with:
- Native binary dependencies (node-gyp)
- Complex post-install scripts
- Very large dependency trees

**Solution:** Multi-level fallback:
1. Standard `npm install`
2. `npm install --ignore-scripts` (skip post-install)
3. Batched install (smaller groups)
4. Fall back to LiveCodeRunner mock-based preview (no npm needed)

**Prevention:** Pro Generator produces code compatible with LiveCodeRunner mocks as the primary preview path. WebContainer is secondary.

---

## Summary: All Problems Solved

| Category | Predicted | Actual | Total |
|----------|-----------|--------|-------|
| Code Generation | 0 | 3 | 3 |
| Code Validator | 0 | 6 | 6 |
| LiveCodeRunner / Preview | 7 | 7 | 14 |
| NLU / Prompt Understanding | 0 | 4 | 4 |
| GitHub Push | 0 | 4 | 4 |
| Server & Database | 0 | 3 | 3 |
| File Accumulation | 0 | 1 | 1 |
| Electron (Development) | 3 | 3 | 6 |
| Electron (Build/Packaging) | 3 | 0 | 3 |
| Electron (Runtime) | 2 | 0 | 2 |
| Electron (File System) | 3 | 0 | 3 |
| Electron (npm) | 3 | 0 | 3 |
| Electron (Dev Server) | 3 | 0 | 3 |
| Electron (IPC) | 2 | 0 | 2 |
| Electron (Cross-Platform) | 2 | 0 | 2 |
| Electron (Performance) | 2 | 0 | 2 |
| Electron (Security) | 3 | 0 | 3 |
| WebContainer | 0 | 3 | 3 |
| **Total** | **33** | **34** | **67** |

---

# Part B: Predicted Problems & Prevention (Electron-Focused)

The following sections contain predicted problems and prevention strategies for Electron development, build, and deployment.

---

## 1. Development Issues

### 1.1 Electron Build Errors

**Description:** Electron build fails when running `npm run build:electron`.

**Note:** AutoCoder uses **esbuild** (not tsc) to compile Electron files. The build script is `scripts/build-electron.ts`.

**Common Symptoms:**
```
Error: Cannot find module 'electron'
esbuild: Build failed with errors
dist-electron/ directory is empty or missing
```

**Root Cause:** 
1. Electron package not installed
2. Node modules corrupted
3. Incorrect Node.js version (v24+ may have issues)

**Solution - Step by Step:**

```bash
# Step 1: Check Node.js version (use LTS, NOT v24+)
node --version
# If v24+, consider downgrading to v20.x LTS

# Step 2: Clean install all dependencies
rm -rf node_modules
npm cache clean --force
npm install

# Step 3: Verify Electron is installed
npm list electron
# Should show: electron@40.x.x

# Step 4: Build Electron with esbuild
npm run build:electron
```

**If Electron is not installed:**
```bash
# Install Electron explicitly
npm install electron electron-builder --save-dev

# Verify installation
npm list electron
# Should output: electron@40.x.x

# Now rebuild
npm run build:electron
```

**Node.js v24+ Users - IMPORTANT:**
Node.js v24 is not an LTS version and may have compatibility issues. **Downgrade to LTS:**
```bash
# Using nvm (recommended)
nvm install 20
nvm use 20
node --version  # Should show v20.x.x

# Clean reinstall
rm -rf node_modules
npm cache clean --force
npm install
npm run build:electron
```

**Windows PowerShell Users:**
If npm install fails with permission errors:
```powershell
# Run PowerShell as Administrator, then:
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
npm install electron electron-builder --save-dev
```

**If TS7006/TS7031 "implicit any" errors persist:**
The code needs explicit type annotations. The latest code in the repository has these fixed. Pull the latest:
```bash
git pull origin main
npm run build:electron
```

**Prevention:** 
- Use Node.js LTS versions (18.x or 20.x)
- Always run `npm install` before building
- Run `npm run build:electron` after modifying Electron files

---

### 1.2 ES Module Error: "exports is not defined"

**Description:** Electron throws error on startup about ES modules.

**Symptoms:**
```
ReferenceError: exports is not defined in ES module scope
This file is being treated as an ES module because it has a '.js' file extension 
and package.json contains "type": "module".
```

**Root Cause:** 
The project uses `"type": "module"` in package.json, but Electron TypeScript was configured to output CommonJS format which uses `exports`.

**Solution:**
This has been fixed in the latest code. Pull the latest version:
```bash
git pull origin main
npm run build:electron
npx electron dist-electron/main.js
```

**Manual Fix (if needed):**
Update `electron/tsconfig.json`:
```json
{
  "compilerOptions": {
    "module": "ESNext",           // Changed from "commonjs"
    "moduleResolution": "bundler" // Changed from "node"
  }
}
```

And update imports in `electron/main.ts` to use `.js` extensions:
```typescript
import { LocalRunner } from './services/local-runner.js';
import { ProjectManager } from './services/project-manager.js';
```

Also add `__dirname` replacement for ES modules:
```typescript
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
```

---

### 1.3 Electron Won't Start

**Description:** Running Electron produces no window.

**Symptoms:**
```
./scripts/electron-dev.sh
# No output, no window
```

**Root Cause:** 
- Electron not installed
- dist-electron not built
- Web server not running
- Display not available

**Solution:**
```bash
# Check Electron is installed
npm list electron

# Ensure web server is running first
npm run dev  # In terminal 1

# Build Electron with esbuild
npm run build:electron

# Check dist-electron exists
ls dist-electron/main.js

# Run with debug
DEBUG=* ./scripts/electron-dev.sh
```

**Prevention:** Always start web server before Electron.

---

### 1.3 Hot Reload Not Working

**Description:** Changes to React code don't appear in Electron.

**Symptoms:** UI doesn't update after saving files.

**Root Cause:** Vite HMR websocket connection issues.

**Solution:**
```bash
# Restart Electron
# Close the Electron window
# Run electron-dev.sh again

# Or, reload the window (Ctrl+R / Cmd+R in the Electron window)
```

**Prevention:** Ensure Vite dev server is running on localhost:5000 before starting Electron.

---

## 2. Build and Packaging Issues

### 2.1 electron-builder Fails

**Description:** `./scripts/build-desktop.sh` fails during packaging.

**Symptoms:**
```
Error: Cannot find module 'electron'
# or
Error: Application entry file "dist-electron/main.js" not found
```

**Root Cause:** Build order incorrect or missing files.

**Solution:**
```bash
# Ensure correct build order
npm run build                      # Build React first
npm run build:electron             # Build Electron second (uses esbuild)
npx electron-builder               # Package last

# Check files exist
ls dist/index.html
ls dist-electron/main.js
```

**Prevention:** Use `./scripts/build-desktop.sh` which runs commands in correct order.

---

### 2.2 Missing Icons

**Description:** Built app has generic/blank icons.

**Symptoms:** App icon is default Electron icon.

**Root Cause:** Icon files not in `build-resources/`.

**Solution:**
```bash
# Create icons directory
mkdir -p build-resources

# Add platform-specific icons:
# - icon.icns (macOS)
# - icon.ico (Windows)
# - icon.png (Linux, 512x512)
```

**Prevention:** Prepare icons before building.

---

### 2.3 Large Bundle Size

**Description:** Packaged app is unexpectedly large (500MB+).

**Symptoms:** `release/` folder contains huge files.

**Root Cause:** 
- node_modules included unnecessarily
- dev dependencies bundled
- unoptimized assets

**Solution:**
```json
// electron-builder.json - add files exclusions
{
  "files": [
    "dist/**/*",
    "dist-electron/**/*",
    "!**/node_modules/*/{CHANGELOG.md,README.md}",
    "!**/*.{ts,map}"
  ]
}
```

**Prevention:** Configure electron-builder to exclude unnecessary files.

---

## 3. Runtime Issues

### 3.1 White Screen on Launch

**Description:** App opens but shows blank white screen.

**Symptoms:** Window appears but content is white/empty.

**Root Cause:**
- React app not built
- Wrong URL loaded in production
- JavaScript errors preventing render

**Solution:**
```javascript
// In electron/main.ts, add error handling:
mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
  console.error('Failed to load:', errorDescription);
});

// Open DevTools to see errors
mainWindow.webContents.openDevTools();
```

**Prevention:** Add console logging and error handlers to main.ts.

---

### 3.2 Context Bridge Undefined

**Description:** `window.electronAPI` is undefined in renderer.

**Symptoms:**
```
TypeError: Cannot read properties of undefined (reading 'writeFiles')
```

**Root Cause:**
- Preload script not loaded
- contextBridge not exposing correctly
- Running in browser instead of Electron

**Solution:**
```javascript
// Check if in Electron
if (typeof window !== 'undefined' && 'electronAPI' in window) {
  // Electron code
} else {
  // Fallback for browser
}

// Verify preload path in main.ts
webPreferences: {
  preload: path.join(__dirname, 'preload.js'),  // Must be .js, not .ts
}
```

**Prevention:** Always use `isElectronEnvironment()` check before API calls.

---

## 4. File System Issues

### 4.1 Permission Denied

**Description:** Cannot write files to project directory.

**Symptoms:**
```
Error: EACCES: permission denied, mkdir '/home/user/AutoCoder'
```

**Root Cause:**
- No write permission to home directory
- Path contains special characters
- Antivirus blocking writes

**Solution:**
```bash
# Check permissions
ls -la ~/

# Create directory manually
mkdir -p ~/AutoCoder/projects

# On Windows, check antivirus exclusions
```

**Prevention:** Verify directory exists and is writable on app startup.

---

### 4.2 Files Not Appearing

**Description:** Files written but not visible in project folder.

**Symptoms:** `writeFiles` returns success but files aren't there.

**Root Cause:**
- Wrong project path
- Files written to different location
- File explorer cache

**Solution:**
```javascript
// Log the actual path
console.log('Writing to:', fullPath);

// Verify path construction
const projectPath = path.join(os.homedir(), 'AutoCoder', 'projects', projectName);
console.log('Project path:', projectPath);
```

**Prevention:** Add detailed logging in local-runner.ts.

---

### 4.3 Path Separators on Windows

**Description:** File paths don't work on Windows.

**Symptoms:**
```
Error: ENOENT: no such file or directory 'C:\Users\name\AutoCoder/projects'
```

**Root Cause:** Mixed path separators (/ vs \).

**Solution:**
```javascript
// Always use path.join()
const fullPath = path.join(projectPath, file.path);

// Never concatenate paths manually
// BAD: projectPath + '/' + fileName
// GOOD: path.join(projectPath, fileName)
```

**Prevention:** Use `path.join()` for all path operations.

---

## 5. npm Issues

### 5.1 npm Install Hangs

**Description:** npm install starts but never completes.

**Symptoms:** Log shows "Installing..." but no progress.

**Root Cause:**
- Network issues
- npm registry down
- Package resolution taking too long

**Solution:**
```javascript
// Add timeout in local-runner.ts
const timeout = setTimeout(() => {
  child.kill();
  resolve({ success: false, error: 'npm install timeout' });
}, 300000);  // 5 minute timeout

child.on('close', () => {
  clearTimeout(timeout);
  // ...
});
```

**Prevention:** Add timeout handling for npm operations.

---

### 5.2 npm Not Found

**Description:** npm command fails.

**Symptoms:**
```
Error: spawn npm ENOENT
```

**Root Cause:** npm not in PATH or not installed.

**Solution:**
```javascript
// Use full path on Windows
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';

// Or find npm path
const npmPath = process.platform === 'win32'
  ? path.join(process.env.APPDATA, 'npm', 'npm.cmd')
  : 'npm';
```

**Prevention:** Handle platform differences in command execution.

---

### 5.3 Package Install Failures

**Description:** Specific packages fail to install.

**Symptoms:**
```
npm ERR! code ERESOLVE
npm ERR! Could not resolve dependency
```

**Root Cause:** Conflicting peer dependencies or version issues.

**Solution:**
```javascript
// Try with legacy peer deps
spawn('npm', ['install', '--legacy-peer-deps'], { cwd: projectPath });

// Or force install
spawn('npm', ['install', '--force'], { cwd: projectPath });
```

**Prevention:** Generate compatible package.json files.

---

## 6. Dev Server Issues

### 6.1 Server URL Not Detected

**Description:** Dev server starts but URL isn't captured.

**Symptoms:** Preview panel shows "Waiting for server..." indefinitely.

**Root Cause:** URL pattern doesn't match server output.

**Solution:**
```javascript
// Expand URL detection patterns in local-runner.ts
const urlPatterns = [
  /localhost:(\d+)/,
  /http:\/\/127\.0\.0\.1:(\d+)/,
  /http:\/\/0\.0\.0\.0:(\d+)/,
  /Local:\s*http:\/\/localhost:(\d+)/,  // Vite format
  /ready on .*:(\d+)/,  // Next.js format
];

for (const pattern of urlPatterns) {
  const match = line.match(pattern);
  if (match) {
    // Found URL
  }
}
```

**Prevention:** Support multiple URL formats from different dev servers.

---

### 6.2 Port Already in Use

**Description:** Dev server fails to start.

**Symptoms:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Root Cause:** Previous process still running on port.

**Solution:**
```javascript
// Kill existing process before starting
async function killPort(port: number): Promise<void> {
  if (process.platform === 'win32') {
    spawn('cmd', ['/c', `netstat -ano | findstr :${port}`, '|', 'for', '/f', '"tokens=5"', '%a', 'in', '(\'more\')', 'do', 'taskkill', '/f', '/pid', '%a']);
  } else {
    spawn('fuser', ['-k', `${port}/tcp`]);
  }
}
```

**Prevention:** Stop previous server before starting new one.

---

### 6.3 Preview Not Loading

**Description:** Dev server running but preview shows error.

**Symptoms:** iframe shows connection refused or blank.

**Root Cause:**
- Server bound to wrong interface
- CORS issues
- SSL certificate issues

**Solution:**
```javascript
// Ensure server binds to all interfaces
env: {
  ...process.env,
  HOST: '0.0.0.0',  // Or 'localhost'
}
```

**Prevention:** Configure generated projects to bind to localhost.

---

## 7. IPC Communication Issues

### 7.1 IPC Response Timeout

**Description:** Renderer hangs waiting for IPC response.

**Symptoms:** UI freezes on operations.

**Root Cause:** Main process handler threw unhandled error or didn't return.

**Solution:**
```javascript
// Add timeout wrapper
async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  const timeout = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('Operation timed out')), ms);
  });
  return Promise.race([promise, timeout]);
}

// Use in renderer
const result = await withTimeout(
  window.electronAPI.npmInstall(projectName),
  300000
);
```

**Prevention:** Always wrap IPC calls with timeout.

---

### 7.2 Event Listener Memory Leak

**Description:** App slows down over time.

**Symptoms:** Memory usage grows, especially with many operations.

**Root Cause:** Event listeners not cleaned up.

**Solution:**
```typescript
// Always return cleanup function
onLog: (callback) => {
  const handler = (event, log) => callback(log);
  ipcRenderer.on('runner:log', handler);
  return () => ipcRenderer.removeListener('runner:log', handler);  // IMPORTANT
}

// Clean up in React
useEffect(() => {
  const unsubscribe = window.electronAPI.onLog(handleLog);
  return () => unsubscribe();  // Cleanup on unmount
}, []);
```

**Prevention:** Always implement cleanup functions for event listeners.

---

## 8. Cross-Platform Issues

### 8.1 Path Case Sensitivity

**Description:** Works on Windows but fails on Mac/Linux.

**Symptoms:** "File not found" on Mac/Linux for files that exist.

**Root Cause:** Windows is case-insensitive, Mac/Linux are case-sensitive.

**Solution:**
```javascript
// Always use consistent case
// BAD: sometimes 'Package.json', sometimes 'package.json'
// GOOD: always 'package.json'
```

**Prevention:** Standardize on lowercase filenames.

---

### 8.2 Line Endings

**Description:** Scripts fail on different platforms.

**Symptoms:**
```
bash: ./scripts/electron-dev.sh: /bin/bash^M: bad interpreter
```

**Root Cause:** Windows CRLF line endings in shell scripts.

**Solution:**
```bash
# Convert to Unix line endings
sed -i 's/\r$//' scripts/*.sh

# Or in git config
git config --global core.autocrlf input
```

**Prevention:** Configure .gitattributes for correct line endings.

---

## 9. Performance Issues

### 9.1 Slow File Writes

**Description:** Writing many files is slow.

**Symptoms:** "Writing files..." takes 10+ seconds.

**Root Cause:** Synchronous file operations blocking event loop.

**Solution:**
```javascript
// Use async operations
const fsPromises = require('fs').promises;

async function writeFiles(projectPath, files) {
  await Promise.all(files.map(async (file) => {
    const fullPath = path.join(projectPath, file.path);
    await fsPromises.mkdir(path.dirname(fullPath), { recursive: true });
    await fsPromises.writeFile(fullPath, file.content);
  }));
}
```

**Prevention:** Use async fs operations for large file sets.

---

### 9.2 High Memory Usage

**Description:** App uses excessive memory.

**Symptoms:** System slowdown, out of memory errors.

**Root Cause:**
- Multiple large node_modules in memory
- Not cleaning up child processes

**Solution:**
```javascript
// Always cleanup child processes
app.on('before-quit', () => {
  runner.cleanup();
});

// Limit concurrent operations
const pLimit = require('p-limit');
const limit = pLimit(3);  // Max 3 concurrent operations
```

**Prevention:** Implement proper cleanup and resource limits.

---

## 10. Security Issues

### 10.1 Arbitrary Code Execution

**Description:** User can execute arbitrary system commands.

**Risk:** Malicious input could run dangerous commands.

**Mitigation:**
```javascript
// Never pass user input directly to shell
// BAD
spawn('sh', ['-c', userInput]);

// GOOD - only allow specific commands
const allowedCommands = ['npm', 'node'];
if (!allowedCommands.includes(command)) {
  throw new Error('Command not allowed');
}
```

---

### 10.2 Path Traversal

**Description:** User could access files outside project directory.

**Risk:** Reading/writing arbitrary system files.

**Mitigation:**
```javascript
// Validate paths are within project directory
function isPathSafe(basePath, targetPath) {
  const resolved = path.resolve(basePath, targetPath);
  return resolved.startsWith(path.resolve(basePath));
}

if (!isPathSafe(projectPath, file.path)) {
  throw new Error('Invalid file path');
}
```

---

### 10.3 Node Integration Exposure

**Description:** Renderer has access to Node.js APIs.

**Risk:** XSS could lead to full system compromise.

**Mitigation:**
```javascript
// Always disable nodeIntegration and enable contextIsolation
webPreferences: {
  nodeIntegration: false,
  contextIsolation: true,
  preload: path.join(__dirname, 'preload.js'),
}
```

---

## Quick Reference: Common Error Codes

| Error | Likely Cause | First Step |
|-------|-------------|------------|
| ENOENT | File/path not found | Check path construction |
| EACCES | Permission denied | Check directory permissions |
| EADDRINUSE | Port in use | Kill existing process |
| ERESOLVE | npm dependency conflict | Try --legacy-peer-deps |
| spawn ENOENT | Command not found | Check PATH and command name |
| IPC timeout | Handler error | Add logging to main process |

---

## 11. LiveCodeRunner Troubleshooting

The `LiveCodeRunner` component (`client/src/components/live-code-runner.tsx`) provides in-browser preview of generated projects by transpiling JSX/TSX with Babel and rendering in a sandboxed iframe. Below are common issues and their solutions.

### 11.1 Blank Preview / No Output

**Description:** The preview iframe is empty or shows nothing.

**Symptoms:** Preview panel renders but displays a blank white area with no content.

**Root Cause 1:** All files were filtered out as backend files.
LiveCodeRunner excludes files whose paths match backend patterns: `server/`, `routes/`, `models/`, `controllers/`, `middleware/`, `services/`, `validators/`, `db/`, `migrations/`, `scripts/`, `prisma/`, `tests/`, `spec/`, `__tests__/`, and `e2e/`.

**Fix:** Check file paths in the generated project. Move frontend component files out of backend-named directories. For example, `server/components/App.tsx` will be filtered out — use `client/src/App.tsx` or `src/App.tsx` instead.

**Root Cause 2:** No `.jsx` or `.tsx` files exist in the project.
LiveCodeRunner only processes files ending in `.tsx`, `.jsx`, or `.js`. If the project contains only `.ts` files or configuration files, there is nothing to render.

**Fix:** Ensure at least one component file with a `.tsx` or `.jsx` extension exists in the project. The file must contain a React component with JSX markup.

---

### 11.2 Babel Transpilation Errors

**Description:** The preview shows a Babel error or fails to render components.

**Symptoms:** Console errors mentioning `SyntaxError` from Babel, or the preview shows an error overlay.

**Root Cause 1:** TypeScript syntax not fully stripped.
LiveCodeRunner uses regex-based stripping to remove TypeScript constructs before Babel processes the code. Complex generic types (e.g., `Record<string, Map<number, Set<T>>>`), `enum` declarations, `namespace` blocks, and `declare` statements may not be fully removed.

**Fix:** Simplify TypeScript usage in generated code:
- Use plain JS/JSX instead of complex TypeScript
- Avoid `enum` declarations (use plain objects or string unions instead)
- Avoid complex nested generic types
- Avoid `declare module`, `declare global`, and `namespace` blocks

**Root Cause 2:** JSX syntax errors such as unclosed tags or mismatched brackets.

**Fix:** Run the Code Validator (`client/src/lib/code-generator/code-validator.ts`) before preview to catch syntax issues. LiveCodeRunner does auto-fix some common issues (stray semicolons, tag case mismatches), but it cannot fix all malformed JSX.

---

### 11.3 Missing Components / Icons

**Description:** Components render as empty or throw "not defined" errors. Icons don't appear.

**Symptoms:** Parts of the UI are missing, or console shows `ReferenceError: ComponentName is not defined`.

**Root Cause 1:** The component is not in the 205+ mocked components list.
LiveCodeRunner provides mock implementations for common UI components (Button, Card, Input, Dialog, Table, Tabs, Form, Avatar, Badge, Select, etc.) and layout components (Router, Route, Link, Sidebar, Header, Footer, etc.). Components not in this list will be undefined.

**Fix:** Use only mocked components or fall back to simple HTML elements. Check the `builtInMocks` set in `live-code-runner.tsx` for the full list of available components.

**Root Cause 2:** The Lucide icon is not in the 60+ mocked icons list.
LiveCodeRunner mocks common Lucide icons (Check, X, Plus, Search, Home, User, Settings, Menu, Edit, Trash, Star, Heart, Bell, Mail, etc.). Icons not in this list will render as empty spans.

**Fix:** Check the `builtInIconsList` array in `live-code-runner.tsx` for available icons. Use an alternative icon from the mocked list, or use a simple HTML/SVG element instead.

---

### 11.4 Styling Issues (Tailwind Classes Not Working)

**Description:** Tailwind CSS classes have no effect on the rendered output.

**Symptoms:** Elements appear unstyled despite having Tailwind class names.

**Root Cause:** LiveCodeRunner embeds a subset of ~500 common Tailwind CSS utility classes directly in the generated HTML. Classes outside this subset will have no effect.

**Fix:** Stick to common Tailwind classes that are included in the embedded subset:
- **Layout:** `flex`, `grid`, `block`, `inline`, `hidden`, `relative`, `absolute`, `fixed`, `sticky`
- **Spacing:** `p-*`, `px-*`, `py-*`, `m-*`, `mx-*`, `my-*`, `gap-*` (values: 1-8)
- **Sizing:** `w-full`, `h-full`, `min-h-screen`, `max-w-*`
- **Typography:** `text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl`, `text-3xl`, `font-medium`, `font-semibold`, `font-bold`, `text-center`
- **Colors:** `text-white`, `text-gray-*`, `bg-white`, `bg-gray-*`, `bg-blue-*`, `bg-green-*`, `bg-red-*`
- **Borders:** `rounded`, `rounded-md`, `rounded-lg`, `rounded-full`, `border`, `border-gray-*`
- **Flexbox:** `items-center`, `justify-center`, `justify-between`, `flex-col`, `flex-row`, `flex-wrap`

**Not available:** Advanced Tailwind utilities such as `ring-*`, `divide-*`, `placeholder-*`, `backdrop-*`, `scroll-*`, and arbitrary value syntax (e.g., `w-[200px]`) are not included.

---

### 11.5 Import Errors

**Description:** Imports fail or referenced modules are undefined.

**Symptoms:** `ReferenceError` for imported values, or components fail to render due to missing dependencies.

**Root Cause 1:** Using npm packages that aren't mocked.
LiveCodeRunner strips all `import` statements and provides mocks for React, React Router, and shadcn/ui components. Packages like `axios`, `lodash`, `moment`, `date-fns`, `framer-motion`, `zustand`, etc. are not available.

**Fix:**
- Use `fetch()` instead of `axios` for HTTP requests
- Inline simple utility functions instead of importing `lodash`
- Use `new Date()` and `Intl.DateTimeFormat` instead of `moment` or `date-fns`
- Use CSS transitions/animations instead of `framer-motion`

**Root Cause 2:** Relative imports reference files that were filtered out as backend files.

**Fix:** Ensure all imported files are frontend files (not in `server/`, `routes/`, `models/`, etc.). LiveCodeRunner processes all qualifying frontend files and makes their exported components available in the same scope.

---

### 11.6 COEP/Cross-Origin Issues

**Description:** Babel CDN fails to load, or the iframe content is blocked.

**Symptoms:** Network errors for `unpkg.com/babel-standalone`, or the iframe shows a blank page with CSP errors in the console.

**Root Cause 1:** Babel CDN (`unpkg.com`) blocked by Content-Security-Policy headers.

**Fix:** LiveCodeRunner automatically falls back to a local proxy (`/api/babel-proxy`) when the CDN is blocked. Check the browser Network tab to verify the fallback is working. If neither CDN nor proxy works, Babel transpilation will fail silently.

**Root Cause 2:** `srcDoc` attribute blocked by Cross-Origin-Embedder-Policy (COEP).

**Fix:** LiveCodeRunner uses `blob:` URLs instead of `srcDoc` to bypass COEP restrictions. This is handled automatically. If you still see cross-origin issues, ensure the server is not setting overly restrictive COEP headers. The iframe uses the `sandbox` attribute with `allow-scripts` to maintain security.

---

### 11.7 Memory Leaks / Performance

**Description:** Browser memory usage grows over time, or the preview is slow to render.

**Symptoms:** Browser tab becomes sluggish, memory usage climbs in Task Manager, or preview takes several seconds to appear.

**Root Cause 1:** Blob URLs not being revoked.
Each preview render creates a new `blob:` URL for the iframe. If old URLs aren't revoked, they accumulate in memory.

**Fix:** LiveCodeRunner automatically revokes previous blob URLs after a 2-second delay (to allow the iframe to finish loading). If memory still leaks, check for multiple LiveCodeRunner instances being mounted simultaneously — each instance manages its own blob URLs independently.

**Root Cause 2:** Large projects (30+ files) are slow to process.
LiveCodeRunner processes all frontend files, strips TypeScript, applies syntax fixes, and concatenates them into a single HTML document. Projects with many files increase processing time.

**Fix:** Keep generated projects to 15-20 files or fewer. The Pro Generator (`client/src/lib/code-generator/pro-generator.ts`) is designed to limit output to this range. If previewing a large project, consider splitting it into smaller modules or previewing individual components.
