import { detectDomainFromText, getAllDomains, getDomain, buildEntitiesForModules, buildPagesForModules, buildWorkflowsForEntities } from './domain-knowledge.js';
import type { IndustryDomain, DomainEntity, DomainModule, DomainWorkflow, UserRole } from './domain-knowledge.js';

export interface UnderstandingResult {
  level1_intent: IntentDecomposition;
  level2_domain: DomainDetectionResult;
  level3_entities: EntityExtractionResult;
  level4_workflows: WorkflowDetectionResult;
  level5_clarification: ClarificationResult;
  confidence: number;
  readyForPlan: boolean;
}

export interface IntentDecomposition {
  primaryGoal: string;
  applicationType: string;
  targetAudience: string;
  scale: 'small' | 'medium' | 'large' | 'enterprise' | 'unknown';
  keyRequirements: string[];
  impliedFeatures: string[];
  mentionedFeatures: string[];
}

export interface DomainDetectionResult {
  primaryDomain: IndustryDomain | null;
  secondaryDomains: IndustryDomain[];
  confidence: number;
  matchedKeywords: string[];
  detectedModules: string[];
  suggestedModules: string[];
}

export interface EntityExtractionResult {
  mentionedEntities: string[];
  inferredEntities: string[];
  relationships: { from: string; to: string; type: string }[];
  domainEntities: DomainEntity[];
}

export interface WorkflowDetectionResult {
  mentionedWorkflows: string[];
  inferredWorkflows: DomainWorkflow[];
  approvalFlows: string[];
  statusTrackingNeeded: string[];
}

export interface ClarificationResult {
  needsClarification: boolean;
  questions: ClarifyingQuestion[];
  assumptions: string[];
}

export interface ClarifyingQuestion {
  id: string;
  question: string;
  why: string;
  options?: string[];
  defaultAnswer?: string;
  priority: 'critical' | 'important' | 'nice-to-have';
}

const ENTITY_KEYWORDS: Record<string, string[]> = {
  'users': ['user', 'users', 'account', 'accounts', 'login', 'auth', 'sign up', 'register'],
  'employees': ['employee', 'employees', 'staff', 'team', 'worker', 'workforce', 'personnel'],
  'customers': ['customer', 'customers', 'client', 'clients', 'buyer', 'buyers'],
  'products': ['product', 'products', 'item', 'items', 'catalog', 'catalogue', 'goods', 'merchandise'],
  'orders': ['order', 'orders', 'purchase', 'purchases', 'transaction', 'transactions', 'sale', 'sales'],
  'invoices': ['invoice', 'invoices', 'bill', 'bills', 'billing', 'payment', 'payments'],
  'projects': ['project', 'projects', 'engagement', 'engagement'],
  'tasks': ['task', 'tasks', 'todo', 'todos', 'ticket', 'tickets', 'issue', 'issues'],
  'inventory': ['inventory', 'stock', 'stocks', 'warehouse', 'supply', 'supplies'],
  'appointments': ['appointment', 'appointments', 'booking', 'bookings', 'reservation', 'reservations', 'schedule'],
  'reports': ['report', 'reports', 'analytics', 'dashboard', 'metrics', 'kpi', 'kpis', 'insights'],
  'timesheets': ['timesheet', 'timesheets', 'time tracking', 'hours', 'utilization', 'billable'],
  'departments': ['department', 'departments', 'team', 'teams', 'division', 'divisions', 'org chart'],
  'leave': ['leave', 'vacation', 'pto', 'time off', 'absence', 'absences', 'sick leave'],
  'payroll': ['payroll', 'salary', 'salaries', 'compensation', 'pay', 'wages'],
  'contracts': ['contract', 'contracts', 'agreement', 'agreements', 'sla', 'sow'],
  'shipments': ['shipment', 'shipments', 'delivery', 'deliveries', 'shipping', 'freight', 'tracking'],
  'vehicles': ['vehicle', 'vehicles', 'fleet', 'truck', 'trucks', 'car', 'cars', 'van', 'vans'],
  'properties': ['property', 'properties', 'listing', 'listings', 'unit', 'units', 'apartment', 'apartments'],
  'tenants': ['tenant', 'tenants', 'renter', 'renters', 'lessee'],
  'patients': ['patient', 'patients', 'medical', 'health', 'clinical'],
  'courses': ['course', 'courses', 'class', 'classes', 'curriculum', 'lesson', 'lessons'],
  'students': ['student', 'students', 'learner', 'learners', 'pupil', 'pupils', 'enrollment'],
  'contacts': ['contact', 'contacts', 'lead', 'leads', 'prospect', 'prospects'],
  'deals': ['deal', 'deals', 'opportunity', 'opportunities', 'pipeline', 'funnel'],
  'members': ['member', 'members', 'membership', 'memberships', 'subscriber', 'subscribers'],
  'menu': ['menu', 'dish', 'dishes', 'recipe', 'recipes', 'food'],
  'budget': ['budget', 'budgets', 'expense', 'expenses', 'financial', 'forecast'],
};

