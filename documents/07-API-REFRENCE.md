# API Reference

All endpoints are served from the Express backend on port 5000. All responses are JSON unless otherwise noted.

## Health & Status

### GET /api/health
Check server status and AI mode.

**Response:**
```json
{
  "status": "ok",
  "aiMode": "cloud" | "local",
  "message": "Cloud AI ready" | "Local template engine active"
}
```

---

## Conversations

### GET /api/conversations
List all conversations.

**Response:** `Conversation[]`

### GET /api/conversations/:id
Get a conversation with all messages.

**Response:** `{ ...conversation, messages: Message[] }`

### POST /api/conversations
Create a new conversation.

**Body:**
```json
{
  "title": "My New App"
}
```

**Response:** `Conversation`

### DELETE /api/conversations/:id
Delete a conversation and all associated data.

### POST /api/conversations/:id/messages
Send a message and receive an AI response. Supports streaming via Server-Sent Events.

**Body:**
```json
{
  "content": "Build me a todo app",
  "role": "user"
}
```

**Response:** Streamed SSE events with AI response chunks.

### POST /api/conversations/:id/assistant-message
Save an assistant message directly.

**Body:**
```json
{
  "content": "Here's your generated project...",
  "metadata": {}
}
```

### PUT /api/conversations/:id/context
Update project context for a conversation.

**Body:**
```json
{
  "projectName": "My App",
  "projectDescription": "A task management tool",
  "techStack": ["react", "express", "postgresql"],
  "projectSummary": "..."
}
```

---

## Project Files

### GET /api/conversations/:id/files
Get all project files for a conversation.

**Response:** `ProjectFile[]`

### POST /api/conversations/:id/files
Create a single project file.

**Body:**
```json
{
  "path": "src/pages/home.tsx",
  "content": "...",
  "language": "typescript"
}
```

### POST /api/conversations/:id/files/bulk
Bulk save files from code generation.

**Body:**
```json
{
  "files": [
    { "path": "src/App.tsx", "content": "..." },
    { "path": "src/pages/home.tsx", "content": "..." }
  ]
}
```

### PUT /api/files/:id
Update a project file.

### DELETE /api/files/:id
Delete a project file.

### DELETE /api/conversations/:id/files
Delete all project files for a conversation.

---

## Project Planning

### POST /api/conversations/:id/plan
Generate a project plan from requirements.

**Body:**
```json
{
  "requirements": "A hospital management system with patients, doctors, and appointments"
}
```

**Response:** Full project plan with entities, pages, API endpoints, and relationships.

### GET /api/conversations/:id/plan
Get the existing plan for a conversation.

---

## Code Generation

### POST /api/generate-fullstack
Stream AI-generated full-stack application code.

**Body:**
```json
{
  "prompt": "Build a project management app",
  "conversationId": 1
}
```

**Response:** Streamed SSE events with generated files.

### POST /api/generate-fullstack-sync
Synchronous version of full-stack generation. Returns all files at once.

### POST /api/modify-code
Modify existing code based on instructions.

**Body:**
```json
{
  "conversationId": 1,
  "instruction": "Add a search bar to the products page",
  "files": [...]
}
```

---

## Code Analysis & Auto-Fix

### POST /api/conversations/:id/auto-fix
Attempt to auto-fix code errors.

**Body:**
```json
{
  "errors": ["Cannot find module './components/data-table'"],
  "files": [...]
}
```

### POST /api/conversations/:id/security-scan
Perform a security scan on project files.

### POST /api/conversations/:id/test
Run tests on project files.

### GET /api/conversations/:id/dependencies
Analyze project dependencies.

### GET /api/conversations/:id/stats
Get project statistics summary.

---

## Export & Download

### GET /api/conversations/:id/export
Export the project as a downloadable package.

### GET /api/conversations/:id/download
Download all project files as a text bundle.

---

## GitHub Integration

### GET /api/github/repos
List authenticated user's GitHub repositories.

### GET /api/github/repos/:owner/:repo/contents
Get repository file contents.

### POST /api/github/import-github
Import files from a GitHub repository.

**Body:**
```json
{
  "owner": "username",
  "repo": "my-repo",
  "branch": "main"
}
```

### POST /api/github/push
Push files to a GitHub repository.

**Body:**
```json
{
  "owner": "username",
  "repo": "my-repo",
  "files": [...],
  "message": "Update from AutoCoder"
}
```

