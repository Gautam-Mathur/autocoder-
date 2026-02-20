import { analyzeRequest, type UnderstandingResult } from '../../server/modules/deep-understanding-engine.js';
import { generatePlan, type ProjectPlan } from '../../server/modules/plan-generator.js';
import { analyzeSemantics, type ReasoningResult } from '../../server/modules/contextual-reasoning-engine.js';
import { designSchema, type SchemaDesign } from '../../server/modules/schema-designer.js';
import { designAPI, type APIDesign } from '../../server/modules/api-designer.js';
import { composeComponents, type ComponentTree } from '../../server/modules/component-composer.js';
import { analyzeCodeQuality, type QualityReport, type GeneratedFile as QualityFile } from '../../server/modules/code-quality-engine.js';
import { resolveDependencies, type DependencyManifest, type GeneratedFile as DepFile } from '../../server/modules/dependency-resolver.js';
import { synthesizeDomain, extractEntitiesFromText, type SynthesizedDomain } from '../../server/modules/domain-synthesis-engine.js';
import { assessComplexity, identifyInformationGaps, generateClarificationQuestions, createClarificationState } from '../../server/modules/adaptive-clarification-engine.js';
import { generateTestFiles } from '../../server/modules/test-generator.js';
import { generateDesignSystem } from '../../server/modules/design-system-engine.js';
import { generateFunctionalitySpec } from '../../server/modules/functionality-engine.js';
import { GenerationLearningEngine } from '../../server/modules/generation-learning-engine.js';
import * as fs from 'fs';

type ModuleName = 'schema' | 'api' | 'component' | 'quality' | 'dependency' | 'domain' | 'clarification' | 'testgen' | 'understanding' | 'planner';

const MODULE = (process.env.MODULE || 'all') as ModuleName | 'all';
const TOTAL_ITERATIONS = parseInt(process.env.TOTAL_ITERATIONS || '10000', 10);
const BATCH_SIZE = parseInt(process.env.BATCH_SIZE || '1000', 10);
const LEARNING_SAVE_INTERVAL = 500;

const learningEngine = new GenerationLearningEngine();

const DOMAINS = [
  'consulting', 'manufacturing', 'healthcare', 'retail', 'education',
  'realestate', 'hr', 'restaurant', 'fitness', 'logistics',
  'finance', 'project-management', 'crm', 'inventory',
];

const DOMAIN_NOUNS: Record<string, string[]> = {
  consulting: ['consulting firm', 'advisory agency', 'consultancy', 'strategy firm'],
  manufacturing: ['factory', 'manufacturing plant', 'production facility', 'assembly line'],
  healthcare: ['hospital', 'clinic', 'medical center', 'dental practice', 'pharmacy', 'urgent care'],
  retail: ['store', 'shop', 'boutique', 'e-commerce store', 'online marketplace', 'outlet'],
  education: ['school', 'university', 'training center', 'online learning platform', 'academy'],
  realestate: ['real estate agency', 'property management company', 'rental platform', 'brokerage'],
  hr: ['HR department', 'staffing agency', 'recruitment firm', 'talent agency'],
  restaurant: ['restaurant', 'café', 'bakery', 'food truck', 'catering company', 'diner'],
  fitness: ['gym', 'fitness center', 'yoga studio', 'personal training studio', 'CrossFit box'],
  logistics: ['shipping company', 'delivery service', 'freight company', 'warehouse', 'courier service'],
  finance: ['accounting firm', 'bank', 'investment firm', 'fintech startup', 'credit union'],
  'project-management': ['software team', 'agency', 'startup', 'development shop', 'design studio'],
  crm: ['sales team', 'marketing agency', 'business development group', 'account team'],
  inventory: ['warehouse', 'distribution center', 'supply chain', 'stockroom', 'fulfillment center'],
};

const FEATURES = [
  'time tracking', 'invoicing', 'billing', 'reporting', 'analytics dashboard',
  'user authentication', 'role-based access', 'email notifications',
  'calendar scheduling', 'appointment booking', 'task management', 'kanban board',
  'file upload', 'document management', 'search and filters', 'data export',
  'real-time updates', 'chat messaging', 'inventory tracking', 'order management',
  'payment processing', 'subscription management', 'customer portal',
  'attendance tracking', 'leave management', 'payroll', 'expense tracking',
  'approval workflows', 'custom fields', 'tags and categories', 'bulk actions',
  'drag and drop', 'charts and graphs', 'map view', 'timeline view',
  'activity feed', 'commenting system', 'rating and reviews', 'notifications center',
  'multi-language support', 'dark mode', 'audit logging', 'two-factor auth',
  'API integrations', 'webhooks', 'batch import', 'PDF generation',
  'barcode scanning', 'QR codes', 'geolocation', 'push notifications',
];

const NOVEL_APPS = [
  'pet adoption matching platform', 'music practice logger', 'plant care tracker',
  'book club organizer', 'volunteer coordination platform', 'wine tasting journal',
  'wedding planning app', 'sports league manager', 'recipe sharing community',
  'freelancer invoicing tool', 'neighborhood tool library', 'study group finder',
  'meal prep planner', 'home renovation tracker', 'garage sale organizer',
  'art portfolio showcase', 'travel itinerary builder', 'podcast management dashboard',
  'community garden planner', 'movie watchlist tracker', 'board game collection manager',
  'daily habit tracker', 'pet sitting marketplace', 'coworking space manager',
  'photography booking platform', 'church management system', 'farm management tool',
  'escape room booking app', 'language exchange platform', 'charity donation tracker',
  'fleet maintenance scheduler', 'workshop registration system', 'student tutoring marketplace',
];

const COMPLEXITY_LEVELS = ['tiny', 'simple', 'medium', 'complex', 'enterprise'];
const AUTH_DESCRIPTIONS = ['no auth needed', 'simple login', 'role-based access with admin and user roles', 'multi-tenant with organization-level access', 'API key authentication'];
const SCALE_DESCRIPTIONS = ['for a solo freelancer', 'for a small team of 5', 'for a company with 50 employees', 'for an enterprise with thousands of users', 'for a startup MVP'];

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function pickN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(n, arr.length));
}
function rng(min: number, max: number): number { return Math.floor(Math.random() * (max - min + 1)) + min; }

