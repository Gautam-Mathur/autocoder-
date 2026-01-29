// Code Generation Engine - Smart Template-based code generator
// Uses Sage Knowledge Base for human-like understanding
// WebApp Knowledge for multi-language apps
// Learning Module for constant improvement

import { allTemplates, CodeTemplate } from "./templates";
import { understandRequest, conceptLibrary, RequestIntent } from "./knowledge-base";
import { techStacks, appBlueprints, codePatterns, getStackForAppType, getStackRecommendation } from "./webapp-knowledge";
import { getLearningEngine, intelligentParse, LearnedPattern } from "./learning-module";
import { detectDomain, customizeTemplate, getDomainContent } from "./creativity-module";
import { isFullyFunctionalRequest, generateFullStackApp, formatFullStackResponse } from "./fullstack-generator";
import { debugCode, checkErrors, recordCodeChange, getDebugStats, CodeError } from "./debug-module";

interface GenerationResult {
  code: string;
  language: string;
  templateName: string;
  confidence: number;
}

interface ProjectFile {
  path: string;
  content: string;
  language?: string;
}

// Detect if this is a modification request vs new creation
function isModificationRequest(input: string): boolean {
  const modificationKeywords = [
    "change", "update", "modify", "edit", "make it", "add", "remove", "delete",
    "more", "less", "bigger", "smaller", "darker", "lighter", "brighter",
    "different", "replace", "fix", "improve", "adjust", "tweak", "switch",
    "green", "blue", "red", "black", "white", "purple", "orange", "pink", "yellow",
    "color", "colour", "colors", "colours", "theme", "style", "styling",
    "font", "text", "size", "padding", "margin", "border", "background",
    "now", "instead", "but", "with"
  ];
  
  const lowerInput = input.toLowerCase();
  return modificationKeywords.some(keyword => lowerInput.includes(keyword));
}

// Extract color modifications from input
function extractColorChanges(input: string): Record<string, string> {
  const colors: Record<string, string> = {};
  const lowerInput = input.toLowerCase();
  
  // Common color keywords and their values
  const colorMap: Record<string, string> = {
    "green": "#22c55e",
    "dark green": "#166534",
    "light green": "#86efac",
    "black": "#000000",
    "white": "#ffffff",
    "blue": "#3b82f6",
    "dark blue": "#1e40af",
    "light blue": "#93c5fd",
    "red": "#ef4444",
    "purple": "#a855f7",
    "pink": "#ec4899",
    "orange": "#f97316",
    "yellow": "#eab308",
    "gray": "#6b7280",
    "grey": "#6b7280",
    "dark": "#1a1a2e",
    "darker": "#0f0f1a",
  };
  
  // Check for specific color mentions
  for (const [colorName, colorValue] of Object.entries(colorMap)) {
    if (lowerInput.includes(colorName)) {
      if (lowerInput.includes("primary") || lowerInput.includes("main") || lowerInput.includes("accent")) {
        colors.primary = colorValue;
      } else if (lowerInput.includes("background") || lowerInput.includes("bg")) {
        colors.background = colorValue;
      } else if (lowerInput.includes("text")) {
        colors.text = colorValue;
      } else {
        // Apply to primary by default for accent colors, background for dark/black
        if (colorName.includes("dark") || colorName === "black") {
          colors.background = colorValue;
        } else {
          colors.primary = colorValue;
        }
      }
    }
  }
  
  // Check for "green and black" style patterns
  if (lowerInput.includes("green") && (lowerInput.includes("black") || lowerInput.includes("dark"))) {
    colors.primary = "#22c55e";
    colors.background = "#0a0a0f";
    colors.surface = "#121218";
  }
  
  if (lowerInput.includes("blue") && (lowerInput.includes("black") || lowerInput.includes("dark"))) {
    colors.primary = "#3b82f6";
    colors.background = "#0a0a0f";
    colors.surface = "#121218";
  }
  
  return colors;
}

