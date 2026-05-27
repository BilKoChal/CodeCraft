# CodeCraft

> A lightweight, browser-based code editor — like Notepad++ for the web.

CodeCraft is a fast, zero-install code editor that runs entirely in your browser. Create multi-file projects, write code with syntax highlighting and Emmet, format and lint your work, and even run JavaScript, TypeScript, Python, and C++ — all without a backend server.

## Features

- **Multi-file projects** — Organise your code with folders and files, export/import as .zip
- **Syntax highlighting** — 143 languages supported via CodeMirror 6
- **Code execution** — Run JavaScript, TypeScript, HTML, Python (Pyodide), C/C++ (JSCPP) right in the browser
- **Code formatting** — Prettier integration with format-on-save
- **Linting** — ESLint in the browser for JavaScript/TypeScript
- **Emmet support** — HTML/CSS abbreviation expansion
- **10 built-in themes** — From dark "Cosmic Dusk" to light "Morning Paper" — plus custom theme support
- **Mobile responsive** — Full editing experience on phones and tablets
- **Offline capable** — Service worker caches everything for offline use
- **Privacy first** — All code stays in your browser. No accounts, no cloud, no tracking
- **Open source** — MIT licensed, free forever

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript |
| Build | Vite 5 |
| Editor | CodeMirror 6 |
| State | Zustand |
| Storage | IndexedDB (Dexie.js) + LocalStorage |
| Styling | Tailwind CSS 4 |
| Hosting | GitHub Pages |

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+

### Development

```bash
# Clone the repository
git clone https://github.com/your-username/codecraft.git
cd codecraft

# Install dependencies
npm install

# Start development server
npm run dev
```

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── components/    # React UI components
├── stores/        # Zustand state management
├── services/      # Storage, export/import, auto-save
├── themes/        # Theme definitions and bridge
├── hooks/         # Custom React hooks
├── utils/         # Language detection, file utilities
├── types/         # TypeScript type definitions
├── workers/       # Web Workers (Prettier, ESLint, Pyodide)
└── execution/     # Code execution engines
```

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](.github/CONTRIBUTING.md) for guidelines.

## License

[MIT](LICENSE) — Free and open source.
