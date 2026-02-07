import { User, Terminal, Check, RefreshCw } from "lucide-react";
import { parseCodeBlocks } from "@/components/code-block";
import { ProjectSummary, parseProjectSummary, ProjectFileWithContent } from "@/components/project-summary";
import { ThinkingSteps, type ThinkingStep } from "@/components/thinking-steps";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
  generatedFiles?: ProjectFileWithContent[];
  thinkingSteps?: ThinkingStep[];
  showApproval?: boolean;
  onSendMessage?: (message: string) => void;
}

export function ChatMessage({ role, content, isStreaming, generatedFiles, thinkingSteps, showApproval, onSendMessage }: ChatMessageProps) {
  const isUser = role === "user";

  const showApprovalButtons = !!showApproval && !isStreaming;

  const renderAssistantContent = () => {
    const { hasProject, projectInfo, remainingContent } = parseProjectSummary(content);
    
    if (hasProject && projectInfo && !isStreaming) {
      const filesToUse = generatedFiles && generatedFiles.length > 0 
        ? generatedFiles 
        : createDemoFiles();

      return (
        <div className="space-y-3">
          <ProjectSummary
            projectName={projectInfo.name}
            blueprintType={projectInfo.type}
            totalFiles={projectInfo.totalFiles}
            files={filesToUse}
          />
          {remainingContent && parseCodeBlocks(remainingContent)}
        </div>
      );
    }
    
    return (
      <div className="space-y-3">
        {parseCodeBlocks(content)}
        {isStreaming && (
          <span className="inline-block w-1.5 h-4 bg-primary animate-pulse rounded-sm" data-testid="streaming-indicator" />
        )}
        {showApprovalButtons && onSendMessage && (
          <div className="flex items-center gap-2 pt-3 border-t border-border/50 mt-3">
            <Button
              onClick={() => onSendMessage("approve")}
              className="gap-2"
              data-testid="button-approve-plan"
            >
              <Check className="h-4 w-4" />
              Approve & Generate
            </Button>
            <Button
              variant="outline"
              onClick={() => onSendMessage("I'd like to make some changes to the plan")}
              className="gap-2"
              data-testid="button-modify-plan"
            >
              <RefreshCw className="h-4 w-4" />
              Request Changes
            </Button>
          </div>
        )}
      </div>
    );
  };

function createDemoFiles(): ProjectFileWithContent[] {
  return [
    {
      path: '/App.tsx',
      content: `import { useState } from 'react';

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl text-white text-center">
        <h1 className="text-4xl font-bold mb-4">Your App is Running!</h1>
        <p className="text-lg mb-6 opacity-80">This is a live preview of your generated project.</p>
        <div className="space-y-4">
          <div className="text-6xl font-bold">{count}</div>
          <button 
            onClick={() => setCount(c => c + 1)}
            className="px-6 py-3 bg-white text-purple-600 font-semibold rounded-xl hover:bg-opacity-90 transition-all transform hover:scale-105"
          >
            Click to increment
          </button>
        </div>
      </div>
    </div>
  );
}`
    }
  ];
}

  return (
    <div
      className={cn(
        "flex gap-3 py-3",
        isUser ? "justify-end" : "justify-start"
      )}
      data-testid={`message-${role}`}
    >
      {!isUser && (
        <div
          className="flex-shrink-0 w-7 h-7 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center glow-sm"
          data-testid="avatar-assistant"
        >
          <Terminal className="h-3.5 w-3.5 text-primary" />
        </div>
      )}
      
      <div className={cn(
        "flex-1 min-w-0 max-w-[90%]",
        isUser && "flex flex-col items-end"
      )}>
        <div className={cn(
          "text-[10px] font-medium text-muted-foreground mb-1 uppercase tracking-widest",
          isUser ? "text-right" : "text-left"
        )}>
          {isUser ? "YOU" : "AUTOCODER"}
        </div>
        
        <div className={cn(
          "prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed",
          isUser && "text-right"
        )}>
          {isUser ? (
            <div className="inline-block bg-primary/15 border border-primary/20 text-foreground px-3 py-2 rounded-md rounded-br-sm text-left">
              {content}
            </div>
          ) : (
            <div className="bg-card/50 border border-border/50 rounded-md p-3">
              {thinkingSteps && thinkingSteps.length > 0 && (
                <ThinkingSteps
                  steps={thinkingSteps}
                  isActive={isStreaming && !content}
                />
              )}
              {renderAssistantContent()}
            </div>
          )}
        </div>
      </div>

      {isUser && (
        <div
          className="flex-shrink-0 w-7 h-7 rounded-md bg-primary text-primary-foreground flex items-center justify-center"
          data-testid="avatar-user"
        >
          <User className="h-3.5 w-3.5" />
        </div>
      )}
    </div>
  );
}
