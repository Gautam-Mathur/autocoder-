# Failsafe Architecture

AutoCoder is designed to degrade gracefully at every layer. No single failure should prevent the system from producing useful output.

## Failsafe Hierarchy

```
Level 1: Cloud AI → Falls back to Local AI Engine
Level 2: PostgreSQL → Falls back to In-Memory Storage  
Level 3: WebContainer → Falls back to Static Preview
Level 4: Pre-warm Cache → Falls back to On-Demand Install
Level 5: Full Generation → Falls back to Partial Generation
Level 6: Live Preview → Falls back to Code Export/Download
```

---

## Level 1: AI Fallback

### Cloud AI → Local AI Engine

**Trigger**: No `OPENAI_API_KEY` environment variable, or OpenAI API returns an error.

**Behavior**: The system seamlessly switches to the local AI engine, which uses:
- TF-IDF Pattern Matcher for understanding user intent
- Rule-Based Reasoning Engine for architectural decisions
- Graph Analysis Engine for entity relationships
- Template Selection System for code generation
- Custom algorithms that run entirely offline

**User impact**: Slightly less nuanced understanding of complex requirements, but fully functional for standard CRUD applications across all 14 supported domains.

**Detection**: Check `GET /api/health` — `aiMode` will be `"local"` instead of `"cloud"`.

---

## Level 2: Database Fallback

### PostgreSQL → In-Memory Storage

**Trigger**: `DATABASE_URL` not set, or PostgreSQL connection fails.

**Behavior**: The `IStorage` interface has two implementations:
- `DatabaseStorage`: Full PostgreSQL with Drizzle ORM
- `MemStorage`: Map-based in-memory storage

On startup, the server attempts to connect to PostgreSQL. If it fails, it logs a warning and falls back to `MemStorage`.

**User impact**: All features work, but data is lost when the server restarts. Learning engine data persists via `learning-data.json` file regardless of storage mode.

**Detection**: Server startup logs show `Storage mode: PostgreSQL Database` or `Storage mode: In-Memory (fallback)`.

---

## Level 3: Code Runner Fallback

### WebContainer → Static Preview

**Trigger**: Browser doesn't support WebContainer (missing cross-origin isolation), or WebContainer fails to boot.

**Behavior**: 
- `isWebContainerSupported()` returns false
- The system falls back to server-side preview using `preview-manager.ts`
- Static file serving via the Express preview endpoints

**User impact**: Preview may be less interactive (no live npm install, no hot reload), but the generated code is still fully functional and downloadable.

---

## Level 4: Pre-warm Fallback

### Pre-warm Cache → On-Demand Install

**Trigger**: Any pre-warm batch fails after retry, or pre-warm is only partially complete.

**Behavior**:
- If the core batch (Tier 1) fails, pre-warm status is set to `'failed'`
- If later batches fail, pre-warm status is `'ready'` with partial cache
- When the auto-runner needs a package that isn't cached, npm installs it on demand

**Graduated degradation**:

| Scenario | Cached | On-Demand | Speed Impact |
|----------|--------|-----------|--------------|
| All 4 tiers succeed | 140 packages | 0 | None |
| Tiers 1-3 succeed, 4 fails | 83 packages | ~57 | Minor (extras are rare) |
| Tiers 1-2 succeed, 3-4 fail | 56 packages | ~84 | Moderate (server deps install on demand) |
| Only Tier 1 succeeds | 21 packages | ~119 | Significant but functional |
| All fail | 0 packages | ~140 | Full install required (~2-5 min) |

**Retry logic**:
- Every batch gets one retry attempt
- Before retry: `node_modules` and `package-lock.json` are cleared
- Tab visibility detection pauses stall timers (prevents false timeouts when tab is in background)

**User notification**: The chat UI shows real-time progress:
- Installing: `"React essentials (1/4) — 21 packages... 15%"`
- Partial success: `"85/140 packages cached (61%) — some may install on demand"`
- Full failure: `"React essentials failed — packages will install on demand"`

---

## Level 5: Generation Fallback

### Pipeline Stage Recovery

The 16-stage pipeline has critical and non-critical stages:

**Critical stages** (failure aborts pipeline):
1. Product Manager — Requirement Analysis
2. Project Manager — Project Planning
4. Technical Analyst — Semantic Analysis
5. System Architect — Architecture Planning
6. Schema Designer — Database Design
7. API Architect — Endpoint Design
8. Full-Stack Developer — Code Generation

**Non-critical stages** (failure logged, pipeline continues):
3. Senior Advisor — Pattern Application (learning)
9-13. Various analysis stages
14. Integration Tester — Test Generation
15. Release Engineer — Validation (auto-fix attempts)
16. Knowledge Manager — Recording outcomes