function generatePrompt(index: number): { prompt: string; category: string } {
  const category = index % 10;
  switch (category) {
    case 0: {
      const domain = pick(DOMAINS);
      const noun = pick(DOMAIN_NOUNS[domain]);
      const features = pickN(FEATURES, rng(3, 8)).join(', ');
      return { prompt: `Build a management app for a ${noun} with ${features}`, category: 'standard' };
    }
    case 1: {
      const app = pick(NOVEL_APPS);
      const features = pickN(FEATURES, rng(2, 5)).join(', ');
      return { prompt: `Create a ${app} with ${features}`, category: 'novel' };
    }
    case 2: {
      const domain = pick(DOMAINS);
      const noun = pick(DOMAIN_NOUNS[domain]);
      const features = pickN(FEATURES, rng(8, 15)).join(', ');
      return { prompt: `Enterprise-grade system for ${noun}. Must include: ${features}`, category: 'enterprise' };
    }
    case 3: {
      const domain = pick(DOMAINS);
      const noun = pick(DOMAIN_NOUNS[domain]);
      const auth = pick(AUTH_DESCRIPTIONS);
      return { prompt: `Create a platform for a ${noun} with ${auth} and dashboards`, category: 'auth-focused' };
    }
    case 4: {
      const domain = pick(DOMAINS);
      const noun = pick(DOMAIN_NOUNS[domain]);
      return { prompt: `Build a ${noun} app with CRUD, search, filtering, bulk actions, and data export`, category: 'crud-heavy' };
    }
    case 5: {
      const domain = pick(DOMAINS);
      const noun = pick(DOMAIN_NOUNS[domain]);
      return { prompt: `Build a ${noun} platform with kanban, drag and drop, real-time updates, and activity feeds`, category: 'interactive' };
    }
    case 6: {
      const domain = pick(DOMAINS);
      const noun = pick(DOMAIN_NOUNS[domain]);
      return { prompt: `Create a ${noun} analytics dashboard with charts, KPIs, reporting, and data export`, category: 'analytics' };
    }
    case 7: {
      const complexity = pick(COMPLEXITY_LEVELS);
      const domain = pick(DOMAINS);
      const noun = pick(DOMAIN_NOUNS[domain]);
      const features = pickN(FEATURES, rng(3, 7)).join(', ');
      return { prompt: `Build a ${complexity} system for a ${noun} with ${features}`, category: 'complexity-varied' };
    }
    case 8: {
      const scale = pick(SCALE_DESCRIPTIONS);
      const domain = pick(DOMAINS);
      const noun = pick(DOMAIN_NOUNS[domain]);
      return { prompt: `Build an app ${scale} managing a ${noun} with everything they need`, category: 'scale-varied' };
    }
    default: {
      return { prompt: pick([
        'Build a project management tool with tasks, subtasks, milestones, Gantt charts, and team collaboration',
        'Create an e-commerce marketplace with seller dashboard, buyer portal, and admin panel',
        'Design a healthcare system with patient records, appointments, billing, and reporting',
        'Build a social learning platform with courses, forums, and real-time chat',
        'Create a logistics platform tracking shipments, routes, drivers, and warehouses',
        'Build a multi-tenant SaaS for project management with workspace isolation',
        'Design a financial management suite with budgets, invoices, and expense reports',
        'Create a restaurant chain management system with POS, inventory, and HR',
        'Build a recruitment platform with applicant tracking, interview scheduling, and analytics',
        'Create a gym management app with members, classes, trainers, subscriptions, and check-ins',
        'Build a property management system with listings, tenants, leases, maintenance, and payments',
        'Design a helpdesk system with tickets, agents, SLA tracking, knowledge base, and customer portal',
        'Create a fleet management platform with vehicles, drivers, routes, maintenance, and fuel tracking',
        'Build a school management system with students, teachers, classes, grades, and attendance',
        'Create a CRM with contacts, deals, pipeline, email tracking, and activity logging',
      ]), category: 'domain-specific' };
    }
  }
}

interface TestResult {
  index: number;
  prompt: string;
  category: string;
  module: string;
  passed: boolean;
  errors: string[];
  timeMs: number;
  stats: Record<string, any>;
}

function preparePipeline(prompt: string): { understanding: UnderstandingResult; plan: ProjectPlan; reasoning: ReasoningResult } {
  const understanding = analyzeRequest(prompt);
  const plan = generatePlan(understanding);
  const reasoning = analyzeSemantics(plan);
  return { understanding, plan, reasoning };
}

