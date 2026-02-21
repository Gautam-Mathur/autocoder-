# API Reference

All endpoints are served from the Express backend on port 5000. All request and response bodies are JSON unless otherwise noted. The API is RESTful with standard HTTP status codes.

---

## Table of Contents

1. [Health & Status](#health--status)
2. [Conversations](#conversations)
3. [Project Files](#project-files)
4. [Project Planning](#project-planning)
5. [Code Generation](#code-generation)
6. [Code Analysis & Auto-Fix](#code-analysis--auto-fix)
7. [Export & Download](#export--download)
8. [GitHub Integration](#github-integration)
9. [Local AI Engine](#local-ai-engine)
10. [AI Intelligence (Cloud Mode)](#ai-intelligence-cloud-mode)
11. [Enhanced AI Capabilities](#enhanced-ai-capabilities)
12. [Deep Project Generator](#deep-project-generator)
13. [Learning Engine](#learning-engine)
14. [Pipeline Execution](#pipeline-execution)
15. [Transparency & Debugging](#transparency--debugging)
16. [Logs](#logs)
17. [Preview Server](#preview-server)
18. [Cloud Sandbox](#cloud-sandbox)
19. [VAPT Dashboard](#vapt-dashboard)
20. [Debugging](#debugging)
21. [Conversation Intelligence](#conversation-intelligence)
22. [Concepts & Best Practices](#concepts--best-practices)
23. [Prompt Analysis](#prompt-analysis)
24. [CodeGen V2 Testing](#codegen-v2-testing)

---

## Health & Status

### GET /api/health

Check server status and current AI mode.

**Response** `200 OK`:
```json
{
  "status": "ok",
  "aiMode": "cloud | local",
  "message": "Cloud AI ready | Local template engine active"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `status` | string | Always `"ok"` if server is running |
| `aiMode` | string | `"cloud"` if OPENAI_API_KEY is set, `"local"` otherwise |
| `message` | string | Human-readable status description |

---

## Conversations

### GET /api/conversations

List all conversations.

**Response** `200 OK`:
```json
[
  {
    "id": 1,
    "title": "Hospital Management System",
    "createdAt": "2026-02-20T10:00:00Z",
    "updatedAt": "2026-02-20T11:30:00Z",
    "projectContext": { ... }
  }
]
```

### GET /api/conversations/:id

Get a single conversation with all messages.

**Parameters**:
| Param | Type | Description |
|-------|------|-------------|
| `id` | integer | Conversation ID |

**Response** `200 OK`:
```json
{
  "id": 1,
  "title": "Hospital Management System",
  "createdAt": "2026-02-20T10:00:00Z",
  "updatedAt": "2026-02-20T11:30:00Z",
  "projectContext": {
    "projectName": "Hospital Manager",
    "projectDescription": "...",
    "techStack": ["react", "express", "postgresql"],
    "projectSummary": "..."
  },
  "messages": [
    {
      "id": 1,
      "conversationId": 1,
      "role": "user",
      "content": "Build a hospital management system",
      "createdAt": "2026-02-20T10:00:00Z",
      "metadata": {}
    },
    {
      "id": 2,
      "conversationId": 1,
      "role": "assistant",
      "content": "I'll help you build a hospital management system...",
      "createdAt": "2026-02-20T10:00:05Z",
      "metadata": { "phase": "clarification", "plan": { ... } }
    }
  ]
}
```

### POST /api/conversations

Create a new conversation.

**Request Body**:
```json
{
  "title": "My New App"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | Conversation title |

**Response** `201 Created`:
```json
{
  "id": 2,
  "title": "My New App",
  "createdAt": "2026-02-20T12:00:00Z",
  "updatedAt": "2026-02-20T12:00:00Z",
  "projectContext": null
}
```

### DELETE /api/conversations/:id

Delete a conversation and all associated data (messages, files, logs).

**Response** `200 OK`:
```json
{ "success": true }
```

### POST /api/conversations/:id/messages

Send a message and receive an AI response. Supports streaming via Server-Sent Events (SSE).

**Request Body**:
```json
{
  "content": "Build me a todo app with categories and due dates",
  "role": "user"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `content` | string | Yes | The user's message |
| `role` | string | Yes | Must be `"user"` |

**Response**: Streamed SSE events. Each event contains a chunk of the AI response:
```
data: {"type": "text", "content": "I'll help you build..."}
data: {"type": "phase", "phase": "clarification"}
data: {"type": "plan", "plan": { ... }}
data: {"type": "files", "files": [ ... ]}
data: {"type": "done"}
```

### POST /api/conversations/:id/assistant-message

Save an assistant message directly (bypass AI generation).

**Request Body**:
```json
{
  "content": "Here's your generated project...",
  "metadata": {
    "phase": "generation",
    "fileCount": 40
  }
}
```

### PUT /api/conversations/:id/context

Update the project context for a conversation.

**Request Body**:
```json
{
  "projectName": "Hospital Manager",
  "projectDescription": "A comprehensive hospital management system",
  "techStack": ["react", "express", "postgresql", "drizzle"],
  "projectSummary": "Full-stack application with patient management..."
}
```

---

## Project Files

### GET /api/conversations/:id/files

Get all project files for a conversation.

**Response** `200 OK`:
```json
[
  {
    "id": 1,
    "conversationId": 1,
    "path": "src/pages/patients.tsx",
    "content": "import React from 'react';\n...",
    "language": "typescript",
    "createdAt": "2026-02-20T11:00:00Z"
  },
  {
    "id": 2,
    "conversationId": 1,
    "path": "shared/schema.ts",
    "content": "import { pgTable, serial, text } from 'drizzle-orm/pg-core';\n...",
    "language": "typescript",
    "createdAt": "2026-02-20T11:00:00Z"
  }
]
```

### POST /api/conversations/:id/files

Create a single project file.

**Request Body**:
```json
{
  "path": "src/pages/home.tsx",
  "content": "export default function Home() { return <div>Home</div>; }",
  "language": "typescript"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `path` | string | Yes | File path relative to project root |
| `content` | string | Yes | File content |
| `language` | string | No | Language identifier (typescript, css, json) |

### POST /api/conversations/:id/files/bulk

Bulk save files from code generation.

**Request Body**:
```json
{
  "files": [
    { "path": "src/App.tsx", "content": "..." },
    { "path": "src/pages/home.tsx", "content": "..." },
    { "path": "shared/schema.ts", "content": "..." },
    { "path": "package.json", "content": "..." }
  ]
}
```

**Response** `200 OK`:
```json
{
  "saved": 4,
  "errors": []
}
```

### PUT /api/files/:id

Update a project file's content.

**Request Body**:
```json
{
  "content": "// Updated content\nexport default function Home() { ... }"
}
```

### DELETE /api/files/:id

Delete a single project file.

### DELETE /api/conversations/:id/files

Delete all project files for a conversation.

---

## Project Planning

### POST /api/conversations/:id/plan

Generate a project plan from requirements.

**Request Body**:
```json
{
  "requirements": "A hospital management system with patients, doctors, appointments, and departments"
}
```

**Response** `200 OK`:
```json
{
  "projectName": "Hospital Manager",
  "overview": "A comprehensive hospital management system...",
  "techStack": ["react", "typescript", "express", "postgresql", "drizzle"],
  "modules": ["authentication", "dashboard", "patient-management", "appointment-scheduling"],
  "dataModel": [
    {
      "name": "Patient",
      "tableName": "patients",
      "fields": [
        { "name": "id", "type": "serial", "required": true },
        { "name": "name", "type": "text", "required": true },
        { "name": "email", "type": "text", "required": true },
        { "name": "dateOfBirth", "type": "date", "required": false },
        { "name": "insurance", "type": "text", "required": false },
        { "name": "status", "type": "text", "required": true }
      ],
      "relationships": [
        { "entity": "Appointment", "type": "one-to-many" }
      ]
    }
  ],
  "pages": [
    { "name": "Dashboard", "path": "/" },
    { "name": "Patients", "path": "/patients" },
    { "name": "Doctors", "path": "/doctors" },
    { "name": "Appointments", "path": "/appointments" }
  ],
  "apiEndpoints": [
    { "method": "GET", "path": "/api/patients", "entity": "Patient" },
    { "method": "POST", "path": "/api/patients", "entity": "Patient" },
    { "method": "PUT", "path": "/api/patients/:id", "entity": "Patient" },
    { "method": "DELETE", "path": "/api/patients/:id", "entity": "Patient" }
  ],
  "workflows": [
    "Patient registration and intake",
    "Appointment scheduling and confirmation",
    "Doctor assignment and department management"
  ],
  "roles": ["admin", "doctor", "receptionist"],
  "fileBlueprint": [
    { "path": "shared/schema.ts", "description": "Database schema with Drizzle ORM" },
    { "path": "server/routes.ts", "description": "Express API endpoints" }
  ]
}
```

### GET /api/conversations/:id/plan

Get the existing plan for a conversation.

**Response** `200 OK`: Same structure as POST response.

---

## Code Generation

### POST /api/generate-fullstack

Stream AI-generated full-stack application code via SSE.

**Request Body**:
```json
{
  "prompt": "Build a project management app with tasks, projects, and team members",
  "conversationId": 1
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `prompt` | string | Yes | Natural language app description |
| `conversationId` | integer | Yes | Target conversation for file storage |

**Response**: SSE stream with file generation events:
```
data: {"type": "status", "message": "Analyzing requirements..."}
data: {"type": "file", "path": "shared/schema.ts", "content": "..."}
data: {"type": "file", "path": "server/routes.ts", "content": "..."}
data: {"type": "file", "path": "src/pages/tasks.tsx", "content": "..."}
data: {"type": "complete", "fileCount": 40, "duration": 4567}
```

### POST /api/generate-fullstack-sync

Synchronous version. Returns all files at once (no streaming).

**Request Body**: Same as `/api/generate-fullstack`

**Response** `200 OK`:
```json
{
  "files": [
    { "path": "shared/schema.ts", "content": "..." },
    { "path": "server/routes.ts", "content": "..." }
  ],
  "fileCount": 40,
  "duration": 4567
}
```

### POST /api/modify-code

Modify existing code based on natural language instructions.

**Request Body**:
```json
{
  "conversationId": 1,
  "instruction": "Add a search bar to the products page",
  "files": [
    { "path": "src/pages/products.tsx", "content": "..." }
  ]
}
```

**Response** `200 OK`:
```json
{
  "modifiedFiles": [
    { "path": "src/pages/products.tsx", "content": "...(updated)..." }
  ],
  "changes": ["Added search input with filtering logic to products page"]
}
```

---

## Code Analysis & Auto-Fix

### POST /api/conversations/:id/auto-fix

Attempt to auto-fix code errors.

**Request Body**:
```json
{
  "errors": [
    "Cannot find module './components/data-table'",
    "Package '@tanstack/react-table' is not installed"
  ],
  "files": [
    { "path": "src/pages/patients.tsx", "content": "..." }
  ]
}
```

**Response** `200 OK`:
```json
{
  "fixed": 2,
  "remaining": 0,
  "fixes": [
    { "type": "stub-generated", "file": "src/components/data-table.tsx" },
    { "type": "package-added", "package": "@tanstack/react-table" }
  ],
  "files": [ ... ]
}
```

### POST /api/conversations/:id/security-scan

Perform a security scan on project files.

**Response** `200 OK`:
```json
{
  "vulnerabilities": [],
  "warnings": ["Consider adding rate limiting to API endpoints"],
  "score": 85
}
```

### POST /api/conversations/:id/test

Run tests on project files.

### GET /api/conversations/:id/dependencies

Analyze project dependencies and compatibility.

**Response** `200 OK`:
```json
{
  "dependencies": { "react": "18.3.1", "express": "4.21.0" },
  "devDependencies": { "typescript": "5.6.3", "vite": "5.4.14" },
  "bundleSize": "estimated 2.1MB",
  "warnings": [],
  "suggestions": ["Consider code splitting for route-level lazy loading"]
}
```

### GET /api/conversations/:id/stats

Get project statistics summary.

**Response** `200 OK`:
```json
{
  "fileCount": 40,
  "totalLines": 3200,
  "entityCount": 4,
  "routeCount": 16,
  "componentCount": 12,
  "testCount": 8
}
```

---

## Export & Download

### GET /api/conversations/:id/export

Export the project as a downloadable zip package.

**Response**: Binary `.zip` file download.

### GET /api/conversations/:id/download

Download all project files as a single text document.

**Response**: Plain text with file separators:
```
=== src/App.tsx ===
import React from 'react';
...

=== shared/schema.ts ===
import { pgTable } from 'drizzle-orm/pg-core';
...
```

---

## GitHub Integration

### GET /api/github/repos

List authenticated user's GitHub repositories.

**Response** `200 OK`:
```json
[
  {
    "name": "my-app",
    "full_name": "username/my-app",
    "private": false,
    "default_branch": "main",
    "description": "Generated by AutoCoder"
  }
]
```

### GET /api/github/repos/:owner/:repo/contents

Get repository file contents.

**Parameters**:
| Param | Type | Description |
|-------|------|-------------|
| `owner` | string | Repository owner |
| `repo` | string | Repository name |

### POST /api/github/import-github

Import files from a GitHub repository into a conversation.

**Request Body**:
```json
{
  "owner": "username",
  "repo": "my-repo",
  "branch": "main"
}
```

### POST /api/github/push

Push files to a GitHub repository using full tree replacement.

**Request Body**:
```json
{
  "owner": "username",
  "repo": "my-repo",
  "files": [
    { "path": "src/App.tsx", "content": "..." }
  ],
  "message": "Update from AutoCoder"
}
```

**Response** `200 OK`:
```json
{
  "commit": "abc1234",
  "filesChanged": 12,
  "url": "https://github.com/username/my-repo"
}
```

### POST /api/conversations/:id/github-push

Push all project files from a conversation to GitHub.

---

## Local AI Engine

### POST /api/local-ai/parse-intent

Parse user intent from a natural language description using the local AI engine.

**Request Body**:
```json
{
  "description": "Build a restaurant booking system with tables, reservations, and menu items"
}
```

**Response** `200 OK`:
```json
{
  "intent": "create-application",
  "domain": "restaurant",
  "confidence": 0.92,
  "entities": ["Table", "Reservation", "MenuItem"],
  "features": ["CRUD", "scheduling", "menu-management"],
  "complexity": "moderate"
}
```

### POST /api/local-ai/search-similar

Search for similar patterns in the knowledge base.

**Request Body**:
```json
{
  "query": "appointment scheduling with calendar view",
  "limit": 5
}
```

### GET /api/local-ai/stats

Get local AI engine statistics.

**Response** `200 OK`:
```json
{
  "templateCount": 394,
  "patternCount": 6583,
  "domainCount": 14,
  "entityCount": 103,
  "mode": "local"
}
```

### POST /api/local-ai/feedback

Record user feedback for the learning engine.

---

## AI Intelligence (Cloud Mode)

These endpoints require `OPENAI_API_KEY` to be set.

### POST /api/ai/understand
Analyze code for deep understanding. Accepts code snippets and returns structured analysis.

### POST /api/ai/edit
Edit code based on natural language instructions using cloud AI.

### POST /api/ai/fix
Fix code errors using AI analysis. Accepts error messages and code context.

### GET /api/ai/status
Check local LLM availability and current AI configuration.

### POST /api/ai/plan
Multi-step reasoning and planning for complex tasks.

### POST /api/ai/quick-analyze
Quick code analysis — faster but less detailed than full understanding.

### POST /api/ai/diagnose
Diagnose errors with AI reasoning. Accepts error stack traces and returns root cause analysis.

### POST /api/ai/auto-fix
AI-powered auto-fix for code issues. More intelligent than the rule-based auto-fix.

### POST /api/ai/learn
Record user interactions for continuous learning.

### GET /api/ai/context/:userId
Get user context and preferences stored by the learning engine.

### GET /api/ai/patterns
List available framework patterns (authentication, CRUD, file upload, etc.).

### GET /api/ai/patterns/:id
Get a specific pattern with code examples and usage instructions.

### POST /api/ai/nlu
Natural Language Understanding analysis — deep semantic parsing.

### POST /api/ai/intent
Classify user intent into categories (create-app, modify-code, ask-question, etc.).

### POST /api/ai/entities
Extract entities from natural language text.

### POST /api/ai/explain
Explain code in plain English for non-technical users.

---

## Enhanced AI Capabilities

### POST /api/ai/enhanced/intent
Enhanced intent recognition with multi-signal analysis (keywords, patterns, context).

### POST /api/ai/enhanced/generate-project
Generate advanced projects with enhanced understanding of complex requirements.

### POST /api/ai/enhanced/explain-code
Universal code explanation supporting multiple programming languages.

### POST /api/ai/enhanced/analyze-error
Deep error analysis with root cause identification and fix suggestions.

### POST /api/ai/enhanced/context/create
Create a context window for managing conversation memory across turns.

**Request Body**:
```json
{
  "maxTokens": 4096,
  "strategy": "sliding-window"
}
```

### POST /api/ai/enhanced/context/add
Add content to an existing context window.

### GET /api/ai/enhanced/context/:id
Get a context window's current state and content.

### POST /api/ai/enhanced/context/relevant
Retrieve context chunks most relevant to a query.

### GET /api/ai/enhanced/languages
List all supported programming languages with their capabilities.

### GET /api/ai/enhanced/languages/:id
Get detailed information about a specific language.

### POST /api/ai/enhanced/snippet
Generate code snippets for specific tasks in specified languages.

### POST /api/ai/enhanced/conversation/create
Create a new conversational AI state with memory and context tracking.

### POST /api/ai/enhanced/conversation/turn
Process a turn in a multi-turn conversation.

### GET /api/ai/enhanced/conversation/:id
Get the current state of a conversation.

### POST /api/ai/enhanced/conversation/memory
Retrieve relevant memory from a conversation's history.

---

## Deep Project Generator

### GET /api/ai/deep/blueprints
List available project blueprints (pre-configured project templates).

**Response** `200 OK`:
```json
[
  {
    "id": "hospital-management",
    "name": "Hospital Management System",
    "domain": "healthcare",
    "entities": ["Patient", "Doctor", "Appointment", "Department"],
    "features": ["CRUD", "scheduling", "dashboard", "authentication"]
  }
]
```

### GET /api/ai/deep/blueprints/:id
Get detailed blueprint information including entity schemas and page layouts.

### GET /api/ai/deep/features
List available feature modules that can be added to any project.

### GET /api/ai/deep/features/:id
Get detailed feature module information.

### POST /api/ai/deep/generate
Generate a project from a blueprint.

**Request Body**:
```json
{
  "blueprintId": "hospital-management",
  "customizations": {
    "additionalEntities": ["Billing"],
    "uiPattern": "dashboard"
  }
}
```

### POST /api/ai/deep/generate-refined
Generate a project with AI refinement applied to blueprint output.

### POST /api/ai/review
Review existing code with AI and get improvement suggestions.

### POST /api/ai/refine
Quickly refine generated code for better quality.

### GET /api/ai/refinement-status
Check AI refinement availability and queue status.

---

## Learning Engine

### GET /api/learning/stats

Get learning engine statistics.

**Response** `200 OK`:
```json
{
  "patterns": 6583,
  "preferences": 3575,
  "outcomes": 182913,
  "lastUpdated": "2026-02-21T04:00:00Z",
  "reliability": {
    "total": 6583,
    "reliable": 6461,
    "percentage": 98.1
  },
  "patternTypes": {
    "entity-structure": 716,
    "domain-mapping": 3700,
    "template-selection": 1200,
    "generation-outcome": 867
  }
}
```

### GET /api/learning/export

Export all learning data as JSON download.

**Response**: JSON file containing all patterns, preferences, and outcomes.

### POST /api/learning/import

Import learning data from JSON upload.

**Request Body**: JSON with `patterns` and `preferences` arrays.

### POST /api/learning/save

Save current in-memory learning data to `learning-data.json` file and PostgreSQL.

**Response** `200 OK`:
```json
{
  "saved": true,
  "patterns": 6583,
  "preferences": 3575,
  "file": "learning-data.json",
  "database": true
}
```

### GET /api/learning/patterns

Get recorded generation patterns with optional filtering.

**Query Parameters**:
| Param | Type | Description |
|-------|------|-------------|
| `type` | string | Filter by pattern type (entity-structure, domain-mapping, etc.) |
| `domain` | string | Filter by domain ID |
| `limit` | integer | Max results (default 100) |

### GET /api/learning/entity/:name

Get entity-specific recommendations based on learned patterns.

**Response** `200 OK`:
```json
{
  "entity": "Patient",
  "recommendedFields": [
    { "name": "id", "type": "serial", "required": true },
    { "name": "name", "type": "text", "required": true },
    { "name": "email", "type": "text", "required": true },
    { "name": "dateOfBirth", "type": "date", "required": false },
    { "name": "status", "type": "text", "required": true }
  ],
  "relatedEntities": ["Appointment", "MedicalRecord", "Doctor"],
  "domain": "healthcare",
  "confidence": 0.95
}
```

---

## Pipeline Execution

### POST /api/local-pipeline/run

Run the complete local AI pipeline on a description.

**Request Body**:
```json
{
  "description": "Build a todo app with categories, due dates, and priority levels",
  "conversationId": 1
}
```

**Response** `200 OK`:
```json
{
  "success": true,
  "stages": 16,
  "duration": 2345,
  "qualityScore": 82,
  "files": [ ... ],
  "warnings": []
}
```

### GET /api/local-pipeline/stages

Get pipeline stage definitions.

**Response** `200 OK`:
```json
[
  {
    "stage": 1,
    "role": "Product Manager",
    "name": "Requirement Analysis",
    "description": "Analyzes user requirements and extracts features, entities, and relationships",
    "critical": true,
    "minQualityScore": 60
  },
  {
    "stage": 2,
    "role": "Project Manager",
    "name": "Project Planning",
    "description": "Creates project plan with scope, milestones, and file structure",
    "critical": true,
    "minQualityScore": 60
  }
]
```

---

## Transparency & Debugging

### GET /api/conversations/:id/transparency

Get the full pipeline transparency report.

**Response** `200 OK`:
```json
{
  "stages": [
    {
      "stage": 1,
      "name": "Product Manager",
      "role": "Requirement Analysis",
      "duration": 234,
      "qualityScore": 85,
      "warnings": [],
      "decisions": [
        "Identified 4 entities: Patient, Doctor, Appointment, Department",
        "Detected healthcare domain with 0.94 confidence",
        "Selected table + calendar UI pattern mix"
      ]
    }
  ],
  "totalDuration": 4567,
  "overallQuality": 82,
  "aiMode": "local",
  "errors": [],
  "warnings": [],
  "learningApplied": {
    "patternsUsed": 12,
    "entitiesSuggested": 1,
    "kpisAdded": 3
  }
}
```

### GET /api/conversations/:id/intel

Get intelligence records for a conversation.

### POST /api/conversations/:id/intel/extract

Extract and store intelligence from conversation messages.

### GET /api/conversations/:id/logs

Get generation logs for a conversation.

### POST /api/conversations/:id/logs

Create a generation log entry.

---

## Logs

### GET /api/logs

Fetch server logs with optional filtering.

**Query Parameters**:
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `level` | string | all | Filter: `debug`, `info`, `warn`, `error` |
| `category` | string | all | Filter by category (Pipeline, PreWarm, AutoRunner, etc.) |
| `limit` | integer | 200 | Maximum entries to return |
| `search` | string | none | Text search across log messages |

**Response** `200 OK`:
```json
[
  {
    "timestamp": "2026-02-20T11:00:00Z",
    "level": "info",
    "category": "Pipeline",
    "message": "Stage 8 (Full-Stack Developer) completed",
    "metadata": { "duration": 1234, "qualityScore": 85 }
  }
]
```

### GET /api/logs/stats

Get log statistics (counts by level).

**Response** `200 OK`:
```json
{
  "debug": 1234,
  "info": 5678,
  "warn": 45,
  "error": 12,
  "total": 6969
}
```

### DELETE /api/logs

Clear all server logs.

---

## Preview Server

### POST /api/preview/prepare/:conversationId
Prepare a preview project for server-side rendering. Collects and organizes project files.

### POST /api/preview/start/:conversationId
Start the preview server for a conversation. Launches a Node.js process with the generated code.

### POST /api/preview/stop
Stop the running preview server and clean up resources.

### GET /api/preview/status
Get preview server status (running, stopped, error).

**Response** `200 OK`:
```json
{
  "status": "running | stopped | error",
  "url": "http://localhost:3001",
  "conversationId": 1,
  "uptime": 300
}
```

### GET /api/preview-scripts/:lib
Proxy CDN scripts for preview rendering (react, react-dom, babel). Handles CORS headers.

**Parameters**:
| Param | Values |
|-------|--------|
| `lib` | `react`, `react-dom`, `babel` |

### POST /api/preview-transpile
Transpile TSX/JSX code on the server for preview rendering.

---

## Cloud Sandbox

### POST /api/sandbox/create
Create a cloud sandbox environment for isolated code execution (planned feature).

### POST /api/sandbox/stop
Stop a cloud sandbox instance.

### GET /api/sandbox/status
Get cloud sandbox status.

---

## VAPT Dashboard (Vulnerability Assessment and Penetration Testing)

### Assets

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/vapt/assets` | List all VAPT assets (applications, servers, APIs) |
| POST | `/api/vapt/assets` | Create a new VAPT asset |
| PUT | `/api/vapt/assets/:id` | Update an existing asset |
| DELETE | `/api/vapt/assets/:id` | Delete an asset |

### Vulnerabilities

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/vapt/vulnerabilities` | List all detected vulnerabilities |
| POST | `/api/vapt/vulnerabilities` | Create a vulnerability record |
| PUT | `/api/vapt/vulnerabilities/:id` | Update vulnerability status/details |
| DELETE | `/api/vapt/vulnerabilities/:id` | Delete a vulnerability record |

### Scans

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/vapt/scans` | List all security scans |
| POST | `/api/vapt/scans` | Create a new scan configuration |
| POST | `/api/vapt/scans/:id/run` | Execute a scan |

### Other VAPT Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/vapt/schedules` | Get scheduled scan configurations |
| POST | `/api/vapt/schedules` | Create a scan schedule |
| GET | `/api/vapt/team` | List security team members |
| POST | `/api/vapt/team` | Add a team member |
| GET | `/api/vapt/audit-logs` | View security audit trail |
| GET | `/api/vapt/dashboard` | Get VAPT dashboard statistics |
| POST | `/api/vapt/seed-demo` | Seed demo data for testing |

---

## Debugging

### POST /api/debug/continuous
Perform continuous debugging — iterative error fixing until all errors resolved or max iterations reached.

### POST /api/debug/parse-error
Parse error messages into structured diagnosis.

**Request Body**:
```json
{
  "error": "TypeError: Cannot read properties of undefined (reading 'map')",
  "file": "src/pages/patients.tsx",
  "line": 42
}
```

### GET /api/debug/status
Get debug engine status and active sessions.

### GET /api/debug/session/:id
Get a specific debug session with all fix attempts.

---

## Conversation Intelligence

### POST /api/ai/follow-up
Detect follow-up questions in conversation context.

### POST /api/ai/context-update
Update conversation context with new information.

### POST /api/ai/clarification
Generate clarification questions for ambiguous requests.

### POST /api/ai/response-hints
Get response hints for the AI assistant.

### GET /api/ai/conversation/:id/summary
Get a summary of a conversation's content and decisions.

---

## Concepts & Best Practices

### GET /api/ai/concepts
Search for programming concepts.

### GET /api/ai/concepts/:id
Get detailed concept explanation.

### GET /api/ai/best-practices
List best practices for web development.

### GET /api/ai/best-practices/:id
Get a specific best practice with code examples.

### GET /api/ai/learning-path/:topic
Get a structured learning path for a topic.

---

## Prompt Analysis

### POST /api/analyze-prompt

Analyze a user prompt and generate clarification questions.

**Request Body**:
```json
{
  "prompt": "Build me a restaurant app",
  "conversationId": 1
}
```

**Response** `200 OK`:
```json
{
  "complexity": {
    "score": 65,
    "level": "moderate",
    "factors": ["multiple entities", "scheduling logic", "menu management"]
  },
  "gaps": [
    { "category": "entities", "description": "Unclear whether to include inventory tracking", "severity": "important" },
    { "category": "features", "description": "No mention of payment processing", "severity": "nice-to-have" }
  ],
  "questions": [
    { "id": "q1", "question": "Should the app include table reservation management?", "category": "features", "impact": "high" },
    { "id": "q2", "question": "Do you need online ordering or just dine-in?", "category": "features", "impact": "high" }
  ],
  "domain": "restaurant",
  "confidence": 0.88
}
```

---

## CodeGen V2 Testing

### GET /api/codegen-v2/test

Run the CodeGen V2 end-to-end test suite.

**Response** `200 OK`:
```json
{
  "summary": "ALL TESTS PASSED",
  "scenarios": [
    {
      "name": "Hospital Management System",
      "status": "PASS",
      "files": 40,
      "errors": 0,
      "warnings": 0,
      "duration": 1234
    },
    {
      "name": "E-Commerce Store",
      "status": "PASS",
      "files": 38,
      "errors": 0,
      "warnings": 0,
      "duration": 1100
    },
    {
      "name": "Project Manager",
      "status": "PASS",
      "files": 38,
      "errors": 0,
      "warnings": 0,
      "duration": 1050
    }
  ],
  "totalDuration": 3384
}
```

---

## HTTP Status Codes

| Code | Meaning | When Used |
|------|---------|-----------|
| 200 | OK | Successful GET, PUT, DELETE |
| 201 | Created | Successful POST that creates a resource |
| 400 | Bad Request | Invalid request body or parameters |
| 404 | Not Found | Resource doesn't exist |
| 500 | Internal Server Error | Unexpected server error |

## Error Response Format

All error responses follow this format:
```json
{
  "error": "Human-readable error message",
  "details": "Optional technical details",
  "code": "OPTIONAL_ERROR_CODE"
}
```
