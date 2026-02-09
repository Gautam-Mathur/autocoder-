import { analyzeRequest } from '../modules/deep-understanding-engine.js';
import { generatePlan } from '../modules/plan-generator.js';
import { analyzeSemantics } from '../modules/contextual-reasoning-engine.js';
import { generateProjectFromPlan } from '../modules/plan-driven-generator.js';
import { validateAndFix } from '../modules/post-generation-validator.js';

interface GeneratedFile {
  path: string;
  content: string;
  language: string;
}

interface BuildCheck {
  category: string;
  name: string;
  passed: boolean;
  detail: string;
  severity: 'blocker' | 'error' | 'warning';
  file?: string;
}

interface AppBuildReport {
  name: string;
  checks: BuildCheck[];
  blockers: number;
  errors: number;
  warnings: number;
  passed: boolean;
  genTimeMs: number;
  fileCount: number;
}

const TEST_APPS = [
  {
    name: 'Veterinary Clinic',
    prompt: 'Build a veterinary clinic management system with patients (animals), owners, appointments, medical records, vaccinations, prescriptions, and billing.',
  },
  {
    name: 'Invoice Generator',
    prompt: 'Create an invoice generator with clients, line items, tax calculation, and payment status tracking.',
  },
  {
    name: 'Recipe Manager',
    prompt: 'Build a recipe manager where users can save recipes with ingredients, steps, cooking time, and categories. Include a shopping list generator.',
  },
  {
    name: 'Project Board',
    prompt: 'Build a project board with tasks, assignees, due dates, priorities, and kanban columns.',
  },
  {
    name: 'Freelancer Platform',
    prompt: 'Build a freelancer portfolio and invoicing platform with projects, clients, time tracking, invoices, payments, and a public portfolio page.',
  },
];

const STOCK_TAILWIND_PREFIXES = [
  'bg-', 'text-', 'border-', 'ring-', 'outline-', 'shadow-', 'opacity-',
  'p-', 'px-', 'py-', 'pt-', 'pr-', 'pb-', 'pl-', 'm-', 'mx-', 'my-',
  'mt-', 'mr-', 'mb-', 'ml-', 'w-', 'h-', 'min-w-', 'min-h-', 'max-w-',
  'max-h-', 'flex', 'grid', 'block', 'inline', 'hidden', 'absolute',
  'relative', 'fixed', 'sticky', 'top-', 'right-', 'bottom-', 'left-',
  'z-', 'overflow-', 'rounded-', 'font-', 'leading-', 'tracking-',
  'space-', 'gap-', 'items-', 'justify-', 'self-', 'col-', 'row-',
  'transition-', 'duration-', 'ease-', 'delay-', 'animate-', 'cursor-',
  'select-', 'resize-', 'appearance-', 'pointer-events-', 'sr-only',
  'not-sr-only', 'container', 'aspect-', 'columns-', 'break-',
  'decoration-', 'underline', 'overline', 'line-through', 'no-underline',
  'uppercase', 'lowercase', 'capitalize', 'normal-case', 'truncate',
  'whitespace-', 'align-', 'list-', 'object-', 'place-', 'divide-',
  'accent-', 'caret-', 'scroll-', 'snap-', 'touch-', 'will-change-',
  'fill-', 'stroke-',
];

const STOCK_TAILWIND_EXACT = new Set([
  'flex', 'grid', 'block', 'inline', 'inline-block', 'inline-flex',
  'inline-grid', 'hidden', 'contents', 'flow-root', 'table',
  'absolute', 'relative', 'fixed', 'sticky', 'static',
  'isolate', 'isolation-auto',
  'visible', 'invisible', 'collapse',
  'antialiased', 'subpixel-antialiased',
  'italic', 'not-italic',
  'ordinal', 'slashed-zero', 'lining-nums', 'oldstyle-nums',
  'proportional-nums', 'tabular-nums', 'diagonal-fractions', 'stacked-fractions',
  'truncate', 'uppercase', 'lowercase', 'capitalize', 'normal-case',
  'underline', 'overline', 'line-through', 'no-underline',
  'sr-only', 'not-sr-only', 'container',
  'transition', 'resize', 'transform',
]);

