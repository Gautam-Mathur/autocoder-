import { analyzeRequest } from '../modules/deep-understanding-engine.js';
import { generatePlan } from '../modules/plan-generator.js';
import { analyzeSemantics, type ReasoningResult } from '../modules/contextual-reasoning-engine.js';
import { generateProjectFromPlan } from '../modules/plan-driven-generator.js';
import { validateAndFix } from '../modules/post-generation-validator.js';

interface TestCase {
  name: string;
  prompt: string;
  expectedEntities: string[];
  semanticFields: { field: string; inputType: string }[];
  expectWorkflow: boolean;
}

const TEST_CASES: TestCase[] = [
  {
    name: 'Veterinary Clinic',
    prompt: 'Build a veterinary clinic management system with patients (animals), owners, appointments, medical records, vaccinations, prescriptions, and billing.',
    expectedEntities: ['patient', 'appointment', 'bill'],
    semanticFields: [
      { field: 'email', inputType: 'email' },
      { field: 'phone', inputType: 'tel' },
      { field: 'date', inputType: 'date' },
    ],
    expectWorkflow: true,
  },
  {
    name: 'Invoice Generator',
    prompt: 'Create an invoice generator with clients, line items, tax calculation, and payment status tracking.',
    expectedEntities: ['client', 'invoice'],
    semanticFields: [
      { field: 'amount', inputType: 'currency' },
      { field: 'email', inputType: 'email' },
      { field: 'date', inputType: 'date' },
    ],
    expectWorkflow: true,
  },
  {
    name: 'Recipe Manager',
    prompt: 'Build a recipe manager where users can save recipes with ingredients, steps, cooking time, and categories. Include a shopping list generator.',
    expectedEntities: ['recipe'],
    semanticFields: [
      { field: 'description', inputType: 'textarea' },
    ],
    expectWorkflow: false,
  },
  {
    name: 'Project Board',
    prompt: 'Build a project board with tasks, assignees, due dates, priorities, and kanban columns.',
    expectedEntities: ['task'],
    semanticFields: [
      { field: 'date', inputType: 'date' },
    ],
    expectWorkflow: true,
  },
  {
    name: 'Freelancer Platform',
    prompt: 'Build a freelancer portfolio and invoicing platform with projects, clients, time tracking, invoices, payments, and a public portfolio page.',
    expectedEntities: ['project', 'client', 'invoice'],
    semanticFields: [
      { field: 'email', inputType: 'email' },
      { field: 'phone', inputType: 'tel' },
      { field: 'amount', inputType: 'currency' },
      { field: 'date', inputType: 'date' },
    ],
    expectWorkflow: true,
  },
];

