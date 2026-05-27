# CodeCraft — Project Plan

**Project Name:** CodeCraft  
**Date Created:** 2026-05-27  
**Version:** 1.0  
**License:** MIT  
**Repository:** TBD (GitHub)  
**Hosting:** GitHub Pages  

---

## 1. Project Vision

CodeCraft is a lightweight, browser-based code editor in the spirit of Notepad++ — not a full IDE, but far more capable than a simple online playground. It runs entirely client-side, requires no backend, and can be hosted on GitHub Pages. The target audience sits between students/learners and professional developers: people who want a fast, zero-install, privacy-first tool for writing, running, and managing multi-file projects directly in the browser.

### Design Philosophy: "Paper Desk"

The code is the star. Everything else recedes until needed. No persistent sidebar, no heavy chrome — just a tab-centric, distraction-free workspace with a warm, distinctive identity that sets it apart from the sea of VS Code clones.

---

## 2. Technology Stack

| Layer | Technology | Package | Version |
|-------|-----------|---------|---------|
| **Runtime** | React 18+ | `react` | 18.x |
| **Language** | TypeScript | `typescript` | 5.x |
| **Build** | Vite 5+ | `vite` | 5.x |
| **Editor** | CodeMirror 6 | `@uiw/react-codemirror` | 4.25.x |
| **Language Support** | CM6 Language Data | `@codemirror/language-data` | 6.5.x |
| **State Management** | Zustand | `zustand` | 5.x |
| **Storage (structured)** | Dexie.js (IndexedDB) | `dexie` | 4.4.x |
| **Storage (prefs)** | LocalStorage | Built-in | — |
| **Styling** | Tailwind CSS 4 | `@tailwindcss/vite` | 4.x |
| **Routing** | React Router 6 (HashRouter) | `react-router-dom` | 6.x |
| **Emmet** | Official CM6 Plugin | `@emmetio/codemirror6-plugin` | 0.4.x |
| **Formatting** | Prettier Standalone | `prettier` | 3.8.x |
| **Lightweight Formatting** | js-beautify | `js-beautify` | 1.15.x |
| **Linting** | ESLint Browser Build | `eslint-linter-browserify` | 10.4.x |
| **Linting UI** | CM6 Lint | `@codemirror/lint` | 6.9.x |
| **JS Execution** | Sandboxed iframe | Built-in | — |
| **TS Transpilation** | Sucrase | `sucrase` | 3.35.x |
| **Python Execution** | Pyodide (WASM) | `pyodide` | 0.29.x |
| **C/C++ Execution** | JSCPP | `JSCPP` | 2.0.x |
| **ZIP Export/Import** | JSZip | `jszip` | 3.10.x |
| **Drag-and-Drop** | dnd-kit | `@dnd-kit/core` | 6.3.x |
| **Icons** | Lucide React | `lucide-react` | latest |
| **PWA** | vite-plugin-pwa + Workbox | `vite-plugin-pwa` | latest |
| **CI/CD** | GitHub Actions | — | — |
| **Hosting** | GitHub Pages | — | — |

---

## 3. Phase 0 — Project Scaffolding & Infrastructure

**Goal:** Set up the development environment, project structure, CI/CD, and deployment pipeline.

| Task ID | Task | Description | Estimated Effort |
|---------|------|-------------|-----------------|
| PH0-01 | Initialize Vite + React + TypeScript project | `npm create vite@latest`, configure tsconfig, add path aliases | 0.5h |
| PH0-02 | Install and configure Tailwind CSS 4 | `@tailwindcss/vite` plugin, custom `@theme` tokens, CSS custom properties | 1h |
| PH0-03 | Set up project folder structure | Create `src/components/`, `src/stores/`, `src/services/`, `src/themes/`, `src/hooks/`, `src/utils/`, `src/types/`, `src/workers/` | 0.5h |
| PH0-04 | Configure Vite for GitHub Pages | `base` path, `HashRouter` setup, manual chunk splitting, `vite.config.ts` | 1h |
| PH0-05 | Set up GitHub Actions CI/CD | Deploy workflow (`.github/workflows/deploy.yml`), lint + type-check workflow | 1h |
| PH0-06 | Set up ESLint + Prettier (dev tooling) | Config for the project itself (not the in-browser editor feature) | 0.5h |
| PH0-07 | Configure PWA (vite-plugin-pwa) | Service worker, Workbox config, offline caching strategy | 1h |
| PH0-08 | Create README.md and LICENSE | MIT license, project description, setup instructions | 0.5h |

