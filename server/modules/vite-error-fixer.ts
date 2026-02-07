// Vite Error Analysis Engine - Parses build/runtime errors and generates automated fixes

export interface ParsedError {
  type: 'missing_import' | 'missing_module' | 'missing_file' | 'syntax' | 'export_mismatch' | 
        'type_error' | 'reference_error' | 'jsx_error' | 'css_error' | 'dependency_conflict' |
        'hook_violation' | 'runtime' | 'config' | 'unknown';
  message: string;
  filePath?: string;
  line?: number;
  column?: number;
  importName?: string;
  moduleName?: string;
  raw: string;
}

export interface FixAction {
  type: 'patch_file' | 'create_file' | 'add_dependency' | 'delete_import' | 'fix_path';
  filePath: string;
  description: string;
  oldContent?: string;
  newContent: string;
  confidence: 'high' | 'medium' | 'low';
  packageName?: string;
  packageVersion?: string;
}

export interface FixResult {
  errors: ParsedError[];
  fixes: FixAction[];
  unfixable: ParsedError[];
  summary: string;
}

interface ProjectFile {
  path: string;
  content: string;
  language: string;
}

interface ErrorPattern {
  pattern: RegExp;
  type: ParsedError['type'];
  extract: (match: RegExpMatchArray, raw: string) => Partial<ParsedError>;
}

const VITE_ERROR_PATTERNS: ErrorPattern[] = [
  {
    pattern: /Failed to resolve import "([^"]+)" from "([^"]+)"/,
    type: 'missing_import',
    extract: (m) => ({ importName: m[1], filePath: m[2] }),
  },
  {
    pattern: /Module not found: (?:Error: )?Can't resolve '([^']+)' in '([^']+)'/,
    type: 'missing_module',
    extract: (m) => ({ moduleName: m[1], filePath: m[2] }),
  },
  {
    pattern: /Cannot find module '([^']+)'/,
    type: 'missing_module',
    extract: (m) => ({ moduleName: m[1] }),
  },
  {
    pattern: /Error: No matching export in "([^"]+)" for import "([^"]+)"/,
    type: 'export_mismatch',
    extract: (m) => ({ filePath: m[1], importName: m[2] }),
  },
  {
    pattern: /\[plugin:vite:import-analysis\] Failed to parse source for import analysis.*?(\S+\.\w+)/,
    type: 'syntax',
    extract: (m) => ({ filePath: m[1] }),
  },
  {
    pattern: /SyntaxError: (?:.*?) \((\d+):(\d+)\)(?:.*?in (\S+))?/,
    type: 'syntax',
    extract: (m) => ({ line: parseInt(m[1]), column: parseInt(m[2]), filePath: m[3] }),
  },
  {
    pattern: /Unexpected token.*?(?:in |at )(\S+\.(?:jsx?|tsx?|vue)):?(\d+)?/,
    type: 'syntax',
    extract: (m) => ({ filePath: m[1], line: m[2] ? parseInt(m[2]) : undefined }),
  },
  {
    pattern: /ReferenceError: (\w+) is not defined/,
    type: 'reference_error',
    extract: (m) => ({ importName: m[1] }),
  },
  {
    pattern: /TypeError: (.+)/,
    type: 'type_error',
    extract: (m) => ({}),
  },
  {
    pattern: /Cannot use import statement outside a module/,
    type: 'config',
    extract: () => ({}),
  },
  {
    pattern: /React\.createElement.*is not a function|Invalid hook call/,
    type: 'hook_violation',
    extract: () => ({}),
  },
  {
    pattern: /JSX element type '(\w+)' does not have any construct or call signatures/,
    type: 'jsx_error',
    extract: (m) => ({ importName: m[1] }),
  },
  {
    pattern: /Unknown at rule @([\w-]+)/,
    type: 'css_error',
    extract: (m) => ({ importName: m[1] }),
  },
  {
    pattern: /Conflicting peer dependency|ERESOLVE unable to resolve dependency tree/,
    type: 'dependency_conflict',
    extract: () => ({}),
  },
  {
    pattern: /ENOENT.*?'([^']+)'/,
    type: 'missing_file',
    extract: (m) => ({ filePath: m[1] }),
  },
  {
    pattern: /(?:Cannot find|not found|does not exist):?\s*['"]?([./][\w./\-@]+)/,
    type: 'missing_file',
    extract: (m) => ({ filePath: m[1] }),
  },
];

