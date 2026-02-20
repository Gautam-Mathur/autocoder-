import { analyzeRequest } from '../../server/modules/deep-understanding-engine.js';
import { generatePlan, type ProjectPlan } from '../../server/modules/plan-generator.js';
import { analyzeSemantics, type ReasoningResult } from '../../server/modules/contextual-reasoning-engine.js';
import { generateDesignSystem, generateDesignedTailwindConfig, generateDesignedIndexCss, type DesignSystem } from '../../server/modules/design-system-engine.js';
import { planArchitecture, type ArchitecturePlan } from '../../server/modules/architecture-planner.js';
import { generateFunctionalitySpec, type FunctionalitySpec } from '../../server/modules/functionality-engine.js';
import { GenerationLearningEngine } from '../../server/modules/generation-learning-engine.js';
import * as fs from 'fs';

const MODULE = (process.env.MODULE || 'all') as 'design' | 'architecture' | 'functionality' | 'all';
const TOTAL_ITERATIONS = parseInt(process.env.TOTAL_ITERATIONS || '2000', 10);
const BATCH_SIZE = parseInt(process.env.BATCH_SIZE || '500', 10);
const LEARNING_SAVE_INTERVAL = 250;

const learningEngine = new GenerationLearningEngine();

const DOMAINS = [
  'consulting', 'manufacturing', 'healthcare', 'retail', 'education',
  'realestate', 'hr', 'restaurant', 'fitness', 'logistics',
  'finance', 'project-management', 'crm', 'inventory',
];

const DOMAIN_NOUNS: Record<string, string[]> = {
  consulting: ['consulting firm', 'advisory agency', 'consultancy'],
  manufacturing: ['factory', 'manufacturing plant', 'production facility'],
  healthcare: ['hospital', 'clinic', 'medical center', 'dental practice', 'pharmacy'],
  retail: ['store', 'shop', 'boutique', 'e-commerce store', 'online marketplace'],
  education: ['school', 'university', 'training center', 'online learning platform'],
  realestate: ['real estate agency', 'property management company', 'rental platform'],
  hr: ['HR department', 'staffing agency', 'recruitment firm'],
  restaurant: ['restaurant', 'café', 'bakery', 'food truck', 'catering company'],
  fitness: ['gym', 'fitness center', 'yoga studio', 'personal training studio'],
  logistics: ['shipping company', 'delivery service', 'freight company', 'warehouse'],
  finance: ['accounting firm', 'bank', 'investment firm', 'fintech startup'],
  'project-management': ['software team', 'agency', 'startup', 'development shop'],
  crm: ['sales team', 'marketing agency', 'business development group'],
  inventory: ['warehouse', 'distribution center', 'supply chain', 'stockroom'],
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
];

const DESIGN_MOODS = ['corporate', 'playful', 'minimal', 'bold', 'warm', 'cool', 'luxury', 'tech', 'organic', 'retro'];
const DESIGN_ADJECTIVES = ['modern', 'sleek', 'clean', 'vibrant', 'professional', 'elegant', 'futuristic', 'rustic', 'sophisticated', 'accessible'];
const COLOR_REQUESTS = ['blue theme', 'dark mode focused', 'green and white', 'warm earth tones', 'purple accents', 'monochrome', 'bright and colorful', 'muted pastels', 'high contrast', 'ocean-inspired'];
const COMPLEXITY_LEVELS = ['tiny', 'simple', 'medium', 'complex', 'enterprise'];
const AUTH_DESCRIPTIONS = ['no auth needed', 'simple login', 'role-based access with admin and user roles', 'multi-tenant with organization-level access', 'API key authentication'];
const SCALE_DESCRIPTIONS = ['for a solo freelancer', 'for a small team of 5', 'for a company with 50 employees', 'for an enterprise with thousands of users', 'for a startup MVP'];

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
];

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function pickN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(n, arr.length));
}
function rng(min: number, max: number): number { return Math.floor(Math.random() * (max - min + 1)) + min; }

