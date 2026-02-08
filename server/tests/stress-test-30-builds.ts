import { analyzeRequest } from '../modules/deep-understanding-engine.js';
import { generatePlan } from '../modules/plan-generator.js';
import { analyzeSemantics, type ReasoningResult } from '../modules/contextual-reasoning-engine.js';
import { generateProjectFromPlan } from '../modules/plan-driven-generator.js';
import { validateAndFix } from '../modules/post-generation-validator.js';
import { GenerationLearningEngine } from '../modules/generation-learning-engine.js';

interface PromptEntry {
  id: number;
  category: string;
  prompt: string;
  minEntities: number;
  minPages: number;
  expectRelationships: boolean;
  expectSemantics: boolean;
}

const PROMPTS: PromptEntry[] = [
  { id: 1, category: 'Simple', prompt: 'Build a calculator app with basic math operations', minEntities: 1, minPages: 1, expectRelationships: false, expectSemantics: false },
  { id: 2, category: 'Simple', prompt: 'Create a unit converter for length, weight, and temperature', minEntities: 1, minPages: 1, expectRelationships: false, expectSemantics: false },
  { id: 3, category: 'Simple', prompt: 'Build a password generator with customizable length and character types', minEntities: 1, minPages: 1, expectRelationships: false, expectSemantics: false },
  { id: 4, category: 'Simple', prompt: 'Create a color palette picker that generates harmonious color schemes', minEntities: 1, minPages: 1, expectRelationships: false, expectSemantics: false },
  { id: 5, category: 'Simple', prompt: 'Build a countdown timer app for tracking multiple events', minEntities: 1, minPages: 1, expectRelationships: false, expectSemantics: true },
  { id: 6, category: 'Simple', prompt: 'Create a markdown editor with live preview', minEntities: 1, minPages: 1, expectRelationships: false, expectSemantics: false },
  { id: 7, category: 'Simple', prompt: 'Build a flashcard app for studying with spaced repetition', minEntities: 1, minPages: 1, expectRelationships: false, expectSemantics: false },
  { id: 8, category: 'Simple', prompt: 'Create a habit tracker where users check off daily habits', minEntities: 1, minPages: 1, expectRelationships: false, expectSemantics: true },
  { id: 9, category: 'Simple', prompt: 'Build a BMI calculator with health recommendations', minEntities: 1, minPages: 1, expectRelationships: false, expectSemantics: false },
  { id: 10, category: 'Simple', prompt: 'Create a tip calculator that splits bills between people', minEntities: 1, minPages: 1, expectRelationships: false, expectSemantics: true },

  { id: 11, category: 'Medium', prompt: 'Build a recipe manager where users can save recipes with ingredients, steps, cooking time, and categories. Include a shopping list generator.', minEntities: 2, minPages: 2, expectRelationships: true, expectSemantics: true },
  { id: 12, category: 'Medium', prompt: 'Create a personal budget tracker with income and expense categories, monthly summaries, and spending charts.', minEntities: 2, minPages: 2, expectRelationships: false, expectSemantics: true },
  { id: 13, category: 'Medium', prompt: 'Build an employee directory with departments, roles, contact info, and an org chart view.', minEntities: 2, minPages: 2, expectRelationships: true, expectSemantics: true },
  { id: 14, category: 'Medium', prompt: 'Create an event planner that manages events with venues, attendees, schedules, and RSVPs.', minEntities: 2, minPages: 2, expectRelationships: true, expectSemantics: true },
  { id: 15, category: 'Medium', prompt: 'Build a quiz builder where users create quizzes with multiple question types and track scores.', minEntities: 2, minPages: 2, expectRelationships: true, expectSemantics: false },
  { id: 16, category: 'Medium', prompt: 'Create an invoice generator with clients, line items, tax calculation, and payment status tracking.', minEntities: 2, minPages: 2, expectRelationships: true, expectSemantics: true },
  { id: 17, category: 'Medium', prompt: 'Build a workout logger that tracks exercises, sets, reps, weight, and shows progress over time.', minEntities: 2, minPages: 2, expectRelationships: true, expectSemantics: true },
  { id: 18, category: 'Medium', prompt: 'Create a reading list tracker with books, authors, genres, ratings, and reading progress.', minEntities: 2, minPages: 2, expectRelationships: false, expectSemantics: true },
  { id: 19, category: 'Medium', prompt: 'Build a project board with tasks, assignees, due dates, priorities, and kanban columns.', minEntities: 2, minPages: 2, expectRelationships: true, expectSemantics: true },
  { id: 20, category: 'Medium', prompt: 'Create a contact manager with groups, tags, notes, and communication history.', minEntities: 2, minPages: 2, expectRelationships: true, expectSemantics: true },

  { id: 21, category: 'Complex', prompt: 'Build a veterinary clinic management system with patients (animals), owners, appointments, medical records, vaccinations, prescriptions, and billing.', minEntities: 3, minPages: 3, expectRelationships: true, expectSemantics: true },
  { id: 22, category: 'Complex', prompt: 'Create a music school management system with students, teachers, instruments, lesson schedules, practice logs, recitals, and tuition payments.', minEntities: 3, minPages: 3, expectRelationships: true, expectSemantics: true },
  { id: 23, category: 'Complex', prompt: 'Build a food truck fleet tracker with trucks, locations, menus, daily sales, inventory, routes, and event bookings.', minEntities: 3, minPages: 3, expectRelationships: true, expectSemantics: true },
  { id: 24, category: 'Complex', prompt: 'Create a coworking space manager with desks, meeting rooms, members, bookings, access passes, and monthly invoicing.', minEntities: 3, minPages: 3, expectRelationships: true, expectSemantics: true },
  { id: 25, category: 'Complex', prompt: 'Build a wedding planner app with couples, vendors, venues, budgets, guest lists, seating charts, and timeline management.', minEntities: 3, minPages: 3, expectRelationships: true, expectSemantics: true },
  { id: 26, category: 'Complex', prompt: 'Create a plant nursery inventory system with plants, species, growing zones, suppliers, sales orders, and care schedules.', minEntities: 3, minPages: 3, expectRelationships: true, expectSemantics: true },
  { id: 27, category: 'Complex', prompt: 'Build an escape room booking system with rooms, themes, difficulty levels, time slots, team bookings, scores, and staff schedules.', minEntities: 3, minPages: 3, expectRelationships: true, expectSemantics: true },
  { id: 28, category: 'Complex', prompt: 'Create a podcast production tracker with shows, episodes, guests, recording schedules, editing status, publishing dates, and analytics.', minEntities: 3, minPages: 3, expectRelationships: true, expectSemantics: true },
  { id: 29, category: 'Complex', prompt: 'Build a freelancer portfolio and invoicing platform with projects, clients, time tracking, invoices, payments, and a public portfolio page.', minEntities: 3, minPages: 3, expectRelationships: true, expectSemantics: true },
  { id: 30, category: 'Complex', prompt: 'Create a community garden coordinator with plots, gardeners, planting schedules, harvest logs, shared tools, and water usage tracking.', minEntities: 3, minPages: 3, expectRelationships: true, expectSemantics: true },
];