const WORKFLOW_INDICATORS: Record<string, string[]> = {
  'approval': ['approval', 'approve', 'reject', 'pending', 'submitted', 'review', 'sign off', 'authorize'],
  'status-tracking': ['status', 'track', 'tracking', 'progress', 'lifecycle', 'pipeline', 'stage', 'phase', 'workflow'],
  'order-fulfillment': ['fulfillment', 'fulfill', 'ship', 'deliver', 'dispatch', 'receive'],
  'scheduling': ['schedule', 'scheduling', 'booking', 'calendar', 'availability', 'slot', 'appointment'],
  'billing': ['billing', 'invoice', 'charge', 'payment', 'pay', 'due', 'overdue'],
};

const FEATURE_KEYWORDS: Record<string, string[]> = {
  'search': ['search', 'find', 'look up', 'filter', 'browse'],
  'export': ['export', 'download', 'csv', 'pdf', 'excel', 'report'],
  'notification': ['notification', 'notify', 'alert', 'remind', 'reminder', 'email'],
  'role-based': ['role', 'roles', 'permission', 'permissions', 'access control', 'admin', 'manager'],
  'realtime': ['real-time', 'realtime', 'real time', 'live', 'instant', 'push', 'websocket'],
  'charts': ['chart', 'charts', 'graph', 'graphs', 'visualization', 'analytics', 'dashboard'],
  'mobile': ['mobile', 'responsive', 'phone', 'tablet'],
  'import': ['import', 'upload', 'csv', 'bulk', 'batch'],
  'calendar': ['calendar', 'schedule', 'date picker', 'event', 'booking'],
  'kanban': ['kanban', 'board', 'drag and drop', 'columns', 'cards'],
  'multi-language': ['multi-language', 'multilingual', 'i18n', 'internationalization', 'localization', 'translate'],
  'api': ['api', 'rest', 'endpoint', 'integration', 'webhook', 'connect'],
};

const SCALE_INDICATORS: Record<string, string[]> = {
  'small': ['simple', 'basic', 'small', 'startup', 'mvp', 'minimal', 'quick', 'lightweight', 'solo', 'personal', 'freelance'],
  'medium': ['medium', 'growing', 'team', 'small business', 'smb', 'moderate'],
  'large': ['large', 'enterprise', 'corporation', 'corporate', 'complex', 'comprehensive', 'full-featured', 'complete', 'robust', 'advanced'],
  'enterprise': ['enterprise', 'multi-tenant', 'multi-location', 'global', 'scalable', 'high-availability', 'microservices'],
};