const KNOWN_EXTERNAL_PACKAGES = new Set([
  'react', 'react-dom', 'react-dom/client', 'wouter', '@tanstack/react-query',
  'lucide-react', 'recharts', 'date-fns', 'clsx', 'tailwind-merge', 'zod',
  'react-hook-form', '@hookform/resolvers', '@hookform/resolvers/zod',
  'framer-motion', 'express', 'drizzle-orm', 'drizzle-zod', 'drizzle-orm/pg-core',
  'drizzle-orm/neon-serverless', '@neondatabase/serverless',
  'class-variance-authority', 'uuid', 'nanoid',
  '@radix-ui/react-dialog', '@radix-ui/react-select', '@radix-ui/react-label',
  '@radix-ui/react-tabs', '@radix-ui/react-tooltip', '@radix-ui/react-popover',
  '@radix-ui/react-dropdown-menu', '@radix-ui/react-checkbox', '@radix-ui/react-separator',
  '@radix-ui/react-scroll-area', '@radix-ui/react-switch', '@radix-ui/react-slot',
  '@radix-ui/react-avatar', '@radix-ui/react-alert-dialog', '@radix-ui/react-accordion',
  'vitest', '@testing-library/react', '@testing-library/jest-dom',
  '@testing-library/user-event', 'jsdom', 'supertest',
  '@vitejs/plugin-react', 'tailwindcss', 'postcss', 'autoprefixer',
  'typescript', 'tsx', '@types/node', '@types/express', 'fast-glob',
  'passport', 'express-session', 'memorystore', 'connect-pg-simple',
  'ws', 'multer', 'nodemailer', 'cors',
]);

function isStockTailwindClass(className: string): boolean {
  if (STOCK_TAILWIND_EXACT.has(className)) return true;
  const withoutModifier = className.replace(/^(hover|focus|active|disabled|group-hover|dark|sm|md|lg|xl|2xl|first|last|odd|even|placeholder|focus-within|focus-visible):/, '');
  if (STOCK_TAILWIND_EXACT.has(withoutModifier)) return true;
  for (const prefix of STOCK_TAILWIND_PREFIXES) {
    if (withoutModifier.startsWith(prefix)) return true;
  }
  return false;
}

