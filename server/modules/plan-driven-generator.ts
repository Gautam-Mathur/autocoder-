import type { ProjectPlan, PlannedEntity, PlannedPage, PlannedEndpoint, PlannedWorkflow } from './plan-generator.js';

interface GeneratedFile {
  path: string;
  content: string;
  language: string;
}

export function generateProjectFromPlan(plan: ProjectPlan): GeneratedFile[] {
  const files: GeneratedFile[] = [];

  files.push(generatePackageJson(plan));
  files.push(generateIndexHtml(plan));
  files.push(generateMainTsx());
  files.push(generateViteConfig());
  files.push(generateTailwindConfig());
  files.push(generatePostcssConfig());

  files.push(generateSchema(plan));
  files.push(generateStorageInterface(plan));
  files.push(generateRoutes(plan));
  files.push(generateAppTsx(plan));
  files.push(generateIndexCss(plan));

  for (const page of plan.pages) {
    files.push(generatePageComponent(page, plan));
  }

  files.push(generateDataTable(plan));
  files.push(generateKpiCard());
  files.push(generateStatusBadge(plan));

  return files;
}

function toSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function generatePackageJson(plan: ProjectPlan): GeneratedFile {
  const deps: Record<string, string> = {
    'react': '^18.3.1',
    'react-dom': '^18.3.1',
    'lucide-react': '^0.344.0',
    'react-router-dom': '^6.22.0',
    'recharts': '^2.12.0',
    'date-fns': '^3.3.1',
  };
  const devDeps: Record<string, string> = {
    'vite': '^5.1.0',
    'tailwindcss': '^3.4.1',
    'postcss': '^8.4.35',
    'autoprefixer': '^10.4.17',
  };

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
    devDependencies: devDeps,
  }, null, 2);

  return { path: 'package.json', content, language: 'json' };
}

function generateIndexHtml(plan: ProjectPlan): GeneratedFile {
  const content = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${plan.projectName}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`;
  return { path: 'index.html', content, language: 'html' };
}

function generateMainTsx(): GeneratedFile {
  const content = `import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
`;
  return { path: 'src/main.tsx', content, language: 'tsx' };
}

function generateViteConfig(): GeneratedFile {
  const content = `import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: 'react',
  },
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
`;
  return { path: 'vite.config.ts', content, language: 'typescript' };
}

function generateTailwindConfig(): GeneratedFile {
  const content = `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {},
  },
  plugins: [],
};
`;
  return { path: 'tailwind.config.ts', content, language: 'typescript' };
}

function generatePostcssConfig(): GeneratedFile {
  const content = `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
`;
  return { path: 'postcss.config.js', content, language: 'javascript' };
}

function generateSchema(plan: ProjectPlan): GeneratedFile {
  const imports = `import { sql } from "drizzle-orm";
