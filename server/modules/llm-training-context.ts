// LLM Training Context - Teaches local AI to generate working code
// Zero-config: This context is injected automatically

// Core patterns the LLM must understand
export const CODE_PATTERNS = {
  // React component pattern
  reactComponent: `// React Component Pattern
import { useState, useEffect } from 'react';

export default function ComponentName({ prop1, prop2 }) {
  const [state, setState] = useState(initialValue);
  
  useEffect(() => {
    // Side effects here
  }, [dependencies]);
  
  const handleEvent = () => {
    setState(newValue);
  };
  
  return (
    <div className="container">
      <h1>{prop1}</h1>
      <button onClick={handleEvent}>{state}</button>
    </div>
  );
}`,

  // Express server pattern
  expressServer: `// Express Server Pattern
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

app.get('/api/items', (req, res) => {
  res.json({ items: [] });
});

app.post('/api/items', (req, res) => {
  const { name, value } = req.body;
  res.json({ success: true, item: { name, value } });
});

app.listen(PORT, () => console.log(\`Server running on port \${PORT}\`));`,

  // HTML page pattern
  htmlPage: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Page Title</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, sans-serif; background: #0a0a0a; color: #fff; }
    .container { max-width: 1200px; margin: 0 auto; padding: 2rem; }
    .btn { background: #3b82f6; color: white; padding: 0.75rem 1.5rem; border: none; border-radius: 0.5rem; cursor: pointer; }
    .btn:hover { background: #2563eb; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Title</h1>
    <button class="btn" onclick="handleClick()">Click Me</button>
  </div>
  <script>
    function handleClick() {
      console.log('clicked');
    }
  </script>
</body>
</html>`,

  // CSS modern pattern
  modernCSS: `/* Modern CSS Pattern */
:root {
  --primary: #3b82f6;
  --background: #0a0a0a;
  --foreground: #fafafa;
  --card: #1a1a1a;
  --border: #2a2a2a;
}

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: system-ui, -apple-system, sans-serif;
  background: var(--background);
  color: var(--foreground);
  line-height: 1.6;
}

.container { max-width: 1200px; margin: 0 auto; padding: 1rem; }
.card { background: var(--card); border: 1px solid var(--border); border-radius: 0.5rem; padding: 1.5rem; }
.btn { background: var(--primary); color: white; padding: 0.5rem 1rem; border: none; border-radius: 0.375rem; cursor: pointer; transition: opacity 0.2s; }
.btn:hover { opacity: 0.9; }
.grid { display: grid; gap: 1rem; }
.flex { display: flex; gap: 1rem; align-items: center; }`,

  // JavaScript utility pattern
  jsUtility: `// JavaScript Utility Pattern
const utils = {
  // Format currency
  formatCurrency: (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount),
  
  // Format date
  formatDate: (date) => new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(date)),
  
  // Debounce function
  debounce: (fn, delay) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  },
  
  // Fetch with error handling
  async fetchJSON(url, options = {}) {
    const res = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...options });
    if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
    return res.json();
  },
  
  // Generate unique ID
  generateId: () => Math.random().toString(36).substr(2, 9),
};`,
};

// Full project examples for different types
export const PROJECT_EXAMPLES = {
  todoApp: {
    name: "todo-app",
    files: [
      {
        path: "index.html",
        language: "html",
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Todo App</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="container">
    <h1>My Todos</h1>
    <form id="todo-form">
      <input type="text" id="todo-input" placeholder="Add a todo..." required>
      <button type="submit" class="btn">Add</button>
    </form>
    <ul id="todo-list"></ul>
  </div>
  <script src="app.js"></script>
</body>
</html>`
      },
      {
        path: "style.css",
        language: "css",
        content: `:root {
  --primary: #3b82f6;
  --bg: #0f172a;
  --card: #1e293b;
  --text: #f8fafc;
  --border: #334155;
}

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: system-ui, sans-serif;
  background: var(--bg);
  color: var(--text);
  min-height: 100vh;
  padding: 2rem;
}

.container {
  max-width: 500px;
  margin: 0 auto;
}

h1 {
  margin-bottom: 1.5rem;
  font-size: 2rem;
}

#todo-form {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

#todo-input {
  flex: 1;
  padding: 0.75rem 1rem;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  color: var(--text);
  font-size: 1rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 1rem;
}

.btn:hover { opacity: 0.9; }

#todo-list {
  list-style: none;
}

.todo-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  margin-bottom: 0.5rem;
}

.todo-item.done span {
  text-decoration: line-through;
  opacity: 0.5;
}

.todo-item span { flex: 1; }

.delete-btn {
  background: #ef4444;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  border: none;
  color: white;
  cursor: pointer;
}`
      },
      {
        path: "app.js",
        language: "javascript",
        content: `const form = document.getElementById('todo-form');
const input = document.getElementById('todo-input');
const list = document.getElementById('todo-list');

let todos = JSON.parse(localStorage.getItem('todos')) || [];

function saveTodos() {
  localStorage.setItem('todos', JSON.stringify(todos));
}

function renderTodos() {
  list.innerHTML = todos.map((todo, index) => \`
    <li class="todo-item \${todo.done ? 'done' : ''}">
      <input type="checkbox" \${todo.done ? 'checked' : ''} onchange="toggleTodo(\${index})">
      <span>\${todo.text}</span>
      <button class="delete-btn" onclick="deleteTodo(\${index})">Delete</button>
    </li>
  \`).join('');
}

function addTodo(text) {
  todos.push({ text, done: false });
  saveTodos();
  renderTodos();
}

function toggleTodo(index) {
  todos[index].done = !todos[index].done;
  saveTodos();
  renderTodos();
}

function deleteTodo(index) {
  todos.splice(index, 1);
  saveTodos();
  renderTodos();
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (input.value.trim()) {
    addTodo(input.value.trim());
    input.value = '';
  }
});

renderTodos();`
      }
    ],
    dependencies: [],
    instructions: "Open index.html in browser"
  },

  apiServer: {
    name: "api-server",
    files: [
      {
        path: "package.json",
        language: "json",
        content: `{
  "name": "api-server",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "node --watch server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5"
  }
}`
      },
      {
        path: "server.js",
        language: "javascript",
        content: `const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

let items = [
  { id: 1, name: 'Item 1', description: 'First item' },
  { id: 2, name: 'Item 2', description: 'Second item' }
];

let nextId = 3;

app.get('/api/items', (req, res) => {
  res.json({ success: true, data: items });
});

app.get('/api/items/:id', (req, res) => {
  const item = items.find(i => i.id === parseInt(req.params.id));
  if (!item) {
    return res.status(404).json({ success: false, error: 'Item not found' });
  }
  res.json({ success: true, data: item });
});

app.post('/api/items', (req, res) => {
  const { name, description } = req.body;
  if (!name) {
    return res.status(400).json({ success: false, error: 'Name is required' });
  }
  const item = { id: nextId++, name, description: description || '' };
  items.push(item);
  res.status(201).json({ success: true, data: item });
});

app.put('/api/items/:id', (req, res) => {
  const index = items.findIndex(i => i.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Item not found' });
  }
  items[index] = { ...items[index], ...req.body };
  res.json({ success: true, data: items[index] });
});

app.delete('/api/items/:id', (req, res) => {
  const index = items.findIndex(i => i.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Item not found' });
  }
  items.splice(index, 1);
  res.json({ success: true, message: 'Item deleted' });
});

app.listen(PORT, () => {
  console.log(\`API Server running on http://localhost:\${PORT}\`);
});`
      }
    ],
    dependencies: ["express", "cors"],
    instructions: "npm install && npm start"
  }
};

