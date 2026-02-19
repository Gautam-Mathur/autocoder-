import type { PlannedEntity } from './plan-generator.js';
import type { FieldSemantics, ReasoningResult } from './contextual-reasoning-engine.js';

export interface ComponentDependency {
  imports: string[];
  npmPackages: string[];
  components: string[];
  hooks: string[];
  lucideIcons: string[];
}

export interface ComponentTemplate {
  id: string;
  path: string;
  content: string;
  language: string;
  deps: ComponentDependency;
}

function emptyDeps(): ComponentDependency {
  return { imports: [], npmPackages: [], components: [], hooks: [], lucideIcons: [] };
}

export function getUtilsComponent(): ComponentTemplate {
  return {
    id: 'lib-utils',
    path: 'src/lib/utils.ts',
    language: 'typescript',
    deps: { ...emptyDeps(), npmPackages: ['clsx', 'tailwind-merge'] },
    content: `import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number | null | undefined, currency = 'USD'): string {
  if (value == null || isNaN(value)) return '—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(value);
}

export function formatNumber(value: number | null | undefined): string {
  if (value == null || isNaN(value)) return '—';
  return new Intl.NumberFormat('en-US').format(value);
}

export function formatPercent(value: number | null | undefined): string {
  if (value == null || isNaN(value)) return '—';
  return \`\${value}%\`;
}

export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return '—';
  const d = new Date(value);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatDateTime(value: string | Date | null | undefined): string {
  if (!value) return '—';
  const d = new Date(value);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function safeGet(obj: any, key: string, fallback: string = '—'): any {
  const val = obj?.[key];
  if (val == null || val === '') return fallback;
  return val;
}

export function toTitleCase(str: string): string {
  return str
    .replace(/([A-Z])/g, ' $1')
    .replace(/[_-]/g, ' ')
    .replace(/\\b\\w/g, c => c.toUpperCase())
    .trim();
}

export function toKebabCase(str: string): string {
  return str.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '').replace(/[\\s_]+/g, '-');
}
`,
  };
}

export function getQueryClientComponent(): ComponentTemplate {
  return {
    id: 'lib-queryClient',
    path: 'src/lib/queryClient.ts',
    language: 'typescript',
    deps: { ...emptyDeps(), npmPackages: ['@tanstack/react-query'] },
    content: `import { QueryClient, type MutationMeta } from "@tanstack/react-query";

export async function apiRequest(method: string, url: string, body?: any) {
  const res = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    let message: string;
    try {
      const parsed = JSON.parse(text);
      message = parsed.message || parsed.error || text;
    } catch {
      message = text || res.statusText;
    }
    throw new Error(message);
  }
  return res;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey }) => {
        const [url, params] = queryKey as [string, Record<string, any>?];
        let fullUrl = url;
        if (params && typeof params === 'object') {
          const searchParams = new URLSearchParams();
          for (const [k, v] of Object.entries(params)) {
            if (v != null) searchParams.set(k, String(v));
          }
          const qs = searchParams.toString();
          if (qs) fullUrl += \`?\${qs}\`;
        }
        const res = await fetch(fullUrl);
        if (!res.ok) {
          throw new Error(\`\${res.status}: \${res.statusText}\`);
        }
        return res.json();
      },
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 30000,
      retry: false,
    },
  },
});
`,
  };
}

export function getUseToastHook(): ComponentTemplate {
  return {
    id: 'hook-useToast',
    path: 'src/hooks/use-toast.ts',
    language: 'typescript',
    deps: emptyDeps(),
    content: `// @generated
import { useState, useCallback } from "react";

interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
}

let toastCount = 0;
let globalToasts: Toast[] = [];
let listeners: Array<() => void> = [];

function notify() { listeners.forEach(l => l()); }

export function toast({ title, description, variant = "default" }: Omit<Toast, "id">) {
  const id = String(++toastCount);
  globalToasts = [...globalToasts, { id, title, description, variant }];
  notify();
  setTimeout(() => {
    globalToasts = globalToasts.filter(t => t.id !== id);
    notify();
  }, 5000);
  return { id, dismiss: () => { globalToasts = globalToasts.filter(t => t.id !== id); notify(); } };
}

export function useToast() {
  const [, setTick] = useState(0);
  const rerender = useCallback(() => setTick(t => t + 1), []);

  useState(() => { listeners.push(rerender); });

  return {
    toasts: globalToasts,
    toast,
    dismiss: (id: string) => { globalToasts = globalToasts.filter(t => t.id !== id); notify(); },
  };
}
`,
  };
}