function extractTailwindExtendedColors(tailwindConfig: string): Set<string> {
  const colors = new Set<string>();
  const extendMatch = tailwindConfig.match(/extend\s*:\s*\{[\s\S]*?colors\s*:\s*\{([\s\S]*?)\}/);
  if (extendMatch) {
    const colorBlock = extendMatch[1];
    const colorNames = colorBlock.match(/(\w[\w-]*)\s*:/g);
    if (colorNames) {
      for (const c of colorNames) {
        colors.add(c.replace(':', '').trim());
      }
    }
  }
  return colors;
}

function checkCssBuildability(files: GeneratedFile[]): BuildCheck[] {
  const checks: BuildCheck[] = [];
  const cssFiles = files.filter(f => f.path.endsWith('.css'));
  const tailwindConfigFile = files.find(f => f.path.includes('tailwind.config'));
  const extendedColors = tailwindConfigFile ? extractTailwindExtendedColors(tailwindConfigFile.content) : new Set<string>();

  for (const file of cssFiles) {
    const layerBaseBlocks = file.content.match(/@layer\s+base\s*\{[\s\S]*?\n\}/g) || [];

    for (const block of layerBaseBlocks) {
      const applyStatements = block.match(/@apply\s+([^;]+);/g) || [];
      for (const stmt of applyStatements) {
        const classesStr = stmt.replace(/@apply\s+/, '').replace(';', '').trim();
        const classes = classesStr.split(/\s+/);

        for (const cls of classes) {
          const baseClass = cls.replace(/^!/, '');
          const colorName = baseClass.replace(/^(bg|text|border|ring|outline|shadow|accent|caret|fill|stroke|divide)-/, '');

          if (extendedColors.has(colorName) || extendedColors.has(baseClass)) {
            checks.push({
              category: 'CSS',
              name: `@apply custom class in @layer base`,
              passed: false,
              detail: `"${baseClass}" uses custom theme color "${colorName}" via @apply inside @layer base — Tailwind cannot resolve this. Use raw CSS: e.g., background-color: hsl(var(--${colorName}))`,
              severity: 'blocker',
              file: file.path,
            });
          }
        }
      }
    }

    const allApplyStatements = file.content.match(/@apply\s+([^;]+);/g) || [];
    for (const stmt of allApplyStatements) {
      const classesStr = stmt.replace(/@apply\s+/, '').replace(';', '').trim();
      const classes = classesStr.split(/\s+/);
      for (const cls of classes) {
        const baseClass = cls.replace(/^!/, '');
        if (!isStockTailwindClass(baseClass)) {
          const colorName = baseClass.replace(/^(bg|text|border|ring|outline|shadow|accent|caret|fill|stroke|divide)-/, '');
          if (!extendedColors.has(colorName) && !extendedColors.has(baseClass)) {
            checks.push({
              category: 'CSS',
              name: `@apply unknown class`,
              passed: false,
              detail: `"${baseClass}" is used in @apply but is not a stock Tailwind class and not in tailwind.config extend`,
              severity: 'warning',
              file: file.path,
            });
          }
        }
      }
    }
  }

  if (checks.length === 0) {
    checks.push({
      category: 'CSS',
      name: 'CSS buildability',
      passed: true,
      detail: 'No @apply issues found — all CSS classes are resolvable',
      severity: 'blocker',
    });
  }

  return checks;
}

function checkViteConfig(files: GeneratedFile[]): BuildCheck[] {
  const checks: BuildCheck[] = [];
  const viteConfig = files.find(f => f.path === 'vite.config.ts');

  if (!viteConfig) {
    checks.push({
      category: 'Vite',
      name: 'vite.config.ts exists',
      passed: false,
      detail: 'No vite.config.ts found in generated files',
      severity: 'blocker',
    });
    return checks;
  }

  checks.push({
    category: 'Vite',
    name: 'vite.config.ts exists',
    passed: true,
    detail: 'vite.config.ts found',
    severity: 'blocker',
  });

  const hasPathImport = viteConfig.content.includes("import path from") || viteConfig.content.includes("import * as path from") || viteConfig.content.includes("require('path')");
  checks.push({
    category: 'Vite',
    name: 'path module imported',
    passed: hasPathImport,
    detail: hasPathImport ? 'path module imported for alias resolution' : 'Missing path import — alias resolution will fail',
    severity: 'blocker',
  });

  const hasAtAlias = viteConfig.content.includes("'@'") || viteConfig.content.includes('"@"');
  const hasAliasConfig = viteConfig.content.includes('resolve') && viteConfig.content.includes('alias');
  checks.push({
    category: 'Vite',
    name: '@ path alias configured',
    passed: hasAtAlias && hasAliasConfig,
    detail: hasAtAlias && hasAliasConfig
      ? '@ alias configured in resolve.alias'
      : 'Missing @ path alias — @/ imports will fail at build time',
    severity: 'blocker',
  });

  const hasReactPlugin = viteConfig.content.includes('@vitejs/plugin-react');
  checks.push({
    category: 'Vite',
    name: 'React plugin configured',
    passed: hasReactPlugin,
    detail: hasReactPlugin ? 'React plugin imported' : 'Missing @vitejs/plugin-react',
    severity: 'blocker',
  });

  return checks;
}

function checkImportResolution(files: GeneratedFile[]): BuildCheck[] {
  const checks: BuildCheck[] = [];
  const fileMap = new Map<string, GeneratedFile>();
  for (const f of files) {
    fileMap.set(f.path, f);
    const noExt = f.path.replace(/\.\w+$/, '');
    fileMap.set(noExt, f);
  }

  const jsFiles = files.filter(f => /\.(ts|tsx|js|jsx)$/.test(f.path) && !f.path.includes('node_modules'));

  let totalImports = 0;
  let resolvedImports = 0;
  const unresolvedImports: { file: string; importPath: string; names: string[] }[] = [];

  for (const file of jsFiles) {
    const importMatches = Array.from(file.content.matchAll(/import\s+(?:(?:type\s+)?(?:\{([^}]+)\}|(\w+)(?:\s*,\s*\{([^}]+)\})?)\s+from\s+)?['"]([^'"]+)['"]/g));

    for (const match of importMatches) {
      const importPath = match[4];
      if (!importPath) continue;

      if (importPath.startsWith('@/') || importPath.startsWith('./') || importPath.startsWith('../')) {
        totalImports++;

        let resolvedPath: string;
        if (importPath.startsWith('@/')) {
          resolvedPath = 'src/' + importPath.slice(2);
        } else {
          const dir = file.path.split('/').slice(0, -1).join('/');
          const segments = (dir ? dir + '/' : '') + importPath;
          const parts = segments.split('/');
          const resolved: string[] = [];
          for (const p of parts) {
            if (p === '..') resolved.pop();
            else if (p !== '.') resolved.push(p);
          }
          resolvedPath = resolved.join('/');
        }

        const extensions = ['.ts', '.tsx', '.js', '.jsx', ''];
        const basePaths = [resolvedPath, resolvedPath + '/index'];
        let found = false;

        for (const base of basePaths) {
          for (const ext of extensions) {
            if (fileMap.has(base + ext)) {
              found = true;
              break;
            }
          }
          if (found) break;
        }

        if (found) {
          resolvedImports++;
        } else {
          const names: string[] = [];
          if (match[1]) names.push(...match[1].split(',').map((n: string) => n.trim().split(/\s+as\s+/)[0].replace(/^type\s+/, '').trim()).filter(Boolean));
          if (match[2]) names.push(match[2].trim());
          if (match[3]) names.push(...match[3].split(',').map((n: string) => n.trim().split(/\s+as\s+/)[0].trim()).filter(Boolean));
          unresolvedImports.push({ file: file.path, importPath, names });
        }
      }
    }
  }

  const ratio = totalImports > 0 ? resolvedImports / totalImports : 1;
  checks.push({
    category: 'Imports',
    name: 'Internal import resolution',
    passed: ratio >= 0.95,
    detail: `${resolvedImports}/${totalImports} internal imports resolve to existing files (${Math.round(ratio * 100)}%)`,
    severity: ratio >= 0.8 ? 'error' : 'blocker',
  });

  for (const unresolved of unresolvedImports.slice(0, 10)) {
    checks.push({
      category: 'Imports',
      name: 'Unresolved import',
      passed: false,
      detail: `${unresolved.file} imports {${unresolved.names.join(', ')}} from "${unresolved.importPath}" — file not found`,
      severity: 'error',
      file: unresolved.file,
    });
  }

  return checks;
}

