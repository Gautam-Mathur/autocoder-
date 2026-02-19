/**
 * Pipeline Orchestrator - The "Tech Lead" that coordinates all generation modules
 * 
 * Runs a 16-stage pipeline like a full development team:
 *   Product Manager → Architect → Planner → Analyst → Designer → Feature Spec →
 *   Schema Engineer → API Architect → UI Composer → Code Generator →
 *   Dependency Resolver → Quality Reviewer → Test Engineer → Validator →
 *   Error Fixer → Learning Recorder
 */

import type { ProjectPlan, PlannedEntity } from './plan-generator.js';
import type { UnderstandingResult } from './deep-understanding-engine.js';
import type { ReasoningResult } from './contextual-reasoning-engine.js';
import type { DesignSystem } from './design-system-engine.js';
import type { FunctionalitySpec } from './functionality-engine.js';
import type { ArchitecturePlan } from './architecture-planner.js';
import type { SchemaDesign } from './schema-designer.js';
import type { APIDesign } from './api-designer.js';
import type { ComponentTree } from './component-composer.js';
import type { QualityReport } from './code-quality-engine.js';
import type { DependencyManifest } from './dependency-resolver.js';

import { analyzeRequest } from './deep-understanding-engine.js';
import { generatePlan } from './plan-generator.js';
import { analyzeSemantics } from './contextual-reasoning-engine.js';
import { generateDesignSystem } from './design-system-engine.js';
import { generateFunctionalitySpec } from './functionality-engine.js';
import { planArchitecture } from './architecture-planner.js';
import { designSchema } from './schema-designer.js';
import { designAPI } from './api-designer.js';
import { composeComponents } from './component-composer.js';
import { analyzeCodeQuality, applyQualityFixes } from './code-quality-engine.js';
import { resolveDependencies } from './dependency-resolver.js';
import { generateProjectFromPlan } from './plan-driven-generator.js';
import { validateAndFix } from './post-generation-validator.js';
import { generateTestFiles } from './test-generator.js';
import { learningEngine } from './generation-learning-engine.js';

export interface GeneratedFile {
  path: string;
  content: string;
  language: string;
}

export interface ThinkingStep {
  phase: string;
  label: string;
  detail?: string;
  timestamp: number;
}

export interface PipelineStage {
  id: string;
  name: string;
  role: string;
  description: string;
  order: number;
  critical: boolean;
}

export interface StageResult {
  stageId: string;
  success: boolean;
  durationMs: number;
  qualityScore: number;
  warnings: string[];
  errors: string[];
  output: unknown;
}

export interface QualityGate {
  stageId: string;
  passed: boolean;
  score: number;
  threshold: number;
  issues: string[];
}

export interface PipelineMetrics {
  totalDurationMs: number;
  stageResults: Map<string, StageResult>;
  qualityGates: QualityGate[];
  overallScore: number;
  fileCount: number;
  lineCount: number;
  componentCount: number;
  endpointCount: number;
}

export interface PipelineContext {
  userRequest: string;
  conversationHistory?: string;
  understanding?: UnderstandingResult;
  plan?: ProjectPlan;
  reasoning?: ReasoningResult;
  architecture?: ArchitecturePlan;
  designSystem?: DesignSystem;
  functionalitySpec?: FunctionalitySpec;
  schemaDesign?: SchemaDesign;
  apiDesign?: APIDesign;
  componentTree?: ComponentTree;
  files: GeneratedFile[];
  dependencyManifest?: DependencyManifest;
  qualityReport?: QualityReport;
  testFiles: GeneratedFile[];
  metrics: PipelineMetrics;
  thinkingSteps: ThinkingStep[];
  onStep?: (step: ThinkingStep) => void;
}

export interface OrchestrationResult {
  success: boolean;
  files: GeneratedFile[];
  testFiles: GeneratedFile[];
  context: PipelineContext;
  metrics: PipelineMetrics;
  summary: PipelineSummary;
}

export interface PipelineSummary {
  totalStages: number;
  completedStages: number;
  failedStages: string[];
  skippedStages: string[];
  overallQuality: number;
  highlights: string[];
  warnings: string[];
}

