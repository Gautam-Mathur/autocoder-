# Design Guidelines: AutoCoder - AI-Powered Code Generation Platform

## Design Approach
**System-Based Approach** inspired by modern developer tools (VS Code, Linear, GitHub Copilot, Cursor AI)

**Core Principle**: Functional elegance — minimal distraction, maximum productivity. The interface should feel like a natural extension of a developer's workflow.

## Typography System
- **Primary Font**: Inter or IBM Plex Sans (clean, technical, highly legible)
- **Monospace Font**: JetBrains Mono or Fira Code (for all code display)
- **Hierarchy**:
  - Headings: 24px/20px/16px (semibold)
  - Body: 14px (regular/medium)
  - Code inline: 13px
  - Code blocks: 14px
  - UI labels: 12px (medium, uppercase tracking)

## Layout System
**Spacing Units**: Tailwind units of 1, 2, 3, 4, 6, 8, 12, 16 for consistent rhythm

**Core Layout**: Split-screen or tabbed interface
- Left sidebar (60-80px): Navigation icons
- Main area: Chat/code editor (flexible, resizable)
- Right panel (optional, collapsible): Settings, history, templates

## Color System & Design Tokens

AutoCoder's Design System Engine generates domain-aware color palettes for generated applications. The platform itself uses a neutral developer-focused palette:

### Platform Colors (Dark Mode Default)
- **Background**: Slate 900-950 (deep neutral)
- **Surface**: Slate 800-850 (card/panel backgrounds)
- **Primary Accent**: Violet 500-600 (interactive elements, links, focus states)
- **Secondary Accent**: Emerald 500 (success states, positive indicators)
- **Warning**: Amber 500 (caution states)
- **Error**: Red 500 (error states, destructive actions)
- **Text Primary**: Slate 50-100 (high contrast on dark backgrounds)
- **Text Secondary**: Slate 400 (subdued text, labels)
- **Border**: Slate 700 (subtle separation)

### Generated App Design Tokens
The Design System Engine (696 lines) produces 14 domain-specific color palettes based on industry mood:
- Healthcare: Clinical blue + clean white
- Restaurant: Warm amber + rich brown
- Consulting: Professional slate + corporate blue
- Fitness: Energetic green + dynamic orange
- Finance: Trust blue + stable gray
- Education: Friendly purple + warm yellow
- Real Estate: Luxury gold + confident navy
- Retail: Vibrant coral + fresh teal
- HR: Approachable blue + warm beige
- Logistics: Industrial gray + safety orange
- Manufacturing: Steel blue + technical gray
- CRM: Sales green + growth blue
- Inventory: Organized teal + warehouse brown
- Project Management: Productive indigo + task green

Each palette generates CSS variables, gradients, shadow scales, typography scales, border radii, transitions, and component-level style tokens.

## Component Library

### Navigation
- **Sidebar**: Vertical icon-based navigation (New Chat, History, Settings, Documentation)
- Minimal labels, tooltips on hover
- Active state: subtle border accent

### Chat Interface
- **Message Bubbles**: Full-width alternating layout
  - User messages: Right-aligned, subtle background
  - AI responses: Left-aligned, distinct container with code blocks
- **Input Area**: Bottom-anchored, expandable textarea with send button
  - Contextual placeholder text adapts to conversation phase ("Describe what you'd like to change..." in editing mode)
  - Status bar shows AI engine, editing mode indicator, and file count
- **Code Blocks**: Syntax-highlighted with copy button, language label
- **Thinking Steps**: Expandable pipeline visualization showing 16-stage orchestrator progress
  - Each stage displays: role name, status (running/complete/failed), quality score
  - Collapsible detail sections for each AI module's output
- **Pipeline Summary**: Quality score badge, file/line/component/endpoint counts, duration
- **Edit Notifications**: Real-time "Files changed" panel above chat input
  - Color-coded file icons: FilePlus (green) for new files, FileCode (blue) for modified, FileX (red) for deleted
  - Shows file path (monospace) and edit description per file
  - Auto-dismisses after 10 seconds
  - Appears only when iterative edits are applied to existing projects
