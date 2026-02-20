import { analyzeRequest } from '../../server/modules/deep-understanding-engine.js';
import { generatePlan, type ProjectPlan } from '../../server/modules/plan-generator.js';
import { generateProject } from '../../server/modules/codegen-orchestrator.js';
import { analyzeSemantics } from '../../server/modules/contextual-reasoning-engine.js';
import { generateDesignSystem } from '../../server/modules/design-system-engine.js';

interface StressTestResult {
  id: number;
  scenario: string;
  category: string;
  phase: 'analyzeRequest' | 'generatePlan' | 'generateProject' | 'validation';
  passed: boolean;
  errors: string[];
  warnings: string[];
  stats: {
    entities?: number;
    pages?: number;
    endpoints?: number;
    files?: number;
    confidence?: number;
    readyForPlan?: boolean;
    timeMs?: number;
  };
}

const SCENARIOS: { input: string; category: string }[] = [
  // === EDGE CASES: Empty / Minimal / Garbage ===
  { input: '', category: 'edge-empty' },
  { input: ' ', category: 'edge-empty' },
  { input: '   \n\t  ', category: 'edge-empty' },
  { input: 'a', category: 'edge-minimal' },
  { input: 'app', category: 'edge-minimal' },
  { input: 'thing', category: 'edge-minimal' },
  { input: '!!!???...', category: 'edge-garbage' },
  { input: '<script>alert("xss")</script>', category: 'edge-xss' },
  { input: 'SELECT * FROM users; DROP TABLE users;--', category: 'edge-sqli' },
  { input: '🔥🚀💻🎯', category: 'edge-emoji' },
  { input: 'null undefined NaN Infinity', category: 'edge-jsKeywords' },
  { input: 'a'.repeat(5000), category: 'edge-veryLong' },
  { input: Array(200).fill('feature').join(' '), category: 'edge-repetitive' },

  // === SINGLE WORD / TWO WORD PROMPTS ===
  { input: 'blog', category: 'small-singleWord' },
  { input: 'todo', category: 'small-singleWord' },
  { input: 'calculator', category: 'small-singleWord' },
  { input: 'dashboard', category: 'small-singleWord' },
  { input: 'chat', category: 'small-singleWord' },
  { input: 'portfolio', category: 'small-singleWord' },
  { input: 'landing page', category: 'small-twoWord' },
  { input: 'weather app', category: 'small-twoWord' },
  { input: 'notes app', category: 'small-twoWord' },
  { input: 'quiz app', category: 'small-twoWord' },
  { input: 'timer app', category: 'small-twoWord' },
  { input: 'password generator', category: 'small-twoWord' },
  { input: 'pomodoro timer', category: 'small-twoWord' },
  { input: 'habit tracker', category: 'small-twoWord' },

  // === WELL-KNOWN APP FAST-PATH ===
  { input: 'build me a todo app', category: 'wellKnown' },
  { input: 'create a task manager', category: 'wellKnown' },
  { input: 'make a kanban board', category: 'wellKnown' },
  { input: 'I want a CRM', category: 'wellKnown' },
  { input: 'build an inventory manager', category: 'wellKnown' },
  { input: 'create an expense tracker', category: 'wellKnown' },
  { input: 'make a booking system', category: 'wellKnown' },
  { input: 'build a recipe app', category: 'wellKnown' },
  { input: 'create a contact manager', category: 'wellKnown' },
  { input: 'I need an employee directory', category: 'wellKnown' },
  { input: 'make a budget tracker', category: 'wellKnown' },
  { input: 'build an invoice app', category: 'wellKnown' },
  { input: 'create a project tracker', category: 'wellKnown' },
  { input: 'make an appointment scheduler', category: 'wellKnown' },
  { input: 'create a meal planner', category: 'wellKnown' },
  { input: 'build a cookbook', category: 'wellKnown' },

  // === DOMAIN-SPECIFIC: All 14 Domains ===
  { input: 'Build a consulting firm management system with time tracking, client management, and invoicing', category: 'domain-consulting' },
  { input: 'Create a manufacturing plant management app with production lines, quality control and inventory', category: 'domain-manufacturing' },
  { input: 'I need a hospital management system for patients, doctors, appointments and billing', category: 'domain-healthcare' },
  { input: 'Build a retail store management system with POS, inventory and customer loyalty', category: 'domain-retail' },
  { input: 'Create an education platform with courses, students, grades and attendance tracking', category: 'domain-education' },
  { input: 'Build a real estate management system with properties, tenants, leases and maintenance', category: 'domain-realestate' },
  { input: 'I need an HR management system with employees, departments, leave tracking and payroll', category: 'domain-hr' },
  { input: 'Create a restaurant management system with menu, orders, reservations and kitchen display', category: 'domain-restaurant' },
  { input: 'Build a fitness center management app with members, classes, trainers and subscriptions', category: 'domain-fitness' },
  { input: 'I need a logistics management system with shipments, drivers, routes and fleet tracking', category: 'domain-logistics' },
  { input: 'Build a finance management system with budgets, expenses, invoices and financial reports', category: 'domain-finance' },
  { input: 'Create a project management tool with projects, tasks, sprints, team and kanban board', category: 'domain-projectMgmt' },
  { input: 'Build a CRM with contacts, leads, deals, pipeline and email tracking', category: 'domain-crm' },
  { input: 'Create an inventory management system with products, warehouses, stock levels and purchase orders', category: 'domain-inventory' },

  // === MULTI-DOMAIN / HYBRID ===
  { input: 'Build a restaurant app that also handles delivery logistics and inventory management', category: 'hybrid-multiDomain' },
  { input: 'I need a healthcare system that also handles HR and finance for hospital staff', category: 'hybrid-multiDomain' },
  { input: 'Create a retail platform with CRM features and inventory management', category: 'hybrid-multiDomain' },
  { input: 'Build an education platform with project management for student teams', category: 'hybrid-multiDomain' },

  // === NO DOMAIN MATCH: Novel/Unusual Apps ===
  { input: 'Build a pet adoption matching platform where shelters can list animals and families can apply', category: 'novel' },
  { input: 'Create a music practice logger where musicians track their practice sessions and progress', category: 'novel' },
  { input: 'Build a plant care tracker that reminds you to water plants and tracks their growth', category: 'novel' },
  { input: 'I need a book club organizer where members vote on books and schedule meetings', category: 'novel' },
  { input: 'Create a volunteer coordination platform for community events', category: 'novel' },
  { input: 'Build a wine tasting journal with notes, ratings and collection tracking', category: 'novel' },
  { input: 'Make a neighborhood watch reporting system with incident tracking and alerts', category: 'novel' },
  { input: 'Create a wedding planning app with guest list, vendors, budget and timeline', category: 'novel' },
  { input: 'Build a sports league manager with teams, schedules, scores and standings', category: 'novel' },
  { input: 'I need a tool to track my car maintenance history and upcoming service dates', category: 'novel' },

  // === LARGE / COMPLEX APPS ===
  { input: 'Build a complete enterprise ERP system with HR, finance, inventory, CRM, project management, analytics dashboard, role-based access control, multi-language support, export to PDF and Excel, real-time notifications, approval workflows, and audit logging', category: 'large-erp' },
  { input: 'Create a comprehensive hospital system with patient records, doctor scheduling, lab results, pharmacy management, billing, insurance claims, bed management, emergency triage, and reporting dashboard with charts', category: 'large-hospital' },
  { input: 'Build a full SaaS platform with multi-tenant architecture, subscription management, user authentication, admin panel, API key management, usage analytics, billing integration, and customer support ticketing', category: 'large-saas' },
  { input: 'Create a marketplace platform with vendor onboarding, product listings, order management, reviews and ratings, seller analytics, buyer profiles, messaging between buyers and sellers, dispute resolution, and commission tracking', category: 'large-marketplace' },

  // === FEATURE-SPECIFIC REQUESTS ===
  { input: 'Build an app with a kanban board for managing tasks with drag and drop', category: 'feature-kanban' },
  { input: 'Create a dashboard with charts showing sales analytics and KPIs', category: 'feature-dashboard' },
  { input: 'Build an app with real-time chat and notifications using websockets', category: 'feature-realtime' },
  { input: 'I need an app with CSV import/export and PDF report generation', category: 'feature-export' },
  { input: 'Create a multi-language app with i18n support for English, Spanish and French', category: 'feature-i18n' },
  { input: 'Build a role-based app with admin, manager, and viewer permissions', category: 'feature-rbac' },
  { input: 'Create an app with a calendar view for scheduling events and appointments', category: 'feature-calendar' },
  { input: 'Build an app with file upload, image gallery and document management', category: 'feature-upload' },
  { input: 'Create an app with search, filters, pagination and sorting on all data tables', category: 'feature-search' },

  // === AMBIGUOUS / VAGUE REQUESTS ===
  { input: 'Build me something useful', category: 'vague' },
  { input: 'I need an app for my business', category: 'vague' },
  { input: 'Create a management system', category: 'vague' },
  { input: 'Make a tracker', category: 'vague' },
  { input: 'Build a platform', category: 'vague' },
  { input: 'I want to manage things better', category: 'vague' },

  // === TARGETED FIELD TYPE TESTING ===
  { input: 'Build a financial dashboard tracking expenses with amounts in USD, percentages, dates, email contacts and status flags', category: 'fieldTypes' },
  { input: 'Create an employee system with profile photos, multi-select skills, date of birth, salary amounts, and boolean active flags', category: 'fieldTypes' },

  // === SCALE VARIATIONS ===
  { input: 'Build a simple personal todo list, just for me', category: 'scale-small' },
  { input: 'Create a growing team task manager for 20 people', category: 'scale-medium' },
  { input: 'Build an enterprise-grade multi-tenant project management platform for a 500-person corporation', category: 'scale-enterprise' },

  // === CONVERSATION CONTEXT SIMULATION ===
  { input: 'Add a reports module with charts', category: 'context-followup' },
  { input: 'Actually I also need inventory tracking', category: 'context-followup' },
  { input: 'Can you add email notifications to the system?', category: 'context-followup' },

  // === SPECIAL CHARACTERS IN NAMES ===
  { input: "Build O'Brien's Café Management System", category: 'edge-specialChars' },
  { input: 'Create a "Best App Ever" (v2.0) for managing stuff & things', category: 'edge-specialChars' },
  { input: 'Build système de gestion des employés', category: 'edge-nonEnglish' },

  // === APP TYPE ALIASES ===
  { input: 'Build a POS system for my coffee shop', category: 'alias-pos' },
  { input: 'Create an LMS for online training', category: 'alias-lms' },
  { input: 'Build an HRIS for people management', category: 'alias-hris' },
  { input: 'Create a WMS for warehouse operations', category: 'alias-wms' },
  { input: 'Build an EHR for medical records', category: 'alias-ehr' },
  { input: 'Create a TMS for fleet tracking', category: 'alias-tms' },
  { input: 'Build a CMS for blog publishing', category: 'alias-cms' },

  // === ADDITIONAL COVERAGE: Ensure 100+ ===
  { input: 'Build a donation tracking platform for a nonprofit organization', category: 'novel' },
  { input: 'Create a product roadmap tool with feature voting and release planning', category: 'novel' },
  { input: 'Build a gym workout tracker with exercise library and progress charts', category: 'novel' },
  { input: 'Create a freelancer time and billing tool', category: 'domain-consulting' },
  { input: 'Build a food delivery ordering system', category: 'domain-restaurant' },
  { input: 'Create a student grade book for teachers', category: 'domain-education' },
  { input: 'Build a property listing site like Zillow', category: 'domain-realestate' },
  { input: 'Create an issue tracker like Jira', category: 'wellKnown' },
];

