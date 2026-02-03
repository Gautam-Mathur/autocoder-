import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  AlertCircle, 
  Wrench, 
  CheckCircle2, 
  Copy, 
  ChevronDown, 
  ChevronUp,
  Zap,
  FileWarning,
  Lightbulb
} from "lucide-react";
import { 
  analyzeError, 
  categorizeError, 
  extractLineFromError,
  FixSuggestion,
  CodeError
} from "@/lib/code-runner/error-fixer";

interface ErrorFixerPanelProps {
  errors: string[];
  code: string;
  onApplyFix?: (fixedCode: string) => void;
}

export function ErrorFixerPanel({ errors, code, onApplyFix }: ErrorFixerPanelProps) {
  const [expandedError, setExpandedError] = useState<number | null>(0);
  const [appliedFixes, setAppliedFixes] = useState<Set<number>>(new Set());

  if (errors.length === 0) {
    return (
      <Card className="border-green-500/30 bg-green-500/5">
        <CardContent className="flex items-center gap-3 py-4">
          <CheckCircle2 className="h-5 w-5 text-green-500" />
          <div>
            <p className="font-medium text-green-600 dark:text-green-400">No Errors Detected</p>
            <p className="text-sm text-muted-foreground">Your code is running smoothly</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const parsedErrors: (CodeError & { suggestions: FixSuggestion[] })[] = errors.map(err => ({
    type: categorizeError(err),
    message: err,
    line: extractLineFromError(err),
    suggestions: analyzeError(err, code),
  }));

  const handleApplyFix = (errorIndex: number, suggestion: FixSuggestion) => {
    onApplyFix?.(suggestion.code);
    setAppliedFixes(prev => new Set([...Array.from(prev), errorIndex]));
  };

  const getErrorIcon = (type: CodeError["type"]) => {
    switch (type) {
      case "syntax":
        return <FileWarning className="h-4 w-4" />;
      case "reference":
        return <AlertCircle className="h-4 w-4" />;
      case "type":
        return <Zap className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getConfidenceBadge = (confidence: FixSuggestion["confidence"]) => {
    switch (confidence) {
      case "high":
        return <Badge className="bg-green-600 text-xs">High Confidence</Badge>;
      case "medium":
        return <Badge className="bg-yellow-600 text-xs">Medium</Badge>;
      case "low":
        return <Badge variant="secondary" className="text-xs">Low</Badge>;
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-destructive">
        <AlertCircle className="h-5 w-5" />
        <span className="font-medium">{errors.length} Error{errors.length > 1 ? "s" : ""} Detected</span>
      </div>

      <ScrollArea className="max-h-[400px]">
        <div className="space-y-2">
          {parsedErrors.map((error, index) => (
            <Card 
              key={index} 
              className={
                appliedFixes.has(index) 
                  ? "bg-green-500/5 border-green-500/30" 
                  : "border-destructive/30"
              }
            >
              <CardHeader 
                className="py-3 px-4 cursor-pointer"
                onClick={() => setExpandedError(expandedError === index ? null : index)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={appliedFixes.has(index) ? "text-green-500" : "text-destructive"}>
                      {appliedFixes.has(index) ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        getErrorIcon(error.type)
                      )}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {error.type}
                    </Badge>
                    {error.line && (
                      <span className="text-xs text-muted-foreground">
                        Line {error.line}
                      </span>
                    )}
                  </div>
                  {expandedError === index ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <CardDescription className="text-sm mt-1 text-left line-clamp-2">
                  {error.message}
                </CardDescription>
              </CardHeader>

              {expandedError === index && (
                <CardContent className="pt-0 px-4 pb-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Lightbulb className="h-4 w-4 text-yellow-500" />
                    Suggested Fixes
                  </div>

                  {error.suggestions.map((suggestion, sugIndex) => (
                    <Card key={sugIndex} className="bg-muted/50">
                      <CardContent className="py-3 px-4">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <Wrench className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-sm font-medium">{suggestion.description}</span>
                          </div>
                          {getConfidenceBadge(suggestion.confidence)}
                        </div>
                        
                        <p className="text-xs text-muted-foreground mb-3">
                          {suggestion.explanation}
                        </p>

                        {suggestion.code !== code && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="default"
                              className="gap-1"
                              onClick={() => handleApplyFix(index, suggestion)}
                              disabled={appliedFixes.has(index)}
                              data-testid={`button-apply-fix-${index}-${sugIndex}`}
                            >
                              {appliedFixes.has(index) ? (
                                <>
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                  Applied
                                </>
                              ) : (
                                <>
                                  <Zap className="h-3.5 w-3.5" />
                                  Apply Fix
                                </>
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1"
                              onClick={() => navigator.clipboard.writeText(suggestion.code)}
                              data-testid={`button-copy-fix-${index}-${sugIndex}`}
                            >
                              <Copy className="h-3.5 w-3.5" />
                              Copy
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
