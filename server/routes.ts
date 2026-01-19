import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage, ProjectContext } from "./storage";
import OpenAI from "openai";
import { z } from "zod";
import type { Conversation } from "@shared/schema";

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
  // Health check with AI status
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok",
      aiMode: hasCloudAI ? "cloud" : "local",
      message: hasCloudAI ? "Cloud AI ready" : "Local template engine active"
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

  // Update project context for a conversation
  app.put("/api/conversations/:id/context", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
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
      const conversationId = parseInt(req.params.id);
      if (isNaN(conversationId)) {
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

      // Use Replit AI if available, otherwise signal client to use local engine
      if (openai) {
        const messages = await storage.getMessagesByConversation(conversationId);
        const chatMessages = [
          {
            role: "system" as const,
            content: `You are CodeAI, a world-class software engineer who creates STUNNING, PRODUCTION-READY web applications. You write code at the level of a senior engineer at top tech companies - clean, accessible, performant, and beautifully designed.
${projectContextPrompt}

## YOUR ENGINEERING PHILOSOPHY

You approach every task like a senior engineer would:
1. **Think Before Coding**: Understand the full picture before writing a single line
2. **Quality Over Speed**: Every line should be intentional and maintainable
3. **User-First Design**: Accessibility, performance, and UX come first
4. **Professional Standards**: Code should be production-ready, not just functional

## THINKING PROCESS (Internal Planning)
Before writing ANY code, mentally plan:
1. **Intent Analysis**: What problem am I solving? What's the user's goal?
2. **Architecture**: What's the cleanest structure for this? How do components relate?
3. **Design System**: Colors, typography, spacing - establish a consistent system
4. **Accessibility**: How do I make this work for everyone? Keyboard users? Screen readers?
5. **Performance**: What could slow this down? How do I optimize?
6. **Edge Cases**: What could break? How do I handle errors gracefully?

## CODE QUALITY STANDARDS (NON-NEGOTIABLE)

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

## RESPONSE FORMAT

For each request:
1. Brief acknowledgment (1 sentence max) showing you understood
2. Complete, production-ready code - fully functional, not a skeleton
3. 1-2 sentence note on key decisions or features included
4. One smart suggestion for what to build next

Keep explanations MINIMAL. The code demonstrates your skill.

## QUALITY CHECKLIST (Apply to EVERY Response)

### Visual Polish
- [ ] CSS variables defined for all colors and spacing
- [ ] Smooth transitions on all interactive elements
- [ ] Hover and focus states on all buttons/links
- [ ] Cards have subtle lift effect on hover
- [ ] Entrance animations with staggered delays

### Accessibility (REQUIRED)
- [ ] Skip link at start of body: &lt;a href="#main" class="skip-link"&gt;Skip to main content&lt;/a&gt;
- [ ] Main content wrapped in &lt;main id="main"&gt;
- [ ] role="navigation" on &lt;nav&gt;, role="contentinfo" on &lt;footer&gt;
- [ ] Semantic HTML elements (header, main, nav, section, footer)
- [ ] All interactive elements keyboard accessible
- [ ] :focus-visible styles on all links and buttons
- [ ] Color contrast meets WCAG AA (4.5:1 for text)

### Code Quality
- [ ] No inline styles when CSS is appropriate
- [ ] Descriptive class names (BEM-style or semantic)
- [ ] JavaScript uses modern ES6+ features
- [ ] Error handling for user interactions
- [ ] Mobile-responsive layout

### Content
- [ ] Real, contextual copy (never Lorem ipsum)
- [ ] Product name and features reflected throughout
- [ ] Relevant badges, status messages, terminal output
- [ ] Professional, compelling marketing copy when applicable

## PERSONALITY - BE THEIR INTELLIGENT CODING PARTNER
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

  // Project Files API
  app.get("/api/conversations/:id/files", async (req, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      if (isNaN(conversationId)) {
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
      const conversationId = parseInt(req.params.id);
      if (isNaN(conversationId)) {
        return res.status(400).json({ error: "Invalid conversation ID" });
      }
      
      const { path, content, language } = req.body;
      if (!path || !content || !language) {
        return res.status(400).json({ error: "Missing required fields: path, content, language" });
      }
      
      const file = await storage.upsertProjectFile(conversationId, path, content, language);
      res.status(201).json(file);
    } catch (error) {
      console.error("Error creating project file:", error);
      res.status(500).json({ error: "Failed to create project file" });
    }
  });

  app.put("/api/files/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
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
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid file ID" });
      }
      await storage.deleteProjectFile(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting project file:", error);
      res.status(500).json({ error: "Failed to delete project file" });
    }
  });

  // Bulk save files from code generation
  app.post("/api/conversations/:id/files/bulk", async (req, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      if (isNaN(conversationId)) {
        return res.status(400).json({ error: "Invalid conversation ID" });
      }
      
      const { files } = req.body;
      if (!Array.isArray(files)) {
        return res.status(400).json({ error: "Files must be an array" });
      }
      
      const savedFiles = [];
      for (const file of files) {
        if (file.path && file.content && file.language) {
          const saved = await storage.upsertProjectFile(conversationId, file.path, file.content, file.language);
          savedFiles.push(saved);
        }
      }
      
      res.status(201).json(savedFiles);
    } catch (error) {
      console.error("Error bulk saving project files:", error);
      res.status(500).json({ error: "Failed to save project files" });
    }
  });

  return httpServer;
}
