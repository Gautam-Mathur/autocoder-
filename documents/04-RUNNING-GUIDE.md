# Running Guide

This document covers everything you need to know about running AutoCoder in web mode, Electron desktop mode, and configuring the environment.

---

## Web Mode (Replit / Browser)

### Quick Start

```bash
npm run dev
```

This starts:
- Express backend on port 5000
- Vite dev server with hot module replacement (HMR)
- Frontend served at `http://localhost:5000`
- WebSocket server for real-time AI response streaming

### What Happens on Startup

```
1. Server boots
   ├── Express registers all API routes (6,162 lines of endpoints)
   ├── Connects to PostgreSQL via DATABASE_URL
   │   └── Falls back to in-memory storage if DB unavailable
   ├── Initializes session middleware with SESSION_SECRET
   └── Configures COOP/COEP headers for WebContainer isolation

2. AI mode detection
   ├── If OPENAI_API_KEY is set → Cloud mode (13 AI modules available)
   ├── If GOOGLE_GENERATIVE_AI_API_KEY is set → Google AI enabled
   └── If no keys → Local AI engine activates (16-stage deterministic pipeline)

3. Learning engine loads
   ├── Reads learning-data.json (6,583 patterns, 3,575 preferences)
   ├── Indexes patterns by type (entity-structure, domain-mapping, template-selection)
   └── Makes patterns available for applyLearnedPatterns during generation

4. Vite serves frontend
   ├── React app loads in the browser
   ├── Tailwind CSS processes styles
   └── Hot module replacement enables instant updates

5. WebContainer pre-warm starts (background)
   ├── Attempts to load pre-built snapshot
   ├── Falls back to 4-tier npm install
   └── 200+ packages cached for instant project startup
```

### Console Output on Successful Start

```
> rest-express@1.0.0 dev
> NODE_ENV=development tsx server/index.ts
Storage mode: PostgreSQL Database
Learning engine: loaded 6583 patterns, 3575 preferences from file
04:08:47.491 ● INF SERVER     Routes registration started
4:08:48 AM [express] serving on port 5000
```

---

### WebContainer Pre-warm

When you open the chat interface, the WebContainer environment starts pre-warming automatically. This happens in the browser background and doesn't block the UI.

#### Status Indicator

The chat header shows a color-coded dot indicating pre-warm status:

| Indicator | Status | Meaning |
|-----------|--------|---------|
| Yellow dot (pulsing) | Installing | Packages being installed in batches |
| Green dot | Ready | All packages cached and ready |
| Red dot | Failed | Pre-warm failed; packages will install on demand |

Hover over the indicator for the detailed progress message.

#### Progress Messages

```
Installing... React essentials (1/4) — 21 packages... 15%
Installing... UI components (2/4) — 35 packages... 48%
Installing... Server & utilities (3/4) — 27 packages... 71%
Installing... Extended libraries (4/4) — 57 packages... 100%
Ready! All 200+ packages cached — 100%
```

#### Pre-warm Batches

| Batch | Name | Package Count | Timeout | Stall Timeout | Key Packages |
|-------|------|--------------|---------|---------------|-------------|
| 1/4 | React essentials | 21 | 300s | 180s | React 18, Vite 5, TypeScript, Tailwind CSS 3, TanStack Query v5, Wouter, react-hook-form, Lucide React, Zod |
| 2/4 | UI components | 35 | 180s | 90s | All Radix UI primitives (@radix-ui/react-*), Framer Motion, embla-carousel, date-fns, nanoid, uuid, clsx, tailwind-merge |
| 3/4 | Server & utilities | 27 | 180s | 90s | Express, Drizzle ORM, Passport, bcryptjs, Recharts, @dnd-kit/core, Zustand, Axios, jsonwebtoken, multer |
| 4/4 | Extended libraries | 57+ | 180s | 90s | Chart.js, Socket.io, Slate, Formik, xlsx, csv-parse, currency.js, xstate, i18next, marked, highlight.js |

#### npm Install Flags

The pre-warm system uses these npm flags for optimal WebContainer performance:

