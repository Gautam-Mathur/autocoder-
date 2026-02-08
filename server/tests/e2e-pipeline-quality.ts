import { analyzeRequest } from '../modules/deep-understanding-engine.js';
import { generatePlan } from '../modules/plan-generator.js';
import { analyzeSemantics, type ReasoningResult } from '../modules/contextual-reasoning-engine.js';
import { generateProjectFromPlan } from '../modules/plan-driven-generator.js';
import { validateAndFix } from '../modules/post-generation-validator.js';

interface TestCase {
  name: string;
  prompt: string;
  expectedEntities: string[];
  expectedRelationships: string[];
  expectedPages: string[];
  expectedSemanticFields: string[];
  expectedUIPatterns: string[];
  expectedWorkflows: string[];
  expectedCodePatterns: string[];
  minDataModelTables: number;
  minApiEndpoints: number;
}

const TEST_CASES: TestCase[] = [
  {
    name: 'Veterinary Clinic',
    prompt: 'Build a veterinary clinic management system with patients (animals), owners, appointments, medical records, vaccinations, prescriptions, and billing.',
    expectedEntities: ['patient', 'owner', 'appointment', 'medical', 'vaccination', 'prescription'],
    expectedRelationships: ['parent-child', '1:N'],
    expectedPages: ['list', 'detail'],
    expectedSemanticFields: ['date', 'currency', 'email', 'phone', 'textarea'],
    expectedUIPatterns: ['kanban', 'calendar', 'card-grid', 'master-detail', 'timeline'],
    expectedWorkflows: ['status', 'approval'],
    expectedCodePatterns: ['Intl.NumberFormat', 'toLocaleDateString', 'type="email"', 'type="tel"', 'useState', 'useQuery', 'fetch('],
    minDataModelTables: 3,
    minApiEndpoints: 10,
  },
  {
    name: 'Invoice Generator',
    prompt: 'Create an invoice generator with clients, line items, tax calculation, and payment status tracking.',
    expectedEntities: ['client', 'invoice', 'line', 'payment'],
    expectedRelationships: ['parent-child', '1:N'],
    expectedPages: ['list'],
    expectedSemanticFields: ['currency', 'date', 'email'],
    expectedUIPatterns: ['kanban', 'card-grid', 'master-detail'],
    expectedWorkflows: ['status'],
    expectedCodePatterns: ['Intl.NumberFormat', 'toLocaleDateString', 'step="0.01"', 'useState', 'useQuery'],
    minDataModelTables: 2,
    minApiEndpoints: 5,
  },
  {
    name: 'Recipe Manager',
    prompt: 'Build a recipe manager where users can save recipes with ingredients, steps, cooking time, and categories. Include a shopping list generator.',
    expectedEntities: ['recipe', 'ingredient', 'category'],
    expectedRelationships: ['parent-child'],
    expectedPages: ['list'],
    expectedSemanticFields: ['textarea', 'number'],
    expectedUIPatterns: ['card-grid'],
    expectedWorkflows: [],
    expectedCodePatterns: ['useState', 'useQuery', 'fetch('],
    minDataModelTables: 2,
    minApiEndpoints: 5,
  },
  {
    name: 'Project Board',
    prompt: 'Build a project board with tasks, assignees, due dates, priorities, and kanban columns.',
    expectedEntities: ['project', 'task'],
    expectedRelationships: ['parent-child', '1:N'],
    expectedPages: ['list'],
    expectedSemanticFields: ['date'],
    expectedUIPatterns: ['kanban'],
    expectedWorkflows: ['status'],
    expectedCodePatterns: ['toLocaleDateString', 'useState', 'useQuery'],
    minDataModelTables: 2,
    minApiEndpoints: 5,
  },
  {
    name: 'Freelancer Platform',
    prompt: 'Build a freelancer portfolio and invoicing platform with projects, clients, time tracking, invoices, payments, and a public portfolio page.',
    expectedEntities: ['project', 'client', 'time', 'invoice', 'payment'],
    expectedRelationships: ['parent-child', '1:N'],
    expectedPages: ['list', 'detail'],
    expectedSemanticFields: ['currency', 'date', 'email'],
    expectedUIPatterns: ['card-grid', 'master-detail'],
    expectedWorkflows: ['status'],
    expectedCodePatterns: ['Intl.NumberFormat', 'toLocaleDateString', 'useState', 'useQuery', 'fetch('],
    minDataModelTables: 3,
    minApiEndpoints: 10,
  },
];

