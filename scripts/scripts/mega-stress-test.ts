import { analyzeRequest } from '../../server/modules/deep-understanding-engine.js';
import { generatePlan, type ProjectPlan } from '../../server/modules/plan-generator.js';
import { generateProject } from '../../server/modules/codegen-orchestrator.js';
import { analyzeSemantics } from '../../server/modules/contextual-reasoning-engine.js';
import { generateDesignSystem } from '../../server/modules/design-system-engine.js';
import { GenerationLearningEngine } from '../../server/modules/generation-learning-engine.js';
import * as fs from 'fs';
import * as path from 'path';

const START_OFFSET = parseInt(process.env.START_OFFSET || '0', 10);
const TOTAL_ITERATIONS = parseInt(process.env.TOTAL_ITERATIONS || '10000', 10);
const BATCH_SIZE = parseInt(process.env.BATCH_SIZE || '500', 10);
const LEARNING_SAVE_INTERVAL = 250;

const learningEngine = new GenerationLearningEngine();

const DOMAINS = [
  'consulting', 'manufacturing', 'healthcare', 'retail', 'education',
  'realestate', 'hr', 'restaurant', 'fitness', 'logistics',
  'finance', 'project-management', 'crm', 'inventory',
];

const DOMAIN_NOUNS: Record<string, string[]> = {
  consulting: ['consulting firm', 'advisory agency', 'consultancy', 'professional services firm'],
  manufacturing: ['factory', 'manufacturing plant', 'production facility', 'assembly line'],
  healthcare: ['hospital', 'clinic', 'medical center', 'healthcare facility', 'dental practice', 'pharmacy'],
  retail: ['store', 'shop', 'boutique', 'retail chain', 'e-commerce store', 'online marketplace'],
  education: ['school', 'university', 'training center', 'online learning platform', 'tutoring service'],
  realestate: ['real estate agency', 'property management company', 'rental platform', 'housing marketplace'],
  hr: ['HR department', 'staffing agency', 'recruitment firm', 'people operations team'],
  restaurant: ['restaurant', 'café', 'bakery', 'food truck', 'catering company', 'bar'],
  fitness: ['gym', 'fitness center', 'yoga studio', 'CrossFit box', 'personal training studio'],
  logistics: ['shipping company', 'delivery service', 'freight company', 'courier service', 'warehouse'],
  finance: ['accounting firm', 'bank', 'investment firm', 'insurance company', 'fintech startup'],
  'project-management': ['software team', 'agency', 'startup', 'development shop', 'design studio'],
  crm: ['sales team', 'marketing agency', 'business development group', 'customer success team'],
  inventory: ['warehouse', 'distribution center', 'supply chain', 'stockroom', 'parts depot'],
};

const FEATURES = [
  'time tracking', 'invoicing', 'billing', 'reporting', 'analytics dashboard',
  'user authentication', 'role-based access', 'email notifications', 'SMS alerts',
  'calendar scheduling', 'appointment booking', 'task management', 'kanban board',
  'file upload', 'document management', 'search and filters', 'data export',
  'PDF reports', 'CSV import/export', 'real-time updates', 'chat messaging',
  'inventory tracking', 'order management', 'payment processing', 'subscription management',
  'customer portal', 'feedback collection', 'survey forms', 'attendance tracking',
  'leave management', 'payroll', 'expense tracking', 'budget management',
  'multi-language support', 'dark mode', 'mobile responsive', 'audit logging',
  'approval workflows', 'custom fields', 'tags and categories', 'bulk actions',
  'drag and drop', 'charts and graphs', 'map view', 'timeline view',
  'activity feed', 'commenting system', 'rating and reviews', 'loyalty program',
  'discount management', 'coupon codes', 'referral system', 'notifications center',
];

const ENTITIES = [
  'users', 'customers', 'employees', 'products', 'orders', 'invoices',
  'appointments', 'tasks', 'projects', 'tickets', 'leads', 'contacts',
  'events', 'messages', 'payments', 'subscriptions', 'reviews', 'categories',
  'tags', 'documents', 'reports', 'notifications', 'settings', 'roles',
  'departments', 'teams', 'locations', 'assets', 'vendors', 'suppliers',
  'shipments', 'routes', 'vehicles', 'rooms', 'classes', 'courses',
  'students', 'teachers', 'patients', 'doctors', 'prescriptions', 'treatments',
  'properties', 'tenants', 'leases', 'maintenance requests', 'menus', 'recipes',
];