// Code editing patterns - how to modify existing code
export const CODE_EDITING_PATTERNS = {
  addFunction: `// To add a function to existing code:
// 1. Find the appropriate location (after imports, before exports)
// 2. Add the complete function with proper spacing
// 3. Export if needed

// BEFORE:
const utils = { existingFn: () => {} };

// AFTER (adding new function):
const utils = { 
  existingFn: () => {},
  newFunction: (param) => {
    return param * 2;
  }
};`,

  fixBug: `// To fix a bug:
// 1. Identify the problematic code
// 2. Understand the intended behavior
// 3. Replace with corrected code

// BUG: Missing null check
const getName = (user) => user.name;

// FIXED: Added null check
const getName = (user) => user?.name ?? 'Unknown';`,

  addFeature: `// To add a feature:
// 1. Add required imports
// 2. Add state/data structures
// 3. Add UI elements
// 4. Add event handlers
// 5. Connect everything

// Example: Adding dark mode toggle
// Step 1: Add state
const [isDark, setIsDark] = useState(false);

// Step 2: Add toggle function
const toggleTheme = () => {
  setIsDark(!isDark);
  document.body.classList.toggle('dark');
};

// Step 3: Add UI
<button onClick={toggleTheme}>{isDark ? 'Light' : 'Dark'}</button>`,
};

