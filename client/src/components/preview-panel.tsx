import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Eye, Code, Maximize2, Minimize2, ExternalLink, RefreshCw, Monitor, Smartphone, Tablet, ChevronRight, ChevronDown, Folder, FolderOpen, FileCode, Bug, AlertCircle, CheckCircle2, Lightbulb, BookOpen, Wrench, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SiHtml5, SiCss3, SiJavascript, SiTypescript, SiReact, SiPython } from "react-icons/si";
import type { ProjectFile } from "@shared/schema";
import { checkErrors, recordCodeChange, getDebugStats, CodeError } from "@/lib/code-generator/engine";

interface PreviewPanelProps {
  conversationId: number | null;
  onRequestFix?: (error: string, code: string) => void;
}

interface RuntimeError {
  message: string;
  source?: string;
  line?: number;
  timestamp: number;
}

type DeviceMode = "desktop" | "tablet" | "mobile";

const deviceSizes: Record<DeviceMode, { width: string; height: string }> = {
  desktop: { width: "100%", height: "100%" },
  tablet: { width: "768px", height: "100%" },
  mobile: { width: "375px", height: "100%" },
};

interface TreeNode {
  name: string;
  path: string;
  isFolder: boolean;
  children: TreeNode[];
  content?: string;
  language?: string;
}

function buildFileTree(files: ProjectFile[]): TreeNode[] {
  const root: TreeNode[] = [];

  for (const file of files) {
    const parts = file.path.split("/");
    let currentLevel = root;
    let currentPath = "";

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      currentPath = currentPath ? `${currentPath}/${part}` : part;
      const isLast = i === parts.length - 1;

      let existing = currentLevel.find((n) => n.name === part);

      if (!existing) {
        existing = {
          name: part,
          path: currentPath,
          isFolder: !isLast,
          children: [],
          ...(isLast ? { content: file.content, language: file.language } : {}),
        };
        currentLevel.push(existing);
      }

      if (!isLast) {
        currentLevel = existing.children;
      }
    }
  }

  const sortTree = (nodes: TreeNode[]): TreeNode[] => {
    return nodes
      .sort((a, b) => {
        if (a.isFolder && !b.isFolder) return -1;
        if (!a.isFolder && b.isFolder) return 1;
        return a.name.localeCompare(b.name);
      })
      .map((node) => ({
        ...node,
        children: sortTree(node.children),
      }));
  };

  return sortTree(root);
}

