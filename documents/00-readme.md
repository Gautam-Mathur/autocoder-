# AutoCoder — AI-Powered Code Generation Platform

## What is AutoCoder?

AutoCoder is an AI-powered, full-stack code generation platform that creates complete, production-ready, multi-file React + Vite + TypeScript web applications from natural language descriptions. You describe what you want — "build me a hospital management system" or "create an e-commerce store with inventory tracking" — and AutoCoder generates a fully functional application with database models, API endpoints, UI components, authentication, CRUD operations, dashboards, and more.

AutoCoder is not a toy code generator. It produces applications with **70+ server modules**, **40+ client-side libraries**, **6,583 learned patterns**, **3,575 user preferences**, and **116,000+ validated stress test iterations** — all working together to generate code that looks and works like a hand-written production application.

---

## Platform Statistics

| Metric | Value |
|--------|-------|
| Total lines of code (LOC) | 493,957 |
| Total TypeScript files | 3,186 |
| Server module files | 70 (60,858 lines) |
| Client-side code | 41,223 lines across generators, runners, and UI |
| AI modules | 13 specialized cloud modules + 16-stage local pipeline |
| Supported industry domains | 14 |
| Built-in templates | 394 |
| Pre-warm packages | 200+ (4-tier batched system) |
| Learned patterns | 6,583 (6,461 reliable — 98.1% reliability) |
| Learned preferences | 3,575 |
| Unique field types | 228+ |
| Seeded entities | 103 across 14 industries |
| Stress test iterations | 116,000 (100% pass rate) |
| Learning successes | 182,683 |
| Learning failures | 230 (99.87% success rate) |

---

## Key Capabilities

- **Natural Language to Code**: Describe your app in plain English, get a working full-stack application with database, API, and UI
- **14 Industry Domains**: Healthcare, e-commerce, education, finance, real estate, project management, HR, restaurant, logistics, social media, CRM, content management, fitness, and booking — each with deep domain-specific knowledge, entities, workflows, and KPIs
- **394 Built-in Templates**: Pre-configured patterns for common applications across all supported domains
- **Dual AI Architecture**: Cloud-based AI (GPT-4o / Google Generative AI) for maximum quality, or a fully local engine with TF-IDF, rule-based reasoning, and graph analysis for zero-dependency offline use
- **Live Preview**: See your generated app running in-browser via WebContainer technology, or natively via Electron desktop mode
- **Iterative Editing**: Modify your generated project through conversation — only affected files are regenerated
- **GitHub Integration**: Push generated projects directly to GitHub repositories via Octokit
- **Continuous Learning**: The system learns from every generation — entity patterns, domain mappings, field types, and user preferences are recorded and used to improve future output
- **Post-Generation Validation**: Multi-pass validator with auto-fix catches broken imports, missing dependencies, and cross-file inconsistencies
- **WebContainer Pre-warm**: 200+ packages pre-installed in 4 tiers for near-instant project startup
- **Electron Desktop Mode**: Native file system access, persistent project storage, and full npm support including native binary packages
- **VAPT Dashboard**: Built-in vulnerability assessment and penetration testing interface
- **Transparency**: Every pipeline stage exposes its decisions, quality scores, and timing data

---

## How It Works (High Level)

```
User describes app → Clarification questions → Project plan → 16-stage pipeline
    ↓                                                              ↓
    ↓                                                    13 AI modules analyze
    ↓                                                              ↓
    ↓                                                    CodeGen V2 generates
    ↓                                                              ↓
    ↓                                                    Validation & auto-fix
    ↓                                                              ↓
Live preview ← WebContainer/Electron ← Generated files (40+ files per project)
    ↓
Iterate → Ask for changes → Only affected files regenerated
    ↓
Export → GitHub push / Zip download / Text bundle
```

### Detailed Flow

1. **You describe your app** in the chat interface — as vague or detailed as you like
2. **Domain detection** identifies your industry (healthcare, e-commerce, etc.) and loads domain-specific knowledge including entities, workflows, KPIs, and relationships
3. **AutoCoder asks clarifying questions** to understand features, entities, relationships, and UI preferences
4. **A project plan** is generated showing database entities, API endpoints, pages, and relationships — you can review and modify it
5. **The 16-stage pipeline** runs, with each stage handled by a specialized AI module (Product Manager, System Architect, Schema Designer, API Architect, Full-Stack Developer, etc.)
6. **CodeGen V2** produces all files using dependency-tracked composable components: React pages, Express API routes, Drizzle database schema, Vite/Tailwind/TypeScript config, and proper CRUD operations
7. **Post-generation validation** runs multi-pass checks on every import, export, route, and dependency — auto-fixing what it can
8. **The Learning Engine** records the generation outcome, entity patterns, domain mappings, and field types for future improvement
9. **Live preview** lets you see the running application immediately in WebContainer or Electron
10. **You can iterate** — ask for changes in natural language, and only the affected files are regenerated

