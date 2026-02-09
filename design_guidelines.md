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
- **Code Blocks**: Syntax-highlighted with copy button, language label
- **Thinking Steps**: Expandable pipeline visualization showing 16-stage orchestrator progress
  - Each stage displays: role name, status (running/complete/failed), quality score
  - Collapsible detail sections for each AI module's output
- **Pipeline Summary**: Quality score badge, file/line/component/endpoint counts, duration

### Code Editor Integration
- **Monaco Editor-style**: Professional code editing with line numbers
- **Toolbar**: File tabs, language selector, run button
- **Output Panel**: Collapsible console for execution results

### Intelligence Panel
- **Module Status**: Real-time display of active AI modules
- **Quality Report**: Code quality grade (A+ through F) with per-category breakdown
- **Architecture Summary**: Detected app pattern, folder structure, state management choices
- **Design System Preview**: Generated color palette and typography preview

### Feature Cards (Marketing Page)
- **Grid Layout**: 3-column on desktop, stack on mobile
- **Icons**: Developer-focused (code brackets, lightning bolt, shield)
- Features: "16-Stage AI Pipeline", "13 Intelligence Modules", "99% Quality Score", "No Credit Card Required"

### CTAs
- **Primary**: High contrast, medium size (px-6 py-3)
- **Secondary**: Outline style
- Text: "Start Coding Free" / "Try Now" / "Get Started"

## Page Structure

### Landing Page
1. **Hero Section** (70vh):
   - Bold headline: "AI-Powered Code Generation, Completely Free"
   - Subheading: "16 specialized AI modules work as your development team"
   - Dual CTAs: Primary "Start Coding" + Secondary "View Demo"
   - Animated pipeline visualization showing the 16-stage process

2. **Features Grid** (3-column):
   - Pipeline Orchestrator, Deep Understanding, Domain Intelligence, Architecture Planning, Schema Design, Code Quality Analysis

3. **Interactive Demo Section**:
   - Live code editor preview showing AI in action
   - Side-by-side before/after code examples

4. **Pipeline Visualization**:
   - Visual flow showing all 16 stages from Product Manager to Knowledge Manager
   - Quality metrics and grade display

5. **How It Works** (3-step process with visuals):
   - Describe → Plan → Generate (with pipeline detail)

6. **Tech Stack Display**: Logo grid of supported languages/frameworks

7. **CTA Section**: 
   - "Ready to Code Smarter?"
   - Email signup + Quick start button
   - Trust indicators: "No credit card - No limits - Open source"

### Application Interface
- **Dashboard**: Recent chats, quick templates, documentation links
- **Chat View**: Full-screen conversation with embedded code + pipeline progress
- **Editor View**: Split code editor + AI assistant panel + quality report
- **Settings**: API configuration, preferences, export options

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
- OR: Abstract technical illustration (neural network + code symbols)
- Placement: Right side of hero split, 50% width on desktop

**Feature Icons**: Custom technical icons for each AI module and feature

**Demo Screenshots**: 2-3 actual interface screenshots showing:
1. Pipeline orchestrator in action (16-stage progress)
2. Generated application with quality grade
3. Code editor with AI-generated project

## Key Interactions
- **Minimal animations**: Smooth transitions only for state changes
- **Instant feedback**: Typing indicators, loading states, pipeline progress
- **Keyboard shortcuts**: Developer-friendly navigation
- **Responsive code blocks**: Horizontal scroll, line wrapping toggle
- **Pipeline progress**: Real-time stage completion indicators during generation

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

**Final Note**: Prioritize speed and clarity. Every element serves the developer's workflow — no decorative bloat. The 16-stage pipeline should feel fast and transparent, not overwhelming.
