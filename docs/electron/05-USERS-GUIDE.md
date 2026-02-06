# AutoCoder Electron: User's Guide

## Welcome to AutoCoder

AutoCoder is an AI-powered code generation assistant that creates production-ready applications from natural language descriptions. The Electron desktop version provides the full experience without browser limitations.

---

## Table of Contents

1. [Getting Started](#1-getting-started)
2. [Understanding the Interface](#2-understanding-the-interface)
3. [Creating Your First Project](#3-creating-your-first-project)
4. [Working with Generated Code](#4-working-with-generated-code)
5. [Managing Projects](#5-managing-projects)
6. [Tips for Better Results](#6-tips-for-better-results)
7. [Common Tasks](#7-common-tasks)
8. [Frequently Asked Questions](#8-frequently-asked-questions)

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

AutoCoder will automatically:

1. **Write files** to your computer
2. **Install dependencies** (npm install)
3. **Start the development server**
4. **Show the preview** in the Preview tab

### Step 4: Iterate and Improve

After seeing the preview, you can request changes:

- "Make the header larger"
- "Add a dark mode toggle"
- "Change the color scheme to blue"

---

## 4. Working with Generated Code

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
├── src/
│   ├── App.tsx           # Main application component
│   ├── main.tsx          # Entry point
│   └── components/       # Reusable components
├── public/               # Static files
├── node_modules/         # Installed packages
└── ...
```

### Making Manual Changes

You can edit the generated code:

1. Open the file in your editor
2. Make your changes
3. Save the file
4. The preview will update (if dev server is running)

---

## 5. Managing Projects

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

## 6. Tips for Better Results

### Be Specific

The more details you provide, the better the result:

| Instead of... | Try... |
|---------------|--------|
| "Make a website" | "Create a portfolio website with an about section, project gallery, and contact form" |
| "Build an app" | "Build a React weather app that shows current temperature and 5-day forecast" |
| "Add a feature" | "Add a dark mode toggle button in the top right corner that saves preference to localStorage" |

### Use Technical Terms (If You Know Them)

AutoCoder understands technical language:

- "Use Tailwind CSS for styling"
- "Implement with TypeScript"
- "Add form validation with error messages"
- "Make it responsive for mobile"

### Break Down Complex Requests

For large projects, work in stages:

1. First: "Create the basic structure for a blog platform"
2. Then: "Add user authentication"
3. Then: "Implement post creation and editing"
4. Then: "Add comments feature"

### Reference Previous Work

AutoCoder remembers the conversation:

- "Add a search bar to the header we just created"
- "Change the button color to match the logo"
- "Make the form we built submit to an API"

---

## 7. Common Tasks

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

## 8. Frequently Asked Questions

### "Can I use the generated code for commercial projects?"

Yes! The code generated by AutoCoder is yours to use however you want, including commercial projects.

### "Do I need to know how to code?"

Basic familiarity with web development concepts helps, but AutoCoder is designed to be accessible. You can learn as you go by examining the generated code.

### "Why is npm install taking so long?"

The first install downloads many packages. Subsequent installs are faster because packages are cached. Typical times:
- First install: 30-60 seconds
- Repeated installs: 5-15 seconds

### "Where can I find the preview URL?"

When the development server starts, AutoCoder shows the URL in the console tab. It's typically `http://localhost:3000` or similar.

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
