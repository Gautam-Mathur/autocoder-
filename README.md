# AutoCoder - AI-Powered Code Generator

A free, intelligent coding assistant that generates professional, production-ready code with live preview. Works in two modes: Cloud AI with GPT-4o or a built-in local template engine - no API keys required.

![AutoCoder Preview](https://img.shields.io/badge/AI-Powered-8b5cf6?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-22c55e?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)

## Features

### Intelligent Code Generation
- **Context-Aware AI** - Understands your project, remembers context, and maintains consistent branding
- **Smart Questioning** - Asks clarifying questions before coding to deliver exactly what you need
- **Adaptive Design** - Matches designs to your industry (cybersecurity, fitness, fintech, etc.)
- **Project Memory** - Each chat is a dedicated project with continuous improvements

### Live Code Preview
- **Instant Preview** - See your HTML/CSS rendered in real-time
- **Secure Sandbox** - Isolated iframe rendering for safety
- **Fullscreen Mode** - Expand preview for detailed inspection
- **Open in New Tab** - Launch previews in separate windows

### Dual AI Modes
- **Cloud Mode** (on Replit) - Powered by GPT-4o for intelligent, context-aware generation
- **Local Mode** (anywhere) - Built-in template engine works offline, no API keys needed

### Smart Template Engine
- 20+ professional templates with modern dark themes
- Synonym expansion and fuzzy matching for better understanding
- Typo tolerance with Levenshtein distance matching
- Templates for HTML, JavaScript, React, and CSS

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Vite
- **Backend**: Express.js, Node.js
- **Storage**: In-memory (no database required)
- **AI**: OpenAI GPT-4o (optional - falls back to local template engine)
- **UI**: shadcn/ui, Radix UI, Framer Motion

## Getting Started

### Quick Start (Just npm!)
```bash
# Clone the repository
git clone https://github.com/Gautam-Mathur/autocoder-.git
cd autocoder-

# Install dependencies
npm install

# Start the development server
npm run dev
```

**That's it!** No API keys, no database, no configuration needed. The app uses:
- **In-memory storage** - works without any database
- **Local template engine** - generates code without any API keys

Open `http://localhost:5000` in your browser and start coding!

## Usage

### Starting a Project
1. Click "New Chat" to start a fresh project
2. Describe your project: *"I'm building SecureMage, a cybersecurity tool for small businesses"*
3. The AI remembers this context for all future requests

### Generating Code
- **Vague request**: "Make me a landing page" → AI asks clarifying questions
- **Detailed request**: "Landing page for a fitness app targeting young adults" → AI builds immediately
- **Iterating**: "Add a pricing section" → AI maintains your established style

### Using Live Preview
1. Generate HTML code
2. Click "Live Preview" button below the code block
3. Toggle fullscreen or open in new tab

## Project Structure

```
├── client/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── lib/
│   │   │   └── code-generator/  # Local template engine
│   │   ├── pages/          # App pages
│   │   └── hooks/          # Custom hooks
├── server/
│   ├── routes.ts           # API endpoints
│   └── storage.ts          # Database operations
├── shared/
│   └── schema.ts           # Database schema
└── README.md
```

## Environment Variables (Optional)

All environment variables are **optional**. The app works fully without any configuration.

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | No | PostgreSQL connection (uses in-memory storage if not set) |
| `OPENAI_API_KEY` | No | Your OpenAI API key for Cloud AI mode |

### Running with OpenAI (Optional)
If you want to use GPT-4o instead of the local template engine:
```bash
export OPENAI_API_KEY=your-api-key-here
npm run dev
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this for personal or commercial projects.

## Author

Created by [Gautam Mathur](https://github.com/Gautam-Mathur)

---

Built with passion using Replit Agent
