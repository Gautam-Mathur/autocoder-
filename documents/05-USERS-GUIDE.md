# User's Guide

This guide covers everything you need to know about using AutoCoder to generate web applications from natural language descriptions.

---

## Getting Started

AutoCoder generates complete web applications from plain English descriptions. Open the app and you'll see a chat interface — just describe what you want to build.

No programming knowledge is required. AutoCoder handles:
- Database design (tables, relationships, constraints)
- API endpoints (CRUD operations with validation)
- Frontend pages (forms, tables, dashboards, kanban boards)
- Configuration files (TypeScript, Vite, Tailwind CSS)
- Authentication scaffolding
- Data visualization (charts, KPIs, metrics)

---

## The Conversation Flow

AutoCoder uses an 8-phase conversation flow to understand your requirements before generating code. You don't need to know which phase you're in — the system manages the flow automatically.

### Phase 1: Initial Request

Tell AutoCoder what you want to build. Be as specific or as vague as you like:

**Vague requests** (AutoCoder will ask follow-up questions):
- "Build me a project management tool"
- "I need an app for my restaurant"
- "Create something for tracking expenses"

**Specific requests** (may skip clarification):
- "Build a hospital management system with patient records, appointment scheduling, doctor assignments, billing, and a dashboard showing daily appointments and revenue"
- "Create an e-commerce store with products (name, price, description, image, category, stock), orders, customer accounts, and a shopping cart"

**Well-known app requests** (skip clarification entirely):
- "Build me a todo app"
- "Create a blog platform"
- "Make a CRM system"

### Phase 2: Clarification

AutoCoder may ask follow-up questions to understand your needs. Common questions include:

- **Entities**: "What data does your app manage? (e.g., patients, appointments, doctors)"
- **Features**: "What operations do you need? (create, read, update, delete, search, filter)"
- **UI patterns**: "How should the data be displayed? (tables, kanban boards, calendars, card grids)"
- **Relationships**: "How are entities related? (a doctor has many patients, an order has many items)"
- **Business rules**: "Any special logic? (appointments can't overlap, orders must have at least one item)"
- **Dashboard**: "What metrics matter? (daily revenue, patient count, order status breakdown)"

You can answer in natural language — AutoCoder extracts the structured information automatically.

### Phase 3: Planning

AutoCoder creates a project plan showing:
- **Database entities** with their fields and types
- **API endpoints** to be generated (GET, POST, PUT, DELETE for each entity)
- **Pages** and UI components
- **Relationships** between entities (one-to-many, many-to-many)
- **Workflows** and business logic
- **KPIs** for dashboards

You can review the plan and either:
- **Approve it**: Generation begins
- **Request changes**: "Add a 'priority' field to tasks" or "Include a calendar view for appointments"

### Phase 4: Generation

The 16-stage pipeline generates your complete application. Each stage is handled by a specialized AI module:

| Stage | What Happens |
|-------|-------------|
| Requirements Analysis | Extracts features, entities, and relationships from your description |
| Project Planning | Determines scope, file structure, and technology choices |
| Pattern Application | Applies learned patterns from 6,583 previous generations |
| Semantic Analysis | Deep entity extraction with field types and constraints |
| Architecture Planning | Selects app pattern, state management, and routing |
| Database Design | Creates Drizzle ORM schema with types, relationships, and indexes |
| API Design | Designs Express routes with Zod validation |
| Code Generation | Produces all React components, pages, and utilities |
| Design System | Creates color palette, typography, and spacing tokens |
| Functionality Specs | Detailed CRUD and feature specifications |
| Quality Check | Code quality scoring and issue detection |
| Dependency Check | Package resolution and version compatibility |
| Domain Knowledge | Domain-specific enhancements |
| Test Generation | Creates test files |
| Validation & Fix | Multi-pass validation with auto-fix |
| Learning | Records outcome for future improvement |

You can see the progress of each stage in the Intelligence Panel.

### Phase 5: Preview

Your generated app runs live in the browser via WebContainer. You can:
- Click through the UI and navigate between pages
- Test CRUD operations (create, read, update, delete)
- See the database schema in action
- Check responsive layout
- View the generated code in the VS Code-style editor
- Explore the file structure in the file panel

### Phase 6: Iteration

