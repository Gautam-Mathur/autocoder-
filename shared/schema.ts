import { sql } from "drizzle-orm";
import { pgTable, text, varchar, serial, integer, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  // Project context for persistent memory
  projectName: text("project_name"),
  projectDescription: text("project_description"),
  techStack: text("tech_stack").array(),
  featuresBuilt: text("features_built").array(),
  projectSummary: text("project_summary"),
  lastCodeGenerated: text("last_code_generated"),
  // New fields for enhanced features
  projectType: text("project_type"), // landing, dashboard, webapp, etc.
  complexity: text("complexity"), // simple, moderate, complex
  designStyle: text("design_style"), // minimal, modern, corporate, etc.
  colorPreferences: text("color_preferences").array(),
  planGenerated: boolean("plan_generated").default(false),
  securityScore: integer("security_score"),
  testsPassed: integer("tests_passed"),
  testsFailed: integer("tests_failed"),
  conversationPhase: text("conversation_phase").default("initial"),
  projectPlanData: jsonb("project_plan_data"),
  understandingData: jsonb("understanding_data"),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
  role: text("role").notNull(),
  content: text("content").notNull(),
  thinkingSteps: jsonb("thinking_steps"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const projectFiles = pgTable("project_files", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
  path: text("path").notNull(),
  content: text("content").notNull(),
  language: text("language").notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  createdAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export const insertProjectFileSchema = createInsertSchema(projectFiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Project Plans table for architecture documentation
export const projectPlans = pgTable("project_plans", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
  summary: text("summary").notNull(),
  techStack: jsonb("tech_stack").$type<{ category: string; technology: string; justification: string }[]>(),
  architecture: text("architecture"),
  folderStructure: text("folder_structure"),
  designDecisions: jsonb("design_decisions").$type<{ decision: string; rationale: string }[]>(),
  securityConsiderations: text("security_considerations").array(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Intel Records table for user preferences and learnings
export const intelRecords = pgTable("intel_records", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // preference, decision, pattern, mistake, context
  category: text("category").notNull(),
  key: text("key").notNull(),
  value: text("value").notNull(),
  confidence: integer("confidence").default(100), // 0-100
  source: text("source").default("inferred"), // explicit, inferred, learned
  usageCount: integer("usage_count").default(0),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Test Results table for tracking test outcomes
export const testResults = pgTable("test_results", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
  targetFile: text("target_file").notNull(),
  passed: integer("passed").default(0),
  failed: integer("failed").default(0),
  skipped: integer("skipped").default(0),
  coverage: integer("coverage"),
  details: jsonb("details").$type<{ testId: string; testName: string; status: string; error?: string }[]>(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Security Scans table for tracking vulnerability assessments
export const securityScans = pgTable("security_scans", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
  score: integer("score").notNull(),
  grade: text("grade").notNull(), // A, B, C, D, F
  issues: jsonb("issues").$type<{ severity: string; category: string; title: string; recommendation: string }[]>(),
  passedChecks: text("passed_checks").array(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Generation Logs table for transparency
export const generationLogs = pgTable("generation_logs", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
  action: text("action").notNull(), // create, update, delete
  targetFile: text("target_file").notNull(),
  description: text("description").notNull(),
  linesChanged: integer("lines_changed").default(0),
  reasoning: text("reasoning"),
  assumptions: text("assumptions").array(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertProjectPlanSchema = createInsertSchema(projectPlans).omit({ id: true, createdAt: true });
export const insertIntelRecordSchema = createInsertSchema(intelRecords).omit({ id: true, createdAt: true });
export const insertTestResultSchema = createInsertSchema(testResults).omit({ id: true, createdAt: true });
export const insertSecurityScanSchema = createInsertSchema(securityScans).omit({ id: true, createdAt: true });
export const insertGenerationLogSchema = createInsertSchema(generationLogs).omit({ id: true, createdAt: true });

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type ProjectFile = typeof projectFiles.$inferSelect;
export type InsertProjectFile = z.infer<typeof insertProjectFileSchema>;
export type ProjectPlan = typeof projectPlans.$inferSelect;
export type InsertProjectPlan = z.infer<typeof insertProjectPlanSchema>;
export type IntelRecord = typeof intelRecords.$inferSelect;
export type InsertIntelRecord = z.infer<typeof insertIntelRecordSchema>;
export type TestResult = typeof testResults.$inferSelect;
export type InsertTestResult = z.infer<typeof insertTestResultSchema>;
export type SecurityScan = typeof securityScans.$inferSelect;
export type InsertSecurityScan = z.infer<typeof insertSecurityScanSchema>;
export type GenerationLog = typeof generationLogs.$inferSelect;
export type InsertGenerationLog = z.infer<typeof insertGenerationLogSchema>;

// VAPT Dashboard Tables
export const vaptAssets = pgTable("vapt_assets", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // ip, domain, url, network_range
  value: text("value").notNull(),
  criticality: text("criticality").notNull(), // low, medium, high, critical
  tags: text("tags").array(),
  status: text("status").default("active"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const vaptVulnerabilities = pgTable("vapt_vulnerabilities", {
  id: serial("id").primaryKey(),
  assetId: integer("asset_id").references(() => vaptAssets.id, { onDelete: "cascade" }),
  cveId: text("cve_id"),
  title: text("title").notNull(),
  description: text("description").notNull(),
  severity: text("severity").notNull(), // critical, high, medium, low, info
  cvssScore: text("cvss_score"),
  component: text("component"),
  owaspCategory: text("owasp_category"),
  status: text("status").default("open"), // open, in_progress, resolved, verified, false_positive
  assignedTo: text("assigned_to"),
  deadline: timestamp("deadline"),
  remediation: text("remediation"),
  evidence: text("evidence"),
  scanId: integer("scan_id"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  resolvedAt: timestamp("resolved_at"),
});

export const vaptScans = pgTable("vapt_scans", {
  id: serial("id").primaryKey(),
  assetId: integer("asset_id").references(() => vaptAssets.id, { onDelete: "cascade" }),
  scanType: text("scan_type").notNull(), // quick, standard, deep, custom
  status: text("status").default("pending"), // pending, running, completed, failed
  progress: integer("progress").default(0),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  findingsCount: integer("findings_count").default(0),
  criticalCount: integer("critical_count").default(0),
  highCount: integer("high_count").default(0),
  mediumCount: integer("medium_count").default(0),
  lowCount: integer("low_count").default(0),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const vaptSchedules = pgTable("vapt_schedules", {
  id: serial("id").primaryKey(),
  assetId: integer("asset_id").references(() => vaptAssets.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  cronExpression: text("cron_expression").notNull(),
  scanType: text("scan_type").notNull(),
  enabled: boolean("enabled").default(true),
  lastRun: timestamp("last_run"),
  nextRun: timestamp("next_run"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const vaptAuditLogs = pgTable("vapt_audit_logs", {
  id: serial("id").primaryKey(),
  userId: text("user_id"),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: integer("entity_id"),
  details: text("details"),
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const vaptTeamMembers = pgTable("vapt_team_members", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull(), // admin, analyst, viewer
  avatar: text("avatar"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertVaptAssetSchema = createInsertSchema(vaptAssets).omit({ id: true, createdAt: true, updatedAt: true });
export const insertVaptVulnerabilitySchema = createInsertSchema(vaptVulnerabilities).omit({ id: true, createdAt: true });
export const insertVaptScanSchema = createInsertSchema(vaptScans).omit({ id: true, createdAt: true });
export const insertVaptScheduleSchema = createInsertSchema(vaptSchedules).omit({ id: true, createdAt: true });
export const insertVaptAuditLogSchema = createInsertSchema(vaptAuditLogs).omit({ id: true, createdAt: true });
export const insertVaptTeamMemberSchema = createInsertSchema(vaptTeamMembers).omit({ id: true, createdAt: true });

export type VaptAsset = typeof vaptAssets.$inferSelect;
export type InsertVaptAsset = z.infer<typeof insertVaptAssetSchema>;
export type VaptVulnerability = typeof vaptVulnerabilities.$inferSelect;
export type InsertVaptVulnerability = z.infer<typeof insertVaptVulnerabilitySchema>;
export type VaptScan = typeof vaptScans.$inferSelect;
export type InsertVaptScan = z.infer<typeof insertVaptScanSchema>;
export type VaptSchedule = typeof vaptSchedules.$inferSelect;
export type InsertVaptSchedule = z.infer<typeof insertVaptScheduleSchema>;
export type VaptAuditLog = typeof vaptAuditLogs.$inferSelect;
export type InsertVaptAuditLog = z.infer<typeof insertVaptAuditLogSchema>;
export type VaptTeamMember = typeof vaptTeamMembers.$inferSelect;
export type InsertVaptTeamMember = z.infer<typeof insertVaptTeamMemberSchema>;