const COMMON_PACKAGES: Record<string, string> = {
  'react': '^18.2.0',
  'react-dom': '^18.2.0',
  'react-router-dom': '^6.20.0',
  'axios': '^1.6.0',
  'zustand': '^4.4.0',
  'framer-motion': '^10.16.0',
  'recharts': '^2.10.0',
  'lucide-react': '^0.294.0',
  'date-fns': '^2.30.0',
  'clsx': '^2.0.0',
  'tailwind-merge': '^2.0.0',
  '@tanstack/react-query': '^5.0.0',
  'react-hook-form': '^7.48.0',
  'zod': '^3.22.0',
  '@hookform/resolvers': '^3.3.0',
  'class-variance-authority': '^0.7.0',
  'react-icons': '^4.12.0',
  'uuid': '^9.0.0',
  'nanoid': '^5.0.0',
  '@radix-ui/react-slot': '^1.0.2',
  '@radix-ui/react-dialog': '^1.0.5',
  '@radix-ui/react-dropdown-menu': '^2.0.6',
  '@radix-ui/react-tabs': '^1.0.4',
  '@radix-ui/react-toast': '^1.1.5',
  '@radix-ui/react-tooltip': '^1.0.7',
  '@radix-ui/react-select': '^2.0.0',
  '@radix-ui/react-label': '^2.0.2',
  '@radix-ui/react-switch': '^1.0.3',
  '@radix-ui/react-checkbox': '^1.0.4',
  '@radix-ui/react-separator': '^1.0.3',
  '@radix-ui/react-scroll-area': '^1.0.5',
  '@radix-ui/react-avatar': '^1.0.4',
  '@radix-ui/react-popover': '^1.0.7',
  'tailwindcss': '^3.3.0',
  'autoprefixer': '^10.4.0',
  'postcss': '^8.4.0',
};

const REACT_HOOKS = ['useState', 'useEffect', 'useCallback', 'useMemo', 'useRef', 'useContext', 'useReducer', 'useId', 'useTransition', 'useDeferredValue', 'useLayoutEffect', 'useImperativeHandle', 'useDebugValue', 'useSyncExternalStore', 'useInsertionEffect'];

export function parseErrors(errorMessages: string[]): ParsedError[] {
  const parsed: ParsedError[] = [];

  for (const raw of errorMessages) {
    let matched = false;

    for (const { pattern, type, extract } of VITE_ERROR_PATTERNS) {
      const match = raw.match(pattern);
      if (match) {
        const extracted = extract(match, raw);
        parsed.push({
          type,
          message: match[0],
          raw,
          ...extracted,
        });
        matched = true;
        break;
      }
    }

    if (!matched && raw.trim().length > 5) {
      parsed.push({
        type: 'unknown',
        message: raw.slice(0, 200),
        raw,
      });
    }
  }

  return parsed;
}

export function analyzeAndFix(errors: ParsedError[], files: ProjectFile[]): FixResult {
  const fixes: FixAction[] = [];
  const unfixable: ParsedError[] = [];
  const fileMap = new Map<string, ProjectFile>();

  for (const f of files) {
    fileMap.set(f.path, f);
    fileMap.set('./' + f.path, f);
    fileMap.set('/' + f.path, f);
    const noExt = f.path.replace(/\.\w+$/, '');
    fileMap.set(noExt, f);
    fileMap.set('./' + noExt, f);
  }

  for (const error of errors) {
    const errorFixes = generateFixes(error, files, fileMap);
    if (errorFixes.length > 0) {
      fixes.push(...errorFixes);
    } else {
      unfixable.push(error);
    }
  }

  const deduped = deduplicateFixes(fixes);

  return {
    errors,
    fixes: deduped,
    unfixable,
    summary: buildSummary(deduped, unfixable),
  };
}

