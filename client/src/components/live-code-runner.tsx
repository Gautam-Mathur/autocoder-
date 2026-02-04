import { useMemo, useState, useRef, useEffect } from "react";
import { Play, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface GeneratedFile {
  path: string;
  content: string;
  language?: string;
}

interface LiveCodeRunnerProps {
  files: GeneratedFile[];
  projectName?: string;
  showEditor?: boolean;
  height?: string;
}

export function LiveCodeRunner({ 
  files, 
  projectName = "Generated Project",
  height = "500px"
}: LiveCodeRunnerProps) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const previewHtml = useMemo(() => {
    // Collect all TSX/JSX files
    const tsxFiles = files.filter(f => 
      f.path.endsWith('.tsx') || f.path.endsWith('.jsx')
    );
    const cssFiles = files.filter(f => f.path.endsWith('.css'));
    
    // For HTML-only projects
    const htmlFile = files.find(f => f.path.endsWith('.html'));
    if (htmlFile && !tsxFiles.length) {
      let html = htmlFile.content;
      html = html.replace('</head>', `<style>${cssFiles.map(f => f.content).join('\n')}</style></head>`);
      const jsFiles = files.filter(f => f.path.endsWith('.js') && !f.path.includes('.tsx'));
      html = html.replace('</body>', `<script>${jsFiles.map(f => f.content).join('\n')}</script></body>`);
      return html;
    }

    if (!tsxFiles.length) return '';

    // Build a map of all components by name
    const componentMap: Record<string, string> = {};
    
    for (const file of tsxFiles) {
      const fileName = file.path.split('/').pop()?.replace(/\.(tsx|jsx)$/, '') || '';
      let code = file.content;
      
      // Fix common syntax errors in generated code
      // Handle all variations of "return (" with stray semicolons
      code = code.replace(/return\s*\(\s*;+\s*/g, 'return (\n');
      code = code.replace(/return\s*\(\s*\n\s*;+\s*/g, 'return (\n');
      code = code.replace(/return\s*;+\s*\(/g, 'return (');
      code = code.replace(/return\s*;+(\s*<)/g, 'return ($1');
      // Remove stray semicolons between opening paren and JSX
      code = code.replace(/\(\s*;+\s*(\n\s*<)/g, '($1');
      code = code.replace(/\(\s*;+\s*</g, '(\n<');
      // Handle stray semicolons before JSX tags
      code = code.replace(/;\s*(\n\s*<[A-Z])/g, '$1');
      // Clean up double/triple semicolons
      code = code.replace(/;{2,}/g, ';');
      // Fix "{ ;" patterns inside JSX
      code = code.replace(/\{\s*;+\s*}/g, '{}');
      // Remove empty statements that could cause issues
      code = code.replace(/^\s*;\s*$/gm, '');
      
      // Remove all imports
      code = code.replace(/^import\s+.*$/gm, '');
      
      // Remove TypeScript type annotations
      code = code.replace(/:\s*React\.\w+(<[^>]+>)?/g, '');
      code = code.replace(/:\s*(string|number|boolean|any|void|null|undefined|FC|FunctionComponent|ReactNode|HTMLAttributes|ComponentProps)(\[\])?(\s*\|[^=]+)?/g, '');
      code = code.replace(/:\s*\{[^}]+\}(\s*\|[^=]+)?/g, '');
      code = code.replace(/interface\s+\w+(\s+extends\s+\w+)?\s*\{[^}]*\}/gs, '');
      code = code.replace(/type\s+\w+\s*=\s*[^;]+;/g, '');
      code = code.replace(/as\s+\w+(\[\])?/g, '');
      // Remove generic type parameters - only single letter generics to avoid matching JSX tags
      code = code.replace(/<[A-Z]>/g, ''); // Single letter generics like <T>, <K>
      code = code.replace(/<[A-Z],\s*[A-Z]>/g, ''); // Double generics like <K, V>
      // Remove custom type annotations on function parameters (e.g. props: MyProps)
      code = code.replace(/(\w+)\s*:\s*[A-Z]\w*Props/g, '$1');
      code = code.replace(/(\w+)\s*:\s*[A-Z]\w*Type/g, '$1');
      // Remove any remaining type annotations after variable/parameter names
      code = code.replace(/(\([\w\s,]*\w)\s*:\s*[A-Z]\w*\s*(\))/g, '$1$2');
      code = code.replace(/(\w+)\s*:\s*[A-Z]\w+(?=[,\)])/g, '$1');
      
      // Convert exports
      code = code.replace(/export\s+default\s+function\s+(\w+)/g, 'function $1');
      code = code.replace(/export\s+function\s+(\w+)/g, 'function $1');
      code = code.replace(/export\s+const\s+(\w+)/g, 'const $1');
      code = code.replace(/export\s+default\s+(\w+)\s*;?/g, '');
      
      componentMap[fileName] = code;
    }

    // Find the App component
    const appCode = componentMap['App'] || '';
    
    // Components provided by our mock library - don't include user versions
    const builtInMocks = new Set([
      'Switch', 'Router', 'Route', 'Link', 'Button', 'Card', 'CardHeader', 'CardTitle', 
      'CardDescription', 'CardContent', 'CardFooter', 'Input', 'Label', 'Badge', 
      'Separator', 'Avatar', 'AvatarImage', 'AvatarFallback', 'ScrollArea', 'Tabs', 
      'TabsList', 'TabsTrigger', 'TabsContent', 'Select', 'SelectTrigger', 'SelectValue', 
      'SelectContent', 'SelectItem', 'Checkbox', 'Textarea', 'Progress', 'Slider', 
      'Dialog', 'DialogTrigger', 'DialogContent', 'DialogHeader', 'DialogTitle', 
      'DialogDescription', 'DialogFooter', 'Table', 'TableHeader', 'TableBody', 
      'TableRow', 'TableHead', 'TableCell', 'DropdownMenu', 'DropdownMenuTrigger', 
      'DropdownMenuContent', 'DropdownMenuItem', 'DropdownMenuSeparator', 'Tooltip', 
      'TooltipTrigger', 'TooltipContent', 'TooltipProvider', 'Form', 'FormField', 
      'FormItem', 'FormLabel', 'FormControl', 'FormDescription', 'FormMessage',
      'Layout', 'Navbar', 'Sidebar', 'Header', 'Footer', 'QueryClient', 'QueryClientProvider'
    ]);
    
    // Find page components
    const pageComponents = Object.entries(componentMap)
      .filter(([name]) => name.includes('Page') || name === 'Home' || name === 'Dashboard' || name === 'Login' || name === 'Register' || name === 'Settings' || name === 'NotFound')
      .map(([_, code]) => code)
      .join('\n\n');
    
    // Page names to exclude from otherComponents (these are in pageComponents)
    const pageNames = new Set(['Home', 'Dashboard', 'Login', 'Register', 'Settings', 'NotFound']);
    
    // Find other components (excluding built-in mocks, test files, pages, and problematic files)
    const otherComponents = Object.entries(componentMap)
      .filter(([name]) => 
        !name.includes('Page') && 
        name !== 'App' && 
        name !== 'main' && 
        name !== 'index' &&
        !builtInMocks.has(name) &&
        !pageNames.has(name) && // Exclude page names that don't have 'Page' suffix
        !name.includes('.test') &&
        !name.includes('.spec') &&
        !name.includes('test') // exclude test files
      )
      .map(([_, code]) => code)
      .join('\n\n');

    const cssContent = cssFiles.map(f => f.content).join('\n');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${projectName}</title>
  <style>
    /* Inline Tailwind-like CSS utilities */
    *, ::before, ::after { box-sizing: border-box; border-width: 0; border-style: solid; }
    body { margin: 0; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.5; }
    .container { width: 100%; margin-left: auto; margin-right: auto; padding-left: 1rem; padding-right: 1rem; }
    .mx-auto { margin-left: auto; margin-right: auto; }
    .flex { display: flex; }
    .flex-col { flex-direction: column; }
    .flex-row { flex-direction: row; }
    .items-center { align-items: center; }
    .justify-center { justify-content: center; }
    .justify-between { justify-content: space-between; }
    .gap-1 { gap: 0.25rem; } .gap-2 { gap: 0.5rem; } .gap-4 { gap: 1rem; } .gap-6 { gap: 1.5rem; }
    .p-2 { padding: 0.5rem; } .p-4 { padding: 1rem; } .p-6 { padding: 1.5rem; } .p-8 { padding: 2rem; }
    .px-2 { padding-left: 0.5rem; padding-right: 0.5rem; } .px-4 { padding-left: 1rem; padding-right: 1rem; }
    .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; } .py-4 { padding-top: 1rem; padding-bottom: 1rem; }
    .m-2 { margin: 0.5rem; } .m-4 { margin: 1rem; } .mb-2 { margin-bottom: 0.5rem; } .mb-4 { margin-bottom: 1rem; } .mb-6 { margin-bottom: 1.5rem; }
    .mt-2 { margin-top: 0.5rem; } .mt-4 { margin-top: 1rem; }
    .w-full { width: 100%; } .h-full { height: 100%; }
    .min-h-screen { min-height: 100vh; }
    .text-sm { font-size: 0.875rem; } .text-base { font-size: 1rem; } .text-lg { font-size: 1.125rem; } .text-xl { font-size: 1.25rem; } .text-2xl { font-size: 1.5rem; } .text-3xl { font-size: 1.875rem; } .text-4xl { font-size: 2.25rem; }
    .font-medium { font-weight: 500; } .font-semibold { font-weight: 600; } .font-bold { font-weight: 700; }
    .text-center { text-align: center; }
    .text-white { color: white; } .text-gray-500 { color: #6b7280; } .text-gray-600 { color: #4b5563; } .text-gray-700 { color: #374151; } .text-gray-800 { color: #1f2937; } .text-gray-900 { color: #111827; }
    .text-indigo-600 { color: #4f46e5; } .text-blue-600 { color: #2563eb; }
    .bg-white { background-color: white; } .bg-gray-50 { background-color: #f9fafb; } .bg-gray-100 { background-color: #f3f4f6; } .bg-gray-200 { background-color: #e5e7eb; }
    .bg-indigo-500 { background-color: #6366f1; } .bg-indigo-600 { background-color: #4f46e5; } .bg-blue-500 { background-color: #3b82f6; } .bg-blue-600 { background-color: #2563eb; }
    .rounded { border-radius: 0.25rem; } .rounded-md { border-radius: 0.375rem; } .rounded-lg { border-radius: 0.5rem; } .rounded-xl { border-radius: 0.75rem; } .rounded-2xl { border-radius: 1rem; } .rounded-full { border-radius: 9999px; }
    .border { border-width: 1px; } .border-gray-200 { border-color: #e5e7eb; } .border-gray-300 { border-color: #d1d5db; }
    .shadow { box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1); } .shadow-md { box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); } .shadow-lg { box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1); } .shadow-xl { box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1); }
    .overflow-hidden { overflow: hidden; } .overflow-auto { overflow: auto; }
    .cursor-pointer { cursor: pointer; }
    .transition { transition-property: all; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }
    .hover\\:bg-gray-100:hover { background-color: #f3f4f6; }
    .hover\\:bg-indigo-700:hover { background-color: #4338ca; }
    .space-y-2 > * + * { margin-top: 0.5rem; } .space-y-4 > * + * { margin-top: 1rem; } .space-y-6 > * + * { margin-top: 1.5rem; }
    .space-x-2 > * + * { margin-left: 0.5rem; } .space-x-4 > * + * { margin-left: 1rem; }
    .grid { display: grid; } .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); } .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); } .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    .hidden { display: none; } .block { display: block; } .inline-block { display: inline-block; } .inline-flex { display: inline-flex; }
    .relative { position: relative; } .absolute { position: absolute; } .fixed { position: fixed; }
    .top-0 { top: 0; } .right-0 { right: 0; } .bottom-0 { bottom: 0; } .left-0 { left: 0; }
    .z-10 { z-index: 10; } .z-50 { z-index: 50; }
    .opacity-50 { opacity: 0.5; } .opacity-80 { opacity: 0.8; }
    .lucide { width: 1em; height: 1em; }
    ${cssContent}
  </style>
</head>
<body>
  <div id="root"><div style="padding:20px;text-align:center;color:#666;font-family:system-ui;">
    <div id="load-status">Loading preview...</div>
  </div></div>
  <script>
    // Fallback chain loader with multiple strategies
    var loadStatus = document.getElementById('load-status');
    var scriptsLoaded = { react: false, 'react-dom': false, babel: false };
    var loadAttempts = { react: 0, 'react-dom': 0, babel: 0 };
    var MAX_ATTEMPTS = 3;
    
    // Script sources in order of preference
    var SCRIPT_SOURCES = {
      react: [
        '/api/preview-scripts/react',
        'https://cdn.jsdelivr.net/npm/react@18/umd/react.production.min.js',
        'https://unpkg.com/react@18/umd/react.production.min.js'
      ],
      'react-dom': [
        '/api/preview-scripts/react-dom',
        'https://cdn.jsdelivr.net/npm/react-dom@18/umd/react-dom.production.min.js',
        'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js'
      ],
      babel: [
        '/api/preview-scripts/babel',
        'https://cdn.jsdelivr.net/npm/@babel/standalone@7/babel.min.js',
        'https://unpkg.com/@babel/standalone@7/babel.min.js'
      ]
    };
    
    function updateStatus(msg) {
      if (loadStatus) loadStatus.textContent = msg;
    }
    
    function loadScript(name, callback) {
      var sources = SCRIPT_SOURCES[name];
      var attempt = loadAttempts[name];
      
      if (attempt >= sources.length) {
        console.error('All sources exhausted for ' + name);
        showFallback('Failed to load ' + name + ' from all sources');
        return;
      }
      
      var src = sources[attempt];
      updateStatus('Loading ' + name + ' (' + (attempt + 1) + '/' + sources.length + ')...');
      
      var script = document.createElement('script');
      script.src = src;
      script.crossOrigin = 'anonymous';
      
      script.onload = function() {
        scriptsLoaded[name] = true;
        callback && callback();
      };
      
      script.onerror = function() {
        loadAttempts[name]++;
        console.warn('Failed to load ' + name + ' from ' + src + ', trying next source...');
        loadScript(name, callback);
      };
      
      document.head.appendChild(script);
    }
    
    function showFallback(error) {
      document.getElementById('root').innerHTML = 
        '<div style="padding:24px;font-family:system-ui;max-width:600px;margin:0 auto;">' +
        '<div style="background:#fef3c7;border:1px solid #f59e0b;border-radius:8px;padding:16px;margin-bottom:16px;">' +
        '<strong style="color:#92400e;">Preview Fallback Mode</strong>' +
        '<p style="color:#78350f;margin:8px 0 0 0;font-size:14px;">Could not load preview dependencies: ' + error + '</p>' +
        '</div>' +
        '<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;">' +
        '<h3 style="margin:0 0 12px 0;color:#334155;">Project: ${projectName}</h3>' +
        '<p style="color:#64748b;margin:0;font-size:14px;">Files generated and ready for download. Use "View Code" tab to see generated files.</p>' +
        '</div></div>';
    }
    
    // Start loading chain
    updateStatus('Loading React...');
    loadScript('react', function() {
      updateStatus('Loading ReactDOM...');
      loadScript('react-dom', function() {
        updateStatus('Loading Babel...');
        loadScript('babel', function() {
          updateStatus('All scripts loaded, transpiling...');
        });
      });
    });
  </script>
  <script>
    // Global error handler
    window.onerror = function(msg, url, line, col, error) {
      var errorMsg = error && error.stack ? error.stack : (msg || 'Unknown error');
      document.getElementById('root').innerHTML = '<div style="padding:20px;background:#fef2f2;color:#b91c1c;border-radius:8px;margin:20px;font-family:system-ui;"><strong>Preview Error:</strong><br/><pre style="white-space:pre-wrap;margin-top:8px;font-size:11px;max-height:300px;overflow:auto;">' + errorMsg + '</pre></div>';
      return true;
    };
    window.addEventListener('unhandledrejection', function(e) {
      document.getElementById('root').innerHTML = '<div style="padding:20px;background:#fef2f2;color:#b91c1c;border-radius:8px;margin:20px;font-family:system-ui;"><strong>Preview Error:</strong><br/><pre style="white-space:pre-wrap;margin-top:8px;font-size:11px;">' + (e.reason || 'Unhandled promise rejection') + '</pre></div>';
    });
  </script>
  <script type="text/babel" data-presets="react,typescript">
    // React hooks and utilities
    const { useState, useEffect, useCallback, useMemo, useRef, createContext, useContext, Fragment } = React;
    
    // Routing mocks
    const RouteContext = createContext({ path: '/', setPath: () => {} });
    function Router({ children }) {
      const [path, setPath] = useState('/');
      return React.createElement(RouteContext.Provider, { value: { path, setPath } }, children);
    }
    function Route({ path, component: Component }) {
      const { path: currentPath } = useContext(RouteContext);
      if (path === currentPath || (!path && currentPath)) {
        return Component ? React.createElement(Component) : null;
      }
      return null;
    }
    function RouteSwitch({ children }) {
      const { path: currentPath } = useContext(RouteContext);
      const routes = React.Children.toArray(children);
      for (const route of routes) {
        if (route.props?.path === currentPath) return route;
      }
      return routes.find(r => !r.props?.path) || routes[0] || null;
    }
    function Link({ to, href, children, className, onClick, ...props }) {
      const { setPath } = useContext(RouteContext);
      const handleClick = (e) => {
        e.preventDefault();
        setPath(to || href || '/');
        onClick?.(e);
      };
      return React.createElement('a', { href: to || href || '#', className, onClick: handleClick, ...props }, children);
    }
    function useLocation() {
      const { path, setPath } = useContext(RouteContext);
      return [path, setPath];
    }
    function useRoute(pattern) {
      const { path } = useContext(RouteContext);
      return [path === pattern, {}];
    }
    
    // Query mocks
    function useQuery(opts) {
      const [data, setData] = useState(opts?.initialData || null);
      return { data, isLoading: false, error: null, refetch: () => {}, isError: false, isSuccess: true };
    }
    function useMutation(opts) {
      const [isPending, setIsPending] = useState(false);
      return { 
        mutate: (data) => { opts?.onSuccess?.(); }, 
        mutateAsync: async (data) => { opts?.onSuccess?.(); return {}; },
        isPending: false, 
        isSuccess: false,
        isError: false
      };
    }
    function QueryClient() { return {}; }
    function QueryClientProvider({ children }) { return children; }
    
    // UI Component Library
    function Button({ children, variant = 'default', size = 'default', className = '', disabled, onClick, type = 'button', asChild, ...props }) {
      const baseClass = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
      const variants = {
        default: 'bg-indigo-600 text-white hover:bg-indigo-700',
        destructive: 'bg-red-600 text-white hover:bg-red-700',
        outline: 'border border-gray-300 bg-white hover:bg-gray-50',
        secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
        ghost: 'hover:bg-gray-100 hover:text-gray-900',
        link: 'text-indigo-600 underline-offset-4 hover:underline'
      };
      const sizes = {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-12 px-8',
        icon: 'h-10 w-10'
      };
      return React.createElement('button', { 
        type, disabled, onClick, 
        className: \`\${baseClass} \${variants[variant] || variants.default} \${sizes[size] || sizes.default} \${className}\`,
        ...props 
      }, children);
    }
    
    function Card({ children, className = '', ...props }) {
      return React.createElement('div', { className: \`bg-white rounded-lg border border-gray-200 shadow-sm \${className}\`, ...props }, children);
    }
    function CardHeader({ children, className = '', ...props }) {
      return React.createElement('div', { className: \`flex flex-col space-y-1.5 p-6 \${className}\`, ...props }, children);
    }
    function CardTitle({ children, className = '', ...props }) {
      return React.createElement('h3', { className: \`text-lg font-semibold leading-none tracking-tight \${className}\`, ...props }, children);
    }
    function CardDescription({ children, className = '', ...props }) {
      return React.createElement('p', { className: \`text-sm text-gray-500 \${className}\`, ...props }, children);
    }
    function CardContent({ children, className = '', ...props }) {
      return React.createElement('div', { className: \`p-6 pt-0 \${className}\`, ...props }, children);
    }
    function CardFooter({ children, className = '', ...props }) {
      return React.createElement('div', { className: \`flex items-center p-6 pt-0 \${className}\`, ...props }, children);
    }
    
    function Input({ className = '', type = 'text', ...props }) {
      return React.createElement('input', { 
        type, 
        className: \`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 \${className}\`,
        ...props 
      });
    }
    
    function Label({ children, className = '', htmlFor, ...props }) {
      return React.createElement('label', { htmlFor, className: \`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 \${className}\`, ...props }, children);
    }
    
    function Badge({ children, variant = 'default', className = '' }) {
      const variants = {
        default: 'bg-indigo-100 text-indigo-800',
        secondary: 'bg-gray-100 text-gray-800',
        destructive: 'bg-red-100 text-red-800',
        outline: 'border border-gray-200 text-gray-800'
      };
      return React.createElement('span', { 
        className: \`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold \${variants[variant] || variants.default} \${className}\` 
      }, children);
    }
    
    function Separator({ className = '', orientation = 'horizontal', ...props }) {
      const isVertical = orientation === 'vertical';
      return React.createElement('div', { 
        className: \`shrink-0 bg-gray-200 \${isVertical ? 'h-full w-[1px]' : 'h-[1px] w-full'} \${className}\`,
        ...props 
      });
    }
    
    function Avatar({ children, className = '', ...props }) {
      return React.createElement('div', { className: \`relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full \${className}\`, ...props }, children);
    }
    function AvatarImage({ src, alt, className = '', ...props }) {
      return React.createElement('img', { src, alt, className: \`aspect-square h-full w-full \${className}\`, ...props });
    }
    function AvatarFallback({ children, className = '', ...props }) {
      return React.createElement('div', { className: \`flex h-full w-full items-center justify-center rounded-full bg-gray-100 \${className}\`, ...props }, children);
    }
    
    function ScrollArea({ children, className = '', ...props }) {
      return React.createElement('div', { className: \`overflow-auto \${className}\`, ...props }, children);
    }
    
    function Tabs({ children, defaultValue, value, onValueChange, className = '' }) {
      const [activeTab, setActiveTab] = useState(value || defaultValue);
      return React.createElement('div', { className }, 
        React.Children.map(children, child => 
          React.cloneElement(child, { activeTab, setActiveTab: onValueChange || setActiveTab })
        )
      );
    }
    function TabsList({ children, className = '', activeTab, setActiveTab }) {
      return React.createElement('div', { className: \`inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 \${className}\` },
        React.Children.map(children, child => React.cloneElement(child, { activeTab, setActiveTab }))
      );
    }
    function TabsTrigger({ children, value, className = '', activeTab, setActiveTab }) {
      const isActive = activeTab === value;
      return React.createElement('button', { 
        onClick: () => setActiveTab(value),
        className: \`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all \${isActive ? 'bg-white shadow-sm' : 'text-gray-600 hover:text-gray-900'} \${className}\`
      }, children);
    }
    function TabsContent({ children, value, className = '', activeTab }) {
      if (activeTab !== value) return null;
      return React.createElement('div', { className: \`mt-2 \${className}\` }, children);
    }
    
    function Select({ children, value, onValueChange, defaultValue }) {
      const [open, setOpen] = useState(false);
      const [selected, setSelected] = useState(value || defaultValue || '');
      return React.createElement('div', { className: 'relative' }, 
        React.Children.map(children, child => React.cloneElement(child, { open, setOpen, selected, setSelected: (v) => { setSelected(v); onValueChange?.(v); } }))
      );
    }
    function SelectTrigger({ children, className = '', open, setOpen, selected }) {
      return React.createElement('button', { 
        onClick: () => setOpen(!open),
        className: \`flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm \${className}\`
      }, children);
    }
    function SelectValue({ placeholder, selected }) {
      return React.createElement('span', null, selected || placeholder);
    }
    function SelectContent({ children, open, setOpen, setSelected }) {
      if (!open) return null;
      return React.createElement('div', { className: 'absolute z-50 mt-1 w-full rounded-md border bg-white shadow-lg' },
        React.Children.map(children, child => React.cloneElement(child, { setOpen, setSelected }))
      );
    }
    function SelectItem({ children, value, setOpen, setSelected }) {
      return React.createElement('div', { 
        onClick: () => { setSelected(value); setOpen(false); },
        className: 'cursor-pointer px-3 py-2 text-sm hover:bg-gray-100'
      }, children);
    }
    
    function Checkbox({ checked, onCheckedChange, className = '', id }) {
      return React.createElement('input', {
        type: 'checkbox',
        id,
        checked,
        onChange: (e) => onCheckedChange?.(e.target.checked),
        className: \`h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 \${className}\`
      });
    }
    
    function Textarea({ className = '', ...props }) {
      return React.createElement('textarea', {
        className: \`flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 \${className}\`,
        ...props
      });
    }
    
    function Progress({ value = 0, className = '' }) {
      return React.createElement('div', { className: \`relative h-2 w-full overflow-hidden rounded-full bg-gray-200 \${className}\` },
        React.createElement('div', { className: 'h-full bg-indigo-600 transition-all', style: { width: \`\${value}%\` } })
      );
    }
    
    function Slider({ value = [0], onValueChange, min = 0, max = 100, step = 1, className = '' }) {
      return React.createElement('input', {
        type: 'range',
        min,
        max,
        step,
        value: value[0],
        onChange: (e) => onValueChange?.([parseInt(e.target.value)]),
        className: \`w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer \${className}\`
      });
    }
    
    function Switch({ checked, onCheckedChange, className = '' }) {
      return React.createElement('button', {
        role: 'switch',
        'aria-checked': checked,
        onClick: () => onCheckedChange?.(!checked),
        className: \`relative inline-flex h-6 w-11 items-center rounded-full transition-colors \${checked ? 'bg-indigo-600' : 'bg-gray-200'} \${className}\`
      }, React.createElement('span', { className: \`inline-block h-4 w-4 transform rounded-full bg-white transition-transform \${checked ? 'translate-x-6' : 'translate-x-1'}\` }));
    }
    
    function Dialog({ children, open, onOpenChange }) {
      if (!open) return null;
      return React.createElement('div', { className: 'fixed inset-0 z-50 flex items-center justify-center' },
        React.createElement('div', { className: 'fixed inset-0 bg-black/50', onClick: () => onOpenChange?.(false) }),
        React.createElement('div', { className: 'relative bg-white rounded-lg shadow-lg max-w-lg w-full mx-4 p-6' }, children)
      );
    }
    function DialogTrigger({ children, asChild, onClick }) {
      return React.cloneElement(children, { onClick });
    }
    function DialogContent({ children, className = '' }) {
      return React.createElement('div', { className }, children);
    }
    function DialogHeader({ children, className = '' }) {
      return React.createElement('div', { className: \`mb-4 \${className}\` }, children);
    }
    function DialogTitle({ children, className = '' }) {
      return React.createElement('h2', { className: \`text-lg font-semibold \${className}\` }, children);
    }
    function DialogDescription({ children, className = '' }) {
      return React.createElement('p', { className: \`text-sm text-gray-500 \${className}\` }, children);
    }
    function DialogFooter({ children, className = '' }) {
      return React.createElement('div', { className: \`mt-4 flex justify-end gap-2 \${className}\` }, children);
    }
    
    function Table({ children, className = '' }) {
      return React.createElement('table', { className: \`w-full caption-bottom text-sm \${className}\` }, children);
    }
    function TableHeader({ children }) { return React.createElement('thead', { className: 'border-b' }, children); }
    function TableBody({ children }) { return React.createElement('tbody', null, children); }
    function TableRow({ children }) { return React.createElement('tr', { className: 'border-b hover:bg-gray-50' }, children); }
    function TableHead({ children, className = '' }) { return React.createElement('th', { className: \`h-12 px-4 text-left font-medium text-gray-500 \${className}\` }, children); }
    function TableCell({ children, className = '' }) { return React.createElement('td', { className: \`p-4 \${className}\` }, children); }
    
    function DropdownMenu({ children }) { return React.createElement('div', { className: 'relative inline-block' }, children); }
    function DropdownMenuTrigger({ children, asChild }) { return children; }
    function DropdownMenuContent({ children }) { return React.createElement('div', { className: 'absolute right-0 mt-2 w-48 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-50' }, children); }
    function DropdownMenuItem({ children, onClick }) { return React.createElement('button', { onClick, className: 'block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100' }, children); }
    function DropdownMenuSeparator() { return React.createElement('hr', { className: 'my-1 border-gray-200' }); }
    
    function Tooltip({ children }) { return children; }
    function TooltipTrigger({ children, asChild }) { return children; }
    function TooltipContent({ children }) { return null; }
    function TooltipProvider({ children }) { return children; }
    
    function Form({ children, ...props }) { return React.createElement('form', props, children); }
    function FormField({ control, name, render }) { return render({ field: { value: '', onChange: () => {} } }); }
    function FormItem({ children, className = '' }) { return React.createElement('div', { className: \`space-y-2 \${className}\` }, children); }
    function FormLabel({ children, className = '' }) { return React.createElement(Label, { className }, children); }
    function FormControl({ children }) { return children; }
    function FormDescription({ children }) { return React.createElement('p', { className: 'text-sm text-gray-500' }, children); }
    function FormMessage({ children }) { return children ? React.createElement('p', { className: 'text-sm text-red-500' }, children) : null; }
    function useForm(opts) { return { register: () => ({}), handleSubmit: (fn) => (e) => { e?.preventDefault(); fn({}); }, formState: { errors: {} }, control: {} }; }
    
    // Layout components
    function Layout({ children }) {
      return React.createElement('div', { className: 'min-h-screen bg-gray-50' }, children);
    }
    function Navbar({ children }) {
      return React.createElement('nav', { className: 'bg-white border-b border-gray-200 px-4 py-3' }, children);
    }
    function Sidebar({ children, className = '' }) {
      return React.createElement('aside', { className: \`w-64 bg-white border-r border-gray-200 p-4 \${className}\` }, children);
    }
    function Header({ children }) {
      return React.createElement('header', { className: 'bg-white border-b border-gray-200 px-6 py-4' }, children);
    }
    function Footer({ children }) {
      return React.createElement('footer', { className: 'bg-white border-t border-gray-200 px-6 py-4' }, children);
    }
    
    // Icon placeholders
    const IconBase = ({ className = 'w-4 h-4', ...props }) => React.createElement('svg', { className, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', ...props });
    const Home = (props) => React.createElement(IconBase, props, React.createElement('path', { d: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' }), React.createElement('polyline', { points: '9 22 9 12 15 12 15 22' }));
    const Settings = (props) => React.createElement(IconBase, props, React.createElement('circle', { cx: 12, cy: 12, r: 3 }), React.createElement('path', { d: 'M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42' }));
    const User = (props) => React.createElement(IconBase, props, React.createElement('path', { d: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' }), React.createElement('circle', { cx: 12, cy: 7, r: 4 }));
    const Users = User;
    const Menu = (props) => React.createElement(IconBase, props, React.createElement('line', { x1: 3, y1: 12, x2: 21, y2: 12 }), React.createElement('line', { x1: 3, y1: 6, x2: 21, y2: 6 }), React.createElement('line', { x1: 3, y1: 18, x2: 21, y2: 18 }));
    const X = (props) => React.createElement(IconBase, props, React.createElement('line', { x1: 18, y1: 6, x2: 6, y2: 18 }), React.createElement('line', { x1: 6, y1: 6, x2: 18, y2: 18 }));
    const Plus = (props) => React.createElement(IconBase, props, React.createElement('line', { x1: 12, y1: 5, x2: 12, y2: 19 }), React.createElement('line', { x1: 5, y1: 12, x2: 19, y2: 12 }));
    const Minus = (props) => React.createElement(IconBase, props, React.createElement('line', { x1: 5, y1: 12, x2: 19, y2: 12 }));
    const Search = (props) => React.createElement(IconBase, props, React.createElement('circle', { cx: 11, cy: 11, r: 8 }), React.createElement('line', { x1: 21, y1: 21, x2: 16.65, y2: 16.65 }));
    const Bell = (props) => React.createElement(IconBase, props, React.createElement('path', { d: 'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9' }), React.createElement('path', { d: 'M13.73 21a2 2 0 0 1-3.46 0' }));
    const Mail = (props) => React.createElement(IconBase, props, React.createElement('path', { d: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z' }), React.createElement('polyline', { points: '22,6 12,13 2,6' }));
    const Calendar = (props) => React.createElement(IconBase, props, React.createElement('rect', { x: 3, y: 4, width: 18, height: 18, rx: 2, ry: 2 }), React.createElement('line', { x1: 16, y1: 2, x2: 16, y2: 6 }), React.createElement('line', { x1: 8, y1: 2, x2: 8, y2: 6 }), React.createElement('line', { x1: 3, y1: 10, x2: 21, y2: 10 }));
    const Check = (props) => React.createElement(IconBase, props, React.createElement('polyline', { points: '20 6 9 17 4 12' }));
    const ChevronRight = (props) => React.createElement(IconBase, props, React.createElement('polyline', { points: '9 18 15 12 9 6' }));
    const ChevronDown = (props) => React.createElement(IconBase, props, React.createElement('polyline', { points: '6 9 12 15 18 9' }));
    const ChevronLeft = (props) => React.createElement(IconBase, props, React.createElement('polyline', { points: '15 18 9 12 15 6' }));
    const ChevronUp = (props) => React.createElement(IconBase, props, React.createElement('polyline', { points: '18 15 12 9 6 15' }));
    const ArrowRight = (props) => React.createElement(IconBase, props, React.createElement('line', { x1: 5, y1: 12, x2: 19, y2: 12 }), React.createElement('polyline', { points: '12 5 19 12 12 19' }));
    const ArrowLeft = (props) => React.createElement(IconBase, props, React.createElement('line', { x1: 19, y1: 12, x2: 5, y2: 12 }), React.createElement('polyline', { points: '12 19 5 12 12 5' }));
    const Star = (props) => React.createElement(IconBase, props, React.createElement('polygon', { points: '12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2' }));
    const Heart = (props) => React.createElement(IconBase, props, React.createElement('path', { d: 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z' }));
    const Share = (props) => React.createElement(IconBase, props, React.createElement('circle', { cx: 18, cy: 5, r: 3 }), React.createElement('circle', { cx: 6, cy: 12, r: 3 }), React.createElement('circle', { cx: 18, cy: 19, r: 3 }), React.createElement('line', { x1: 8.59, y1: 13.51, x2: 15.42, y2: 17.49 }), React.createElement('line', { x1: 15.41, y1: 6.51, x2: 8.59, y2: 10.49 }));
    const Edit = (props) => React.createElement(IconBase, props, React.createElement('path', { d: 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7' }), React.createElement('path', { d: 'M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z' }));
    const Pencil = Edit;
    const Trash = (props) => React.createElement(IconBase, props, React.createElement('polyline', { points: '3 6 5 6 21 6' }), React.createElement('path', { d: 'M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2' }));
    const Trash2 = Trash;
    const LogOut = (props) => React.createElement(IconBase, props, React.createElement('path', { d: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4' }), React.createElement('polyline', { points: '16 17 21 12 16 7' }), React.createElement('line', { x1: 21, y1: 12, x2: 9, y2: 12 }));
    const LogIn = (props) => React.createElement(IconBase, props, React.createElement('path', { d: 'M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4' }), React.createElement('polyline', { points: '10 17 15 12 10 7' }), React.createElement('line', { x1: 15, y1: 12, x2: 3, y2: 12 }));
    const Eye = (props) => React.createElement(IconBase, props, React.createElement('path', { d: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z' }), React.createElement('circle', { cx: 12, cy: 12, r: 3 }));
    const EyeOff = (props) => React.createElement(IconBase, props, React.createElement('path', { d: 'M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24' }), React.createElement('line', { x1: 1, y1: 1, x2: 23, y2: 23 }));
    const Lock = (props) => React.createElement(IconBase, props, React.createElement('rect', { x: 3, y: 11, width: 18, height: 11, rx: 2, ry: 2 }), React.createElement('path', { d: 'M7 11V7a5 5 0 0 1 10 0v4' }));
    const Unlock = (props) => React.createElement(IconBase, props, React.createElement('rect', { x: 3, y: 11, width: 18, height: 11, rx: 2, ry: 2 }), React.createElement('path', { d: 'M7 11V7a5 5 0 0 1 9.9-1' }));
    const Copy = (props) => React.createElement(IconBase, props, React.createElement('rect', { x: 9, y: 9, width: 13, height: 13, rx: 2, ry: 2 }), React.createElement('path', { d: 'M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1' }));
    const Download = (props) => React.createElement(IconBase, props, React.createElement('path', { d: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' }), React.createElement('polyline', { points: '7 10 12 15 17 10' }), React.createElement('line', { x1: 12, y1: 15, x2: 12, y2: 3 }));
    const Upload = (props) => React.createElement(IconBase, props, React.createElement('path', { d: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' }), React.createElement('polyline', { points: '17 8 12 3 7 8' }), React.createElement('line', { x1: 12, y1: 3, x2: 12, y2: 15 }));
    const File = (props) => React.createElement(IconBase, props, React.createElement('path', { d: 'M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z' }), React.createElement('polyline', { points: '13 2 13 9 20 9' }));
    const Folder = (props) => React.createElement(IconBase, props, React.createElement('path', { d: 'M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z' }));
    const Image = (props) => React.createElement(IconBase, props, React.createElement('rect', { x: 3, y: 3, width: 18, height: 18, rx: 2, ry: 2 }), React.createElement('circle', { cx: 8.5, cy: 8.5, r: 1.5 }), React.createElement('polyline', { points: '21 15 16 10 5 21' }));
    const Camera = (props) => React.createElement(IconBase, props, React.createElement('path', { d: 'M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z' }), React.createElement('circle', { cx: 12, cy: 13, r: 4 }));
    const Phone = (props) => React.createElement(IconBase, props, React.createElement('path', { d: 'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z' }));
    const MessageSquare = (props) => React.createElement(IconBase, props, React.createElement('path', { d: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' }));
    const MessageCircle = MessageSquare;
    const Send = (props) => React.createElement(IconBase, props, React.createElement('line', { x1: 22, y1: 2, x2: 11, y2: 13 }), React.createElement('polygon', { points: '22 2 15 22 11 13 2 9 22 2' }));
    const MoreHorizontal = (props) => React.createElement(IconBase, props, React.createElement('circle', { cx: 12, cy: 12, r: 1 }), React.createElement('circle', { cx: 19, cy: 12, r: 1 }), React.createElement('circle', { cx: 5, cy: 12, r: 1 }));
    const MoreVertical = (props) => React.createElement(IconBase, props, React.createElement('circle', { cx: 12, cy: 12, r: 1 }), React.createElement('circle', { cx: 12, cy: 5, r: 1 }), React.createElement('circle', { cx: 12, cy: 19, r: 1 }));
    const Filter = (props) => React.createElement(IconBase, props, React.createElement('polygon', { points: '22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3' }));
    const RefreshCw = (props) => React.createElement(IconBase, props, React.createElement('polyline', { points: '23 4 23 10 17 10' }), React.createElement('polyline', { points: '1 20 1 14 7 14' }), React.createElement('path', { d: 'M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15' }));
    const RotateCw = RefreshCw;
    const AlertCircle = (props) => React.createElement(IconBase, props, React.createElement('circle', { cx: 12, cy: 12, r: 10 }), React.createElement('line', { x1: 12, y1: 8, x2: 12, y2: 12 }), React.createElement('line', { x1: 12, y1: 16, x2: 12.01, y2: 16 }));
    const AlertTriangle = (props) => React.createElement(IconBase, props, React.createElement('path', { d: 'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z' }), React.createElement('line', { x1: 12, y1: 9, x2: 12, y2: 13 }), React.createElement('line', { x1: 12, y1: 17, x2: 12.01, y2: 17 }));
    const Info = (props) => React.createElement(IconBase, props, React.createElement('circle', { cx: 12, cy: 12, r: 10 }), React.createElement('line', { x1: 12, y1: 16, x2: 12, y2: 12 }), React.createElement('line', { x1: 12, y1: 8, x2: 12.01, y2: 8 }));
    const CheckCircle = (props) => React.createElement(IconBase, props, React.createElement('path', { d: 'M22 11.08V12a10 10 0 1 1-5.93-9.14' }), React.createElement('polyline', { points: '22 4 12 14.01 9 11.01' }));
    const XCircle = (props) => React.createElement(IconBase, props, React.createElement('circle', { cx: 12, cy: 12, r: 10 }), React.createElement('line', { x1: 15, y1: 9, x2: 9, y2: 15 }), React.createElement('line', { x1: 9, y1: 9, x2: 15, y2: 15 }));
    const Clock = (props) => React.createElement(IconBase, props, React.createElement('circle', { cx: 12, cy: 12, r: 10 }), React.createElement('polyline', { points: '12 6 12 12 16 14' }));
    const MapPin = (props) => React.createElement(IconBase, props, React.createElement('path', { d: 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z' }), React.createElement('circle', { cx: 12, cy: 10, r: 3 }));
    const Globe = (props) => React.createElement(IconBase, props, React.createElement('circle', { cx: 12, cy: 12, r: 10 }), React.createElement('line', { x1: 2, y1: 12, x2: 22, y2: 12 }), React.createElement('path', { d: 'M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z' }));
    const ShoppingCart = (props) => React.createElement(IconBase, props, React.createElement('circle', { cx: 9, cy: 21, r: 1 }), React.createElement('circle', { cx: 20, cy: 21, r: 1 }), React.createElement('path', { d: 'M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6' }));
    const CreditCard = (props) => React.createElement(IconBase, props, React.createElement('rect', { x: 1, y: 4, width: 22, height: 16, rx: 2, ry: 2 }), React.createElement('line', { x1: 1, y1: 10, x2: 23, y2: 10 }));
    const DollarSign = (props) => React.createElement(IconBase, props, React.createElement('line', { x1: 12, y1: 1, x2: 12, y2: 23 }), React.createElement('path', { d: 'M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' }));
    const Activity = (props) => React.createElement(IconBase, props, React.createElement('polyline', { points: '22 12 18 12 15 21 9 3 6 12 2 12' }));
    const BarChart = (props) => React.createElement(IconBase, props, React.createElement('line', { x1: 12, y1: 20, x2: 12, y2: 10 }), React.createElement('line', { x1: 18, y1: 20, x2: 18, y2: 4 }), React.createElement('line', { x1: 6, y1: 20, x2: 6, y2: 16 }));
    const PieChart = (props) => React.createElement(IconBase, props, React.createElement('path', { d: 'M21.21 15.89A10 10 0 1 1 8 2.83' }), React.createElement('path', { d: 'M22 12A10 10 0 0 0 12 2v10z' }));
    const TrendingUp = (props) => React.createElement(IconBase, props, React.createElement('polyline', { points: '23 6 13.5 15.5 8.5 10.5 1 18' }), React.createElement('polyline', { points: '17 6 23 6 23 12' }));
    const TrendingDown = (props) => React.createElement(IconBase, props, React.createElement('polyline', { points: '23 18 13.5 8.5 8.5 13.5 1 6' }), React.createElement('polyline', { points: '17 18 23 18 23 12' }));
    const Zap = (props) => React.createElement(IconBase, props, React.createElement('polygon', { points: '13 2 3 14 12 14 11 22 21 10 12 10 13 2' }));
    const Sun = (props) => React.createElement(IconBase, props, React.createElement('circle', { cx: 12, cy: 12, r: 5 }), React.createElement('line', { x1: 12, y1: 1, x2: 12, y2: 3 }), React.createElement('line', { x1: 12, y1: 21, x2: 12, y2: 23 }), React.createElement('line', { x1: 4.22, y1: 4.22, x2: 5.64, y2: 5.64 }), React.createElement('line', { x1: 18.36, y1: 18.36, x2: 19.78, y2: 19.78 }), React.createElement('line', { x1: 1, y1: 12, x2: 3, y2: 12 }), React.createElement('line', { x1: 21, y1: 12, x2: 23, y2: 12 }), React.createElement('line', { x1: 4.22, y1: 19.78, x2: 5.64, y2: 18.36 }), React.createElement('line', { x1: 18.36, y1: 5.64, x2: 19.78, y2: 4.22 }));
    const Moon = (props) => React.createElement(IconBase, props, React.createElement('path', { d: 'M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z' }));
    const Cloud = (props) => React.createElement(IconBase, props, React.createElement('path', { d: 'M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z' }));
    const Loader = (props) => React.createElement(IconBase, { ...props, className: \`\${props.className || 'w-4 h-4'} animate-spin\` }, React.createElement('line', { x1: 12, y1: 2, x2: 12, y2: 6 }), React.createElement('line', { x1: 12, y1: 18, x2: 12, y2: 22 }), React.createElement('line', { x1: 4.93, y1: 4.93, x2: 7.76, y2: 7.76 }), React.createElement('line', { x1: 16.24, y1: 16.24, x2: 19.07, y2: 19.07 }), React.createElement('line', { x1: 2, y1: 12, x2: 6, y2: 12 }), React.createElement('line', { x1: 18, y1: 12, x2: 22, y2: 12 }), React.createElement('line', { x1: 4.93, y1: 19.07, x2: 7.76, y2: 16.24 }), React.createElement('line', { x1: 16.24, y1: 7.76, x2: 19.07, y2: 4.93 }));
    const Loader2 = Loader;
    const Sparkles = (props) => React.createElement(IconBase, props, React.createElement('path', { d: 'M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z' }));
    const Package = (props) => React.createElement(IconBase, props, React.createElement('line', { x1: 16.5, y1: 9.4, x2: 7.5, y2: 4.21 }), React.createElement('path', { d: 'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z' }), React.createElement('polyline', { points: '3.27 6.96 12 12.01 20.73 6.96' }), React.createElement('line', { x1: 12, y1: 22.08, x2: 12, y2: 12 }));
    const Box = Package;
    const Layers = (props) => React.createElement(IconBase, props, React.createElement('polygon', { points: '12 2 2 7 12 12 22 7 12 2' }), React.createElement('polyline', { points: '2 17 12 22 22 17' }), React.createElement('polyline', { points: '2 12 12 17 22 12' }));
    const Grid = (props) => React.createElement(IconBase, props, React.createElement('rect', { x: 3, y: 3, width: 7, height: 7 }), React.createElement('rect', { x: 14, y: 3, width: 7, height: 7 }), React.createElement('rect', { x: 14, y: 14, width: 7, height: 7 }), React.createElement('rect', { x: 3, y: 14, width: 7, height: 7 }));
    const List = (props) => React.createElement(IconBase, props, React.createElement('line', { x1: 8, y1: 6, x2: 21, y2: 6 }), React.createElement('line', { x1: 8, y1: 12, x2: 21, y2: 12 }), React.createElement('line', { x1: 8, y1: 18, x2: 21, y2: 18 }), React.createElement('line', { x1: 3, y1: 6, x2: 3.01, y2: 6 }), React.createElement('line', { x1: 3, y1: 12, x2: 3.01, y2: 12 }), React.createElement('line', { x1: 3, y1: 18, x2: 3.01, y2: 18 }));
    const Tag = (props) => React.createElement(IconBase, props, React.createElement('path', { d: 'M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z' }), React.createElement('line', { x1: 7, y1: 7, x2: 7.01, y2: 7 }));
    const Bookmark = (props) => React.createElement(IconBase, props, React.createElement('path', { d: 'M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z' }));
    const Award = (props) => React.createElement(IconBase, props, React.createElement('circle', { cx: 12, cy: 8, r: 7 }), React.createElement('polyline', { points: '8.21 13.89 7 23 12 20 17 23 15.79 13.88' }));
    const Gift = (props) => React.createElement(IconBase, props, React.createElement('polyline', { points: '20 12 20 22 4 22 4 12' }), React.createElement('rect', { x: 2, y: 7, width: 20, height: 5 }), React.createElement('line', { x1: 12, y1: 22, x2: 12, y2: 7 }), React.createElement('path', { d: 'M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z' }), React.createElement('path', { d: 'M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z' }));
    const Briefcase = (props) => React.createElement(IconBase, props, React.createElement('rect', { x: 2, y: 7, width: 20, height: 14, rx: 2, ry: 2 }), React.createElement('path', { d: 'M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16' }));
    const Building = (props) => React.createElement(IconBase, props, React.createElement('rect', { x: 4, y: 2, width: 16, height: 20, rx: 2, ry: 2 }), React.createElement('path', { d: 'M9 22v-4h6v4' }), React.createElement('line', { x1: 8, y1: 6, x2: 8.01, y2: 6 }), React.createElement('line', { x1: 16, y1: 6, x2: 16.01, y2: 6 }), React.createElement('line', { x1: 12, y1: 6, x2: 12.01, y2: 6 }), React.createElement('line', { x1: 8, y1: 10, x2: 8.01, y2: 10 }), React.createElement('line', { x1: 16, y1: 10, x2: 16.01, y2: 10 }), React.createElement('line', { x1: 12, y1: 10, x2: 12.01, y2: 10 }), React.createElement('line', { x1: 8, y1: 14, x2: 8.01, y2: 14 }), React.createElement('line', { x1: 16, y1: 14, x2: 16.01, y2: 14 }), React.createElement('line', { x1: 12, y1: 14, x2: 12.01, y2: 14 }));
    const Clipboard = (props) => React.createElement(IconBase, props, React.createElement('path', { d: 'M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2' }), React.createElement('rect', { x: 8, y: 2, width: 8, height: 4, rx: 1, ry: 1 }));
    const Terminal = (props) => React.createElement(IconBase, props, React.createElement('polyline', { points: '4 17 10 11 4 5' }), React.createElement('line', { x1: 12, y1: 19, x2: 20, y2: 19 }));
    const Code = (props) => React.createElement(IconBase, props, React.createElement('polyline', { points: '16 18 22 12 16 6' }), React.createElement('polyline', { points: '8 6 2 12 8 18' }));
    const Database = (props) => React.createElement(IconBase, props, React.createElement('ellipse', { cx: 12, cy: 5, rx: 9, ry: 3 }), React.createElement('path', { d: 'M21 12c0 1.66-4 3-9 3s-9-1.34-9-3' }), React.createElement('path', { d: 'M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5' }));
    const Server = (props) => React.createElement(IconBase, props, React.createElement('rect', { x: 2, y: 2, width: 20, height: 8, rx: 2, ry: 2 }), React.createElement('rect', { x: 2, y: 14, width: 20, height: 8, rx: 2, ry: 2 }), React.createElement('line', { x1: 6, y1: 6, x2: 6.01, y2: 6 }), React.createElement('line', { x1: 6, y1: 18, x2: 6.01, y2: 18 }));
    const Wifi = (props) => React.createElement(IconBase, props, React.createElement('path', { d: 'M5 12.55a11 11 0 0 1 14.08 0' }), React.createElement('path', { d: 'M1.42 9a16 16 0 0 1 21.16 0' }), React.createElement('path', { d: 'M8.53 16.11a6 6 0 0 1 6.95 0' }), React.createElement('line', { x1: 12, y1: 20, x2: 12.01, y2: 20 }));
    const Bluetooth = (props) => React.createElement(IconBase, props, React.createElement('polyline', { points: '6.5 6.5 17.5 17.5 12 23 12 1 17.5 6.5 6.5 17.5' }));
    const Power = (props) => React.createElement(IconBase, props, React.createElement('path', { d: 'M18.36 6.64a9 9 0 1 1-12.73 0' }), React.createElement('line', { x1: 12, y1: 2, x2: 12, y2: 12 }));
    const ExternalLink = (props) => React.createElement(IconBase, props, React.createElement('path', { d: 'M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6' }), React.createElement('polyline', { points: '15 3 21 3 21 9' }), React.createElement('line', { x1: 10, y1: 14, x2: 21, y2: 3 }));
    const LinkIcon = (props) => React.createElement(IconBase, props, React.createElement('path', { d: 'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71' }), React.createElement('path', { d: 'M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71' }));
    const Paperclip = (props) => React.createElement(IconBase, props, React.createElement('path', { d: 'M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48' }));
    const Play = (props) => React.createElement(IconBase, props, React.createElement('polygon', { points: '5 3 19 12 5 21 5 3' }));
    const Pause = (props) => React.createElement(IconBase, props, React.createElement('rect', { x: 6, y: 4, width: 4, height: 16 }), React.createElement('rect', { x: 14, y: 4, width: 4, height: 16 }));
    const StopCircle = (props) => React.createElement(IconBase, props, React.createElement('circle', { cx: 12, cy: 12, r: 10 }), React.createElement('rect', { x: 9, y: 9, width: 6, height: 6 }));
    const SkipBack = (props) => React.createElement(IconBase, props, React.createElement('polygon', { points: '19 20 9 12 19 4 19 20' }), React.createElement('line', { x1: 5, y1: 19, x2: 5, y2: 5 }));
    const SkipForward = (props) => React.createElement(IconBase, props, React.createElement('polygon', { points: '5 4 15 12 5 20 5 4' }), React.createElement('line', { x1: 19, y1: 5, x2: 19, y2: 19 }));
    const Volume2 = (props) => React.createElement(IconBase, props, React.createElement('polygon', { points: '11 5 6 9 2 9 2 15 6 15 11 19 11 5' }), React.createElement('path', { d: 'M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07' }));
    const VolumeX = (props) => React.createElement(IconBase, props, React.createElement('polygon', { points: '11 5 6 9 2 9 2 15 6 15 11 19 11 5' }), React.createElement('line', { x1: 23, y1: 9, x2: 17, y2: 15 }), React.createElement('line', { x1: 17, y1: 9, x2: 23, y2: 15 }));
    const Maximize = (props) => React.createElement(IconBase, props, React.createElement('path', { d: 'M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3' }));
    const Minimize = (props) => React.createElement(IconBase, props, React.createElement('path', { d: 'M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3' }));
    const ZoomIn = (props) => React.createElement(IconBase, props, React.createElement('circle', { cx: 11, cy: 11, r: 8 }), React.createElement('line', { x1: 21, y1: 21, x2: 16.65, y2: 16.65 }), React.createElement('line', { x1: 11, y1: 8, x2: 11, y2: 14 }), React.createElement('line', { x1: 8, y1: 11, x2: 14, y2: 11 }));
    const ZoomOut = (props) => React.createElement(IconBase, props, React.createElement('circle', { cx: 11, cy: 11, r: 8 }), React.createElement('line', { x1: 21, y1: 21, x2: 16.65, y2: 16.65 }), React.createElement('line', { x1: 8, y1: 11, x2: 14, y2: 11 }));
    const Printer = (props) => React.createElement(IconBase, props, React.createElement('polyline', { points: '6 9 6 2 18 2 18 9' }), React.createElement('path', { d: 'M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2' }), React.createElement('rect', { x: 6, y: 14, width: 12, height: 8 }));
    const Save = (props) => React.createElement(IconBase, props, React.createElement('path', { d: 'M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z' }), React.createElement('polyline', { points: '17 21 17 13 7 13 7 21' }), React.createElement('polyline', { points: '7 3 7 8 15 8' }));
    const Undo = (props) => React.createElement(IconBase, props, React.createElement('path', { d: 'M3 7v6h6' }), React.createElement('path', { d: 'M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13' }));
    const Redo = (props) => React.createElement(IconBase, props, React.createElement('path', { d: 'M21 7v6h-6' }), React.createElement('path', { d: 'M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7' }));
    const Bold = (props) => React.createElement(IconBase, props, React.createElement('path', { d: 'M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z' }), React.createElement('path', { d: 'M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z' }));
    const Italic = (props) => React.createElement(IconBase, props, React.createElement('line', { x1: 19, y1: 4, x2: 10, y2: 4 }), React.createElement('line', { x1: 14, y1: 20, x2: 5, y2: 20 }), React.createElement('line', { x1: 15, y1: 4, x2: 9, y2: 20 }));
    const Underline = (props) => React.createElement(IconBase, props, React.createElement('path', { d: 'M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3' }), React.createElement('line', { x1: 4, y1: 21, x2: 20, y2: 21 }));
    const AlignLeft = (props) => React.createElement(IconBase, props, React.createElement('line', { x1: 17, y1: 10, x2: 3, y2: 10 }), React.createElement('line', { x1: 21, y1: 6, x2: 3, y2: 6 }), React.createElement('line', { x1: 21, y1: 14, x2: 3, y2: 14 }), React.createElement('line', { x1: 17, y1: 18, x2: 3, y2: 18 }));
    const AlignCenter = (props) => React.createElement(IconBase, props, React.createElement('line', { x1: 18, y1: 10, x2: 6, y2: 10 }), React.createElement('line', { x1: 21, y1: 6, x2: 3, y2: 6 }), React.createElement('line', { x1: 21, y1: 14, x2: 3, y2: 14 }), React.createElement('line', { x1: 18, y1: 18, x2: 6, y2: 18 }));
    const AlignRight = (props) => React.createElement(IconBase, props, React.createElement('line', { x1: 21, y1: 10, x2: 7, y2: 10 }), React.createElement('line', { x1: 21, y1: 6, x2: 3, y2: 6 }), React.createElement('line', { x1: 21, y1: 14, x2: 3, y2: 14 }), React.createElement('line', { x1: 21, y1: 18, x2: 7, y2: 18 }));
    const HelpCircle = (props) => React.createElement(IconBase, props, React.createElement('circle', { cx: 12, cy: 12, r: 10 }), React.createElement('path', { d: 'M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3' }), React.createElement('line', { x1: 12, y1: 17, x2: 12.01, y2: 17 }));
    
    // cn utility
    function cn(...classes) {
      return classes.filter(Boolean).join(' ');
    }
    
    // Other components (disabled for now - rely on mocks to reduce Babel errors)
    // ${otherComponents}
    
    // Page components
    ${pageComponents}
    
    // App component
    ${appCode}
    
    // Render App with timeout fallback
    var renderAttempted = false;
    try {
      renderAttempted = true;
      const root = ReactDOM.createRoot(document.getElementById('root'));
      if (typeof App !== 'undefined') {
        root.render(React.createElement(Router, null, React.createElement(App)));
      } else if (typeof HomePage !== 'undefined') {
        root.render(React.createElement(HomePage));
      } else if (typeof Home !== 'undefined') {
        root.render(React.createElement(Home));
      } else if (typeof DashboardPage !== 'undefined') {
        root.render(React.createElement(DashboardPage));
      } else {
        root.render(React.createElement('div', { className: 'p-8 text-center' }, 
          React.createElement('h1', { className: 'text-2xl font-bold text-gray-800 mb-4' }, '${projectName}'),
          React.createElement('p', { className: 'text-gray-600' }, 'React application loaded successfully.')
        ));
      }
    } catch (e) {
      console.error('Preview render error:', e);
      document.getElementById('root').innerHTML = '<div style="padding:20px;background:#fef2f2;color:#b91c1c;border-radius:8px;margin:20px;font-family:system-ui;"><strong>Preview Error:</strong><br/><pre style="white-space:pre-wrap;margin-top:8px;font-size:12px;max-height:300px;overflow:auto;">' + (e.message || e) + '</pre></div>';
    }
    
    // Fallback: If root is still showing "Loading preview..." after 2s, show diagnostic
    setTimeout(function() {
      var rootEl = document.getElementById('root');
      if (rootEl && rootEl.innerHTML.indexOf('Loading preview') !== -1) {
        rootEl.innerHTML = '<div style="padding:20px;background:#fffbeb;color:#92400e;border-radius:8px;margin:20px;font-family:system-ui;"><strong>Preview Warning:</strong><p style="margin-top:8px;">Could not render the application. This may happen if:</p><ul style="margin-top:8px;padding-left:20px;"><li>The generated code has syntax errors</li><li>Required components are not defined</li><li>Transpilation failed silently</li></ul></div>';
      }
    }, 2000);
  </script>
</body>
</html>`;
  }, [files, projectName]);

  // Create blob URL from previewHtml to bypass COEP restrictions
  // Use a ref to track the previous URL and revoke it only after new one is set
  const prevBlobUrl = useRef<string | null>(null);
  
  useEffect(() => {
    if (!previewHtml) {
      if (prevBlobUrl.current) {
        URL.revokeObjectURL(prevBlobUrl.current);
        prevBlobUrl.current = null;
      }
      setBlobUrl(null);
      return;
    }
    
    const blob = new Blob([previewHtml], { type: 'text/html' });
    const newUrl = URL.createObjectURL(blob);
    
    // Revoke previous URL after setting new one
    const oldUrl = prevBlobUrl.current;
    prevBlobUrl.current = newUrl;
    setBlobUrl(newUrl);
    
    // Delay revocation to ensure iframe has loaded new URL
    if (oldUrl) {
      setTimeout(() => URL.revokeObjectURL(oldUrl), 1000);
    }
    
    return () => {
      // Only revoke on unmount if we still have the current URL
      if (prevBlobUrl.current) {
        URL.revokeObjectURL(prevBlobUrl.current);
        prevBlobUrl.current = null;
      }
    };
  }, [previewHtml, refreshKey]);

  const handleRefresh = () => {
    setRefreshKey(k => k + 1);
  };

  if (!previewHtml || !blobUrl) {
    return (
      <div className="rounded-xl overflow-hidden border border-border bg-slate-900 p-8 text-center" style={{ height }} data-testid="live-code-runner">
        <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-4" />
        <p className="text-slate-400">No runnable code detected</p>
        <p className="text-slate-500 text-sm mt-2">Add React/TypeScript or HTML files to see a live preview</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden border border-border flex flex-col" style={{ height }} data-testid="live-code-runner">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700 shrink-0">
        <div className="flex items-center gap-2">
          <Play className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-medium text-white">{projectName}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            size="icon" 
            variant="ghost" 
            className="h-7 w-7 text-slate-400 hover:text-white"
            onClick={handleRefresh}
            data-testid="button-refresh-preview"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
          <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse mr-1.5" />
            Running Live
          </Badge>
        </div>
      </div>
      
      <iframe
        key={refreshKey}
        ref={iframeRef}
        src={blobUrl}
        className="flex-1 w-full bg-white border-0"
        sandbox="allow-scripts allow-same-origin"
        title="Live Preview"
        data-testid={`live-preview-iframe-${projectName.replace(/\s+/g, '-').toLowerCase()}`}
      />
    </div>
  );
}

export function createSandpackFiles(generatedFiles: GeneratedFile[]): Record<string, string> {
  const files: Record<string, string> = {};
  
  for (const file of generatedFiles) {
    let path = file.path;
    if (!path.startsWith('/')) path = '/' + path;
    
    path = path.replace(/^\/client\/src\//, '/');
    path = path.replace(/^\/src\//, '/');
    
    files[path] = file.content;
  }
  
  return files;
}
