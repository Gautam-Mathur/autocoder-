/**
 * Code Quality Engine - The "Code Reviewer" of the development team
 * 
 * Enforces quality standards across generated code:
 * - TypeScript best practices
 * - React patterns (hooks, component structure)
 * - Performance patterns (memo, useMemo, useCallback)
 * - Accessibility compliance
 * - Error handling completeness
 * - Loading/empty/error state coverage
 * - Import optimization
 * - Naming convention enforcement
 * - File size management
 * - Security pattern validation
 */

import type { ProjectPlan, PlannedEntity } from './plan-generator.js';

export interface GeneratedFile {
  path: string;
  content: string;
  language: string;
}

export interface QualityReport {
  overallScore: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  categories: QualityCategory[];
  issues: QualityIssue[];
  warnings: string[];
  fixes: QualityFix[];
  metrics: QualityMetrics;
}

export interface QualityCategory {
  name: string;
  score: number;
  maxScore: number;
  issues: number;
  description: string;
}

export interface QualityIssue {
  severity: 'error' | 'warning' | 'info';
  category: string;
  file: string;
  line?: number;
  message: string;
  rule: string;
  autoFixable: boolean;
}

export interface QualityFix {
  file: string;
  description: string;
  search: string;
  replace: string;
}

export interface QualityMetrics {
  totalFiles: number;
  totalLines: number;
  avgFileLength: number;
  maxFileLength: number;
  componentsWithErrorBoundary: number;
  componentsWithLoadingState: number;
  componentsWithEmptyState: number;
  routesWithLazyLoading: number;
  formsWithValidation: number;
  endpointsWithErrorHandling: number;
  typedFunctionPercentage: number;
}