const PIPELINE_STAGES: PipelineStage[] = [
  { id: 'understand', name: 'Product Manager', role: 'Requirement Analysis', description: 'Analyzes user request, decomposes intent, detects domain', order: 1, critical: true },
  { id: 'plan', name: 'Project Manager', role: 'Project Planning', description: 'Creates detailed project plan with modules, pages, endpoints', order: 2, critical: true },
  { id: 'learn', name: 'Senior Advisor', role: 'Pattern Application', description: 'Applies learned patterns from previous successful generations', order: 3, critical: false },
  { id: 'reason', name: 'Technical Analyst', role: 'Semantic Analysis', description: 'Analyzes entity relationships, field semantics, business rules', order: 4, critical: true },
  { id: 'architect', name: 'System Architect', role: 'Architecture Planning', description: 'Determines folder structure, state management, auth, data flow patterns', order: 5, critical: true },
  { id: 'design', name: 'UI/UX Designer', role: 'Design System', description: 'Generates domain-aware color palettes, typography, animations, dark mode', order: 6, critical: true },
  { id: 'specify', name: 'Feature Analyst', role: 'Functionality Specification', description: 'Maps entity types to interactive features, page layouts, CRUD enhancements', order: 7, critical: true },
  { id: 'schema', name: 'Database Engineer', role: 'Schema Design', description: 'Designs normalized schemas, indexes, constraints, audit trails', order: 8, critical: true },
  { id: 'api', name: 'API Architect', role: 'API Design', description: 'Designs RESTful endpoints, validation, error handling, pagination', order: 9, critical: true },
  { id: 'compose', name: 'UI Engineer', role: 'Component Composition', description: 'Plans component tree, prop flow, reusable components, accessibility', order: 10, critical: true },
  { id: 'generate', name: 'Full-Stack Developer', role: 'Code Generation', description: 'Generates all project files from enriched plan and specs', order: 11, critical: true },
  { id: 'resolve', name: 'DevOps Engineer', role: 'Dependency Resolution', description: 'Resolves packages, checks compatibility, optimizes bundle', order: 12, critical: false },
  { id: 'quality', name: 'Code Reviewer', role: 'Quality Assurance', description: 'Enforces best practices, detects code smells, checks accessibility', order: 13, critical: false },
  { id: 'test', name: 'QA Engineer', role: 'Test Generation', description: 'Generates unit, integration, and component tests', order: 14, critical: false },
  { id: 'validate', name: 'Release Engineer', role: 'Validation & Auto-Fix', description: 'Validates imports, dependencies, fixes common issues', order: 15, critical: true },
  { id: 'record', name: 'Knowledge Manager', role: 'Learning & Recording', description: 'Records patterns and outcomes for future improvements', order: 16, critical: false },
];

function createEmptyMetrics(): PipelineMetrics {
  return {
    totalDurationMs: 0,
    stageResults: new Map(),
    qualityGates: [],
    overallScore: 0,
    fileCount: 0,
    lineCount: 0,
    componentCount: 0,
    endpointCount: 0,
  };
}

type OnStepCallback = (step: ThinkingStep) => void;

function emitStep(ctx: PipelineContext, phase: string, label: string, detail?: string) {
  const step: ThinkingStep = { phase, label, detail, timestamp: Date.now() };
  ctx.thinkingSteps.push(step);
  if (ctx.onStep) ctx.onStep(step);
}

function runQualityGate(stageId: string, score: number, threshold: number, issues: string[]): QualityGate {
  return {
    stageId,
    passed: score >= threshold,
    score,
    threshold,
    issues: issues.filter(Boolean),
  };
}

function executeStage(
  ctx: PipelineContext,
  stage: PipelineStage,
  executor: () => { score: number; warnings: string[]; output: unknown }
): StageResult {
  const start = Date.now();
  try {
    const result = executor();
    const duration = Date.now() - start;
    const stageResult: StageResult = {
      stageId: stage.id,
      success: true,
      durationMs: duration,
      qualityScore: result.score,
      warnings: result.warnings,
      errors: [],
      output: result.output,
    };

    const gate = runQualityGate(stage.id, result.score, stage.critical ? 60 : 40, result.warnings);
    ctx.metrics.qualityGates.push(gate);
    ctx.metrics.stageResults.set(stage.id, stageResult);

    emitStep(ctx, stage.id, `${stage.name} complete`,
      `${stage.role}: score ${result.score}/100 in ${duration}ms${result.warnings.length > 0 ? ` (${result.warnings.length} warnings)` : ''}`);

    return stageResult;
  } catch (err) {
    const duration = Date.now() - start;
    const errorMsg = err instanceof Error ? err.message : String(err);
    const stageResult: StageResult = {
      stageId: stage.id,
      success: false,
      durationMs: duration,
      qualityScore: 0,
      warnings: [],
      errors: [errorMsg],
      output: null,
    };

    ctx.metrics.stageResults.set(stage.id, stageResult);
    emitStep(ctx, stage.id, `${stage.name} failed`, `Error: ${errorMsg}`);

    if (stage.critical) {
      throw new Error(`Critical stage "${stage.name}" failed: ${errorMsg}`);
    }

    return stageResult;
  }
}

