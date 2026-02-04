// Runnable Full-Stack Templates - Generate projects that actually run in WebContainer
// Each template produces a complete Node.js project with package.json, server, and frontend

export interface RunnableProject {
  name: string;
  description: string;
  files: { path: string; content: string; language: string }[];
}

// Base package.json for Vite + React projects
function createPackageJson(name: string, deps: Record<string, string> = {}): string {
  return JSON.stringify({
    name: name.toLowerCase().replace(/\s+/g, '-'),
    version: "1.0.0",
    type: "module",
    scripts: {
      dev: "vite",
      build: "vite build",
      preview: "vite preview"
    },
    dependencies: {
      react: "^18.2.0",
      "react-dom": "^18.2.0",
      ...deps
    },
    devDependencies: {
      "@vitejs/plugin-react": "^4.2.1",
      vite: "^5.0.0"
    }
  }, null, 2);
}

// Base package.json for Express + React projects
function createFullStackPackageJson(name: string, deps: Record<string, string> = {}): string {
  return JSON.stringify({
    name: name.toLowerCase().replace(/\s+/g, '-'),
    version: "1.0.0",
    type: "module",
    scripts: {
      dev: "node server.js",
      start: "node server.js"
    },
    dependencies: {
      express: "^4.18.2",
      cors: "^2.8.5",
      ...deps
    }
  }, null, 2);
}

// Vite config for React
const viteConfig = `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000
  }
});
`;

// Basic index.html for Vite
const viteIndexHtml = (title: string) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.jsx"></script>
</body>
</html>
`;

// Main.jsx entry point
const mainJsx = `import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
`;

// ============================================
// COUNTER APP
// ============================================
export function generateCounterApp(): RunnableProject {
  return {
    name: "Counter App",
    description: "Interactive counter with increment, decrement, and reset",
    files: [
      {
        path: "package.json",
        language: "json",
        content: createPackageJson("counter-app")
      },
      {
        path: "vite.config.js",
        language: "javascript",
        content: viteConfig
      },
      {
        path: "index.html",
        language: "html",
        content: viteIndexHtml("Counter App")
      },
      {
        path: "src/main.jsx",
        language: "jsx",
        content: mainJsx
      },
      {
        path: "src/index.css",
        language: "css",
        content: `* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  font-family: 'Inter', system-ui, sans-serif;
  background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%);
  color: #e2e8f0;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
