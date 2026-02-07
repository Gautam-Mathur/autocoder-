import { analyzeRequest } from '../modules/deep-understanding-engine.js';
import { generatePlan } from '../modules/plan-generator.js';
import { analyzeSemantics, type ReasoningResult } from '../modules/contextual-reasoning-engine.js';
import { generateProjectFromPlan } from '../modules/plan-driven-generator.js';
import { GenerationLearningEngine } from '../modules/generation-learning-engine.js';

interface TestResult {
  name: string;
  passed: boolean;
  details: string;
}

const results: TestResult[] = [];

function assert(name: string, condition: boolean, details: string = '') {
  results.push({ name, passed: condition, details: condition ? 'OK' : details });
}

function runTest(label: string, fn: () => void) {
  try {
    fn();
  } catch (e: any) {
    results.push({ name: label, passed: false, details: `Exception: ${e.message}` });
  }
}

console.log('=== Intelligence Pipeline End-to-End Test ===\n');

const description = 'Build a CRM system to manage contacts, companies, deals, and activities. Each deal belongs to a company and has a contact person. Deals move through pipeline stages: lead, qualified, proposal, negotiation, closed-won, closed-lost. Track deal values in dollars and conversion rates. I need a dashboard showing total revenue, deal count, and conversion rate.';

runTest('1. Deep Understanding', () => {
  const understanding = analyzeRequest(description);
  assert('Intent detected', !!understanding.level1_intent.primaryGoal, `Got: ${understanding.level1_intent.primaryGoal}`);
  assert('Domain detected', !!understanding.level2_domain.primaryDomain, `No domain found`);
  assert('Entities extracted', understanding.level3_entities.domainEntities.length >= 2, `Only ${understanding.level3_entities.domainEntities.length} entities`);

  const entityNames = understanding.level3_entities.domainEntities.map((e: any) => e.name.toLowerCase());
  assert('Domain entities recognized', entityNames.length >= 2, `Entities: ${entityNames.join(', ')}`);
});

const understanding = analyzeRequest(description);
const plan = generatePlan(understanding);

runTest('2. Plan Generation', () => {
  assert('Plan has project name', !!plan.projectName, 'Missing project name');
  assert('Plan has data model', plan.dataModel.length >= 2, `Only ${plan.dataModel.length} entities in data model`);
  assert('Plan has pages', plan.pages.length >= 2, `Only ${plan.pages.length} pages`);
  assert('Plan has API endpoints', plan.apiEndpoints.length >= 2, `Only ${plan.apiEndpoints.length} endpoints`);
  assert('Plan has KPIs', plan.kpis.length >= 1, `No KPIs`);

  const hasWorkflow = plan.workflows.length > 0;
  assert('Workflows detected', hasWorkflow, `Workflows: ${JSON.stringify(plan.workflows.map(w => ({ name: w.name, states: w.states })))}`);
  if (hasWorkflow) {
    const hasMultiState = plan.workflows.some(w => w.states.length >= 3);
    assert('Multi-state workflow', hasMultiState, `States: ${plan.workflows.map(w => w.states.length).join(', ')}`);
  }
});

runTest('3. Contextual Reasoning', () => {
  const reasoning = analyzeSemantics(plan);

  assert('Field semantics populated', reasoning.fieldSemantics.size > 0, 'No field semantics');

  let hasCurrencyField = false;
  let hasDateField = false;
  let hasEmailField = false;
  let hasNumberField = false;
  const allSemanticTypes: string[] = [];
  reasoning.fieldSemantics.forEach((semantics, entityName) => {
    for (const sem of semantics) {
      allSemanticTypes.push(`${entityName}.${sem.fieldName}:${sem.inputType}`);
      if (sem.inputType === 'currency') hasCurrencyField = true;
      if (sem.inputType === 'date' || sem.inputType === 'datetime') hasDateField = true;
      if (sem.inputType === 'email') hasEmailField = true;
      if (sem.inputType === 'number') hasNumberField = true;
    }
  });
  assert('Semantic field types detected', hasCurrencyField || hasDateField || hasEmailField || hasNumberField,
    `Semantics: ${allSemanticTypes.join(', ')}`);
  assert('Date fields detected', hasDateField, 'No date semantic fields found');

  assert('Relationships discovered', reasoning.relationships.length > 0, 'No relationships found');
  assert('Business rules generated', reasoning.businessRules.length > 0, 'No business rules');
  assert('UI patterns detected', reasoning.uiPatterns.length > 0, 'No UI patterns');

  const patternTypes = reasoning.uiPatterns.map(p => p.pattern);
  const hasAdvancedPattern = patternTypes.some(p => ['kanban', 'calendar', 'card-grid', 'master-detail', 'form-wizard'].includes(p));
  assert('Advanced UI pattern detected', hasAdvancedPattern, `Patterns: ${reasoning.uiPatterns.map(p => `${p.entityName}:${p.pattern}`).join(', ')}`);

  assert('Computed fields inferred', reasoning.computedFields.length > 0, 'No computed fields');
});