interface QualityCheck {
  name: string;
  passed: boolean;
  detail: string;
}

interface BuildResult {
  id: number;
  category: string;
  prompt: string;
  success: boolean;
  domain: string;
  confidence: number;
  entityCount: number;
  entities: string[];
  pageCount: number;
  apiEndpointCount: number;
  workflowCount: number;
  kpiCount: number;
  fileCount: number;
  validationPassed: boolean;
  validationIssues: number;
  autoFixesApplied: number;
  hasSemanticFormatting: boolean;
  hasRelationships: boolean;
  hasAdvancedUI: boolean;
  generationTimeMs: number;
  qualityChecks: QualityCheck[];
  qualityScore: number;
  error?: string;
}

function runBuild(entry: PromptEntry): BuildResult {
  const startTime = performance.now();
  const result: BuildResult = {
    id: entry.id,
    category: entry.category,
    prompt: entry.prompt,
    success: false,
    domain: '',
    confidence: 0,
    entityCount: 0,
    entities: [],
    pageCount: 0,
    apiEndpointCount: 0,
    workflowCount: 0,
    kpiCount: 0,
    fileCount: 0,
    validationPassed: false,
    validationIssues: 0,
    autoFixesApplied: 0,
    hasSemanticFormatting: false,
    hasRelationships: false,
    hasAdvancedUI: false,
    generationTimeMs: 0,
    qualityChecks: [],
    qualityScore: 0,
  };

  try {
    const understanding = analyzeRequest(entry.prompt);
    result.domain = understanding.level2_domain.primaryDomain?.name || 'generic';
    result.confidence = Math.round((understanding.level2_domain.confidence || 0) * 100);
    result.entityCount = understanding.level3_entities.domainEntities.length;
    result.entities = understanding.level3_entities.domainEntities.map((e: any) => e.name);

    const plan = generatePlan(understanding);
    result.pageCount = plan.pages.length;
    result.apiEndpointCount = plan.apiEndpoints.length;
    result.workflowCount = plan.workflows.length;
    result.kpiCount = plan.kpis.length;

    const reasoning = analyzeSemantics(plan);
    result.hasRelationships = reasoning.relationships.length > 0;
    const patternTypes = reasoning.uiPatterns.map((p: any) => p.pattern);
    result.hasAdvancedUI = patternTypes.some((p: string) =>
      ['kanban', 'calendar', 'card-grid', 'master-detail', 'form-wizard', 'timeline'].includes(p)
    );

    const files = generateProjectFromPlan(plan);
    result.fileCount = files.length;

    const allContent = files.map(f => f.content).join('\n');
    result.hasSemanticFormatting =
      allContent.includes('Intl.NumberFormat') ||
      allContent.includes('toLocaleDateString') ||
      allContent.includes('type="email"') ||
      allContent.includes('type="date"') ||
      allContent.includes('step="0.01"') ||
      allContent.includes('mailto:');

    const validation = validateAndFix(files);
    result.validationPassed = validation.valid;
    result.validationIssues = validation.issues?.length || 0;
    result.autoFixesApplied = validation.fixesApplied?.length || 0;

    const checks: QualityCheck[] = [];

    checks.push({
      name: 'Min files generated',
      passed: files.length >= 10,
      detail: `${files.length} files (need ≥10)`,
    });

    checks.push({
      name: 'Entity extraction',
      passed: result.entityCount >= entry.minEntities,
      detail: `${result.entityCount} entities (need ≥${entry.minEntities}): ${result.entities.join(', ')}`,
    });

    checks.push({
      name: 'Page generation',
      passed: result.pageCount >= entry.minPages,
      detail: `${result.pageCount} pages (need ≥${entry.minPages})`,
    });

    checks.push({
      name: 'Validation passes',
      passed: validation.valid,
      detail: validation.valid ? 'Clean' : `${validation.issues?.length || 0} issues remaining`,
    });

    checks.push({
      name: 'Has API endpoints',
      passed: result.apiEndpointCount >= 1,
      detail: `${result.apiEndpointCount} endpoints`,
    });

    if (entry.expectRelationships) {
      checks.push({
        name: 'Relationships detected',
        passed: result.hasRelationships,
        detail: result.hasRelationships ? `${reasoning.relationships.length} relationships` : 'None found',
      });
    }

    if (entry.expectSemantics) {
      checks.push({
        name: 'Semantic formatting',
        passed: result.hasSemanticFormatting,
        detail: result.hasSemanticFormatting ? 'Present' : 'Missing (no currency/date/email formatting)',
      });
    }

    const hasDashboard = plan.pages.some((p: any) => p.type === 'dashboard' || p.title?.toLowerCase().includes('dashboard'));
    checks.push({
      name: 'Dashboard page',
      passed: hasDashboard,
      detail: hasDashboard ? 'Present' : 'Missing',
    });

    const hasSchemaFile = files.some(f => f.path.includes('schema'));
    const hasRoutesFile = files.some(f => f.path.includes('routes'));
    const hasAppFile = files.some(f => f.path.includes('App.tsx') || f.path.includes('App.jsx'));
    checks.push({
      name: 'Core files present',
      passed: hasSchemaFile && hasRoutesFile && hasAppFile,
      detail: `schema:${hasSchemaFile ? '✓' : '✗'} routes:${hasRoutesFile ? '✓' : '✗'} App:${hasAppFile ? '✓' : '✗'}`,
    });

    if (entry.category === 'Complex') {
      checks.push({
        name: 'Data model depth',
        passed: plan.dataModel.length >= 3,
        detail: `${plan.dataModel.length} tables in data model`,
      });
    }

    result.qualityChecks = checks;
    const passedChecks = checks.filter(c => c.passed).length;
    result.qualityScore = Math.round((passedChecks / checks.length) * 100);
    result.success = checks.filter(c => ['Min files generated', 'Validation passes', 'Core files present'].includes(c.name)).every(c => c.passed);
  } catch (err: any) {
    result.error = err.message?.slice(0, 200);
    result.qualityChecks = [{ name: 'No crash', passed: false, detail: `Exception: ${result.error}` }];
    result.qualityScore = 0;
  }

  result.generationTimeMs = Math.round(performance.now() - startTime);
  return result;
}

