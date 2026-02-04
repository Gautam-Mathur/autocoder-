import { useMemo, useState, useEffect, useRef } from "react";
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
  const [hasError, setHasError] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const hasReactFiles = useMemo(() => {
    return files.some(f => 
      f.path.endsWith('.tsx') || 
      f.path.endsWith('.jsx') ||
      f.content.includes('import React') ||
      f.content.includes('from "react"') ||
      f.content.includes("from 'react'")
    );
  }, [files]);

  const hasHtmlFiles = useMemo(() => {
    return files.some(f => f.path.endsWith('.html'));
  }, [files]);

  const previewHtml = useMemo(() => {
    if (!hasReactFiles && hasHtmlFiles) {
      const htmlFile = files.find(f => f.path.endsWith('.html'));
      const cssFiles = files.filter(f => f.path.endsWith('.css'));
      const jsFiles = files.filter(f => f.path.endsWith('.js'));
      
      let html = htmlFile?.content || '';
      html = html.replace(
        '</head>',
        `<style>${cssFiles.map(f => f.content).join('\n')}</style></head>`
      ).replace(
        '</body>',
        `<script>${jsFiles.map(f => f.content).join('\n')}</script></body>`
      );
      
      return html;
    }

    if (hasReactFiles) {
      const tsxFiles = files.filter(f => 
        f.path.endsWith('.tsx') || 
        f.path.endsWith('.jsx')
      );
      const cssFiles = files.filter(f => f.path.endsWith('.css'));

      const appFile = tsxFiles.find(f => 
        f.path.toLowerCase().includes('app.tsx') || 
        f.path.toLowerCase().includes('app.jsx')
      ) || tsxFiles[0];

      if (!appFile) return '';

      let componentCode = appFile.content;
      
      componentCode = componentCode
        .replace(/^import\s+.*?['"][^'"]+['"];?\s*$/gm, '')
        .replace(/^import\s+\{[^}]*\}\s+from\s+['"][^'"]+['"];?\s*$/gm, '')
        .replace(/^import\s+type\s+.*?;?\s*$/gm, '')
        .replace(/:\s*React\.\w+(<[^>]+>)?/g, '')
        .replace(/:\s*(string|number|boolean|any|void|null|undefined|FC|FunctionComponent)(\[\])?/g, '')
        .replace(/:\s*\{[^}]+\}/g, '')
        .replace(/interface\s+\w+\s*\{[^}]*\}/g, '')
        .replace(/type\s+\w+\s*=\s*[^;]+;/g, '')
        .replace(/as\s+\w+(\[\])?/g, '')
        .replace(/<\w+>/g, '')
        .replace(/export\s+default\s+/g, 'const __App__ = ')
        .replace(/export\s+function\s+(\w+)/g, 'function $1')
        .replace(/export\s+const\s+/g, 'const ');
      
      const componentMatch = componentCode.match(/(?:function|const)\s+(__App__|App|Main|Home|Page)\b/);
      const componentName = componentMatch ? componentMatch[1] : '__App__';
      
      const cssContent = cssFiles.map(f => f.content).join('\n');

      return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${projectName}</title>
  <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    ${cssContent}
    body { margin: 0; font-family: system-ui, -apple-system, sans-serif; }
    * { box-sizing: border-box; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel" data-presets="react,typescript">
    const { useState, useEffect, useCallback, useMemo, useRef, createContext, useContext, Fragment } = React;
    
    // Mock common imports for standalone preview
    const Link = ({to, href, children, className, ...props}) => React.createElement('a', {href: to || href || '#', className, ...props}, children);
    const Route = ({path, component: C}) => React.createElement(C || 'div');
    const Switch = ({children}) => React.createElement('div', null, children);
    const useLocation = () => [window.location.pathname, (p) => {}];
    const useQuery = (opts) => ({ data: opts?.initialData || [], isLoading: false, error: null, refetch: () => {} });
    const useMutation = (opts) => ({ mutate: opts?.onMutate || (() => {}), mutateAsync: async () => {}, isPending: false, isSuccess: false });
    const QueryClient = function() { return {}; };
    const QueryClientProvider = ({children}) => children;
    
    // Mock UI components
    const Button = ({children, variant, size, className, disabled, onClick, type, ...props}) => 
      React.createElement('button', {
        className: \`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors px-4 py-2 \${variant === 'outline' ? 'border border-gray-300 bg-transparent hover:bg-gray-100' : variant === 'ghost' ? 'hover:bg-gray-100' : variant === 'destructive' ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-blue-500 text-white hover:bg-blue-600'} \${size === 'sm' ? 'h-8 px-3' : size === 'lg' ? 'h-11 px-8' : 'h-10'} \${disabled ? 'opacity-50 cursor-not-allowed' : ''} \${className || ''}\`,
        disabled,
        onClick,
        type: type || 'button',
        ...props
      }, children);
    
    const Card = ({children, className, ...props}) => 
      React.createElement('div', {className: \`bg-white dark:bg-gray-800 rounded-lg border shadow-sm \${className || ''}\`, ...props}, children);
    const CardHeader = ({children, className, ...props}) => 
      React.createElement('div', {className: \`flex flex-col space-y-1.5 p-6 \${className || ''}\`, ...props}, children);
    const CardTitle = ({children, className, ...props}) => 
      React.createElement('h3', {className: \`text-2xl font-semibold leading-none tracking-tight \${className || ''}\`, ...props}, children);
    const CardDescription = ({children, className, ...props}) => 
      React.createElement('p', {className: \`text-sm text-gray-500 \${className || ''}\`, ...props}, children);
    const CardContent = ({children, className, ...props}) => 
      React.createElement('div', {className: \`p-6 pt-0 \${className || ''}\`, ...props}, children);
    const CardFooter = ({children, className, ...props}) => 
      React.createElement('div', {className: \`flex items-center p-6 pt-0 \${className || ''}\`, ...props}, children);
    
    const Input = ({className, type, ...props}) => 
      React.createElement('input', {type: type || 'text', className: \`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 \${className || ''}\`, ...props});
    
    const Label = ({children, className, htmlFor, ...props}) => 
      React.createElement('label', {className: \`text-sm font-medium leading-none \${className || ''}\`, htmlFor, ...props}, children);
    
    const Badge = ({children, variant, className}) => 
      React.createElement('span', {className: \`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold \${variant === 'destructive' ? 'bg-red-100 text-red-800' : variant === 'outline' ? 'border' : variant === 'secondary' ? 'bg-gray-100 text-gray-800' : 'bg-blue-100 text-blue-800'} \${className || ''}\`}, children);
    
    const Separator = ({className, orientation, ...props}) => 
      React.createElement('div', {className: \`shrink-0 bg-gray-200 \${orientation === 'vertical' ? 'h-full w-[1px]' : 'h-[1px] w-full'} \${className || ''}\`, ...props});
    
    const Avatar = ({children, className, ...props}) => 
      React.createElement('div', {className: \`relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full \${className || ''}\`, ...props}, children);
    const AvatarImage = ({src, alt, className, ...props}) => 
      React.createElement('img', {src, alt, className: \`aspect-square h-full w-full \${className || ''}\`, ...props});
    const AvatarFallback = ({children, className, ...props}) => 
      React.createElement('div', {className: \`flex h-full w-full items-center justify-center rounded-full bg-gray-100 \${className || ''}\`, ...props}, children);
    
    const Layout = ({children}) => React.createElement('div', {className: 'min-h-screen bg-gray-50 dark:bg-gray-900'}, children);
    const Navbar = ({children}) => React.createElement('nav', {className: 'bg-white dark:bg-gray-800 border-b px-4 py-3'}, children);
    const Sidebar = ({children}) => React.createElement('aside', {className: 'w-64 bg-white dark:bg-gray-800 border-r p-4'}, children);
    
    // Mock page components
    const HomePage = () => React.createElement('div', {className: 'p-8'}, React.createElement('h1', {className: 'text-2xl font-bold'}, 'Home Page'));
    const DashboardPage = () => React.createElement('div', {className: 'p-8'}, React.createElement('h1', {className: 'text-2xl font-bold'}, 'Dashboard'));
    const LoginPage = () => React.createElement('div', {className: 'p-8'}, React.createElement('h1', {className: 'text-2xl font-bold'}, 'Login'));
    const RegisterPage = () => React.createElement('div', {className: 'p-8'}, React.createElement('h1', {className: 'text-2xl font-bold'}, 'Register'));
    const SettingsPage = () => React.createElement('div', {className: 'p-8'}, React.createElement('h1', {className: 'text-2xl font-bold'}, 'Settings'));
    const NotFoundPage = () => React.createElement('div', {className: 'p-8'}, React.createElement('h1', {className: 'text-2xl font-bold'}, '404 Not Found'));
    
    // Mock icons (simple SVG placeholders)
    const IconPlaceholder = ({className}) => React.createElement('svg', {className: className || 'w-4 h-4', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor'}, 
      React.createElement('circle', {cx: '12', cy: '12', r: '10', strokeWidth: '2'}));
    const Home = IconPlaceholder;
    const Settings = IconPlaceholder;
    const User = IconPlaceholder;
    const Menu = IconPlaceholder;
    const X = IconPlaceholder;
    const Plus = IconPlaceholder;
    const Search = IconPlaceholder;
    const Bell = IconPlaceholder;
    const Mail = IconPlaceholder;
    const Calendar = IconPlaceholder;
    const Check = IconPlaceholder;
    const ChevronRight = IconPlaceholder;
    const ChevronDown = IconPlaceholder;
    const ArrowRight = IconPlaceholder;
    const Star = IconPlaceholder;
    const Heart = IconPlaceholder;
    const Share = IconPlaceholder;
    const Edit = IconPlaceholder;
    const Trash = IconPlaceholder;
    const LogOut = IconPlaceholder;
    const Eye = IconPlaceholder;
    const EyeOff = IconPlaceholder;
    
    // User component code
    ${componentCode}
    
    // Render
    try {
      const root = ReactDOM.createRoot(document.getElementById('root'));
      root.render(React.createElement(${componentName === '__App__' ? '__App__' : componentName}));
    } catch (e) {
      console.error(e);
      document.getElementById('root').innerHTML = '<div style="padding:20px;background:#fef2f2;color:#b91c1c;border-radius:8px;margin:20px;"><strong>Preview Error:</strong><br/>' + e.message + '</div>';
    }
  </script>
</body>
</html>`;
    }

    return '';
  }, [files, hasReactFiles, hasHtmlFiles, projectName]);

  useEffect(() => {
    setHasError(false);
  }, [previewHtml, refreshKey]);

  const handleRefresh = () => {
    setRefreshKey(k => k + 1);
  };

  if (!previewHtml) {
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
        srcDoc={previewHtml}
        className="flex-1 w-full bg-white border-0"
        sandbox="allow-scripts allow-forms allow-modals allow-popups"
        title="Live Preview"
        data-testid="live-preview-iframe"
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