**Phase 0 Total:** ~6 hours

---

## 4. Phase 1 — Core Editor & Tab System

**Goal:** A working code editor with multi-tab support, file switching, and basic state management.

| Task ID | Task | Description | Estimated Effort |
|---------|------|-------------|-----------------|
| PH1-01 | Implement Zustand store slices | `editorStore` (tabs, active tab, cursor, scroll), `projectStore` (files, folders), `settingsStore` (theme, preferences, persist middleware) | 2h |
| PH1-02 | Create CodeMirror editor component | Wrap `@uiw/react-codemirror`, configure base extensions (line numbers, bracket matching, active line, fold, search) | 3h |
| PH1-03 | Implement language detection & lazy-loading | Use `@codemirror/language-data` to detect language from file extension, dynamic import on file open, cache loaded extensions | 2h |
| PH1-04 | Build Tab Bar component (desktop) | Horizontal scrollable tabs, active tab indicator (amber border), dirty dot, close button, "+" new tab, overflow dropdown | 3h |
| PH1-05 | Build Tab Bar component (mobile) | Bottom tab bar with file type icons, Run button, touch-friendly targets | 2h |
| PH1-06 | Implement tab state management | Open/close/switch/pin/reorder tabs, save/restore cursor & scroll state, LRU eviction at 30+ tabs | 3h |
| PH1-07 | Implement drag-and-drop tab reordering | `@dnd-kit/core` + `@dnd-kit/sortable`, horizontal list strategy | 1.5h |
| PH1-08 | Build Title Bar component | Logo, project name dropdown trigger, menu bar (File/Edit/View/Run/Help), global actions (theme toggle, search, settings) | 2h |
| PH1-09 | Build Info Strip component | Cursor position, encoding, language mode, indent type, Run button | 1h |
| PH1-10 | Build main Editor Layout | CSS Grid layout (titlebar → tabbar → editor → infostrip), `100dvh` height, responsive breakpoint switching | 2h |
| PH1-11 | Implement auto-save | Debounced save to IndexedDB (1s after last keystroke), dirty tracking | 1.5h |

**Phase 1 Total:** ~23 hours

---

## 5. Phase 2 — Multi-File Projects & Storage

**Goal:** Full multi-file project support with create/rename/delete/reorder files, IndexedDB persistence, and .zip export/import.

| Task ID | Task | Description | Estimated Effort |
|---------|------|-------------|-----------------|
| PH2-01 | Implement Dexie.js database | Define schema (projects, files, fileContents, binaryFiles, settings, customThemes, autoSaves), migration strategy | 2h |
| PH2-02 | Build Project Manager page | List projects, create/delete/rename projects, "Open Recent" on startup | 2h |
| PH2-03 | Build "Sheet Stack" File Navigator | Slide-over panel with search-first, flat-with-groups layout, folder collapse, action buttons (New File, New Folder, Import, Export) | 4h |
| PH2-04 | Implement file CRUD operations | Create file/folder, rename, delete (with inline confirmation), duplicate, move between folders | 3h |
| PH2-05 | Implement context menus for files | Right-click menu with New File, Rename, Delete, Duplicate, Move To, Copy Path | 1.5h |
| PH2-06 | Implement drag-and-drop file moving | Drag file onto folder, reorder within folder, visual feedback | 2h |
| PH2-07 | Implement .zip export | JSZip: iterate all files, build ZIP, add project metadata, trigger download | 2h |
| PH2-08 | Implement .zip import | Parse uploaded .zip, validate structure, create project with files, handle binary files as ArrayBuffer | 2.5h |
| PH2-09 | Handle binary files | Detection by extension, preview pane (image/SVG), ArrayBuffer storage, binary-aware export/import | 2h |
| PH2-10 | Implement .editorconfig support | Lightweight regex-based parser, apply settings to project configuration | 1h |
| PH2-11 | Implement welcome/startup screen | "Open Recent" projects list, "New Project" button, "Import .zip" button | 1.5h |
| PH2-12 | Storage quota monitoring | `navigator.storage.estimate()`, warn user when approaching limits, request persistent storage | 1h |

