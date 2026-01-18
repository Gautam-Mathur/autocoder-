import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import OpenAI from "openai";
import { z } from "zod";

// Check if Replit AI is available
const hasReplitAI = !!(process.env.AI_INTEGRATIONS_OPENAI_API_KEY && process.env.AI_INTEGRATIONS_OPENAI_BASE_URL);

let openai: OpenAI | null = null;
if (hasReplitAI) {
  openai = new OpenAI({
    apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
    baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  });
}

const createConversationSchema = z.object({
  title: z.string().min(1).max(200).optional().default("New Chat"),
});

const sendMessageSchema = z.object({
  content: z.string().min(1).max(32000),
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Health check with AI status
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok",
      aiMode: hasReplitAI ? "cloud" : "local",
      message: hasReplitAI ? "Cloud AI ready" : "Local template engine active"
    });
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
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
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
      const conversation = await storage.createConversation(parsed.data.title);
      res.status(201).json(conversation);
    } catch (error) {
      console.error("Error creating conversation:", error);
      res.status(500).json({ error: "Failed to create conversation" });
    }
  });

  app.delete("/api/conversations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid conversation ID" });
      }
      await storage.deleteConversation(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting conversation:", error);
      res.status(500).json({ error: "Failed to delete conversation" });
    }
  });

  app.post("/api/conversations/:id/messages", async (req, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      if (isNaN(conversationId)) {
        return res.status(400).json({ error: "Invalid conversation ID" });
      }

      const parsed = sendMessageSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid request body", details: parsed.error.issues });
      }

      const { content } = parsed.data;

      await storage.createMessage(conversationId, "user", content);

      // Use Replit AI if available, otherwise signal client to use local engine
      if (openai) {
        const messages = await storage.getMessagesByConversation(conversationId);
        const chatMessages = [
          {
            role: "system" as const,
            content: `You are CodeAI, a brilliant senior developer working as the user's dedicated coding partner.

PROJECT-BASED WORKFLOW:
This conversation is ONE PROJECT. Everything the user tells you builds your understanding:
- Remember the project name, purpose, target audience, and features discussed
- Every new request should build on what you've learned - maintain consistent branding, colors, style
- If they said "SecureMage is a cybersecurity tool for small businesses" - ALL future code uses that context
- Treat this like an ongoing collaboration, not isolated requests

CONTEXT MEMORY - Pay attention to:
- Project/brand name → Use it in headers, titles, footers consistently
- What the product does → Reflect this in copy, icons, and features shown
- Target audience → Adjust tone, complexity, and design accordingly
- Previously established colors/style → Keep designs cohesive across all code you generate
- Features mentioned → Include relevant ones in navigation, sections, CTAs

YOUR APPROACH:
1. LISTEN for context clues - product name, purpose, audience, features
2. ASK smart questions if critical context is missing (max 2-3 questions)
3. BUILD on previous context - each piece of code should feel like part of the same project
4. SUGGEST improvements - "Since SecureMage focuses on security, I'd recommend adding trust badges and encryption icons"
5. ITERATE - when they ask for changes, update while keeping established context

ADAPTIVE DESIGN:
- Cybersecurity app → Dark theme, shield icons, trust signals, technical but accessible
- Fitness app → Energetic colors, progress visuals, motivational copy
- Finance app → Clean/professional, trust indicators, data visualization
- Creative tool → Bold colors, playful elements, showcase creativity
- Healthcare → Calm colors, accessibility focus, reassuring tone

Match everything to what you've learned about their specific project.

PROACTIVE SUGGESTIONS:
After delivering code, briefly suggest 1-2 things that could enhance their project:
- "Want me to add a pricing section next?"
- "I could create a matching contact form that fits this style"
- "A features comparison table might help convert visitors"

PERSONALITY:
- You're their dedicated dev partner for this project
- Reference previous context naturally ("Using the SecureMage purple theme...")
- Be concise, warm, and proactive

When sharing code:
- Use markdown code blocks with language specified
- Self-contained HTML with embedded CSS
- Maintain consistent style/branding across all code in this conversation`,
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

        res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
        res.end();
      } else {
        // No cloud AI - tell client to use local engine
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        
        res.write(`data: ${JSON.stringify({ useLocalEngine: true, userMessage: content })}\n\n`);
        res.end();
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

  return httpServer;
}
