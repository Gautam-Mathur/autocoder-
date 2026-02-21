# Tester's Guide

This document covers AutoCoder's comprehensive testing infrastructure, including the 116,000-iteration stress testing framework, CodeGen V2 end-to-end tests, validation systems, learning engine verification, and quality gate monitoring.

---

## Testing Overview

| Test Type | Iterations | Pass Rate | Coverage |
|-----------|-----------|-----------|----------|
| Main Pipeline Stress Test | 10,000 | 100% | Full 16-stage pipeline |
| Design System Engine | 2,000 | 100% | 7 categories |
| Architecture Planner | 2,000 | 100% | 7 categories |
| Functionality Engine | 2,000 | 100% | 7 categories |
| Schema Engine | 10,000 | 100% | Table schemas, columns, types, keys |
| API Design Engine | 10,000 | 100% | Routes, middleware, validation |
| Component Composition | 10,000 | 100% | Component trees, accessibility |
| Code Quality Engine | 10,000 | 100% | Quality scoring, issues |
| Dependency Resolution | 10,000 | 100% | Package resolution, security |
| Domain Synthesis | 10,000 | 100% | Domain detection, entity extraction |
| Adaptive Clarification | 10,000 | 100% | Complexity assessment, questions |
| Test Generation | 10,000 | 100% | Test files, assertions |
| Deep Understanding | 10,000 | 100% | Intent decomposition, entities |
| Plan Generator | 10,000 | 100% | Plans, entities, endpoints |
| **Total** | **116,000** | **100%** | **All 13 AI modules + pipeline** |

---

## CodeGen V2 End-to-End Tests

The primary test suite validates that the CodeGen V2 engine produces correct, complete applications across different domains.

### Running Tests

```bash
npx tsx -e "import { runAllTests } from './server/modules/codegen-e2e-test'; console.log(runAllTests().summary);"
```

Or via API:
```
GET /api/codegen-v2/test
```

### Test Scenarios

Three comprehensive scenarios test different domains and complexity levels:

#### 1. Hospital Management System
Tests healthcare domain with complex entity relationships:
- **Entities**: Patients (name, email, dateOfBirth, insurance, status), Doctors (name, specialization, department, schedule), Appointments (patient, doctor, date, time, status, notes), Departments (name, head, floor, budget)
- **Relationships**: Doctor belongs to Department, Appointment links Patient + Doctor
- **UI Patterns**: Table views for patients/doctors, appointment calendar, department dashboard
- **Expected Files**: ~40 files (schema, API routes, pages, components, config)
- **Validates**: Foreign key generation, date field handling, status badge rendering

#### 2. E-Commerce Store
Tests retail domain with product catalog and order management:
- **Entities**: Products (name, price, description, image, category, stock), Orders (customer, items, total, status, shippingAddress), Categories (name, description, parent), Customers (name, email, address, orderCount)
- **Relationships**: Product belongs to Category, Order has many Products
- **UI Patterns**: Card grid for products, table for orders, dashboard for stats
- **Expected Files**: ~38 files
- **Validates**: Currency formatting, image handling, nested relationships

#### 3. Project Manager
Tests project management domain with task tracking:
- **Entities**: Projects (name, description, status, startDate, endDate), Tasks (title, description, status, priority, assignee, dueDate), Team Members (name, email, role, avatar), Milestones (name, date, status)
- **Relationships**: Task belongs to Project + Team Member
- **UI Patterns**: Kanban board for tasks, table for projects, member card grid
- **Expected Files**: ~38 files
- **Validates**: Status-based Kanban, drag-and-drop, priority color-coding

### What Tests Validate

For each scenario, the test suite performs these checks:

| Check | What It Verifies | Severity |
|-------|-----------------|----------|
| **File count** | Minimum expected files are generated | Error |
| **Required files** | `package.json`, `tsconfig.json`, `vite.config.ts`, `tailwind.config.ts` exist | Error |
| **Schema file** | Contains all entity table definitions with correct Drizzle column types | Error |
| **API routes** | CRUD endpoints (GET, POST, PUT, DELETE) exist for each entity | Error |
| **Page files** | Each entity has a corresponding page component in `src/pages/` | Error |
| **Import resolution** | All `import` statements reference files that exist in the output | Error |
| **Package dependencies** | All imported npm packages are listed in `package.json` | Error |
| **TypeScript compatibility** | No obvious type errors (e.g., missing generics, wrong argument counts) | Warning |
| **Cross-file consistency** | Exports in module A match imports in module B | Warning |
| **Route-API mapping** | Frontend API calls match backend route definitions | Warning |