**Phase 2 Total:** ~24.5 hours

---

## 6. Phase 3 — Themes & Design System

**Goal:** Complete the "Paper Desk" design identity with 10 built-in themes, custom theme support, and full responsive design.

| Task ID | Task | Description | Estimated Effort |
|---------|------|-------------|-----------------|
| PH3-01 | Create CSS custom property system | Define all semantic tokens (surface, text, accent, border, syntax, gutter, selection), `data-theme` attribute switching | 3h |
| PH3-02 | Build "Cosmic Dusk" default theme | Dark navy + warm amber, CM6 `EditorView.theme` + `HighlightStyle`, complete syntax tokens | 2h |
| PH3-03 | Build "Morning Paper" light theme | Warm off-white, charcoal text, amber accent | 1.5h |
| PH3-04 | Build 8 remaining built-in themes | Midnight Oil, Forest Canopy, Arctic Clear, Ember, Sakura, Terminal Green, Solar Flare, Blueprint | 4h |
| PH3-05 | Implement theme switching | `setTheme()` with LocalStorage persistence, CM6 extension reconfiguration, `data-theme` attribute swap | 1.5h |
| PH3-06 | Build Theme Selector UI | Dropdown/panel with theme previews (mini color swatches), dark/light filter, keyboard navigation | 2h |
| PH3-07 | Build Custom Theme Editor | Live-preview editor with color pickers, JSON import/export, save to IndexedDB | 4h |
| PH3-08 | Refine responsive design | Test and adjust all breakpoints (xs through 2xl), mobile toolbar simplification, virtual keyboard handling | 3h |
| PH3-09 | Build menu system | Dropdown menus (File, Edit, View, Run, Help), keyboard shortcut display, command palette (Ctrl+P) | 3h |
| PH3-10 | Build Settings panel | Preferences UI (font size, tab size, word wrap, auto-save, format on save, keybindings) | 2h |

**Phase 3 Total:** ~26 hours

---

## 7. Phase 4 — Code Execution Engine

**Goal:** Run JavaScript, TypeScript, and HTML natively; lazy-load Python (Pyodide) and C/C++ (JSCPP).

| Task ID | Task | Description | Estimated Effort |
|---------|------|-------------|-----------------|
| PH4-01 | Implement JS execution (sandboxed iframe) | Create iframe with `sandbox="allow-scripts"`, `srcdoc`, capture console.log/warn/error via `postMessage`, timeout handling | 3h |
| PH4-02 | Implement HTML live preview | Render HTML files in a sandboxed iframe with CSS/JS linking from project, hot reload on save | 2h |
| PH4-03 | Implement TypeScript execution | Sucrase transpile (TS → JS), then run through iframe sandbox | 2h |
| PH4-04 | Build Console/Output drawer | Resizable bottom drawer, stdout/stderr/error display, clear button, copy output | 2.5h |
| PH4-05 | Implement "Run" button & logic | Detect language, choose executor, show loading state, stream output to console drawer, handle errors | 2h |
| PH4-06 | Implement Python execution (Pyodide) | Lazy-load Pyodide in Web Worker, stdout/stderr capture, 12MB download progress bar, cache worker for session | 4h |
| PH4-07 | Implement C/C++ execution (JSCPP) | Integrate JSCPP interpreter, basic stdin support, display limitations warning | 2h |
| PH4-08 | Build execution progress/loading UI | Progress bar for Pyodide download, spinner for other engines, inline error messages | 1.5h |
| PH4-09 | Handle multi-file project execution | Link CSS/JS files in HTML preview, resolve imports within project files | 2h |

**Phase 4 Total:** ~21 hours

