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

# Build Electron
npx tsc -p electron/tsconfig.json

# Terminal 1
npm run dev

# Terminal 2
./scripts/electron-dev.sh
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
- [ ] Server URL is detected (e.g., localhost:3000)
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
lsof -i :3000  # Should show no process
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
lsof -i :3000
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