const APP_TYPE_PATTERNS: Record<string, string[]> = {
  'erp': ['erp', 'enterprise resource planning', 'business management', 'all-in-one business'],
  'crm': ['crm', 'customer relationship', 'sales management', 'lead management', 'pipeline'],
  'cms': ['cms', 'content management', 'blog', 'website builder', 'publishing'],
  'lms': ['lms', 'learning management', 'course platform', 'e-learning', 'online learning', 'education platform'],
  'hris': ['hris', 'hr system', 'human resource', 'people management', 'hr management'],
  'pms': ['project management', 'task management', 'project tracker', 'issue tracker'],
  'pos': ['pos', 'point of sale', 'cash register', 'checkout'],
  'wms': ['wms', 'warehouse management', 'inventory management', 'stock management'],
  'tms': ['tms', 'transport management', 'fleet management', 'logistics'],
  'ehr': ['ehr', 'electronic health', 'medical records', 'clinical', 'patient management'],
  'dashboard': ['dashboard', 'analytics', 'reporting tool', 'data visualization', 'admin panel'],
  'marketplace': ['marketplace', 'multi-vendor', 'platform', 'two-sided'],
  'booking': ['booking', 'reservation', 'appointment scheduler', 'calendar booking'],
  'social': ['social', 'community', 'forum', 'chat', 'messaging', 'network'],
  'saas': ['saas', 'subscription', 'multi-tenant', 'platform'],
};

export function analyzeRequest(userMessage: string, conversationContext?: string): UnderstandingResult {
  const fullText = conversationContext ? `${conversationContext} ${userMessage}` : userMessage;
  const lower = fullText.toLowerCase();

  const level1 = decomposeIntent(lower, userMessage);
  const level2 = detectDomain(lower, level1);
  const level3 = extractEntities(lower, level2);
  const level4 = detectWorkflows(lower, level3, level2);
  const level5 = generateClarifications(level1, level2, level3, level4, userMessage);

  const confidence = calculateOverallConfidence(level1, level2, level3, level4);
  const readyForPlan = confidence >= 0.65 && !level5.needsClarification;

  return {
    level1_intent: level1,
    level2_domain: level2,
    level3_entities: level3,
    level4_workflows: level4,
    level5_clarification: level5,
    confidence,
    readyForPlan,
  };
}

function decomposeIntent(lower: string, original: string): IntentDecomposition {
  let applicationType = 'web application';
  for (const [type, patterns] of Object.entries(APP_TYPE_PATTERNS)) {
    if (patterns.some(p => lower.includes(p))) {
      applicationType = type;
      break;
    }
  }

  let scale: IntentDecomposition['scale'] = 'unknown';
  for (const [s, indicators] of Object.entries(SCALE_INDICATORS)) {
    if (indicators.some(i => lower.includes(i))) {
      scale = s as IntentDecomposition['scale'];
      break;
    }
  }

  const mentionedFeatures: string[] = [];
  for (const [feature, keywords] of Object.entries(FEATURE_KEYWORDS)) {
    if (keywords.some(k => lower.includes(k))) {
      mentionedFeatures.push(feature);
    }
  }

  const impliedFeatures: string[] = [];
  if (['erp', 'crm', 'hris', 'pms'].includes(applicationType)) {
    impliedFeatures.push('role-based', 'charts', 'export', 'search');
  }
  if (['pos', 'marketplace', 'booking'].includes(applicationType)) {
    impliedFeatures.push('search', 'notification');
  }
  if (scale === 'large' || scale === 'enterprise') {
    impliedFeatures.push('role-based', 'export', 'api');
  }

  const keyRequirements: string[] = [];
  const requirementPatterns = [
    /(?:need|want|require|must have|should have|with)\s+(.+?)(?:\.|,|$)/gi,
    /(?:track|manage|handle|support)\s+(.+?)(?:\.|,|$)/gi,
    /(?:features?|functionality|capabilities?)\s*(?:like|such as|including)?\s*:?\s*(.+?)(?:\.|$)/gi,
  ];
  for (const pattern of requirementPatterns) {
    let match;
    while ((match = pattern.exec(original)) !== null) {
      const req = match[1].trim();
      if (req.length > 3 && req.length < 100) {
        keyRequirements.push(req);
      }
    }
  }

  let targetAudience = 'internal team';
  if (lower.includes('customer') || lower.includes('public') || lower.includes('user-facing') || lower.includes('consumer')) {
    targetAudience = 'external customers';
  } else if (lower.includes('admin') || lower.includes('internal') || lower.includes('back office') || lower.includes('operations')) {
    targetAudience = 'internal team';
  } else if (lower.includes('both') || lower.includes('customer portal') || lower.includes('self-service')) {
    targetAudience = 'both internal and external';
  }

  let primaryGoal = `Build a ${applicationType}`;
  if (keyRequirements.length > 0) {
    primaryGoal += ` with ${keyRequirements.slice(0, 3).join(', ')}`;
  }

  return { primaryGoal, applicationType, targetAudience, scale, keyRequirements, impliedFeatures, mentionedFeatures };
}

