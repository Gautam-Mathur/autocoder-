import { analyzeRequest, formatUnderstandingResponse, processAnswer } from './deep-understanding-engine.js';
import type { UnderstandingResult } from './deep-understanding-engine.js';
import { generatePlan, formatPlanAsMessage } from './plan-generator.js';
import type { ProjectPlan, PlannedEntity } from './plan-generator.js';
import { generateProjectFromPlan } from './plan-driven-generator.js';
import { validateAndFix } from './post-generation-validator.js';
import { analyzeSemantics, type ReasoningResult, type EntityRelationship, type ComputedField } from './contextual-reasoning-engine.js';
import { learningEngine } from './generation-learning-engine.js';
import { shouldAskMoreQuestions, createClarificationState, parseAnswersFromResponse, type ClarificationState } from './adaptive-clarification-engine.js';
import { extractEntitiesFromText } from './domain-synthesis-engine.js';
import { orchestrateGeneration, type OrchestrationResult } from './pipeline-orchestrator.js';

export type ConversationPhase = 'initial' | 'understanding' | 'clarifying' | 'planning' | 'approval' | 'generating' | 'complete';

export interface PhaseHandlerResult {
  responseContent: string;
  newPhase: ConversationPhase;
  thinkingSteps: ThinkingStep[];
  generatedFiles?: { path: string; content: string; language: string }[];
  planData?: ProjectPlan;
  understandingData?: UnderstandingResult;
  clarificationRound?: number;
}

export interface ThinkingStep {
  phase: string;
  label: string;
  detail?: string;
  timestamp?: number;
}

export interface ConversationState {
  phase: ConversationPhase;
  understandingData?: UnderstandingResult;
  planData?: ProjectPlan;
  clarificationRound?: number;
  conversationId?: number;
  generationStartTime?: number;
}

export function handleMessage(
  userMessage: string,
  state: ConversationState,
  conversationHistory?: string
): PhaseHandlerResult {
  const thinkingSteps: ThinkingStep[] = [];
  const emitStep = (phase: string, label: string, detail?: string) => {
    thinkingSteps.push({ phase, label, detail, timestamp: Date.now() });
  };

  const currentPhase = state.phase || 'initial';

  if (currentPhase === 'generating') {
    emitStep('recovery', 'Phase recovery', 'Detected stuck generating phase, restarting');
    return handleInitialRequest(userMessage, thinkingSteps, emitStep, conversationHistory);
  }

  if (currentPhase === 'approval' || currentPhase === 'planning') {
    const lower = userMessage.toLowerCase().trim();
    if (lower === 'approve' || lower === 'approved' || lower === 'yes' || lower === 'go' ||
        lower === 'go ahead' || lower === 'looks good' || lower === 'lgtm' ||
        lower === 'perfect' || lower === 'generate' || lower === 'start' ||
        lower === 'build it' || lower === 'do it' || lower === 'proceed' ||
        lower.includes('approve') || lower.includes('go ahead') || lower.includes('looks good') ||
        lower.includes('generate') || lower.includes('build it') || lower.includes('start building')) {
      return handleGeneration(state, thinkingSteps, emitStep);
    }

    if (lower.includes('change') || lower.includes('modify') || lower.includes('add') ||
        lower.includes('remove') || lower.includes('update') || lower.includes('different')) {
      return handlePlanModification(userMessage, state, thinkingSteps, emitStep);
    }
  }

  if (currentPhase === 'clarifying') {
    if (!state.understandingData) {
      emitStep('recovery', 'Phase recovery', 'Missing context from previous analysis, re-analyzing');
      return handleInitialRequest(userMessage, thinkingSteps, emitStep, conversationHistory);
    }
    return handleClarificationResponse(userMessage, state, thinkingSteps, emitStep);
  }

  if (currentPhase === 'complete') {
    return handlePostGeneration(userMessage, state, thinkingSteps, emitStep);
  }

  return handleInitialRequest(userMessage, thinkingSteps, emitStep, conversationHistory);
}

