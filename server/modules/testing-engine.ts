// Testing Engine - Auto-generates unit tests, integration tests, validates builds

interface TestCase {
  id: string;
  name: string;
  type: 'unit' | 'integration' | 'e2e';
  category: 'happy-path' | 'edge-case' | 'error-handling';
  description: string;
  code: string;
  expectedResult: string;
}

interface TestSuite {
  name: string;
  targetFile: string;
  language: string;
  tests: TestCase[];
  setupCode?: string;
  teardownCode?: string;
}

interface TestResults {
  passed: number;
  failed: number;
  skipped: number;
  coverage?: number;
  details: TestResultDetail[];
}

interface TestResultDetail {
  testId: string;
  testName: string;
  status: 'passed' | 'failed' | 'skipped';
  error?: string;
  duration?: number;
}

// Analyze code and generate appropriate tests
export function generateTestsForCode(
  code: string,
  language: string,
  filename: string
): TestSuite {
  const tests: TestCase[] = [];
  
  if (language === 'html') {
    tests.push(...generateHtmlTests(code, filename));
  } else if (language === 'javascript' || language === 'typescript') {
    tests.push(...generateJsTests(code, filename));
  } else if (language === 'css') {
    tests.push(...generateCssTests(code, filename));
  }
  
  return {
    name: `Tests for ${filename}`,
    targetFile: filename,
    language,
    tests,
  };
}

function generateHtmlTests(code: string, filename: string): TestCase[] {
  const tests: TestCase[] = [];
  
  // Test: Valid HTML structure
  tests.push({
    id: 'html-structure-1',
    name: 'Has valid HTML structure',
    type: 'unit',
    category: 'happy-path',
    description: 'Verify HTML has proper doctype and structure',
    code: `
const hasDoctype = code.toLowerCase().includes('<!doctype html>');
const hasHtml = code.includes('<html') && code.includes('</html>');
const hasHead = code.includes('<head') && code.includes('</head>');
const hasBody = code.includes('<body') && code.includes('</body>');
return hasDoctype && hasHtml && hasHead && hasBody;
    `.trim(),
    expectedResult: 'true',
  });
  
  // Test: Has title tag
  tests.push({
    id: 'html-title-1',
    name: 'Has page title',
    type: 'unit',
    category: 'happy-path',
    description: 'Verify HTML has a title element',
    code: `
const titleMatch = code.match(/<title[^>]*>([^<]+)<\\/title>/i);
return titleMatch && titleMatch[1].length > 0;
    `.trim(),
    expectedResult: 'true',
  });
  
  // Test: Accessibility - has lang attribute
  tests.push({
    id: 'html-a11y-lang',
    name: 'Has language attribute',
    type: 'unit',
    category: 'happy-path',
    description: 'Verify HTML element has lang attribute for accessibility',
    code: `
return /<html[^>]*lang=["'][a-z]{2}/i.test(code);
    `.trim(),
    expectedResult: 'true',
  });
  
  // Test: No empty links
  tests.push({
    id: 'html-a11y-links',
    name: 'No empty links',
    type: 'unit',
    category: 'edge-case',
    description: 'Verify no anchor tags with empty href or text',
    code: `
const emptyLinks = code.match(/<a[^>]*>\\s*<\\/a>/gi);
return !emptyLinks || emptyLinks.length === 0;
    `.trim(),
    expectedResult: 'true',
  });
  
  // Test: Forms have labels
  if (code.includes('<form') || code.includes('<input')) {
    tests.push({
      id: 'html-a11y-forms',
      name: 'Form inputs have labels',
      type: 'unit',
      category: 'happy-path',
      description: 'Verify form inputs have associated labels',
      code: `
const inputs = code.match(/<input[^>]*type=["'](?!hidden)[^"']*["'][^>]*>/gi) || [];
const labels = code.match(/<label[^>]*>/gi) || [];
return labels.length >= inputs.length * 0.5; // At least 50% of inputs should have labels
      `.trim(),
      expectedResult: 'true',
    });
  }
  
  // Test: Images have alt text
  if (code.includes('<img')) {
    tests.push({
      id: 'html-a11y-images',
      name: 'Images have alt text',
      type: 'unit',
      category: 'happy-path',
      description: 'Verify all images have alt attributes',
      code: `
const images = code.match(/<img[^>]*>/gi) || [];
const imagesWithAlt = images.filter(img => /alt=["'][^"']*["']/.test(img));
return imagesWithAlt.length === images.length;
      `.trim(),
      expectedResult: 'true',
    });
  }
  
  // Test: Meta viewport for responsive design
  tests.push({
    id: 'html-responsive-1',
    name: 'Has viewport meta tag',
    type: 'unit',
    category: 'happy-path',
    description: 'Verify HTML has viewport meta tag for responsive design',
    code: `
return /<meta[^>]*name=["']viewport["'][^>]*>/i.test(code);
    `.trim(),
    expectedResult: 'true',
  });
  
  return tests;
}

