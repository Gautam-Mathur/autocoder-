import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Plus, MessageSquare, Trash2, MoreHorizontal, Terminal, Cpu, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import { ChatMessage } from "@/components/chat-message";
import { ChatInput } from "@/components/chat-input";
import { EmptyState } from "@/components/empty-state";
import { ThemeToggle } from "@/components/theme-toggle";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { generateCode } from "@/lib/code-generator";
import type { Conversation, Message } from "@shared/schema";

interface ConversationWithMessages extends Conversation {
  messages: Message[];
}

// Extract and update project context from user messages and AI responses
async function updateProjectContextFromResponse(conversationId: number, userMessage: string, aiResponse: string) {
  try {
    // First fetch current conversation to get existing context
    const convRes = await fetch(`/api/conversations/${conversationId}`);
    const currentConv = convRes.ok ? await convRes.json() : null;
    
    const context: Record<string, unknown> = {};
    
    // Extract project name from user message (only if not already set)
    if (!currentConv?.projectName) {
      const namePatterns = [
        /(?:building|create|making|develop)\s+(?:a\s+)?(?:an?\s+)?["']?([A-Z][a-zA-Z0-9\s]+?)["']?\s+(?:app|website|dashboard|platform|tool|system)/i,
        /["']([A-Z][a-zA-Z0-9]+)["']\s+(?:is\s+(?:a|an)|will\s+be)/i,
        /(?:called|named)\s+["']?([A-Z][a-zA-Z0-9]+)["']?/i,
      ];
      
      for (const pattern of namePatterns) {
        const match = userMessage.match(pattern);
        if (match && match[1]) {
          context.projectName = match[1].trim();
          break;
        }
      }
    }
    
    // Extract tech stack from AI response
    const techKeywords = ['HTML', 'CSS', 'JavaScript', 'React', 'TypeScript'];
    const foundTech = techKeywords.filter(tech => 
      aiResponse.toLowerCase().includes(tech.toLowerCase())
    );
    if (foundTech.length > 0) {
      const existingTech = currentConv?.techStack || [];
      const combined = [...existingTech, ...foundTech];
      const uniqueTech = combined.filter((t, i) => combined.indexOf(t) === i);
      if (uniqueTech.length > existingTech.length) {
        context.techStack = uniqueTech;
      }
    }
    
    // Extract features from code
    const featurePatterns = [
      { pattern: /<nav|navigation|navbar/i, feature: 'Navigation' },
      { pattern: /<form|contact.*form/i, feature: 'Forms' },
      { pattern: /dashboard|admin.*panel/i, feature: 'Dashboard' },
      { pattern: /hero.*section|landing/i, feature: 'Hero Section' },
      { pattern: /settings|preferences/i, feature: 'Settings Panel' },
    ];
    
    const existingFeatures = currentConv?.featuresBuilt || [];
    const features = [...existingFeatures];
    for (const { pattern, feature } of featurePatterns) {
      if (pattern.test(aiResponse) && !features.includes(feature)) {
        features.push(feature);
      }
    }
    if (features.length > existingFeatures.length) {
      context.featuresBuilt = features;
    }
    
    // Only update if we found something new
    if (Object.keys(context).length > 0) {
      const res = await apiRequest("PUT", `/api/conversations/${conversationId}/context`, context);
      const updatedConv = await res.json();
      
      // Directly update the cache with the updated conversation
      queryClient.setQueryData<ConversationWithMessages>(
        ["/api/conversations", conversationId],
        (old) => {
          if (!old) return old;
          return {
            ...old,
            projectName: updatedConv.projectName,
            projectDescription: updatedConv.projectDescription,
            techStack: updatedConv.techStack,
            featuresBuilt: updatedConv.featuresBuilt,
            projectSummary: updatedConv.projectSummary,
          };
        }
      );
      
      // Also refresh the conversations list
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
    }
  } catch (error) {
    console.error("Error updating project context:", error);
  }
}

export default function Chat() {
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
  const [streamingContent, setStreamingContent] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [aiMode, setAiMode] = useState<"cloud" | "local">("cloud");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check AI mode on mount
  useEffect(() => {
    fetch("/api/health")
      .then(res => res.json())
      .then(data => {
        setAiMode(data.aiMode || "local");
      })
      .catch(() => setAiMode("local"));
  }, []);

  const { data: conversations = [] } = useQuery<Conversation[]>({
    queryKey: ["/api/conversations"],
  });

  const { data: activeConversation } = useQuery<ConversationWithMessages>({
    queryKey: ["/api/conversations", activeConversationId],
    enabled: !!activeConversationId,
  });

  const createConversationMutation = useMutation({
    mutationFn: async (title: string) => {
      const res = await apiRequest("POST", "/api/conversations", { title });
      return res.json();
    },
    onSuccess: (data: Conversation) => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      setActiveConversationId(data.id);
    },
  });

  const deleteConversationMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/conversations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      if (activeConversationId === deleteConversationMutation.variables) {
        setActiveConversationId(null);
      }
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeConversation?.messages, streamingContent]);

  const handleSendMessage = async (content: string) => {
    if (!activeConversationId) {
      const res = await apiRequest("POST", "/api/conversations", { title: content.slice(0, 50) });
      const newConversation = await res.json();
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      setActiveConversationId(newConversation.id);
      
      setTimeout(() => sendMessageToConversation(newConversation.id, content), 100);
      return;
    }

    sendMessageToConversation(activeConversationId, content);
  };

  const sendMessageToConversation = async (conversationId: number, content: string) => {
    setIsStreaming(true);
    setStreamingContent("");

    queryClient.setQueryData<ConversationWithMessages>(
      ["/api/conversations", conversationId],
      (old) => {
        if (!old) return old;
        return {
          ...old,
          messages: [
            ...old.messages,
            {
              id: Date.now(),
              conversationId,
              role: "user",
              content,
              createdAt: new Date(),
            },
          ],
        };
      }
    );

    try {
      const response = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) throw new Error("Failed to send message");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        const lines = text.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              
              // Check if server wants us to use local engine
              if (data.useLocalEngine) {
                setAiMode("local");
                // Generate response using local template engine
                const localResponse = generateCode(data.userMessage);
                
                // Simulate streaming for smooth UX
                for (let i = 0; i < localResponse.length; i += 5) {
                  await new Promise(resolve => setTimeout(resolve, 5));
                  setStreamingContent(localResponse.slice(0, i + 5));
                }
                
                // Add response to local cache (server stores user messages only in local mode)
                queryClient.setQueryData<ConversationWithMessages>(
                  ["/api/conversations", conversationId],
                  (old) => {
                    if (!old) return old;
                    return {
                      ...old,
                      messages: [
                        ...old.messages,
                        {
                          id: Date.now() + 1,
                          conversationId,
                          role: "assistant",
                          content: localResponse,
                          createdAt: new Date(),
                        },
                      ],
                    };
                  }
                );
                
                // Update project context for local engine too
                await updateProjectContextFromResponse(conversationId, data.userMessage, localResponse);
                
                setIsStreaming(false);
                setStreamingContent("");
                return;
              }
              
              if (data.content) {
                fullContent += data.content;
                setStreamingContent(fullContent);
              }
              if (data.done) {
                setIsStreaming(false);
                setStreamingContent("");
                queryClient.invalidateQueries({ queryKey: ["/api/conversations", conversationId] });
              }
            } catch {
            }
          }
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
      
      // Fallback to local engine on any error
      const localResponse = generateCode(content);
      setStreamingContent(localResponse);
      setAiMode("local");
      
      // Update project context for fallback too
      await updateProjectContextFromResponse(conversationId, content, localResponse);
      
      setTimeout(() => {
        setIsStreaming(false);
        setStreamingContent("");
        queryClient.invalidateQueries({ queryKey: ["/api/conversations", conversationId] });
      }, 500);
    }
  };

  const handleNewChat = () => {
    setActiveConversationId(null);
    setStreamingContent("");
    setIsStreaming(false);
    // Clear any cached conversation data to ensure fresh start
    queryClient.removeQueries({ queryKey: ["/api/conversations", null] });
  };

  const handleSelectConversation = (id: number) => {
    setActiveConversationId(id);
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return d.toLocaleDateString();
  };

  const messages = activeConversation?.messages || [];
  const displayMessages = [...messages];
  if (isStreaming && streamingContent) {
    displayMessages.push({
      id: -1,
      conversationId: activeConversationId || 0,
      role: "assistant",
      content: streamingContent,
      createdAt: new Date(),
    });
  }

  const sidebarStyle = {
    "--sidebar-width": "18rem",
    "--sidebar-width-icon": "3rem",
  } as React.CSSProperties;

  return (
    <SidebarProvider style={sidebarStyle}>
      <div className="flex h-screen w-full bg-background">
        <Sidebar>
          <SidebarHeader className="p-3 border-b border-sidebar-border">
            <Button
              onClick={handleNewChat}
              disabled={createConversationMutation.isPending}
              className="w-full justify-start gap-2"
              variant="default"
              data-testid="button-new-chat"
            >
              <Plus className="h-4 w-4" />
              New Chat
            </Button>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {conversations.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm px-3" data-testid="text-no-conversations">
                      No conversations yet
                    </div>
                  ) : (
                    conversations.map((conversation) => (
                      <SidebarMenuItem key={conversation.id} className="group">
                        <SidebarMenuButton
                          onClick={() => handleSelectConversation(conversation.id)}
                          isActive={activeConversationId === conversation.id}
                          className="w-full"
                          data-testid={`conversation-item-${conversation.id}`}
                        >
                          <MessageSquare className="h-4 w-4 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <div className="text-sm truncate">{conversation.title}</div>
                            <div className="text-xs text-muted-foreground">
                              {formatDate(conversation.createdAt)}
                            </div>
                          </div>
                        </SidebarMenuButton>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-sidebar-accent"
                              onClick={(e) => e.stopPropagation()}
                              data-testid={`button-conversation-menu-${conversation.id}`}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteConversationMutation.mutate(conversation.id);
                              }}
                              data-testid={`button-delete-conversation-${conversation.id}`}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </SidebarMenuItem>
                    ))
                  )}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="p-3 border-t border-sidebar-border">
            <div className="flex items-center gap-2 text-xs text-muted-foreground" data-testid="text-ai-status">
              {aiMode === "cloud" ? (
                <>
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span>Cloud AI Active</span>
                </>
              ) : (
                <>
                  <Cpu className="w-3 h-3 text-primary" />
                  <span>Local Engine Active</span>
                </>
              )}
            </div>
          </SidebarFooter>
        </Sidebar>

        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 border-b border-border bg-background flex items-center justify-between px-4 gap-4 flex-shrink-0">
            <div className="flex items-center gap-3">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <Link href="/">
                <div className="flex items-center gap-2 cursor-pointer" data-testid="link-home">
                  <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                    <Terminal className="h-3.5 w-3.5 text-primary-foreground" />
                  </div>
                  <span className="font-semibold hidden sm:inline">CodeAI</span>
                </div>
              </Link>
              {activeConversation?.projectName && (
                <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground border-l border-border pl-3" data-testid="project-context-indicator">
                  <Layers className="w-3.5 h-3.5 text-primary" />
                  <span className="font-medium text-foreground">{activeConversation.projectName}</span>
                  {activeConversation.featuresBuilt && activeConversation.featuresBuilt.length > 0 && (
                    <Badge variant="secondary" className="text-xs" data-testid="badge-features-count">
                      {activeConversation.featuresBuilt.length} features
                    </Badge>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
            </div>
          </header>

          <div className="flex-1 overflow-hidden flex flex-col">
            {!activeConversationId && messages.length === 0 ? (
              <EmptyState onSuggestionClick={handleSendMessage} />
            ) : (
              <ScrollArea className="flex-1">
                <div className="max-w-3xl mx-auto p-4 space-y-4">
                  {displayMessages.map((message, index) => (
                    <ChatMessage
                      key={message.id}
                      role={message.role as "user" | "assistant"}
                      content={message.content}
                      isStreaming={isStreaming && index === displayMessages.length - 1 && message.role === "assistant"}
                    />
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            )}

            <div className="p-4 border-t border-border bg-background flex-shrink-0">
              <div className="max-w-3xl mx-auto">
                <ChatInput
                  onSend={handleSendMessage}
                  isLoading={isStreaming}
                  placeholder={activeConversationId ? "Continue the conversation..." : "Ask me anything about coding..."}
                />
                <p className="text-xs text-center text-muted-foreground mt-2" data-testid="text-disclaimer">
                  {aiMode === "cloud" 
                    ? "Cloud AI powered by GPT-4o. No API keys needed."
                    : "Local Code Engine - generates code from templates. No API required."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
