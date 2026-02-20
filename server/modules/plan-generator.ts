import type { UnderstandingResult } from './deep-understanding-engine.js';
import type { DomainEntity, DomainModule, DomainWorkflow, UserRole, IndustryDomain } from './domain-knowledge.js';
import { buildEntitiesForModules, buildPagesForModules, buildWorkflowsForEntities } from './domain-knowledge.js';
import { learningEngine } from './generation-learning-engine.js';

function toSnakeCase(str: string): string {
  return str.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '');
}

function toKebabCase(str: string): string {
  return str.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');
}

function mapFieldType(type: string): string {
  if (type === 'serial') return 'serial (auto-increment)';
  if (type === 'string') return 'text';
  if (type === 'number') return 'integer';
  if (type === 'boolean') return 'boolean';
  if (type === 'date') return 'date';
  if (type === 'datetime') return 'timestamp';
  if (type === 'string[]') return 'text[]';
  if (type.startsWith('enum:')) return `enum(${type.replace('enum:', '')})`;
  return type;
}

export interface ProjectPlan {
  projectName: string;
  overview: string;
  techStack: TechStackItem[];
  modules: PlannedModule[];
  dataModel: PlannedEntity[];
  pages: PlannedPage[];
  apiEndpoints: PlannedEndpoint[];
  workflows: PlannedWorkflow[];
  roles: PlannedRole[];
  fileBlueprint: PlannedFile[];
  kpis: string[];
  estimatedComplexity: string;
}

export interface TechStackItem {
  category: string;
  technology: string;
  justification: string;
}

export interface PlannedModule {
  name: string;
  description: string;
  entities: string[];
  pageCount: number;
  features: string[];
}

export interface PlannedEntity {
  name: string;
  tableName: string;
  fields: { name: string; type: string; required: boolean; description?: string }[];
  relationships: { entity: string; type: string; field?: string }[];
}

export interface PlannedPage {
  name: string;
  path: string;
  module: string;
  description: string;
  componentName: string;
  features: string[];
  dataNeeded: string[];
}

export interface PlannedEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  description: string;
  entity: string;
  requestBody?: string;
  responseType: string;
}

export interface PlannedWorkflow {
  name: string;
  entity: string;
  states: string[];
  transitions: { from: string; to: string; action: string; role?: string }[];
}

export interface PlannedRole {
  name: string;
  description: string;
  permissions: string[];
  canAccess: string[];
}

export interface PlannedFile {
  path: string;
  purpose: string;
  type: 'component' | 'page' | 'api' | 'schema' | 'hook' | 'utility' | 'style' | 'config';
}

export function generatePlan(understanding: UnderstandingResult): ProjectPlan {
  const domain = understanding.level2_domain.primaryDomain;
  const intent = understanding.level1_intent;

  const projectName = generateProjectName(intent, domain);
  const overview = generateOverview(intent, domain);

  const selectedModuleNames = understanding.level2_domain.detectedModules.length > 0
    ? understanding.level2_domain.detectedModules
    : domain ? domain.modules.map(m => m.name) : [];

  const modules = planModules(domain, selectedModuleNames);
  const dataModel = planDataModel(domain, selectedModuleNames);
  const pages = planPages(domain, selectedModuleNames);
  const apiEndpoints = planEndpoints(dataModel);
  const workflows = planWorkflows(domain, dataModel);
  const roles = planRoles(domain, pages);
  const fileBlueprint = planFiles(pages, dataModel, modules);
  const kpis = planKPIs(domain, selectedModuleNames);

  const techStack: TechStackItem[] = [
    { category: 'Frontend', technology: 'React 18 + TypeScript', justification: 'Modern, type-safe UI development' },
    { category: 'Styling', technology: 'Tailwind CSS + shadcn/ui', justification: 'Rapid, consistent UI with pre-built components' },
    { category: 'Routing', technology: 'Wouter', justification: 'Lightweight client-side routing' },
    { category: 'State', technology: 'TanStack Query', justification: 'Server state management with caching' },
    { category: 'Backend', technology: 'Express.js + TypeScript', justification: 'Fast, flexible API server' },
    { category: 'Database', technology: 'PostgreSQL + Drizzle ORM', justification: 'Relational data with type-safe queries' },
    { category: 'Validation', technology: 'Zod', justification: 'Runtime type validation for API requests' },
    { category: 'Build', technology: 'Vite', justification: 'Fast builds with HMR' },
  ];

  const entityCount = dataModel.length;
  const pageCount = pages.length;
  const estimatedComplexity = entityCount > 8 || pageCount > 12 ? 'Large' :
    entityCount > 4 || pageCount > 6 ? 'Medium' : 'Small';

  const basePlan: ProjectPlan = {
    projectName,
    overview,
    techStack,
    modules,
    dataModel,
    pages,
    apiEndpoints,
    workflows,
    roles,
    fileBlueprint,
    kpis,
    estimatedComplexity,
  };

  try {
    return learningEngine.applyLearnedPatterns(basePlan);
  } catch {
    return basePlan;
  }
}