console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║       30-BUILD STRESS TEST — FULL PIPELINE + QUALITY       ║');
console.log('╚══════════════════════════════════════════════════════════════╝\n');

const allResults: BuildResult[] = [];
const totalStart = performance.now();

for (const entry of PROMPTS) {
  const label = `[${entry.id}/30] ${entry.category}`;
  process.stdout.write(`${label}: ${entry.prompt.slice(0, 55)}...  `);

  const result = runBuild(entry);
  allResults.push(result);

  const status = result.success ? '✅' : '❌';
  const qScore = `Q:${result.qualityScore}%`;
  const details = `${result.fileCount} files, ${result.entityCount} ents, ${result.pageCount} pgs, ${qScore}, ${result.generationTimeMs}ms`;
  console.log(`${status} ${details}`);
}

const totalTime = Math.round(performance.now() - totalStart);

console.log('\n╔══════════════════════════════════════════════════════════════╗');
console.log('║                      RESULTS SUMMARY                       ║');
console.log('╚══════════════════════════════════════════════════════════════╝\n');

const passed = allResults.filter(r => r.success);
const failed = allResults.filter(r => !r.success);
const avgQuality = Math.round(allResults.reduce((s, r) => s + r.qualityScore, 0) / allResults.length);

console.log(`Total builds:         ${allResults.length}`);
console.log(`Passed (core):        ${passed.length} (${Math.round(passed.length / allResults.length * 100)}%)`);
console.log(`Failed:               ${failed.length}`);
console.log(`Avg quality score:    ${avgQuality}%`);
console.log(`Total time:           ${(totalTime / 1000).toFixed(1)}s`);
console.log(`Avg time per build:   ${Math.round(totalTime / allResults.length)}ms`);
console.log('');

