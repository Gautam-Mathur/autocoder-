import type { ProjectPlan, PlannedEntity, PlannedPage, PlannedEndpoint, PlannedWorkflow } from './plan-generator.js';
import { analyzeSemantics, generateSmartInputComponent, generateSmartTableCell, generateCurrencyDisplay, generateDateDisplay, type ReasoningResult, type FieldSemantics } from './contextual-reasoning-engine.js';
import { generateTestFiles } from './test-generator.js';

interface GeneratedFile {
  path: string;
  content: string;
  language: string;
}

export function generateProjectFromPlan(plan: ProjectPlan): GeneratedFile[] {
  const files: GeneratedFile[] = [];
  const reasoning = analyzeSemantics(plan);

  files.push(generateIndexHtml(plan));
  files.push(generateMainTsx());
  files.push(generateViteConfig());
  files.push(generateTailwindConfig());
  files.push(generatePostcssConfig());

  files.push(generateLibUtils());
  files.push(generateLibQueryClient());
  files.push(generateHookUseToast());

  files.push(generateUiButton());
  files.push(generateUiCard());
  files.push(generateUiInput());
  files.push(generateUiBadge());
  files.push(generateUiToaster());
  files.push(generateUiDialog());
  files.push(generateUiSelect());
  files.push(generateUiLabel());
  files.push(generateUiTextarea());
  files.push(generateUiTabs());
  files.push(generateTsConfig());
  files.push(generateTsConfigNode());

  files.push(generateSchema(plan));
  files.push(generateDb());
  files.push(generateStorageInterface(plan));
  files.push(generateRoutes(plan, reasoning));
  files.push(generateAppTsx(plan));
  files.push(generateIndexCss(plan));

  for (const page of plan.pages) {
    files.push(generatePageComponent(page, plan, reasoning));
  }

  files.push(generateDataTable(plan, reasoning));
  files.push(generateKpiCard());
  files.push(generateStatusBadge(plan));

  const testFiles = generateTestFiles(plan, reasoning);
  files.push(...testFiles);

  files.unshift(generatePackageJson(plan, files));

  return files;
}

function toSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

const AVAILABLE_DEPS: Record<string, string> = {
  'react': '^18.3.1',
  'react-dom': '^18.3.1',
  'wouter': '^3.0.0',
  '@tanstack/react-query': '^5.0.0',
  'lucide-react': '^0.344.0',
  'recharts': '^2.12.0',
  'date-fns': '^3.3.1',
  'clsx': '^2.1.0',
  'tailwind-merge': '^2.2.0',
  'express': '^4.18.0',
  'drizzle-orm': '^0.29.0',
  'drizzle-zod': '^0.5.0',
  '@neondatabase/serverless': '^0.7.0',
  'zod': '^3.22.0',
  'framer-motion': '^11.0.0',
  'react-hook-form': '^7.50.0',
  '@hookform/resolvers': '^3.3.0',
};

const AVAILABLE_DEV_DEPS: Record<string, string> = {
  'vite': '^5.1.0',
  '@vitejs/plugin-react': '^4.2.0',
  'tailwindcss': '^3.4.1',
  'postcss': '^8.4.35',
  'autoprefixer': '^10.4.17',
  'fast-glob': '^3.3.2',
  'vitest': '^1.3.0',
  '@testing-library/react': '^14.2.0',
  '@testing-library/jest-dom': '^6.4.0',
  'jsdom': '^24.0.0',
  '@testing-library/user-event': '^14.5.0',
};

const ALWAYS_INCLUDE_DEPS = [
  'react', 'react-dom', 'clsx', 'tailwind-merge', 'zod',
];

const ALWAYS_INCLUDE_DEV_DEPS = [
  'vite', '@vitejs/plugin-react', 'tailwindcss', 'postcss', 'autoprefixer', 'fast-glob',
  'vitest', '@testing-library/react', '@testing-library/jest-dom', 'jsdom',
];

function detectUsedPackages(files: GeneratedFile[]): Set<string> {
  const allCode = files.map(f => f.content).join('\n');
  const used = new Set<string>();

  for (const pkg of Object.keys(AVAILABLE_DEPS)) {
    if (ALWAYS_INCLUDE_DEPS.includes(pkg)) {
      used.add(pkg);
      continue;
    }
    const escaped = pkg.replace(/[.*+?^${}()|[\]\\/@]/g, '\\$&');
    const patterns = [
      `from\\s+["']${escaped}(?:[/"']|$)`,
      `require\\(\\s*["']${escaped}(?:[/"']|\\))`,
      `import\\s*\\(\\s*["']${escaped}`,
      `import\\s+["']${escaped}`,
      `export\\s+.*\\s+from\\s+["']${escaped}`,
      `export\\s*\\*\\s*from\\s+["']${escaped}`,
    ];
    const importPattern = new RegExp(patterns.join('|'));
    if (importPattern.test(allCode)) {
      used.add(pkg);
    }
  }

  return used;
}

