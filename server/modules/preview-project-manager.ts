import * as fs from 'fs';
import * as path from 'path';
import { ChildProcess, spawn } from 'child_process';

const PREVIEW_BASE_DIR = '/tmp/preview-projects';
const PREVIEW_PORT = 6000;

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
    dev: "vite --port 6000 --host",
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
    port: 6000,
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
  
  code = code.replace(/return\s*\(\s*;+\s*/g, 'return (\n');
  code = code.replace(/return\s*\(\s*\n\s*;+\s*/g, 'return (\n');
  code = code.replace(/return\s*;+\s*\(/g, 'return (');
  code = code.replace(/return\s*;+(\s*<)/g, 'return ($1');
  code = code.replace(/\(\s*;+\s*(\n\s*<)/g, '($1');
  code = code.replace(/\(\s*;+\s*</g, '(\n<');
  code = code.replace(/;\s*(\n\s*<[A-Z])/g, '$1');
  code = code.replace(/;{2,}/g, ';');
  code = code.replace(/\{\s*;+\s*}/g, '{}');
  code = code.replace(/^\s*;\s*$/gm, '');
  code = code.replace(/import\s*\{([^}]*);+\s*\n?\s*\}/g, 'import {$1}');
  code = code.replace(/import\s*\{\s*\n+\s*([^}]*)\}/g, 'import { $1 }');
  
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
  
  for (const file of files) {
    let filePath = file.path;
    
    if (filePath.startsWith('client/')) {
      filePath = filePath.replace('client/', '');
    }
    
    if (!filePath.startsWith('src/') && 
        (filePath.endsWith('.tsx') || filePath.endsWith('.ts') || filePath.endsWith('.css')) &&
        !filePath.includes('/')) {
      filePath = 'src/' + filePath;
    }
    
    if (filePath === 'src/main.tsx') hasMain = true;
    if (filePath === 'src/index.css') hasIndexCss = true;
    
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