function generateSampleFiles(plan: ProjectPlan): QualityFile[] {
  const files: QualityFile[] = [];
  files.push({
    path: 'src/App.tsx',
    content: `import { Switch, Route } from "wouter";\nimport { QueryClientProvider } from "@tanstack/react-query";\nimport { queryClient } from "./lib/queryClient";\n\nexport default function App() {\n  return (\n    <QueryClientProvider client={queryClient}>\n      <Switch>\n        <Route path="/" component={() => <div>Home</div>} />\n      </Switch>\n    </QueryClientProvider>\n  );\n}\n`,
    language: 'tsx',
  });
  for (const entity of plan.dataModel || []) {
    const name = entity.name;
    files.push({
      path: `src/pages/${name}Page.tsx`,
      content: `import { useQuery } from "@tanstack/react-query";\n\nexport default function ${name}Page() {\n  const { data, isLoading, error } = useQuery({ queryKey: ["/api/${name.toLowerCase()}s"] });\n  if (isLoading) return <div>Loading...</div>;\n  if (error) return <div>Error loading data</div>;\n  if (!data || (data as any[]).length === 0) return <div>No ${name.toLowerCase()}s found</div>;\n  return <div>{JSON.stringify(data)}</div>;\n}\n`,
      language: 'tsx',
    });
    files.push({
      path: `server/routes/${name.toLowerCase()}.ts`,
      content: `import { Router } from "express";\nimport { db } from "../db";\n\nconst router = Router();\n\nrouter.get("/api/${name.toLowerCase()}s", async (req, res) => {\n  try {\n    const items = await db.select().from("${name.toLowerCase()}s");\n    res.json(items);\n  } catch (err: any) {\n    res.status(500).json({ error: true, message: err.message });\n  }\n});\n\nrouter.post("/api/${name.toLowerCase()}s", async (req, res) => {\n  try {\n    const item = await db.insert("${name.toLowerCase()}s").values(req.body);\n    res.status(201).json(item);\n  } catch (err: any) {\n    res.status(500).json({ error: true, message: err.message });\n  }\n});\n\nexport default router;\n`,
      language: 'ts',
    });
  }
  files.push({
    path: 'shared/schema.ts',
    content: `import { pgTable, serial, text, varchar, integer, boolean, timestamp } from "drizzle-orm/pg-core";\nimport { createInsertSchema } from "drizzle-zod";\n\n${(plan.dataModel || []).map(e => `export const ${e.name.toLowerCase()}s = pgTable("${e.name.toLowerCase()}s", {\n  id: serial("id").primaryKey(),\n  name: text("name").notNull(),\n});\n\nexport const insert${e.name}Schema = createInsertSchema(${e.name.toLowerCase()}s).omit({ id: true });\nexport type ${e.name} = typeof ${e.name.toLowerCase()}s.$inferSelect;\n`).join('\n')}\n`,
    language: 'ts',
  });
  return files;
}

function validateSchema(schema: SchemaDesign, plan: ProjectPlan): string[] {
  const errors: string[] = [];
  if (!schema.tables || !Array.isArray(schema.tables)) errors.push('schema: missing tables');
  else {
    if (schema.tables.length === 0) errors.push('schema: empty tables');
    for (const t of schema.tables) {
      if (!t.name) errors.push('schema: table missing name');
      if (!t.entityName) errors.push(`schema: table ${t.name} missing entityName`);
      if (!t.primaryKey) errors.push(`schema: table ${t.name} missing primaryKey`);
      if (!t.columns || t.columns.length === 0) errors.push(`schema: table ${t.name} has no columns`);
      else {
        for (const col of t.columns) {
          if (!col.name) errors.push(`schema: table ${t.name} column missing name`);
          if (!col.type) errors.push(`schema: table ${t.name} column ${col.name} missing type`);
          const validTypes = ['serial', 'integer', 'bigint', 'varchar', 'text', 'boolean', 'timestamp', 'date', 'time', 'decimal', 'float', 'json', 'jsonb', 'uuid', 'enum'];
          if (col.type && !validTypes.includes(col.type)) errors.push(`schema: table ${t.name} column ${col.name} invalid type "${col.type}"`);
        }
      }
      if (!Array.isArray(t.indexes)) errors.push(`schema: table ${t.name} missing indexes array`);
      if (!Array.isArray(t.constraints)) errors.push(`schema: table ${t.name} missing constraints array`);
      if (!Array.isArray(t.foreignKeys)) errors.push(`schema: table ${t.name} missing foreignKeys array`);
      for (const fk of t.foreignKeys || []) {
        if (!fk.column) errors.push(`schema: table ${t.name} FK missing column`);
        if (!fk.referencesTable) errors.push(`schema: table ${t.name} FK missing referencesTable`);
        if (!fk.referencesColumn) errors.push(`schema: table ${t.name} FK missing referencesColumn`);
        const validOnDelete = ['cascade', 'set-null', 'restrict', 'no-action'];
        if (!validOnDelete.includes(fk.onDelete)) errors.push(`schema: table ${t.name} FK invalid onDelete "${fk.onDelete}"`);
      }
    }
  }
  if (!Array.isArray(schema.junctionTables)) errors.push('schema: missing junctionTables');
  if (!Array.isArray(schema.enums)) errors.push('schema: missing enums');
  if (!Array.isArray(schema.indexes)) errors.push('schema: missing indexes');
  if (!Array.isArray(schema.constraints)) errors.push('schema: missing constraints');
  if (!schema.auditStrategy) errors.push('schema: missing auditStrategy');
  else {
    if (typeof schema.auditStrategy.timestampColumns !== 'boolean') errors.push('schema: auditStrategy.timestampColumns not boolean');
  }
  if (typeof schema.softDelete !== 'boolean') errors.push('schema: softDelete not boolean');
  if (!Array.isArray(schema.migrationNotes)) errors.push('schema: missing migrationNotes');
  return errors;
}

function validateAPI(api: APIDesign, plan: ProjectPlan): string[] {
  const errors: string[] = [];
  if (!api.basePath) errors.push('api: missing basePath');
  if (!api.version) errors.push('api: missing version');
  if (!api.routes || !Array.isArray(api.routes)) errors.push('api: missing routes');
  else {
    if (api.routes.length === 0) errors.push('api: no routes');
    const validMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
    const validOps = ['list', 'get', 'create', 'update', 'patch', 'delete', 'search', 'batch', 'custom'];
    for (const r of api.routes) {
      if (!r.method || !validMethods.includes(r.method)) errors.push(`api: route invalid method "${r.method}"`);
      if (!r.path) errors.push('api: route missing path');
      if (!r.handler) errors.push(`api: route ${r.path} missing handler`);
      if (!r.entity) errors.push(`api: route ${r.path} missing entity`);
      if (!validOps.includes(r.operation)) errors.push(`api: route ${r.path} invalid operation "${r.operation}"`);
      if (!r.responseSchema) errors.push(`api: route ${r.path} missing responseSchema`);
      else {
        const validShapes = ['single', 'list', 'paginated', 'empty'];
        if (!validShapes.includes(r.responseSchema.shape)) errors.push(`api: route ${r.path} invalid response shape "${r.responseSchema.shape}"`);
      }
      if (!Array.isArray(r.middleware)) errors.push(`api: route ${r.path} middleware not array`);
    }
  }
  if (!api.middleware || !Array.isArray(api.middleware)) errors.push('api: missing middleware');
  else {
    for (const m of api.middleware) {
      if (!m.name) errors.push('api: middleware missing name');
      if (!m.purpose) errors.push(`api: middleware ${m.name} missing purpose`);
      if (typeof m.order !== 'number') errors.push(`api: middleware ${m.name} missing order`);
    }
  }
  if (!api.errorFormat) errors.push('api: missing errorFormat');
  if (!api.pagination) errors.push('api: missing pagination');
  else {
    const validStrategies = ['offset', 'cursor'];
    if (!validStrategies.includes(api.pagination.strategy)) errors.push(`api: invalid pagination strategy "${api.pagination.strategy}"`);
    if (typeof api.pagination.defaultPageSize !== 'number') errors.push('api: pagination missing defaultPageSize');
    if (typeof api.pagination.maxPageSize !== 'number') errors.push('api: pagination missing maxPageSize');
  }
  if (!api.rateLimiting) errors.push('api: missing rateLimiting');
  if (!api.validation) errors.push('api: missing validation');
  if (!api.responseFormat) errors.push('api: missing responseFormat');
  return errors;
}