function generateProjectName(intent: IntentDecomposition, domain: IndustryDomain | null): string {
  if (domain) {
    const typeMap: Record<string, string> = {
      'consulting': 'ConsultingHub',
      'manufacturing': 'FactoryFlow',
      'healthcare': 'MediCare Pro',
      'retail': 'RetailEdge',
      'education': 'EduTrack',
      'realestate': 'PropertyHub',
      'hr': 'PeopleForce',
      'restaurant': 'DineOps',
      'fitness': 'FitManager',
      'logistics': 'LogiTrack',
      'finance': 'FinanceHub',
      'project-management': 'ProjectFlow',
      'crm': 'SalesPipe',
      'inventory': 'StockSense',
    };
    return typeMap[domain.id] || `${domain.name.split('/')[0].trim()} Manager`;
  }
  return `${intent.applicationType.toUpperCase()} System`;
}

function generateOverview(intent: IntentDecomposition, domain: IndustryDomain | null): string {
  if (domain) {
    return `A comprehensive ${domain.name.toLowerCase()} management system designed for ${intent.targetAudience}. ${domain.description}. Built with modern web technologies for reliability, speed, and ease of use.`;
  }
  return `A ${intent.applicationType} built for ${intent.targetAudience}. ${intent.primaryGoal}.`;
}

type IntentDecomposition = UnderstandingResult['level1_intent'];

function planModules(domain: IndustryDomain | null, selectedModuleNames: string[]): PlannedModule[] {
  if (!domain) return [];

  return domain.modules
    .filter(m => selectedModuleNames.includes(m.name))
    .map(m => ({
      name: m.name,
      description: m.description,
      entities: m.entities,
      pageCount: m.pages.length,
      features: m.pages.flatMap(p => p.features).slice(0, 8),
    }));
}

function planDataModel(domain: IndustryDomain | null, selectedModuleNames: string[]): PlannedEntity[] {
  if (!domain) return [];

  const entities = buildEntitiesForModules(domain, selectedModuleNames);
  if (entities.length === 0) {
    return domain.entities.map(mapEntity);
  }
  return entities.map(mapEntity);
}

function mapEntity(entity: DomainEntity): PlannedEntity {
  const tableName = toSnakeCase(entity.name) + 's';
  return {
    name: entity.name,
    tableName,
    fields: entity.fields.map(f => ({
      name: f.name,
      type: mapFieldType(f.type),
      required: f.required || false,
      description: f.description,
    })),
    relationships: (entity.relationships || []).map(r => ({
      entity: r.entity,
      type: r.type,
      field: r.field,
    })),
  };
}

function planPages(domain: IndustryDomain | null, selectedModuleNames: string[]): PlannedPage[] {
  if (!domain) return [];

  const pageGroups = buildPagesForModules(domain, selectedModuleNames);
  const pages: PlannedPage[] = [];

  for (const group of pageGroups) {
    for (const page of group.pages) {
      const componentName = page.name.replace(/[^a-zA-Z0-9]/g, '') + 'Page';
      pages.push({
        name: page.name,
        path: page.path,
        module: group.module,
        description: page.description,
        componentName,
        features: page.features,
        dataNeeded: extractDataNeeded(page.features, domain, group.module),
      });
    }
  }

  return pages;
}

function extractDataNeeded(features: string[], domain: IndustryDomain, moduleName: string): string[] {
  const mod = domain.modules.find(m => m.name === moduleName);
  if (!mod) return [];
  return mod.entities;
}

