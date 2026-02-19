# Why and How — Design Philosophy

## Why AutoCoder Exists

Most code generators produce toy examples — single files, no database, no proper state management, no error handling. They're demos, not applications. AutoCoder exists to close that gap: generate complete, production-quality, multi-file applications that actually work out of the box.

### The Problem

1. **LLM-generated code is fragile**: AI models produce code that looks correct but has broken imports, missing dependencies, and inconsistent naming
2. **No dependency awareness**: Generated code references packages that aren't installed, or uses incompatible versions
3. **No structural consistency**: Each generation produces different patterns, making iterative development impossible
4. **Slow feedback loops**: Users wait minutes for npm installs and build steps before seeing if the code even works
5. **Cloud dependency**: Most generators require expensive API keys and internet access

### The Solution

AutoCoder addresses each problem:

1. **Dependency-tracked components**: Every component in CodeGen V2 declares its npm packages, imports, and peer dependencies. Nothing is generated without its dependencies being resolved first
2. **Pre-warm package cache**: 140 packages are pre-installed in WebContainer before generation begins, so the generated project starts instantly
3. **Composable patterns**: 5+ UI patterns (Table, Kanban, Calendar, Card Grid, Dashboard) are built from the same composable building blocks, ensuring consistency
4. **Post-generation validation**: A multi-pass validator checks every import, export, route, and dependency — then auto-fixes what it can
5. **Fully local engine**: A complete 16-stage pipeline runs offline using TF-IDF, rule engines, and graph analysis — zero API keys needed

## Architectural Decisions

### Why Dual Intelligence?

Cloud AI (GPT-4o) produces the highest quality output but requires API keys and internet. The local engine produces good output for common patterns using deterministic algorithms. Users choose based on their needs:

- **Cloud mode**: Best for novel, complex, or domain-specific applications
- **Local mode**: Best for standard CRUD apps, offline development, or when you want zero external dependencies

### Why WebContainer + Electron?

- **WebContainer**: Runs npm and Node.js directly in the browser. No server-side compilation needed. Users see their app running in seconds
- **Electron**: For power users who want native file system access, local npm execution, and project persistence between sessions

### Why 4-Tier Pre-warm?

WebContainer's npm is slower than native npm. Without pre-warming, the first `npm install` takes 2-5 minutes. By pre-installing 140 packages across 4 tiers (core, UI, server, extras), the generated project's dependencies are already cached, reducing install time to near-zero for most applications.

### Why Composable CodeGen Over Templates?

Templates are rigid — they generate one specific layout and can't adapt to different entity structures. CodeGen V2 uses a composable approach:

- **Components are atoms**: Each UI component (TextInput, Select, DatePicker, DataTable) is self-contained with its dependencies
- **Field resolver maps data to components**: A `status` field gets a Select with colored badges. A `date` field gets a DatePicker. An `email` field gets a validated TextInput
- **Page builder composes patterns**: The same entity data can be rendered as a Table, Kanban board, Calendar, or Card Grid — the page builder picks the best pattern based on entity semantics
- **Validator ensures correctness**: After generation, every file is cross-checked for missing imports, broken references, and dependency gaps

### Why PostgreSQL + Drizzle?

- **PostgreSQL** is the most capable open-source database, with JSON support, full-text search, and robust transactions
- **Drizzle ORM** provides type-safe queries with a minimal footprint — no heavy runtime, and its schema-as-code approach means the database schema is always in sync with TypeScript types
- **Drizzle-Zod** generates validation schemas from database schemas, ensuring API request validation matches the database exactly

## Design Principles

1. **Generated code should look hand-written**: No boilerplate comments, no framework-specific abstractions — just clean, readable TypeScript
2. **Fail gracefully, never silently**: Every error is caught, logged, and either auto-fixed or surfaced to the user with a clear explanation
3. **Offline-first**: The local engine is a first-class citizen, not a fallback. It should produce useful output without any network access
4. **Learn from every generation**: Success patterns, user modifications, and failure modes are all recorded to improve future generations
5. **Transparency**: The user can see every stage of the pipeline, what it decided, and why — no black-box magic