function generateDesignScenario(index: number): { prompt: string; category: string } {
  const category = index % 7;
  switch (category) {
    case 0: {
      const domain = pick(DOMAINS);
      const noun = pick(DOMAIN_NOUNS[domain]);
      const mood = pick(DESIGN_MOODS);
      const adj = pick(DESIGN_ADJECTIVES);
      const features = pickN(FEATURES, rng(3, 6)).join(', ');
      return { prompt: `Build a ${adj} ${mood} management app for a ${noun} with ${features}`, category: 'domain-mood' };
    }
    case 1: {
      const color = pick(COLOR_REQUESTS);
      const domain = pick(DOMAINS);
      const noun = pick(DOMAIN_NOUNS[domain]);
      return { prompt: `Create a ${color} dashboard for a ${noun} with analytics and reporting`, category: 'color-request' };
    }
    case 2: {
      const app = pick(NOVEL_APPS);
      const mood = pick(DESIGN_MOODS);
      return { prompt: `Design a ${mood} ${app} with user profiles, search, and notifications`, category: 'novel-mood' };
    }
    case 3: {
      const domain = pick(DOMAINS);
      const noun = pick(DOMAIN_NOUNS[domain]);
      const features = pickN(FEATURES, rng(5, 10)).join(', ');
      return { prompt: `I need a comprehensive system for a ${noun}. Features: ${features}. Make it accessible and professional.`, category: 'feature-heavy-design' };
    }
    case 4: {
      const adj1 = pick(DESIGN_ADJECTIVES);
      const adj2 = pick(DESIGN_ADJECTIVES);
      const domain = pick(DOMAINS);
      const noun = pick(DOMAIN_NOUNS[domain]);
      return { prompt: `Build a ${adj1} and ${adj2} portal for ${noun} with dark mode and responsive layout`, category: 'multi-adj' };
    }
    case 5: {
      return { prompt: pick([
        'Build a SaaS analytics dashboard with real-time metrics',
        'Create a fintech portfolio tracker with charts',
        'Make a healthcare patient portal with appointment scheduling',
        'Design a logistics fleet tracking system',
        'Build an education LMS with course builder',
        'Create a restaurant POS system with table management',
        'Make a CRM for a sales team with pipeline view',
        'Design a gym membership management app',
        'Build an HR onboarding system with document signing',
        'Create a construction project tracker with milestones',
      ]), category: 'industry-specific' };
    }
    default: {
      const domain = pick(DOMAINS);
      const noun = pick(DOMAIN_NOUNS[domain]);
      const scale = pick(SCALE_DESCRIPTIONS);
      return { prompt: `Build an app ${scale} managing a ${noun} with everything they need`, category: 'scale-based' };
    }
  }
}

function generateArchitectureScenario(index: number): { prompt: string; category: string } {
  const category = index % 7;
  switch (category) {
    case 0: {
      const domain = pick(DOMAINS);
      const noun = pick(DOMAIN_NOUNS[domain]);
      const complexity = pick(COMPLEXITY_LEVELS);
      const features = pickN(FEATURES, rng(3, 8)).join(', ');
      return { prompt: `Build a ${complexity} system for a ${noun} with ${features}`, category: 'complexity-varied' };
    }
    case 1: {
      const auth = pick(AUTH_DESCRIPTIONS);
      const domain = pick(DOMAINS);
      const noun = pick(DOMAIN_NOUNS[domain]);
      return { prompt: `Create a management platform for a ${noun}. Security: ${auth}. Include dashboards and reporting.`, category: 'auth-focused' };
    }
    case 2: {
      const features = pickN(FEATURES, rng(8, 15)).join(', ');
      const domain = pick(DOMAINS);
      const noun = pick(DOMAIN_NOUNS[domain]);
      return { prompt: `Enterprise-grade system for ${noun}. Must include: ${features}`, category: 'enterprise' };
    }
    case 3: {
      const app = pick(NOVEL_APPS);
      const scale = pick(SCALE_DESCRIPTIONS);
      return { prompt: `Build a ${app} ${scale} with real-time updates and collaborative editing`, category: 'novel-arch' };
    }
    case 4: {
      const domain = pick(DOMAINS);
      const noun = pick(DOMAIN_NOUNS[domain]);
      return { prompt: `Build a multi-page portal for a ${noun} with separate admin and user dashboards, reports, and settings`, category: 'multi-page' };
    }
    case 5: {
      return { prompt: pick([
        'Build a microservice-ready task management platform with Kanban, Gantt, and calendar views',
        'Create an e-commerce marketplace with seller dashboard, buyer portal, and admin panel',
        'Design a healthcare system with patient records, appointments, billing, and reporting',
        'Build a social learning platform with courses, forums, and real-time chat',
        'Create a logistics platform tracking shipments, routes, drivers, and warehouses',
        'Build a multi-tenant SaaS for project management with workspace isolation',
        'Design a financial management suite with budgets, invoices, and expense reports',
        'Create a restaurant chain management system with POS, inventory, and HR',
        'Build an IoT dashboard monitoring factory sensors, alerts, and maintenance schedules',
        'Create a recruitment platform with applicant tracking, interview scheduling, and analytics',
      ]), category: 'complex-specific' };
    }
    default: {
      const domain = pick(DOMAINS);
      const noun = pick(DOMAIN_NOUNS[domain]);
      const features = pickN(FEATURES, rng(2, 5)).join(', ');
      return { prompt: `Simple app for ${noun} with ${features}`, category: 'simple' };
    }
  }
}