function generateFixes(error: ParsedError, files: ProjectFile[], fileMap: Map<string, ProjectFile>): FixAction[] {
  switch (error.type) {
    case 'missing_import':
      return fixMissingImport(error, files, fileMap);
    case 'missing_module':
      return fixMissingModule(error, files);
    case 'missing_file':
      return fixMissingFile(error, files, fileMap);
    case 'export_mismatch':
      return fixExportMismatch(error, files, fileMap);
    case 'syntax':
      return fixSyntaxError(error, files, fileMap);
    case 'reference_error':
      return fixReferenceError(error, files);
    case 'jsx_error':
      return fixJsxError(error, files, fileMap);
    case 'css_error':
      return fixCssError(error, files);
    case 'hook_violation':
      return fixHookViolation(error, files);
    case 'config':
      return fixConfigError(error, files);
    case 'dependency_conflict':
      return fixDependencyConflict(error, files);
    default:
      return [];
  }
}

function fixMissingImport(error: ParsedError, files: ProjectFile[], fileMap: Map<string, ProjectFile>): FixAction[] {
  const fixes: FixAction[] = [];
  const importPath = error.importName || '';
  const sourceFile = error.filePath ? findFile(error.filePath, fileMap) : undefined;

  if (importPath.startsWith('.') || importPath.startsWith('/')) {
    const correctedPath = findCorrectPath(importPath, files, sourceFile?.path);
    if (correctedPath && sourceFile) {
      const oldImportRegex = new RegExp(`(['"])${escapeRegex(importPath)}\\1`, 'g');
      const newContent = sourceFile.content.replace(oldImportRegex, `'${correctedPath}'`);
      if (newContent !== sourceFile.content) {
        fixes.push({
          type: 'fix_path',
          filePath: sourceFile.path,
          description: `Fix import path: "${importPath}" -> "${correctedPath}"`,
          oldContent: sourceFile.content,
          newContent,
          confidence: 'high',
        });
      }
    } else {
      const missingFile = generateMissingFile(importPath, sourceFile);
      if (missingFile) {
        fixes.push(missingFile);
      }
    }
  } else {
    if (COMMON_PACKAGES[importPath]) {
      fixes.push({
        type: 'add_dependency',
        filePath: 'package.json',
        description: `Add missing package: ${importPath}`,
        newContent: '',
        packageName: importPath,
        packageVersion: COMMON_PACKAGES[importPath],
        confidence: 'high',
      });
    } else {
      const baseName = importPath.split('/')[0];
      const scopedName = importPath.startsWith('@') ? importPath.split('/').slice(0, 2).join('/') : baseName;

      if (COMMON_PACKAGES[scopedName]) {
        fixes.push({
          type: 'add_dependency',
          filePath: 'package.json',
          description: `Add missing package: ${scopedName}`,
          newContent: '',
          packageName: scopedName,
          packageVersion: COMMON_PACKAGES[scopedName],
          confidence: 'high',
        });
      } else {
        fixes.push({
          type: 'add_dependency',
          filePath: 'package.json',
          description: `Add missing package: ${scopedName} (latest)`,
          newContent: '',
          packageName: scopedName,
          packageVersion: 'latest',
          confidence: 'medium',
        });
      }
    }
  }

  return fixes;
}

function fixMissingModule(error: ParsedError, files: ProjectFile[]): FixAction[] {
  const moduleName = error.moduleName || '';
  if (!moduleName) return [];

  if (moduleName.startsWith('.') || moduleName.startsWith('/')) {
    const missingFile = generateMissingFile(moduleName);
    return missingFile ? [missingFile] : [];
  }

  const baseName = moduleName.startsWith('@') ? moduleName.split('/').slice(0, 2).join('/') : moduleName.split('/')[0];
  const version = COMMON_PACKAGES[baseName] || 'latest';

  return [{
    type: 'add_dependency',
    filePath: 'package.json',
    description: `Install missing module: ${baseName}`,
    newContent: '',
    packageName: baseName,
    packageVersion: version,
    confidence: 'high',
  }];
}

