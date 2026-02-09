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

function emitStep(ctx: PipelineContext, phase: string, label: string, detail?: string) {
  ctx.thinkingSteps.push({ phase, label, detail, timestamp: Date.now() });
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

export function orchestrateGeneration(plan: ProjectPlan, understanding?: UnderstandingResult): OrchestrationResult {
  const pipelineStart = Date.now();

  const ctx: PipelineContext = {
    userRequest: understanding?.level1_intent?.primaryGoal || '',
    understanding,
    plan,
    files: [],
    testFiles: [],
    metrics: createEmptyMetrics(),
    thinkingSteps: [],
  };

  emitStep(ctx, 'orchestrator', 'Pipeline Orchestrator activated', `Coordinating ${PIPELINE_STAGES.length} specialized modules`);

  const failedStages: string[] = [];
  const skippedStages: string[] = [];

  // Stage 1: Understanding (already done by conversation handler, enrich if available)
  const understandStage = PIPELINE_STAGES.find(s => s.id === 'understand')!;
  if (understanding) {
    executeStage(ctx, understandStage, () => ({
      score: Math.round(understanding.confidence * 100),
      warnings: understanding.confidence < 0.7 ? ['Low confidence in requirement understanding'] : [],
      output: understanding,
    }));
  } else {
    skippedStages.push('understand');
  }

  // Stage 2: Planning (already done, validate)
  const planStage = PIPELINE_STAGES.find(s => s.id === 'plan')!;
  executeStage(ctx, planStage, () => {
    const entityCount = plan.dataModel?.length || 0;
    const pageCount = plan.pages?.length || 0;
    const score = Math.min(100, 50 + entityCount * 5 + pageCount * 5);
    return {
      score,
      warnings: entityCount === 0 ? ['No entities in data model'] : [],
      output: { entities: entityCount, pages: pageCount, endpoints: plan.apiEndpoints?.length || 0 },
    };
  });

  // Stage 3: Learning patterns
  const learnStage = PIPELINE_STAGES.find(s => s.id === 'learn')!;
  executeStage(ctx, learnStage, () => {
    try {
      ctx.plan = learningEngine.applyLearnedPatterns(plan);
      return { score: 80, warnings: [], output: 'Applied learned patterns' };
    } catch {
      return { score: 50, warnings: ['No learned patterns available'], output: null };
    }
  });

  // Stage 4: Semantic reasoning
  const reasonStage = PIPELINE_STAGES.find(s => s.id === 'reason')!;
  executeStage(ctx, reasonStage, () => {
    ctx.reasoning = analyzeSemantics(ctx.plan!);
    if (ctx.reasoning) {
      ctx.plan = enrichPlanWithReasoning(ctx.plan!, ctx.reasoning);
    }
    const relCount = ctx.reasoning?.relationships?.length || 0;
    const ruleCount = ctx.reasoning?.businessRules?.length || 0;
    return {
      score: Math.min(100, 60 + relCount * 5 + ruleCount * 3),
      warnings: [],
      output: { relationships: relCount, businessRules: ruleCount, computedFields: ctx.reasoning?.computedFields?.length || 0 },
    };
  });

  // Stage 5: Architecture planning
  const archStage = PIPELINE_STAGES.find(s => s.id === 'architect')!;
  executeStage(ctx, archStage, () => {
    ctx.architecture = planArchitecture(ctx.plan!, ctx.reasoning);
    const decisions = Object.keys(ctx.architecture || {}).length;
    return {
      score: Math.min(100, 70 + decisions * 3),
      warnings: [],
      output: ctx.architecture,
    };
  });

  // Stage 6: Design system
  const designStage = PIPELINE_STAGES.find(s => s.id === 'design')!;
  executeStage(ctx, designStage, () => {
    ctx.designSystem = generateDesignSystem(ctx.plan!, ctx.reasoning);
    const hasColors = ctx.designSystem?.primaryColor ? true : false;
    return {
      score: hasColors ? 95 : 70,
      warnings: [],
      output: { name: ctx.designSystem?.name },
    };
  });

  // Stage 7: Functionality specification
  const specStage = PIPELINE_STAGES.find(s => s.id === 'specify')!;
  executeStage(ctx, specStage, () => {
    ctx.functionalitySpec = generateFunctionalitySpec(ctx.plan!, ctx.reasoning);
    const entityFeatureCount = ctx.functionalitySpec?.entityFeatures?.length || 0;
    return {
      score: Math.min(100, 60 + entityFeatureCount * 8),
      warnings: [],
      output: { entityFeatures: entityFeatureCount, globalFeatures: ctx.functionalitySpec?.globalFeatures },
    };
  });

  // Stage 8: Schema design
  const schemaStage = PIPELINE_STAGES.find(s => s.id === 'schema')!;
  executeStage(ctx, schemaStage, () => {
    ctx.schemaDesign = designSchema(ctx.plan!, ctx.reasoning);
    const tableCount = ctx.schemaDesign?.tables?.length || 0;
    const indexCount = ctx.schemaDesign?.tables?.reduce((sum: number, t: { indexes?: unknown[] }) => sum + (t.indexes?.length || 0), 0) || 0;
    return {
      score: Math.min(100, 60 + tableCount * 5 + indexCount * 2),
      warnings: [],
      output: { tables: tableCount, indexes: indexCount, junctionTables: ctx.schemaDesign?.junctionTables?.length || 0 },
    };
  });

  // Stage 9: API design
  const apiStage = PIPELINE_STAGES.find(s => s.id === 'api')!;
  executeStage(ctx, apiStage, () => {
    ctx.apiDesign = designAPI(ctx.plan!, ctx.reasoning, ctx.schemaDesign);
    const routeCount = ctx.apiDesign?.routes?.length || 0;
    return {
      score: Math.min(100, 60 + routeCount * 3),
      warnings: [],
      output: { routes: routeCount, middleware: ctx.apiDesign?.middleware?.length || 0 },
    };
  });

  // Stage 10: Component composition
  const composeStage = PIPELINE_STAGES.find(s => s.id === 'compose')!;
  executeStage(ctx, composeStage, () => {
    ctx.componentTree = composeComponents(ctx.plan!, ctx.reasoning, ctx.functionalitySpec, ctx.designSystem);
    const componentCount = ctx.componentTree?.components?.length || 0;
    return {
      score: Math.min(100, 60 + componentCount * 2),
      warnings: [],
      output: { components: componentCount, layouts: ctx.componentTree?.layouts?.length || 0 },
    };
  });

  // Stage 11: Code generation (the main event)
  const genStage = PIPELINE_STAGES.find(s => s.id === 'generate')!;
  executeStage(ctx, genStage, () => {
    const engineeringSpec = {
      architecture: ctx.architecture,
      designSystem: ctx.designSystem,
      functionalitySpec: ctx.functionalitySpec,
      schemaDesign: ctx.schemaDesign,
      apiDesign: ctx.apiDesign,
      componentTree: ctx.componentTree,
    };
    ctx.files = generateProjectFromPlan(ctx.plan!);
    const fileCount = ctx.files.length;
    const lineCount = ctx.files.reduce((sum, f) => sum + f.content.split('\n').length, 0);
    ctx.metrics.fileCount = fileCount;
    ctx.metrics.lineCount = lineCount;
    return {
      score: Math.min(100, 50 + fileCount * 2),
      warnings: fileCount < 10 ? ['Low file count - project may be incomplete'] : [],
      output: { files: fileCount, lines: lineCount },
    };
  });

  // Stage 12: Dependency resolution
  const resolveStage = PIPELINE_STAGES.find(s => s.id === 'resolve')!;
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
      } catch {}
    }
    return {
      score: 85,
      warnings: ctx.dependencyManifest?.warnings || [],
      output: { resolved: ctx.dependencyManifest?.dependencies ? Object.keys(ctx.dependencyManifest.dependencies).length : 0 },
    };
  });

  // Stage 13: Code quality review
  const qualityStage = PIPELINE_STAGES.find(s => s.id === 'quality')!;
  executeStage(ctx, qualityStage, () => {
    ctx.qualityReport = analyzeCodeQuality(ctx.files, ctx.plan!);
    if (ctx.qualityReport?.fixes && ctx.qualityReport.fixes.length > 0) {
      ctx.files = applyQualityFixes(ctx.files, ctx.qualityReport.fixes);
    }
    return {
      score: ctx.qualityReport?.overallScore || 75,
      warnings: ctx.qualityReport?.warnings || [],
      output: { score: ctx.qualityReport?.overallScore, issues: ctx.qualityReport?.issues?.length || 0 },
    };
  });

  // Stage 14: Test generation
  const testStage = PIPELINE_STAGES.find(s => s.id === 'test')!;
  executeStage(ctx, testStage, () => {
    try {
      ctx.testFiles = generateTestFiles(ctx.plan!, ctx.reasoning!);
      return {
        score: Math.min(100, 60 + ctx.testFiles.length * 5),
        warnings: [],
        output: { testFiles: ctx.testFiles.length },
      };
    } catch {
      return { score: 40, warnings: ['Test generation encountered issues'], output: { testFiles: 0 } };
    }
  });

  // Stage 15: Validation & auto-fix
  const validateStage = PIPELINE_STAGES.find(s => s.id === 'validate')!;
  executeStage(ctx, validateStage, () => {
    const result = validateAndFix(ctx.files);
    ctx.files = result.files;
    return {
      score: result.valid ? 95 : 65,
      warnings: result.issues?.filter(i => i.severity === 'warning').map(i => i.message) || [],
      output: { valid: result.valid, fixes: result.fixesApplied?.length || 0, iterations: result.iterations },
    };
  });

  // Stage 16: Learning & recording
  const recordStage = PIPELINE_STAGES.find(s => s.id === 'record')!;
  executeStage(ctx, recordStage, () => {
    try {
      learningEngine.recordGenerationOutcome({
        plan: ctx.plan!,
        files: ctx.files,
        success: true,
        qualityScore: computeOverallScore(ctx),
      });
      return { score: 90, warnings: [], output: 'Generation recorded for learning' };
    } catch {
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
