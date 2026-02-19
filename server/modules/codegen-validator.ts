interface GeneratedFile {
  path: string;
  content: string;
  language: string;
}

interface ValidationError {
  file: string;
  type: 'missing-import' | 'missing-component' | 'missing-route' | 'missing-package' | 'broken-reference' | 'missing-file';
  message: string;
  severity: 'error' | 'warning';
  autoFixable: boolean;
}

interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  stats: {
    totalFiles: number;
    totalImports: number;
    resolvedImports: number;
    unresolvedImports: number;
    apiCallsFound: number;
    apiRoutesFound: number;
    missingRoutes: number;
  };
}

export function validateGeneratedProject(files: GeneratedFile[]): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  const filePathSet = new Map<string, GeneratedFile>();

  for (const f of files) {
    filePathSet.set(f.path, f);
    const altPath = f.path.startsWith('src/') ? f.path : `src/${f.path}`;
    filePathSet.set(altPath, f);
  }

  let totalImports = 0;
  let resolvedImports = 0;
  let unresolvedImports = 0;
  let apiCallsFound = 0;
  let apiRoutesFound = 0;
  let missingRoutes = 0;

  const importRegex = /import\s+(?:{[^}]+}|[^;]+)\s+from\s+["']([^"']+)["']/g;
  const apiCallRegex = /(?:apiRequest|fetch)\s*\(\s*["'](?:GET|POST|PUT|PATCH|DELETE)["']\s*,\s*["']([^"']+)["']/g;
  const apiCallRegex2 = /queryKey:\s*\[\s*["']([^"']+)["']/g;
  const routerRegex = /(?:app|router)\.(get|post|put|patch|delete)\s*\(\s*["']([^"']+)["']/g;

  const knownExternals = new Set([
    'react', 'react-dom', 'react-dom/client',
    '@tanstack/react-query', '@tanstack/react-query-devtools',
    'wouter', 'lucide-react', 'recharts',
    'clsx', 'tailwind-merge', 'class-variance-authority',
    'date-fns', 'zod', 'express',
    'path', 'fs', 'url', 'http', 'https', 'crypto', 'os', 'stream', 'util', 'events', 'net',
  ]);

  const aliasMap: Record<string, string> = {
    '@/': 'src/',
    '@shared/': 'shared/',
  };

  const declaredApiRoutes = new Set<string>();
  const calledApiRoutes = new Set<string>();

  for (const file of files) {
    if (file.language === 'json' || file.language === 'css' || file.path.endsWith('.config.ts') || file.path.endsWith('.config.js')) continue;

    let match;

    importRegex.lastIndex = 0;
    while ((match = importRegex.exec(file.content)) !== null) {
      totalImports++;
      const importPath = match[1];

      if (knownExternals.has(importPath) || importPath.startsWith('.') && resolveRelativeImport(file.path, importPath, filePathSet)) {
        resolvedImports++;
        continue;
      }

      let resolved = false;
      for (const [alias, realPath] of Object.entries(aliasMap)) {
        if (importPath.startsWith(alias)) {
          const fullPath = importPath.replace(alias, realPath);
          if (resolveAliasImport(fullPath, filePathSet)) {
            resolved = true;
            break;
          }
        }
      }

      if (!resolved && !importPath.startsWith('.') && !importPath.startsWith('@/') && !importPath.startsWith('@shared/')) {
        resolved = true;
      }

      if (resolved) {
        resolvedImports++;
      } else {
        unresolvedImports++;
        errors.push({
          file: file.path,
          type: 'missing-import',
          message: `Import "${importPath}" cannot be resolved. No matching file found in generated output.`,
          severity: 'error',
          autoFixable: false,
        });
      }
    }

    apiCallRegex.lastIndex = 0;
    while ((match = apiCallRegex.exec(file.content)) !== null) {
      const route = normalizeRoute(match[1]);
      calledApiRoutes.add(route);
      apiCallsFound++;
    }

    apiCallRegex2.lastIndex = 0;
    while ((match = apiCallRegex2.exec(file.content)) !== null) {
      const route = normalizeRoute(match[1]);
      if (route.startsWith('/api/')) {
        calledApiRoutes.add(route);
        apiCallsFound++;
      }
    }

    routerRegex.lastIndex = 0;
    while ((match = routerRegex.exec(file.content)) !== null) {
      const route = normalizeRoute(match[2]);
      declaredApiRoutes.add(route);
      apiRoutesFound++;
    }
  }

  for (const calledRoute of Array.from(calledApiRoutes.values())) {
    const baseRoute = calledRoute.replace(/\/\$\{[^}]+\}/g, '/:id').replace(/\/\d+$/, '/:id');
    const found = Array.from(declaredApiRoutes.values()).some(declared => {
      const declaredBase = declared.replace(/\/:[^/]+/g, '/:id');
      return declaredBase === baseRoute || declaredBase === calledRoute;
    });
    if (!found) {
      missingRoutes++;
      warnings.push({
        file: 'routes',
        type: 'missing-route',
        message: `API call to "${calledRoute}" has no matching server route.`,
        severity: 'warning',
        autoFixable: false,
      });
    }
  }

  const packageJson = files.find(f => f.path === 'package.json');
  if (packageJson) {
    try {
      const pkg = JSON.parse(packageJson.content);
      const allDeps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };

      for (const file of files) {
        if (file.language === 'json' || file.language === 'css') continue;
        importRegex.lastIndex = 0;
        let match;
        while ((match = importRegex.exec(file.content)) !== null) {
          const importPath = match[1];
          if (importPath.startsWith('.') || importPath.startsWith('@/') || importPath.startsWith('@shared/')) continue;
          const packageName = importPath.startsWith('@') ? importPath.split('/').slice(0, 2).join('/') : importPath.split('/')[0];

          const nodeBuiltins = new Set(['path', 'fs', 'url', 'http', 'https', 'crypto', 'os', 'stream', 'util', 'events', 'net', 'child_process', 'buffer', 'querystring', 'assert', 'module']);
          if (!allDeps[packageName] && !['react', 'react-dom'].includes(packageName) && !nodeBuiltins.has(packageName)) {
            const existing = errors.find(e => e.message.includes(packageName));
            if (!existing) {
              errors.push({
                file: 'package.json',
                type: 'missing-package',
                message: `Package "${packageName}" is imported but not in package.json dependencies.`,
                severity: 'error',
                autoFixable: true,
              });
            }
          }
        }
      }
    } catch {}
  }

  const valid = errors.filter(e => e.severity === 'error').length === 0;

  return {
    valid,
    errors,
    warnings,
    stats: {
      totalFiles: files.length,
      totalImports,
      resolvedImports,
      unresolvedImports,
      apiCallsFound,
      apiRoutesFound,
      missingRoutes,
    },
  };
}

function resolveRelativeImport(sourceFile: string, importPath: string, fileMap: Map<string, GeneratedFile>): boolean {
  const sourceDir = sourceFile.split('/').slice(0, -1).join('/');
  const resolved = resolvePathSegments(sourceDir, importPath);

  const extensions = ['', '.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.tsx'];
  for (const ext of extensions) {
    if (fileMap.has(resolved + ext)) return true;
  }
  return false;
}

function resolveAliasImport(fullPath: string, fileMap: Map<string, GeneratedFile>): boolean {
  const extensions = ['', '.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.tsx'];
  for (const ext of extensions) {
    if (fileMap.has(fullPath + ext)) return true;
  }
  return false;
}

function resolvePathSegments(base: string, relative: string): string {
  const parts = base.split('/').filter(Boolean);
  const relParts = relative.split('/');

  for (const part of relParts) {
    if (part === '.') continue;
    if (part === '..') { parts.pop(); continue; }
    parts.push(part);
  }

  return parts.join('/');
}

function normalizeRoute(route: string): string {
  return route.replace(/\$\{[^}]+\}/g, ':id').replace(/`/g, '');
}

export function formatValidationReport(result: ValidationResult): string {
  const lines: string[] = [];
  lines.push(`=== Generation Validation Report ===`);
  lines.push(`Files: ${result.stats.totalFiles}`);
  lines.push(`Imports: ${result.stats.resolvedImports}/${result.stats.totalImports} resolved`);
  lines.push(`API: ${result.stats.apiCallsFound} calls, ${result.stats.apiRoutesFound} routes, ${result.stats.missingRoutes} missing`);
  lines.push(`Status: ${result.valid ? 'PASS' : 'FAIL'}`);

  if (result.errors.length > 0) {
    lines.push(`\nErrors (${result.errors.length}):`);
    for (const err of result.errors) {
      lines.push(`  [${err.type}] ${err.file}: ${err.message}`);
    }
  }

  if (result.warnings.length > 0) {
    lines.push(`\nWarnings (${result.warnings.length}):`);
    for (const warn of result.warnings) {
      lines.push(`  [${warn.type}] ${warn.file}: ${warn.message}`);
    }
  }

  return lines.join('\n');
}