---

## Documentation Index

| # | Document | Description | Audience |
|---|----------|-------------|----------|
| 00 | [Readme](00-readme.md) | This file — overview, capabilities, and quick start | Everyone |
| 01 | [Why and How](01-WHY-AND-HOW.md) | Motivation, design philosophy, architectural decisions, and comparisons | Architects, contributors |
| 02 | [Developer's Guide](02-DEVELOPERS-GUIDE.md) | Complete project structure, all 70 modules, data flow, conventions, and contributing | Developers |
| 03 | [Problems and Solutions](03-PROBLEMS-AND-SOLUTIONS.md) | Known issues, root causes, solutions, and debugging tips | Developers, support |
| 04 | [Running Guide](04-RUNNING-GUIDE.md) | Web mode, Electron desktop mode, environment config, pre-warm, and troubleshooting | Everyone |
| 05 | [User's Guide](05-USERS-GUIDE.md) | End-user guide: conversation flow, domains, UI patterns, templates, exporting | End users |
| 06 | [Tester's Guide](06-TESTERS-GUIDE.md) | Stress testing (116,000 iterations), validation, learning engine testing, quality gates | QA, developers |
| 07 | [API Reference](07-API-REFRENCE.md) | Complete REST API documentation with request/response schemas for all endpoints | Developers, integrators |
| 08 | [Failsafe Architecture](08-FAILSAFE-ARCHITECTURE.md) | 6-level failsafe hierarchy, error recovery, resilience patterns, and monitoring | Architects, ops |

---

## Tech Stack Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend Framework | React 18 + TypeScript | Component-based UI with type safety |
| Routing | Wouter | Lightweight client-side routing |
| State Management | TanStack Query v5 | Server state with caching and invalidation |
| Styling | Tailwind CSS + shadcn/ui | Utility-first CSS with accessible components |
| Forms | react-hook-form + Zod | Validated forms with schema-driven validation |
| Icons | Lucide React | Clean, consistent icon library |
| Backend | Node.js + Express.js (TypeScript ESM) | RESTful API server |
| Database | PostgreSQL (Neon-backed) + Drizzle ORM | Type-safe relational data with schema-as-code |
| Validation | Zod + drizzle-zod | Request validation from database schemas |
| Authentication | Passport + express-session | Session-based auth |
| Real-time | WebSocket (ws) | Streaming AI responses |
| Code Runner (Web) | @webcontainer/api | In-browser Node.js runtime |
| Code Runner (Desktop) | Electron | Native file system + npm |
| AI (Cloud) | OpenAI GPT-4o + Google Generative AI | Advanced reasoning and generation |
| AI (Local) | TF-IDF + Rule Engine + Graph Analysis | Fully offline, zero-dependency AI |
| Version Control | Octokit (@octokit/rest) | GitHub API integration |
| Charts | Recharts + Chart.js | Data visualization |
| Animation | Framer Motion | Smooth UI transitions |
| Export | JSZip + Archiver + ADM-Zip | Project packaging and download |

---

## Quick Start

### Web Mode (Replit / Browser)
```bash
npm run dev
```
Open the chat interface at `http://localhost:5000` and describe what you want to build.

### Electron Desktop Mode
```bash
npm run electron:dev
```
This launches a native desktop window with full file system access and persistent project storage.

### Building Electron for Distribution
```bash
npm run electron:build
```
Creates distributable packages for Windows, macOS, and Linux.

---

## Supported Industry Domains

AutoCoder has deep domain knowledge for 14 industries, each with pre-configured entities, workflows, KPIs, and relationship patterns:

| Domain | Key Entities | Example KPIs |
|--------|-------------|--------------|
| **E-commerce** | Product, Order, Customer, Category, Review, Cart | Revenue, Order Count, Avg Order Value |
| **Healthcare** | Patient, Doctor, Appointment, Department, MedicalRecord | Patient Count, Appointment Rate, Wait Time |
| **CRM** | Contact, Deal, Company, Activity, Pipeline | Deal Value, Conversion Rate, Pipeline Value |
| **Education** | Student, Course, Enrollment, Assignment, Grade | Enrollment Rate, GPA Average, Completion Rate |
| **Project Management** | Project, Task, TeamMember, Milestone, Sprint | Task Completion, On-Time Delivery, Velocity |
| **Real Estate** | Property, Listing, Tenant, Lease, Showing | Occupancy Rate, Avg Rent, Listing Time |
| **Restaurant** | MenuItem, Order, Table, Reservation, Staff | Revenue, Table Turnover, Avg Check Size |
| **Fitness** | Member, Workout, Class, Trainer, Subscription | Member Retention, Class Attendance, Revenue |
| **Finance** | Account, Transaction, Budget, Invoice, Payment | Balance, Revenue, Expense Ratio |
| **Social Media** | User, Post, Comment, Like, Follow, Message | Daily Active Users, Engagement Rate, Growth |
| **HR** | Employee, Department, LeaveRequest, Payroll, Review | Headcount, Turnover Rate, Avg Salary |
| **Logistics** | Shipment, Warehouse, Inventory, Route, Vehicle | On-Time Delivery, Inventory Turnover, Cost/Mile |
| **Booking** | Booking, Service, Provider, Customer, TimeSlot | Booking Rate, Utilization, Revenue |
| **Content Management** | Article, Author, Category, Tag, Media, Comment | Page Views, Publish Rate, Engagement |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React 18)                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐│
│  │ Chat UI  │  │ Preview  │  │ Code IDE │  │ VAPT Dashboard││
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────────────┘│
│       │              │              │                         │
│  ┌────┴──────────────┴──────────────┴────┐                   │
│  │        Code Generator Library         │                   │
│  │  (templates, generators, validators)  │                   │
│  └───────────────────┬───────────────────┘                   │
│                      │                                       │
│  ┌───────────────────┴───────────────────┐                   │
│  │         Code Runner Library           │                   │
│  │  (WebContainer, auto-runner, logger)  │                   │
│  └───────────────────────────────────────┘                   │
└─────────────────────────┬───────────────────────────────────┘
                          │ REST API + WebSocket
┌─────────────────────────┴───────────────────────────────────┐
│                     Backend (Express.js)                      │
│  ┌──────────┐  ┌────────────────┐  ┌───────────────────────┐│
│  │  Routes  │  │ Storage (CRUD) │  │   70 Server Modules   ││
│  │ (6,162L) │  │  (PostgreSQL)  │  │   (60,858 lines)      ││
│  └────┬─────┘  └────────┬───────┘  └───────────┬───────────┘│
│       │                 │                       │            │
│  ┌────┴─────────────────┴───────────────────────┴──────────┐│
│  │                 AI Module Team (13 modules)              ││
│  │  Design System · Architecture · Functionality · Schema  ││
│  │  API Design · Components · Quality · Dependencies       ││
│  │  Domain Synthesis · Clarification · Test Gen            ││
│  │  Deep Understanding · Plan Generator                    ││
│  └──────────────────────┬──────────────────────────────────┘│
│                         │                                    │
│  ┌──────────────────────┴──────────────────────────────────┐│
│  │              CodeGen V2 Engine                          ││
│  │  Orchestrator · Components · Field Resolver             ││
│  │  Page Builder · Validator · E2E Tests                   ││
│  └──────────────────────┬──────────────────────────────────┘│
│                         │                                    │
│  ┌──────────────────────┴──────────────────────────────────┐│
│  │           Generation Learning Engine                    ││
│  │  6,583 patterns · 3,575 preferences · 228+ field types ││
│  │  14 domains · 103 entities · 16 workflows               ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
                          │
              ┌───────────┴───────────┐
              │     PostgreSQL DB     │
              │   (Neon-backed)       │
              └───────────────────────┘
```

---

## Learning Engine Overview

The Generation Learning Engine is a core differentiator. It records and applies knowledge from every code generation run:

| Data Type | Count | Description |
|-----------|-------|-------------|
| **Patterns** | 6,583 | Learned generation patterns (entity structures, domain mappings, template selections) |
| **Reliable Patterns** | 6,461 | Patterns with high confidence (98.1% of all patterns) |
| **Preferences** | 3,575 | User and domain preferences for UI patterns, field types, and relationships |
| **Field Types** | 228+ | Unique field types across all entities (serial, text, integer, decimal, boolean, date, timestamp, enum, json, etc.) |
| **Domain Patterns** | 3,588 | Patterns with domain identification (97% coverage) |
| **Entity Patterns** | 680 | Patterns with full field type information (95% coverage) |
| **Success Rate** | 99.87% | 182,683 successes out of 182,913 total outcomes |

The learning engine integrates at 5 points in the generation pipeline:
1. **Pre-generation**: Applies learned patterns to enhance project plans
2. **Entity enrichment**: Suggests missing entities based on domain knowledge
3. **Field type inference**: Maps field names to correct database types
4. **KPI suggestion**: Adds domain-appropriate dashboard metrics
5. **Post-generation**: Records outcomes for future improvement

---

## License

This project is proprietary software. All rights reserved.