| Flag | Purpose |
|------|---------|
| `--prefer-offline` | Use cached packages when available |
| `--no-audit` | Skip vulnerability audit (saves 10-30s) |
| `--no-fund` | Skip funding messages |
| `--omit=optional` | Skip optional native dependencies |
| `--legacy-peer-deps` | Tolerate peer dependency conflicts |
| `--fetch-retries=2` | Retry failed downloads twice |
| `--fetch-timeout=30000` | 30s timeout per package fetch |

#### Retry Logic

If a batch fails:
1. `node_modules` and `package-lock.json` are deleted
2. The batch is retried once with a clean state
3. If retry fails: Tiers 1-3 failures set status to `failed`; Tier 4 failure is non-critical

#### Tab Visibility

WebContainer is throttled when the browser tab is hidden. The pre-warm system:
- Detects tab visibility changes via `document.visibilitychange`
- Pauses stall detection when tab is hidden
- Resumes when tab becomes visible
- Only counts "visible" time toward stall timeout

#### Snapshot Strategy

The pre-warm system tries to load a pre-built snapshot first:
1. Load `/cache/prewarm-snapshot.json.gz` (compressed `node_modules` tree)
2. If snapshot matches current package versions → instant mount (~2s)
3. If snapshot is stale or missing → fall back to npm install (~2-4 min)

Generate a fresh snapshot:
```bash
npx tsx scripts/scripts/generate-prewarm-snapshot.ts
```

### Requirements for WebContainer

WebContainer requires specific HTTP headers for cross-origin isolation:

```
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

These are configured in `server/vite.ts` and applied to all responses automatically.

**Supported browsers**: Chrome 90+, Edge 90+, Firefox 90+ (with `dom.postMessage.sharedArrayBuffer.bypassCOOP_COEP.insecure.enabled` in `about:config`)

**Known blockers**: Some browser extensions (ad blockers, privacy tools like uBlock Origin, NoScript) can interfere with cross-origin isolation or WebContainer's SharedArrayBuffer usage.

---

## Electron Desktop Mode

### Quick Start

```bash
npm run electron:dev
```

This starts the Express server and launches an Electron window with the AutoCoder interface.

### Advantages Over Web Mode

| Feature | Web Mode | Electron Mode |
|---------|----------|---------------|
| File system access | WebContainer (sandboxed) | Native (full access) |
| npm install | WebContainer npm (slower) | Native npm (full speed) |
| Package cache | Per-session (lost on refresh) | Persistent on disk |
| Project export | Zip download only | Direct save to any folder |
| Native binaries | Not supported | Fully supported (sharp, sqlite, etc.) |
| Project persistence | Database only | Local file system + database |
| Performance | Browser constraints | Full system resources |
| Offline | Partial (needs initial load) | Fully offline capable |

### Electron Architecture

```
electron/
  main.ts                # Main process — creates window, manages IPC
  preload.ts             # Preload script — secure IPC bridge to renderer
  services/              # Electron-specific services
    file-system.ts       # Native file system operations
    npm-runner.ts        # Native npm execution
    project-manager.ts   # Project persistence and management
  scripts/               # Build and dev scripts
  npm-cache/             # Persistent npm package cache
  tsconfig.json          # Main process TypeScript config
  tsconfig.preload.json  # Preload script TypeScript config
```

### Building for Distribution

```bash
npm run electron:build
```

This uses electron-builder to create distributable packages:

| Platform | Output | Format |
|----------|--------|--------|
| Windows | `dist-electron/autocoder-setup.exe` | NSIS installer |
| macOS | `dist-electron/autocoder.dmg` | DMG disk image |
| Linux | `dist-electron/autocoder.AppImage` | AppImage |

### Electron-Specific Features

#### Project Persistence
Generated projects are saved to the local file system at a user-configurable location. Projects persist between sessions, so you can close AutoCoder and reopen it later to continue iterating.

#### Bulk Package Cache
npm packages are installed natively with full caching. The `electron/npm-cache/` directory stores package tarballs so subsequent installs are near-instant. All packages are supported, including native binaries.

#### Direct File Editing
Users can open generated files in their preferred editor (VS Code, Sublime, etc.) directly from the file explorer panel. Changes are reflected in the AutoCoder preview.

#### Node Modules Copy Strategy
For Electron mode, instead of running npm install in each generated project, AutoCoder copies the pre-installed `node_modules` directory from the main project into the generated project. This provides instant availability of all 200+ packages without network access.

---

## Environment Configuration

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/dbname` |
| `SESSION_SECRET` | Secret for Express session encryption | Any random string (32+ chars recommended) |

