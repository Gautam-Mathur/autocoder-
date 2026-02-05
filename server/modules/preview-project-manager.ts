import * as fs from 'fs';
import * as path from 'path';
import { ChildProcess, spawn } from 'child_process';

const PREVIEW_BASE_DIR = '/tmp/preview-projects';
const PREVIEW_PORT = 5200;

let viteProcess: ChildProcess | null = null;
let currentProjectId: number | null = null;

export interface PreviewProject {
  conversationId: number;
  projectPath: string;
  files: Array<{ path: string; content: string }>;
}

function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function getProjectPath(conversationId: number): string {
  return path.join(PREVIEW_BASE_DIR, `conversation-${conversationId}`);
}

const basePackageJson = {
  name: "preview-project",
  private: true,
  version: "0.0.0",
  type: "module",
  scripts: {
    dev: "vite --port 5200 --host",
    build: "vite build",
    preview: "vite preview"
  },
  dependencies: {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "wouter": "^3.0.0",
    "@tanstack/react-query": "^5.0.0"
  },
  devDependencies: {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.2.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.2.0",
    "vite": "^5.0.0"
  }
};

const viteConfig = `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/lib': path.resolve(__dirname, './src/lib'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
    },
  },
  server: {
    port: 5200,
    host: true,
    strictPort: true,
  },
});
`;

const tailwindConfig = `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
`;

const postcssConfig = `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
`;

const indexHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Preview</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`;

const mainTsx = `import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
`;

const indexCss = `@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
`;

const defaultAppTsx = `import { useState } from 'react';

export function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
      <div className="text-center p-8 rounded-2xl bg-white/10 backdrop-blur border border-white/20">
        <h1 className="text-4xl font-bold text-white mb-4">Preview Ready</h1>
        <p className="text-slate-300 mb-6">Your generated project is running</p>
        <div className="text-6xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-6">
          {count}
        </div>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => setCount(c => c - 1)}
            className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition"
          >
            -
          </button>
          <button
            onClick={() => setCount(0)}
            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-semibold transition"
          >
            Reset
          </button>
          <button
            onClick={() => setCount(c => c + 1)}
            className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-semibold transition"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
