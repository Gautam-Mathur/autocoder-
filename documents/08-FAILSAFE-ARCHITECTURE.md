# Failsafe Architecture

AutoCoder is designed to degrade gracefully at every layer. No single failure — whether a missing API key, a database outage, a network timeout, or a corrupted cache — should prevent the system from producing useful output. This document describes the 6-level failsafe hierarchy, auto-recovery mechanisms, and observability infrastructure.

---

## Failsafe Hierarchy Overview

```
Level 1: Cloud AI → Falls back to Local AI Engine
Level 2: PostgreSQL → Falls back to In-Memory Storage
Level 3: WebContainer → Falls back to Static Preview
Level 4: Pre-warm Cache → Falls back to On-Demand Install
Level 5: Full Generation → Falls back to Partial Generation
Level 6: Live Preview → Falls back to Code Export/Download
```

Each level is independent — a failure at Level 4 (pre-warm) doesn't affect Level 1 (AI) or Level 2 (database). The system can operate with multiple failures simultaneously.

---

## Level 1: AI Fallback

### Cloud AI → Local AI Engine

**Trigger conditions**:
- No `OPENAI_API_KEY` environment variable set
- OpenAI API returns an error (rate limit, server error, timeout)
- Google Generative AI API unavailable
- Network connectivity lost during API call

**Behavior**: The system seamlessly switches to the local AI engine, which implements a complete 16-stage pipeline using:

| Local AI Component | Replaces | Algorithm |
|--------------------|----------|-----------|
| TF-IDF Pattern Matcher | GPT-4o NLU | Term frequency-inverse document frequency matching against 6,583 learned patterns |
| Rule-Based Reasoning | GPT-4o reasoning | Deterministic rules for architectural decisions based on entity semantics |
| Graph Analysis Engine | GPT-4o relationships | Graph traversal for entity relationship detection from field names and types |
| Template Selection System | GPT-4o generation | Pattern matching against 394 templates with domain-weighted scoring |
| Learning Brain | GPT-4o learning | Statistical pattern recording with reliability weighting |

**User impact**: Slightly less nuanced understanding of complex or ambiguous requirements. Fully functional for standard CRUD applications across all 14 supported domains. Generation speed is faster (no API latency).

**Detection**:
```
GET /api/health
→ { "aiMode": "local", "message": "Local template engine active" }
```

**Server startup log**: 
```
AI mode: local (no API keys detected)
```

**Automatic recovery**: If the cloud API becomes available again (e.g., rate limit expires), the system can switch back to cloud mode on the next generation request without restart.

---

## Level 2: Database Fallback

### PostgreSQL → In-Memory Storage

**Trigger conditions**:
- `DATABASE_URL` not set or empty
- PostgreSQL connection fails (network error, auth failure, database dropped)
- Connection pool exhausted

**Behavior**: The `IStorage` interface has two implementations:

```
IStorage (interface)
  ├── DatabaseStorage
  │   └── Drizzle ORM → PostgreSQL (Neon serverless)
  │       ├── Full ACID transactions
  │       ├── Persistent across restarts
  │       └── Supports concurrent access
  │
  └── MemStorage
      └── JavaScript Map objects
          ├── Fast reads/writes (no network)
          ├── Data lost on restart
          └── Single-process only
```

On startup, the server attempts to connect to PostgreSQL. If it fails, it logs a warning and instantiates `MemStorage`:

```
Storage mode: In-Memory (fallback) — data will not persist across restarts
```

**User impact**: All features work identically. Data is lost when the server restarts. Learning engine data persists regardless via the `learning-data.json` file.

**Key detail**: The storage interface ensures that route handlers never know which implementation they're using. All 6,162 lines of `routes.ts` work identically with either backend.

**Detection**: Server startup logs show `Storage mode: PostgreSQL Database` or `Storage mode: In-Memory (fallback)`.

---

## Level 3: Code Runner Fallback

### WebContainer → Static Preview

**Trigger conditions**:
- Browser doesn't support SharedArrayBuffer (required by WebContainer)
- Cross-origin isolation headers missing (COOP/COEP)
- WebContainer boot fails (memory constraints, browser bug)
- Browser extension interferes with WebContainer

**Detection**:
```javascript
isWebContainerSupported()  // returns false
```

**Behavior**:
- WebContainer features are disabled
- The system falls back to server-side preview using `preview-project-manager.ts`
- Static file serving via Express preview endpoints (`/api/preview/*`)
- CDN scripts (React, Babel) are proxied through the server for CORS compliance

**User impact**: Preview is less interactive — no live npm install, no hot reload, no terminal access. Generated code is still fully functional and downloadable. The code viewer and file explorer work normally.

**Recovery**: Refreshing the page retries WebContainer initialization. Switching to Electron mode provides full runtime support without browser limitations.

---