const SCALES = ['simple', 'small', 'medium', 'large', 'enterprise', 'comprehensive'];

const VERBS = ['Build', 'Create', 'Make', 'Develop', 'Design', 'Set up', 'I need', 'I want'];

const ADJECTIVES = [
  'modern', 'simple', 'comprehensive', 'full-featured', 'minimal', 'professional',
  'user-friendly', 'enterprise-grade', 'scalable', 'intuitive', 'sleek', 'powerful',
  'efficient', 'streamlined', 'robust', 'elegant', 'advanced', 'complete',
];

const NOVEL_APPS = [
  'pet adoption matching platform', 'music practice logger', 'plant care tracker',
  'book club organizer', 'volunteer coordination platform', 'wine tasting journal',
  'neighborhood watch system', 'wedding planning app', 'sports league manager',
  'car maintenance tracker', 'donation tracker', 'product roadmap tool',
  'gym workout tracker', 'freelancer billing tool', 'recipe sharing platform',
  'garage sale organizer', 'hiking trail journal', 'language exchange matcher',
  'community garden manager', 'board game collection tracker', 'movie watchlist app',
  'travel itinerary planner', 'parking spot finder', 'lost and found system',
  'potluck organizer', 'study group coordinator', 'baby milestone tracker',
  'home renovation planner', 'fishing log', 'bird watching journal',
  'running club manager', 'chess tournament organizer', 'podcast tracker',
  'art portfolio showcase', 'local events board', 'carpool coordinator',
  'pet sitting scheduler', 'tool lending library', 'community bulletin board',
  'meal prep planner', 'sourdough starter tracker', 'aquarium maintenance log',
  'vintage record collection', 'yarn stash organizer', 'cosplay progress tracker',
  'tabletop RPG campaign manager', 'seed library tracker', 'ancestry research tool',
  'amateur radio log', 'telescope observation journal', 'rock climbing route tracker',
  'surf spot reporter', 'mushroom foraging diary', 'beekeeping hive monitor',
];

const EDGE_CASES = [
  '', ' ', '   \n\t  ', 'a', 'app', 'thing', '!!!???...',
  '<script>alert("xss")</script>', 'SELECT * FROM users; DROP TABLE;--',
  '🔥🚀💻🎯', 'null undefined NaN Infinity',
  'a'.repeat(5000), Array(200).fill('feature').join(' '),
  "Build O'Brien's Café System", 'système de gestion',
  '{"json": true}', '\\n\\t\\r\\0', 'http://example.com',
  'Build an app with <b>bold</b> features', '   build   a   todo   app   ',
  'TODO TODO TODO', 'URGENT: build app NOW!!!',
  '1234567890', 'true false null undefined',
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(n, arr.length));
}

