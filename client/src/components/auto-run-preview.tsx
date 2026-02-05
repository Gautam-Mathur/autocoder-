import { useState, useCallback, useEffect, useRef } from "react";
import { Play, Square, RefreshCw, Loader2, CheckCircle2, AlertCircle, Package, Server, Folder } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  autoRunProject, 
  isRunnableProject, 
  estimateInstallTime,
  type RunnerState,
  type RunnerStatus,
  type AutoRunOptions
} from "@/lib/code-runner/auto-runner";
import { teardown, isWebContainerSupported } from "@/lib/code-runner/webcontainer";

interface ProjectFile {
  path: string;
  content: string;
  language?: string;
}

interface AutoRunPreviewProps {
  files: ProjectFile[];
  projectName?: string;
  height?: string;
  autoStart?: boolean;
}

const statusConfig: Record<RunnerStatus, { 
  label: string; 
  icon: typeof Loader2; 
  color: string;
  description: string;
}> = {
  idle: { 
    label: 'Ready', 
    icon: Play, 
    color: 'bg-muted text-muted-foreground',
    description: 'Click Run to start the project'
  },
  generating: { 
    label: 'Analyzing', 
    icon: Loader2, 
    color: 'bg-blue-500/20 text-blue-400',
    description: 'Analyzing project structure...'
  },
  mounting: { 
    label: 'Setting Up', 
    icon: Folder, 
    color: 'bg-blue-500/20 text-blue-400',
    description: 'Mounting project files...'
  },
  installing: { 
    label: 'Installing', 
    icon: Package, 
    color: 'bg-amber-500/20 text-amber-400',
    description: 'Running npm install...'
  },
  starting: { 
    label: 'Starting', 
    icon: Server, 
    color: 'bg-purple-500/20 text-purple-400',
    description: 'Starting dev server...'
  },
  running: { 
    label: 'Running', 
    icon: CheckCircle2, 
    color: 'bg-green-500/20 text-green-400',
    description: 'Application is live!'
  },
  error: { 
    label: 'Error', 
    icon: AlertCircle, 
    color: 'bg-red-500/20 text-red-400',
    description: 'An error occurred'
  }
};