After seeing the preview, you can ask for changes:
- "Add a search bar to the patients table"
- "Change the dashboard to show monthly revenue instead of daily"
- "Add a status field to orders with color-coded badges"
- "Make the product cards show images"
- "Add a calendar view for appointments"

Only the affected files are regenerated — the rest of your project stays intact.

### Phase 7: Refinement

Continue iterating until you're satisfied. Each change builds on the previous state, so you can make incremental improvements:
1. "Add a priority field to tasks" → Tasks now have priority
2. "Color-code the priority badges" → Priority shows as colored badges
3. "Sort tasks by priority by default" → High-priority tasks appear first

### Phase 8: Export

When you're happy with your app:
- **Download as Zip**: Click the export button for a `.zip` file with all project files
- **Push to GitHub**: Push directly to a GitHub repository
- **Download as Text Bundle**: Get all files as a single text document

---

## What You Can Build

### Supported Industry Domains (14)

AutoCoder has deep domain knowledge for 14 industries. Each domain comes with pre-configured entities, field types, relationships, workflows, and KPIs:

| Domain | Example Apps | Key Entities | Example KPIs |
|--------|-------------|-------------|--------------|
| **E-commerce** | Online store, marketplace, inventory | Product, Order, Customer, Category, Review, Cart | Revenue, Order Count, Avg Order Value, Return Rate |
| **Healthcare** | Hospital management, clinic portal | Patient, Doctor, Appointment, Department, MedicalRecord, Prescription | Patient Count, Appointment Rate, Wait Time, Bed Occupancy |
| **CRM** | Sales pipeline, contact management | Contact, Deal, Company, Activity, Pipeline, Note | Deal Value, Conversion Rate, Pipeline Value, Win Rate |
| **Education** | Student portal, LMS, grade tracking | Student, Course, Enrollment, Assignment, Grade, Instructor | Enrollment Rate, GPA Average, Completion Rate, Pass Rate |
| **Project Management** | Task boards, sprint planning | Project, Task, TeamMember, Milestone, Sprint, Comment | Task Completion, On-Time Delivery, Velocity, Burndown |
| **Real Estate** | Property listings, tenant management | Property, Listing, Tenant, Lease, Showing, Agent | Occupancy Rate, Avg Rent, Days on Market, Revenue |
| **Restaurant** | Menu management, POS, reservations | MenuItem, Order, Table, Reservation, Staff, Ingredient | Revenue, Table Turnover, Avg Check Size, Food Cost |
| **Fitness** | Gym management, workout tracking | Member, Workout, Class, Trainer, Subscription, Exercise | Member Retention, Class Attendance, Revenue, Churn |
| **Finance** | Budgeting, invoicing, expense tracking | Account, Transaction, Budget, Invoice, Payment, Category | Balance, Revenue, Expense Ratio, Outstanding Invoices |
| **Social Media** | Feeds, profiles, messaging | User, Post, Comment, Like, Follow, Message, Notification | Daily Active Users, Engagement Rate, Growth, Retention |
| **HR** | Employee directory, payroll, leave | Employee, Department, LeaveRequest, Payroll, PerformanceReview | Headcount, Turnover Rate, Avg Salary, Leave Utilization |
| **Logistics** | Shipping, inventory, warehouse | Shipment, Warehouse, Inventory, Route, Vehicle, Supplier | On-Time Delivery, Inventory Turnover, Cost per Mile |
| **Booking** | Appointment scheduling, services | Booking, Service, Provider, Customer, TimeSlot, Payment | Booking Rate, Utilization, Revenue, No-Show Rate |
| **Content Management** | Blog, CMS, media library | Article, Author, Category, Tag, Media, Comment, Page | Page Views, Publish Rate, Engagement, Bounce Rate |

### Well-Known App Fast-Path

AutoCoder recognizes 16 common application patterns and can skip the clarification phase entirely:

| App Type | What's Generated |
|----------|-----------------|
| Todo App | Tasks with title, description, status, priority, due date. Table + Kanban views |
| Blog Platform | Posts, authors, categories, tags, comments. Card grid + editor |
| E-commerce Store | Products, orders, categories, cart. Card grid + checkout flow |
| Chat Application | Users, conversations, messages. Real-time messaging UI |
| Project Manager | Projects, tasks, milestones, team members. Kanban + table views |
| CRM System | Contacts, deals, companies, activities. Pipeline + table views |
| Social Media Feed | Users, posts, comments, likes, follows. Feed + profile pages |
| Dashboard / Analytics | Configurable metrics, charts, KPIs. Dashboard with Recharts |
| Inventory Management | Products, stock levels, suppliers, orders. Table + alerts |
| Calendar / Scheduler | Events, calendars, participants. Calendar + event forms |
| Knowledge Base / Wiki | Articles, sections, search, tags. Content pages + search |
| Recipe Book | Recipes, ingredients, categories, ratings. Card grid + detail |
| Expense Tracker | Expenses, categories, budgets, reports. Table + charts |
| Booking System | Services, providers, time slots, bookings. Calendar + forms |
| Job Board | Jobs, companies, applications, categories. Card grid + filters |
| Survey / Form Builder | Surveys, questions, responses, analytics. Builder + results |

For these, just say "build me a todo app" and generation starts immediately with sensible defaults.

---

## UI Patterns

Generated apps use one of 5 UI patterns based on your data semantics. AutoCoder automatically selects the best pattern, but you can override it.

### Table View (Default)

**Best for**: Data-heavy entities with many fields, administrative interfaces.

**Features**:
- Sortable columns (click header to sort)
- Pagination (10/25/50 per page)
- Inline actions (edit, delete, view)
- Add new record form (inline or modal)
- Column filtering

**Auto-selected when**: Entity has 5+ fields without a dominant status or date field.

### Kanban Board

**Best for**: Entities with a `status` field — tasks, orders, tickets, deals.

**Features**:
- Drag-and-drop between columns
- Column headers with item counts
- Card previews with key fields
- Add new card per column
- Color-coded status indicators

**Auto-selected when**: Entity has a `status` field with 3+ possible values.

### Calendar View

**Best for**: Entities with date fields — appointments, events, schedules, deadlines.

**Features**:
- Monthly, weekly, and daily views
- Click-to-create on date
- Event detail popover
- Color-coded by category/type
- Drag to reschedule

**Auto-selected when**: Entity has a primary date/datetime field.

### Card Grid

**Best for**: Visual entities — products, profiles, properties, recipes.

**Features**:
- Responsive grid layout (1-4 columns)
- Image support with fallback
- Key info on card face (title, price, status)
- Click to expand/detail view
- Action buttons (edit, delete, favorite)

**Auto-selected when**: Entity has an `image` field or is in a visual domain (e-commerce, real estate).

### Dashboard

**Best for**: KPI overview pages — executive summaries, analytics, monitoring.

**Features**:
- Summary cards with metrics
- Charts (bar, line, pie, area) via Recharts
- Semantic type detection (revenue → currency format, count → number, rate → percentage)
- Configurable time ranges
- Auto-generated from entity data

**Auto-selected when**: Page is marked as a dashboard or overview.

### View Toggle

Many entities support switching between patterns. A toggle in the page header lets you switch between, for example, Table view and Kanban view for the same entity data.

---

## Tips for Best Results

### 1. Be Specific About Entities

Instead of:
> "Build a store"

Say:
> "Build an online store with products (name, price, description, image URL, category, stock quantity) and orders (customer email, items, total, status, shipping address)"

The more fields you specify, the richer the generated UI will be.

### 2. Mention UI Preferences

> "Show products as a card grid with images"
> "Use a kanban board for tasks grouped by status"
> "I want a calendar view for appointments"
> "Show a dashboard with revenue charts"

### 3. Describe Relationships

> "Each doctor belongs to a department"
> "Each order has many order items, each linked to a product"
> "A student can enroll in many courses, and a course has many students"

Relationships generate proper foreign keys, join queries, and linked UI (e.g., viewing a doctor shows their department name, not just a department ID).

### 4. Mention Special Field Types

AutoCoder infers field types from names, but being explicit helps:

| If you say... | AutoCoder generates... |
|---------------|----------------------|
| "status" field | Select dropdown with color-coded badges |
| "email" field | Text input with email validation |
| "date" or "dueDate" | DatePicker component |
| "price" or "amount" | Number input with currency formatting |
| "image" or "photo" | Image upload with preview |
| "description" or "notes" | Textarea (multi-line) |
| "priority" | Select with High/Medium/Low options |
| "rating" | Star rating component |
| "isActive" or "isPublished" | Toggle/checkbox |
| "tags" or "categories" | Multi-select |