function validateComponentTree(tree: ComponentTree, plan: ProjectPlan): string[] {
  const errors: string[] = [];
  if (!tree.components || !Array.isArray(tree.components)) errors.push('comp: missing components');
  else {
    if (tree.components.length === 0) errors.push('comp: empty components');
    const validTypes = ['page', 'container', 'presentational', 'layout', 'form', 'list', 'detail', 'widget', 'modal'];
    for (const c of tree.components) {
      if (!c.name) errors.push('comp: component missing name');
      if (!validTypes.includes(c.type)) errors.push(`comp: ${c.name} invalid type "${c.type}"`);
      if (!c.path) errors.push(`comp: ${c.name} missing path`);
      if (!Array.isArray(c.props)) errors.push(`comp: ${c.name} missing props array`);
      if (!Array.isArray(c.state)) errors.push(`comp: ${c.name} missing state array`);
      if (!Array.isArray(c.children)) errors.push(`comp: ${c.name} missing children array`);
      if (!Array.isArray(c.hooks)) errors.push(`comp: ${c.name} missing hooks array`);
      if (!c.accessibility) errors.push(`comp: ${c.name} missing accessibility`);
      else {
        if (typeof c.accessibility.keyboardNav !== 'boolean') errors.push(`comp: ${c.name} accessibility.keyboardNav not boolean`);
      }
      for (const p of c.props || []) {
        if (!p.name) errors.push(`comp: ${c.name} prop missing name`);
        if (!p.type) errors.push(`comp: ${c.name} prop ${p.name} missing type`);
      }
      for (const s of c.state || []) {
        if (!s.name) errors.push(`comp: ${c.name} state missing name`);
        const validSources = ['local', 'context', 'server', 'url'];
        if (!validSources.includes(s.source)) errors.push(`comp: ${c.name} state ${s.name} invalid source "${s.source}"`);
      }
    }
  }
  if (!tree.layouts || !Array.isArray(tree.layouts)) errors.push('comp: missing layouts');
  else {
    const validLayoutTypes = ['sidebar', 'topbar', 'split', 'stack', 'grid', 'full-width'];
    for (const l of tree.layouts) {
      if (!l.name) errors.push('comp: layout missing name');
      if (!validLayoutTypes.includes(l.type)) errors.push(`comp: layout ${l.name} invalid type "${l.type}"`);
      if (!Array.isArray(l.slots)) errors.push(`comp: layout ${l.name} missing slots`);
    }
  }
  if (!tree.contexts || !Array.isArray(tree.contexts)) errors.push('comp: missing contexts');
  if (!tree.sharedHooks || !Array.isArray(tree.sharedHooks)) errors.push('comp: missing sharedHooks');
  if (!tree.accessibility) errors.push('comp: missing accessibility plan');
  else {
    if (typeof tree.accessibility.skipLinks !== 'boolean') errors.push('comp: accessibility.skipLinks not boolean');
    if (typeof tree.accessibility.colorContrast !== 'boolean') errors.push('comp: accessibility.colorContrast not boolean');
    if (typeof tree.accessibility.reducedMotion !== 'boolean') errors.push('comp: accessibility.reducedMotion not boolean');
  }
  if (!tree.responsive) errors.push('comp: missing responsive strategy');
  else {
    const validApproaches = ['mobile-first', 'desktop-first'];
    if (!validApproaches.includes(tree.responsive.approach)) errors.push(`comp: invalid responsive approach "${tree.responsive.approach}"`);
  }
  if (!tree.animations) errors.push('comp: missing animation plan');
  if (!tree.reusabilityMap) errors.push('comp: missing reusabilityMap');
  return errors;
}

function validateQualityReport(report: QualityReport): string[] {
  const errors: string[] = [];
  if (typeof report.overallScore !== 'number') errors.push('quality: overallScore not number');
  else if (report.overallScore < 0 || report.overallScore > 100) errors.push(`quality: overallScore out of range ${report.overallScore}`);
  const validGrades = ['A+', 'A', 'B', 'C', 'D', 'F'];
  if (!validGrades.includes(report.grade)) errors.push(`quality: invalid grade "${report.grade}"`);
  if (!Array.isArray(report.categories)) errors.push('quality: missing categories');
  else {
    for (const cat of report.categories) {
      if (!cat.name) errors.push('quality: category missing name');
      if (typeof cat.score !== 'number') errors.push(`quality: category ${cat.name} score not number`);
      if (typeof cat.maxScore !== 'number') errors.push(`quality: category ${cat.name} maxScore not number`);
      if (!cat.description) errors.push(`quality: category ${cat.name} missing description`);
    }
  }
  if (!Array.isArray(report.issues)) errors.push('quality: missing issues');
  else {
    const validSeverities = ['error', 'warning', 'info'];
    for (const issue of report.issues) {
      if (!validSeverities.includes(issue.severity)) errors.push(`quality: issue invalid severity "${issue.severity}"`);
      if (!issue.message) errors.push('quality: issue missing message');
      if (!issue.file) errors.push('quality: issue missing file');
      if (!issue.rule) errors.push('quality: issue missing rule');
    }
  }
  if (!Array.isArray(report.warnings)) errors.push('quality: missing warnings array');
  if (!Array.isArray(report.fixes)) errors.push('quality: missing fixes array');
  if (!report.metrics) errors.push('quality: missing metrics');
  else {
    if (typeof report.metrics.totalFiles !== 'number') errors.push('quality: metrics.totalFiles not number');
    if (typeof report.metrics.totalLines !== 'number') errors.push('quality: metrics.totalLines not number');
  }
  return errors;
}