function detectDomain(lower: string, intent: IntentDecomposition): DomainDetectionResult {
  const domainMatches = detectDomainFromText(lower);

  const primaryDomain = domainMatches.length > 0 ? domainMatches[0].domain : null;
  const secondaryDomains = domainMatches.slice(1, 3).map(m => m.domain);
  const matchedKeywords = domainMatches.flatMap(m => m.matchedKeywords);
  const confidence = domainMatches.length > 0 ? domainMatches[0].confidence : 0;

  let detectedModules: string[] = [];
  let suggestedModules: string[] = [];

  if (primaryDomain) {
    detectedModules = primaryDomain.modules
      .filter(m => {
        const modKeywords = [...m.entities.map(e => e.toLowerCase()), m.name.toLowerCase()];
        return modKeywords.some(k => lower.includes(k));
      })
      .map(m => m.name);

    suggestedModules = primaryDomain.modules
      .filter(m => !detectedModules.includes(m.name))
      .map(m => m.name);

    if (detectedModules.length === 0) {
      if (intent.applicationType === 'erp' || lower.includes('full') || lower.includes('complete') || lower.includes('everything')) {
        detectedModules = primaryDomain.modules.map(m => m.name);
        suggestedModules = [];
      } else {
        const coreModules = primaryDomain.modules.filter(m =>
          m.name.toLowerCase().includes('dashboard') ||
          m.entities.length > 0
        );
        suggestedModules = coreModules.map(m => m.name);
      }
    }
  }

  return { primaryDomain, secondaryDomains, confidence, matchedKeywords, detectedModules, suggestedModules };
}

function extractEntities(lower: string, domainResult: DomainDetectionResult): EntityExtractionResult {
  const mentionedEntities: string[] = [];
  for (const [entity, keywords] of Object.entries(ENTITY_KEYWORDS)) {
    if (keywords.some(k => lower.includes(k))) {
      mentionedEntities.push(entity);
    }
  }

  const inferredEntities: string[] = [];
  const domain = domainResult.primaryDomain;
  if (domain) {
    const selectedModules = domainResult.detectedModules.length > 0
      ? domainResult.detectedModules
      : domain.modules.map(m => m.name);

    const domainEntities = buildEntitiesForModules(domain, selectedModules);
    for (const de of domainEntities) {
      const entityKey = de.name.toLowerCase();
      if (!mentionedEntities.includes(entityKey)) {
        inferredEntities.push(de.name);
      }
    }
  }

  const relationships: { from: string; to: string; type: string }[] = [];
  if (domain) {
    for (const entity of domain.entities) {
      if (entity.relationships) {
        for (const rel of entity.relationships) {
          relationships.push({
            from: entity.name,
            to: rel.entity,
            type: rel.type,
          });
        }
      }
    }
  }

  const domainEntities = domain
    ? buildEntitiesForModules(domain, domainResult.detectedModules.length > 0 ? domainResult.detectedModules : domain.modules.map(m => m.name))
    : [];

  return { mentionedEntities, inferredEntities, relationships, domainEntities };
}

function detectWorkflows(lower: string, entityResult: EntityExtractionResult, domainResult: DomainDetectionResult): WorkflowDetectionResult {
  const mentionedWorkflows: string[] = [];
  for (const [workflow, indicators] of Object.entries(WORKFLOW_INDICATORS)) {
    if (indicators.some(i => lower.includes(i))) {
      mentionedWorkflows.push(workflow);
    }
  }

  const domain = domainResult.primaryDomain;
  const allEntityNames = [...entityResult.mentionedEntities, ...entityResult.inferredEntities];
  const inferredWorkflows = domain ? buildWorkflowsForEntities(domain, allEntityNames.map(e => {
    const de = domain.entities.find(d => d.name.toLowerCase() === e.toLowerCase());
    return de ? de.name : e;
  })) : [];

  if (domain && inferredWorkflows.length === 0) {
    inferredWorkflows.push(...domain.workflows);
  }

  const approvalFlows: string[] = [];
  const statusTrackingNeeded: string[] = [];
  if (lower.includes('approval') || lower.includes('approve')) {
    approvalFlows.push('approval-workflow');
  }
  for (const entity of entityResult.domainEntities) {
    const hasStatus = entity.fields.some(f => f.type.startsWith('enum:') && f.name === 'status');
    if (hasStatus) {
      statusTrackingNeeded.push(entity.name);
    }
  }

  return { mentionedWorkflows, inferredWorkflows, approvalFlows, statusTrackingNeeded };
}

