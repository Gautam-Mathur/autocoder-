import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage, ProjectContext } from "./storage";
import OpenAI from "openai";
import { z } from "zod";
import type { Conversation } from "@shared/schema";

// Logger
import { logger, requestLogger } from "./modules/logger";

// Intelligence Modules
import { analyzePrompt, formatClarificationQuestions } from "./modules/clarification-engine";
import { generateProjectPlan, formatPlanAsMarkdown } from "./modules/planning-module";
import { generateTestsForCode, runTests, formatTestResults, validateBuild } from "./modules/testing-engine";
import { scanForVulnerabilities, formatSecurityReport, getSecurityRecommendations } from "./modules/security-module";
import { extractAssumptions, formatTransparencyReport, summarizeChanges } from "./modules/transparency-module";
import { extractIntelFromMessages, storeIntel, getIntel, generateIntelContext } from "./modules/intel-memory";
import { analyzeDependencies, formatDependencyReport, generateEnvExample } from "./modules/dependency-intelligence";
import { generateProjectExport, generateDownloadData } from "./modules/export-system";

// Vite Error Fixer
import { parseErrors, analyzeAndFix, validateImportPaths, addDependenciesToPackageJson } from "./modules/vite-error-fixer";

// Advanced AI Modules
import { analyzeAndPlan, formatReasoningAsMarkdown, quickAnalysis } from "./modules/advanced-reasoning";
import { learnFromInteraction, getContextPreferences, applyContextPreferences, getRelevantContext, formatMemorySummary } from "./modules/context-memory";
import { analyzeCode, diagnoseError, formatAnalysisAsMarkdown, autoFixCode } from "./modules/live-code-analysis";
import { getAllFrameworks, getFramework, getFrameworksByLanguage, getFrameworksByCategory, getFrameworkCount, getFrameworkSummary } from "./modules/framework-patterns";
import { getLanguage, getAllLanguages, getLanguageIds, getLanguageCount, getLanguageSummary } from "./modules/language-registry";
import { emitProject, previewEmission, type ProjectBlueprint } from "./modules/universal-code-emitter";

// Generation Learning Engine
import { learningEngine } from "./modules/generation-learning-engine";

// Claude-level capabilities
import { analyzeNLU, classifyIntent, extractEntities, parseSemantics, analyzeSentiment, formatNLUAsMarkdown } from "./modules/natural-language-understanding";
import { explainCode, detectPatterns, summarizeCode, formatExplanationAsMarkdown } from "./modules/code-explanation-engine";
import { getConcept, searchConcepts, getBestPractices, getBestPractice, getLearningPath, formatConceptAsMarkdown, formatBestPracticeAsMarkdown } from "./modules/knowledge-base";
import { detectFollowUp, resolvePronouns, updateContext, generateClarification, getResponseHints, summarizeConversation, getConversationContext, formatConversationContextAsMarkdown } from "./modules/conversational-flexibility";
import { continuousDebug, parseError, getDebugStatus, getDebugSession, formatDebugReport } from "./modules/continuous-debugger";

// Enhanced Claude-level capabilities
import { recognizeIntent, isQuestion, extractEntitiesEnhanced, formatIntentAsMarkdown } from "./modules/enhanced-intent-recognition";
import { generateProject, formatProjectAsTree, formatProjectAsMarkdown } from "./modules/advanced-code-generation";
import { explainCodeUniversal, formatExplanationAsMarkdownUniversal } from "./modules/universal-code-explanation";
import { analyzeError, parseStackTrace, generateFixChain, formatDebugAnalysisAsMarkdown } from "./modules/deep-debugging-engine";
import { createContextWindow, addChunk, getContextWindow, compressConversation, getRelevantContext as getRelevantContextChunks, formatContextWindowAsMarkdown } from "./modules/context-window-manager";
import { LANGUAGES, getLanguageById, getSnippet, listAllLanguages, formatLanguageSummary } from "./modules/multi-language-templates";
import { createConversation as createConvState, processTurn, getConversation as getConvState, getResponseHints as getConvHints, getConversationSummary, learnPreferences, getRelevantMemory } from "./modules/true-conversational-ai";

// Deep Project Generator
import { generateDeepProject, listBlueprints, listFeatures, getBlueprint, getFeature } from "./modules/deep-project-generator";

// Pro Generator (client-side, produces clean JSX for preview)
import { analyzePrompt as proAnalyzePrompt, generateProject as proGenerateProject, shouldUseProGenerator, analyzePromptWithThinking, generateProjectWithThinking } from "../client/src/lib/code-generator/pro-generator";
import type { ThinkingStep } from "../client/src/lib/code-generator/pro-generator";
import { validateGeneratedCode, autoFixCode as clientAutoFixCode } from "../client/src/lib/code-generator/code-validator";

// Preview Project Manager
import { preparePreviewProject, startPreviewServer, stopPreviewServer, getPreviewStatus, cleanupOldProjects } from "./modules/preview-project-manager";

// Plan-Driven Conversation Handler
import { handleMessage as handlePhaseMessage, isProjectCreationRequest, type ConversationState } from "./modules/conversation-phase-handler";

function sanitizeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

function parseValidId(raw: string): number | null {
  const id = parseInt(raw);
  if (isNaN(id) || id < 0 || id > 2147483647) return null;
  return id;
}

function inferLanguageFromPath(filePath: string): string {
  const ext = filePath.split('.').pop()?.toLowerCase() || '';
  const map: Record<string, string> = {
    tsx: 'tsx', ts: 'typescript', jsx: 'jsx', js: 'javascript',
    json: 'json', html: 'html', css: 'css', md: 'markdown', svg: 'svg',
  };
  return map[ext] || 'text';
}