function validateDependencyManifest(manifest: DependencyManifest): string[] {
  const errors: string[] = [];
  if (!manifest.dependencies || typeof manifest.dependencies !== 'object') errors.push('dep: missing dependencies');
  else {
    if (Object.keys(manifest.dependencies).length === 0) errors.push('dep: empty dependencies');
    for (const [pkg, ver] of Object.entries(manifest.dependencies)) {
      if (!pkg) errors.push('dep: dependency missing name');
      if (!ver || typeof ver !== 'string') errors.push(`dep: ${pkg} missing version`);
      if (ver && !ver.startsWith('^') && !ver.startsWith('~') && !ver.match(/^\d/) && ver !== 'latest' && ver !== '*') errors.push(`dep: ${pkg} invalid version "${ver}"`);
    }
  }
  if (!manifest.devDependencies || typeof manifest.devDependencies !== 'object') errors.push('dep: missing devDependencies');
  if (!manifest.peerDependencies || typeof manifest.peerDependencies !== 'object') errors.push('dep: missing peerDependencies');
  if (!Array.isArray(manifest.warnings)) errors.push('dep: missing warnings array');
  if (!Array.isArray(manifest.optimizations)) errors.push('dep: missing optimizations array');
  if (!manifest.bundleSizeEstimate) errors.push('dep: missing bundleSizeEstimate');
  else {
    if (typeof manifest.bundleSizeEstimate.totalKB !== 'number') errors.push('dep: bundleSizeEstimate.totalKB not number');
    if (!Array.isArray(manifest.bundleSizeEstimate.breakdown)) errors.push('dep: bundleSizeEstimate.breakdown not array');
  }
  if (!Array.isArray(manifest.securityNotes)) errors.push('dep: missing securityNotes');
  const requiredDeps = ['react', 'react-dom'];
  for (const req of requiredDeps) {
    if (!manifest.dependencies[req]) errors.push(`dep: missing required dependency "${req}"`);
  }
  return errors;
}

function validateDomainSynthesis(prompt: string): string[] {
  const errors: string[] = [];
  const domain = synthesizeDomain(prompt);
  if (!domain) errors.push('domain: synthesizeDomain returned null');
  else {
    if (!domain.name) errors.push('domain: missing name');
    if (!domain.description) errors.push('domain: missing description');
    if (!Array.isArray(domain.entities) || domain.entities.length === 0) errors.push('domain: missing or empty entities');
    else {
      for (const e of domain.entities) {
        if (!e.name) errors.push('domain: entity missing name');
        if (!Array.isArray(e.fields) || e.fields.length === 0) errors.push(`domain: entity ${e.name} missing fields`);
      }
    }
    if (!Array.isArray(domain.workflows)) errors.push('domain: missing workflows');
    if (!Array.isArray(domain.roles)) errors.push('domain: missing roles');
    if (!Array.isArray(domain.commonIntegrations)) errors.push('domain: missing commonIntegrations');
  }
  const extraction = extractEntitiesFromText(prompt);
  if (!extraction) errors.push('domain: extractEntitiesFromText returned null');
  else {
    if (!Array.isArray(extraction.entities)) errors.push('domain: extraction missing entities');
    if (!Array.isArray(extraction.workflows)) errors.push('domain: extraction missing workflows');
    if (!Array.isArray(extraction.roles)) errors.push('domain: extraction missing roles');
  }
  return errors;
}

function validateClarification(prompt: string): string[] {
  const errors: string[] = [];
  const extraction = extractEntitiesFromText(prompt);
  const domains = [{ confidence: 0.8, name: 'general' }];
  const complexity = assessComplexity(prompt, extraction, domains);
  if (!complexity) { errors.push('clarify: assessComplexity returned null'); return errors; }
  if (typeof complexity.score !== 'number') errors.push('clarify: complexity.score not number');
  const validLevels = ['trivial', 'simple', 'moderate', 'complex', 'enterprise'];
  if (!validLevels.includes(complexity.level)) errors.push(`clarify: invalid complexity level "${complexity.level}"`);
  if (!Array.isArray(complexity.factors)) errors.push('clarify: missing factors');
  if (typeof complexity.recommendedRounds !== 'number') errors.push('clarify: recommendedRounds not number');
  if (typeof complexity.entityCount !== 'number') errors.push('clarify: entityCount not number');

  const gaps = identifyInformationGaps(prompt, extraction, complexity);
  if (!Array.isArray(gaps)) errors.push('clarify: identifyInformationGaps not array');
  else {
    for (const gap of gaps) {
      if (!gap.category) errors.push('clarify: gap missing category');
      if (!gap.description) errors.push('clarify: gap missing description');
      const validSeverities = ['blocking', 'important', 'nice-to-have'];
      if (!validSeverities.includes(gap.severity)) errors.push(`clarify: gap invalid severity "${gap.severity}"`);
    }
  }

  const questions = generateClarificationQuestions(gaps, complexity, extraction);
  if (!Array.isArray(questions)) errors.push('clarify: questions not array');
  else {
    for (const q of questions) {
      if (!q.id) errors.push('clarify: question missing id');
      if (!q.question) errors.push('clarify: question missing question text');
      const validCategories = ['scope', 'entities', 'workflows', 'ui', 'roles', 'integrations', 'data', 'business-rules'];
      if (!validCategories.includes(q.category)) errors.push(`clarify: question invalid category "${q.category}"`);
      const validImpacts = ['critical', 'high', 'medium', 'low'];
      if (!validImpacts.includes(q.impact)) errors.push(`clarify: question invalid impact "${q.impact}"`);
    }
  }

  const state = createClarificationState(1, prompt, extraction, domains);
  if (!state) errors.push('clarify: createClarificationState returned null');
  else {
    if (typeof state.conversationId !== 'number') errors.push('clarify: state.conversationId not number');
    if (typeof state.readinessScore !== 'number') errors.push('clarify: state.readinessScore not number');
  }
  return errors;
}