function planEndpoints(dataModel: PlannedEntity[]): PlannedEndpoint[] {
  const endpoints: PlannedEndpoint[] = [];

  for (const entity of dataModel) {
    const basePath = `/api/${toKebabCase(entity.name)}s`;
    const entityName = entity.name;

    endpoints.push({
      method: 'GET',
      path: basePath,
      description: `List all ${entityName.toLowerCase()}s with optional filters`,
      entity: entityName,
      responseType: `${entityName}[]`,
    });

    endpoints.push({
      method: 'GET',
      path: `${basePath}/:id`,
      description: `Get a single ${entityName.toLowerCase()} by ID`,
      entity: entityName,
      responseType: entityName,
    });

    endpoints.push({
      method: 'POST',
      path: basePath,
      description: `Create a new ${entityName.toLowerCase()}`,
      entity: entityName,
      requestBody: `Insert${entityName}`,
      responseType: entityName,
    });

    endpoints.push({
      method: 'PATCH',
      path: `${basePath}/:id`,
      description: `Update an existing ${entityName.toLowerCase()}`,
      entity: entityName,
      requestBody: `Partial<Insert${entityName}>`,
      responseType: entityName,
    });

    endpoints.push({
      method: 'DELETE',
      path: `${basePath}/:id`,
      description: `Delete a ${entityName.toLowerCase()}`,
      entity: entityName,
      responseType: 'void',
    });
  }

  return endpoints;
}

function planWorkflows(domain: IndustryDomain | null, dataModel: PlannedEntity[]): PlannedWorkflow[] {
  if (!domain) return [];

  const entityNames = dataModel.map(e => e.name);
  return buildWorkflowsForEntities(domain, entityNames).map(w => ({
    name: w.name,
    entity: w.entity,
    states: w.states,
    transitions: w.transitions,
  }));
}

function planRoles(domain: IndustryDomain | null, pages: PlannedPage[]): PlannedRole[] {
  if (!domain) return [];

  return domain.roles.map(r => ({
    name: r.name,
    description: r.description,
    permissions: r.permissions,
    canAccess: r.permissions.includes('all')
      ? pages.map(p => p.path)
      : pages.filter(p => {
        const moduleLower = p.module.toLowerCase();
        return r.permissions.some(perm =>
          perm.includes(moduleLower) || perm.includes('view') || perm.includes('manage')
        );
      }).map(p => p.path),
  }));
}

function planFiles(pages: PlannedPage[], dataModel: PlannedEntity[], modules: PlannedModule[]): PlannedFile[] {
  const files: PlannedFile[] = [];

  files.push({ path: 'shared/schema.ts', purpose: 'Database schema and types for all entities', type: 'schema' });
  files.push({ path: 'server/routes.ts', purpose: 'All API endpoint handlers', type: 'api' });
  files.push({ path: 'server/storage.ts', purpose: 'Database access layer (CRUD operations)', type: 'utility' });
  files.push({ path: 'client/src/App.tsx', purpose: 'Root component with routing and layout', type: 'config' });
  files.push({ path: 'client/src/lib/queryClient.ts', purpose: 'API client and TanStack Query setup', type: 'utility' });

  for (const page of pages) {
    const fileName = toKebabCase(page.componentName.replace('Page', ''));
    files.push({
      path: `client/src/pages/${fileName}.tsx`,
      purpose: page.description,
      type: 'page',
    });
  }

  for (const entity of dataModel) {
    const hasListPage = pages.some(p => p.dataNeeded.includes(entity.name));
    if (hasListPage) {
      files.push({
        path: `client/src/components/${toKebabCase(entity.name)}-form.tsx`,
        purpose: `Create/edit form for ${entity.name}`,
        type: 'component',
      });
    }
  }

  files.push({ path: 'client/src/components/layout.tsx', purpose: 'App shell with sidebar navigation', type: 'component' });
  files.push({ path: 'client/src/components/kpi-card.tsx', purpose: 'Reusable KPI metric card', type: 'component' });
  files.push({ path: 'client/src/components/data-table.tsx', purpose: 'Reusable data table with search, filter, sort', type: 'component' });
  files.push({ path: 'client/src/components/status-badge.tsx', purpose: 'Status badge with color-coded states', type: 'component' });

  return files;
}

function planKPIs(domain: IndustryDomain | null, selectedModuleNames: string[]): string[] {
  if (!domain) return ['Total Records', 'Active Items', 'Recent Activity'];

  const moduleKPIs = domain.modules
    .filter(m => selectedModuleNames.includes(m.name))
    .flatMap(m => m.kpis || []);

  const kpiSet = new Set([...domain.defaultKPIs, ...moduleKPIs]);
  const allKPIs = Array.from(kpiSet);
  return allKPIs.slice(0, 8);
}