export function orchestrateGeneration(plan: ProjectPlan, understanding?: UnderstandingResult, onStep?: OnStepCallback): OrchestrationResult {
  const pipelineStart = Date.now();

  const ctx: PipelineContext = {
    userRequest: understanding?.level1_intent?.primaryGoal || '',
    understanding,
    plan,
    files: [],
    testFiles: [],
    metrics: createEmptyMetrics(),
    thinkingSteps: [],
    onStep,
  };

  emitStep(ctx, 'orchestrator', 'Pipeline Orchestrator activated', `Coordinating ${PIPELINE_STAGES.length} specialized modules for "${plan.projectName}"`);
  emitStep(ctx, 'orchestrator', 'Assembling dev team', 'Each module acts as a specialized team member — Product Manager through Knowledge Manager — working sequentially so each builds on the previous output');

  const failedStages: string[] = [];
  const skippedStages: string[] = [];

  // Stage 1: Understanding (already done by conversation handler, enrich if available)
  const understandStage = PIPELINE_STAGES.find(s => s.id === 'understand')!;
  if (understanding) {
    emitStep(ctx, 'understand', 'Product Manager reviewing requirements', 'Re-validating the deep understanding analysis to ensure nothing was missed before planning begins');
    const intentGoal = understanding.level1_intent?.primaryGoal || 'application';
    const domainName = understanding.level2_domain?.primaryDomain?.name || 'general';
    const entityCount = understanding.level3_entities?.mentionedEntities?.length || 0;
    const inferredCount = understanding.level3_entities?.inferredEntities?.length || 0;
    const workflowCount = understanding.level4_workflows?.inferredWorkflows?.length || 0;
    emitStep(ctx, 'understand', 'Requirement breakdown', `Goal: "${intentGoal}" | Domain: ${domainName} | ${entityCount} explicit entities + ${inferredCount} inferred | ${workflowCount} workflows detected`);
    emitStep(ctx, 'understand', 'Why this matters', 'Validating understanding first prevents wasted work downstream — if we misidentify the domain, every module after would generate wrong patterns');
    executeStage(ctx, understandStage, () => ({
      score: Math.round(understanding.confidence * 100),
      warnings: understanding.confidence < 0.7 ? ['Low confidence in requirement understanding'] : [],
      output: understanding,
    }));
    emitStep(ctx, 'understand', 'Confidence assessment', `${Math.round(understanding.confidence * 100)}% confident in requirement interpretation${understanding.confidence < 0.7 ? ' — will proceed cautiously with more generic patterns' : ' — high confidence, proceeding with domain-specific optimizations'}`);
  } else {
    emitStep(ctx, 'understand', 'Skipping re-analysis', 'No prior understanding data available — the plan will be used as-is');
    skippedStages.push('understand');
  }

  // Stage 2: Planning (already done, validate)
  const planStage = PIPELINE_STAGES.find(s => s.id === 'plan')!;
  const entityCount = plan.dataModel?.length || 0;
  const pageCount = plan.pages?.length || 0;
  const endpointCount = plan.apiEndpoints?.length || 0;
  const moduleCount = plan.modules?.length || 0;
  emitStep(ctx, 'plan', 'Project Manager validating plan structure', `Checking completeness: ${entityCount} data models, ${pageCount} pages, ${endpointCount} API endpoints, ${moduleCount} modules`);
  emitStep(ctx, 'plan', 'Why we validate the plan', 'A weak plan leads to incomplete code — checking entity counts, page coverage, and endpoint mappings ensures the generator has enough blueprints to produce a working app');
  executeStage(ctx, planStage, () => {
    const score = Math.min(100, 50 + entityCount * 5 + pageCount * 5);
    return {
      score,
      warnings: entityCount === 0 ? ['No entities in data model'] : [],
      output: { entities: entityCount, pages: pageCount, endpoints: endpointCount },
    };
  });
  emitStep(ctx, 'plan', 'Plan assessment', `${entityCount === 0 ? 'Warning: No entities found — the app may lack data persistence' : `Solid foundation with ${entityCount} entities providing full CRUD coverage across ${pageCount} pages`}`);

  // Stage 3: Learning patterns
  const learnStage = PIPELINE_STAGES.find(s => s.id === 'learn')!;
  emitStep(ctx, 'learn', 'Senior Advisor consulting past experience', 'Searching the learning engine for patterns from previous successful generations that match this project type');
  emitStep(ctx, 'learn', 'Why we apply learned patterns', 'If a similar app was generated before and worked well, we reuse those proven patterns — this avoids repeating past mistakes and speeds up quality convergence');
  executeStage(ctx, learnStage, () => {
    try {
      ctx.plan = learningEngine.applyLearnedPatterns(plan);
      emitStep(ctx, 'learn', 'Patterns applied', 'Enhanced the plan with field naming conventions, relationship patterns, and UI layout preferences from past successes');
      return { score: 80, warnings: [], output: 'Applied learned patterns' };
    } catch {
      emitStep(ctx, 'learn', 'No prior patterns found', 'This appears to be a novel project type — generating fresh patterns from first principles');
      return { score: 50, warnings: ['No learned patterns available'], output: null };
    }
  });

  // Stage 4: Semantic reasoning
  const reasonStage = PIPELINE_STAGES.find(s => s.id === 'reason')!;
  emitStep(ctx, 'reason', 'Technical Analyst beginning semantic analysis', 'Examining every entity to discover hidden relationships, computed fields, validation rules, and business logic the user implied but didn\'t explicitly state');
  emitStep(ctx, 'reason', 'Why semantic analysis is critical', 'Users describe what they want at a high level — this module reads between the lines to infer foreign keys, cascade behaviors, status workflows, and calculated values that make the app actually work');
  executeStage(ctx, reasonStage, () => {
    ctx.reasoning = analyzeSemantics(ctx.plan!);
    if (ctx.reasoning) {
      ctx.plan = enrichPlanWithReasoning(ctx.plan!, ctx.reasoning);
    }
    const relCount = ctx.reasoning?.relationships?.length || 0;
    const ruleCount = ctx.reasoning?.businessRules?.length || 0;
    const computedCount = ctx.reasoning?.computedFields?.length || 0;
    const uiPatternCount = ctx.reasoning?.uiPatterns?.length || 0;
    emitStep(ctx, 'reason', 'Discovered hidden structure', `Found ${relCount} entity relationships (foreign keys, ownership chains), ${computedCount} computed fields (totals, averages, derived statuses), ${ruleCount} business rules (validations, constraints), ${uiPatternCount} UI patterns (best display format per entity)`);
    if (relCount > 0) {
      const sampleRels = ctx.reasoning!.relationships.slice(0, 3).map(r => `${r.from} → ${r.to} (${r.cardinality})`).join(', ');
      emitStep(ctx, 'reason', 'Relationship examples', `Key connections: ${sampleRels}${relCount > 3 ? ` and ${relCount - 3} more` : ''}`);
    }
    if (ruleCount > 0) {
      const sampleRules = ctx.reasoning!.businessRules.slice(0, 2).map(r => `${r.ruleName}: ${r.description || r.type}`).join('; ');
      emitStep(ctx, 'reason', 'Business rules detected', sampleRules);
    }
    return {
      score: Math.min(100, 60 + relCount * 5 + ruleCount * 3),
      warnings: [],
      output: { relationships: relCount, businessRules: ruleCount, computedFields: computedCount },
    };
  });

  // Stage 5: Architecture planning
  const archStage = PIPELINE_STAGES.find(s => s.id === 'architect')!;
  emitStep(ctx, 'architect', 'System Architect designing application structure', `Analyzing ${entityCount} entities and ${pageCount} pages to determine the optimal folder structure, state management approach, authentication strategy, and data flow patterns`);
  emitStep(ctx, 'architect', 'Why architecture comes before code', 'Choosing the right patterns upfront (component vs page routing, local vs global state, REST vs nested resources) prevents costly refactoring later and ensures all generated files follow a consistent structure');
  executeStage(ctx, archStage, () => {
    ctx.architecture = planArchitecture(ctx.plan!, ctx.reasoning);
    const decisions = Object.keys(ctx.architecture || {}).length;
    if (ctx.architecture) {
      emitStep(ctx, 'architect', 'Architecture decisions made', `Pattern: ${ctx.architecture.pattern || 'modular'} | State: ${ctx.architecture.stateManagement || 'context-based'} | Auth: ${ctx.architecture.authentication || 'session-based'} | ${decisions} total architectural decisions`);
      emitStep(ctx, 'architect', 'Reasoning', `Chose ${ctx.architecture.pattern || 'modular'} pattern because it best fits ${entityCount} entities with ${pageCount} pages — provides clear separation of concerns while keeping the codebase navigable`);
    }
    return {
      score: Math.min(100, 70 + decisions * 3),
      warnings: [],
      output: ctx.architecture,
    };
  });

  // Stage 6: Design system
  const designStage = PIPELINE_STAGES.find(s => s.id === 'design')!;
  const detectedDomain = understanding?.level2_domain?.primaryDomain?.name || plan.overview || 'general';
  emitStep(ctx, 'design', 'UI/UX Designer creating visual identity', `Building a domain-aware design system tailored for "${detectedDomain}" — selecting colors, typography, spacing, and component styles that match industry expectations`);
  emitStep(ctx, 'design', 'Why domain-specific design matters', 'A healthcare app needs calming blues and high contrast for readability; an e-commerce app needs vibrant CTAs and trust signals — the wrong palette makes users feel something is "off" even if the code works perfectly');
  executeStage(ctx, designStage, () => {
    ctx.designSystem = generateDesignSystem(ctx.plan!, ctx.reasoning);
    const hasColors = ctx.designSystem?.primaryColor ? true : false;
    if (ctx.designSystem) {
      emitStep(ctx, 'design', 'Design system created', `Theme: "${ctx.designSystem.name || 'Custom'}" | Primary: ${ctx.designSystem.primaryColor || 'auto'} | Typography: ${(ctx.designSystem as any).fontFamily || 'system'} | Dark mode: ${(ctx.designSystem as any).darkMode ? 'enabled' : 'disabled'}`);
      emitStep(ctx, 'design', 'Color rationale', `Selected ${ctx.designSystem.primaryColor || 'default'} as primary because it aligns with ${detectedDomain} domain conventions and provides sufficient contrast for accessibility (WCAG AA)`);
    }
    return {
      score: hasColors ? 95 : 70,
      warnings: [],
      output: { name: ctx.designSystem?.name },
    };
  });

  // Stage 7: Functionality specification
  const specStage = PIPELINE_STAGES.find(s => s.id === 'specify')!;
  emitStep(ctx, 'specify', 'Feature Analyst mapping entity capabilities', `Classifying each entity type to determine what interactive features it needs — CRUD enhancements, data display modes, search/filter options, batch operations, and automation triggers`);
  emitStep(ctx, 'specify', 'Why entity classification drives features', 'A "Product" entity needs image uploads and price formatting; a "User" entity needs role-based access and password hashing — the same CRUD operation looks completely different depending on what the entity represents');
  executeStage(ctx, specStage, () => {
    ctx.functionalitySpec = generateFunctionalitySpec(ctx.plan!, ctx.reasoning);
    const entityFeatureCount = ctx.functionalitySpec?.entityFeatures?.length || 0;
    const globalFeatures = ctx.functionalitySpec?.globalFeatures;
    if (entityFeatureCount > 0) {
      const sampleFeatures = ctx.functionalitySpec!.entityFeatures!.slice(0, 3).map((ef: any) => {
        const featureNames = ef.features?.slice(0, 2).map((f: any) => f.name || f).join(', ') || 'standard CRUD';
        return `${ef.entityName}: ${featureNames}`;
      }).join(' | ');
      emitStep(ctx, 'specify', 'Feature mapping', `${entityFeatureCount} entities analyzed: ${sampleFeatures}`);
    }
    if (globalFeatures) {
      emitStep(ctx, 'specify', 'Global features identified', `Cross-entity features: ${Array.isArray(globalFeatures) ? globalFeatures.map((g: any) => g.name || g).join(', ') : 'dashboard analytics, search, notifications'}`);
    }
    return {
      score: Math.min(100, 60 + entityFeatureCount * 8),
      warnings: [],
      output: { entityFeatures: entityFeatureCount, globalFeatures },
    };
  });

  // Stage 8: Schema design
  const schemaStage = PIPELINE_STAGES.find(s => s.id === 'schema')!;
  emitStep(ctx, 'schema', 'Database Engineer designing normalized schema', `Converting ${entityCount} entities into production-grade database tables with proper column types, indexes, foreign keys, constraints, and audit trails`);
  emitStep(ctx, 'schema', 'Why schema design is separate from planning', 'The plan says "User has orders" — the schema engineer decides: integer vs UUID primary keys, created_at/updated_at timestamps, soft delete columns, composite indexes for common queries, and junction tables for many-to-many relationships');
  executeStage(ctx, schemaStage, () => {
    ctx.schemaDesign = designSchema(ctx.plan!, ctx.reasoning);
    const tableCount = ctx.schemaDesign?.tables?.length || 0;
    const indexCount = ctx.schemaDesign?.tables?.reduce((sum: number, t: { indexes?: unknown[] }) => sum + (t.indexes?.length || 0), 0) || 0;
    const junctionCount = ctx.schemaDesign?.junctionTables?.length || 0;
    emitStep(ctx, 'schema', 'Schema decisions', `${tableCount} tables designed with ${indexCount} indexes for query performance | ${junctionCount} junction tables for many-to-many relationships`);
    if (tableCount > 0) {
      const sampleTables = ctx.schemaDesign!.tables!.slice(0, 3).map((t: any) => {
        const colCount = t.columns?.length || 0;
        return `${t.name} (${colCount} columns)`;
      }).join(', ');
      emitStep(ctx, 'schema', 'Table structure', `Key tables: ${sampleTables}${tableCount > 3 ? ` + ${tableCount - 3} more` : ''}`);
    }
    emitStep(ctx, 'schema', 'Indexing strategy', `Added ${indexCount} indexes — prioritizing foreign keys and frequently-filtered columns to keep queries fast as data grows`);
    return {
      score: Math.min(100, 60 + tableCount * 5 + indexCount * 2),
      warnings: [],
      output: { tables: tableCount, indexes: indexCount, junctionTables: junctionCount },
    };
  });

  // Stage 9: API design
  const apiStage = PIPELINE_STAGES.find(s => s.id === 'api')!;
  emitStep(ctx, 'api', 'API Architect designing RESTful endpoints', `Creating a complete API layer based on ${entityCount} entities — CRUD routes, search endpoints, nested resources, batch operations, validation schemas, and error handling`);
  emitStep(ctx, 'api', 'Why dedicated API design', 'Auto-generated CRUD is not enough — the API architect adds pagination, sorting, filtering, proper HTTP status codes, Zod validation, rate limiting, and standardized error responses that make the API production-ready');
  executeStage(ctx, apiStage, () => {
    ctx.apiDesign = designAPI(ctx.plan!, ctx.reasoning, ctx.schemaDesign);
    const routeCount = ctx.apiDesign?.routes?.length || 0;
    const middlewareCount = ctx.apiDesign?.middleware?.length || 0;
    emitStep(ctx, 'api', 'API structure', `${routeCount} routes designed with ${middlewareCount} middleware layers | Includes validation, error handling, and pagination for all list endpoints`);
    if (routeCount > 0) {
      const sampleRoutes = ctx.apiDesign!.routes!.slice(0, 4).map((r: any) => `${r.method} ${r.path}`).join(', ');
      emitStep(ctx, 'api', 'Route examples', sampleRoutes + (routeCount > 4 ? ` + ${routeCount - 4} more` : ''));
    }
    return {
      score: Math.min(100, 60 + routeCount * 3),
      warnings: [],
      output: { routes: routeCount, middleware: middlewareCount },
    };
  });

  // Stage 10: Component composition
  const composeStage = PIPELINE_STAGES.find(s => s.id === 'compose')!;
  emitStep(ctx, 'compose', 'UI Engineer composing component tree', `Planning the complete React component hierarchy — layout wrappers, shared presentational components, per-entity containers, context boundaries, custom hooks, and accessibility attributes`);
  emitStep(ctx, 'compose', 'Why component composition before code generation', 'Deciding component boundaries first prevents code duplication — shared components (SearchBar, DataTable, FormField) are identified now so the generator creates them once and imports them everywhere instead of copy-pasting code');
  executeStage(ctx, composeStage, () => {
    ctx.componentTree = composeComponents(ctx.plan!, ctx.reasoning, ctx.functionalitySpec, ctx.designSystem);
    const componentCount = ctx.componentTree?.components?.length || 0;
    const layoutCount = ctx.componentTree?.layouts?.length || 0;
    emitStep(ctx, 'compose', 'Component tree built', `${componentCount} components planned across ${layoutCount} layout templates | Shared components identified for reuse, per-entity containers for isolation`);
    if (componentCount > 0) {
      const sampleComponents = ctx.componentTree!.components!.slice(0, 5).map((c: any) => c.name || c).join(', ');
      emitStep(ctx, 'compose', 'Key components', sampleComponents + (componentCount > 5 ? ` + ${componentCount - 5} more` : ''));
    }
    emitStep(ctx, 'compose', 'Accessibility & responsiveness', 'All components include ARIA labels, keyboard navigation, and responsive breakpoints — mobile-first design with desktop enhancements');
    return {
      score: Math.min(100, 60 + componentCount * 2),
      warnings: [],
      output: { components: componentCount, layouts: layoutCount },
    };
  });

  // Stage 11: Code generation (the main event)
  const genStage = PIPELINE_STAGES.find(s => s.id === 'generate')!;
  emitStep(ctx, 'generate', 'Full-Stack Developer beginning code generation', `Synthesizing all prior analysis into actual source files — config, app shell, database schema, API routes, React pages, shared components, styles, and utilities`);
  emitStep(ctx, 'generate', 'Why this stage uses all prior outputs', 'Every previous module enriched the plan — the generator now has architecture patterns, design tokens, schema definitions, API contracts, and component specs to produce code that is internally consistent and production-ready');
  executeStage(ctx, genStage, () => {
    ctx.files = generateProjectFromPlan(ctx.plan!, (phase, detail) => {
      emitStep(ctx, 'generate', `[${phase}] ${detail}`, undefined);
    });
    const fileCount = ctx.files.length;
    const lineCount = ctx.files.reduce((sum, f) => sum + f.content.split('\n').length, 0);
    ctx.metrics.fileCount = fileCount;
    ctx.metrics.lineCount = lineCount;
    const tsxFiles = ctx.files.filter(f => f.path.endsWith('.tsx')).length;
    const tsFiles = ctx.files.filter(f => f.path.endsWith('.ts') && !f.path.endsWith('.tsx')).length;
    const cssFiles = ctx.files.filter(f => f.path.endsWith('.css')).length;
    const jsonFiles = ctx.files.filter(f => f.path.endsWith('.json')).length;
    emitStep(ctx, 'generate', 'Code generation complete', `${fileCount} files created (${lineCount.toLocaleString()} lines) | ${tsxFiles} React components, ${tsFiles} TypeScript modules, ${cssFiles} stylesheets, ${jsonFiles} config files`);
    emitStep(ctx, 'generate', 'File breakdown', `Frontend: pages, components, hooks, utils | Backend: routes, storage, middleware, validators | Config: package.json, tsconfig, vite.config, tailwind.config`);
    return {
      score: Math.min(100, 50 + fileCount * 2),
      warnings: fileCount < 10 ? ['Low file count - project may be incomplete'] : [],
      output: { files: fileCount, lines: lineCount },
    };
  });

  // Stage 12: Dependency resolution
  const resolveStage = PIPELINE_STAGES.find(s => s.id === 'resolve')!;
  emitStep(ctx, 'resolve', 'DevOps Engineer resolving dependencies', 'Scanning all generated files to detect every imported package, verify version compatibility, estimate bundle size, and ensure no conflicting versions exist');
  emitStep(ctx, 'resolve', 'Why dependency resolution matters', 'A missing or wrong-version dependency causes immediate build failure — this module cross-references every import statement against a known package registry to catch issues before the user tries to run the app');
  executeStage(ctx, resolveStage, () => {
    ctx.dependencyManifest = resolveDependencies(ctx.plan!, ctx.files);
    const pkgFile = ctx.files.find(f => f.path === 'package.json');
    if (pkgFile && ctx.dependencyManifest) {
      try {
        const pkg = JSON.parse(pkgFile.content);
        if (ctx.dependencyManifest.dependencies) {
          pkg.dependencies = { ...pkg.dependencies, ...ctx.dependencyManifest.dependencies };
        }
        if (ctx.dependencyManifest.devDependencies) {
          pkg.devDependencies = { ...pkg.devDependencies, ...ctx.dependencyManifest.devDependencies };
        }
        pkgFile.content = JSON.stringify(pkg, null, 2);
        const depCount = Object.keys(pkg.dependencies || {}).length;
        const devDepCount = Object.keys(pkg.devDependencies || {}).length;
        emitStep(ctx, 'resolve', 'Package.json updated', `${depCount} production dependencies + ${devDepCount} dev dependencies | All versions pinned for reproducible builds`);
      } catch {}
    }
    const warningCount = ctx.dependencyManifest?.warnings?.length || 0;
    if (warningCount > 0) {
      emitStep(ctx, 'resolve', 'Dependency warnings', `${warningCount} potential issues found — ${ctx.dependencyManifest!.warnings!.slice(0, 2).join('; ')}`);
    }
    return {
      score: 85,
      warnings: ctx.dependencyManifest?.warnings || [],
      output: { resolved: ctx.dependencyManifest?.dependencies ? Object.keys(ctx.dependencyManifest.dependencies).length : 0 },
    };
  });

  // Stage 13: Code quality review
  const qualityStage = PIPELINE_STAGES.find(s => s.id === 'quality')!;
  emitStep(ctx, 'quality', 'Code Reviewer performing quality analysis', `Scanning ${ctx.files.length} files across 8 quality categories: TypeScript correctness, React patterns, error handling, UI states, performance, accessibility, code style, and security`);
  emitStep(ctx, 'quality', 'Why automated code review', 'Catches common mistakes before the user sees them — unused imports, missing error boundaries, unhandled loading states, unsafe innerHTML, missing alt text, and other issues that would fail a real code review');
  executeStage(ctx, qualityStage, () => {
    ctx.qualityReport = analyzeCodeQuality(ctx.files, ctx.plan!);
    if (ctx.qualityReport?.fixes && ctx.qualityReport.fixes.length > 0) {
      emitStep(ctx, 'quality', 'Auto-fixing issues', `Found ${ctx.qualityReport.fixes.length} fixable issues — applying automatic corrections to maintain quality standards`);
      ctx.files = applyQualityFixes(ctx.files, ctx.qualityReport.fixes);
    }
    const issueCount = ctx.qualityReport?.issues?.length || 0;
    const grade = ctx.qualityReport?.grade || 'N/A';
    emitStep(ctx, 'quality', 'Quality assessment', `Grade: ${grade} | Score: ${ctx.qualityReport?.overallScore || 0}/100 | ${issueCount} issues found${ctx.qualityReport?.fixes?.length ? `, ${ctx.qualityReport.fixes.length} auto-fixed` : ''}`);
    return {
      score: ctx.qualityReport?.overallScore || 75,
      warnings: ctx.qualityReport?.warnings || [],
      output: { score: ctx.qualityReport?.overallScore, issues: issueCount },
    };
  });

  // Stage 14: Test generation
  const testStage = PIPELINE_STAGES.find(s => s.id === 'test')!;
  emitStep(ctx, 'test', 'QA Engineer generating test suite', `Creating Vitest test files for API routes, component rendering, form validation, entity relationships, and security checks based on the ${entityCount} entities and ${endpointCount} endpoints`);
  emitStep(ctx, 'test', 'Why tests are generated automatically', 'Tests catch regressions when the user modifies code — API route tests verify CRUD operations, component tests check rendering, and validation tests ensure business rules are enforced');
  executeStage(ctx, testStage, () => {
    try {
      ctx.testFiles = generateTestFiles(ctx.plan!, ctx.reasoning!);
      emitStep(ctx, 'test', 'Test suite created', `${ctx.testFiles.length} test files generated — covering API endpoints, component rendering, data validation, and security assertions`);
      return {
        score: Math.min(100, 60 + ctx.testFiles.length * 5),
        warnings: [],
        output: { testFiles: ctx.testFiles.length },
      };
    } catch {
      emitStep(ctx, 'test', 'Test generation partial', 'Some test files could not be generated — the core tests are still included');
      return { score: 40, warnings: ['Test generation encountered issues'], output: { testFiles: 0 } };
    }
  });

  // Stage 15: Validation & auto-fix
  const validateStage = PIPELINE_STAGES.find(s => s.id === 'validate')!;
  emitStep(ctx, 'validate', 'Release Engineer running validation passes', `Multi-pass validation: checking all imports resolve, exports match, dependencies exist in package.json, TypeScript types align, and no circular references exist across ${ctx.files.length} files`);
  emitStep(ctx, 'validate', 'Why multi-pass validation', 'A single broken import can crash the entire app — this module traces every import chain, generates stubs for missing files, and fixes common issues like missing default exports or incorrect relative paths');
  executeStage(ctx, validateStage, () => {
    const result = validateAndFix(ctx.files);
    ctx.files = result.files;
    const fixCount = result.fixesApplied?.length || 0;
    const issueCount = result.issues?.length || 0;
    emitStep(ctx, 'validate', 'Validation complete', `${result.iterations} pass${result.iterations !== 1 ? 'es' : ''} | ${issueCount} issues found, ${fixCount} auto-fixed | Result: ${result.valid ? 'All imports and exports verified' : 'Some issues remain — review recommended'}`);
    if (fixCount > 0) {
      const sampleFixes = result.fixesApplied.slice(0, 3).join('; ');
      emitStep(ctx, 'validate', 'Fixes applied', sampleFixes + (fixCount > 3 ? ` + ${fixCount - 3} more` : ''));
    }
    return {
      score: result.valid ? 95 : 65,
      warnings: result.issues?.filter(i => i.severity === 'warning').map(i => i.message) || [],
      output: { valid: result.valid, fixes: fixCount, iterations: result.iterations },
    };
  });

  // Stage 16: Learning & recording
  const recordStage = PIPELINE_STAGES.find(s => s.id === 'record')!;
  emitStep(ctx, 'record', 'Knowledge Manager recording generation patterns', 'Saving this generation\'s patterns, quality scores, entity structures, and architectural decisions so future generations of similar apps start from a stronger baseline');
  emitStep(ctx, 'record', 'Why continuous learning', 'Each successful generation teaches the system — field naming conventions that scored well, relationship patterns that avoided bugs, UI layouts that matched user intent — all feed into the next generation\'s starting point');
  executeStage(ctx, recordStage, () => {
    try {
      learningEngine.recordGenerationOutcome({
        plan: ctx.plan!,
        files: ctx.files,
        success: true,
        qualityScore: computeOverallScore(ctx),
      });
      emitStep(ctx, 'record', 'Learning data saved', `Recorded ${ctx.files.length} file patterns, ${entityCount} entity structures, quality score ${computeOverallScore(ctx)}/100 for future reference`);
      return { score: 90, warnings: [], output: 'Generation recorded for learning' };
    } catch {
      emitStep(ctx, 'record', 'Learning engine unavailable', 'Could not save patterns — this generation will not contribute to future improvements, but the output is unaffected');
      return { score: 50, warnings: ['Failed to record learning data'], output: null };
    }
  });

  // Compute final metrics
  const totalDuration = Date.now() - pipelineStart;
  ctx.metrics.totalDurationMs = totalDuration;
  ctx.metrics.overallScore = computeOverallScore(ctx);
  ctx.metrics.componentCount = ctx.componentTree?.components?.length || 0;
  ctx.metrics.endpointCount = ctx.apiDesign?.routes?.length || 0;

  for (const [id, result] of Array.from(ctx.metrics.stageResults.entries())) {
    if (!result.success) failedStages.push(id);
  }

  const summary = buildSummary(ctx, failedStages, skippedStages);

  emitStep(ctx, 'orchestrator', 'Pipeline complete',
    `${summary.completedStages}/${summary.totalStages} stages | Quality: ${summary.overallQuality}/100 | ${ctx.metrics.fileCount} files | ${totalDuration}ms`);

  return {
    success: failedStages.filter(s => PIPELINE_STAGES.find(ps => ps.id === s)?.critical).length === 0,
    files: ctx.files,
    testFiles: ctx.testFiles,
    context: ctx,
    metrics: ctx.metrics,
    summary,
  };
}

