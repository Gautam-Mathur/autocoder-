import { useState, useMemo } from "react";
import { Eye, EyeOff, Maximize2, Minimize2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CodePreviewProps {
  code: string;
  language: string;
}

export function CodePreview({ code, language }: CodePreviewProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Only show preview for HTML
  const canPreview = language === "html" || language === "htm";
  
  // Use srcdoc for secure sandboxed rendering
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