const byCategory = ['Simple', 'Medium', 'Complex'];
for (const cat of byCategory) {
  const catResults = allResults.filter(r => r.category === cat);
  const catPassed = catResults.filter(r => r.success);
  const avgFiles = Math.round(catResults.reduce((s, r) => s + r.fileCount, 0) / catResults.length);
  const avgEntities = (catResults.reduce((s, r) => s + r.entityCount, 0) / catResults.length).toFixed(1);
  const avgPages = (catResults.reduce((s, r) => s + r.pageCount, 0) / catResults.length).toFixed(1);
  const avgTime = Math.round(catResults.reduce((s, r) => s + r.generationTimeMs, 0) / catResults.length);
  const catAvgQ = Math.round(catResults.reduce((s, r) => s + r.qualityScore, 0) / catResults.length);
  const semanticCount = catResults.filter(r => r.hasSemanticFormatting).length;
  const relationCount = catResults.filter(r => r.hasRelationships).length;
  const advancedUICount = catResults.filter(r => r.hasAdvancedUI).length;
  const validCount = catResults.filter(r => r.validationPassed).length;

  console.log(`── ${cat} (${catResults.length} builds) ──────────────────────`);
  console.log(`  Pass rate:          ${catPassed.length}/${catResults.length} (${Math.round(catPassed.length / catResults.length * 100)}%)`);
  console.log(`  Avg quality:        ${catAvgQ}%`);
  console.log(`  Avg files:          ${avgFiles}`);
  console.log(`  Avg entities:       ${avgEntities}`);
  console.log(`  Avg pages:          ${avgPages}`);
  console.log(`  Avg gen time:       ${avgTime}ms`);
  console.log(`  Semantic formatting: ${semanticCount}/${catResults.length}`);
  console.log(`  Relationships:      ${relationCount}/${catResults.length}`);
  console.log(`  Advanced UI:        ${advancedUICount}/${catResults.length}`);
  console.log(`  Validation passed:  ${validCount}/${catResults.length}`);
  console.log('');
}