.container {
  text-align: center;
  padding: 3rem;
  background: rgba(255,255,255,0.05);
  border-radius: 24px;
  border: 1px solid rgba(255,255,255,0.1);
  backdrop-filter: blur(10px);
}
h1 { font-size: 1.5rem; color: #94a3b8; margin-bottom: 1rem; }
.counter {
  font-size: 6rem;
  font-weight: 700;
  background: linear-gradient(135deg, #6366f1, #a855f7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 1rem 0;
}
.buttons { display: flex; gap: 1rem; justify-content: center; }
button {
  padding: 1rem 2rem;
  font-size: 1.5rem;
  font-weight: 600;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}
.decrement { background: #ef4444; color: white; }
.decrement:hover { background: #dc2626; transform: translateY(-2px); }
.increment { background: #6366f1; color: white; }
.increment:hover { background: #4f46e5; transform: translateY(-2px); }
.reset { background: #1f2937; color: #e2e8f0; border: 1px solid #374151; }
.reset:hover { background: #374151; }`
      },
      {
        path: "src/App.jsx",
        language: "jsx",
        content: `import { useState } from 'react';

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="container">
      <h1>Counter</h1>
      <div className="counter">{count}</div>
      <div className="buttons">
        <button className="decrement" onClick={() => setCount(c => c - 1)}>-</button>
        <button className="reset" onClick={() => setCount(0)}>Reset</button>
        <button className="increment" onClick={() => setCount(c => c + 1)}>+</button>
      </div>
    </div>
  );
}
`
      }
    ]
  };
}

// ============================================
// TODO LIST APP
// ============================================
export function generateTodoApp(): RunnableProject {
  return {
    name: "Todo List",
    description: "Full-featured todo list with add, complete, and delete",
    files: [
      {
        path: "package.json",
        language: "json",
        content: createPackageJson("todo-app")
      },
      {
        path: "vite.config.js",
        language: "javascript",
        content: viteConfig
      },
      {
        path: "index.html",
        language: "html",
        content: viteIndexHtml("Todo List")
      },
      {
        path: "src/main.jsx",
        language: "jsx",
        content: mainJsx
      },
      {
        path: "src/index.css",
        language: "css",
        content: `* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  font-family: 'Inter', system-ui, sans-serif;
  background: #0f0f23;
  color: #e2e8f0;
  min-height: 100vh;
  padding: 2rem;
}
.container { max-width: 600px; margin: 0 auto; }
h1 { text-align: center; margin-bottom: 2rem; font-size: 2rem; }
.add-form {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}
input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid #374151;
  border-radius: 8px;
  background: #1a1a2e;
  color: #e2e8f0;
  font-size: 1rem;
}
input:focus { outline: none; border-color: #6366f1; }
button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}
.add-btn { background: #6366f1; color: white; }
.add-btn:hover { background: #4f46e5; }
.todo-list { list-style: none; }
.todo-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #1a1a2e;
  border-radius: 8px;
  margin-bottom: 0.5rem;
  border: 1px solid #374151;
}
.todo-item.completed span { text-decoration: line-through; color: #6b7280; }
.todo-item span { flex: 1; }
.delete-btn { background: #ef4444; color: white; padding: 0.5rem 1rem; }
.delete-btn:hover { background: #dc2626; }
.checkbox {
  width: 20px;
  height: 20px;
  cursor: pointer;
}
.empty { text-align: center; color: #6b7280; padding: 2rem; }`
      },
      {
        path: "src/App.jsx",
        language: "jsx",
        content: `import { useState } from 'react';

export default function App() {
  const [todos, setTodos] = useState([
    { id: 1, text: 'Learn React', completed: false },
    { id: 2, text: 'Build something awesome', completed: false }
  ]);
  const [input, setInput] = useState('');

  const addTodo = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setTodos([...todos, { id: Date.now(), text: input, completed: false }]);
    setInput('');
  };

  const toggleTodo = (id) => {
    setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter(t => t.id !== id));
  };

  return (
    <div className="container">
      <h1>Todo List</h1>
      <form className="add-form" onSubmit={addTodo}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Add a new task..."
        />
        <button type="submit" className="add-btn">Add</button>
      </form>
      {todos.length === 0 ? (
        <p className="empty">No todos yet. Add one above!</p>
      ) : (
        <ul className="todo-list">
          {todos.map(todo => (
            <li key={todo.id} className={\`todo-item \${todo.completed ? 'completed' : ''}\`}>
              <input
                type="checkbox"
                className="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo.id)}
              />
              <span>{todo.text}</span>
              <button className="delete-btn" onClick={() => deleteTodo(todo.id)}>Delete</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
`
      }
    ]
  };
}

// ============================================
// CALCULATOR APP
// ============================================
export function generateCalculatorApp(): RunnableProject {
  return {
    name: "Calculator",
    description: "Functional calculator with basic operations",
    files: [
      {
        path: "package.json",
        language: "json",
        content: createPackageJson("calculator-app")
      },
      {
        path: "vite.config.js",
        language: "javascript",
        content: viteConfig
      },
      {
        path: "index.html",
        language: "html",
        content: viteIndexHtml("Calculator")
      },
      {
        path: "src/main.jsx",
        language: "jsx",
        content: mainJsx
      },
      {
        path: "src/index.css",
        language: "css",
        content: `* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  font-family: 'Inter', system-ui, sans-serif;
  background: #0f0f23;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
.calculator {
  background: #1a1a2e;
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid #374151;
  box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
}
.display {
  background: #0f0f23;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  text-align: right;
}
.display .previous { color: #6b7280; font-size: 1rem; min-height: 1.5rem; }
.display .current { color: #e2e8f0; font-size: 2.5rem; font-weight: 600; }
.buttons { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem; }
button {
  padding: 1.25rem;
  font-size: 1.25rem;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s;
  background: #374151;
  color: #e2e8f0;
}
button:hover { background: #4b5563; }
button:active { transform: scale(0.95); }
.operator { background: #6366f1; }
.operator:hover { background: #4f46e5; }
.equals { background: #22c55e; grid-column: span 2; }
.equals:hover { background: #16a34a; }
.clear { background: #ef4444; }
.clear:hover { background: #dc2626; }
.zero { grid-column: span 2; }`
      },
      {
        path: "src/App.jsx",
        language: "jsx",
        content: `import { useState } from 'react';

export default function App() {
  const [current, setCurrent] = useState('0');
  const [previous, setPrevious] = useState('');
  const [operator, setOperator] = useState(null);

  const handleNumber = (num) => {
    if (current === '0' && num !== '.') {
      setCurrent(num);
    } else if (num === '.' && current.includes('.')) {
      return;
    } else {
      setCurrent(current + num);
    }
  };

  const handleOperator = (op) => {
    setPrevious(current + ' ' + op);
    setOperator(op);
    setCurrent('0');
  };

  const calculate = () => {
    if (!operator) return;
    const prev = parseFloat(previous);
    const curr = parseFloat(current);
    let result;
    switch (operator) {
      case '+': result = prev + curr; break;
      case '-': result = prev - curr; break;
      case '*': result = prev * curr; break;
      case '/': result = prev / curr; break;
      default: return;
    }
    setCurrent(String(result));
    setPrevious('');
    setOperator(null);
  };

  const clear = () => {
    setCurrent('0');
    setPrevious('');
    setOperator(null);
  };

  return (
    <div className="calculator">
      <div className="display">
        <div className="previous">{previous}</div>
        <div className="current">{current}</div>
      </div>
      <div className="buttons">
        <button className="clear" onClick={clear}>C</button>
        <button onClick={() => setCurrent(current.slice(0, -1) || '0')}>DEL</button>
        <button onClick={() => setCurrent(String(-parseFloat(current)))}>+/-</button>
        <button className="operator" onClick={() => handleOperator('/')}>/</button>
        
        <button onClick={() => handleNumber('7')}>7</button>
        <button onClick={() => handleNumber('8')}>8</button>
        <button onClick={() => handleNumber('9')}>9</button>
        <button className="operator" onClick={() => handleOperator('*')}>*</button>
        
        <button onClick={() => handleNumber('4')}>4</button>
        <button onClick={() => handleNumber('5')}>5</button>
        <button onClick={() => handleNumber('6')}>6</button>
        <button className="operator" onClick={() => handleOperator('-')}>-</button>
        
        <button onClick={() => handleNumber('1')}>1</button>
        <button onClick={() => handleNumber('2')}>2</button>
        <button onClick={() => handleNumber('3')}>3</button>
        <button className="operator" onClick={() => handleOperator('+')}>+</button>
        
        <button className="zero" onClick={() => handleNumber('0')}>0</button>
        <button onClick={() => handleNumber('.')}>.</button>
        <button className="equals" onClick={calculate}>=</button>
      </div>
    </div>
  );
}
`
      }
    ]
  };
}

// ============================================
// FULL-STACK TODO WITH EXPRESS BACKEND
// ============================================
export function generateFullStackTodoApp(): RunnableProject {
  return {
    name: "Full-Stack Todo",
    description: "Todo app with Express backend and REST API",
    files: [
      {
        path: "package.json",
        language: "json",
        content: createFullStackPackageJson("fullstack-todo")
      },
      {
        path: "server.js",
        language: "javascript",
        content: `import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// In-memory database
let todos = [
  { id: 1, text: 'Learn Express', completed: false },
  { id: 2, text: 'Build REST API', completed: false }
];
let nextId = 3;

// API Routes
app.get('/api/todos', (req, res) => {
  res.json(todos);
});

app.post('/api/todos', (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'Text required' });
  const todo = { id: nextId++, text, completed: false };
  todos.push(todo);
  res.status(201).json(todo);
});

app.put('/api/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const todo = todos.find(t => t.id === id);
  if (!todo) return res.status(404).json({ error: 'Not found' });
  todo.completed = !todo.completed;
  res.json(todo);
});

app.delete('/api/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  todos = todos.filter(t => t.id !== id);
  res.status(204).send();
});

// Serve frontend
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(\`Server running at http://localhost:\${PORT}\`);
});
`
      },
      {
        path: "public/index.html",
        language: "html",
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Full-Stack Todo</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Inter', system-ui, sans-serif;
      background: #0f0f23;
      color: #e2e8f0;
      min-height: 100vh;
      padding: 2rem;
    }
    .container { max-width: 600px; margin: 0 auto; }
    h1 { text-align: center; margin-bottom: 0.5rem; font-size: 2rem; }
    .subtitle { text-align: center; color: #6b7280; margin-bottom: 2rem; }
    .add-form { display: flex; gap: 0.5rem; margin-bottom: 1.5rem; }
    input {
      flex: 1; padding: 0.75rem 1rem; border: 1px solid #374151;
      border-radius: 8px; background: #1a1a2e; color: #e2e8f0; font-size: 1rem;
    }
    input:focus { outline: none; border-color: #6366f1; }
    button {
      padding: 0.75rem 1.5rem; border: none; border-radius: 8px;
      cursor: pointer; font-weight: 600; transition: all 0.2s;
    }
    .add-btn { background: #6366f1; color: white; }
    .add-btn:hover { background: #4f46e5; }
    .todo-list { list-style: none; }
    .todo-item {
      display: flex; align-items: center; gap: 1rem; padding: 1rem;
      background: #1a1a2e; border-radius: 8px; margin-bottom: 0.5rem;
      border: 1px solid #374151;
    }
    .todo-item.completed span { text-decoration: line-through; color: #6b7280; }
    .todo-item span { flex: 1; }
    .delete-btn { background: #ef4444; color: white; padding: 0.5rem 1rem; }
    .delete-btn:hover { background: #dc2626; }
    .checkbox { width: 20px; height: 20px; cursor: pointer; }
    .empty { text-align: center; color: #6b7280; padding: 2rem; }
    .loading { text-align: center; color: #6b7280; padding: 2rem; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Full-Stack Todo</h1>
    <p class="subtitle">Powered by Express + REST API</p>
    <form class="add-form" id="addForm">
      <input type="text" id="input" placeholder="Add a new task...">
      <button type="submit" class="add-btn">Add</button>
    </form>
    <div id="loading" class="loading">Loading todos...</div>
    <ul class="todo-list" id="todoList"></ul>
  </div>
  <script>
    const API = '/api/todos';
    const todoList = document.getElementById('todoList');
    const addForm = document.getElementById('addForm');
    const input = document.getElementById('input');
    const loading = document.getElementById('loading');

    async function fetchTodos() {
      try {
        const res = await fetch(API);
        const todos = await res.json();
        loading.style.display = 'none';
        renderTodos(todos);
      } catch (err) {
        loading.textContent = 'Error loading todos';
      }
    }

    function renderTodos(todos) {
      if (todos.length === 0) {
        todoList.innerHTML = '<li class="empty">No todos yet. Add one above!</li>';
        return;
      }
      todoList.innerHTML = todos.map(todo => \`
        <li class="todo-item \${todo.completed ? 'completed' : ''}">
          <input type="checkbox" class="checkbox" \${todo.completed ? 'checked' : ''} 
            onchange="toggleTodo(\${todo.id})">
          <span>\${todo.text}</span>
          <button class="delete-btn" onclick="deleteTodo(\${todo.id})">Delete</button>
        </li>
      \`).join('');
    }

    addForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const text = input.value.trim();
      if (!text) return;
      await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      input.value = '';
      fetchTodos();
    });

    async function toggleTodo(id) {
      await fetch(\`\${API}/\${id}\`, { method: 'PUT' });
      fetchTodos();
    }

    async function deleteTodo(id) {
      await fetch(\`\${API}/\${id}\`, { method: 'DELETE' });
      fetchTodos();
    }

    fetchTodos();
  </script>
</body>
</html>`
      }
    ]
  };
}

// ============================================
// WEATHER APP
// ============================================
export function generateWeatherApp(): RunnableProject {
  return {
    name: "Weather App",
    description: "Weather lookup with mock data (no API key needed)",
    files: [
      {
        path: "package.json",
        language: "json",
        content: createPackageJson("weather-app")
      },
      {
        path: "vite.config.js",
        language: "javascript",
        content: viteConfig
      },
      {
        path: "index.html",
        language: "html",
        content: viteIndexHtml("Weather App")
      },
      {
        path: "src/main.jsx",
        language: "jsx",
        content: mainJsx
      },
      {
        path: "src/index.css",
        language: "css",
        content: `* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  font-family: 'Inter', system-ui, sans-serif;
  background: linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%);
  color: #e2e8f0;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
.container { text-align: center; padding: 2rem; }
h1 { margin-bottom: 1.5rem; }
.search-form { display: flex; gap: 0.5rem; justify-content: center; margin-bottom: 2rem; }
input {
  padding: 0.75rem 1rem; border: 1px solid #374151; border-radius: 8px;
  background: rgba(255,255,255,0.1); color: white; font-size: 1rem; width: 250px;
}
input::placeholder { color: #94a3b8; }
button {
  padding: 0.75rem 1.5rem; border: none; border-radius: 8px;
  background: #3b82f6; color: white; font-weight: 600; cursor: pointer;
}
button:hover { background: #2563eb; }
.weather-card {
  background: rgba(255,255,255,0.1); backdrop-filter: blur(10px);
  border-radius: 24px; padding: 2rem; border: 1px solid rgba(255,255,255,0.2);
  max-width: 400px; margin: 0 auto;
}
.city { font-size: 1.5rem; margin-bottom: 0.5rem; }
.temp { font-size: 4rem; font-weight: 700; }
.condition { font-size: 1.25rem; color: #94a3b8; }
.details { display: flex; justify-content: center; gap: 2rem; margin-top: 1.5rem; }
.detail { text-align: center; }
.detail-value { font-size: 1.5rem; font-weight: 600; }
.detail-label { font-size: 0.875rem; color: #94a3b8; }`
      },
      {
        path: "src/App.jsx",
        language: "jsx",
        content: `import { useState } from 'react';

const mockWeather = {
  'new york': { temp: 72, condition: 'Sunny', humidity: 45, wind: 12 },
  'london': { temp: 58, condition: 'Cloudy', humidity: 78, wind: 8 },
  'tokyo': { temp: 68, condition: 'Partly Cloudy', humidity: 60, wind: 5 },
  'paris': { temp: 64, condition: 'Rainy', humidity: 82, wind: 10 },
  'sydney': { temp: 78, condition: 'Clear', humidity: 55, wind: 15 },
};

export default function App() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    const key = city.toLowerCase().trim();
    if (mockWeather[key]) {
      setWeather({ city: city, ...mockWeather[key] });
      setError('');
    } else {
      setError('City not found. Try: New York, London, Tokyo, Paris, Sydney');
      setWeather(null);
    }
  };

  return (
    <div className="container">
      <h1>Weather App</h1>
      <form className="search-form" onSubmit={handleSearch}>
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Enter city name..."
        />
        <button type="submit">Search</button>
      </form>
      {error && <p style={{ color: '#f87171' }}>{error}</p>}
      {weather && (
        <div className="weather-card">
          <div className="city">{weather.city}</div>
          <div className="temp">{weather.temp}°F</div>
          <div className="condition">{weather.condition}</div>
          <div className="details">
            <div className="detail">
              <div className="detail-value">{weather.humidity}%</div>
              <div className="detail-label">Humidity</div>
            </div>
            <div className="detail">
              <div className="detail-value">{weather.wind} mph</div>
              <div className="detail-label">Wind</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
`
      }
    ]
  };
}

// ============================================
// CHAT APP
// ============================================
export function generateChatApp(): RunnableProject {
  return {
    name: "Chat App",
    description: "Real-time chat interface with simulated responses",
    files: [
      {
        path: "package.json",
        language: "json",
        content: createPackageJson("chat-app")
      },
      {
        path: "vite.config.js",
        language: "javascript",
        content: viteConfig
      },
      {
        path: "index.html",
        language: "html",
        content: viteIndexHtml("Chat App")
      },
      {
        path: "src/main.jsx",
        language: "jsx",
        content: mainJsx
      },
      {
        path: "src/index.css",
        language: "css",
        content: `* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  font-family: 'Inter', system-ui, sans-serif;
  background: #0f0f23;
  color: #e2e8f0;
  height: 100vh;
}
.chat-container {
  max-width: 600px;
  margin: 0 auto;
  height: 100vh;
  display: flex;
  flex-direction: column;
}
.header {
  padding: 1rem;
  background: #1a1a2e;
  border-bottom: 1px solid #374151;
  text-align: center;
}
.messages {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.message {
  max-width: 80%;
  padding: 0.75rem 1rem;
  border-radius: 16px;
  line-height: 1.4;
}
.message.user {
  align-self: flex-end;
  background: #6366f1;
  border-bottom-right-radius: 4px;
}
.message.bot {
  align-self: flex-start;
  background: #374151;
  border-bottom-left-radius: 4px;
}
.input-form {
  display: flex;
  gap: 0.5rem;
  padding: 1rem;
  background: #1a1a2e;
  border-top: 1px solid #374151;
}
input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid #374151;
  border-radius: 24px;
  background: #0f0f23;
  color: #e2e8f0;
  font-size: 1rem;
}
input:focus { outline: none; border-color: #6366f1; }
button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 24px;
  background: #6366f1;
  color: white;
  font-weight: 600;
  cursor: pointer;
}
button:hover { background: #4f46e5; }
button:disabled { opacity: 0.5; cursor: not-allowed; }`
      },
      {
        path: "src/App.jsx",
        language: "jsx",
        content: `import { useState, useRef, useEffect } from 'react';

const botResponses = [
  "That's interesting! Tell me more.",
  "I understand. How can I help with that?",
  "Great question! Let me think about that.",
  "I'm here to assist you. What else would you like to know?",
  "Thanks for sharing! Is there anything specific you need?",
];

export default function App() {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! How can I help you today?", sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage = { id: Date.now(), text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      const botMessage = {
        id: Date.now() + 1,
        text: botResponses[Math.floor(Math.random() * botResponses.length)],
        sender: 'bot'
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  return (
    <div className="chat-container">
      <div className="header">
        <h1>Chat App</h1>
      </div>
      <div className="messages">
        {messages.map(msg => (
          <div key={msg.id} className={\`message \${msg.sender}\`}>
            {msg.text}
          </div>
        ))}
        {isTyping && (
          <div className="message bot" style={{ opacity: 0.7 }}>
            Typing...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form className="input-form" onSubmit={handleSend}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          disabled={isTyping}
        />
        <button type="submit" disabled={isTyping || !input.trim()}>
          Send
        </button>
      </form>
    </div>
  );
}
`
      }
    ]
  };
}

// Pattern matching to select the right template
export function matchRunnableTemplate(input: string): RunnableProject | null {
  const lower = input.toLowerCase();
  
  // Full-stack todo
  if ((lower.includes('full') || lower.includes('backend') || lower.includes('api') || lower.includes('express')) && 
      (lower.includes('todo') || lower.includes('task'))) {
    return generateFullStackTodoApp();
  }
  
  // Counter
  if (lower.includes('counter') || lower.includes('increment') || lower.includes('clicker')) {
    return generateCounterApp();
  }
  
  // Todo/Task list
  if (lower.includes('todo') || lower.includes('task list') || lower.includes('checklist')) {
    return generateTodoApp();
  }
  
  // Calculator
  if (lower.includes('calculator') || lower.includes('calc')) {
    return generateCalculatorApp();
  }
  
  // Weather
  if (lower.includes('weather')) {
    return generateWeatherApp();
  }
  
  // Chat
  if (lower.includes('chat') || lower.includes('messenger') || lower.includes('messaging')) {
    return generateChatApp();
  }
  
  return null;
}

// Export all generators
export const runnableTemplates = {
  counter: generateCounterApp,
  todo: generateTodoApp,
  fullstackTodo: generateFullStackTodoApp,
  calculator: generateCalculatorApp,
  weather: generateWeatherApp,
  chat: generateChatApp
};