function validateTestFiles(files: any[], plan: ProjectPlan): string[] {
  const errors: string[] = [];
  if (!Array.isArray(files)) { errors.push('testgen: not array'); return errors; }
  if (files.length === 0) errors.push('testgen: no test files generated');
  const configFiles = ['setup.ts', 'setup.js', 'vitest.config.ts', 'vitest.config.js', 'jest.config.ts', 'jest.config.js'];
  let testFileCount = 0;
  for (const f of files) {
    if (!f.path) errors.push('testgen: file missing path');
    if (!f.content) errors.push(`testgen: file ${f.path} missing content`);
    const isConfig = configFiles.some(cfg => f.path?.endsWith(cfg));
    if (isConfig) continue;
    testFileCount++;
    if (f.path && !f.path.includes('test') && !f.path.includes('spec') && !f.path.includes('__tests__')) errors.push(`testgen: file ${f.path} not a test file`);
    if (f.content) {
      if (!f.content.includes('describe') && !f.content.includes('test') && !f.content.includes('it('))
        errors.push(`testgen: file ${f.path} has no test constructs`);
      if (!f.content.includes('expect')) errors.push(`testgen: file ${f.path} has no expect assertions`);
    }
  }
  if (testFileCount === 0 && files.length > 0) errors.push('testgen: only config files, no actual test files');
  return errors;
}

function validateUnderstanding(result: UnderstandingResult): string[] {
  const errors: string[] = [];
  if (!result) { errors.push('understand: null result'); return errors; }
  if (!result.level1_intent) errors.push('understand: missing level1_intent');
  else {
    if (!result.level1_intent.primaryGoal) errors.push('understand: missing level1_intent.primaryGoal');
    if (!Array.isArray(result.level1_intent.keyRequirements)) errors.push('understand: keyRequirements not array');
    if (!result.level1_intent.applicationType) errors.push('understand: missing applicationType');
  }
  if (!result.level2_domain) errors.push('understand: missing level2_domain');
  else {
    if (typeof result.level2_domain.confidence !== 'number') errors.push('understand: domain.confidence not number');
    if (!Array.isArray(result.level2_domain.matchedKeywords)) errors.push('understand: matchedKeywords not array');
  }
  if (!result.level3_entities) errors.push('understand: missing level3_entities');
  else {
    if (!Array.isArray(result.level3_entities.mentionedEntities)) errors.push('understand: mentionedEntities not array');
    if (result.level3_entities.mentionedEntities.length === 0 && result.level3_entities.inferredEntities.length === 0) errors.push('understand: no entities detected');
  }
  if (!result.level4_workflows) errors.push('understand: missing level4_workflows');
  if (typeof result.readyForPlan !== 'boolean') errors.push('understand: readyForPlan not boolean');
  return errors;
}

function validatePlan(plan: ProjectPlan): string[] {
  const errors: string[] = [];
  if (!plan) { errors.push('plan: null plan'); return errors; }
  if (!plan.projectName) errors.push('plan: missing projectName');
  if (!plan.overview) errors.push('plan: missing overview');
  if (!Array.isArray(plan.techStack)) errors.push('plan: techStack not array');
  else if (plan.techStack.length === 0) errors.push('plan: empty techStack');
  if (!Array.isArray(plan.modules)) errors.push('plan: modules not array');
  else if (plan.modules.length === 0) errors.push('plan: empty modules');
  if (!Array.isArray(plan.dataModel)) errors.push('plan: dataModel not array');
  else {
    if (plan.dataModel.length === 0) errors.push('plan: empty dataModel');
    for (const e of plan.dataModel) {
      if (!e.name) errors.push('plan: entity missing name');
      if (!Array.isArray(e.fields) || e.fields.length === 0) errors.push(`plan: entity ${e.name} missing fields`);
    }
  }
  if (!Array.isArray(plan.pages)) errors.push('plan: pages not array');
  else {
    if (plan.pages.length === 0) errors.push('plan: empty pages');
    for (const p of plan.pages) {
      if (!p.name) errors.push('plan: page missing name');
      if (!p.path) errors.push(`plan: page ${p.name} missing path`);
    }
  }
  if (!Array.isArray(plan.apiEndpoints)) errors.push('plan: apiEndpoints not array');
  else {
    for (const ep of plan.apiEndpoints) {
      if (!ep.method) errors.push('plan: endpoint missing method');
      if (!ep.path) errors.push(`plan: endpoint missing path`);
      if (!ep.entity) errors.push(`plan: endpoint ${ep.path} missing entity`);
    }
  }
  if (!Array.isArray(plan.workflows)) errors.push('plan: workflows not array');
  if (!Array.isArray(plan.roles)) errors.push('plan: roles not array');
  if (!Array.isArray(plan.fileBlueprint)) errors.push('plan: fileBlueprint not array');
  else if (plan.fileBlueprint.length === 0) errors.push('plan: empty fileBlueprint');
  return errors;
}

