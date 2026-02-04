import { Bot, User } from "lucide-react";
import { parseCodeBlocks } from "@/components/code-block";
import { ProjectSummary, parseProjectSummary } from "@/components/project-summary";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

export function ChatMessage({ role, content, isStreaming }: ChatMessageProps) {
  const isUser = role === "user";

  const renderAssistantContent = () => {
    const { hasProject, projectInfo, remainingContent } = parseProjectSummary(content);
    
    if (hasProject && projectInfo && !isStreaming) {
      const sampleFiles = [
        { path: 'client/src/components/layout/Layout.tsx' },
        { path: 'client/src/components/layout/Header.tsx' },
        { path: 'client/src/components/layout/Sidebar.tsx' },
        { path: 'client/src/components/layout/Footer.tsx' },
        { path: 'client/src/components/ui/Button.tsx' },
        { path: 'client/src/components/ui/Card.tsx' },
        { path: 'client/src/components/ui/Input.tsx' },
        { path: 'client/src/components/ui/Label.tsx' },
        { path: 'client/src/pages/Dashboard.tsx' },
        { path: 'client/src/pages/Settings.tsx' },
        { path: 'server/routes/api.ts' },
        { path: 'server/controllers/auth.ts' },
      ];

      return (
        <div className="space-y-4">
          <ProjectSummary
            projectName={projectInfo.name}
            blueprintType={projectInfo.type}
            totalFiles={projectInfo.totalFiles}
            files={sampleFiles}
            features={[]}
          />
          {remainingContent && parseCodeBlocks(remainingContent)}
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        {parseCodeBlocks(content)}
        {isStreaming && (
          <span className="inline-block w-2 h-5 bg-primary animate-pulse rounded-sm" data-testid="streaming-indicator" />
        )}
      </div>
    );
  };

  return (
    <div
      className={cn(
        "flex gap-4 py-6",
        isUser ? "justify-end" : "justify-start"
      )}
      data-testid={`message-${role}`}
    >
      {!isUser && (
        <div
          className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center"
          data-testid="avatar-assistant"
        >
          <Bot className="h-4 w-4 text-primary" />
        </div>
      )}
      
      <div className={cn(
        "flex-1 min-w-0 max-w-[85%]",
        isUser && "flex flex-col items-end"
      )}>
        <div className={cn(
          "text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider",
          isUser ? "text-right" : "text-left"
        )}>
          {isUser ? "You" : "CodeAI"}
        </div>
        
        <div className={cn(
          "prose prose-sm dark:prose-invert max-w-none",
          "leading-relaxed",
          isUser && "text-right"
        )}>
          {isUser ? (
            <div className="inline-block bg-primary text-primary-foreground px-4 py-2.5 rounded-2xl rounded-br-md">
              {content}
            </div>
          ) : (
            renderAssistantContent()
          )}
        </div>
      </div>

      {isUser && (
        <div
          className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center"
          data-testid="avatar-user"
        >
          <User className="h-4 w-4" />
        </div>
      )}
    </div>
  );
}