function validateUnderstandingResult(result: any, input: string): string[] {
  const errors: string[] = [];
  if (!result) { errors.push('analyzeRequest returned null/undefined'); return errors; }
  if (typeof result.confidence !== 'number') errors.push('confidence is not a number');
  if (result.confidence < 0 || result.confidence > 1) errors.push(`confidence out of range: ${result.confidence}`);
  if (typeof result.readyForPlan !== 'boolean') errors.push('readyForPlan is not boolean');
  if (!result.level1_intent) errors.push('level1_intent missing');
  else {
    if (!result.level1_intent.applicationType) errors.push('applicationType empty');
    if (!result.level1_intent.targetAudience) errors.push('targetAudience empty');
    if (!result.level1_intent.primaryGoal) errors.push('primaryGoal empty');
  }
  if (!result.level2_domain) errors.push('level2_domain missing');
  if (!result.level3_entities) errors.push('level3_entities missing');
  if (!result.level4_workflows) errors.push('level4_workflows missing');
  if (!result.level5_clarification) errors.push('level5_clarification missing');
  return errors;
}

function validatePlan(plan: ProjectPlan, input: string): string[] {
  const errors: string[] = [];
  if (!plan) { errors.push('generatePlan returned null/undefined'); return errors; }

  if (!plan.projectName) errors.push('projectName is empty');
  if (!plan.overview) errors.push('overview is empty');
  if (!plan.techStack || plan.techStack.length === 0) errors.push('techStack is empty');
  if (!plan.estimatedComplexity) errors.push('estimatedComplexity is empty');

  if (!plan.dataModel) errors.push('dataModel is null/undefined');
  else {
    if (!Array.isArray(plan.dataModel)) errors.push('dataModel is not an array');
    for (const entity of plan.dataModel) {
      if (!entity.name) errors.push('Entity has no name');
      if (!entity.tableName) errors.push(`Entity ${entity.name} has no tableName`);
      if (!entity.fields || entity.fields.length === 0) errors.push(`Entity ${entity.name} has no fields`);
      const idField = entity.fields?.find(f => f.name === 'id');
      if (!idField) errors.push(`Entity ${entity.name} has no id field`);
      const fieldNames = entity.fields?.map(f => f.name) || [];
      const dupeFields = fieldNames.filter((n, i) => fieldNames.indexOf(n) !== i);
      if (dupeFields.length > 0) errors.push(`Entity ${entity.name} has duplicate fields: ${dupeFields.join(', ')}`);
      for (const field of entity.fields || []) {
        if (!field.name) errors.push(`Entity ${entity.name} has a field with no name`);
        if (!field.type) errors.push(`Entity ${entity.name}.${field.name} has no type`);
      }
    }
    const entityNames = plan.dataModel.map(e => e.name);
    const dupeEntities = entityNames.filter((n, i) => entityNames.indexOf(n) !== i);
    if (dupeEntities.length > 0) errors.push(`Duplicate entities: ${dupeEntities.join(', ')}`);
    const tableNames = plan.dataModel.map(e => e.tableName);
    const dupeTables = tableNames.filter((n, i) => tableNames.indexOf(n) !== i);
    if (dupeTables.length > 0) errors.push(`Duplicate table names: ${dupeTables.join(', ')}`);
  }

  if (!plan.pages) errors.push('pages is null/undefined');
  else {
    if (!Array.isArray(plan.pages)) errors.push('pages is not an array');
    for (const page of plan.pages) {
      if (!page.name) errors.push('Page has no name');
      if (!page.path) errors.push(`Page ${page.name} has no path`);
      if (!page.componentName) errors.push(`Page ${page.name} has no componentName`);
      if (page.path && !page.path.startsWith('/')) errors.push(`Page ${page.name} path doesn't start with /: ${page.path}`);
    }
    const pagePaths = plan.pages.map(p => p.path);
    const dupePaths = pagePaths.filter((p, i) => pagePaths.indexOf(p) !== i);
    if (dupePaths.length > 0) errors.push(`Duplicate page paths: ${dupePaths.join(', ')}`);
  }

  if (!plan.apiEndpoints) errors.push('apiEndpoints is null/undefined');
  else if (!Array.isArray(plan.apiEndpoints)) errors.push('apiEndpoints is not an array');
  else {
    for (const ep of plan.apiEndpoints) {
      if (!ep.method) errors.push(`Endpoint missing method: ${ep.path}`);
      if (!ep.path) errors.push('Endpoint has no path');
      if (ep.path && !ep.path.startsWith('/api/')) errors.push(`Endpoint path doesn't start with /api/: ${ep.path}`);
      if (!['GET','POST','PUT','PATCH','DELETE'].includes(ep.method)) errors.push(`Invalid method ${ep.method} for ${ep.path}`);
    }
  }

  if (plan.roles && !Array.isArray(plan.roles)) errors.push('roles is not an array');
  if (plan.workflows && !Array.isArray(plan.workflows)) errors.push('workflows is not an array');
  if (plan.kpis && !Array.isArray(plan.kpis)) errors.push('kpis is not an array');

  return errors;
}