function runSingleTest(prompt: string, category: string, module: ModuleName, index: number): TestResult {
  const result: TestResult = { index, prompt, category, module, passed: false, errors: [], timeMs: 0, stats: {} };
  const start = Date.now();

  try {
    switch (module) {
      case 'schema': {
        const { plan, reasoning } = preparePipeline(prompt);
        const schema = designSchema(plan, reasoning);
        result.errors = validateSchema(schema, plan);
        result.stats = { tables: schema.tables?.length || 0, junctions: schema.junctionTables?.length || 0, enums: schema.enums?.length || 0, indexes: schema.indexes?.length || 0 };
        break;
      }
      case 'api': {
        const { plan, reasoning } = preparePipeline(prompt);
        const schema = designSchema(plan, reasoning);
        const api = designAPI(plan, reasoning, schema);
        result.errors = validateAPI(api, plan);
        result.stats = { routes: api.routes?.length || 0, middleware: api.middleware?.length || 0, pagination: api.pagination?.strategy, batch: api.batchOperations?.length || 0 };
        break;
      }
      case 'component': {
        const { plan, reasoning } = preparePipeline(prompt);
        const ds = generateDesignSystem(plan, reasoning);
        const funcSpec = generateFunctionalitySpec(plan, reasoning);
        const tree = composeComponents(plan, reasoning, funcSpec, ds);
        result.errors = validateComponentTree(tree, plan);
        result.stats = { components: tree.components?.length || 0, layouts: tree.layouts?.length || 0, contexts: tree.contexts?.length || 0, hooks: tree.sharedHooks?.length || 0 };
        break;
      }
      case 'quality': {
        const { plan } = preparePipeline(prompt);
        const files = generateSampleFiles(plan);
        const report = analyzeCodeQuality(files, plan);
        result.errors = validateQualityReport(report);
        result.stats = { score: report.overallScore, grade: report.grade, issues: report.issues?.length || 0, fixes: report.fixes?.length || 0, totalFiles: report.metrics?.totalFiles || 0 };
        break;
      }
      case 'dependency': {
        const { plan } = preparePipeline(prompt);
        const files = generateSampleFiles(plan);
        const manifest = resolveDependencies(plan, files as DepFile[]);
        result.errors = validateDependencyManifest(manifest);
        result.stats = { deps: Object.keys(manifest.dependencies || {}).length, devDeps: Object.keys(manifest.devDependencies || {}).length, bundleKB: manifest.bundleSizeEstimate?.totalKB || 0, warnings: manifest.warnings?.length || 0 };
        break;
      }
      case 'domain': {
        result.errors = validateDomainSynthesis(prompt);
        const domain = synthesizeDomain(prompt);
        result.stats = { name: domain?.name || 'null', entities: domain?.entities?.length || 0, workflows: domain?.workflows?.length || 0, roles: domain?.roles?.length || 0 };
        break;
      }
      case 'clarification': {
        result.errors = validateClarification(prompt);
        const extraction = extractEntitiesFromText(prompt);
        const complexity = assessComplexity(prompt, extraction, [{ confidence: 0.8, name: 'general' }]);
        result.stats = { level: complexity.level, score: complexity.score, entityCount: complexity.entityCount, recommendedRounds: complexity.recommendedRounds };
        break;
      }
      case 'testgen': {
        const { plan, reasoning } = preparePipeline(prompt);
        const files = generateTestFiles(plan, reasoning);
        result.errors = validateTestFiles(files, plan);
        result.stats = { testFiles: files?.length || 0, totalAssertions: files?.reduce((s: number, f: any) => s + (f.content?.match(/expect/g)?.length || 0), 0) || 0 };
        break;
      }
      case 'understanding': {
        const understanding = analyzeRequest(prompt);
        result.errors = validateUnderstanding(understanding);
        result.stats = { primary: understanding.level1_intent?.primaryGoal, domain: understanding.level2_domain?.primaryDomain?.name, confidence: understanding.level2_domain?.confidence, entities: (understanding.level3_entities?.mentionedEntities?.length || 0) + (understanding.level3_entities?.inferredEntities?.length || 0), ready: understanding.readyForPlan };
        break;
      }
      case 'planner': {
        const understanding = analyzeRequest(prompt);
        const plan = generatePlan(understanding);
        result.errors = validatePlan(plan);
        result.stats = { projectName: plan.projectName, entities: plan.dataModel?.length || 0, pages: plan.pages?.length || 0, endpoints: plan.apiEndpoints?.length || 0, files: plan.fileBlueprint?.length || 0 };
        break;
      }
    }
  } catch (err: any) {
    result.errors.push(`[CRASH:${module}] ${err.message}`);
  }

  result.passed = result.errors.length === 0;
  result.timeMs = Date.now() - start;
  return result;
}

const MODULE_NAMES: Record<ModuleName, string> = {
  schema: 'Schema Engine',
  api: 'API Design Engine',
  component: 'Component Composition Engine',
  quality: 'Code Quality Engine',
  dependency: 'Dependency Resolution Engine',
  domain: 'Domain Synthesis Engine',
  clarification: 'Adaptive Clarification Engine',
  testgen: 'Test Generation Engine',
  understanding: 'Deep Understanding Engine',
  planner: 'Plan Generator',
};

