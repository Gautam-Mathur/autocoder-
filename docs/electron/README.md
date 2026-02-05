# AutoCoder Electron Documentation

Complete documentation for the AutoCoder Electron desktop application.

## Documentation Index

| Document | Description | Audience |
|----------|-------------|----------|
| [01-WHY-AND-HOW.md](./01-WHY-AND-HOW.md) | Why Electron was chosen and how the architecture works | Everyone |
| [02-DEVELOPERS-GUIDE.md](./02-DEVELOPERS-GUIDE.md) | Code structure, development workflow, and extending the app | Developers |
| [03-PROBLEMS-AND-SOLUTIONS.md](./03-PROBLEMS-AND-SOLUTIONS.md) | Predicted issues and how to solve them | Developers, Support |
| [04-RUNNING-GUIDE.md](./04-RUNNING-GUIDE.md) | Step-by-step setup and running instructions | Everyone |
| [05-USERS-GUIDE.md](./05-USERS-GUIDE.md) | How to use AutoCoder as an end user | End Users |
| [06-TESTERS-GUIDE.md](./06-TESTERS-GUIDE.md) | Test cases, verification steps, and QA procedures | QA Testers |

## Quick Start

```bash
# Install
npm install

# Build Electron
npx tsc -p electron/tsconfig.json

# Run (two terminals)
npm run dev                    # Terminal 1
./scripts/electron-dev.sh      # Terminal 2
```

## Document Summaries

### 1. Why and How (`01-WHY-AND-HOW.md`)
Explains the technical reasoning behind choosing Electron over WebContainer:
- 16KB file write limitation problem
- Virtual npm performance issues
- Browser memory constraints
- Architecture diagrams and data flow

### 2. Developer's Guide (`02-DEVELOPERS-GUIDE.md`)
Everything developers need to work on the codebase:
- Project structure and key files
- Component deep-dives (main process, preload, services)
- Adding new features step-by-step
- IPC patterns and best practices
- Build and packaging instructions

### 3. Problems and Solutions (`03-PROBLEMS-AND-SOLUTIONS.md`)
Comprehensive troubleshooting reference:
- 50+ predicted problems with solutions
- Development, build, runtime, and cross-platform issues
- Security considerations
- Quick reference error code table

### 4. Running Guide (`04-RUNNING-GUIDE.md`)
Step-by-step instructions to get up and running:
- System requirements
- Development mode setup
- Production build process
- Platform-specific notes (Windows, macOS, Linux)
- Common setup issues and fixes

### 5. User's Guide (`05-USERS-GUIDE.md`)
Non-technical guide for end users:
- Interface overview
- Creating first project
- Working with generated code
- Tips for better results
- FAQ section

### 6. Tester's Guide (`06-TESTERS-GUIDE.md`)
QA testing procedures:
- Test environment setup
- 30+ functional test cases
- Integration, performance, and edge case tests
- Cross-platform testing matrix
- Bug reporting template
- Regression checklist

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                      ELECTRON APPLICATION                         │
│                                                                   │
│  ┌─────────────────────────┐    ┌──────────────────────────────┐ │
│  │      MAIN PROCESS       │    │     RENDERER PROCESS         │ │
│  │                         │    │                              │ │
│  │  • Local Runner Service │◄──►│  • React Frontend           │ │
│  │  • File System I/O      │IPC │  • Code Generation          │ │
│  │  • npm Operations       │    │  • Preview Panel            │ │
│  │  • Dev Server Manager   │    │                              │ │
│  └─────────────────────────┘    └──────────────────────────────┘ │
│                                                                   │
│                    ┌──────────────────────┐                       │
│                    │  ~/AutoCoder/projects │                      │
│                    └──────────────────────┘                       │
└──────────────────────────────────────────────────────────────────┘
```

## Key Benefits Over WebContainer

| Feature | WebContainer | Electron |
|---------|-------------|----------|
| File size limit | 16KB | Unlimited |
| npm speed | Slow | Native speed |
| Persistence | Lost on refresh | Permanent |
| System access | None | Full (sandboxed) |
