import { type Conversation, type Message, type InsertConversation, type InsertMessage, type ProjectFile, type InsertProjectFile, conversations, messages, projectFiles } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

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

export class DatabaseStorage implements IStorage {
  async getConversation(id: number): Promise<Conversation | undefined> {
    const [conversation] = await db.select().from(conversations).where(eq(conversations.id, id));
    return conversation;
  }

  async getAllConversations(): Promise<Conversation[]> {
    return await db.select().from(conversations).orderBy(desc(conversations.createdAt));
  }

  async createConversation(title: string): Promise<Conversation> {
    const [conversation] = await db.insert(conversations).values({ title }).returning();
    return conversation;
  }

  async updateProjectContext(id: number, context: ProjectContext): Promise<Conversation | undefined> {
    const [updated] = await db.update(conversations)
      .set(context)
      .where(eq(conversations.id, id))
      .returning();
    return updated;
  }

  async deleteConversation(id: number): Promise<void> {
    await db.delete(conversations).where(eq(conversations.id, id));
  }

  async getMessagesByConversation(conversationId: number): Promise<Message[]> {
    return await db.select().from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.createdAt);
  }

  async createMessage(conversationId: number, role: string, content: string): Promise<Message> {
    const [message] = await db.insert(messages)
      .values({ conversationId, role, content })
      .returning();
    return message;
  }

  async getProjectFiles(conversationId: number): Promise<ProjectFile[]> {
    return await db.select().from(projectFiles)
      .where(eq(projectFiles.conversationId, conversationId))
      .orderBy(projectFiles.path);
  }

  async getProjectFile(id: number): Promise<ProjectFile | undefined> {
    const [file] = await db.select().from(projectFiles).where(eq(projectFiles.id, id));
    return file;
  }

  async createProjectFile(file: InsertProjectFile): Promise<ProjectFile> {
    const [projectFile] = await db.insert(projectFiles).values(file).returning();
    return projectFile;
  }

  async updateProjectFile(id: number, content: string): Promise<ProjectFile | undefined> {
    const [updated] = await db.update(projectFiles)
      .set({ content, updatedAt: new Date() })
      .where(eq(projectFiles.id, id))
      .returning();
    return updated;
  }

  async deleteProjectFile(id: number): Promise<void> {
    await db.delete(projectFiles).where(eq(projectFiles.id, id));
  }

  async upsertProjectFile(conversationId: number, path: string, content: string, language: string): Promise<ProjectFile> {
    const existing = await db.select().from(projectFiles)
      .where(eq(projectFiles.conversationId, conversationId))
      .where(eq(projectFiles.path, path)) // Assuming path + conversationId is unique enough for now, or we filter in memory first but SQL is better.
      // Drizzle ORM doesn't support .where(and(...)) with multiple .where calls? It does.
      // But let's be safe.
      .limit(1);

    if (existing.length > 0) {
      const [updated] = await db.update(projectFiles)
        .set({ content, updatedAt: new Date() })
        .where(eq(projectFiles.id, existing[0].id))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(projectFiles)
        .values({ conversationId, path, content, language })
        .returning();
      return created;
    }
  }
}

export const storage = new DatabaseStorage();
