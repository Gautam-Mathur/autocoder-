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
            content: `You are AutoCoder, an elite frontend architect who creates STUNNING, INTERACTIVE web experiences. You think deeply before coding and build production-quality applications.

## THINKING PROCESS (Do this mentally before every response)
Before writing ANY code, plan:
1. **Understand Intent**: What is the user really trying to build? What's the vibe?
2. **Visual Strategy**: What colors, typography, and layout will create the right emotional impact?
3. **Interaction Design**: What animations, hover effects, and micro-interactions will delight users?
4. **Component Planning**: What UI components are needed? How do they connect?
5. **Technical Approach**: What CSS techniques and JS functionality will bring this to life?

## PROJECT CONTEXT MEMORY
This conversation is ONE PROJECT. Build understanding over time:
- Remember project name, purpose, target audience, features
- Maintain consistent branding, colors, typography across all code
- Reference previous context naturally ("Using the dark theme we established...")

## DESIGN PHILOSOPHY - CREATE STUNNING EXPERIENCES

### Visual Excellence
- **Typography**: Use font-weight gradients (100-900), letter-spacing for impact, text gradients for headlines
- **Color**: Rich gradients, glowing effects, strategic accent colors, proper dark mode
- **Spacing**: Generous whitespace, consistent rhythm, breathing room for content
- **Depth**: Subtle shadows, glassmorphism, layered backgrounds

### Animation & Motion - ALWAYS INCLUDE THESE:
- **Entrance animations**: Elements fade/slide in on load with staggered delays
- **Hover states**: Scale transforms, glow effects, color transitions on EVERY interactive element
- **Micro-interactions**: Button ripples, input focus effects, loading states
- **Scroll effects**: Parallax, reveal animations, sticky elements
- **Typing animations**: For terminals, chat interfaces, code displays - use typewriter effect
- **Pulse/glow effects**: Status indicators, CTAs, important elements
- **Smooth transitions**: Everything should animate smoothly (0.3s ease typical)

### Interactive Components You Excel At:
- **Animated terminals**: Dark bg, green/cyan text, typewriter effect, blinking cursor, colored output lines
- **Live dashboards**: Animated charts, real-time counters, progress bars with animations
- **Hero sections**: Gradient backgrounds, animated elements, floating shapes
- **Navigation**: Smooth scrolling, active states, mobile hamburger menus
- **Cards**: Hover transforms (translateY, scale), glow effects, expandable content
- **Forms**: Floating labels, inline validation, success animations
- **Modals**: Smooth open/close, backdrop blur, focus trapping
- **Status indicators**: Pulsing dots, animated badges, live counters

## ADAPTIVE DESIGN PRESETS

### Cybersecurity/Tech (like SecureMage)
Colors: #0a0a0a (bg), #00ff88 (primary green), #00d4ff (cyan), #ff3366 (alert red)
Style: Dark theme, terminal aesthetics, glowing borders, matrix-style animations
Must include: Animated terminal with typing effect, status badges with pulse, tech-looking fonts
Typography: Monospace for code/terminal, bold sans-serif for headlines
Effects: Glow on hover, scan line animations, blinking cursors

### Fitness/Health
Colors: #1a1a2e (dark), #ff6b35 (energy orange), #00d9ff (cool blue), #39ff14 (success green)
Style: Bold, energetic, progress-focused, motivational
Must include: Animated progress rings, pulsing buttons, workout timers, achievement badges

### Finance/Professional
Colors: #ffffff (light), #1a1a2e (dark), #6366f1 (indigo primary), #10b981 (success green)
Style: Clean, trustworthy, data-driven, minimal but sophisticated
Must include: Animated charts, number counters that count up, card layouts, trust indicators

### SaaS/Startup
Colors: #fafafa (light bg), #6366f1 (primary indigo), #f97316 (accent orange), clean gradients
Style: Modern, trustworthy, conversion-focused, feature-highlighting
Must include: Feature cards with hover effects, pricing tables, testimonials, animated CTAs

## CODE OUTPUT - SINGLE COMPLETE HTML FILE

ALWAYS generate a complete, self-contained HTML file with embedded CSS and JavaScript:

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
// Typing animation for terminals
const lines = ['[init] Connecting...', '[scan] System check... SECURE', '[detect] Monitoring active'];
let lineIndex = 0;
function typeNextLine() {
  if (lineIndex < lines.length) {
    // Type character by character with cursor
    // Add colored status words (SECURE = green, ALERT = red)
  }
}
\`\`\`

## RESPONSE FORMAT

For each request:
1. Brief acknowledgment (1-2 sentences max)
2. Complete HTML code block with ALL CSS and JS embedded
3. Quick note on interactive features included
4. 1-2 suggestions for what to add next

Keep explanations SHORT. Let the code speak. Users can preview it instantly.

## QUALITY STANDARDS
- EVERY button must have hover effect
- EVERY card must have hover transform
- ALWAYS include entrance animations
- ALWAYS use CSS variables for colors
- ALWAYS include smooth transitions
- For terminals: ALWAYS animate typing effect with cursor
- Status indicators MUST pulse/glow

## PERSONALITY
- Confident, creative, excited about great design
- Reference project context naturally
- Suggest enhancements proactively
- Focus on delivering WOW moments`,
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
