import { Bot, User } from "lucide-react";
import { parseCodeBlocks } from "@/components/code-block";
import { ProjectSummary, parseProjectSummary, ProjectFileWithContent } from "@/components/project-summary";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
  generatedFiles?: ProjectFileWithContent[];
}

export function ChatMessage({ role, content, isStreaming, generatedFiles }: ChatMessageProps) {
  const isUser = role === "user";

  const renderAssistantContent = () => {
    const { hasProject, projectInfo, remainingContent } = parseProjectSummary(content);
    
    if (hasProject && projectInfo && !isStreaming) {
      const filesToUse = generatedFiles && generatedFiles.length > 0 
        ? generatedFiles 
        : createDemoFiles();

      return (
        <div className="space-y-4">
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
      <div className="space-y-4">
        {parseCodeBlocks(content)}
        {isStreaming && (
          <span className="inline-block w-2 h-5 bg-primary animate-pulse rounded-sm" data-testid="streaming-indicator" />
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
