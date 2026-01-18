import { Code2, Sparkles, Zap, Shield, Globe, Terminal, Cpu } from "lucide-react";

const features = [
  {
    icon: Code2,
    title: "Code Generation",
    description: "Generate HTML, CSS, JavaScript, and React code instantly",
  },
  {
    icon: Zap,
    title: "No Setup Required",
    description: "Works immediately - no API keys, no downloads needed",
  },
  {
    icon: Globe,
    title: "Web Development",
    description: "Landing pages, forms, components, and more",
  },
  {
    icon: Cpu,
    title: "Local Engine",
    description: "Built-in code templates that work anywhere",
  },
];

const suggestions = [
  "Create a landing page with hero section",
  "Make a contact form with validation",
  "React component with useState",
  "CSS flexbox layout",
  "JavaScript fetch API example",
  "Todo app with add and delete",
];

interface EmptyStateProps {
  onSuggestionClick: (suggestion: string) => void;
}

export function EmptyState({ onSuggestionClick }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center max-w-3xl mx-auto">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
        <Terminal className="h-8 w-8 text-primary" />
      </div>
      
      <h1 className="text-2xl font-semibold mb-2">
        Welcome to CodeAI
      </h1>
      <p className="text-muted-foreground mb-8 max-w-md">
        AI-powered coding assistant with built-in code generation. Ask for any web code and get working solutions instantly.
      </p>

      <div className="grid grid-cols-2 gap-3 mb-8 w-full max-w-xl">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="flex items-start gap-3 p-4 rounded-lg bg-card border border-card-border text-left"
          >
            <div className="flex-shrink-0 w-8 h-8 rounded-md bg-accent flex items-center justify-center">
              <feature.icon className="h-4 w-4 text-accent-foreground" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium">{feature.title}</div>
              <div className="text-xs text-muted-foreground">{feature.description}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="w-full max-w-xl">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Try these prompts</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => onSuggestionClick(suggestion)}
              className="w-full p-3 text-left text-sm rounded-lg border border-border bg-background hover-elevate active-elevate-2 transition-colors"
              data-testid={`button-suggestion-${index}`}
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
