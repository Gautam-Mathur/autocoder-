# Tester's Guide

## Testing Infrastructure

AutoCoder has multiple layers of testing to ensure generated code is correct and functional.

## CodeGen V2 End-to-End Tests

The primary test suite validates that the CodeGen V2 engine produces correct, complete applications across different domains.

### Running Tests

```bash
npx tsx -e "import { runAllTests } from './server/modules/codegen-e2e-test'; console.log(runAllTests().summary);"
```

### Test Scenarios

Three comprehensive scenarios test different domains and complexity levels:

#### 1. Hospital Management System
Tests healthcare domain with complex entity relationships:
- **Entities**: Patients, Doctors, Appointments, Departments
- **Relationships**: Doctor belongs to Department, Appointment links Patient + Doctor
- **UI Patterns**: Table views, appointment calendar, department dashboard
- **Expected Files**: ~40 files (schema, API routes, pages, components, config)

#### 2. E-Commerce Store
Tests retail domain with product catalog and order management:
- **Entities**: Products, Orders, Categories, Customers
- **Relationships**: Product belongs to Category, Order has many Products
- **UI Patterns**: Card grid for products, table for orders, dashboard for stats
- **Expected Files**: ~38 files

#### 3. Project Manager
Tests project management domain with task tracking:
- **Entities**: Projects, Tasks, Team Members, Milestones
- **Relationships**: Task belongs to Project + Team Member
- **UI Patterns**: Kanban board for tasks, table for projects, member cards
- **Expected Files**: ~38 files

### What Tests Validate

For each scenario, the test suite checks:

| Check | Description |
|-------|-------------|
| **File count** | Minimum expected files are generated |
| **Required files** | `package.json`, `tsconfig.json`, `vite.config.ts`, `tailwind.config.ts` exist |
| **Schema file** | Contains all entity table definitions with correct field types |
| **API routes** | CRUD endpoints exist for each entity |
| **Page files** | Each entity has a corresponding page component |
| **Import resolution** | All imports reference files that exist in the output |
| **Package dependencies** | All imported npm packages are in `package.json` |
| **TypeScript compatibility** | No obvious type errors in generated code |
| **Cross-file consistency** | Exports match imports, routes match API calls |

### Test Output Format

```
=== Running CodeGen V2 End-to-End Tests ===

Running: Hospital Management System...
  PASS — 40 files

Running: E-Commerce Store...
  PASS — 38 files

Running: Project Manager...
  PASS — 38 files

=== Summary ===
PASS Hospital Management System: 40 files, 0 errors, 0 warnings
PASS E-Commerce Store: 38 files, 0 errors, 0 warnings
PASS Project Manager: 38 files, 0 errors, 0 warnings

Overall: ALL TESTS PASSED
```

If a test fails, you'll see specific error details:
```
FAIL Hospital Management System: 40 files, 2 errors, 1 warning
  ERROR: Missing import: ./components/ui/data-table in src/pages/patients.tsx
  ERROR: Package not in package.json: @tanstack/react-table
  WARNING: Unused export: PatientCard in src/components/patient-card.tsx
```

## Validation System (codegen-validator.ts)

The validator performs multi-pass checks on generated file sets:

### Error Types

| Type | Severity | Description |
|------|----------|-------------|
| `missing-import` | Error | File imports a module that doesn't exist |
| `missing-component` | Error | JSX references a component not defined or imported |
| `missing-route` | Error | Frontend calls an API route not defined in the server |
| `missing-package` | Error | Code imports an npm package not in `package.json` |
| `broken-reference` | Warning | Cross-file reference that may not resolve |
| `missing-file` | Error | A required file (config, schema) is absent |

### Auto-Fix Capabilities

The `validateAndFix` function attempts to automatically resolve:

1. **Missing imports**: Generates stub files with expected exports
2. **Missing default exports**: Adds default exports to files that need them
3. **Incorrect relative paths**: Corrects `../` depth miscalculations
4. **Missing packages**: Adds missing packages to `package.json` dependencies

### Running Validation Manually

The validator is automatically invoked as Stage 15 of the pipeline. You can also run it programmatically:

```typescript
import { validateFiles } from './server/modules/codegen-validator';

const result = validateFiles(fileMap);
console.log(`Errors: ${result.errors.length}, Warnings: ${result.warnings.length}`);
result.errors.forEach(e => console.log(`  ${e.type}: ${e.message} in ${e.file}`));
```

## Pre-warm Testing

### Verifying Pre-warm Health

Open browser DevTools console and look for structured log entries:

```
PreWarm [installing] React essentials (1/4) — 21 packages... 15%
PreWarm [installing] UI components (2/4) — 35 packages... 48%
PreWarm [installing] Server & utilities (3/4) — 27 packages... 71%
PreWarm [installing] Extended libraries (4/4) — 57 packages... 100%
PreWarm [ready] All 140 packages cached — 100%
```

### Verifying Package Coverage

To check that all packages used by CodeGen V2 are in the pre-warm cache:

1. Run an e2e test to generate a file set
2. Extract all dependencies from the generated `package.json`
3. Compare against `CORE_PACKAGES` from `webcontainer.ts`

Any package in the generated output but not in `CORE_PACKAGES` will need an on-demand install.

## Pipeline Testing

### Transparency Report

After generation, fetch the transparency report to see pipeline execution details:

```
GET /api/conversations/:id/transparency
```

This returns:
- Stage-by-stage execution times
- Quality gate scores (0-100)
- Warnings generated at each stage
- Decisions made by the pipeline

### Quality Gates

Each pipeline stage has a quality gate with a minimum score:
- **Critical stages** (understanding, planning, architecture): Minimum 60/100
- **Non-critical stages** (learning, recording): Minimum 40/100

If a critical stage scores below its threshold, the pipeline aborts. Non-critical stages continue with warnings.

## Testing Checklist for New Features

When adding or modifying CodeGen V2 modules:

- [ ] Run all 3 e2e tests — all must pass with 0 errors
- [ ] Check that new components declare their npm dependencies
- [ ] Verify field resolver maps new field types correctly
- [ ] Confirm page builder handles entities with 0, 1, and 10+ fields
- [ ] Test with entities that have no status field (Table fallback)
- [ ] Test with entities that have date fields (Calendar pattern)
- [ ] Verify generated package versions match `PREWARM_BATCHES`
- [ ] Check that validator catches intentionally broken imports

## Testing the Learning Engine

```
GET /api/learning/stats
```

Returns:
```json
{
  "patterns": 1128,
  "preferences": 2,
  "outcomes": 45,
  "lastUpdated": "2026-02-19T10:00:00Z"
}
```

Export and import learning data for backup:
```
GET /api/learning/export    # Download learning data
POST /api/learning/import   # Upload learning data
POST /api/learning/save     # Save to learning-data.json
```