function generateFunctionalityScenario(index: number): { prompt: string; category: string } {
  const category = index % 7;
  switch (category) {
    case 0: {
      const domain = pick(DOMAINS);
      const noun = pick(DOMAIN_NOUNS[domain]);
      const features = pickN(FEATURES, rng(4, 8)).join(', ');
      return { prompt: `Build a management system for a ${noun} with ${features}`, category: 'feature-combo' };
    }
    case 1: {
      const domain = pick(DOMAINS);
      const noun = pick(DOMAIN_NOUNS[domain]);
      return { prompt: `Create a ${noun} management app with complete CRUD, search, filtering, bulk actions, and data export`, category: 'crud-heavy' };
    }
    case 2: {
      const app = pick(NOVEL_APPS);
      const features = pickN(FEATURES, rng(3, 6)).join(', ');
      return { prompt: `Build a ${app} with ${features}`, category: 'novel-features' };
    }
    case 3: {
      const domain = pick(DOMAINS);
      const noun = pick(DOMAIN_NOUNS[domain]);
      return { prompt: `Build a ${noun} platform with kanban boards, drag and drop, status workflows, real-time updates, and activity feeds`, category: 'interactive-heavy' };
    }
    case 4: {
      const domain = pick(DOMAINS);
      const noun = pick(DOMAIN_NOUNS[domain]);
      return { prompt: `Create a ${noun} analytics dashboard with charts, KPIs, reporting, date range filters, and data export`, category: 'analytics-heavy' };
    }
    case 5: {
      return { prompt: pick([
        'Build a project management tool with tasks, subtasks, milestones, Gantt charts, and team collaboration',
        'Create an e-commerce backend with products, categories, orders, reviews, and inventory tracking',
        'Design a CRM with contacts, deals, pipeline, email tracking, and activity logging',
        'Build a school management system with students, teachers, classes, grades, and attendance',
        'Create a hospital management app with patients, doctors, appointments, prescriptions, and billing',
        'Build a property management system with listings, tenants, leases, maintenance, and payments',
        'Design a restaurant management app with menu, orders, tables, reservations, and staff scheduling',
        'Create a gym management app with members, classes, trainers, subscriptions, and check-ins',
        'Build a helpdesk system with tickets, agents, SLA tracking, knowledge base, and customer portal',
        'Create a fleet management platform with vehicles, drivers, routes, maintenance, and fuel tracking',
      ]), category: 'domain-specific-features' };
    }
    default: {
      const features = pickN(FEATURES, rng(2, 4)).join(', ');
      const domain = pick(DOMAINS);
      const noun = pick(DOMAIN_NOUNS[domain]);
      return { prompt: `Simple ${noun} app with ${features}`, category: 'minimal-features' };
    }
  }
}

interface ModuleTestResult {
  index: number;
  prompt: string;
  category: string;
  module: string;
  passed: boolean;
  errors: string[];
  timeMs: number;
  stats: Record<string, any>;
}