async function runModuleStressTest(module: ModuleName) {
  const moduleName = MODULE_NAMES[module];

  console.log(`\n${'='.repeat(80)}`);
  console.log(`  ${moduleName.toUpperCase()} STRESS TEST — ${TOTAL_ITERATIONS.toLocaleString()} iterations`);
  console.log(`  Batch size: ${BATCH_SIZE} | Learning saves every ${LEARNING_SAVE_INTERVAL}`);
  console.log(`${'='.repeat(80)}\n`);

  const stats = { passed: 0, failed: 0, crashed: 0 };
  const errorCounts = new Map<string, number>();
  const categoryStats = new Map<string, { passed: number; failed: number }>();
  const failures: TestResult[] = [];
  const startTime = Date.now();
  const batchCount = Math.ceil(TOTAL_ITERATIONS / BATCH_SIZE);

  for (let batch = 0; batch < batchCount; batch++) {
    const batchStart = batch * BATCH_SIZE;
    const batchEnd = Math.min(batchStart + BATCH_SIZE, TOTAL_ITERATIONS);
    let batchPassed = 0;

    console.log(`\n--- Batch ${batch + 1}/${batchCount} [${batchStart + 1}-${batchEnd}] ---`);

    for (let i = batchStart; i < batchEnd; i++) {
      const scenario = generatePrompt(i);
      const result = runSingleTest(scenario.prompt, scenario.category, module, i);

      if (!categoryStats.has(result.category)) categoryStats.set(result.category, { passed: 0, failed: 0 });
      const cs = categoryStats.get(result.category)!;

      if (result.passed) {
        stats.passed++;
        batchPassed++;
        cs.passed++;
      } else {
        stats.failed++;
        cs.failed++;
        if (result.errors.some(e => e.includes('CRASH'))) stats.crashed++;
        failures.push(result);
        for (const err of result.errors) {
          const key = err.substring(0, 100);
          errorCounts.set(key, (errorCounts.get(key) || 0) + 1);
        }
        try {
          const understanding = analyzeRequest(result.prompt);
          const plan = generatePlan(understanding);
          learningEngine.learnFromErrors(result.errors, plan);
          await learningEngine.recordGenerationOutcome({
            plan, files: [], success: false, qualityScore: 0, errors: result.errors, autoFixes: [],
          });
        } catch {}
      }

      if ((i + 1) % 500 === 0) {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
        const rate = ((stats.passed / (stats.passed + stats.failed)) * 100).toFixed(1);
        console.log(`  [${(i + 1).toLocaleString()}/${TOTAL_ITERATIONS.toLocaleString()}] ${rate}% pass | ${elapsed}s`);
      }

      if ((i + 1) % LEARNING_SAVE_INTERVAL === 0) {
        try { learningEngine.persistToFile(); } catch {}
      }
    }

    const batchRate = ((batchPassed / (batchEnd - batchStart)) * 100).toFixed(1);
    console.log(`  Batch ${batch + 1}: ${batchPassed}/${batchEnd - batchStart} (${batchRate}%)`);
  }

  try { learningEngine.persistToFile(); } catch {}

  const totalRate = ((stats.passed / (stats.passed + stats.failed)) * 100).toFixed(2);
  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log(`\n${'='.repeat(80)}`);
  console.log(`  ${moduleName} RESULTS`);
  console.log(`${'='.repeat(80)}`);
  console.log(`  Total: ${stats.passed + stats.failed} | Passed: ${stats.passed} | Failed: ${stats.failed} | Crashed: ${stats.crashed}`);
  console.log(`  Pass rate: ${totalRate}% | Time: ${totalTime}s`);

  console.log(`\n  Category breakdown:`);
  for (const [cat, cs] of Array.from(categoryStats.entries()).sort((a, b) => a[0].localeCompare(b[0]))) {
    const rate = ((cs.passed / (cs.passed + cs.failed)) * 100).toFixed(1);
    console.log(`    ${cat}: ${cs.passed}/${cs.passed + cs.failed} (${rate}%)`);
  }

  if (errorCounts.size > 0) {
    console.log(`\n  Top errors:`);
    const sorted = Array.from(errorCounts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 15);
    for (const [err, count] of sorted) {
      console.log(`    [${count}x] ${err}`);
    }
  }

  if (failures.length > 0 && failures.length <= 20) {
    console.log(`\n  Failed prompts:`);
    for (const f of failures.slice(0, 20)) {
      console.log(`    #${f.index}: "${f.prompt.substring(0, 80)}..." => ${f.errors[0]}`);
    }
  }

  const learningStats = await learningEngine.getLearningStats();
  console.log(`\n  Learning: ${learningStats.totalPatterns} patterns, ${learningStats.reliablePatterns} reliable, ${learningStats.totalPreferences} preferences`);

  return { module, moduleName, stats, totalRate, totalTime, categoryStats, errorCounts, failures };
}

async function main() {
  const ALL_MODULES: ModuleName[] = ['schema', 'api', 'component', 'quality', 'dependency', 'domain', 'clarification', 'testgen', 'understanding', 'planner'];
  const modules: ModuleName[] = MODULE === 'all' ? ALL_MODULES : [MODULE];

  console.log(`\n${'#'.repeat(80)}`);
  console.log(`  EXTENDED MODULE STRESS TESTS`);
  console.log(`  Modules: ${modules.map(m => MODULE_NAMES[m]).join(', ')}`);
  console.log(`  Iterations per module: ${TOTAL_ITERATIONS.toLocaleString()}`);
  console.log(`  Total iterations: ${(modules.length * TOTAL_ITERATIONS).toLocaleString()}`);
  console.log(`${'#'.repeat(80)}\n`);

  const results: any[] = [];

  for (const mod of modules) {
    const result = await runModuleStressTest(mod);
    results.push(result);
  }

  if (modules.length > 1) {
    console.log(`\n${'#'.repeat(80)}`);
    console.log(`  COMBINED SUMMARY — ${modules.length} modules × ${TOTAL_ITERATIONS.toLocaleString()} = ${(modules.length * TOTAL_ITERATIONS).toLocaleString()} total`);
    console.log(`${'#'.repeat(80)}`);
    let totalPassed = 0, totalFailed = 0;
    for (const r of results) {
      totalPassed += r.stats.passed;
      totalFailed += r.stats.failed;
      console.log(`  ${r.moduleName}: ${r.totalRate}% (${r.stats.passed}/${r.stats.passed + r.stats.failed}) in ${r.totalTime}s`);
    }
    const combinedRate = ((totalPassed / (totalPassed + totalFailed)) * 100).toFixed(2);
    console.log(`\n  GRAND TOTAL: ${combinedRate}% (${totalPassed}/${totalPassed + totalFailed})`);
    const learningStats = await learningEngine.getLearningStats();
    console.log(`  Learning: ${learningStats.totalPatterns} patterns, ${learningStats.reliablePatterns} reliable, ${learningStats.totalPreferences} preferences`);
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
