import type { Conversation, Message, InsertConversation, InsertMessage, ProjectFile, InsertProjectFile } from "@shared/schema";

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
  
  // Project files
  getProjectFiles(conversationId: number): Promise<ProjectFile[]>;
  getProjectFile(id: number): Promise<ProjectFile | undefined>;
  createProjectFile(file: InsertProjectFile): Promise<ProjectFile>;
  updateProjectFile(id: number, content: string): Promise<ProjectFile | undefined>;
  deleteProjectFile(id: number): Promise<void>;
  upsertProjectFile(conversationId: number, path: string, content: string, language: string): Promise<ProjectFile>;
}

export class MemStorage implements IStorage {
  private conversations: Map<number, Conversation>;
  private messages: Map<number, Message>;
  private projectFiles: Map<number, ProjectFile>;
  private conversationIdCounter: number;
  private messageIdCounter: number;
  private fileIdCounter: number;

  constructor() {
    this.conversations = new Map();
    this.messages = new Map();
    this.projectFiles = new Map();
    this.conversationIdCounter = 1;
    this.messageIdCounter = 1;
    this.fileIdCounter = 1;
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
    for (const [fileId, file] of this.projectFiles) {
      if (file.conversationId === id) {
        this.projectFiles.delete(fileId);
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

  async getProjectFiles(conversationId: number): Promise<ProjectFile[]> {
    return Array.from(this.projectFiles.values())
      .filter((f) => f.conversationId === conversationId)
      .sort((a, b) => a.path.localeCompare(b.path));
  }

  async getProjectFile(id: number): Promise<ProjectFile | undefined> {
    return this.projectFiles.get(id);
  }

  async createProjectFile(file: InsertProjectFile): Promise<ProjectFile> {
    const id = this.fileIdCounter++;
    const now = new Date();
    const projectFile: ProjectFile = {
      id,
      conversationId: file.conversationId,
      path: file.path,
      content: file.content,
      language: file.language,
      createdAt: now,
      updatedAt: now,
    };
    this.projectFiles.set(id, projectFile);
    return projectFile;
  }

  async updateProjectFile(id: number, content: string): Promise<ProjectFile | undefined> {
    const file = this.projectFiles.get(id);
    if (!file) return undefined;
    const updated: ProjectFile = {
      ...file,
      content,
      updatedAt: new Date(),
    };
    this.projectFiles.set(id, updated);
    return updated;
  }

  async deleteProjectFile(id: number): Promise<void> {
    this.projectFiles.delete(id);
  }

  async upsertProjectFile(conversationId: number, path: string, content: string, language: string): Promise<ProjectFile> {
    // Find existing file with same path in this conversation
    const existing = Array.from(this.projectFiles.values()).find(
      (f) => f.conversationId === conversationId && f.path === path
    );
    
    if (existing) {
      return this.updateProjectFile(existing.id, content) as Promise<ProjectFile>;
    }
    
    return this.createProjectFile({ conversationId, path, content, language });
  }
}

export const storage = new MemStorage();
