import { Sparkles, Terminal, Wand2, Lightbulb, Heart } from "lucide-react";

const suggestions = [
  { text: "Build me a personal portfolio website", emoji: "🎨", hint: "Show off your work beautifully" },
  { text: "Create an online store for my products", emoji: "🛒", hint: "Sell things online with ease" },
  { text: "Make a booking system for appointments", emoji: "📅", hint: "Let people schedule meetings" },
  { text: "Build a recipe collection app", emoji: "🍳", hint: "Save and organize recipes" },
  { text: "Create a task manager to stay organized", emoji: "✅", hint: "Track your to-dos" },
  { text: "Design a blog where I can share stories", emoji: "📝", hint: "Write and publish articles" },
];

interface EmptyStateProps {
  onSuggestionClick: (suggestion: string) => void;
}

export function EmptyState({ onSuggestionClick }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-6">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div className="space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto shadow-lg">
            <Wand2 className="h-8 w-8 text-primary" />
          </div>
          
          <h1 className="text-3xl font-semibold tracking-tight">
            Hi! I'm your AI app builder 👋
          </h1>
          
          <p className="text-muted-foreground text-lg max-w-lg mx-auto leading-relaxed">
            Just tell me what you want to create in plain English, and I'll build it for you. 
            <span className="block mt-2 text-base">No coding experience needed!</span>
          </p>
        </div>
        
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 max-w-md mx-auto">
          <div className="flex items-start gap-3">
            <Lightbulb className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div className="text-left text-sm text-muted-foreground">
              <strong className="text-foreground">Tip:</strong> The more details you give me, the better I can build! 
              For example: <em>"Build me a recipe app where I can save my favorite dishes with photos and ingredients"</em>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>Click any idea below to get started</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => onSuggestionClick(suggestion.text)}
                className="px-4 py-3 text-left rounded-xl border border-border bg-card hover-elevate active-elevate-2 transition-all duration-200 group"
                data-testid={`button-suggestion-${index}`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl">{suggestion.emoji}</span>
                  <div>
                    <div className="text-sm font-medium group-hover:text-primary transition-colors">{suggestion.text}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{suggestion.hint}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-4">
          <Heart className="h-3 w-3 text-red-400" />
          <span>Made to help anyone build apps, even without coding skills</span>
        </div>
      </div>
    </div>
  );
}