### Test Output

**Passing output**:
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

**Failing output**:
```
FAIL Hospital Management System: 40 files, 2 errors, 1 warning
  ERROR: Missing import: ./components/ui/data-table in src/pages/patients.tsx
  ERROR: Package not in package.json: @tanstack/react-table
  WARNING: Unused export: PatientCard in src/components/patient-card.tsx
```

---

## Stress Testing Framework

### Main Pipeline Stress Test (10,000 iterations)

Tests the complete 16-stage pipeline with diverse application descriptions.

**Script**: `scripts/scripts/mega-stress-test.ts`

**Running**:
```bash
npx tsx scripts/scripts/mega-stress-test.ts
```

**What it tests**:
- Full pipeline execution from description to generated files
- All 16 stages complete without errors
- Quality gates pass (critical stages score 60+, non-critical 40+)
- Learning engine records outcomes correctly
- Error recovery works (pipeline degrades gracefully on non-critical failures)

**Test categories**:
1. Simple CRUD apps (todo, notes, contacts)
2. Complex multi-entity systems (hospital, ERP, CRM)
3. Domain-specific apps (restaurant POS, gym management)
4. Edge cases (single entity, 20+ entities, no relationships)
5. Unusual requests (creative prompts, ambiguous descriptions)

### Module-Level Stress Tests (2,000 iterations each)

Tests three core AI modules independently.

**Script**: `scripts/scripts/module-stress-tests.ts`

**Running**:
```bash
# Run all three
MODULE=all npx tsx scripts/scripts/module-stress-tests.ts

# Run individually
MODULE=design npx tsx scripts/scripts/module-stress-tests.ts
MODULE=architecture npx tsx scripts/scripts/module-stress-tests.ts
MODULE=functionality npx tsx scripts/scripts/module-stress-tests.ts
```

#### Design System Engine (2,000 iterations)

**Validates across 7 categories**:

| Category | Test Count | What It Validates |
|----------|-----------|-------------------|
| domain-mood | ~286 | Design tokens match domain + mood (e.g., healthcare+professional) |
| color-request | ~286 | Color palette satisfies explicit color requests |
| novel-mood | ~286 | Unusual mood combinations produce valid tokens |
| feature-heavy | ~286 | Feature-rich apps get appropriate visual weight |
| multi-adj | ~286 | Multiple adjective descriptions (modern, minimal, bold) |
| industry-specific | ~286 | Industry-appropriate design (medical blues, financial greens) |
| scale-based | ~284 | Different app scales (startup vs enterprise) get appropriate design |

**Fields validated per iteration**:
- All token fields present (colors, typography, spacing, shadows, borders, animations)
- Color scales have proper shades (50-950)
- Gradients are valid CSS
- Shadows follow elevation system
- Typography includes all sizes (xs through 6xl)
- Animations include durations and easing
- Tailwind config is valid
- CSS output compiles

#### Architecture Planner (2,000 iterations)

**Validates across 7 categories**:

| Category | What It Tests |
|----------|--------------|
| complexity-varied | Simple to complex app architectures |
| auth-focused | Apps requiring authentication patterns |
| enterprise | Enterprise-grade architecture decisions |
| novel-arch | Unusual architecture requirements |
| multi-page | Multi-page application structures |
| complex-specific | Specific complex features (real-time, file upload) |
| simple | Minimal single-page apps |

**Fields validated per iteration**:
- App pattern selection (SPA, MPA, dashboard, etc.)
- Folder structure completeness
- State management choice (TanStack Query, Zustand, etc.)
- Auth pattern (session, JWT, OAuth)
- Data flow architecture
- Performance strategy
- Error handling approach
- Routing configuration

#### Functionality Engine (2,000 iterations)

**Validates across 7 categories**:

| Category | What It Tests |
|----------|--------------|
| feature-combo | Mixed feature combinations |
| crud-heavy | CRUD-intensive applications |
| novel-features | Unusual feature requirements |
| interactive-heavy | Highly interactive UIs |
| analytics-heavy | Data-heavy with reporting |
| domain-specific | Domain-specific features |
| minimal | Minimal feature sets |

**Fields validated per iteration**:
- Entity feature specs with correct CRUD types
- Page feature specs (list, detail, form, dashboard)
- Global features (auth, notifications, search)
- Required components with types
- All feature types validated (create, read, update, delete, list, search, filter, sort, export)
- Interactive feature types (drag-drop, real-time, charts)
- Display feature types (table, card, kanban, calendar)
- Automation feature types (email, webhook, scheduler)