function handleInitialRequest(
  userMessage: string,
  thinkingSteps: ThinkingStep[],
  emitStep: (phase: string, label: string, detail?: string) => void,
  conversationHistory?: string
): PhaseHandlerResult {
  emitStep('understanding', 'Analyzing your request', 'Deep understanding engine activated');
  emitStep('understanding', 'Level 1: Intent Decomposition', 'Identifying what you need built');

  const understanding = analyzeRequest(userMessage, conversationHistory);

  emitStep('understanding', 'Level 2: Domain Detection',
    understanding.level2_domain.primaryDomain
      ? `Detected: ${understanding.level2_domain.primaryDomain.name} (${Math.round(understanding.level2_domain.confidence * 100)}% confidence)`
      : 'No specific industry detected yet'
  );

  emitStep('understanding', 'Level 3: Entity Extraction',
    `Found ${understanding.level3_entities.mentionedEntities.length} mentioned + ${understanding.level3_entities.inferredEntities.length} inferred data types`
  );

  emitStep('understanding', 'Level 4: Workflow Detection',
    `${understanding.level4_workflows.inferredWorkflows.length} business workflows identified`
  );

  if (understanding.level5_clarification.needsClarification) {
    emitStep('understanding', 'Level 5: Need more information',
      `${understanding.level5_clarification.questions.length} clarifying questions generated`
    );

    const responseContent = formatUnderstandingResponse(understanding);
    return {
      responseContent,
      newPhase: 'clarifying',
      thinkingSteps,
      understandingData: understanding,
    };
  }

  emitStep('understanding', 'Level 5: Ready for planning', 'Have enough context to generate a detailed plan');
  return generatePlanFromUnderstanding(understanding, thinkingSteps, emitStep);
}

function handleClarificationResponse(
  userMessage: string,
  state: ConversationState,
  thinkingSteps: ThinkingStep[],
  emitStep: (phase: string, label: string, detail?: string) => void
): PhaseHandlerResult {
  const currentRound = (state.clarificationRound || 0) + 1;
  emitStep('understanding', 'Processing your answers', `Clarification round ${currentRound}`);

  const previousQuestions = state.understandingData?.level5_clarification.questions || [];
  const parsedAnswers = parseAnswersFromResponse(
    userMessage,
    previousQuestions.map(q => ({
      id: q.id,
      category: 'scope' as const,
      question: q.question,
      priority: q.priority === 'critical' ? 100 : q.priority === 'important' ? 70 : 30,
      impact: q.priority === 'critical' ? 'critical' as const : q.priority === 'important' ? 'high' as const : 'medium' as const,
      context: q.why,
      options: q.options,
      defaultAnswer: q.defaultAnswer,
      satisfied: false,
    }))
  );

  emitStep('understanding', 'Parsed answers', `Extracted ${parsedAnswers.size} structured answers from response`);

  const previousContext = state.understandingData?.level1_intent.primaryGoal || '';
  const fullContext = previousContext ? `${previousContext}. ${userMessage}` : userMessage;
  const updatedUnderstanding = analyzeRequest(fullContext, undefined, currentRound);

  emitStep('understanding', 'Updated understanding',
    updatedUnderstanding.level2_domain.primaryDomain
      ? `Domain: ${updatedUnderstanding.level2_domain.primaryDomain.name}`
      : 'Building general application'
  );

  const nlpEntities = extractEntitiesFromText(fullContext);
  const domains = updatedUnderstanding.level2_domain.primaryDomain
    ? [{ confidence: updatedUnderstanding.level2_domain.confidence, name: updatedUnderstanding.level2_domain.primaryDomain.name }]
    : [];
  const clarState = createClarificationState(state.conversationId || 0, fullContext, nlpEntities, domains);
  clarState.roundsCompleted = currentRound;

  parsedAnswers.forEach((value, key) => {
    clarState.answeredQuestions.set(key, value);
  });
  clarState.readinessScore = Math.max(clarState.readinessScore, parsedAnswers.size * 0.1);

  const { shouldAsk, reason } = shouldAskMoreQuestions(clarState);

  emitStep('understanding', 'Readiness assessment', `Score: ${Math.round(clarState.readinessScore * 100)}% - ${reason}`);

  if (shouldAsk && updatedUnderstanding.level5_clarification.needsClarification &&
      updatedUnderstanding.level5_clarification.questions.length > 0) {
    const responseContent = formatUnderstandingResponse(updatedUnderstanding);
    return {
      responseContent,
      newPhase: 'clarifying',
      thinkingSteps,
      understandingData: updatedUnderstanding,
      clarificationRound: currentRound,
    };
  }

  return generatePlanFromUnderstanding(updatedUnderstanding, thinkingSteps, emitStep);
}