interface GradeResult {
  score: number;
  maxScore: number;
  percentage: number;
  details: string[];
}

function gradeUnderstanding(testCase: TestCase, understanding: any): GradeResult {
  const details: string[] = [];
  let score = 0;
  let maxScore = 0;

  maxScore += 2;
  const extractedEntities = understanding.level3_entities.domainEntities.map((e: any) => e.name.toLowerCase());
  const mentionedEntities = understanding.level3_entities.mentionedEntities.map((e: string) => e.toLowerCase());
  const allExtracted = Array.from(new Set([...extractedEntities, ...mentionedEntities]));
  let entityHits = 0;
  for (const expected of testCase.expectedEntities) {
    const found = allExtracted.some((e: string) => e.includes(expected) || expected.includes(e));
    if (found) entityHits++;
  }
  const entityCoverage = entityHits / testCase.expectedEntities.length;
  if (entityCoverage >= 0.8) { score += 2; details.push(`✓ Entity extraction: ${entityHits}/${testCase.expectedEntities.length} expected entities found (${allExtracted.join(', ')})`); }
  else if (entityCoverage >= 0.5) { score += 1; details.push(`◐ Partial entity extraction: ${entityHits}/${testCase.expectedEntities.length} (${allExtracted.join(', ')})`); }
  else { details.push(`✗ Weak entity extraction: only ${entityHits}/${testCase.expectedEntities.length} found (got: ${allExtracted.join(', ')})`); }

  maxScore += 1;
  const confidence = understanding.level2_domain.confidence || 0;
  if (confidence >= 0.4) { score += 1; details.push(`✓ Domain confidence: ${(confidence * 100).toFixed(0)}% — ${understanding.level2_domain.primaryDomain?.name || 'generic'}`); }
  else { details.push(`✗ Low domain confidence: ${(confidence * 100).toFixed(0)}% — ${understanding.level2_domain.primaryDomain?.name || 'generic'}`); }

  maxScore += 1;
  const intent = understanding.level1_intent;
  if (intent.primaryGoal && intent.applicationType && intent.keyRequirements.length > 0) {
    score += 1;
    details.push(`✓ Intent clear: "${intent.primaryGoal}" (type: ${intent.applicationType}, ${intent.keyRequirements.length} requirements)`);
  } else {
    details.push(`✗ Intent incomplete: goal="${intent.primaryGoal}", type="${intent.applicationType}", reqs=${intent.keyRequirements.length}`);
  }

  maxScore += 1;
  const relationships = understanding.level3_entities.relationships || [];
  if (relationships.length > 0) {
    score += 1;
    details.push(`✓ Relationships detected: ${relationships.map((r: any) => `${r.from}→${r.to} (${r.type})`).join(', ')}`);
  } else if (testCase.expectedRelationships.length > 0) {
    details.push(`✗ No relationships detected (expected: ${testCase.expectedRelationships.join(', ')})`);
  } else {
    score += 1;
    details.push(`✓ No relationships expected/found — correct`);
  }

  return { score, maxScore, percentage: Math.round((score / maxScore) * 100), details };
}

