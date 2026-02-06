// Security Module - Input validation, auth guards, vulnerability scanning, security warnings

interface SecurityIssue {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  category: 'xss' | 'injection' | 'auth' | 'config' | 'dependency' | 'exposure' | 'validation';
  title: string;
  description: string;
  location?: string;
  recommendation: string;
  cweId?: string;
}

interface SecurityScanResult {
  score: number; // 0-100
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  issues: SecurityIssue[];
  passedChecks: string[];
  timestamp: Date;
}

// Security patterns to detect
const SECURITY_PATTERNS = {
  // XSS vulnerabilities
  dangerousHtml: {
    pattern: /innerHTML\s*=|document\.write\s*\(|\.html\s*\(/gi,
    severity: 'high' as const,
    category: 'xss' as const,
    title: 'Potential XSS vulnerability',
    description: 'Direct HTML manipulation without sanitization can lead to XSS attacks',
    recommendation: 'Use textContent instead, or sanitize HTML with a library like DOMPurify',
    cweId: 'CWE-79',
  },
  evalUsage: {
    pattern: /\beval\s*\(|new\s+Function\s*\(/gi,
    severity: 'critical' as const,
    category: 'injection' as const,
    title: 'Dangerous eval() usage',
    description: 'eval() and Function constructor can execute arbitrary code',
    recommendation: 'Avoid eval() completely. Use JSON.parse() for JSON data or safer alternatives',
    cweId: 'CWE-94',
  },
  
  // SQL Injection
  sqlConcatenation: {
    pattern: /(?:SELECT|INSERT|UPDATE|DELETE|WHERE).*\+\s*(?:req\.|params\.|body\.)/gi,
    severity: 'critical' as const,
    category: 'injection' as const,
    title: 'Potential SQL injection',
    description: 'String concatenation in SQL queries allows injection attacks',
    recommendation: 'Use parameterized queries or an ORM like Drizzle',
    cweId: 'CWE-89',
  },
  
  // Authentication issues
  hardcodedCredentials: {
    pattern: /(?:password|secret|api_?key|token)\s*[:=]\s*["'][^"']{3,}["']/gi,
    severity: 'critical' as const,
    category: 'exposure' as const,
    title: 'Hardcoded credentials detected',
    description: 'Sensitive credentials should not be hardcoded in source code',
    recommendation: 'Use environment variables for secrets: process.env.SECRET_NAME',
    cweId: 'CWE-798',
  },
  weakPasswordCheck: {
    pattern: /password\.length\s*[<>]=?\s*[0-5]\b/gi,
    severity: 'medium' as const,
    category: 'auth' as const,
    title: 'Weak password policy',
    description: 'Password requirements are too lenient',
    recommendation: 'Require at least 8 characters with mixed case, numbers, and symbols',
    cweId: 'CWE-521',
  },
  
  // Configuration issues
  corsWildcard: {
    pattern: /cors\s*\(\s*\{[^}]*origin\s*:\s*['"]\*['"]/gi,
    severity: 'medium' as const,
    category: 'config' as const,
    title: 'CORS allows all origins',
    description: 'Wildcard CORS origin can expose API to any website',
    recommendation: 'Restrict CORS to specific trusted origins',
    cweId: 'CWE-942',
  },
  debugMode: {
    pattern: /(?:debug|DEBUG)\s*[:=]\s*(?:true|1)/gi,
    severity: 'low' as const,
    category: 'config' as const,
    title: 'Debug mode enabled',
    description: 'Debug mode should be disabled in production',
    recommendation: 'Ensure debug mode is off: DEBUG=false or remove debug flags',
    cweId: 'CWE-489',
  },
  
  // Input validation
  noInputValidation: {
    pattern: /req\.(?:body|params|query)\.\w+(?!\s*\?\?|\s*\|\||\s*&&|\.trim|\.toLowerCase)/gi,
    severity: 'medium' as const,
    category: 'validation' as const,
    title: 'Input used without validation',
    description: 'User input should be validated before use',
    recommendation: 'Validate all inputs using a library like Zod or Joi',
    cweId: 'CWE-20',
  },
  
  // Exposure risks
  consoleLogSecrets: {
    pattern: /console\.\w+\s*\([^)]*(?:password|secret|token|key|auth)/gi,
    severity: 'high' as const,
    category: 'exposure' as const,
    title: 'Potential secret exposure in logs',
    description: 'Logging sensitive data can expose secrets',
    recommendation: 'Never log passwords, tokens, or API keys',
    cweId: 'CWE-532',
  },
  
  // HTTP Security
  httpInsecure: {
    pattern: /http:\/\/(?!localhost|127\.0\.0\.1)/gi,
    severity: 'medium' as const,
    category: 'config' as const,
    title: 'Insecure HTTP URL',
    description: 'Using HTTP instead of HTTPS exposes data in transit',
    recommendation: 'Use HTTPS for all external URLs',
    cweId: 'CWE-319',
  },
};

// Positive security patterns to check for
const SECURITY_BEST_PRACTICES = [
  { pattern: /helmet\s*\(/i, name: 'Uses Helmet for HTTP security headers' },
  { pattern: /csrf|csrfToken/i, name: 'CSRF protection implemented' },
  { pattern: /rateLimit|rate-limit/i, name: 'Rate limiting configured' },
  { pattern: /bcrypt|argon2|scrypt/i, name: 'Secure password hashing' },
  { pattern: /sanitize|DOMPurify|xss/i, name: 'Input sanitization in place' },
  { pattern: /zod|joi|yup|validator/i, name: 'Schema validation library used' },
  { pattern: /https:/i, name: 'Uses HTTPS URLs' },
  { pattern: /Content-Security-Policy|csp/i, name: 'CSP headers configured' },
  { pattern: /httpOnly|HttpOnly/i, name: 'HTTP-only cookies' },
  { pattern: /secure:\s*true/i, name: 'Secure cookie flag' },
];

// Scan code for security issues
export function scanForVulnerabilities(
  files: { path: string; content: string; language: string }[]
): SecurityScanResult {
  const issues: SecurityIssue[] = [];
  const passedChecks: string[] = [];
  
  // Combine all code for pattern matching
  const allCode = files.map(f => f.content).join('\n');
  
  // Check for security issues
  for (const [key, check] of Object.entries(SECURITY_PATTERNS)) {
    const matches = allCode.match(check.pattern);
    if (matches && matches.length > 0) {
      // Find which file contains the issue
      let location = 'Multiple files';
      for (const file of files) {
        if (check.pattern.test(file.content)) {
          location = file.path;
          break;
        }
      }
      
      issues.push({
        id: `sec-${key}`,
        severity: check.severity,
        category: check.category,
        title: check.title,
        description: check.description,
        location,
        recommendation: check.recommendation,
        cweId: check.cweId,
      });
    }
  }
  
  // Check for best practices
  for (const practice of SECURITY_BEST_PRACTICES) {
    if (practice.pattern.test(allCode)) {
      passedChecks.push(practice.name);
    }
  }
  
  // Calculate security score
  const score = calculateSecurityScore(issues, passedChecks);
  const grade = scoreToGrade(score);
  
  return {
    score,
    grade,
    issues,
    passedChecks,
    timestamp: new Date(),
  };
}

function calculateSecurityScore(issues: SecurityIssue[], passedChecks: string[]): number {
  let score = 100;
  
  // Deduct points for issues
  for (const issue of issues) {
    switch (issue.severity) {
      case 'critical': score -= 25; break;
      case 'high': score -= 15; break;
      case 'medium': score -= 10; break;
      case 'low': score -= 5; break;
      case 'info': score -= 2; break;
    }
  }
  
  // Bonus for best practices (up to 20 points back)
  score += Math.min(passedChecks.length * 3, 20);
  
  return Math.max(0, Math.min(100, score));
}

function scoreToGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

// Generate security recommendations for a project type
export function getSecurityRecommendations(projectType: string): string[] {
  const base = [
    'Validate all user inputs using a schema validation library',
    'Use HTTPS for all external communications',
    'Implement proper error handling that does not expose sensitive info',
    'Store secrets in environment variables, never in code',
    'Keep all dependencies up to date',
  ];
  
  if (projectType === 'webapp' || projectType === 'saas' || projectType === 'dashboard') {
    base.push(
      'Implement authentication with secure password hashing (bcrypt/argon2)',
      'Use HTTP-only, secure cookies for session management',
      'Implement CSRF protection for state-changing operations',
      'Add rate limiting to prevent brute force attacks',
      'Set up proper CORS configuration for your API',
    );
  }
  
  if (projectType === 'ecommerce') {
    base.push(
      'Never store raw credit card data - use a payment processor',
      'Implement PCI-DSS compliance measures',
      'Add fraud detection mechanisms',
      'Log all transactions for audit purposes',
    );
  }
  
  if (projectType === 'api') {
    base.push(
      'Implement API key authentication or OAuth 2.0',
      'Add rate limiting per API key',
      'Validate Content-Type headers',
      'Implement request size limits',
    );
  }
  
  return base;
}

// Generate secure code patterns
export function generateSecurePatterns(language: string): string {
  if (language === 'javascript' || language === 'typescript') {
    return `
// Input Validation with Zod
import { z } from 'zod';

const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)/),
  name: z.string().min(2).max(100),
});

// Secure password hashing
import bcrypt from 'bcrypt';
const SALT_ROUNDS = 12;

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Safe database query (using parameterized queries)
const user = await db.query.users.findFirst({
  where: eq(users.email, email) // Never concatenate strings!
});

// CSRF Protection
import csrf from 'csurf';
app.use(csrf({ cookie: { httpOnly: true, secure: true } }));

// Rate Limiting
import rateLimit from 'express-rate-limit';
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per window
});
app.use('/api/', limiter);

// Secure Headers
import helmet from 'helmet';
app.use(helmet());
    `.trim();
  }
  
  return '';
}

// Format security report
export function formatSecurityReport(result: SecurityScanResult): string {
  let report = `## Security Scan Report\n\n`;
  report += `**Score:** ${result.score}/100 (Grade: ${result.grade})\n\n`;
  
  if (result.issues.length === 0) {
    report += `No security issues detected.\n\n`;
  } else {
    report += `### Issues Found (${result.issues.length})\n\n`;
    
    // Group by severity
    const critical = result.issues.filter(i => i.severity === 'critical');
    const high = result.issues.filter(i => i.severity === 'high');
    const medium = result.issues.filter(i => i.severity === 'medium');
    const low = result.issues.filter(i => i.severity === 'low');
    
    if (critical.length > 0) {
      report += `#### [CRITICAL] (${critical.length})\n`;
      for (const issue of critical) {
        report += `- **${issue.title}** (${issue.location})\n`;
        report += `  ${issue.description}\n`;
        report += `  _Fix: ${issue.recommendation}_\n`;
      }
      report += '\n';
    }
    
    if (high.length > 0) {
      report += `#### [HIGH] (${high.length})\n`;
      for (const issue of high) {
        report += `- **${issue.title}** (${issue.location})\n`;
        report += `  _Fix: ${issue.recommendation}_\n`;
      }
      report += '\n';
    }
    
    if (medium.length > 0) {
      report += `#### [MEDIUM] (${medium.length})\n`;
      for (const issue of medium) {
        report += `- **${issue.title}**: ${issue.recommendation}\n`;
      }
      report += '\n';
    }
    
    if (low.length > 0) {
      report += `#### [LOW/INFO] (${low.length})\n`;
      for (const issue of low) {
        report += `- ${issue.title}\n`;
      }
      report += '\n';
    }
  }
  
  if (result.passedChecks.length > 0) {
    report += `### Security Best Practices Detected\n`;
    for (const check of result.passedChecks) {
      report += `- [OK] ${check}\n`;
    }
  }
  
  return report;
}

export { SecurityIssue, SecurityScanResult };