function validateGeneratedFiles(files: any[], plan: ProjectPlan): string[] {
  const errors: string[] = [];
  if (!files || files.length === 0) { errors.push('No files generated'); return errors; }

  const filePaths = files.map((f: any) => f.path);
  const dupePaths = filePaths.filter((p: string, i: number) => filePaths.indexOf(p) !== i);
  if (dupePaths.length > 0) errors.push(`Duplicate file paths: ${dupePaths.join(', ')}`);

  const hasPackageJson = filePaths.some((p: string) => p.includes('package.json'));
  const hasViteConfig = filePaths.some((p: string) => p.includes('vite.config'));
  const hasIndexHtml = filePaths.some((p: string) => p.includes('index.html'));
  const hasSchema = filePaths.some((p: string) => p.includes('schema.ts'));
  const hasAppTsx = filePaths.some((p: string) => p.includes('App.tsx'));
  const hasTsConfig = filePaths.some((p: string) => p === 'tsconfig.json');
  const hasMainTsx = filePaths.some((p: string) => p.includes('main.tsx'));
  const hasIndexCss = filePaths.some((p: string) => p.includes('index.css'));

  if (!hasPackageJson) errors.push('Missing package.json');
  if (!hasViteConfig) errors.push('Missing vite.config');
  if (!hasIndexHtml) errors.push('Missing index.html');
  if (!hasSchema) errors.push('Missing shared/schema.ts');
  if (!hasAppTsx) errors.push('Missing App.tsx');
  if (!hasTsConfig) errors.push('Missing tsconfig.json');
  if (!hasMainTsx) errors.push('Missing main.tsx');
  if (!hasIndexCss) errors.push('Missing index.css');

  for (const file of files) {
    if (!file.path) { errors.push('File has no path'); continue; }
    if (!file.content && file.content !== '') { errors.push(`${file.path}: null/undefined content`); continue; }
    if (file.content === '') { errors.push(`${file.path}: empty content`); continue; }

    const c = file.content || '';
    const isTS = file.path.endsWith('.ts') || file.path.endsWith('.tsx');
    const isTSX = file.path.endsWith('.tsx');

    if (isTS) {
      if (c.includes('undefined.')) errors.push(`${file.path}: contains 'undefined.' — likely null reference`);
      if (c.includes('.undefined')) errors.push(`${file.path}: contains '.undefined' — likely null reference`);
      if (/(?<![\w$])NaN(?![\w$]|\s*\()/g.test(c)) errors.push(`${file.path}: contains standalone NaN literal`);
      if (/import\s+.*from\s+['"]['"]/g.test(c)) errors.push(`${file.path}: has empty import path`);

      const opens = (c.match(/\{/g) || []).length;
      const closes = (c.match(/\}/g) || []).length;
      if (Math.abs(opens - closes) > 1) errors.push(`${file.path}: unbalanced braces ({=${opens} }=${closes})`);

      const parensOpen = (c.match(/\(/g) || []).length;
      const parensClose = (c.match(/\)/g) || []).length;
      if (Math.abs(parensOpen - parensClose) > 1) errors.push(`${file.path}: unbalanced parentheses ((=${parensOpen} )=${parensClose})`);

      if (/\bany\b/.test(c) && file.path.includes('schema.ts')) errors.push(`${file.path}: schema contains 'any' type`);

      const duplicateImports = new Map<string, number>();
      const importLineRegex = /import\s+(?:{[^}]+}|[^;]+)\s+from\s+["']([^"']+)["']/g;
      let m;
      importLineRegex.lastIndex = 0;
      while ((m = importLineRegex.exec(c)) !== null) {
        const source = m[1];
        duplicateImports.set(source, (duplicateImports.get(source) || 0) + 1);
      }
      for (const [source, count] of duplicateImports) {
        if (count > 1) errors.push(`${file.path}: duplicate import from "${source}" (${count}x)`);
      }
    }

    if (isTSX) {
      const hasExport = /export\s+(default|const|function|{)/.test(c);
      if (!hasExport && !file.path.includes('main.tsx') && !file.path.includes('index.tsx')) {
        errors.push(`${file.path}: TSX file has no export`);
      }

      if (/return\s*\(\s*\)\s*;/.test(c)) errors.push(`${file.path}: returns empty JSX ()`);

      if (c.includes('className=""') && (c.match(/className=""/g) || []).length > 3) {
        errors.push(`${file.path}: excessive empty className attributes`);
      }
    }

    if (file.path === 'package.json') {
      try {
        const pkg = JSON.parse(c);
        if (!pkg.name) errors.push('package.json: missing "name"');
        if (!pkg.scripts?.dev) errors.push('package.json: missing "dev" script');
        if (!pkg.dependencies?.react) errors.push('package.json: missing react dependency');
        if (!pkg.dependencies?.['react-dom']) errors.push('package.json: missing react-dom dependency');
        if (!pkg.devDependencies?.vite && !pkg.dependencies?.vite) errors.push('package.json: missing vite');
        if (!pkg.devDependencies?.typescript && !pkg.dependencies?.typescript) errors.push('package.json: missing typescript');
      } catch (e) {
        errors.push('package.json: invalid JSON');
      }
    }

    if (file.path === 'tsconfig.json') {
      try {
        const stripped = c.replace(/\/\/[^\n]*/g, '').replace(/\/\*[\s\S]*?\*\//g, '');
        JSON.parse(stripped);
      } catch (e) {
        errors.push('tsconfig.json: invalid JSON');
      }
    }

    if (file.path === 'index.html') {
      if (!c.includes('<div id="root"')) errors.push('index.html: missing root div');
      if (!c.includes('src/main.tsx') && !c.includes('main.tsx')) errors.push('index.html: missing main.tsx script');
    }
  }

  const importRegex = /import\s+(?:{[^}]+}|[^;]+)\s+from\s+["'](@\/[^"']+)["']/g;
  for (const file of files) {
    if (!file.path?.endsWith('.tsx') && !file.path?.endsWith('.ts')) continue;
    let match;
    importRegex.lastIndex = 0;
    while ((match = importRegex.exec(file.content || '')) !== null) {
      const importPath = match[1].replace('@/', 'src/');
      const extensions = ['', '.ts', '.tsx', '.js', '.jsx'];
      const found = extensions.some(ext => filePaths.includes(importPath + ext));
      if (!found) {
        errors.push(`[broken-import] ${file.path}: "${match[1]}" → "${importPath}" not in output files`);
      }
    }
  }

  const appFile = files.find((f: any) => f.path?.includes('App.tsx'));
  if (appFile) {
    for (const page of plan.pages || []) {
      if (page.path && !appFile.content?.includes(page.path)) {
        errors.push(`[missing-route] App.tsx: page "${page.name}" route "${page.path}" not registered`);
      }
    }
  }

  const schemaFile = files.find((f: any) => f.path?.includes('schema.ts'));
  if (schemaFile) {
    for (const entity of plan.dataModel || []) {
      const tableName = entity.name.toLowerCase().replace(/\s+/g, '');
      if (!schemaFile.content?.toLowerCase().includes(tableName)) {
        errors.push(`[missing-entity] schema.ts: entity "${entity.name}" not found in schema`);
      }
    }
  }

  return errors;
}

function runSingleScenario(id: number, input: string, category: string): StressTestResult {
  const result: StressTestResult = {
    id,
    scenario: input.length > 80 ? input.slice(0, 77) + '...' : input,
    category,
    phase: 'analyzeRequest',
    passed: false,
    errors: [],
    warnings: [],
    stats: {},
  };

  const start = Date.now();

  // Phase 1: analyzeRequest
  let understanding: any;
  try {
    understanding = analyzeRequest(input);
    const understandingErrors = validateUnderstandingResult(understanding, input);
    if (understandingErrors.length > 0) {
      result.errors.push(...understandingErrors.map(e => `[analyzeRequest] ${e}`));
    }
    result.stats.confidence = understanding?.confidence;
    result.stats.readyForPlan = understanding?.readyForPlan;
  } catch (err: any) {
    result.errors.push(`[analyzeRequest] CRASH: ${err.message}`);
    result.stats.timeMs = Date.now() - start;
    return result;
  }

  // Phase 2: generatePlan
  result.phase = 'generatePlan';
  let plan: ProjectPlan;
  try {
    plan = generatePlan(understanding);
    const planErrors = validatePlan(plan, input);
    if (planErrors.length > 0) {
      result.errors.push(...planErrors.map(e => `[generatePlan] ${e}`));
    }
    result.stats.entities = plan.dataModel?.length || 0;
    result.stats.pages = plan.pages?.length || 0;
    result.stats.endpoints = plan.apiEndpoints?.length || 0;

    if (input.trim().length > 5 && result.stats.entities === 0 && result.stats.pages === 0) {
      result.warnings.push('[generatePlan] Non-trivial input produced 0 entities AND 0 pages');
    }
  } catch (err: any) {
    result.errors.push(`[generatePlan] CRASH: ${err.message}\n${err.stack?.split('\n').slice(0, 3).join('\n')}`);
    result.stats.timeMs = Date.now() - start;
    return result;
  }

  // Phase 3: generateProject (full code generation)
  result.phase = 'generateProject';
  try {
    const reasoning = analyzeSemantics(plan);
    const designSystem = generateDesignSystem(plan, reasoning);
    const { files, validation, report } = generateProject(plan, reasoning, designSystem);

    result.stats.files = files.length;

    const fileErrors = validateGeneratedFiles(files, plan);
    if (fileErrors.length > 0) {
      result.errors.push(...fileErrors.map(e => `[generateProject] ${e}`));
    }

    for (const err of validation.errors) {
      result.errors.push(`[validator] [${err.type}] ${err.file}: ${err.message}`);
    }
    for (const warn of validation.warnings) {
      result.warnings.push(`[validator] [${warn.type}] ${warn.file}: ${warn.message}`);
    }
  } catch (err: any) {
    result.errors.push(`[generateProject] CRASH: ${err.message}\n${err.stack?.split('\n').slice(0, 3).join('\n')}`);
    result.stats.timeMs = Date.now() - start;
    return result;
  }

  result.phase = 'validation';
  result.passed = result.errors.length === 0;
  result.stats.timeMs = Date.now() - start;
  return result;
}

function runStressTest() {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`  PLANNING PIPELINE STRESS TEST — ${SCENARIOS.length} scenarios`);
  console.log(`${'='.repeat(80)}\n`);

  const results: StressTestResult[] = [];
  let passed = 0;
  let failed = 0;
  let crashed = 0;

  for (let i = 0; i < SCENARIOS.length; i++) {
    const { input, category } = SCENARIOS[i];
    const displayInput = input.length > 60 ? input.slice(0, 57) + '...' : input;
    process.stdout.write(`[${String(i + 1).padStart(3)}/${SCENARIOS.length}] ${category.padEnd(25)} `);

    const result = runSingleScenario(i + 1, input, category);
    results.push(result);

    if (result.passed) {
      passed++;
      process.stdout.write(`PASS`);
    } else {
      const isCrash = result.errors.some(e => e.includes('CRASH'));
      if (isCrash) { crashed++; failed++; } else { failed++; }
      process.stdout.write(isCrash ? `CRASH` : `FAIL`);
    }

    const statsStr = [
      result.stats.entities !== undefined ? `E:${result.stats.entities}` : '',
      result.stats.pages !== undefined ? `P:${result.stats.pages}` : '',
      result.stats.files !== undefined ? `F:${result.stats.files}` : '',
      result.stats.timeMs !== undefined ? `${result.stats.timeMs}ms` : '',
    ].filter(Boolean).join(' ');
    process.stdout.write(` ${statsStr}`);

    if (!result.passed) {
      process.stdout.write(` — ${result.errors[0]?.slice(0, 80)}`);
    }
    process.stdout.write('\n');
  }

  // Summary
  console.log(`\n${'='.repeat(80)}`);
  console.log(`  RESULTS: ${passed} passed, ${failed} failed (${crashed} crashes) out of ${SCENARIOS.length}`);
  console.log(`${'='.repeat(80)}\n`);

  // Group failures by category
  const failedResults = results.filter(r => !r.passed);
  if (failedResults.length > 0) {
    console.log('FAILURES BY CATEGORY:\n');
    const byCategory: Record<string, StressTestResult[]> = {};
    for (const r of failedResults) {
      if (!byCategory[r.category]) byCategory[r.category] = [];
      byCategory[r.category].push(r);
    }

    for (const [cat, catResults] of Object.entries(byCategory)) {
      console.log(`  ${cat} (${catResults.length} failures):`);
      for (const r of catResults) {
        console.log(`    #${r.id} "${r.scenario}"`);
        for (const err of r.errors.slice(0, 3)) {
          console.log(`      ✗ ${err.slice(0, 120)}`);
        }
        if (r.errors.length > 3) {
          console.log(`      ... and ${r.errors.length - 3} more errors`);
        }
      }
      console.log('');
    }
  }

  // Error frequency analysis
  const errorFrequency: Record<string, number> = {};
  for (const r of results) {
    for (const err of r.errors) {
      const key = err.replace(/#\d+/g, '#N').replace(/`[^`]+`/g, '`..`').replace(/"[^"]+"/g, '"..."').slice(0, 100);
      errorFrequency[key] = (errorFrequency[key] || 0) + 1;
    }
  }

  if (Object.keys(errorFrequency).length > 0) {
    console.log('MOST COMMON ERRORS:\n');
    const sorted = Object.entries(errorFrequency).sort((a, b) => b[1] - a[1]);
    for (const [err, count] of sorted.slice(0, 20)) {
      console.log(`  ${String(count).padStart(3)}x  ${err}`);
    }
  }

  // Warning frequency
  const warningFrequency: Record<string, number> = {};
  for (const r of results) {
    for (const w of r.warnings) {
      const key = w.replace(/#\d+/g, '#N').replace(/`[^`]+`/g, '`..`').replace(/"[^"]+"/g, '"..."').slice(0, 100);
      warningFrequency[key] = (warningFrequency[key] || 0) + 1;
    }
  }

  if (Object.keys(warningFrequency).length > 0) {
    console.log('\nMOST COMMON WARNINGS:\n');
    const sorted = Object.entries(warningFrequency).sort((a, b) => b[1] - a[1]);
    for (const [warn, count] of sorted.slice(0, 15)) {
      console.log(`  ${String(count).padStart(3)}x  ${warn}`);
    }
  }

  console.log(`\n${'='.repeat(80)}`);
  console.log(`  FINAL: ${passed}/${SCENARIOS.length} passed | ${failed} failed | ${crashed} crashes`);
  console.log(`${'='.repeat(80)}\n`);

  return { results, passed, failed, crashed, total: SCENARIOS.length };
}

runStressTest();