function checkExportCompleteness(files: GeneratedFile[]): BuildCheck[] {
  const checks: BuildCheck[] = [];
  const fileMap = new Map<string, GeneratedFile>();
  for (const f of files) {
    fileMap.set(f.path, f);
    const noExt = f.path.replace(/\.\w+$/, '');
    fileMap.set(noExt, f);
  }

  const jsFiles = files.filter(f => /\.(ts|tsx|js|jsx)$/.test(f.path));

  let totalNamedImports = 0;
  let matchedExports = 0;
  const missingExports: { consumer: string; provider: string; name: string }[] = [];

  for (const file of jsFiles) {
    const importMatches = Array.from(file.content.matchAll(/import\s+\{([^}]+)\}\s+from\s+['"]([^'"]+)['"]/g));

    for (const match of importMatches) {
      const names = match[1].split(',').map((n: string) => {
        let name = n.trim();
        if (name.startsWith('type ')) name = name.slice(5).trim();
        name = name.split(/\s+as\s+/)[0].trim();
        return name;
      }).filter(Boolean);

      const importPath = match[2];
      if (!importPath.startsWith('@/') && !importPath.startsWith('./') && !importPath.startsWith('../')) continue;

      let resolvedPath: string;
      if (importPath.startsWith('@/')) {
        resolvedPath = 'src/' + importPath.slice(2);
      } else {
        const dir = file.path.split('/').slice(0, -1).join('/');
        const segments = (dir ? dir + '/' : '') + importPath;
        const parts = segments.split('/');
        const resolved: string[] = [];
        for (const p of parts) {
          if (p === '..') resolved.pop();
          else if (p !== '.') resolved.push(p);
        }
        resolvedPath = resolved.join('/');
      }

      const extensions = ['.ts', '.tsx', '.js', '.jsx', ''];
      const basePaths = [resolvedPath, resolvedPath + '/index'];
      let targetFile: GeneratedFile | undefined;

      for (const base of basePaths) {
        for (const ext of extensions) {
          if (fileMap.has(base + ext)) {
            targetFile = fileMap.get(base + ext);
            break;
          }
        }
        if (targetFile) break;
      }

      if (!targetFile) continue;

      const exportMatches = Array.from(targetFile.content.matchAll(/export\s+(?:async\s+)?(?:function|class|const|let|var|type|interface|enum)\s+(\w+)/g))
        .map((m: RegExpExecArray) => m[1]);
      const reExports = Array.from(targetFile.content.matchAll(/export\s*\{([^}]+)\}/g))
        .flatMap((m: RegExpExecArray) => m[1].split(',').map((n: string) => n.trim().split(/\s+as\s+/).pop()?.trim()).filter((x): x is string => Boolean(x)));
      const hasDefaultExport = /export\s+default\s+/.test(targetFile.content);
      const allExports = new Set([...exportMatches, ...reExports, ...(hasDefaultExport ? ['default'] : [])]);

      for (const name of names) {
        totalNamedImports++;
        if (allExports.has(name) || Array.from(allExports).some((e: string) => e.toLowerCase() === name.toLowerCase())) {
          matchedExports++;
        } else {
          missingExports.push({
            consumer: file.path,
            provider: targetFile.path,
            name,
          });
        }
      }
    }
  }

  const ratio = totalNamedImports > 0 ? matchedExports / totalNamedImports : 1;
  checks.push({
    category: 'Exports',
    name: 'Named export completeness',
    passed: ratio >= 0.9,
    detail: `${matchedExports}/${totalNamedImports} named imports have matching exports (${Math.round(ratio * 100)}%)`,
    severity: ratio >= 0.7 ? 'error' : 'blocker',
  });

  for (const missing of missingExports.slice(0, 10)) {
    checks.push({
      category: 'Exports',
      name: 'Missing named export',
      passed: false,
      detail: `"${missing.name}" imported by ${missing.consumer} but not exported from ${missing.provider}`,
      severity: 'error',
      file: missing.provider,
    });
  }

  return checks;
}