**Quality gates**: Each stage produces a quality score (0-100). Critical stages must score above 60; non-critical stages must score above 40. Below-threshold results are logged as warnings.

### Partial Generation

If a non-critical stage fails, the pipeline continues with what it has:
- Missing test files? App still works, just no tests
- Learning stage fails? App is generated, just no pattern recording
- Validation finds unfixable issues? Warnings are surfaced, app may still run

### Post-Generation Auto-Fix

Stage 15 (validateAndFix) attempts to repair common issues:
- **Missing imports**: Generates stub files with expected exports
- **Missing default exports**: Adds `export default` to components
- **Incorrect paths**: Corrects relative import depth (`../` miscalculations)
- **Missing packages**: Adds npm packages to `package.json`

The fix runs in multiple passes until no more auto-fixable issues are found, or a maximum iteration count is reached.

---

## Level 6: Preview Fallback

### Live Preview → Download/Export

**Trigger**: WebContainer crashes, npm install fails completely, or dev server won't start.

**Behavior**: Even if the preview can't run, the generated code is always available:
- All files are stored in the database (or in-memory)
- `GET /api/conversations/:id/files` returns the complete file set
- `GET /api/conversations/:id/export` packages files for download
- `POST /api/conversations/:id/github-push` pushes to GitHub

**User impact**: No live preview, but the code is production-ready and can be run locally with `npm install && npm run dev`.

---

## Auto-Runner Resilience

The auto-runner (`auto-runner.ts`) has its own failsafe mechanisms:

### Duplicate Run Prevention
If `autoRunProject` is called while a run is already active, the duplicate call is blocked and returns the active run's promise. This prevents resource exhaustion from rapid-fire generation.

### Project Hash Caching
Each run computes a hash of all file paths and sizes. If the hash matches the previous successful run, the existing preview URL is reused without restarting — instant reconnection.

### Large package.json Handling
If `package.json` exceeds 15KB, the auto-runner switches to batched install:
1. Write a minimal `package.json` with core dependencies only
2. Run `npm install`
3. Incrementally add remaining dependencies in smaller batches
4. Restore the full `package.json` after all installs complete

### npm Install Failure Recovery
If `npm install` fails, the auto-runner attempts to proceed to server startup anyway. Many applications will still run with partial dependencies installed, especially if the missing packages are optional or dev-only.

### Error Pattern Detection
The auto-runner monitors Vite's output for error patterns and attempts patches:
- Missing critical UI files are regenerated from known-good templates
- Import errors trigger path correction
- TypeScript errors are logged for user visibility

---

## Learning Engine Resilience

### Data Persistence
Learning data is stored in two places:
1. **PostgreSQL**: Primary storage for patterns, outcomes, and preferences
2. **learning-data.json**: Portable file backup that survives database resets

On startup, the learning engine loads from the file. On save, it writes to both the database and the file.

### Graceful Degradation
If the learning engine fails to load, the system continues without learned patterns. Generation quality may be slightly lower for complex applications, but all core functionality works.

---

## Network Resilience

### npm Registry Fallback
The pre-warm system configures multiple npm registry URLs:
1. `https://registry.npmmirror.com` (mirror)
2. `https://registry.npmjs.org` (primary)

If the primary registry is slow or unreachable, the mirror provides a fallback.

### CDN Fallback for Preview Scripts
Preview scripts (React, Babel) are fetched from CDN with a 24-hour cache. If the CDN is unreachable, cached versions are served.

---

## Monitoring & Observability

### Structured Logging
Every component uses a structured logger with:
- Timestamps
- Log levels (DEBUG, INFO, WARN, ERROR, SUCCESS)
- Categories (PreWarm, NPM, Pipeline, AutoRunner, etc.)
- Duration timers for performance tracking
- Contextual metadata (package counts, file sizes, exit codes)

### Pipeline Transparency
Every stage of the 16-stage pipeline records:
- Execution duration
- Quality score
- Warnings generated
- Decisions made

This data is accessible via `GET /api/conversations/:id/transparency`.

### Pre-warm Progress
Real-time progress notifications include:
- Current batch name and description
- Package count and percentage
- Success/failure status with details
- Total elapsed time

---

## Design Philosophy

1. **Never fail silently**: Every error is logged with context. Users see clear status messages, not blank screens
2. **Degrade, don't crash**: Missing AI? Use local. Missing database? Use memory. Missing cache? Install on demand
3. **Always produce output**: Even if the output is imperfect, a partial application is more useful than an error page
4. **Learn from failures**: Error patterns are recorded so future generations can avoid the same issues
5. **Transparency over magic**: Users can inspect every decision the system made, at every stage, with quality scores and timing data