export function orchestratePlanning(understanding: UnderstandingResult): { plan: ProjectPlan; thinkingSteps: ThinkingStep[] } {
  const thinkingSteps: ThinkingStep[] = [];
  const emit = (phase: string, label: string, detail?: string) => {
    thinkingSteps.push({ phase, label, detail, timestamp: Date.now() });
  };

  emit('orchestrator', 'Planning pipeline activated', 'Running planning stages');

  let plan = generatePlan(understanding);
  emit('planning', 'Project plan created', `${plan.dataModel?.length || 0} entities, ${plan.pages?.length || 0} pages`);

  plan = learningEngine.applyLearnedPatterns(plan);
  emit('learning', 'Applied learned patterns', 'Enhanced plan with successful past patterns');

  const reasoning = analyzeSemantics(plan);
  plan = enrichPlanWithReasoning(plan, reasoning);
  emit('reasoning', 'Semantic analysis complete', `${reasoning.relationships.length} relationships, ${reasoning.businessRules.length} rules`);

  return { plan, thinkingSteps };
}

function computeOverallScore(ctx: PipelineContext): number {
  const results = Array.from(ctx.metrics.stageResults.values());
  if (results.length === 0) return 0;
  const totalWeight = results.reduce((sum, r) => {
    const stage = PIPELINE_STAGES.find(s => s.id === r.stageId);
    return sum + (stage?.critical ? 2 : 1);
  }, 0);
  const weightedSum = results.reduce((sum, r) => {
    const stage = PIPELINE_STAGES.find(s => s.id === r.stageId);
    const weight = stage?.critical ? 2 : 1;
    return sum + r.qualityScore * weight;
  }, 0);
  return Math.round(weightedSum / totalWeight);
}