export function getButtonComponent(): ComponentTemplate {
  return {
    id: 'ui-button',
    path: 'src/components/ui/button.tsx',
    language: 'tsx',
    deps: { ...emptyDeps(), components: ['lib-utils'] },
    content: `import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", loading, disabled, children, ...props }, ref) => {
    const variants: Record<string, string> = {
      default: "bg-primary text-primary-foreground hover:bg-primary/90 border border-primary/20",
      destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 border border-destructive/20",
      outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-secondary/20",
      ghost: "hover:bg-accent hover:text-accent-foreground",
      link: "text-primary underline-offset-4 hover:underline",
    };
    const sizes: Record<string, string> = {
      default: "min-h-9 px-4 py-2",
      sm: "min-h-8 px-3 text-sm",
      lg: "min-h-10 px-6",
      icon: "h-9 w-9",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {loading && (
          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button };
export type { ButtonProps };
`,
  };
}

export function getCardComponent(): ComponentTemplate {
  return {
    id: 'ui-card',
    path: 'src/components/ui/card.tsx',
    language: 'tsx',
    deps: { ...emptyDeps(), components: ['lib-utils'] },
    content: `import { cn } from "@/lib/utils";

function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-md border bg-card text-card-foreground shadow-sm", className)}
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
  return <p className={cn("text-sm text-muted-foreground", className)} {...props} />;
}

function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6 pt-0", className)} {...props} />;
}

function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex items-center p-6 pt-0 gap-2 flex-wrap", className)} {...props} />;
}

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
`,
  };
}

export function getInputComponent(): ComponentTemplate {
  return {
    id: 'ui-input',
    path: 'src/components/ui/input.tsx',
    language: 'tsx',
    deps: { ...emptyDeps(), components: ['lib-utils'] },
    content: `import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
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
`,
  };
}

export function getTextareaComponent(): ComponentTemplate {
  return {
    id: 'ui-textarea',
    path: 'src/components/ui/textarea.tsx',
    language: 'tsx',
    deps: { ...emptyDeps(), components: ['lib-utils'] },
    content: `import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
`,
  };
}

export function getBadgeComponent(): ComponentTemplate {
  return {
    id: 'ui-badge',
    path: 'src/components/ui/badge.tsx',
    language: 'tsx',
    deps: { ...emptyDeps(), components: ['lib-utils'] },
    content: `import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants: Record<string, string> = {
    default: "bg-primary/10 text-primary border-primary/20",
    secondary: "bg-secondary text-secondary-foreground border-secondary/20",
    destructive: "bg-destructive/10 text-destructive border-destructive/20",
    outline: "border-input text-foreground",
    success: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
    warning: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
export type { BadgeProps };
`,
  };
}

export function getLabelComponent(): ComponentTemplate {
  return {
    id: 'ui-label',
    path: 'src/components/ui/label.tsx',
    language: 'tsx',
    deps: { ...emptyDeps(), components: ['lib-utils'] },
    content: `import { forwardRef } from "react";
import { cn } from "@/lib/utils";

const Label = forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70", className)}
      {...props}
    />
  )
);
Label.displayName = "Label";

export { Label };
`,
  };
}

export function getDialogComponent(): ComponentTemplate {
  return {
    id: 'ui-dialog',
    path: 'src/components/ui/dialog.tsx',
    language: 'tsx',
    deps: { ...emptyDeps(), components: ['lib-utils'] },
    content: `import { useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

function Dialog({ open, onOpenChange, children }: DialogProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === "Escape") onOpenChange(false); };
    if (open) document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div ref={overlayRef} className="fixed inset-0 z-50 flex items-center justify-center" onClick={(e) => { if (e.target === overlayRef.current) onOpenChange(false); }}>
      <div className="fixed inset-0 bg-black/50" />
      <div className="relative z-50 w-full max-w-lg mx-4 animate-in fade-in-0 zoom-in-95">
        {children}
      </div>
    </div>
  );
}

function DialogContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("bg-background rounded-md border shadow-lg p-6 max-h-[85vh] overflow-y-auto", className)} {...props}>
      {children}
    </div>
  );
}

function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mb-4", className)} {...props} />;
}

function DialogTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn("text-lg font-semibold", className)} {...props} />;
}

function DialogDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-muted-foreground mt-1", className)} {...props} />;
}

function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mt-6 flex justify-end gap-2", className)} {...props} />;
}

export { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter };
`,
  };
}

export function getSelectComponent(): ComponentTemplate {
  return {
    id: 'ui-select',
    path: 'src/components/ui/select.tsx',
    language: 'tsx',
    deps: { ...emptyDeps(), components: ['lib-utils'] },
    content: `import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
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
  return <option className={className} {...props} />;
}

export { Select, SelectOption };
`,
  };
}

