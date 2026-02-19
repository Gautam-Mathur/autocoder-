# Running Guide

## Web Mode (Replit / Browser)

### Quick Start

```bash
npm run dev
```

This starts:
- Express backend on port 5000
- Vite dev server with hot module replacement
- Frontend served at `http://localhost:5000`

### What Happens on Startup

1. **Server boots**: Express registers all API routes, connects to PostgreSQL (or falls back to in-memory storage)
2. **AI mode detection**: If `OPENAI_API_KEY` is set, cloud mode is enabled. Otherwise, local AI engine activates
3. **Learning engine loads**: Reads `learning-data.json` for previously learned patterns
4. **Vite serves frontend**: React app loads in the browser
5. **WebContainer pre-warm starts**: 140 packages are pre-installed in 4 batches (this runs in the background)

### WebContainer Pre-warm

When you open the chat interface, the WebContainer environment starts pre-warming automatically. You'll see a status indicator in the header:

- **Yellow dot (pulsing)**: Installing packages — shows current batch, package count, and percentage
  - Example: `React essentials (1/4) — 21 packages... 15%`
  - Example: `UI components (2/4) — 35 packages... 48%`
- **Green dot**: All packages cached and ready
- **Red dot**: Pre-warm failed, packages will install on demand when needed

Hover over the indicator to see the detailed progress message.

### Pre-warm Batches

| Batch | Name | Package Count | Timeout | What's Included |
|-------|------|--------------|---------|-----------------|
| 1/4 | React essentials | 21 | 300s | React, Vite, TypeScript, Tailwind, TanStack Query, Wouter, react-hook-form, Lucide |
| 2/4 | UI components | 35 | 180s | All Radix UI primitives, Framer Motion, embla-carousel, date-fns, nanoid, uuid |
| 3/4 | Server & utilities | 27 | 180s | Express, Drizzle ORM, Passport, bcryptjs, Recharts, DnD Kit, Zustand, Axios |
| 4/4 | Extended libraries | 57 | 180s | Chart.js, Socket.io, Slate, Formik, xlsx, csv-parse, currency.js, xstate |

### npm Install Flags

The pre-warm system uses these npm flags for optimal WebContainer performance:

| Flag | Purpose |
|------|---------|
| `--prefer-offline` | Use cached packages when available |
| `--no-audit` | Skip vulnerability audit (saves time) |
| `--no-fund` | Skip funding messages |
| `--omit=optional` | Skip optional native dependencies |
| `--legacy-peer-deps` | Tolerate peer dependency conflicts |
| `--fetch-retries=2` | Retry failed downloads twice |
| `--fetch-timeout=30000` | 30s timeout per package fetch |

### Requirements for WebContainer

WebContainer requires specific HTTP headers for cross-origin isolation:

```
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

These are configured in `server/vite.ts` and applied to all responses.

---

## Electron Desktop Mode

### Quick Start

```bash
npm run electron:dev
```

This starts the Express server and launches an Electron window.

### Advantages Over Web Mode

| Feature | Web Mode | Electron Mode |
|---------|----------|---------------|
| File system access | WebContainer (sandboxed) | Native (full access) |
| npm install | WebContainer npm (slower) | Native npm (full speed) |
| Package cache | Per-session (lost on refresh) | Persistent on disk |
| Project export | Zip download | Direct save to folder |
| Native binaries | Not supported | Fully supported |

### Building for Distribution

```bash
npm run electron:build
```

This creates distributable packages for Windows, macOS, and Linux using electron-builder.

### Electron-Specific Features

- **Project persistence**: Generated projects are saved to the local file system and persist between sessions
- **Bulk cache install**: npm packages are installed natively, supporting all packages including those with native binaries (sharp, better-sqlite3, etc.)
- **Direct file editing**: Users can open generated files in their preferred editor

---

## Environment Configuration

### Required

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string (automatically set on Replit) |
| `SESSION_SECRET` | Secret for Express session encryption |

### Optional (AI Features)

| Variable | Description |
|----------|-------------|
| `OPENAI_API_KEY` | Enables cloud AI mode with GPT-4o |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Enables Google Generative AI features |

### Optional (Features)

| Variable | Description |
|----------|-------------|
| `CLOUD_SANDBOX_ENABLED` | Enable cloud sandbox execution (planned feature) |

### AI Mode Detection

The server checks for AI API keys on startup:
- If `OPENAI_API_KEY` is present: Cloud mode (13 specialized AI modules available)
- If no keys: Local mode (16-stage deterministic pipeline, no external dependencies)

Check current mode via `GET /api/health`:
```json
{
  "status": "ok",
  "aiMode": "local",
  "message": "Local template engine active"
}
```

---

## Troubleshooting Startup

### "Cannot connect to database"
- Ensure `DATABASE_URL` environment variable is set
- On Replit, the PostgreSQL database is created automatically
- The server falls back to in-memory storage if database is unavailable

### "WebContainer not supported"
- WebContainer requires a modern browser (Chrome 90+, Edge 90+, Firefox 90+)
- Cross-origin isolation headers must be present
- Some browser extensions (ad blockers, privacy tools) can interfere

### "Pre-warm timed out"
- This is normal on slow connections — the system will install packages on demand
- Check browser console for detailed npm logs
- Try refreshing the page to retry pre-warm with cached packages from the first attempt

### Server won't start
- Check that port 5000 is available
- Ensure `npm install` completed successfully
- Check for TypeScript compilation errors in the console