function generateRandomScenario(id: number): { input: string; category: string } {
  const r = Math.random();

  if (r < 0.02) {
    return { input: pick(EDGE_CASES), category: 'gen-edge' };
  }

  if (r < 0.12) {
    return { input: pick(NOVEL_APPS), category: 'gen-novel' };
  }

  if (r < 0.18) {
    const verb = pick(VERBS);
    const adj = pick(ADJECTIVES);
    const app = pick(['app', 'system', 'platform', 'tool', 'dashboard', 'tracker', 'manager']);
    return { input: `${verb} a ${adj} ${app}`, category: 'gen-vague' };
  }

  if (r < 0.25) {
    const features = pickN(FEATURES, Math.floor(Math.random() * 4) + 1);
    return { input: `Build an app with ${features.join(', ')}`, category: 'gen-feature' };
  }

  if (r < 0.35) {
    const d1 = pick(DOMAINS);
    const d2 = pick(DOMAINS.filter(d => d !== d1));
    const noun1 = pick(DOMAIN_NOUNS[d1]);
    const features = pickN(FEATURES, 2);
    return {
      input: `${pick(VERBS)} a ${noun1} management system that also handles ${d2} operations with ${features.join(' and ')}`,
      category: 'gen-hybrid',
    };
  }

  if (r < 0.42) {
    const domain = pick(DOMAINS);
    const noun = pick(DOMAIN_NOUNS[domain]);
    const scale = pick(SCALES);
    const featureCount = Math.floor(Math.random() * 6) + 3;
    const features = pickN(FEATURES, featureCount);
    return {
      input: `${pick(VERBS)} a ${scale} ${noun} management system with ${features.join(', ')}`,
      category: 'gen-large',
    };
  }

  if (r < 0.55) {
    const entities = pickN(ENTITIES, Math.floor(Math.random() * 4) + 2);
    const domain = pick(DOMAINS);
    const noun = pick(DOMAIN_NOUNS[domain]);
    return {
      input: `${pick(VERBS)} a ${noun} system to manage ${entities.join(', ')}`,
      category: 'gen-entity',
    };
  }

  if (r < 0.65) {
    const domain = pick(DOMAINS);
    const noun = pick(DOMAIN_NOUNS[domain]);
    const adj = pick(ADJECTIVES);
    return {
      input: `${pick(VERBS)} a ${adj} ${noun} management application`,
      category: 'gen-domain',
    };
  }

  if (r < 0.75) {
    const items = pickN([
      'POS system', 'LMS', 'HRIS', 'WMS', 'EHR', 'TMS', 'CMS',
      'ERP', 'CRM', 'HRM', 'SCM', 'BPM', 'KMS',
      'todo app', 'kanban board', 'expense tracker', 'invoice app',
      'booking system', 'recipe app', 'contact manager', 'budget tracker',
    ], 1);
    return { input: `${pick(VERBS)} a ${items[0]}`, category: 'gen-wellknown' };
  }

  if (r < 0.85) {
    const domain = pick(DOMAINS);
    const noun = pick(DOMAIN_NOUNS[domain]);
    const features = pickN(FEATURES, Math.floor(Math.random() * 3) + 1);
    const scale = pick(['simple', 'small', 'medium']);
    return {
      input: `${pick(VERBS)} a ${scale} ${noun} with ${features.join(' and ')}`,
      category: 'gen-medium',
    };
  }

  const templates = [
    () => `I run a ${pick(DOMAIN_NOUNS[pick(DOMAINS)])} and need software to manage my business`,
    () => `We need to track ${pickN(ENTITIES, 3).join(', ')} for our ${pick(ADJECTIVES)} business`,
    () => `Can you make a ${pick(ADJECTIVES)} app for managing ${pick(ENTITIES)}?`,
    () => `Our ${pick(DOMAIN_NOUNS[pick(DOMAINS)])} needs a better way to handle ${pickN(FEATURES, 2).join(' and ')}`,
    () => `${pick(VERBS)} something to help me organize my ${pick(ENTITIES)} with ${pick(FEATURES)}`,
    () => `I'm looking for a ${pick(ADJECTIVES)} solution for ${pick(FEATURES)} and ${pick(FEATURES)}`,
  ];
  return { input: pick(templates)(), category: 'gen-natural' };
}

interface StressTestResult {
  id: number;
  scenario: string;
  category: string;
  passed: boolean;
  errors: string[];
  warnings: string[];
  timeMs: number;
  stats: {
    entities?: number;
    pages?: number;
    endpoints?: number;
    files?: number;
  };
}

