import { Sparkles, Terminal } from "lucide-react";

const suggestions = [
  "Create a beautiful landing page",
  "Build a contact form with validation",
  "Make a responsive navigation bar",
  "Design a modern pricing table",
  "Create a dark mode toggle",
  "Build a todo app with local storage",
];

interface EmptyStateProps {
  onSuggestionClick: (suggestion: string) => void;
}

export function EmptyState({ onSuggestionClick }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-6">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div className="space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
            <Terminal className="h-7 w-7 text-primary" />
          </div>
          
          <h1 className="text-3xl font-semibold tracking-tight">
            How can I help you code today?
          </h1>
          
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Describe what you want to build and I'll generate production-ready code for you.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4" />
            <span>Try one of these</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => onSuggestionClick(suggestion)}
                className="px-4 py-3 text-left text-sm rounded-xl border border-border bg-card hover-elevate active-elevate-2 transition-all duration-200"
                data-testid={`button-suggestion-${index}`}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
