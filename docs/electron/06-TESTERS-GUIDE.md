# AutoCoder Electron: Tester's Guide

## Introduction

This guide is for QA testers who need to verify the AutoCoder Electron application. It covers test setup, test cases, expected behaviors, and how to report issues effectively.

---

## Table of Contents

1. [Test Environment Setup](#1-test-environment-setup)
2. [Test Categories](#2-test-categories)
3. [Functional Test Cases](#3-functional-test-cases)
4. [Integration Test Cases](#4-integration-test-cases)
5. [Performance Test Cases](#5-performance-test-cases)
6. [Cross-Platform Test Cases](#6-cross-platform-test-cases)
7. [Edge Cases and Stress Tests](#7-edge-cases-and-stress-tests)
8. [Bug Reporting Template](#8-bug-reporting-template)
9. [Test Automation Guidelines](#9-test-automation-guidelines)
10. [Regression Test Checklist](#10-regression-test-checklist)
11. [LiveCodeRunner Test Suite](#11-livecoderunner-test-suite)
12. [Plan-Driven Pipeline Test Suite](#12-plan-driven-pipeline-test-suite)
13. [Pro Generator Validation Test Suite (Fallback)](#13-pro-generator-validation-test-suite-fallback)
14. [Code Validator Test Suite](#14-code-validator-test-suite)
15. [Web Mode Testing Procedures](#15-web-mode-testing-procedures)
16. [Electron Mode Testing Procedures](#16-electron-mode-testing-procedures)

---

## 1. Test Environment Setup

### Required Tools

- Node.js 18+ (for development testing)
- The packaged application (for production testing)
- Terminal/Command Prompt access
- File explorer
- Screen recording software (for bug reports)

### Setting Up for Testing

**Development Mode Testing:**
```bash
# Clone repository
git clone https://github.com/Gautam-Mathur/autocoder-.git
cd autocoder-

# Install dependencies
npm install

# Run Electron desktop app (all-in-one)
npm run electron:dev

# Or for web-only testing:
npm run dev
```

**Production Mode Testing:**
1. Install the packaged application
2. Launch from desktop/applications

### Preparing Test Data

Create test scenarios in advance:
- Simple prompts for quick testing
- Complex prompts for stress testing
- Known-issue prompts to verify fixes

---

## 2. Test Categories

### Category Overview

| Category | Priority | Scope |
|----------|----------|-------|
| Smoke Tests | P0 | Basic functionality |
| Functional Tests | P1 | Feature behavior |
| Integration Tests | P1 | Component interaction |
| Performance Tests | P2 | Speed and resources |
| Cross-Platform Tests | P2 | OS compatibility |
| Edge Cases | P3 | Unusual scenarios |

### Testing Matrix

| Feature | Windows | macOS | Linux |
|---------|---------|-------|-------|
| App Launch | ⬜ | ⬜ | ⬜ |
| Code Generation | ⬜ | ⬜ | ⬜ |
| File Writing | ⬜ | ⬜ | ⬜ |
| npm Install | ⬜ | ⬜ | ⬜ |
| Dev Server | ⬜ | ⬜ | ⬜ |
| Preview | ⬜ | ⬜ | ⬜ |
| Project Management | ⬜ | ⬜ | ⬜ |

---

## 3. Functional Test Cases

### TC-001: Application Launch

**Objective:** Verify application starts correctly

**Steps:**
1. Launch AutoCoder
2. Wait for initialization

**Expected Results:**
- [ ] Application window appears within 10 seconds
- [ ] No error dialogs shown
- [ ] Main interface is visible
- [ ] Chat input is focusable

**Pass Criteria:** All checkboxes green

---

### TC-002: Simple Code Generation

**Objective:** Verify basic code generation works

**Preconditions:** Application is running

**Steps:**
1. Type in chat: "Create a simple hello world React app"
2. Press Enter or click Run

**Expected Results:**
- [ ] AI response appears within 5 seconds
- [ ] Code blocks are displayed
- [ ] Files include: package.json, App.tsx, main.tsx

**Pass Criteria:** All files generated correctly

---

### TC-003: File Writing

**Objective:** Verify files are written to disk

**Preconditions:** Code generation completed (TC-002)

**Steps:**
1. Navigate to `~/AutoCoder/projects/`
2. Find the generated project folder
3. Inspect files

**Expected Results:**
- [ ] Project folder exists
- [ ] package.json content matches generated code
- [ ] src/ folder contains correct files
- [ ] File permissions allow read/write

**Verification:**
```bash
cat ~/AutoCoder/projects/hello-world-react/package.json
```

---

### TC-004: npm Install

**Objective:** Verify npm install completes successfully

**Preconditions:** Files written (TC-003)

**Steps:**
1. Trigger "Run" on the generated project
2. Observe console output

**Expected Results:**
- [ ] "Running npm install..." message appears
- [ ] Progress messages stream to console
- [ ] node_modules folder is created
- [ ] "npm install completed" message shows
- [ ] No error messages

**Verification:**
```bash
ls ~/AutoCoder/projects/hello-world-react/node_modules/
# Should list many packages
```

---

### TC-005: Development Server Start

**Objective:** Verify dev server starts and URL is detected

**Preconditions:** npm install completed (TC-004)

**Steps:**
1. Wait for dev server to start automatically
2. Observe console output

**Expected Results:**
- [ ] "Starting dev server..." message appears
- [ ] Server URL is detected (e.g., localhost:5200)
- [ ] "Dev server ready" message shows
- [ ] No crash or error messages

---

### TC-006: Preview Display

**Objective:** Verify preview shows running application

**Preconditions:** Dev server running (TC-005)

**Steps:**
1. Switch to Preview tab
2. Observe the preview panel

**Expected Results:**
- [ ] Preview loads within 5 seconds
- [ ] Application content is visible
- [ ] No blank/white screen
- [ ] Interactive elements work (if applicable)

---

### TC-007: Iterative Changes

**Objective:** Verify follow-up requests work

**Preconditions:** Initial project created

**Steps:**
1. Type: "Add a blue header with the title 'My App'"
2. Press Enter

**Expected Results:**
- [ ] New code is generated
- [ ] Changes are applied to project
- [ ] Preview updates with new content
- [ ] Original functionality preserved

---

### TC-008: Project List

**Objective:** Verify multiple projects are tracked

**Preconditions:** At least 2 projects created

**Steps:**
1. Check project directory

**Expected Results:**
- [ ] All created projects are listed
- [ ] Each project has complete file structure
- [ ] Projects are isolated (no cross-contamination)

---

### TC-009: Project Deletion

**Objective:** Verify projects can be deleted

**Preconditions:** At least 1 project exists

**Steps:**
1. Delete a project folder manually
2. Or use delete function if available

**Expected Results:**
- [ ] Project folder is removed
- [ ] No orphaned files remain
- [ ] Application handles missing project gracefully

---

### TC-010: Complex Code Generation

**Objective:** Verify complex requests work

**Steps:**
1. Type: "Create a React dashboard with a sidebar navigation, header with user avatar, main content area with cards showing statistics, and a footer with copyright"
2. Press Enter

**Expected Results:**
- [ ] All requested components generated
- [ ] Proper component structure
- [ ] Styling is applied
- [ ] Application runs without errors

---

## 4. Integration Test Cases

### TC-I01: IPC Communication

**Objective:** Verify main-renderer communication

**Steps:**
1. Generate code
2. Monitor for file write confirmations
3. Check console for IPC messages

**Expected Results:**
- [ ] IPC messages are logged (in dev mode)
- [ ] No IPC timeout errors
- [ ] Responses are properly received

---

### TC-I02: Event Streaming

**Objective:** Verify real-time log streaming

**Steps:**
1. Run npm install
2. Observe console output

**Expected Results:**
- [ ] Logs appear in real-time
- [ ] No messages are lost
- [ ] Formatting is preserved
- [ ] No memory buildup from listeners

---

### TC-I03: Process Management

**Objective:** Verify child processes are managed correctly

**Steps:**
1. Start a dev server
2. Generate a new project (starts another server)
3. Close the application

**Expected Results:**
- [ ] Previous server is stopped before new one starts
- [ ] No orphan processes remain after close
- [ ] Port is released for reuse

**Verification:**
```bash
# After closing app
lsof -i :5200  # Should show no process
```

---

## 5. Performance Test Cases

### TC-P01: Startup Time

**Objective:** Measure application startup time

**Steps:**
1. Time from click to usable interface

**Acceptance Criteria:**
- Cold start: < 10 seconds
- Warm start: < 5 seconds

---

### TC-P02: Memory Usage

**Objective:** Monitor memory consumption

**Steps:**
1. Open Task Manager / Activity Monitor
2. Launch AutoCoder
3. Generate 5 projects
4. Monitor memory

**Acceptance Criteria:**
- Baseline: < 500MB
- After 5 projects: < 1GB
- No memory leaks (stable after operations)

---

### TC-P03: npm Install Speed

**Objective:** Measure npm install performance

**Steps:**
1. Time npm install for a project with 20 dependencies

**Acceptance Criteria:**
- First install: < 60 seconds
- Cached install: < 30 seconds

---

### TC-P04: Large Project Handling

**Objective:** Test with large projects

**Steps:**
1. Generate a project with 50+ files
2. Run all operations

**Acceptance Criteria:**
- File write: < 10 seconds
- No UI freezing
- All files written correctly

---

## 6. Cross-Platform Test Cases

### TC-X01: Windows Specific

**Test Items:**
- [ ] Path with spaces: `C:\Users\John Doe\AutoCoder\`
- [ ] Path with special chars: `C:\Users\名前\AutoCoder\`
- [ ] UAC prompts (if any)
- [ ] Antivirus interaction
- [ ] Windows Defender SmartScreen

---

### TC-X02: macOS Specific

**Test Items:**
- [ ] Gatekeeper approval
- [ ] App Sandbox behavior
- [ ] Notarization status
- [ ] M1/M2 compatibility (ARM64)
- [ ] Intel compatibility (x64)

---

### TC-X03: Linux Specific

**Test Items:**
- [ ] AppImage execution permissions
- [ ] Desktop integration
- [ ] Different desktop environments (GNOME, KDE)
- [ ] Wayland vs X11
- [ ] File permissions

---

## 7. Edge Cases and Stress Tests

### TC-E01: Empty Input

**Steps:** Submit empty message

**Expected:** Graceful handling, no crash

---

### TC-E02: Very Long Input

**Steps:** Submit 10,000 character message

**Expected:** Handled without crash, may show warning

---

### TC-E03: Special Characters

**Steps:** Input with `<script>alert('xss')</script>`

**Expected:** Escaped/sanitized, no execution

---

### TC-E04: Rapid Requests

**Steps:** Submit 10 requests in 5 seconds

**Expected:** Queued or rate-limited, no crash

---

### TC-E05: Disk Full

**Steps:** Simulate low disk space

**Expected:** Error message, no crash

---

### TC-E06: Network Loss During npm Install

**Steps:** Disconnect network mid-install

**Expected:** Error message, retry option

---

### TC-E07: Kill Process During Operation

**Steps:** Force quit during file write

**Expected:** No corrupted files, clean restart

---

### TC-E08: Concurrent Operations

**Steps:** Start npm install, then generate new code

**Expected:** Queue operations or warn user

---

## 8. Bug Reporting Template

When reporting bugs, include:

```markdown
## Bug Report

**Title:** [Brief description]

**Environment:**
- OS: [Windows 11 / macOS 14.1 / Ubuntu 22.04]
- AutoCoder Version: [1.0.0]
- Node.js Version: [20.10.0]

**Steps to Reproduce:**
1. [First step]
2. [Second step]
3. [Third step]

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happened]

**Screenshots/Recording:**
[Attach if applicable]

**Console Logs:**
```
[Paste any error messages]
```

**Severity:**
- [ ] Critical (app crash, data loss)
- [ ] High (major feature broken)
- [ ] Medium (feature partially working)
- [ ] Low (cosmetic, minor issue)

**Reproducibility:**
- [ ] Always
- [ ] Sometimes
- [ ] Rarely
```

---

## 9. Test Automation Guidelines

### Recommended Automation Stack

- **E2E Testing:** Playwright or Spectron
- **Unit Testing:** Jest
- **Visual Testing:** Percy or BackstopJS

### Areas to Automate

| Test Type | Priority | Framework |
|-----------|----------|-----------|
| Smoke tests | High | Playwright |
| File operations | High | Jest |
| IPC tests | Medium | Jest |
| Performance | Medium | Custom scripts |

### Example Playwright Test

```javascript
const { test, expect } = require('@playwright/test');

test('generates React app', async ({ page }) => {
  // Launch app via dev server
  await page.goto('http://localhost:5000');
  
  // Type request
  await page.fill('[data-testid="chat-input"]', 'Create a hello world React app');
  await page.click('[data-testid="run-button"]');
  
  // Wait for generation
  await expect(page.locator('[data-testid="code-output"]')).toBeVisible({
    timeout: 30000
  });
  
  // Verify package.json exists
  const codeContent = await page.locator('[data-testid="code-output"]').textContent();
  expect(codeContent).toContain('package.json');
});
```

---

## 10. Regression Test Checklist

Run before each release:

### Critical Path (P0)
- [ ] Application launches
- [ ] Chat accepts input
- [ ] Code generation works
- [ ] Files are written
- [ ] npm install completes
- [ ] Dev server starts
- [ ] Preview loads

### Core Features (P1)
- [ ] Multiple projects work
- [ ] Iterative changes apply
- [ ] Error messages display
- [ ] Logs stream correctly
- [ ] Project cleanup works

### Extended Features (P2)
- [ ] Large projects handle
- [ ] Edge cases pass
- [ ] Performance acceptable
- [ ] All platforms work

### Sign-off

| Tester | Date | Platform | Version | Result |
|--------|------|----------|---------|--------|
| | | | | Pass / Fail |

---

## 11. LiveCodeRunner Test Suite

The LiveCodeRunner component (`client/src/components/live-code-runner.tsx`) renders generated code in a sandboxed iframe using Babel transpilation, import mocking, and blob URLs. These tests verify its core behaviors.

---

### TC-LCR-001: Basic React Rendering

**Objective:** Verify a single functional component renders correctly in the iframe preview.

**Input:**
```jsx
// src/App.jsx
import React from 'react';

export default function App() {
  return (
    <div>
      <h1>Hello World</h1>
      <p>This is a basic React component.</p>
    </div>
  );
}
```

**Steps:**
1. Provide a single JSX file with a functional component to the LiveCodeRunner
2. Observe the iframe preview panel

**Expected Results:**
- [ ] Component renders inside the iframe
- [ ] HTML output contains `<h1>Hello World</h1>`
- [ ] No console errors in the preview iframe
- [ ] Babel transpiles JSX to valid JavaScript
- [ ] The `export default` is detected and used as the root component

**Pass Criteria:** Visible rendered output matches the component's JSX structure.

---

### TC-LCR-002: Multi-File Project

**Objective:** Verify a full project with 15-20 JSX files from the Pro Generator renders correctly.

**Input:**
- Generate an ecommerce project via Pro Generator prompt: "Build an online store with products and cart"
- Resulting files: App.jsx, Home.jsx, Products.jsx, ProductDetail.jsx, Cart.jsx, Checkout.jsx, Header.jsx, Footer.jsx, Sidebar.jsx, etc. (15-20 files total)

**Steps:**
1. Generate a full ecommerce project using Pro Generator
2. Pass all generated files to LiveCodeRunner
3. Observe the preview

**Expected Results:**
- [ ] All pages render without blank screens
- [ ] Navigation between pages works (react-router-dom mocked)
- [ ] Icons display correctly (lucide-react mocked with SVG placeholders)
- [ ] Tailwind CSS classes are applied
- [ ] No import resolution errors in the console
- [ ] Component tree is properly assembled from multiple files

**Pass Criteria:** Complete ecommerce app is navigable and visually styled.

---

### TC-LCR-003: Backend File Filtering

**Objective:** Verify that backend/server files are excluded from the preview bundle.

**Input:**
```
Files provided:
  - server/routes.js       (backend)
  - server/middleware.js    (backend)
  - src/App.jsx             (frontend)
  - src/components/Header.jsx (frontend)
  - prisma/schema.prisma    (backend)
  - tests/app.test.js       (test)
  - vite.config.js          (config)
```

**Steps:**
1. Provide a mix of frontend and backend files to LiveCodeRunner
2. Check which files are included in the transpiled bundle
3. Observe preview output

**Expected Results:**
- [ ] `server/routes.js` is excluded (matches `/server/` pattern)
- [ ] `server/middleware.js` is excluded (matches `/middleware/` pattern)
- [ ] `prisma/schema.prisma` is excluded (matches `/prisma/` pattern)
- [ ] `tests/app.test.js` is excluded (matches `/tests/` pattern)
- [ ] `vite.config.js` is excluded (config file pattern)
- [ ] Only `src/App.jsx` and `src/components/Header.jsx` are rendered
- [ ] No errors from attempting to process backend code

**Pass Criteria:** Preview shows only frontend content; backend files are silently filtered.

---

### TC-LCR-004: TypeScript Stripping

**Objective:** Verify TypeScript annotations are removed and JSX renders correctly.

**Input:**
```tsx
// src/App.tsx
import React, { useState } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
}

type ButtonVariant = 'primary' | 'secondary';

export default function App(): React.FC {
  const [users, setUsers] = useState<User[]>([]);
  const [count, setCount] = useState<number>(0);

  const handleClick = (variant: ButtonVariant): void => {
    setCount((prev: number) => prev + 1);
  };

  return (
    <div>
      <h1>Count: {count}</h1>
      <button onClick={() => handleClick('primary')}>Increment</button>
    </div>
  );
}
```

**Steps:**
1. Provide TSX files with type annotations, interfaces, and generics
2. Pass to LiveCodeRunner
3. Observe the preview

**Expected Results:**
- [ ] `interface User { ... }` block is removed entirely
- [ ] `type ButtonVariant = ...` is removed
- [ ] `: React.FC` return type annotation is stripped
- [ ] `<User[]>` generic is removed from useState
- [ ] `<number>` generic is removed from useState
- [ ] `: ButtonVariant` parameter type is stripped
- [ ] `: void` return type is stripped
- [ ] `: number` in arrow function parameter is stripped
- [ ] Resulting JavaScript is valid and runs without errors
- [ ] Counter increments when button is clicked

**Pass Criteria:** All TypeScript syntax removed; component functions correctly.

---

### TC-LCR-005: Import Mocking

**Objective:** Verify all common imports are resolved via mocks without errors.

**Input:**
```jsx
// src/App.jsx
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Home, Settings, User, ShoppingCart, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import axios from 'axios';
import { motion } from 'framer-motion';

export default function App() {
  const navigate = useNavigate();
  return (
    <BrowserRouter>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/settings">Settings</Link>
      </nav>
      <Button><Home /> Go Home</Button>
      <Card>
        <CardHeader>Title</CardHeader>
        <CardContent>Content</CardContent>
      </Card>
      <Input placeholder="Search..." />
    </BrowserRouter>
  );
}
```

**Steps:**
1. Provide code that imports from react-router-dom, lucide-react, shadcn/ui, axios, and framer-motion
2. Pass to LiveCodeRunner
3. Check for import resolution errors

**Expected Results:**
- [ ] `react-router-dom` imports resolve (BrowserRouter, Routes, Route, Link, useNavigate)
- [ ] `lucide-react` icons render as SVG placeholder elements
- [ ] `@/components/ui/button` resolves to a mock Button component
- [ ] `@/components/ui/card` resolves to mock Card components
- [ ] `@/components/ui/input` resolves to a mock Input component
- [ ] `axios` resolves without error
- [ ] `framer-motion` resolves without error
- [ ] No "Cannot find module" or "Failed to resolve import" errors
- [ ] Preview renders all mocked components visually

**Pass Criteria:** All imports resolve; no console errors related to module resolution.

---

### TC-LCR-006: Tailwind CSS Rendering

**Objective:** Verify Tailwind CSS utility classes are applied correctly in the preview.

**Input:**
```jsx
// src/App.jsx
export default function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-md p-4">
        <h1 className="text-2xl font-bold text-blue-600">My App</h1>
      </header>
      <main className="container mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-xl font-semibold">Card 1</h2>
            <p className="text-gray-600 mt-2">Description</p>
          </div>
          <div className="flex items-center justify-between p-4 bg-blue-500 text-white rounded">
            <span className="font-medium">Status</span>
            <span className="bg-blue-700 px-2 py-1 rounded text-sm">Active</span>
          </div>
        </div>
      </main>
    </div>
  );
}
```

**Steps:**
1. Provide components using common Tailwind classes: flex, grid, p-4, text-xl, bg-*, rounded, shadow, etc.
2. Pass to LiveCodeRunner
3. Inspect the iframe preview styling

**Expected Results:**
- [ ] `flex`, `grid`, `grid-cols-*` layout classes are applied
- [ ] `p-4`, `p-6`, `px-2`, `py-1` padding classes work
- [ ] `text-xl`, `text-2xl`, `text-sm` font size classes apply
- [ ] `bg-gray-100`, `bg-white`, `bg-blue-500` background colors render
- [ ] `text-blue-600`, `text-gray-600`, `text-white` text colors render
- [ ] `rounded`, `rounded-lg` border radius is visible
- [ ] `shadow`, `shadow-md` box shadows are visible
- [ ] `container`, `mx-auto` centering works
- [ ] `font-bold`, `font-semibold`, `font-medium` font weights apply

**Pass Criteria:** Visual output matches expected Tailwind styling.

---

### TC-LCR-007: Blob URL Lifecycle

**Objective:** Verify old blob URLs are properly revoked when switching projects to prevent memory leaks.

**Input:**
- Project A: Simple React app (3 files)
- Project B: Dashboard app (10 files)
- Project C: Ecommerce app (18 files)

**Steps:**
1. Load Project A into LiveCodeRunner
2. Note the blob URL created for the iframe src
3. Immediately switch to Project B
4. Note the new blob URL, verify old one is revoked
5. Rapidly switch between Project B and Project C 10 times
6. Monitor browser memory usage via DevTools

**Expected Results:**
- [ ] Each project switch creates a new blob URL
- [ ] Previous blob URL is revoked via `URL.revokeObjectURL()`
- [ ] No accumulation of blob URLs in memory
- [ ] Memory usage remains stable after 10 rapid switches
- [ ] No "blob:..." URLs left dangling in browser memory
- [ ] The `useEffect` cleanup function in LiveCodeRunner fires on each update

**Pass Criteria:** Memory usage does not grow unbounded; blob URLs are properly cleaned up.

**Verification (DevTools Console):**
```javascript
// Check for blob URL count (should be 0 or 1 at any time)
performance.getEntriesByType('resource').filter(r => r.name.startsWith('blob:')).length
```

---

### TC-LCR-008: Error Handling

**Objective:** Verify syntax errors in JSX are caught and displayed gracefully.

**Input:**
```jsx
// src/App.jsx (contains syntax error - unclosed tag)
export default function App() {
  return (
    <div>
      <h1>Hello World
      <p>This paragraph is fine</p>
    </div>
  );
}
```

**Steps:**
1. Provide a JSX file with a syntax error (unclosed `<h1>` tag)
2. Pass to LiveCodeRunner
3. Observe the preview area

**Expected Results:**
- [ ] Error message is displayed in the preview area (not a blank screen)
- [ ] Error message indicates the nature of the syntax error
- [ ] Application does not crash
- [ ] Other valid files are not affected
- [ ] User can fix the error and re-render

**Pass Criteria:** Clear error feedback; no crashes or blank screens.

---

### TC-LCR-009: HTML-Only Project

**Objective:** Verify a pure HTML project renders directly without Babel transpilation.

**Input:**
```html
<!-- index.html -->
<!DOCTYPE html>
<html>
<head>
  <title>HTML Only App</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
    .card { border: 1px solid #ccc; padding: 16px; border-radius: 8px; margin: 8px 0; }
    .btn { background: #3b82f6; color: white; padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer; }
  </style>
</head>
<body>
  <h1>Static HTML App</h1>
  <div class="card">
    <h2>Card Title</h2>
    <p>Card content goes here.</p>
    <button class="btn" onclick="alert('Clicked!')">Click Me</button>
  </div>
  <script>
    document.querySelector('.btn').addEventListener('click', function() {
      this.textContent = 'Clicked!';
    });
  </script>
</body>
</html>
```

**Steps:**
1. Provide only an HTML file (no JSX/TSX files)
2. Pass to LiveCodeRunner
3. Observe the preview

**Expected Results:**
- [ ] HTML is rendered directly in the iframe (no Babel processing)
- [ ] Inline CSS styles are applied
- [ ] Inline JavaScript executes
- [ ] External script/link tags are stripped (sandboxing)
- [ ] Button click handler works
- [ ] No "Cannot preview" error message

**Pass Criteria:** HTML renders as a complete page with inline styles and scripts working.

---

### TC-LCR-010: Empty Project

**Objective:** Verify appropriate messaging when no renderable files are provided.

**Input:**
- Scenario A: No files at all (empty array)
- Scenario B: Only backend files (server/index.js, server/routes.js)
- Scenario C: Only config files (package.json, tsconfig.json, vite.config.js)

**Steps:**
1. Provide an empty file array to LiveCodeRunner
2. Observe the preview area
3. Repeat with only backend files
4. Repeat with only config files

**Expected Results:**
- [ ] Scenario A: "Cannot preview server-side project" message displayed
- [ ] Scenario B: Backend files filtered out; same message displayed
- [ ] Scenario C: Config files filtered out; same message displayed
- [ ] No blank iframe rendered
- [ ] No JavaScript errors in console
- [ ] UI remains responsive and usable

**Pass Criteria:** Clear "cannot preview" message for all non-renderable inputs.

---

## 12. Plan-Driven Pipeline Test Suite

The plan-driven pipeline is the primary code generation system. These tests validate the full flow from understanding to code generation.

---

### TC-PD-001: Domain Detection

**Objective:** Verify domain detection correctly identifies industry domains.

**Input:**
```
"Build a consulting firm management platform"
```

**Expected Results:**
- [ ] Domain detected as `consulting`
- [ ] Entities include: Project, Milestone, Task, Timesheet, Client, Contract
- [ ] Workflows include project lifecycle, timesheet approval
- [ ] Confidence score > 0.7

---

### TC-PD-002: Multi-Domain Blending

**Objective:** Verify two close domains are blended when within 0.15 confidence.

**Input:**
```
"Build an HR system with project tracking"
```

**Expected Results:**
- [ ] Both `hr` and `project-management` domains detected
- [ ] Entities from both domains are included
- [ ] No duplicate entities

---

### TC-PD-003: Clarification Limit

**Objective:** Verify max 2 clarification rounds with auto-proceed.

**Input:**
```
"Build an app"
```

**Steps:**
1. Submit the vague prompt
2. Respond vaguely to the first clarification
3. Respond vaguely to the second clarification
4. Verify system proceeds to planning without asking a third time

**Expected Results:**
- [ ] At most 2 clarification questions asked
- [ ] System auto-proceeds with best assumptions
- [ ] Plan is generated successfully

---

### TC-PD-004: Plan Approval Flow

**Objective:** Verify plan approval and modification.

**Input:**
```
"Build a restaurant management system"
```

**Steps:**
1. Submit the prompt
2. Wait for plan generation
3. Request modification: "Add a delivery tracking module"
4. Approve the modified plan
5. Wait for code generation

**Expected Results:**
- [ ] Plan includes restaurant-domain entities (MenuItem, Order, Table, Reservation)
- [ ] Modified plan includes delivery tracking
- [ ] Generated code includes all planned pages and entities
- [ ] Code passes post-generation validation

---

### TC-PD-005: Phase Recovery

**Objective:** Verify stuck conversation recovery.

**Steps:**
1. Start a conversation that reaches the "generating" phase
2. Simulate a phase stuck without plan data
3. Verify the system recovers gracefully

**Expected Results:**
- [ ] System detects stuck state
- [ ] Conversation restarts to initial phase
- [ ] User is notified of recovery
- [ ] No infinite loops

---

### TC-PD-006: Post-Generation Validation

**Objective:** Verify all generated code passes validation.

**Steps:**
1. Generate a project using the plan-driven pipeline
2. Check for missing imports, dependencies, and runtime patterns

**Expected Results:**
- [ ] All imports reference existing files
- [ ] All dependencies are listed in package.json
- [ ] No missing QueryClientProvider
- [ ] No duplicate export defaults
- [ ] Smart stubs created for any missing files

---

### TC-PD-007: Auto-Fix Loop

**Objective:** Verify runtime errors are auto-detected and fixed.

**Steps:**
1. Generate a project with a deliberate runtime error
2. Run in WebContainer preview
3. Observe auto-fix behavior

**Expected Results:**
- [ ] Error detected via postMessage or regex patterns
- [ ] Error posted to backend auto-fix endpoint
- [ ] Fix applied to project files
- [ ] Preview refreshed automatically
- [ ] Auto-fix badge shows status (up to 3 retries)

---

### TC-PD-008: Code Generation Quality (Automated)

**Objective:** Verify generated code quality across diverse app types using the automated quality test.

**Test File:** `server/tests/codegen-quality-test.ts`

**Steps:**
1. Run `npx tsx server/tests/codegen-quality-test.ts`
2. Review the scorecard output

**What It Tests (6 Categories):**
- **Schema** — All entity fields present in Drizzle schema, correct types, foreign keys
- **Routes/CRUD** — Full CRUD operations (GET list, GET by ID, POST, PUT/PATCH, DELETE) for each entity
- **UI/Pages** — List pages with data tables, detail pages with child entity tables, create forms with field completeness
- **Semantic Formatting** — Currency fields use Intl.NumberFormat or $ prefix, dates use toLocaleDateString, emails/phones use appropriate input types
- **Relationships** — Parent-child entity wiring, foreign key references, navigation between related entities
- **Infrastructure** — package.json dependencies, build scripts, App routing completeness, import resolution, storage interface, UI component library

**Expected Results:**
- [ ] Overall score ≥ 95% (Grade A or A+)
- [ ] Schema category ≥ 98%
- [ ] Routes/CRUD category ≥ 98%
- [ ] Infrastructure category ≥ 95%
- [ ] UI/Pages category ≥ 95%
- [ ] Semantic category ≥ 90%
- [ ] Relationships category ≥ 90%
- [ ] All 5 test apps generate without errors (Veterinary Clinic, Invoice Generator, Recipe Manager, Project Board, Freelancer Platform)

**Current Baseline:** 99% (856/868 pts) — Grade A+

**Pass Criteria:** All category scores at or above thresholds; no regressions from baseline.

---

## 13. Pro Generator Validation Test Suite (Fallback)

The Pro Generator (`client/src/lib/code-generator/pro-generator.ts`, 3,624 lines) is the template-based fallback engine. These tests validate prompt analysis accuracy and output quality.

---

### TC-PG-001: Prompt Analysis - Ecommerce

**Objective:** Verify ecommerce prompt is correctly classified with appropriate pages.

**Input:**
```
"Build an online store with products and cart"
```

**Steps:**
1. Call `analyzePrompt()` with the ecommerce prompt
2. Inspect the returned `ProjectRequirements` object

**Expected Results:**
- [ ] `appType` is `"ecommerce"`
- [ ] `pages` array contains: `Home`, `Products`, `ProductDetail`, `Cart`, `Checkout`
- [ ] `features` includes `crud` (product management)
- [ ] `dataModels` includes `Product` model with fields: id, name, price, image, category, description, rating, inStock
- [ ] `dataModels` includes `CartItem` model with fields: productId, quantity
- [ ] `hasBackend` is appropriately set
- [ ] `complexity` is `"medium"` or `"complex"`

**Pass Criteria:** All classification fields match expected ecommerce patterns.

---

### TC-PG-002: Prompt Analysis - Dashboard

**Objective:** Verify dashboard prompt is classified with chart features detected.

**Input:**
```
"Create an analytics dashboard with charts"
```

**Steps:**
1. Call `analyzePrompt()` with the dashboard prompt
2. Inspect the returned `ProjectRequirements` object

**Expected Results:**
- [ ] `appType` is `"dashboard"` or `"analytics"`
- [ ] `features` array includes `"charts"`
- [ ] `pages` array contains: `Dashboard`, `Analytics` or `Overview`
- [ ] `dataModels` includes `Metric` model with fields: label, value, change, icon
- [ ] `uiStyle` is appropriately set (likely `"modern"` or `"corporate"`)

**Pass Criteria:** Dashboard type detected; charts feature recognized.

---

### TC-PG-003: File Count

**Objective:** Verify the generator produces 15-20 files for a standard project.

**Input:**
```
Any valid prompt, e.g.: "Build a task management app with kanban board"
```

**Steps:**
1. Generate a full project using `generateProject()`
2. Count the number of files in the output

**Expected Results:**
- [ ] Total file count is between 15 and 20
- [ ] All component files have `.jsx` or `.tsx` extension
- [ ] Files include: `package.json`, `vite.config.js`, `index.html`
- [ ] Files include: `src/App.jsx`, `src/main.jsx`
- [ ] Files include: `src/index.css` or `src/styles.css`
- [ ] Files include page components in `src/pages/` or `src/components/`
- [ ] No duplicate file paths

**Pass Criteria:** File count within range; all files have valid extensions and paths.

---

### TC-PG-004: Package.json Validity

**Objective:** Verify the generated package.json is valid and includes required dependencies.

**Input:**
```
Any valid prompt
```

**Steps:**
1. Generate a project
2. Find the `package.json` file in the output
3. Parse it as JSON
4. Inspect dependencies

**Expected Results:**
- [ ] `package.json` content is valid JSON (no parse errors)
- [ ] `dependencies` object exists
- [ ] `dependencies` includes `"react"` with a version
- [ ] `dependencies` includes `"react-dom"` with a version
- [ ] `devDependencies` includes `"vite"` with a version
- [ ] `scripts` object includes `"dev"` script
- [ ] `name` field is set (kebab-case project name)
- [ ] No duplicate dependency entries
- [ ] All version strings are valid semver (e.g., `^18.2.0`)

**Verification:**
```javascript
const pkg = JSON.parse(packageJsonContent);
assert(pkg.dependencies['react']);
assert(pkg.dependencies['react-dom']);
assert(pkg.devDependencies['vite'] || pkg.dependencies['vite']);
```

**Pass Criteria:** Valid JSON; react, react-dom, vite all present.

---

### TC-PG-005: Default Export Check

**Objective:** Verify every generated component file has a proper default export.

**Input:**
```
Generated component files from any project
```

**Steps:**
1. Generate a project
2. For each `.jsx` or `.tsx` file (excluding config, index, and main files), check for default export

**Expected Results:**
- [ ] Each component file contains `export default function ComponentName`
- [ ] The `ComponentName` matches the file name (PascalCase)
- [ ] No component files use `export default class`
- [ ] No component files are missing the default export entirely
- [ ] `App.jsx` has `export default function App`

**Verification:**
```javascript
for (const file of componentFiles) {
  const hasDefault = /export\s+default\s+function\s+\w+/.test(file.content);
  assert(hasDefault, `${file.path} missing default export`);
}
```

**Pass Criteria:** All component files have `export default function ComponentName`.

---

### TC-PG-006: Conditional Dependencies

**Objective:** Verify that feature-specific dependencies are added when features are detected.

**Input:**
```
"Build a dashboard with charts and data visualization"
```

**Steps:**
1. Generate a project with chart features
2. Parse the generated `package.json`
3. Check for conditional dependencies

**Expected Results:**
- [ ] `package.json` includes `recharts` in dependencies (charts detected)
- [ ] For a prompt with "icons": `lucide-react` is included
- [ ] For a prompt with "routing" or multi-page: `react-router-dom` is included
- [ ] For a prompt with "forms": `react-hook-form` may be included
- [ ] No unnecessary dependencies are added
- [ ] All conditional dependencies have valid version strings

**Pass Criteria:** Feature-specific dependencies correctly added based on prompt analysis.

---

### TC-PG-007: Multi-Page Routing

**Objective:** Verify App.jsx includes proper routing setup for multi-page apps.

**Input:**
```
"Build a project management tool with dashboard, tasks, team, and settings pages"
```

**Steps:**
1. Generate a project with 3+ pages
2. Inspect the generated `App.jsx` file
3. Check for routing imports and configuration

**Expected Results:**
- [ ] `App.jsx` imports from `react-router-dom` (BrowserRouter, Routes, Route)
- [ ] `App.jsx` contains `<BrowserRouter>` or `<HashRouter>` wrapper
- [ ] `App.jsx` contains `<Routes>` with nested `<Route>` elements
- [ ] Each page has a corresponding `<Route path="..." element={<PageComponent />} />`
- [ ] Navigation component includes `<Link>` or `<NavLink>` elements
- [ ] Home/Dashboard page is mapped to `path="/"`
- [ ] `react-router-dom` is listed in `package.json` dependencies

**Pass Criteria:** Full routing setup with imports, Routes, and navigation links.

---

## 14. Code Validator Test Suite

The Code Validator (`client/src/lib/code-generator/code-validator.ts`) checks and auto-fixes common issues in generated JSX/TSX code. These tests verify detection accuracy and auto-fix correctness.

---

### TC-CV-001: Balanced Brackets

**Objective:** Verify mismatched brackets are detected and reported with line numbers.

**Input:**
```jsx
// test-file.jsx
export default function App() {
  const data = [1, 2, 3;
  return (
    <div>
      <h1>Hello</h1>
    </div>
  );
}
```

**Steps:**
1. Run the code validator on the input file
2. Check the returned `ValidationResult`

**Expected Results:**
- [ ] `isValid` is `false`
- [ ] `errors` array contains at least one entry
- [ ] Error message indicates unmatched bracket `[` or unexpected `;`
- [ ] Error includes the correct `line` number (line 3)
- [ ] Error `severity` is `"error"`
- [ ] Error `file` matches the input file path

**Pass Criteria:** Bracket mismatch detected; line number is accurate.

---

### TC-CV-002: Void Element Auto-Fix

**Objective:** Verify void HTML elements with closing tags are auto-fixed to self-closing.

**Input:**
```jsx
// test-file.jsx
export default function App() {
  return (
    <div>
      <input type="text" value="hello"></input>
      <br></br>
      <img src="photo.jpg" alt="Photo"></img>
      <hr></hr>
    </div>
  );
}
```

**Steps:**
1. Run the code validator with auto-fix enabled
2. Check the `fixedFiles` output

**Expected Results:**
- [ ] `<input type="text" value="hello"></input>` fixed to `<input type="text" value="hello" />`
- [ ] `<br></br>` fixed to `<br />`
- [ ] `<img src="photo.jpg" alt="Photo"></img>` fixed to `<img src="photo.jpg" alt="Photo" />`
- [ ] `<hr></hr>` fixed to `<hr />`
- [ ] Non-void elements like `<div>` are NOT modified
- [ ] Fixed content is in the `fixedFiles` array

**Pass Criteria:** All void elements converted to self-closing; non-void elements untouched.

---

### TC-CV-003: Void Element with Arrow Function

**Objective:** Verify arrow functions containing `>` are NOT corrupted by void element fixing.

**Input:**
```jsx
// test-file.jsx
export default function App() {
  const items = [1, 2, 3];
  return (
    <div>
      <button onClick={() => handleClick()}>Click Me</button>
      <button onClick={() => items.filter(x => x > 2)}>Filter</button>
      {items.map(item => (
        <span key={item}>{item}</span>
      ))}
      <input type="text" onChange={(e) => setValue(e.target.value)} />
    </div>
  );
}
```

**Steps:**
1. Run the code validator with auto-fix enabled
2. Inspect the fixed output for arrow function preservation

**Expected Results:**
- [ ] `() => handleClick()` is preserved intact
- [ ] `x => x > 2` is preserved intact (the `>` is NOT treated as a tag close)
- [ ] `item => (` is preserved intact
- [ ] `(e) => setValue(e.target.value)` is preserved intact
- [ ] `<button>` elements are NOT converted to self-closing (they are not void)
- [ ] `<input ... />` remains self-closing (already correct)
- [ ] No corruption of JSX expression syntax `{}`

**Pass Criteria:** All arrow functions preserved exactly; no false-positive void element fixing.

---

### TC-CV-004: class to className Fix

**Objective:** Verify HTML `class` attributes are auto-fixed to React's `className`.

**Input:**
```jsx
// test-file.jsx
export default function App() {
  return (
    <div class="container mx-auto">
      <h1 class="text-2xl font-bold">Title</h1>
      <p class="text-gray-600">Description</p>
      <div class="flex items-center gap-2">
        <span class="badge">New</span>
      </div>
    </div>
  );
}
```

**Steps:**
1. Run the code validator with auto-fix enabled
2. Check the `fixedFiles` output

**Expected Results:**
- [ ] `class="container mx-auto"` fixed to `className="container mx-auto"`
- [ ] `class="text-2xl font-bold"` fixed to `className="text-2xl font-bold"`
- [ ] `class="text-gray-600"` fixed to `className="text-gray-600"`
- [ ] `class="flex items-center gap-2"` fixed to `className="flex items-center gap-2"`
- [ ] `class="badge"` fixed to `className="badge"`
- [ ] JavaScript `class` keyword (class declarations) is NOT modified
- [ ] Strings containing the word "class" are NOT modified

**Pass Criteria:** All JSX `class` attributes converted; JS `class` keyword untouched.

---

### TC-CV-005: Event Handler Casing

**Objective:** Verify lowercase HTML event handlers are auto-fixed to React camelCase.

**Input:**
```jsx
// test-file.jsx
export default function App() {
  const handleClick = () => console.log('clicked');
  const handleChange = (e) => console.log(e.target.value);
  return (
    <div>
      <button onclick={handleClick}>Click</button>
      <input onchange={handleChange} />
      <form onsubmit={(e) => e.preventDefault()}>
        <input onfocus={() => console.log('focus')} />
        <input onblur={() => console.log('blur')} />
        <div onmouseenter={() => {}} onmouseleave={() => {}} />
      </form>
    </div>
  );
}
```

**Steps:**
1. Run the code validator with auto-fix enabled
2. Check the `fixedFiles` output

**Expected Results:**
- [ ] `onclick` fixed to `onClick`
- [ ] `onchange` fixed to `onChange`
- [ ] `onsubmit` fixed to `onSubmit`
- [ ] `onfocus` fixed to `onFocus`
- [ ] `onblur` fixed to `onBlur`
- [ ] `onmouseenter` fixed to `onMouseEnter`
- [ ] `onmouseleave` fixed to `onMouseLeave`
- [ ] Event handler values (function references) are NOT modified
- [ ] Non-event attributes are NOT modified

**Pass Criteria:** All event handlers converted to React camelCase format.

---

### TC-CV-006: Missing Default Export

**Objective:** Verify component files without default exports are auto-fixed.

**Input:**
```jsx
// src/components/Dashboard.jsx
import React from 'react';

function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome to the dashboard.</p>
    </div>
  );
}
```

**Steps:**
1. Run the code validator on the component file
2. Check the `fixedFiles` output

**Expected Results:**
- [ ] Validator detects missing `export default`
- [ ] Warning or error is reported for the missing export
- [ ] Auto-fix adds `export default function Dashboard` (replacing `function Dashboard`)
- [ ] The component name matches the file name (`Dashboard`)
- [ ] Function body is preserved intact
- [ ] If the file is NOT a component file (e.g., utility), no export is forced

**Pass Criteria:** Default export added with correct component name; function body unchanged.

---

### TC-CV-007: Import Typo Fix

**Objective:** Verify common React hook import typos are auto-corrected.

**Input:**
```jsx
// src/App.jsx
import { usestate, useeffect, useref, usememo, usecallback } from 'react';
import { createcontext, forwardref } from 'react';

export default function App() {
  const [count, setCount] = usestate(0);
  useeffect(() => {
    console.log(count);
  }, [count]);
  return <div>{count}</div>;
}
```

**Steps:**
1. Run the code validator with auto-fix enabled
2. Check the `fixedFiles` output

**Expected Results:**
- [ ] `usestate` fixed to `useState`
- [ ] `useeffect` fixed to `useEffect`
- [ ] `useref` fixed to `useRef`
- [ ] `usememo` fixed to `useMemo`
- [ ] `usecallback` fixed to `useCallback`
- [ ] `createcontext` fixed to `createContext`
- [ ] `forwardref` fixed to `forwardRef`
- [ ] Fixes apply in both the import statement and usage within the code
- [ ] Non-React imports are NOT modified
- [ ] Variable names that happen to match (e.g., a variable named `usestate`) are handled appropriately

**Pass Criteria:** All React hook/API typos corrected in imports and usages.

---

## 15. Web Mode Testing Procedures

These procedures verify the full user workflow when running AutoCoder as a web application (non-Electron mode).

---

### Prerequisites

- Application is running via `npm run dev`
- Browser is open (Chrome/Firefox recommended)
- Network connection is available (for AI API calls)

---

### Step-by-Step Procedure

**Step 1: Open the Application**

Navigate to `http://localhost:5000` in your browser.

- [ ] Page loads without errors
- [ ] No 404 or 500 responses
- [ ] Favicon appears in browser tab

---

**Step 2: Verify Landing Page**

Check the landing page renders correctly.

- [ ] Landing page is visible with branding/logo
- [ ] "Start Building" button (or equivalent CTA) is visible and clickable
- [ ] Page is responsive (test at 1920px, 1366px, 768px widths)
- [ ] Dark/light mode toggle works (if present)

---

**Step 3: Navigate to Chat**

Click "Start Building" or navigate directly to `/chat`.

- [ ] Chat interface loads
- [ ] Chat input field is visible and focusable
- [ ] Send button is visible
- [ ] File panel (sidebar) is visible
- [ ] Preview panel is visible

---

**Step 4: Submit a Generation Prompt**

Type "Build a todo app" in the chat input and send.

- [ ] Message appears in chat history
- [ ] Loading/thinking indicator shows
- [ ] AI response begins streaming

---

**Step 5: Wait for Generation**

Wait for the code generation to complete (5-10 seconds).

- [ ] Code generation completes without timeout
- [ ] AI response contains code blocks
- [ ] No error messages in chat

---

**Step 6: Verify Files Panel**

Check the files panel for generated files.

- [ ] Files appear in the files panel/sidebar
- [ ] 15+ files are listed
- [ ] File tree structure is visible (src/, components/, pages/)
- [ ] Clicking a file shows its content
- [ ] `package.json` is present
- [ ] `src/App.jsx` (or `.tsx`) is present

---

**Step 7: Verify Preview Panel**

Check the preview panel shows the rendered app.

- [ ] Preview panel shows the rendered application
- [ ] No blank/white screen
- [ ] Tailwind CSS styles are applied
- [ ] Components are visually correct

---

**Step 8: Interact with Preview**

Test interactive elements in the preview.

- [ ] Click buttons and verify responses
- [ ] Navigate between pages (if multi-page)
- [ ] Form inputs accept text
- [ ] Visual feedback on hover/click (if applicable)

---

**Step 9: Test Export/Download**

Try the export or download functionality.

- [ ] "Export" or "Download" button is visible
- [ ] Clicking triggers a ZIP file download
- [ ] ZIP contains all generated files
- [ ] Extracted project can be run with `npm install && npm run dev`

---

**Step 10: Test Push to GitHub**

Try the "Push to GitHub" feature (requires GITHUB_TOKEN secret).

- [ ] "Push to GitHub" button is visible
- [ ] If GITHUB_TOKEN is not set: appropriate error/prompt message
- [ ] If GITHUB_TOKEN is set: repository is created/updated
- [ ] Commit message is meaningful
- [ ] All generated files are pushed
- [ ] Repository URL is displayed after successful push

---

## 16. Electron Mode Testing Procedures

These procedures verify the full user workflow when running AutoCoder as an Electron desktop application.

---

### Prerequisites

- Node.js 18+ installed
- Repository cloned and dependencies installed (`npm install`)
- Understanding that Electron build uses **esbuild** (NOT tsc)

---

### Step-by-Step Procedure

**Step 1: Build Electron**

Build the Electron main process bundle.

```bash
npm run build:electron
```

- [ ] Build completes without errors
- [ ] `dist-electron/main.js` is generated
- [ ] `dist-electron/preload.js` is generated
- [ ] Build uses **esbuild** (NOT TypeScript compiler `tsc`)
- [ ] Build time is under 10 seconds
- [ ] No TypeScript errors block the build

---

**Step 2: Start Electron**

Launch the Electron application in development mode.

```bash
npm run electron:dev
```

- [ ] Express server starts on port 5000 (or configured port)
- [ ] Electron window opens automatically
- [ ] No crash on startup
- [ ] Console shows "Electron app ready" or similar message

---

**Step 3: Verify Window Properties**

Check the Electron window dimensions and behavior.

- [ ] Window opens at **1400x900** pixels (default size)
- [ ] Window is resizable
- [ ] Window title shows "AutoCoder" or project name
- [ ] Window can be minimized, maximized, and restored
- [ ] Menu bar is present (if configured)
- [ ] DevTools can be opened (Ctrl+Shift+I / Cmd+Opt+I)

---

**Step 4: Generate a Project via Chat**

Use the chat interface to generate a project.

- [ ] Chat input is functional
- [ ] Type a prompt: "Create a React weather app"
- [ ] AI response streams in real-time
- [ ] Code blocks are displayed with syntax highlighting
- [ ] Generation completes within 30 seconds

---

**Step 5: Verify File System Write**

Check that files are written to the local file system.

```bash
ls -la ~/AutoCoder/projects/
```

- [ ] Project folder is created at `~/AutoCoder/projects/<project-name>/`
- [ ] All generated files exist on disk
- [ ] `package.json` contains valid JSON
- [ ] `src/` directory contains component files
- [ ] File contents match what was displayed in the UI
- [ ] File permissions are correct (readable/writable by user)
- [ ] No 16KB file size limit (unlike WebContainer)

---

**Step 6: Verify npm Install**

Check that npm install runs automatically after file creation.

- [ ] "Running npm install..." message appears in console/logs
- [ ] Progress output streams to the UI
- [ ] `node_modules/` folder is created in the project directory
- [ ] `package-lock.json` is generated
- [ ] npm install completes without errors
- [ ] All dependencies from `package.json` are installed

**Verification:**
```bash
ls ~/AutoCoder/projects/<project-name>/node_modules/ | head -20
cat ~/AutoCoder/projects/<project-name>/package-lock.json | head -5
```

---

**Step 7: Check Dev Server and Preview**

Verify the development server starts and preview loads.

- [ ] Dev server starts automatically after npm install
- [ ] Server URL is detected (e.g., `http://localhost:5200`)
- [ ] Preview panel loads the running application
- [ ] Application renders correctly in the preview
- [ ] Hot reload works (if applicable)
- [ ] No CORS or security errors in DevTools console

---

**Step 8: Test File I/O Capabilities**

Verify Electron's native file system access (no WebContainer limitations).

- [ ] Files larger than 16KB can be written (test with a large component)
- [ ] Binary files can be written (images, fonts)
- [ ] Nested directory structures are created correctly
- [ ] File watching works (changes detected in real-time)
- [ ] File read operations are fast (no WebContainer overhead)
- [ ] Multiple projects can coexist in `~/AutoCoder/projects/`

**Verification:**
```bash
# Create a large test file to verify no size limit
dd if=/dev/zero of=~/AutoCoder/projects/test/large-file.txt bs=1024 count=100
ls -la ~/AutoCoder/projects/test/large-file.txt
# Should show 100KB file (impossible in WebContainer's 16KB limit)
```

---

### Electron-Specific Checks

After completing the above steps, verify these Electron-specific behaviors:

**Process Cleanup:**
- [ ] Closing the Electron window kills all child processes (dev servers, npm)
- [ ] No orphaned Node.js processes remain after close
- [ ] Ports are released (verify with `lsof -i :5200`)

**IPC Communication:**
- [ ] File write requests go through IPC (main process handles fs)
- [ ] npm install runs in the main process (not renderer)
- [ ] Dev server management is handled by the main process
- [ ] Progress/status updates flow from main to renderer via IPC

**Error Recovery:**
- [ ] If npm install fails, error message is shown to user
- [ ] If dev server crashes, user can retry
- [ ] If file write fails (permissions), clear error is displayed
- [ ] Application recovers gracefully from errors without restart

---

## Quick Reference

### Common Verification Commands

```bash
# Check project exists
ls -la ~/AutoCoder/projects/

# Check specific project
cat ~/AutoCoder/projects/[name]/package.json

# Check node_modules
du -sh ~/AutoCoder/projects/[name]/node_modules/

# Check running processes
ps aux | grep electron
ps aux | grep node

# Check port usage
lsof -i :5200
lsof -i :5000
```

### Test Data Samples

**Simple request:**
```
Create a hello world page
```

**Medium request:**
```
Create a React todo app with add, delete, and complete functionality
```

**Complex request:**
```
Create a React dashboard with sidebar navigation containing Home, Analytics, Settings, and Profile links. Include a header with a logo on the left and a user avatar with dropdown on the right. The main content area should have 4 statistics cards and a line chart. Use Tailwind CSS for styling.
```