### 5. Iterate in Small Steps

Ask for one change at a time:
- "Add a search bar to the products page" ✓
- "Now add filtering by category" ✓
- "Add a sort dropdown for price" ✓

Rather than:
- "Add search, filtering, sorting, pagination, and export" (too many changes at once)

### 6. Mention Dashboard Metrics

If you want a dashboard, specify what metrics matter:
> "Show a dashboard with total revenue, order count, average order value, and a chart of orders by status"

AutoCoder uses semantic type detection:
- Revenue → formatted as currency ($1,234.56)
- Count → formatted as integer (1,234)
- Rate → formatted as percentage (85.3%)
- Duration → formatted as time (2h 15m)

---

## AI Modes

### Cloud Mode (requires API key)

Uses OpenAI GPT-4o for maximum quality. Best for:
- Novel or unusual application types not in the 14 standard domains
- Complex business logic with nuanced rules
- Sophisticated natural language understanding
- Applications requiring creative interpretation

**To enable**: Set `OPENAI_API_KEY` in your environment.

### Local Mode (no API key needed)

Uses the built-in local AI engine with:
- **TF-IDF Pattern Matcher**: Understands user intent by matching against 6,583+ learned patterns
- **Rule-Based Reasoning Engine**: Makes architectural decisions based on entity semantics
- **Graph Analysis Engine**: Detects entity relationships from field names and types
- **Template Selection System**: Picks the best generation template from 394 options

Best for:
- Standard CRUD applications across all 14 domains
- Offline development (airplane, restricted networks)
- Fast generation without API latency
- Privacy-sensitive projects (nothing leaves your machine)
- Cost-sensitive development (no per-token API fees)

Both modes produce the same output file structure. The difference is in the quality of understanding for complex, ambiguous, or novel requirements.

---

## Exporting Your Project

### Download as Zip

Click the **Export** button in the deployment panel. You'll get a `.zip` file containing:
- All source files (components, pages, routes, schema)
- `package.json` with all dependencies
- Configuration files (tsconfig, vite.config, tailwind.config)
- Ready to run with `npm install && npm run dev`

### Push to GitHub

Click the **GitHub** button in the deployment panel to push your project to a repository:
1. Select or create a GitHub repository
2. AutoCoder pushes all files using a full tree replacement strategy
3. Your repo will contain exactly the generated project
4. You can then clone, modify, and deploy the repo anywhere

### Download as Text Bundle

Use the download endpoint for a single text document containing all files:
```
GET /api/conversations/:id/download
```
This is useful for sharing, code review, or archiving.

---

## Understanding the Preview

### What the Preview Shows

The live preview runs your generated app in a sandboxed environment:
- Full React application with working routing
- Functional CRUD operations (data stored in the preview's in-memory database)
- Real API calls between frontend and backend
- Styled with Tailwind CSS and shadcn/ui components
- Responsive layout (resize the preview panel to test)

### Preview Limitations

- Data is not persistent — refreshing the preview resets the database
- Some native features (file upload, email sending) are simulated
- WebContainer has limited network access — external API calls may not work
- Performance is slightly slower than native Node.js

### Preview Controls

| Button | Action |
|--------|--------|
| Reload | Restarts the dev server |
| Open in New Tab | Opens the preview in a full browser tab |
| Console | Shows the dev server logs |
| Stop | Stops the preview server |

---

## Troubleshooting

### "Generation seems stuck"
- Check the Intelligence Panel for the current pipeline stage
- Some stages (Code Generation, Validation) take longer than others
- If stuck for more than 2 minutes on a single stage, try refreshing and resubmitting

### "Preview shows a blank page"
- Wait for the pre-warm to complete (green indicator)
- Check the preview console for JavaScript errors
- Try clicking "Reload" in the preview controls
- If persistent, try "Rebuild" to force a fresh install

### "Generated app has errors"
- This is sometimes expected — the auto-fix system handles most issues
- Check the error panel for specific error messages
- You can ask AutoCoder to fix specific errors: "Fix the import error in the patients page"
- The validator catches most issues, but some runtime errors require manual iteration

### "Not enough fields/features"
- Be more specific in your initial description
- After generation, ask for additions: "Add email and phone fields to the customer entity"
- The learning engine gets better with more specific requests
