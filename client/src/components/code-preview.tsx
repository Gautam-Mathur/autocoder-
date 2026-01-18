import { useState, useMemo } from "react";
import { Eye, EyeOff, Maximize2, Minimize2, ExternalLink, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CodePreviewProps {
  code: string;
  language: string;
}

interface CombinedPreviewProps {
  html: string;
  css: string;
  javascript: string;
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