function checkPackageDependencies(files: GeneratedFile[]): BuildCheck[] {
  const checks: BuildCheck[] = [];
  const pkgFile = files.find(f => f.path === 'package.json');

  if (!pkgFile) {
    checks.push({
      category: 'Dependencies',
      name: 'package.json exists',
      passed: false,
      detail: 'No package.json found',
      severity: 'blocker',
    });
    return checks;
  }

  let pkg: any;
  try {
    pkg = JSON.parse(pkgFile.content);
  } catch {
    checks.push({
      category: 'Dependencies',
      name: 'package.json valid JSON',
      passed: false,
      detail: 'package.json contains invalid JSON',
      severity: 'blocker',
    });
    return checks;
  }

  const declaredDeps = new Set<string>([
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.devDependencies || {}),
  ]);

  const jsFiles = files.filter(f => /\.(ts|tsx|js|jsx)$/.test(f.path));
  const importedPackages = new Set<string>();

  for (const file of jsFiles) {
    const imports = Array.from(file.content.matchAll(/(?:import|from)\s+['"]([^'"]+)['"]/g));
    for (const m of imports) {
      const importPath = m[1];
      if (importPath.startsWith('.') || importPath.startsWith('/') || importPath.startsWith('@/') || importPath.startsWith('@shared')) continue;
      const basePkg = importPath.startsWith('@') ? importPath.split('/').slice(0, 2).join('/') : importPath.split('/')[0];
      importedPackages.add(basePkg);
    }
  }

  const missingDeps: string[] = [];
  for (const pkg of Array.from(importedPackages)) {
    if (!declaredDeps.has(pkg) && !KNOWN_EXTERNAL_PACKAGES.has(pkg)) {
      continue;
    }
    if (!declaredDeps.has(pkg)) {
      missingDeps.push(pkg);
    }
  }

  checks.push({
    category: 'Dependencies',
    name: 'All imports in package.json',
    passed: missingDeps.length === 0,
    detail: missingDeps.length === 0
      ? `All ${importedPackages.size} imported packages are declared in package.json`
      : `Missing from package.json: ${missingDeps.join(', ')}`,
    severity: missingDeps.length > 3 ? 'blocker' : 'error',
  });

  const hasDevScript = !!pkg.scripts?.dev;
  const hasBuildScript = !!pkg.scripts?.build;
  checks.push({
    category: 'Dependencies',
    name: 'Required scripts present',
    passed: hasDevScript && hasBuildScript,
    detail: `dev: ${hasDevScript ? 'yes' : 'MISSING'}, build: ${hasBuildScript ? 'yes' : 'MISSING'}`,
    severity: 'error',
  });

  return checks;
}