On Replit, `DATABASE_URL` is automatically set when you create a PostgreSQL database. `SESSION_SECRET` should be set as a secret in the Secrets tab.

### Optional Variables (AI Features)

| Variable | Description | Effect |
|----------|-------------|--------|
| `OPENAI_API_KEY` | OpenAI API key | Enables cloud AI mode with GPT-4o for all 13 AI modules |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Google AI API key | Enables Google Generative AI capabilities |

### Optional Variables (Features)

| Variable | Description | Default |
|----------|-------------|---------|
| `CLOUD_SANDBOX_ENABLED` | Enable cloud sandbox execution | `false` |
| `NODE_ENV` | Environment mode | `development` |

### AI Mode Detection

The server checks for AI API keys on startup and selects the appropriate mode:

```
If OPENAI_API_KEY exists:
  → Cloud mode
  → 13 specialized AI modules available
  → Advanced natural language understanding
  → Higher quality for novel/complex apps

If no API keys:
  → Local mode
  → 16-stage deterministic pipeline
  → TF-IDF + rule-based + graph analysis
  → Zero external dependencies
  → Full support for all 14 domains
```

Verify current mode:
```
GET /api/health
```
```json
{
  "status": "ok",
  "aiMode": "local",
  "message": "Local template engine active"
}
```

Or for cloud mode:
```json
{
  "status": "ok",
  "aiMode": "cloud",
  "message": "Cloud AI ready"
}
```

---

## GitHub Integration

AutoCoder uses the Octokit library with a Replit GitHub connector for repository operations.

### Available Operations

| Operation | Endpoint | Description |
|-----------|----------|-------------|
| List repos | `GET /api/github/repos` | List authenticated user's repositories |
| Get contents | `GET /api/github/repos/:owner/:repo/contents` | Browse repository files |
| Import | `POST /api/github/import-github` | Import files from a GitHub repo |
| Push | `POST /api/github/push` | Push files to a GitHub repo |
| Push project | `POST /api/conversations/:id/github-push` | Push conversation's project files |

### Push Strategy

AutoCoder uses a **full tree replacement** strategy when pushing to GitHub:
1. Fetch the remote repository's current tree
2. Compare against local files
3. Upload only changed files as blobs
4. Create a new tree with all files
5. Create a commit pointing to the new tree
6. Update the branch reference

This means the repository will contain exactly what AutoCoder generated — no merge conflicts, no stale files.

---

## Troubleshooting Startup

### "Cannot connect to database"
- Ensure `DATABASE_URL` environment variable is set
- On Replit, create a PostgreSQL database via the Database panel
- The server falls back to in-memory storage if database is unavailable
- Check server logs for the specific connection error

### "WebContainer not supported"
- WebContainer requires Chrome 90+, Edge 90+, or Firefox 90+
- Cross-origin isolation headers must be present
- Some browser extensions (ad blockers, privacy tools) can interfere
- Try incognito/private mode to rule out extension conflicts
- Check browser console for SharedArrayBuffer-related errors

### "Pre-warm timed out"
- This is normal on slow connections — the system will install packages on demand
- Check browser console for detailed npm logs (search for "PreWarm")
- Try refreshing the page to retry with cached packages from the first attempt
- If persistent, check network connectivity and proxy settings

### Server won't start
- Check that port 5000 is available: `lsof -i :5000`
- Ensure `npm install` completed successfully
- Check for TypeScript compilation errors in the console
- Verify all environment variables are set correctly

### "Session secret not set"
- Set `SESSION_SECRET` as a secret in Replit's Secrets tab
- Any random string works; 32+ characters recommended
- Without this, sessions won't persist across server restarts

### Electron window is blank
- Ensure the Express server started successfully (check terminal output)
- The server must be running before Electron can load the UI
- Check Electron's DevTools (Ctrl+Shift+I) for errors
- Verify that `electron/main.ts` points to the correct server URL

### Generated project won't start
- Check the auto-runner output in the preview panel
- Look for npm install errors (missing packages, version conflicts)
- Verify that all pre-warm batches completed successfully
- Try the "Rebuild" button to force a fresh install
- Check the generated `package.json` for dependency issues