export function AutoRunPreview({ 
  files, 
  projectName = "Generated Project",
  height = "500px",
  autoStart = false
}: AutoRunPreviewProps) {
  const [state, setState] = useState<RunnerState>({
    status: 'idle',
    progress: 0,
    message: '',
    logs: [],
    previewUrl: null,
    error: null
  });
  const [showLogs, setShowLogs] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const hasAutoStarted = useRef(false);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const isRunnable = isRunnableProject(files);
  const isSupported = isWebContainerSupported();
  const estimatedTime = estimateInstallTime(files);

  const runProject = useCallback(async (options: AutoRunOptions = {}) => {
    if (!isSupported) {
      setState(s => ({ 
        ...s, 
        status: 'error', 
        error: 'WebContainer not supported. Use Chrome or Edge.' 
      }));
      return;
    }

    setState({
      status: 'generating',
      progress: 0,
      message: 'Starting...',
      logs: options.skipInstallOnFailure ? ['Attempting to run with incomplete dependencies...'] : [],
      previewUrl: null,
      error: null
    });
    setShowLogs(true);

    await autoRunProject(files, projectName, {
      onStatusChange: (newState) => setState(newState),
      onLog: (log) => setState(s => ({ ...s, logs: [...s.logs, log] })),
      onPreviewReady: (url) => setState(s => ({ ...s, previewUrl: url })),
      onError: (error) => setState(s => ({ ...s, error }))
    }, options);
  }, [files, projectName, isSupported]);
  
  const runAnyway = useCallback(() => {
    runProject({ skipInstallOnFailure: true });
  }, [runProject]);

  const stopProject = useCallback(async () => {
    await teardown();
    setState({
      status: 'idle',
      progress: 0,
      message: '',
      logs: [],
      previewUrl: null,
      error: null
    });
  }, []);

  const refreshPreview = useCallback(() => {
    setRefreshKey(k => k + 1);
  }, []);

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [state.logs]);

  useEffect(() => {
    if (autoStart && isRunnable && isSupported && !hasAutoStarted.current && state.status === 'idle') {
      hasAutoStarted.current = true;
      runProject();
    }
  }, [autoStart, isRunnable, isSupported, state.status, runProject]);

  const config = statusConfig[state.status];
  const StatusIcon = config.icon;
  const isLoading = ['generating', 'mounting', 'installing', 'starting'].includes(state.status);

  if (!isRunnable) {
    return (
      <div 
        className="flex-1 overflow-hidden bg-slate-900 flex flex-col items-center justify-center p-8"
        style={{ height }}
        data-testid="auto-run-preview"
      >
        <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Not a Runnable Project</h3>
        <p className="text-sm text-muted-foreground text-center max-w-md">
          This project doesn't have an entry point (index.html, main.jsx, server.js, etc.)
        </p>
      </div>
    );
  }

  if (!isSupported) {
    return (
      <div 
        className="flex-1 overflow-hidden bg-slate-900 flex flex-col items-center justify-center p-8"
        style={{ height }}
        data-testid="auto-run-preview"
      >
        <AlertCircle className="w-12 h-12 text-amber-500 mb-4" />
        <h3 className="text-lg font-semibold mb-2">Browser Not Supported</h3>
        <p className="text-sm text-muted-foreground text-center max-w-md">
          WebContainer requires SharedArrayBuffer. Please use Chrome or Edge with proper headers.
        </p>
      </div>
    );
  }

  return (
    <div 
      className="flex-1 overflow-hidden bg-slate-900 flex flex-col"
      style={{ height }}
      data-testid="auto-run-preview"
    >
      <div className="flex items-center justify-between p-2 border-b border-slate-700 bg-slate-800/50">
        <div className="flex items-center gap-2">
          <Badge className={`${config.color} gap-1`}>
            <StatusIcon className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
            {config.label}
          </Badge>
          {state.status === 'running' && (
            <span className="text-xs text-muted-foreground">{state.previewUrl}</span>
          )}
          {isLoading && (
            <span className="text-xs text-muted-foreground">{state.message}</span>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          {state.status === 'idle' && (
            <Button
              size="sm"
              onClick={() => runProject()}
              className="gap-1"
              data-testid="button-run-project"
            >
              <Play className="w-3 h-3" />
              Run (~{estimatedTime}s)
            </Button>
          )}
          
          {state.status === 'running' && (
            <>
              <Button
                size="sm"
                variant="ghost"
                onClick={refreshPreview}
                data-testid="button-refresh-preview"
              >
                <RefreshCw className="w-3 h-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={stopProject}
                data-testid="button-stop-project"
              >
                <Square className="w-3 h-3" />
              </Button>
            </>
          )}
          
          {isLoading && (
            <Button
              size="sm"
              variant="ghost"
              onClick={stopProject}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
          )}
          
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowLogs(!showLogs)}
            className={showLogs ? 'bg-slate-700' : ''}
            data-testid="button-toggle-logs"
          >
            Logs
          </Button>
        </div>
      </div>

      {state.progress > 0 && state.progress < 100 && (
        <div className="h-1 bg-slate-800">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
            style={{ width: `${state.progress}%` }}
          />
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        {state.status === 'running' && state.previewUrl ? (
          <iframe
            key={refreshKey}
            src={state.previewUrl}
            className={`bg-white ${showLogs ? 'w-2/3' : 'w-full'}`}
            style={{ border: 'none', height: '100%' }}
            title="Live Preview"
            data-testid="preview-iframe"
          />
        ) : state.status === 'error' ? (
          <div className={`flex flex-col items-center justify-center p-8 ${showLogs ? 'w-2/3' : 'w-full'}`}>
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error</h3>
            <p className="text-sm text-red-400 text-center max-w-md">{state.error}</p>
            <div className="flex gap-2 mt-4">
              <Button
                size="sm"
                variant="outline"
                onClick={() => runProject()}
                className="gap-1"
                data-testid="button-retry"
              >
                <RefreshCw className="w-3 h-3" />
                Retry
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={runAnyway}
                className="gap-1"
                data-testid="button-run-anyway"
              >
                <Play className="w-3 h-3" />
                Run Anyway
              </Button>
            </div>
          </div>
        ) : state.status === 'idle' ? (
          <div className={`flex flex-col items-center justify-center p-8 ${showLogs ? 'w-2/3' : 'w-full'}`}>
            <Play className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Ready to Run</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md mb-4">
              This project has {files.length} files and is ready to run.
              <br />
              Estimated time: ~{estimatedTime} seconds
            </p>
            <Button
              onClick={() => runProject()}
              className="gap-2"
              data-testid="button-start-project"
            >
              <Play className="w-4 h-4" />
              npm install && npm run dev
            </Button>
          </div>
        ) : (
          <div className={`flex flex-col items-center justify-center p-8 ${showLogs ? 'w-2/3' : 'w-full'}`}>
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
            <h3 className="text-lg font-semibold mb-2">{config.description}</h3>
            <p className="text-sm text-muted-foreground text-center">
              {state.message}
            </p>
          </div>
        )}

        {showLogs && (
          <ScrollArea className="w-1/3 border-l border-slate-700 bg-black/50">
            <div className="p-2 font-mono text-xs">
              {state.logs.length === 0 ? (
                <div className="text-muted-foreground">No logs yet...</div>
              ) : (
                state.logs.map((log, i) => (
                  <div 
                    key={i} 
                    className={`whitespace-pre-wrap ${
                      log.includes('✓') || log.includes('✅') ? 'text-green-400' :
                      log.includes('❌') || log.includes('Error') ? 'text-red-400' :
                      log.includes('⚠️') ? 'text-amber-400' :
                      log.includes('🚀') || log.includes('🎉') ? 'text-purple-400' :
                      'text-slate-400'
                    }`}
                  >
                    {log}
                  </div>
                ))
              )}
              <div ref={logsEndRef} />
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
}