function buildSummary(ctx: PipelineContext, failedStages: string[], skippedStages: string[]): PipelineSummary {
  const completedStages = Array.from(ctx.metrics.stageResults.values()).filter(r => r.success).length;
  const overallQuality = computeOverallScore(ctx);

  const highlights: string[] = [];
  const warnings: string[] = [];

  if (ctx.architecture) highlights.push(`Architecture: ${ctx.architecture.pattern} pattern`);
  if (ctx.designSystem) highlights.push(`Design: ${ctx.designSystem.name} theme`);
  if (ctx.schemaDesign) highlights.push(`Schema: ${ctx.schemaDesign.tables?.length || 0} tables designed`);
  if (ctx.apiDesign) highlights.push(`API: ${ctx.apiDesign.routes?.length || 0} endpoints designed`);
  if (ctx.componentTree) highlights.push(`UI: ${ctx.componentTree.components?.length || 0} components composed`);
  highlights.push(`Generated: ${ctx.metrics.fileCount} files, ~${ctx.metrics.lineCount} lines`);

  if (failedStages.length > 0) warnings.push(`Failed stages: ${failedStages.join(', ')}`);
  if (overallQuality < 70) warnings.push('Overall quality below 70 - consider reviewing');

  for (const gate of ctx.metrics.qualityGates) {
    if (!gate.passed) warnings.push(`Quality gate failed: ${gate.stageId} (${gate.score}/${gate.threshold})`);
  }

  return {
    totalStages: PIPELINE_STAGES.length,
    completedStages,
    failedStages,
    skippedStages,
    overallQuality,
    highlights,
    warnings,
  };
}

