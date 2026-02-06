import { Sparkles, Terminal, Code2, ShoppingCart, CalendarDays, CookingPot, ListTodo, BookOpen, Zap, Activity } from "lucide-react";

const suggestions = [
  { text: "Build me a personal portfolio website", icon: Code2, hint: "Show off your work beautifully" },
  { text: "Create an online store for my products", icon: ShoppingCart, hint: "Sell things online with ease" },
  { text: "Make a booking system for appointments", icon: CalendarDays, hint: "Let people schedule meetings" },
  { text: "Build a recipe collection app", icon: CookingPot, hint: "Save and organize recipes" },
  { text: "Create a task manager to stay organized", icon: ListTodo, hint: "Track your to-dos" },
  { text: "Design a blog where I can share stories", icon: BookOpen, hint: "Write and publish articles" },
];

interface EmptyStateProps {
  onSuggestionClick: (suggestion: string) => void;
}

export function EmptyState({ onSuggestionClick }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-full p-6 py-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsl(var(--primary)/0.04)_0%,_transparent_70%)] pointer-events-none" />

      <div className="max-w-xl w-full text-center space-y-6 relative z-10">
        <div className="space-y-4">
          <div className="w-14 h-14 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto glow-sm">
            <Terminal className="h-7 w-7 text-primary" />
          </div>
          
          <h1 className="text-2xl font-semibold tracking-tight">
            What would you like to build?
          </h1>
          
          <p className="text-muted-foreground text-sm max-w-md mx-auto leading-relaxed">
            Describe your app in plain English. No coding experience needed.
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Sparkles className="h-3 w-3 text-primary" />
            <span>Quick start ideas</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => onSuggestionClick(suggestion.text)}
                className="px-3 py-2.5 text-left rounded-md border border-border bg-card hover-elevate active-elevate-2 transition-all duration-200 group"
                data-testid={`button-suggestion-${index}`}
              >
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <suggestion.icon className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-medium group-hover:text-primary transition-colors leading-snug">{suggestion.text}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{suggestion.hint}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex items-center justify-center gap-3 text-[10px] text-muted-foreground pt-2">
          <div className="flex items-center gap-1.5">
            <Activity className="h-3 w-3 text-primary" />
            <span>SYSTEM READY</span>
          </div>
          <span className="text-border">|</span>
          <div className="flex items-center gap-1.5">
            <Zap className="h-3 w-3 text-primary" />
            <span>ALL MODULES ONLINE</span>
          </div>
        </div>
      </div>
    </div>
  );
}