const allQualityIssues: { id: number; check: string; detail: string }[] = [];
for (const r of allResults) {
  for (const c of r.qualityChecks) {
    if (!c.passed) {
      allQualityIssues.push({ id: r.id, check: c.name, detail: c.detail });
    }
  }
}

if (allQualityIssues.length > 0) {
  console.log('── QUALITY ISSUES ─────────────────────────────────');
  for (const issue of allQualityIssues) {
    console.log(`  #${String(issue.id).padStart(2)} ⚠ ${issue.check}: ${issue.detail}`);
  }
  console.log('');
}

if (failed.length > 0) {
  console.log('── CRITICAL FAILURES ──────────────────────────────');
  for (const f of failed) {
    console.log(`  #${f.id} [${f.category}] ${f.prompt.slice(0, 60)}`);
    console.log(`     Error: ${f.error || 'Core checks failed'}`);
    const failedChecks = f.qualityChecks.filter(c => !c.passed);
    for (const fc of failedChecks) {
      console.log(`     ✗ ${fc.name}: ${fc.detail}`);
    }
  }
  console.log('');
}

console.log('── DETAILED RESULTS TABLE ─────────────────────────');
console.log('ID | Cat     | Domain              | Conf | Ents | Pages | APIs | Files | Valid | Q%  | Sem | Rel | UI  | Time');
console.log('---|---------|---------------------|------|------|-------|------|-------|-------|-----|-----|-----|-----|-----');
for (const r of allResults) {
  const st = r.success ? '✓' : '✗';
  const dom = (r.domain || 'unknown').slice(0, 19).padEnd(19);
  const conf = String(r.confidence).padStart(3) + '%';
  const ents = String(r.entityCount).padStart(4);
  const pages = String(r.pageCount).padStart(5);
  const apis = String(r.apiEndpointCount).padStart(4);
  const files = String(r.fileCount).padStart(5);
  const valid = r.validationPassed ? '  ✓  ' : `  ✗${r.validationIssues}`;
  const qual = String(r.qualityScore).padStart(3) + '%';
  const sem = r.hasSemanticFormatting ? ' ✓  ' : ' ✗  ';
  const rel = r.hasRelationships ? ' ✓  ' : ' ✗  ';
  const ui = r.hasAdvancedUI ? ' ✓  ' : ' ✗  ';
  const time = String(r.generationTimeMs).padStart(4) + 'ms';
  console.log(`${st}${String(r.id).padStart(2)} | ${r.category.padEnd(7)} | ${dom} | ${conf} | ${ents} | ${pages} | ${apis} | ${files} | ${valid} | ${qual}| ${sem}| ${rel}| ${ui}| ${time}`);
}

console.log(`\n══════════════════════════════════════════════════════════════`);
console.log(`  FINAL: ${passed.length}/30 passed, avg quality ${avgQuality}%`);
console.log(`  Quality issues: ${allQualityIssues.length} across all builds`);
console.log(`══════════════════════════════════════════════════════════════`);

if (failed.length > 0) {
  process.exit(1);
}