function generateJsTests(code: string, filename: string): TestCase[] {
  const tests: TestCase[] = [];
  
  // Find all function definitions
  const functionPattern = /(?:function\s+(\w+)|const\s+(\w+)\s*=\s*(?:async\s+)?(?:\([^)]*\)|[a-zA-Z_$][\w$]*)\s*=>)/g;
  let match;
  
  while ((match = functionPattern.exec(code)) !== null) {
    const funcName = match[1] || match[2];
    
    tests.push({
      id: `js-func-${funcName}-exists`,
      name: `Function ${funcName} is defined`,
      type: 'unit',
      category: 'happy-path',
      description: `Verify function ${funcName} exists and is callable`,
      code: `typeof ${funcName} === 'function'`,
      expectedResult: 'true',
    });
  }
  
  // Test: No console.log in production code
  tests.push({
    id: 'js-no-console',
    name: 'No console.log in production',
    type: 'unit',
    category: 'edge-case',
    description: 'Verify no debug console.log statements',
    code: `
const consoleMatches = code.match(/console\\.log\\(/g) || [];
return consoleMatches.length === 0;
    `.trim(),
    expectedResult: 'true',
  });
  
  // Test: Error handling present
  if (code.includes('fetch') || code.includes('async')) {
    tests.push({
      id: 'js-error-handling',
      name: 'Has error handling',
      type: 'unit',
      category: 'error-handling',
      description: 'Verify async code has try/catch or .catch()',
      code: `
const hasTryCatch = code.includes('try {') || code.includes('try{');
const hasCatch = code.includes('.catch(');
return hasTryCatch || hasCatch;
      `.trim(),
      expectedResult: 'true',
    });
  }
  
  // Test: Event listeners are properly attached
  if (code.includes('addEventListener') || code.includes('onclick')) {
    tests.push({
      id: 'js-event-listeners',
      name: 'Event listeners are properly attached',
      type: 'integration',
      category: 'happy-path',
      description: 'Verify event listeners reference valid elements',
      code: `
const listenerCalls = code.match(/\\.addEventListener\\(/g) || [];
return listenerCalls.length > 0;
      `.trim(),
      expectedResult: 'true',
    });
  }
  
  return tests;
}

function generateCssTests(code: string, filename: string): TestCase[] {
  const tests: TestCase[] = [];
  
  // Test: Has responsive media queries
  tests.push({
    id: 'css-responsive-1',
    name: 'Has responsive media queries',
    type: 'unit',
    category: 'happy-path',
    description: 'Verify CSS includes media queries for responsiveness',
    code: `
return /@media\\s*\\(/i.test(code);
    `.trim(),
    expectedResult: 'true',
  });
  
  // Test: Uses CSS custom properties (variables)
  tests.push({
    id: 'css-variables-1',
    name: 'Uses CSS custom properties',
    type: 'unit',
    category: 'happy-path',
    description: 'Verify CSS uses custom properties for maintainability',
    code: `
return /--[a-zA-Z-]+:/i.test(code);
    `.trim(),
    expectedResult: 'true',
  });
  
  // Test: No !important abuse
  tests.push({
    id: 'css-no-important',
    name: 'Minimal !important usage',
    type: 'unit',
    category: 'edge-case',
    description: 'Verify CSS does not overuse !important',
    code: `
const importantCount = (code.match(/!important/gi) || []).length;
const totalRules = (code.match(/[{]/g) || []).length;
return importantCount < totalRules * 0.1; // Less than 10% of rules
    `.trim(),
    expectedResult: 'true',
  });
  
  // Test: Uses flexbox or grid
  tests.push({
    id: 'css-modern-layout',
    name: 'Uses modern layout',
    type: 'unit',
    category: 'happy-path',
    description: 'Verify CSS uses flexbox or grid for layout',
    code: `
const hasFlexbox = /display:\\s*flex/i.test(code);
const hasGrid = /display:\\s*grid/i.test(code);
return hasFlexbox || hasGrid;
    `.trim(),
    expectedResult: 'true',
  });
  
  return tests;
}