function validateDesignSystem(ds: DesignSystem, plan: ProjectPlan): string[] {
  const errors: string[] = [];

  if (!ds.name) errors.push('design: missing name');
  if (!ds.description) errors.push('design: missing description');

  if (!ds.lightTokens) errors.push('design: missing lightTokens');
  if (!ds.darkTokens) errors.push('design: missing darkTokens');

  const tokenFields = ['background', 'foreground', 'primary', 'primaryForeground', 'secondary',
    'secondaryForeground', 'muted', 'mutedForeground', 'accent', 'accentForeground',
    'destructive', 'destructiveForeground', 'border', 'input', 'ring', 'radius',
    'card', 'cardForeground', 'popover', 'popoverForeground',
    'success', 'successForeground', 'warning', 'warningForeground', 'info', 'infoForeground'];

  for (const field of tokenFields) {
    if (ds.lightTokens && !(field in ds.lightTokens)) errors.push(`design: lightTokens missing ${field}`);
    if (ds.darkTokens && !(field in ds.darkTokens)) errors.push(`design: darkTokens missing ${field}`);
  }

  if (ds.lightTokens) {
    for (const field of tokenFields) {
      const val = (ds.lightTokens as any)[field];
      if (typeof val === 'string' && val.length === 0) errors.push(`design: lightTokens.${field} empty`);
    }
  }
  if (ds.darkTokens) {
    for (const field of tokenFields) {
      const val = (ds.darkTokens as any)[field];
      if (typeof val === 'string' && val.length === 0) errors.push(`design: darkTokens.${field} empty`);
    }
  }

  if (!ds.primaryColor) errors.push('design: missing primaryColor');
  else {
    const colorKeys = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'];
    for (const key of colorKeys) {
      if (!(key in ds.primaryColor)) errors.push(`design: primaryColor missing shade ${key}`);
    }
  }

  if (!ds.accentColor) errors.push('design: missing accentColor');

  if (!ds.gradients || !Array.isArray(ds.gradients)) errors.push('design: missing gradients');
  else if (ds.gradients.length === 0) errors.push('design: empty gradients array');
  else {
    for (const g of ds.gradients) {
      if (!g.name) errors.push('design: gradient missing name');
      if (!g.value) errors.push('design: gradient missing value');
    }
  }

  if (!ds.shadows) errors.push('design: missing shadows');
  else {
    for (const key of ['sm', 'md', 'lg', 'xl', 'glow', 'inner']) {
      if (!(key in ds.shadows)) errors.push(`design: shadows missing ${key}`);
    }
  }

  if (!ds.typography) errors.push('design: missing typography');
  else {
    if (!ds.typography.fontFamily) errors.push('design: missing fontFamily');
    if (!ds.typography.headingFamily) errors.push('design: missing headingFamily');
    if (!ds.typography.monoFamily) errors.push('design: missing monoFamily');
    if (!ds.typography.scale) errors.push('design: missing typography scale');
    else {
      for (const size of ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl']) {
        const entry = (ds.typography.scale as any)[size];
        if (!entry) errors.push(`design: typography scale missing ${size}`);
        else {
          if (!entry.size) errors.push(`design: typography scale ${size} missing size`);
          if (!entry.lineHeight) errors.push(`design: typography scale ${size} missing lineHeight`);
        }
      }
    }
  }

  if (!ds.animations || !Array.isArray(ds.animations)) errors.push('design: missing animations');
  if (!ds.componentStyles) errors.push('design: missing componentStyles');

  try {
    const tailwind = generateDesignedTailwindConfig(ds);
    if (!tailwind || tailwind.length < 100) errors.push('design: tailwind config too short');
    if (!tailwind.includes('darkMode')) errors.push('design: tailwind missing darkMode');
    if (!tailwind.includes('primary')) errors.push('design: tailwind missing primary color');
    if (!tailwind.includes('fontFamily')) errors.push('design: tailwind missing fontFamily');
  } catch (err: any) {
    errors.push(`design: [CRASH:tailwind] ${err.message}`);
  }

  try {
    const css = generateDesignedIndexCss(ds);
    if (!css || css.length < 100) errors.push('design: index.css too short');
    if (!css.includes(':root')) errors.push('design: CSS missing :root');
    if (!css.includes('.dark')) errors.push('design: CSS missing .dark class');
    if (!css.includes('--primary')) errors.push('design: CSS missing --primary');
    if (!css.includes('--background')) errors.push('design: CSS missing --background');
    if (!css.includes('@tailwind')) errors.push('design: CSS missing @tailwind directives');
  } catch (err: any) {
    errors.push(`design: [CRASH:css] ${err.message}`);
  }

  return errors;
}