function fixMissingFile(error: ParsedError, files: ProjectFile[], fileMap: Map<string, ProjectFile>): FixAction[] {
  const filePath = error.filePath || '';
  if (!filePath) return [];

  const corrected = findCorrectPath(filePath, files);
  if (corrected) {
    return [];
  }

  const missingFile = generateMissingFile(filePath);
  return missingFile ? [missingFile] : [];
}

function fixExportMismatch(error: ParsedError, files: ProjectFile[], fileMap: Map<string, ProjectFile>): FixAction[] {
  const targetPath = error.filePath || '';
  const exportName = error.importName || '';
  const targetFile = findFile(targetPath, fileMap);

  if (!targetFile || !exportName) return [];

  const hasDefaultExport = /export\s+default\s/.test(targetFile.content);
  const hasNamedExport = new RegExp(`export\\s+(?:const|function|class|let|var|type|interface)\\s+${escapeRegex(exportName)}\\b`).test(targetFile.content);

  if (!hasNamedExport) {
    let newContent = targetFile.content;
    if (hasDefaultExport) {
      newContent += `\nexport const ${exportName} = {} as any;\n`;
    } else {
      newContent += `\nexport function ${exportName}() { return null; }\n`;
    }

    return [{
      type: 'patch_file',
      filePath: targetFile.path,
      description: `Add missing export "${exportName}" to ${targetFile.path}`,
      oldContent: targetFile.content,
      newContent,
      confidence: 'medium',
    }];
  }

  return [];
}

function fixSyntaxError(error: ParsedError, files: ProjectFile[], fileMap: Map<string, ProjectFile>): FixAction[] {
  const targetFile = error.filePath ? findFile(error.filePath, fileMap) : undefined;
  if (!targetFile) return [];

  const content = targetFile.content;
  let fixed = content;

  const openBraces = (content.match(/{/g) || []).length;
  const closeBraces = (content.match(/}/g) || []).length;
  if (openBraces > closeBraces) {
    fixed += '\n' + '}'.repeat(openBraces - closeBraces);
  }

  const openParens = (content.match(/\(/g) || []).length;
  const closeParens = (content.match(/\)/g) || []).length;
  if (openParens > closeParens) {
    fixed += ')'.repeat(openParens - closeParens);
  }

  fixed = fixed.replace(/<(img|br|hr|input|meta|link|area|base|col|embed|source|track|wbr)([^>]*?)(?<!\/)>/gi,
    (match, tag, attrs) => `<${tag}${attrs} />`);

  if (fixed !== content) {
    return [{
      type: 'patch_file',
      filePath: targetFile.path,
      description: `Fix syntax issues in ${targetFile.path}`,
      oldContent: content,
      newContent: fixed,
      confidence: 'medium',
    }];
  }

  return [];
}