runTest('4. Code Generation with Intelligence', () => {
  const files = generateProjectFromPlan(plan);
  assert('Files generated', files.length > 10, `Only ${files.length} files`);

  const fileContents = files.map(f => f.content).join('\n---\n');

  assert('Semantic formatting in generated code',
    fileContents.includes('Intl.NumberFormat') || fileContents.includes('currency') || 
    fileContents.includes('toLocaleDateString') || fileContents.includes('mailto:'),
    'No semantic formatting (currency/date/email) found in generated code');

  assert('Date formatting in generated code',
    fileContents.includes('toLocaleDateString') || fileContents.includes('type="date"'),
    'No date formatting found');

  const routesFile = files.find(f => f.path.includes('routes') || f.path.includes('index.ts'));
  if (routesFile) {
    assert('Business rule validation in routes',
      routesFile.content.includes('Business rule') || routesFile.content.includes('validation') || routesFile.content.includes('schema'),
      'No business rule validation code in routes');
  } else {
    assert('Routes file exists', false, 'No routes file found');
  }

  const hasViewMode = fileContents.includes('viewMode') || fileContents.includes('Board') || fileContents.includes('Grid') || fileContents.includes('Calendar');
  assert('UI pattern or view mode generated', hasViewMode, 'No pattern view found in generated pages');

  const hasRelatedQuery = fileContents.includes('Related') || fileContents.includes('related') || fileContents.includes('child');
  assert('Relationship navigation in detail pages', hasRelatedQuery, 'No related items section found in detail pages');

  assert('Semantic form inputs',
    fileContents.includes('type="email"') || fileContents.includes('type="date"') || fileContents.includes('step="0.01"'),
    'No semantic input types found');
});

runTest('5. Learning Engine', () => {
  const engine = new GenerationLearningEngine();
  const reasoning = analyzeSemantics(plan);
  const files = generateProjectFromPlan(plan);

  engine.recordOutcome({
    conversationId: 999,
    projectDescription: description,
    domainId: understanding.level2_domain.primaryDomain?.id,
    plan,
    generatedFiles: files.map(f => ({ path: f.path, content: f.content })),
    errors: [],
    autoFixes: [],
    userModifications: [],
    generationTimeMs: 1500,
  });

  const recs = engine.getUIRecommendations();
  assert('UI recommendations returned', recs.dashboardKpiCount >= 1, `KPI count: ${recs.dashboardKpiCount}`);

  engine.recordOutcome({
    conversationId: 1000,
    projectDescription: description,
    domainId: understanding.level2_domain.primaryDomain?.id,
    plan,
    generatedFiles: files.map(f => ({ path: f.path, content: f.content })),
    errors: ["Cannot find module 'bad-module'", "Cannot find module 'bad-module'"],
    autoFixes: [],
    userModifications: [],
    generationTimeMs: 2000,
  });

  engine.learnFromErrors(["Cannot find module 'bad-module'", "Cannot find module 'bad-module'"], plan);

  const rules = engine.getErrorPreventionRules();
  assert('Error prevention rules learned',
    rules.requiredDependencies.length > 0 || rules.requiredFields.length > 0 || rules.avoidComponents.length > 0,
    `Rules: ${JSON.stringify(rules)}`);

  const enhancedPlan = engine.applyLearnedPatterns(plan);
  assert('Learned patterns applied to plan', enhancedPlan.dataModel.length >= plan.dataModel.length, 'Plan not enhanced');
});

console.log('\n=== Test Results ===\n');
let passed = 0;
let failed = 0;
for (const r of results) {
  const status = r.passed ? 'PASS' : 'FAIL';
  const icon = r.passed ? '  ✓' : '  ✗';
  console.log(`${icon} [${status}] ${r.name}${r.details && !r.passed ? ` — ${r.details}` : ''}`);
  if (r.passed) passed++; else failed++;
}

console.log(`\n=== Summary: ${passed} passed, ${failed} failed, ${passed + failed} total ===`);

if (failed > 0) {
  process.exit(1);
}