function validateArchitecturePlan(arch: ArchitecturePlan, plan: ProjectPlan): string[] {
  const errors: string[] = [];

  const validPatterns = ['spa-dashboard', 'spa-crud', 'spa-workflow', 'multi-page', 'portal', 'marketplace', 'social', 'analytics'];
  if (!validPatterns.includes(arch.pattern)) errors.push(`arch: invalid pattern "${arch.pattern}"`);

  if (!arch.folderStructure) errors.push('arch: missing folderStructure');
  else {
    if (!['feature-based', 'type-based', 'hybrid'].includes(arch.folderStructure.strategy))
      errors.push(`arch: invalid folder strategy "${arch.folderStructure.strategy}"`);
    if (!arch.folderStructure.directories || arch.folderStructure.directories.length === 0)
      errors.push('arch: empty directories');
    for (const dir of arch.folderStructure.directories || []) {
      if (!dir.path) errors.push('arch: directory missing path');
      if (!dir.purpose) errors.push('arch: directory missing purpose');
    }
  }

  if (!arch.stateManagement) errors.push('arch: missing stateManagement');
  else {
    const validApproaches = ['local-first', 'context-heavy', 'global-store', 'server-state'];
    if (!validApproaches.includes(arch.stateManagement.approach))
      errors.push(`arch: invalid state approach "${arch.stateManagement.approach}"`);
    if (!['aggressive', 'moderate', 'minimal'].includes(arch.stateManagement.cacheStrategy))
      errors.push(`arch: invalid cache strategy "${arch.stateManagement.cacheStrategy}"`);
    if (typeof arch.stateManagement.cacheTTL !== 'number' || arch.stateManagement.cacheTTL <= 0)
      errors.push('arch: invalid cacheTTL');
  }

  if (!arch.authPattern) errors.push('arch: missing authPattern');
  else {
    const validAuthTypes = ['none', 'session', 'jwt', 'oauth', 'api-key'];
    if (!validAuthTypes.includes(arch.authPattern.type))
      errors.push(`arch: invalid auth type "${arch.authPattern.type}"`);
    if (!Array.isArray(arch.authPattern.protectedRoutes)) errors.push('arch: protectedRoutes not array');
    if (!Array.isArray(arch.authPattern.publicRoutes)) errors.push('arch: publicRoutes not array');
    if (arch.authPattern.type !== 'none' && arch.authPattern.roles.length === 0)
      errors.push('arch: auth enabled but no roles defined');
  }

  if (!arch.dataFlow) errors.push('arch: missing dataFlow');
  else {
    if (!['rest', 'graphql', 'rpc'].includes(arch.dataFlow.primary))
      errors.push(`arch: invalid data flow primary "${arch.dataFlow.primary}"`);
    if (typeof arch.dataFlow.realtime !== 'boolean') errors.push('arch: realtime not boolean');
  }

  if (!arch.performance) errors.push('arch: missing performance');
  else {
    if (typeof arch.performance.codeSplitting !== 'boolean') errors.push('arch: codeSplitting not boolean');
    if (!Array.isArray(arch.performance.lazyRoutes)) errors.push('arch: lazyRoutes not array');
    if (!Array.isArray(arch.performance.prefetchRoutes)) errors.push('arch: prefetchRoutes not array');
  }

  if (!arch.errorHandling) errors.push('arch: missing errorHandling');
  else {
    if (typeof arch.errorHandling.globalHandler !== 'boolean') errors.push('arch: globalHandler not boolean');
    if (!Array.isArray(arch.errorHandling.errorBoundaries)) errors.push('arch: errorBoundaries not array');
    if (typeof arch.errorHandling.maxRetries !== 'number') errors.push('arch: maxRetries not number');
  }

  if (!arch.routing) errors.push('arch: missing routing');
  else {
    if (!['flat', 'nested'].includes(arch.routing.type)) errors.push(`arch: invalid routing type "${arch.routing.type}"`);
    if (!Array.isArray(arch.routing.routes) || arch.routing.routes.length === 0)
      errors.push('arch: empty routes');
    for (const route of arch.routing.routes || []) {
      if (!route.path) errors.push('arch: route missing path');
      if (!route.component) errors.push('arch: route missing component');
      if (!route.layout) errors.push('arch: route missing layout');
    }
    if (!arch.routing.defaultRoute) errors.push('arch: missing defaultRoute');
  }

  if (!arch.codeOrganization) errors.push('arch: missing codeOrganization');
  if (!arch.decisions || !Array.isArray(arch.decisions)) errors.push('arch: missing decisions');
  else if (arch.decisions.length === 0) errors.push('arch: empty decisions');

  const entities = plan.dataModel || [];
  if (entities.length > 5 && arch.folderStructure?.strategy !== 'feature-based')
    errors.push(`arch: ${entities.length} entities but strategy is ${arch.folderStructure?.strategy}, expected feature-based`);

  return errors;
}