// Apply color changes to existing HTML/CSS code
function applyColorChanges(code: string, colors: Record<string, string>): string {
  let modifiedCode = code;
  
  if (colors.primary) {
    // Replace primary color in CSS variables and inline styles
    modifiedCode = modifiedCode.replace(/--primary:\s*#[0-9a-fA-F]{3,8}/g, `--primary: ${colors.primary}`);
    modifiedCode = modifiedCode.replace(/--primary-glow:\s*rgba\([^)]+\)/g, `--primary-glow: ${colors.primary}40`);
    // Replace common purple/violet colors (default theme colors)
    modifiedCode = modifiedCode.replace(/#8b5cf6/gi, colors.primary);
    modifiedCode = modifiedCode.replace(/#a855f7/gi, colors.primary);
    modifiedCode = modifiedCode.replace(/#7c3aed/gi, colors.primary);
    modifiedCode = modifiedCode.replace(/#ec4899/gi, colors.primary); // pink gradients
  }
  
  if (colors.background) {
    modifiedCode = modifiedCode.replace(/--bg:\s*#[0-9a-fA-F]{3,8}/g, `--bg: ${colors.background}`);
    modifiedCode = modifiedCode.replace(/#0a0a0f/gi, colors.background);
    modifiedCode = modifiedCode.replace(/#0f0f1a/gi, colors.background);
  }
  
  if (colors.surface) {
    modifiedCode = modifiedCode.replace(/--surface:\s*#[0-9a-fA-F]{3,8}/g, `--surface: ${colors.surface}`);
    modifiedCode = modifiedCode.replace(/--card:\s*#[0-9a-fA-F]{3,8}/g, `--card: ${colors.surface}`);
    modifiedCode = modifiedCode.replace(/#12121a/gi, colors.surface);
    modifiedCode = modifiedCode.replace(/#1a1a25/gi, colors.surface);
  }
  
  if (colors.text) {
    modifiedCode = modifiedCode.replace(/--text:\s*#[0-9a-fA-F]{3,8}/g, `--text: ${colors.text}`);
  }
  
  return modifiedCode;
}

// Generate code with context from existing project files
export function generateCodeWithContext(input: string, existingFiles: ProjectFile[]): string {
  // Check if we have existing files and this looks like a modification request
  const htmlFile = existingFiles.find(f => f.path.endsWith(".html"));
  
  if (htmlFile && isModificationRequest(input)) {
    // This is a modification request - update existing code
    const colorChanges = extractColorChanges(input);
    
    if (Object.keys(colorChanges).length > 0) {
      // Apply color modifications
      const modifiedCode = applyColorChanges(htmlFile.content, colorChanges);
      
      let response = `I've updated the **${htmlFile.path}** with your color changes:\n\n`;
      response += "--- FILE: " + htmlFile.path + " ---\n";
      response += modifiedCode;
      response += "\n\n";
      response += "**Changes made:**\n";
      
      if (colorChanges.primary) {
        response += `• Primary/accent color → ${colorChanges.primary}\n`;
      }
      if (colorChanges.background) {
        response += `• Background color → ${colorChanges.background}\n`;
      }
      if (colorChanges.surface) {
        response += `• Surface/card colors → ${colorChanges.surface}\n`;
      }
      
      response += "\nThe preview should update automatically!";
      
      return response;
    }
    
    // If we couldn't detect specific changes, still acknowledge we're modifying
    // but fall back to generating new code for now
    let response = "I'll update your existing project. ";
    response += generateCode(input);
    return response;
  }
  
  // No existing files or not a modification request - generate new
  return generateCode(input);
}

// Synonym mappings for better matching
const synonyms: Record<string, string[]> = {
  landing: ["home", "homepage", "hero", "main", "welcome", "intro", "startup", "saas", "product", "marketing"],
  form: ["input", "contact", "signup", "register", "login", "auth", "submit", "email", "subscribe"],
  card: ["box", "tile", "panel", "item", "product", "portfolio", "gallery"],
  grid: ["layout", "columns", "gallery", "masonry", "responsive"],
  navbar: ["navigation", "menu", "header", "topbar", "nav", "links"],
  dashboard: ["admin", "panel", "analytics", "stats", "metrics", "overview"],
  modal: ["popup", "dialog", "overlay", "lightbox", "alert"],
  fetch: ["api", "http", "request", "get", "post", "ajax", "rest", "data"],
  todo: ["task", "list", "checklist", "items", "notes"],
  button: ["btn", "click", "action", "cta"],
  animation: ["animate", "motion", "transition", "effect", "hover", "fade", "slide"],
  flex: ["flexbox", "row", "column", "align", "center", "justify"],
  component: ["react", "functional", "hook", "useState", "props"],
  validation: ["validate", "check", "verify", "rules", "error"],
  storage: ["localstorage", "save", "persist", "cache", "store", "session"],
  debounce: ["throttle", "delay", "performance", "optimize", "scroll", "search"],
};

// Expand keywords using synonyms
function expandKeywords(keywords: string[]): string[] {
  const expanded = new Set(keywords);
  
  for (const keyword of keywords) {
    // Check if this keyword is a synonym for something
    for (const [main, syns] of Object.entries(synonyms)) {
      if (syns.includes(keyword) || main === keyword) {
        expanded.add(main);
        syns.forEach(s => expanded.add(s));
      }
    }
  }
  
  return Array.from(expanded);
}

// Extract keywords from user input
function extractKeywords(input: string): string[] {
  const text = input.toLowerCase();
  
  // Remove common stop words
  const stopWords = new Set([
    "a", "an", "the", "is", "are", "was", "were", "be", "been", "being",
    "have", "has", "had", "do", "does", "did", "will", "would", "could",
    "should", "may", "might", "must", "can", "need", "want", "please",
    "make", "create", "build", "write", "generate", "give", "show", "me",
    "i", "you", "we", "they", "it", "this", "that", "with", "for", "to",
    "of", "in", "on", "at", "by", "from", "how", "what", "which", "some",
    "just", "like", "also", "really", "very", "nice", "good", "great",
    "cool", "awesome", "amazing", "beautiful", "pretty", "looking"
  ]);
  
  // Extract words
  const words = text
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter(word => word.length > 1 && !stopWords.has(word));
  
  // Get unique words
  const unique = Array.from(new Set(words));
  
  // Expand with synonyms
  return expandKeywords(unique);
}

// Calculate match score with fuzzy matching
function calculateMatchScore(userKeywords: string[], template: CodeTemplate): number {
  if (userKeywords.length === 0) return 0;
  
  let totalScore = 0;
  let matchedKeywords = 0;
  
  for (const userWord of userKeywords) {
    let bestMatchScore = 0;
    
    for (const templateWord of template.keywords) {
      // Exact match
      if (templateWord === userWord) {
        bestMatchScore = 1;
        break;
      }
      
      // Contains match
      if (templateWord.includes(userWord) || userWord.includes(templateWord)) {
        const similarity = Math.min(userWord.length, templateWord.length) / 
                          Math.max(userWord.length, templateWord.length);
        bestMatchScore = Math.max(bestMatchScore, 0.7 * similarity + 0.3);
      }
      
      // Levenshtein-based fuzzy match for typos
      const distance = levenshteinDistance(userWord, templateWord);
      const maxLen = Math.max(userWord.length, templateWord.length);
      const fuzzyScore = 1 - (distance / maxLen);
      
      if (fuzzyScore > 0.7) {
        bestMatchScore = Math.max(bestMatchScore, fuzzyScore * 0.8);
      }
    }
    
    if (bestMatchScore > 0) {
      totalScore += bestMatchScore;
      matchedKeywords++;
    }
  }
  
  // Weighted score: considers both coverage and match quality
  const coverage = matchedKeywords / userKeywords.length;
  const quality = matchedKeywords > 0 ? totalScore / matchedKeywords : 0;
  
  return coverage * 0.6 + quality * 0.4;
}

// Simple Levenshtein distance for typo tolerance
function levenshteinDistance(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  
  const matrix: number[][] = [];
  
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      const cost = a[j - 1] === b[i - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  
  return matrix[b.length][a.length];
}

// Capitalize first letter of each word
function capitalizeWords(str: string): string {
  return str.replace(/\b\w/g, c => c.toUpperCase());
}

// Clean and simplify complex input to extract core request
function simplifyInput(input: string): string {
  // Remove markdown formatting
  let simplified = input
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '') // Remove markdown links
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '') // Remove markdown images
    .replace(/#{1,6}\s*/g, '') // Remove headers
    .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold
    .replace(/\*([^*]+)\*/g, '$1') // Remove italics
    .replace(/`([^`]+)`/g, '$1') // Remove inline code
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .replace(/[-•]\s+/g, ' ') // Remove bullet points
    .replace(/\n+/g, ' ') // Replace newlines with spaces
    .replace(/\s+/g, ' ') // Collapse whitespace
    .trim();
  
  // If input is very long, focus on the first sentence or key phrase
  if (simplified.length > 200) {
    // Try to extract the core request from the beginning
    const firstSentence = simplified.match(/^[^.!?]+[.!?]?/);
    if (firstSentence) {
      simplified = firstSentence[0];
    } else {
      simplified = simplified.slice(0, 200);
    }
  }
  
  return simplified;
}

// Extract the product/brand name from complex input
function extractProductName(input: string): string | null {
  const lowerInput = input.toLowerCase();
  
  // Common patterns for product names
  const patterns = [
    // "landing page for ProductName" or "for # ProductName"
    /(?:for|of)\s+#?\s*([A-Z][a-zA-Z0-9]+(?:\s+[A-Z][a-zA-Z0-9]+)*)/,
    // "ProductName landing page" or "ProductName Security Platform"
    /^#?\s*([A-Z][a-zA-Z0-9]+(?:\s+[A-Z][a-zA-Z0-9]+)*)\s+(?:landing|page|platform|security|app)/i,
    // Quoted names
    /"([^"]+)"/,
    // After "called" or "named"
    /(?:called|named)\s+["']?([A-Za-z][A-Za-z0-9\s]+?)["']?(?:\s|$)/i,
  ];
  
  for (const pattern of patterns) {
    const match = input.match(pattern);
    if (match && match[1]) {
      const name = match[1].trim();
      // Skip generic words
      const skipWords = ["a", "an", "the", "my", "our", "your", "this", "that", "landing", "page", "website", "site", "app"];
      if (!skipWords.includes(name.toLowerCase()) && name.length > 1) {
        return name;
      }
    }
  }
  
  // Try to find capitalized product names (like "SecureWatch", "CodeAI")
  const capitalizedMatch = input.match(/\b([A-Z][a-z]+[A-Z][a-zA-Z]*)\b/);
  if (capitalizedMatch) {
    return capitalizedMatch[1];
  }
  
  return null;
}

// Extract key features mentioned in the input
function extractFeatures(input: string): string[] {
  const features: string[] = [];
  const lowerInput = input.toLowerCase();
  
  // Security-related features
  if (lowerInput.includes('security') || lowerInput.includes('secure')) features.push('Security');
  if (lowerInput.includes('siem')) features.push('SIEM');
  if (lowerInput.includes('vapt') || lowerInput.includes('vulnerability')) features.push('Vulnerability Testing');
  if (lowerInput.includes('compliance')) features.push('Compliance');
  if (lowerInput.includes('monitoring')) features.push('Monitoring');
  if (lowerInput.includes('ai') || lowerInput.includes('artificial intelligence')) features.push('AI-Powered');
  if (lowerInput.includes('analytics')) features.push('Analytics');
  if (lowerInput.includes('automation') || lowerInput.includes('automated')) features.push('Automation');
  if (lowerInput.includes('enterprise')) features.push('Enterprise');
  if (lowerInput.includes('real-time') || lowerInput.includes('realtime')) features.push('Real-Time');
  
  return features.slice(0, 3); // Limit to 3 features
}

// Extract parameters from user input
function extractParams(input: string): Record<string, string> {
  const params: Record<string, string> = {};
  
  // Simplify complex input first
  const simplified = simplifyInput(input);
  
  // Extract product/brand name
  const productName = extractProductName(input) || extractProductName(simplified);
  if (productName) {
    params.title = productName;
  }
  
  // Extract quoted strings as potential titles (if no product name found)
  if (!params.title) {
    const quotedMatch = input.match(/"([^"]+)"/);
    if (quotedMatch) {
      params.title = quotedMatch[1];
    }
  }
  
  // Extract features for description
  const features = extractFeatures(input);
  if (features.length > 0) {
    params.features = features.join(', ');
    if (!params.description) {
      params.description = `${features.join(' • ')} solutions for your business`;
    }
  }
  
  // Extract URL if present
  const urlMatch = input.match(/(https?:\/\/[^\s]+)/);
  if (urlMatch) {
    params.url = urlMatch[1];
  }
  
  return params;
}

// Explicit template type keywords - these should take priority when mentioned
const explicitTemplateTypes: Record<string, string[]> = {
  "html-landing": ["landing", "landing page", "landingpage", "homepage", "home page", "hero", "startup page", "saas page", "marketing page", "website for"],
  "html-dashboard": ["dashboard", "admin panel", "analytics dashboard", "admin dashboard", "erp", "enterprise resource", "crm", "inventory", "management system", "admin system", "back office", "backoffice", "control panel"],
  "html-form": ["form", "contact form", "signup form", "login form", "registration form", "subscribe form"],
  "html-card-grid": ["card grid", "cards", "portfolio", "gallery", "product grid", "product list"],
  "html-navbar": ["navbar", "navigation", "header", "menu bar", "nav bar"],
  "js-todo-app": ["todo", "todo app", "task list", "checklist"],
  "react-form": ["react form", "react component form"],
  "react-modal": ["modal", "popup", "dialog"],
};

// Find the best matching template using:
// 1. Learning Module (remembers what worked)
// 2. Sage Knowledge Base (understands concepts)
// 3. WebApp Knowledge (knows how to build apps)
function findBestTemplate(input: string): { template: CodeTemplate; score: number } | null {
  // STEP 1: Check Learning Module first (learned patterns have priority)
  const learningResult = intelligentParse(input);
  if (learningResult.suggestedSolution && learningResult.confidence > 0.5) {
    const learnedTemplate = allTemplates.find(t => t.id === learningResult.suggestedSolution);
    if (learnedTemplate) {
      // Reinforce the pattern that matched
      if (learningResult.matchedPatterns.length > 0) {
        getLearningEngine().reinforce(learningResult.matchedPatterns[0].id);
      }
      return { template: learnedTemplate, score: learningResult.confidence };
    }
  }
  
  // Use corrected spelling from learning module
  const correctedInput = learningResult.corrected;
  
  // STEP 2: Use Sage Knowledge Base to understand the request
  const intent = understandRequest(correctedInput);
  
  // If we have a confident understanding, use it
  if (intent.confidence > 0.2) {
    const matchedTemplate = allTemplates.find(t => t.id === intent.template);
    if (matchedTemplate) {
      return { template: matchedTemplate, score: intent.confidence };
    }
  }
  
  // STEP 3: Check WebApp Knowledge for stack recommendations
  const stackRecs = getStackRecommendation(correctedInput);
  if (stackRecs.length > 0) {
    const stack = techStacks[stackRecs[0]];
    if (stack) {
      // Map stack to template
      const stackTemplateMap: Record<string, string> = {
        "interactive-dashboard": "html-dashboard",
        "spa-vanilla": "html-dashboard",
        "ecommerce-frontend": "html-card-grid",
        "form-heavy-app": "html-form",
        "vanilla-fullstack": "html-landing",
        "vanilla-with-api": "html-landing"
      };
      const templateId = stackTemplateMap[stack.id];
      if (templateId) {
        const stackTemplate = allTemplates.find(t => t.id === templateId);
        if (stackTemplate) {
          return { template: stackTemplate, score: 0.7 };
        }
      }
    }
  }
  
  // Simplify complex input for fallback matching
  const simplified = simplifyInput(correctedInput);
  const lowerInput = correctedInput.toLowerCase();
  const lowerSimplified = simplified.toLowerCase();
  
  // Check explicit template type keywords
  for (const [templateId, typeKeywords] of Object.entries(explicitTemplateTypes)) {
    for (const typeKeyword of typeKeywords) {
      if (lowerInput.includes(typeKeyword) || lowerSimplified.includes(typeKeyword)) {
        const explicitTemplate = allTemplates.find(t => t.id === templateId);
        if (explicitTemplate) {
          return { template: explicitTemplate, score: 1.0 };
        }
      }
    }
  }
  
  // Extract keywords from simplified input for keyword matching
  const keywords = extractKeywords(simplified);
  
  if (keywords.length === 0) {
    const originalKeywords = extractKeywords(correctedInput);
    if (originalKeywords.length === 0) {
      // Default to landing page for complex inputs
      const landingTemplate = allTemplates.find(t => t.id === "html-landing");
      if (landingTemplate) {
        return { template: landingTemplate, score: 0.5 };
      }
      return null;
    }
  }
  
  // Keyword-based matching as fallback
  let bestTemplate: CodeTemplate | null = null;
  let bestScore = 0;
  
  for (const template of allTemplates) {
    const score = calculateMatchScore(keywords, template);
    if (score > bestScore) {
      bestScore = score;
      bestTemplate = template;
    }
  }
  
  if (bestTemplate && bestScore > 0.08) {
    return { template: bestTemplate, score: bestScore };
  }
  
  // Default to landing page if we have a product name
  const productName = extractProductName(correctedInput);
  if (productName) {
    const landingTemplate = allTemplates.find(t => t.id === "html-landing");
    if (landingTemplate) {
      return { template: landingTemplate, score: 0.5 };
    }
  }
  
  return null;
}

// Generate multiple code suggestions
function generateMultipleSuggestions(input: string, limit: number = 3): GenerationResult[] {
  const keywords = extractKeywords(input);
  const params = extractParams(input);
  
  if (keywords.length === 0) {
    return [];
  }
  
  // Score all templates
  const scored = allTemplates
    .map(template => ({
      template,
      score: calculateMatchScore(keywords, template)
    }))
    .filter(item => item.score > 0.08)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
  
  return scored.map(({ template, score }) => ({
    code: template.generate(params),
    language: template.language,
    templateName: template.name,
    confidence: Math.round(score * 100)
  }));
}

// Detect debug/fix requests
function isDebugRequest(input: string): boolean {
  const lower = input.toLowerCase();
  return [
    "debug", "fix", "error", "not working", "doesn't work", "broken",
    "help me fix", "what's wrong", "issue", "bug", "problem",
    "check my code", "analyze", "why isn't", "why is it"
  ].some(t => lower.includes(t));
}

// Main generation function
export function generateCode(input: string): string {
  // DEBUG: Analyze code for errors
  if (isDebugRequest(input)) {
    // Extract code from the input if present
    const codeMatch = input.match(/```[\w]*\n([\s\S]*?)\n```/);
    if (codeMatch) {
      const code = codeMatch[1];
      return debugCode(code);
    }
    
    // Return debug capabilities info
    return `🔍 **Debug Mode Active**

I can help you debug your code! Here's what I can do:

**Error Detection:**
• Syntax errors (missing brackets, quotes, colons)
• Runtime errors (undefined variables, null references)
• Logic issues (potential bugs, anti-patterns)
• Security vulnerabilities (SQL injection, XSS)

**How to use:**
1. Paste your code with \`\`\` code blocks
2. Share console error messages
3. Describe what's not working

**Example:**
\`\`\`
debug this:
\`\`\`python
def greet(name)
    print("Hello " + name)
\`\`\`
\`\`\`

**I'm also watching your code changes and learning from how you fix errors!**

${(() => {
  const stats = getDebugStats();
  if (stats.changesObserved > 0) {
    return `\n📊 **Debug Stats:**\n• Changes observed: ${stats.changesObserved}\n• Fixes learned: ${stats.fixesLearned}`;
  }
  return '';
})()}`;
  }
  
  // FULLY FUNCTIONAL: Generate complete multi-file application
  if (isFullyFunctionalRequest(input)) {
    const app = generateFullStackApp(input);
    return formatFullStackResponse(app);
  }
  
  const result = findBestTemplate(input);
  const params = extractParams(input);
  
  if (!result) {
    return generateFallbackResponse(input);
  }
  
  const { template, score } = result;
  let code = template.generate(params);
  
  // CREATIVITY: Detect domain and customize output
  const intent = understandRequest(input);
  const domain = detectDomain(intent, input);
  
  // Customize the template for the detected domain
  if (domain !== "default" && template.language === "html") {
    code = customizeTemplate(code, domain);
    
    // Get domain-specific content for response
    const domainContent = getDomainContent(domain);
    
    // Format response with domain awareness
    let response = `Here's a **${domainContent.title}** for you:\n\n`;
    response += "```" + template.language + "\n";
    response += code;
    response += "\n```\n\n";
    
    // Domain-specific tips
    response += `**Pro tips:** This ${domain.toUpperCase()} dashboard includes:\n`;
    domainContent.features.slice(0, 4).forEach(feature => {
      response += `• ${feature}\n`;
    });
    response += "\nCustomize the stats, navigation, and charts for your needs!";
    
    return response;
  }
  
  // Standard response for non-customized templates
  let response = `Here's a **${template.name}** for you:\n\n`;
  response += "```" + template.language + "\n";
  response += code;
  response += "\n```\n\n";
  
  // Add helpful tips based on template type
  response += getTemplateTips(template.id);
  
  // Show other suggestions
  const alternatives = generateMultipleSuggestions(input, 4)
    .filter(r => r.templateName !== template.name);
  
  if (alternatives.length > 0) {
    response += "\n**Want more? I can also generate:**\n";
    alternatives.forEach(alt => {
      response += `• ${alt.templateName}\n`;
    });
    response += "\nJust ask!";
  }
  
  return response;
}

// Get helpful tips for each template type
function getTemplateTips(templateId: string): string {
  const tips: Record<string, string> = {
    "html-landing": "**Pro tips:** Click **Live Preview** to see it in action. The page is fully responsive and works on mobile!",
    "html-form": "**Pro tips:** The form includes client-side validation and a success animation. Click **Live Preview** to try it!",
    "html-card-grid": "**Pro tips:** The cards use CSS Grid for responsive layouts. Add more cards by copying the `<article class=\"card\">` block.",
    "html-navbar": "**Pro tips:** The navbar is sticky and has a blur effect. It collapses to a hamburger menu on mobile.",
    "html-dashboard": "**Pro tips:** The sidebar collapses on mobile. Customize the stats cards with your own data!",
    "js-fetch": "**Pro tips:** Use `api.get()`, `api.post()`, etc. All requests include error handling and proper headers.",
    "js-todo-app": "**Pro tips:** The todo app persists to localStorage! Your tasks will survive page refreshes.",
    "react-form": "**Pro tips:** The form has full validation, loading states, and a success message. Drop it into any React project!",
    "react-modal": "**Pro tips:** The modal traps focus, closes on Escape, and uses a portal for proper z-index handling.",
    "css-animations": "**Pro tips:** These animations respect `prefers-reduced-motion` for accessibility!",
  };
  
  return tips[templateId] || "**Pro tips:** Click **Live Preview** on HTML code to see it rendered!";
}

// Fallback when no template matches
function generateFallbackResponse(input: string): string {
  const keywords = extractKeywords(input);
  
  let response = "I'd love to help! Here's what I can build for you:\n\n";
  
  response += "**Web Pages & UI**\n";
  response += "• Landing pages with hero sections\n";
  response += "• Contact forms with validation\n";
  response += "• Card grids & product layouts\n";
  response += "• Navigation bars & dashboards\n\n";
  
  response += "**JavaScript Utilities**\n";
  response += "• API fetch wrappers\n";
  response += "• LocalStorage managers\n";
  response += "• Debounce & throttle functions\n";
  response += "• Complete todo apps\n\n";
  
  response += "**React Components**\n";
  response += "• Forms with validation\n";
  response += "• Modal dialogs\n";
  response += "• Custom hooks (useFetch)\n\n";
  
  response += "**CSS Patterns**\n";
  response += "• Flexbox layouts\n";
  response += "• CSS Grid systems\n";
  response += "• Smooth animations\n\n";
  
  response += "**Try saying:**\n";
  response += "• \"Create a landing page for my startup\"\n";
  response += "• \"Build a contact form\"\n";
  response += "• \"Make a React modal component\"\n";
  response += "• \"CSS grid layout for products\"\n";
  
  if (keywords.length > 0) {
    response += `\n\n*I understood: ${keywords.slice(0, 5).join(", ")}*`;
  }
  
  return response;
}

// Get list of available templates
export function getAvailableTemplates(): { category: string; templates: string[] }[] {
  return [
    {
      category: "HTML/Web Pages",
      templates: ["Landing Page", "Contact Form", "Card Grid", "Navigation Bar", "Dashboard"]
    },
    {
      category: "JavaScript",
      templates: ["Fetch API Wrapper", "LocalStorage Manager", "Debounce & Throttle", "Form Validation", "Todo App"]
    },
    {
      category: "React",
      templates: ["Counter Component", "Form with Validation", "Modal Dialog", "useFetch Hook"]
    },
    {
      category: "CSS",
      templates: ["Flexbox Layouts", "CSS Grid Patterns", "Animations & Transitions"]
    }
  ];
}

// Check if a request is about coding
export function isCodingRequest(input: string): boolean {
  const codingKeywords = [
    "code", "html", "css", "javascript", "js", "react", "component",
    "function", "page", "website", "webapp", "form", "button", "layout",
    "style", "create", "make", "build", "write", "generate", "show",
    "todo", "list", "card", "grid", "flex", "modal", "fetch", "api",
    "nav", "navbar", "header", "footer", "landing", "responsive",
    "template", "design", "dashboard", "admin", "animation", "hover",
    "app", "application", "site", "web", "frontend", "ui", "ux"
  ];
  
  const lowerInput = input.toLowerCase();
  return codingKeywords.some(keyword => lowerInput.includes(keyword));
}

// Export debug functions for UI components
export {
  debugCode,
  checkErrors,
  recordCodeChange,
  getDebugStats
};

// Re-export types
export type { CodeError } from "./debug-module";