function validateGeneratedFiles(files: any[], plan: ProjectPlan): string[] {
  const errors: string[] = [];
  if (!files || files.length === 0) { errors.push('No files generated'); return errors; }

  const filePaths = files.map((f: any) => f.path);
  const dupePaths = filePaths.filter((p: string, i: number) => filePaths.indexOf(p) !== i);
  if (dupePaths.length > 0) errors.push(`Duplicate file paths: ${dupePaths.join(', ')}`);

  const required = [
    ['package.json', 'package.json'],
    ['vite.config', 'vite.config'],
    ['index.html', 'index.html'],
    ['schema.ts', 'shared/schema.ts'],
    ['App.tsx', 'App.tsx'],
    ['tsconfig.json', 'tsconfig.json'],
    ['main.tsx', 'main.tsx'],
    ['index.css', 'index.css'],
  ];
  for (const [label, search] of required) {
    if (!filePaths.some((p: string) => p.includes(search) || p === search)) {
      errors.push(`Missing ${label}`);
    }
  }

  for (const file of files) {
    if (!file.path) { errors.push('File has no path'); continue; }
    if (!file.content && file.content !== '') { errors.push(`${file.path}: null content`); continue; }
    if (file.content === '') { errors.push(`${file.path}: empty content`); continue; }

    const c = file.content || '';
    const isTS = file.path.endsWith('.ts') || file.path.endsWith('.tsx');
    const isTSX = file.path.endsWith('.tsx');

    if (isTS) {
      if (c.includes('undefined.')) errors.push(`${file.path}: 'undefined.' reference`);
      if (c.includes('.undefined')) errors.push(`${file.path}: '.undefined' reference`);
      if (/(?<![\w$])NaN(?![\w$]|\s*\()/g.test(c)) errors.push(`${file.path}: standalone NaN`);
      if (/import\s+.*from\s+['"]['"]/g.test(c)) errors.push(`${file.path}: empty import path`);

      const opens = (c.match(/\{/g) || []).length;
      const closes = (c.match(/\}/g) || []).length;
      if (Math.abs(opens - closes) > 1) errors.push(`${file.path}: unbalanced braces`);

      const parensOpen = (c.match(/\(/g) || []).length;
      const parensClose = (c.match(/\)/g) || []).length;
      if (Math.abs(parensOpen - parensClose) > 1) errors.push(`${file.path}: unbalanced parens`);

      if (/\bany\b/.test(c) && file.path.includes('schema.ts')) errors.push(`${file.path}: schema 'any' type`);

      const dupImports = new Map<string, number>();
      const importRe = /import\s+(?:{[^}]+}|[^;]+)\s+from\s+["']([^"']+)["']/g;
      let m;
      while ((m = importRe.exec(c)) !== null) {
        dupImports.set(m[1], (dupImports.get(m[1]) || 0) + 1);
      }
      for (const [src, count] of dupImports) {
        if (count > 1) errors.push(`${file.path}: duplicate import "${src}"`);
      }
    }

    if (isTSX) {
      const hasExport = /export\s+(default|const|function|{)/.test(c);
      if (!hasExport && !file.path.includes('main.tsx') && !file.path.includes('index.tsx')) {
        errors.push(`${file.path}: no export`);
      }
      if (/return\s*\(\s*\)\s*;/.test(c)) errors.push(`${file.path}: empty JSX`);
    }

    if (file.path === 'package.json') {
      try {
        const pkg = JSON.parse(c);
        if (!pkg.name) errors.push('package.json: missing name');
        if (!pkg.scripts?.dev) errors.push('package.json: missing dev script');
        if (!pkg.dependencies?.react) errors.push('package.json: missing react');
      } catch { errors.push('package.json: invalid JSON'); }
    }

    if (file.path === 'tsconfig.json') {
      try {
        JSON.parse(c.replace(/\/\/[^\n]*/g, '').replace(/\/\*[\s\S]*?\*\//g, ''));
      } catch { errors.push('tsconfig.json: invalid JSON'); }
    }

    if (file.path === 'index.html') {
      if (!c.includes('<div id="root"')) errors.push('index.html: missing root div');
      if (!c.includes('main.tsx')) errors.push('index.html: missing main.tsx');
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
      if (!extensions.some(ext => filePaths.includes(importPath + ext))) {
        errors.push(`[broken-import] ${file.path}: "${match[1]}"`);
      }
    }
  }

  const appFile = files.find((f: any) => f.path?.includes('App.tsx'));
  if (appFile) {
    for (const page of plan.pages || []) {
      if (page.path && !appFile.content?.includes(page.path)) {
        errors.push(`[missing-route] "${page.name}" route "${page.path}"`);
      }
    }
  }

  const schemaFile = files.find((f: any) => f.path?.includes('schema.ts'));
  if (schemaFile) {
    for (const entity of plan.dataModel || []) {
      const tableName = entity.name.toLowerCase().replace(/\s+/g, '');
      if (!schemaFile.content?.toLowerCase().includes(tableName)) {
        errors.push(`[missing-entity] "${entity.name}" not in schema`);
      }
    }
  }

  return errors;
}

function runSingleScenario(id: number, input: string, category: string): StressTestResult {
  const start = Date.now();
  const result: StressTestResult = {
    id, scenario: input.length > 80 ? input.slice(0, 77) + '...' : input,
    category, passed: false, errors: [], warnings: [], timeMs: 0,
    stats: {},
  };

  let understanding: any;
  try {
    understanding = analyzeRequest(input);
    if (!understanding) { result.errors.push('analyzeRequest returned null'); result.timeMs = Date.now() - start; return result; }
    if (typeof understanding.confidence !== 'number') result.errors.push('confidence not a number');
  } catch (err: any) {
    result.errors.push(`[CRASH:analyzeRequest] ${err.message}`);
    result.timeMs = Date.now() - start;
    return result;
  }

  let plan: ProjectPlan;
  try {
    plan = generatePlan(understanding);
    if (!plan) { result.errors.push('generatePlan returned null'); result.timeMs = Date.now() - start; return result; }
    if (!plan.projectName) result.errors.push('empty projectName');
    if (!plan.dataModel || !Array.isArray(plan.dataModel)) result.errors.push('dataModel missing');
    if (!plan.pages || !Array.isArray(plan.pages)) result.errors.push('pages missing');
    if (!plan.apiEndpoints || !Array.isArray(plan.apiEndpoints)) result.errors.push('apiEndpoints missing');

    if (plan.dataModel) {
      for (const entity of plan.dataModel) {
        if (!entity.name) result.errors.push('entity with no name');
        if (!entity.tableName) result.errors.push(`${entity.name}: no tableName`);
        if (!entity.fields?.length) result.errors.push(`${entity.name}: no fields`);
        if (!entity.fields?.some(f => f.name === 'id')) result.errors.push(`${entity.name}: no id`);
      }
      const names = plan.dataModel.map(e => e.name);
      const dupes = names.filter((n, i) => names.indexOf(n) !== i);
      if (dupes.length) result.errors.push(`duplicate entities: ${dupes.join(',')}`);
    }

    if (plan.pages) {
      for (const page of plan.pages) {
        if (!page.path) result.errors.push(`page "${page.name}" no path`);
        if (page.path && !page.path.startsWith('/')) result.errors.push(`page "${page.name}" path no /`);
      }
    }

    if (plan.apiEndpoints) {
      for (const ep of plan.apiEndpoints) {
        if (ep.path && !ep.path.startsWith('/api/')) result.errors.push(`endpoint ${ep.path} no /api/`);
      }
    }

    result.stats.entities = plan.dataModel?.length || 0;
    result.stats.pages = plan.pages?.length || 0;
    result.stats.endpoints = plan.apiEndpoints?.length || 0;
  } catch (err: any) {
    result.errors.push(`[CRASH:generatePlan] ${err.message}`);
    result.timeMs = Date.now() - start;
    return result;
  }

  try {
    const reasoning = analyzeSemantics(plan);
    const designSystem = generateDesignSystem(plan, reasoning);
    const { files, validation } = generateProject(plan, reasoning, designSystem);

    result.stats.files = files.length;

    const fileErrors = validateGeneratedFiles(files, plan);
    if (fileErrors.length > 0) result.errors.push(...fileErrors);

    for (const err of validation.errors) {
      result.errors.push(`[validator] ${err.file}: ${err.message}`);
    }
  } catch (err: any) {
    result.errors.push(`[CRASH:generateProject] ${err.message}`);
    result.timeMs = Date.now() - start;
    return result;
  }

  result.passed = result.errors.length === 0;
  result.timeMs = Date.now() - start;
  return result;
}

function classifyError(error: string): string {
  if (error.includes('CRASH')) return 'crash';
  if (error.includes('broken-import')) return 'broken-import';
  if (error.includes('missing-route')) return 'missing-route';
  if (error.includes('missing-entity')) return 'missing-entity';
  if (error.includes('validator')) return 'validator';
  if (error.includes('unbalanced')) return 'syntax';
  if (error.includes('duplicate')) return 'duplicate';
  if (error.includes('Missing')) return 'missing-file';
  if (error.includes('no export')) return 'no-export';
  if (error.includes('empty')) return 'empty-content';
  return 'other';
}

async function runMegaStressTest() {
  const effectiveTotal = TOTAL_ITERATIONS - START_OFFSET;
  console.log(`\n${'='.repeat(90)}`);
  console.log(`  MEGA STRESS TEST — ${effectiveTotal.toLocaleString()} iterations with LEARNING`);
  if (START_OFFSET > 0) console.log(`  Continuing from offset ${START_OFFSET.toLocaleString()}`);
  console.log(`  Batch size: ${BATCH_SIZE} | Learning saves every ${LEARNING_SAVE_INTERVAL}`);
  console.log(`${'='.repeat(90)}\n`);

  const globalStats = {
    passed: 0,
    failed: 0,
    crashed: 0,
    total: 0,
    errorFrequency: new Map<string, number>(),
    errorClassFrequency: new Map<string, number>(),
    categoryStats: new Map<string, { passed: number; failed: number; total: number }>(),
    batchResults: [] as { batch: number; passed: number; failed: number; passRate: string }[],
    learningFixes: 0,
    startTime: Date.now(),
  };

  const totalBatches = Math.ceil(effectiveTotal / BATCH_SIZE);

  for (let batch = 0; batch < totalBatches; batch++) {
    const batchStart = Date.now();
    const batchOffset = START_OFFSET + batch * BATCH_SIZE;
    const batchEnd = Math.min(batchOffset + BATCH_SIZE, TOTAL_ITERATIONS);
    const batchSize = batchEnd - batchOffset;

    let batchPassed = 0;
    let batchFailed = 0;

    process.stdout.write(`\n--- Batch ${batch + 1}/${totalBatches} [${batchOffset + 1}-${batchEnd}] ---\n`);

    for (let i = batchOffset; i < batchEnd; i++) {
      const { input, category } = generateRandomScenario(i);
      const result = runSingleScenario(i + 1, input, category);

      globalStats.total++;
      const catStats = globalStats.categoryStats.get(category) || { passed: 0, failed: 0, total: 0 };
      catStats.total++;

      if (result.passed) {
        globalStats.passed++;
        batchPassed++;
        catStats.passed++;

        learningEngine.learnFromErrors([], {} as any);

        if (result.stats.entities && result.stats.entities > 0) {
          try {
            const understanding = analyzeRequest(input);
            const plan = generatePlan(understanding);
            await learningEngine.recordGenerationOutcome({
              plan,
              files: [],
              success: true,
              qualityScore: 100 - (result.warnings.length * 5),
              domainId: understanding.level2_domain?.primaryDomain?.id,
              errors: [],
              autoFixes: [],
            });
          } catch {}
        }
      } else {
        globalStats.failed++;
        batchFailed++;
        catStats.failed++;

        const isCrash = result.errors.some(e => e.includes('CRASH'));
        if (isCrash) globalStats.crashed++;

        for (const err of result.errors) {
          const key = err.replace(/".+?"/g, '"..."').replace(/`.+?`/g, '`..`').slice(0, 120);
          globalStats.errorFrequency.set(key, (globalStats.errorFrequency.get(key) || 0) + 1);

          const errClass = classifyError(err);
          globalStats.errorClassFrequency.set(errClass, (globalStats.errorClassFrequency.get(errClass) || 0) + 1);
        }

        try {
          const understanding = analyzeRequest(input);
          const plan = generatePlan(understanding);
          learningEngine.learnFromErrors(result.errors, plan);
          await learningEngine.recordGenerationOutcome({
            plan,
            files: [],
            success: false,
            qualityScore: 0,
            domainId: understanding.level2_domain?.primaryDomain?.id,
            errors: result.errors,
            autoFixes: [],
          });
          globalStats.learningFixes++;
        } catch {}
      }

      globalStats.categoryStats.set(category, catStats);

      if (globalStats.total % LEARNING_SAVE_INTERVAL === 0) {
        learningEngine.persistToFile();
      }

      if (globalStats.total % 100 === 0) {
        const pct = ((globalStats.passed / globalStats.total) * 100).toFixed(1);
        const elapsed = ((Date.now() - globalStats.startTime) / 1000).toFixed(0);
        process.stdout.write(`  [${globalStats.total.toLocaleString()}/${TOTAL_ITERATIONS.toLocaleString()}] ${pct}% pass rate | ${elapsed}s elapsed\n`);
      }
    }

    const batchPassRate = ((batchPassed / batchSize) * 100).toFixed(1);
    const batchTimeS = ((Date.now() - batchStart) / 1000).toFixed(1);
    globalStats.batchResults.push({
      batch: batch + 1,
      passed: batchPassed,
      failed: batchFailed,
      passRate: batchPassRate,
    });

    process.stdout.write(`  Batch ${batch + 1}: ${batchPassed}/${batchSize} passed (${batchPassRate}%) in ${batchTimeS}s\n`);

    learningEngine.persistToFile();
  }

  const totalTimeS = ((Date.now() - globalStats.startTime) / 1000).toFixed(1);
  const overallPassRate = ((globalStats.passed / globalStats.total) * 100).toFixed(2);

  console.log(`\n${'='.repeat(90)}`);
  console.log(`  MEGA STRESS TEST COMPLETE`);
  console.log(`${'='.repeat(90)}`);
  console.log(`\n  Total:       ${globalStats.total.toLocaleString()} iterations`);
  console.log(`  Passed:      ${globalStats.passed.toLocaleString()} (${overallPassRate}%)`);
  console.log(`  Failed:      ${globalStats.failed.toLocaleString()}`);
  console.log(`  Crashes:     ${globalStats.crashed.toLocaleString()}`);
  console.log(`  Time:        ${totalTimeS}s`);
  console.log(`  Patterns learned: ${globalStats.learningFixes}`);

  console.log(`\n--- BATCH PROGRESSION ---`);
  for (const b of globalStats.batchResults) {
    const bar = '█'.repeat(Math.floor(parseFloat(b.passRate) / 2)) + '░'.repeat(50 - Math.floor(parseFloat(b.passRate) / 2));
    console.log(`  Batch ${String(b.batch).padStart(2)}: ${bar} ${b.passRate}% (${b.passed}/${b.passed + b.failed})`);
  }

  console.log(`\n--- RESULTS BY CATEGORY ---`);
  const sortedCategories = Array.from(globalStats.categoryStats.entries())
    .sort((a, b) => (a[1].passed / a[1].total) - (b[1].passed / b[1].total));
  for (const [cat, stats] of sortedCategories) {
    const pct = ((stats.passed / stats.total) * 100).toFixed(1);
    console.log(`  ${cat.padEnd(20)} ${String(stats.passed).padStart(5)}/${String(stats.total).padStart(5)} (${pct}%)`);
  }

  console.log(`\n--- ERROR CLASS DISTRIBUTION ---`);
  const sortedClasses = Array.from(globalStats.errorClassFrequency.entries())
    .sort((a, b) => b[1] - a[1]);
  for (const [cls, count] of sortedClasses) {
    console.log(`  ${cls.padEnd(20)} ${String(count).padStart(6)}x`);
  }

  console.log(`\n--- TOP 25 MOST COMMON ERRORS ---`);
  const sortedErrors = Array.from(globalStats.errorFrequency.entries())
    .sort((a, b) => b[1] - a[1]);
  for (const [err, count] of sortedErrors.slice(0, 25)) {
    console.log(`  ${String(count).padStart(5)}x  ${err}`);
  }

  learningEngine.persistToFile();

  const learningStats = await learningEngine.getLearningStats();
  console.log(`\n--- LEARNING ENGINE STATE ---`);
  console.log(`  Total patterns:    ${learningStats.totalPatterns}`);
  console.log(`  Reliable (>70%):   ${learningStats.reliablePatterns}`);
  console.log(`  Preferences:       ${learningStats.totalPreferences}`);
  console.log(`  Patterns by type:`);
  for (const [type, count] of Object.entries(learningStats.patternsByType)) {
    console.log(`    ${type.padEnd(20)} ${count}`);
  }

  const report = {
    timestamp: new Date().toISOString(),
    totalIterations: globalStats.total,
    passed: globalStats.passed,
    failed: globalStats.failed,
    crashed: globalStats.crashed,
    passRate: overallPassRate,
    timeSeconds: parseFloat(totalTimeS),
    batchProgression: globalStats.batchResults,
    categoryBreakdown: Object.fromEntries(
      Array.from(globalStats.categoryStats.entries()).map(([k, v]) => [k, {
        ...v,
        passRate: ((v.passed / v.total) * 100).toFixed(1),
      }])
    ),
    errorClassDistribution: Object.fromEntries(globalStats.errorClassFrequency),
    top50Errors: sortedErrors.slice(0, 50).map(([err, count]) => ({ error: err, count })),
    learningStats,
  };

  const reportPath = path.join(process.cwd(), 'mega-stress-test-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf-8');
  console.log(`\n  Full report saved to: ${reportPath}`);

  console.log(`\n${'='.repeat(90)}`);
  console.log(`  FINAL: ${globalStats.passed.toLocaleString()}/${globalStats.total.toLocaleString()} passed (${overallPassRate}%)`);
  console.log(`${'='.repeat(90)}\n`);

  return report;
}

runMegaStressTest().catch(console.error);