function validateFunctionalitySpec(spec: FunctionalitySpec, plan: ProjectPlan, reasoning: ReasoningResult): string[] {
  const errors: string[] = [];

  if (!spec.entityFeatures || !Array.isArray(spec.entityFeatures)) errors.push('func: missing entityFeatures');
  else {
    if (spec.entityFeatures.length !== plan.dataModel.length)
      errors.push(`func: entityFeatures count ${spec.entityFeatures.length} != dataModel count ${plan.dataModel.length}`);
    for (const ef of spec.entityFeatures) {
      if (!ef.entityName) errors.push('func: entityFeature missing entityName');
      if (!Array.isArray(ef.crudEnhancements)) errors.push(`func: ${ef.entityName} missing crudEnhancements array`);
      if (!Array.isArray(ef.interactiveFeatures)) errors.push(`func: ${ef.entityName} missing interactiveFeatures array`);
      if (!Array.isArray(ef.dataDisplayFeatures)) errors.push(`func: ${ef.entityName} missing dataDisplayFeatures array`);
      if (!Array.isArray(ef.automationFeatures)) errors.push(`func: ${ef.entityName} missing automationFeatures array`);

      const validCrudTypes = ['inline-edit', 'bulk-actions', 'soft-delete', 'duplicate', 'import-export', 'quick-create', 'archive'];
      for (const c of ef.crudEnhancements) {
        if (!validCrudTypes.includes(c.type)) errors.push(`func: ${ef.entityName} invalid crud type "${c.type}"`);
        if (!c.description) errors.push(`func: ${ef.entityName} crud ${c.type} missing description`);
        if (!['high', 'medium', 'low'].includes(c.priority)) errors.push(`func: ${ef.entityName} crud ${c.type} invalid priority`);
      }

      const validInteractiveTypes = ['drag-drop', 'status-transition', 'assignee-picker', 'date-picker-range',
        'color-picker', 'file-upload', 'rich-text', 'autocomplete', 'multi-select-tags',
        'inline-comments', 'activity-timeline', 'progress-tracker'];
      for (const f of ef.interactiveFeatures) {
        if (!validInteractiveTypes.includes(f.type)) errors.push(`func: ${ef.entityName} invalid interactive type "${f.type}"`);
        if (!f.description) errors.push(`func: ${ef.entityName} interactive ${f.type} missing description`);
      }

      const validDisplayTypes = ['charts', 'sparkline', 'progress-bar', 'avatar-stack', 'status-timeline',
        'image-gallery', 'stat-card', 'comparison-table', 'grouped-list', 'timeline-view', 'heatmap', 'count-badge'];
      for (const d of ef.dataDisplayFeatures) {
        if (!validDisplayTypes.includes(d.type)) errors.push(`func: ${ef.entityName} invalid display type "${d.type}"`);
        if (!d.description) errors.push(`func: ${ef.entityName} display ${d.type} missing description`);
      }
    }
  }

  if (!spec.pageFeatures || !Array.isArray(spec.pageFeatures)) errors.push('func: missing pageFeatures');
  else {
    if (spec.pageFeatures.length !== plan.pages.length)
      errors.push(`func: pageFeatures count ${spec.pageFeatures.length} != pages count ${plan.pages.length}`);
    const validLayouts = ['dashboard', 'list-detail', 'kanban', 'calendar', 'card-grid', 'form-wizard', 'split-view', 'timeline', 'table'];
    for (const pf of spec.pageFeatures) {
      if (!pf.pageName) errors.push('func: pageFeature missing pageName');
      if (!validLayouts.includes(pf.layoutType)) errors.push(`func: ${pf.pageName} invalid layout "${pf.layoutType}"`);
      if (!Array.isArray(pf.headerFeatures)) errors.push(`func: ${pf.pageName} missing headerFeatures`);
      if (!Array.isArray(pf.contentFeatures)) errors.push(`func: ${pf.pageName} missing contentFeatures`);
      if (pf.contentFeatures.length === 0) errors.push(`func: ${pf.pageName} has no content features`);
      if (!Array.isArray(pf.sidebarFeatures)) errors.push(`func: ${pf.pageName} missing sidebarFeatures`);
      if (!pf.emptyStateMessage) errors.push(`func: ${pf.pageName} missing emptyStateMessage`);
      if (!['skeleton', 'spinner', 'shimmer'].includes(pf.loadingPattern))
        errors.push(`func: ${pf.pageName} invalid loadingPattern "${pf.loadingPattern}"`);
      if (!['toast', 'inline', 'page-error'].includes(pf.errorPattern))
        errors.push(`func: ${pf.pageName} invalid errorPattern "${pf.errorPattern}"`);
      if (!['auto-refetch', 'manual', 'realtime'].includes(pf.refreshStrategy))
        errors.push(`func: ${pf.pageName} invalid refreshStrategy "${pf.refreshStrategy}"`);
    }
  }

  if (!spec.globalFeatures || !Array.isArray(spec.globalFeatures)) errors.push('func: missing globalFeatures');
  else {
    for (const gf of spec.globalFeatures) {
      if (!gf.name) errors.push('func: globalFeature missing name');
      if (!gf.type) errors.push('func: globalFeature missing type');
      if (!gf.description) errors.push('func: globalFeature missing description');
    }
  }

  if (!spec.requiredComponents || !Array.isArray(spec.requiredComponents)) errors.push('func: missing requiredComponents');
  else {
    for (const rc of spec.requiredComponents) {
      if (!rc.name) errors.push('func: requiredComponent missing name');
      if (!rc.path) errors.push('func: requiredComponent missing path');
      if (!['ui', 'feature', 'layout'].includes(rc.type)) errors.push(`func: requiredComponent ${rc.name} invalid type`);
    }
  }

  return errors;
}