export function getToasterComponent(): ComponentTemplate {
  return {
    id: 'ui-toaster',
    path: 'src/components/ui/toaster.tsx',
    language: 'tsx',
    deps: { ...emptyDeps(), hooks: ['hook-useToast'] },
    content: `// @generated
import { useToast } from "@/hooks/use-toast";

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
`,
  };
}

export function getTabsComponent(): ComponentTemplate {
  return {
    id: 'ui-tabs',
    path: 'src/components/ui/tabs.tsx',
    language: 'tsx',
    deps: { ...emptyDeps(), components: ['lib-utils'] },
    content: `import { useState } from "react";
import { cn } from "@/lib/utils";

interface TabsProps {
  defaultValue: string;
  children: React.ReactNode;
  className?: string;
}

interface TabsContextType {
  activeTab: string;
  setActiveTab: (v: string) => void;
}

const TabsContext = { current: { activeTab: '', setActiveTab: (_: string) => {} } };

function Tabs({ defaultValue, children, className }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultValue);
  TabsContext.current = { activeTab, setActiveTab };
  return <div className={cn("w-full", className)}>{children}</div>;
}

function TabsList({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("inline-flex h-9 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground", className)} {...props}>
      {children}
    </div>
  );
}

function TabsTrigger({ value, className, children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string }) {
  const { activeTab, setActiveTab } = TabsContext.current;
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1 text-sm font-medium transition-all",
        activeTab === value ? "bg-background text-foreground shadow-sm" : "hover:text-foreground/80",
        className
      )}
      onClick={() => setActiveTab(value)}
      {...props}
    >
      {children}
    </button>
  );
}

function TabsContent({ value, className, children, ...props }: React.HTMLAttributes<HTMLDivElement> & { value: string }) {
  const { activeTab } = TabsContext.current;
  if (activeTab !== value) return null;
  return <div className={cn("mt-2", className)} {...props}>{children}</div>;
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
`,
  };
}