function gradePlan(testCase: TestCase, plan: any): GradeResult {
  const details: string[] = [];
  let score = 0;
  let maxScore = 0;

  maxScore += 2;
  if (plan.dataModel.length >= testCase.minDataModelTables) {
    score += 2;
    details.push(`✓ Data model: ${plan.dataModel.length} tables (need ≥${testCase.minDataModelTables}) — [${plan.dataModel.map((t: any) => t.name).join(', ')}]`);
  } else if (plan.dataModel.length >= 1) {
    score += 1;
    details.push(`◐ Data model thin: ${plan.dataModel.length} tables (need ≥${testCase.minDataModelTables}) — [${plan.dataModel.map((t: any) => t.name).join(', ')}]`);
  } else {
    details.push(`✗ Empty data model`);
  }

  maxScore += 1;
  for (const entity of plan.dataModel) {
    if (entity.fields.length < 3) {
      details.push(`✗ Entity "${entity.name}" has only ${entity.fields.length} fields — too few`);
    }
  }
  const avgFields = plan.dataModel.length > 0
    ? plan.dataModel.reduce((s: number, e: any) => s + e.fields.length, 0) / plan.dataModel.length
    : 0;
  if (avgFields >= 4) { score += 1; details.push(`✓ Rich fields: avg ${avgFields.toFixed(1)} fields/entity`); }
  else { details.push(`◐ Sparse fields: avg ${avgFields.toFixed(1)} fields/entity`); }

  maxScore += 2;
  if (plan.pages.length >= testCase.expectedPages.length) {
    score += 2;
    details.push(`✓ Pages: ${plan.pages.length} generated — [${plan.pages.map((p: any) => p.name).join(', ')}]`);
  } else if (plan.pages.length >= 1) {
    score += 1;
    details.push(`◐ Few pages: ${plan.pages.length} (expected ≥${testCase.expectedPages.length}) — [${plan.pages.map((p: any) => p.name).join(', ')}]`);
  } else {
    details.push(`✗ No pages generated`);
  }

  maxScore += 1;
  if (plan.apiEndpoints.length >= testCase.minApiEndpoints) {
    score += 1;
    details.push(`✓ API endpoints: ${plan.apiEndpoints.length} (need ≥${testCase.minApiEndpoints}) — CRUD coverage`);
  } else {
    details.push(`◐ API endpoints: ${plan.apiEndpoints.length} (need ≥${testCase.minApiEndpoints})`);
  }

  maxScore += 1;
  const hasRelations = plan.dataModel.some((e: any) => e.relationships && e.relationships.length > 0);
  if (hasRelations) {
    score += 1;
    const relSummary = plan.dataModel
      .filter((e: any) => e.relationships?.length > 0)
      .map((e: any) => `${e.name}→${e.relationships.map((r: any) => `${r.entity}(${r.type})`).join(',')}`)
      .join('; ');
    details.push(`✓ Data relationships: ${relSummary}`);
  } else if (testCase.expectedRelationships.length > 0) {
    details.push(`✗ No data model relationships defined`);
  } else {
    score += 1;
    details.push(`✓ No relationships needed — correct`);
  }

  maxScore += 1;
  if (plan.workflows.length > 0) {
    score += 1;
    details.push(`✓ Workflows: ${plan.workflows.map((w: any) => `${w.name}(${w.states.join('→')})`).join(', ')}`);
  } else if (testCase.expectedWorkflows.length > 0) {
    details.push(`◐ No workflows defined (expected: ${testCase.expectedWorkflows.join(', ')})`);
  } else {
    score += 1;
    details.push(`✓ No workflows needed — correct`);
  }

  return { score, maxScore, percentage: Math.round((score / maxScore) * 100), details };
}