import { pgTable, text, varchar, serial, integer, timestamp, jsonb, boolean, date, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
`;

  const tables: string[] = [];
  const schemas: string[] = [];

  for (const entity of plan.dataModel) {
    const fields = entity.fields.map(f => {
      const colName = toSnakeCase(f.name);
      let colDef = '';
      if (f.name === 'id') {
        colDef = `serial("${colName}").primaryKey()`;
      } else if (f.type.startsWith('enum(')) {
        const vals = f.type.replace('enum(', '').replace(')', '');
        colDef = `text("${colName}")`;
        if (f.required) colDef += '.notNull()';
      } else if (f.type === 'text' || f.type === 'string') {
        colDef = `text("${colName}")`;
        if (f.required) colDef += '.notNull()';
      } else if (f.type === 'integer' || f.type === 'number') {
        colDef = `integer("${colName}")`;
        if (f.required) colDef += '.notNull()';
      } else if (f.type === 'real' || f.type.includes('decimal')) {
        colDef = `real("${colName}")`;
        if (f.required) colDef += '.notNull()';
      } else if (f.type === 'boolean') {
        colDef = `boolean("${colName}")`;
        if (f.required) colDef += '.notNull()';
      } else if (f.type === 'date') {
        colDef = `date("${colName}")`;
        if (f.required) colDef += '.notNull()';
      } else if (f.type === 'timestamp' || f.type === 'datetime') {
        colDef = `timestamp("${colName}")`;
        if (f.required) colDef += '.notNull()';
      } else if (f.type === 'text[]' || f.type === 'string[]') {
        colDef = `text("${colName}").array()`;
      } else if (f.type.startsWith('serial')) {
        colDef = `serial("${colName}").primaryKey()`;
      } else {
        colDef = `text("${colName}")`;
        if (f.required) colDef += '.notNull()';
      }
      return `  ${f.name}: ${colDef},`;
    });

    const hasCreatedAt = entity.fields.some(f => f.name === 'createdAt');

    const tableName = entity.tableName;
    const varName = toCamelCase(entity.name);

    tables.push(`export const ${varName}s = pgTable("${tableName}", {\n${fields.join('\n')}\n});`);

    const omitFields = ['id'];
    if (hasCreatedAt) omitFields.push('createdAt');
    const omitObj = omitFields.map(f => `${f}: true`).join(', ');

    schemas.push(`export const insert${entity.name}Schema = createInsertSchema(${varName}s).omit({ ${omitObj} });
export type Insert${entity.name} = z.infer<typeof insert${entity.name}Schema>;
export type ${entity.name} = typeof ${varName}s.$inferSelect;`);
  }

  return {
    path: 'shared/schema.ts',
    content: `${imports}\n${tables.join('\n\n')}\n\n${schemas.join('\n\n')}\n`,
    language: 'typescript',
  };
}

function generateStorageInterface(plan: ProjectPlan): GeneratedFile {
  const entityImports = plan.dataModel.map(e => {
    const varName = toCamelCase(e.name);
    return `${varName}s, type ${e.name}, type Insert${e.name}, insert${e.name}Schema`;
  }).join(', ');

  const interfaceMethods: string[] = [];
  const implMethods: string[] = [];

  for (const entity of plan.dataModel) {
    const name = entity.name;
    const varName = toCamelCase(name);
    const tableName = `${varName}s`;

    interfaceMethods.push(`  getAll${name}s(): Promise<${name}[]>;`);
    interfaceMethods.push(`  get${name}(id: number): Promise<${name} | undefined>;`);
    interfaceMethods.push(`  create${name}(data: Insert${name}): Promise<${name}>;`);
    interfaceMethods.push(`  update${name}(id: number, data: Partial<Insert${name}>): Promise<${name} | undefined>;`);
    interfaceMethods.push(`  delete${name}(id: number): Promise<boolean>;`);

    implMethods.push(`
  async getAll${name}s(): Promise<${name}[]> {
    return await db.select().from(${tableName}).orderBy(${tableName}.id);
  }

  async get${name}(id: number): Promise<${name} | undefined> {
    const [result] = await db.select().from(${tableName}).where(eq(${tableName}.id, id));
    return result;
  }

  async create${name}(data: Insert${name}): Promise<${name}> {
    const [result] = await db.insert(${tableName}).values(data).returning();
    return result;
  }

  async update${name}(id: number, data: Partial<Insert${name}>): Promise<${name} | undefined> {
    const [result] = await db.update(${tableName}).set(data).where(eq(${tableName}.id, id)).returning();
    return result;
  }

  async delete${name}(id: number): Promise<boolean> {
    const result = await db.delete(${tableName}).where(eq(${tableName}.id, id)).returning();
    return result.length > 0;
  }`);
  }

  const content = `import { db } from "./db";
import { eq } from "drizzle-orm";
import { ${entityImports} } from "@shared/schema";

export interface IStorage {
${interfaceMethods.join('\n')}
}

export class DatabaseStorage implements IStorage {
${implMethods.join('\n')}
}

export const storage = new DatabaseStorage();
`;

  return { path: 'server/storage.ts', content, language: 'typescript' };
}

function generateRoutes(plan: ProjectPlan): GeneratedFile {
  const entityImports = plan.dataModel.map(e => `insert${e.name}Schema`).join(', ');

  const routeHandlers: string[] = [];

  for (const entity of plan.dataModel) {
    const name = entity.name;
    const basePath = `/api/${toKebabCase(name)}s`;

    routeHandlers.push(`
  // ${name} endpoints
  app.get("${basePath}", async (req, res) => {
    try {
      const items = await storage.getAll${name}s();
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch ${name.toLowerCase()}s" });
    }
  });

  app.get("${basePath}/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const item = await storage.get${name}(id);
      if (!item) return res.status(404).json({ error: "${name} not found" });
      res.json(item);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch ${name.toLowerCase()}" });
    }
  });

  app.post("${basePath}", async (req, res) => {
    try {
      const parsed = insert${name}Schema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid data", details: parsed.error.issues });
      }
      const item = await storage.create${name}(parsed.data);
      res.status(201).json(item);
    } catch (error) {
      res.status(500).json({ error: "Failed to create ${name.toLowerCase()}" });
    }
  });

  app.patch("${basePath}/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const item = await storage.update${name}(id, req.body);
      if (!item) return res.status(404).json({ error: "${name} not found" });
      res.json(item);
    } catch (error) {
      res.status(500).json({ error: "Failed to update ${name.toLowerCase()}" });
    }
  });

  app.delete("${basePath}/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.delete${name}(id);
      if (!success) return res.status(404).json({ error: "${name} not found" });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete ${name.toLowerCase()}" });
    }
  });`);
  }

  const content = `import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { ${entityImports} } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