- **Editing Phase Indicator**: "Interactive editing" label with pencil icon in status bar when in post-generation editing mode
- **Compound Color Support**: Style edits recognize 36+ color variants including multi-word names (dark blue, light green, navy, coral, etc.) via COMPOUND_COLOR_MAP and resolveColor() function
- **Semantic Class Handling**: Style edits handle both Tailwind shade patterns (bg-blue-500) and semantic patterns (bg-background, bg-card) with fallback injection when no existing bg classes found

### Code Editor Integration
- **Monaco Editor-style**: Professional code editing with line numbers
- **Toolbar**: File tabs, language selector, run button
- **Output Panel**: Collapsible console for execution results

### Intelligence Panel
- **Module Status**: Real-time display of active AI modules (cloud) and local AI subsystems
- **Quality Report**: Code quality grade (A+ through F) with per-category breakdown
- **Architecture Summary**: Detected app pattern, folder structure, state management choices
- **Design System Preview**: Generated color palette and typography preview
- **Local AI Stats**: Template library counts, learning patterns, pipeline execution metrics

### Local AI Pipeline Dashboard
- **Pipeline Stage Visualization**: 16-stage progress bar with individual stage scores
  - Color-coded status: green (90+), yellow (70-89), red (<70)
  - Per-stage duration display in milliseconds
  - Expandable detail for each stage output
- **Template Library Browser**: Searchable view of 394 templates across 8 categories
  - App Archetypes (104), Domain Profiles (30), Architecture Patterns (15)
  - Schema Templates (40), API Templates (30), UI Components (50)
  - Code Snippets (100), Test Patterns (25)
- **Learning Stats Panel**: Real-time learning metrics
  - Total outcomes recorded, average quality score, improvement trend
  - Top patterns by frequency, domain distribution
  - Error frequency analysis
- **Performance Metrics**: Pipeline execution time (55-95ms), file/line/test counts

### Interactive Editing Panel
- **Recent Edits Notification**: Appears above chat input when file edits are applied
  - Bordered panel with primary color accent (bg-primary/5, border-primary/20)
  - Header: Pencil icon + "Files changed" label in primary color
  - Per-file row: Icon (color-coded by edit type) + monospace file path + description
  - Edit type icons: FilePlus (green, new file), FileCode (blue, modified), FileX (red, deleted)
  - Auto-dismisses after 10 seconds
- **Editing Mode Status**: Bottom status bar shows "Interactive editing" with Pencil icon when in editing phase
- **Contextual Input**: Chat input placeholder changes to "Describe what you'd like to change..." in editing/complete phases with existing files
- **Error-to-Chat Flow**: Preview panel errors route through chat for conversational fixing via handleRequestFix callback
- **Edit History Persistence**: Edit history stored as `editHistory` jsonb column in conversations table, tracking last 50 edits with user message and file changes per entry
- **Smart File Targeting**: Edit engine scans user messages for page/component names (e.g., "dashboard" targets src/pages/dashboard.tsx) for precise file targeting
- **Compound Color Resolution**: 36 color variants supported via COMPOUND_COLOR_MAP — dark blue, navy, light green, coral, teal, maroon, etc. resolveColor() handles multi-word color names and maps to Tailwind shade classes

### Feature Cards (Marketing Page)
- **Grid Layout**: 3-column on desktop, stack on mobile
- **Icons**: Developer-focused (code brackets, lightning bolt, shield)
- Features: "16-Stage AI Pipeline", "394 Built-in Templates", "Fully Offline Mode", "94/100 Quality Score", "No API Keys Required"

### CTAs
- **Primary**: High contrast, medium size (px-6 py-3)
- **Secondary**: Outline style
- Text: "Start Coding Free" / "Try Now" / "Get Started" / "Run Locally"

## Page Structure

### Landing Page
1. **Hero Section** (70vh):
   - Bold headline: "AI-Powered Code Generation, Completely Free"
   - Subheading: "Dual intelligence: 13 cloud AI modules + fully offline local engine with 394 templates"
   - Dual CTAs: Primary "Start Coding" + Secondary "View Demo"
   - Animated pipeline visualization showing the 16-stage process