### POST /api/conversations/:id/github-push
Push conversation project files to GitHub.

---

## Local AI Engine

### POST /api/local-ai/parse-intent
Parse user intent from a natural language description.

**Body:**
```json
{
  "description": "Build a restaurant booking system"
}
```

### POST /api/local-ai/search-similar
Search for similar patterns in the knowledge base.

### GET /api/local-ai/stats
Get local AI engine statistics (template count, pattern count).

### POST /api/local-ai/feedback
Record user feedback for the learning brain.

---

## AI Intelligence (Cloud Mode)

### POST /api/ai/understand
Analyze code for deep understanding.

### POST /api/ai/edit
Edit code based on natural language instructions.

### POST /api/ai/fix
Fix code errors using AI analysis.

### GET /api/ai/status
Check local LLM availability.

### POST /api/ai/plan
Multi-step reasoning and planning.

### POST /api/ai/quick-analyze
Quick code analysis.

### POST /api/ai/diagnose
Diagnose errors with AI reasoning.

### POST /api/ai/auto-fix
AI-powered auto-fix for code issues.

### POST /api/ai/learn
Record user interactions for learning.

### GET /api/ai/context/:userId
Get user context and preferences.

### GET /api/ai/patterns
List available framework patterns.

### GET /api/ai/patterns/:id
Get a specific pattern with code examples.

### POST /api/ai/nlu
Natural Language Understanding analysis.

### POST /api/ai/intent
Classify user intent.

### POST /api/ai/entities
Extract entities from text.

### POST /api/ai/explain
Explain code in plain English.

---

## Learning Engine

### GET /api/learning/stats
Get learning engine statistics.

**Response:**
```json
{
  "patterns": 1128,
  "preferences": 2,
  "outcomes": 45,
  "lastUpdated": "2026-02-19T10:00:00Z"
}
```

### GET /api/learning/export
Export all learning data as JSON.

### POST /api/learning/import
Import learning data from JSON.

### POST /api/learning/save
Save learning data to `learning-data.json` file.

### GET /api/learning/patterns
Get recorded generation patterns.

### GET /api/learning/entity/:name
Get entity-specific recommendations.

---

## Pipeline Execution

### POST /api/local-pipeline/run
Run the local AI pipeline on a description.

**Body:**
```json
{
  "description": "Build a todo app with categories and due dates",
  "conversationId": 1
}
```

### GET /api/local-pipeline/stages
Get pipeline stage definitions (all 16 stages with roles and descriptions).

---

## Transparency & Debugging

### GET /api/conversations/:id/transparency
Get the full pipeline transparency report with stage timings, quality scores, and decisions.

### GET /api/conversations/:id/intel
Get intelligence records for a conversation.

### POST /api/conversations/:id/intel/extract
Extract and store intelligence from messages.

### GET /api/conversations/:id/logs
Get generation logs for a conversation.

### POST /api/conversations/:id/logs
Create a generation log entry.

---

## Logs

### GET /api/logs
Fetch server logs.

**Query Parameters:**
- `level`: Filter by level (info, warn, error, debug)
- `category`: Filter by category
- `limit`: Max entries (default 200)
- `search`: Text search

### GET /api/logs/stats
Get log statistics (counts by level).

### DELETE /api/logs
Clear all server logs.

---

## Preview Server

### POST /api/preview/prepare/:conversationId
Prepare a preview project for server-side rendering.

### POST /api/preview/start/:conversationId
Start the preview server for a conversation.

### POST /api/preview/stop
Stop the running preview server.

### GET /api/preview/status
Get preview server status.

### GET /api/preview-scripts/:lib
Proxy CDN scripts for preview (react, react-dom, babel).

### POST /api/preview-transpile
Transpile TSX code on the server.

---

## CodeGen V2 Testing

### GET /api/codegen-v2/test
Run the CodeGen V2 end-to-end test suite.

**Response:**
```json
{
  "summary": "ALL TESTS PASSED",
  "scenarios": [
    { "name": "Hospital Management System", "files": 40, "errors": 0, "warnings": 0 },
    { "name": "E-Commerce Store", "files": 38, "errors": 0, "warnings": 0 },
    { "name": "Project Manager", "files": 38, "errors": 0, "warnings": 0 }
  ]
}
```