---

## 8. Phase 5 — Formatting, Linting & Emmet

**Goal:** Integrate Prettier, ESLint, and Emmet for a professional editing experience.

| Task ID | Task | Description | Estimated Effort |
|---------|------|-------------|-----------------|
| PH5-01 | Implement Prettier formatting (Web Worker) | Lazy-load Prettier standalone in Web Worker, format on save + format on demand (Shift+Alt+F), configurable options | 3h |
| PH5-02 | Implement js-beautify lightweight formatter | For quick formatting when Prettier isn't loaded, HTML/CSS/JSON support | 1.5h |
| PH5-03 | Build Formatter Settings UI | Toggle format-on-save, format-on-type, choose formatter (Prettier/basic/none), Prettier config options | 1.5h |
| PH5-04 | Implement ESLint linting (Web Worker) | Lazy-load `eslint-linter-browserify`, integrate with `@codemirror/lint`, configurable rules | 3h |
| PH5-05 | Implement lightweight linting for non-JS | Regex-based checks for Python, HTML (htmlhint), JSON (parse validation), basic SQL | 2h |
| PH5-06 | Build Lint Diagnostics UI | Gutter icons, inline error messages, diagnostics panel, F8/Shift+F8 navigation | 2h |
| PH5-07 | Integrate Emmet | `@emmetio/codemirror6-plugin`, HTML/CSS abbreviation expansion, Tab key binding, JSX support | 2h |
| PH5-08 | Handle Tab key priority | Emmet vs autocomplete vs indentation — configurable priority, smart context detection | 1.5h |

**Phase 5 Total:** ~17 hours

---

## 9. Phase 6 — Polish, PWA & Launch

**Goal:** Final polish, performance optimisation, PWA completeness, documentation, and public launch.

| Task ID | Task | Description | Estimated Effort |
|---------|------|-------------|-----------------|
| PH6-01 | Performance audit & optimisation | Lighthouse testing, bundle size analysis, lazy-loading verification, memory leak checks | 3h |
| PH6-02 | Keyboard shortcuts system | Configurable keybindings, conflict detection, shortcut reference panel | 2h |
| PH6-03 | Command palette (Ctrl+P) | Fuzzy file search, command search, recent files | 2h |
| PH6-04 | PWA polish | Offline mode testing, install prompt, app icon, splash screen, update notification | 2h |
| PH6-05 | Project templates | Starter templates: Hello World (JS/Python/HTML), Calculator, Todo App, Portfolio | 2h |
| PH6-06 | Accessibility audit | Keyboard navigation, ARIA labels, screen reader support, contrast checks | 2h |
| PH6-07 | Cross-browser testing | Chrome, Firefox, Safari, Edge, mobile Safari, Chrome Android | 2h |
| PH6-08 | Documentation | README, CONTRIBUTING.md, architecture docs, extension guide, deployment guide | 3h |
| PH6-09 | GitHub repo setup | Issue templates, PR template, CODE_OF_CONDUCT.md, dependabot, branch protection | 1.5h |
| PH6-10 | Launch preparation | Final QA, demo project, social media assets, first release tag (v1.0.0) | 2h |

**Phase 6 Total:** ~21.5 hours

---

## 10. Long-Term Roadmap

### v2.0 — Collaboration & Extensions

| Feature | Description |
|---------|-------------|
| **Real-time collaboration** | WebSocket-based, CRDT for conflict resolution, shared cursors |
| **Extension system** | Plugin API (`registerLanguage`, `registerFormatter`, `registerTheme`, `registerCommand`), extension gallery |
| **Git integration** | Commit to GitHub via OAuth, diff viewer, branch management |
| **Live Share** | Shareable URLs for pair programming (WebRTC) |
| **Language server protocol** | LSP client for richer IntelliSense (TypeScript, Python, etc.) |

### v3.0 — Platform & Ecosystem