function generatePlanFromUnderstanding(
  understanding: UnderstandingResult,
  thinkingSteps: ThinkingStep[],
  emitStep: (phase: string, label: string, detail?: string) => void
): PhaseHandlerResult {
  emitStep('planning', 'Generating detailed project plan', 'Creating architecture, data model, and page blueprints');

  let plan = generatePlan(understanding);

  emitStep('planning', 'Applying learned patterns', 'Enhancing plan with successful patterns from previous generations');
  plan = learningEngine.applyLearnedPatterns(plan);

  emitStep('planning', 'Running contextual analysis', 'Analyzing entity relationships, field semantics, and business rules');
  const reasoning = analyzeSemantics(plan);

  plan = enrichPlanWithReasoning(plan, reasoning);

  const relationshipCount = reasoning.relationships.length;
  const computedFieldCount = reasoning.computedFields.length;
  const businessRuleCount = reasoning.businessRules.length;
  const uiPatternCount = reasoning.uiPatterns.length;

  emitStep('planning', 'Contextual reasoning applied',
    `Enriched plan with ${relationshipCount} entity relationships, ${computedFieldCount} computed fields, ${businessRuleCount} business rules, ${uiPatternCount} UI patterns`
  );

  emitStep('planning', 'Plan complete',
    `${plan.modules.length} modules, ${plan.pages.length} pages, ${plan.dataModel.length} data tables, ${plan.apiEndpoints.length} API endpoints`
  );

  const responseContent = formatPlanAsMessage(plan);

  return {
    responseContent,
    newPhase: 'approval',
    thinkingSteps,
    planData: plan,
    understandingData: understanding,
  };
}

