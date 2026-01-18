import { Bot, User } from "lucide-react";
import { parseCodeBlocks } from "@/components/code-block";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

export function ChatMessage({ role, content, isStreaming }: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <div
      className={cn(
        "flex gap-4 p-4 rounded-lg max-w-[85%]",
        isUser 
          ? "bg-primary/10 ml-auto flex-row-reverse" 
          : "bg-card border border-card-border mr-auto"
      )}
      data-testid={`message-${role}`}
    >
      <div
        className={cn(
          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
          isUser ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground"
        )}
        data-testid={`avatar-${role}`}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>
      <div className="flex-1 min-w-0 overflow-hidden">
        <div className={cn(
          "text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide",
          isUser && "text-right"
        )}>
          {isUser ? "You" : "CodeAI"}
        </div>
        <div className="text-sm leading-relaxed">
          {parseCodeBlocks(content)}
          {isStreaming && (
            <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-1" data-testid="streaming-indicator" />
          )}
        </div>
      </div>
    </div>
  );
}