function toKebabCase(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

function toSnakeCase(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
}

interface CheckResult {
  name: string;
  passed: boolean;
  detail: string;
  severity: 'critical' | 'major' | 'minor';
}

interface EntityCodeGenReport {
  entity: string;
  checks: CheckResult[];
  score: number;
  maxScore: number;
}

interface AppCodeGenReport {
  name: string;
  entities: EntityCodeGenReport[];
  globalChecks: CheckResult[];
  totalScore: number;
  maxTotalScore: number;
  percentage: number;
  fileCount: number;
  genTimeMs: number;
}

function checkEntityCodeGen(
  entityName: string,
  plan: any,
  files: any[],
  reasoning: ReasoningResult | null,
): EntityCodeGenReport {
  const checks: CheckResult[] = [];
  const entity = plan.dataModel.find((e: any) => e.name === entityName);
  if (!entity) {
    return { entity: entityName, checks: [{ name: 'Entity exists in plan', passed: false, detail: 'Not found in data model', severity: 'critical' }], score: 0, maxScore: 1 };
  }

  const kebab = toKebabCase(entityName);
  const snake = toSnakeCase(entityName);
  const lower = entityName.toLowerCase();

  const schemaFile = files.find(f => f.path.includes('schema'));
  const routesFile = files.find(f => f.path.includes('routes'));
  const pageFiles = files.filter(f => f.path.match(/pages\/.*\.tsx$/));
  const entityPage = pageFiles.find(f => {
    const content = f.content.toLowerCase();
    const pathLower = f.path.toLowerCase();
    return content.includes(`/api/${kebab}s`) || content.includes(`/api/${lower}s`) || pathLower.includes(kebab) || pathLower.includes(lower);
  });
  const detailPage = pageFiles.find(f => {
    const pathLower = f.path.toLowerCase();
    return pathLower.includes(`${kebab}-detail`) || pathLower.includes(`${lower}-detail`);
  });

  // --- SCHEMA CHECKS ---
  const schemaContent = schemaFile?.content || '';
  const hasTable = schemaContent.includes(`pgTable("${snake}s"`) || schemaContent.includes(`pgTable("${lower}s"`);
  checks.push({
    name: 'Schema table',
    passed: hasTable,
    detail: hasTable ? `pgTable("${snake}s") found` : `No pgTable for ${entityName}`,
    severity: 'critical',
  });

  const entityFields = entity.fields.filter((f: any) => f.name !== 'id' && f.name !== 'createdAt');
  const fieldsInSchema = entityFields.filter((f: any) => {
    const col = toSnakeCase(f.name);
    return schemaContent.includes(`"${col}"`) || schemaContent.includes(`"${f.name}"`);
  });
  const fieldRatio = entityFields.length > 0 ? fieldsInSchema.length / entityFields.length : 0;
  checks.push({
    name: 'Schema field completeness',
    passed: fieldRatio >= 0.7,
    detail: `${fieldsInSchema.length}/${entityFields.length} fields in schema (${Math.round(fieldRatio * 100)}%)`,
    severity: fieldRatio >= 0.5 ? 'major' : 'critical',
  });

  const hasInsertSchema = schemaContent.includes(`insert${entityName}Schema`);
  checks.push({
    name: 'Zod insert schema',
    passed: hasInsertSchema,
    detail: hasInsertSchema ? `insert${entityName}Schema exported` : 'Missing insert schema for validation',
    severity: 'major',
  });

  // --- ROUTE CHECKS ---
  const routesContent = routesFile?.content || '';
  const basePath = `/api/${kebab}s`;
  const altPath = `/api/${lower}s`;

  const hasGetAll = routesContent.includes(`"${basePath}"`) || routesContent.includes(`"${altPath}"`);
  const hasGetOne = routesContent.includes(`"${basePath}/:id"`) || routesContent.includes(`"${altPath}/:id"`);
  const hasPost = routesContent.includes(`app.post("${basePath}"`) || routesContent.includes(`app.post("${altPath}"`);
  const hasPatch = routesContent.includes(`app.patch("${basePath}/:id"`) || routesContent.includes(`app.patch("${altPath}/:id"`);
  const hasDelete = routesContent.includes(`app.delete("${basePath}/:id"`) || routesContent.includes(`app.delete("${altPath}/:id"`);

  const crudRoutes = [
    { name: 'GET all', has: hasGetAll },
    { name: 'GET one', has: hasGetOne },
    { name: 'POST', has: hasPost },
    { name: 'PATCH', has: hasPatch },
    { name: 'DELETE', has: hasDelete },
  ];
  const routeCount = crudRoutes.filter(r => r.has).length;
  const missingRoutes = crudRoutes.filter(r => !r.has).map(r => r.name);
  checks.push({
    name: 'CRUD routes',
    passed: routeCount >= 4,
    detail: `${routeCount}/5 routes (${missingRoutes.length ? 'missing: ' + missingRoutes.join(', ') : 'all present'})`,
    severity: routeCount >= 3 ? 'major' : 'critical',
  });

  const hasValidation = routesContent.includes(`insert${entityName}Schema.safeParse`);
  checks.push({
    name: 'Route validation',
    passed: hasValidation,
    detail: hasValidation ? 'Zod validation on POST' : 'No schema validation on create',
    severity: 'major',
  });

  // --- PAGE/COMPONENT CHECKS ---
  const pageContent = entityPage?.content || '';
  checks.push({
    name: 'List page exists',
    passed: !!entityPage,
    detail: entityPage ? `Found: ${entityPage.path} (${entityPage.content.split('\n').length} lines)` : `No page component for ${entityName}`,
    severity: 'critical',
  });

  if (entityPage) {
    const lineCount = entityPage.content.split('\n').length;
    checks.push({
      name: 'Page not a stub',
      passed: lineCount > 50,
      detail: `${lineCount} lines (${lineCount > 50 ? 'substantial' : 'likely a stub'})`,
      severity: lineCount > 20 ? 'minor' : 'critical',
    });

    const hasFetch = pageContent.includes('useQuery') || pageContent.includes('fetch(');
    checks.push({
      name: 'Data fetching',
      passed: hasFetch,
      detail: hasFetch ? 'useQuery or fetch() found' : 'No data fetching in page',
      severity: 'critical',
    });

    const fetchesCorrectEndpoint = pageContent.includes(`/api/${kebab}s`) || pageContent.includes(`/api/${lower}s`);
    checks.push({
      name: 'Correct API endpoint',
      passed: fetchesCorrectEndpoint,
      detail: fetchesCorrectEndpoint ? `Fetches /api/${kebab}s` : 'Fetches wrong or no endpoint',
      severity: 'critical',
    });

    const hasDeleteCall = pageContent.includes(`DELETE`) || pageContent.includes(`method: 'DELETE'`) || pageContent.includes(`method: "DELETE"`);
    checks.push({
      name: 'Delete operation',
      passed: hasDeleteCall,
      detail: hasDeleteCall ? 'DELETE method found' : 'No delete operation in UI',
      severity: 'major',
    });

    const hasDialogForm = pageContent.includes('Dialog') || pageContent.includes('<form') || pageContent.includes('onSubmit');
    const hasInlineForm = pageContent.includes(`"POST", "/api/${kebab}s"`) || pageContent.includes(`"POST", "/api/${lower}s"`);
    const hasForm = hasDialogForm || hasInlineForm;
    checks.push({
      name: 'Create form',
      passed: hasForm,
      detail: hasForm
        ? (hasDialogForm ? 'Dialog/form for creating items' : 'Inline create form on detail page')
        : 'No create form in UI',
      severity: 'major',
    });

    if (hasForm) {
      const formFields = entityFields.filter((f: any) =>
        f.name !== 'id' && f.name !== 'createdAt' &&
        !f.description?.startsWith('Computed:')
      );
      const fieldsInForm = formFields.filter((f: any) => {
        const capName = f.name.charAt(0).toUpperCase() + f.name.slice(1);
        const variations = [
          f.name,
          `"${f.name}"`,
          `id="${f.name}"`,
          `data-testid="input-${toKebabCase(f.name)}"`,
          `form${capName}`,
          `child${entityName}${capName}`,
        ];
        return variations.some(v => pageContent.includes(v));
      });
      const formRatio = formFields.length > 0 ? fieldsInForm.length / formFields.length : 0;
      checks.push({
        name: 'Form field completeness',
        passed: formRatio >= 0.6,
        detail: `${fieldsInForm.length}/${formFields.length} editable fields in form (${Math.round(formRatio * 100)}%)`,
        severity: formRatio >= 0.4 ? 'major' : 'critical',
      });
    }

    const displayFields = entity.fields.filter((f: any) => f.name !== 'id' && f.name !== 'createdAt').slice(0, 5);
    const columnsInTable = displayFields.filter((f: any) => {
      return pageContent.includes(`item.${f.name}`) || pageContent.includes(`item?.${f.name}`)
        || pageContent.includes(`child.${f.name}`) || pageContent.includes(`child?.${f.name}`);
    });
    const colRatio = displayFields.length > 0 ? columnsInTable.length / displayFields.length : 0;
    checks.push({
      name: 'Table column completeness',
      passed: colRatio >= 0.6,
      detail: `${columnsInTable.length}/${displayFields.length} fields displayed (${Math.round(colRatio * 100)}%)`,
      severity: colRatio >= 0.4 ? 'major' : 'critical',
    });

    const hasPostSubmit = pageContent.includes('"POST"') || pageContent.includes("'POST'");
    checks.push({
      name: 'Form submits POST',
      passed: hasPostSubmit,
      detail: hasPostSubmit ? 'POST request found' : 'No POST submission detected',
      severity: 'major',
    });
  }

  // --- SEMANTIC FORMATTING CHECKS ---
  const allPageContent = pageFiles.map(f => f.content).join('\n');
  const entitySemantics = reasoning?.fieldSemantics.get(entityName) || [];

  const currencyFields = entitySemantics.filter(s => s.inputType === 'currency');
  if (currencyFields.length > 0) {
    const hasCurrencyFormat = allPageContent.includes('Intl.NumberFormat') && allPageContent.includes('currency');
    checks.push({
      name: 'Currency formatting',
      passed: hasCurrencyFormat,
      detail: hasCurrencyFormat
        ? `Intl.NumberFormat with currency for ${currencyFields.map(f => f.fieldName).join(', ')}`
        : `Missing Intl.NumberFormat for currency fields: ${currencyFields.map(f => f.fieldName).join(', ')}`,
      severity: 'major',
    });

    const hasCurrencyInput = pageContent.includes('step="0.01"') || pageContent.includes("step='0.01'");
    checks.push({
      name: 'Currency input precision',
      passed: hasCurrencyInput,
      detail: hasCurrencyInput ? 'step="0.01" found for decimal precision' : 'No decimal step on currency inputs',
      severity: 'minor',
    });
  }

  const dateFields = entitySemantics.filter(s => s.inputType === 'date' || s.inputType === 'datetime');
  if (dateFields.length > 0) {
    const hasDateFormat = allPageContent.includes('toLocaleDateString');
    checks.push({
      name: 'Date formatting',
      passed: hasDateFormat,
      detail: hasDateFormat ? 'toLocaleDateString for date display' : 'Missing date formatting',
      severity: 'major',
    });

    const hasDateInput = pageContent.includes('type="date"') || pageContent.includes('type="datetime-local"');
    checks.push({
      name: 'Date input type',
      passed: hasDateInput,
      detail: hasDateInput ? 'type="date" or type="datetime-local" on input' : 'No date input type',
      severity: 'minor',
    });
  }

  const emailFields = entitySemantics.filter(s => s.inputType === 'email');
  if (emailFields.length > 0) {
    const hasEmailInput = pageContent.includes('type="email"');
    checks.push({
      name: 'Email input type',
      passed: hasEmailInput,
      detail: hasEmailInput ? 'type="email" on input' : 'Missing type="email"',
      severity: 'minor',
    });

    const hasMailto = allPageContent.includes('mailto:');
    checks.push({
      name: 'Email mailto link',
      passed: hasMailto,
      detail: hasMailto ? 'mailto: link for email display' : 'No mailto link',
      severity: 'minor',
    });
  }

  const phoneFields = entitySemantics.filter(s => s.inputType === 'tel');
  if (phoneFields.length > 0) {
    const hasTelInput = pageContent.includes('type="tel"');
    checks.push({
      name: 'Phone input type',
      passed: hasTelInput,
      detail: hasTelInput ? 'type="tel" on input' : 'Missing type="tel"',
      severity: 'minor',
    });
  }

  const textareaFields = entitySemantics.filter(s => s.inputType === 'textarea');
  if (textareaFields.length > 0) {
    const hasTextarea = pageContent.includes('<textarea') || pageContent.includes('Textarea');
    checks.push({
      name: 'Textarea for long text',
      passed: hasTextarea,
      detail: hasTextarea ? 'Textarea element found' : 'No textarea for long text fields',
      severity: 'minor',
    });
  }

  // --- RELATIONSHIP CHECKS ---
  const relationships = reasoning?.relationships.filter(r =>
    r.from === entityName || r.to === entityName
  ) || [];
  if (relationships.length > 0) {
    const fkFields = relationships
      .filter(r => r.to === entityName || r.from === entityName)
      .map(r => {
        const parent = r.to === entityName ? r.from : r.to;
        return `${parent.charAt(0).toLowerCase() + parent.slice(1)}Id`;
      });

    const fksInSchema = fkFields.filter(fk =>
      schemaContent.includes(`"${toSnakeCase(fk)}"`) || schemaContent.includes(`"${fk}"`)
    );
    if (fkFields.length > 0) {
      checks.push({
        name: 'Foreign key fields',
        passed: fksInSchema.length > 0,
        detail: `${fksInSchema.length}/${fkFields.length} FK fields in schema (${fkFields.join(', ')})`,
        severity: 'major',
      });
    }
  }

  // Score
  const weights: Record<string, number> = { critical: 3, major: 2, minor: 1 };
  const maxScore = checks.reduce((s, c) => s + weights[c.severity], 0);
  const score = checks.filter(c => c.passed).reduce((s, c) => s + weights[c.severity], 0);

  return { entity: entityName, checks, score, maxScore };
}

function checkGlobalCodeGen(plan: any, files: any[], reasoning: ReasoningResult | null): CheckResult[] {
  const checks: CheckResult[] = [];

  // Validation
  const validated = validateAndFix(files);
  checks.push({
    name: 'Post-generation validation',
    passed: validated.valid,
    detail: validated.valid
      ? `PASSED (${validated.fixesApplied.length} auto-fixes)`
      : `FAILED with ${validated.issues.length} remaining errors`,
    severity: 'critical',
  });

  // Package.json completeness
  const pkgFile = files.find(f => f.path === 'package.json');
  if (pkgFile) {
    try {
      const pkg = JSON.parse(pkgFile.content);
      const hasDeps = Object.keys(pkg.dependencies || {}).length > 5;
      const hasScripts = pkg.scripts?.dev && pkg.scripts?.build;
      checks.push({
        name: 'package.json dependencies',
        passed: hasDeps,
        detail: `${Object.keys(pkg.dependencies || {}).length} dependencies`,
        severity: 'major',
      });
      checks.push({
        name: 'package.json scripts',
        passed: !!hasScripts,
        detail: hasScripts ? 'dev and build scripts present' : 'Missing dev/build scripts',
        severity: 'major',
      });
    } catch {
      checks.push({ name: 'package.json valid JSON', passed: false, detail: 'Invalid JSON', severity: 'critical' });
    }
  }

  // App.tsx routing
  const appFile = files.find(f => f.path.includes('App.tsx'));
  if (appFile) {
    const routeCount = (appFile.content.match(/<Route /g) || []).length;
    const pageCount = plan.pages.length;
    checks.push({
      name: 'App routing completeness',
      passed: routeCount >= pageCount * 0.7,
      detail: `${routeCount} routes for ${pageCount} pages (${Math.round((routeCount / pageCount) * 100)}%)`,
      severity: 'major',
    });

    const hasNavigation = appFile.content.includes('sidebar') || appFile.content.includes('Sidebar') || appFile.content.includes('nav');
    checks.push({
      name: 'Navigation/sidebar',
      passed: hasNavigation,
      detail: hasNavigation ? 'Sidebar/navigation found' : 'No navigation structure',
      severity: 'major',
    });
  }

  // API-frontend alignment: every fetch call should have a matching route
  const routesContent = files.find(f => f.path.includes('routes'))?.content || '';
  const pageFiles = files.filter(f => f.path.match(/pages\/.*\.tsx$/));
  const allPageContent = pageFiles.map(f => f.content).join('\n');

  const fetchEndpoints = [...allPageContent.matchAll(/fetch\(\s*[`"']([^`"']+)[`"']/g)].map(m => m[1]);
  const fetchApiEndpoints = fetchEndpoints.filter(e => e.startsWith('/api/'));
  const uniqueApis = [...new Set(fetchApiEndpoints.map(e => e.replace(/\/\$\{[^}]+\}/g, '/:id').replace(/\/\d+/g, '/:id')))];

  const matchedApis = uniqueApis.filter(api => {
    const base = api.replace('/:id', '');
    return routesContent.includes(`"${base}"`) || routesContent.includes(`"${api}"`);
  });

  if (uniqueApis.length > 0) {
    const ratio = matchedApis.length / uniqueApis.length;
    checks.push({
      name: 'API-frontend alignment',
      passed: ratio >= 0.8,
      detail: `${matchedApis.length}/${uniqueApis.length} frontend API calls have matching backend routes`,
      severity: 'critical',
    });
  }

  // Import resolution: check that imported files exist
  const allFiles = new Set(files.map(f => f.path));
  let resolvedImports = 0;
  let totalImports = 0;

  for (const pageFile of pageFiles) {
    const imports = [...pageFile.content.matchAll(/from\s+["'](@\/[^"']+)["']/g)];
    for (const imp of imports) {
      totalImports++;
      const importPath = imp[1].replace('@/', 'src/');
      const variations = [
        importPath + '.tsx',
        importPath + '.ts',
        importPath + '/index.tsx',
        importPath + '/index.ts',
      ];
      if (variations.some(v => allFiles.has(v))) {
        resolvedImports++;
      }
    }
  }

  if (totalImports > 0) {
    const ratio = resolvedImports / totalImports;
    checks.push({
      name: 'Import resolution',
      passed: ratio >= 0.8,
      detail: `${resolvedImports}/${totalImports} imports resolve to existing files (${Math.round(ratio * 100)}%)`,
      severity: 'major',
    });
  }

  // Storage interface matches schema
  const storageFile = files.find(f => f.path.includes('storage'));
  if (storageFile) {
    const storageMethods = plan.dataModel.map((e: any) => `getAll${e.name}s`);
    const methodsFound = storageMethods.filter((m: string) => storageFile.content.includes(m));
    const ratio = methodsFound.length / storageMethods.length;
    checks.push({
      name: 'Storage interface completeness',
      passed: ratio >= 0.8,
      detail: `${methodsFound.length}/${storageMethods.length} storage methods (${storageMethods.join(', ')})`,
      severity: 'major',
    });
  }

  // UI component generation
  const uiComponents = ['button', 'card', 'input', 'badge', 'dialog', 'select', 'label', 'textarea'];
  const uiFilesFound = uiComponents.filter(comp => files.some(f => f.path.includes(`ui/${comp}`)));
  checks.push({
    name: 'UI component library',
    passed: uiFilesFound.length >= 6,
    detail: `${uiFilesFound.length}/${uiComponents.length} UI components generated`,
    severity: 'minor',
  });

  // StatusBadge for workflow apps
  const hasWorkflow = plan.workflows && plan.workflows.length > 0;
  if (hasWorkflow) {
    const hasStatusBadge = files.some(f => f.path.includes('status-badge'));
    checks.push({
      name: 'StatusBadge component',
      passed: hasStatusBadge,
      detail: hasStatusBadge ? 'StatusBadge generated for workflow statuses' : 'Missing StatusBadge for workflow app',
      severity: 'minor',
    });
  }

  return checks;
}

function formatBar(pct: number, width: number = 20): string {
  const filled = Math.round((pct / 100) * width);
  return '█'.repeat(filled) + '░'.repeat(width - filled);
}

function gradeLabel(pct: number): string {
  if (pct >= 95) return 'A+';
  if (pct >= 90) return 'A';
  if (pct >= 85) return 'A-';
  if (pct >= 80) return 'B+';
  if (pct >= 75) return 'B';
  if (pct >= 70) return 'B-';
  if (pct >= 65) return 'C+';
  if (pct >= 60) return 'C';
  if (pct >= 50) return 'D';
  return 'F';
}

async function runTest() {
  console.log(`╔${'═'.repeat(74)}╗`);
  console.log(`║${'     CODE GENERATION QUALITY TEST — DEEP VERIFICATION'.padEnd(74)}║`);
  console.log(`╠${'═'.repeat(74)}╣`);
  console.log(`║${'  Tests generated code quality: field completeness, CRUD wiring,'.padEnd(74)}║`);
  console.log(`║${'  semantic formatting, relationship wiring, API alignment'.padEnd(74)}║`);
  console.log(`╚${'═'.repeat(74)}╝`);

  const reports: AppCodeGenReport[] = [];

  for (const testCase of TEST_CASES) {
    console.log(`\n${'═'.repeat(76)}`);
    console.log(`  TEST: ${testCase.name}`);
    console.log(`  PROMPT: "${testCase.prompt.substring(0, 80)}${testCase.prompt.length > 80 ? '...' : ''}"`);
    console.log(`${'─'.repeat(76)}`);

    try {
      const start = Date.now();
      const understanding = analyzeRequest(testCase.prompt);
      const plan = generatePlan(understanding);
      const reasoning = analyzeSemantics(plan);
      const rawFiles = generateProjectFromPlan(plan);
      const validated = validateAndFix(rawFiles);
      const files = validated.files || rawFiles;
      const genTime = Date.now() - start;

      // Per-entity checks
      const entityReports: EntityCodeGenReport[] = [];
      const checkedEntities = new Set<string>();

      for (const entityName of plan.dataModel.map((e: any) => e.name)) {
        if (checkedEntities.has(entityName)) continue;
        checkedEntities.add(entityName);
        const report = checkEntityCodeGen(entityName, plan, files, reasoning);
        entityReports.push(report);
      }

      // Global checks
      const globalChecks = checkGlobalCodeGen(plan, files, reasoning);

      // Print per-entity results
      for (const er of entityReports) {
        const pct = er.maxScore > 0 ? Math.round((er.score / er.maxScore) * 100) : 0;
        console.log(`\n  🔍 ENTITY: ${er.entity} — ${pct}% (${er.score}/${er.maxScore} pts)`);
        for (const c of er.checks) {
          const icon = c.passed ? '✓' : '✗';
          const sev = c.severity === 'critical' ? '!!!' : c.severity === 'major' ? '!!' : '!';
          console.log(`    ${icon} [${sev}] ${c.name}: ${c.detail}`);
        }
      }

      // Print global results
      console.log(`\n  🌐 GLOBAL CHECKS:`);
      const globalWeights: Record<string, number> = { critical: 3, major: 2, minor: 1 };
      let globalScore = 0;
      let globalMax = 0;
      for (const c of globalChecks) {
        const icon = c.passed ? '✓' : '✗';
        console.log(`    ${icon} ${c.name}: ${c.detail}`);
        globalMax += globalWeights[c.severity];
        if (c.passed) globalScore += globalWeights[c.severity];
      }

      // Totals
      const entityScore = entityReports.reduce((s, r) => s + r.score, 0);
      const entityMax = entityReports.reduce((s, r) => s + r.maxScore, 0);
      const totalScore = entityScore + globalScore;
      const totalMax = entityMax + globalMax;
      const pct = totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0;

      // Issue summary
      const allChecks = [...entityReports.flatMap(r => r.checks), ...globalChecks];
      const criticalFails = allChecks.filter(c => !c.passed && c.severity === 'critical');
      const majorFails = allChecks.filter(c => !c.passed && c.severity === 'major');
      const minorFails = allChecks.filter(c => !c.passed && c.severity === 'minor');

      console.log(`\n  ── SCORE: ${pct}% (${totalScore}/${totalMax} pts) | Grade: ${gradeLabel(pct)} | ${files.length} files in ${genTime}ms`);
      if (criticalFails.length > 0) {
        console.log(`  ⛔ ${criticalFails.length} CRITICAL: ${criticalFails.map(c => c.name).join(', ')}`);
      }
      if (majorFails.length > 0) {
        console.log(`  ⚠️  ${majorFails.length} MAJOR: ${majorFails.map(c => c.name).join(', ')}`);
      }
      if (minorFails.length > 0) {
        console.log(`  ℹ️  ${minorFails.length} MINOR: ${minorFails.map(c => c.name).join(', ')}`);
      }

      reports.push({
        name: testCase.name,
        entities: entityReports,
        globalChecks,
        totalScore,
        maxTotalScore: totalMax,
        percentage: pct,
        fileCount: files.length,
        genTimeMs: genTime,
      });
    } catch (err: any) {
      console.log(`\n  ❌ CRASHED: ${err.message}`);
      reports.push({
        name: testCase.name,
        entities: [],
        globalChecks: [],
        totalScore: 0,
        maxTotalScore: 1,
        percentage: 0,
        fileCount: 0,
        genTimeMs: 0,
      });
    }
  }

  // Final scorecard
  console.log(`\n╔${'═'.repeat(74)}╗`);
  console.log(`║${'                     FINAL CODE GENERATION SCORECARD'.padEnd(74)}║`);
  console.log(`╠${'═'.repeat(74)}╣`);

  let totalAll = 0;
  let maxAll = 0;

  for (const r of reports) {
    totalAll += r.totalScore;
    maxAll += r.maxTotalScore;

    const bar = formatBar(r.percentage);
    const grade = gradeLabel(r.percentage);
    const entityScores = r.entities.map(e => {
      const p = e.maxScore > 0 ? Math.round((e.score / e.maxScore) * 100) : 0;
      return `${e.entity}:${p}%`;
    }).join(' | ');

    console.log(`║  ${r.name.padEnd(22)} ${bar}  ${String(r.percentage).padStart(3)}% ${grade.padStart(2)}  ║`);
    console.log(`║    ${entityScores.padEnd(70)}║`);
  }

  const overallPct = maxAll > 0 ? Math.round((totalAll / maxAll) * 100) : 0;
  console.log(`╠${'═'.repeat(74)}╣`);
  console.log(`║  CODE GENERATION QUALITY: ${overallPct}% (${totalAll}/${maxAll} pts) — Grade: ${gradeLabel(overallPct)}${' '.repeat(74 - 42 - String(overallPct).length - String(totalAll).length - String(maxAll).length - gradeLabel(overallPct).length)}║`);

  // Category breakdown
  const allEntityChecks = reports.flatMap(r => r.entities.flatMap(e => e.checks));
  const allGlobalChecks = reports.flatMap(r => r.globalChecks);
  const allChecks = [...allEntityChecks, ...allGlobalChecks];

  const categories: Record<string, { passed: number; total: number }> = {};
  for (const c of allChecks) {
    const cat = c.name.includes('Schema') ? 'Schema' :
      c.name.includes('Route') || c.name.includes('CRUD') ? 'Routes/CRUD' :
      c.name.includes('form') || c.name.includes('Form') || c.name.includes('Page') || c.name.includes('Table') || c.name.includes('stub') ? 'UI/Pages' :
      c.name.includes('Currency') || c.name.includes('Date') || c.name.includes('Email') || c.name.includes('Phone') || c.name.includes('Textarea') || c.name.includes('mailto') ? 'Semantic' :
      c.name.includes('Foreign') || c.name.includes('relationship') ? 'Relationships' :
      'Infrastructure';

    if (!categories[cat]) categories[cat] = { passed: 0, total: 0 };
    categories[cat].total++;
    if (c.passed) categories[cat].passed++;
  }

  console.log(`║${''.padEnd(74)}║`);
  console.log(`║  CATEGORY BREAKDOWN:${' '.repeat(54)}║`);
  for (const [cat, { passed, total }] of Object.entries(categories)) {
    const catPct = total > 0 ? Math.round((passed / total) * 100) : 0;
    const catBar = formatBar(catPct, 12);
    console.log(`║    ${cat.padEnd(18)} ${catBar} ${String(catPct).padStart(3)}%  (${passed}/${total})${' '.repeat(74 - 46 - cat.length - String(catPct).length - String(passed).length - String(total).length)}║`);
  }

  console.log(`╚${'═'.repeat(74)}╝`);
}

runTest().catch(console.error);