function FileTreeNode({
  node,
  activeFile,
  onSelectFile,
  depth = 0,
}: {
  node: TreeNode;
  activeFile: string;
  onSelectFile: (path: string) => void;
  depth?: number;
}) {
  const [isExpanded, setIsExpanded] = useState(depth < 2);

  const getFileIcon = (name: string) => {
    const ext = name.split(".").pop()?.toLowerCase();
    if (ext === "html") return <SiHtml5 className="w-3 h-3 text-orange-500" />;
    if (ext === "css") return <SiCss3 className="w-3 h-3 text-blue-500" />;
    if (ext === "js") return <SiJavascript className="w-3 h-3 text-yellow-500" />;
    if (ext === "jsx") return <SiReact className="w-3 h-3 text-cyan-500" />;
    if (ext === "ts") return <SiTypescript className="w-3 h-3 text-blue-600" />;
    if (ext === "tsx") return <SiReact className="w-3 h-3 text-cyan-500" />;
    if (ext === "py") return <SiPython className="w-3 h-3 text-yellow-500" />;
    return <FileCode className="w-3 h-3 text-muted-foreground" />;
  };

  if (node.isFolder) {
    return (
      <div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full text-left px-2 py-1 rounded text-xs flex items-center gap-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
        >
          {isExpanded ? (
            <ChevronDown className="w-3 h-3 shrink-0" />
          ) : (
            <ChevronRight className="w-3 h-3 shrink-0" />
          )}
          {isExpanded ? (
            <FolderOpen className="w-3.5 h-3.5 text-primary shrink-0" />
          ) : (
            <Folder className="w-3.5 h-3.5 text-primary shrink-0" />
          )}
          <span className="truncate">{node.name}</span>
        </button>
        {isExpanded && (
          <div>
            {node.children.map((child) => (
              <FileTreeNode
                key={child.path}
                node={child}
                activeFile={activeFile}
                onSelectFile={onSelectFile}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={() => onSelectFile(node.path)}
      className={`w-full text-left px-2 py-1 rounded text-xs flex items-center gap-1.5 transition-colors ${
        activeFile === node.path
          ? "bg-primary/20 text-primary"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
      style={{ paddingLeft: `${depth * 12 + 20}px` }}
      data-testid={`filetree-${node.path.replace(/\//g, "-")}`}
    >
      {getFileIcon(node.name)}
      <span className="truncate">{node.name}</span>
    </button>
  );
}

export function PreviewPanel({ conversationId, onRequestFix }: PreviewPanelProps) {
  const [activeTab, setActiveTab] = useState<"preview" | "code" | "debug">("preview");
  const [activeFile, setActiveFile] = useState<string>("index.html");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [deviceMode, setDeviceMode] = useState<DeviceMode>("desktop");
  const [refreshKey, setRefreshKey] = useState(0);
  const [codeErrors, setCodeErrors] = useState<CodeError[]>([]);
  const [runtimeErrors, setRuntimeErrors] = useState<RuntimeError[]>([]);
  const [debugStats, setDebugStats] = useState({ errorsFound: 0, fixesLearned: 0, changesObserved: 0 });
  const [previousCode, setPreviousCode] = useState<Map<string, string>>(new Map());
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const { data: files = [] } = useQuery<ProjectFile[]>({
    queryKey: ["/api/conversations", conversationId, "files"],
    enabled: !!conversationId,
    refetchInterval: 2000,
  });

  const fileTree = useMemo(() => buildFileTree(files), [files]);

  useEffect(() => {
    if (files.length > 0 && !files.find((f) => f.path === activeFile)) {
      const htmlFile = files.find((f) => f.path.endsWith(".html"));
      if (htmlFile) {
        setActiveFile(htmlFile.path);
      } else {
        setActiveFile(files[0].path);
      }
    }
  }, [files, activeFile]);

  // Listen for runtime errors from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'PREVIEW_ERROR') {
        const error: RuntimeError = {
          message: event.data.message,
          source: event.data.source,
          line: event.data.line,
          timestamp: Date.now()
        };
        setRuntimeErrors(prev => {
          // Avoid duplicates
          if (prev.some(e => e.message === error.message)) return prev;
          return [...prev.slice(-9), error]; // Keep last 10
        });
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Clear runtime errors on refresh
  useEffect(() => {
    setRuntimeErrors([]);
  }, [refreshKey]);

  // Live code observation - detect changes and errors
  useEffect(() => {
    if (files.length === 0) return;
    
    // Analyze all files for errors
    const allErrors: CodeError[] = [];
    files.forEach(file => {
      const errors = checkErrors(file.content);
      errors.forEach(e => {
        allErrors.push({ ...e, code: `${file.path}: ${e.code.substring(0, 50)}` });
      });
      
      // Check for code changes (learning)
      const prevContent = previousCode.get(file.path);
      if (prevContent && prevContent !== file.content) {
        // Code changed - record it for learning
        const hadErrors = checkErrors(prevContent).length > 0;
        recordCodeChange(prevContent, file.content, hadErrors);
      }
    });
    
    setCodeErrors(allErrors);
    setDebugStats(getDebugStats());
    
    // Update previous code state
    const newPrevCode = new Map<string, string>();
    files.forEach(f => newPrevCode.set(f.path, f.content));
    setPreviousCode(newPrevCode);
  }, [files]);

  // Get all code as string for fix requests
  const getAllCode = useCallback(() => {
    return files.map(f => `// ${f.path}\n${f.content}`).join('\n\n');
  }, [files]);

  // Handle fix request
  const handleFixRequest = useCallback((errorMessage: string) => {
    if (onRequestFix) {
      onRequestFix(errorMessage, getAllCode());
    }
  }, [onRequestFix, getAllCode]);

  const combinedPreview = useMemo(() => {
    if (files.length === 0) return "";

    const htmlFile =
      files.find((f) => f.path.toLowerCase().endsWith("index.html")) ||
      files.find((f) => f.path.toLowerCase().endsWith(".html"));
    const cssFiles = files.filter((f) => f.path.toLowerCase().endsWith(".css"));
    const jsFiles = files.filter((f) => f.path.toLowerCase().endsWith(".js"));

    if (!htmlFile) return "";

    let html = htmlFile.content;

    if (!html.includes("<!DOCTYPE") && !html.includes("<html")) {
      html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview</title>
</head>
<body>
${html}
</body>
</html>`;
    }

    if (cssFiles.length > 0) {
      const combinedCss = cssFiles.map((f) => f.content).join("\n\n");
      const styleTag = `<style>\n${combinedCss}\n</style>`;
      if (html.includes("</head>")) {
        html = html.replace("</head>", `${styleTag}\n</head>`);
      } else if (html.includes("<body")) {
        html = html.replace(/<body[^>]*>/i, (match) => `${styleTag}\n${match}`);
      }
    }

    if (jsFiles.length > 0) {
      const combinedJs = jsFiles.map((f) => f.content).join("\n\n");
      const scriptTag = `<script>\n${combinedJs}\n</script>`;
      if (html.includes("</body>")) {
        html = html.replace("</body>", `${scriptTag}\n</body>`);
      }
    }

    // Inject error capturing script
    const errorCaptureScript = `<script>
(function() {
  // Capture all errors and send to parent
  window.onerror = function(message, source, lineno, colno, error) {
    window.parent.postMessage({
      type: 'PREVIEW_ERROR',
      message: message,
      source: source,
      line: lineno,
      column: colno,
      stack: error ? error.stack : null
    }, '*');
    return false;
  };
  
  // Capture unhandled promise rejections
  window.onunhandledrejection = function(event) {
    window.parent.postMessage({
      type: 'PREVIEW_ERROR',
      message: 'Unhandled Promise Rejection: ' + (event.reason ? event.reason.message || event.reason : 'Unknown'),
      source: 'Promise',
      line: 0
    }, '*');
  };
  
  // Capture fetch errors
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    return originalFetch.apply(this, args).catch(function(err) {
      window.parent.postMessage({
        type: 'PREVIEW_ERROR',
        message: 'Fetch error: ' + err.message,
        source: args[0],
        line: 0
      }, '*');
      throw err;
    });
  };
  
  // Capture console errors
  const originalError = console.error;
  console.error = function(...args) {
    window.parent.postMessage({
      type: 'PREVIEW_ERROR',
      message: args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '),
      source: 'console.error',
      line: 0
    }, '*');
    originalError.apply(console, args);
  };
})();
</script>`;
    
    // Insert error capture script at the beginning of head
    if (html.includes("<head>")) {
      html = html.replace("<head>", `<head>\n${errorCaptureScript}`);
    } else if (html.includes("<html")) {
      html = html.replace(/<html[^>]*>/i, (match) => `${match}\n<head>${errorCaptureScript}</head>`);
    }

    return html;
  }, [files, refreshKey]);

  const openInNewTab = () => {
    if (!combinedPreview) return;
    const blob = new Blob([combinedPreview], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1);
  };

  const activeFileContent = files.find((f) => f.path === activeFile);

  if (!conversationId) {
    return (
      <div className="flex flex-col h-full bg-muted/30">
        <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-background">
          <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-background shadow-sm">
              <Eye className="w-3 h-3" />
              Preview
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-muted-foreground">
              <Code className="w-3 h-3" />
              Code
            </button>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
          <div className="text-center p-4">
            <Monitor className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Start a conversation to see the preview</p>
          </div>
        </div>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="flex flex-col h-full bg-muted/30">
        <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-background">
          <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-background shadow-sm">
              <Eye className="w-3 h-3" />
              Preview
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-muted-foreground">
              <Code className="w-3 h-3" />
              Code
            </button>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
          <div className="text-center p-4">
            <Code className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No code generated yet</p>
            <p className="text-xs mt-1">Ask the AI to create something!</p>
          </div>
        </div>
      </div>
    );
  }

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col">
        <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/50">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5">
              <button
                onClick={() => setActiveTab("preview")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  activeTab === "preview" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
                data-testid="tab-preview-fullscreen"
              >
                <Eye className="w-3 h-3" />
                Preview
              </button>
              <button
                onClick={() => setActiveTab("code")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  activeTab === "code" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
                data-testid="tab-code-fullscreen"
              >
                <Code className="w-3 h-3" />
                Code
              </button>
            </div>
            <Badge variant="secondary" className="text-xs">
              {files.length} files
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setDeviceMode("desktop")} data-testid="button-device-desktop">
              <Monitor className={`w-4 h-4 ${deviceMode === "desktop" ? "text-primary" : ""}`} />
            </Button>
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setDeviceMode("tablet")} data-testid="button-device-tablet">
              <Tablet className={`w-4 h-4 ${deviceMode === "tablet" ? "text-primary" : ""}`} />
            </Button>
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setDeviceMode("mobile")} data-testid="button-device-mobile">
              <Smartphone className={`w-4 h-4 ${deviceMode === "mobile" ? "text-primary" : ""}`} />
            </Button>
            <div className="w-px h-4 bg-border mx-1" />
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleRefresh} data-testid="button-refresh-fullscreen">
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={openInNewTab} data-testid="button-newtab-fullscreen">
              <ExternalLink className="w-4 h-4" />
            </Button>
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setIsFullscreen(false)} data-testid="button-exit-fullscreen">
              <Minimize2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="flex-1 flex overflow-hidden">
          {activeTab === "preview" ? (
            <div className="flex-1 flex items-center justify-center bg-muted/30 p-4 overflow-auto">
              <div
                className="bg-white shadow-2xl rounded-lg overflow-hidden transition-all duration-300"
                style={{
                  width: deviceSizes[deviceMode].width,
                  height: deviceSizes[deviceMode].height,
                  maxWidth: "100%",
                  maxHeight: "100%",
                }}
              >
                <iframe
                  key={refreshKey}
                  ref={iframeRef}
                  srcDoc={combinedPreview}
                  className="w-full h-full border-0"
                  sandbox="allow-scripts"
                  title="Live Preview"
                />
              </div>
            </div>
          ) : (
            <div className="flex-1 flex overflow-hidden">
              <div className="w-48 border-r border-border bg-muted/30 overflow-y-auto">
                <div className="p-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">Files</div>
                <ScrollArea className="h-full">
                  {fileTree.map((node) => (
                    <FileTreeNode
                      key={node.path}
                      node={node}
                      activeFile={activeFile}
                      onSelectFile={setActiveFile}
                    />
                  ))}
                </ScrollArea>
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-background">
                  <span className="text-xs font-mono text-muted-foreground">{activeFile}</span>
                  <Badge variant="outline" className="text-xs">{activeFileContent?.language}</Badge>
                </div>
                <ScrollArea className="h-[calc(100%-40px)]">
                  <pre className="p-4 text-xs font-mono leading-relaxed">
                    <code className="whitespace-pre">{activeFileContent?.content}</code>
                  </pre>
                </ScrollArea>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-muted/30">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-background">
        <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5">
          <button
            onClick={() => setActiveTab("preview")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeTab === "preview" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
            data-testid="tab-preview"
          >
            <Eye className="w-3 h-3" />
            Preview
          </button>
          <button
            onClick={() => setActiveTab("code")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeTab === "code" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
            data-testid="tab-code"
          >
            <Code className="w-3 h-3" />
            Code
          </button>
          <button
            onClick={() => setActiveTab("debug")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeTab === "debug" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
            data-testid="tab-debug"
          >
            <Bug className="w-3 h-3" />
            Debug
            {codeErrors.length > 0 && (
              <span className="ml-1 bg-destructive text-destructive-foreground text-xs px-1.5 py-0.5 rounded-full">{codeErrors.length}</span>
            )}
          </button>
        </div>
        <div className="flex items-center gap-1">
          {activeTab === "preview" && (
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleRefresh} data-testid="button-refresh">
              <RefreshCw className="w-3.5 h-3.5" />
            </Button>
          )}
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={openInNewTab} data-testid="button-newtab">
            <ExternalLink className="w-3.5 h-3.5" />
          </Button>
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setIsFullscreen(true)} data-testid="button-fullscreen">
            <Maximize2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {activeTab === "preview" ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            {combinedPreview ? (
              <iframe
                key={refreshKey}
                ref={iframeRef}
                srcDoc={combinedPreview}
                className="flex-1 w-full bg-white border-0"
                sandbox="allow-scripts"
                title="Live Preview"
              />
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
                <p>No HTML file to preview</p>
              </div>
            )}
          </div>
        ) : activeTab === "debug" ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {/* Debug Stats */}
                <div className="flex gap-3">
                  <div className="flex-1 bg-card border rounded-lg p-3">
                    <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                      <BookOpen className="w-3 h-3" />
                      Changes Observed
                    </div>
                    <div className="text-lg font-semibold">{debugStats.changesObserved}</div>
                  </div>
                  <div className="flex-1 bg-card border rounded-lg p-3">
                    <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                      <Lightbulb className="w-3 h-3" />
                      Fixes Learned
                    </div>
                    <div className="text-lg font-semibold">{debugStats.fixesLearned}</div>
                  </div>
                  <div className="flex-1 bg-card border rounded-lg p-3">
                    <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                      <AlertCircle className="w-3 h-3" />
                      Issues Found
                    </div>
                    <div className="text-lg font-semibold">{codeErrors.length + runtimeErrors.length}</div>
                  </div>
                </div>

                {/* Runtime Errors - Most Important */}
                {runtimeErrors.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium mb-2 flex items-center gap-2 text-red-500">
                      <Zap className="w-4 h-4" />
                      Runtime Errors ({runtimeErrors.length})
                    </h3>
                    <div className="space-y-2">
                      {runtimeErrors.map((error, i) => (
                        <div key={i} className="bg-destructive/10 border border-destructive/30 rounded-lg p-3">
                          <div className="flex items-start gap-2">
                            <div className="mt-0.5 text-red-500">
                              <Zap className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="destructive" className="text-xs">RUNTIME</Badge>
                                {error.source && <span className="text-xs text-muted-foreground truncate">{error.source}</span>}
                              </div>
                              <p className="text-sm font-medium text-destructive">{error.message}</p>
                              {onRequestFix && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="mt-2 h-7 text-xs gap-1"
                                  onClick={() => handleFixRequest(error.message)}
                                  data-testid={`button-fix-runtime-${i}`}
                                >
                                  <Wrench className="w-3 h-3" />
                                  Fix This Error
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Static Code Analysis */}
                <div>
                  <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Bug className="w-4 h-4" />
                    Code Analysis
                  </h3>
                  {codeErrors.length === 0 && runtimeErrors.length === 0 ? (
                    <div className="bg-card border rounded-lg p-4 text-center">
                      <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-500" />
                      <p className="text-sm text-muted-foreground">No issues detected!</p>
                      <p className="text-xs text-muted-foreground mt-1">Your code looks good.</p>
                    </div>
                  ) : codeErrors.length === 0 ? (
                    <div className="bg-card border rounded-lg p-3 text-center text-muted-foreground text-sm">
                      No static code issues found.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {codeErrors.map((error, i) => (
                        <div key={i} className="bg-card border rounded-lg p-3">
                          <div className="flex items-start gap-2">
                            <div className={`mt-0.5 ${
                              error.type === 'syntax' ? 'text-red-500' :
                              error.type === 'runtime' ? 'text-orange-500' :
                              error.type === 'logic' ? 'text-yellow-500' : 'text-blue-500'
                            }`}>
                              <AlertCircle className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <Badge variant="outline" className="text-xs uppercase">
                                  {error.type}
                                </Badge>
                                <span className="text-xs text-muted-foreground">{error.language}</span>
                                {error.line && <span className="text-xs text-muted-foreground">Line {error.line}</span>}
                              </div>
                              <p className="text-sm">{error.message}</p>
                              <p className="text-xs text-muted-foreground font-mono truncate">{error.code}</p>
                              {error.suggestion && (
                                <div className="mt-2 flex items-start gap-1 text-xs text-primary">
                                  <Lightbulb className="w-3 h-3 mt-0.5 shrink-0" />
                                  <span>{error.suggestion}</span>
                                </div>
                              )}
                              {onRequestFix && (
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  className="mt-2 h-6 text-xs gap-1"
                                  onClick={() => handleFixRequest(`${error.type} error: ${error.message}`)}
                                  data-testid={`button-fix-code-${i}`}
                                >
                                  <Wrench className="w-3 h-3" />
                                  Fix This
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Learning Status */}
                <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2 mb-1">
                    <BookOpen className="w-4 h-4" />
                    <span className="font-medium">Live Learning Active</span>
                  </div>
                  <p>I'm watching your code changes and learning from how you fix errors. The more you code, the smarter I get!</p>
                </div>
              </div>
            </ScrollArea>
          </div>
        ) : (
          <div className="flex-1 flex overflow-hidden">
            <div className="w-40 border-r border-border bg-muted/30 overflow-y-auto">
              <div className="p-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">Files</div>
              <ScrollArea className="h-full">
                {fileTree.map((node) => (
                  <FileTreeNode
                    key={node.path}
                    node={node}
                    activeFile={activeFile}
                    onSelectFile={setActiveFile}
                  />
                ))}
              </ScrollArea>
            </div>
            <div className="flex-1 overflow-hidden flex flex-col">
              <div className="flex items-center justify-between px-3 py-1.5 border-b border-border bg-background">
                <span className="text-xs font-mono text-muted-foreground truncate">{activeFile}</span>
                <Badge variant="outline" className="text-xs shrink-0">{activeFileContent?.language}</Badge>
              </div>
              <ScrollArea className="flex-1">
                <pre className="p-3 text-xs font-mono leading-relaxed">
                  <code className="whitespace-pre">{activeFileContent?.content}</code>
                </pre>
              </ScrollArea>
            </div>
          </div>
        )}

        <div className="w-40 border-l border-border bg-muted/30 overflow-hidden flex flex-col">
          <div className="p-2 text-xs font-medium text-muted-foreground uppercase tracking-wider border-b border-border">
            Architecture
          </div>
          <ScrollArea className="flex-1">
            <div className="p-1">
              {fileTree.map((node) => (
                <FileTreeNode
                  key={node.path}
                  node={node}
                  activeFile={activeFile}
                  onSelectFile={(path) => {
                    setActiveFile(path);
                    setActiveTab("code");
                  }}
                />
              ))}
            </div>
          </ScrollArea>
          <div className="p-2 border-t border-border text-xs text-muted-foreground">
            {files.length} file{files.length !== 1 ? "s" : ""}
          </div>
        </div>
      </div>
    </div>
  );
}