function generateClarifications(
  intent: IntentDecomposition,
  domain: DomainDetectionResult,
  entities: EntityExtractionResult,
  workflows: WorkflowDetectionResult,
  originalMessage: string
): ClarificationResult {
  const questions: ClarifyingQuestion[] = [];
  const assumptions: string[] = [];

  if (!domain.primaryDomain) {
    questions.push({
      id: 'domain',
      question: 'What industry or type of business is this for?',
      why: 'Different industries need very different features and data models',
      options: getAllDomains().slice(0, 8).map(d => d.name),
      priority: 'critical',
    });
  } else {
    assumptions.push(`This is for the ${domain.primaryDomain.name} industry`);
  }

  if (intent.scale === 'unknown' && originalMessage.split(' ').length < 15) {
    questions.push({
      id: 'scale',
      question: 'How big is the team or organization that will use this?',
      why: 'This determines how many features and how complex the system should be',
      options: ['Just me / 1-5 people', 'Small team (5-20)', 'Medium company (20-100)', 'Large organization (100+)'],
      priority: 'important',
    });
  } else if (intent.scale !== 'unknown') {
    assumptions.push(`Scale: ${intent.scale}`);
  }

  if (domain.primaryDomain && domain.detectedModules.length === 0 && domain.suggestedModules.length > 3) {
    questions.push({
      id: 'modules',
      question: `Which areas are most important to you? I can include all of these, or focus on a few:`,
      why: 'Focusing on what matters most ensures the core features are solid',
      options: domain.suggestedModules,
      priority: 'important',
    });
  } else if (domain.detectedModules.length > 0) {
    assumptions.push(`Key modules: ${domain.detectedModules.join(', ')}`);
  }

  if (entities.mentionedEntities.length === 0 && entities.inferredEntities.length === 0 && !domain.primaryDomain) {
    questions.push({
      id: 'entities',
      question: 'What are the main things you need to track or manage?',
      why: 'This defines the core data in your system',
      options: ['People/Employees', 'Products/Inventory', 'Orders/Sales', 'Projects/Tasks', 'Customers/Clients', 'Other'],
      priority: 'critical',
    });
  } else if (entities.inferredEntities.length > 0) {
    assumptions.push(`Key data: ${entities.inferredEntities.slice(0, 5).join(', ')}`);
  }

  if (originalMessage.split(' ').length < 8 && !domain.primaryDomain) {
    questions.push({
      id: 'details',
      question: 'Can you describe in a bit more detail what you want this system to do? What problems should it solve?',
      why: 'More detail helps me build exactly what you need instead of guessing',
      priority: 'critical',
    });
  }

  const criticalCount = questions.filter(q => q.priority === 'critical').length;
  const needsClarification = criticalCount > 0;

  return { needsClarification, questions, assumptions };
}

function calculateOverallConfidence(
  intent: IntentDecomposition,
  domain: DomainDetectionResult,
  entities: EntityExtractionResult,
  workflows: WorkflowDetectionResult
): number {
  let score = 0;

  if (domain.primaryDomain) score += 0.3;
  if (domain.confidence > 0.5) score += 0.1;

  if (intent.applicationType !== 'web application') score += 0.1;
  if (intent.scale !== 'unknown') score += 0.05;
  if (intent.keyRequirements.length > 0) score += 0.1;
  if (intent.mentionedFeatures.length > 0) score += 0.05;

  const totalEntities = entities.mentionedEntities.length + entities.inferredEntities.length;
  if (totalEntities > 0) score += 0.1;
  if (totalEntities > 3) score += 0.1;

  if (workflows.inferredWorkflows.length > 0) score += 0.05;
  if (domain.detectedModules.length > 0) score += 0.05;

  return Math.min(score, 1);
}