### Extended Module Stress Tests (10,000 iterations each)

Tests all 10 remaining AI modules independently.

**Script**: `scripts/scripts/extended-module-stress-tests.ts`

**Running**:
```bash
# Run all 10 modules
MODULE=all npx tsx scripts/scripts/extended-module-stress-tests.ts

# Run individually
MODULE=schema npx tsx scripts/scripts/extended-module-stress-tests.ts
MODULE=api npx tsx scripts/scripts/extended-module-stress-tests.ts
MODULE=component npx tsx scripts/scripts/extended-module-stress-tests.ts
MODULE=quality npx tsx scripts/scripts/extended-module-stress-tests.ts
MODULE=dependency npx tsx scripts/scripts/extended-module-stress-tests.ts
MODULE=domain npx tsx scripts/scripts/extended-module-stress-tests.ts
MODULE=clarification npx tsx scripts/scripts/extended-module-stress-tests.ts
MODULE=testgen npx tsx scripts/scripts/extended-module-stress-tests.ts
MODULE=understanding npx tsx scripts/scripts/extended-module-stress-tests.ts
MODULE=planner npx tsx scripts/scripts/extended-module-stress-tests.ts
```

#### Schema Engine (10,000 iterations)

**Validates**:
- Table schemas with correct column definitions
- Column types (serial, text, integer, decimal, boolean, date, timestamp, enum, json, varchar)
- Primary keys present on all tables
- Foreign keys reference valid tables
- Indexes on frequently queried columns
- Constraints (not null, unique, check)
- Junction tables for many-to-many relationships
- Enum type definitions
- Audit strategy (createdAt, updatedAt, deletedAt)
- Soft delete configuration
- Migration notes

#### API Design Engine (10,000 iterations)

**Validates**:
- Routes with correct HTTP methods (GET, POST, PUT, DELETE, PATCH)
- Route paths follow RESTful conventions (`/api/entity`, `/api/entity/:id`)
- Handler references match entity names
- Entity-operation mapping (e.g., GET `/api/patients` → list patients)
- Middleware chain (auth, validation, rate limiting)
- Error format consistency
- Pagination configuration
- Rate limiting rules
- Request validation schemas
- Response format structure
- Batch operations (bulk create, bulk delete)
- File upload routes when needed

#### Component Composition Engine (10,000 iterations)

**Validates**:
- Component trees with correct hierarchy (type, path, props, state, children)
- Layout components (sidebar, header, main content)
- Context providers (theme, auth, query client)
- Shared hooks (useAuth, useToast, usePagination)
- Accessibility plan (ARIA labels, keyboard navigation, focus management)
- Responsive strategy (breakpoints, mobile layout)
- Animation plan (transitions, loading states)
- Reusability map (shared vs page-specific components)
- Component prop types
- State management integration
- Hook dependencies

#### Code Quality Engine (10,000 iterations)

**Validates**:
- Overall quality score (0-100)
- Grade assignment (A through F)
- Quality categories with individual scores:
  - Code organization
  - Type safety
  - Error handling
  - Performance
  - Accessibility
  - Security
  - Maintainability
- Issues with severity levels (error, warning, info)
- Issue categorization (naming, structure, logic, style)
- File and rule references for each issue
- Warnings and suggested fixes
- Quality metrics (totalFiles, totalLines, avgComplexity)

#### Dependency Resolution Engine (10,000 iterations)

**Validates**:
- Dependencies with name and version (exact versions)
- devDependencies separated correctly
- peerDependencies when applicable
- React and react-dom always present in output
- Bundle size estimates per dependency
- Warnings for large/deprecated packages
- Optimization suggestions (tree-shaking, code splitting)
- Security notes (known vulnerabilities, audit results)
- Version compatibility checks
- Native package exclusion for WebContainer

#### Domain Synthesis Engine (10,000 iterations)

**Validates**:
- Domain detection with name and description
- Confidence score (0-1)
- Matched keywords from input
- Entity extraction with name and fields
- Workflow detection (e.g., "order fulfillment", "patient intake")
- Role extraction (admin, user, manager, etc.)
- Common integrations for the domain
- NLP entity extraction (proper nouns, domain terms)
- Multi-domain detection for hybrid apps

#### Adaptive Clarification Engine (10,000 iterations)

