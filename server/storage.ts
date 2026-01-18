import type { Conversation, Message, InsertConversation, InsertMessage } from "@shared/schema";

export interface ProjectContext {
  projectName?: string | null;
  projectDescription?: string | null;
  techStack?: string[] | null;
  featuresBuilt?: string[] | null;
  projectSummary?: string | null;
  lastCodeGenerated?: string | null;
}

export interface IStorage {
  getConversation(id: number): Promise<Conversation | undefined>;
  getAllConversations(): Promise<Conversation[]>;
  createConversation(title: string): Promise<Conversation>;
  deleteConversation(id: number): Promise<void>;
  updateProjectContext(id: number, context: ProjectContext): Promise<Conversation | undefined>;
  getMessagesByConversation(conversationId: number): Promise<Message[]>;
  createMessage(conversationId: number, role: string, content: string): Promise<Message>;
}

export class MemStorage implements IStorage {
  private conversations: Map<number, Conversation>;
  private messages: Map<number, Message>;
  private conversationIdCounter: number;
  private messageIdCounter: number;

  constructor() {
    this.conversations = new Map();
    this.messages = new Map();
    this.conversationIdCounter = 1;
    this.messageIdCounter = 1;
  }

  async getConversation(id: number): Promise<Conversation | undefined> {
    return this.conversations.get(id);
  }

  async getAllConversations(): Promise<Conversation[]> {
    return Array.from(this.conversations.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async createConversation(title: string): Promise<Conversation> {
    const id = this.conversationIdCounter++;
    const conversation: Conversation = {
      id,
      title,
      createdAt: new Date(),
      projectName: null,
      projectDescription: null,
      techStack: null,
      featuresBuilt: null,
      projectSummary: null,
      lastCodeGenerated: null,
    };
    this.conversations.set(id, conversation);
    return conversation;
  }

  async updateProjectContext(id: number, context: ProjectContext): Promise<Conversation | undefined> {
    const conversation = this.conversations.get(id);
    if (!conversation) return undefined;
    
    const updated: Conversation = {
      ...conversation,
      projectName: context.projectName ?? conversation.projectName,
      projectDescription: context.projectDescription ?? conversation.projectDescription,
      techStack: context.techStack ?? conversation.techStack,
      featuresBuilt: context.featuresBuilt ?? conversation.featuresBuilt,
      projectSummary: context.projectSummary ?? conversation.projectSummary,
      lastCodeGenerated: context.lastCodeGenerated ?? conversation.lastCodeGenerated,
    };
    
    this.conversations.set(id, updated);
    return updated;
  }

  async deleteConversation(id: number): Promise<void> {
    this.conversations.delete(id);
    for (const [msgId, msg] of this.messages) {
      if (msg.conversationId === id) {
        this.messages.delete(msgId);
      }
    }
  }

  async getMessagesByConversation(conversationId: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter((m) => m.conversationId === conversationId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  async createMessage(conversationId: number, role: string, content: string): Promise<Message> {
    const id = this.messageIdCounter++;
    const message: Message = {
      id,
      conversationId,
      role,
      content,
      createdAt: new Date(),
    };
    this.messages.set(id, message);
    return message;
  }
}

export const storage = new MemStorage();