function generatePackageJson(plan: ProjectPlan, generatedFiles: GeneratedFile[]): GeneratedFile {
  const usedPkgs = detectUsedPackages(generatedFiles);

  const deps: Record<string, string> = {};
  for (const pkg of usedPkgs) {
    if (AVAILABLE_DEPS[pkg]) {
      deps[pkg] = AVAILABLE_DEPS[pkg];
    }
  }

  const additionalDeps = (plan as any).techStack?.additionalDependencies || [];
  for (const dep of additionalDeps) {
    if (AVAILABLE_DEPS[dep] && !deps[dep]) {
      deps[dep] = AVAILABLE_DEPS[dep];
    }
  }

  const devDeps: Record<string, string> = {};
  for (const pkg of ALWAYS_INCLUDE_DEV_DEPS) {
    devDeps[pkg] = AVAILABLE_DEV_DEPS[pkg];
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
      test: 'vitest run',
      'test:watch': 'vitest',
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
    extend: {
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

function generateLibUtils(): GeneratedFile {
  const content = `import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
`;
  return { path: 'src/lib/utils.ts', content, language: 'typescript' };
}

function generateLibQueryClient(): GeneratedFile {
  const content = `import { QueryClient } from "@tanstack/react-query";

export async function apiRequest(method: string, url: string, body?: any) {
  const res = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  return res;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey }) => {
        const res = await fetch(queryKey[0] as string);
        if (!res.ok) {
          throw new Error(\`\${res.status}: \${res.statusText}\`);
        }
        return res.json();
      },
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
  },
});
`;
  return { path: 'src/lib/queryClient.ts', content, language: 'typescript' };
}

function generateHookUseToast(): GeneratedFile {
  const content = `import { useState, useCallback } from "react";

type ToastVariant = "default" | "destructive";

interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
}

let toastCount = 0;
let listeners: Array<(toasts: Toast[]) => void> = [];
let memoryToasts: Toast[] = [];

function dispatch(toasts: Toast[]) {
  memoryToasts = toasts;
  listeners.forEach((l) => l(toasts));
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>(memoryToasts);

  useState(() => {
    listeners.push(setToasts);
    return () => {
      listeners = listeners.filter((l) => l !== setToasts);
    };
  });

  const toast = useCallback(
    ({ title, description, variant }: Omit<Toast, "id">) => {
      const id = String(++toastCount);
      const newToast: Toast = { id, title, description, variant };
      dispatch([...memoryToasts, newToast]);
      setTimeout(() => {
        dispatch(memoryToasts.filter((t) => t.id !== id));
      }, 4000);
    },
    []
  );

  const dismiss = useCallback((id: string) => {
    dispatch(memoryToasts.filter((t) => t.id !== id));
  }, []);

  return { toasts, toast, dismiss };
}

export type { Toast };
`;
  return { path: 'src/hooks/use-toast.ts', content, language: 'typescript' };
}

function generateUiButton(): GeneratedFile {
  const content = `import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const variants: Record<string, string> = {
      default: "bg-blue-600 text-white hover:bg-blue-700",
      destructive: "bg-red-600 text-white hover:bg-red-700",
      outline: "border border-gray-300 bg-transparent hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-800",
      secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700",
      ghost: "hover:bg-gray-100 dark:hover:bg-gray-800",
      link: "text-blue-600 underline-offset-4 hover:underline",
    };
    const sizes: Record<string, string> = {
      default: "h-9 px-4 py-2",
      sm: "h-8 px-3 text-sm",
      lg: "h-10 px-6",
      icon: "h-9 w-9",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
`;
  return { path: 'src/components/ui/button.tsx', content, language: 'tsx' };
}

function generateUiCard(): GeneratedFile {
  const content = `import { cn } from "@/lib/utils";

function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-lg border bg-card text-card-foreground shadow-sm", className)}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />;
}

function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("font-semibold leading-none tracking-tight", className)} {...props} />;
}

function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-gray-500 dark:text-gray-400", className)} {...props} />;
}

function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6 pt-0", className)} {...props} />;
}

function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex items-center p-6 pt-0", className)} {...props} />;
}

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
`;
  return { path: 'src/components/ui/card.tsx', content, language: 'tsx' };
}

function generateUiInput(): GeneratedFile {
  const content = `import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border border-gray-300 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:placeholder:text-gray-500",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
`;
  return { path: 'src/components/ui/input.tsx', content, language: 'tsx' };
}

function generateUiBadge(): GeneratedFile {
  const content = `import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants: Record<string, string> = {
    default: "bg-blue-600 text-white",
    secondary: "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100",
    destructive: "bg-red-600 text-white",
    outline: "border border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors whitespace-nowrap",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
`;
  return { path: 'src/components/ui/badge.tsx', content, language: 'tsx' };
}

function generateUiToaster(): GeneratedFile {
  const content = `import { useToast } from "@/hooks/use-toast";

export function Toaster() {
  const { toasts, dismiss } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={
            "rounded-lg border p-4 shadow-lg transition-all " +
            (toast.variant === "destructive"
              ? "bg-red-600 text-white border-red-700"
              : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700")
          }
          role="alert"
        >
          {toast.title && <div className="font-semibold text-sm">{toast.title}</div>}
          {toast.description && <div className="text-sm mt-1 opacity-90">{toast.description}</div>}
          <button
            onClick={() => dismiss(toast.id)}
            className="absolute top-2 right-2 text-xs opacity-50 hover:opacity-100"
          >
            x
          </button>
        </div>
      ))}
    </div>
  );
}
`;
  return { path: 'src/components/ui/toaster.tsx', content, language: 'tsx' };
}

function generateUiDialog(): GeneratedFile {
  const content = `import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

function Dialog({ open, onOpenChange, children }: DialogProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div ref={overlayRef} className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={() => onOpenChange(false)} />
      <div className="relative z-50 w-full max-w-lg mx-4">{children}</div>
    </div>
  );
}

function DialogContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("bg-background rounded-lg border shadow-lg p-6", className)} {...props}>
      {children}
    </div>
  );
}

function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col space-y-1.5 mb-4", className)} {...props} />;
}

function DialogTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn("text-lg font-semibold leading-none tracking-tight", className)} {...props} />;
}

function DialogDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-muted-foreground", className)} {...props} />;
}

function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex justify-end gap-2 mt-4", className)} {...props} />;
}

export { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter };
`;
  return { path: 'src/components/ui/dialog.tsx', content, language: 'tsx' };
}

function generateUiSelect(): GeneratedFile {
  const content = `import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(
          "flex h-9 w-full rounded-md border border-gray-300 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600",
          className
        )}
        {...props}
      >
        {children}
      </select>
    );
  }
);
Select.displayName = "Select";

function SelectOption({ className, ...props }: React.OptionHTMLAttributes<HTMLOptionElement>) {
  return <option className={cn("", className)} {...props} />;
}

export { Select, SelectOption };
`;
  return { path: 'src/components/ui/select.tsx', content, language: 'tsx' };
}

function generateUiLabel(): GeneratedFile {
  const content = `import { forwardRef } from "react";
import { cn } from "@/lib/utils";

const Label = forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70", className)}
        {...props}
      />
    );
  }
);
Label.displayName = "Label";

export { Label };
`;
  return { path: 'src/components/ui/label.tsx', content, language: 'tsx' };
}

function generateUiTextarea(): GeneratedFile {
  const content = `import { forwardRef } from "react";
import { cn } from "@/lib/utils";

const Textarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600",
          className
        )}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
`;
  return { path: 'src/components/ui/textarea.tsx', content, language: 'tsx' };
}

function generateUiTabs(): GeneratedFile {
  const content = `import { useState } from "react";
import { cn } from "@/lib/utils";

interface TabsProps {
  defaultValue: string;
  children: React.ReactNode;
  className?: string;
}

interface TabsContextValue {
  value: string;
  onChange: (value: string) => void;
}

let tabsContext: TabsContextValue = { value: "", onChange: () => {} };

function Tabs({ defaultValue, children, className }: TabsProps) {
  const [value, setValue] = useState(defaultValue);
  tabsContext = { value, onChange: setValue };
  return <div className={cn("", className)}>{children}</div>;
}

function TabsList({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
        className
      )}
      {...props}
    />
  );
}

function TabsTrigger({ value, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string }) {
  const isActive = tabsContext.value === value;
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all",
        isActive ? "bg-background text-foreground shadow-sm" : "hover:bg-background/50",
        className
      )}
      onClick={() => tabsContext.onChange(value)}
      {...props}
    />
  );
}

function TabsContent({ value, className, ...props }: React.HTMLAttributes<HTMLDivElement> & { value: string }) {
  if (tabsContext.value !== value) return null;
  return <div className={cn("mt-2", className)} {...props} />;
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
`;
  return { path: 'src/components/ui/tabs.tsx', content, language: 'tsx' };
}

function generateTsConfig(): GeneratedFile {
  const content = JSON.stringify({
    compilerOptions: {
      target: "ES2020",
      useDefineForClassFields: true,
      lib: ["ES2020", "DOM", "DOM.Iterable"],
      module: "ESNext",
      skipLibCheck: true,
      moduleResolution: "bundler",
      allowImportingTsExtensions: true,
      resolveJsonModule: true,
      isolatedModules: true,
      noEmit: true,
      jsx: "react-jsx",
      strict: false,
      noUnusedLocals: false,
      noUnusedParameters: false,
      noFallthroughCasesInSwitch: true,
      baseUrl: ".",
      paths: {
        "@/*": ["./src/*"],
        "@shared/*": ["./shared/*"],
      },
    },
    include: ["src", "shared"],
    references: [{ path: "./tsconfig.node.json" }],
  }, null, 2);
  return { path: 'tsconfig.json', content, language: 'json' };
}

function generateTsConfigNode(): GeneratedFile {
  const content = JSON.stringify({
    compilerOptions: {
      composite: true,
      skipLibCheck: true,
      module: "ESNext",
      moduleResolution: "bundler",
      allowSyntheticDefaultImports: true,
    },
    include: ["vite.config.ts"],
  }, null, 2);
  return { path: 'tsconfig.node.json', content, language: 'json' };
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

function generateDb(): GeneratedFile {
  const content = `import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";
import * as schema from "@shared/schema";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });
`;
  return { path: 'server/db.ts', content, language: 'typescript' };
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

function generateRoutes(plan: ProjectPlan, reasoning: ReasoningResult): GeneratedFile {
  const entityImports = plan.dataModel.map(e => `insert${e.name}Schema`).join(', ');

  const routeHandlers: string[] = [];

  for (const entity of plan.dataModel) {
    const name = entity.name;
    const basePath = `/api/${toKebabCase(name)}s`;

    const entityRules = reasoning?.businessRules.filter(r => r.entityName === name && r.type === 'validation') || [];
    const validationSnippets = entityRules.map(r => `      // Business rule: ${r.ruleName}\n      ${r.codeSnippet}`).join('\n');

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
      const data = parsed.data;
${validationSnippets ? validationSnippets + '\n' : ''}      const item = await storage.create${name}(data);
      res.status(201).json(item);
    } catch (error) {
      res.status(500).json({ error: "Failed to create ${name.toLowerCase()}" });
    }
  });

  app.patch("${basePath}/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = req.body;
${validationSnippets ? validationSnippets + '\n' : ''}      const item = await storage.update${name}(id, data);
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

function generatePageComponent(page: PlannedPage, plan: ProjectPlan, reasoning: ReasoningResult): GeneratedFile {
  const fileName = toKebabCase(page.componentName.replace('Page', ''));

  const isDashboard = page.path === '/';
  const isList = page.features.some(f => ['search', 'filter-by-status', 'filter-by-client', 'status-filter', 'category-filter'].includes(f));
  const isDetail = page.path.includes(':id');

  let content: string;

  if (isDashboard) {
    content = generateDashboardPage(page, plan, reasoning);
  } else if (isDetail) {
    content = generateDetailPage(page, plan, reasoning);
  } else if (isList) {
    content = generateListPage(page, plan, reasoning);
  } else {
    content = generateGenericPage(page, plan);
  }

  return { path: `src/pages/${fileName}.tsx`, content, language: 'tsx' };
}

function generateDashboardPage(page: PlannedPage, plan: ProjectPlan, reasoning: ReasoningResult): GeneratedFile['content'] {
  const kpis = plan.kpis.slice(0, 4);

  // Helper function to determine KPI semantic type and formatting
  const getKpiSemantic = (kpiLabel: string): { type: 'currency' | 'percentage' | 'count' | 'generic'; icon: string; formatExpr: string; sampleValue: string } => {
    const lower = kpiLabel.toLowerCase();
    
    // Check if KPI matches a field semantic from reasoning
    for (const [entityName, semantics] of Array.from(reasoning?.fieldSemantics?.entries() || [])) {
      for (const sem of semantics) {
        if (lower.includes(sem.fieldName.toLowerCase()) || lower.includes(entityName.toLowerCase())) {
          if (sem.inputType === 'currency') {
            return { type: 'currency', icon: 'DollarSign', formatExpr: `new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)`, sampleValue: '$48,350' };
          }
          if (sem.inputType === 'percentage') {
            return { type: 'percentage', icon: 'TrendingUp', formatExpr: '`\${value}%`', sampleValue: '94%' };
          }
        }
      }
    }
    
    // Heuristic fallback based on KPI label text
    if (/revenue|income|sales|cost|price|amount|total.*\$/i.test(lower) || /\$/i.test(lower)) {
      return { type: 'currency', icon: 'DollarSign', formatExpr: `new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)`, sampleValue: '$48,350' };
    }
    if (/rate|percentage|completion|satisfaction|retention|conversion/i.test(lower)) {
      return { type: 'percentage', icon: 'TrendingUp', formatExpr: '`\${value}%`', sampleValue: '94%' };
    }
    if (/users?|members?|customers?|clients?|employees?|staff|people|team/i.test(lower)) {
      return { type: 'count', icon: 'Users', formatExpr: `new Intl.NumberFormat('en-US').format(value)`, sampleValue: '1,284' };
    }
    if (/total|count|number|orders?|items?|tasks?|projects?|tickets?/i.test(lower)) {
      return { type: 'count', icon: 'Activity', formatExpr: `new Intl.NumberFormat('en-US').format(value)`, sampleValue: '156' };
    }
    return { type: 'generic', icon: 'Activity', formatExpr: 'String(value)', sampleValue: '0' };
  };

  // Generate semantic-aware KPI cards
  const kpiCards = kpis.map((kpi, i) => {
    const semantic = getKpiSemantic(kpi);
    return `        <KpiCard
          title="${kpi}"
          value={formatKpiValue(kpiValues[${i}], "${semantic.type}")}
          change="+${[12, 8, 15, 3][i] || 5}%"
          icon={<${semantic.icon} className="h-4 w-4" />}
          data-testid="card-kpi-${toKebabCase(kpi)}"
        />`;
  }).join('\n');

  const firstEntity = plan.dataModel[0];
  const entityEndpoint = firstEntity ? `/api/${toKebabCase(firstEntity.name)}s` : '';
  const entityVarName = firstEntity ? toCamelCase(firstEntity.name) : 'items';

  // Determine Quick Stats fields based on semantic analysis
  const quickStatFields = firstEntity?.fields
    .filter(f => {
      const sem = reasoning?.fieldSemantics.get(firstEntity.name)?.find(s => s.fieldName === f.name);
      return sem && (sem.inputType === 'currency' || sem.inputType === 'percentage' || /count|total|amount/i.test(f.name));
    })
    .slice(0, 3) || [];

  const quickStatsContent = quickStatFields.length > 0
    ? quickStatFields.map(f => `              <div className="text-sm"><span className="text-muted-foreground">${toTitleCase(f.name)}:</span> <span className="font-medium">-</span></div>`).join('\n')
    : '              System is running smoothly.';

  const kpiComputations = kpis.map((kpi, i) => {
    const sem = getKpiSemantic(kpi);
    const lower = kpi.toLowerCase();
    if (sem.type === 'count' && firstEntity) {
      return `${entityVarName}s.length`;
    }
    if (sem.type === 'currency' && firstEntity) {
      const currencyField = firstEntity.fields.find(f => /price|amount|cost|revenue|value|total|fee|salary|budget/i.test(f.name));
      if (currencyField) return `${entityVarName}s.reduce((sum: number, item: any) => sum + (Number(item.${currencyField.name}) || 0), 0)`;
    }
    if (sem.type === 'percentage') {
      return `0`;
    }
    return `${entityVarName}s.length`;
  });

  return `import { useQuery, } from "@tanstack/react-query";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Users, DollarSign, Activity, ShoppingCart, Calendar, BarChart3, Target } from "lucide-react";
import KpiCard from "@/components/kpi-card";

function formatKpiValue(value: number, type: string): string {
  if (type === 'currency') return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
  if (type === 'percentage') return \`\${value}%\`;
  if (type === 'count') return new Intl.NumberFormat('en-US').format(value);
  return String(value);
}

export default function ${page.componentName}() {
${firstEntity ? `  const { data: ${entityVarName}s = [] } = useQuery({ queryKey: ["${entityEndpoint}"] });` : ''}

  const kpiValues = useMemo(() => [
${kpiComputations.map(c => `    ${c},`).join('\n')}
  ], [${firstEntity ? `${entityVarName}s` : ''}]);

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
            <div className="space-y-2 text-sm text-muted-foreground" data-testid="text-quick-stats">
${quickStatsContent}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
`;
}

function generateListPage(page: PlannedPage, plan: ProjectPlan, reasoning: ReasoningResult): GeneratedFile['content'] {
  const entityName = page.dataNeeded[0] || plan.dataModel[0]?.name || 'Item';
  const entity = plan.dataModel.find(e => e.name === entityName);
  const endpoint = `/api/${toKebabCase(entityName)}s`;
  const varName = toCamelCase(entityName);

  const uiPattern = reasoning?.uiPatterns.find(p => p.entityName === entityName);

  const entitySemantics = reasoning?.fieldSemantics.get(entityName) || [];
  const entityComputedFields = reasoning?.computedFields.filter(cf => cf.entityName === entityName) || [];
  const computedFieldNames = new Set(entityComputedFields.map(cf => cf.fieldName));

  const displayFields = entity?.fields.filter(f => f.name !== 'id' && f.name !== 'createdAt').slice(0, 5) || [];
  const editableFields = entity?.fields.filter(f => f.name !== 'id' && f.name !== 'createdAt' && !computedFieldNames.has(f.name) && !f.description?.startsWith('Computed:')) || [];
  const statusField = entity?.fields.find(f => f.name === 'status');
  const nameField = entity?.fields.find(f => ['name', 'title', 'firstName', 'companyName', 'orderNumber', 'trackingNumber', 'sku', 'code'].includes(f.name));

  const detailPage = plan.pages.find(p => p.path.includes(':id') && p.dataNeeded.includes(entityName));
  const detailPath = detailPage ? detailPage.path.split('/:')[0] : `/${toKebabCase(entityName)}s`;

  const getFieldSemantic = (fieldName: string): FieldSemantics | undefined => {
    return entitySemantics.find(s => s.fieldName === fieldName);
  };

  const tableHeaders = displayFields.map(f => `                <th className="text-left p-3 text-sm font-medium text-muted-foreground">${toTitleCase(f.name)}</th>`).join('\n');
  const tableRows = displayFields.map(f => {
    if (f.name === 'status') {
      return `                  <td className="p-3"><StatusBadge status={item.${f.name}} /></td>`;
    }
    const semantic = getFieldSemantic(f.name);
    if (semantic) {
      return `                  ${generateSmartTableCell(f.name, semantic)}`;
    }
    return `                  <td className="p-3 text-sm">{item.${f.name}}</td>`;
  }).join('\n');

  const formStates = editableFields.map(f => {
    const setter = `set${f.name.charAt(0).toUpperCase() + f.name.slice(1)}`;
    if (f.type === 'integer' || f.type === 'number' || f.type === 'real' || f.type.includes('decimal')) {
      return `  const [form${f.name.charAt(0).toUpperCase() + f.name.slice(1)}, ${setter}] = useState(0);`;
    }
    if (f.type === 'boolean') {
      return `  const [form${f.name.charAt(0).toUpperCase() + f.name.slice(1)}, ${setter}] = useState(false);`;
    }
    return `  const [form${f.name.charAt(0).toUpperCase() + f.name.slice(1)}, ${setter}] = useState("");`;
  }).join('\n');

  const resetFormFields = editableFields.map(f => {
    const setter = `set${f.name.charAt(0).toUpperCase() + f.name.slice(1)}`;
    if (f.type === 'integer' || f.type === 'number' || f.type === 'real' || f.type.includes('decimal')) {
      return `      ${setter}(0);`;
    }
    if (f.type === 'boolean') {
      return `      ${setter}(false);`;
    }
    return `      ${setter}("");`;
  }).join('\n');

  const formBody = editableFields.map(f => {
    return `    ${f.name}: form${f.name.charAt(0).toUpperCase() + f.name.slice(1)},`;
  }).join('\n');

  const dialogFields = editableFields.map(f => {
    const stateVar = `form${f.name.charAt(0).toUpperCase() + f.name.slice(1)}`;
    const setter = `set${f.name.charAt(0).toUpperCase() + f.name.slice(1)}`;
    const semantic = getFieldSemantic(f.name);

    if (f.type === 'boolean') {
      return `              <div className="flex items-center gap-2">
                <input id="${f.name}" type="checkbox" checked={${stateVar}} onChange={(e) => ${setter}(e.target.checked)} data-testid="input-${toKebabCase(f.name)}" />
                <Label htmlFor="${f.name}">${toTitleCase(f.name)}</Label>
              </div>`;
    }

    if (semantic) {
      switch (semantic.inputType) {
        case 'currency':
          return `              <div className="space-y-2">
                <Label htmlFor="${f.name}">${toTitleCase(f.name)}</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                  <Input id="${f.name}" type="number" step="0.01" min="0" placeholder="0.00" className="pl-7" value={${stateVar}} onChange={(e) => ${setter}(Number(e.target.value))} data-testid="input-${toKebabCase(f.name)}" />
                </div>
              </div>`;
        case 'percentage':
          return `              <div className="space-y-2">
                <Label htmlFor="${f.name}">${toTitleCase(f.name)}</Label>
                <div className="relative">
                  <Input id="${f.name}" type="number" step="0.1" min="0" max="100" placeholder="0" className="pr-8" value={${stateVar}} onChange={(e) => ${setter}(Number(e.target.value))} data-testid="input-${toKebabCase(f.name)}" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
                </div>
              </div>`;
        case 'email':
          return `              <div className="space-y-2">
                <Label htmlFor="${f.name}">${toTitleCase(f.name)}</Label>
                <Input id="${f.name}" type="email" placeholder="${semantic.placeholder || 'name@example.com'}" value={${stateVar}} onChange={(e) => ${setter}(e.target.value)} data-testid="input-${toKebabCase(f.name)}" />
              </div>`;
        case 'tel':
          return `              <div className="space-y-2">
                <Label htmlFor="${f.name}">${toTitleCase(f.name)}</Label>
                <Input id="${f.name}" type="tel" placeholder="${semantic.placeholder || '+1 (555) 000-0000'}" value={${stateVar}} onChange={(e) => ${setter}(e.target.value)} data-testid="input-${toKebabCase(f.name)}" />
              </div>`;
        case 'url':
          return `              <div className="space-y-2">
                <Label htmlFor="${f.name}">${toTitleCase(f.name)}</Label>
                <Input id="${f.name}" type="url" placeholder="${semantic.placeholder || 'https://example.com'}" value={${stateVar}} onChange={(e) => ${setter}(e.target.value)} data-testid="input-${toKebabCase(f.name)}" />
              </div>`;
        case 'date':
          return `              <div className="space-y-2">
                <Label htmlFor="${f.name}">${toTitleCase(f.name)}</Label>
                <Input id="${f.name}" type="date" value={${stateVar}} onChange={(e) => ${setter}(e.target.value)} data-testid="input-${toKebabCase(f.name)}" />
              </div>`;
        case 'datetime':
          return `              <div className="space-y-2">
                <Label htmlFor="${f.name}">${toTitleCase(f.name)}</Label>
                <Input id="${f.name}" type="datetime-local" value={${stateVar}} onChange={(e) => ${setter}(e.target.value)} data-testid="input-${toKebabCase(f.name)}" />
              </div>`;
        case 'textarea':
          return `              <div className="space-y-2">
                <Label htmlFor="${f.name}">${toTitleCase(f.name)}</Label>
                <textarea id="${f.name}" placeholder="${semantic.placeholder || 'Enter text...'}" className="flex min-h-[80px] w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-gray-600" rows={3} value={${stateVar}} onChange={(e) => ${setter}(e.target.value)} data-testid="input-${toKebabCase(f.name)}" />
              </div>`;
        case 'select':
          const enumMatch = f.type.match(/enum\(([^)]+)\)/);
          if (enumMatch) {
            const options = enumMatch[1].split(',').map(o => o.trim().replace(/'/g, ''));
            const optionElements = options.map(o => `                  <SelectOption value="${o}">${toTitleCase(o)}</SelectOption>`).join('\n');
            return `              <div className="space-y-2">
                <Label htmlFor="${f.name}">${toTitleCase(f.name)}</Label>
                <Select value={${stateVar}} onChange={(e) => ${setter}(e.target.value)} data-testid="input-${toKebabCase(f.name)}">
                  <SelectOption value="">Select ${toTitleCase(f.name)}...</SelectOption>
${optionElements}
                </Select>
              </div>`;
          }
      }
    }

    if (f.type === 'integer' || f.type === 'number' || f.type === 'real' || f.type.includes('decimal')) {
      return `              <div className="space-y-2">
                <Label htmlFor="${f.name}">${toTitleCase(f.name)}</Label>
                <Input id="${f.name}" type="number" value={${stateVar}} onChange={(e) => ${setter}(Number(e.target.value))} data-testid="input-${toKebabCase(f.name)}" />
              </div>`;
    }
    return `              <div className="space-y-2">
                <Label htmlFor="${f.name}">${toTitleCase(f.name)}</Label>
                <Input id="${f.name}" value={${stateVar}} onChange={(e) => ${setter}(e.target.value)} data-testid="input-${toKebabCase(f.name)}" />
              </div>`;
  }).join('\n');

  const statusFilterLine = statusField ? `  const [statusFilter, setStatusFilter] = useState("all");` : '';

  const statusFilterJSX = statusField ? `
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-40" data-testid="select-status-filter">
          <SelectOption value="all">All Statuses</SelectOption>
          <SelectOption value="active">Active</SelectOption>
          <SelectOption value="pending">Pending</SelectOption>
          <SelectOption value="completed">Completed</SelectOption>
          <SelectOption value="cancelled">Cancelled</SelectOption>
          <SelectOption value="draft">Draft</SelectOption>
          <SelectOption value="in-progress">In Progress</SelectOption>
        </Select>` : '';

  const statusFilterLogic = statusField
    ? `  const filtered = items.filter((item: any) => {
    const matchesSearch = JSON.stringify(item).toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });`
    : `  const filtered = items.filter((item: any) =>
    JSON.stringify(item).toLowerCase().includes(search.toLowerCase())
  );`;

  const isKanban = uiPattern?.pattern === 'kanban';
  const isCalendar = uiPattern?.pattern === 'calendar';
  const isCardGrid = uiPattern?.pattern === 'card-grid';
  const hasPatternView = isKanban || isCalendar || isCardGrid;

  const extraImports: string[] = [];
  const extraLucideIcons: string[] = [];

  if (hasPatternView) {
    extraLucideIcons.push('List');
  }
  if (isKanban) {
    extraImports.push('import { Badge } from "@/components/ui/badge";');
    extraImports.push('import { useLocation } from "wouter";');
    extraLucideIcons.push('Columns');
  }
  if (isCalendar) {
    extraImports.push('import { useMemo } from "react";');
    extraImports.push('import { useLocation } from "wouter";');
    extraLucideIcons.push('ChevronLeft', 'ChevronRight', 'Calendar');
  }
  if (isCardGrid) {
    extraImports.push('import { useLocation } from "wouter";');
    extraLucideIcons.push('Grid');
  }

  const lucideIconsList = ['Plus', 'Search', 'Trash2', ...extraLucideIcons];

  let patternStateDeclarations = '';
  if (hasPatternView) {
    patternStateDeclarations += `  const [viewMode, setViewMode] = useState<'pattern' | 'table'>('pattern');\n`;
  }
  if (isKanban || isCalendar || isCardGrid) {
    patternStateDeclarations += `  const [, navigate] = useLocation();\n`;
  }
  if (isCalendar) {
    patternStateDeclarations += `  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const itemsByDate = useMemo(() => {
    const grouped: Record<string, any[]> = {};
    for (const item of filtered) {
      const d = new Date(item.${uiPattern?.config?.dateField || 'date'});
      if (isNaN(d.getTime())) continue;
      const key = \`\${d.getFullYear()}-\${d.getMonth()}-\${d.getDate()}\`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(item);
    }
    return grouped;
  }, [filtered]);\n`;
  }

  let kanbanColumns: string[] = [];
  let kanbanCardTitle = 'name';
  let kanbanCardSubtitle = '';
  if (isKanban && uiPattern) {
    kanbanColumns = (uiPattern.config.columns as string[]) || ['To Do', 'In Progress', 'Done'];
    kanbanCardTitle = (uiPattern.config.cardTitle as string) || 'name';
    kanbanCardSubtitle = (uiPattern.config.cardSubtitle as string) || '';
  }

  let cardGridImageField = '';
  let cardGridTitleField = 'name';
  let cardGridSubtitleField = '';
  if (isCardGrid && uiPattern) {
    cardGridImageField = (uiPattern.config.imageField as string) || '';
    cardGridTitleField = (uiPattern.config.titleField as string) || 'name';
    cardGridSubtitleField = (uiPattern.config.subtitleField as string) || '';
  }

  let calendarDateField = 'date';
  let calendarTitleField = 'name';
  if (isCalendar && uiPattern) {
    calendarDateField = (uiPattern.config.dateField as string) || 'date';
    calendarTitleField = (uiPattern.config.titleField as string) || 'name';
  }

  let viewToggleJSX = '';
  if (hasPatternView) {
    let patternIcon = '';
    let patternLabel = '';
    if (isKanban) { patternIcon = '<Columns className="h-4 w-4 mr-1" />'; patternLabel = 'Board'; }
    else if (isCalendar) { patternIcon = '<Calendar className="h-4 w-4 mr-1" />'; patternLabel = 'Calendar'; }
    else if (isCardGrid) { patternIcon = '<Grid className="h-4 w-4 mr-1" />'; patternLabel = 'Grid'; }
    viewToggleJSX = `
        <div className="flex gap-1">
          <Button variant={viewMode === 'pattern' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('pattern')}>
            ${patternIcon} ${patternLabel}
          </Button>
          <Button variant={viewMode === 'table' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('table')}>
            <List className="h-4 w-4 mr-1" /> Table
          </Button>
        </div>`;
  }

  const tableViewJSX = `      <Card>
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
                    <th className="text-right p-3 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.map((item: any) => (
                    <tr key={item.id} className="hover-elevate cursor-pointer" data-testid={\`row-${toKebabCase(entityName)}-\${item.id}\`}>
${tableRows}
                      <td className="p-3 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(item.id); }}
                          data-testid={\`button-delete-\${item.id}\`}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>`;

  let patternViewJSX = '';
  if (isKanban) {
    const columnsLiteral = JSON.stringify(kanbanColumns);
    patternViewJSX = `      {isLoading ? (
        <div className="p-8 text-center text-muted-foreground" data-testid="text-loading">Loading...</div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {${columnsLiteral}.map((column: string) => (
            <div key={column} className="flex-shrink-0 w-80 bg-muted/30 rounded-lg p-3">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm">{column}</h3>
                <Badge variant="secondary">{filtered.filter((i: any) => i.status === column).length}</Badge>
              </div>
              <div className="space-y-2">
                {filtered.filter((i: any) => i.status === column).map((item: any) => (
                  <Card key={item.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(\`${detailPath}/\${item.id}\`)}>
                    <CardContent className="p-3">
                      <p className="font-medium text-sm">{item.${kanbanCardTitle}}</p>${kanbanCardSubtitle ? `
                      <p className="text-xs text-muted-foreground mt-1">{item.${kanbanCardSubtitle}}</p>` : ''}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}`;
  } else if (isCalendar) {
    patternViewJSX = `      {isLoading ? (
        <div className="p-8 text-center text-muted-foreground" data-testid="text-loading">Loading...</div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-4">
            <Button variant="outline" size="sm" onClick={() => {
              if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1); }
              else { setCurrentMonth(currentMonth - 1); }
            }}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h3 className="font-semibold">{monthNames[currentMonth]} {currentYear}</h3>
            <Button variant="outline" size="sm" onClick={() => {
              if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1); }
              else { setCurrentMonth(currentMonth + 1); }
            }}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-7 gap-px bg-muted rounded-lg overflow-hidden">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
              <div key={day} className="bg-background p-2 text-center text-xs font-medium text-muted-foreground">{day}</div>
            ))}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={\`empty-\${i}\`} className="bg-background p-2 min-h-[80px]" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateKey = \`\${currentYear}-\${currentMonth}-\${day}\`;
              const dayItems = itemsByDate[dateKey] || [];
              return (
                <div key={day} className="bg-background p-2 min-h-[80px] border-t">
                  <div className="text-xs font-medium mb-1">{day}</div>
                  <div className="space-y-1">
                    {dayItems.slice(0, 2).map((item: any) => (
                      <div key={item.id} className="text-xs bg-primary/10 text-primary rounded px-1 py-0.5 truncate cursor-pointer hover:bg-primary/20" onClick={() => navigate(\`${detailPath}/\${item.id}\`)}>
                        {item.${calendarTitleField}}
                      </div>
                    ))}
                    {dayItems.length > 2 && (
                      <div className="text-xs text-muted-foreground">+{dayItems.length - 2} more</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}`;
  } else if (isCardGrid) {
    const imageFieldJSX = cardGridImageField ? `
              {item.${cardGridImageField} && (
                <div className="h-48 bg-muted rounded-t-lg overflow-hidden">
                  <img src={item.${cardGridImageField}} alt={item.${cardGridTitleField}} className="w-full h-full object-cover" />
                </div>
              )}` : '';
    const subtitleJSX = cardGridSubtitleField ? `
                <p className="text-sm text-muted-foreground mt-1">{item.${cardGridSubtitleField}}</p>` : '';
    const statusBadgeJSX = statusField ? `
                <div className="mt-2"><StatusBadge status={item.status} /></div>` : '';
    patternViewJSX = `      {isLoading ? (
        <div className="p-8 text-center text-muted-foreground" data-testid="text-loading">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground" data-testid="text-empty">
          {search ? "No results found." : "No ${entityName.toLowerCase()}s yet. Click 'Add ${entityName}' to create one."}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item: any) => (
            <Card key={item.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(\`${detailPath}/\${item.id}\`)}>
              ${imageFieldJSX}
              <CardContent className="p-4">
                <h3 className="font-semibold">{item.${cardGridTitleField}}</h3>${subtitleJSX}${statusBadgeJSX}
              </CardContent>
            </Card>
          ))}
        </div>
      )}`;
  }

  let viewContentJSX: string;
  if (hasPatternView) {
    viewContentJSX = `      {viewMode === 'pattern' ? (
        <>
${patternViewJSX}
        </>
      ) : (
        <>
${tableViewJSX}
        </>
      )}`;
  } else {
    viewContentJSX = tableViewJSX;
  }

  return `import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectOption } from "@/components/ui/select";
import { ${lucideIconsList.join(', ')} } from "lucide-react";
import StatusBadge from "@/components/status-badge";
import { useToast } from "@/hooks/use-toast";
${extraImports.join('\n')}${extraImports.length > 0 ? '\n' : ''}
export default function ${page.componentName}() {
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
${statusFilterLine ? statusFilterLine + '\n' : ''}  const { toast } = useToast();
${patternStateDeclarations}${formStates}
  const { data: items = [], isLoading } = useQuery({ queryKey: ["${endpoint}"] });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "${endpoint}", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["${endpoint}"] });
      setShowCreate(false);
${resetFormFields}
      toast({ title: "${entityName} created", description: "The ${entityName.toLowerCase()} has been created successfully." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", \`${endpoint}/\${id}\`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["${endpoint}"] });
      toast({ title: "${entityName} deleted", description: "The ${entityName.toLowerCase()} has been deleted." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

${statusFilterLogic}

  const handleCreate = () => {
    createMutation.mutate({
${formBody}
    });
  };

  return (
    <div className="p-6 space-y-4" data-testid="page-${toKebabCase(entityName)}-list">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">${page.name}</h1>
          <p className="text-muted-foreground">${page.description}</p>
        </div>
        <div className="flex items-center gap-2">${viewToggleJSX}
          <Button onClick={() => setShowCreate(true)} data-testid="button-add-${toKebabCase(entityName)}">
            <Plus className="h-4 w-4 mr-2" />
            Add ${entityName}
          </Button>
        </div>
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
        </div>${statusFilterJSX}
      </div>

${viewContentJSX}

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create ${entityName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
${dialogFields}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)} data-testid="button-cancel-create">Cancel</Button>
            <Button onClick={handleCreate} disabled={createMutation.isPending} data-testid="button-confirm-create">
              {createMutation.isPending ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
`;
}

function generateDetailPage(page: PlannedPage, plan: ProjectPlan, reasoning: ReasoningResult): GeneratedFile['content'] {
  const entityName = page.dataNeeded[0] || plan.dataModel[0]?.name || 'Item';
  const endpoint = `/api/${toKebabCase(entityName)}s`;
  const entity = plan.dataModel.find(e => e.name === entityName);
  const displayFields = entity?.fields.filter(f => f.name !== 'id' && f.name !== 'createdAt').slice(0, 8) || [];
  const listPath = page.path.split('/:')[0];

  const entitySemantics = reasoning?.fieldSemantics.get(entityName) || [];
  const entityComputedFields = reasoning?.computedFields.filter(cf => cf.entityName === entityName && cf.displayInDetail) || [];

  const getFieldSemantic = (fieldName: string): FieldSemantics | undefined => {
    return entitySemantics.find(s => s.fieldName === fieldName);
  };

  // Find related entities
  const childRelationships = reasoning?.relationships.filter(r =>
    r.to === entityName && (r.cardinality === '1:N' || r.cardinality === 'N:1')
  ) || [];

  const parentRelationships = reasoning?.relationships.filter(r =>
    r.from === entityName && (r.cardinality === 'N:1' || r.cardinality === '1:1')
  ) || [];

  // Generate related sections with inline create forms
  const relatedSections = childRelationships.map(rel => {
    const childEntity = plan.dataModel.find(e => e.name === rel.from);
    if (!childEntity) return null;

    const childEndpoint = `/api/${toKebabCase(rel.from)}s`;
    const childVarName = toCamelCase(rel.from);
    const foreignKey = rel.fromField || `${toCamelCase(entityName)}Id`;
    const childDisplayFields = childEntity.fields
      .filter(f => f.name !== 'id' && f.name !== 'createdAt' && f.name !== foreignKey)
      .slice(0, 4);

    const childEditableFields = childEntity.fields
      .filter(f => f.name !== 'id' && f.name !== 'createdAt' && f.name !== foreignKey);

    const childSemantics = reasoning?.fieldSemantics.get(rel.from) || [];
    const childComputedFields = reasoning?.computedFields.filter(cf => cf.entityName === rel.from) || [];
    const computedFieldNames = new Set(childComputedFields.map(cf => cf.fieldName));
    const getChildFieldSemantic = (fieldName: string): FieldSemantics | undefined => {
      return childSemantics.find(s => s.fieldName === fieldName);
    };

    const childTableRows = childDisplayFields.map(f => {
      const semantic = getChildFieldSemantic(f.name);
      if (semantic) {
        switch (semantic.inputType) {
          case 'currency':
            return `                    <td className="py-2">{typeof child?.${f.name} === 'number' ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(child.${f.name}) : '—'}</td>`;
          case 'percentage':
            return `                    <td className="py-2">{typeof child?.${f.name} === 'number' ? \`\${child.${f.name}}%\` : '—'}</td>`;
          case 'date':
          case 'datetime':
            return `                    <td className="py-2">{child?.${f.name} ? new Date(child.${f.name}).toLocaleDateString() : '—'}</td>`;
          case 'email':
            return `                    <td className="py-2">{child?.${f.name} ? <a href={\`mailto:\${child.${f.name}}\`} className="text-blue-600 hover:underline">{child.${f.name}}</a> : '—'}</td>`;
          case 'tel':
            return `                    <td className="py-2">{child?.${f.name} ? <a href={\`tel:\${child.${f.name}}\`} className="text-blue-600 hover:underline">{child.${f.name}}</a> : '—'}</td>`;
          case 'url':
            return `                    <td className="py-2">{child?.${f.name} ? <a href={child.${f.name}} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{child.${f.name}}</a> : '—'}</td>`;
          case 'checkbox':
            return `                    <td className="py-2">{child?.${f.name} ? 'Yes' : 'No'}</td>`;
        }
      }
      return `                    <td className="py-2">{child?.${f.name} ?? "—"}</td>`;
    }).join('\n');

    const formableFields = childEditableFields.filter(f =>
      !computedFieldNames.has(f.name) && !f.description?.startsWith('Computed:')
    ).slice(0, 6);

    const formStates = formableFields.map(f => {
      const setter = `setChild${rel.from}${f.name.charAt(0).toUpperCase() + f.name.slice(1)}`;
      const stateVar = `child${rel.from}${f.name.charAt(0).toUpperCase() + f.name.slice(1)}`;
      if (f.type === 'integer' || f.type === 'number' || f.type === 'real' || f.type.includes('decimal')) {
        return `  const [${stateVar}, ${setter}] = useState(0);`;
      }
      if (f.type === 'boolean') {
        return `  const [${stateVar}, ${setter}] = useState(false);`;
      }
      return `  const [${stateVar}, ${setter}] = useState("");`;
    }).join('\n');

    const formBody = formableFields.map(f => {
      return `      ${f.name}: child${rel.from}${f.name.charAt(0).toUpperCase() + f.name.slice(1)},`;
    }).join('\n');

    const resetFields = formableFields.map(f => {
      const setter = `setChild${rel.from}${f.name.charAt(0).toUpperCase() + f.name.slice(1)}`;
      if (f.type === 'integer' || f.type === 'number' || f.type === 'real' || f.type.includes('decimal')) return `      ${setter}(0);`;
      if (f.type === 'boolean') return `      ${setter}(false);`;
      return `      ${setter}("");`;
    }).join('\n');

    const formInputs = formableFields.map(f => {
      const stateVar = `child${rel.from}${f.name.charAt(0).toUpperCase() + f.name.slice(1)}`;
      const setter = `setChild${rel.from}${f.name.charAt(0).toUpperCase() + f.name.slice(1)}`;
      const semantic = getChildFieldSemantic(f.name);

      if (f.type === 'boolean') {
        return `                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={${stateVar}} onChange={(e) => ${setter}(e.target.checked)} /> ${toTitleCase(f.name)}</label>`;
      }

      if (semantic) {
        switch (semantic.inputType) {
          case 'currency':
            return `                <div className="relative"><span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span><input type="number" step="0.01" min="0" placeholder="${toTitleCase(f.name)}" className="w-full pl-6 rounded border px-3 py-1.5 text-sm" value={${stateVar}} onChange={(e) => ${setter}(Number(e.target.value))} data-testid="input-${toKebabCase(f.name)}" /></div>`;
          case 'date':
            return `                <input type="date" placeholder="${toTitleCase(f.name)}" className="w-full rounded border px-3 py-1.5 text-sm" value={${stateVar}} onChange={(e) => ${setter}(e.target.value)} data-testid="input-${toKebabCase(f.name)}" />`;
          case 'datetime':
            return `                <input type="datetime-local" placeholder="${toTitleCase(f.name)}" className="w-full rounded border px-3 py-1.5 text-sm" value={${stateVar}} onChange={(e) => ${setter}(e.target.value)} data-testid="input-${toKebabCase(f.name)}" />`;
          case 'email':
            return `                <input type="email" placeholder="${semantic.placeholder || toTitleCase(f.name)}" className="w-full rounded border px-3 py-1.5 text-sm" value={${stateVar}} onChange={(e) => ${setter}(e.target.value)} data-testid="input-${toKebabCase(f.name)}" />`;
          case 'tel':
            return `                <input type="tel" placeholder="${semantic.placeholder || toTitleCase(f.name)}" className="w-full rounded border px-3 py-1.5 text-sm" value={${stateVar}} onChange={(e) => ${setter}(e.target.value)} data-testid="input-${toKebabCase(f.name)}" />`;
          case 'textarea':
            return `                <textarea placeholder="${toTitleCase(f.name)}" rows={2} className="w-full rounded border px-3 py-1.5 text-sm" value={${stateVar}} onChange={(e) => ${setter}(e.target.value)} data-testid="input-${toKebabCase(f.name)}" />`;
          case 'select':
            const enumMatch = f.type.match(/enum\(([^)]+)\)/);
            if (enumMatch) {
              const options = enumMatch[1].split(',').map(o => o.trim().replace(/'/g, ''));
              return `                <select className="w-full rounded border px-3 py-1.5 text-sm" value={${stateVar}} onChange={(e) => ${setter}(e.target.value)} data-testid="input-${toKebabCase(f.name)}">\n                  <option value="">Select ${toTitleCase(f.name)}</option>\n${options.map(o => `                  <option value="${o}">${toTitleCase(o)}</option>`).join('\n')}\n                </select>`;
            }
        }
      }

      if (f.type === 'integer' || f.type === 'number' || f.type === 'real' || f.type.includes('decimal')) {
        return `                <input type="number" placeholder="${toTitleCase(f.name)}" className="w-full rounded border px-3 py-1.5 text-sm" value={${stateVar}} onChange={(e) => ${setter}(Number(e.target.value))} data-testid="input-${toKebabCase(f.name)}" />`;
      }

      return `                <input type="text" placeholder="${toTitleCase(f.name)}" className="w-full rounded border px-3 py-1.5 text-sm" value={${stateVar}} onChange={(e) => ${setter}(e.target.value)} data-testid="input-${toKebabCase(f.name)}" />`;
    }).join('\n');

    const showFormVar = `showAdd${rel.from}`;
    const mutationVar = `create${rel.from}Mutation`;

    const queryDecl = `  const { data: ${childVarName}s = [] } = useQuery({
    queryKey: ["${childEndpoint}", { ${foreignKey}: id }],
    enabled: !!id,
  });
  const [${showFormVar}, setShow${rel.from}Form] = useState(false);
${formStates}
  const ${mutationVar} = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "${childEndpoint}", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["${childEndpoint}"] });
      setShow${rel.from}Form(false);
${resetFields}
      toast({ title: "${toTitleCase(rel.from)} added" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });`;

    const section = `
      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">${toTitleCase(rel.from)}s</CardTitle>
          <Button size="sm" variant="outline" onClick={() => setShow${rel.from}Form(!${showFormVar})} data-testid="button-add-${toKebabCase(rel.from)}">
            <Plus className="h-3 w-3 mr-1" /> Add
          </Button>
        </CardHeader>
        <CardContent>
          {${showFormVar} && (
            <div className="mb-4 p-3 border rounded-lg space-y-2 bg-muted/30">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
${formInputs}
              </div>
              <div className="flex gap-2 justify-end">
                <Button size="sm" variant="ghost" onClick={() => setShow${rel.from}Form(false)}>Cancel</Button>
                <Button size="sm" onClick={() => ${mutationVar}.mutate({
${formBody}
      ${foreignKey}: Number(id),
    })} disabled={${mutationVar}.isPending} data-testid="button-submit-${toKebabCase(rel.from)}">
                  {${mutationVar}.isPending ? "Adding..." : "Add ${toTitleCase(rel.from)}"}
                </Button>
              </div>
            </div>
          )}
          {${childVarName}s.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
${childDisplayFields.map(f => `                  <th className="text-left py-2 font-medium">${toTitleCase(f.name)}</th>`).join('\n')}
                </tr>
              </thead>
              <tbody>
                {${childVarName}s.map((child: any) => (
                  <tr key={child.id} className="border-b last:border-0">
${childTableRows}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-sm text-muted-foreground">No related ${rel.from.toLowerCase()}s found.</p>
          )}
        </CardContent>
      </Card>`;

    return { queryDecl, section };
  }).filter(Boolean);

  // Generate parent navigation links
  const parentLinks = parentRelationships.map(rel => {
    const parentEntity = plan.dataModel.find(e => e.name === rel.to);
    if (!parentEntity) return '';
    const parentPage = plan.pages.find(p => p.dataNeeded?.includes(rel.to));
    const parentPath = parentPage?.path?.split('/:')[0] || `/${toKebabCase(rel.to)}s`;
    const foreignKey = rel.fromField || `${toCamelCase(rel.to)}Id`;
    return `{item?.${foreignKey} && <Link href={\`${parentPath}/\${item.${foreignKey}}\`}><Button variant="ghost" size="sm"><ArrowLeft className="h-3 w-3 mr-1" /> View ${toTitleCase(rel.to)}</Button></Link>}`;
  }).filter(Boolean);

  const additionalQueries = relatedSections.map((s: any) => s.queryDecl).join('\n');
  const relatedContent = relatedSections.map((s: any) => s.section).join('\n');

  const fieldRows = displayFields.map(f => {
    const semantic = getFieldSemantic(f.name);
    if (f.name === 'status') {
      return `              <div>
                <dt className="text-sm text-muted-foreground">${toTitleCase(f.name)}</dt>
                <dd className="mt-1" data-testid="text-${toKebabCase(f.name)}"><StatusBadge status={item?.${f.name} ?? ""} /></dd>
              </div>`;
    }
    if (semantic) {
      switch (semantic.inputType) {
        case 'currency':
          return `              <div>
                <dt className="text-sm text-muted-foreground">${toTitleCase(f.name)}</dt>
                <dd className="text-sm font-medium mt-1" data-testid="text-${toKebabCase(f.name)}">{typeof item?.${f.name} === 'number' ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(item.${f.name}) : '—'}</dd>
              </div>`;
        case 'percentage':
          return `              <div>
                <dt className="text-sm text-muted-foreground">${toTitleCase(f.name)}</dt>
                <dd className="text-sm font-medium mt-1" data-testid="text-${toKebabCase(f.name)}">{typeof item?.${f.name} === 'number' ? \`\${item.${f.name}}%\` : '—'}</dd>
              </div>`;
        case 'date':
        case 'datetime':
          return `              <div>
                <dt className="text-sm text-muted-foreground">${toTitleCase(f.name)}</dt>
                <dd className="text-sm font-medium mt-1" data-testid="text-${toKebabCase(f.name)}">{item?.${f.name} ? new Date(item.${f.name}).toLocaleDateString() : '—'}</dd>
              </div>`;
        case 'email':
          return `              <div>
                <dt className="text-sm text-muted-foreground">${toTitleCase(f.name)}</dt>
                <dd className="text-sm font-medium mt-1" data-testid="text-${toKebabCase(f.name)}">{item?.${f.name} ? <a href={\`mailto:\${item.${f.name}}\`} className="text-blue-600 hover:underline">{item.${f.name}}</a> : '—'}</dd>
              </div>`;
        case 'tel':
          return `              <div>
                <dt className="text-sm text-muted-foreground">${toTitleCase(f.name)}</dt>
                <dd className="text-sm font-medium mt-1" data-testid="text-${toKebabCase(f.name)}">{item?.${f.name} ? <a href={\`tel:\${item.${f.name}}\`} className="text-blue-600 hover:underline">{item.${f.name}}</a> : '—'}</dd>
              </div>`;
        case 'url':
          return `              <div>
                <dt className="text-sm text-muted-foreground">${toTitleCase(f.name)}</dt>
                <dd className="text-sm font-medium mt-1" data-testid="text-${toKebabCase(f.name)}">{item?.${f.name} ? <a href={item.${f.name}} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{item.${f.name}}</a> : '—'}</dd>
              </div>`;
        case 'checkbox':
          return `              <div>
                <dt className="text-sm text-muted-foreground">${toTitleCase(f.name)}</dt>
                <dd className="text-sm font-medium mt-1" data-testid="text-${toKebabCase(f.name)}">{item?.${f.name} ? 'Yes' : 'No'}</dd>
              </div>`;
      }
    }
    return `              <div>
                <dt className="text-sm text-muted-foreground">${toTitleCase(f.name)}</dt>
                <dd className="text-sm font-medium mt-1" data-testid="text-${toKebabCase(f.name)}">{item?.${f.name} ?? "—"}</dd>
              </div>`;
  }).join('\n');

  const computedFieldRows = entityComputedFields.map(cf => {
    return `              <div>
                <dt className="text-sm text-muted-foreground">${toTitleCase(cf.fieldName)} <span className="text-xs text-blue-500">(computed)</span></dt>
                <dd className="text-sm font-medium mt-1" data-testid="text-${toKebabCase(cf.fieldName)}">{${cf.expression.replace(/\bthis\./g, 'item?.')}}</dd>
              </div>`;
  }).join('\n');

  const hasChildForms = relatedSections.length > 0;
  const stateImport = hasChildForms ? `import { useState } from "react";\n` : '';
  const lucideIcons = hasChildForms ? 'ArrowLeft, Trash2, Plus' : 'ArrowLeft, Trash2';

  return `${stateImport}import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, Link, useLocation } from "wouter";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ${lucideIcons} } from "lucide-react";
import StatusBadge from "@/components/status-badge";
import { useToast } from "@/hooks/use-toast";

export default function ${page.componentName}() {
  const [, params] = useRoute("${page.path}");
  const id = params?.id;
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const { data: item, isLoading } = useQuery({
    queryKey: ["${endpoint}", id],
    enabled: !!id,
  });
${additionalQueries ? '\n' + additionalQueries : ''}

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", \`${endpoint}/\${id}\`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["${endpoint}"] });
      toast({ title: "${entityName} deleted", description: "The ${entityName.toLowerCase()} has been deleted." });
      navigate("${listPath}");
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
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
        <Link href="${listPath}">
          <Button variant="ghost" size="icon" data-testid="button-back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold flex-1" data-testid="text-page-title">${page.name}</h1>
        <div className="flex items-center gap-2">
          ${parentLinks.length > 0 ? parentLinks.join('\n          ') : ''}${parentLinks.length > 0 ? '\n          ' : ''}
          <Button
            variant="destructive"
            onClick={() => deleteMutation.mutate()}
            disabled={deleteMutation.isPending}
            data-testid="button-delete-${toKebabCase(entityName)}"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {deleteMutation.isPending ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
${fieldRows}
${computedFieldRows ? computedFieldRows + '\n' : ''}          </dl>
        </CardContent>
      </Card>
${relatedContent}
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

function generateDataTable(plan: ProjectPlan, reasoning: ReasoningResult): GeneratedFile {
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