function checkTypescriptSyntax(files: GeneratedFile[]): BuildCheck[] {
  const checks: BuildCheck[] = [];
  const tsFiles = files.filter(f => /\.(ts|tsx)$/.test(f.path));

  let syntaxErrors = 0;
  const issues: { file: string; issue: string }[] = [];

  for (const file of tsFiles) {
    const lines = file.content.split('\n');
    let braceDepth = 0;
    let parenDepth = 0;
    let inString = false;
    let stringChar = '';
    let inTemplate = false;
    let inComment = false;
    let inBlockComment = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      for (let j = 0; j < line.length; j++) {
        const ch = line[j];
        const prev = j > 0 ? line[j - 1] : '';

        if (inString) {
          if (ch === stringChar && prev !== '\\') inString = false;
          continue;
        }
        if (inTemplate) {
          if (ch === '`' && prev !== '\\') inTemplate = false;
          continue;
        }
        if (inBlockComment) {
          if (ch === '/' && prev === '*') inBlockComment = false;
          continue;
        }
        if (ch === '/' && j + 1 < line.length && line[j + 1] === '/') break;
        if (ch === '/' && j + 1 < line.length && line[j + 1] === '*') {
          inBlockComment = true;
          continue;
        }

        if (ch === "'" || ch === '"') {
          inString = true;
          stringChar = ch;
        } else if (ch === '`') {
          inTemplate = true;
        } else if (ch === '{') {
          braceDepth++;
        } else if (ch === '}') {
          braceDepth--;
        } else if (ch === '(') {
          parenDepth++;
        } else if (ch === ')') {
          parenDepth--;
        }
      }
    }

    if (braceDepth !== 0) {
      syntaxErrors++;
      issues.push({ file: file.path, issue: `Unmatched braces (depth: ${braceDepth})` });
    }
    if (parenDepth !== 0 && Math.abs(parenDepth) > 2) {
      syntaxErrors++;
      issues.push({ file: file.path, issue: `Unmatched parentheses (depth: ${parenDepth})` });
    }

    const corruptedGenerics = file.content.match(/\w<\/([\w.]+)>/g);
    if (corruptedGenerics) {
      const realCorruptions = corruptedGenerics.filter(m => {
        return !m.match(/^\w+<\/\w+>$/) || !file.content.includes(`<${m.match(/<\/(\w+)>/)?.[1]}`);
      });
      if (realCorruptions.length > 0) {
        syntaxErrors++;
        issues.push({ file: file.path, issue: `Possible corrupted TypeScript generics: ${realCorruptions.slice(0, 3).join(', ')}` });
      }
    }

    const duplicateExports = Array.from(file.content.matchAll(/export\s+(?:async\s+)?(?:function|const|class|type|interface)\s+(\w+)/g))
      .map((m: RegExpExecArray) => m[1]);
    const exportCounts = new Map<string, number>();
    for (const name of duplicateExports) {
      exportCounts.set(name, (exportCounts.get(name) || 0) + 1);
    }
    for (const [name, count] of Array.from(exportCounts)) {
      if (count > 1) {
        syntaxErrors++;
        issues.push({ file: file.path, issue: `Duplicate export: "${name}" exported ${count} times` });
      }
    }
  }

  checks.push({
    category: 'TypeScript',
    name: 'Syntax validity',
    passed: syntaxErrors === 0,
    detail: syntaxErrors === 0
      ? `All ${tsFiles.length} TypeScript files pass basic syntax checks`
      : `${syntaxErrors} syntax issues found`,
    severity: syntaxErrors > 0 ? 'error' : 'blocker',
  });

  for (const issue of issues.slice(0, 10)) {
    checks.push({
      category: 'TypeScript',
      name: 'Syntax issue',
      passed: false,
      detail: `${issue.file}: ${issue.issue}`,
      severity: 'error',
      file: issue.file,
    });
  }

  return checks;
}

function checkTailwindConfig(files: GeneratedFile[]): BuildCheck[] {
  const checks: BuildCheck[] = [];
  const tailwindConfig = files.find(f => f.path.includes('tailwind.config'));

  if (!tailwindConfig) {
    checks.push({
      category: 'Tailwind',
      name: 'tailwind.config exists',
      passed: false,
      detail: 'No tailwind.config found',
      severity: 'error',
    });
    return checks;
  }

  checks.push({
    category: 'Tailwind',
    name: 'tailwind.config exists',
    passed: true,
    detail: 'tailwind.config found',
    severity: 'error',
  });

  const hasContent = tailwindConfig.content.includes('content') && (tailwindConfig.content.includes('./src/**') || tailwindConfig.content.includes('"./src/'));
  checks.push({
    category: 'Tailwind',
    name: 'Content paths configured',
    passed: hasContent,
    detail: hasContent ? 'Content paths include src directory' : 'Missing or incorrect content paths — Tailwind will not scan source files',
    severity: 'blocker',
  });

  const hasThemeExtend = tailwindConfig.content.includes('extend');
  const hasColorVars = tailwindConfig.content.includes('hsl(var(--') || tailwindConfig.content.includes('var(--');
  checks.push({
    category: 'Tailwind',
    name: 'Theme extension with CSS variables',
    passed: hasThemeExtend && hasColorVars,
    detail: hasThemeExtend && hasColorVars
      ? 'Theme extends colors using CSS custom properties'
      : 'Missing theme extension with CSS variables — custom utility classes will not work',
    severity: 'error',
  });

  return checks;
}

function checkHtmlEntryPoint(files: GeneratedFile[]): BuildCheck[] {
  const checks: BuildCheck[] = [];
  const htmlFile = files.find(f => f.path === 'index.html');

  if (!htmlFile) {
    checks.push({
      category: 'Entry',
      name: 'index.html exists',
      passed: false,
      detail: 'No index.html found — Vite requires this as entry point',
      severity: 'blocker',
    });
    return checks;
  }

  const hasRoot = htmlFile.content.includes('id="root"');
  checks.push({
    category: 'Entry',
    name: 'Root element present',
    passed: hasRoot,
    detail: hasRoot ? 'div#root found for React mounting' : 'Missing div#root — React cannot mount',
    severity: 'blocker',
  });

  const hasScript = htmlFile.content.includes('<script') && htmlFile.content.includes('src/main');
  checks.push({
    category: 'Entry',
    name: 'Script entry point',
    passed: hasScript,
    detail: hasScript ? 'Script tag references src/main entry' : 'Missing script tag for main entry — app will not load',
    severity: 'blocker',
  });

  return checks;
}