function fixReferenceError(error: ParsedError, files: ProjectFile[]): FixAction[] {
  const varName = error.importName || '';
  if (!varName) return [];

  if (REACT_HOOKS.includes(varName)) {
    for (const file of files) {
      if (file.content.includes(varName) && !file.content.includes(`import`) && /\.(jsx|tsx)$/.test(file.path)) {
        const importStatement = `import { ${varName} } from 'react';\n`;
        return [{
          type: 'patch_file',
          filePath: file.path,
          description: `Add missing import for ${varName} from 'react'`,
          oldContent: file.content,
          newContent: importStatement + file.content,
          confidence: 'high',
        }];
      }

      if (file.content.includes(varName) && /\.(jsx|tsx)$/.test(file.path)) {
        const reactImportMatch = file.content.match(/import\s*{([^}]*)}\s*from\s*['"]react['"]/);
        if (reactImportMatch && !reactImportMatch[1].includes(varName)) {
          const currentImports = reactImportMatch[1].trim();
          const newImports = currentImports ? `${currentImports}, ${varName}` : varName;
          const newContent = file.content.replace(reactImportMatch[0], `import { ${newImports} } from 'react'`);
          return [{
            type: 'patch_file',
            filePath: file.path,
            description: `Add ${varName} to React imports in ${file.path}`,
            oldContent: file.content,
            newContent,
            confidence: 'high',
          }];
        }
      }
    }
  }

  return [];
}

function fixJsxError(error: ParsedError, files: ProjectFile[], fileMap: Map<string, ProjectFile>): FixAction[] {
  const componentName = error.importName || '';
  if (!componentName) return [];

  for (const file of files) {
    if (/\.(jsx|tsx)$/.test(file.path) && file.content.includes(`<${componentName}`)) {
      const hasImport = file.content.includes(`import`) && file.content.includes(componentName);
      if (!hasImport) {
        const possibleSource = files.find(f => 
          f.path !== file.path && 
          (f.content.includes(`export default function ${componentName}`) ||
           f.content.includes(`export function ${componentName}`) ||
           f.content.includes(`export const ${componentName}`))
        );

        if (possibleSource) {
          const relativePath = getRelativePath(file.path, possibleSource.path);
          const importStatement = `import { ${componentName} } from '${relativePath}';\n`;
          return [{
            type: 'patch_file',
            filePath: file.path,
            description: `Add import for component ${componentName} from ${possibleSource.path}`,
            oldContent: file.content,
            newContent: importStatement + file.content,
            confidence: 'high',
          }];
        }
      }
    }
  }

  return [];
}

function fixCssError(error: ParsedError, files: ProjectFile[]): FixAction[] {
  const atRule = error.importName || '';

  if (atRule === 'tailwind' || atRule === 'apply' || atRule === 'layer' || atRule === 'screen') {
    const cssFile = files.find(f => f.path.endsWith('.css') && f.content.includes(`@${atRule}`));
    if (cssFile) {
      return [{
        type: 'patch_file',
        filePath: cssFile.path,
        description: `CSS @${atRule} requires PostCSS/Tailwind configuration`,
        oldContent: cssFile.content,
        newContent: cssFile.content,
        confidence: 'low',
      }];
    }
  }

  return [];
}

function fixHookViolation(error: ParsedError, files: ProjectFile[]): FixAction[] {
  const pkgFile = files.find(f => f.path === 'package.json' || f.path.endsWith('/package.json'));
  if (!pkgFile) return [];

  try {
    const pkg = JSON.parse(pkgFile.content);
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };

    if (deps['react'] && deps['react-dom']) {
      const reactVersion = deps['react'].replace(/[\^~]/, '');
      const reactDomVersion = deps['react-dom'].replace(/[\^~]/, '');
      if (reactVersion !== reactDomVersion) {
        const newPkg = { ...pkg };
        newPkg.dependencies = { ...newPkg.dependencies, 'react-dom': deps['react'] };
        return [{
          type: 'patch_file',
          filePath: pkgFile.path,
          description: 'Align react and react-dom versions',
          oldContent: pkgFile.content,
          newContent: JSON.stringify(newPkg, null, 2),
          confidence: 'high',
        }];
      }
    }
  } catch {}

  return [];
}

function fixConfigError(error: ParsedError, files: ProjectFile[]): FixAction[] {
  return [];
}

function fixDependencyConflict(error: ParsedError, files: ProjectFile[]): FixAction[] {
  return [];
}

