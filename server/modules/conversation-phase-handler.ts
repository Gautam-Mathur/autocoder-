import { analyzeRequest, formatUnderstandingResponse, processAnswer } from './deep-understanding-engine.js';
import type { UnderstandingResult } from './deep-understanding-engine.js';
import { generatePlan, formatPlanAsMessage } from './plan-generator.js';
import type { ProjectPlan, PlannedEntity } from './plan-generator.js';
import { generateProjectFromPlan } from './plan-driven-generator.js';
import { validateAndFix } from './post-generation-validator.js';
import { analyzeSemantics, type ReasoningResult, type EntityRelationship, type ComputedField } from './contextual-reasoning-engine.js';
import { learningEngine } from './generation-learning-engine.js';
import { shouldAskMoreQuestions, createClarificationState, parseAnswersFromResponse, generateClarificationQuestions, identifyInformationGaps, calculateReadinessScore, type ClarificationState } from './adaptive-clarification-engine.js';
import { extractEntitiesFromText } from './domain-synthesis-engine.js';
import { orchestrateGeneration, type OrchestrationResult } from './pipeline-orchestrator.js';
import { processEditRequest, type EditResult, type FileEdit } from './targeted-code-editor.js';

export type ConversationPhase = 'initial' | 'understanding' | 'clarifying' | 'planning' | 'approval' | 'generating' | 'complete' | 'editing';

export interface PhaseHandlerResult {
  responseContent: string;
  newPhase: ConversationPhase;
  thinkingSteps: ThinkingStep[];
  generatedFiles?: { path: string; content: string; language: string }[];
  fileEdits?: FileEdit[];
  editResult?: EditResult;
  planData?: ProjectPlan;
  understandingData?: UnderstandingResult;
  clarificationRound?: number;
  clarificationState?: ClarificationState;
}

export interface ThinkingStep {
  phase: string;
  label: string;
  detail?: string;
  timestamp?: number;
}

export interface EditHistoryEntry {
  timestamp: number;
  userMessage: string;
  editType: string;
  filesChanged: string[];
  summary: string;
}

export interface ConversationState {
  phase: ConversationPhase;
  understandingData?: UnderstandingResult;
  planData?: ProjectPlan;
  clarificationRound?: number;
  clarificationState?: ClarificationState;
  conversationId?: number;
  generationStartTime?: number;
  existingFiles?: { path: string; content: string; language: string }[];
  editHistory?: EditHistoryEntry[];
}

export type OnStepCallback = (step: ThinkingStep) => void;