## Level 4: Pre-warm Fallback

### Pre-warm Cache → On-Demand Install

**Trigger conditions**:
- Snapshot file missing or corrupted
- npm registry unreachable
- Individual batch timeout (network slow, WebContainer throttled)
- Native package in batch (shouldn't happen, but caught by blocklist)

**Behavior**: Graduated degradation based on how many tiers complete:

| Scenario | Cached Packages | On-Demand | Speed Impact | User Experience |
|----------|----------------|-----------|--------------|-----------------|
| All 4 tiers succeed | 200+ | 0 | None | Instant project start |
| Tiers 1-3 succeed, Tier 4 fails | ~83 | ~57 | Minor | Extra packages rare, install on demand |
| Tiers 1-2 succeed, Tiers 3-4 fail | ~56 | ~84 | Moderate | Server deps install on demand (~30s) |
| Only Tier 1 succeeds | ~21 | ~119 | Significant | Most deps install on demand (~2min) |
| All fail | 0 | 200+ | Full install | Complete npm install required (~3-5min) |

**Retry logic per batch**:
1. First attempt with current state
2. If stall detected → kill npm process
3. Clear `node_modules` and `package-lock.json`
4. Retry once with clean state
5. If retry fails → mark batch as failed, continue to next tier

**Tab visibility handling**:
- `document.visibilitychange` listener pauses stall detection when tab is hidden
- Prevents false timeouts from browser throttling
- Stall timer only counts "visible" time

**User notification**: Real-time progress in chat header:
```
Installing:  "React essentials (1/4) — 21 packages... 15%"
Partial:     "85/200 packages cached (42%) — some may install on demand"
Failed:      "Pre-warm failed — packages will install when needed"
Ready:       "All 200+ packages cached ✓"
```

---

## Level 5: Generation Fallback

### Pipeline Stage Recovery

The 16-stage pipeline classifies stages as critical or non-critical:

#### Critical Stages (failure aborts pipeline)

| Stage | Role | Min Score | Why Critical |
|-------|------|-----------|-------------|
| 1 | Product Manager — Requirement Analysis | 60 | Without requirements, nothing downstream works |
| 2 | Project Manager — Project Planning | 60 | Plan drives all subsequent generation |
| 4 | Technical Analyst — Semantic Analysis | 60 | Entity extraction is foundational |
| 5 | System Architect — Architecture Planning | 60 | Architecture decisions shape all code |
| 6 | Schema Designer — Database Design | 60 | Schema is the source of truth |
| 7 | API Architect — Endpoint Design | 60 | Routes must exist for frontend to call |
| 8 | Full-Stack Developer — Code Generation | 60 | This produces the actual files |

#### Non-Critical Stages (failure logged, pipeline continues)

| Stage | Role | Min Score | What Happens on Failure |
|-------|------|-----------|------------------------|
| 3 | Senior Advisor — Pattern Application | 40 | Generation works without learned patterns |
| 9 | Design System Lead | 40 | Default design tokens used |
| 10 | Functionality Expert | 40 | Basic CRUD features still generated |
| 11 | Quality Analyst | 40 | No quality report, code still works |
| 12 | Security Analyst | 40 | No security review, code still works |
| 13 | Domain Expert | 40 | No domain-specific enhancements |
| 14 | Integration Tester | 40 | No test files, app still works |
| 15 | Release Engineer — Validation | 40 | Validation skipped, may have minor issues |
| 16 | Knowledge Manager | 40 | Outcomes not recorded to learning engine |

### Quality Gate Behavior

```
Stage quality score >= minimum → PASS → Continue to next stage
Stage quality score < minimum, critical → FAIL → Abort pipeline with error
Stage quality score < minimum, non-critical → WARN → Log warning, continue
```

### Partial Generation

If a non-critical stage fails, the pipeline continues with what it has:

| Missing Stage | Impact | Mitigation |
|--------------|--------|------------|
| Tests (Stage 14) | No test files | App still runs; add tests manually |
| Learning (Stage 16) | No pattern recording | App still works; learning resumes next run |
| Validation (Stage 15) | Unfixed issues may exist | Auto-runner may patch some issues at runtime |
| Design System (Stage 9) | Default colors/typography | Functional but less polished |
| Quality (Stage 11) | No quality report | Code works; run quality check manually |

### Post-Generation Auto-Fix (Stage 15)

The `validateAndFix` function attempts iterative repair:

```
Fixable Issues:
├── Missing imports → Generate stub files with expected exports
├── Missing default exports → Add `export default ComponentName`
├── Incorrect relative paths → Correct `../` depth calculation
├── Missing npm packages → Add to package.json dependencies
├── Missing config files → Generate default tsconfig, vite.config, etc.
└── Broken cross-file references → Resolve and reconnect

Process:
1. Scan all files for issues
2. Apply fixes
3. Re-scan to check for secondary issues from fixes
4. Repeat until clean or max 10 iterations
5. Report remaining unfixable issues as warnings
```

---

## Level 6: Preview Fallback

### Live Preview → Download/Export

**Trigger conditions**:
- WebContainer crashes during npm install
- npm install fails completely (network, permissions)
- Vite dev server won't start (config error, port conflict)
- Generated code has fatal runtime errors

**Behavior**: Even if the preview can't run, the generated code is always accessible through multiple channels:

| Channel | Endpoint | Format |
|---------|----------|--------|
| File API | `GET /api/conversations/:id/files` | JSON array of files |
| Export | `GET /api/conversations/:id/export` | Zip download |
| Download | `GET /api/conversations/:id/download` | Text bundle |
| GitHub Push | `POST /api/conversations/:id/github-push` | Git repository |
| Code Viewer | (UI) | VS Code-style in-browser editor |

**User impact**: No live interactive preview, but the code is production-ready. Users can:
1. Download and run locally with `npm install && npm run dev`
2. Push to GitHub and deploy on any hosting platform
3. View and copy code from the in-browser editor
4. Use the auto-fix panel to resolve errors before downloading

---

## Auto-Runner Resilience

The auto-runner (`auto-runner.ts`, 1,070 lines) has its own failsafe mechanisms:

### Duplicate Run Prevention

If `autoRunProject` is called while a run is already active, the duplicate call is blocked and returns the active run's promise. This prevents resource exhaustion from rapid-fire generation or user double-clicks.

```
Call 1: autoRunProject(files) → starts run, returns promise
Call 2: autoRunProject(files) → detects active run, returns same promise
Call 1 completes → both callers receive the result
```

### Project Hash Caching

Each run computes a hash of all file paths and sizes. If the hash matches the previous successful run, the existing preview URL is reused without restarting:

```
Hash = SHA256(file1.path + file1.size + file2.path + file2.size + ...)
If hash === previousHash → reuse existing preview (instant)
If hash !== previousHash → full restart
```

### Large package.json Handling

If `package.json` exceeds 15KB (common with 100+ dependencies):

1. Write minimal `package.json` with only core dependencies (react, vite, typescript)
2. Run `npm install` for core deps
3. Add remaining dependencies in batches of 20
4. Run `npm install` for each batch
5. Restore the full `package.json` after all installs complete
6. Start the dev server

### npm Install Failure Recovery

If `npm install` fails, the auto-runner attempts to proceed to server startup anyway. Many applications will still run with partial dependencies installed:
- Dev-only dependencies (TypeScript, ESLint) aren't needed at runtime
- Optional dependencies can be missing without crashes
- Some packages have runtime fallbacks (e.g., `date-fns` functions can be replaced with native `Date`)

### Error Pattern Detection

The auto-runner monitors Vite's output for error patterns and attempts targeted patches:

| Pattern | Detection | Fix |
|---------|-----------|-----|
| Missing critical UI files | Vite error referencing `components/ui/*` | Regenerate from known-good templates |
| Import path errors | `Cannot find module` with wrong `../` depth | Correct relative path |
| TypeScript strict errors | `TS2322`, `TS2345` etc. | Log for user visibility (can't auto-fix types) |
| Missing environment variables | `process.env.X is undefined` | Add default values or `.env` file |

---

## Learning Engine Resilience

### Dual Data Persistence

Learning data is stored in two independent locations:

```
Primary:   PostgreSQL database (generation_patterns, generation_outcomes tables)
Secondary: learning-data.json (portable file in project root)
```

| Event | PostgreSQL | File |
|-------|-----------|------|
| Pattern learned | Written immediately | Written on save |
| Outcome recorded | Written immediately | Written on save |
| Server startup | Loaded as backup | Primary load source |
| Database reset | Data lost | File still has it |
| File deleted | Database still has it | Regenerate from DB |

### Load Priority on Startup

```
1. Try to load from learning-data.json (fast, always available)
2. If file missing/corrupt → load from PostgreSQL
3. If database unavailable → start with empty patterns
4. Log which source was used
```

### Graceful Degradation Without Learning

If the learning engine fails entirely:
- Generation still works using built-in domain knowledge and templates
- Quality may be slightly lower for complex domain-specific applications
- All core CodeGen V2 functionality is unaffected
- No user-facing errors — the system simply doesn't apply learned patterns

### Data Integrity

- Patterns have reliability scores (0-1). Only patterns with reliability > 0.5 are applied
- Current stats: 6,461 reliable out of 6,583 total (98.1%)
- Corrupt or low-reliability patterns are automatically excluded
- The learning engine validates pattern structure before applying

---

## Network Resilience

### npm Registry Fallback

The pre-warm system attempts multiple npm registry URLs:

```
Primary:  https://registry.npmjs.org
Mirror:   https://registry.npmmirror.com
```

If the primary registry is slow (>10s per package) or unreachable, the mirror provides a fallback. Registry selection is per-batch, not per-package.

### CDN Fallback for Preview Scripts

Preview scripts (React, ReactDOM, Babel) are fetched from CDN with resilience:

```
1. Try CDN fetch (unpkg.com or cdnjs.cloudflare.com)
2. If CDN fails → serve from Express proxy (/api/preview-scripts/:lib)
3. If proxy fails → use cached version (24-hour cache)
4. If all fail → preview renders without transpilation (basic HTML only)
```

### GitHub API Resilience

GitHub operations (push, import) handle API failures:
- Rate limiting: Exponential backoff with retry
- Auth failures: Clear error message to re-authenticate
- Network timeout: Retry once after 10s delay
- Partial push failure: Report which files succeeded/failed

---

## Monitoring & Observability

### Structured Logging

Every component uses a structured logger with consistent format:

```typescript
logger.info('Pipeline', `Stage ${stage} completed`, {
  duration: 234,
  qualityScore: 85,
  entities: 4,
  files: 40
});
```

Output:
```
04:08:47.491 ● INF Pipeline    Stage 8 completed duration=234 qualityScore=85 entities=4 files=40
```

**Log levels**:

| Level | Usage |
|-------|-------|
| DEBUG | Detailed internal state (disabled in production) |
| INFO | Normal operation milestones |
| WARN | Non-critical issues (quality below threshold, retries) |
| ERROR | Failures requiring attention |
| SUCCESS | Completed operations with metrics |

**Log categories**:

| Category | Source |
|----------|--------|
| SERVER | Server startup and shutdown |
| API | HTTP request/response logging |
| Pipeline | 16-stage pipeline execution |
| PreWarm | WebContainer package pre-warming |
| AutoRunner | Auto-run preview system |
| Learning | Learning engine operations |
| CodeGen | Code generation engine |
| Validator | Post-generation validation |
| GitHub | GitHub API operations |

### Pipeline Transparency

Every stage of the 16-stage pipeline records:

| Data | Purpose |
|------|---------|
| Execution duration (ms) | Performance tracking |
| Quality score (0-100) | Output quality measurement |
| Warnings generated | Issue visibility |
| Decisions made | Audit trail for debugging |
| Entities detected | Validation of understanding |
| Files generated | Output completeness |

This data is accessible via `GET /api/conversations/:id/transparency` for any conversation.

### Pre-warm Progress Tracking

Real-time progress notifications include:
- Current batch name and description
- Package count and completion percentage
- Success/failure status with npm output
- Total elapsed time
- Individual package status (installed, failed, skipped)

### Health Monitoring Endpoints

| Endpoint | What It Checks |
|----------|---------------|
| `GET /api/health` | Server status + AI mode |
| `GET /api/logs/stats` | Log volume by level |
| `GET /api/learning/stats` | Learning engine health |
| `GET /api/local-ai/stats` | Local AI engine status |
| `GET /api/preview/status` | Preview server status |
| `GET /api/debug/status` | Debug engine status |

---

## Design Philosophy

### 1. Never Fail Silently

Every error is logged with full context — file, function, input data, and stack trace. Users see clear status messages, not blank screens or generic error pages. Even internal failures produce visible feedback.

### 2. Degrade, Don't Crash

Missing AI? Use local engine. Missing database? Use memory. Missing cache? Install on demand. Missing preview? Export code. Each layer has a fallback, and multiple layers can fail simultaneously without the system crashing.

### 3. Always Produce Output

Even if the output is imperfect, a partial application is more useful than an error page. A generated app with missing tests is better than no app. A preview with a broken chart is better than no preview. The system always moves forward.

### 4. Learn From Failures

Error patterns are recorded by the learning engine. With 230 recorded failures out of 182,913 outcomes (0.13%), the system builds a knowledge base of what doesn't work. Future generations can avoid known failure patterns.

### 5. Transparency Over Magic

Users and developers can inspect every decision the system made, at every stage, with quality scores and timing data. The transparency API exposes the complete audit trail. No black-box magic — if the output is wrong, you can trace exactly where and why.

### 6. Independent Layers

Each failsafe level operates independently. A database failure (Level 2) doesn't affect AI mode (Level 1) or pre-warm cache (Level 4). A pre-warm failure (Level 4) doesn't affect code generation (Level 5). This isolation ensures that failures are contained and don't cascade.

### 7. Automatic Recovery

Where possible, the system recovers automatically:
- Cloud API rate limits expire → switch back from local to cloud
- Database reconnects → switch back from memory to PostgreSQL
- Pre-warm retry succeeds → packages become available
- Auto-fix resolves imports → preview starts successfully

No manual intervention required for transient failures.