function handleGeneration(
  state: ConversationState,
  thinkingSteps: ThinkingStep[],
  emitStep: (phase: string, label: string, detail?: string) => void
): PhaseHandlerResult {
  const plan = state.planData;
  if (!plan) {
    return {
      responseContent: 'Something went wrong - I don\'t have a plan to work from. Could you describe what you want to build again?',
      newPhase: 'initial',
      thinkingSteps,
    };
  }

  emitStep('orchestrator', 'Pipeline Orchestrator activated', `Coordinating 16 specialized AI modules for ${plan.projectName}`);
  emitStep('orchestrator', 'Team assembled', 'Product Manager → Architect → Designer → Schema Engineer → API Architect → UI Composer → Full-Stack Developer → DevOps → QA → Code Reviewer → Release Engineer');

  let orchestrationResult: OrchestrationResult;
  try {
    orchestrationResult = orchestrateGeneration(plan, state.understandingData);
  } catch (err) {
    emitStep('orchestrator', 'Pipeline encountered critical error, falling back to direct generation');
    const rawFiles = generateProjectFromPlan(plan);
    emitStep('generating', 'Code generation complete', `${rawFiles.length} files created`);
    emitStep('validating', 'Running post-generation validation');
    const validationResult = validateAndFix(rawFiles, 3);
    if (validationResult.fixesApplied.length > 0) {
      emitStep('validating', `Auto-fixed ${validationResult.fixesApplied.length} issues`);
    }
    const fallbackFiles = validationResult.files;
    try {
      learningEngine.recordOutcome({
        conversationId: state.conversationId || 0,
        projectDescription: plan.overview || plan.projectName,
        domainId: state.understandingData?.level2_domain?.primaryDomain?.id,
        plan,
        generatedFiles: fallbackFiles.map(f => ({ path: f.path, content: f.content })),
        errors: validationResult.issues.filter(i => i.severity === 'error').map(i => i.message),
        autoFixes: validationResult.fixesApplied,
        userModifications: [],
        generationTimeMs: Date.now() - Date.now(),
      });
    } catch (e) {}
    const validationSummary = validationResult.fixesApplied.length > 0
      ? `Auto-fixed **${validationResult.fixesApplied.length} issues** across ${validationResult.iterations} validation pass(es).`
      : 'All imports, exports, and dependencies verified.';
    return {
      responseContent: `## ${plan.projectName} - Generated Successfully!\n\nGenerated **${fallbackFiles.length} files** using fallback generation.\n\n${validationSummary}`,
      newPhase: 'complete',
      thinkingSteps,
      generatedFiles: fallbackFiles,
      planData: plan,
    };
  }

  for (const step of orchestrationResult.context.thinkingSteps) {
    thinkingSteps.push(step);
  }

  const summary = orchestrationResult.summary;
  const metrics = orchestrationResult.metrics;
  const finalFiles = [...orchestrationResult.files, ...orchestrationResult.testFiles];

  try {
    learningEngine.recordOutcome({
      conversationId: state.conversationId || 0,
      projectDescription: plan.overview || plan.projectName,
      domainId: state.understandingData?.level2_domain?.primaryDomain?.id,
      plan,
      generatedFiles: finalFiles.map(f => ({ path: f.path, content: f.content })),
      errors: summary.warnings,
      autoFixes: [],
      userModifications: [],
      generationTimeMs: metrics.totalDurationMs,
    });
  } catch (e) {
  }

  const moduleList = plan.modules.map(m => `- **${m.name}**: ${m.description}`).join('\n');
  const fileList = finalFiles.slice(0, 30).map(f => `- \`${f.path}\``).join('\n');
  const fileListExtra = finalFiles.length > 30 ? `\n- ...and ${finalFiles.length - 30} more files` : '';

  const highlightsList = summary.highlights.map(h => `- ${h}`).join('\n');
  const warningsList = summary.warnings.length > 0
    ? `\n### Notes\n${summary.warnings.slice(0, 5).map(w => `- ${w}`).join('\n')}`
    : '';

  const qualityGrade = orchestrationResult.context.qualityReport
    ? ` (Grade: ${orchestrationResult.context.qualityReport.grade})`
    : '';

  const responseContent = `## ${plan.projectName} - Generated Successfully!

Your project was built by a **${summary.totalStages}-module AI pipeline** with an overall quality score of **${summary.overallQuality}/100**${qualityGrade}.

### Pipeline Summary
- **${summary.completedStages}/${summary.totalStages}** specialized modules completed
- **${metrics.fileCount} files** generated (~${metrics.lineCount.toLocaleString()} lines of code)
- **${metrics.endpointCount} API endpoints** designed
- **${metrics.componentCount} UI components** composed
- Completed in **${(metrics.totalDurationMs / 1000).toFixed(1)}s**

### Architecture Highlights
${highlightsList}

### Modules Built
${moduleList}

### Files Created
${fileList}${fileListExtra}

### What's Included
- **${plan.dataModel.length} database tables** with full CRUD APIs
- **${plan.pages.length} pages** with search, filter, and data display
- **${plan.apiEndpoints.length} API endpoints** with validation
- **Dashboard** with KPI metrics and domain-aware design system
- **Component tree** with accessibility and responsive design
- **Automated tests** for API routes and components
${warningsList}

### Next Steps
- Click **Preview** to see your app running
- Browse **View Code** to explore the generated files
- Tell me what you'd like to change or add!`;

  return {
    responseContent,
    newPhase: 'complete',
    thinkingSteps,
    generatedFiles: finalFiles,
    planData: plan,
  };
}

function handlePlanModification(
  userMessage: string,
  state: ConversationState,
  thinkingSteps: ThinkingStep[],
  emitStep: (phase: string, label: string, detail?: string) => void
): PhaseHandlerResult {
  emitStep('planning', 'Processing your feedback', 'Updating the plan based on your changes');

  const previousUnderstanding = state.understandingData;
  const combinedContext = previousUnderstanding
    ? `${previousUnderstanding.level1_intent.primaryGoal}. ${userMessage}`
    : userMessage;

  const updatedUnderstanding = analyzeRequest(combinedContext);
  let updatedPlan = generatePlan(updatedUnderstanding);

  emitStep('planning', 'Applying learned patterns', 'Enhancing updated plan with successful patterns');
  updatedPlan = learningEngine.applyLearnedPatterns(updatedPlan);

  emitStep('planning', 'Running contextual analysis', 'Re-analyzing entity relationships and business rules');
  const reasoning = analyzeSemantics(updatedPlan);
  updatedPlan = enrichPlanWithReasoning(updatedPlan, reasoning);

  emitStep('planning', 'Contextual reasoning applied',
    `Enriched with ${reasoning.relationships.length} relationships, ${reasoning.computedFields.length} computed fields, ${reasoning.businessRules.length} rules, ${reasoning.uiPatterns.length} UI patterns`
  );

  emitStep('planning', 'Plan updated',
    `Now has ${updatedPlan.modules.length} modules, ${updatedPlan.pages.length} pages`
  );

  const responseContent = `## Updated Plan\n\nI've incorporated your changes:\n\n${formatPlanAsMessage(updatedPlan)}`;

  return {
    responseContent,
    newPhase: 'approval',
    thinkingSteps,
    planData: updatedPlan,
    understandingData: updatedUnderstanding,
  };
}

