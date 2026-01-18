// Code Generation Engine - Smart Template-based code generator

import { allTemplates, CodeTemplate } from "./templates";

interface GenerationResult {
  code: string;
  language: string;
  templateName: string;
  confidence: number;
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

// Extract parameters from user input
function extractParams(input: string): Record<string, string> {
  const params: Record<string, string> = {};
  
  // Extract quoted strings as potential titles
  const quotedMatch = input.match(/"([^"]+)"/);
  if (quotedMatch) {
    params.title = quotedMatch[1];
  }
  
  // Extract 'called X' or 'named X'
  const namedMatch = input.match(/(?:called|named)\s+["']?([A-Za-z]\w*)["']?/i);
  if (namedMatch) {
    params.name = namedMatch[1];
  }
  
  // Extract 'for X' as description
  const forMatch = input.match(/for\s+(?:a\s+)?(.+?)(?:\s+page|\s+site|\s+app|\.|$)/i);
  if (forMatch) {
    params.description = forMatch[1];
  }
  
  // Extract URL if present
  const urlMatch = input.match(/(https?:\/\/[^\s]+)/);
  if (urlMatch) {
    params.url = urlMatch[1];
  }
  
  // Extract company/brand name
  const brandMatch = input.match(/(?:for|my|our)\s+(?:company\s+)?["']?([A-Z][a-zA-Z]+)["']?/);
  if (brandMatch && !params.title) {
    params.title = brandMatch[1];
  }
  
  return params;
}

// Find the best matching template
function findBestTemplate(input: string): { template: CodeTemplate; score: number } | null {
  const keywords = extractKeywords(input);
  
  if (keywords.length === 0) {
    return null;
  }
  
  let bestTemplate: CodeTemplate | null = null;
  let bestScore = 0;
  
  for (const template of allTemplates) {
    const score = calculateMatchScore(keywords, template);
    if (score > bestScore) {
      bestScore = score;
      bestTemplate = template;
    }
  }
  
  // Lower threshold for better matching
  if (bestTemplate && bestScore > 0.08) {
    return { template: bestTemplate, score: bestScore };
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

// Main generation function
export function generateCode(input: string): string {
  const result = findBestTemplate(input);
  const params = extractParams(input);
  
  if (!result) {
    return generateFallbackResponse(input);
  }
  
  const { template, score } = result;
  const code = template.generate(params);
  
  // Format the response with enthusiasm
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