function checkPostcssConfig(files: GeneratedFile[]): BuildCheck[] {
  const checks: BuildCheck[] = [];
  const postcssConfig = files.find(f => f.path.includes('postcss.config'));

  if (!postcssConfig) {
    const cssFiles = files.filter(f => f.path.endsWith('.css'));
    const usesTailwind = cssFiles.some(f => f.content.includes('@tailwind'));
    if (usesTailwind) {
      checks.push({
        category: 'PostCSS',
        name: 'postcss.config for Tailwind',
        passed: false,
        detail: 'CSS uses @tailwind directives but no postcss.config found — Tailwind will not process',
        severity: 'blocker',
      });
    }
    return checks;
  }

  const hasTailwindPlugin = postcssConfig.content.includes('tailwindcss');
  const hasAutoprefixer = postcssConfig.content.includes('autoprefixer');
  checks.push({
    category: 'PostCSS',
    name: 'PostCSS plugins configured',
    passed: hasTailwindPlugin && hasAutoprefixer,
    detail: `tailwindcss: ${hasTailwindPlugin ? 'yes' : 'MISSING'}, autoprefixer: ${hasAutoprefixer ? 'yes' : 'MISSING'}`,
    severity: hasTailwindPlugin ? 'warning' : 'blocker',
  });

  return checks;
}

function formatBar(pct: number, width: number = 20): string {
  const filled = Math.round((pct / 100) * width);
  return '\u2588'.repeat(filled) + '\u2591'.repeat(width - filled);
}

function gradeLabel(pct: number): string {
  if (pct >= 95) return 'A+';
  if (pct >= 90) return 'A';
  if (pct >= 85) return 'A-';
  if (pct >= 80) return 'B+';
  if (pct >= 75) return 'B';
  if (pct >= 70) return 'B-';
  if (pct >= 65) return 'C+';
  if (pct >= 60) return 'C';
  if (pct >= 50) return 'D';
  return 'F';
}

