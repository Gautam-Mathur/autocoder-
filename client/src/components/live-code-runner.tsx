import { useMemo, useState, useRef } from "react";
import { Play, RefreshCw, AlertCircle, FileCode, Layers, Eye } from "lucide-react";
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
  const [activeView, setActiveView] = useState<'preview' | 'structure'>('preview');
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

  // Analyze project complexity
  const projectAnalysis = useMemo(() => {
    const tsxFiles = files.filter(f => f.path.endsWith('.tsx') || f.path.endsWith('.jsx'));
    const cssFiles = files.filter(f => f.path.endsWith('.css'));
    const hasRouting = files.some(f => 
      f.content.includes('from "wouter"') || 
      f.content.includes("from 'wouter'") ||
      f.content.includes('react-router')
    );
    const pages = files.filter(f => f.path.includes('/pages/'));
    const components = files.filter(f => f.path.includes('/components/'));
    
    return {
      tsxFiles,
      cssFiles,
      hasRouting,
      pages,
      components,
      isComplex: hasRouting || pages.length > 2 || components.length > 5
    };
  }, [files]);

  // Extract meaningful content to render
  const previewContent = useMemo(() => {
    // For simple HTML projects
    if (!hasReactFiles && hasHtmlFiles) {
      const htmlFile = files.find(f => f.path.endsWith('.html'));
      const cssFiles = files.filter(f => f.path.endsWith('.css'));
      const jsFiles = files.filter(f => f.path.endsWith('.js') && !f.path.endsWith('.tsx'));
      
      let html = htmlFile?.content || '';
      html = html.replace(
        '</head>',
        `<style>${cssFiles.map(f => f.content).join('\n')}</style></head>`
      ).replace(
        '</body>',
        `<script>${jsFiles.map(f => f.content).join('\n')}</script></body>`
      );
      
      return { type: 'html' as const, content: html };
    }

    // For React projects, try to build a meaningful preview
    if (hasReactFiles) {
      const { pages, components, hasRouting, tsxFiles, cssFiles } = projectAnalysis;
      
      // Collect all component code
      const allComponents: Record<string, string> = {};
      
      for (const file of tsxFiles) {
        const name = file.path.split('/').pop()?.replace(/\.(tsx|jsx)$/, '') || '';
        let code = file.content;
        
        // Clean up the code for browser execution
        // Fix syntax errors like "return (;"
        code = code.replace(/return\s*\(\s*;/g, 'return (');
        
        // Remove import statements
        code = code.replace(/^import\s+.*?['"][^'"]+['"];?\s*$/gm, '');
        code = code.replace(/^import\s+\{[^}]*\}\s+from\s+['"][^'"]+['"];?\s*$/gm, '');
        code = code.replace(/^import\s+type\s+.*?;?\s*$/gm, '');
        
        // Remove TypeScript type annotations
        code = code.replace(/:\s*React\.\w+(<[^>]+>)?/g, '');
        code = code.replace(/:\s*(string|number|boolean|any|void|null|undefined|FC|FunctionComponent)(\[\])?/g, '');
        code = code.replace(/:\s*\{[^}]+\}/g, '');
        code = code.replace(/interface\s+\w+\s*\{[^}]*\}/g, '');
        code = code.replace(/type\s+\w+\s*=\s*[^;]+;/g, '');
        code = code.replace(/as\s+\w+(\[\])?/g, '');
        code = code.replace(/<\w+>/g, '');
        
        // Convert exports to const declarations
        code = code.replace(/export\s+default\s+function\s+(\w+)/g, 'const $1 = function');
        code = code.replace(/export\s+function\s+(\w+)/g, 'const $1 = function');
        code = code.replace(/export\s+const\s+/g, 'const ');
        code = code.replace(/export\s+default\s+/g, 'const __default__ = ');
        
        allComponents[name] = code;
      }
      
      // CSS content
      const cssContent = cssFiles.map(f => f.content).join('\n');
      
      // Build the page structure display
      const pageNames = pages.map(p => {
        const name = p.path.split('/').pop()?.replace(/\.(tsx|jsx)$/, '') || '';
        return name;
      });
      
      const componentNames = components.map(c => {
        const name = c.path.split('/').pop()?.replace(/\.(tsx|jsx)$/, '') || '';
        return name;
      });

      // Create a showcase of the project
      return {
        type: 'react' as const,
        pages: pageNames,
        components: componentNames,
        hasRouting,
        cssContent,
        allComponents,
        totalFiles: files.length
      };
    }

    return null;
  }, [files, hasReactFiles, hasHtmlFiles, projectAnalysis]);

  const previewHtml = useMemo(() => {
    if (!previewContent) return '';
    
    if (previewContent.type === 'html') {
      return previewContent.content;
    }

    if (previewContent.type === 'react') {
      const { pages, components, hasRouting, cssContent, totalFiles } = previewContent;
      
      // Create a visual showcase of the generated project
      return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${projectName}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    ${cssContent}
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { 
      font-family: system-ui, -apple-system, sans-serif; 
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 24px;
    }
    .preview-card {
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.15);
      overflow: hidden;
      max-width: 100%;
    }
    .preview-header {
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      padding: 20px 24px;
      color: white;
    }
    .preview-body {
      padding: 24px;
    }
    .route-item {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 12px 16px;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 12px;
      transition: all 0.2s;
    }
    .route-item:hover {
      background: #eef2ff;
      border-color: #6366f1;
    }
    .route-icon {
      width: 32px;
      height: 32px;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 14px;
    }
    .component-tag {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 6px 10px;
      font-size: 12px;
      margin: 4px;
    }
    .stat-box {
      background: linear-gradient(135deg, #f8fafc, #f1f5f9);
      border-radius: 12px;
      padding: 16px;
      text-align: center;
    }
    .stat-number {
      font-size: 28px;
      font-weight: 700;
      color: #6366f1;
    }
    .stat-label {
      font-size: 12px;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
  </style>
</head>
<body>
  <div class="preview-card">
    <div class="preview-header">
      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
          <polyline points="2 17 12 22 22 17"></polyline>
          <polyline points="2 12 12 17 22 12"></polyline>
        </svg>
        <h1 style="font-size: 18px; font-weight: 600;">${projectName}</h1>
      </div>
      <p style="font-size: 14px; opacity: 0.8;">Full-stack React + TypeScript application</p>
    </div>
    
    <div class="preview-body">
      <!-- Stats Row -->
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 24px;">
        <div class="stat-box">
          <div class="stat-number">${totalFiles}</div>
          <div class="stat-label">Files</div>
        </div>
        <div class="stat-box">
          <div class="stat-number">${pages.length}</div>
          <div class="stat-label">Pages</div>
        </div>
        <div class="stat-box">
          <div class="stat-number">${components.length}</div>
          <div class="stat-label">Components</div>
        </div>
      </div>
      
      ${pages.length > 0 ? `
      <!-- Routes Section -->
      <div style="margin-bottom: 24px;">
        <h3 style="font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 12h18M3 6h18M3 18h18"></path>
          </svg>
          Application Pages
        </h3>
        ${pages.map((page, i) => `
          <div class="route-item">
            <div class="route-icon">${page.charAt(0).toUpperCase()}</div>
            <div>
              <div style="font-weight: 500; color: #1f2937;">${page}</div>
              <div style="font-size: 12px; color: #6b7280;">/${page.toLowerCase() === 'home' ? '' : page.toLowerCase()}</div>
            </div>
          </div>
        `).join('')}
      </div>
      ` : ''}
      
      ${components.length > 0 ? `
      <!-- Components Section -->
      <div>
        <h3 style="font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
          Components
        </h3>
        <div style="display: flex; flex-wrap: wrap;">
          ${components.slice(0, 12).map(comp => `
            <span class="component-tag">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2">
                <polyline points="16 18 22 12 16 6"></polyline>
                <polyline points="8 6 2 12 8 18"></polyline>
              </svg>
              ${comp}
            </span>
          `).join('')}
          ${components.length > 12 ? `<span class="component-tag">+${components.length - 12} more</span>` : ''}
        </div>
      </div>
      ` : ''}
      
      <!-- Tech Stack -->
      <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <span style="background: #61dafb20; color: #61dafb; padding: 4px 10px; border-radius: 4px; font-size: 12px; font-weight: 500;">React</span>
          <span style="background: #3178c620; color: #3178c6; padding: 4px 10px; border-radius: 4px; font-size: 12px; font-weight: 500;">TypeScript</span>
          ${hasRouting ? '<span style="background: #f4364820; color: #f43648; padding: 4px 10px; border-radius: 4px; font-size: 12px; font-weight: 500;">Router</span>' : ''}
          <span style="background: #38bdf820; color: #0ea5e9; padding: 4px 10px; border-radius: 4px; font-size: 12px; font-weight: 500;">Tailwind</span>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
    }

    return '';
  }, [previewContent, projectName]);

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