| Feature | Description |
|---------|-------------|
| **Desktop app** | Tauri-based desktop wrapper (same React codebase) |
| **Cloud sync** | Optional encrypted cloud backup (WebDAV / S3) |
| **Code snippets library** | Community snippet sharing, language-specific templates |
| **Integrated tutorial system** | Interactive coding lessons for beginners (JS, Python, HTML) |
| **Ruby execution** | Opal transpiler or ruby.wasm lazy-load |
| **PHP execution** | php-wasm lazy-load |
| **Java execution** | CheerpJ integration (opt-in heavy download) |

---

## 11. Task Dependency Graph

```
PH0 ────────────────────────────────────────────────────────────►
  │
  ▼
PH1 ────────────────────────────────────────────────────────────►
  │
  ├──── PH2 (Projects & Storage) ───────────────────────────────►
  │         │
  │         └──── PH4 (Code Execution) ─────────────────────────►
  │
  ├──── PH3 (Themes & Design) ─────────────────────────────────►
  │
  └──── PH5 (Formatting, Linting, Emmet) ──────────────────────►
         │
         ▼
       PH6 (Polish & Launch) ──────────────────────────────────►
```

**Parallel execution opportunities:**
- PH2, PH3, and PH5 can run in parallel after PH1 completes
- PH4 depends on PH2 (needs project file system for execution)
- PH6 depends on all previous phases

---

## 12. Risk Register

| Risk | Severity | Probability | Mitigation |
|------|----------|-------------|------------|
| Pyodide 12-20 MB download deters users | High | Medium | Show progress bar; cache via service worker; communicate "Python runs in your browser" |
| GitHub Pages 1 GB repo limit reached | Medium | Low | Host WASM runtimes on CDN; compress builds; monitor bundle size in CI |
| Mobile UX feels cramped | Medium | Medium | Dedicated mobile layout; progressive disclosure; extensive touch testing |
| IndexedDB data loss (browser eviction) | Medium | Low | `navigator.storage.persist()`; auto-export reminders; clear data warnings |
| Emmet Tab key conflicts with autocomplete | Low | Medium | Configurable keymap; context-aware Tab behavior |
| JSCPP limitations frustrate C++ users | Low | High | Clear warning label: "Basic C++ support for learning" |
| Community adoption slow | Medium | Medium | Good docs, easy contribution path, demo projects, social presence |

---

## 13. Bundle Size Budget

| Component | Estimated Size (gzipped) | Load Strategy |
|-----------|--------------------------|---------------|
| App shell (React + Router + Zustand) | ~150 KB | Immediate |
| CodeMirror 6 core | ~200 KB | Immediate |
| 5 common languages (JS, TS, HTML, CSS, JSON) | ~80 KB | Immediate |
| Emmet plugin | ~30 KB | Immediate |
| Lucide icons (tree-shaken subset) | ~20 KB | Immediate |
| Tailwind CSS 4 (purged) | ~15 KB | Immediate |
| **Initial load target** | **~495 KB** | |
| Prettier standalone | ~600 KB | Lazy (on first format) |
| ESLint browser build | ~2.5 MB | Lazy (on first lint) |
| Pyodide (Python WASM) | ~12 MB | Lazy (on first Python run) |
| JSCPP (C++ interpreter) | ~50 KB | Include immediately |
| Dexie.js + JSZip | ~80 KB | Lazy (on first project load) |

---

## 14. Success Metrics

| Metric | Target |
|--------|--------|
| First Contentful Paint (FCP) | < 1.0s |
| Time to Interactive (TTI) | < 2.0s |
| Largest Contentful Paint (LCP) | < 2.5s |
| Cumulative Layout Shift (CLS) | < 0.1 |
| Initial bundle transfer | < 500 KB |
| Lighthouse Performance score | > 90 |
| GitHub Stars (first 3 months) | 500+ |
| Community contributions (first 3 months) | 20+ PRs |

---

## 15. References & Source Reports

- **Generic-Research-1-OGF.md** — Architecture, GitHub Pages constraints, Vite config, performance strategy
- **Editor-Research-2-OGF.md** — CodeMirror 6 vs Monaco, language support, execution engines, formatting, linting, Emmet
- **UIUX-Research-3-OGF.md** — Design identity, themes, responsive layout, tab system, project management, storage