function gradeReasoning(testCase: TestCase, reasoning: ReasoningResult): GradeResult {
  const details: string[] = [];
  let score = 0;
  let maxScore = 0;

  maxScore += 2;
  const allSemantics: string[] = [];
  reasoning.fieldSemantics.forEach((fields, entity) => {
    for (const f of fields) {
      allSemantics.push(f.inputType);
    }
  });
  const uniqueTypes = Array.from(new Set(allSemantics));
  let semHits = 0;
  for (const expected of testCase.expectedSemanticFields) {
    if (uniqueTypes.some(t => t.includes(expected) || expected.includes(t))) semHits++;
  }
  const semCoverage = testCase.expectedSemanticFields.length > 0 ? semHits / testCase.expectedSemanticFields.length : 1;
  if (semCoverage >= 0.6) { score += 2; details.push(`✓ Semantic field types: ${semHits}/${testCase.expectedSemanticFields.length} — detected: [${uniqueTypes.join(', ')}]`); }
  else if (semCoverage >= 0.3) { score += 1; details.push(`◐ Partial semantics: ${semHits}/${testCase.expectedSemanticFields.length} — [${uniqueTypes.join(', ')}]`); }
  else { details.push(`✗ Weak semantics: ${semHits}/${testCase.expectedSemanticFields.length} — [${uniqueTypes.join(', ')}]`); }

  maxScore += 2;
  if (reasoning.relationships.length > 0) {
    score += 2;
    details.push(`✓ Relationships: ${reasoning.relationships.map(r => `${r.from}→${r.to} (${r.type}, ${r.cardinality})`).join(', ')}`);
  } else if (testCase.expectedRelationships.length > 0) {
    details.push(`✗ No relationships discovered`);
  } else {
    score += 2;
    details.push(`✓ No relationships expected — correct`);
  }

  maxScore += 1;
  const patterns = reasoning.uiPatterns.map(p => p.pattern);
  let patternHits = 0;
  for (const expected of testCase.expectedUIPatterns) {
    if (patterns.includes(expected as any)) patternHits++;
  }
  if (patternHits > 0 || testCase.expectedUIPatterns.length === 0) {
    score += 1;
    details.push(`✓ UI patterns: [${patterns.join(', ')}] (matched ${patternHits}/${testCase.expectedUIPatterns.length} expected)`);
  } else {
    details.push(`◐ UI patterns: [${patterns.join(', ')}] — none matched expected: [${testCase.expectedUIPatterns.join(', ')}]`);
  }

  maxScore += 1;
  if (reasoning.computedFields.length > 0) {
    score += 1;
    details.push(`✓ Computed fields: ${reasoning.computedFields.map(c => `${c.entityName}.${c.fieldName}=${c.expression}`).join(', ')}`);
  } else {
    details.push(`◐ No computed fields inferred`);
  }

  maxScore += 1;
  if (reasoning.businessRules.length > 0) {
    score += 1;
    details.push(`✓ Business rules: ${reasoning.businessRules.map(r => `${r.entityName}: ${r.ruleName}`).join(', ')}`);
  } else {
    details.push(`◐ No business rules generated`);
  }

  return { score, maxScore, percentage: Math.round((score / maxScore) * 100), details };
}

