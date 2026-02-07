import { analyzeRequest, formatUnderstandingResponse, processAnswer } from './deep-understanding-engine.js';
import type { UnderstandingResult } from './deep-understanding-engine.js';
import { generatePlan, formatPlanAsMessage } from './plan-generator.js';
import type { ProjectPlan } from './plan-generator.js';
import { generateProjectFromPlan } from './plan-driven-generator.js';

export type ConversationPhase = 'initial' | 'understanding' | 'clarifying' | 'planning' | 'approval' | 'generating' | 'complete';

export interface PhaseHandlerResult {
  responseContent: string;
  newPhase: ConversationPhase;
  thinkingSteps: ThinkingStep[];
  generatedFiles?: { path: string; content: string; language: string }[];
  planData?: ProjectPlan;
  understandingData?: UnderstandingResult;
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

  if (currentPhase === 'clarifying' && state.understandingData) {
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
  emitStep('understanding', 'Processing your answers', 'Updating understanding with new information');

  const fullContext = userMessage;
  const updatedUnderstanding = analyzeRequest(fullContext);

  emitStep('understanding', 'Updated understanding',
    updatedUnderstanding.level2_domain.primaryDomain
      ? `Domain: ${updatedUnderstanding.level2_domain.primaryDomain.name}`
      : 'Building general application'
  );

  if (updatedUnderstanding.level5_clarification.needsClarification &&
      updatedUnderstanding.level5_clarification.questions.filter(q => q.priority === 'critical').length > 0) {
    const responseContent = formatUnderstandingResponse(updatedUnderstanding);
    return {
      responseContent,
      newPhase: 'clarifying',
      thinkingSteps,
      understandingData: updatedUnderstanding,
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

  const plan = generatePlan(understanding);

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

  emitStep('generating', 'Plan approved - starting code generation', `Building ${plan.projectName}`);
  emitStep('generating', 'Generating database schema', `Creating ${plan.dataModel.length} tables with relationships`);
  emitStep('generating', 'Generating API routes', `Building ${plan.apiEndpoints.length} endpoints with validation`);
  emitStep('generating', 'Generating page components', `Creating ${plan.pages.length} pages with features`);
  emitStep('generating', 'Generating shared components', 'Data tables, KPI cards, status badges');

  const files = generateProjectFromPlan(plan);

  emitStep('generating', 'Code generation complete', `${files.length} files created`);

  const moduleList = plan.modules.map(m => `- **${m.name}**: ${m.description}`).join('\n');
  const fileList = files.map(f => `- \`${f.path}\``).join('\n');

  const responseContent = `## ${plan.projectName} - Generated Successfully!

Your project has been generated with **${files.length} files** based on the approved plan.

### Modules Built
${moduleList}

### Files Created
${fileList}

### What's Included
- **${plan.dataModel.length} database tables** with full CRUD APIs
- **${plan.pages.length} pages** with search, filter, and data display
- **${plan.apiEndpoints.length} API endpoints** with validation
- **Dashboard** with KPI metrics
- **Status badges** for workflow tracking
- **Responsive layout** with sidebar navigation

### Next Steps
- Click **Preview** to see your app running
- Browse **View Code** to explore the generated files
- Tell me what you'd like to change or add!`;

  return {
    responseContent,
    newPhase: 'complete',
    thinkingSteps,
    generatedFiles: files,
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
  const updatedPlan = generatePlan(updatedUnderstanding);

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