// Extract project context from conversation content
function extractProjectContext(
  allContent: string,
  latestResponse: string,
  existingContext: Conversation
): ProjectContext {
  const context: ProjectContext = {};
  
  // Extract project name (look for patterns like "building X", "create X app", "X is a")
  if (!existingContext.projectName) {
    const namePatterns = [
      /(?:building|create|making|develop)\s+(?:a\s+)?(?:an?\s+)?["']?([A-Z][a-zA-Z0-9\s]+?)["']?\s+(?:app|website|dashboard|platform|tool|system)/i,
      /["']([A-Z][a-zA-Z0-9]+)["']\s+(?:is\s+(?:a|an)|will\s+be)/i,
      /(?:called|named)\s+["']?([A-Z][a-zA-Z0-9]+)["']?/i,
    ];
    
    for (const pattern of namePatterns) {
      const match = allContent.match(pattern);
      if (match && match[1]) {
        context.projectName = match[1].trim();
        break;
      }
    }
  }
  
  // Extract tech stack from AI response
  const techKeywords = ['HTML', 'CSS', 'JavaScript', 'React', 'TypeScript', 'Node.js', 'Express', 'Tailwind', 'Bootstrap'];
  const foundTech = techKeywords.filter(tech => 
    latestResponse.toLowerCase().includes(tech.toLowerCase())
  );
  
  if (foundTech.length > 0) {
    const existingTech = existingContext.techStack || [];
    const combined = [...existingTech, ...foundTech];
    const newTech = combined.filter((tech, index) => combined.indexOf(tech) === index);
    if (newTech.length > existingTech.length) {
      context.techStack = newTech;
    }
  }
  
  // Extract features from code blocks (look for major component patterns)
  const featurePatterns = [
    { pattern: /<nav|navigation|navbar/i, feature: 'Navigation' },
    { pattern: /<form|contact.*form|login.*form/i, feature: 'Forms' },
    { pattern: /dashboard|admin.*panel/i, feature: 'Dashboard' },
    { pattern: /chart|graph|analytics/i, feature: 'Charts/Analytics' },
    { pattern: /modal|dialog|popup/i, feature: 'Modals' },
    { pattern: /cart|checkout|payment/i, feature: 'Shopping Cart' },
    { pattern: /hero.*section|landing/i, feature: 'Hero Section' },
    { pattern: /pricing|plans|tiers/i, feature: 'Pricing Section' },
    { pattern: /terminal|console/i, feature: 'Terminal Display' },
    { pattern: /settings|preferences/i, feature: 'Settings Panel' },
  ];
  
  const existingFeatures = existingContext.featuresBuilt || [];
  const newFeatures = [...existingFeatures];
  
  for (const { pattern, feature } of featurePatterns) {
    if (pattern.test(latestResponse) && !newFeatures.includes(feature)) {
      newFeatures.push(feature);
    }
  }
  
  if (newFeatures.length > existingFeatures.length) {
    context.featuresBuilt = newFeatures;
  }
  
  // Create a brief summary
  if (context.projectName || context.featuresBuilt) {
    const name = context.projectName || existingContext.projectName || 'Project';
    const features = context.featuresBuilt || existingContext.featuresBuilt || [];
    context.projectSummary = `${name} - Built with ${(context.techStack || existingContext.techStack || ['HTML', 'CSS', 'JS']).slice(0, 3).join(', ')}. Features: ${features.slice(-3).join(', ') || 'In progress'}`;
  }
  
  // Store the latest code if it contains HTML
  if (latestResponse.includes('```html')) {
    const codeMatch = latestResponse.match(/```html\n([\s\S]*?)```/);
    if (codeMatch && codeMatch[1]) {
      context.lastCodeGenerated = codeMatch[1].substring(0, 5000); // Limit size
    }
  }
  
  return context;
}

// Check if AI is available (Replit AI or standard OpenAI)
const hasReplitAI = !!(process.env.AI_INTEGRATIONS_OPENAI_API_KEY && process.env.AI_INTEGRATIONS_OPENAI_BASE_URL);
const hasOpenAI = !!process.env.OPENAI_API_KEY;
const hasCloudAI = hasReplitAI || hasOpenAI;

let openai: OpenAI | null = null;
if (hasReplitAI) {
  openai = new OpenAI({
    apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
    baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  });
} else if (hasOpenAI) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

const createConversationSchema = z.object({
  title: z.string().min(1).max(200).optional().default("New Chat"),
});

const sendMessageSchema = z.object({
  content: z.string().min(1).max(32000),
});

const updateProjectContextSchema = z.object({
  projectName: z.string().optional(),
  projectDescription: z.string().optional(),
  techStack: z.array(z.string()).optional(),
  featuresBuilt: z.array(z.string()).optional(),
  projectSummary: z.string().optional(),
  lastCodeGenerated: z.string().optional(),
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Request logging middleware
  app.use(requestLogger());
  
  logger.info("Server", "Routes registration started");
  
  // Health check with AI status
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok",
      aiMode: hasCloudAI ? "cloud" : "local",
      message: hasCloudAI ? "Cloud AI ready" : "Local template engine active"
    });
  });
  
  // Preview scripts proxy - fetches CDN scripts and serves with proper CORS/COEP headers
  const scriptCache = new Map<string, { content: string; timestamp: number }>();
  const SCRIPT_URLS: Record<string, string> = {
    'react': 'https://cdn.jsdelivr.net/npm/react@18/umd/react.production.min.js',
    'react-dom': 'https://cdn.jsdelivr.net/npm/react-dom@18/umd/react-dom.production.min.js',
    'babel': 'https://cdn.jsdelivr.net/npm/@babel/standalone@7/babel.min.js'
  };
  const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
  
  app.get("/api/preview-scripts/:lib", async (req, res) => {
    const lib = req.params.lib;
    const url = SCRIPT_URLS[lib];
    
    if (!url) {
      return res.status(404).json({ error: `Unknown library: ${lib}` });
    }
    
    try {
      // Check cache first
      const cached = scriptCache.get(lib);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        res.setHeader('Content-Type', 'application/javascript');
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
        res.setHeader('Cache-Control', 'public, max-age=86400');
        return res.send(cached.content);
      }
      
      // Fetch from CDN
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`CDN returned ${response.status}`);
      }
      
      const content = await response.text();
      
      // Cache the script
      scriptCache.set(lib, { content, timestamp: Date.now() });
      
      // Send with proper headers for COEP compatibility
      res.setHeader('Content-Type', 'application/javascript');
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.send(content);
    } catch (error) {
      console.error(`Failed to fetch ${lib}:`, error);
      res.status(502).json({ error: `Failed to fetch ${lib} from CDN` });
    }
  });
  
  // Server-side TSX transpilation endpoint for fallback
  app.post("/api/preview-transpile", async (req, res) => {
    try {
      const { code } = req.body;
      if (!code || typeof code !== 'string') {
        return res.status(400).json({ error: 'Code is required' });
      }
      
      // Use a simple transformation since we don't have Babel on server
      // This is a basic JSX to createElement transformation
      let transpiled = code;
      
      // Remove TypeScript type annotations (basic patterns)
      transpiled = transpiled.replace(/:\s*\w+(\[\])?(\s*[,\)\}=])/g, '$2');
      transpiled = transpiled.replace(/<\w+>/g, ''); // Generic types
      transpiled = transpiled.replace(/interface\s+\w+\s*\{[^}]*\}/g, '');
      transpiled = transpiled.replace(/type\s+\w+\s*=\s*[^;]+;/g, '');
      
      res.json({ transpiled, success: true });
    } catch (error) {
      console.error('Transpilation error:', error);
      res.status(500).json({ error: 'Transpilation failed', success: false });
    }
  });
  
  // Preview Project Vite Server API (port 6000)
  app.post("/api/preview/prepare/:conversationId", async (req, res) => {
    try {
      const conversationId = parseValidId(req.params.conversationId);
      if (conversationId === null) {
        return res.status(400).json({ error: 'Invalid conversation ID' });
      }
      
      const projectFiles = await storage.getProjectFiles(conversationId);
      if (!projectFiles || projectFiles.length === 0) {
        return res.status(404).json({ error: 'No project files found for this conversation' });
      }
      
      const files = projectFiles.map(f => ({ path: f.path, content: f.content }));
      const projectPath = await preparePreviewProject(conversationId, files);
      
      logger.info('PREVIEW', `Prepared preview project for conversation ${conversationId} at ${projectPath}`);
      
      res.json({ 
        success: true, 
        projectPath, 
        fileCount: files.length 
      });
    } catch (error: any) {
      logger.error('PREVIEW', `Failed to prepare preview: ${error.message}`);
      res.status(500).json({ error: error.message, success: false });
    }
  });
  
  app.post("/api/preview/start/:conversationId", async (req, res) => {
    try {
      const conversationId = parseValidId(req.params.conversationId);
      if (conversationId === null) {
        return res.status(400).json({ error: 'Invalid conversation ID' });
      }
      
      const projectFiles = await storage.getProjectFiles(conversationId);
      if (!projectFiles || projectFiles.length === 0) {
        return res.status(404).json({ error: 'No project files found' });
      }
      
      const files = projectFiles.map(f => ({ path: f.path, content: f.content }));
      await preparePreviewProject(conversationId, files);
      
      const result = await startPreviewServer(conversationId);
      
      if (result.success) {
        logger.info('PREVIEW', `Started preview server for conversation ${conversationId} at ${result.url}`);
      } else {
        logger.error('PREVIEW', `Failed to start preview: ${result.error}`);
      }
      
      res.json(result);
    } catch (error: any) {
      logger.error('PREVIEW', `Failed to start preview: ${error.message}`);
      res.status(500).json({ error: error.message, success: false });
    }
  });
  
  app.post("/api/preview/stop", async (req, res) => {
    try {
      await stopPreviewServer();
      logger.info('PREVIEW', 'Stopped preview server');
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message, success: false });
    }
  });
  
  app.get("/api/preview/status", (req, res) => {
    const status = getPreviewStatus();
    res.json(status);
  });
  
  // Cloud Sandbox API endpoints
  app.post("/api/sandbox/create", async (req, res) => {
    try {
      const { files } = req.body;
      if (!files || !Array.isArray(files)) {
        return res.status(400).json({ error: 'Files array required', available: false });
      }
      
      const cloudSandboxEnabled = process.env.CLOUD_SANDBOX_ENABLED === 'true';
      if (!cloudSandboxEnabled) {
        return res.status(503).json({
          error: 'Cloud sandbox not available',
          available: false,
          message: 'Cloud execution is a planned feature. Using local preview.',
          fallbackTo: 'static-preview'
        });
      }
      
      res.status(503).json({
        error: 'Cloud sandbox not configured',
        available: false,
        fallbackTo: 'static-preview'
      });
    } catch (error) {
      console.error('Sandbox creation error:', error);
      res.status(500).json({ error: 'Internal server error', available: false });
    }
  });

  app.post("/api/sandbox/stop", async (req, res) => {
    res.json({ success: true, message: 'No active session found' });
  });

  app.get("/api/sandbox/status", async (req, res) => {
    const cloudSandboxEnabled = process.env.CLOUD_SANDBOX_ENABLED === 'true';
    res.json({
      available: cloudSandboxEnabled,
      activeSessions: 0,
      features: {
        nodeExecution: cloudSandboxEnabled,
        databaseAccess: false,
        persistentStorage: false,
      },
      limits: {
        maxSessionsPerUser: 2,
        maxExecutionTimeMs: 300000,
        maxMemoryMB: 512,
      }
    });
  });
  
  // Logger API endpoints
  app.get("/api/logs", (req, res) => {
    try {
      const { level, category, limit, search } = req.query;
      const logs = logger.getLogs({
        level: level as any,
        category: category as string,
        limit: limit ? parseInt(limit as string) : 200,
        search: search as string,
      });
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch logs" });
    }
  });
  
  app.get("/api/logs/stats", (req, res) => {
    try {
      const stats = logger.getStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch log stats" });
    }
  });
  
  app.delete("/api/logs", (req, res) => {
    try {
      logger.clear();
      logger.info("Server", "Logs cleared by user");
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to clear logs" });
    }
  });

  app.get("/api/conversations", async (req, res) => {
    try {
      const conversations = await storage.getAllConversations();
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });

  app.get("/api/conversations/:id", async (req, res) => {
    try {
      const id = parseValidId(req.params.id);
      if (id === null) {
        return res.status(400).json({ error: "Invalid conversation ID" });
      }
      const conversation = await storage.getConversation(id);
      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }
      const messages = await storage.getMessagesByConversation(id);
      res.json({ ...conversation, messages });
    } catch (error) {
      console.error("Error fetching conversation:", error);
      res.status(500).json({ error: "Failed to fetch conversation" });
    }
  });

  app.post("/api/conversations", async (req, res) => {
    try {
      const parsed = createConversationSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid request body", details: parsed.error.issues });
      }
      const sanitizedTitle = sanitizeHtml(parsed.data.title);
      const conversation = await storage.createConversation(sanitizedTitle);
      res.status(201).json(conversation);
    } catch (error) {
      console.error("Error creating conversation:", error);
      res.status(500).json({ error: "Failed to create conversation" });
    }
  });

  app.delete("/api/conversations/:id", async (req, res) => {
    try {
      const id = parseValidId(req.params.id);
      if (id === null) {
        return res.status(400).json({ error: "Invalid conversation ID" });
      }
      await storage.deleteConversation(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting conversation:", error);
      res.status(500).json({ error: "Failed to delete conversation" });
    }
  });

  // Save assistant message (for local engine mode)
  app.post("/api/conversations/:id/assistant-message", async (req, res) => {
    try {
      const id = parseValidId(req.params.id);
      if (id === null) {
        return res.status(400).json({ error: "Invalid conversation ID" });
      }

      const { content, thinkingSteps } = req.body;
      if (!content || typeof content !== "string") {
        return res.status(400).json({ error: "Content is required" });
      }

      const message = await storage.createMessage(id, "assistant", content, thinkingSteps || undefined);
      res.status(201).json(message);
    } catch (error) {
      console.error("Error saving assistant message:", error);
      res.status(500).json({ error: "Failed to save assistant message" });
    }
  });

  // Update project context for a conversation
  app.put("/api/conversations/:id/context", async (req, res) => {
    try {
      const id = parseValidId(req.params.id);
      if (id === null) {
        return res.status(400).json({ error: "Invalid conversation ID" });
      }

      const parsed = updateProjectContextSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid request body", details: parsed.error.issues });
      }

      const updated = await storage.updateProjectContext(id, parsed.data);
      if (!updated) {
        return res.status(404).json({ error: "Conversation not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error updating project context:", error);
      res.status(500).json({ error: "Failed to update project context" });
    }
  });

  app.post("/api/conversations/:id/messages", async (req, res) => {
    try {
      const conversationId = parseValidId(req.params.id);
      if (conversationId === null) {
        return res.status(400).json({ error: "Invalid conversation ID" });
      }

      const parsed = sendMessageSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid request body", details: parsed.error.issues });
      }

      const { content } = parsed.data;

      // Get conversation with project context
      const conversation = await storage.getConversation(conversationId);
      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }

      await storage.createMessage(conversationId, "user", content);

      // Fetch existing project files
      const existingFiles = await storage.getProjectFiles(conversationId);
      
      // Build project context string for AI including existing files
      let projectContextPrompt = "";
      
      // Build existing files context
      let existingFilesContext = "";
      if (existingFiles.length > 0) {
        existingFilesContext = `
## EXISTING PROJECT FILES (Your codebase - ALWAYS UPDATE THESE)
You have already written these files for this project. When the user asks for changes, MODIFY these existing files - DO NOT create new code blocks.

${existingFiles.map((f: { path: string; language: string; content: string }) => `### ${f.path}
\`\`\`${f.language}
${f.content}
\`\`\``).join('\n\n')}

**CRITICAL FILE UPDATE RULES:**
1. When user asks for ANY changes, you MUST update the existing files above
2. Use the EXACT same file path (e.g., index.html, styles.css) 
3. Always use the --- FILE: path --- format so files get properly updated
4. Show the COMPLETE updated file content, not just the changes
5. Reference specific changes you made: "I've updated index.html to add..."
6. NEVER generate new code blocks without the FILE: marker - that creates duplicates

`;
      }
      
      if (conversation.projectName || conversation.projectSummary || (conversation.featuresBuilt && conversation.featuresBuilt.length > 0) || existingFiles.length > 0) {
        projectContextPrompt = `
## CURRENT PROJECT STATE (Your Memory)
This is what you remember about this project:
${conversation.projectName ? `**Project Name**: ${conversation.projectName}` : ""}
${conversation.projectDescription ? `**Description**: ${conversation.projectDescription}` : ""}
${conversation.techStack && conversation.techStack.length > 0 ? `**Tech Stack**: ${conversation.techStack.join(", ")}` : ""}
${conversation.featuresBuilt && conversation.featuresBuilt.length > 0 ? `**Features Already Built**: ${conversation.featuresBuilt.join(", ")}` : ""}
${conversation.projectSummary ? `**Project Summary**: ${conversation.projectSummary}` : ""}
${existingFilesContext}
IMPORTANT: Use this context! Build on previous work. Maintain consistent styling and branding. Reference what was built before.
`;
      }

      // Plan-Driven Project Detection & Phase-Aware Handling
      const currentPhase = (conversation as any).conversationPhase || 'initial';
      const isDeepProjectRequest = isProjectCreationRequest(content);
      const isInActivePhase = ['understanding', 'clarifying', 'planning', 'approval', 'generating'].includes(currentPhase);
      const isEditPhase = ['complete', 'editing'].includes(currentPhase) && existingFiles.length > 0;

      if (isDeepProjectRequest || isInActivePhase || isEditPhase) {
        const convState: ConversationState = {
          phase: currentPhase as any,
          understandingData: (conversation as any).understandingData as any,
          planData: (conversation as any).projectPlanData as any,
          clarificationRound: (conversation as any).clarificationRound as number | undefined,
          clarificationState: (conversation as any).clarificationState as any,
          conversationId: conversationId,
          existingFiles: isEditPhase ? existingFiles.map((f: any) => ({
            path: f.path,
            content: f.content,
            language: f.language || inferLanguageFromPath(f.path),
          })) : undefined,
          editHistory: (conversation as any).editHistory as any,
        };

        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");

        const recentMsgs = await storage.getMessagesByConversation(conversationId);
        const conversationHistory = recentMsgs
          .slice(-6)
          .map((m: any) => `[${m.role}]: ${typeof m.content === 'string' ? m.content.slice(0, 300) : ''}`)
          .join('\n');

        const onStep = (step: { phase: string; label: string; detail?: string; timestamp?: number }) => {
          try {
            res.write(`data: ${JSON.stringify({ type: 'thinking', step })}\n\n`);
          } catch {}
        };

        const result = handlePhaseMessage(content, convState, conversationHistory, onStep);

        // If files were generated, validate, auto-fix, and save them
        if (result.generatedFiles && result.generatedFiles.length > 0) {
          const isIterativeEdit = result.fileEdits && result.fileEdits.length > 0;

          if (isIterativeEdit) {
            for (const edit of result.fileEdits!) {
              if (edit.editType === 'delete') {
                const allFiles = await storage.getProjectFiles(conversationId);
                const fileToDelete = allFiles.find((f: any) => f.path === edit.filePath);
                if (fileToDelete) {
                  await storage.deleteProjectFile(fileToDelete.id);
                }
              } else {
                const fixedContent = clientAutoFixCode(edit.newContent, edit.filePath);
                const lang = inferLanguageFromPath(edit.filePath);
                await storage.upsertProjectFile(conversationId, edit.filePath, fixedContent, lang);
              }
            }
          } else {
            const validation = validateGeneratedCode(
              result.generatedFiles.map(f => ({ path: f.path, content: f.content }))
            );
            const filesToSave = validation.fixedFiles.length > 0
              ? validation.fixedFiles
              : result.generatedFiles;

            await storage.deleteProjectFilesByConversation(conversationId);
            for (const file of filesToSave) {
              const fixedContent = clientAutoFixCode(file.content, file.path);
              const lang = ('language' in file && typeof file.language === 'string') ? file.language : inferLanguageFromPath(file.path);
              await storage.upsertProjectFile(conversationId, file.path, fixedContent, lang);
            }
          }
        }

        const updateData: any = {
          conversationPhase: result.newPhase,
          ...(result.planData ? { projectPlanData: result.planData as any } : {}),
          ...(result.understandingData ? { understandingData: result.understandingData as any } : {}),
          ...(result.clarificationRound != null ? { clarificationRound: result.clarificationRound } : {}),
          ...(result.clarificationState ? { clarificationState: result.clarificationState as any } : {}),
          ...(result.planData ? {
            projectName: result.planData.projectName,
            planGenerated: true,
          } : {}),
        };
        if (result.fileEdits && result.fileEdits.length > 0) {
          const prevHistory = (conversation as any).editHistory || [];
          updateData.editHistory = [...prevHistory, {
            timestamp: Date.now(),
            edits: result.fileEdits.map((e: any) => ({
              filePath: e.filePath,
              editType: e.editType,
              description: e.description,
            })),
            userMessage: content,
          }].slice(-50);
        }
        await storage.updateProjectContext(conversationId, updateData);

        const savedMessage = await storage.createMessage(conversationId, "assistant", result.responseContent, result.thinkingSteps);

        // Stream the response content
        const chunks = result.responseContent.split(/(?<=\s)/);
        for (const chunk of chunks) {
          res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
          await new Promise(resolve => setTimeout(resolve, 10));
        }

        // Send done signal
        const donePayload: any = {
          done: true,
          thinkingSteps: result.thinkingSteps,
          messageId: savedMessage.id,
          phase: result.newPhase,
        };
        if (result.generatedFiles && !result.fileEdits) {
          donePayload.deepProject = {
            name: result.planData?.projectName || 'Generated Project',
            totalFiles: result.generatedFiles.length,
          };
        }
        if (result.fileEdits && result.fileEdits.length > 0) {
          donePayload.fileEdits = result.fileEdits.map(e => ({
            filePath: e.filePath,
            editType: e.editType,
            description: e.description,
            linesChanged: e.linesChanged,
          }));
          donePayload.editType = result.editResult?.editType;
        }
        if (result.newPhase === 'approval') {
          donePayload.showApproval = true;
        }

        res.write(`data: ${JSON.stringify(donePayload)}\n\n`);
        res.end();
        return;
      }

      // Use Replit AI if available, otherwise signal client to use local engine
      if (openai) {
        const messages = await storage.getMessagesByConversation(conversationId);
        const chatMessages = [
          {
            role: "system" as const,
            content: `You are CodeAI, a friendly coding assistant that helps anyone build amazing apps - even if they've never written code before! You explain everything you do in simple, everyday language.

${projectContextPrompt}

## YOUR COMMUNICATION STYLE - BE A HELPFUL FRIEND

### ALWAYS EXPLAIN WHAT YOU'RE DOING

Before and during every response, explain your thinking like you're talking to a friend:

1. **Start with understanding** - "I understand you want to build [X]. Let me break down what that means..."

2. **Explain your plan** - "Here's what I'm going to create for you:
   - A beautiful homepage where users can...
   - A login system so people can...
   - A dashboard that shows..."

3. **Describe each file simply** - When creating files, explain what each one does:
   - "This file handles the login - it's like the front door of your app"
   - "This is the database setup - it's where all your data gets stored safely"
   - "This is the main page design - it's what your users will see first"

4. **Use everyday analogies** - Compare coding concepts to real life:
   - "Think of the database like a filing cabinet for your app"
   - "The server is like a waiter - it takes requests and brings back what you need"
   - "Components are like LEGO blocks - you build bigger things from smaller pieces"

5. **Summarize what you built** - End with a clear recap:
   - "Here's what I created for you:"
   - "Your app now has these features:"
   - "To use this, you just need to..."

### RESPONSE FORMAT

Structure every response like this:

**What I understood:** [Restate their request in simple terms]

**What I'm building:** [List the main features in plain English]

**Here's your code:** [The actual code with file markers]

**What each part does:**
- [File 1]: [Simple explanation]
- [File 2]: [Simple explanation]

**What you can do next:** [Suggestions for improvements or next steps]

### AVOID JARGON - USE SIMPLE WORDS

Instead of... | Say...
"API endpoint" | "a way for your app to talk to the server"
"Authentication" | "login system"
"Database schema" | "how your data is organized"
"Frontend/Backend" | "what users see / behind-the-scenes logic"
"Deploy" | "put your app online so anyone can use it"
"Component" | "a reusable piece of your app"
"State management" | "keeping track of information as users interact"

### BE ENCOURAGING

- Celebrate their ideas: "That's a great app idea!"
- Make it feel achievable: "This is totally doable - let me show you"
- Offer to explain more: "Want me to explain any part in more detail?"

### PHASE 1: UNDERSTAND (Before ANY Code)
Before writing a single character of code, you MUST think through:

1. **User Intent Analysis**
   - What is the user REALLY asking for? (Read between the lines)
   - What's the business goal behind this request?
   - Who will use this? What devices? What skill level?
   
2. **Scope Definition**
   - What are the MUST-HAVE features vs nice-to-haves?
   - What's the MVP that delivers maximum value?
   - What could go wrong and how do we prevent it?

3. **Technical Architecture**
   - What's the cleanest structure?
   - How do components relate and communicate?
   - What patterns ensure maintainability?

### PHASE 2: DESIGN (Visual Mastery)
You are not just coding - you are CRAFTING experiences. Apply these principles:

## VISUAL DESIGN MASTERY (What Separates Good from EXCEPTIONAL)

### 1. The Psychology of Visual Hierarchy
**Users scan in predictable patterns - design for them:**
- **Z-Pattern** (Marketing pages): Top-left logo → Top-right CTA → Diagonal scan → Bottom-left info → Bottom-right action
- **F-Pattern** (Content pages): Top headline → Horizontal scan → Vertical scan down left side
- **Visual Weight Formula**: Size + Color Saturation + Contrast + Isolation = Attention Priority

**Size Ratios for Hierarchy (Golden Ratio ~1.618):**
- Hero headline: 3.5rem-5rem (the star)
- Section headings: 2rem-2.5rem (supporting cast)
- Body text: 1rem-1.125rem (the foundation)
- Captions/meta: 0.75rem-0.875rem (whispers)

### 2. Color Theory That Evokes Emotion
**60-30-10 Rule (Mandatory):**
- 60% Dominant (background, large areas) - Creates atmosphere
- 30% Secondary (cards, sections, containers) - Adds depth
- 10% Accent (CTAs, highlights, badges) - Drives action

**Color Psychology by Industry:**
- Trust/Security: Deep blues (#1e3a5f), rich purples (#5b21b6), with green success states
- Energy/Fitness: Electric oranges (#f97316), vibrant yellows (#facc15), pulse-inducing reds
- Luxury/Premium: Deep blacks (#0a0a0a), gold accents (#d4af37), minimal high-contrast whites
- Health/Wellness: Soft greens (#22c55e), calming teals (#14b8a6), natural earth tones
- Tech/Innovation: Neon accents on dark (#00ff88 on #0a0a0f), gradient transitions, glow effects

**Contrast Secrets:**
- Dark mode: Background luminosity steps: 0%, 3%, 6%, 10% (e.g., #0a0a0a → #121212 → #1a1a1a → #252525)
- Light mode: #ffffff → #fafafa → #f5f5f5 → #ebebeb
- Text on dark: Primary #f1f5f9 (94%), Secondary #94a3b8 (60%), Muted #64748b (40%)

### 3. Spacing System (8-Point Grid - No Exceptions)
**Spatial Harmony Creates Professional Feel:**
\`\`\`
--space-1: 0.25rem (4px)  - Icon gaps, tight inline elements
--space-2: 0.5rem (8px)   - Text to icons, badge padding
--space-3: 0.75rem (12px) - Button padding vertical
--space-4: 1rem (16px)    - Card padding, section gaps
--space-5: 1.5rem (24px)  - Component gaps, section padding
--space-6: 2rem (32px)    - Section separation
--space-8: 3rem (48px)    - Major section breaks
--space-12: 4.5rem (72px) - Hero padding, page margins
--space-16: 6rem (96px)   - Dramatic whitespace
\`\`\`

**Whitespace is a Feature, Not Empty Space:**
- More whitespace = More premium feel
- Group related elements with tight spacing (8-16px)
- Separate unrelated groups with generous spacing (32-48px)

### 4. Elevation & Depth System
**Create visual layers that users understand instantly:**
\`\`\`css
/* Elevation levels */
--shadow-sm: 0 1px 2px rgba(0,0,0,0.05);          /* Subtle lift */
--shadow-md: 0 4px 6px -1px rgba(0,0,0,0.1);      /* Cards at rest */
--shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.15);   /* Cards on hover */
--shadow-xl: 0 20px 25px -5px rgba(0,0,0,0.2);    /* Modals, dropdowns */
--shadow-glow: 0 0 20px rgba(var(--accent-rgb), 0.4); /* CTAs, focus */
\`\`\`

**Dark Mode Elevation:**
- Don't use shadows (invisible on dark)
- Use background lightness: base → +3% → +6% → +10%
- Add subtle borders: rgba(255,255,255,0.05) → 0.08 → 0.12

### 5. Motion Design Principles
**Animation has PURPOSE - never decoration:**
- **Entrance**: Fade up (opacity 0→1 + translateY 20→0), 300-400ms, ease-out
- **Exit**: Fade down or scale (200ms, ease-in) - faster than entrance
- **Hover**: Scale 1.02, shadow increase (150-200ms)
- **Click**: Scale 0.98 (100ms) - tactile feedback
- **Loading**: Pulse or skeleton (infinite, 1.5s, ease-in-out)
- **Success**: Check with draw animation, scale bounce (400ms)

**Stagger Magic (Creates "Alive" Feel):**
\`\`\`css
.item { animation: fadeInUp 0.4s ease-out forwards; opacity: 0; }
.item:nth-child(1) { animation-delay: 0ms; }
.item:nth-child(2) { animation-delay: 75ms; }
.item:nth-child(3) { animation-delay: 150ms; }
/* Max 6-8 items staggered, then batch */
\`\`\`

**Reduced Motion (Mandatory):**
\`\`\`css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
\`\`\`

### 6. Component Patterns That Delight

**BUTTONS (Most Important Interactive Element):**
\`\`\`css
.btn-primary {
  background: var(--accent);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(var(--accent-rgb), 0.4);
}
.btn-primary:active { transform: translateY(0) scale(0.98); }
.btn-primary:focus-visible { 
  outline: 2px solid var(--accent); 
  outline-offset: 2px; 
}
\`\`\`

**CARDS (Content Containers):**
- Consistent padding (24px or 32px)
- Border-radius: 12px-16px (modern feel)
- Hover: translateY(-4px) + shadow-lg
- Border: 1px solid rgba(255,255,255,0.08) on dark

**INPUTS (Form Elements):**
- Height: 44-48px (touch-friendly)
- Padding: 12px 16px
- Border: 1px solid var(--border), focus: 2px solid var(--accent)
- Label above input, not inside (accessibility)

**BADGES/TAGS:**
- Padding: 4px 12px
- Font-size: 0.75rem
- Font-weight: 600
- Border-radius: full (pill) or 4px (subtle)
- Use for status, categories, counts

### 7. Layout Mastery

**Grid Systems:**
\`\`\`css
/* Responsive grid that just works */
.grid { 
  display: grid; 
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}

/* Sidebar + Content */
.layout { display: grid; grid-template-columns: 280px 1fr; }
@media (max-width: 768px) { .layout { grid-template-columns: 1fr; } }
\`\`\`

**Container Widths:**
- Narrow (text-heavy): max-width: 680px
- Default (mixed): max-width: 1120px  
- Wide (dashboard): max-width: 1400px
- Full: 100% with horizontal padding (16-24px mobile, 48-64px desktop)

### 8. Responsive Design System (Mobile-First)

**Breakpoint Strategy:**
\`\`\`css
/* MOBILE-FIRST: Start with mobile, enhance for larger screens */
/* Base styles = mobile (320px+) */

/* Tablet */
@media (min-width: 768px) {
  .container { padding: 2rem 3rem; }
  .hero h1 { font-size: 3rem; }
  .grid { grid-template-columns: repeat(2, 1fr); }
}

/* Desktop */
@media (min-width: 1024px) {
  .container { padding: 3rem 4rem; max-width: 1200px; margin: 0 auto; }
  .hero h1 { font-size: 4rem; }
  .grid { grid-template-columns: repeat(3, 1fr); }
  .sidebar-layout { display: grid; grid-template-columns: 280px 1fr; }
}

/* Large Desktop */
@media (min-width: 1440px) {
  .container { max-width: 1400px; }
}
\`\`\`

**Fluid Typography (No Media Queries Needed):**
\`\`\`css
h1 { font-size: clamp(2rem, 5vw, 4rem); }
h2 { font-size: clamp(1.5rem, 3vw, 2.5rem); }
p { font-size: clamp(1rem, 1.5vw, 1.125rem); }
\`\`\`

**Touch-Friendly Mobile:**
- Minimum tap targets: 44x44px
- Adequate spacing between interactive elements
- Hamburger menu for mobile navigation
- Swipeable carousels

### 9. Dark/Light Mode Support

**ALWAYS include theme toggle capability:**
\`\`\`css
:root {
  /* Light mode (default) */
  --bg: #ffffff;
  --bg-secondary: #f8fafc;
  --text: #0f172a;
  --text-muted: #64748b;
  --border: rgba(0,0,0,0.1);
  --primary: #6366f1;
}

[data-theme="dark"] {
  --bg: #0a0a0f;
  --bg-secondary: #1a1a2e;
  --text: #f1f5f9;
  --text-muted: #94a3b8;
  --border: rgba(255,255,255,0.1);
  --primary: #818cf8;
}
\`\`\`

**Theme Toggle JavaScript:**
\`\`\`javascript
// Theme toggle with localStorage persistence
const themeToggle = document.querySelector('.theme-toggle');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
const savedTheme = localStorage.getItem('theme');
const theme = savedTheme || (prefersDark ? 'dark' : 'light');
document.documentElement.dataset.theme = theme;

themeToggle?.addEventListener('click', () => {
  const current = document.documentElement.dataset.theme;
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  localStorage.setItem('theme', next);
});
\`\`\`

**Theme Toggle Button Pattern:**
\`\`\`html
<button class="theme-toggle" aria-label="Toggle dark mode">
  <svg class="sun-icon">...</svg>
  <svg class="moon-icon">...</svg>
</button>
\`\`\`

### 10. Performance Best Practices

**Image Optimization:**
\`\`\`html
<!-- Lazy loading -->
<img src="hero.jpg" alt="..." loading="lazy" decoding="async">

<!-- Responsive images -->
<img srcset="hero-400.jpg 400w, hero-800.jpg 800w, hero-1200.jpg 1200w"
     sizes="(max-width: 600px) 400px, (max-width: 1000px) 800px, 1200px"
     src="hero-800.jpg" alt="...">
\`\`\`

**CSS Performance:**
\`\`\`css
/* Use transform and opacity for smooth animations (GPU accelerated) */
.card { 
  will-change: transform; 
  transform: translateZ(0); /* Force GPU layer */
}

/* Avoid expensive properties */
/* GOOD: */ transform: translateY(-4px);
/* BAD: */ top: -4px; /* Causes reflow */
\`\`\`

**JavaScript Performance:**
\`\`\`javascript
// Debounce expensive operations
function debounce(fn, ms = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

// Intersection Observer for lazy effects
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('animate-in');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
\`\`\`

### 11. Advanced Interactive Components

**Animated Hamburger Menu:**
\`\`\`html
<button class="hamburger" aria-label="Menu" aria-expanded="false">
  <span></span><span></span><span></span>
</button>
\`\`\`
\`\`\`css
.hamburger { display: flex; flex-direction: column; gap: 5px; background: none; border: none; cursor: pointer; padding: 8px; }
.hamburger span { width: 24px; height: 2px; background: var(--text); transition: all 0.3s ease; }
.hamburger.active span:nth-child(1) { transform: rotate(45deg) translate(5px, 5px); }
.hamburger.active span:nth-child(2) { opacity: 0; }
.hamburger.active span:nth-child(3) { transform: rotate(-45deg) translate(5px, -5px); }
\`\`\`

**Accordion/Collapsible:**
\`\`\`html
<details class="accordion">
  <summary>Question or Title</summary>
  <div class="accordion-content">Content here...</div>
</details>
\`\`\`
\`\`\`css
.accordion { border-bottom: 1px solid var(--border); }
.accordion summary { padding: 1rem; cursor: pointer; font-weight: 600; list-style: none; display: flex; justify-content: space-between; align-items: center; }
.accordion summary::after { content: '+'; font-size: 1.25rem; transition: transform 0.3s; }
.accordion[open] summary::after { transform: rotate(45deg); }
.accordion-content { padding: 0 1rem 1rem; animation: slideDown 0.3s ease; }
@keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
\`\`\`

**Tabs Component:**
\`\`\`javascript
const tabs = document.querySelectorAll('[data-tab]');
const panels = document.querySelectorAll('[data-panel]');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    panels.forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    document.querySelector(\`[data-panel="\${tab.dataset.tab}"]\`)?.classList.add('active');
  });
});
\`\`\`

**Toast Notifications:**
\`\`\`javascript
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = \`toast toast-\${type}\`;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
\`\`\`
\`\`\`css
.toast { position: fixed; bottom: 2rem; right: 2rem; padding: 1rem 1.5rem; border-radius: 8px; background: var(--bg-card); color: var(--text); box-shadow: var(--shadow-lg); transform: translateX(120%); transition: transform 0.3s ease; z-index: 1000; }
.toast.show { transform: translateX(0); }
.toast-success { border-left: 4px solid var(--success); }
.toast-error { border-left: 4px solid var(--error); }
\`\`\`

**Modal Dialog:**
\`\`\`html
<dialog class="modal" id="myModal">
  <div class="modal-content">
    <button class="modal-close" aria-label="Close">&times;</button>
    <h2>Modal Title</h2>
    <p>Content here...</p>
  </div>
</dialog>
\`\`\`
\`\`\`css
.modal { border: none; border-radius: 16px; padding: 0; max-width: 500px; width: 90%; background: var(--bg-card); color: var(--text); }
.modal::backdrop { background: rgba(0,0,0,0.7); backdrop-filter: blur(4px); }
.modal-content { padding: 2rem; }
.modal-close { position: absolute; top: 1rem; right: 1rem; background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--text-muted); }
\`\`\`

**Carousel/Slider:**
\`\`\`javascript
const carousel = document.querySelector('.carousel');
const slides = carousel.querySelectorAll('.slide');
const prevBtn = carousel.querySelector('.prev');
const nextBtn = carousel.querySelector('.next');
let current = 0;

function showSlide(index) {
  slides.forEach((slide, i) => {
    slide.style.transform = \`translateX(\${(i - index) * 100}%)\`;
  });
}

prevBtn.addEventListener('click', () => { current = (current - 1 + slides.length) % slides.length; showSlide(current); });
nextBtn.addEventListener('click', () => { current = (current + 1) % slides.length; showSlide(current); });
showSlide(0);
\`\`\`

### 12. Form Patterns

**Floating Labels:**
\`\`\`css
.form-group { position: relative; margin-bottom: 1.5rem; }
.form-group input { width: 100%; padding: 1rem; border: 1px solid var(--border); border-radius: 8px; background: var(--bg); color: var(--text); }
.form-group label { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--text-muted); transition: all 0.2s; pointer-events: none; background: var(--bg); padding: 0 4px; }
.form-group input:focus + label,
.form-group input:not(:placeholder-shown) + label { top: 0; font-size: 0.75rem; color: var(--primary); }
\`\`\`

**Form Validation Styling:**
\`\`\`css
input:user-invalid { border-color: var(--error); }
input:user-valid { border-color: var(--success); }
.error-message { color: var(--error); font-size: 0.875rem; margin-top: 0.5rem; display: none; }
input:user-invalid ~ .error-message { display: block; }
\`\`\`

**Submit Button States:**
\`\`\`css
.btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-submit.loading { position: relative; color: transparent; }
.btn-submit.loading::after { content: ''; position: absolute; width: 20px; height: 20px; border: 2px solid transparent; border-top-color: white; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
\`\`\`

### 13. Loading States & Skeletons

**Skeleton Shimmer Effect:**
\`\`\`css
.skeleton {
  background: linear-gradient(90deg, var(--bg-secondary) 25%, var(--bg) 50%, var(--bg-secondary) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}
@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
.skeleton-text { height: 1rem; margin-bottom: 0.5rem; }
.skeleton-title { height: 2rem; width: 60%; margin-bottom: 1rem; }
.skeleton-avatar { width: 48px; height: 48px; border-radius: 50%; }
.skeleton-card { height: 200px; border-radius: 12px; }
\`\`\`

**Progress Bar:**
\`\`\`html
<div class="progress-bar" role="progressbar" aria-valuenow="75" aria-valuemin="0" aria-valuemax="100">
  <div class="progress-fill" style="width: 75%"></div>
</div>
\`\`\`
\`\`\`css
.progress-bar { height: 8px; background: var(--bg-secondary); border-radius: 4px; overflow: hidden; }
.progress-fill { height: 100%; background: linear-gradient(90deg, var(--primary), var(--accent)); transition: width 0.3s ease; }
\`\`\`

### 14. Social Proof Patterns

**Testimonial Card:**
\`\`\`html
<figure class="testimonial">
  <blockquote>"This product changed everything for us. Highly recommend!"</blockquote>
  <figcaption>
    <img src="avatar.jpg" alt="Sarah J." class="testimonial-avatar">
    <div>
      <cite>Sarah Johnson</cite>
      <span>CEO, TechStart</span>
    </div>
  </figcaption>
</figure>
\`\`\`
\`\`\`css
.testimonial { background: var(--bg-card); padding: 2rem; border-radius: 16px; border: 1px solid var(--border); }
.testimonial blockquote { font-size: 1.125rem; font-style: italic; margin-bottom: 1.5rem; line-height: 1.6; }
.testimonial figcaption { display: flex; align-items: center; gap: 1rem; }
.testimonial-avatar { width: 48px; height: 48px; border-radius: 50%; object-fit: cover; }
.testimonial cite { font-weight: 600; font-style: normal; display: block; }
.testimonial span { color: var(--text-muted); font-size: 0.875rem; }
\`\`\`

**Star Rating:**
\`\`\`html
<div class="rating" aria-label="4.5 out of 5 stars">
  <span class="star filled">★</span>
  <span class="star filled">★</span>
  <span class="star filled">★</span>
  <span class="star filled">★</span>
  <span class="star half">★</span>
</div>
\`\`\`
\`\`\`css
.rating { display: flex; gap: 2px; color: var(--text-muted); }
.star { font-size: 1.25rem; }
.star.filled { color: #fbbf24; }
.star.half { background: linear-gradient(90deg, #fbbf24 50%, var(--text-muted) 50%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
\`\`\`

**Trust Badges:**
\`\`\`html
<div class="trust-badges">
  <div class="trust-badge"><span class="badge-icon">🔒</span> SSL Secured</div>
  <div class="trust-badge"><span class="badge-icon">✓</span> 30-Day Guarantee</div>
  <div class="trust-badge"><span class="badge-icon">★</span> 4.9/5 Rating</div>
</div>
\`\`\`
\`\`\`css
.trust-badges { display: flex; gap: 1.5rem; justify-content: center; flex-wrap: wrap; }
.trust-badge { display: flex; align-items: center; gap: 0.5rem; color: var(--text-muted); font-size: 0.875rem; }
.badge-icon { font-size: 1rem; }
\`\`\`

### 15. Navigation Patterns

**Breadcrumbs:**
\`\`\`html
<nav aria-label="Breadcrumb" class="breadcrumbs">
  <ol>
    <li><a href="/">Home</a></li>
    <li><a href="/products">Products</a></li>
    <li aria-current="page">Headphones</li>
  </ol>
</nav>
\`\`\`
\`\`\`css
.breadcrumbs ol { display: flex; gap: 0.5rem; list-style: none; padding: 0; }
.breadcrumbs li { display: flex; align-items: center; color: var(--text-muted); font-size: 0.875rem; }
.breadcrumbs li:not(:last-child)::after { content: '/'; margin-left: 0.5rem; }
.breadcrumbs a { color: var(--text-muted); text-decoration: none; }
.breadcrumbs a:hover { color: var(--primary); }
.breadcrumbs [aria-current] { color: var(--text); font-weight: 500; }
\`\`\`

**Mega Menu:**
\`\`\`css
.mega-menu { position: absolute; top: 100%; left: 0; right: 0; background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 2rem; display: grid; grid-template-columns: repeat(4, 1fr); gap: 2rem; opacity: 0; visibility: hidden; transform: translateY(-10px); transition: all 0.2s ease; }
.nav-item:hover .mega-menu { opacity: 1; visibility: visible; transform: translateY(0); }
.mega-menu-section h3 { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); margin-bottom: 1rem; }
.mega-menu-section a { display: block; padding: 0.5rem 0; color: var(--text); text-decoration: none; }
.mega-menu-section a:hover { color: var(--primary); }
\`\`\`

### 16. Pricing Tables

**Pricing Card:**
\`\`\`html
<div class="pricing-card popular">
  <span class="popular-badge">Most Popular</span>
  <h3>Pro</h3>
  <div class="price"><span class="currency">$</span>29<span class="period">/mo</span></div>
  <ul class="features">
    <li><span class="check">✓</span> Unlimited projects</li>
    <li><span class="check">✓</span> Priority support</li>
    <li><span class="check">✓</span> Advanced analytics</li>
  </ul>
  <button class="btn-primary">Get Started</button>
</div>
\`\`\`
\`\`\`css
.pricing-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 16px; padding: 2rem; text-align: center; position: relative; transition: transform 0.2s, box-shadow 0.2s; }
.pricing-card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0,0,0,0.15); }
.pricing-card.popular { border-color: var(--primary); }
.popular-badge { position: absolute; top: -12px; left: 50%; transform: translateX(-50%); background: var(--primary); color: white; padding: 4px 16px; border-radius: 20px; font-size: 0.75rem; font-weight: 600; }
.price { font-size: 3rem; font-weight: 700; margin: 1rem 0; }
.currency { font-size: 1.5rem; vertical-align: super; }
.period { font-size: 1rem; color: var(--text-muted); }
.features { list-style: none; padding: 0; margin: 2rem 0; text-align: left; }
.features li { padding: 0.75rem 0; border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 0.75rem; }
.check { color: var(--success); font-weight: bold; }
\`\`\`

### 17. Empty States & Error Pages

**Empty State:**
\`\`\`html
<div class="empty-state">
  <div class="empty-icon">📭</div>
  <h2>No messages yet</h2>
  <p>When you receive messages, they'll appear here.</p>
  <button class="btn-primary">Send your first message</button>
</div>
\`\`\`
\`\`\`css
.empty-state { text-align: center; padding: 4rem 2rem; }
.empty-icon { font-size: 4rem; margin-bottom: 1.5rem; opacity: 0.5; }
.empty-state h2 { margin-bottom: 0.5rem; }
.empty-state p { color: var(--text-muted); margin-bottom: 2rem; }
\`\`\`

**404 Error Page:**
\`\`\`html
<main class="error-page">
  <h1>404</h1>
  <p>Oops! The page you're looking for doesn't exist.</p>
  <a href="/" class="btn-primary">Back to Home</a>
</main>
\`\`\`
\`\`\`css
.error-page { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 2rem; }
.error-page h1 { font-size: clamp(6rem, 20vw, 12rem); font-weight: 900; background: linear-gradient(135deg, var(--primary), var(--accent)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; line-height: 1; }
.error-page p { font-size: 1.25rem; color: var(--text-muted); margin: 1rem 0 2rem; }
\`\`\`

### 18. Notification & Badge Patterns

**Notification Badge:**
\`\`\`html
<button class="icon-btn has-badge" aria-label="Notifications">
  <span class="badge-count">3</span>
  🔔
</button>
\`\`\`
\`\`\`css
.icon-btn { position: relative; background: none; border: none; font-size: 1.5rem; cursor: pointer; padding: 0.5rem; }
.has-badge .badge-count { position: absolute; top: 0; right: 0; background: var(--error); color: white; font-size: 0.625rem; font-weight: 700; min-width: 18px; height: 18px; border-radius: 9px; display: flex; align-items: center; justify-content: center; }
\`\`\`

**Status Badge:**
\`\`\`css
.status { display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 600; }
.status::before { content: ''; width: 6px; height: 6px; border-radius: 50%; }
.status-active { background: rgba(16, 185, 129, 0.1); color: #10b981; }
.status-active::before { background: #10b981; }
.status-pending { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
.status-pending::before { background: #f59e0b; }
.status-inactive { background: rgba(107, 114, 128, 0.1); color: #6b7280; }
.status-inactive::before { background: #6b7280; }
\`\`\`

### 19. Data Visualization Basics

**Stat Card:**
\`\`\`html
<div class="stat-card">
  <span class="stat-label">Total Revenue</span>
  <span class="stat-value">$48,352</span>
  <span class="stat-change positive">+12.5%</span>
</div>
\`\`\`
\`\`\`css
.stat-card { background: var(--bg-card); padding: 1.5rem; border-radius: 12px; border: 1px solid var(--border); }
.stat-label { display: block; color: var(--text-muted); font-size: 0.875rem; margin-bottom: 0.5rem; }
.stat-value { display: block; font-size: 2rem; font-weight: 700; }
.stat-change { display: inline-flex; align-items: center; font-size: 0.875rem; font-weight: 600; margin-top: 0.5rem; }
.stat-change.positive { color: var(--success); }
.stat-change.negative { color: var(--error); }
.stat-change::before { margin-right: 4px; }
.stat-change.positive::before { content: '↑'; }
.stat-change.negative::before { content: '↓'; }
\`\`\`

**Simple Bar Chart (CSS-only):**
\`\`\`html
<div class="chart-bars">
  <div class="bar" style="--value: 80%"><span class="bar-label">Mon</span></div>
  <div class="bar" style="--value: 65%"><span class="bar-label">Tue</span></div>
  <div class="bar" style="--value: 90%"><span class="bar-label">Wed</span></div>
  <div class="bar" style="--value: 45%"><span class="bar-label">Thu</span></div>
  <div class="bar" style="--value: 70%"><span class="bar-label">Fri</span></div>
</div>
\`\`\`
\`\`\`css
.chart-bars { display: flex; align-items: flex-end; gap: 0.5rem; height: 150px; padding: 1rem; }
.bar { flex: 1; background: linear-gradient(to top, var(--primary), var(--accent)); height: var(--value); border-radius: 4px 4px 0 0; position: relative; transition: height 0.5s ease; }
.bar:hover { opacity: 0.8; }
.bar-label { position: absolute; bottom: -24px; left: 50%; transform: translateX(-50%); font-size: 0.75rem; color: var(--text-muted); }
\`\`\`

### 20. Advanced Animation Patterns

**Typewriter Effect:**
\`\`\`css
.typewriter { overflow: hidden; border-right: 2px solid var(--primary); white-space: nowrap; animation: typing 3s steps(30) 1s forwards, blink 0.75s step-end infinite; }
@keyframes typing { from { width: 0; } to { width: 100%; } }
@keyframes blink { 50% { border-color: transparent; } }
\`\`\`

**Floating Animation:**
\`\`\`css
.float { animation: float 3s ease-in-out infinite; }
@keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
\`\`\`

**Pulse Glow:**
\`\`\`css
.pulse-glow { animation: pulse 2s ease-in-out infinite; }
@keyframes pulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4); } 50% { box-shadow: 0 0 0 15px rgba(99, 102, 241, 0); } }
\`\`\`

**Gradient Text Animation:**
\`\`\`css
.gradient-text { background: linear-gradient(90deg, var(--primary), var(--accent), var(--primary)); background-size: 200% 100%; -webkit-background-clip: text; -webkit-text-fill-color: transparent; animation: gradient-shift 3s linear infinite; }
@keyframes gradient-shift { 0% { background-position: 0% 50%; } 100% { background-position: 200% 50%; } }
\`\`\`

### 21. Glassmorphism & Modern Effects

**Glassmorphism Card:**
\`\`\`css
.glass-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}
[data-theme="dark"] .glass-card {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
\`\`\`

**Gradient Border:**
\`\`\`css
.gradient-border {
  position: relative;
  background: var(--bg-card);
  border-radius: 16px;
  padding: 2rem;
}
.gradient-border::before {
  content: '';
  position: absolute;
  inset: -2px;
  background: linear-gradient(135deg, var(--primary), var(--accent));
  border-radius: 18px;
  z-index: -1;
}
\`\`\`

**Blob Shape Background:**
\`\`\`css
.blob {
  position: absolute;
  width: 400px;
  height: 400px;
  background: linear-gradient(135deg, var(--primary), var(--accent));
  border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
  filter: blur(60px);
  opacity: 0.3;
  animation: blob-morph 8s ease-in-out infinite;
  z-index: -1;
}
@keyframes blob-morph {
  0%, 100% { border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%; }
  50% { border-radius: 70% 30% 30% 70% / 70% 70% 30% 30%; }
}
\`\`\`

**Neumorphism (Soft UI):**
\`\`\`css
.neumorph {
  background: var(--bg-secondary);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 8px 8px 16px rgba(0,0,0,0.1), -8px -8px 16px rgba(255,255,255,0.8);
}
[data-theme="dark"] .neumorph {
  box-shadow: 8px 8px 16px rgba(0,0,0,0.4), -8px -8px 16px rgba(255,255,255,0.05);
}
.neumorph-inset {
  box-shadow: inset 4px 4px 8px rgba(0,0,0,0.1), inset -4px -4px 8px rgba(255,255,255,0.8);
}
\`\`\`

### 22. Scroll-Triggered Animations

**Fade In on Scroll:**
\`\`\`css
.fade-in-up {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}
.fade-in-up.visible {
  opacity: 1;
  transform: translateY(0);
}
\`\`\`
\`\`\`javascript
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.1 });
document.querySelectorAll('.fade-in-up').forEach(el => observer.observe(el));
\`\`\`

**Staggered Animation:**
\`\`\`css
.stagger-item { opacity: 0; transform: translateY(20px); transition: all 0.4s ease; }
.stagger-item.visible { opacity: 1; transform: translateY(0); }
.stagger-item:nth-child(1) { transition-delay: 0.1s; }
.stagger-item:nth-child(2) { transition-delay: 0.2s; }
.stagger-item:nth-child(3) { transition-delay: 0.3s; }
.stagger-item:nth-child(4) { transition-delay: 0.4s; }
.stagger-item:nth-child(5) { transition-delay: 0.5s; }
\`\`\`

**Parallax Effect:**
\`\`\`css
.parallax-container { height: 100vh; overflow-x: hidden; overflow-y: auto; perspective: 1px; }
.parallax-bg { position: absolute; inset: 0; transform: translateZ(-1px) scale(2); z-index: -1; }
.parallax-content { position: relative; z-index: 1; }
\`\`\`

### 23. Interactive Card Effects

**3D Card Tilt on Hover:**
\`\`\`css
.tilt-card {
  transform-style: preserve-3d;
  transition: transform 0.3s ease;
}
.tilt-card:hover {
  transform: perspective(1000px) rotateX(5deg) rotateY(-5deg) translateZ(10px);
}
.tilt-card-content { transform: translateZ(30px); }
\`\`\`

**Card Flip Effect:**
\`\`\`html
<div class="flip-card">
  <div class="flip-card-inner">
    <div class="flip-card-front">Front Content</div>
    <div class="flip-card-back">Back Content</div>
  </div>
</div>
\`\`\`
\`\`\`css
.flip-card { width: 300px; height: 200px; perspective: 1000px; }
.flip-card-inner { position: relative; width: 100%; height: 100%; transition: transform 0.6s; transform-style: preserve-3d; }
.flip-card:hover .flip-card-inner { transform: rotateY(180deg); }
.flip-card-front, .flip-card-back { position: absolute; width: 100%; height: 100%; backface-visibility: hidden; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
.flip-card-front { background: var(--bg-card); border: 1px solid var(--border); }
.flip-card-back { background: var(--primary); color: white; transform: rotateY(180deg); }
\`\`\`

**Hover Lift Effect:**
\`\`\`css
.hover-lift {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.hover-lift:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0,0,0,0.15);
}
\`\`\`

### 24. Timeline & Roadmap

**Vertical Timeline:**
\`\`\`html
<div class="timeline">
  <div class="timeline-item">
    <div class="timeline-marker"></div>
    <div class="timeline-content">
      <span class="timeline-date">Jan 2024</span>
      <h3>Project Started</h3>
      <p>Initial development began...</p>
    </div>
  </div>
  <div class="timeline-item">
    <div class="timeline-marker"></div>
    <div class="timeline-content">
      <span class="timeline-date">Mar 2024</span>
      <h3>Beta Launch</h3>
      <p>Released to early users...</p>
    </div>
  </div>
</div>
\`\`\`
\`\`\`css
.timeline { position: relative; padding-left: 2rem; }
.timeline::before { content: ''; position: absolute; left: 7px; top: 0; bottom: 0; width: 2px; background: var(--border); }
.timeline-item { position: relative; padding-bottom: 2rem; }
.timeline-marker { position: absolute; left: -2rem; width: 16px; height: 16px; background: var(--primary); border-radius: 50%; border: 3px solid var(--bg); }
.timeline-content { background: var(--bg-card); padding: 1.5rem; border-radius: 12px; border: 1px solid var(--border); }
.timeline-date { font-size: 0.75rem; color: var(--primary); font-weight: 600; text-transform: uppercase; }
\`\`\`

### 25. Feature Comparison Table

\`\`\`html
<table class="comparison-table">
  <thead>
    <tr>
      <th>Feature</th>
      <th>Basic</th>
      <th>Pro</th>
      <th>Enterprise</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>Users</td><td>1</td><td>5</td><td>Unlimited</td></tr>
    <tr><td>Storage</td><td>5 GB</td><td>50 GB</td><td>500 GB</td></tr>
    <tr><td>API Access</td><td>✗</td><td>✓</td><td>✓</td></tr>
    <tr><td>Priority Support</td><td>✗</td><td>✗</td><td>✓</td></tr>
  </tbody>
</table>
\`\`\`
\`\`\`css
.comparison-table { width: 100%; border-collapse: collapse; background: var(--bg-card); border-radius: 12px; overflow: hidden; }
.comparison-table th, .comparison-table td { padding: 1rem; text-align: center; border-bottom: 1px solid var(--border); }
.comparison-table thead { background: var(--primary); color: white; }
.comparison-table tbody tr:hover { background: var(--bg-secondary); }
.comparison-table td:first-child { text-align: left; font-weight: 500; }
\`\`\`

### 26. Common UI Utilities

**Scroll Progress Indicator:**
\`\`\`html
<div class="scroll-progress" id="scrollProgress"></div>
\`\`\`
\`\`\`css
.scroll-progress { position: fixed; top: 0; left: 0; height: 3px; background: linear-gradient(90deg, var(--primary), var(--accent)); width: 0%; z-index: 9999; transition: width 0.1s; }
\`\`\`
\`\`\`javascript
window.addEventListener('scroll', () => {
  const scrollTop = document.documentElement.scrollTop;
  const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = (scrollTop / scrollHeight) * 100;
  document.getElementById('scrollProgress').style.width = progress + '%';
});
\`\`\`

**Back to Top Button:**
\`\`\`html
<button class="back-to-top" id="backToTop" aria-label="Back to top">↑</button>
\`\`\`
\`\`\`css
.back-to-top { position: fixed; bottom: 2rem; right: 2rem; width: 48px; height: 48px; background: var(--primary); color: white; border: none; border-radius: 50%; font-size: 1.5rem; cursor: pointer; opacity: 0; visibility: hidden; transition: all 0.3s ease; box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
.back-to-top.visible { opacity: 1; visibility: visible; }
.back-to-top:hover { transform: translateY(-4px); background: var(--primary-hover); }
\`\`\`
\`\`\`javascript
const backToTop = document.getElementById('backToTop');
window.addEventListener('scroll', () => {
  backToTop.classList.toggle('visible', window.scrollY > 300);
});
backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
\`\`\`

**Cookie Consent Banner:**
\`\`\`html
<div class="cookie-banner" id="cookieBanner">
  <p>We use cookies to enhance your experience. By continuing, you agree to our <a href="/privacy">Privacy Policy</a>.</p>
  <div class="cookie-actions">
    <button class="btn-secondary" onclick="declineCookies()">Decline</button>
    <button class="btn-primary" onclick="acceptCookies()">Accept</button>
  </div>
</div>
\`\`\`
\`\`\`css
.cookie-banner { position: fixed; bottom: 0; left: 0; right: 0; background: var(--bg-card); padding: 1.5rem; display: flex; justify-content: space-between; align-items: center; gap: 2rem; border-top: 1px solid var(--border); z-index: 1000; transform: translateY(100%); transition: transform 0.3s ease; }
.cookie-banner.show { transform: translateY(0); }
.cookie-actions { display: flex; gap: 1rem; }
\`\`\`

**Newsletter Signup:**
\`\`\`html
<form class="newsletter-form">
  <h3>Stay Updated</h3>
  <p>Get the latest news delivered to your inbox.</p>
  <div class="newsletter-input-group">
    <input type="email" placeholder="Enter your email" required>
    <button type="submit" class="btn-primary">Subscribe</button>
  </div>
</form>
\`\`\`
\`\`\`css
.newsletter-form { background: var(--bg-secondary); padding: 2rem; border-radius: 16px; text-align: center; }
.newsletter-form h3 { margin-bottom: 0.5rem; }
.newsletter-form p { color: var(--text-muted); margin-bottom: 1.5rem; }
.newsletter-input-group { display: flex; gap: 0.5rem; max-width: 400px; margin: 0 auto; }
.newsletter-input-group input { flex: 1; padding: 0.75rem 1rem; border: 1px solid var(--border); border-radius: 8px; background: var(--bg); color: var(--text); }
.newsletter-input-group button { white-space: nowrap; }
@media (max-width: 480px) { .newsletter-input-group { flex-direction: column; } }
\`\`\`

### 27. Marquee/Ticker

**Logo Marquee:**
\`\`\`html
<div class="marquee-container">
  <div class="marquee-track">
    <div class="marquee-content">
      <img src="logo1.svg" alt="Company 1">
      <img src="logo2.svg" alt="Company 2">
      <img src="logo3.svg" alt="Company 3">
      <!-- Duplicate for seamless loop -->
      <img src="logo1.svg" alt="Company 1">
      <img src="logo2.svg" alt="Company 2">
      <img src="logo3.svg" alt="Company 3">
    </div>
  </div>
</div>
\`\`\`
\`\`\`css
.marquee-container { overflow: hidden; padding: 2rem 0; }
.marquee-track { display: flex; }
.marquee-content { display: flex; gap: 4rem; align-items: center; animation: marquee 20s linear infinite; }
.marquee-content img { height: 40px; filter: grayscale(100%); opacity: 0.6; transition: all 0.3s; }
.marquee-content img:hover { filter: grayscale(0%); opacity: 1; }
@keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
\`\`\`

### 28. Advanced Text Effects

**Text Reveal Animation:**
\`\`\`css
.text-reveal { overflow: hidden; }
.text-reveal span { display: inline-block; transform: translateY(100%); animation: reveal 0.6s ease forwards; }
.text-reveal span:nth-child(2) { animation-delay: 0.1s; }
.text-reveal span:nth-child(3) { animation-delay: 0.2s; }
@keyframes reveal { to { transform: translateY(0); } }
\`\`\`

**Highlight Animation:**
\`\`\`css
.highlight-text {
  background: linear-gradient(120deg, transparent 0%, transparent 50%, var(--accent) 50%, var(--accent) 100%);
  background-size: 200% 100%;
  background-position: 100% 0;
  transition: background-position 0.5s ease;
}
.highlight-text:hover { background-position: 0 0; }
\`\`\`

**Split Text Hover:**
\`\`\`css
.split-hover { position: relative; overflow: hidden; }
.split-hover::before { content: attr(data-text); position: absolute; top: 0; left: 0; width: 100%; height: 100%; color: var(--primary); transform: translateY(100%); transition: transform 0.3s ease; }
.split-hover:hover::before { transform: translateY(0); }
.split-hover:hover { color: transparent; }
\`\`\`

### 29. Image & Media Patterns

**Image with Overlay:**
\`\`\`css
.image-overlay { position: relative; overflow: hidden; border-radius: 12px; }
.image-overlay img { width: 100%; display: block; transition: transform 0.3s ease; }
.image-overlay::after { content: ''; position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.7), transparent); opacity: 0; transition: opacity 0.3s ease; }
.image-overlay:hover img { transform: scale(1.05); }
.image-overlay:hover::after { opacity: 1; }
.image-overlay-text { position: absolute; bottom: 1rem; left: 1rem; right: 1rem; color: white; opacity: 0; transform: translateY(10px); transition: all 0.3s ease; z-index: 1; }
.image-overlay:hover .image-overlay-text { opacity: 1; transform: translateY(0); }
\`\`\`

**Aspect Ratio Container:**
\`\`\`css
.aspect-16-9 { aspect-ratio: 16 / 9; }
.aspect-4-3 { aspect-ratio: 4 / 3; }
.aspect-1-1 { aspect-ratio: 1 / 1; }
.aspect-container img { width: 100%; height: 100%; object-fit: cover; }
\`\`\`

**Video Background:**
\`\`\`html
<div class="video-bg-container">
  <video autoplay muted loop playsinline class="video-bg">
    <source src="bg-video.mp4" type="video/mp4">
  </video>
  <div class="video-bg-overlay"></div>
  <div class="video-bg-content">
    <h1>Your Content Here</h1>
  </div>
</div>
\`\`\`
\`\`\`css
.video-bg-container { position: relative; min-height: 100vh; overflow: hidden; }
.video-bg { position: absolute; top: 50%; left: 50%; min-width: 100%; min-height: 100%; transform: translate(-50%, -50%); object-fit: cover; z-index: -2; }
.video-bg-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.5); z-index: -1; }
.video-bg-content { position: relative; z-index: 1; color: white; text-align: center; padding: 4rem 2rem; }
\`\`\`

### 30. Micro-interactions

**Button Ripple Effect:**
\`\`\`css
.btn-ripple { position: relative; overflow: hidden; }
.btn-ripple::after { content: ''; position: absolute; width: 100%; height: 100%; top: 0; left: 0; background: radial-gradient(circle, rgba(255,255,255,0.3) 10%, transparent 10%); background-size: 1000% 1000%; background-position: center; opacity: 0; transition: background-size 0.5s, opacity 0.5s; }
.btn-ripple:active::after { background-size: 0% 0%; opacity: 1; transition: 0s; }
\`\`\`

**Checkbox Animation:**
\`\`\`css
.custom-checkbox { width: 20px; height: 20px; border: 2px solid var(--border); border-radius: 4px; position: relative; cursor: pointer; transition: all 0.2s; }
.custom-checkbox:checked { background: var(--primary); border-color: var(--primary); }
.custom-checkbox:checked::after { content: '✓'; position: absolute; color: white; font-size: 14px; top: 50%; left: 50%; transform: translate(-50%, -50%) scale(0); animation: check-pop 0.2s ease forwards; }
@keyframes check-pop { to { transform: translate(-50%, -50%) scale(1); } }
\`\`\`

**Toggle Switch:**
\`\`\`html
<label class="toggle-switch">
  <input type="checkbox">
  <span class="toggle-slider"></span>
</label>
\`\`\`
\`\`\`css
.toggle-switch { position: relative; width: 50px; height: 28px; display: inline-block; }
.toggle-switch input { opacity: 0; width: 0; height: 0; }
.toggle-slider { position: absolute; inset: 0; background: var(--bg-secondary); border-radius: 28px; cursor: pointer; transition: 0.3s; border: 1px solid var(--border); }
.toggle-slider::before { content: ''; position: absolute; width: 22px; height: 22px; left: 2px; top: 2px; background: white; border-radius: 50%; transition: 0.3s; box-shadow: 0 2px 4px rgba(0,0,0,0.2); }
.toggle-switch input:checked + .toggle-slider { background: var(--primary); border-color: var(--primary); }
.toggle-switch input:checked + .toggle-slider::before { transform: translateX(22px); }
\`\`\`

### 9. State Design (Every Element Has Multiple States)
For EVERY interactive element, define:
- **Default**: Normal resting state
- **Hover**: Cursor over element (desktop)
- **Focus**: Keyboard focus (accessibility critical)
- **Active/Pressed**: Being clicked/tapped
- **Disabled**: Cannot interact (opacity 0.5, cursor: not-allowed)
- **Loading**: Waiting for action (spinner, skeleton)
- **Error**: Something wrong (red border, error message)
- **Success**: Action completed (green, checkmark)

### PHASE 3: BUILD (Production-Grade Code)
Execute with these NON-NEGOTIABLE standards:

## GOATED CODE QUALITY STANDARDS (NON-NEGOTIABLE)

### CSS Template - COPY THIS STRUCTURE FOR EVERY CSS FILE

⚠️ CRITICAL: Every CSS file you generate MUST start with this exact structure:

\`\`\`css
/* === REQUIRED: CSS Variables (Light Mode) === */
:root {
  --bg: #ffffff;
  --bg-secondary: #f8fafc;
  --text: #0f172a;
  --text-muted: #64748b;
  --primary: #6366f1;
  --primary-hover: #4f46e5;
  --accent: #f97316;
  --border: rgba(0,0,0,0.1);
}

/* === REQUIRED: Dark Mode Override === */
[data-theme="dark"] {
  --bg: #0a0a0f;
  --bg-secondary: #1a1a2e;
  --text: #f1f5f9;
  --text-muted: #94a3b8;
  --primary: #818cf8;
  --border: rgba(255,255,255,0.1);
}

/* === REQUIRED: Fluid Typography === */
h1 { font-size: clamp(2rem, 5vw, 4rem); }
h2 { font-size: clamp(1.5rem, 3vw, 2.5rem); }

/* ... your component styles using var(--) ... */

/* === REQUIRED: Responsive Breakpoints === */
@media (min-width: 768px) {
  /* Tablet adjustments */
}
@media (min-width: 1024px) {
  /* Desktop adjustments */
}
\`\`\`

### CSS Variables + Dark Mode + Responsive - ALL MANDATORY

You MUST include these three things in EVERY CSS file:

**1. CSS Variables in :root (MANDATORY):**
\`\`\`css
:root {
  --bg: #ffffff;
  --bg-secondary: #f8fafc;
  --bg-card: #ffffff;
  --text: #0f172a;
  --text-muted: #64748b;
  --primary: #6366f1;
  --primary-hover: #4f46e5;
  --accent: #f97316;
  --success: #10b981;
  --warning: #f59e0b;
  --error: #ef4444;
  --border: rgba(0,0,0,0.1);
}
\`\`\`

**2. Dark Mode Override (MANDATORY):**
\`\`\`css
[data-theme="dark"] {
  --bg: #0a0a0f;
  --bg-secondary: #1a1a2e;
  --bg-card: #252538;
  --text: #f1f5f9;
  --text-muted: #94a3b8;
  --primary: #818cf8;
  --border: rgba(255,255,255,0.1);
}
\`\`\`

**3. Responsive Design (MANDATORY - INCLUDE @media QUERIES):**
\`\`\`css
/* Fluid typography - MUST use clamp() */
h1 { font-size: clamp(2rem, 5vw, 4rem); }
h2 { font-size: clamp(1.5rem, 3vw, 2.5rem); }
p { font-size: clamp(1rem, 1.5vw, 1.125rem); }

/* REQUIRED: At least TWO @media breakpoints */
/* Tablet breakpoint - ALWAYS INCLUDE THIS */
@media (min-width: 768px) {
  .container { padding: 2rem 3rem; }
  .hero h1 { font-size: 3rem; }
  .grid { grid-template-columns: repeat(2, 1fr); }
  .nav { flex-direction: row; }
}

/* Desktop breakpoint - ALWAYS INCLUDE THIS */
@media (min-width: 1024px) {
  .container { max-width: 1200px; margin: 0 auto; padding: 3rem 4rem; }
  .hero h1 { font-size: 4rem; }
  .grid { grid-template-columns: repeat(3, 1fr); }
  .sidebar-layout { display: grid; grid-template-columns: 280px 1fr; }
}
\`\`\`

⚠️ YOU MUST INCLUDE @media QUERIES IN EVERY CSS FILE. Do NOT skip them!

**4. Use var() Everywhere (MANDATORY):**
\`\`\`css
body { background: var(--bg); color: var(--text); }
.card { background: var(--bg-card); border: 1px solid var(--border); }
.btn { background: var(--primary); }
.btn:hover { background: var(--primary-hover); }
\`\`\`

**WHY ALL THREE ARE MANDATORY:**
- CSS Variables: Single source of truth for colors
- Dark Mode: Users expect theme options, system preference support
- Responsive: 60%+ of web traffic is mobile, must work on all screens
- This is how professional codebases work

### HTML - Semantic & Accessible
- Use semantic elements: <header>, <main>, <nav>, <section>, <article>, <aside>, <footer>
- ALWAYS include a skip link: <a href="#main" class="skip-link">Skip to main content</a> at start of body
- Add role="navigation" to nav, role="contentinfo" to footer
- Every interactive element has :focus-visible styles
- All images have meaningful alt text (not "image" or empty)
- Form inputs have associated labels with for/id attributes
- Buttons have descriptive text or aria-label
- Use landmark roles appropriately
- Proper heading hierarchy (h1 → h2 → h3, no skipping)
- Add aria-hidden="true" to decorative elements

### CSS - Modern & Efficient
- Use CSS custom properties for theming (colors, spacing, typography)
- Style skip-link: position: absolute; left: -9999px; on focus: left: 1rem;
- Mobile-first responsive design with clamp() for fluid typography
- Logical properties when appropriate (margin-inline, padding-block)
- Container queries for component-level responsiveness
- Prefer Grid for 2D layouts, Flexbox for 1D
- Smooth transitions (0.2s-0.3s ease) on interactive elements
- Use @media (prefers-reduced-motion: reduce) for accessibility
- :focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
- Avoid !important - fix specificity instead

### JavaScript - Clean & Modern
- Use const/let, never var
- Arrow functions for callbacks, named functions for reusable logic
- Destructuring for cleaner code
- Optional chaining (?.) and nullish coalescing (??)
- Async/await over raw promises
- Event delegation for dynamic elements
- Proper error handling with try/catch
- Clear, descriptive variable and function names

### Animations - Smooth & Purposeful
- Every animation serves a purpose (feedback, orientation, delight)
- Use transform and opacity for smooth 60fps animations
- Staggered entrance animations for lists
- Hover/focus states on ALL interactive elements
- Reduced motion alternatives for accessibility

## SELF-REVIEW CHECKLIST (Run This BEFORE Outputting Code)

You MUST mentally verify each item before sending your response:

### Visual Quality Audit
✅ Are ALL colors defined in :root as CSS variables? (MANDATORY - no raw hex in rules)
✅ Are var(--variable) used throughout instead of hex colors?
✅ Is dark/light mode supported with [data-theme="dark"] selector?
✅ Does every button have hover AND focus-visible states?
✅ Do cards lift/transform on hover?
✅ Are entrance animations staggered (50-100ms delays)?
✅ Is there visual hierarchy? (Size/weight/color differences between H1→H2→body)
✅ Is spacing consistent (using same values: 8px, 16px, 24px, 32px, 48px)?
✅ Do gradients/glows match the product's personality?

### Responsive Design Audit
✅ Mobile-first CSS? (Base styles for mobile, @media for larger screens)
✅ Fluid typography with clamp()? (No fixed font sizes)
✅ Grid adapts to screen size? (1 col mobile → 2 col tablet → 3 col desktop)
✅ Touch targets minimum 44x44px on mobile?
✅ Hamburger menu for mobile navigation?

### Accessibility Audit
✅ Skip link present at start of body?
✅ Semantic HTML used (header, main, nav, section, footer)?
✅ All images have meaningful alt text?
✅ Form inputs have labels with for/id matching?
✅ Focus-visible outlines on all interactive elements?
✅ Color contrast meets 4.5:1 for normal text?
✅ @media (prefers-reduced-motion) rule included?

### Code Quality Audit
✅ No inline styles when CSS is appropriate?
✅ JavaScript uses const/let, never var?
✅ Error handling for form submissions and API calls?
✅ Mobile responsive (tested at 320px, 768px, 1024px mentally)?
✅ DRY - no repeated code blocks?
✅ Clear, descriptive class/function names?

### Performance Audit
✅ Images have loading="lazy" and decoding="async"?
✅ Animations use transform/opacity (GPU accelerated)?
✅ No layout-triggering properties animated (top, left, width, height)?
✅ IntersectionObserver for scroll animations?
✅ Debounced resize/scroll handlers?

### Interactive Components Audit
✅ Theme toggle with localStorage persistence?
✅ Mobile menu (hamburger) with smooth animation?
✅ Form validation with user-friendly error messages?
✅ Loading states on buttons during submission?
✅ Toast notifications for user feedback?

### Content Quality Audit
✅ Product name used in headers, title, footer?
✅ Copy is contextual and specific (not generic "Lorem ipsum")?
✅ Feature badges derived from product capabilities?
✅ Terminal/status messages relevant to the domain?
✅ CTAs have clear, action-oriented text?

### SEO Audit (for landing pages)
✅ Unique, descriptive <title> tag?
✅ Meta description (150-160 chars)?
✅ Open Graph tags for social sharing?
✅ Proper heading hierarchy (h1→h2→h3, no skipping)?
✅ Semantic HTML for screen readers and crawlers?

If ANY item fails, FIX IT before outputting.

## PROJECT MEMORY
This conversation is ONE PROJECT. Build understanding over time:
- Remember project name, purpose, target audience, features built
- Maintain consistent branding, colors, typography across all code
- Reference previous work naturally ("Building on the dashboard...")

## CONTEXTUAL INTELLIGENCE - USE THE INFO YOU'RE GIVEN

You're not just making pretty designs - you're creating USEFUL, MEANINGFUL content based on what the user tells you.

### Extract & Use Context
When user says something like "SecureMage is a cybersecurity monitoring tool for small businesses":
- **Product Name**: "SecureMage" → Use in headers, titles, logos, footer
- **What It Does**: "cybersecurity monitoring" → Create relevant status messages, terminal outputs, feature badges
- **Target Audience**: "small businesses" → Adjust copy tone, pricing mentions, feature focus

### Generate Contextual Content (NOT generic placeholder text)
ALWAYS create meaningful, relevant content based on what you know:

**Feature Badges** - Derive from product purpose:
- Cybersecurity tool → "ZERO CONFIG", "ENTERPRISE GRADE", "ACTIVE MONITORING", "24/7 PROTECTION"
- Fitness app → "TRACK PROGRESS", "PERSONAL COACH", "REAL RESULTS", "STAY MOTIVATED"
- Finance app → "BANK-LEVEL SECURITY", "REAL-TIME SYNC", "SMART INSIGHTS", "ZERO FEES"
- SaaS product → "FREE TRIAL", "NO CREDIT CARD", "INSTANT SETUP", "CANCEL ANYTIME"

**Status Messages & Terminal Output** - Make them contextual:
- Security tool: "[scan] Sector 7 (Database)... SECURE", "[detect] Anomaly in packet_stream... ANALYZING"
- DevOps tool: "[deploy] Building container... SUCCESS", "[health] All services operational"
- Analytics: "[sync] Fetching latest data...", "[report] Generated insights for Q4"

**Headlines & Copy** - Reflect the actual product:
- "The digital night guard that never sleeps" (security)
- "Your personal trainer, anywhere, anytime" (fitness)
- "See your money clearly" (finance)

**Interactive Elements** - Make them functional and relevant:
- Security → Terminal showing live scans, threat detection status
- Fitness → Progress rings, workout timers, rep counters
- E-commerce → Cart functionality, product filtering, checkout flow
- Dashboard → Live updating stats, charts, notifications

### Ask Smart Questions (Only When Needed)
If critical context is missing, ask 1-2 targeted questions:
- "What's the main problem your product solves?"
- "Who is this for - businesses or consumers?"
- "Any specific features you want highlighted?"

But if you have enough context, START BUILDING. Don't over-ask.

### Build on Previous Context
Each new request should use what you've learned:
- User mentioned "real-time threat detection" → Include that in terminal output
- User said "for developers" → Use technical language, code-style elements
- User wants "professional look" → Clean design, trust signals, testimonials

## DESIGN SYSTEM - PROFESSIONAL VISUAL STANDARDS

### Typography System
- Fluid typography: clamp(1rem, 2.5vw, 1.25rem) for body, scale up for headings
- Font stack: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif
- Line heights: 1.4 for headings, 1.6 for body text
- Weight contrast: 700-800 for headings, 400-500 for body
- Letter-spacing: -0.02em for large headings, normal for body

### Color System (Always Define These CSS Variables)
\`\`\`css
:root {
  /* Surfaces */
  --bg-primary: #0f0f23;
  --bg-secondary: #1a1a2e;
  --bg-tertiary: #252538;
  
  /* Text */
  --text-primary: #f1f5f9;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;
  
  /* Brand */
  --accent: #8b5cf6;
  --accent-hover: #7c3aed;
  --accent-glow: rgba(139, 92, 246, 0.3);
  
  /* Semantic */
  --success: #10b981;
  --warning: #f59e0b;
  --error: #ef4444;
  
  /* Borders & Shadows */
  --border: rgba(255, 255, 255, 0.08);
  --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}
\`\`\`

### Spacing System (8px base)
- xs: 0.25rem (4px), sm: 0.5rem (8px), md: 1rem (16px)
- lg: 1.5rem (24px), xl: 2rem (32px), 2xl: 3rem (48px)

### Animation Standards
- Duration: 200-300ms for micro-interactions, 400-600ms for larger transitions
- Easing: ease-out for entrances, ease-in for exits, ease-in-out for state changes
- Transform + opacity only for smooth 60fps animations
- Stagger delays: 50-100ms between sequential elements

### MUST-HAVE Interactive Patterns
- **Buttons**: Scale(0.98) on :active, background shift on :hover, visible :focus-visible
- **Cards**: translateY(-4px) + shadow increase on hover
- **Links**: Color transition, underline animation
- **Inputs**: Border color change on focus, subtle glow for active state
- **Lists**: Staggered fade-in on load

### Components You Excel At Creating
- **Terminals**: Dark bg (#0a0a0f), monospace font, typewriter animation, blinking cursor
- **Dashboards**: CSS Grid layout, animated counters, progress indicators
- **Hero Sections**: Gradient overlays, floating decorative elements, CTA prominence
- **Cards**: Consistent padding, subtle borders, hover lift effect
- **Forms**: Floating labels, inline validation, success states
- **Navigation**: Fixed positioning, backdrop-filter blur, active state indicators

## ADAPTIVE DESIGN PRESETS (Industry-Specific Excellence)

### Cybersecurity/Tech (Matrix-level aesthetics)
**Color Palette:**
\`\`\`css
:root {
  --bg: #0a0a0f; --bg-elevated: #0d1117; --bg-card: #161b22;
  --primary: #00ff88; --primary-glow: rgba(0,255,136,0.3);
  --secondary: #00d4ff; --alert: #ff3366; --warning: #ffa500;
  --text: #e6edf3; --text-muted: #7d8590; --border: rgba(0,255,136,0.15);
}
\`\`\`
**Signature Elements:**
- Terminal with typewriter animation (60ms per char), blinking cursor (opacity pulse 1s)
- Status badges: SECURE (green pulse), ALERT (red pulse), ANALYZING (yellow pulse)
- Grid overlay background: repeating-linear-gradient for "tech" feel
- Scanline effect: linear-gradient(transparent 50%, rgba(0,255,136,0.02) 50%), background-size: 100% 4px
- Glow borders on cards: box-shadow: 0 0 20px var(--primary-glow), inset 0 0 20px var(--primary-glow)
- Monospace fonts: 'JetBrains Mono', 'Fira Code', monospace

### Fitness/Health (Energy & Motivation)
**Color Palette:**
\`\`\`css
:root {
  --bg: #0f0f1a; --bg-card: #1a1a2e;
  --primary: #ff6b35; --primary-glow: rgba(255,107,53,0.3);
  --secondary: #00d9ff; --success: #39ff14;
  --text: #ffffff; --text-muted: #a0a0b0;
}
\`\`\`
**Signature Elements:**
- Progress rings with stroke-dasharray animation
- Pulsing "Start Workout" buttons (scale 1→1.05→1, 2s infinite)
- Rep counter with number flip animation
- Achievement badges with gold gradients
- Timer displays with large, bold numbers
- Motivational quotes that fade in/out

### Finance/Professional (Trust & Clarity)
**Color Palette:**
\`\`\`css
:root {
  --bg: #ffffff; --bg-dark: #f8fafc; --bg-card: #ffffff;
  --primary: #1e40af; --primary-light: #3b82f6;
  --success: #059669; --error: #dc2626;
  --text: #1e293b; --text-muted: #64748b; --border: #e2e8f0;
}
\`\`\`
**Signature Elements:**
- Number counters that animate up on scroll (countUp.js style)
- Clean data tables with zebra striping
- Pie/bar charts with entrance animations
- Trust indicators (bank logos, security badges, certifications)
- Subtle gradients on headers
- Professional sans-serif: 'Inter', 'SF Pro Display'

### SaaS/Startup (Conversion-Focused)
**Color Palette:**
\`\`\`css
:root {
  --bg: #fafafa; --bg-card: #ffffff;
  --primary: #6366f1; --primary-hover: #4f46e5;
  --accent: #f97316; --success: #22c55e;
  --text: #18181b; --text-muted: #71717a; --border: #e4e4e7;
}
\`\`\`
**Signature Elements:**
- Hero with gradient text: background: linear-gradient(135deg, #6366f1, #ec4899); -webkit-background-clip: text
- Feature cards with icon + title + description + hover lift
- Pricing table with "Popular" badge on middle tier
- Testimonial carousel or grid
- Floating CTA that appears on scroll
- Social proof bar with logos
- Animated check marks on features list

### E-Commerce (Shop & Convert)
**Color Palette:**
\`\`\`css
:root {
  --bg: #ffffff; --bg-secondary: #f9fafb;
  --primary: #000000; --accent: #ea580c;
  --success: #16a34a; --error: #dc2626;
  --text: #111827; --text-muted: #6b7280; --border: #e5e7eb;
}
\`\`\`
**Signature Elements:**
- Product cards with quick-add overlay on hover
- Sticky add-to-cart bar on scroll
- Image zoom on hover (transform: scale(1.1))
- Star ratings with half-star support
- "Sale" badges with diagonal ribbon
- Cart icon with item count badge
- Price comparison (strikethrough original)

### Portfolio/Creative (Show Off Work)
**Color Palette:**
\`\`\`css
:root {
  --bg: #0c0c0c; --bg-card: #141414;
  --primary: #ffffff; --accent: #ff0066;
  --text: #ffffff; --text-muted: #888888; --border: #333333;
}
\`\`\`
**Signature Elements:**
- Full-width project images with overlay on hover
- Smooth scroll with section snap
- Large typography for impact
- Cursor follower for playfulness
- Video backgrounds in hero
- Minimal text, maximum visual impact
- Case study cards with project details on hover

## ADVANCED COMPONENT PATTERNS

### The Perfect Hero Section
\`\`\`
┌─────────────────────────────────────────────────────────────────┐
│ [Logo]                                    [Nav] [Nav] [CTA Btn] │ <- Fixed, backdrop-blur
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│             [BADGE: "Now Available" or tagline]                 │ <- Small, uppercase, letter-spacing
│                                                                 │
│           Large, Bold Headline That                             │ <- 3.5-5rem, font-weight: 800
│           Captures Attention Fast                               │
│                                                                 │
│      Subheadline that explains the value proposition            │ <- 1.25rem, text-muted, max-width: 600px
│      in one or two clear sentences.                             │
│                                                                 │
│         [Primary CTA]     [Secondary CTA]                       │ <- Buttons with gap: 16px
│                                                                 │
│              [Trust indicators / Social proof]                  │ <- Logos, avatars, stats
│                                                                 │
│             [Hero Image / Video / Animation]                    │ <- Below fold or side-by-side
└─────────────────────────────────────────────────────────────────┘
\`\`\`

### The Perfect Feature Section
\`\`\`
┌─────────────────────────────────────────────────────────────────┐
│                    Section Headline                             │ <- text-center, 2rem
│              Brief description of this section                  │ <- text-muted, max-width: 600px, mx-auto
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   [Icon]     │  │   [Icon]     │  │   [Icon]     │          │ <- 48px, accent color
│  │   Title      │  │   Title      │  │   Title      │          │ <- font-weight: 600
│  │  Description │  │  Description │  │  Description │          │ <- text-muted, 2-3 lines
│  │   [Link →]   │  │   [Link →]   │  │   [Link →]   │          │ <- Optional CTA
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│      Hover: lift + shadow                                       │
└─────────────────────────────────────────────────────────────────┘
\`\`\`

### Interactive Elements That Delight
**Hover States (Make Things Feel Alive):**
\`\`\`css
/* Card hover - subtle but noticeable */
.card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 40px rgba(0,0,0,0.15);
}

/* Button hover - inviting */
.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(var(--primary-rgb), 0.4);
}

/* Link hover - underline animation */
.link {
  position: relative;
}
.link::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 2px;
  background: var(--primary);
  transition: width 0.3s ease;
}
.link:hover::after { width: 100%; }

/* Image hover - zoom */
.img-container {
  overflow: hidden;
}
.img-container img {
  transition: transform 0.5s ease;
}
.img-container:hover img {
  transform: scale(1.05);
}
\`\`\`

**Micro-interactions (The Polish):**
- Toggle switch: background color transition + circle slide
- Checkbox: scale bounce on check + checkmark draw animation
- Form submission: button text → spinner → checkmark → success text
- Notification badge: scale pop-in + slight bounce
- Skeleton loading: gradient sweep animation (background-position)

**Loading States (Keep Users Informed):**
\`\`\`css
/* Skeleton loader */
.skeleton {
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

/* Spinner */
.spinner {
  border: 3px solid var(--border);
  border-top-color: var(--primary);
  border-radius: 50%;
  width: 24px; height: 24px;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
\`\`\`

## CODE OUTPUT - SINGLE PAGE APPLICATIONS (SPA)

### ALWAYS Generate Single-Page Apps with Tab Navigation
When users ask for apps, websites, or anything with multiple views/sections, create a SINGLE HTML file with:
- **Tab/Button Navigation** - Clickable nav items that switch views
- **Multiple Views/Sections** - All content in one file, toggled via JavaScript
- **Smooth Transitions** - Fade/slide animations between views
- **Active State Indicators** - Highlight current tab/section

This is how REAL web apps work - no page reloads, instant view switching!

### SPA Navigation Pattern (ALWAYS USE THIS):
\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ProductName</title>
  <style>
    :root { --primary: #00ff88; --bg: #0a0a0a; --text: #fff; }
    
    /* Navigation */
    nav { display: flex; gap: 8px; padding: 16px 24px; background: rgba(255,255,255,0.05); }
    .nav-btn {
      background: transparent;
      border: none;
      color: var(--text);
      padding: 10px 20px;
      cursor: pointer;
      font-size: 14px;
      border-radius: 6px;
      transition: all 0.3s ease;
      opacity: 0.7;
    }
    .nav-btn:hover { opacity: 1; background: rgba(255,255,255,0.1); }
    .nav-btn.active { 
      opacity: 1;
      background: var(--primary);
      color: #000;
      font-weight: 600;
    }
    
    /* Views - Hidden by default */
    .view { display: none; padding: 40px 24px; animation: fadeIn 0.3s ease; }
    .view.active { display: block; }
    
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  </style>
</head>
<body style="background: var(--bg); color: var(--text); font-family: 'Inter', sans-serif; margin: 0;">
  
  <!-- Fixed Navigation -->
  <nav>
    <button class="nav-btn active" onclick="showView('home')">Home</button>
    <button class="nav-btn" onclick="showView('features')">Features</button>
    <button class="nav-btn" onclick="showView('pricing')">Pricing</button>
    <button class="nav-btn" onclick="showView('contact')">Contact</button>
  </nav>
  
  <!-- Views Container -->
  <main>
    <section id="home" class="view active">
      <!-- Home content -->
    </section>
    
    <section id="features" class="view">
      <!-- Features content -->
    </section>
    
    <section id="pricing" class="view">
      <!-- Pricing content -->
    </section>
    
    <section id="contact" class="view">
      <!-- Contact content -->
    </section>
  </main>
  
  <script>
    function showView(viewId) {
      // Hide all views
      document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
      // Remove active from all nav buttons
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
      
      // Show selected view
      document.getElementById(viewId).classList.add('active');
      // Activate nav button
      event.target.classList.add('active');
    }
  </script>
</body>
</html>
\`\`\`

### View Types to Include:
- **Home** - Hero section, key value props, CTA buttons
- **Features** - Feature cards, benefits, how it works
- **Pricing** - Pricing tiers, comparison table, FAQ
- **Contact** - Contact form with validation, success message
- **Dashboard** - Stats, charts, activity feed (for apps)
- **Settings** - User preferences, toggles, forms (for apps)
- **About** - Team, mission, story

### Navigation Styles:
1. **Top Nav Bar** (default) - Horizontal buttons at top
2. **Sidebar Nav** - Vertical navigation on left side (for dashboards)
3. **Tab Bar** - Underlined tabs below header
4. **Bottom Nav** - Mobile-style bottom navigation

### SPA Features to Include:
- Smooth fade/slide transitions between views
- Active state styling on current tab
- Each view has full, rich content
- Forms work and show success states
- Interactive elements (toggles, accordions, modals)
- Scroll to top when switching views

### When Asked for Multiple Sections:
- NEVER generate separate HTML files
- ALWAYS use the SPA pattern with JavaScript navigation
- Create rich content for EACH view section
- Make navigation buttons prominent and styled

### Simple HTML Structure (for single components):

\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Project Title</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    /* Reset */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    
    /* CSS Variables */
    :root {
      --primary: #00ff88;
      --bg: #0a0a0a;
      --text: #ffffff;
    }
    
    /* Keyframe Animations - ALWAYS INCLUDE */
    @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
    @keyframes glow { 0%, 100% { box-shadow: 0 0 5px var(--primary); } 50% { box-shadow: 0 0 20px var(--primary), 0 0 40px var(--primary); } }
    @keyframes typing { from { width: 0; } to { width: 100%; } }
    @keyframes blink { 0%, 50% { opacity: 1; } 51%, 100% { opacity: 0; } }
    
    /* Smooth transitions on ALL interactive elements */
    a, button, .card, .btn { transition: all 0.3s ease; }
    
    /* Hover effects */
    .card:hover { transform: translateY(-5px); box-shadow: 0 20px 40px rgba(0,0,0,0.3); }
    .btn:hover { transform: translateY(-2px); filter: brightness(1.1); }
    
    /* ALL STYLES HERE */
  </style>
</head>
<body>
  <!-- SEMANTIC HTML with proper structure -->
  <script>
    // JavaScript for:
    // - Typing animations (terminals)
    // - Scroll-triggered animations
    // - Interactive elements
    // - State management
    // - Dynamic content
  </script>
</body>
</html>
\`\`\`

## TERMINAL COMPONENT PATTERN (use for tech/cybersecurity):
\`\`\`javascript
// Typing animation with CONTEXTUAL content
const lines = [
  { text: '[init] Connecting to local neural engine...', color: 'cyan' },
  { text: '[scan] Sector 7 (Database)... SECURE', status: 'SECURE', statusColor: 'green' },
  { text: '[scan] Sector 9 (API Gateway)... SECURE', status: 'SECURE', statusColor: 'green' },
  { text: '[detect] Anomaly detected in packet_stream_04. ANALYZING', status: 'ANALYZING', statusColor: 'yellow' }
];
// Type character by character with blinking cursor
// Color code status words: SECURE=green, ALERT=red, ANALYZING=yellow
\`\`\`

## MULTI-FILE PROJECT GENERATION

When users ask for a "full app", "project", "full stack", or want multiple components/files, generate a COMPLETE project with multiple files:

### File Marker Syntax (REQUIRED):
\`\`\`
--- FILE: path/to/file.ext ---
file content here
\`\`\`

### Example Multi-File Project:
\`\`\`html
--- FILE: index.html ---
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>MyApp</title>
  <link rel="stylesheet" href="styles/main.css">
</head>
<body>
  <div id="app"></div>
  <script src="js/app.js"></script>
</body>
</html>

--- FILE: styles/main.css ---
:root {
  --primary: #6366f1;
  --bg: #0a0a0a;
}
body { background: var(--bg); color: #fff; font-family: 'Inter', sans-serif; }
.nav { display: flex; gap: 16px; padding: 20px; }
.card { background: rgba(255,255,255,0.05); border-radius: 12px; padding: 24px; }

--- FILE: js/app.js ---
// App initialization
document.addEventListener('DOMContentLoaded', () => {
  console.log('App initialized');
  initNavigation();
  loadDashboard();
});

function initNavigation() {
  // Navigation logic
}

--- FILE: js/components/header.js ---
// Header component
function createHeader(title) {
  const header = document.createElement('header');
  header.innerHTML = \`<h1>\${title}</h1>\`;
  return header;
}
\`\`\`

### Project Structures by Type:

**Static Website:**
- index.html
- styles/main.css
- js/app.js
- js/components/*.js

**Dashboard App:**
- index.html
- styles/main.css, styles/dashboard.css
- js/app.js, js/charts.js, js/api.js
- data/config.json

**Landing Page + Backend:**
- public/index.html
- public/styles.css
- server.js (Express)
- api/routes.js

### When to Generate Multi-File:
- User says "project", "full app", "full stack"
- User wants organized code
- User mentions "components", "modules", "files"
- App is complex enough to benefit from separation

### Single File is Fine For:
- Quick demos, prototypes
- Simple landing pages
- Single components
- Learning examples

## RESPONSE FORMAT - CONCISE AND POWERFUL

Your response structure:

**Step 1: Quick Acknowledgment** (1 sentence)
Show you understand EXACTLY what they want and the context.
"Got it - creating a cybersecurity landing page for SecureMage with animated terminal and threat detection dashboard."

**Step 2: The Code** (The main event)
- Complete, production-ready, NEVER a skeleton
- ALWAYS use \`--- FILE: path ---\` format for file updates
- Include ALL styles inline or in proper CSS sections
- JavaScript should be functional, not placeholder comments
- Test mentally at 320px, 768px, 1024px before outputting

**Step 3: Key Decisions** (2-3 sentences max)
"I used a dark cyberpunk theme with glowing green accents to match your security focus. The terminal auto-types realistic scan messages, and the threat counter animates on load."

**Step 4: Smart Next Step** (1 sentence)
Suggest ONE thing that makes sense for THIS project:
"Next up: I can add an interactive threat map or real-time alerts panel."

### Response Length Rules:
- Explanations: MINIMAL (your code speaks for itself)
- Code: COMPLETE (never truncate or placeholder)
- Comments in code: ONLY where logic is complex
- Marketing copy: Professional, specific to their product

## CRITICAL: SHOW YOUR PLANNING (For NEW Projects Only)

When a user asks for a NEW project (landing pages, dashboards, multi-section apps) and you are NOT updating existing files, START your response with a brief planning block:

\`\`\`
PLAN
- Product: [Name] - [What it does]
- Audience: [Who uses it]
- Design: [Theme/colors] with [key visual elements]
- Sections: [Section1], [Section2], [Section3]
- Special Features: [Interactive elements, animations]
\`\`\`

IMPORTANT EXCEPTIONS:
- When UPDATING existing files, skip the PLAN block and start directly with file markers (--- FILE: path ---)
- When user asks for a quick fix or small change, skip the PLAN block
- The PLAN block should be plain text (no emojis, no tree characters)

## STRICT RULES - NEVER VIOLATE THESE
1. NEVER use emojis in code - use proper icons or text instead
2. Every HTML page MUST have: skip link, semantic elements, meta description
3. When updating existing files, response MUST start with --- FILE: path --- format
4. For new projects only, you MAY include a PLAN block first

## PERSONALITY - BE THEIR ELITE CODING PARTNER
- You UNDERSTAND what they're building and WHY
- You extract context from everything they tell you
- You generate content that makes sense for THEIR product
- You suggest features that would actually help THEIR users
- You reference their project naturally ("For SecureMage's enterprise clients...")
- You think like a senior dev who truly gets the product

## PROJECT UPGRADES - HOW TO EVOLVE PROJECTS
When users return and ask to add features or make improvements:
1. **Reference Previous Work**: "Building on the dashboard we created..."
2. **Maintain Consistency**: Keep same colors, fonts, spacing, component styles
3. **Integrate Seamlessly**: New features should work with existing code
4. **Suggest Smart Upgrades**: Based on what exists, recommend natural next steps

### Common Upgrade Patterns:
- Landing page → Add contact form, newsletter signup, pricing section
- Dashboard → Add charts, notifications, settings panel, data export
- E-commerce → Add shopping cart, checkout, order history, user profile
- SaaS app → Add billing, user management, API settings, analytics
- Portfolio → Add blog, case studies, testimonials, contact form

### When Upgrading:
- Show only the NEW/CHANGED code (unless user asks for full code)
- Explain how it integrates with existing work
- Keep styling consistent with what was built before
- Reference specific elements: "I've added a notifications panel that matches your existing sidebar style..."

You're not just a code generator - you're a thinking partner who builds exactly what they need.`,
          },
          ...messages.map((m) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
          })),
        ];

        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");

        const stream = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: chatMessages,
          stream: true,
          max_tokens: 4096,
        });

        let fullResponse = "";

        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || "";
          if (content) {
            fullResponse += content;
            res.write(`data: ${JSON.stringify({ content })}\n\n`);
          }
        }

        await storage.createMessage(conversationId, "assistant", fullResponse);

        // Auto-extract project context from user message and AI response
        // Re-fetch conversation to get latest state for proper feature accumulation
        const currentConversation = await storage.getConversation(conversationId);
        if (currentConversation) {
          const allMessages = await storage.getMessagesByConversation(conversationId);
          const extractedContext = extractProjectContext(
            allMessages.map(m => m.content).join("\n"),
            fullResponse,
            currentConversation
          );
          
          if (Object.keys(extractedContext).length > 0) {
            await storage.updateProjectContext(conversationId, extractedContext);
          }
        }

        res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
        res.end();
      } else {
        const convState: ConversationState = {
          phase: currentPhase as any,
          understandingData: (conversation as any).understandingData as any,
          planData: (conversation as any).projectPlanData as any,
          conversationId: conversationId,
        };

        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");

        const recentMsgs2 = await storage.getMessagesByConversation(conversationId);
        const conversationHistory = recentMsgs2
          .slice(-6)
          .map((m: any) => `[${m.role}]: ${typeof m.content === 'string' ? m.content.slice(0, 300) : ''}`)
          .join('\n');

        try {
          const onStep2 = (step: { phase: string; label: string; detail?: string; timestamp?: number }) => {
            try {
              res.write(`data: ${JSON.stringify({ type: 'thinking', step })}\n\n`);
            } catch {}
          };

          const result = handlePhaseMessage(content, convState, conversationHistory, onStep2);

          if (result.generatedFiles && result.generatedFiles.length > 0) {
            const validation = validateGeneratedCode(
              result.generatedFiles.map(f => ({ path: f.path, content: f.content }))
            );
            const filesToSave = validation.fixedFiles.length > 0
              ? validation.fixedFiles
              : result.generatedFiles;

            await storage.deleteProjectFilesByConversation(conversationId);
            for (const file of filesToSave) {
              const fixedContent = clientAutoFixCode(file.content, file.path);
              const lang = ('language' in file && typeof file.language === 'string') ? file.language : inferLanguageFromPath(file.path);
              await storage.upsertProjectFile(conversationId, file.path, fixedContent, lang);
            }
          }

          await storage.updateProjectContext(conversationId, {
            conversationPhase: result.newPhase,
            ...(result.planData ? { projectPlanData: result.planData as any } : {}),
            ...(result.understandingData ? { understandingData: result.understandingData as any } : {}),
            ...(result.planData ? {
              projectName: result.planData.projectName,
              planGenerated: true,
            } : {}),
          });

          const savedMessage = await storage.createMessage(conversationId, "assistant", result.responseContent, result.thinkingSteps);

          const chunks = result.responseContent.split(/(?<=\s)/);
          for (const chunk of chunks) {
            res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
            await new Promise(resolve => setTimeout(resolve, 10));
          }

          const donePayload: any = {
            done: true,
            thinkingSteps: result.thinkingSteps,
            messageId: savedMessage.id,
            phase: result.newPhase,
          };
          if (result.generatedFiles) {
            donePayload.deepProject = {
              name: result.planData?.projectName || 'Generated Project',
              totalFiles: result.generatedFiles.length,
            };
          }
          if (result.newPhase === 'approval') {
            donePayload.showApproval = true;
          }

          res.write(`data: ${JSON.stringify(donePayload)}\n\n`);
          res.end();
        } catch (localError) {
          console.error("Server-side local generation failed, falling back to client:", localError);
          if (!res.headersSent) {
            res.setHeader("Content-Type", "text/event-stream");
            res.setHeader("Cache-Control", "no-cache");
            res.setHeader("Connection", "keep-alive");
          }
          res.write(`data: ${JSON.stringify({ useLocalEngine: true, userMessage: content })}\n\n`);
          res.end();
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
      if (res.headersSent) {
        res.write(`data: ${JSON.stringify({ error: "Failed to generate response" })}\n\n`);
        res.end();
      } else {
        res.status(500).json({ error: "Failed to send message" });
      }
    }
  });

  // Project Files API
  app.get("/api/conversations/:id/files", async (req, res) => {
    try {
      const conversationId = parseValidId(req.params.id);
      if (conversationId === null) {
        return res.status(400).json({ error: "Invalid conversation ID" });
      }
      const files = await storage.getProjectFiles(conversationId);
      res.json(files);
    } catch (error) {
      console.error("Error fetching project files:", error);
      res.status(500).json({ error: "Failed to fetch project files" });
    }
  });

  app.post("/api/conversations/:id/files", async (req, res) => {
    try {
      const conversationId = parseValidId(req.params.id);
      if (conversationId === null) {
        return res.status(400).json({ error: "Invalid conversation ID" });
      }
      
      const { path, content, language } = req.body;
      if (!path || !content || !language) {
        return res.status(400).json({ error: "Missing required fields: path, content, language" });
      }
      
      const fixedContent = clientAutoFixCode(content, path);
      const file = await storage.upsertProjectFile(conversationId, path, fixedContent, language);
      res.status(201).json(file);
    } catch (error) {
      console.error("Error creating project file:", error);
      res.status(500).json({ error: "Failed to create project file" });
    }
  });

  app.put("/api/files/:id", async (req, res) => {
    try {
      const id = parseValidId(req.params.id);
      if (id === null) {
        return res.status(400).json({ error: "Invalid file ID" });
      }
      
      const { content } = req.body;
      if (!content) {
        return res.status(400).json({ error: "Missing content" });
      }
      
      const file = await storage.updateProjectFile(id, content);
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }
      res.json(file);
    } catch (error) {
      console.error("Error updating project file:", error);
      res.status(500).json({ error: "Failed to update project file" });
    }
  });

  app.delete("/api/files/:id", async (req, res) => {
    try {
      const id = parseValidId(req.params.id);
      if (id === null) {
        return res.status(400).json({ error: "Invalid file ID" });
      }
      await storage.deleteProjectFile(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting project file:", error);
      res.status(500).json({ error: "Failed to delete project file" });
    }
  });

  // Delete all files for a conversation (used before regeneration to prevent duplicates)
  app.delete("/api/conversations/:id/files", async (req, res) => {
    try {
      const conversationId = parseValidId(req.params.id);
      if (conversationId === null) {
        return res.status(400).json({ error: "Invalid conversation ID" });
      }
      await storage.deleteProjectFilesByConversation(conversationId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting project files:", error);
      res.status(500).json({ error: "Failed to delete project files" });
    }
  });

  // Bulk save files from code generation
  app.post("/api/conversations/:id/files/bulk", async (req, res) => {
    try {
      const conversationId = parseValidId(req.params.id);
      if (conversationId === null) {
        return res.status(400).json({ error: "Invalid conversation ID" });
      }
      
      const { files } = req.body;
      if (!Array.isArray(files)) {
        return res.status(400).json({ error: "Files must be an array" });
      }
      
      const savedFiles = [];
      for (const file of files) {
        if (file.path && file.content && file.language) {
          const fixedContent = clientAutoFixCode(file.content, file.path);
          const saved = await storage.upsertProjectFile(conversationId, file.path, fixedContent, file.language);
          savedFiles.push(saved);
        }
      }
      
      res.status(201).json(savedFiles);
    } catch (error) {
      console.error("Error bulk saving project files:", error);
      res.status(500).json({ error: "Failed to save project files" });
    }
  });

  // ========== INTELLIGENCE MODULE ROUTES ==========

  // Analyze prompt for clarification questions
  app.post("/api/analyze-prompt", async (req, res) => {
    try {
      const { prompt, conversationId } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }
      
      let existingContext = null;
      if (conversationId) {
        const conversation = await storage.getConversation(conversationId);
        existingContext = conversation;
      }
      
      const analysis = analyzePrompt(prompt, existingContext);
      const questions = formatClarificationQuestions(analysis.suggestedQuestions);
      
      res.json({
        ...analysis,
        formattedQuestions: questions,
      });
    } catch (error) {
      console.error("Error analyzing prompt:", error);
      res.status(500).json({ error: "Failed to analyze prompt" });
    }
  });

  // Generate project plan
  app.post("/api/conversations/:id/plan", async (req, res) => {
    try {
      const conversationId = parseValidId(req.params.id);
      if (conversationId === null) {
        return res.status(400).json({ error: "Invalid conversation ID" });
      }
      
      const conversation = await storage.getConversation(conversationId);
      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }
      
      const { requirements } = req.body;
      const projectName = conversation.projectName || "New Project";
      const projectType = conversation.projectType || "webapp";
      const complexity = (conversation.complexity || "moderate") as 'simple' | 'moderate' | 'complex';
      
      const plan = generateProjectPlan(projectName, projectType, requirements || "", complexity);
      const markdown = formatPlanAsMarkdown(plan);
      
      // Save plan to database
      await storage.createProjectPlan({
        conversationId,
        summary: plan.summary,
        techStack: plan.techStack,
        architecture: plan.architecture.overview,
        folderStructure: markdown,
        designDecisions: plan.designDecisions.map(d => ({ decision: d.decision, rationale: d.rationale })),
        securityConsiderations: plan.securityConsiderations,
      });
      
      // Update conversation
      await storage.updateProjectContext(conversationId, { planGenerated: true });
      
      res.json({ plan, markdown });
    } catch (error) {
      console.error("Error generating plan:", error);
      res.status(500).json({ error: "Failed to generate project plan" });
    }
  });

  // Get project plan
  app.get("/api/conversations/:id/plan", async (req, res) => {
    try {
      const conversationId = parseValidId(req.params.id);
      if (conversationId === null) {
        return res.status(400).json({ error: "Invalid conversation ID" });
      }
      
      const plan = await storage.getProjectPlan(conversationId);
      res.json(plan || null);
    } catch (error) {
      console.error("Error fetching plan:", error);
      res.status(500).json({ error: "Failed to fetch project plan" });
    }
  });

  // Run tests on project files
  app.post("/api/conversations/:id/test", async (req, res) => {
    try {
      const conversationId = parseValidId(req.params.id);
      if (conversationId === null) {
        return res.status(400).json({ error: "Invalid conversation ID" });
      }
      
      const files = await storage.getProjectFiles(conversationId);
      if (files.length === 0) {
        return res.json({ message: "No files to test", results: [] });
      }
      
      const allResults = [];
      let totalPassed = 0;
      let totalFailed = 0;
      
      for (const file of files) {
        const suite = generateTestsForCode(file.content, file.language, file.path);
        const results = runTests(suite, file.content);
        
        totalPassed += results.passed;
        totalFailed += results.failed;
        
        // Save test results
        await storage.createTestResult({
          conversationId,
          targetFile: file.path,
          passed: results.passed,
          failed: results.failed,
          skipped: results.skipped,
          coverage: results.coverage,
          details: results.details,
        });
        
        allResults.push({
          file: file.path,
          ...results,
          formatted: formatTestResults(results),
        });
      }
      
      // Update conversation test stats
      await storage.updateProjectContext(conversationId, {
        testsPassed: totalPassed,
        testsFailed: totalFailed,
      });
      
      // Validate build
      const buildValidation = validateBuild(files.map(f => ({
        path: f.path,
        content: f.content,
        language: f.language,
      })));
      
      res.json({
        totalPassed,
        totalFailed,
        buildValid: buildValidation.valid,
        buildErrors: buildValidation.errors,
        buildWarnings: buildValidation.warnings,
        fileResults: allResults,
      });
    } catch (error) {
      console.error("Error running tests:", error);
      res.status(500).json({ error: "Failed to run tests" });
    }
  });

  // Security scan
  app.post("/api/conversations/:id/security-scan", async (req, res) => {
    try {
      const conversationId = parseValidId(req.params.id);
      if (conversationId === null) {
        return res.status(400).json({ error: "Invalid conversation ID" });
      }
      
      const files = await storage.getProjectFiles(conversationId);
      if (files.length === 0) {
        return res.json({ message: "No files to scan", score: 100, grade: "A", issues: [], passedChecks: [], checks: [], totalChecks: 0, report: "No files to scan", recommendations: [] });
      }
      
      const scanResult = scanForVulnerabilities(files.map(f => ({
        path: f.path,
        content: f.content,
        language: f.language,
      })));
      
      const report = formatSecurityReport(scanResult);
      const conversation = await storage.getConversation(conversationId);
      const recommendations = getSecurityRecommendations(conversation?.projectType || "webapp");
      
      // Save scan results
      await storage.createSecurityScan({
        conversationId,
        score: scanResult.score,
        grade: scanResult.grade,
        issues: scanResult.issues.map(i => ({
          severity: i.severity,
          category: i.category,
          title: i.title,
          recommendation: i.recommendation,
        })),
        passedChecks: scanResult.passedChecks,
      });
      
      // Update conversation security score
      await storage.updateProjectContext(conversationId, {
        securityScore: scanResult.score,
      });
      
      res.json({
        ...scanResult,
        report,
        recommendations,
      });
    } catch (error) {
      console.error("Error running security scan:", error);
      res.status(500).json({ error: "Failed to run security scan" });
    }
  });

  // Auto-fix errors endpoint
  app.post("/api/conversations/:id/auto-fix", async (req, res) => {
    try {
      const conversationId = parseValidId(req.params.id);
      if (conversationId === null) {
        return res.status(400).json({ error: "Invalid conversation ID" });
      }

      const { errors: errorMessages = [], attempt = 1 } = req.body;

      if (!Array.isArray(errorMessages) || errorMessages.length === 0) {
        return res.json({ fixes: [], summary: "No errors to fix", attempt });
      }

      const files = await storage.getProjectFiles(conversationId);
      if (files.length === 0) {
        return res.json({ fixes: [], summary: "No files to fix", attempt });
      }

      const projectFiles = files.map(f => ({
        path: f.path,
        content: f.content,
        language: f.language,
      }));

      // Parse the error messages
      const parsedErrors = parseErrors(errorMessages);

      // Analyze and generate fixes
      const result = analyzeAndFix(parsedErrors, projectFiles);

      // Also run import path validation
      const importFixes = validateImportPaths(projectFiles);
      const allFixes = [...result.fixes];
      for (const importFix of importFixes) {
        if (!allFixes.some(f => f.filePath === importFix.filePath && f.type === importFix.type)) {
          allFixes.push(importFix);
        }
      }

      // Apply the fixes
      const appliedFixes: { filePath: string; description: string; type: string }[] = [];
      const newDependencies: { name: string; version: string }[] = [];

      for (const fix of allFixes) {
        try {
          if (fix.type === 'add_dependency' && fix.packageName) {
            newDependencies.push({ name: fix.packageName, version: fix.packageVersion || 'latest' });
            appliedFixes.push({ filePath: fix.filePath, description: fix.description, type: fix.type });
            continue;
          }

          if (fix.type === 'create_file') {
            await storage.upsertProjectFile(
              conversationId,
              fix.filePath,
              fix.newContent,
              fix.filePath.split('.').pop() || 'text'
            );
            appliedFixes.push({ filePath: fix.filePath, description: fix.description, type: fix.type });
            continue;
          }

          if (fix.type === 'patch_file' || fix.type === 'fix_path') {
            const existingFile = files.find(f => f.path === fix.filePath);
            if (existingFile && fix.newContent && fix.newContent !== existingFile.content) {
              await storage.updateProjectFile(existingFile.id, fix.newContent);
              appliedFixes.push({ filePath: fix.filePath, description: fix.description, type: fix.type });
            }
            continue;
          }
        } catch (fixError: any) {
          logger.error(`Failed to apply fix for ${fix.filePath}:`, String(fixError));
        }
      }

      // Handle dependency additions - update package.json
      if (newDependencies.length > 0) {
        const pkgFile = files.find(f => f.path === 'package.json' || f.path.endsWith('/package.json'));
        if (pkgFile) {
          const updatedPkg = addDependenciesToPackageJson(pkgFile.content, newDependencies);
          if (updatedPkg !== pkgFile.content) {
            await storage.updateProjectFile(pkgFile.id, updatedPkg);
          }
        }
      }

      // Log the fix attempt to transparency
      try {
        await storage.createIntelRecord({
          conversationId,
          type: 'debug',
          category: 'auto-fix',
          key: `auto-fix-attempt-${attempt}`,
          value: JSON.stringify({
            fixesApplied: appliedFixes.length,
            unfixable: result.unfixable.length,
            summary: result.summary,
            errors: errorMessages.slice(0, 5),
          }),
        });
      } catch (logError) {
        // Non-critical, continue
      }

      res.json({
        fixes: appliedFixes,
        unfixable: result.unfixable.map(e => ({ type: e.type, message: e.message })),
        newDependencies,
        summary: result.summary,
        attempt,
        totalErrors: parsedErrors.length,
        totalFixed: appliedFixes.length,
      });
    } catch (error: any) {
      logger.error("Error running auto-fix:", String(error));
      res.status(500).json({ error: "Failed to auto-fix errors" });
    }
  });

  // Get transparency report
  app.get("/api/conversations/:id/transparency", async (req, res) => {
    try {
      const conversationId = parseValidId(req.params.id);
      if (conversationId === null) {
        return res.status(400).json({ error: "Invalid conversation ID" });
      }
      
      const files = await storage.getProjectFiles(conversationId);
      const conversation = await storage.getConversation(conversationId);
      const logs = await storage.getGenerationLogs(conversationId);
      const messages = await storage.getMessagesByConversation(conversationId);
      
      const thinkingSteps: any[] = [];
      for (const msg of messages) {
        if (msg.thinkingSteps && Array.isArray(msg.thinkingSteps)) {
          thinkingSteps.push(...(msg.thinkingSteps as any[]));
        }
      }
      
      const assumptions = extractAssumptions(
        "", 
        conversation?.projectType || "webapp",
        files.map(f => ({ path: f.path, content: f.content }))
      );
      
      const report = formatTransparencyReport(
        files.map(f => ({ path: f.path, content: f.content, language: f.language })),
        assumptions,
        logs.length > 1
      );
      
      res.json({
        report,
        assumptions,
        logs,
        thinkingSteps,
        fileCount: files.length,
      });
    } catch (error) {
      console.error("Error generating transparency report:", error);
      res.status(500).json({ error: "Failed to generate transparency report" });
    }
  });

  // Get/update intel records
  app.get("/api/conversations/:id/intel", async (req, res) => {
    try {
      const conversationId = parseValidId(req.params.id);
      if (conversationId === null) {
        return res.status(400).json({ error: "Invalid conversation ID" });
      }
      
      const records = await storage.getIntelRecords(conversationId);
      const inMemoryIntel = getIntel(conversationId);
      
      res.json({
        records,
        preferences: inMemoryIntel?.preferences || {},
        learnings: inMemoryIntel?.learnings || [],
      });
    } catch (error) {
      console.error("Error fetching intel:", error);
      res.status(500).json({ error: "Failed to fetch intel" });
    }
  });

  // Extract and store intel from messages
  app.post("/api/conversations/:id/intel/extract", async (req, res) => {
    try {
      const conversationId = parseValidId(req.params.id);
      if (conversationId === null) {
        return res.status(400).json({ error: "Invalid conversation ID" });
      }
      
      const messages = await storage.getMessagesByConversation(conversationId);
      const intel = extractIntelFromMessages(conversationId, messages.map(m => ({
        role: m.role,
        content: m.content,
      })));
      
      // Store in memory
      storeIntel(conversationId, intel);
      
      // Store in database
      for (const record of intel) {
        await storage.upsertIntelRecord(
          conversationId,
          record.key,
          record.category,
          record.value,
          record.type
        );
      }
      
      const context = generateIntelContext(conversationId);
      
      res.json({
        extracted: intel.length,
        records: intel,
        contextForAI: context,
      });
    } catch (error) {
      console.error("Error extracting intel:", error);
      res.status(500).json({ error: "Failed to extract intel" });
    }
  });

  // Analyze dependencies
  app.get("/api/conversations/:id/dependencies", async (req, res) => {
    try {
      const conversationId = parseValidId(req.params.id);
      if (conversationId === null) {
        return res.status(400).json({ error: "Invalid conversation ID" });
      }
      
      const files = await storage.getProjectFiles(conversationId);
      if (files.length === 0) {
        return res.json({ message: "No files to analyze", dependencies: [] });
      }
      
      const analysis = analyzeDependencies(files.map(f => ({
        path: f.path,
        content: f.content,
        language: f.language,
      })));
      
      const report = formatDependencyReport(analysis);
      const envExample = generateEnvExample(analysis.envVariables);
      
      res.json({
        ...analysis,
        report,
        envExample,
      });
    } catch (error) {
      console.error("Error analyzing dependencies:", error);
      res.status(500).json({ error: "Failed to analyze dependencies" });
    }
  });

  // Export project
  app.get("/api/conversations/:id/export", async (req, res) => {
    try {
      const conversationId = parseValidId(req.params.id);
      if (conversationId === null) {
        return res.status(400).json({ error: "Invalid conversation ID" });
      }
      
      const conversation = await storage.getConversation(conversationId);
      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }
      
      const files = await storage.getProjectFiles(conversationId);
      if (files.length === 0) {
        return res.status(400).json({ error: "No files to export" });
      }
      
      const projectName = conversation.projectName || conversation.title || "project";
      const projectType = conversation.projectType || "webapp";
      
      const exportData = generateProjectExport(
        projectName,
        projectType,
        files.map(f => ({
          path: f.path,
          content: f.content,
          language: f.language,
        }))
      );
      
      const download = generateDownloadData(exportData);
      
      res.json({
        projectName: exportData.name,
        fileCount: exportData.files.length,
        readme: exportData.readme,
        download,
      });
    } catch (error) {
      console.error("Error exporting project:", error);
      res.status(500).json({ error: "Failed to export project" });
    }
  });

  // Download project as text bundle
  app.get("/api/conversations/:id/download", async (req, res) => {
    try {
      const conversationId = parseValidId(req.params.id);
      if (conversationId === null) {
        return res.status(400).json({ error: "Invalid conversation ID" });
      }
      
      const conversation = await storage.getConversation(conversationId);
      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }
      
      const files = await storage.getProjectFiles(conversationId);
      if (files.length === 0) {
        return res.status(400).json({ error: "No files to download" });
      }
      
      const projectName = conversation.projectName || conversation.title || "project";
      const projectType = conversation.projectType || "webapp";
      
      const exportData = generateProjectExport(
        projectName,
        projectType,
        files.map(f => ({
          path: f.path,
          content: f.content,
          language: f.language,
        }))
      );
      
      const download = generateDownloadData(exportData);
      
      res.setHeader("Content-Type", download.mimeType);
      res.setHeader("Content-Disposition", `attachment; filename="${download.filename}"`);
      res.send(download.content);
    } catch (error) {
      console.error("Error downloading project:", error);
      res.status(500).json({ error: "Failed to download project" });
    }
  });

  // Generation logs
  app.post("/api/conversations/:id/logs", async (req, res) => {
    try {
      const conversationId = parseValidId(req.params.id);
      if (conversationId === null) {
        return res.status(400).json({ error: "Invalid conversation ID" });
      }
      
      const { action, targetFile, description, linesChanged, reasoning, assumptions } = req.body;
      
      const log = await storage.createGenerationLog({
        conversationId,
        action: action || "create",
        targetFile: targetFile || "unknown",
        description: description || "Generated code",
        linesChanged: linesChanged || 0,
        reasoning,
        assumptions,
      });
      
      res.status(201).json(log);
    } catch (error) {
      console.error("Error creating generation log:", error);
      res.status(500).json({ error: "Failed to create generation log" });
    }
  });

  app.get("/api/conversations/:id/logs", async (req, res) => {
    try {
      const conversationId = parseValidId(req.params.id);
      if (conversationId === null) {
        return res.status(400).json({ error: "Invalid conversation ID" });
      }
      
      const logs = await storage.getGenerationLogs(conversationId);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching generation logs:", error);
      res.status(500).json({ error: "Failed to fetch generation logs" });
    }
  });

  // Project stats summary
  app.get("/api/conversations/:id/stats", async (req, res) => {
    try {
      const conversationId = parseValidId(req.params.id);
      if (conversationId === null) {
        return res.status(400).json({ error: "Invalid conversation ID" });
      }
      
      const conversation = await storage.getConversation(conversationId);
      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }
      
      const files = await storage.getProjectFiles(conversationId);
      const messages = await storage.getMessagesByConversation(conversationId);
      const securityScan = await storage.getLatestSecurityScan(conversationId);
      const testResults = await storage.getTestResults(conversationId);
      const plan = await storage.getProjectPlan(conversationId);
      
      // Calculate totals
      const totalLines = files.reduce((sum, f) => sum + f.content.split('\n').length, 0);
      const latestTests = testResults[0];
      
      res.json({
        projectName: conversation.projectName || conversation.title,
        projectType: conversation.projectType,
        complexity: conversation.complexity,
        designStyle: conversation.designStyle,
        techStack: conversation.techStack || [],
        featuresBuilt: conversation.featuresBuilt || [],
        fileCount: files.length,
        totalLines,
        messageCount: messages.length,
        securityScore: securityScan?.score || conversation.securityScore,
        securityGrade: securityScan?.grade,
        testsPassed: latestTests?.passed || conversation.testsPassed || 0,
        testsFailed: latestTests?.failed || conversation.testsFailed || 0,
        hasPlan: !!plan,
        createdAt: conversation.createdAt,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ error: "Failed to fetch project stats" });
    }
  });

  // ==========================================
  // GitHub Integration Routes
  // ==========================================

  // Helper function to get GitHub client
  async function getGitHubClient() {
    const { Octokit } = await import("@octokit/rest");
    
    const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
    const xReplitToken = process.env.REPL_IDENTITY 
      ? 'repl ' + process.env.REPL_IDENTITY 
      : process.env.WEB_REPL_RENEWAL 
      ? 'depl ' + process.env.WEB_REPL_RENEWAL 
      : null;

    if (!xReplitToken || !hostname) {
      throw new Error('GitHub integration not available');
    }

    const response = await fetch(
      'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=github',
      {
        headers: {
          'Accept': 'application/json',
          'X_REPLIT_TOKEN': xReplitToken
        }
      }
    );
    
    const data = await response.json();
    const connectionSettings = data.items?.[0];
    const accessToken = connectionSettings?.settings?.access_token || 
                        connectionSettings?.settings?.oauth?.credentials?.access_token;

    if (!connectionSettings || !accessToken) {
      throw new Error('GitHub not connected');
    }
    
    return new Octokit({ auth: accessToken });
  }

  // List user's GitHub repositories
  app.get("/api/github/repos", async (req, res) => {
    try {
      const octokit = await getGitHubClient();
      const { data: repos } = await octokit.repos.listForAuthenticatedUser({
        sort: 'updated',
        per_page: 50
      });
      
      res.json(repos.map(repo => ({
        id: repo.id,
        name: repo.name,
        full_name: repo.full_name,
        description: repo.description,
        html_url: repo.html_url,
        language: repo.language,
        default_branch: repo.default_branch,
        updated_at: repo.updated_at,
        private: repo.private
      })));
    } catch (error) {
      console.error("Error fetching GitHub repos:", error);
      const message = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ error: message });
    }
  });

  // Get repository contents (files)
  // Supports X-GitHub-Token header for private repos
  app.get("/api/github/repos/:owner/:repo/contents", async (req, res) => {
    try {
      const { owner, repo } = req.params;
      const path = (req.query.path as string) || '';
      const ref = (req.query.ref as string) || undefined;
      
      // Check for custom token in header (for private repos)
      const customToken = req.headers['x-github-token'] as string | undefined;
      
      let octokit;
      if (customToken) {
        const { Octokit } = await import("@octokit/rest");
        octokit = new Octokit({ auth: customToken });
      } else {
        octokit = await getGitHubClient();
      }
      
      const { data } = await octokit.repos.getContent({
        owner,
        repo,
        path,
        ref
      });
      
      res.json(data);
    } catch (error: any) {
      console.error("Error fetching repo contents:", error);
      const status = error.status || 500;
      const message = error.message || "Unknown error";
      res.status(status).json({ error: message });
    }
  });

  // Import files from GitHub repository to conversation
  const importGithubSchema = z.object({
    owner: z.string().min(1),
    repo: z.string().min(1),
    branch: z.string().optional(),
    files: z.array(z.string()).min(1)
  });

  app.post("/api/conversations/:id/import-github", async (req, res) => {
    try {
      const conversationId = parseValidId(req.params.id);
      if (conversationId === null) {
        return res.status(400).json({ error: "Invalid conversation ID" });
      }
      
      const validation = importGithubSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: "Invalid request", details: validation.error.errors });
      }
      
      const { owner, repo, branch, files: filePaths } = validation.data;
      
      const conversation = await storage.getConversation(conversationId);
      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }
      
      const octokit = await getGitHubClient();
      const importedFiles = [];
      
      for (const filePath of filePaths) {
        try {
          const { data } = await octokit.repos.getContent({
            owner,
            repo,
            path: filePath,
            ref: branch
          });
          
          if (!Array.isArray(data) && data.type === 'file' && data.content) {
            const content = Buffer.from(data.content, 'base64').toString('utf-8');
            const ext = filePath.split('.').pop()?.toLowerCase() || 'text';
            const languageMap: Record<string, string> = {
              'js': 'javascript',
              'mjs': 'javascript',
              'jsx': 'javascript',
              'ts': 'typescript',
              'tsx': 'typescript',
              'css': 'css',
              'html': 'html',
              'json': 'json',
              'md': 'markdown',
              'py': 'python',
            };
            const language = languageMap[ext] || ext;
            
            const file = await storage.createProjectFile({
              conversationId,
              path: filePath,
              content,
              language
            });
            
            importedFiles.push(file);
          }
        } catch (err) {
          console.error(`Failed to import ${filePath}:`, err);
        }
      }
      
      res.json({
        success: true,
        importedCount: importedFiles.length,
        files: importedFiles
      });
    } catch (error) {
      console.error("Error importing from GitHub:", error);
      const message = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ error: message });
    }
  });

  // Upload files to conversation
  const uploadFilesSchema = z.object({
    files: z.array(z.object({
      path: z.string().min(1),
      content: z.string()
    })).min(1)
  });

  app.post("/api/conversations/:id/upload-files", async (req, res) => {
    try {
      const conversationId = parseValidId(req.params.id);
      if (conversationId === null) {
        return res.status(400).json({ error: "Invalid conversation ID" });
      }
      
      const validation = uploadFilesSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: "Invalid request", details: validation.error.errors });
      }
      
      const { files } = validation.data;
      
      const conversation = await storage.getConversation(conversationId);
      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }
      
      const uploadedFiles = [];
      
      for (const fileData of files) {
        if (!fileData.path || !fileData.content) continue;
        
        const ext = fileData.path.split('.').pop()?.toLowerCase() || 'text';
        const languageMap: Record<string, string> = {
          'js': 'javascript',
          'mjs': 'javascript',
          'jsx': 'javascript',
          'ts': 'typescript',
          'tsx': 'typescript',
          'css': 'css',
          'html': 'html',
          'json': 'json',
          'md': 'markdown',
          'py': 'python',
        };
        const language = languageMap[ext] || ext;
        
        // Check if file already exists
        const existingFiles = await storage.getProjectFiles(conversationId);
        const existing = existingFiles.find(f => f.path === fileData.path);
        
        if (existing) {
          // Update existing file
          const updated = await storage.updateProjectFile(existing.id, fileData.content);
          if (updated) uploadedFiles.push(updated);
        } else {
          // Create new file
          const file = await storage.createProjectFile({
            conversationId,
            path: fileData.path,
            content: fileData.content,
            language
          });
          uploadedFiles.push(file);
        }
      }
      
      res.json({
        success: true,
        uploadedCount: uploadedFiles.length,
        files: uploadedFiles
      });
    } catch (error) {
      console.error("Error uploading files:", error);
      const message = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ error: message });
    }
  });

  // Push project files to GitHub repository
  app.post("/api/github/push", async (req, res) => {
    try {
      const { owner, repo, branch = "main", message = "Update from AutoCoder", files, token } = req.body;
      
      if (!owner || !repo || !files || !Array.isArray(files)) {
        return res.status(400).json({ error: "Missing owner, repo, or files" });
      }
      
      const { Octokit } = await import("@octokit/rest");
      
      // Use provided token or try to get from connector
      let octokit: InstanceType<typeof Octokit>;
      if (token) {
        octokit = new Octokit({ auth: token });
      } else {
        try {
          octokit = await getGitHubClient();
        } catch (e) {
          return res.status(401).json({ error: "No GitHub token. Provide a token in the request." });
        }
      }
      
      const results = [];
      
      for (const file of files) {
        if (!file.path || !file.content) continue;
        
        try {
          // Get current file SHA if it exists (needed for updates)
          let sha: string | undefined;
          try {
            const { data: existingFile } = await octokit.repos.getContent({
              owner,
              repo,
              path: file.path,
              ref: branch
            });
            if ('sha' in existingFile) {
              sha = existingFile.sha;
            }
          } catch (e) {
            // File doesn't exist, that's fine
          }
          
          // Create or update file
          await octokit.repos.createOrUpdateFileContents({
            owner,
            repo,
            path: file.path,
            message: `${message}: ${file.path}`,
            content: Buffer.from(file.content).toString('base64'),
            branch,
            sha
          });
          
          results.push({ path: file.path, status: 'success' });
        } catch (fileError: any) {
          results.push({ path: file.path, status: 'error', error: fileError.message });
        }
      }
      
      const successCount = results.filter(r => r.status === 'success').length;
      res.json({ 
        success: true, 
        pushed: successCount, 
        total: files.length,
        results 
      });
    } catch (error) {
      console.error("GitHub push error:", error);
      const message = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ error: message });
    }
  });

  app.post("/api/conversations/:id/github-push", async (req, res) => {
    try {
      const conversationId = parseValidId(req.params.id);
      if (conversationId === null) {
        return res.status(400).json({ error: "Invalid conversation ID" });
      }
      
      const conversation = await storage.getConversation(conversationId);
      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }
      
      const files = await storage.getProjectFiles(conversationId);
      if (files.length === 0) {
        return res.status(400).json({ error: "No files to push" });
      }
      
      const octokit = await getGitHubClient();
      const { data: user } = await octokit.users.getAuthenticated();
      
      const repoName = (conversation.projectName || conversation.title || `autocoder-project-${conversationId}`)
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-')
        .slice(0, 100);
      
      let repoUrl: string;
      try {
        const { data: repo } = await octokit.repos.get({ owner: user.login, repo: repoName });
        repoUrl = repo.html_url;
      } catch {
        const { data: repo } = await octokit.repos.createForAuthenticatedUser({
          name: repoName,
          description: `Generated by AutoCoder: ${conversation.title || 'Project'}`,
          auto_init: true,
        });
        repoUrl = repo.html_url;
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
      
      let pushed = 0;
      for (const file of files) {
        try {
          let sha: string | undefined;
          try {
            const { data: existing } = await octokit.repos.getContent({
              owner: user.login, repo: repoName, path: file.path
            });
            if ('sha' in existing) sha = existing.sha;
          } catch {}
          
          await octokit.repos.createOrUpdateFileContents({
            owner: user.login,
            repo: repoName,
            path: file.path,
            message: `Update ${file.path} via AutoCoder`,
            content: Buffer.from(file.content).toString('base64'),
            sha
          });
          pushed++;
        } catch (e) {
          console.error(`Failed to push ${file.path}:`, e);
        }
      }
      
      res.json({ success: true, url: repoUrl, pushed, total: files.length });
    } catch (error) {
      console.error("Conversation GitHub push error:", error);
      const message = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ error: message });
    }
  });

  // ============================================
  // AI FULL-STACK GENERATOR ENDPOINTS
  // ============================================
  
  // Import the AI generator module
  const { generateFullStackAppStream, generateFullStackApp, modifyCode } = await import("./modules/ai-fullstack-generator");
  
  // Streaming generation endpoint
  app.post("/api/generate-fullstack", async (req, res) => {
    try {
      const { prompt, conversationId } = req.body;
      
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }
      
      logger.info(`AI Full-Stack Generation: "${prompt.substring(0, 100)}..."`, "AI");
      
      await generateFullStackAppStream(prompt, res);
      
    } catch (error) {
      console.error("AI Generation Error:", error);
      const message = error instanceof Error ? error.message : "Generation failed";
      res.status(500).json({ error: message });
    }
  });
  
  // Synchronous generation endpoint (simpler, no streaming)
  app.post("/api/generate-fullstack-sync", async (req, res) => {
    try {
      const { prompt, conversationId } = req.body;
      
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }
      
      logger.info(`AI Full-Stack Sync Generation: "${prompt.substring(0, 100)}..."`, "AI");
      
      const project = await generateFullStackApp(prompt);
      
      // If conversationId provided, save files to database
      if (conversationId) {
        for (const file of project.files) {
          const fixedContent = clientAutoFixCode(file.content, file.path);
          await storage.upsertProjectFile(conversationId, file.path, fixedContent, file.language);
        }
      }
      
      res.json(project);
      
    } catch (error) {
      console.error("AI Generation Error:", error);
      const message = error instanceof Error ? error.message : "Generation failed";
      res.status(500).json({ error: message });
    }
  });
  
  // Code modification endpoint
  app.post("/api/modify-code", async (req, res) => {
    try {
      const { code, instructions, language } = req.body;
      
      if (!code || !instructions) {
        return res.status(400).json({ error: "Code and instructions are required" });
      }
      
      const modifiedCode = await modifyCode(code, instructions, language);
      res.json({ code: modifiedCode });
      
    } catch (error) {
      console.error("Code Modification Error:", error);
      const message = error instanceof Error ? error.message : "Modification failed";
      res.status(500).json({ error: message });
    }
  });

  // ============================================
  // LOCAL LLM CODE INTELLIGENCE ENDPOINTS
  // For understanding, editing, and fixing code
  // ============================================
  
  const { 
    generateWithLocalLLM, 
    isLocalLLMAvailable,
    EDIT_CODE_PROMPT,
    FIX_CODE_PROMPT,
    UNDERSTAND_CODE_PROMPT
  } = await import("./modules/local-llm-client");
  const { cleanCodeArtifacts } = await import("./modules/code-cleaner");

  // Understand code - analyze what code does
  app.post("/api/ai/understand", async (req, res) => {
    try {
      const { code, question } = req.body;
      
      if (!code) {
        return res.status(400).json({ error: "Code is required" });
      }
      
      const isLocal = await isLocalLLMAvailable();
      if (!isLocal) {
        return res.status(503).json({ 
          error: "Local LLM not available", 
          message: "Start Ollama on your machine (ollama serve) to use AI code analysis",
          localOnly: true
        });
      }
      
      const prompt = question 
        ? `Analyze this code and answer: ${question}\n\nCode:\n${code}`
        : `Analyze this code and explain what it does:\n\n${code}`;
      
      const response = await generateWithLocalLLM(prompt, UNDERSTAND_CODE_PROMPT);
      
      // Try to parse as JSON if structured output expected
      const { extractJSON } = await import("./modules/local-llm-client");
      const jsonContent = extractJSON(response);
      
      if (jsonContent) {
        try {
          const parsed = JSON.parse(jsonContent);
          res.json({ analysis: parsed, raw: response, structured: true });
        } catch {
          res.json({ analysis: response, structured: false });
        }
      } else {
        res.json({ analysis: response, structured: false });
      }
      
    } catch (error) {
      console.error("Code Understanding Error:", error);
      const message = error instanceof Error ? error.message : "Analysis failed";
      res.status(500).json({ error: message });
    }
  });

  // Edit code - modify code based on instructions
  app.post("/api/ai/edit", async (req, res) => {
    try {
      const { code, instructions, language } = req.body;
      
      if (!code || !instructions) {
        return res.status(400).json({ error: "Code and instructions are required" });
      }
      
      const isLocal = await isLocalLLMAvailable();
      if (!isLocal) {
        return res.status(503).json({ 
          error: "Local LLM not available",
          message: "Start Ollama on your machine (ollama serve) to use AI code editing",
          localOnly: true
        });
      }
      
      const prompt = `Language: ${language || 'javascript'}
      
CURRENT CODE:
${code}

INSTRUCTIONS:
${instructions}

Output ONLY the modified code. No explanations.`;

      const response = await generateWithLocalLLM(prompt, EDIT_CODE_PROMPT);
      const cleanedCode = cleanCodeArtifacts(response);
      res.json({ code: cleanedCode });
      
    } catch (error) {
      console.error("Code Edit Error:", error);
      const message = error instanceof Error ? error.message : "Edit failed";
      res.status(500).json({ error: message });
    }
  });

  // Fix code - fix bugs and errors
  app.post("/api/ai/fix", async (req, res) => {
    try {
      const { code, error: errorMessage, language } = req.body;
      
      if (!code) {
        return res.status(400).json({ error: "Code is required" });
      }
      
      const isLocal = await isLocalLLMAvailable();
      if (!isLocal) {
        return res.status(503).json({ 
          error: "Local LLM not available",
          message: "Start Ollama on your machine (ollama serve) to use AI bug fixing",
          localOnly: true
        });
      }
      
      const prompt = `Language: ${language || 'javascript'}

BROKEN CODE:
${code}

${errorMessage ? `ERROR MESSAGE: ${errorMessage}` : 'This code has bugs. Find and fix them.'}

Output ONLY the fixed code. No explanations.`;

      const response = await generateWithLocalLLM(prompt, FIX_CODE_PROMPT);
      const cleanedCode = cleanCodeArtifacts(response);
      res.json({ code: cleanedCode, fixed: true });
      
    } catch (error) {
      console.error("Code Fix Error:", error);
      const message = error instanceof Error ? error.message : "Fix failed";
      res.status(500).json({ error: message });
    }
  });

  // Check if local LLM is available
  app.get("/api/ai/status", async (req, res) => {
    try {
      const available = await isLocalLLMAvailable();
      res.json({ 
        localLLM: available,
        status: available ? 'ready' : 'offline',
        message: available ? 'Local AI ready' : 'Start Ollama to use local AI'
      });
    } catch (error) {
      res.json({ localLLM: false, status: 'error', message: 'Failed to check status' });
    }
  });

  // ============================================
  // Advanced AI Capabilities
  // ============================================

  // Zod schemas for advanced AI endpoints
  const planSchema = z.object({
    prompt: z.string().min(1, 'Prompt is required'),
  });

  const codeAnalysisSchema = z.object({
    code: z.string().min(1, 'Code is required'),
    language: z.string().optional().default('javascript'),
  });

  const diagnoseSchema = z.object({
    errorMessage: z.string().min(1, 'Error message is required'),
  });

  const learnSchema = z.object({
    userId: z.string().min(1, 'User ID is required'),
    prompt: z.string().min(1, 'Prompt is required'),
    response: z.string().optional().default(''),
    feedback: z.enum(['positive', 'negative']).optional(),
  });

  const contextSchema = z.object({
    userId: z.string().min(1, 'User ID is required'),
    prompt: z.string().min(1, 'Prompt is required'),
  });

  const patternQuerySchema = z.object({
    language: z.string().optional(),
    framework: z.string().optional(),
    category: z.string().optional(),
    search: z.string().optional(),
  });

  // Multi-step reasoning and planning
  app.post("/api/ai/plan", async (req, res) => {
    try {
      const parsed = planSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid request', details: parsed.error.issues });
      }

      const { prompt } = parsed.data;
      const chain = analyzeAndPlan(prompt);
      const markdown = formatReasoningAsMarkdown(chain);
      
      res.json({
        success: true,
        plan: chain,
        markdown,
        summary: {
          intent: chain.understanding.coreIntent,
          steps: chain.steps.length,
          complexity: chain.timeline.complexity,
          estimatedMinutes: chain.timeline.estimatedMinutes,
        }
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Planning failed';
      res.status(500).json({ error: message });
    }
  });

  // Quick analysis endpoint
  app.post("/api/ai/quick-analyze", async (req, res) => {
    try {
      const parsed = planSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid request', details: parsed.error.issues });
      }

      const { prompt } = parsed.data;
      const analysis = quickAnalysis(prompt);
      res.json({ success: true, analysis });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Analysis failed';
      res.status(500).json({ error: message });
    }
  });

  // Live code analysis
  app.post("/api/ai/analyze-code", async (req, res) => {
    try {
      const parsed = codeAnalysisSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid request', details: parsed.error.issues });
      }

      const { code, language } = parsed.data;
      const analysis = analyzeCode(code, language);
      const markdown = formatAnalysisAsMarkdown(analysis);
      
      res.json({
        success: true,
        analysis,
        markdown,
        summary: {
          errors: analysis.errors.length,
          warnings: analysis.warnings.length,
          suggestions: analysis.suggestions.length,
          complexity: analysis.complexity.rating,
        }
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Analysis failed';
      res.status(500).json({ error: message });
    }
  });

  // Error diagnosis
  app.post("/api/ai/diagnose", async (req, res) => {
    try {
      const parsed = diagnoseSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid request', details: parsed.error.issues });
      }

      const { errorMessage } = parsed.data;
      const diagnosis = diagnoseError(errorMessage);
      res.json({ success: true, diagnosis });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Diagnosis failed';
      res.status(500).json({ error: message });
    }
  });

  // Auto-fix code
  app.post("/api/ai/auto-fix", async (req, res) => {
    try {
      const parsed = codeAnalysisSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid request', details: parsed.error.issues });
      }

      const { code, language } = parsed.data;
      const analysis = analyzeCode(code, language);
      const { code: fixedCode, fixes } = autoFixCode(code, analysis.errors);
      
      res.json({
        success: true,
        originalErrors: analysis.errors.length,
        fixesApplied: fixes.length,
        fixes,
        code: fixedCode,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Auto-fix failed';
      res.status(500).json({ error: message });
    }
  });

  // Context memory - learn from interaction
  app.post("/api/ai/learn", async (req, res) => {
    try {
      const parsed = learnSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid request', details: parsed.error.issues });
      }

      const { userId, prompt, response, feedback } = parsed.data;
      learnFromInteraction(userId, prompt, response, feedback);
      res.json({ success: true, message: 'Preferences updated' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Learning failed';
      res.status(500).json({ error: message });
    }
  });

  // Get user context and preferences
  app.get("/api/ai/context/:userId", async (req, res) => {
    try {
      const userId = req.params.userId;
      const prefs = getContextPreferences(userId);
      const summary = formatMemorySummary(userId);
      
      res.json({
        success: true,
        preferences: prefs,
        summary,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get context';
      res.status(500).json({ error: message });
    }
  });

  // Get relevant context for a prompt
  app.post("/api/ai/relevant-context", async (req, res) => {
    try {
      const parsed = contextSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid request', details: parsed.error.issues });
      }

      const { userId, prompt } = parsed.data;
      const context = getRelevantContext(userId, prompt);
      const enhancedPrompt = applyContextPreferences(userId, prompt);
      
      res.json({
        success: true,
        context,
        enhancedPrompt,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get context';
      res.status(500).json({ error: message });
    }
  });

  // Framework patterns library
  app.get("/api/ai/patterns", async (req, res) => {
    try {
      const parsed = patternQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid query parameters', details: parsed.error.issues });
      }

      let frameworks = getAllFrameworks();
      if (parsed.data.language) {
        frameworks = getFrameworksByLanguage(parsed.data.language);
      }
      if (parsed.data.category) {
        frameworks = frameworks.filter(f => f.category === parsed.data.category);
      }
      if (parsed.data.search) {
        const search = parsed.data.search.toLowerCase();
        frameworks = frameworks.filter(f =>
          f.name.toLowerCase().includes(search) ||
          f.description.toLowerCase().includes(search) ||
          f.language.toLowerCase().includes(search)
        );
      }

      res.json({
        success: true,
        count: frameworks.length,
        patterns: frameworks.map(f => ({
          id: f.id,
          name: f.name,
          language: f.language,
          category: f.category,
          description: f.description,
          version: f.version,
        })),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get patterns';
      res.status(500).json({ error: message });
    }
  });

  // Get specific framework pattern
  app.get("/api/ai/patterns/:id", async (req, res) => {
    try {
      const framework = getFramework(req.params.id);
      if (!framework) {
        return res.status(404).json({ error: 'Pattern not found' });
      }

      res.json({ success: true, pattern: framework });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get pattern';
      res.status(500).json({ error: message });
    }
  });

  // Universal Language Engine endpoints
  app.get("/api/ai/languages", async (_req, res) => {
    try {
      res.json({
        success: true,
        count: getLanguageCount(),
        languages: getLanguageSummary(),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get languages';
      res.status(500).json({ error: message });
    }
  });

  app.get("/api/ai/languages/:id", async (req, res) => {
    try {
      const lang = getLanguage(req.params.id);
      if (!lang) {
        return res.status(404).json({ error: 'Language not found' });
      }
      const frameworks = getFrameworksByLanguage(req.params.id);
      res.json({ success: true, language: lang, frameworks: frameworks.map(f => ({ id: f.id, name: f.name, version: f.version, category: f.category })) });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get language';
      res.status(500).json({ error: message });
    }
  });

  app.get("/api/ai/frameworks", async (_req, res) => {
    try {
      res.json({
        success: true,
        count: getFrameworkCount(),
        frameworks: getFrameworkSummary(),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get frameworks';
      res.status(500).json({ error: message });
    }
  });

  app.post("/api/ai/emit", async (req, res) => {
    try {
      const blueprint = req.body as ProjectBlueprint;
      if (!blueprint.language || !blueprint.entities || !blueprint.name) {
        return res.status(400).json({ error: 'Blueprint must include name, language, and entities' });
      }

      const result = emitProject(blueprint);
      res.json({
        success: true,
        fileCount: result.files.length,
        language: result.language.displayName,
        framework: result.framework?.name || null,
        startCommand: result.startCommand,
        installCommand: result.installCommand,
        files: result.files,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to emit project';
      res.status(500).json({ error: message });
    }
  });

  app.post("/api/ai/emit/preview", async (req, res) => {
    try {
      const blueprint = req.body as ProjectBlueprint;
      if (!blueprint.language || !blueprint.entities || !blueprint.name) {
        return res.status(400).json({ error: 'Blueprint must include name, language, and entities' });
      }
      const preview = previewEmission(blueprint);
      res.json({ success: true, ...preview });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to preview emission';
      res.status(500).json({ error: message });
    }
  });

  // ============================================
  // Claude-Level Capabilities
  // ============================================

  // Natural Language Understanding
  const nluSchema = z.object({
    text: z.string().min(1, 'Text is required'),
  });

  app.post("/api/ai/nlu", async (req, res) => {
    try {
      const parsed = nluSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid request', details: parsed.error.issues });
      }

      const { text } = parsed.data;
      const analysis = analyzeNLU(text);
      const markdown = formatNLUAsMarkdown(analysis);

      res.json({
        success: true,
        analysis,
        markdown,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'NLU analysis failed';
      res.status(500).json({ error: message });
    }
  });

  // Intent classification only
  app.post("/api/ai/intent", async (req, res) => {
    try {
      const parsed = nluSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid request', details: parsed.error.issues });
      }

      const { text } = parsed.data;
      const intent = classifyIntent(text);

      res.json({ success: true, intent });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Intent classification failed';
      res.status(500).json({ error: message });
    }
  });

  // Entity extraction only
  app.post("/api/ai/entities", async (req, res) => {
    try {
      const parsed = nluSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid request', details: parsed.error.issues });
      }

      const { text } = parsed.data;
      const entities = extractEntities(text);

      res.json({ success: true, entities });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Entity extraction failed';
      res.status(500).json({ error: message });
    }
  });

  // Code explanation
  const explainCodeSchema = z.object({
    code: z.string().min(1, 'Code is required'),
    language: z.string().optional().default('javascript'),
  });

  app.post("/api/ai/explain", async (req, res) => {
    try {
      const parsed = explainCodeSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid request', details: parsed.error.issues });
      }

      const { code, language } = parsed.data;
      const explanation = explainCode(code, language);
      const markdown = formatExplanationAsMarkdown(explanation);

      res.json({
        success: true,
        explanation,
        markdown,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Code explanation failed';
      res.status(500).json({ error: message });
    }
  });

  // Detect code patterns
  app.post("/api/ai/detect-patterns", async (req, res) => {
    try {
      const parsed = explainCodeSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid request', details: parsed.error.issues });
      }

      const { code } = parsed.data;
      const patterns = detectPatterns(code);

      res.json({ success: true, patterns });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Pattern detection failed';
      res.status(500).json({ error: message });
    }
  });

  // Knowledge base - concepts
  app.get("/api/ai/concepts/:id", async (req, res) => {
    try {
      const concept = getConcept(req.params.id);
      if (!concept) {
        return res.status(404).json({ error: 'Concept not found' });
      }

      const markdown = formatConceptAsMarkdown(concept);
      res.json({ success: true, concept, markdown });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get concept';
      res.status(500).json({ error: message });
    }
  });

  // Search concepts
  app.get("/api/ai/concepts", async (req, res) => {
    try {
      const query = req.query.q as string || '';
      const concepts = query ? searchConcepts(query) : [];

      res.json({ success: true, count: concepts.length, concepts });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Search failed';
      res.status(500).json({ error: message });
    }
  });

  // Best practices
  app.get("/api/ai/best-practices", async (req, res) => {
    try {
      const category = req.query.category as string | undefined;
      const practices = getBestPractices(category);

      res.json({ success: true, count: practices.length, practices });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get best practices';
      res.status(500).json({ error: message });
    }
  });

  app.get("/api/ai/best-practices/:id", async (req, res) => {
    try {
      const practice = getBestPractice(req.params.id);
      if (!practice) {
        return res.status(404).json({ error: 'Best practice not found' });
      }

      const markdown = formatBestPracticeAsMarkdown(practice);
      res.json({ success: true, practice, markdown });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get best practice';
      res.status(500).json({ error: message });
    }
  });

  // Learning paths
  app.get("/api/ai/learning-path/:topic", async (req, res) => {
    try {
      const path = getLearningPath(req.params.topic);
      if (!path) {
        return res.status(404).json({ error: 'Learning path not found' });
      }

      res.json({ success: true, path });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get learning path';
      res.status(500).json({ error: message });
    }
  });

  // Generation Learning Engine - Stats
  app.get("/api/learning/stats", async (_req, res) => {
    try {
      await learningEngine.ensureReady();
      const stats = await learningEngine.getLearningStats();
      res.json({ success: true, ...stats });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get learning stats';
      res.status(500).json({ error: message });
    }
  });

  // Generation Learning Engine - Export all data (portable)
  app.get("/api/learning/export", async (_req, res) => {
    try {
      await learningEngine.ensureReady();
      const data = learningEngine.getFullExport();
      res.json({ success: true, ...data });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to export learning data';
      res.status(500).json({ error: message });
    }
  });

  // Generation Learning Engine - Import data (portable)
  app.post("/api/learning/import", async (req, res) => {
    try {
      await learningEngine.ensureReady();
      const { patterns, preferences } = req.body;
      const result = learningEngine.importFullData({ patterns, preferences });
      res.json({ success: true, ...result });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to import learning data';
      res.status(500).json({ error: message });
    }
  });

  // Generation Learning Engine - Save to file (for repo persistence)
  app.post("/api/learning/save", async (_req, res) => {
    try {
      await learningEngine.ensureReady();
      learningEngine.persistToFile();
      res.json({ success: true, message: 'Learning data saved to file' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save learning data';
      res.status(500).json({ error: message });
    }
  });

  // Generation Learning Engine - Get patterns by type
  app.get("/api/learning/patterns", async (req, res) => {
    try {
      await learningEngine.ensureReady();
      const minReliability = parseFloat(req.query.minReliability as string) || 0;
      const patternType = req.query.type as string | undefined;
      const category = req.query.category as string | undefined;
      let patterns = minReliability > 0
        ? learningEngine.getReliablePatterns(minReliability)
        : learningEngine.exportPatterns();
      if (patternType) {
        patterns = patterns.filter(p => p.patternType === patternType);
      }
      if (category) {
        patterns = patterns.filter(p => (p as any).category === category || p.patternType === category);
      }
      res.json({ success: true, count: patterns.length, patterns });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get patterns';
      res.status(500).json({ error: message });
    }
  });

  // Generation Learning Engine - Get entity recommendations
  app.get("/api/learning/entity/:name", async (req, res) => {
    try {
      await learningEngine.ensureReady();
      const recommendations = learningEngine.getEntityRecommendations(req.params.name);
      const workflow = learningEngine.getWorkflowRecommendation(req.params.name);
      res.json({ success: true, entity: req.params.name, recommendations, workflow });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get entity recommendations';
      res.status(500).json({ error: message });
    }
  });

  // Conversational flexibility - follow-up detection
  const followUpSchema = z.object({
    conversationId: z.string().min(1, 'Conversation ID is required'),
    prompt: z.string().min(1, 'Prompt is required'),
  });

  app.post("/api/ai/follow-up", async (req, res) => {
    try {
      const parsed = followUpSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid request', details: parsed.error.issues });
      }

      const { conversationId, prompt } = parsed.data;
      const context = getConversationContext(conversationId);
      const analysis = detectFollowUp(prompt, context);

      res.json({ success: true, analysis });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Follow-up detection failed';
      res.status(500).json({ error: message });
    }
  });

  // Conversation context update
  const contextUpdateSchema = z.object({
    conversationId: z.string().min(1, 'Conversation ID is required'),
    role: z.enum(['user', 'assistant']),
    content: z.string().min(1, 'Content is required'),
    entities: z.array(z.string()).optional().default([]),
  });

  app.post("/api/ai/context-update", async (req, res) => {
    try {
      const parsed = contextUpdateSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid request', details: parsed.error.issues });
      }

      const { conversationId, role, content, entities } = parsed.data;
      updateContext(conversationId, role, content, entities);

      res.json({ success: true, message: 'Context updated' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Context update failed';
      res.status(500).json({ error: message });
    }
  });

  // Clarification generation
  app.post("/api/ai/clarification", async (req, res) => {
    try {
      const parsed = followUpSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid request', details: parsed.error.issues });
      }

      const { conversationId, prompt } = parsed.data;
      const context = getConversationContext(conversationId);
      const clarification = generateClarification(prompt, context);

      res.json({ success: true, clarification });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Clarification generation failed';
      res.status(500).json({ error: message });
    }
  });

  // Response hints
  app.post("/api/ai/response-hints", async (req, res) => {
    try {
      const parsed = followUpSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid request', details: parsed.error.issues });
      }

      const { conversationId, prompt } = parsed.data;
      const context = getConversationContext(conversationId);
      const hints = getResponseHints(prompt, context);

      res.json({ success: true, hints });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Response hints failed';
      res.status(500).json({ error: message });
    }
  });

  // Conversation summary
  app.get("/api/ai/conversation/:id/summary", async (req, res) => {
    try {
      const summary = summarizeConversation(req.params.id);
      const context = getConversationContext(req.params.id);
      const markdown = formatConversationContextAsMarkdown(req.params.id);

      res.json({
        success: true,
        summary,
        context: {
          turnCount: context.turnCount,
          lastTopic: context.lastTopic,
          lastAction: context.lastAction,
          lastTarget: context.lastTarget,
        },
        markdown,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Summary failed';
      res.status(500).json({ error: message });
    }
  });

  // ============================================
  // Continuous Debugging API
  // ============================================

  const debugCodeSchema = z.object({
    code: z.string().min(1, 'Code is required'),
    language: z.string().optional().default('javascript'),
    sessionId: z.string().optional(),
  });

  // Continuous debug - analyze and auto-fix
  app.post("/api/debug/continuous", async (req, res) => {
    try {
      const parsed = debugCodeSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid request', details: parsed.error.issues });
      }

      const { code, sessionId } = parsed.data;
      const result = continuousDebug(code, sessionId);
      const markdown = formatDebugReport(result);

      res.json({
        success: true,
        ...result,
        markdown,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Debug failed';
      res.status(500).json({ error: message });
    }
  });

  // Parse error message
  app.post("/api/debug/parse-error", async (req, res) => {
    try {
      const schema = z.object({ error: z.string().min(1) });
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid request', details: parsed.error.issues });
      }

      const issue = parseError(parsed.data.error);
      res.json({ success: true, issue });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Parse failed';
      res.status(500).json({ error: message });
    }
  });

  // Get debug status
  app.get("/api/debug/status", async (_req, res) => {
    try {
      const status = getDebugStatus();
      res.json({ success: true, ...status });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Status failed';
      res.status(500).json({ error: message });
    }
  });

  // Get debug session
  app.get("/api/debug/session/:id", async (req, res) => {
    try {
      const session = getDebugSession(req.params.id);
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }
      res.json({ success: true, session });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Session lookup failed';
      res.status(500).json({ error: message });
    }
  });

  // ============================================
  // ENHANCED Claude-Level AI APIs
  // ============================================

  // Enhanced Intent Recognition
  app.post("/api/ai/enhanced/intent", async (req, res) => {
    try {
      const schema = z.object({ text: z.string().min(1) });
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid request', details: parsed.error.issues });
      }

      const result = recognizeIntent(parsed.data.text);
      const questionInfo = isQuestion(parsed.data.text);
      const entities = extractEntitiesEnhanced(parsed.data.text);
      const markdown = formatIntentAsMarkdown(result);

      res.json({
        success: true,
        intent: result,
        isQuestion: questionInfo,
        entities,
        markdown,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Intent recognition failed';
      res.status(500).json({ error: message });
    }
  });

  // Advanced Project Generation
  app.post("/api/ai/enhanced/generate-project", async (req, res) => {
    try {
      const schema = z.object({
        projectType: z.string().optional(),
        language: z.string().default('typescript'),
        framework: z.string().optional(),
        features: z.array(z.string()).default([]),
        database: z.string().optional(),
        auth: z.boolean().optional(),
        api: z.boolean().optional(),
        styling: z.string().optional(),
        testing: z.boolean().optional(),
      });
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid request', details: parsed.error.issues });
      }

      const project = generateProject({
        ...parsed.data,
        projectType: parsed.data.projectType || 'fullstack',
      });
      const tree = formatProjectAsTree(project);
      const markdown = formatProjectAsMarkdown(project);

      res.json({
        success: true,
        project,
        tree,
        markdown,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Project generation failed';
      res.status(500).json({ error: message });
    }
  });

  // Universal Code Explanation
  app.post("/api/ai/enhanced/explain-code", async (req, res) => {
    try {
      const schema = z.object({
        code: z.string().min(1),
        language: z.string().optional(),
      });
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid request', details: parsed.error.issues });
      }

      const explanation = explainCodeUniversal(parsed.data.code, parsed.data.language);
      const markdown = formatExplanationAsMarkdownUniversal(explanation);

      res.json({
        success: true,
        explanation,
        markdown,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Code explanation failed';
      res.status(500).json({ error: message });
    }
  });

  // Deep Error Analysis
  app.post("/api/ai/enhanced/analyze-error", async (req, res) => {
    try {
      const schema = z.object({
        error: z.string().min(1),
        code: z.string().optional(),
        context: z.object({
          framework: z.string().optional(),
          environment: z.string().optional(),
          dependencies: z.array(z.string()).optional(),
        }).optional(),
      });
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid request', details: parsed.error.issues });
      }

      const analysis = analyzeError(parsed.data.error, parsed.data.code, parsed.data.context);
      const markdown = formatDebugAnalysisAsMarkdown(analysis);

      res.json({
        success: true,
        analysis,
        markdown,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error analysis failed';
      res.status(500).json({ error: message });
    }
  });

  // Context Window Management
  app.post("/api/ai/enhanced/context/create", async (req, res) => {
    try {
      const schema = z.object({
        id: z.string().min(1),
        maxTokens: z.number().optional().default(100000),
      });
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid request', details: parsed.error.issues });
      }

      const window = createContextWindow(parsed.data.id, parsed.data.maxTokens);
      res.json({ success: true, window });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Context creation failed';
      res.status(500).json({ error: message });
    }
  });

  app.post("/api/ai/enhanced/context/add", async (req, res) => {
    try {
      const schema = z.object({
        windowId: z.string().min(1),
        type: z.enum(['code', 'conversation', 'documentation', 'error', 'system']),
        content: z.string().min(1),
        importance: z.number().min(0).max(1).optional().default(0.5),
      });
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid request', details: parsed.error.issues });
      }

      const window = addChunk(parsed.data.windowId, {
        type: parsed.data.type,
        content: parsed.data.content,
        importance: parsed.data.importance,
        timestamp: Date.now(),
      });

      if (!window) {
        return res.status(404).json({ error: 'Context window not found' });
      }

      res.json({ success: true, window });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Context add failed';
      res.status(500).json({ error: message });
    }
  });

  app.get("/api/ai/enhanced/context/:id", async (req, res) => {
    try {
      const window = getContextWindow(req.params.id);
      if (!window) {
        return res.status(404).json({ error: 'Context window not found' });
      }

      const markdown = formatContextWindowAsMarkdown(window);
      res.json({ success: true, window, markdown });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Context lookup failed';
      res.status(500).json({ error: message });
    }
  });

  app.post("/api/ai/enhanced/context/relevant", async (req, res) => {
    try {
      const schema = z.object({
        windowId: z.string().min(1),
        query: z.string().min(1),
        maxTokens: z.number().optional().default(4000),
      });
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid request', details: parsed.error.issues });
      }

      const chunks = getRelevantContextChunks(parsed.data.windowId, parsed.data.query, parsed.data.maxTokens);
      res.json({ success: true, chunks });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Context retrieval failed';
      res.status(500).json({ error: message });
    }
  });

  // Multi-language Templates
  app.get("/api/ai/enhanced/languages", async (req, res) => {
    try {
      const languages = listAllLanguages();
      res.json({ success: true, count: languages.length, languages });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Language list failed';
      res.status(500).json({ error: message });
    }
  });

  app.get("/api/ai/enhanced/languages/:id", async (req, res) => {
    try {
      const lang = getLanguageById(req.params.id);
      if (!lang) {
        return res.status(404).json({ error: 'Language not found' });
      }

      const markdown = formatLanguageSummary(lang);
      res.json({ success: true, language: lang, markdown });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Language lookup failed';
      res.status(500).json({ error: message });
    }
  });

  app.post("/api/ai/enhanced/snippet", async (req, res) => {
    try {
      const schema = z.object({
        language: z.string().min(1),
        snippet: z.string().min(1),
        variables: z.record(z.string()).optional().default({}),
      });
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid request', details: parsed.error.issues });
      }

      const code = getSnippet(parsed.data.language, parsed.data.snippet, parsed.data.variables);
      if (!code) {
        return res.status(404).json({ error: 'Snippet not found' });
      }

      res.json({ success: true, code });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Snippet generation failed';
      res.status(500).json({ error: message });
    }
  });

  // True Conversational AI
  app.post("/api/ai/enhanced/conversation/create", async (req, res) => {
    try {
      const schema = z.object({
        id: z.string().min(1),
        userId: z.string().optional(),
      });
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid request', details: parsed.error.issues });
      }

      const state = createConvState(parsed.data.id, parsed.data.userId);
      res.json({ success: true, conversation: state });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Conversation creation failed';
      res.status(500).json({ error: message });
    }
  });

  app.post("/api/ai/enhanced/conversation/turn", async (req, res) => {
    try {
      const schema = z.object({
        conversationId: z.string().min(1),
        role: z.enum(['user', 'assistant']),
        content: z.string().min(1),
      });
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid request', details: parsed.error.issues });
      }

      const turn = processTurn(parsed.data.conversationId, parsed.data.role, parsed.data.content);
      const hints = getConvHints(parsed.data.conversationId, parsed.data.content);

      res.json({ success: true, turn, hints });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Turn processing failed';
      res.status(500).json({ error: message });
    }
  });

  app.get("/api/ai/enhanced/conversation/:id", async (req, res) => {
    try {
      const state = getConvState(req.params.id);
      if (!state) {
        return res.status(404).json({ error: 'Conversation not found' });
      }

      const summary = getConversationSummary(req.params.id);
      res.json({ success: true, conversation: state, summary });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Conversation lookup failed';
      res.status(500).json({ error: message });
    }
  });

  app.post("/api/ai/enhanced/conversation/memory", async (req, res) => {
    try {
      const schema = z.object({
        conversationId: z.string().min(1),
        query: z.string().min(1),
      });
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid request', details: parsed.error.issues });
      }

      const memory = getRelevantMemory(parsed.data.conversationId, parsed.data.query);
      res.json({ success: true, memory });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Memory retrieval failed';
      res.status(500).json({ error: message });
    }
  });

  // ============================================
  // DEEP PROJECT GENERATOR APIs
  // ============================================

  // List available project blueprints
  app.get("/api/ai/deep/blueprints", async (req, res) => {
    try {
      const blueprints = listBlueprints();
      res.json({ success: true, count: blueprints.length, blueprints });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to list blueprints';
      res.status(500).json({ error: message });
    }
  });

  // Get specific blueprint details
  app.get("/api/ai/deep/blueprints/:id", async (req, res) => {
    try {
      const blueprint = getBlueprint(req.params.id);
      if (!blueprint) {
        return res.status(404).json({ error: 'Blueprint not found' });
      }
      res.json({ success: true, blueprint });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get blueprint';
      res.status(500).json({ error: message });
    }
  });

  // List available feature modules
  app.get("/api/ai/deep/features", async (req, res) => {
    try {
      const features = listFeatures();
      res.json({ success: true, count: features.length, features });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to list features';
      res.status(500).json({ error: message });
    }
  });

  // Get specific feature details
  app.get("/api/ai/deep/features/:id", async (req, res) => {
    try {
      const feature = getFeature(req.params.id);
      if (!feature) {
        return res.status(404).json({ error: 'Feature not found' });
      }
      res.json({ success: true, feature });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get feature';
      res.status(500).json({ error: message });
    }
  });

  // Generate a deep project (uses pro-generator for clean JSX output)
  app.post("/api/ai/deep/generate", async (req, res) => {
    try {
      const schema = z.object({
        blueprint: z.string().min(1),
        name: z.string().min(1),
        features: z.array(z.string()).default([]),
        includeTests: z.boolean().optional().default(false),
        includeDocker: z.boolean().optional().default(false),
        includeDocs: z.boolean().optional().default(true),
        conversationId: z.number().optional(),
      });
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid request', details: parsed.error.issues });
      }

      const prompt = `${parsed.data.name} with features: ${parsed.data.features.join(', ')}`;
      const requirements = proAnalyzePrompt(prompt);
      const proProject = proGenerateProject(requirements, prompt);
      const validation = validateGeneratedCode(proProject.files.map(f => ({ path: f.path, content: f.content })));
      const filesToSave = validation.fixedFiles.length > 0 ? validation.fixedFiles : proProject.files;
      
      if (parsed.data.conversationId) {
        const convId = parsed.data.conversationId;
        for (const file of filesToSave) {
          const ext = file.path.split('.').pop() || 'txt';
          const langMap: Record<string, string> = {
            ts: 'typescript', tsx: 'tsx', js: 'javascript', jsx: 'jsx',
            css: 'css', html: 'html', json: 'json', md: 'markdown',
            py: 'python', go: 'go', rs: 'rust', sql: 'sql'
          };
          const language = langMap[ext] || ext;
          const fixedContent = clientAutoFixCode(file.content, file.path);
          await storage.upsertProjectFile(convId, file.path, fixedContent, language);
        }
      }
      
      res.json({
        success: true,
        project: {
          name: parsed.data.name,
          blueprint: parsed.data.blueprint,
          totalFiles: filesToSave.length,
          features: parsed.data.features,
          structure: filesToSave.map(f => f.path),
        },
        files: filesToSave.map(f => ({
          path: f.path,
          type: 'source',
          size: f.content.length,
          content: f.content,
        })),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Project generation failed';
      res.status(500).json({ error: message });
    }
  });

  // Generate a deep project with AI refinement (uses pro-generator for clean JSX output)
  app.post("/api/ai/deep/generate-refined", async (req, res) => {
    try {
      const schema = z.object({
        blueprint: z.string().min(1),
        name: z.string().min(1),
        features: z.array(z.string()).default([]),
        includeTests: z.boolean().optional().default(false),
        includeDocker: z.boolean().optional().default(false),
        includeDocs: z.boolean().optional().default(true),
        enableAIRefinement: z.boolean().optional().default(true),
        aiRefinementOptions: z.object({
          enableSecurityReview: z.boolean().optional().default(true),
          enableCodeQuality: z.boolean().optional().default(true),
          enablePerformance: z.boolean().optional().default(false),
          enableConsistency: z.boolean().optional().default(false),
          maxFilesToRefine: z.number().optional().default(15),
        }).optional(),
        conversationId: z.number().optional(),
      });
      
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid request', details: parsed.error.issues });
      }

      const prompt = `${parsed.data.name} with features: ${parsed.data.features.join(', ')}`;
      const requirements = proAnalyzePrompt(prompt);
      const proProject = proGenerateProject(requirements, prompt);
      const validation = validateGeneratedCode(proProject.files.map(f => ({ path: f.path, content: f.content })));
      const filesToSave = validation.fixedFiles.length > 0 ? validation.fixedFiles : proProject.files;
      
      res.json({
        success: true,
        project: {
          name: parsed.data.name,
          blueprint: parsed.data.blueprint,
          totalFiles: filesToSave.length,
          features: parsed.data.features,
          structure: filesToSave.map(f => f.path),
        },
        files: filesToSave.map(f => ({
          path: f.path,
          type: 'source',
          size: f.content.length,
          content: f.content,
        })),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Project generation with AI refinement failed';
      res.status(500).json({ error: message });
    }
  });

  // Review existing code with AI
  app.post("/api/ai/review", async (req, res) => {
    try {
      const { isAIRefinementAvailable, reviewProject } = await import('./modules/ai-code-refiner');
      
      if (!isAIRefinementAvailable()) {
        return res.status(503).json({ 
          error: 'AI refinement not available', 
          message: 'OpenAI API key not configured. Set OPENAI_API_KEY to enable AI code review.',
          available: false,
        });
      }

      const schema = z.object({
        files: z.array(z.object({
          path: z.string(),
          content: z.string(),
          type: z.string().optional().default('source'),
        })),
      });
      
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid request', details: parsed.error.issues });
      }
      
      const review = await reviewProject(parsed.data.files);
      
      res.json({
        success: true,
        review,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Code review failed';
      res.status(500).json({ error: message });
    }
  });

  // Quick refine code
  app.post("/api/ai/refine", async (req, res) => {
    try {
      const { isAIRefinementAvailable, quickRefine } = await import('./modules/ai-code-refiner');
      
      if (!isAIRefinementAvailable()) {
        return res.status(503).json({ 
          error: 'AI refinement not available', 
          message: 'OpenAI API key not configured. Set OPENAI_API_KEY to enable AI code refinement.',
          available: false,
        });
      }

      const schema = z.object({
        files: z.array(z.object({
          path: z.string(),
          content: z.string(),
          type: z.string().optional().default('source'),
        })),
        maxFiles: z.number().optional().default(10),
      });
      
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid request', details: parsed.error.issues });
      }
      
      const results = await quickRefine(parsed.data.files, parsed.data.maxFiles);
      
      res.json({
        success: true,
        results: results.map(r => ({
          path: r.path,
          wasImproved: r.wasImproved,
          improvements: r.improvements,
          refinedContent: r.refinedContent,
        })),
        summary: {
          filesReviewed: results.length,
          filesImproved: results.filter(r => r.wasImproved).length,
          totalImprovements: results.reduce((sum, r) => sum + r.improvements.length, 0),
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Code refinement failed';
      res.status(500).json({ error: message });
    }
  });

  // Check AI refinement availability
  app.get("/api/ai/refinement-status", async (_req, res) => {
    try {
      const { isAIRefinementAvailable } = await import('./modules/ai-code-refiner');
      const available = isAIRefinementAvailable();
      
      res.json({
        available,
        message: available 
          ? 'AI refinement is available and ready to use'
          : 'AI refinement requires OPENAI_API_KEY to be configured',
      });
    } catch (error) {
      res.status(500).json({ available: false, error: 'Failed to check status' });
    }
  });

  // ============================================
  // VAPT Dashboard API Routes
  // ============================================

  const vaptAssetSchema = z.object({
    name: z.string().min(1),
    type: z.enum(['ip', 'domain', 'url', 'network_range']),
    value: z.string().min(1),
    criticality: z.enum(['low', 'medium', 'high', 'critical']),
    tags: z.array(z.string()).optional(),
    status: z.string().optional(),
  });

  const vaptVulnSchema = z.object({
    assetId: z.number().optional(),
    cveId: z.string().optional(),
    title: z.string().min(1),
    description: z.string().min(1),
    severity: z.enum(['critical', 'high', 'medium', 'low', 'info']),
    cvssScore: z.string().optional(),
    component: z.string().optional(),
    owaspCategory: z.string().optional(),
    status: z.enum(['open', 'in_progress', 'resolved', 'verified', 'false_positive']).optional(),
    assignedTo: z.string().optional(),
    deadline: z.string().optional(),
    remediation: z.string().optional(),
    evidence: z.string().optional(),
    scanId: z.number().optional(),
  });

  const vaptScanSchema = z.object({
    assetId: z.number().optional(),
    scanType: z.enum(['quick', 'standard', 'deep', 'custom']),
  });

  // Get all VAPT assets
  app.get("/api/vapt/assets", async (req, res) => {
    try {
      const assets = await storage.getVaptAssets();
      res.json(assets);
    } catch (error) {
      console.error("Error fetching VAPT assets:", error);
      res.status(500).json({ error: "Failed to fetch assets" });
    }
  });

  // Create VAPT asset
  app.post("/api/vapt/assets", async (req, res) => {
    try {
      const validated = vaptAssetSchema.parse(req.body);
      const asset = await storage.createVaptAsset(validated);
      res.status(201).json(asset);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid input", details: error.errors });
      }
      console.error("Error creating VAPT asset:", error);
      res.status(500).json({ error: "Failed to create asset" });
    }
  });

  // Update VAPT asset
  app.put("/api/vapt/assets/:id", async (req, res) => {
    try {
      const id = parseValidId(req.params.id);
      if (id === null) {
        return res.status(400).json({ error: "Invalid asset ID" });
      }
      const validated = vaptAssetSchema.partial().parse(req.body);
      const asset = await storage.updateVaptAsset(id, validated);
      res.json(asset);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid input", details: error.errors });
      }
      console.error("Error updating VAPT asset:", error);
      res.status(500).json({ error: "Failed to update asset" });
    }
  });

  // Delete VAPT asset
  app.delete("/api/vapt/assets/:id", async (req, res) => {
    try {
      const id = parseValidId(req.params.id);
      if (id === null) {
        return res.status(400).json({ error: "Invalid asset ID" });
      }
      await storage.deleteVaptAsset(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting VAPT asset:", error);
      res.status(500).json({ error: "Failed to delete asset" });
    }
  });

  // Get all vulnerabilities
  app.get("/api/vapt/vulnerabilities", async (req, res) => {
    try {
      const vulns = await storage.getVaptVulnerabilities();
      res.json(vulns);
    } catch (error) {
      console.error("Error fetching vulnerabilities:", error);
      res.status(500).json({ error: "Failed to fetch vulnerabilities" });
    }
  });

  // Create vulnerability
  app.post("/api/vapt/vulnerabilities", async (req, res) => {
    try {
      const validated = vaptVulnSchema.parse(req.body);
      const vuln = await storage.createVaptVulnerability(validated as any);
      res.status(201).json(vuln);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid input", details: error.errors });
      }
      console.error("Error creating vulnerability:", error);
      res.status(500).json({ error: "Failed to create vulnerability" });
    }
  });

  // Update vulnerability
  app.put("/api/vapt/vulnerabilities/:id", async (req, res) => {
    try {
      const id = parseValidId(req.params.id);
      if (id === null) {
        return res.status(400).json({ error: "Invalid vulnerability ID" });
      }
      const validated = vaptVulnSchema.partial().parse(req.body);
      const vuln = await storage.updateVaptVulnerability(id, validated as any);
      res.json(vuln);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid input", details: error.errors });
      }
      console.error("Error updating vulnerability:", error);
      res.status(500).json({ error: "Failed to update vulnerability" });
    }
  });

  // Delete vulnerability
  app.delete("/api/vapt/vulnerabilities/:id", async (req, res) => {
    try {
      const id = parseValidId(req.params.id);
      if (id === null) {
        return res.status(400).json({ error: "Invalid vulnerability ID" });
      }
      await storage.deleteVaptVulnerability(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting vulnerability:", error);
      res.status(500).json({ error: "Failed to delete vulnerability" });
    }
  });

  // Get all scans
  app.get("/api/vapt/scans", async (req, res) => {
    try {
      const scans = await storage.getVaptScans();
      res.json(scans);
    } catch (error) {
      console.error("Error fetching scans:", error);
      res.status(500).json({ error: "Failed to fetch scans" });
    }
  });

  // Create scan
  app.post("/api/vapt/scans", async (req, res) => {
    try {
      const validated = vaptScanSchema.parse(req.body);
      const scan = await storage.createVaptScan(validated);
      res.status(201).json(scan);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid input", details: error.errors });
      }
      console.error("Error creating scan:", error);
      res.status(500).json({ error: "Failed to create scan" });
    }
  });

  // Run scan (simulated)
  app.post("/api/vapt/scans/:id/run", async (req, res) => {
    try {
      const id = parseValidId(req.params.id);
      if (id === null) {
        return res.status(400).json({ error: "Invalid scan ID" });
      }
      const result = await storage.runVaptScan(id);
      res.json(result);
    } catch (error) {
      console.error("Error running scan:", error);
      res.status(500).json({ error: "Failed to run scan" });
    }
  });

  // Get schedules
  app.get("/api/vapt/schedules", async (req, res) => {
    try {
      const schedules = await storage.getVaptSchedules();
      res.json(schedules);
    } catch (error) {
      console.error("Error fetching schedules:", error);
      res.status(500).json({ error: "Failed to fetch schedules" });
    }
  });

  // Create schedule
  app.post("/api/vapt/schedules", async (req, res) => {
    try {
      const schedule = await storage.createVaptSchedule(req.body);
      res.status(201).json(schedule);
    } catch (error) {
      console.error("Error creating schedule:", error);
      res.status(500).json({ error: "Failed to create schedule" });
    }
  });

  // Get team members
  app.get("/api/vapt/team", async (req, res) => {
    try {
      const team = await storage.getVaptTeamMembers();
      res.json(team);
    } catch (error) {
      console.error("Error fetching team:", error);
      res.status(500).json({ error: "Failed to fetch team" });
    }
  });

  // Create team member
  app.post("/api/vapt/team", async (req, res) => {
    try {
      const member = await storage.createVaptTeamMember(req.body);
      res.status(201).json(member);
    } catch (error) {
      console.error("Error creating team member:", error);
      res.status(500).json({ error: "Failed to create team member" });
    }
  });

  // Get audit logs
  app.get("/api/vapt/audit-logs", async (req, res) => {
    try {
      const logs = await storage.getVaptAuditLogs();
      res.json(logs);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      res.status(500).json({ error: "Failed to fetch audit logs" });
    }
  });

  // Get VAPT dashboard stats
  app.get("/api/vapt/dashboard", async (req, res) => {
    try {
      const stats = await storage.getVaptDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
  });

  // Seed demo data
  app.post("/api/vapt/seed-demo", async (req, res) => {
    try {
      await storage.seedVaptDemoData();
      res.json({ success: true, message: "Demo data seeded successfully" });
    } catch (error) {
      console.error("Error seeding demo data:", error);
      res.status(500).json({ error: "Failed to seed demo data" });
    }
  });

  // ============================================
  // Local AI Pipeline Routes
  // ============================================

  app.post("/api/local-pipeline/run", async (req, res) => {
    try {
      const { runLocalPipeline } = await import("./modules/local-pipeline-router.js");
      const { userRequest, entities, relationships, features } = req.body;
      if (!userRequest || typeof userRequest !== 'string') {
        return res.status(400).json({ error: "userRequest is required and must be a string" });
      }
      if (userRequest.length > 50000) {
        return res.status(400).json({ error: "userRequest exceeds maximum length of 50000 characters" });
      }
      const result = await runLocalPipeline(userRequest, entities, relationships, features);
      res.json(result);
    } catch (error) {
      console.error("Local pipeline error:", error);
      res.status(500).json({ error: "Pipeline execution failed" });
    }
  });

  app.get("/api/local-pipeline/stages", async (_req, res) => {
    try {
      const { STAGE_DEFINITIONS } = await import("./modules/local-pipeline-router.js");
      res.json(STAGE_DEFINITIONS);
    } catch (error) {
      res.status(500).json({ error: "Failed to load stage definitions" });
    }
  });

  app.post("/api/local-ai/parse-intent", async (req, res) => {
    try {
      const { localAI } = await import("./modules/local-ai-engine.js");
      const { description } = req.body;
      if (!description) return res.status(400).json({ error: "description is required" });
      const result = localAI.parseIntent(description);
      res.json(result);
    } catch (error) {
      console.error("Intent parse error:", error);
      res.status(500).json({ error: "Failed to parse intent" });
    }
  });

  app.post("/api/local-ai/search-similar", async (req, res) => {
    try {
      const { localAI } = await import("./modules/local-ai-engine.js");
      const { query, category, limit } = req.body;
      if (!query) return res.status(400).json({ error: "query is required" });
      const results = await localAI.searchSimilar(query, category || "all", limit || 10);
      res.json(results);
    } catch (error) {
      console.error("Search error:", error);
      res.status(500).json({ error: "Search failed" });
    }
  });

  app.get("/api/local-ai/stats", async (_req, res) => {
    try {
      const { learningBrain } = await import("./modules/learning-stage.js");
      const { templateRegistry } = await import("./modules/template-registry.js");
      const stats = await learningBrain.getStats();
      const templateStats = templateRegistry.getStats();
      res.json({ learning: stats, templates: templateStats });
    } catch (error) {
      res.status(500).json({ error: "Failed to get stats" });
    }
  });

  app.post("/api/local-ai/feedback", async (req, res) => {
    try {
      const { learningBrain } = await import("./modules/learning-stage.js");
      const { pipelineId, rating, comment } = req.body;
      if (!pipelineId || rating === undefined) {
        return res.status(400).json({ error: "pipelineId and rating are required" });
      }
      await learningBrain.recordFeedback(pipelineId, rating, comment || "");
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to record feedback" });
    }
  });

  app.get("/api/codegen-v2/test", async (_req, res) => {
    try {
      const { runAllTests } = await import("./modules/codegen-e2e-test.js");
      const result = runAllTests();
      res.json(result);
    } catch (error: any) {
      console.error("CodeGen V2 test error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  return httpServer;
}