2. **Dual Engine Feature Section** (2-column):
   - Left: Cloud Pipeline — 13 AI modules, GPT-4o integration, deep semantic analysis
   - Right: Local Engine — Fully offline, 394 templates, 55ms execution, zero API keys

3. **Features Grid** (3-column):
   - Pipeline Orchestrator, Deep Understanding, Domain Intelligence, Architecture Planning, Schema Design, Code Quality Analysis, Template Library, Learning Engine

4. **Interactive Demo Section**:
   - Live code editor preview showing AI in action
   - Side-by-side before/after code examples
   - Pipeline execution replay with stage-by-stage output

5. **Pipeline Visualization**:
   - Visual flow showing all 16 stages from Intent Interpreter to Learning Brain
   - Quality metrics and grade display
   - Template integration indicators per stage

6. **How It Works** (3-step process with visuals):
   - Describe → Plan → Generate (with pipeline detail)
   - Shows both cloud and local execution paths

7. **Tech Stack Display**: Logo grid of supported languages/frameworks

8. **CTA Section**: 
   - "Ready to Code Smarter?"
   - Email signup + Quick start button
   - Trust indicators: "No credit card - No API keys - Runs offline - Open source"

### Application Interface
- **Dashboard**: Recent chats, quick templates, documentation links, local AI stats
- **Chat View**: Full-screen conversation with embedded code + pipeline progress
- **Editor View**: Split code editor + AI assistant panel + quality report
- **Pipeline View**: Full 16-stage pipeline visualization with per-stage detail
- **Template Browser**: Searchable template library with category filtering
- **Settings**: API configuration, engine selection (cloud/local), preferences, export options

## Generated Application Design Patterns

### Dashboard Pages
- KPI cards with semantic type detection (currency, percentage, count, trend)
- Domain-aware chart selection (line, bar, pie, area based on data type)
- Recent activity feed with entity-specific icons
- Quick action buttons with contextual options

### List Pages
- Data table with column sorting, filtering, pagination
- Create dialog with smart form fields (input types inferred from field semantics)
- Status filter dropdowns with color-coded badges
- Bulk action toolbar (select all, delete, export)

### Detail Pages
- Entity information card with field grouping
- Related entity sections with linked navigation
- Edit/delete actions with confirmation dialogs
- Activity timeline for audit trail

### UI Pattern Pages (Auto-Selected)
- **Kanban**: For status-driven entities (tasks, tickets, deals)
- **Calendar**: For date-driven entities (events, appointments, bookings)
- **Card Grid**: For visual entities (products, listings, portfolios)
- **Table**: Default fallback with view toggle

## Images

**Hero Image**: YES - Dynamic visualization
- Animated pipeline stage visualization showing AI modules at work
- OR: Abstract technical illustration (dual engines + code symbols)
- Placement: Right side of hero split, 50% width on desktop

**Feature Icons**: Custom technical icons for each AI module, local AI subsystem, and template category

**Demo Screenshots**: 3-4 actual interface screenshots showing:
1. Pipeline orchestrator in action (16-stage progress)
2. Generated application with quality grade
3. Code editor with AI-generated project
4. Local AI pipeline dashboard with template browser

## Key Interactions
- **Minimal animations**: Smooth transitions only for state changes
- **Instant feedback**: Typing indicators, loading states, pipeline progress
- **Keyboard shortcuts**: Developer-friendly navigation
- **Responsive code blocks**: Horizontal scroll, line wrapping toggle
- **Pipeline progress**: Real-time stage completion indicators during generation
- **Engine toggle**: Smooth switching between cloud and local AI engines

## Accessibility
- High contrast ratios throughout
- Keyboard navigation for all functions
- Screen reader optimized code blocks with proper aria labels
- Focus indicators on all interactive elements
- ARIA live regions for pipeline stage updates during generation
- Skip-to-content links
- Landmark roles for all major sections

## Design Inspiration
Draw from: GitHub's clean interface + Linear's modern aesthetic + VS Code's functional layout + Vercel's marketing polish

**Final Note**: Prioritize speed and clarity. Every element serves the developer's workflow — no decorative bloat. The 16-stage pipeline should feel fast and transparent, not overwhelming. The local AI engine should feel instant (55-95ms) and self-contained.
