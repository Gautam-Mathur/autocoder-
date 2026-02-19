# AutoCoder Documentation

## What is AutoCoder?

AutoCoder is an AI-powered code generation platform that creates complete, production-ready web applications from plain English descriptions. You describe what you want — "build me a hospital management system" or "create an e-commerce store" — and AutoCoder generates a full-stack React + TypeScript application with database models, API endpoints, UI components, and proper CRUD operations.

## Key Capabilities

- **Natural Language to Code**: Describe your app in plain English, get a working application
- **14 Industry Domains**: Healthcare, e-commerce, education, finance, real estate, and more — each with domain-specific knowledge
- **394 Built-in Templates**: Pre-configured patterns for common applications
- **Dual AI Architecture**: Cloud-based AI (GPT-4o) for maximum quality, or fully local engine for zero-dependency offline use
- **Live Preview**: See your generated app running in-browser via WebContainer, or natively via Electron desktop mode
- **Iterative Editing**: Modify your generated project through conversation without full regeneration
- **GitHub Integration**: Push generated projects directly to GitHub repositories
- **Continuous Learning**: The system learns from every generation to improve future output

## How It Works (High Level)

1. **You describe your app** in the chat interface
2. **AutoCoder asks clarifying questions** to understand features, entities, and relationships
3. **A 16-stage pipeline** analyzes your request and generates the complete project
4. **CodeGen V2** produces all files: components, pages, API routes, database schema, config files
5. **Validation & auto-fix** ensures the code compiles and runs correctly
6. **Live preview** lets you see the running application immediately
7. **You can iterate** — ask for changes, and only the affected files are regenerated

## Documentation Index

| Document | Description |
|----------|-------------|
| [01 - Why and How](01-WHY-AND-HOW.md) | Motivation, design philosophy, and architectural decisions |
| [02 - Developer's Guide](02-DEVELOPERS-GUIDE.md) | Setup, project structure, and contributing |
| [03 - Problems and Solutions](03-PROBLEMS-AND-SOLUTIONS.md) | Known issues, debugging tips, and solutions |
| [04 - Running Guide](04-RUNNING-GUIDE.md) | How to run in web mode and Electron desktop mode |
| [05 - User's Guide](05-USERS-GUIDE.md) | End-user guide for generating applications |
| [06 - Tester's Guide](06-TESTERS-GUIDE.md) | Testing infrastructure, e2e tests, and validation |
| [07 - API Reference](07-API-REFRENCE.md) | Complete REST API endpoint documentation |
| [08 - Failsafe Architecture](08-FAILSAFE-ARCHITECTURE.md) | Error recovery, resilience, and fault tolerance |

## Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Tailwind CSS, shadcn/ui, Wouter, TanStack Query |
| Backend | Node.js, Express.js, TypeScript (ESM) |
| Database | PostgreSQL (Neon-backed), Drizzle ORM |
| Code Runner | WebContainer (browser), Electron (desktop) |
| AI (Cloud) | OpenAI GPT-4o, Google Generative AI |
| AI (Local) | Custom TF-IDF, rule-based reasoning, graph analysis — no LLM needed |
| Desktop | Electron with native file system access |
| Version Control | GitHub via Octokit (Replit connector) |

## Quick Start

```bash
# Web mode (Replit)
npm run dev

# Electron desktop mode
npm run electron:dev
```

Then open the chat interface and describe what you want to build.