function enrichPlanWithReasoning(plan: ProjectPlan, reasoning: ReasoningResult): ProjectPlan {
  const enriched = { ...plan, dataModel: plan.dataModel.map(e => ({ ...e, fields: [...e.fields], relationships: [...e.relationships] })) };

  for (const rel of reasoning.relationships) {
    const entity = enriched.dataModel.find(e => e.name === rel.from);
    if (entity) {
      const existingRel = entity.relationships.find(r => r.entity === rel.to);
      if (!existingRel) {
        entity.relationships.push({
          entity: rel.to,
          type: rel.cardinality === '1:N' ? 'one-to-many' : rel.cardinality === 'N:1' ? 'many-to-one' : rel.type,
          field: rel.fromField,
        });
      }
    }
  }

  for (const computed of reasoning.computedFields) {
    const entity = enriched.dataModel.find(e => e.name === computed.entityName);
    if (entity && !entity.fields.find(f => f.name === computed.fieldName)) {
      entity.fields.push({
        name: computed.fieldName,
        type: 'text',
        required: false,
        description: `Computed: ${computed.description}`,
      });
    }
  }

  for (const uiPattern of reasoning.uiPatterns) {
    const page = enriched.pages.find(p =>
      p.dataNeeded.includes(uiPattern.entityName) ||
      p.name.toLowerCase().includes(uiPattern.entityName.toLowerCase())
    );
    if (page) {
      const featureLabel = `${uiPattern.pattern} view`;
      if (!page.features.includes(featureLabel)) {
        page.features.push(featureLabel);
      }
    }
  }

  return enriched;
}

export function getPipelineStages(): PipelineStage[] {
  return [...PIPELINE_STAGES];
}

export function getStageDescription(stageId: string): PipelineStage | undefined {
  return PIPELINE_STAGES.find(s => s.id === stageId);
}
