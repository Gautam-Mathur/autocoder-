import { 
  type Conversation, type Message, type InsertConversation, type InsertMessage, 
  type ProjectFile, type InsertProjectFile, 
  type ProjectPlan, type InsertProjectPlan,
  type IntelRecord, type InsertIntelRecord,
  type TestResult, type InsertTestResult,
  type SecurityScan, type InsertSecurityScan,
  type GenerationLog, type InsertGenerationLog,
  conversations, messages, projectFiles, projectPlans, intelRecords, testResults, securityScans, generationLogs 
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface ProjectContext {
  projectName?: string | null;
  projectDescription?: string | null;
  techStack?: string[] | null;
  featuresBuilt?: string[] | null;
  projectSummary?: string | null;
  lastCodeGenerated?: string | null;
  projectType?: string | null;
  complexity?: string | null;
  designStyle?: string | null;
  colorPreferences?: string[] | null;
  planGenerated?: boolean | null;
  securityScore?: number | null;
  testsPassed?: number | null;
  testsFailed?: number | null;
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
  
  // Project plans
  getProjectPlan(conversationId: number): Promise<ProjectPlan | undefined>;
  createProjectPlan(plan: InsertProjectPlan): Promise<ProjectPlan>;
  
  // Intel records
  getIntelRecords(conversationId: number): Promise<IntelRecord[]>;
  createIntelRecord(record: InsertIntelRecord): Promise<IntelRecord>;
  upsertIntelRecord(conversationId: number, key: string, category: string, value: string, type: string): Promise<IntelRecord>;
  
  // Test results
  getTestResults(conversationId: number): Promise<TestResult[]>;
  createTestResult(result: InsertTestResult): Promise<TestResult>;
  
  // Security scans
  getSecurityScans(conversationId: number): Promise<SecurityScan[]>;
  createSecurityScan(scan: InsertSecurityScan): Promise<SecurityScan>;
  getLatestSecurityScan(conversationId: number): Promise<SecurityScan | undefined>;
  
  // Generation logs
  getGenerationLogs(conversationId: number): Promise<GenerationLog[]>;
  createGenerationLog(log: InsertGenerationLog): Promise<GenerationLog>;
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
      .where(and(eq(projectFiles.conversationId, conversationId), eq(projectFiles.path, path)))
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

  // Project plans
  async getProjectPlan(conversationId: number): Promise<ProjectPlan | undefined> {
    const [plan] = await db.select().from(projectPlans)
      .where(eq(projectPlans.conversationId, conversationId))
      .orderBy(desc(projectPlans.createdAt))
      .limit(1);
    return plan;
  }

  async createProjectPlan(plan: InsertProjectPlan): Promise<ProjectPlan> {
    const [created] = await db.insert(projectPlans).values(plan).returning();
    return created;
  }

  // Intel records
  async getIntelRecords(conversationId: number): Promise<IntelRecord[]> {
    return await db.select().from(intelRecords)
      .where(eq(intelRecords.conversationId, conversationId))
      .orderBy(desc(intelRecords.createdAt));
  }

  async createIntelRecord(record: InsertIntelRecord): Promise<IntelRecord> {
    const [created] = await db.insert(intelRecords).values(record).returning();
    return created;
  }

  async upsertIntelRecord(conversationId: number, key: string, category: string, value: string, type: string): Promise<IntelRecord> {
    const existing = await db.select().from(intelRecords)
      .where(and(
        eq(intelRecords.conversationId, conversationId),
        eq(intelRecords.key, key),
        eq(intelRecords.category, category)
      ))
      .limit(1);

    if (existing.length > 0) {
      const [updated] = await db.update(intelRecords)
        .set({ value, usageCount: (existing[0].usageCount || 0) + 1 })
        .where(eq(intelRecords.id, existing[0].id))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(intelRecords)
        .values({ conversationId, key, category, value, type })
        .returning();
      return created;
    }
  }

  // Test results
  async getTestResults(conversationId: number): Promise<TestResult[]> {
    return await db.select().from(testResults)
      .where(eq(testResults.conversationId, conversationId))
      .orderBy(desc(testResults.createdAt));
  }

  async createTestResult(result: InsertTestResult): Promise<TestResult> {
    const [created] = await db.insert(testResults).values(result).returning();
    return created;
  }

  // Security scans
  async getSecurityScans(conversationId: number): Promise<SecurityScan[]> {
    return await db.select().from(securityScans)
      .where(eq(securityScans.conversationId, conversationId))
      .orderBy(desc(securityScans.createdAt));
  }

  async createSecurityScan(scan: InsertSecurityScan): Promise<SecurityScan> {
    const [created] = await db.insert(securityScans).values(scan).returning();
    return created;
  }

  async getLatestSecurityScan(conversationId: number): Promise<SecurityScan | undefined> {
    const [scan] = await db.select().from(securityScans)
      .where(eq(securityScans.conversationId, conversationId))
      .orderBy(desc(securityScans.createdAt))
      .limit(1);
    return scan;
  }

  // Generation logs
  async getGenerationLogs(conversationId: number): Promise<GenerationLog[]> {
    return await db.select().from(generationLogs)
      .where(eq(generationLogs.conversationId, conversationId))
      .orderBy(desc(generationLogs.createdAt));
  }

  async createGenerationLog(log: InsertGenerationLog): Promise<GenerationLog> {
    const [created] = await db.insert(generationLogs).values(log).returning();
    return created;
  }
}

export const storage = new DatabaseStorage();