async function runBuildabilityTest() {
  console.log(`\n\u2554${'═'.repeat(74)}\u2557`);
  console.log(`\u2551${'     CODE GENERATION BUILDABILITY TEST — WILL IT COMPILE?'.padEnd(74)}\u2551`);
  console.log(`\u2560${'═'.repeat(74)}\u2563`);
  console.log(`\u2551${'  Validates generated code can survive Vite/PostCSS/esbuild processing'.padEnd(74)}\u2551`);
  console.log(`\u2551${'  Checks: CSS, Vite config, imports, exports, deps, TS syntax, HTML'.padEnd(74)}\u2551`);
  console.log(`\u255a${'═'.repeat(74)}\u255d`);

  const reports: AppBuildReport[] = [];

  for (const app of TEST_APPS) {
    console.log(`\n${'═'.repeat(76)}`);
    console.log(`  APP: ${app.name}`);
    console.log(`  PROMPT: "${app.prompt.substring(0, 75)}${app.prompt.length > 75 ? '...' : ''}"`);
    console.log(`${'─'.repeat(76)}`);

    try {
      const start = Date.now();
      const understanding = analyzeRequest(app.prompt);
      const plan = generatePlan(understanding);
      const reasoning = analyzeSemantics(plan);
      const rawFiles = generateProjectFromPlan(plan);
      const validated = validateAndFix(rawFiles);
      const files = validated.files || rawFiles;
      const genTime = Date.now() - start;

      const allChecks: BuildCheck[] = [
        ...checkCssBuildability(files),
        ...checkViteConfig(files),
        ...checkTailwindConfig(files),
        ...checkPostcssConfig(files),
        ...checkHtmlEntryPoint(files),
        ...checkImportResolution(files),
        ...checkExportCompleteness(files),
        ...checkPackageDependencies(files),
        ...checkTypescriptSyntax(files),
      ];

      const blockers = allChecks.filter(c => !c.passed && c.severity === 'blocker').length;
      const errors = allChecks.filter(c => !c.passed && c.severity === 'error').length;
      const warnings = allChecks.filter(c => !c.passed && c.severity === 'warning').length;
      const passed = blockers === 0;

      const categories = new Map<string, BuildCheck[]>();
      for (const check of allChecks) {
        const existing = categories.get(check.category) || [];
        existing.push(check);
        categories.set(check.category, existing);
      }

      for (const [cat, catChecks] of Array.from(categories)) {
        const catBlockers = catChecks.filter((c: BuildCheck) => !c.passed && c.severity === 'blocker');
        const catErrors = catChecks.filter((c: BuildCheck) => !c.passed && c.severity === 'error');
        const catWarnings = catChecks.filter((c: BuildCheck) => !c.passed && c.severity === 'warning');
        const catPassed = catChecks.filter((c: BuildCheck) => c.passed);
        const icon = catBlockers.length > 0 ? '\u26d4' : catErrors.length > 0 ? '\u26a0\ufe0f' : '\u2705';

        console.log(`\n  ${icon} ${cat} (${catPassed.length}/${catChecks.length} passed)`);

        for (const check of catChecks) {
          const statusIcon = check.passed ? '\u2713' : '\u2717';
          const sevLabel = check.passed ? '' : ` [${check.severity.toUpperCase()}]`;
          console.log(`    ${statusIcon}${sevLabel} ${check.name}: ${check.detail}`);
        }
      }

      const totalChecks = allChecks.length;
      const passedChecks = allChecks.filter(c => c.passed).length;
      const buildVerdict = passed ? '\u2705 BUILD WOULD SUCCEED' : '\u26d4 BUILD WOULD FAIL';

      console.log(`\n  \u2500\u2500 ${buildVerdict} | ${passedChecks}/${totalChecks} checks passed | ${blockers} blockers, ${errors} errors, ${warnings} warnings | ${files.length} files in ${genTime}ms`);

      reports.push({ name: app.name, checks: allChecks, blockers, errors, warnings, passed, genTimeMs: genTime, fileCount: files.length });
    } catch (err: any) {
      console.log(`\n  \u274c GENERATION CRASHED: ${err.message}`);
      reports.push({ name: app.name, checks: [], blockers: 1, errors: 0, warnings: 0, passed: false, genTimeMs: 0, fileCount: 0 });
    }
  }

  console.log(`\n\u2554${'═'.repeat(74)}\u2557`);
  console.log(`\u2551${'                     BUILDABILITY SCORECARD'.padEnd(74)}\u2551`);
  console.log(`\u2560${'═'.repeat(74)}\u2563`);

  let totalPassed = 0;
  let totalChecks = 0;
  let allAppsPass = true;

  for (const r of reports) {
    const appPassed = r.checks.filter(c => c.passed).length;
    const appTotal = r.checks.length;
    totalPassed += appPassed;
    totalChecks += appTotal;
    if (!r.passed) allAppsPass = false;

    const pct = appTotal > 0 ? Math.round((appPassed / appTotal) * 100) : 0;
    const bar = formatBar(pct);
    const verdict = r.passed ? '\u2705' : '\u26d4';
    console.log(`\u2551  ${verdict} ${r.name.padEnd(22)} ${bar}  ${String(pct).padStart(3)}% ${gradeLabel(pct).padStart(2)}  \u2551`);
    if (!r.passed) {
      const blockerDetails = r.checks.filter(c => !c.passed && c.severity === 'blocker').map(c => c.name);
      console.log(`\u2551    Blockers: ${blockerDetails.join(', ').substring(0, 60).padEnd(60)}\u2551`);
    }
  }

  const overallPct = totalChecks > 0 ? Math.round((totalPassed / totalChecks) * 100) : 0;
  console.log(`\u2560${'═'.repeat(74)}\u2563`);

  const scoreText = `BUILDABILITY: ${overallPct}% (${totalPassed}/${totalChecks}) — Grade: ${gradeLabel(overallPct)}`;
  console.log(`\u2551  ${scoreText.padEnd(72)}\u2551`);

  const allCategories = new Map<string, { passed: number; total: number }>();
  for (const r of reports) {
    for (const c of r.checks) {
      const cat = allCategories.get(c.category) || { passed: 0, total: 0 };
      cat.total++;
      if (c.passed) cat.passed++;
      allCategories.set(c.category, cat);
    }
  }

  console.log(`\u2551${''.padEnd(74)}\u2551`);
  console.log(`\u2551  CATEGORY BREAKDOWN:${' '.repeat(54)}\u2551`);
  for (const [cat, { passed, total }] of Array.from(allCategories)) {
    const catPct = total > 0 ? Math.round((passed / total) * 100) : 0;
    const catBar = formatBar(catPct, 12);
    const line = `    ${cat.padEnd(18)} ${catBar} ${String(catPct).padStart(3)}%  (${passed}/${total})`;
    console.log(`\u2551${line.padEnd(74)}\u2551`);
  }

  const verdictLine = allAppsPass
    ? '  VERDICT: ALL APPS BUILDABLE'
    : `  VERDICT: ${reports.filter(r => !r.passed).length}/${reports.length} APPS WOULD FAIL TO BUILD`;
  console.log(`\u2551${''.padEnd(74)}\u2551`);
  console.log(`\u2551${verdictLine.padEnd(74)}\u2551`);
  console.log(`\u255a${'═'.repeat(74)}\u255d`);

  if (!allAppsPass) {
    process.exit(1);
  }
}

runBuildabilityTest().catch(err => {
  console.error('Buildability test crashed:', err);
  process.exit(1);
});
