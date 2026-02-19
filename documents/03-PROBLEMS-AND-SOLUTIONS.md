# Problems and Solutions

## Known Issues and Their Fixes

This document catalogs problems encountered during development and their solutions. Use this as a debugging reference.

---

### Problem: WebContainer npm Install Timeout

**Symptoms**: Pre-warm fails with "npm install timed out after Xs, killing". Retry also fails.

**Root Cause**: WebContainer's npm is slower than native npm. Cold cache installs can take 2-4 minutes for the core batch (21 packages + all transitive dependencies).

**Solution**: 
- Core batch timeout set to 300s (5 minutes) with 180s stall timeout
- Later batches get 180s timeout / 90s stall timeout (they benefit from cached deps)
- Tab visibility detection pauses the stall timer when the browser tab is hidden (WebContainer throttles background tabs)
- Retry logic clears `node_modules` and `package-lock.json` before retrying

**Files**: `client/src/lib/code-runner/webcontainer.ts`

---

### Problem: npm "warn config optional" Messages

**Symptoms**: Console flooded with `npm warn config optional Use --omit=optional to exclude optional dependencies`.

**Root Cause**: Newer npm versions deprecated the `--no-optional` flag in favor of `--omit=optional`.

**Solution**: Changed npm install flags from `--no-optional` to `--omit=optional`.

**Files**: `client/src/lib/code-runner/webcontainer.ts`

---

### Problem: Vite Crashes on Missing tsconfig.node.json

**Symptoms**: Generated projects fail with `ENOENT: no such file or directory, open 'tsconfig.node.json'`.

**Root Cause**: Vite's `tsconfig.json` template includes `"references": [{ "path": "./tsconfig.node.json" }]` but the referenced file was never generated.

**Solution**: CodeGen V2 orchestrator now generates both `tsconfig.json` and `tsconfig.node.json` as part of config file generation.

**Files**: `server/modules/codegen-orchestrator.ts`

---

### Problem: Toast System Mismatch Causes Auto-Runner Patching

**Symptoms**: Auto-runner's pre-flight check detects toast files don't match expected format, triggers patching that can break other generated code.

**Root Cause**: The auto-runner has a `CRITICAL_UI_FILES` list with expected file contents. Generated toast files used Radix Toast primitives instead of the standalone pattern the auto-runner expects.

**Solution**: 
- Toast files (`use-toast.ts`, `toaster.tsx`) now exactly match the auto-runner's expected format
- Use `// @generated` marker that auto-runner recognizes
- Self-contained global state (no Radix dependency in toast)
- Standalone `toast` export for direct use without hooks

**Files**: `server/modules/codegen-orchestrator.ts`, `client/src/lib/code-runner/auto-runner.ts`

---

### Problem: npm Re-downloads Packages That Were Pre-warmed

**Symptoms**: Even with pre-warm complete, `npm install` during auto-run downloads packages again, taking extra time.

**Root Cause**: Package versions in generated `package.json` didn't exactly match pre-warmed versions. npm resolves them as different packages and re-downloads.

**Solution**: Synced `AVAILABLE_DEPS` and `DEV_DEPS` in the code generation modules to use the exact same version strings as `PREWARM_BATCHES` in `webcontainer.ts`.

**Files**: `server/modules/codegen-orchestrator.ts`, `client/src/lib/code-runner/webcontainer.ts`

---

### Problem: Pipeline Crashes on Null plan.entities

**Symptoms**: `TypeError: Cannot read properties of null (reading 'map')` during code generation.

**Root Cause**: Some conversation flows produce plans without an `entities` array (e.g., simple utility apps). The pipeline assumed `plan.entities` was always present.

**Solution**: Added null safety (`plan.entities || []`) throughout `plan-driven-generator.ts` and `pipeline-orchestrator.ts`.

**Files**: `server/modules/plan-driven-generator.ts`, `server/modules/pipeline-orchestrator.ts`

---

### Problem: 40-Batch Pre-warm Takes Too Long

**Symptoms**: Pre-warming 140 packages via 40 sequential batches takes 10-15 minutes because each batch rewrites the cumulative `package.json` and runs full npm resolution.

**Root Cause**: The cumulative approach means batch 40 resolves all 140 packages even though batches 1-39 already resolved most of them. Each npm run has fixed overhead (tree building, lock file, node_modules scan).

**Solution**: Consolidated 40 batches into 4 tiered batches (core, ui, server, extras). npm resolution runs 4 times instead of 40, eliminating 36 redundant passes.

**Files**: `client/src/lib/code-runner/webcontainer.ts`

---

### Problem: Native Binary Packages Crash WebContainer

**Symptoms**: npm install fails with compilation errors for packages like `sharp`, `better-sqlite3`, `bull`, `ioredis`.

**Root Cause**: These packages require native C/C++ compilation (node-gyp) which WebContainer doesn't support.

**Solution**: Removed these packages from `PREWARM_BATCHES`. They're still available in Electron mode via native npm.

**Files**: `client/src/lib/code-runner/webcontainer.ts`

---

### Problem: Generated Imports Reference Non-existent Files

**Symptoms**: Runtime error `Module not found: Can't resolve './components/ui/data-table'`.

**Root Cause**: CodeGen V2 page builder imports components that the component library declares but the orchestrator didn't include in the output files.

**Solution**: The validator (`codegen-validator.ts`) now traces every import chain, generates stubs for missing files, and ensures all cross-file references resolve. The `validateAndFix` function in the pipeline performs multi-pass correction.

**Files**: `server/modules/codegen-validator.ts`, `server/modules/pipeline-orchestrator.ts`

---

### Problem: Large package.json Fails in WebContainer

**Symptoms**: Writing `package.json` fails or npm install stalls for generated projects with many dependencies.

**Root Cause**: WebContainer has a file size limit for write operations. Projects with 100+ dependencies can exceed the safe threshold.

**Solution**: Auto-runner detects large `package.json` (>15KB) and switches to a batched install strategy: write a minimal `package.json` first, then install additional dependencies in separate npm runs.

**Files**: `client/src/lib/code-runner/auto-runner.ts`

---

## Debugging Tips

### Check Pre-warm Status
Open browser DevTools console and look for lines starting with `PreWarm`. The structured logger shows timestamps, timers, and detailed npm output.

### Check Generated Files
Use `GET /api/conversations/:id/files` to inspect all generated files for a conversation.

### Run CodeGen V2 Tests
```bash
npx tsx -e "import { runAllTests } from './server/modules/codegen-e2e-test'; console.log(runAllTests().summary);"
```
This runs all 3 e2e scenarios (Hospital, E-commerce, Project Manager) and reports errors/warnings.

### Check Pipeline Execution
Use `GET /api/conversations/:id/transparency` to see the full pipeline execution report with stage timings, quality scores, and decisions.

### Check Learning Engine
Use `GET /api/learning/stats` to see how many patterns, preferences, and outcomes the learning engine has recorded.