function runSingleModuleTest(
  prompt: string,
  category: string,
  module: 'design' | 'architecture' | 'functionality',
  index: number
): ModuleTestResult {
  const result: ModuleTestResult = {
    index,
    prompt,
    category,
    module,
    passed: false,
    errors: [],
    timeMs: 0,
    stats: {},
  };

  const start = Date.now();

  let plan: ProjectPlan;
  let reasoning: ReasoningResult;

  try {
    const understanding = analyzeRequest(prompt);
    plan = generatePlan(understanding);
    reasoning = analyzeSemantics(plan);
  } catch (err: any) {
    result.errors.push(`[CRASH:setup] ${err.message}`);
    result.timeMs = Date.now() - start;
    return result;
  }

  try {
    switch (module) {
      case 'design': {
        const ds = generateDesignSystem(plan, reasoning);
        const dsErrors = validateDesignSystem(ds, plan);
        result.errors.push(...dsErrors);
        result.stats = {
          name: ds.name,
          gradients: ds.gradients?.length || 0,
          animations: ds.animations?.length || 0,
          hasLightTokens: !!ds.lightTokens,
          hasDarkTokens: !!ds.darkTokens,
          fontFamily: ds.typography?.fontFamily?.split(',')[0] || 'unknown',
        };
        break;
      }
      case 'architecture': {
        const arch = planArchitecture(plan, reasoning);
        const archErrors = validateArchitecturePlan(arch, plan);
        result.errors.push(...archErrors);
        result.stats = {
          pattern: arch.pattern,
          folderStrategy: arch.folderStructure?.strategy,
          stateApproach: arch.stateManagement?.approach,
          authType: arch.authPattern?.type,
          routeCount: arch.routing?.routes?.length || 0,
          decisions: arch.decisions?.length || 0,
          codeSplitting: arch.performance?.codeSplitting,
          realtime: arch.dataFlow?.realtime,
        };
        break;
      }
      case 'functionality': {
        const spec = generateFunctionalitySpec(plan, reasoning);
        const funcErrors = validateFunctionalitySpec(spec, plan, reasoning);
        result.errors.push(...funcErrors);
        result.stats = {
          entityFeatures: spec.entityFeatures?.length || 0,
          pageFeatures: spec.pageFeatures?.length || 0,
          globalFeatures: spec.globalFeatures?.length || 0,
          requiredComponents: spec.requiredComponents?.length || 0,
          totalInteractive: spec.entityFeatures?.reduce((s, e) => s + e.interactiveFeatures.length, 0) || 0,
          totalCrud: spec.entityFeatures?.reduce((s, e) => s + e.crudEnhancements.length, 0) || 0,
          totalDisplay: spec.entityFeatures?.reduce((s, e) => s + e.dataDisplayFeatures.length, 0) || 0,
        };
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

async function runModuleStressTest(module: 'design' | 'architecture' | 'functionality') {
  const scenarioFn = module === 'design' ? generateDesignScenario
    : module === 'architecture' ? generateArchitectureScenario
    : generateFunctionalityScenario;

  const moduleName = module === 'design' ? 'Design System Engine'
    : module === 'architecture' ? 'Architecture Planner'
    : 'Functionality Engine';

  console.log(`\n${'='.repeat(80)}`);
  console.log(`  ${moduleName.toUpperCase()} STRESS TEST — ${TOTAL_ITERATIONS.toLocaleString()} iterations`);
  console.log(`  Batch size: ${BATCH_SIZE} | Learning saves every ${LEARNING_SAVE_INTERVAL}`);
  console.log(`${'='.repeat(80)}\n`);

  const stats = { passed: 0, failed: 0, crashed: 0 };
  const errorCounts = new Map<string, number>();
  const categoryStats = new Map<string, { passed: number; failed: number }>();
  const failures: ModuleTestResult[] = [];
  const startTime = Date.now();
  const batchCount = Math.ceil(TOTAL_ITERATIONS / BATCH_SIZE);

  for (let batch = 0; batch < batchCount; batch++) {
    const batchStart = batch * BATCH_SIZE;
    const batchEnd = Math.min(batchStart + BATCH_SIZE, TOTAL_ITERATIONS);
    const batchPassed = { count: 0 };

    console.log(`\n--- Batch ${batch + 1}/${batchCount} [${batchStart + 1}-${batchEnd}] ---`);

    for (let i = batchStart; i < batchEnd; i++) {
      const scenario = scenarioFn(i);
      const result = runSingleModuleTest(scenario.prompt, scenario.category, module, i);

      if (!categoryStats.has(result.category)) categoryStats.set(result.category, { passed: 0, failed: 0 });
      const cs = categoryStats.get(result.category)!;

      if (result.passed) {
        stats.passed++;
        batchPassed.count++;
        cs.passed++;
      } else {
        stats.failed++;
        cs.failed++;
        if (result.errors.some(e => e.includes('CRASH'))) stats.crashed++;
        failures.push(result);
        for (const err of result.errors) {
          const key = err.substring(0, 80);
          errorCounts.set(key, (errorCounts.get(key) || 0) + 1);
        }
        try {
          const understanding = analyzeRequest(result.prompt);
          const plan = generatePlan(understanding);
          learningEngine.learnFromErrors(result.errors, plan);
          await learningEngine.recordGenerationOutcome({
            plan,
            files: [],
            success: false,
            qualityScore: 0,
            errors: result.errors,
            autoFixes: [],
          });
        } catch {}
      }

      if ((i + 1) % 100 === 0) {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
        const rate = ((stats.passed / (stats.passed + stats.failed)) * 100).toFixed(1);
        console.log(`  [${(i + 1).toLocaleString()}/${TOTAL_ITERATIONS.toLocaleString()}] ${rate}% pass rate | ${elapsed}s elapsed`);
      }

      if ((i + 1) % LEARNING_SAVE_INTERVAL === 0) {
        try { learningEngine.persistToFile(); } catch {}
      }
    }

    const batchRate = ((batchPassed.count / (batchEnd - batchStart)) * 100).toFixed(1);
    const batchTime = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`  Batch ${batch + 1}: ${batchPassed.count}/${batchEnd - batchStart} passed (${batchRate}%) in ${batchTime}s`);
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

  if (failures.length > 0 && failures.length <= 10) {
    console.log(`\n  Failed prompts:`);
    for (const f of failures.slice(0, 10)) {
      console.log(`    #${f.index}: "${f.prompt.substring(0, 80)}..." => ${f.errors[0]}`);
    }
  }

  const learningStats = await learningEngine.getLearningStats();
  console.log(`\n  Learning engine: ${learningStats.totalPatterns} patterns, ${learningStats.reliablePatterns} reliable, ${learningStats.totalPreferences} preferences`);

  return { module, stats, totalRate, totalTime, categoryStats, errorCounts, failures };
}

async function main() {
  const modules: Array<'design' | 'architecture' | 'functionality'> =
    MODULE === 'all' ? ['design', 'architecture', 'functionality'] : [MODULE];

  const results: any[] = [];

  for (const mod of modules) {
    const result = await runModuleStressTest(mod);
    results.push(result);
  }

  if (modules.length > 1) {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`  COMBINED SUMMARY`);
    console.log(`${'='.repeat(80)}`);
    let totalPassed = 0, totalFailed = 0;
    for (const r of results) {
      totalPassed += r.stats.passed;
      totalFailed += r.stats.failed;
      console.log(`  ${r.module}: ${r.totalRate}% (${r.stats.passed}/${r.stats.passed + r.stats.failed})`);
    }
    const combinedRate = ((totalPassed / (totalPassed + totalFailed)) * 100).toFixed(2);
    console.log(`  Combined: ${combinedRate}% (${totalPassed}/${totalPassed + totalFailed})`);
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
