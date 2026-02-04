import { useMemo } from "react";
import { 
  SandpackProvider, 
  SandpackLayout, 
  SandpackPreview,
  SandpackCodeEditor,
  SandpackFileExplorer
} from "@codesandbox/sandpack-react";
import { atomDark } from "@codesandbox/sandpack-themes";
import { Play, Code, Eye, Loader2 } from "lucide-react";
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
  showEditor = false,
  height = "500px"
}: LiveCodeRunnerProps) {
  const sandpackFiles = useMemo(() => {
    const result: Record<string, string> = {};
    
    for (const file of files) {
      let path = file.path;
      if (!path.startsWith('/')) {
        path = '/' + path;
      }
      
      if (path.includes('client/src/')) {
        path = path.replace('/client/src/', '/');
      } else if (path.includes('src/')) {
        path = path.replace('/src/', '/');
      }
      
      result[path] = file.content;
    }
    
    if (!result['/App.tsx'] && !result['/App.jsx'] && !result['/App.js']) {
      const appFile = Object.keys(result).find(k => 
        k.toLowerCase().includes('app.tsx') || 
        k.toLowerCase().includes('app.jsx')
      );
      if (appFile) {
        result['/App.tsx'] = result[appFile];
      }
    }
    
    if (!result['/index.tsx'] && !result['/index.jsx'] && !result['/index.js']) {
      result['/index.tsx'] = `
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`;
    }
    
    if (!result['/styles.css'] && !result['/index.css']) {
      result['/styles.css'] = `
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #f5f5f5;
  min-height: 100vh;
}

#root {
  min-height: 100vh;
}
`;
    }
    
    return result;
  }, [files]);

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

  if (!hasReactFiles && hasHtmlFiles) {
    const htmlFile = files.find(f => f.path.endsWith('.html'));
    const cssFiles = files.filter(f => f.path.endsWith('.css'));
    const jsFiles = files.filter(f => f.path.endsWith('.js'));
    
    const combinedHtml = htmlFile?.content.replace(
      '</head>',
      `<style>${cssFiles.map(f => f.content).join('\n')}</style></head>`
    ).replace(
      '</body>',
      `<script>${jsFiles.map(f => f.content).join('\n')}</script></body>`
    );
    
    const blob = new Blob([combinedHtml || ''], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    return (
      <div className="rounded-xl overflow-hidden border border-border bg-slate-900" style={{ height }}>
        <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <Play className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-medium text-white">Live Preview</span>
          </div>
          <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
            Running
          </Badge>
        </div>
        <iframe 
          src={url}
          className="w-full bg-white"
          style={{ height: `calc(${height} - 48px)` }}
          title="Live Preview"
          data-testid="live-preview-iframe"
        />
      </div>
    );
  }

  if (!hasReactFiles) {
    return (
      <div className="rounded-xl overflow-hidden border border-border bg-slate-900 p-8 text-center" style={{ height }}>
        <Loader2 className="w-8 h-8 text-slate-400 animate-spin mx-auto mb-4" />
        <p className="text-slate-400">No runnable code detected</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden border border-border" data-testid="live-code-runner">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <Play className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-medium text-white">{projectName}</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse mr-1.5" />
            Running Live
          </Badge>
        </div>
      </div>
      
      <SandpackProvider
        template="react-ts"
        theme={atomDark}
        files={sandpackFiles}
        options={{
          externalResources: [
            "https://cdn.tailwindcss.com"
          ],
          initMode: "immediate",
          autorun: true,
          autoReload: true,
        }}
        customSetup={{
          dependencies: {
            "react": "^18.0.0",
            "react-dom": "^18.0.0",
            "lucide-react": "latest"
          }
        }}
      >
        <SandpackLayout style={{ height: `calc(${height} - 48px)` }}>
          {showEditor && (
            <>
              <SandpackFileExplorer style={{ height: '100%', minWidth: '180px' }} />
              <SandpackCodeEditor 
                style={{ height: '100%', minWidth: '300px' }} 
                showLineNumbers 
                showTabs 
              />
            </>
          )}
          <SandpackPreview 
            style={{ height: '100%', flex: 1 }} 
            showOpenInCodeSandbox={false}
            showRefreshButton
          />
        </SandpackLayout>
      </SandpackProvider>
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