export function handleMessage(
  userMessage: string,
  state: ConversationState,
  conversationHistory?: string,
  onStep?: OnStepCallback
): PhaseHandlerResult {
  const thinkingSteps: ThinkingStep[] = [];
  const emitStep = (phase: string, label: string, detail?: string) => {
    const step: ThinkingStep = { phase, label, detail, timestamp: Date.now() };
    thinkingSteps.push(step);
    if (onStep) onStep(step);
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
      return handleGeneration(state, thinkingSteps, emitStep, onStep);
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

  if (currentPhase === 'complete' || currentPhase === 'editing') {
    return handleIterativeEdit(userMessage, state, thinkingSteps, emitStep);
  }

  return handleInitialRequest(userMessage, thinkingSteps, emitStep, conversationHistory);
}

function handleInitialRequest(
  userMessage: string,
  thinkingSteps: ThinkingStep[],
  emitStep: (phase: string, label: string, detail?: string) => void,
  conversationHistory?: string
): PhaseHandlerResult {
  emitStep('understanding', 'Deep Understanding Engine activated', `Analyzing your request through 5 levels of decomposition to fully grasp what you need built`);
  emitStep('understanding', 'Why multi-level analysis', 'A single pass would miss nuances — each level builds on the previous, from raw intent through domain expertise to specific entity structures and workflows');

  emitStep('understanding', 'Level 1: Intent Decomposition', 'Breaking down your request into primary goal, secondary features, and implied requirements');

  const understanding = analyzeRequest(userMessage, conversationHistory);

  emitStep('understanding', 'Intent identified', `Primary goal: "${understanding.level1_intent?.primaryGoal || userMessage.slice(0, 60)}" | Complexity: ${(understanding.level1_intent as any)?.complexity || 'moderate'}`);

  emitStep('understanding', 'Level 2: Domain Detection',
    understanding.level2_domain.primaryDomain
      ? `Detected "${understanding.level2_domain.primaryDomain.name}" domain with ${Math.round(understanding.level2_domain.confidence * 100)}% confidence — this activates domain-specific entity templates, vocabulary, and best practices`
      : 'No specific industry pattern detected — will use general-purpose application templates'
  );
  if (understanding.level2_domain.primaryDomain) {
    emitStep('understanding', 'Why domain matters', `The "${understanding.level2_domain.primaryDomain.name}" domain has known entity patterns, standard workflows, and industry-specific field types that produce more accurate code than generic templates`);
  }

  const mentionedCount = understanding.level3_entities.mentionedEntities.length;
  const inferredCount = understanding.level3_entities.inferredEntities.length;
  emitStep('understanding', 'Level 3: Entity Extraction',
    `Found ${mentionedCount} explicitly mentioned data types + ${inferredCount} inferred from context`
  );
  if (mentionedCount > 0) {
    emitStep('understanding', 'Mentioned entities', understanding.level3_entities.mentionedEntities.slice(0, 5).join(', ') + (mentionedCount > 5 ? ` + ${mentionedCount - 5} more` : ''));
  }
  if (inferredCount > 0) {
    emitStep('understanding', 'Inferred entities', `${understanding.level3_entities.inferredEntities.slice(0, 4).join(', ')} — these weren't explicitly mentioned but are needed for the app to function properly`);
  }

  const workflowCount = understanding.level4_workflows.inferredWorkflows.length;
  emitStep('understanding', 'Level 4: Workflow Detection',
    `${workflowCount} business workflows identified${workflowCount > 0 ? ' — these define how data flows through the system and what actions trigger what effects' : ''}`
  );
  if (workflowCount > 0) {
    const sampleWorkflows = understanding.level4_workflows.inferredWorkflows.slice(0, 3).map((w: any) => w.name || w.description || w).join(', ');
    emitStep('understanding', 'Key workflows', sampleWorkflows);
  }

  if (understanding.level5_clarification.needsClarification) {
    const questionCount = understanding.level5_clarification.questions.length;
    emitStep('understanding', 'Level 5: Need more information',
      `${questionCount} clarifying questions generated — asking now prevents building the wrong thing later`
    );
    emitStep('understanding', 'Why we ask questions', 'Ambiguous requirements lead to wasted generation cycles — a few targeted questions now save significant rework later');

    const responseContent = formatUnderstandingResponse(understanding);
    return {
      responseContent,
      newPhase: 'clarifying',
      thinkingSteps,
      understandingData: understanding,
    };
  }

  emitStep('understanding', 'Level 5: Requirements sufficient', `Confidence: ${Math.round(understanding.confidence * 100)}% — enough context gathered to produce a comprehensive plan without further questions`);
  return generatePlanFromUnderstanding(understanding, thinkingSteps, emitStep);
}

function handleClarificationResponse(
  userMessage: string,
  state: ConversationState,
  thinkingSteps: ThinkingStep[],
  emitStep: (phase: string, label: string, detail?: string) => void
): PhaseHandlerResult {
  const currentRound = (state.clarificationRound || 0) + 1;
  emitStep('understanding', 'Processing your clarification answers', `Round ${currentRound} — integrating your responses to build a more precise understanding`);
  emitStep('understanding', 'Why iterative clarification works', 'Each answer narrows down ambiguity — the system re-analyzes with your new context to produce increasingly accurate entity structures and feature specifications');

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

  const previousUnderstanding = state.understandingData!;
  const updatedUnderstanding: UnderstandingResult = {
    level1_intent: { ...previousUnderstanding.level1_intent },
    level2_domain: { ...previousUnderstanding.level2_domain },
    level3_entities: {
      ...previousUnderstanding.level3_entities,
      mentionedEntities: [...previousUnderstanding.level3_entities.mentionedEntities],
      inferredEntities: [...previousUnderstanding.level3_entities.inferredEntities],
    },
    level4_workflows: { ...previousUnderstanding.level4_workflows },
    level5_clarification: {
      ...previousUnderstanding.level5_clarification,
      assumptions: [...(previousUnderstanding.level5_clarification.assumptions || [])],
    },
    confidence: previousUnderstanding.confidence,
    readyForPlan: previousUnderstanding.readyForPlan,
  };

  parsedAnswers.forEach((answerValue) => {
    const words = answerValue.toLowerCase().split(/[\s,]+/).filter(w => w.length > 2);
    for (const word of words) {
      if (!updatedUnderstanding.level3_entities.mentionedEntities.includes(word) &&
          !updatedUnderstanding.level3_entities.inferredEntities.includes(word)) {
        updatedUnderstanding.level3_entities.mentionedEntities.push(word);
      }
    }
  });

  emitStep('understanding', 'Updated understanding',
    updatedUnderstanding.level2_domain.primaryDomain
      ? `Domain: ${updatedUnderstanding.level2_domain.primaryDomain.name}`
      : 'Building general application'
  );

  let clarState: ClarificationState;
  if (state.clarificationState) {
    const prevAnswered = state.clarificationState.answeredQuestions;
    let answeredMap: Map<string, string>;
    if (prevAnswered instanceof Map) {
      answeredMap = new Map(prevAnswered);
    } else if (prevAnswered && typeof prevAnswered === 'object') {
      answeredMap = new Map(Object.entries(prevAnswered as Record<string, string>));
    } else {
      answeredMap = new Map();
    }
    clarState = {
      ...state.clarificationState,
      answeredQuestions: answeredMap,
      askedQuestions: [...(state.clarificationState.askedQuestions || [])],
      informationGaps: (state.clarificationState.informationGaps || []).map(g => ({ ...g })),
    };
  } else {
    const fullDescription = `${previousUnderstanding.level1_intent.primaryGoal}. ${userMessage}`;
    const nlpEntities = extractEntitiesFromText(fullDescription);
    const domains = updatedUnderstanding.level2_domain.primaryDomain
      ? [{ confidence: updatedUnderstanding.level2_domain.confidence, name: updatedUnderstanding.level2_domain.primaryDomain.name }]
      : [];
    clarState = createClarificationState(state.conversationId || 0, fullDescription, nlpEntities, domains);
  }

  clarState.roundsCompleted = currentRound;

  parsedAnswers.forEach((value, key) => {
    clarState.answeredQuestions.set(key, value);
  });

  for (const q of previousQuestions) {
    if (!clarState.askedQuestions.includes(q.id)) {
      clarState.askedQuestions.push(q.id);
    }
  }

  const answerText = Array.from(parsedAnswers.values()).join(' ').toLowerCase();
  for (const gap of clarState.informationGaps) {
    if (!gap.resolvedBy && parsedAnswers.size > 0 && answerText.length > 0) {
      if (gap.category === 'entities' || gap.category === 'scope') {
        gap.resolvedBy = 'user-answer';
      }
    }
    if (!gap.resolvedBy && gap.defaultResolution) {
      gap.resolvedBy = 'default';
    }
  }

  clarState.readinessScore = calculateReadinessScore(
    extractEntitiesFromText(`${previousUnderstanding.level1_intent.primaryGoal}. ${userMessage}`),
    clarState.informationGaps,
    clarState.answeredQuestions
  );
  clarState.readinessScore = Math.max(clarState.readinessScore, updatedUnderstanding.confidence);

  const { shouldAsk, reason } = shouldAskMoreQuestions(clarState);

  emitStep('understanding', 'Readiness assessment',
    `Score: ${Math.round(clarState.readinessScore * 100)}% — ${reason}`
  );

  const proceedToPlan = () => {
    updatedUnderstanding.level5_clarification = {
      needsClarification: false,
      questions: [],
      assumptions: updatedUnderstanding.level5_clarification.assumptions,
    };
    updatedUnderstanding.confidence = Math.max(updatedUnderstanding.confidence, 0.85);
    updatedUnderstanding.readyForPlan = true;
    return generatePlanFromUnderstanding(updatedUnderstanding, thinkingSteps, emitStep);
  };

  if (currentRound >= 2) {
    emitStep('understanding', 'Proceeding with available information',
      'Enough clarification rounds completed — using defaults for remaining gaps');
    updatedUnderstanding.level5_clarification.assumptions.push(
      'Proceeding with sensible defaults after clarification'
    );
    return proceedToPlan();
  }

  if (!shouldAsk) {
    return proceedToPlan();
  }

  const newQuestions = generateClarificationQuestions(
    clarState.informationGaps,
    clarState.complexity,
    extractEntitiesFromText(`${previousUnderstanding.level1_intent.primaryGoal}. ${userMessage}`),
    clarState.answeredQuestions
  );

  const askedSet = new Set(previousQuestions.map(q => q.question));
  const filteredQuestions = newQuestions.filter(q => !askedSet.has(q.question));

  if (filteredQuestions.length === 0) {
    return proceedToPlan();
  }

  updatedUnderstanding.level5_clarification = {
    needsClarification: true,
    questions: filteredQuestions.map(q => ({
      id: q.id,
      question: q.question,
      why: q.context,
      options: q.options,
      defaultAnswer: q.defaultAnswer,
      priority: q.impact === 'critical' ? 'critical' as const :
                q.impact === 'high' ? 'important' as const : 'nice-to-have' as const,
    })),
    assumptions: updatedUnderstanding.level5_clarification.assumptions,
  };

  const responseContent = formatUnderstandingResponse(updatedUnderstanding);

  const serializableClarState = {
    ...clarState,
    answeredQuestions: Object.fromEntries(clarState.answeredQuestions),
  };

  return {
    responseContent,
    newPhase: 'clarifying',
    thinkingSteps,
    understandingData: updatedUnderstanding,
    clarificationRound: currentRound,
    clarificationState: serializableClarState as any,
  };
}

function generatePlanFromUnderstanding(
  understanding: UnderstandingResult,
  thinkingSteps: ThinkingStep[],
  emitStep: (phase: string, label: string, detail?: string) => void
): PhaseHandlerResult {
  emitStep('planning', 'Plan Generator activated', 'Converting understanding into a detailed project blueprint — deciding tech stack, modules, pages, data model, APIs, and file structure');
  emitStep('planning', 'Why a plan comes first', 'Generating code without a plan produces inconsistent files — the plan ensures every page has backing API routes, every API route has a database table, and every table has proper relationships');

  let plan = generatePlan(understanding);

  emitStep('planning', 'Initial plan created', `Project: "${plan.projectName}" | ${plan.modules?.length || 0} modules, ${plan.pages?.length || 0} pages, ${plan.dataModel?.length || 0} entities, ${plan.apiEndpoints?.length || 0} endpoints`);
  if (plan.pages?.length > 0) {
    emitStep('planning', 'Pages planned', plan.pages.slice(0, 5).map(p => p.name).join(', ') + (plan.pages.length > 5 ? ` + ${plan.pages.length - 5} more` : ''));
  }
  if (plan.dataModel?.length > 0) {
    emitStep('planning', 'Data model', plan.dataModel.slice(0, 5).map(e => `${e.name} (${e.fields?.length || 0} fields)`).join(', '));
  }

  emitStep('planning', 'Consulting learning engine', 'Checking if similar projects were generated before — if so, applying proven patterns for naming, structure, and feature selection');
  plan = learningEngine.applyLearnedPatterns(plan);
  emitStep('planning', 'Learned patterns applied', 'Enhanced field types, naming conventions, and relationship patterns based on past successful generations');

  emitStep('planning', 'Running contextual semantic analysis', 'The reasoning engine now examines every entity to discover hidden relationships, computed fields, and business rules implied by the domain');
  const reasoning = analyzeSemantics(plan);

  plan = enrichPlanWithReasoning(plan, reasoning);

  const relationshipCount = reasoning.relationships.length;
  const computedFieldCount = reasoning.computedFields.length;
  const businessRuleCount = reasoning.businessRules.length;
  const uiPatternCount = reasoning.uiPatterns.length;

  emitStep('planning', 'Semantic enrichment complete',
    `Discovered ${relationshipCount} entity relationships, ${computedFieldCount} computed fields, ${businessRuleCount} business rules, ${uiPatternCount} UI display patterns`
  );
  if (relationshipCount > 0) {
    const relExamples = reasoning.relationships.slice(0, 3).map(r => `${r.from} → ${r.to}`).join(', ');
    emitStep('planning', 'Key relationships', `${relExamples}${relationshipCount > 3 ? ` + ${relationshipCount - 3} more` : ''} — these become foreign keys and cascade behaviors in the database`);
  }
  if (businessRuleCount > 0) {
    emitStep('planning', 'Business rules', `${reasoning.businessRules.slice(0, 2).map(r => r.ruleName).join(', ')} — these become validation logic in API endpoints`);
  }

  emitStep('planning', 'Final plan ready',
    `${plan.modules.length} modules, ${plan.pages.length} pages, ${plan.dataModel.length} data tables, ${plan.apiEndpoints.length} API endpoints — all cross-referenced and validated`
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
  emitStep: (phase: string, label: string, detail?: string) => void,
  onStep?: OnStepCallback
): PhaseHandlerResult {
  const plan = state.planData;
  if (!plan) {
    return {
      responseContent: 'Something went wrong - I don\'t have a plan to work from. Could you describe what you want to build again?',
      newPhase: 'initial',
      thinkingSteps,
    };
  }

  emitStep('orchestrator', 'Pipeline Orchestrator activated', `Coordinating 16 specialized AI modules for "${plan.projectName}" — each module acts as a dedicated team member`);
  emitStep('orchestrator', 'Dev team assembled', 'Product Manager → Project Manager → Senior Advisor → Technical Analyst → System Architect → UI/UX Designer → Feature Analyst → Database Engineer → API Architect → UI Engineer → Full-Stack Developer → DevOps Engineer → Code Reviewer → QA Engineer → Release Engineer → Knowledge Manager');
  emitStep('orchestrator', 'Why a 16-stage pipeline', 'Each stage enriches the project context — understanding feeds planning, planning feeds architecture, architecture guides design, design informs components, and all of it flows into code generation for internally-consistent output');

  let orchestrationResult: OrchestrationResult;
  try {
    orchestrationResult = orchestrateGeneration(plan, state.understandingData, onStep);
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
  emitStep('planning', 'Processing your modification request', 'Re-analyzing the project with your feedback incorporated — the system will merge your changes with the existing plan and re-run semantic analysis');
  emitStep('planning', 'Why full re-analysis', 'A modification can cascade — adding a new entity may require new API routes, new pages, new relationships, and updated navigation, so we re-process the entire plan to catch all implications');

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

function isEditRequest(message: string): boolean {
  const editPatterns = [
    /\b(change|modify|update|edit|fix|add|remove|delete|rename|move|replace|adjust|tweak|make)\b/i,
    /\b(color|font|size|layout|style|spacing|padding|margin|border|background|theme)\b/i,
    /\b(button|field|column|page|section|header|footer|sidebar|nav|menu|form|table|modal)\b/i,
    /\b(bigger|smaller|larger|wider|narrower|taller|shorter|bolder|lighter|darker|brighter)\b/i,
    /\b(the .+ (should|needs to|must|could|can))\b/i,
    /\b(i want|i need|i'd like|can you|could you|please)\b.*\b(change|add|remove|fix|update|make)\b/i,
  ];
  return editPatterns.some(p => p.test(message));
}

function handleIterativeEdit(
  userMessage: string,
  state: ConversationState,
  thinkingSteps: ThinkingStep[],
  emitStep: (phase: string, label: string, detail?: string) => void
): PhaseHandlerResult {
  const lower = userMessage.toLowerCase().trim();

  if (lower.includes('regenerate') || lower.includes('start over') || lower.includes('rebuild')) {
    return handleInitialRequest(userMessage, thinkingSteps, emitStep);
  }

  if (!state.existingFiles || state.existingFiles.length === 0) {
    return {
      responseContent: `I don't have any project files to edit yet. Would you like me to generate a new project? Just describe what you want to build!`,
      newPhase: 'complete',
      thinkingSteps,
    };
  }

  if (!isEditRequest(userMessage)) {
    const editHistory = state.editHistory || [];
    const historyInfo = editHistory.length > 0
      ? `\n\n**Recent edits** (${editHistory.length} total):\n${editHistory.slice(-3).map(e => `- ${e.summary}`).join('\n')}`
      : '';

    return {
      responseContent: `Your project is ready with **${state.existingFiles.length} files**. Here's what I can do:\n\n- **Edit code** — "change the header color to blue", "add an email field to the user form"\n- **Add features** — "add a settings page", "add a search bar"\n- **Fix issues** — "fix the broken import", "the login page has an error"\n- **Refactor** — "rename UserCard to ProfileCard"\n- **Start over** — "regenerate" or "start over"${historyInfo}\n\nWhat would you like to change?`,
      newPhase: 'editing',
      thinkingSteps,
    };
  }

  emitStep('editing', 'Analyzing your edit request', `Understanding what you want to change in the ${state.existingFiles.length}-file project`);

  const editResult = processEditRequest({
    userMessage,
    projectFiles: state.existingFiles,
    conversationHistory: state.planData?.projectName,
  });

  for (const step of editResult.thinkingSteps) {
    emitStep(step.phase, step.label, step.detail);
  }

  if (editResult.edits.length === 0) {
    emitStep('editing', 'No changes identified', 'Could not determine specific edits from your request');
    return {
      responseContent: `I understood your request but couldn't determine the specific changes to make. Could you be more specific? For example:\n\n- "Change the header background to blue"\n- "Add a phone number field to the contact form"\n- "Add a new page called Reports"\n- "Fix the import error in Dashboard.tsx"`,
      newPhase: 'editing',
      thinkingSteps,
    };
  }

  const updatedFiles = applyEditsToFiles(state.existingFiles, editResult.edits);

  emitStep('editing', 'Edits applied successfully',
    `Modified ${editResult.edits.filter(e => e.editType === 'modify').length} files, ` +
    `created ${editResult.edits.filter(e => e.editType === 'create').length} files`
  );

  const editSummary = formatEditSummary(editResult);

  return {
    responseContent: editSummary,
    newPhase: 'editing',
    thinkingSteps,
    generatedFiles: updatedFiles,
    fileEdits: editResult.edits,
    editResult,
  };
}

function applyEditsToFiles(
  existingFiles: { path: string; content: string; language: string }[],
  edits: FileEdit[]
): { path: string; content: string; language: string }[] {
  const fileMap = new Map(existingFiles.map(f => [f.path, { ...f }]));

  for (const edit of edits) {
    if (edit.editType === 'delete') {
      fileMap.delete(edit.filePath);
    } else if (edit.editType === 'create') {
      const ext = edit.filePath.split('.').pop()?.toLowerCase() || 'text';
      const langMap: Record<string, string> = {
        tsx: 'tsx', ts: 'typescript', jsx: 'jsx', js: 'javascript',
        css: 'css', html: 'html', json: 'json',
      };
      fileMap.set(edit.filePath, {
        path: edit.filePath,
        content: edit.newContent,
        language: langMap[ext] || ext,
      });
    } else {
      const existing = fileMap.get(edit.filePath);
      if (existing) {
        fileMap.set(edit.filePath, { ...existing, content: edit.newContent });
      } else {
        const ext = edit.filePath.split('.').pop()?.toLowerCase() || 'text';
        const langMap: Record<string, string> = {
          tsx: 'tsx', ts: 'typescript', jsx: 'jsx', js: 'javascript',
          css: 'css', html: 'html', json: 'json',
        };
        fileMap.set(edit.filePath, {
          path: edit.filePath,
          content: edit.newContent,
          language: langMap[ext] || ext,
        });
      }
    }
  }

  return Array.from(fileMap.values());
}

function formatEditSummary(editResult: EditResult): string {
  const { edits, summary, editType } = editResult;

  const modifiedFiles = edits.filter(e => e.editType === 'modify');
  const createdFiles = edits.filter(e => e.editType === 'create');
  const deletedFiles = edits.filter(e => e.editType === 'delete');

  let response = `## Changes Applied\n\n${summary}\n\n`;

  if (modifiedFiles.length > 0) {
    response += `### Modified Files\n`;
    for (const edit of modifiedFiles) {
      response += `- **${edit.filePath}** — ${edit.description} (${edit.linesChanged} lines changed)\n`;
    }
    response += '\n';
  }

  if (createdFiles.length > 0) {
    response += `### New Files\n`;
    for (const edit of createdFiles) {
      response += `- **${edit.filePath}** — ${edit.description}\n`;
    }
    response += '\n';
  }

  if (deletedFiles.length > 0) {
    response += `### Removed Files\n`;
    for (const edit of deletedFiles) {
      response += `- **${edit.filePath}** — ${edit.description}\n`;
    }
    response += '\n';
  }

  response += `\nThe preview should update automatically. Tell me what else you'd like to change!`;

  return response;
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