`;

const tsConfig = `{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
`;

const tsConfigNode = `{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
`;

function cleanupCode(content: string): string {
  let code = content;
  
  // Fix import statements with semicolons inside braces: import { foo; } -> import { foo }
  code = code.replace(/import\s*\{\s*([^};]+)\s*;+\s*\}/g, 'import { $1 }');
  code = code.replace(/import\s*\{([^}]*);+([^}]*)\}/g, (_: string, before: string, after: string) => {
    const items = (before + after).split(/[,\s]+/).filter((s: string) => s && s !== ';');
    return `import { ${items.join(', ')} }`;
  });
  code = code.replace(/import\s*\{\s*\n+\s*([^}]*)\}/g, 'import { $1 }');
  
  // Fix return statements with semicolons
  code = code.replace(/return\s*\(\s*;+\s*/g, 'return (\n');
  code = code.replace(/return\s*\(\s*\n\s*;+\s*/g, 'return (\n');
  code = code.replace(/return\s*;+\s*\(/g, 'return (');
  code = code.replace(/return\s*;+(\s*<)/g, 'return ($1');
  code = code.replace(/\(\s*;+\s*(\n\s*<)/g, '($1');
  code = code.replace(/\(\s*;+\s*</g, '(\n<');
  code = code.replace(/;\s*(\n\s*<[A-Z])/g, '$1');
  
  // Fix stray semicolons after opening brackets in arrays/objects
  // = [; -> = [
  code = code.replace(/=\s*\[\s*;+/g, '= [');
  // = {; -> = {
  code = code.replace(/=\s*\{\s*;+/g, '= {');
  // [ ; { -> [ {
  code = code.replace(/\[\s*;+\s*\{/g, '[\n  {');
  // { ; something -> { something
  code = code.replace(/\{\s*;+\s*([a-zA-Z])/g, '{ $1');
  
  // ============ COMPREHENSIVE JSX FIX PATTERNS ============
  
  // 1. Fix case mismatch for ALL common React components
  // AI sometimes generates lowercase HTML tags when it means React components
  const componentMappings = [
    // Routing
    ['link', 'Link'],
    ['navlink', 'NavLink'],
    ['route', 'Route'],
    ['router', 'Router'],
    ['switch', 'Switch'],
    ['redirect', 'Redirect'],
    // UI Components (shadcn/common)
    ['button', 'Button'],
    ['card', 'Card'],
    ['input', 'Input'],
    ['select', 'Select'],
    ['textarea', 'Textarea'],
    ['checkbox', 'Checkbox'],
    ['radio', 'Radio'],
    ['label', 'Label'],
    ['badge', 'Badge'],
    ['avatar', 'Avatar'],
    ['dialog', 'Dialog'],
    ['modal', 'Modal'],
    ['dropdown', 'Dropdown'],
    ['popover', 'Popover'],
    ['tooltip', 'Tooltip'],
    ['tabs', 'Tabs'],
    ['accordion', 'Accordion'],
    ['alert', 'Alert'],
    ['toast', 'Toast'],
    ['skeleton', 'Skeleton'],
    ['spinner', 'Spinner'],
    ['progress', 'Progress'],
    ['slider', 'Slider'],
    ['switch', 'Switch'],
    ['toggle', 'Toggle'],
    ['separator', 'Separator'],
    ['scrollarea', 'ScrollArea'],
    ['sheet', 'Sheet'],
    ['sidebar', 'Sidebar'],
  ];
  
  for (const [lower, proper] of componentMappings) {
    // Fix opening tags with attributes that indicate it's a component (className, variant, etc.)
    const openPattern = new RegExp(`<${lower}(\\s+[^>]*(className|variant|size|onClick|onChange|disabled)=)`, 'gi');
    code = code.replace(openPattern, `<${proper}$1`);
    // Fix closing tags when there's a corresponding uppercase usage nearby
    const closePattern = new RegExp(`<\\/${lower}>`, 'gi');
    code = code.replace(closePattern, `</${proper}>`);
  }
  
  // 2. Fix self-closing component patterns with JSX attributes
  // <icon className=... /> or <item.icon className=... />
  // These need proper handling for dynamic components
  
  // 3. Fix mismatched JSX closing tags - common AI generation errors
  // Remove redundant </a> before </Link>, </Card>, </Button>, etc.
  code = code.replace(/<\/a>\s*\n?\s*<\/Link>/g, '</Link>');
  code = code.replace(/<\/a>\s*\n?\s*<\/Card>/g, '</Card>');
  code = code.replace(/<\/a>\s*\n?\s*<\/Button>/g, '</Button>');
  
  // Remove orphan </a> that appears before any </Component> pattern (PascalCase)
  code = code.replace(/<\/a>\s*\n(\s*)<\/([A-Z][a-zA-Z]+)>/g, '\n$1</$2>');
  
  // Remove nested intermediate closing tags in common patterns
  code = code.replace(/(<\/span>)\s*\n\s*<\/a>\s*\n\s*(<\/[A-Z][a-zA-Z]+>)/g, '$1\n      $2');
  code = code.replace(/(<\/div>)\s*\n\s*<\/a>\s*\n\s*(<\/[A-Z][a-zA-Z]+>)/g, '$1\n      $2');
  code = code.replace(/(<\/[^>]+>)\s*\n\s*<\/a>\s*\n\s*(<\/[A-Z][a-zA-Z]+>)/g, '$1\n      $2');
  
  // 4. Fix duplicate closing tags
  code = code.replace(/<\/Link>\s*<\/Link>/g, '</Link>');
  code = code.replace(/<\/Button>\s*<\/Button>/g, '</Button>');
  code = code.replace(/<\/Card>\s*<\/Card>/g, '</Card>');
  code = code.replace(/<\/a>\s*<\/a>/g, '</a>');
  code = code.replace(/<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/g, '</div></div></div>'); // Too many nested divs
  
  // 5. Fix common opening tag issues
  // <a href=...> followed by </Link> should be <Link href=...>
  code = code.replace(/<a\s+href=([^>]+)>([\s\S]*?)<\/Link>/g, '<Link href=$1>$2</Link>');
  
  // 6. Fix icon rendering patterns - dynamic component from variable
  // <item.icon should use proper component syntax
  code = code.replace(/<item\.icon(\s+)/g, '<item.icon$1');
  code = code.replace(/<Icon(\s+)/g, '<Icon$1');
  
  // Clean up multiple semicolons and empty lines
  code = code.replace(/;{2,}/g, ';');
  code = code.replace(/\{\s*;+\s*}/g, '{}');
  code = code.replace(/^\s*;\s*$/gm, '');
  
  return code;
}

export async function preparePreviewProject(
  conversationId: number,
  files: Array<{ path: string; content: string }>
): Promise<string> {
  const projectPath = getProjectPath(conversationId);
  
  ensureDir(projectPath);
  ensureDir(path.join(projectPath, 'src'));
  ensureDir(path.join(projectPath, 'src', 'components'));
  ensureDir(path.join(projectPath, 'src', 'pages'));
  ensureDir(path.join(projectPath, 'src', 'lib'));
  ensureDir(path.join(projectPath, 'src', 'hooks'));
  
  fs.writeFileSync(path.join(projectPath, 'package.json'), JSON.stringify(basePackageJson, null, 2));
  fs.writeFileSync(path.join(projectPath, 'vite.config.ts'), viteConfig);
  fs.writeFileSync(path.join(projectPath, 'tailwind.config.js'), tailwindConfig);
  fs.writeFileSync(path.join(projectPath, 'postcss.config.js'), postcssConfig);
  fs.writeFileSync(path.join(projectPath, 'index.html'), indexHtml);
  fs.writeFileSync(path.join(projectPath, 'tsconfig.json'), tsConfig);
  fs.writeFileSync(path.join(projectPath, 'tsconfig.node.json'), tsConfigNode);
  
  let hasMain = false;
  let hasIndexCss = false;
  let hasApp = false;
  
  for (const file of files) {
    let filePath = file.path;
    
    if (filePath.startsWith('client/')) {
      filePath = filePath.replace('client/', '');
    }
    
    // Skip files we always provide (to ensure correct Vite configuration)
    if (filePath === 'index.html' || filePath === 'package.json' || 
        filePath === 'vite.config.ts' || filePath === 'vite.config.js' ||
        filePath === 'tsconfig.json') {
      continue;
    }
    
    if (!filePath.startsWith('src/') && 
        (filePath.endsWith('.tsx') || filePath.endsWith('.ts') || filePath.endsWith('.css')) &&
        !filePath.includes('/')) {
      filePath = 'src/' + filePath;
    }
    
    if (filePath === 'src/main.tsx') hasMain = true;
    if (filePath === 'src/index.css') hasIndexCss = true;
    if (filePath === 'src/App.tsx' || filePath === 'src/App.jsx') hasApp = true;
    
    const fullPath = path.join(projectPath, filePath);
    const dir = path.dirname(fullPath);
    ensureDir(dir);
    
    const cleanedContent = cleanupCode(file.content);
    fs.writeFileSync(fullPath, cleanedContent);
  }
  
  if (!hasMain) {
    fs.writeFileSync(path.join(projectPath, 'src', 'main.tsx'), mainTsx);
  }
  if (!hasIndexCss) {
    fs.writeFileSync(path.join(projectPath, 'src', 'index.css'), indexCss);
  }
  if (!hasApp) {
    fs.writeFileSync(path.join(projectPath, 'src', 'App.tsx'), defaultAppTsx);
  }
  
  return projectPath;
}

export async function startPreviewServer(conversationId: number): Promise<{ url: string; success: boolean; error?: string }> {
  const projectPath = getProjectPath(conversationId);
  
  if (!fs.existsSync(projectPath)) {
    return { url: '', success: false, error: 'Project not found. Prepare the project first.' };
  }
  
  if (viteProcess && currentProjectId === conversationId) {
    return { url: `http://localhost:${PREVIEW_PORT}`, success: true };
  }
  
  await stopPreviewServer();
  
  try {
    const npmInstall = spawn('npm', ['install'], {
      cwd: projectPath,
      stdio: 'pipe',
      shell: true
    });
    
    await new Promise<void>((resolve, reject) => {
      npmInstall.on('close', (code) => {
        if (code === 0) resolve();
        else reject(new Error(`npm install failed with code ${code}`));
      });
      npmInstall.on('error', reject);
      
      setTimeout(() => resolve(), 30000);
    });
    
    viteProcess = spawn('npm', ['run', 'dev'], {
      cwd: projectPath,
      stdio: 'pipe',
      shell: true,
      env: { ...process.env, FORCE_COLOR: '0' }
    });
    
    currentProjectId = conversationId;
    
    return new Promise((resolve) => {
      let resolved = false;
      
      const onData = (data: Buffer) => {
        const output = data.toString();
        console.log('[Preview Vite]', output);
        
        if (!resolved && (output.includes('Local:') || output.includes('ready in') || output.includes(`${PREVIEW_PORT}`))) {
          resolved = true;
          resolve({ url: `http://localhost:${PREVIEW_PORT}`, success: true });
        }
      };
      
      viteProcess!.stdout?.on('data', onData);
      viteProcess!.stderr?.on('data', onData);
      
      viteProcess!.on('error', (err) => {
        if (!resolved) {
          resolved = true;
          resolve({ url: '', success: false, error: err.message });
        }
      });
      
      setTimeout(() => {
        if (!resolved) {
          resolved = true;
          resolve({ url: `http://localhost:${PREVIEW_PORT}`, success: true });
        }
      }, 10000);
    });
  } catch (error: any) {
    return { url: '', success: false, error: error.message };
  }
}

export async function stopPreviewServer(): Promise<void> {
  if (viteProcess) {
    viteProcess.kill('SIGTERM');
    viteProcess = null;
    currentProjectId = null;
    
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

export function getPreviewStatus(): { running: boolean; conversationId: number | null; port: number } {
  return {
    running: viteProcess !== null,
    conversationId: currentProjectId,
    port: PREVIEW_PORT
  };
}

export function cleanupOldProjects(maxAge: number = 24 * 60 * 60 * 1000): void {
  if (!fs.existsSync(PREVIEW_BASE_DIR)) return;
  
  const now = Date.now();
  const dirs = fs.readdirSync(PREVIEW_BASE_DIR);
  
  for (const dir of dirs) {
    const dirPath = path.join(PREVIEW_BASE_DIR, dir);
    const stat = fs.statSync(dirPath);
    
    if (now - stat.mtimeMs > maxAge) {
      fs.rmSync(dirPath, { recursive: true, force: true });
    }
  }
}