export function getStatusBadgeComponent(plan: { dataModel: PlannedEntity[] }): ComponentTemplate {
  const allStatuses = new Set<string>();
  for (const entity of plan.dataModel) {
    for (const field of entity.fields) {
      if (field.name === 'status') {
        const enumMatch = field.type.match(/enum\(([^)]+)\)/);
        if (enumMatch) {
          enumMatch[1].split(',').map(s => s.trim().replace(/'/g, '')).forEach(s => allStatuses.add(s));
        }
      }
    }
  }
  if (allStatuses.size === 0) {
    ['active', 'inactive', 'pending', 'completed', 'cancelled', 'draft', 'in-progress', 'approved', 'rejected'].forEach(s => allStatuses.add(s));
  }

  const statusMapEntries = Array.from(allStatuses).map(s => {
    const lower = s.toLowerCase();
    if (/complet|done|success|approv|paid|deliver|resolved|closed/i.test(lower)) return `    "${s}": "success"`;
    if (/cancel|reject|fail|error|expired|deleted|overdue/i.test(lower)) return `    "${s}": "destructive"`;
    if (/pending|review|waiting|hold|processing|in.?progress|open/i.test(lower)) return `    "${s}": "warning"`;
    if (/draft|inactive|archived/i.test(lower)) return `    "${s}": "secondary"`;
    return `    "${s}": "default"`;
  }).join(',\n');

  return {
    id: 'comp-status-badge',
    path: 'src/components/status-badge.tsx',
    language: 'tsx',
    deps: { ...emptyDeps(), components: ['ui-badge', 'lib-utils'] },
    content: `import { Badge } from "@/components/ui/badge";
import { toTitleCase } from "@/lib/utils";

const statusVariantMap: Record<string, "default" | "secondary" | "destructive" | "outline" | "success" | "warning"> = {
${statusMapEntries}
  };

interface StatusBadgeProps {
  status: string;
  className?: string;
  "data-testid"?: string;
}

export default function StatusBadge({ status, className, ...props }: StatusBadgeProps) {
  const variant = statusVariantMap[status] || statusVariantMap[status?.toLowerCase()] || "secondary";
  return (
    <Badge variant={variant} className={className} {...props}>
      {toTitleCase(status || "Unknown")}
    </Badge>
  );
}
`,
  };
}

export function getEmptyStateComponent(): ComponentTemplate {
  return {
    id: 'comp-empty-state',
    path: 'src/components/empty-state.tsx',
    language: 'tsx',
    deps: { ...emptyDeps(), components: ['ui-button', 'lib-utils'] },
    content: `import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  className?: string;
  "data-testid"?: string;
}

export default function EmptyState({ icon, title, description, action, className, ...props }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12 px-4 text-center", className)} {...props}>
      {icon && <div className="mb-4 text-muted-foreground">{icon}</div>}
      <h3 className="text-lg font-semibold">{title}</h3>
      {description && <p className="text-sm text-muted-foreground mt-1 max-w-sm">{description}</p>}
      {action && (
        <Button className="mt-4" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
`,
  };
}

export function getConfirmDialogComponent(): ComponentTemplate {
  return {
    id: 'comp-confirm-dialog',
    path: 'src/components/confirm-dialog.tsx',
    language: 'tsx',
    deps: { ...emptyDeps(), components: ['ui-dialog', 'ui-button'] },
    content: `import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  variant?: "default" | "destructive";
  loading?: boolean;
  onConfirm: () => void;
}

export default function ConfirmDialog({
  open, onOpenChange, title, description,
  confirmLabel = "Confirm", variant = "default",
  loading, onConfirm
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
          <Button variant={variant} onClick={onConfirm} loading={loading}>{confirmLabel}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
`,
  };
}

export function getKpiCardComponent(): ComponentTemplate {
  return {
    id: 'comp-kpi-card',
    path: 'src/components/kpi-card.tsx',
    language: 'tsx',
    deps: { ...emptyDeps(), components: ['ui-card', 'lib-utils'] },
    content: `import { Card, CardContent } from "@/components/ui/card";
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
  const isNegative = change?.startsWith("-");

  return (
    <Card className={cn("", className)} {...props}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-muted-foreground">{title}</p>
          {icon && <div className="text-muted-foreground">{icon}</div>}
        </div>
        <div className="mt-2">
          <p className="text-2xl font-bold">{value}</p>
          {change && (
            <p className={cn("text-xs mt-1", isPositive && "text-green-600 dark:text-green-400", isNegative && "text-red-600 dark:text-red-400", !isPositive && !isNegative && "text-muted-foreground")}>
              {change} from last period
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
`,
  };
}

export function getLoadingSkeletonComponent(): ComponentTemplate {
  return {
    id: 'comp-loading-skeleton',
    path: 'src/components/loading-skeleton.tsx',
    language: 'tsx',
    deps: { ...emptyDeps(), components: ['lib-utils'] },
    content: `import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-pulse rounded-md bg-muted", className)} {...props} />;
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-3 p-4">
      <div className="flex gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton key={j} className="h-8 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-md border p-6 space-y-4">
      <Skeleton className="h-5 w-1/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  );
}

export function KpiSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-md border p-4 space-y-3">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      ))}
    </div>
  );
}

export { Skeleton };
`,
  };
}

export function getThemeProviderComponent(): ComponentTemplate {
  return {
    id: 'comp-theme-provider',
    path: 'src/components/theme-provider.tsx',
    language: 'tsx',
    deps: emptyDeps(),
    content: `import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({ theme: "dark", setTheme: () => {} });

export function ThemeProvider({ children, defaultTheme = "dark" }: { children: React.ReactNode; defaultTheme?: Theme }) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem("theme") as Theme) || defaultTheme;
    }
    return defaultTheme;
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");

    if (theme === "system") {
      const sys = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      root.classList.add(sys);
    } else {
      root.classList.add(theme);
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
`,
  };
}

export function getAllBaseComponents(plan: { dataModel: PlannedEntity[] }): ComponentTemplate[] {
  return [
    getUtilsComponent(),
    getQueryClientComponent(),
    getUseToastHook(),
    getButtonComponent(),
    getCardComponent(),
    getInputComponent(),
    getTextareaComponent(),
    getBadgeComponent(),
    getLabelComponent(),
    getDialogComponent(),
    getSelectComponent(),
    getToasterComponent(),
    getTabsComponent(),
    getStatusBadgeComponent(plan),
    getEmptyStateComponent(),
    getConfirmDialogComponent(),
    getKpiCardComponent(),
    getLoadingSkeletonComponent(),
    getThemeProviderComponent(),
  ];
}

export function resolveComponentDependencies(requestedIds: string[], allComponents: ComponentTemplate[]): ComponentTemplate[] {
  const componentMap = new Map(allComponents.map(c => [c.id, c]));
  const resolved = new Set<string>();
  const result: ComponentTemplate[] = [];

  function resolve(id: string) {
    if (resolved.has(id)) return;
    resolved.add(id);
    const comp = componentMap.get(id);
    if (!comp) return;
    for (const depId of [...comp.deps.components, ...comp.deps.hooks]) {
      resolve(depId);
    }
    result.push(comp);
  }

  for (const id of requestedIds) {
    resolve(id);
  }

  return result;
}

export function collectNpmPackages(components: ComponentTemplate[]): Set<string> {
  const packages = new Set<string>();
  for (const comp of components) {
    for (const pkg of comp.deps.npmPackages) {
      packages.add(pkg);
    }
  }
  return packages;
}