function gradeCodeGen(testCase: TestCase, files: any[], validation: any): GradeResult {
  const details: string[] = [];
  let score = 0;
  let maxScore = 0;

  const allContent = files.map(f => f.content).join('\n');

  maxScore += 2;
  if (validation.valid) { score += 2; details.push(`✓ Validation: PASSED (${validation.fixesApplied?.length || 0} auto-fixes applied)`); }
  else { details.push(`✗ Validation FAILED: ${validation.issues?.length} issues remaining`); }

  maxScore += 2;
  let codePatternHits = 0;
  const foundPatterns: string[] = [];
  const missingPatterns: string[] = [];
  for (const pattern of testCase.expectedCodePatterns) {
    if (allContent.includes(pattern)) { codePatternHits++; foundPatterns.push(pattern); }
    else { missingPatterns.push(pattern); }
  }
  const patternCoverage = codePatternHits / testCase.expectedCodePatterns.length;
  if (patternCoverage >= 0.7) { score += 2; details.push(`✓ Code patterns: ${codePatternHits}/${testCase.expectedCodePatterns.length} found — [${foundPatterns.join(', ')}]`); }
  else if (patternCoverage >= 0.4) { score += 1; details.push(`◐ Partial patterns: ${codePatternHits}/${testCase.expectedCodePatterns.length} — missing: [${missingPatterns.join(', ')}]`); }
  else { details.push(`✗ Most code patterns missing: [${missingPatterns.join(', ')}]`); }

  maxScore += 1;
  const schemaFile = files.find(f => f.path.includes('schema'));
  if (schemaFile) {
    const tableMatches = schemaFile.content.match(/pgTable\(/g);
    const tableCount = tableMatches ? tableMatches.length : 0;
    if (tableCount >= testCase.minDataModelTables) {
      score += 1;
      details.push(`✓ Schema tables: ${tableCount} pgTable definitions in generated schema`);
    } else {
      details.push(`◐ Schema tables: ${tableCount} (need ≥${testCase.minDataModelTables})`);
    }
  } else {
    details.push(`✗ No schema file generated`);
  }

  maxScore += 1;
  const routesFile = files.find(f => f.path.includes('routes'));
  if (routesFile) {
    const getRoutes = (routesFile.content.match(/app\.get\(/g) || []).length;
    const postRoutes = (routesFile.content.match(/app\.post\(/g) || []).length;
    const putRoutes = (routesFile.content.match(/app\.put\(/g) || []).length;
    const deleteRoutes = (routesFile.content.match(/app\.delete\(/g) || []).length;
    const totalRoutes = getRoutes + postRoutes + putRoutes + deleteRoutes;
    if (totalRoutes >= testCase.minApiEndpoints) {
      score += 1;
      details.push(`✓ API routes: ${totalRoutes} (GET:${getRoutes} POST:${postRoutes} PUT:${putRoutes} DEL:${deleteRoutes})`);
    } else {
      details.push(`◐ API routes: ${totalRoutes} (need ≥${testCase.minApiEndpoints})`);
    }
  } else {
    details.push(`✗ No routes file generated`);
  }

  maxScore += 1;
  const pageFiles = files.filter(f => f.path.includes('/pages/'));
  if (pageFiles.length >= 1) {
    score += 1;
    const pageSizes = pageFiles.map(f => ({ name: f.path.split('/').pop(), lines: f.content.split('\n').length }));
    details.push(`✓ Page components: ${pageFiles.length} files — ${pageSizes.map(p => `${p.name}(${p.lines}L)`).join(', ')}`);
  } else {
    details.push(`✗ No page components generated`);
  }

  maxScore += 1;
  const hasForm = allContent.includes('onSubmit') || allContent.includes('handleSubmit');
  const hasCRUD = allContent.includes('fetch(') && (allContent.includes('POST') || allContent.includes('PUT'));
  if (hasForm && hasCRUD) {
    score += 1;
    details.push(`✓ Full CRUD: Forms with submit handlers + POST/PUT fetch calls`);
  } else if (hasForm || hasCRUD) {
    details.push(`◐ Partial CRUD: form=${hasForm}, fetch=${hasCRUD}`);
  } else {
    details.push(`✗ No CRUD operations in generated code`);
  }

  return { score, maxScore, percentage: Math.round((score / maxScore) * 100), details };
}

function gradeTraceability(testCase: TestCase, plan: any, files: any[]): GradeResult {
  const details: string[] = [];
  let score = 0;
  let maxScore = 0;

  const schemaFile = files.find((f: any) => f.path.includes('schema'));
  const routesFile = files.find((f: any) => f.path.includes('routes'));
  const pageFiles = files.filter((f: any) => f.path.includes('/pages/'));
  const schemaContent = schemaFile?.content?.toLowerCase() || '';
  const routesContent = routesFile?.content?.toLowerCase() || '';
  const pageContent = pageFiles.map((f: any) => f.content.toLowerCase()).join('\n');

  for (const entity of plan.dataModel) {
    maxScore += 3;
    const entityLower = entity.name.toLowerCase();
    const tableLower = entity.tableName?.toLowerCase() || entityLower + 's';

    const inSchema = schemaContent.includes(`pgtable("${tableLower}"`) || schemaContent.includes(entityLower);
    const inRoutes = routesContent.includes(`/api/${tableLower}`) || routesContent.includes(`/api/${entityLower}`);
    const inPages = pageContent.includes(entityLower) || pageContent.includes(tableLower);

    if (inSchema) { score += 1; }
    if (inRoutes) { score += 1; }
    if (inPages) { score += 1; }

    const trail = `schema:${inSchema ? '✓' : '✗'} routes:${inRoutes ? '✓' : '✗'} pages:${inPages ? '✓' : '✗'}`;
    if (inSchema && inRoutes && inPages) {
      details.push(`✓ ${entity.name}: Full traceability — ${trail}`);
    } else if (inSchema && inRoutes) {
      details.push(`◐ ${entity.name}: In schema+routes but missing from pages — ${trail}`);
    } else if (inSchema) {
      details.push(`✗ ${entity.name}: Only in schema, missing from routes and pages — ${trail}`);
    } else {
      details.push(`✗ ${entity.name}: Not traceable — ${trail}`);
    }
  }

  return { score, maxScore, percentage: maxScore > 0 ? Math.round((score / maxScore) * 100) : 100, details };
}

function showCodeExcerpts(testCase: TestCase, files: any[], plan: any) {
  const excerpts: string[] = [];

  const schemaFile = files.find((f: any) => f.path.includes('schema'));
  if (schemaFile) {
    const lines = schemaFile.content.split('\n');
    const tableBlocks: string[] = [];
    let capturing = false;
    let blockLines: string[] = [];
    for (const line of lines) {
      if (line.includes('pgTable(')) {
        capturing = true;
        blockLines = [line.trim()];
      } else if (capturing) {
        blockLines.push(line.trim());
        if (line.includes('});')) {
          tableBlocks.push(blockLines.slice(0, 8).join('\n    '));
          capturing = false;
          if (tableBlocks.length >= plan.dataModel.length) break;
        }
      }
    }
    excerpts.push(`  📄 SCHEMA (${schemaFile.path}) — Tables: ${plan.dataModel.map((e: any) => e.name).join(', ')}:`);
    for (const block of tableBlocks.slice(0, 4)) {
      excerpts.push(`    ${block}`);
    }
  }

  const routesFile = files.find((f: any) => f.path.includes('routes'));
  if (routesFile) {
    const lines = routesFile.content.split('\n');
    const routeLines = lines.filter((l: string) =>
      l.includes('app.get(') || l.includes('app.post(') || l.includes('app.put(') || l.includes('app.delete(')
    ).slice(0, 10);
    excerpts.push(`  📄 ROUTES (${routesFile.path}):`);
    for (const line of routeLines) {
      excerpts.push(`    ${line.trim()}`);
    }
  }

  const allContent = files.map((f: any) => f.content).join('\n');

  const semanticSnippets: string[] = [];
  if (allContent.includes('Intl.NumberFormat')) {
    const match = allContent.match(/.{0,60}Intl\.NumberFormat.{0,80}/);
    if (match) semanticSnippets.push(`    💰 Currency: ${match[0].trim().slice(0, 120)}`);
  }
  if (allContent.includes('toLocaleDateString')) {
    const match = allContent.match(/.{0,40}toLocaleDateString.{0,60}/);
    if (match) semanticSnippets.push(`    📅 Date: ${match[0].trim().slice(0, 120)}`);
  }
  if (allContent.includes('type="email"')) {
    semanticSnippets.push(`    ✉️  Email input detected`);
  }
  if (allContent.includes('type="tel"')) {
    semanticSnippets.push(`    📞 Phone input detected`);
  }
  if (allContent.includes('step="0.01"')) {
    semanticSnippets.push(`    🔢 Decimal step input detected (currency precision)`);
  }
  if (allContent.includes('mailto:')) {
    semanticSnippets.push(`    🔗 Mailto link detected`);
  }

  if (semanticSnippets.length > 0) {
    excerpts.push('  📄 SEMANTIC CODE EVIDENCE:');
    excerpts.push(...semanticSnippets);
  }

  if (excerpts.length > 0) {
    console.log(excerpts.join('\n'));
  }
}

console.log('╔══════════════════════════════════════════════════════════════════════════╗');
console.log('║     END-TO-END PIPELINE QUALITY TEST — FULL PROOF OF INTELLIGENCE      ║');
console.log('╠══════════════════════════════════════════════════════════════════════════╣');
console.log('║  Tests 5 diverse apps through: Understanding → Planning → Reasoning    ║');
console.log('║  → Code Generation → Validation — grading each stage independently     ║');
console.log('╚══════════════════════════════════════════════════════════════════════════╝\n');

let totalScore = 0;
let totalMaxScore = 0;
const testResults: { name: string; grades: { stage: string; pct: number }[]; overall: number }[] = [];

for (const testCase of TEST_CASES) {
  const startTime = performance.now();
  console.log(`${'═'.repeat(74)}`);
  console.log(`  TEST: ${testCase.name}`);
  console.log(`  PROMPT: "${testCase.prompt}"`);
  console.log(`${'─'.repeat(74)}`);

  try {
    const understanding = analyzeRequest(testCase.prompt);
    const uGrade = gradeUnderstanding(testCase, understanding);
    console.log(`\n  📊 STAGE 1 — UNDERSTANDING (${uGrade.percentage}%)`);
    for (const d of uGrade.details) console.log(`    ${d}`);

    const plan = generatePlan(understanding);
    const pGrade = gradePlan(testCase, plan);
    console.log(`\n  📐 STAGE 2 — PLANNING (${pGrade.percentage}%)`);
    for (const d of pGrade.details) console.log(`    ${d}`);

    const reasoning = analyzeSemantics(plan);
    const rGrade = gradeReasoning(testCase, reasoning);
    console.log(`\n  🧠 STAGE 3 — REASONING (${rGrade.percentage}%)`);
    for (const d of rGrade.details) console.log(`    ${d}`);

    const files = generateProjectFromPlan(plan);
    const validation = validateAndFix(files);
    const finalFiles = validation.files || files;
    const cGrade = gradeCodeGen(testCase, finalFiles, validation);
    console.log(`\n  💻 STAGE 4 — CODE GENERATION (${cGrade.percentage}%)`);
    for (const d of cGrade.details) console.log(`    ${d}`);

    const tGrade = gradeTraceability(testCase, plan, finalFiles);
    console.log(`\n  🔗 STAGE 5 — TRACEABILITY (${tGrade.percentage}%)`);
    for (const d of tGrade.details) console.log(`    ${d}`);

    console.log(`\n  📝 CODE EVIDENCE:`);
    showCodeExcerpts(testCase, finalFiles, plan);

    const totalTestScore = uGrade.score + pGrade.score + rGrade.score + cGrade.score + tGrade.score;
    const totalTestMax = uGrade.maxScore + pGrade.maxScore + rGrade.maxScore + cGrade.maxScore + tGrade.maxScore;
    const overallPct = Math.round((totalTestScore / totalTestMax) * 100);
    totalScore += totalTestScore;
    totalMaxScore += totalTestMax;

    const elapsed = Math.round(performance.now() - startTime);
    console.log(`\n  ── OVERALL: ${overallPct}% (${totalTestScore}/${totalTestMax} points) — ${files.length} files in ${elapsed}ms`);

    testResults.push({
      name: testCase.name,
      grades: [
        { stage: 'Understanding', pct: uGrade.percentage },
        { stage: 'Planning', pct: pGrade.percentage },
        { stage: 'Reasoning', pct: rGrade.percentage },
        { stage: 'Code Gen', pct: cGrade.percentage },
        { stage: 'Traceability', pct: tGrade.percentage },
      ],
      overall: overallPct,
    });
  } catch (err: any) {
    console.log(`\n  ❌ CRASHED: ${err.message}`);
    testResults.push({ name: testCase.name, grades: [], overall: 0 });
  }

  console.log('');
}

console.log('╔══════════════════════════════════════════════════════════════════════════╗');
console.log('║                         FINAL SCORECARD                                ║');
console.log('╠══════════════════════════════════════════════════════════════════════════╣');

for (const r of testResults) {
  const stages = r.grades.map(g => `${g.stage}:${g.pct}%`).join(' | ');
  const bar = '█'.repeat(Math.round(r.overall / 5)) + '░'.repeat(20 - Math.round(r.overall / 5));
  console.log(`║  ${r.name.padEnd(22)} ${bar} ${String(r.overall).padStart(3)}%  ║`);
  console.log(`║    ${stages.padEnd(66)} ║`);
}

const finalPct = Math.round((totalScore / totalMaxScore) * 100);
console.log('╠══════════════════════════════════════════════════════════════════════════╣');
console.log(`║  PIPELINE QUALITY SCORE: ${finalPct}% (${totalScore}/${totalMaxScore} points across all stages)       ║`);
console.log('╚══════════════════════════════════════════════════════════════════════════╝');
