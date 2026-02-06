# AutoCoder Electron: User's Guide

## Welcome to AutoCoder

AutoCoder is an AI-powered code generation assistant that creates production-ready applications from natural language descriptions. The Electron desktop version provides the full experience without browser limitations.

---

## Table of Contents

1. [Getting Started](#1-getting-started)
2. [Understanding the Interface](#2-understanding-the-interface)
3. [Creating Your First Project](#3-creating-your-first-project)
4. [How AutoCoder Generates Your Project](#4-how-autocoder-generates-your-project)
5. [Example Prompts by Category](#5-example-prompts-by-category)
6. [What Gets Generated: Full Example Walkthrough](#6-what-gets-generated-full-example-walkthrough)
7. [Understanding the Preview](#7-understanding-the-preview)
8. [Working with Generated Code](#8-working-with-generated-code)
9. [Exporting Your Project](#9-exporting-your-project)
10. [Managing Projects](#10-managing-projects)
11. [Pro Tips for Better Results](#11-pro-tips-for-better-results)
12. [Common Tasks](#12-common-tasks)
13. [Frequently Asked Questions](#13-frequently-asked-questions)

---

## 1. Getting Started

### Starting the Application

1. **Launch AutoCoder**
   - Double-click the AutoCoder icon on your desktop
   - Or find it in your Applications/Programs folder

2. **Wait for initialization**
   - The splash screen appears briefly
   - The main interface loads

3. **You're ready!**
   - The chat interface is ready for your first request

### What You'll See

When AutoCoder opens, you'll see:

```
┌────────────────────────────────────────────────────────────────┐
│  AutoCoder                                              ─ □ ✕  │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌──────────────────────┐  ┌────────────────────────────────┐ │
│  │                      │  │                                │ │
│  │    Chat History      │  │       Preview Panel            │ │
│  │                      │  │                                │ │
│  │  - Your messages     │  │    - Live preview of code     │ │
│  │  - AI responses      │  │    - Generated files          │ │
│  │  - Code outputs      │  │    - Running applications     │ │
│  │                      │  │                                │ │
│  └──────────────────────┘  └────────────────────────────────┘ │
│                                                                │
│  ┌────────────────────────────────────────────────────────────┐│
│  │ Type your request here...                         [Run]   ││
│  └────────────────────────────────────────────────────────────┘│
└────────────────────────────────────────────────────────────────┘
```

---

## 2. Understanding the Interface

### The Chat Panel (Left Side)

This is where you communicate with AutoCoder:

- **Your messages** appear with your avatar
- **AI responses** appear with the AutoCoder icon
- **Code blocks** are syntax-highlighted
- **Scroll up** to see previous conversations

### The Preview Panel (Right Side)

This shows your generated code and running applications:

- **Preview tab**: Live view of your running application
- **Code tab**: View and copy generated code files
- **Console tab**: See build output and logs

### The Input Bar (Bottom)

Type your requests here:

- **Text field**: Describe what you want to build
- **Run button**: Execute the generation
- **Attach**: Add files or images (if applicable)

---

## 3. Creating Your First Project

### Step 1: Describe What You Want

In the text field, type a description of what you want to build. Be specific:

**Good examples:**
- "Create a todo list app with React that saves to local storage"
- "Build a landing page for a coffee shop with menu and contact form"
- "Make a simple calculator with addition, subtraction, multiplication, and division"

**Less effective examples:**
- "Make an app" (too vague)
- "Build something cool" (not specific)

### Step 2: Click Run

Press the **Run** button or hit Enter. AutoCoder will:

1. **Analyze your request** (1-2 seconds)
2. **Generate the code** (2-5 seconds)
3. **Display the files** in the code tab

### Step 3: Preview Your Application

**Web Mode (Replit):**
AutoCoder uses LiveCodeRunner for instant browser-based preview:
1. **Generates React JSX files** (15-20 files per project)
2. **Transpiles with Babel** in the browser (no npm install needed)
3. **Shows instant preview** in the Preview tab

**Electron Desktop Mode:**
AutoCoder writes files to your local system:
1. **Write files** to `~/AutoCoder/projects/`
2. **Install dependencies** (real npm install)
3. **Start the development server**
4. **Show the preview** in the Preview tab

### Step 4: Iterate and Improve

After seeing the preview, you can request changes:

- "Make the header larger"
- "Add a dark mode toggle"
- "Change the color scheme to blue"

---

## 4. How AutoCoder Generates Your Project

Understanding what happens behind the scenes helps you write better prompts and get better results. Here is the full journey from your typed description to a live preview.

### Step 1: The Pro Generator Analyzes Your Words

When you type something like "Build me an online store for selling sneakers," the Pro Generator reads your description and breaks it down into actionable parts:

- **What type of app** is this? (e-commerce, dashboard, blog, etc.)
- **What features** did the user mention? (shopping cart, search, checkout, etc.)
- **What pages** should this app have? (home, product listing, product detail, cart, etc.)
- **What components** are needed? (navbar, footer, product cards, forms, etc.)

The Pro Generator does not use AI models for this step. Instead, it uses a sophisticated pattern-matching engine with built-in knowledge of web application architecture.

### Step 2: App Type Recognition (19 Categories)

AutoCoder recognizes **19 distinct types of applications**, each with its own set of recommended pages, components, and features:

| Category | What It Detects |
|----------|----------------|
| E-commerce | Online stores, marketplaces, product catalogs |
| Dashboard | Analytics panels, admin dashboards, data views |
| Blog/CMS | Blogs, news sites, content management |
| Portfolio | Personal sites, photography, freelancer showcases |
| SaaS | Software landing pages, subscription products |
| Social | Social feeds, community forums, messaging |
| Booking | Appointment schedulers, hotel/restaurant reservations |
| Education | Learning platforms, course catalogs, quiz apps |
| Healthcare | Patient portals, appointment systems, health trackers |
| Finance | Banking dashboards, expense trackers, crypto tools |
| Real Estate | Property listings, agent profiles, virtual tours |
| Food/Restaurant | Menus, ordering systems, delivery tracking |
| Fitness | Workout trackers, gym management, nutrition logs |
| Travel | Trip planners, destination guides, itinerary builders |
| Entertainment | Streaming platforms, event listings, media galleries |
| Productivity | Task managers, note-taking apps, calendars |
| Chat/Messaging | Real-time chat, conversation lists, message threads |
| Landing Page | Marketing pages, hero sections, CTAs |
| General/Custom | Anything that doesn't fit the above categories |

Based on the detected app type, AutoCoder selects the most relevant template and customizes it for your specific request.

### Step 3: Page and Feature Selection

Once the app type is identified, the Pro Generator picks the right combination of pages and features. For example, an e-commerce app might get:

- **Pages**: Home, Product Listing, Product Detail, Shopping Cart, Checkout, Account
- **Components**: Navbar with search, Product Card, Cart Summary, Category Filter, Footer
- **Features**: Add-to-cart functionality, quantity controls, price calculations, responsive grid layout

A dashboard app would get a completely different set:

- **Pages**: Overview Dashboard, Analytics, Users, Settings
- **Components**: Stat Cards, Charts, Data Tables, Sidebar Navigation
- **Features**: Metric summaries, trend indicators, filter controls, tabbed views

### Step 4: Code Generation (15-20 JSX Files)

The Pro Generator then produces a complete project structure with **15 to 20 clean JSX files**. Every generated file follows consistent patterns:

- **Proper React component structure** with functional components and hooks
- **Tailwind CSS classes** for styling (no separate CSS files needed per component)
- **Lucide React icons** for visual elements (buttons, navigation, status indicators)
- **React Router** for page navigation
- **Realistic mock data** (product names, user profiles, sample content)
- **Responsive design** that works on desktop and mobile screen sizes

The generated code is not a rough draft. It is production-quality JSX that follows modern React best practices.

### Step 5: Code Validator (Auto-Fixes 8 Common Issues)

Before the code reaches you, it passes through a **Code Validator** that automatically detects and fixes 8 categories of common issues:

1. **Missing imports** - Adds forgotten React, Router, or icon imports
2. **Duplicate component names** - Renames conflicting exports
3. **Invalid JSX syntax** - Fixes unclosed tags, missing return statements
4. **Missing default exports** - Ensures every component file has a default export
5. **Broken route references** - Fixes links that point to non-existent pages
6. **Tailwind class conflicts** - Removes contradictory utility classes
7. **Unused variables** - Cleans up declared-but-unused imports and variables
8. **Missing key props** - Adds key attributes to list-rendered elements

This validation step means that the code you see in the preview is clean and error-free in the vast majority of cases.

### Step 6: LiveCodeRunner Renders the Preview

Finally, the generated files are handed to **LiveCodeRunner**, which renders a live, interactive preview directly in your browser:

1. All JSX files are **transpiled using Babel** in the browser (no server or build step)
2. An **embedded subset of Tailwind CSS** (~500 utility classes) provides styling
3. **Lucide icons** are resolved and rendered as inline SVGs
4. **React Router** handles navigation between pages
5. The preview appears in the **Preview tab** within seconds

The entire process from typing your description to seeing a live preview typically takes **3 to 8 seconds**.

---

## 5. Example Prompts by Category

The following are detailed prompt examples organized by application type. Use these as inspiration or copy them directly to see what AutoCoder produces.

### E-commerce

Build online stores, marketplaces, and product catalogs:

> "Build me an online store for selling handmade jewelry with product listings, shopping cart, and checkout"

> "Create an e-commerce marketplace where users can list items for sale"

> "Build a sneaker store with product grid, size selector, add-to-cart button, and order summary page"

### Dashboard

Build analytics panels, admin tools, and data-driven interfaces:

> "Build an analytics dashboard that shows sales metrics, user growth charts, and recent orders"

> "Create an admin panel for managing a restaurant with menu items, orders, and staff"

> "Build a project management dashboard with task counts, deadline calendar, and team member list"

### Blog / CMS

Build content-driven websites with articles, categories, and search:

> "Build a tech blog with article listings, individual article pages, and an about page"

> "Create a news magazine website with categories, featured articles, and search"

> "Build a recipe blog with categories like breakfast, lunch, dinner, and dessert, each with recipe cards"

### SaaS

Build software product pages, pricing tables, and application interfaces:

> "Build a SaaS landing page with hero section, feature highlights, pricing tiers, and testimonials"

> "Create a project management tool with kanban boards, task assignments, and team settings"

> "Build a CRM dashboard with contact list, deal pipeline, and activity feed"

### Social

Build social feeds, community platforms, and messaging interfaces:

> "Build a social media feed with posts, likes, comments, and user profiles"

> "Create a community forum with discussion threads and user profiles"

> "Build a photo-sharing platform with image grid, like button, and user galleries"

### Booking

Build reservation systems, appointment schedulers, and availability calendars:

> "Build a hotel booking system with room listings, calendar availability, and reservation form"

> "Create an appointment scheduler for a dental clinic"

> "Build a restaurant reservation system with table selection, date/time picker, and confirmation page"

### Portfolio

Build personal websites, creative showcases, and professional profiles:

> "Build a photography portfolio with project galleries, about page, and contact form"

> "Create a freelancer portfolio showcasing web development projects"

> "Build a graphic designer portfolio with case studies, skills section, and testimonial carousel"

### Education

Build learning platforms, course catalogs, and student tools:

> "Build an online course platform with course cards, lesson pages, and progress tracking"

> "Create a flashcard study app with deck management and quiz mode"

### Finance

Build financial tools, expense trackers, and banking interfaces:

> "Build a personal finance dashboard with income/expense charts, recent transactions, and budget goals"

> "Create a cryptocurrency portfolio tracker with live price cards and holdings summary"

### Other

Build unique applications that combine multiple patterns:

> "Build a real-time chat app with conversation list and message window"

> "Create a recipe manager with ingredient lists, cooking instructions, and meal planner"

> "Build a weather dashboard that shows current conditions, hourly forecast, and weekly outlook"

> "Create a music playlist manager with album art, song lists, and play controls"

---

## 6. What Gets Generated: Full Example Walkthrough

To understand exactly what AutoCoder produces, let's walk through a complete example. If you type:

> "Build me a todo app"

AutoCoder generates the following **16 files** that form a complete, runnable React project:

### Generated File List

```
package.json               - Project dependencies (React, Vite, Tailwind, lucide-react)
vite.config.js             - Vite build configuration
tailwind.config.js         - Tailwind CSS configuration
postcss.config.js          - PostCSS configuration
index.html                 - HTML shell with root div
src/main.jsx               - React entry point (createRoot)
src/App.jsx                - Main app with routing
src/index.css              - Global styles + Tailwind imports
src/pages/Dashboard.jsx    - Main task list view
src/pages/TaskDetail.jsx   - Individual task detail view
src/pages/Settings.jsx     - User settings page
src/components/Navbar.jsx  - Top navigation bar
src/components/Footer.jsx  - Page footer
src/components/TaskCard.jsx - Individual task card component
src/components/TaskForm.jsx - Add/edit task form
src/components/FilterPanel.jsx - Task filtering controls
```

### File-by-File Breakdown

**package.json** contains the project metadata and dependencies. AutoCoder includes React, React DOM, React Router, Vite, Tailwind CSS, PostCSS, Autoprefixer, and lucide-react as standard dependencies for every project.

**vite.config.js** sets up the Vite build tool with React plugin support. This file rarely needs modification.

**tailwind.config.js** configures Tailwind to scan all JSX files in the `src/` directory for class names. It includes sensible default theme extensions.

**postcss.config.js** connects Tailwind CSS and Autoprefixer to the build pipeline.

**index.html** is the HTML shell that contains a single `<div id="root"></div>` where React mounts the application.

**src/main.jsx** is the React entry point. It imports the App component and renders it into the root div using `createRoot`.

**src/App.jsx** is the main application component. It sets up React Router with routes for each page (Dashboard, TaskDetail, Settings) and wraps the app in a layout with Navbar and Footer.

**src/index.css** contains the Tailwind CSS directives (`@tailwind base`, `@tailwind components`, `@tailwind utilities`) plus any global custom styles.

**src/pages/Dashboard.jsx** is the main view. For a todo app, this shows the task list with filtering options, an add-task form, and task cards. It manages state for tasks using React's `useState` hook and includes sample tasks as initial data.

**src/pages/TaskDetail.jsx** displays a single task's full details including title, description, due date, priority, and status. It receives the task ID from the URL via React Router's `useParams`.

**src/pages/Settings.jsx** provides user preferences like theme selection, notification preferences, and default task settings.

**src/components/Navbar.jsx** renders the top navigation bar with the app name, navigation links (Dashboard, Settings), and optional action buttons like "Add Task."

**src/components/Footer.jsx** renders the page footer with copyright text and links.

**src/components/TaskCard.jsx** is a reusable card component that displays a single task's summary: title, due date, priority badge, and status checkbox. It accepts props and emits events for toggle and delete actions.

**src/components/TaskForm.jsx** is a form component for creating and editing tasks. It includes input fields for title, description, due date, and priority with form validation.

**src/components/FilterPanel.jsx** provides controls for filtering the task list by status (all, active, completed), priority (high, medium, low), and search text.

### How the Files Connect

```
index.html
  └── src/main.jsx
        └── src/App.jsx (routing)
              ├── src/components/Navbar.jsx
              ├── src/pages/Dashboard.jsx
              │     ├── src/components/TaskForm.jsx
              │     ├── src/components/FilterPanel.jsx
              │     └── src/components/TaskCard.jsx
              ├── src/pages/TaskDetail.jsx
              ├── src/pages/Settings.jsx
              └── src/components/Footer.jsx
```

This structure follows React conventions: pages represent full-screen views mapped to URL routes, and components are reusable building blocks used across pages.

---

## 7. Understanding the Preview

### How the Preview Works

The preview panel shows a **live, interactive version** of your generated application. Here is what you need to know about how it works and what to expect.

### Runs Entirely in Your Browser

The preview does **not** require a server, a build step, or an internet connection (after initial load). Everything happens in the browser:

- JSX files are transpiled to JavaScript using **Babel** running in a Web Worker
- CSS is injected into the preview iframe
- React components mount and render just like they would in a real application

This means the preview appears in **seconds**, not minutes. There is no waiting for `npm install` or a dev server to start.

### Embedded Tailwind CSS

The preview includes an **embedded subset of approximately 500 Tailwind CSS utility classes**. This covers the most commonly used classes:

- **Layout**: flex, grid, block, hidden, w-full, h-screen, p-4, m-2, gap-4
- **Typography**: text-sm, text-lg, text-xl, font-bold, font-medium, text-center
- **Colors**: text-gray-600, bg-white, bg-blue-500, border-gray-200, and common color scales
- **Spacing**: All standard padding (p-), margin (m-), and gap values
- **Borders**: rounded, rounded-lg, border, border-2, shadow, shadow-lg
- **Responsive**: sm:, md:, lg: prefixes for responsive breakpoints
- **Interactive**: hover:, focus:, active: state variants

If a generated file uses an uncommon Tailwind class not in the embedded subset, that specific style may not render in the preview. The full Tailwind build (available after export) will include all classes.

### What Works in the Preview

- **Buttons and click handlers**: onClick events fire correctly
- **Forms and inputs**: Text fields, checkboxes, selects, and textareas accept input
- **State management**: useState, useEffect, and other React hooks work normally
- **Page navigation**: React Router links navigate between pages within the preview
- **Conditional rendering**: Show/hide elements, toggle states, and dynamic lists
- **Lucide icons**: Icons from the lucide-react library render as inline SVGs
- **Responsive layout**: Resize the preview panel to test different screen widths
- **Sample data**: Generated mock data (products, users, posts) displays realistically

### What Does Not Work in the Preview

- **Real API calls**: Fetch requests to external APIs will not succeed (no CORS, no server)
- **Database operations**: No real database is connected in the preview
- **Authentication**: Login/signup flows are visual only (no real auth provider)
- **File uploads**: File input elements render but cannot process real uploads
- **WebSocket connections**: Real-time features are simulated with mock data
- **Third-party scripts**: External JavaScript libraries not bundled in the preview are unavailable

### The Preview is Read-Only

You cannot edit files directly in the preview panel. The preview is a rendering of the generated code. To make changes:

1. Ask AutoCoder to modify the code (e.g., "Change the header color to blue")
2. AutoCoder regenerates the relevant files
3. The preview updates automatically with the new code

---

## 8. Working with Generated Code

### Where Are My Files?

All projects are saved to:

```
Your Home Folder/AutoCoder/projects/
```

For example:
- **Windows**: `C:\Users\YourName\AutoCoder\projects\`
- **macOS**: `/Users/YourName/AutoCoder/projects/`
- **Linux**: `/home/yourname/AutoCoder/projects/`

### Opening in Your Code Editor

1. **Find the project folder** (location shown above)
2. **Open with your favorite editor:**
   - VS Code: `code ~/AutoCoder/projects/my-project`
   - Or drag the folder onto your editor

### Understanding the Generated Structure

A typical React project:

```
my-react-app/
├── package.json          # Project configuration
├── vite.config.js        # Build tool configuration
├── tailwind.config.js    # Tailwind CSS configuration
├── postcss.config.js     # PostCSS plugins
├── index.html            # HTML entry point
├── src/
│   ├── main.jsx          # React entry point
│   ├── App.jsx           # Main app with routing
│   ├── index.css         # Global styles
│   ├── pages/            # Full-screen page components
│   │   ├── Dashboard.jsx
│   │   ├── Settings.jsx
│   │   └── ...
│   └── components/       # Reusable UI components
│       ├── Navbar.jsx
│       ├── Footer.jsx
│       └── ...
└── node_modules/         # Installed packages (after npm install)
```

### Making Manual Changes

You can edit the generated code:

1. Open the file in your editor
2. Make your changes
3. Save the file
4. The preview will update (if dev server is running)

---

## 9. Exporting Your Project

AutoCoder provides several ways to get your generated code out of the application and into your own workflow.

### Download as ZIP

The simplest export option. Click the **Download ZIP** button to get a `.zip` file containing every generated file:

- All source files (`src/`, `index.html`, config files)
- A ready-to-use `package.json` with all dependencies listed
- No `node_modules` folder (keeps the download small)

After downloading, extract the ZIP and you have a complete project ready for development.

### Push to GitHub

AutoCoder can automatically push your generated code to a GitHub repository:

1. Click the **Push to GitHub** button
2. Authorize AutoCoder to access your GitHub account (first time only)
3. Choose to create a new repository or update an existing one
4. AutoCoder commits all generated files with a descriptive commit message

This is the fastest way to share your project, deploy with services like Vercel or Netlify, or start collaborating with other developers.

### Local Development Setup

After downloading or cloning your project, set it up for full local development:

```bash
# Navigate to your project folder
cd my-project

# Install all dependencies
npm install

# Start the development server
npm run dev
```

The development server starts on `http://localhost:5173` (Vite's default port) with:
- **Hot module replacement (HMR)**: Changes appear instantly without page refresh
- **Full Tailwind CSS**: All utility classes available (not just the preview subset)
- **Source maps**: Debug your code with browser DevTools
- **Fast builds**: Vite's optimized build pipeline

### Electron Desktop Mode

When running AutoCoder as an Electron desktop application, you get additional capabilities:

- **Native file system access**: Files are written directly to your disk
- **Real npm install**: Dependencies are installed locally with full Node.js
- **Live dev server**: A real Vite dev server runs with full HMR support
- **No browser limitations**: Full access to Node.js APIs and file system

In Electron mode, your projects are fully functional local applications, not browser-sandboxed previews.

---

## 10. Managing Projects

### Viewing All Projects

AutoCoder keeps all your projects organized:

```
~/AutoCoder/projects/
├── todo-app/
├── landing-page/
├── calculator/
└── ... more projects
```

### Deleting Projects

To remove a project you no longer need:

1. Navigate to `~/AutoCoder/projects/`
2. Delete the project folder

Or use your operating system's file manager.

### Reopening a Project

To continue working on an existing project:

1. In AutoCoder, reference the project name: "Continue working on my todo-app"
2. Or open the folder directly in your code editor

---

## 11. Pro Tips for Better Results

These tips will help you get the most out of AutoCoder's code generation capabilities.

### Be Specific About Features

The more features you describe, the more complete your generated app will be.

| Vague prompt | Specific prompt |
|--------------|----------------|
| "Build an app" | "Build a task management app with drag-and-drop kanban board, due date tracking, and priority labels" |
| "Make a store" | "Build an online store with product grid, search bar, category filters, shopping cart, and checkout form" |
| "Create a website" | "Create a portfolio website with hero section, project gallery with filtering, skills timeline, and contact form" |

Adding phrases like "with search functionality and category filters" or "with a sidebar navigation and data tables" gives the generator concrete features to build.

### Mention Your Industry

Telling AutoCoder the industry or business context helps it generate **relevant content, terminology, and mock data**:

- "for a restaurant" generates menu items, table layouts, and reservation forms
- "for a photography business" generates portfolio galleries, booking calendars, and client testimonials
- "for a law firm" generates service pages, attorney profiles, and consultation request forms
- "for a fitness studio" generates class schedules, trainer profiles, and membership plans

The generated sample data (product names, user profiles, article content) will match your industry context.

### Specify Pages You Want

Listing specific pages gives AutoCoder a clear structure to follow:

> "Build a marketing website with home, about, services, pricing, team, and contact pages"

> "Create a dashboard with overview, analytics, users, settings, and profile pages"

> "Build a blog with home, articles, categories, about, and newsletter signup pages"

Without specific pages, AutoCoder makes reasonable guesses based on the app type. With specific pages, you get exactly what you asked for.

### Ask for Sample Data

Generated apps with realistic data look and feel much more polished:

> "Build a product catalog with 12 sample products including names, prices, descriptions, and categories"

> "Create a user dashboard with sample user data, activity history, and notification list"

> "Build a blog with 6 sample articles including titles, excerpts, author names, and dates"

AutoCoder generates contextually appropriate mock data: realistic product names, plausible prices, professional-sounding article titles, and diverse user names.

### Iterate in Steps

Start with a basic version, then build on it:

1. **First prompt**: "Build a basic e-commerce store with product listings"
2. **Second prompt**: "Add a shopping cart with quantity controls and total calculation"
3. **Third prompt**: "Add a checkout page with a shipping form and order summary"
4. **Fourth prompt**: "Add a search bar to the product listing page"

Each iteration refines and extends the previous version. This produces better results than trying to describe every feature in a single long prompt.

### Use Layout and Design Keywords

AutoCoder responds well to layout and design instructions:

- "with a sidebar navigation" vs. "with a top navbar"
- "in a card grid layout" vs. "in a table view"
- "with a dark theme" vs. "with a light, minimal design"
- "with a hero image and call-to-action button"
- "responsive for mobile and desktop"

### Mention Specific Components

If you know the UI components you want, name them:

- "with a modal dialog for editing items"
- "with an accordion FAQ section"
- "with a carousel for testimonials"
- "with a progress bar showing completion"
- "with tabs for switching between views"
- "with a dropdown menu for user actions"

---

## 12. Common Tasks

### Creating a React App

```
"Create a React app with [feature] that [does something]"

Examples:
- "Create a React app with a shopping cart that calculates totals"
- "Create a React app with a photo gallery that supports zooming"
```

### Building a Landing Page

```
"Build a landing page for [business type] with [sections]"

Examples:
- "Build a landing page for a bakery with hero, menu, location, and contact"
- "Build a landing page for a SaaS product with features, pricing, and testimonials"
```

### Adding Features

```
"Add [feature] to [location/component]"

Examples:
- "Add a search bar to the navigation"
- "Add animation when cards appear on screen"
```

### Fixing Issues

```
"Fix the [problem] in [location]"

Examples:
- "Fix the alignment of the footer links"
- "Fix the form not submitting correctly"
```

### Changing Styles

```
"Change the [element] to [new style]"

Examples:
- "Change the button color to green"
- "Change the font to something more modern"
```

---

## 13. Frequently Asked Questions

### "Can I use the generated code for commercial projects?"

Yes! The code generated by AutoCoder is yours to use however you want, including commercial projects.

### "Do I need to know how to code?"

Basic familiarity with web development concepts helps, but AutoCoder is designed to be accessible. You can learn as you go by examining the generated code.

### "Why is npm install taking so long?"

The first install downloads many packages. Subsequent installs are faster because packages are cached. Typical times:
- First install: 30-60 seconds
- Repeated installs: 5-15 seconds

### "Where can I find the preview URL?"

When the development server starts, AutoCoder shows the URL in the console tab. It's typically `http://localhost:5200` or similar.

### "How do I stop the development server?"

Close the Electron window or the terminal running the dev server. You can also use the stop button if available in the interface.

### "Can I work offline?"

Yes! Once you've installed the app and downloaded any needed packages, code generation works offline. However, npm install requires internet access.

### "How do I update AutoCoder?"

Download the latest version from the releases page and install it. Your projects in `~/AutoCoder/projects/` will be preserved.

### "The preview isn't showing my app"

Check the console tab for errors. Common issues:
- npm install hasn't completed yet
- There's a syntax error in generated code
- The development server crashed

Try asking: "Fix the errors in the code"

### "Can I customize the generated code style?"

Yes! Tell AutoCoder your preferences:
- "Use functional components with hooks"
- "Follow Airbnb ESLint rules"
- "Use CSS modules instead of inline styles"

### "How many files does AutoCoder generate?"

A typical project includes 15 to 20 files: configuration files (package.json, vite.config.js, tailwind.config.js, postcss.config.js), entry points (index.html, main.jsx, App.jsx, index.css), 3 to 5 page components, and 4 to 8 reusable UI components.

### "What technologies does the generated code use?"

Every generated project uses: React (UI framework), Vite (build tool), Tailwind CSS (styling), React Router (navigation), and lucide-react (icons). These are modern, widely-adopted tools with strong community support.

### "Can I add a backend to the generated project?"

The generated frontend code is designed to work with any backend. You can add Express, Fastify, or any Node.js server. The mock data in the generated code can be replaced with real API calls to your backend.

---

## Getting Help

If you encounter issues:

1. **Check the console tab** for error messages
2. **Ask AutoCoder** to explain or fix issues
3. **Restart the application** if something seems stuck
4. **Check the Problems and Solutions document** for common fixes

---

## Keyboard Shortcuts

| Action | Windows/Linux | macOS |
|--------|--------------|-------|
| Send message | Enter | Enter |
| New line | Shift+Enter | Shift+Enter |
| Reload | Ctrl+R | Cmd+R |
| Developer Tools | Ctrl+Shift+I | Cmd+Option+I |
| Quit | Alt+F4 | Cmd+Q |

---

Happy coding with AutoCoder!