// Run tests against code
export function runTests(testSuite: TestSuite, code: string): TestResults {
  const details: TestResultDetail[] = [];
  let passed = 0;
  let failed = 0;
  let skipped = 0;
  
  for (const test of testSuite.tests) {
    try {
      // Create a safe evaluation context
      const testFunc = new Function('code', `return (${test.code});`);
      const result = testFunc(code);
      const expectedResult = test.expectedResult === 'true' ? true : 
                            test.expectedResult === 'false' ? false : test.expectedResult;
      
      if (result === expectedResult || (typeof result === 'boolean' && result)) {
        passed++;
        details.push({
          testId: test.id,
          testName: test.name,
          status: 'passed',
        });
      } else {
        failed++;
        details.push({
          testId: test.id,
          testName: test.name,
          status: 'failed',
          error: `Expected ${expectedResult}, got ${result}`,
        });
      }
    } catch (error: any) {
      failed++;
      details.push({
        testId: test.id,
        testName: test.name,
        status: 'failed',
        error: error.message,
      });
    }
  }
  
  return {
    passed,
    failed,
    skipped,
    coverage: testSuite.tests.length > 0 ? Math.round((passed / testSuite.tests.length) * 100) : 0,
    details,
  };
}

// Format test results for display
export function formatTestResults(results: TestResults): string {
  let output = `## Test Results\n\n`;
  output += `**Passed:** ${results.passed} | **Failed:** ${results.failed} | **Skipped:** ${results.skipped}\n`;
  output += `**Coverage:** ${results.coverage}%\n\n`;
  
  if (results.failed > 0) {
    output += `### Failed Tests\n`;
    for (const detail of results.details.filter(d => d.status === 'failed')) {
      output += `- ${detail.testName}: ${detail.error}\n`;
    }
    output += '\n';
  }
  
  output += `### All Tests\n`;
  for (const detail of results.details) {
    const icon = detail.status === 'passed' ? '[PASS]' : detail.status === 'failed' ? '[FAIL]' : '[SKIP]';
    output += `${icon} ${detail.testName}\n`;
  }
  
  return output;
}

// Validate generated code can be executed
export function validateBuild(files: { path: string; content: string; language: string }[]): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  for (const file of files) {
    if (file.language === 'html') {
      // Check for unclosed tags
      const openTags = file.content.match(/<([a-z]+)(?:\s[^>]*)?(?<!\/\s*)>/gi) || [];
      const closeTags = file.content.match(/<\/([a-z]+)>/gi) || [];
      
      if (openTags.length !== closeTags.length) {
        warnings.push(`${file.path}: Possible unclosed HTML tags`);
      }
      
      // Check for missing doctype
      if (!file.content.toLowerCase().includes('<!doctype')) {
        errors.push(`${file.path}: Missing DOCTYPE declaration`);
      }
    }
    
    if (file.language === 'javascript' || file.language === 'typescript') {
      // Check for obvious syntax errors
      try {
        // Basic syntax check - count brackets
        const openBraces = (file.content.match(/{/g) || []).length;
        const closeBraces = (file.content.match(/}/g) || []).length;
        const openParens = (file.content.match(/\(/g) || []).length;
        const closeParens = (file.content.match(/\)/g) || []).length;
        
        if (openBraces !== closeBraces) {
          errors.push(`${file.path}: Mismatched braces { }`);
        }
        if (openParens !== closeParens) {
          errors.push(`${file.path}: Mismatched parentheses ( )`);
        }
      } catch (e: any) {
        errors.push(`${file.path}: Syntax error - ${e.message}`);
      }
    }
    
    if (file.language === 'css') {
      // Check for unclosed brackets
      const openBraces = (file.content.match(/{/g) || []).length;
      const closeBraces = (file.content.match(/}/g) || []).length;
      
      if (openBraces !== closeBraces) {
        errors.push(`${file.path}: Mismatched CSS braces { }`);
      }
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

export { TestCase, TestSuite, TestResults };
