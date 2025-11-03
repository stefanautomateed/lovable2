# Vibe Coding Platform - Logic-First MVP

A browser-based IDE where users describe a website, and an AI agent plans, creates files, verifies, and shows a live preview.

## Features

- **AI-Powered Planning**: Describe your website in natural language, get a detailed implementation plan
- **In-Memory Filesystem**: All files stored in memory, with export/import as ZIP
- **Monaco Editor**: Professional code editing experience
- **Live Preview**: See your changes in real-time
- **Incremental Building**: Step-by-step implementation with verification
- **Surgical Edits**: Smart code modifications that preserve existing work
- **No Auth, No DB**: Simple, focused MVP with minimal dependencies

## Tech Stack

- **Next.js 15+** (App Router, TypeScript)
- **Monaco Editor** for code editing
- **OpenAI API** for AI assistance
- **Tailwind CSS** for styling
- **esbuild** for bundling (planned)

## Getting Started

### Prerequisites

- Node.js 18+
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd lovable2
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your OpenAI API key:
```
OPENAI_API_KEY=sk-your-key-here
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### 1. Create a Plan
Click "New Plan" and describe the website you want to build. The AI will:
- Derive a detailed specification
- Create an implementation plan
- Break it down into actionable steps

### 2. Build
Click "Build" to execute the current step. The AI will:
- Generate necessary files
- Make surgical edits to existing files
- Update the file tree

### 3. Verify
Click "Verify" to check for syntax errors and common issues.

### 4. Preview
Click "Preview" to see your website in action (simplified preview in current version).

### 5. Refine
Click "Refine" to make changes. Describe what you want to change, and the AI will:
- Search for relevant code
- Make minimal, targeted edits
- Preserve existing functionality

### 6. Export/Import
- **Export**: Download your project as a ZIP file
- **Import**: Upload a ZIP file to restore a project

## Architecture

### File Structure
```
/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── agent/         # AI agent endpoints
│   │   └── fs/            # File system operations
│   ├── layout.tsx
│   └── page.tsx           # Main IDE interface
├── components/            # React components
│   ├── Editor.tsx         # Monaco editor
│   ├── Preview.tsx        # Live preview iframe
│   ├── Logs.tsx          # Activity logs
│   ├── Todos.tsx         # Implementation plan
│   └── CommandBar.tsx    # Action buttons
├── lib/
│   ├── agent/            # AI orchestration
│   │   ├── orchestrator.ts
│   │   ├── policies.ts
│   │   └── openai.ts
│   ├── runner/           # File operations
│   │   ├── fsMemory.ts
│   │   ├── fsOps.ts
│   │   ├── bundler.ts
│   │   └── verify.ts
│   └── util/             # Utilities
│       ├── z.ts          # Zod schemas
│       ├── logger.ts
│       └── zip.ts
└── styles/
    └── globals.css
```

### Agent Flow
1. **INTENT**: User describes desired website
2. **PLAN**: AI creates detailed spec and implementation plan
3. **SCAFFOLD/EDIT**: AI generates or modifies files
4. **VERIFY**: Basic syntax and structure checks
5. **PREVIEW**: Live rendering in iframe
6. **ITERATE**: User refinements trigger targeted edits

### Default Website Blueprint
Generated websites include:
- **Hero**: Compelling headline and CTA
- **Features**: Key features grid
- **Use Cases**: Real-world applications
- **Testimonials**: Social proof
- **FAQ**: Common questions
- **Footer**: Links and copyright

All sections are:
- Fully responsive (mobile-first)
- Accessible (ARIA labels, semantic HTML)
- Modern design (2xl radii, soft shadows)
- Animated (Framer Motion)

## API Endpoints

### File Operations
- `GET /api/fs/list` - Get file tree
- `GET /api/fs/read?path=<path>` - Read file
- `POST /api/fs/write` - Write file
- `POST /api/fs/edit` - Edit file (surgical)
- `GET /api/fs/export` - Export as ZIP
- `POST /api/fs/import` - Import ZIP

### Agent Operations
- `POST /api/agent/plan` - Create implementation plan
- `POST /api/agent/run` - Execute step (BUILD/VERIFY/PREVIEW/REFINE)

## Development

### Environment Variables
- `OPENAI_API_KEY` - Required for AI features
- `OPENAI_MODEL` - Optional (default: gpt-4-turbo-preview)

### Building for Production
```bash
npm run build
npm start
```

## Limitations (Current MVP)

- Preview uses simplified HTML (full esbuild bundling coming soon)
- In-memory only (no persistence between sessions without export/import)
- Single user (no collaboration features)
- No authentication or billing
- OpenAI API required (no offline mode)

## Future Enhancements

- Full esbuild-wasm bundling for preview
- Multi-file editing with tabs
- Git integration
- Component library browser
- Template marketplace
- Real-time collaboration
- Deployment integration

## Contributing

This is an MVP. Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.

---

Built with ❤️ using Next.js, OpenAI, and modern web technologies.