export function formatPlanAsMessage(plan: ProjectPlan): string {
  const sections: string[] = [];

  sections.push(`# Project Plan: ${plan.projectName}\n`);
  sections.push(`${plan.overview}\n`);
  sections.push(`**Estimated Complexity:** ${plan.estimatedComplexity} | **${plan.pages.length} pages** | **${plan.dataModel.length} data tables** | **${plan.apiEndpoints.length} API endpoints**\n`);

  sections.push('---\n');
  sections.push('## Tech Stack\n');
  for (const item of plan.techStack) {
    sections.push(`- **${item.category}:** ${item.technology} - ${item.justification}`);
  }

  sections.push('\n---\n');
  sections.push('## Modules\n');
  for (const mod of plan.modules) {
    sections.push(`### ${mod.name}`);
    sections.push(`${mod.description}`);
    sections.push(`- **Pages:** ${mod.pageCount} | **Key Features:** ${mod.features.slice(0, 5).join(', ')}`);
    if (mod.entities.length > 0) {
      sections.push(`- **Data:** ${mod.entities.join(', ')}`);
    }
    sections.push('');
  }

  sections.push('---\n');
  sections.push('## Pages\n');
  sections.push('| Page | Path | Module | Features |');
  sections.push('|------|------|--------|----------|');
  for (const page of plan.pages) {
    sections.push(`| ${page.name} | \`${page.path}\` | ${page.module} | ${page.features.slice(0, 3).join(', ')} |`);
  }

  sections.push('\n---\n');
  sections.push('## Data Model\n');
  for (const entity of plan.dataModel) {
    const fieldList = entity.fields
      .filter(f => f.name !== 'id')
      .map(f => `${f.name} (${f.type}${f.required ? ', required' : ''})`)
      .join(', ');
    sections.push(`- **${entity.name}** → \`${entity.tableName}\`: ${fieldList}`);
  }

  if (plan.workflows.length > 0) {
    sections.push('\n---\n');
    sections.push('## Workflows\n');
    for (const wf of plan.workflows) {
      sections.push(`### ${wf.name}`);
      sections.push(`**States:** ${wf.states.join(' → ')}`);
      sections.push('**Transitions:**');
      for (const t of wf.transitions) {
        sections.push(`- ${t.from} → ${t.to}: "${t.action}" ${t.role ? `(by ${t.role})` : ''}`);
      }
      sections.push('');
    }
  }

  sections.push('---\n');
  sections.push('## API Endpoints\n');
  const groupedEndpoints: Record<string, PlannedEndpoint[]> = {};
  for (const ep of plan.apiEndpoints) {
    if (!groupedEndpoints[ep.entity]) groupedEndpoints[ep.entity] = [];
    groupedEndpoints[ep.entity].push(ep);
  }
  for (const [entity, eps] of Object.entries(groupedEndpoints)) {
    sections.push(`**${entity}:**`);
    for (const ep of eps) {
      sections.push(`- \`${ep.method} ${ep.path}\` - ${ep.description}`);
    }
    sections.push('');
  }

  if (plan.roles.length > 0) {
    sections.push('---\n');
    sections.push('## User Roles\n');
    for (const role of plan.roles) {
      sections.push(`- **${role.name}:** ${role.description} (${role.permissions.slice(0, 4).join(', ')})`);
    }
  }

  sections.push('\n---\n');
  sections.push(`## KPIs & Metrics\n`);
  sections.push(plan.kpis.map(k => `- ${k}`).join('\n'));

  sections.push('\n---\n');
  sections.push('## Files to Generate\n');
  sections.push(`**${plan.fileBlueprint.length} files total:**\n`);
  const filesByType: Record<string, PlannedFile[]> = {};
  for (const f of plan.fileBlueprint) {
    if (!filesByType[f.type]) filesByType[f.type] = [];
    filesByType[f.type].push(f);
  }
  for (const [type, files] of Object.entries(filesByType)) {
    sections.push(`**${type.charAt(0).toUpperCase() + type.slice(1)}s:**`);
    for (const f of files) {
      sections.push(`- \`${f.path}\` - ${f.purpose}`);
    }
    sections.push('');
  }

  sections.push('---\n');
  sections.push('**Ready to generate this project?** Reply "approve" to start code generation, or tell me what you\'d like to change.');

  return sections.join('\n');
}
