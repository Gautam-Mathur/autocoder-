import { useState, useMemo, useRef, useEffect } from "react";
import { Eye, EyeOff, Maximize2, Minimize2, ExternalLink, Play, FileCode, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface CodePreviewProps {
  code: string;
  language: string;
}

interface CombinedPreviewProps {
  html: string;
  css: string;
  javascript: string;
}

interface MultiFilePreviewProps {
  files: { name: string; content: string }[];
}

// Parse multi-file HTML content from AI response (old format)
export function parseMultiFileHtml(code: string): { name: string; content: string }[] | null {
  const filePattern = /<!--\s*FILE:\s*([^\s]+)\s*-->/gi;
  const matches: RegExpExecArray[] = [];
  let match: RegExpExecArray | null;
  
  while ((match = filePattern.exec(code)) !== null) {
    matches.push(match);
  }
  
  if (matches.length < 2) return null; // Need at least 2 files for multi-file
  
  const files: { name: string; content: string }[] = [];
  
  for (let i = 0; i < matches.length; i++) {
    const m = matches[i];
    const fileName = m[1];
    const startIndex = m.index + m[0].length;
    const endIndex = i < matches.length - 1 ? matches[i + 1].index : code.length;
    const content = code.slice(startIndex, endIndex).trim();
    
    if (content) {
      files.push({ name: fileName, content });
    }
  }
  
  return files.length >= 2 ? files : null;
}

// Parse multi-file project content with --- FILE: path --- markers
export function parseProjectFiles(code: string): { path: string; content: string; language: string }[] | null {
  const filePattern = /---\s*FILE:\s*([^\s]+)\s*---/gi;
  const matches: RegExpExecArray[] = [];
  let match: RegExpExecArray | null;
  
  while ((match = filePattern.exec(code)) !== null) {
    matches.push(match);
  }
  
  if (matches.length < 2) return null; // Need at least 2 files
  
  const files: { path: string; content: string; language: string }[] = [];
  
  for (let i = 0; i < matches.length; i++) {
    const m = matches[i];
    const filePath = m[1];
    const startIndex = m.index + m[0].length;
    const endIndex = i < matches.length - 1 ? matches[i + 1].index : code.length;
    const content = code.slice(startIndex, endIndex).trim();
    
    // Get language from file extension
    const ext = filePath.split('.').pop()?.toLowerCase() || 'text';
    const languageMap: Record<string, string> = {
      'js': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'jsx': 'javascript',
      'css': 'css',
      'html': 'html',
      'json': 'json',
      'md': 'markdown',
      'py': 'python',
    };
    const language = languageMap[ext] || ext;
    
    if (content) {
      files.push({ path: filePath, content, language });
    }
  }
  
  return files.length >= 2 ? files : null;
}

interface ProjectFile {
  path: string;
  content: string;
  language: string;
}

interface ProjectFilesPreviewProps {
  files: ProjectFile[];
}

// Multi-file project preview with file tree
export function ProjectFilesPreview({ files }: ProjectFilesPreviewProps) {
  const [activeFile, setActiveFile] = useState(files[0]?.path || '');
  const [copiedFile, setCopiedFile] = useState<string | null>(null);

  const activeContent = files.find(f => f.path === activeFile);

  const copyFile = async (path: string, content: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedFile(path);
    setTimeout(() => setCopiedFile(null), 2000);
  };

  const copyAllFiles = async () => {
    const allContent = files.map(f => `// ${f.path}\n${f.content}`).join('\n\n');
    await navigator.clipboard.writeText(allContent);
    setCopiedFile('all');
    setTimeout(() => setCopiedFile(null), 2000);
  };

  // Get file icon based on extension
  const getFileIcon = (path: string) => {
    const ext = path.split('.').pop()?.toLowerCase();
    if (ext === 'html') return '📄';
    if (ext === 'css') return '🎨';
    if (['js', 'ts', 'jsx', 'tsx'].includes(ext || '')) return '⚡';
    if (ext === 'json') return '📋';
    return '📁';
  };

  if (files.length === 0) return null;

  return (
    <div className="my-4 rounded-lg border border-border overflow-hidden bg-card">
      <div className="flex items-center justify-between px-4 py-3 bg-muted/50 border-b border-border">
        <div className="flex items-center gap-2">
          <FileCode className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">Project Files</span>
          <Badge variant="secondary" className="text-xs">
            {files.length} files
          </Badge>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={copyAllFiles}
          className="text-xs gap-1"
          data-testid="button-copy-all-files"
        >
          {copiedFile === 'all' ? 'Copied!' : 'Copy All'}
        </Button>
      </div>

      <div className="flex">
        {/* File Tree Sidebar */}
        <div className="w-48 border-r border-border bg-muted/30 p-2 min-h-[300px]">
          <div className="text-xs text-muted-foreground uppercase tracking-wide mb-2 px-2">Files</div>
          {files.map((file) => (
            <button
              key={file.path}
              onClick={() => setActiveFile(file.path)}
              className={`w-full text-left px-2 py-1.5 rounded text-xs flex items-center gap-1.5 transition-colors ${
                activeFile === file.path
                  ? 'bg-primary/20 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
              data-testid={`file-tab-${file.path.replace(/\//g, '-')}`}
            >
              <span>{getFileIcon(file.path)}</span>
              <span className="truncate">{file.path}</span>
            </button>
          ))}
        </div>

        {/* File Content */}
        <div className="flex-1 min-w-0">
          {activeContent && (
            <div>
              <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-background">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-muted-foreground">{activeContent.path}</span>
                  <Badge variant="outline" className="text-xs">
                    {activeContent.language}
                  </Badge>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  onClick={() => copyFile(activeContent.path, activeContent.content)}
                  data-testid={`button-copy-${activeContent.path.replace(/\//g, '-')}`}
                >
                  {copiedFile === activeContent.path ? (
                    <span className="text-green-500 text-xs">✓</span>
                  ) : (
                    <span className="text-xs">📋</span>
                  )}
                </Button>
              </div>
              <pre className="p-4 overflow-x-auto max-h-[400px] text-xs">
                <code className="font-mono leading-relaxed">{activeContent.content}</code>
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function CodePreview({ code, language }: CodePreviewProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const canPreview = language === "html" || language === "htm";
  
  const srcdoc = useMemo(() => {
    if (!canPreview) return "";
    return code;
  }, [code, canPreview]);

  const openInNewTab = () => {
    const blob = new Blob([code], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  if (!canPreview) return null;

  return (
    <div className="mt-3">
      <div className="flex items-center gap-2 mb-2">
        <Button
          size="sm"
          variant={showPreview ? "default" : "outline"}
          onClick={() => setShowPreview(!showPreview)}
          className="gap-1.5 text-xs"
          data-testid="button-toggle-preview"
        >
          {showPreview ? (
            <>
              <EyeOff className="w-3.5 h-3.5" />
              Hide Preview
            </>
          ) : (
            <>
              <Eye className="w-3.5 h-3.5" />
              Live Preview
            </>
          )}
        </Button>
        
        {showPreview && (
          <>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="gap-1.5 text-xs"
              data-testid="button-fullscreen-preview"
            >
              {isFullscreen ? (
                <Minimize2 className="w-3.5 h-3.5" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5" />
              )}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={openInNewTab}
              className="gap-1.5 text-xs"
              data-testid="button-open-new-tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </Button>
          </>
        )}
      </div>

      {showPreview && (
        <div
          className={`relative bg-white rounded-lg overflow-hidden border border-border transition-all ${
            isFullscreen
              ? "fixed inset-4 z-50 shadow-2xl"
              : "h-[400px]"
          }`}
        >
          {isFullscreen && (
            <div className="absolute top-2 right-2 z-10">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setIsFullscreen(false)}
                className="gap-1.5 shadow-lg"
              >
                <Minimize2 className="w-4 h-4" />
                Exit Fullscreen
              </Button>
            </div>
          )}
          
          <iframe
            title="Code Preview"
            className="w-full h-full"
            srcDoc={srcdoc}
            sandbox="allow-scripts"
            data-testid="iframe-code-preview"
          />
        </div>
      )}
      
      {isFullscreen && showPreview && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsFullscreen(false)}
        />
      )}
    </div>
  );
}

export function CombinedAppPreview({ html, css, javascript }: CombinedPreviewProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const combinedCode = useMemo(() => {
    let baseHtml = html.trim();
    
    if (!baseHtml.includes('<!DOCTYPE') && !baseHtml.includes('<html')) {
      baseHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>App Preview</title>
  ${css ? `<style>${css}</style>` : ''}
</head>
<body>
${baseHtml}
${javascript ? `<script>${javascript}</script>` : ''}
</body>
</html>`;
    } else {
      if (css && !baseHtml.includes(css)) {
        const styleTag = `<style>${css}</style>`;
        if (baseHtml.includes('</head>')) {
          baseHtml = baseHtml.replace('</head>', `${styleTag}</head>`);
        } else if (baseHtml.includes('<body')) {
          baseHtml = baseHtml.replace(/<body[^>]*>/, (match) => `${styleTag}${match}`);
        }
      }
      
      if (javascript && !baseHtml.includes(javascript)) {
        const scriptTag = `<script>${javascript}</script>`;
        if (baseHtml.includes('</body>')) {
          baseHtml = baseHtml.replace('</body>', `${scriptTag}</body>`);
        } else {
          baseHtml += scriptTag;
        }
      }
    }
    
    return baseHtml;
  }, [html, css, javascript]);

  const openInNewTab = () => {
    const blob = new Blob([combinedCode], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const hasContent = html || css || javascript;
  if (!hasContent) return null;

  return (
    <div className="my-4 p-4 rounded-lg bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border border-primary/20">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <Play className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground">Full App Preview</h4>
            <p className="text-xs text-muted-foreground">
              {[html && 'HTML', css && 'CSS', javascript && 'JS'].filter(Boolean).join(' + ')} combined
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={showPreview ? "default" : "outline"}
            onClick={() => setShowPreview(!showPreview)}
            className="gap-1.5"
            data-testid="button-run-full-app"
          >
            {showPreview ? (
              <>
                <EyeOff className="w-3.5 h-3.5" />
                Hide
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                Run App
              </>
            )}
          </Button>
          
          {showPreview && (
            <>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsFullscreen(!isFullscreen)}
                data-testid="button-fullscreen-combined"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={openInNewTab}
                data-testid="button-open-combined-new-tab"
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      {showPreview && (
        <div
          className={`relative bg-white rounded-lg overflow-hidden border border-border transition-all ${
            isFullscreen
              ? "fixed inset-4 z-50 shadow-2xl"
              : "h-[500px]"
          }`}
        >
          {isFullscreen && (
            <div className="absolute top-2 right-2 z-10">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setIsFullscreen(false)}
                className="gap-1.5 shadow-lg"
              >
                <Minimize2 className="w-4 h-4" />
                Exit
              </Button>
            </div>
          )}
          
          <iframe
            title="Combined App Preview"
            className="w-full h-full"
            srcDoc={combinedCode}
            sandbox="allow-scripts"
            data-testid="iframe-combined-preview"
          />
        </div>
      )}
      
      {isFullscreen && showPreview && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsFullscreen(false)}
        />
      )}
    </div>
  );
}

// Multi-file website preview with navigation
export function MultiFilePreview({ files }: MultiFilePreviewProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentFile, setCurrentFile] = useState(files[0]?.name || 'index.html');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const currentContent = useMemo(() => {
    const file = files.find(f => f.name === currentFile);
    if (!file) return files[0]?.content || '';
    
    // Inject navigation handler script
    let content = file.content;
    const navScript = `
<script>
  document.addEventListener('click', function(e) {
    const link = e.target.closest('a');
    if (link && link.getAttribute('href')) {
      const href = link.getAttribute('href');
      if (href.endsWith('.html') && !href.startsWith('http')) {
        e.preventDefault();
        window.parent.postMessage({ type: 'navigate', page: href }, '*');
      }
    }
  });
</script>`;
    
    if (content.includes('</body>')) {
      content = content.replace('</body>', `${navScript}</body>`);
    } else {
      content += navScript;
    }
    
    return content;
  }, [files, currentFile]);

  // Listen for navigation messages from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'navigate' && event.data?.page) {
        const pageName = event.data.page.replace('./', '');
        if (files.some(f => f.name === pageName)) {
          setCurrentFile(pageName);
        }
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [files]);

  const openInNewTab = () => {
    const blob = new Blob([currentContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  if (files.length === 0) return null;

  return (
    <div className="my-4 p-4 rounded-lg bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-blue-500/20">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
            <FileCode className="w-4 h-4 text-blue-500" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground">Multi-Page Website</h4>
            <p className="text-xs text-muted-foreground">
              {files.length} connected pages
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={showPreview ? "default" : "outline"}
            onClick={() => setShowPreview(!showPreview)}
            className="gap-1.5"
            data-testid="button-run-multi-file"
          >
            {showPreview ? (
              <>
                <EyeOff className="w-3.5 h-3.5" />
                Hide
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                Run Website
              </>
            )}
          </Button>
          
          {showPreview && (
            <>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsFullscreen(!isFullscreen)}
                data-testid="button-fullscreen-multi"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={openInNewTab}
                data-testid="button-open-multi-new-tab"
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* File tabs */}
      <div className="flex flex-wrap gap-1 mb-3">
        {files.map((file) => (
          <Badge
            key={file.name}
            variant={currentFile === file.name ? "default" : "outline"}
            className="cursor-pointer text-xs px-2 py-1 hover-elevate"
            onClick={() => setCurrentFile(file.name)}
            data-testid={`tab-${file.name}`}
          >
            {file.name}
            {currentFile === file.name && <ChevronRight className="w-3 h-3 ml-1" />}
          </Badge>
        ))}
      </div>

      {showPreview && (
        <div
          className={`relative bg-white rounded-lg overflow-hidden border border-border transition-all ${
            isFullscreen
              ? "fixed inset-4 z-50 shadow-2xl"
              : "h-[500px]"
          }`}
        >
          {isFullscreen && (
            <div className="absolute top-2 right-2 z-10 flex gap-2">
              {/* File tabs in fullscreen */}
              <div className="flex gap-1 bg-background/90 backdrop-blur rounded-lg p-1">
                {files.map((file) => (
                  <Badge
                    key={file.name}
                    variant={currentFile === file.name ? "default" : "secondary"}
                    className="cursor-pointer text-xs"
                    onClick={() => setCurrentFile(file.name)}
                  >
                    {file.name}
                  </Badge>
                ))}
              </div>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setIsFullscreen(false)}
                className="gap-1.5 shadow-lg"
              >
                <Minimize2 className="w-4 h-4" />
                Exit
              </Button>
            </div>
          )}
          
          <iframe
            ref={iframeRef}
            title={`Preview: ${currentFile}`}
            className="w-full h-full"
            srcDoc={currentContent}
            sandbox="allow-scripts"
            data-testid="iframe-multi-preview"
          />
        </div>
      )}
      
      {isFullscreen && showPreview && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsFullscreen(false)}
        />
      )}
    </div>
  );
}