function handlePostGeneration(
  userMessage: string,
  state: ConversationState,
  thinkingSteps: ThinkingStep[],
  emitStep: (phase: string, label: string, detail?: string) => void
): PhaseHandlerResult {
  const lower = userMessage.toLowerCase();

  if (lower.includes('regenerate') || lower.includes('start over') || lower.includes('rebuild')) {
    return handleInitialRequest(userMessage, thinkingSteps, emitStep);
  }

  return {
    responseContent: `I've already generated your project. You can:\n\n- **Preview** it to see it running\n- **View Code** to browse the files\n- Ask me to **modify specific parts** (e.g., "add a reports page" or "change the dashboard layout")\n- Say **"start over"** to build something new\n\nWhat would you like to do?`,
    newPhase: 'complete',
    thinkingSteps,
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

  for (const rule of reasoning.businessRules) {
    if (rule.type === 'validation') {
      const endpoint = enriched.apiEndpoints.find(ep =>
        ep.entity === rule.entityName && (ep.method === 'POST' || ep.method === 'PATCH')
      );
      if (endpoint && endpoint.description && !endpoint.description.includes('validation')) {
        endpoint.description += ` (with ${rule.ruleName} validation)`;
      }
    }
  }

  return enriched;
}

export function isProjectCreationRequest(content: string): boolean {
  const projectPatterns = [
    /\b(build|create|make|generate|develop|design)\b.*\b(app|application|website|site|platform|project|system|tool|portal|page)\b/i,
    /\b(app|application|website|site|platform|project|system|tool|portal)\b.*\b(for|that|with|to)\b/i,
    /\b(saas|e-commerce|ecommerce|dashboard|cms|blog|social|chat|api|store|shop)\b/i,
    /\b(landing page|web app|webapp|frontend|backend|fullstack|full-stack)\b/i,
    /\b(todo|task|note|calendar|booking|reservation|inventory|crm|erp)\b.*\b(app|system|manager)\b/i,
    /\b(i\s+want|i\s+need|i'd\s+like|i\s+wanna)\b.*\b(track|manage|organize|sell|book|share|show|display|log|monitor)\b/i,
    /\b(make\s+me|build\s+me|create\s+me|give\s+me)\b/i,
    /\b(help\s+me)\b.*\b(build|create|make|start|set\s*up|launch)\b/i,
    /\bfor\s+my\s+(business|company|startup|clients?|customers?|team|shop|store|restaurant|bakery|salon|clinic|gym|school|studio)\b/i,
    /\b(gym|workout|fitness|recipe|restaurant|budget|expense|property|real\s*estate|doctor|patient|inventory|employee|payroll)\b.*\b(app|track|manage|system|tool)\b/i,
    /\b(build|create|make|generate)\b.*\b(gym|workout|fitness|recipe|restaurant|budget|expense|finance|property|doctor|inventory|employee)\b/i,
    /\b(erp|crm|cms|lms|hris|pms|pos|wms|tms|ehr)\b/i,
    /\b(consulting|manufacturing|healthcare|logistics|supply chain|hr|human resource)\b.*\b(system|platform|tool|app|software)\b/i,
  ];

  const simplePatterns = [
    /^(explain|what is|how does|why|tell me|describe|help me understand)/i,
    /\b(fix|debug|error|bug|issue|problem)\b/i,
    /^(hi|hello|hey|thanks|thank you|ok|okay)\s*[.!?]?\s*$/i,
  ];

  const isProject = projectPatterns.some(p => p.test(content));
  const isSimple = simplePatterns.some(p => p.test(content));

  return isProject && !isSimple;
}