// Error patterns and fixes
export const ERROR_FIXES = {
  "Cannot read property of undefined": `
// Problem: Accessing property on null/undefined
// Fix: Add optional chaining and nullish coalescing
const value = obj?.nested?.property ?? defaultValue;`,

  "is not a function": `
// Problem: Calling something that isn't a function
// Fix: Check if it's a function before calling
if (typeof fn === 'function') {
  fn();
}`,

  "Unexpected token": `
// Problem: Syntax error - missing/extra bracket, comma, etc.
// Fix: Check for:
// - Missing closing brackets: }, ], )
// - Missing commas in objects/arrays
// - Unclosed strings
// - Invalid JSON`,

  "Module not found": `
// Problem: Import path is wrong or module not installed
// Fix: 
// 1. Check the import path (use relative paths: ./file)
// 2. Install missing package: npm install package-name
// 3. Check file extension if needed`,
};

// Build the complete training prompt
export function buildTrainingContext(taskType: 'generate' | 'edit' | 'fix' | 'understand'): string {
  let context = `You are a specialized CODE GENERATION AI. Your ONLY job is to write working code.

OUTPUT RULES - CRITICAL:
1. Output ONLY valid code or JSON - NEVER markdown, NEVER explanations
2. NO \`\`\` code fences - raw code only
3. Every file must be COMPLETE and RUNNABLE
4. Use modern JavaScript/TypeScript patterns
5. Include helpful inline comments in code where appropriate

`;

  if (taskType === 'generate') {
    context += `PROJECT OUTPUT FORMAT (JSON only):
{
  "name": "project-name-lowercase",
  "files": [
    {"path": "index.html", "content": "<!DOCTYPE html>...", "language": "html"},
    {"path": "style.css", "content": ":root {...", "language": "css"},
    {"path": "app.js", "content": "const app = ...", "language": "javascript"}
  ],
  "dependencies": [],
  "instructions": "Open index.html in browser"
}

REQUIRED PATTERNS:

HTML Structure:
- DOCTYPE, html, head (with meta viewport), body
- Link CSS files, script JS files at end of body
- Use semantic elements: header, main, section, footer

CSS Requirements:
- CSS variables for colors in :root
- Dark theme by default (bg: #0a0a0a to #1a1a1a)
- Mobile-first responsive design
- Flexbox/Grid for layouts

JavaScript Requirements:
- Use const/let, never var
- Arrow functions for callbacks
- Async/await for promises
- Error handling with try/catch
- DOM ready: document.addEventListener('DOMContentLoaded', ...)

`;

    // Add a concrete example
    context += `EXAMPLE - Todo App:
${JSON.stringify(PROJECT_EXAMPLES.todoApp, null, 2)}

`;
  }

  if (taskType === 'edit') {
    context += `CODE EDITING RULES:
1. Return ONLY the modified code
2. Preserve existing functionality unless asked to change it
3. Match the existing code style
4. Add new features without breaking existing ones

${CODE_EDITING_PATTERNS.addFunction}

${CODE_EDITING_PATTERNS.addFeature}
`;
  }

  if (taskType === 'fix') {
    context += `BUG FIXING RULES:
1. Identify the root cause, not just symptoms
2. Fix the bug without changing unrelated code
3. Add defensive checks to prevent similar bugs

COMMON FIXES:
${Object.entries(ERROR_FIXES).map(([error, fix]) => `${error}:\n${fix}`).join('\n\n')}
`;
  }

  if (taskType === 'understand') {
    context += `CODE ANALYSIS RULES:
1. Identify the main purpose of the code
2. List all functions and their roles
3. Note any bugs or issues
4. Suggest improvements

Output format:
{
  "purpose": "What this code does",
  "functions": [{"name": "fnName", "purpose": "what it does"}],
  "issues": ["list of problems"],
  "suggestions": ["list of improvements"]
}
`;
  }

  context += `
STYLE GUIDE:
- 2 space indentation
- Single quotes for strings
- Semicolons at end of statements
- camelCase for variables/functions
- PascalCase for components/classes
- UPPERCASE for constants

REMEMBER: Output RAW CODE or JSON only. No markdown. No explanations. Just working code.`;

  return context;
}

// Enhanced system prompt that includes training
export const ENHANCED_CODE_SYSTEM_PROMPT = buildTrainingContext('generate');

// Export specific prompts for different tasks
export const EDIT_CODE_PROMPT = buildTrainingContext('edit');
export const FIX_CODE_PROMPT = buildTrainingContext('fix');
export const UNDERSTAND_CODE_PROMPT = buildTrainingContext('understand');
