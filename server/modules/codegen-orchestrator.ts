import type { ProjectPlan, PlannedPage, PlannedEntity } from './plan-generator.js';
import type { ReasoningResult, UIPattern } from './contextual-reasoning-engine.js';
import type { DesignSystem } from './design-system-engine.js';
import {
  getAllBaseComponents,
  resolveComponentDependencies,
  collectNpmPackages,
  type ComponentTemplate,
} from './codegen-components.js';
import {
  generateListPage,
  generateDetailPage,
  generateDashboardPage,
  generateGenericPage,
} from './codegen-page-builder.js';
import { validateGeneratedProject, formatValidationReport } from './codegen-validator.js';

interface GeneratedFile {
  path: string;
  content: string;
  language: string;
}

function toKebab(str: string): string {
  return str.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '').replace(/[\s_]+/g, '-');
}

function toSnakeCase(str: string): string {
  return str.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '');
}

function toTitle(str: string): string {
  return str.replace(/([A-Z])/g, ' $1').replace(/[_-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()).trim();
}

function toCamel(str: string): string {
  return str.charAt(0).toLowerCase() + str.slice(1);
}

function toSlug(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

const AVAILABLE_DEPS: Record<string, string> = {
  'react': '^18.3.1',
  'react-dom': '^18.3.1',
  '@tanstack/react-query': '^5.60.5',
  'wouter': '^3.3.5',
  'lucide-react': '^0.453.0',
  'tailwindcss': '^3.4.14',
  'autoprefixer': '^10.4.20',
  'postcss': '^8.4.47',
  'clsx': '^2.1.1',
  'tailwind-merge': '^2.5.4',
  'recharts': '^2.13.3',
  'date-fns': '^4.1.0',
  'zod': '^3.23.8',
  'express': '^4.21.1',
};

const DEV_DEPS: Record<string, string> = {
  '@types/react': '^18.3.12',
  '@types/react-dom': '^18.3.1',
  '@vitejs/plugin-react': '^4.3.3',
  'typescript': '^5.6.3',
  'vite': '^5.4.10',
  'vitest': '^2.1.4',
};

export function generateProject(
  plan: ProjectPlan,
  reasoning: ReasoningResult | null,
  designSystem: DesignSystem | undefined
): { files: GeneratedFile[]; validation: ReturnType<typeof validateGeneratedProject>; report: string } {
  const files: GeneratedFile[] = [];

  const allBaseComponents = getAllBaseComponents(plan);

  const requiredComponentIds = determineRequiredComponents(plan, reasoning);
  const resolvedComponents = resolveComponentDependencies(requiredComponentIds, allBaseComponents);

  for (const comp of resolvedComponents) {
    files.push({ path: comp.path, content: comp.content, language: comp.language });
  }

  const additionalNpmPackages = collectNpmPackages(resolvedComponents);

  files.push(generatePackageJson(plan, additionalNpmPackages));
  files.push(generateIndexHtml(plan));
  files.push(generateMainTsx());
  files.push(generateViteConfig());
  files.push(generateTailwindConfig());
  files.push(generatePostcssConfig());
  files.push(generateTsConfig());
  files.push(generateIndexCss(designSystem));
  files.push(generateSharedSchema(plan, reasoning));
  files.push(generateServerRoutes(plan, reasoning));
  files.push(generateServerIndex(plan));

  for (const page of plan.pages) {
    const content = generatePageContent(page, plan, reasoning);
    files.push({
      path: `src/pages/${toKebab(page.componentName)}.tsx`,
      content,
      language: 'tsx',
    });
  }

  files.push(generateAppTsx(plan));

  const validation = validateGeneratedProject(files);
  const report = formatValidationReport(validation);

  return { files, validation, report };
}

function determineRequiredComponents(plan: ProjectPlan, reasoning: ReasoningResult | null): string[] {
  const required = [
    'lib-utils',
    'lib-queryClient',
    'hook-useToast',
    'ui-button',
    'ui-card',
    'ui-input',
    'ui-label',
    'ui-dialog',
    'ui-toaster',
    'comp-confirm-dialog',
    'comp-loading-skeleton',
    'comp-theme-provider',
  ];

  const hasStatus = plan.dataModel.some(e => e.fields.some(f => f.name === 'status'));
  if (hasStatus) {
    required.push('comp-status-badge', 'ui-badge');
  }

  const hasTextarea = plan.dataModel.some(e =>
    e.fields.some(f => {
      const sem = reasoning?.fieldSemantics?.get(e.name)?.find(s => s.fieldName === f.name);
      return sem?.inputType === 'textarea';
    })
  );
  if (hasTextarea) required.push('ui-textarea');

  const hasSelect = plan.dataModel.some(e =>
    e.fields.some(f => f.type.includes('enum') || f.name === 'status')
  );
  if (hasSelect) required.push('ui-select');

  const hasDashboard = plan.pages.some(p =>
    p.name.toLowerCase().includes('dashboard') || p.features?.includes('dashboard')
  );
  if (hasDashboard) required.push('comp-kpi-card');

  const hasMultipleEntities = plan.dataModel.length > 2;
  if (hasMultipleEntities) required.push('comp-empty-state');

  const uiPatterns = reasoning?.uiPatterns || [];
  if (uiPatterns.some(p => ['kanban', 'card-grid'].includes(p.pattern))) {
    required.push('ui-badge');
  }

  required.push('ui-tabs');

  return required;
}

function generatePageContent(page: PlannedPage, plan: ProjectPlan, reasoning: ReasoningResult | null): string {
  const pageType = classifyPage(page, plan);
  const uiPattern = reasoning?.uiPatterns?.find(p => p.entityName === page.dataNeeded?.[0]);

  switch (pageType) {
    case 'list':
      return generateListPage(page, plan, reasoning, uiPattern);
    case 'detail':
      return generateDetailPage(page, plan, reasoning);
    case 'dashboard':
      return generateDashboardPage(page, plan, reasoning);
    default:
      return generateGenericPage(page);
  }
}

function classifyPage(page: PlannedPage, plan: ProjectPlan): 'list' | 'detail' | 'dashboard' | 'generic' {
  const nameLower = page.name.toLowerCase();
  const pathLower = page.path.toLowerCase();
  const feats = (page.features || []).map(f => f.toLowerCase());

  if (nameLower.includes('dashboard') || feats.includes('dashboard') || pathLower === '/' || pathLower === '/dashboard') {
    return 'dashboard';
  }

  if (pathLower.includes('/:id') || nameLower.includes('detail') || nameLower.includes('view ')) {
    return 'detail';
  }

  if (page.dataNeeded?.length > 0) {
    const entity = plan.dataModel.find(e => e.name === page.dataNeeded[0]);
    if (entity) {
      return 'list';
    }
  }

  if (feats.some(f => f.includes('list') || f.includes('table') || f.includes('crud'))) {
    return 'list';
  }

  return 'generic';
}

function generatePackageJson(plan: ProjectPlan, additionalPackages: Set<string>): GeneratedFile {
  const deps: Record<string, string> = { ...AVAILABLE_DEPS };

  for (const pkg of Array.from(additionalPackages.values())) {
    if (AVAILABLE_DEPS[pkg]) {
      deps[pkg] = AVAILABLE_DEPS[pkg];
    }
  }

  const content = JSON.stringify({
    name: toSlug(plan.projectName),
    private: true,
    version: '1.0.0',
    type: 'module',
    scripts: {
      dev: 'vite',
      build: 'vite build',
      preview: 'vite preview',
    },
    dependencies: deps,
    devDependencies: DEV_DEPS,
  }, null, 2);

  return { path: 'package.json', content, language: 'json' };
}

function generateIndexHtml(plan: ProjectPlan): GeneratedFile {
  return {
    path: 'index.html',
    language: 'html',
    content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${plan.projectName}</title>
    <meta name="description" content="${plan.overview}" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`,
  };
}

function generateMainTsx(): GeneratedFile {
  return {
    path: 'src/main.tsx',
    language: 'tsx',
    content: `import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

document.documentElement.classList.add("dark");

createRoot(document.getElementById("root")!).render(<App />);
`,
  };
}

function generateViteConfig(): GeneratedFile {
  return {
    path: 'vite.config.ts',
    language: 'typescript',
    content: `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, './shared'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5200,
  },
});
`,
  };
}

function generateTailwindConfig(): GeneratedFile {
  return {
    path: 'tailwind.config.ts',
    language: 'typescript',
    content: `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      borderColor: {
        border: "hsl(var(--border))",
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
};
`,
  };
}

function generatePostcssConfig(): GeneratedFile {
  return {
    path: 'postcss.config.js',
    language: 'javascript',
    content: `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
`,
  };
}

function generateTsConfig(): GeneratedFile {
  return {
    path: 'tsconfig.json',
    language: 'json',
    content: JSON.stringify({
      compilerOptions: {
        target: 'ES2020',
        useDefineForClassFields: true,
        lib: ['ES2020', 'DOM', 'DOM.Iterable'],
        module: 'ESNext',
        skipLibCheck: true,
        moduleResolution: 'bundler',
        allowImportingTsExtensions: true,
        resolveJsonModule: true,
        isolatedModules: true,
        noEmit: true,
        jsx: 'react-jsx',
        strict: true,
        noUnusedLocals: false,
        noUnusedParameters: false,
        noFallthroughCasesInSwitch: true,
        paths: {
          '@/*': ['./src/*'],
          '@shared/*': ['./shared/*'],
        },
        baseUrl: '.',
      },
      include: ['src'],
      references: [{ path: './tsconfig.node.json' }],
    }, null, 2),
  };
}

function generateIndexCss(designSystem: DesignSystem | undefined): GeneratedFile {
  const primary = designSystem?.primaryColor || '222 47% 11%';
  const accent = designSystem?.accentColor || '210 40% 96%';

  return {
    path: 'src/index.css',
    language: 'css',
    content: `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: ${primary};
    --card: 0 0% 100%;
    --card-foreground: ${primary};
    --popover: 0 0% 100%;
    --popover-foreground: ${primary};
    --primary: ${primary};
    --primary-foreground: 210 40% 98%;
    --secondary: ${accent};
    --secondary-foreground: ${primary};
    --muted: 210 40% 96%;
    --muted-foreground: 215 16% 47%;
    --accent: ${accent};
    --accent-foreground: ${primary};
    --destructive: 0 84% 60%;
    --destructive-foreground: 210 40% 98%;
    --border: 214 32% 91%;
    --input: 214 32% 91%;
    --ring: ${primary};
    --radius: 0.5rem;
  }

  .dark {
    --background: 222 47% 6%;
    --foreground: 210 40% 98%;
    --card: 222 47% 8%;
    --card-foreground: 210 40% 98%;
    --popover: 222 47% 8%;
    --popover-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222 47% 11%;
    --secondary: 217 33% 17%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217 33% 17%;
    --muted-foreground: 215 20% 65%;
    --accent: 217 33% 17%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 63% 31%;
    --destructive-foreground: 210 40% 98%;
    --border: 217 33% 17%;
    --input: 217 33% 17%;
    --ring: 212 27% 84%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes zoom-in-95 {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.animate-in {
  animation: fade-in 0.15s ease-out, zoom-in-95 0.15s ease-out;
}
`,
  };
}

function generateSharedSchema(plan: ProjectPlan, reasoning: ReasoningResult | null): GeneratedFile {
  const entitySchemas = plan.dataModel.map(entity => {
    const fieldLines = entity.fields.map(f => {
      const fieldName = toSnakeCase(f.name);
      let zodType = 'z.string()';

      if (f.name === 'id') return `  ${f.name}: z.number()`;
      if (f.type === 'boolean') zodType = 'z.boolean()';
      else if (f.type === 'integer' || f.type === 'number') zodType = 'z.number()';
      else if (f.type === 'real' || f.type.includes('decimal') || f.type === 'float' || f.type === 'double') zodType = 'z.number()';
      else if (f.type.includes('enum')) {
        const enumMatch = f.type.match(/enum\(([^)]+)\)/);
        if (enumMatch) {
          const values = enumMatch[1].split(',').map(v => v.trim().replace(/'/g, ''));
          zodType = `z.enum([${values.map(v => `"${v}"`).join(', ')}])`;
        }
      }

      if (!f.required && f.name !== 'id') {
        zodType += '.optional()';
      }

      return `  ${f.name}: ${zodType}`;
    }).join(',\n');

    const insertFields = entity.fields
      .filter(f => f.name !== 'id' && f.name !== 'createdAt' && f.name !== 'updatedAt')
      .map(f => {
        let zodType = 'z.string()';
        if (f.type === 'boolean') zodType = 'z.boolean()';
        else if (f.type === 'integer' || f.type === 'number') zodType = 'z.number()';
        else if (f.type === 'real' || f.type.includes('decimal')) zodType = 'z.number()';
        else if (f.type.includes('enum')) {
          const enumMatch = f.type.match(/enum\(([^)]+)\)/);
          if (enumMatch) {
            const values = enumMatch[1].split(',').map(v => v.trim().replace(/'/g, ''));
            zodType = `z.enum([${values.map(v => `"${v}"`).join(', ')}])`;
          }
        }

        if (!f.required) zodType += '.optional()';
        return `  ${f.name}: ${zodType}`;
      }).join(',\n');

    return `export const ${toCamel(entity.name)}Schema = z.object({
${fieldLines},
});

export const insert${entity.name}Schema = z.object({
${insertFields},
});

export type ${entity.name} = z.infer<typeof ${toCamel(entity.name)}Schema>;
export type Insert${entity.name} = z.infer<typeof insert${entity.name}Schema>;`;
  }).join('\n\n');

  return {
    path: 'shared/schema.ts',
    language: 'typescript',
    content: `import { z } from "zod";

${entitySchemas}
`,
  };
}

function generateServerRoutes(plan: ProjectPlan, reasoning: ReasoningResult | null): GeneratedFile {
  const routeBlocks = plan.dataModel.map(entity => {
    const entitySlug = toKebab(entity.name);
    const endpoint = `/api/${entitySlug}s`;
    const varName = toCamel(entity.name);

    const hasForeignKeys = entity.fields.some(f => f.name.endsWith('Id') && f.name !== 'id');
    const foreignKeyFields = entity.fields.filter(f => f.name.endsWith('Id') && f.name !== 'id');

    return `  // ${entity.name} CRUD
  app.get("${endpoint}", async (_req, res) => {
    try {
      const items = store.${varName}s || [];
      res.json(items);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("${endpoint}/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const item = (store.${varName}s || []).find((i: any) => i.id === id);
      if (!item) return res.status(404).json({ message: "${entity.name} not found" });
      res.json(item);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("${endpoint}", async (req, res) => {
    try {
      const data = req.body;
      const id = ++store.nextId;
      const item = { id, ...data, createdAt: new Date().toISOString() };
      if (!store.${varName}s) store.${varName}s = [];
      store.${varName}s.push(item);
      res.status(201).json(item);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("${endpoint}/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const idx = (store.${varName}s || []).findIndex((i: any) => i.id === id);
      if (idx === -1) return res.status(404).json({ message: "${entity.name} not found" });
      store.${varName}s[idx] = { ...store.${varName}s[idx], ...req.body };
      res.json(store.${varName}s[idx]);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("${endpoint}/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const idx = (store.${varName}s || []).findIndex((i: any) => i.id === id);
      if (idx === -1) return res.status(404).json({ message: "${entity.name} not found" });
      store.${varName}s.splice(idx, 1);
      res.status(204).end();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });`;
  }).join('\n\n');

  return {
    path: 'server/routes.ts',
    language: 'typescript',
    content: `import type { Express } from "express";

const store: Record<string, any> = { nextId: 0 };

export function registerRoutes(app: Express) {
${routeBlocks}
}
`,
  };
}

function generateServerIndex(plan: ProjectPlan): GeneratedFile {
  return {
    path: 'server/index.ts',
    language: 'typescript',
    content: `import express from "express";
import { registerRoutes } from "./routes";

const app = express();
app.use(express.json());

registerRoutes(app);

const port = Number(process.env.PORT) || 5200;
app.listen(port, "0.0.0.0", () => {
  console.log(\`Server running on port \${port}\`);
});
`,
  };
}

function generateAppTsx(plan: ProjectPlan): GeneratedFile {
  const pageImports = plan.pages.map(page => {
    const componentName = page.componentName;
    const fileName = toKebab(componentName);
    return `import ${componentName} from "@/pages/${fileName}";`;
  }).join('\n');

  const routes = plan.pages.map(page => {
    return `          <Route path="${page.path}" component={${page.componentName}} />`;
  }).join('\n');

  const navLinks = plan.pages
    .filter(p => !p.path.includes('/:'))
    .map(p => {
      return `            <Link href="${p.path}">
              <Button variant={location === "${p.path}" ? "secondary" : "ghost"} size="sm" data-testid="nav-${toKebab(p.componentName)}">
                ${p.name}
              </Button>
            </Link>`;
    }).join('\n');

  const hasSidebar = plan.pages.filter(p => !p.path.includes('/:id')).length > 3;

  if (hasSidebar) {
    return {
      path: 'src/App.tsx',
      language: 'tsx',
      content: `import { Switch, Route, Link, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Menu, X } from "lucide-react";
${pageImports}

function Router() {
  return (
    <Switch>
${routes}
      <Route>
        <div className="p-6">
          <h1 className="text-2xl font-bold">Page not found</h1>
          <p className="text-muted-foreground mt-2">The page you're looking for doesn't exist.</p>
        </div>
      </Route>
    </Switch>
  );
}

function Sidebar() {
  const [location] = useLocation();
  return (
    <div className="flex flex-col gap-1 p-3">
${plan.pages.filter(p => !p.path.includes('/:id')).map(p => `      <Link href="${p.path}">
        <Button variant={location === "${p.path}" ? "secondary" : "ghost"} className="w-full justify-start" size="sm" data-testid="nav-${toKebab(p.componentName)}">
          ${p.name}
        </Button>
      </Link>`).join('\n')}
    </div>
  );
}

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex h-screen w-full">
        {sidebarOpen && (
          <aside className="w-56 border-r bg-card flex-shrink-0 overflow-y-auto">
            <div className="p-3 border-b">
              <h2 className="font-semibold text-sm" data-testid="text-app-title">${plan.projectName}</h2>
            </div>
            <Sidebar />
          </aside>
        )}
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center gap-2 p-2 border-b">
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)} data-testid="button-sidebar-toggle">
              {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </header>
          <main className="flex-1 overflow-y-auto">
            <Router />
          </main>
        </div>
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}
`,
    };
  }

  return {
    path: 'src/App.tsx',
    language: 'tsx',
    content: `import { Switch, Route, Link, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
${pageImports}

function Router() {
  return (
    <Switch>
${routes}
      <Route>
        <div className="p-6">
          <h1 className="text-2xl font-bold">Page not found</h1>
          <p className="text-muted-foreground mt-2">The page you're looking for doesn't exist.</p>
        </div>
      </Route>
    </Switch>
  );
}

export default function App() {
  const [location] = useLocation();

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen">
        <header className="border-b">
          <nav className="flex items-center gap-1 p-2 flex-wrap">
            <span className="font-semibold text-sm mr-2" data-testid="text-app-title">${plan.projectName}</span>
${navLinks}
          </nav>
        </header>
        <main>
          <Router />
        </main>
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}
`,
  };
}
