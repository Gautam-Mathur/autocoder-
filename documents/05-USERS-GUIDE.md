# User's Guide

## Getting Started

AutoCoder generates complete web applications from natural language descriptions. Open the app and you'll see a chat interface — just describe what you want to build.

## The Conversation Flow

AutoCoder uses an 8-phase conversation to understand your requirements before generating code:

### Phase 1: Initial Request
Tell AutoCoder what you want to build. Be as specific or as vague as you like:

- **Vague**: "Build me a project management tool"
- **Specific**: "Build a hospital management system with patient records, appointment scheduling, doctor assignments, and billing"

### Phase 2: Clarification
AutoCoder may ask follow-up questions to understand your needs:
- What entities/data types does your app manage?
- What features do you need? (CRUD, search, filtering, dashboards)
- What UI pattern works best? (tables, kanban boards, calendars, card grids)
- Any specific business rules or workflows?

### Phase 3: Planning
AutoCoder creates a project plan showing:
- Database entities and their fields
- API endpoints to be generated
- Pages and UI components
- Relationships between entities

You can review and approve the plan, or ask for changes.

### Phase 4: Generation
The 16-stage pipeline generates your complete application:
- Database schema with Drizzle ORM
- Express API routes with validation
- React pages with components
- Configuration files (Vite, Tailwind, TypeScript)
- Proper CRUD operations with optimistic updates

### Phase 5: Preview
Your generated app runs live in the browser via WebContainer. You can:
- Click through the UI
- Test CRUD operations
- See the database schema in action
- Check responsive layout

### Phase 6-8: Iteration
After seeing the preview, you can ask for changes:
- "Add a search bar to the patients table"
- "Change the dashboard to show monthly revenue"
- "Add a status field to orders with color-coded badges"

Only the affected files are regenerated — the rest of your project stays intact.

## What You Can Build

AutoCoder understands 14 industry domains:

| Domain | Example Apps |
|--------|-------------|
| Healthcare | Patient management, appointment scheduling, medical records |
| E-commerce | Product catalogs, shopping carts, order management |
| Education | Student portals, course management, grade tracking |
| Finance | Budget trackers, invoice management, expense reporting |
| Real Estate | Property listings, tenant management, lease tracking |
| Project Management | Task boards, team collaboration, sprint planning |
| HR | Employee directories, leave management, payroll |
| Restaurant | Menu management, order tracking, table reservations |
| Logistics | Inventory management, shipping tracking, warehouse ops |
| Social | User profiles, feeds, messaging, notifications |
| CRM | Contact management, deal pipelines, activity logging |
| Content | Blog platforms, CMS, media libraries |
| IoT | Device dashboards, sensor monitoring, alert systems |
| Analytics | Data dashboards, reporting, KPI tracking |

## Well-Known App Fast-Path

AutoCoder recognizes 16 common application patterns and can skip clarification entirely:

- Todo App
- Blog Platform
- E-commerce Store
- Chat Application
- Project Manager
- CRM System
- Social Media Feed
- Dashboard / Analytics
- Inventory Management
- Calendar / Scheduler
- Knowledge Base / Wiki
- Recipe Book
- Expense Tracker
- Booking System
- Job Board
- Survey / Form Builder

For these, just say "build me a todo app" and generation starts immediately.

## UI Patterns

Generated apps use one of 5 UI patterns based on your data:

### Table View (Default)
Best for: Data-heavy entities with many fields. Includes sorting, pagination, and inline actions.

### Kanban Board
Best for: Entities with a `status` field (tasks, orders, tickets). Drag-and-drop between columns.

### Calendar View
Best for: Entities with date fields (appointments, events, schedules). Monthly/weekly/daily views.

### Card Grid
Best for: Visual entities (products, profiles, properties). Image-friendly with action buttons.

### Dashboard
Best for: KPI overview pages. Charts, metrics, and summary cards with semantic type detection (revenue shows as currency, counts show as numbers, etc.).

## Exporting Your Project

### Download as Zip
Click the export button to download all generated files as a `.zip` file.

### Push to GitHub
Click the GitHub button in the deployment panel to push your project to a GitHub repository. AutoCoder uses a full tree replacement strategy — your repo will contain exactly what was generated.

### Download as Text Bundle
Use `GET /api/conversations/:id/download` to get all files as a single text document (useful for sharing or reviewing).

## Tips for Best Results

1. **Be specific about entities**: Instead of "build a store", say "build a store with products (name, price, description, image, category) and orders (items, total, status, customer email)"

2. **Mention UI preferences**: "Show products as a card grid" or "use a kanban board for tasks"

3. **Describe relationships**: "Each doctor has many patients, each patient has many appointments"

4. **Mention special fields**: Status fields get color-coded badges. Date fields get date pickers. Email fields get validation. Currency fields get formatting.

5. **Iterate in small steps**: Ask for one change at a time rather than a complete redesign

## AI Modes

### Cloud Mode (requires API key)
Uses OpenAI GPT-4o for maximum quality. Best for:
- Novel or unusual application types
- Complex business logic
- Nuanced natural language understanding

### Local Mode (no API key needed)
Uses the built-in local AI engine with TF-IDF matching, rule-based reasoning, and graph analysis. Best for:
- Standard CRUD applications
- Offline development
- Fast generation without API latency
- Privacy-sensitive projects