${routeHandlers.join('\n')}

  const httpServer = createServer(app);
  return httpServer;
}
`;

  return { path: 'server/routes.ts', content, language: 'typescript' };
}

function generateAppTsx(plan: ProjectPlan): GeneratedFile {
  const pageImports: string[] = [];
  const routes: string[] = [];

  const dashboardPage = plan.pages.find(p => p.path === '/');
  if (dashboardPage) {
    const fileName = toKebabCase(dashboardPage.componentName.replace('Page', ''));
    pageImports.push(`import ${dashboardPage.componentName} from "@/pages/${fileName}";`);
    routes.push(`      <Route path="/" component={${dashboardPage.componentName}} />`);
  }

  for (const page of plan.pages.filter(p => p.path !== '/')) {
    const fileName = toKebabCase(page.componentName.replace('Page', ''));
    pageImports.push(`import ${page.componentName} from "@/pages/${fileName}";`);
    const routePath = page.path.replace(/:(\w+)/g, ':$1');
    routes.push(`      <Route path="${routePath}" component={${page.componentName}} />`);
  }

  const sidebarItems = plan.modules.map(mod => {
    const mainPage = plan.pages.find(p => p.module === mod.name);
    const iconMap: Record<string, string> = {
      'Dashboard': 'LayoutDashboard',
      'Project': 'FolderKanban',
      'Employee': 'Users',
      'Client': 'Building2',
      'Time': 'Clock',
      'Billing': 'Receipt',
      'Invoice': 'FileText',
      'Patient': 'Heart',
      'Appointment': 'Calendar',
      'Order': 'ShoppingCart',
      'Product': 'Package',
      'Inventory': 'Warehouse',
      'Customer': 'UserCircle',
      'Leave': 'CalendarOff',
      'Payroll': 'DollarSign',
      'Recruitment': 'UserPlus',
      'Menu': 'UtensilsCrossed',
      'Reservation': 'BookOpen',
      'Member': 'Users',
      'Class': 'Dumbbell',
      'Shipment': 'Truck',
      'Fleet': 'Car',
      'Warehouse': 'Warehouse',
      'Account': 'Landmark',
      'Expense': 'CreditCard',
      'Budget': 'PiggyBank',
      'Report': 'BarChart3',
      'Task': 'CheckSquare',
      'Contact': 'Contact',
      'Deal': 'Handshake',
      'Pipeline': 'GitBranch',
      'Activity': 'Activity',
      'Quality': 'ShieldCheck',
      'Supplier': 'Factory',
      'Purchase': 'ShoppingBag',
      'Student': 'GraduationCap',
      'Course': 'BookOpen',
      'Grade': 'Award',
      'Attendance': 'ClipboardList',
      'Tenant': 'Key',
      'Property': 'Home',
      'Maintenance': 'Wrench',
      'Rent': 'Banknote',
      'Table': 'Grid3x3',
      'Workout': 'Dumbbell',
      'Team': 'Users',
    };

    let icon = 'Circle';
    for (const [key, val] of Object.entries(iconMap)) {
      if (mod.name.includes(key)) {
        icon = val;
        break;
      }
    }

    return {
      title: mod.name,
      path: mainPage?.path || '/',
      icon,
    };
  });

  const iconImports = Array.from(new Set(sidebarItems.map(i => i.icon))).join(', ');

  const content = `import { Switch, Route, Link, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { ${iconImports} } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
${pageImports.join('\n')}

const sidebarItems = ${JSON.stringify(sidebarItems, null, 2)};

function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-64 border-r bg-card flex flex-col h-full" data-testid="sidebar">
      <div className="p-4 border-b">
        <h1 className="text-lg font-bold" data-testid="text-app-title">${plan.projectName}</h1>
      </div>
      <nav className="flex-1 p-2 space-y-1 overflow-auto">
        {sidebarItems.map((item) => {
          const isActive = location === item.path || (item.path !== "/" && location.startsWith(item.path));
          return (
            <Link key={item.path} href={item.path}>
              <div
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm cursor-pointer transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "hover-elevate text-muted-foreground"
                )}
                data-testid={\`link-nav-\${item.title.toLowerCase().replace(/\\s+/g, '-')}\`}
              >
                <span>{item.title}</span>
              </div>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

function Router() {
  return (
    <Switch>
${routes.join('\n')}
      <Route>
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Page not found</p>
        </div>
      </Route>
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex h-screen w-full bg-background">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <Router />
        </main>
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}
`;

  return { path: 'src/App.tsx', content, language: 'tsx' };
}

function generateIndexCss(plan: ProjectPlan): GeneratedFile {
  const content = `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 224.3 76.3% 48%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
    font-feature-settings: "rlig" 1, "calt" 1;
  }
}
`;

  return { path: 'src/index.css', content, language: 'css' };
}

function generatePageComponent(page: PlannedPage, plan: ProjectPlan): GeneratedFile {
  const fileName = toKebabCase(page.componentName.replace('Page', ''));

  const isDashboard = page.path === '/';
  const isList = page.features.some(f => ['search', 'filter-by-status', 'filter-by-client', 'status-filter', 'category-filter'].includes(f));
  const isDetail = page.path.includes(':id');

  let content: string;

  if (isDashboard) {
    content = generateDashboardPage(page, plan);
  } else if (isDetail) {
    content = generateDetailPage(page, plan);
  } else if (isList) {
    content = generateListPage(page, plan);
  } else {
    content = generateGenericPage(page, plan);
  }

  return { path: `src/pages/${fileName}.tsx`, content, language: 'tsx' };
}

function generateDashboardPage(page: PlannedPage, plan: ProjectPlan): GeneratedFile['content'] {
  const kpis = plan.kpis.slice(0, 4);
  const kpiCards = kpis.map((kpi, i) => {
    const icons = ['TrendingUp', 'Users', 'DollarSign', 'Activity'];
    return `        <KpiCard
          title="${kpi}"
          value="${['1,284', '156', '$48,350', '94%'][i] || '0'}"
          change="+${[12, 8, 15, 3][i] || 5}%"
          icon={<${icons[i] || 'Activity'} className="h-4 w-4" />}
          data-testid="card-kpi-${toKebabCase(kpi)}"
        />`;
  }).join('\n');

  const firstEntity = plan.dataModel[0];
  const entityEndpoint = firstEntity ? `/api/${toKebabCase(firstEntity.name)}s` : '';
  const entityVarName = firstEntity ? toCamelCase(firstEntity.name) : 'items';

  return `import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Users, DollarSign, Activity } from "lucide-react";
import KpiCard from "@/components/kpi-card";

export default function ${page.componentName}() {
${firstEntity ? `  const { data: ${entityVarName}s = [] } = useQuery({ queryKey: ["${entityEndpoint}"] });` : ''}

  return (
    <div className="p-6 space-y-6" data-testid="page-dashboard">
      <div>
        <h1 className="text-2xl font-bold" data-testid="text-page-title">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to ${plan.projectName}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
${kpiCards}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground" data-testid="text-recent-activity">
${firstEntity ? `              {${entityVarName}s.length > 0 ? \`\${${entityVarName}s.length} ${firstEntity.name.toLowerCase()}s in system\` : "No data yet. Start by adding records."}` : '              No activity to show yet.'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground" data-testid="text-quick-stats">
              System is running smoothly.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
`;
}

function generateListPage(page: PlannedPage, plan: ProjectPlan): GeneratedFile['content'] {
  const entityName = page.dataNeeded[0] || plan.dataModel[0]?.name || 'Item';
  const entity = plan.dataModel.find(e => e.name === entityName);
  const endpoint = `/api/${toKebabCase(entityName)}s`;
  const varName = toCamelCase(entityName);

  const displayFields = entity?.fields.filter(f => f.name !== 'id' && f.name !== 'createdAt').slice(0, 5) || [];
  const statusField = entity?.fields.find(f => f.name === 'status');
  const nameField = entity?.fields.find(f => ['name', 'title', 'firstName', 'companyName', 'orderNumber', 'trackingNumber', 'sku', 'code'].includes(f.name));

  const tableHeaders = displayFields.map(f => `                <th className="text-left p-3 text-sm font-medium text-muted-foreground">${toTitleCase(f.name)}</th>`).join('\n');
  const tableRows = displayFields.map(f => {
    if (f.name === 'status') {
      return `                  <td className="p-3"><StatusBadge status={item.${f.name}} /></td>`;
    }
    return `                  <td className="p-3 text-sm">{item.${f.name}}</td>`;
  }).join('\n');

  return `import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search } from "lucide-react";
import StatusBadge from "@/components/status-badge";
import { useToast } from "@/hooks/use-toast";

export default function ${page.componentName}() {
  const [search, setSearch] = useState("");
  const { toast } = useToast();
  const { data: items = [], isLoading } = useQuery({ queryKey: ["${endpoint}"] });

  const filtered = items.filter((item: any) =>
    JSON.stringify(item).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-4" data-testid="page-${toKebabCase(entityName)}-list">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">${page.name}</h1>
          <p className="text-muted-foreground">${page.description}</p>
        </div>
        <Button data-testid="button-add-${toKebabCase(entityName)}">
          <Plus className="h-4 w-4 mr-2" />
          Add ${entityName}
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search ${entityName.toLowerCase()}s..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            data-testid="input-search"
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground" data-testid="text-loading">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground" data-testid="text-empty">
              {search ? "No results found." : "No ${entityName.toLowerCase()}s yet. Click 'Add ${entityName}' to create one."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr>
${tableHeaders}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.map((item: any) => (
                    <tr key={item.id} className="hover-elevate cursor-pointer" data-testid={\`row-${toKebabCase(entityName)}-\${item.id}\`}>
${tableRows}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
`;
}

function generateDetailPage(page: PlannedPage, plan: ProjectPlan): GeneratedFile['content'] {
  const entityName = page.dataNeeded[0] || plan.dataModel[0]?.name || 'Item';
  const endpoint = `/api/${toKebabCase(entityName)}s`;
  const entity = plan.dataModel.find(e => e.name === entityName);
  const displayFields = entity?.fields.filter(f => f.name !== 'id' && f.name !== 'createdAt').slice(0, 8) || [];

  const fieldRows = displayFields.map(f => {
    return `              <div>
                <dt className="text-sm text-muted-foreground">${toTitleCase(f.name)}</dt>
                <dd className="text-sm font-medium mt-1" data-testid="text-${toKebabCase(f.name)}">{item?.${f.name} ?? "—"}</dd>
              </div>`;
  }).join('\n');

  return `import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import StatusBadge from "@/components/status-badge";

export default function ${page.componentName}() {
  const [, params] = useRoute("${page.path}");
  const id = params?.id;

  const { data: item, isLoading } = useQuery({
    queryKey: ["${endpoint}", id],
    enabled: !!id,
  });

  if (isLoading) {
    return <div className="p-6 text-muted-foreground" data-testid="text-loading">Loading...</div>;
  }

  if (!item) {
    return <div className="p-6 text-muted-foreground" data-testid="text-not-found">${entityName} not found.</div>;
  }

  return (
    <div className="p-6 space-y-6" data-testid="page-${toKebabCase(entityName)}-detail">
      <div className="flex items-center gap-4">
        <Link href="${page.path.split('/:')[0]}">
          <Button variant="ghost" size="icon" data-testid="button-back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold" data-testid="text-page-title">${page.name}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
${fieldRows}
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
`;
}

function generateGenericPage(page: PlannedPage, plan: ProjectPlan): GeneratedFile['content'] {
  return `import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ${page.componentName}() {
  return (
    <div className="p-6 space-y-6" data-testid="page-${toKebabCase(page.componentName)}">
      <div>
        <h1 className="text-2xl font-bold" data-testid="text-page-title">${page.name}</h1>
        <p className="text-muted-foreground">${page.description}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>${page.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground" data-testid="text-content">
            Content for ${page.name} will appear here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
`;
}

function generateDataTable(plan: ProjectPlan): GeneratedFile {
  const content = `import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";

interface Column {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
}

interface DataTableProps {
  data: any[];
  columns: Column[];
  searchable?: boolean;
  onRowClick?: (row: any) => void;
}

export default function DataTable({ data, columns, searchable = true, onRowClick }: DataTableProps) {
  const [search, setSearch] = useState("");

  const filtered = searchable
    ? data.filter(row => JSON.stringify(row).toLowerCase().includes(search.toLowerCase()))
    : data;

  return (
    <div className="space-y-4">
      {searchable && (
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            data-testid="input-table-search"
          />
        </div>
      )}
      <div className="overflow-x-auto rounded-md border">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              {columns.map(col => (
                <th key={col.key} className="text-left p-3 text-sm font-medium text-muted-foreground">{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((row, i) => (
              <tr
                key={row.id || i}
                className={onRowClick ? "hover-elevate cursor-pointer" : ""}
                onClick={() => onRowClick?.(row)}
                data-testid={\`row-\${row.id || i}\`}
              >
                {columns.map(col => (
                  <td key={col.key} className="p-3 text-sm">
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="p-8 text-center text-muted-foreground" data-testid="text-table-empty">
            No data found.
          </div>
        )}
      </div>
    </div>
  );
}
`;

  return { path: 'src/components/data-table.tsx', content, language: 'tsx' };
}

function generateKpiCard(): GeneratedFile {
  const content = `import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon?: React.ReactNode;
  className?: string;
  "data-testid"?: string;
}

export default function KpiCard({ title, value, change, icon, className, ...props }: KpiCardProps) {
  const isPositive = change?.startsWith("+");

  return (
    <Card className={cn("", className)} {...props}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-sm text-muted-foreground">{title}</span>
          {icon && <span className="text-muted-foreground">{icon}</span>}
        </div>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <p className={cn("text-xs mt-1", isPositive ? "text-green-600" : "text-red-600")}>
            {change} from last period
          </p>
        )}
      </CardContent>
    </Card>
  );
}
`;

  return { path: 'src/components/kpi-card.tsx', content, language: 'tsx' };
}

function generateStatusBadge(plan: ProjectPlan): GeneratedFile {
  const content = `import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  completed: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  "in-progress": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  pending: "bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-400",
  approved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  draft: "bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-400",
  sent: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  paid: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  overdue: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  open: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  closed: "bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-400",
  inactive: "bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-400",
  submitted: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  scheduled: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  delivered: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  shipped: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  planning: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  "on-hold": "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const colorClass = statusColors[status?.toLowerCase()] || statusColors["pending"];

  return (
    <Badge
      variant="secondary"
      className={cn("no-default-hover-elevate no-default-active-elevate font-medium", colorClass, className)}
      data-testid={\`badge-status-\${status}\`}
    >
      {status?.replace(/-/g, " ").replace(/\\b\\w/g, l => l.toUpperCase())}
    </Badge>
  );
}
`;

  return { path: 'src/components/status-badge.tsx', content, language: 'tsx' };
}

function toSnakeCase(str: string): string {
  return str.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '');
}

function toKebabCase(str: string): string {
  return str.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');
}

function toCamelCase(str: string): string {
  return str.charAt(0).toLowerCase() + str.slice(1);
}

function toTitleCase(str: string): string {
  return str
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, s => s.toUpperCase())
    .replace(/Id$/, 'ID')
    .trim();
}