**Validates**:
- Complexity assessment with score and level (simple, moderate, complex, enterprise)
- Complexity factors (entity count, relationship depth, feature count)
- Information gap identification:
  - Category (entities, features, UI, relationships, auth, data)
  - Description of what's missing
  - Severity (critical, important, nice-to-have)
- Clarification questions:
  - Unique ID per question
  - Question text in natural language
  - Category matching the gap
  - Impact assessment (high, medium, low)
- State creation for conversation tracking

#### Test Generation Engine (10,000 iterations)

**Validates**:
- Test file generation with correct paths (`*.test.ts`, `*.spec.ts`)
- Test file content includes proper constructs:
  - `describe` blocks for test groups
  - `test` or `it` blocks for individual tests
  - `expect` assertions
- Config files correctly skipped (won't generate tests for `setup.ts`, `vitest.config.ts`)
- Test coverage for CRUD operations
- API endpoint testing
- Component rendering tests
- Edge case testing (empty data, invalid input)

#### Deep Understanding Engine (10,000 iterations)

**Validates**:
- Intent decomposition:
  - Primary goal extraction
  - Application type classification
  - Key requirements list
- Domain detection:
  - Confidence score (0-1)
  - Matched keywords from description
- Entity extraction:
  - Mentioned entities (explicitly named in description)
  - Inferred entities (implied by domain or relationships)
- Workflow detection (business processes, user flows)
- `readyForPlan` flag (whether enough info to generate a plan)

#### Plan Generator (10,000 iterations)

**Validates**:
- `projectName` derived from description
- `overview` text summarizing the project
- `techStack` array (React, Express, PostgreSQL, etc.)
- `modules` list (auth, dashboard, CRUD, etc.)
- `dataModel` with entities:
  - Entity name and table name
  - Fields with name, type, and required flag
  - Relationships between entities
- `pages` with name and path
- `apiEndpoints` with method, path, and entity
- `workflows` describing business processes
- `roles` (admin, user, etc.)
- `fileBlueprint` with file paths and descriptions

---

## Learning Engine Stress Testing

All stress test results feed into the Generation Learning Engine. After running the full 116,000-iteration suite:

### Verifying Learning Data

**Check stats via API**:
```
GET /api/learning/stats
```
```json
{
  "patterns": 6583,
  "preferences": 3575,
  "outcomes": 182913,
  "lastUpdated": "2026-02-21T04:00:00Z"
}
```

**Check learning data file**:
```bash
node -e "const d=require('./learning-data.json'); console.log('patterns:', d.patterns.length, 'preferences:', d.preferences.length)"
```

**Expected output after full stress testing**:
```
patterns: 6583 preferences: 3575
```

### Learning Data Breakdown

| Pattern Type | Count | Description |
|-------------|-------|-------------|
| entity-structure | 716 | Entity field definitions with types (680 have full fieldTypes) |
| domain-mapping | 3,700 | Domain-to-entity mappings (3,588 have domainId) |
| template-selection | 1,200+ | Template choices by app type |
| generation-outcome | 867+ | Success/failure records |

### Verifying Domain Coverage

All 14 domains should have seeded patterns:
```bash
node -e "
const d = require('./learning-data.json');
const domains = new Set();
d.patterns.forEach(p => {
  if (p.type === 'domain-mapping' && p.data?.domainId) domains.add(p.data.domainId);
});
console.log('Domains:', [...domains].sort().join(', '));
console.log('Count:', domains.size);
"
```

**Expected**: All 14 domains listed (booking, content-management, crm, ecommerce, education, finance, fitness, healthcare, hr, logistics, project-management, real-estate, restaurant, social-media).

### Verifying Field Type Coverage

```bash
node -e "
const d = require('./learning-data.json');
const types = new Set();
d.patterns.forEach(p => {
  if (p.data?.fieldTypes) Object.values(p.data.fieldTypes).forEach(t => types.add(t));
});
console.log('Unique field types:', types.size);
console.log('Types:', [...types].sort().join(', '));
"
```

**Expected**: 228+ unique field types including: serial, text, integer, decimal, boolean, date, timestamp, enum, json, varchar, uuid, float, bigint, smallint, etc.

---

## Validation System (codegen-validator.ts)

### Error Types

| Type | Severity | Description | Auto-fixable? |
|------|----------|-------------|---------------|
| `missing-import` | Error | File imports a module that doesn't exist | Yes — generates stub |
| `missing-component` | Error | JSX references undefined/unimported component | Yes — generates stub |
| `missing-route` | Error | Frontend calls an API route not defined in server | Partial |
| `missing-package` | Error | Code imports npm package not in `package.json` | Yes — adds to deps |
| `missing-file` | Error | A required file (config, schema) is absent | Yes — generates default |
| `broken-reference` | Warning | Cross-file reference that may not resolve at runtime | Sometimes |
| `missing-default-export` | Warning | File imported as default but only has named exports | Yes — adds default |
| `incorrect-path` | Warning | Relative import path depth is wrong | Yes — corrects depth |

### Auto-Fix Process

The `validateAndFix` function runs iteratively:

```
Pass 1: Scan all files for issues
  → Found 3 missing imports, 1 missing package
Pass 2: Generate stubs for missing imports, add package to package.json
  → Fixed 3 missing imports, 1 package
Pass 3: Re-scan to verify fixes and catch secondary issues
  → Found 1 new import from generated stub
Pass 4: Fix secondary issue
  → All clear
Pass 5: Final verification
  → 0 errors, 0 warnings — PASS
```

Maximum iterations: 10 (prevents infinite fix loops).

### Running Validation Manually

```typescript
import { validateFiles } from './server/modules/codegen-validator';

const result = validateFiles(fileMap);
console.log(`Errors: ${result.errors.length}, Warnings: ${result.warnings.length}`);
result.errors.forEach(e => console.log(`  ${e.type}: ${e.message} in ${e.file}`));
```

---

## Pipeline Quality Gates

### Quality Scores

Each pipeline stage produces a quality score (0-100):

| Stage Type | Minimum Score | Effect of Below-Threshold |
|-----------|--------------|---------------------------|
| Critical (stages 1,2,4,5,6,7,8) | 60 | Pipeline aborts with error |
| Non-critical (stages 3,9-16) | 40 | Pipeline continues with warning |

### Monitoring Quality

**Transparency report** (per conversation):
```
GET /api/conversations/:id/transparency
```

Returns:
```json
{
  "stages": [
    {
      "name": "Product Manager",
      "stage": 1,
      "duration": 234,
      "qualityScore": 85,
      "warnings": [],
      "decisions": ["Identified 4 entities", "Detected healthcare domain"]
    },
    ...
  ],
  "totalDuration": 4567,
  "overallQuality": 82,
  "errors": [],
  "warnings": ["Stage 14 (Test Generation) scored 45 — below threshold"]
}
```

---

## Pre-warm Testing

### Verifying Pre-warm Health

Open browser DevTools console (F12) and search for "PreWarm":

```
PreWarm [installing] React essentials (1/4) — 21 packages... 15%
PreWarm [installing] UI components (2/4) — 35 packages... 48%
PreWarm [installing] Server & utilities (3/4) — 27 packages... 71%
PreWarm [installing] Extended libraries (4/4) — 57 packages... 100%
PreWarm [ready] All 200+ packages cached — 100%
```

### Verifying Package Coverage

To check that all CodeGen V2 packages are in the pre-warm cache:

1. Run an e2e test to generate a file set
2. Extract all dependencies from the generated `package.json`
3. Compare against `PREWARM_BATCHES` in `webcontainer.ts`
4. Any uncovered package will need an on-demand install

---

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
- [ ] Run relevant stress test module to validate changes
- [ ] Verify learning engine records new patterns correctly
- [ ] Check transparency report for quality score regressions

When adding new AI modules:

- [ ] Add stress test cases in `extended-module-stress-tests.ts`
- [ ] Run 10,000+ iterations with 100% pass rate target
- [ ] Verify all output fields are present and correctly typed
- [ ] Test edge cases (empty input, minimal input, maximum input)
- [ ] Confirm learning engine integration (outcomes recorded)
- [ ] Update documentation with new module details

---

## Export and Backup Learning Data

### Export
```
GET /api/learning/export
```
Downloads the complete learning data as JSON.

### Import
```
POST /api/learning/import
```
Upload learning data JSON to restore from backup.

### Save to File
```
POST /api/learning/save
```
Writes current in-memory learning data to `learning-data.json`.

### Verify Integrity
```bash
node -e "
const d = require('./learning-data.json');
const reliable = d.patterns.filter(p => p.reliability > 0.5).length;
console.log('Total:', d.patterns.length);
console.log('Reliable:', reliable);
console.log('Reliability:', (reliable / d.patterns.length * 100).toFixed(1) + '%');
"
```

**Expected**: 6,461 reliable out of 6,583 total (98.1%).
