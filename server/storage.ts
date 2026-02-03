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

// In-memory storage for running without a database
export class MemStorage implements IStorage {
  private conversations: Map<number, Conversation> = new Map();
  private messages: Map<number, Message[]> = new Map();
  private files: Map<number, ProjectFile[]> = new Map();
  private plans: Map<number, ProjectPlan> = new Map();
  private intel: Map<number, IntelRecord[]> = new Map();
  private tests: Map<number, TestResult[]> = new Map();
  private scans: Map<number, SecurityScan[]> = new Map();
  private logs: Map<number, GenerationLog[]> = new Map();
  private nextId = 1;

  async getConversation(id: number): Promise<Conversation | undefined> {
    return this.conversations.get(id);
  }

  async getAllConversations(): Promise<Conversation[]> {
    return Array.from(this.conversations.values()).sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async createConversation(title: string): Promise<Conversation> {
    const id = this.nextId++;
    const conversation: Conversation = { 
      id, title, createdAt: new Date(), 
      projectName: null, projectDescription: null, techStack: null, featuresBuilt: null,
      projectSummary: null, lastCodeGenerated: null, projectType: null, complexity: null,
      designStyle: null, colorPreferences: null, planGenerated: null, securityScore: null,
      testsPassed: null, testsFailed: null
    };
    this.conversations.set(id, conversation);
    this.messages.set(id, []);
    return conversation;
  }

  async updateProjectContext(id: number, context: ProjectContext): Promise<Conversation | undefined> {
    const conv = this.conversations.get(id);
    if (conv) {
      const updated = { ...conv, ...context };
      this.conversations.set(id, updated);
      return updated;
    }
    return undefined;
  }

  async deleteConversation(id: number): Promise<void> {
    this.conversations.delete(id);
    this.messages.delete(id);
    this.files.delete(id);
  }

  async getMessagesByConversation(conversationId: number): Promise<Message[]> {
    return this.messages.get(conversationId) || [];
  }

  async createMessage(conversationId: number, role: string, content: string): Promise<Message> {
    const id = this.nextId++;
    const message: Message = { id, conversationId, role, content, createdAt: new Date() };
    const msgs = this.messages.get(conversationId) || [];
    msgs.push(message);
    this.messages.set(conversationId, msgs);
    return message;
  }

  async getProjectFiles(conversationId: number): Promise<ProjectFile[]> {
    return this.files.get(conversationId) || [];
  }

  async getProjectFile(id: number): Promise<ProjectFile | undefined> {
    for (const files of Array.from(this.files.values())) {
      const file = files.find((f: ProjectFile) => f.id === id);
      if (file) return file;
    }
    return undefined;
  }

  async createProjectFile(file: InsertProjectFile): Promise<ProjectFile> {
    const id = this.nextId++;
    const projectFile: ProjectFile = { 
      id, 
      conversationId: file.conversationId, 
      path: file.path, 
      content: file.content, 
      language: file.language,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const files = this.files.get(file.conversationId) || [];
    files.push(projectFile);
    this.files.set(file.conversationId, files);
    return projectFile;
  }

  async updateProjectFile(id: number, content: string): Promise<ProjectFile | undefined> {
    for (const [convId, files] of Array.from(this.files.entries())) {
      const idx = files.findIndex((f: ProjectFile) => f.id === id);
      if (idx >= 0) {
        files[idx] = { ...files[idx], content, updatedAt: new Date() };
        return files[idx];
      }
    }
    return undefined;
  }

  async deleteProjectFile(id: number): Promise<void> {
    for (const [convId, files] of Array.from(this.files.entries())) {
      const idx = files.findIndex((f: ProjectFile) => f.id === id);
      if (idx >= 0) {
        files.splice(idx, 1);
        return;
      }
    }
  }

  async upsertProjectFile(conversationId: number, path: string, content: string, language: string): Promise<ProjectFile> {
    const files = this.files.get(conversationId) || [];
    const existing = files.find(f => f.path === path);
    if (existing) {
      existing.content = content;
      existing.updatedAt = new Date();
      return existing;
    }
    return this.createProjectFile({ conversationId, path, content, language });
  }

  async getProjectPlan(conversationId: number): Promise<ProjectPlan | undefined> {
    return this.plans.get(conversationId);
  }

  async createProjectPlan(plan: InsertProjectPlan): Promise<ProjectPlan> {
    const id = this.nextId++;
    const projectPlan: ProjectPlan = { 
      id, 
      conversationId: plan.conversationId,
      summary: plan.summary,
      techStack: plan.techStack || null,
      architecture: plan.architecture || null,
      folderStructure: plan.folderStructure || null,
      designDecisions: plan.designDecisions || null,
      securityConsiderations: plan.securityConsiderations || null,
      createdAt: new Date()
    };
    this.plans.set(plan.conversationId, projectPlan);
    return projectPlan;
  }

  async getIntelRecords(conversationId: number): Promise<IntelRecord[]> {
    return this.intel.get(conversationId) || [];
  }

  async createIntelRecord(record: InsertIntelRecord): Promise<IntelRecord> {
    const id = this.nextId++;
    const intelRecord: IntelRecord = { 
      id, 
      conversationId: record.conversationId,
      key: record.key,
      value: record.value,
      category: record.category,
      type: record.type,
      confidence: record.confidence ?? 100,
      source: record.source ?? 'inferred',
      usageCount: 1,
      createdAt: new Date()
    };
    const records = this.intel.get(record.conversationId) || [];
    records.push(intelRecord);
    this.intel.set(record.conversationId, records);
    return intelRecord;
  }

  async upsertIntelRecord(conversationId: number, key: string, category: string, value: string, type: string): Promise<IntelRecord> {
    const records = this.intel.get(conversationId) || [];
    const existing = records.find(r => r.key === key && r.category === category);
    if (existing) {
      existing.value = value;
      existing.usageCount = (existing.usageCount || 0) + 1;
      return existing;
    }
    return this.createIntelRecord({ conversationId, key, value, category, type });
  }

  async getTestResults(conversationId: number): Promise<TestResult[]> {
    return this.tests.get(conversationId) || [];
  }

  async createTestResult(result: InsertTestResult): Promise<TestResult> {
    const id = this.nextId++;
    const testResult: TestResult = { 
      id, 
      conversationId: result.conversationId,
      targetFile: result.targetFile,
      passed: result.passed ?? 0,
      failed: result.failed ?? 0,
      skipped: result.skipped ?? 0,
      coverage: result.coverage ?? null,
      details: result.details || null,
      createdAt: new Date()
    };
    const results = this.tests.get(result.conversationId) || [];
    results.push(testResult);
    this.tests.set(result.conversationId, results);
    return testResult;
  }

  async getSecurityScans(conversationId: number): Promise<SecurityScan[]> {
    return this.scans.get(conversationId) || [];
  }

  async createSecurityScan(scan: InsertSecurityScan): Promise<SecurityScan> {
    const id = this.nextId++;
    const securityScan: SecurityScan = { 
      id, 
      conversationId: scan.conversationId,
      score: scan.score,
      grade: scan.grade,
      issues: scan.issues || null,
      passedChecks: scan.passedChecks || null,
      createdAt: new Date()
    };
    const scans = this.scans.get(scan.conversationId) || [];
    scans.push(securityScan);
    this.scans.set(scan.conversationId, scans);
    return securityScan;
  }

  async getLatestSecurityScan(conversationId: number): Promise<SecurityScan | undefined> {
    const scans = this.scans.get(conversationId) || [];
    return scans[scans.length - 1];
  }

  async getGenerationLogs(conversationId: number): Promise<GenerationLog[]> {
    return this.logs.get(conversationId) || [];
  }

  async createGenerationLog(log: InsertGenerationLog): Promise<GenerationLog> {
    const id = this.nextId++;
    const generationLog: GenerationLog = { 
      id, 
      conversationId: log.conversationId,
      action: log.action,
      targetFile: log.targetFile,
      description: log.description,
      linesChanged: log.linesChanged ?? 0,
      reasoning: log.reasoning || null,
      assumptions: log.assumptions || null,
      createdAt: new Date()
    };
    const logs = this.logs.get(log.conversationId) || [];
    logs.push(generationLog);
    this.logs.set(log.conversationId, logs);
    return generationLog;
  }
}

export class DatabaseStorage implements IStorage {
  private db: any;
  
  constructor() {
    // Lazy load db to avoid errors when DATABASE_URL is not set
    import("./db").then(module => {
      this.db = module.db;
    });
  }

  private async getDb() {
    if (!this.db) {
      const module = await import("./db");
      this.db = module.db;
    }
    return this.db;
  }

  async getConversation(id: number): Promise<Conversation | undefined> {
    const db = await this.getDb();
    const [conversation] = await db.select().from(conversations).where(eq(conversations.id, id));
    return conversation;
  }

  async getAllConversations(): Promise<Conversation[]> {
    const db = await this.getDb();
    return await db.select().from(conversations).orderBy(desc(conversations.createdAt));
  }

  async createConversation(title: string): Promise<Conversation> {
    const db = await this.getDb();
    const [conversation] = await db.insert(conversations).values({ title }).returning();
    return conversation;
  }

  async updateProjectContext(id: number, context: ProjectContext): Promise<Conversation | undefined> {
    const db = await this.getDb();
    const [updated] = await db.update(conversations)
      .set(context)
      .where(eq(conversations.id, id))
      .returning();
    return updated;
  }

  async deleteConversation(id: number): Promise<void> {
    const db = await this.getDb();
    await db.delete(conversations).where(eq(conversations.id, id));
  }

  async getMessagesByConversation(conversationId: number): Promise<Message[]> {
    const db = await this.getDb();
    return await db.select().from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.createdAt);
  }

  async createMessage(conversationId: number, role: string, content: string): Promise<Message> {
    const db = await this.getDb();
    const [message] = await db.insert(messages)
      .values({ conversationId, role, content })
      .returning();
    return message;
  }

  async getProjectFiles(conversationId: number): Promise<ProjectFile[]> {
    const db = await this.getDb();
    return await db.select().from(projectFiles)
      .where(eq(projectFiles.conversationId, conversationId))
      .orderBy(projectFiles.path);
  }

  async getProjectFile(id: number): Promise<ProjectFile | undefined> {
    const db = await this.getDb();
    const [file] = await db.select().from(projectFiles).where(eq(projectFiles.id, id));
    return file;
  }

  async createProjectFile(file: InsertProjectFile): Promise<ProjectFile> {
    const db = await this.getDb();
    const [projectFile] = await db.insert(projectFiles).values(file).returning();
    return projectFile;
  }

  async updateProjectFile(id: number, content: string): Promise<ProjectFile | undefined> {
    const db = await this.getDb();
    const [updated] = await db.update(projectFiles)
      .set({ content, updatedAt: new Date() })
      .where(eq(projectFiles.id, id))
      .returning();
    return updated;
  }

  async deleteProjectFile(id: number): Promise<void> {
    const db = await this.getDb();
    await db.delete(projectFiles).where(eq(projectFiles.id, id));
  }

  async upsertProjectFile(conversationId: number, path: string, content: string, language: string): Promise<ProjectFile> {
    const db = await this.getDb();
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
    const db = await this.getDb();
    const [plan] = await db.select().from(projectPlans)
      .where(eq(projectPlans.conversationId, conversationId))
      .orderBy(desc(projectPlans.createdAt))
      .limit(1);
    return plan;
  }

  async createProjectPlan(plan: InsertProjectPlan): Promise<ProjectPlan> {
    const db = await this.getDb();
    const [created] = await db.insert(projectPlans).values(plan).returning();
    return created;
  }

  // Intel records
  async getIntelRecords(conversationId: number): Promise<IntelRecord[]> {
    const db = await this.getDb();
    return await db.select().from(intelRecords)
      .where(eq(intelRecords.conversationId, conversationId))
      .orderBy(desc(intelRecords.createdAt));
  }

  async createIntelRecord(record: InsertIntelRecord): Promise<IntelRecord> {
    const db = await this.getDb();
    const [created] = await db.insert(intelRecords).values(record).returning();
    return created;
  }

  async upsertIntelRecord(conversationId: number, key: string, category: string, value: string, type: string): Promise<IntelRecord> {
    const db = await this.getDb();
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
    const db = await this.getDb();
    return await db.select().from(testResults)
      .where(eq(testResults.conversationId, conversationId))
      .orderBy(desc(testResults.createdAt));
  }

  async createTestResult(result: InsertTestResult): Promise<TestResult> {
    const db = await this.getDb();
    const [created] = await db.insert(testResults).values(result).returning();
    return created;
  }

  // Security scans
  async getSecurityScans(conversationId: number): Promise<SecurityScan[]> {
    const db = await this.getDb();
    return await db.select().from(securityScans)
      .where(eq(securityScans.conversationId, conversationId))
      .orderBy(desc(securityScans.createdAt));
  }

  async createSecurityScan(scan: InsertSecurityScan): Promise<SecurityScan> {
    const db = await this.getDb();
    const [created] = await db.insert(securityScans).values(scan).returning();
    return created;
  }

  async getLatestSecurityScan(conversationId: number): Promise<SecurityScan | undefined> {
    const db = await this.getDb();
    const [scan] = await db.select().from(securityScans)
      .where(eq(securityScans.conversationId, conversationId))
      .orderBy(desc(securityScans.createdAt))
      .limit(1);
    return scan;
  }

  // Generation logs
  async getGenerationLogs(conversationId: number): Promise<GenerationLog[]> {
    const db = await this.getDb();
    return await db.select().from(generationLogs)
      .where(eq(generationLogs.conversationId, conversationId))
      .orderBy(desc(generationLogs.createdAt));
  }

  async createGenerationLog(log: InsertGenerationLog): Promise<GenerationLog> {
    const db = await this.getDb();
    const [created] = await db.insert(generationLogs).values(log).returning();
    return created;
  }
}

// Use in-memory storage if no DATABASE_URL, otherwise use database
export const storage: IStorage = process.env.DATABASE_URL 
  ? new DatabaseStorage() 
  : new MemStorage();

console.log(`Storage mode: ${process.env.DATABASE_URL ? 'PostgreSQL Database' : 'In-Memory (no database required)'}`);