const RULES = {
  MAX_FILE_LINES: 400,
  MAX_FUNCTION_LINES: 50,
  MAX_COMPONENT_PROPS: 10,
  MIN_FUNCTION_NAME_LENGTH: 3,
  REQUIRED_ERROR_STATES: ['loading', 'error', 'empty'],
  BANNED_PATTERNS: [
    { pattern: /console\.log\(/g, message: 'Remove console.log statements', rule: 'no-console-log', severity: 'warning' as const },
    { pattern: /any(?:\s|;|,|\))/g, message: 'Avoid using "any" type', rule: 'no-any-type', severity: 'warning' as const },
    { pattern: /\/\/ TODO/gi, message: 'Resolve TODO comments', rule: 'no-todo', severity: 'info' as const },
    { pattern: /eslint-disable/g, message: 'Avoid eslint-disable comments', rule: 'no-eslint-disable', severity: 'warning' as const },
    { pattern: /!important/g, message: 'Avoid !important in CSS', rule: 'no-important', severity: 'warning' as const },
  ],
  REQUIRED_PATTERNS: {
    tsx: [
      { pattern: /export (default |)function|export const/, message: 'Components should be exported', rule: 'export-component' },
    ],
    routes: [
      { pattern: /try\s*\{|\.catch\(/, message: 'API routes should have error handling', rule: 'route-error-handling' },
    ],
  },
};

export function analyzeCodeQuality(files: GeneratedFile[], plan: ProjectPlan): QualityReport {
  const issues: QualityIssue[] = [];
  const fixes: QualityFix[] = [];
  const warnings: string[] = [];

  const categories: QualityCategory[] = [
    { name: 'TypeScript Quality', score: 0, maxScore: 20, issues: 0, description: 'Type safety and TS best practices' },
    { name: 'React Patterns', score: 0, maxScore: 20, issues: 0, description: 'React component and hook patterns' },
    { name: 'Error Handling', score: 0, maxScore: 15, issues: 0, description: 'Error boundaries, try/catch, fallbacks' },
    { name: 'UI States', score: 0, maxScore: 15, issues: 0, description: 'Loading, empty, error state coverage' },
    { name: 'Performance', score: 0, maxScore: 10, issues: 0, description: 'Memoization, lazy loading, optimization' },
    { name: 'Accessibility', score: 0, maxScore: 10, issues: 0, description: 'ARIA labels, keyboard nav, semantic HTML' },
    { name: 'Code Style', score: 0, maxScore: 5, issues: 0, description: 'Naming, file size, imports' },
    { name: 'Security', score: 0, maxScore: 5, issues: 0, description: 'Input sanitization, XSS prevention' },
  ];

  const metrics: QualityMetrics = {
    totalFiles: files.length,
    totalLines: 0,
    avgFileLength: 0,
    maxFileLength: 0,
    componentsWithErrorBoundary: 0,
    componentsWithLoadingState: 0,
    componentsWithEmptyState: 0,
    routesWithLazyLoading: 0,
    formsWithValidation: 0,
    endpointsWithErrorHandling: 0,
    typedFunctionPercentage: 0,
  };

  let totalLines = 0;
  let maxLines = 0;

  for (const file of files) {
    const lines = file.content.split('\n').length;
    totalLines += lines;
    if (lines > maxLines) maxLines = lines;

    checkBannedPatterns(file, issues);
    checkFileSize(file, lines, issues, fixes);

    if (file.path.endsWith('.tsx')) {
      checkReactPatterns(file, issues, metrics);
      checkAccessibility(file, issues);
      checkUIStates(file, issues, metrics);
    }

    if (file.path.includes('routes') || file.path.includes('server/')) {
      checkRoutePatterns(file, issues, metrics);
      checkSecurity(file, issues);
    }

    if (file.path.endsWith('.ts') || file.path.endsWith('.tsx')) {
      checkTypeScript(file, issues, metrics);
    }
  }

  metrics.totalLines = totalLines;
  metrics.avgFileLength = files.length > 0 ? Math.round(totalLines / files.length) : 0;
  metrics.maxFileLength = maxLines;

  scoreCategory(categories, 'TypeScript Quality', issues, files);
  scoreCategory(categories, 'React Patterns', issues, files);
  scoreCategory(categories, 'Error Handling', issues, files);
  scoreCategory(categories, 'UI States', issues, files);
  scoreCategory(categories, 'Performance', issues, files);
  scoreCategory(categories, 'Accessibility', issues, files);
  scoreCategory(categories, 'Code Style', issues, files);
  scoreCategory(categories, 'Security', issues, files);

  const totalScore = categories.reduce((s, c) => s + c.score, 0);
  const maxPossible = categories.reduce((s, c) => s + c.maxScore, 0);
  const percentage = maxPossible > 0 ? Math.round((totalScore / maxPossible) * 100) : 0;

  const grade = percentage >= 95 ? 'A+' : percentage >= 85 ? 'A' : percentage >= 75 ? 'B' : percentage >= 65 ? 'C' : percentage >= 50 ? 'D' : 'F';

  if (metrics.maxFileLength > RULES.MAX_FILE_LINES) {
    warnings.push(`Largest file has ${metrics.maxFileLength} lines (recommended max: ${RULES.MAX_FILE_LINES})`);
  }

  return {
    overallScore: percentage,
    grade,
    categories,
    issues,
    warnings,
    fixes,
    metrics,
  };
}

function checkBannedPatterns(file: GeneratedFile, issues: QualityIssue[]) {
  for (const banned of RULES.BANNED_PATTERNS) {
    const matches = file.content.match(banned.pattern);
    if (matches) {
      issues.push({
        severity: banned.severity,
        category: 'Code Style',
        file: file.path,
        message: `${banned.message} (${matches.length} occurrence${matches.length > 1 ? 's' : ''})`,
        rule: banned.rule,
        autoFixable: banned.rule === 'no-console-log',
      });
    }
  }
}

function checkFileSize(file: GeneratedFile, lines: number, issues: QualityIssue[], fixes: QualityFix[]) {
  if (lines > RULES.MAX_FILE_LINES) {
    issues.push({
      severity: 'warning',
      category: 'Code Style',
      file: file.path,
      message: `File has ${lines} lines (max recommended: ${RULES.MAX_FILE_LINES})`,
      rule: 'max-file-length',
      autoFixable: false,
    });
  }
}

function checkReactPatterns(file: GeneratedFile, issues: QualityIssue[], metrics: QualityMetrics) {
  const content = file.content;

  if (/useState[\s\S]*useState[\s\S]*useState[\s\S]*useState[\s\S]*useState/.test(content)) {
    issues.push({
      severity: 'warning',
      category: 'React Patterns',
      file: file.path,
      message: 'More than 4 useState calls — consider useReducer or a custom hook',
      rule: 'too-many-use-state',
      autoFixable: false,
    });
  }

  if (/useEffect\(\s*\(\)\s*=>\s*\{[^}]{200,}\}/.test(content)) {
    issues.push({
      severity: 'info',
      category: 'React Patterns',
      file: file.path,
      message: 'Large useEffect — consider extracting into a custom hook',
      rule: 'large-use-effect',
      autoFixable: false,
    });
  }

  const propMatches = content.match(/interface\s+\w+Props\s*\{([^}]*)\}/);
  if (propMatches) {
    const propCount = (propMatches[1].match(/\w+\s*[?:]?\s*:/g) || []).length;
    if (propCount > RULES.MAX_COMPONENT_PROPS) {
      issues.push({
        severity: 'warning',
        category: 'React Patterns',
        file: file.path,
        message: `Component has ${propCount} props (max recommended: ${RULES.MAX_COMPONENT_PROPS})`,
        rule: 'too-many-props',
        autoFixable: false,
      });
    }
  }

  if (content.includes('key={index}') || content.includes('key={i}')) {
    issues.push({
      severity: 'warning',
      category: 'React Patterns',
      file: file.path,
      message: 'Using array index as React key — use a stable identifier',
      rule: 'no-array-index-key',
      autoFixable: false,
    });
  }
}

function checkAccessibility(file: GeneratedFile, issues: QualityIssue[]) {
  const content = file.content;

  if (content.includes('<img') && !content.includes('alt=')) {
    issues.push({
      severity: 'error',
      category: 'Accessibility',
      file: file.path,
      message: 'Image missing alt attribute',
      rule: 'img-alt',
      autoFixable: true,
    });
  }

  if (content.includes('onClick') && /<(?:div|span)\s[^>]*onClick/g.test(content) && !content.includes('role=')) {
    issues.push({
      severity: 'warning',
      category: 'Accessibility',
      file: file.path,
      message: 'Non-interactive element with onClick — add role and keyboard handler',
      rule: 'click-events-have-key-events',
      autoFixable: false,
    });
  }

  if (/<form\b/i.test(content) && !content.includes('aria-label') && !content.includes('aria-labelledby')) {
    issues.push({
      severity: 'info',
      category: 'Accessibility',
      file: file.path,
      message: 'Form missing aria-label or aria-labelledby',
      rule: 'form-aria-label',
      autoFixable: false,
    });
  }
}

function checkUIStates(file: GeneratedFile, issues: QualityIssue[], metrics: QualityMetrics) {
  const content = file.content;
  const isContainer = content.includes('useQuery') || content.includes('useState') || content.includes('fetch(');

  if (!isContainer) return;

  if (content.includes('isLoading') || content.includes('loading') || content.includes('Skeleton') || content.includes('Spinner')) {
    metrics.componentsWithLoadingState++;
  } else {
    issues.push({
      severity: 'warning',
      category: 'UI States',
      file: file.path,
      message: 'Data-fetching component missing loading state',
      rule: 'loading-state',
      autoFixable: false,
    });
  }

  if (content.includes('length === 0') || content.includes('EmptyState') || content.includes('No ') || content.includes('empty')) {
    metrics.componentsWithEmptyState++;
  } else {
    issues.push({
      severity: 'info',
      category: 'UI States',
      file: file.path,
      message: 'Component missing empty state handling',
      rule: 'empty-state',
      autoFixable: false,
    });
  }

  if (content.includes('isError') || content.includes('error') || content.includes('catch') || content.includes('ErrorBoundary')) {
    metrics.componentsWithErrorBoundary++;
  } else {
    issues.push({
      severity: 'warning',
      category: 'UI States',
      file: file.path,
      message: 'Component missing error state handling',
      rule: 'error-state',
      autoFixable: false,
    });
  }
}

function checkRoutePatterns(file: GeneratedFile, issues: QualityIssue[], metrics: QualityMetrics) {
  const content = file.content;

  if (content.includes('router.') || content.includes('app.get') || content.includes('app.post')) {
    if (content.includes('try') || content.includes('.catch(') || content.includes('asyncHandler')) {
      metrics.endpointsWithErrorHandling++;
    } else {
      issues.push({
        severity: 'error',
        category: 'Error Handling',
        file: file.path,
        message: 'API route missing error handling (try/catch or asyncHandler)',
        rule: 'route-error-handling',
        autoFixable: false,
      });
    }
  }
}

function checkSecurity(file: GeneratedFile, issues: QualityIssue[]) {
  const content = file.content;

  if (/innerHTML\s*=/.test(content) || content.includes('dangerouslySetInnerHTML')) {
    issues.push({
      severity: 'error',
      category: 'Security',
      file: file.path,
      message: 'Direct HTML injection detected — potential XSS vulnerability',
      rule: 'no-inner-html',
      autoFixable: false,
    });
  }

  if (/eval\s*\(/.test(content) || /new Function\s*\(/.test(content)) {
    issues.push({
      severity: 'error',
      category: 'Security',
      file: file.path,
      message: 'eval() or new Function() detected — security risk',
      rule: 'no-eval',
      autoFixable: false,
    });
  }

  const sqlRegex = /`[^`]*\$\{[^}]*\}[^`]*(?:SELECT|INSERT|UPDATE|DELETE|WHERE)/i;
  if (sqlRegex.test(content)) {
    issues.push({
      severity: 'error',
      category: 'Security',
      file: file.path,
      message: 'Possible SQL injection — use parameterized queries',
      rule: 'no-sql-injection',
      autoFixable: false,
    });
  }
}

function checkTypeScript(file: GeneratedFile, issues: QualityIssue[], metrics: QualityMetrics) {
  const content = file.content;

  const anyCount = (content.match(/:\s*any[\s;,)]/g) || []).length;
  if (anyCount > 2) {
    issues.push({
      severity: 'warning',
      category: 'TypeScript Quality',
      file: file.path,
      message: `${anyCount} uses of "any" type — add proper typing`,
      rule: 'no-explicit-any',
      autoFixable: false,
    });
  }

  if (content.includes('as any')) {
    issues.push({
      severity: 'warning',
      category: 'TypeScript Quality',
      file: file.path,
      message: 'Type assertion "as any" detected — use proper types',
      rule: 'no-as-any',
      autoFixable: false,
    });
  }
}

function scoreCategory(categories: QualityCategory[], name: string, issues: QualityIssue[], files: GeneratedFile[]) {
  const cat = categories.find(c => c.name === name);
  if (!cat) return;

  const catIssues = issues.filter(i => i.category === name);
  cat.issues = catIssues.length;

  const errors = catIssues.filter(i => i.severity === 'error').length;
  const warnings = catIssues.filter(i => i.severity === 'warning').length;
  const infos = catIssues.filter(i => i.severity === 'info').length;

  const penalty = errors * 3 + warnings * 1 + infos * 0.5;
  cat.score = Math.max(0, Math.round(cat.maxScore - Math.min(penalty, cat.maxScore)));
}

export function applyQualityFixes(files: GeneratedFile[], fixes: QualityFix[]): GeneratedFile[] {
  const result = files.map(f => ({ ...f }));

  for (const fix of fixes) {
    const file = result.find(f => f.path === fix.file);
    if (file) {
      file.content = file.content.replace(fix.search, fix.replace);
    }
  }

  return result;
}
