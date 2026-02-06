import { useState } from "react";
import { ChevronDown, Brain, Search, Layers, Code, ShieldCheck, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ThinkingStep {
  phase: 'understanding' | 'analyzing' | 'planning' | 'generating' | 'validating';
  label: string;
  detail: string;
  timestamp?: number;
}

const phaseConfig: Record<string, { icon: typeof Brain; color: string; label: string }> = {
  understanding: { icon: Brain, color: 'text-blue-400', label: 'Understanding' },
  analyzing: { icon: Search, color: 'text-cyan-400', label: 'Analyzing' },
  planning: { icon: Layers, color: 'text-teal-400', label: 'Planning' },
  generating: { icon: Code, color: 'text-emerald-400', label: 'Generating' },
  validating: { icon: ShieldCheck, color: 'text-green-400', label: 'Validating' },
};

interface ThinkingStepsProps {
  steps: ThinkingStep[];
  isActive?: boolean;
}

export function ThinkingSteps({ steps, isActive }: ThinkingStepsProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (steps.length === 0 && !isActive) return null;

  const currentPhase = steps.length > 0
    ? phaseConfig[steps[steps.length - 1].phase]
    : phaseConfig.understanding;

  return (
    <div className="mb-2" data-testid="thinking-steps">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "flex items-center gap-2 w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-colors hover-elevate",
          isActive
            ? "bg-primary/5 border border-primary/15"
            : "bg-muted/30 border border-border/30"
        )}
        data-testid="button-toggle-thinking"
      >
        <Sparkles className={cn(
          "h-3 w-3 flex-shrink-0",
          isActive ? "text-primary animate-pulse" : "text-muted-foreground"
        )} />
        <span className={cn(
          "font-medium flex-1",
          isActive ? "text-primary" : "text-muted-foreground"
        )}>
          {isActive
            ? (steps.length > 0 ? steps[steps.length - 1].label : 'Thinking...')
            : `Reasoning (${steps.length} steps)`
          }
        </span>
        <ChevronDown className={cn(
          "h-3 w-3 text-muted-foreground transition-transform",
          isExpanded && "rotate-180"
        )} />
      </button>

      {isExpanded && steps.length > 0 && (
        <div className="mt-1.5 ml-1 border-l border-border/40 pl-3 space-y-0.5" data-testid="thinking-steps-list">
          {steps.map((step, i) => {
            const config = phaseConfig[step.phase] || phaseConfig.understanding;
            const Icon = config.icon;
            const isLast = i === steps.length - 1;

            return (
              <div
                key={i}
                className={cn(
                  "flex items-start gap-2 py-1 text-xs transition-opacity",
                  isLast && isActive ? "opacity-100" : "opacity-70"
                )}
                data-testid={`thinking-step-${i}`}
              >
                <Icon className={cn(
                  "h-3 w-3 mt-0.5 flex-shrink-0",
                  config.color,
                  isLast && isActive && "animate-pulse"
                )} />
                <div className="min-w-0 flex-1">
                  <span className={cn("font-medium", config.color)}>
                    {step.label}
                  </span>
                  {step.detail && (
                    <p className="text-muted-foreground/70 text-[10px] mt-0.5 leading-snug truncate">
                      {step.detail}
                    </p>
                  )}
                </div>
              </div>
            );
          })}

          {isActive && (
            <div className="flex items-center gap-2 py-1 text-xs">
              <div className="flex gap-0.5">
                <span className="w-1 h-1 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1 h-1 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1 h-1 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