function findFile(path: string, fileMap: Map<string, ProjectFile>): ProjectFile | undefined {
  const cleanPath = path.replace(/^\.?\//, '');
  return fileMap.get(path) || fileMap.get(cleanPath) || fileMap.get('./' + cleanPath) || fileMap.get('/' + cleanPath);
}

function findCorrectPath(importPath: string, files: ProjectFile[], fromFile?: string): string | null {
  const cleanImport = importPath.replace(/^\.\//, '').replace(/^\//, '');

  for (const file of files) {
    const cleanFile = file.path.replace(/^\.\//, '').replace(/^\//, '');

    if (cleanFile === cleanImport) return './' + cleanFile;

    const withoutExt = cleanFile.replace(/\.\w+$/, '');
    const importWithoutExt = cleanImport.replace(/\.\w+$/, '');
    if (withoutExt === importWithoutExt) {
      if (fromFile) {
        return getRelativePath(fromFile, file.path);
      }
      return './' + cleanFile;
    }

    const fileName = cleanFile.split('/').pop()?.replace(/\.\w+$/, '');
    const importFileName = cleanImport.split('/').pop()?.replace(/\.\w+$/, '');
    if (fileName && importFileName && fileName.toLowerCase() === importFileName.toLowerCase() && fileName !== importFileName) {
      if (fromFile) {
        return getRelativePath(fromFile, file.path);
      }
      return './' + cleanFile;
    }
  }

  const extensions = ['.tsx', '.ts', '.jsx', '.js', '.css', '.json'];
  for (const ext of extensions) {
    for (const file of files) {
      const cleanFile = file.path.replace(/^\.\//, '').replace(/^\//, '');
      if (cleanFile === cleanImport + ext) {
        if (fromFile) {
          return getRelativePath(fromFile, file.path);
        }
        return './' + cleanFile;
      }

      if (cleanFile === cleanImport + '/index' + ext) {
        if (fromFile) {
          return getRelativePath(fromFile, file.path);
        }
        return './' + cleanFile;
      }
    }
  }

  return null;
}

function generateMissingFile(importPath: string, sourceFile?: ProjectFile): FixAction | null {
  let filePath = importPath.replace(/^\.\//, '').replace(/^\//, '');
  
  if (!/\.\w+$/.test(filePath)) {
    if (importPath.includes('component') || importPath.includes('Component') || /^[A-Z]/.test(filePath.split('/').pop() || '')) {
      filePath += '.tsx';
    } else if (importPath.includes('style') || importPath.includes('css')) {
      filePath += '.css';
    } else {
      filePath += '.ts';
    }
  }

  const ext = filePath.split('.').pop() || '';
  const baseName = filePath.split('/').pop()?.replace(/\.\w+$/, '') || 'Component';
  const componentName = baseName.charAt(0).toUpperCase() + baseName.slice(1);

  let content = '';

  if (ext === 'tsx' || ext === 'jsx') {
    content = `export default function ${componentName}() {\n  return (\n    <div>\n      <h2>${componentName}</h2>\n      <p>This component is under construction.</p>\n    </div>\n  );\n}\n`;

    if (sourceFile) {
      const importRegex = new RegExp(`import\\s*{([^}]*)}\\s*from\\s*['"].*?${escapeRegex(baseName)}['"]`);
      const importMatch = sourceFile.content.match(importRegex);
      if (importMatch) {
        const namedExports = importMatch[1].split(',').map(s => s.trim()).filter(Boolean);
        const exports = namedExports
          .filter(n => n !== 'default' && n !== componentName)
          .map(n => `export const ${n} = null;\n`)
          .join('');
        if (exports) {
          content += '\n' + exports;
        }
      }
    }
  } else if (ext === 'ts' || ext === 'js') {
    content = `// ${baseName} module\n\nexport default {};\n`;

    if (sourceFile) {
      const importRegex = new RegExp(`import\\s*{([^}]*)}\\s*from\\s*['"].*?${escapeRegex(baseName)}['"]`);
      const importMatch = sourceFile.content.match(importRegex);
      if (importMatch) {
        const namedExports = importMatch[1].split(',').map(s => s.trim()).filter(Boolean);
        content = `// ${baseName} module\n\n`;
        for (const name of namedExports) {
          content += `export const ${name} = null;\n`;
        }
        content += '\nexport default {};\n';
      }
    }
  } else if (ext === 'css') {
    content = `/* ${baseName} styles */\n`;
  } else if (ext === 'json') {
    content = '{}';
  } else {
    return null;
  }

  return {
    type: 'create_file',
    filePath,
    description: `Generate missing file: ${filePath}`,
    newContent: content,
    confidence: 'medium',
  };
}

function getRelativePath(from: string, to: string): string {
  const fromParts = from.replace(/^\.\//, '').split('/');
  fromParts.pop();
  const toParts = to.replace(/^\.\//, '').split('/');

  let commonLength = 0;
  for (let i = 0; i < Math.min(fromParts.length, toParts.length); i++) {
    if (fromParts[i] === toParts[i]) {
      commonLength++;
    } else {
      break;
    }
  }

  const upCount = fromParts.length - commonLength;
  const upPath = upCount > 0 ? '../'.repeat(upCount) : './';
  const downPath = toParts.slice(commonLength).join('/');

  const result = upPath + downPath;
  return result.replace(/\.\w+$/, '');
}

function deduplicateFixes(fixes: FixAction[]): FixAction[] {
  const seen = new Set<string>();
  return fixes.filter(fix => {
    const key = `${fix.type}:${fix.filePath}:${fix.description}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function buildSummary(fixes: FixAction[], unfixable: ParsedError[]): string {
  const parts: string[] = [];

  const byType = fixes.reduce((acc, f) => {
    acc[f.type] = (acc[f.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (byType['fix_path']) parts.push(`${byType['fix_path']} import path(s) corrected`);
  if (byType['create_file']) parts.push(`${byType['create_file']} missing file(s) generated`);
  if (byType['add_dependency']) parts.push(`${byType['add_dependency']} dependency(ies) added`);
  if (byType['patch_file']) parts.push(`${byType['patch_file']} file(s) patched`);
  if (byType['delete_import']) parts.push(`${byType['delete_import']} import(s) removed`);

  if (unfixable.length > 0) {
    parts.push(`${unfixable.length} issue(s) need manual review`);
  }

  return parts.length > 0 ? parts.join(', ') : 'No fixes needed';
}

export function validateImportPaths(files: ProjectFile[]): FixAction[] {
  const fixes: FixAction[] = [];
  const filePaths = new Set(files.map(f => f.path.replace(/^\.\//, '')));
  const filePathsNoExt = new Set(files.map(f => f.path.replace(/^\.\//, '').replace(/\.\w+$/, '')));

  for (const file of files) {
    if (!/\.(js|jsx|ts|tsx)$/.test(file.path)) continue;

    const importRegex = /import\s+(?:.*?\s+from\s+)?['"](\.[^'"]+)['"]/g;
    let match;
    let newContent = file.content;
    let changed = false;

    while ((match = importRegex.exec(file.content)) !== null) {
      const importPath = match[1];
      const resolvedPath = resolveImportPath(file.path, importPath);

      if (!resolvedPath) continue;

      const exists = filePaths.has(resolvedPath) || filePathsNoExt.has(resolvedPath.replace(/\.\w+$/, ''));
      
      if (!exists) {
        const correctedPath = findCorrectPath(importPath, files, file.path);
        if (correctedPath) {
          newContent = newContent.replace(
            new RegExp(`(['"])${escapeRegex(importPath)}\\1`),
            `'${correctedPath}'`
          );
          changed = true;
        }
      }
    }

    if (changed) {
      fixes.push({
        type: 'fix_path',
        filePath: file.path,
        description: `Fix import paths in ${file.path}`,
        oldContent: file.content,
        newContent,
        confidence: 'high',
      });
    }
  }

  return fixes;
}

function resolveImportPath(fromFile: string, importPath: string): string | null {
  if (!importPath.startsWith('.')) return null;

  const fromDir = fromFile.replace(/^\.\//, '').split('/').slice(0, -1).join('/');
  const parts = importPath.split('/');
  const resultParts = fromDir ? fromDir.split('/') : [];

  for (const part of parts) {
    if (part === '.') continue;
    if (part === '..') {
      resultParts.pop();
    } else {
      resultParts.push(part);
    }
  }

  return resultParts.join('/');
}

export function addDependenciesToPackageJson(packageJsonContent: string, dependencies: { name: string; version: string }[]): string {
  try {
    const pkg = JSON.parse(packageJsonContent);
    if (!pkg.dependencies) pkg.dependencies = {};

    for (const dep of dependencies) {
      if (!pkg.dependencies[dep.name]) {
        pkg.dependencies[dep.name] = dep.version;
      }
    }

    return JSON.stringify(pkg, null, 2);
  } catch {
    return packageJsonContent;
  }
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