export function processAnswer(
  previousResult: UnderstandingResult,
  userAnswer: string,
  questionId: string
): UnderstandingResult {
  const lower = userAnswer.toLowerCase();

  if (questionId === 'domain') {
    const domainMatches = detectDomainFromText(lower);
    if (domainMatches.length > 0) {
      const domain = domainMatches[0].domain;
      previousResult.level2_domain.primaryDomain = domain;
      previousResult.level2_domain.confidence = domainMatches[0].confidence;
      previousResult.level2_domain.matchedKeywords = domainMatches[0].matchedKeywords;
      previousResult.level2_domain.suggestedModules = domain.modules.map(m => m.name);
    }
  }

  if (questionId === 'scale') {
    if (lower.includes('just me') || lower.includes('1-5')) previousResult.level1_intent.scale = 'small';
    else if (lower.includes('5-20') || lower.includes('small team')) previousResult.level1_intent.scale = 'medium';
    else if (lower.includes('20-100') || lower.includes('medium')) previousResult.level1_intent.scale = 'medium';
    else if (lower.includes('100+') || lower.includes('large')) previousResult.level1_intent.scale = 'large';
  }

  if (questionId === 'modules' && previousResult.level2_domain.primaryDomain) {
    const domain = previousResult.level2_domain.primaryDomain;
    const selectedModules = domain.modules.filter(m =>
      lower.includes(m.name.toLowerCase()) || lower.includes('all') || lower.includes('everything')
    ).map(m => m.name);

    if (selectedModules.length > 0) {
      previousResult.level2_domain.detectedModules = selectedModules;
    } else if (lower.includes('all') || lower.includes('everything')) {
      previousResult.level2_domain.detectedModules = domain.modules.map(m => m.name);
    }
  }

  const fullText = `${userAnswer} ${previousResult.level1_intent.primaryGoal}`;
  return analyzeRequest(fullText);
}

export function formatUnderstandingResponse(result: UnderstandingResult): string {
  const sections: string[] = [];

  sections.push('## Understanding Your Request\n');

  if (result.level2_domain.primaryDomain) {
    sections.push(`**Industry:** ${result.level2_domain.primaryDomain.name}`);
  }
  sections.push(`**Application Type:** ${result.level1_intent.applicationType.toUpperCase()}`);
  if (result.level1_intent.scale !== 'unknown') {
    sections.push(`**Scale:** ${result.level1_intent.scale}`);
  }
  sections.push(`**Target Users:** ${result.level1_intent.targetAudience}`);

  if (result.level5_clarification.assumptions.length > 0) {
    sections.push('\n**My Understanding:**');
    for (const assumption of result.level5_clarification.assumptions) {
      sections.push(`- ${assumption}`);
    }
  }

  if (result.level3_entities.domainEntities.length > 0) {
    sections.push(`\n**Key Data I'll Include:** ${result.level3_entities.domainEntities.slice(0, 6).map(e => e.name).join(', ')}`);
  }

  if (result.level4_workflows.inferredWorkflows.length > 0) {
    sections.push(`\n**Business Workflows:** ${result.level4_workflows.inferredWorkflows.map(w => w.name).join(', ')}`);
  }

  if (result.level5_clarification.needsClarification) {
    sections.push('\n---\n');
    sections.push('Before I create a detailed plan, I have a few questions:\n');
    for (const q of result.level5_clarification.questions.filter(q => q.priority === 'critical' || q.priority === 'important')) {
      sections.push(`**${q.question}**`);
      if (q.options && q.options.length > 0) {
        sections.push(q.options.map((o, i) => `  ${i + 1}. ${o}`).join('\n'));
      }
      sections.push('');
    }
  } else {
    sections.push('\n---\n');
    sections.push(`I have a good understanding of what you need. Let me create a detailed plan for your **${result.level1_intent.applicationType.toUpperCase()}** system.`);
  }

  return sections.join('\n');
}
