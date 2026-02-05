# AutoCoder - AI-Powered Code Generation Assistant

## Overview
AutoCoder is a full-stack web application designed to generate production-ready HTML, CSS, JavaScript, and React code from natural language descriptions. It features a live preview and operates in two modes: an intelligent Cloud AI (GPT-4o via OpenAI) for context-aware generation and a built-in local template engine for offline use. The project's vision is to offer a comprehensive, intelligent coding assistant that supports the entire development lifecycle, including planning, testing, deployment, and security. It aims to generate high-quality code and streamline the development process for users.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework & Libraries**: React 18 with TypeScript, Wouter for routing, TanStack Query for server state, Tailwind CSS for styling, shadcn/ui for UI components, Vite as build tool.
- **Key Features**: Component-based architecture, real-time streaming chat, live code preview in a sandboxed iframe, multi-tab VS Code-like IDE, integrated terminal with WebContainer, GitHub import, and file upload.
- **Preview Panel Tabs**: Includes Preview, Code, Debug, Intel (security, tests, dependencies, transparency, logs), Test, Deploy, and IDE.

### Backend
- **Framework & Libraries**: Express.js with TypeScript, Node.js runtime.
- **API**: RESTful endpoints.
- **Core Functionality**: Conversation management, message storage, AI integration, context extraction.
- **Multi-Language Backend Support**: Templates for Python (FastAPI, Flask), Go (Gin), and Rust (Actix-web).

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM.
- **Schema**: Stores conversations, messages, project files, user data, and VAPT-related information.

### VAPT Dashboard (/vapt)
- **Overview**: Built-in Vulnerability Assessment and Penetration Testing dashboard with asset management, vulnerability scanning simulation, OWASP Top 10 tracking, remediation workflow, and audit logging.
- **API**: RESTful endpoints with Zod validation for VAPT functionalities.

### AI & Intelligence Modules
- **Code Generation**: Dual-mode system using a local LLM (Ollama) as primary and OpenAI GPT-4o as a fallback. Includes 20+ instant templates for offline use.
- **LLM Training Context**: Specialized code training for the local LLM covering React, Express, HTML, CSS, JavaScript patterns, project examples, code editing, and error fixes.
- **Code Intelligence API**: Provides capabilities for understanding, editing, fixing, planning, analyzing, diagnosing code, and context memory (all largely offline).
- **Enhanced AI Capabilities (Offline)**: Includes advanced intent recognition, multi-file project scaffolding (20+ stacks), universal code explanation (20+ languages), deep debugging engine, context window management, multi-language templates, and true conversational AI.
- **Deep Project Generator**: Generates standalone new projects (not modifications to this repo) with 10 project blueprints and 5 feature modules, generating comprehensive full-stack applications.
- **Complete Code Intelligence**: A comprehensive knowledge base with 11 major pattern sections including project blueprints, framework patterns, backend patterns, UI components, authentication, database, real-time features, payment integrations, testing, security patterns, and error solutions.
- **Other Modules**: Code Cleaner, Clarification Engine, Planning Module, Testing Engine, Security Module, Transparency Module, Intel Memory, Dependency Intelligence, and an Export System.

### Code Runner & Execution System
- **Multi-Tier Execution Manager**: Handles code execution via WebContainer (full Node.js in-browser), Cloud Sandbox (planned), Static Preview (browser rendering), and Code View. Features automatic tier failover and health monitoring.
- **Execution Status UI**: Provides visual indicators, real-time logs, and controls for code execution.
- **WebContainer Service**: Manages file system mounting, npm installation, and dev server for in-browser execution.
- **Auto-Fix System**: Real-time error detection and automatic fixes in the preview panel.
- **Extended Feature Modules**: Version History, ZIP Export, Mobile Preview, Test Runner, Vulnerability Scanner, Code Formatter, AI Context Persistence, Template Customization, Offline Mode, Progress Estimator, and Real-time Collaboration.

### Logging System
- **Backend Logger**: Supports various logging levels and categories.
- **LogViewer UI**: Real-time log viewer with filtering, statistics, and export capabilities.

## External Dependencies

### AI Services
- **OpenAI API**: For GPT-4o model access.

### Database
- **PostgreSQL**: Primary database.

### GitHub Integration
- **@octokit/rest**: GitHub API client.
- **Replit Connectors**: For GitHub OAuth token management.

### Key Frontend Libraries
- **@tanstack/react-query**: Server state management.
- **framer-motion**: Animations.
- **lucide-react, react-icons**: Icon libraries.
- **cmdk**: Command palette.

### Live Preview System
- **CDN Scripts**: React 18, ReactDOM 18, and Babel from jsdelivr.net.

### Key Backend Libraries
- **drizzle-orm / drizzle-kit**: ORM and migrations.
- **zod / drizzle-zod**: Schema validation.
- **express-session**: Session management.
- **nanoid**: ID generation.