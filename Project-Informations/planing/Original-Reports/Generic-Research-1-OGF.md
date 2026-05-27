# CodeForge — Comprehensive Project Research Report

**Report ID:** Generic-Research-1-OGF  
**Date:** 2025-03-04  
**Prepared by:** Sub-Agent 1 (Generic Project Researcher)

---

## Table of Contents

1. [GitHub Pages Constraints](#1-github-pages-constraints)
2. [Architecture Overview](#2-architecture-overview)
3. [Vite + React Best Practices for GitHub Pages](#3-vite--react-best-practices-for-github-pages)
4. [Target Audience Analysis](#4-target-audience-analysis)
5. [Open Source Considerations](#5-open-source-considerations)
6. [Performance Constraints](#6-performance-constraints)
7. [Recommendations Summary](#7-recommendations-summary)

---

## 1. GitHub Pages Constraints

### 1.1 Hosting Limitations

GitHub Pages is a static-site hosting service, which imposes several critical constraints on CodeForge:

- **No server-side processing:** All logic must execute in the browser. There is no backend, no serverless functions, no API proxies. Every feature — from code execution to file management — must be purely client-side.
- **Repository size limit:** The source repository must not exceed **1 GB**. This is a hard constraint for a project bundling editor libraries, language support, and Pyodide (which alone is ~20 MB for the core WASM + standard library).
- **Published site size limit:** The built/deployed `dist` folder should stay under **1 GB** as well.
- **Bandwidth limit:** **100 GB/month** soft limit. For a code editor with heavy assets (WASM runtimes, language modes), this could be reached with moderate traffic.
- **Build time limit:** GitHub Actions (used for deployment) has a **10-minute build timeout**. Vite builds are fast, so this should not be an issue.
- **No custom HTTP headers:** GitHub Pages does not allow setting `Cache-Control`, `Content-Security-Policy`, or other headers. This limits caching strategies and security hardening.
- **No server-side redirects:** Only a single `404.html` fallback is available, which can be leveraged for SPA routing.

### 1.2 SPA Routing Strategy

GitHub Pages does **not** natively support SPA routing. When a user navigates to `/settings` and refreshes, GitHub Pages returns a 404 because no physical `/settings/index.html` exists.

**Recommended Solution: Hash Routing (`HashRouter`)**

- Use React Router's `HashRouter` instead of `BrowserRouter`.
- URLs will look like `https://username.github.io/codeforge/#/editor` — the fragment (`#/editor`) is never sent to the server, so GitHub Pages always serves `index.html`.
- **No 404.html hack needed.** No custom domain redirect configuration required.
- Works reliably for both `github.io` subdomains and custom domains.
- Trade-off: URLs are slightly less clean (the `#` prefix), but this is the most robust approach for a static host with zero server control.

**Alternative: 404.html redirect hack** — Copy `index.html` to `404.html` during build, so GitHub Pages serves the app on unknown routes. This works with `BrowserRouter` but is fragile and can cause flash-of-404 issues. **Not recommended for CodeForge.**

### 1.3 CORS Considerations

Since CodeForge is a purely client-side application:

- **No CORS issues with static assets** — All JS, CSS, and WASM files are served from the same origin.
- **Third-party CDN fetches** — If loading Pyodide from a CDN (e.g., `cdn.jsdelivr.net`), CORS headers are typically set correctly by the CDN. However, **bundling Pyodide with the app** (or loading it from the same GitHub Pages origin) avoids CORS entirely and is recommended.
- **No API calls planned** — Since the project avoids external APIs, CORS should not be a concern in normal operation.

### 1.4 Service Worker for Offline Support

GitHub Pages fully supports service workers. A service worker can:

- **Cache the entire application shell** (HTML, CSS, JS bundles) for offline access.
- **Cache WASM runtimes** (Pyodide, etc.) so code execution works offline after first load.
- **Cache language support files** lazily — only cache what the user has used.

**Recommended approach:**

- Use **Workbox** (via `vite-plugin-pwa`) to generate a service worker automatically.
- Use a **cache-first strategy** for static assets and a **stale-while-revalidate** strategy for larger WASM files.
- Register the service worker in `main.tsx` after the app mounts.
- **Caveat:** Service workers on GitHub Pages are scoped to the repository's path (e.g., `/codeforge/`). This works fine but must be configured correctly with the `base` path in Vite.

---

## 2. Architecture Overview

### 2.1 Editor Component Selection: CodeMirror 6 (Recommended)

After extensive comparison, **CodeMirror 6** is the clear winner for CodeForge:

| Criterion | CodeMirror 6 | Monaco Editor |
|---|---|---|
| **Bundle size (minimal)** | ~700 KB (full featured: ~1.2 MB) | ~4–6 MB |
| **Mobile support** | Excellent — touch-aware, virtual keyboard handling | Poor — not designed for mobile, issues with touch |
| **Extensibility** | Composable extension system, very flexible | VS Code-specific API, harder to customize |
| **React integration** | `@codemirror/lang-*` + `@uiw/react-codemirror` | `@monaco-editor/react` (well-maintained) |
| **Language support** | 100+ languages via lazy-loaded packages | Built-in support but all bundled |
| **Emmet support** | Official `@emmetio/codemirror6-plugin` (WIP but usable) | Built-in |
| **Tree-shaking** | Excellent — import only what you need | Poor — monolithic bundle |
| **Performance** | Very fast, handles large files well | Good, but heavier memory footprint |
| **Theming** | Full theme system, CSS-based, very customizable | Theme support but less flexible |

**Verdict:** CodeMirror 6 aligns perfectly with CodeForge's requirements — lightweight, mobile-friendly, tree-shakeable, and extensible. Monaco's ~5 MB base bundle is too heavy for a GitHub Pages–hosted, fast-loading application.

### 2.2 High-Level Architecture

```
┌──────────────────────────────────────────────────────────┐
│                     CodeForge App                        │
├──────────────────────────────────────────────────────────┤
│  UI Layer (React + Tailwind CSS)                         │
│  ┌─────────────┐ ┌──────────────┐ ┌──────────────────┐  │
│  │ Editor Panel │ │ File Explorer │ │ Settings Panel   │  │
│  │ (CodeMirror) │ │ (Tree View)   │ │ (Themes, Prefs)  │  │
│  └──────┬───────┘ └──────┬───────┘ └──────┬───────────┘  │
│         │                │                 │              │
├─────────┴────────────────┴─────────────────┴──────────────┤
│  State Management Layer (Zustand)                         │
│  ┌──────────────┐ ┌───────────────┐ ┌─────────────────┐  │
│  │ Editor State  │ │ Project State │ │ Settings State   │  │
│  │ (tabs, cursor)│ │ (files, tree) │ │ (theme, keymap) │  │
│  └──────┬───────┘ └──────┬────────┘ └──────┬──────────┘  │
│         │                │                 │              │
├─────────┴────────────────┴─────────────────┴──────────────┤
│  Service Layer                                            │
│  ┌──────────────┐ ┌───────────────┐ ┌─────────────────┐  │
│  │ Storage Svc   │ │ Execution Svc │ │ Export/Import Svc│  │
│  │ (IndexedDB)   │ │ (Web Workers) │ │ (JSZip)          │  │
│  └──────────────┘ └───────────────┘ └─────────────────┘  │
│                                                           │
├───────────────────────────────────────────────────────────┤
│  Plugin / Extension System                                │
│  ┌──────────────┐ ┌───────────────┐ ┌─────────────────┐  │
│  │ Language Pkg  │ │ Formatter Pkg │ │ Theme Pkg        │  │
│  │ (lazy-loaded) │ │ (Prettier etc)│ │ (community)      │  │
│  └──────────────┘ └───────────────┘ └─────────────────┘  │
└───────────────────────────────────────────────────────────┘
```

### 2.3 State Management: Zustand (Recommended)

- **Zustand** is recommended over Redux for CodeForge because:
  - Minimal boilerplate — essential for a lightweight project.
  - Built-in support for **persisting state to localStorage/IndexedDB** via middleware.
  - Excellent TypeScript support.
  - ~1 KB bundle size vs. Redux's ~7 KB (plus React-Redux).
  - Supports **slices** for modular state (editor, project, settings).
  - Can be used outside React components (useful for service layer).

### 2.4 Multi-File Project State

Project files should be stored in IndexedDB with the following schema:

```
Project {
  id: string (UUID)
  name: string
  createdAt: timestamp
  updatedAt: timestamp
  files: FileNode[]  // Tree structure
}

FileNode {
  id: string
  name: string
  type: 'file' | 'folder'
  parentId: string | null
  content: string  // Only for files; stored separately in IndexedDB for lazy loading
  language: string  // Auto-detected from extension
}

EditorTab {
  fileId: string
  projectId: string
  isDirty: boolean
  cursorPosition: { line, column }
  scrollPosition: number
}
```

- **File contents** should be stored as separate IndexedDB records to avoid loading all files into memory.
- **Tab state** (open tabs, active tab, cursor positions) should be persisted to localStorage for quick restore on reload.
- **Auto-save** should write to IndexedDB on a debounce (e.g., 1 second after last keystroke).

### 2.5 Theme System Architecture

- Define themes as **CSS custom properties** (CSS variables) on the `:root` element.
- Each theme provides a complete set of variables: `--bg-primary`, `--text-primary`, `--accent`, `--border`, etc.
- CodeMirror themes are generated dynamically from the same variable values using CodeMirror 6's `EditorView.theme()`.
- Store the active theme preference in Zustand (persisted to localStorage).
- Ship with **4–6 built-in themes**: Light, Dark, Monokai, Solarized, Nord, Dracula.
- Support community themes via the plugin system.

### 2.6 Plugin / Extension Architecture

For future growth, CodeForge should adopt a **middleware/extension pattern**:

- **Extension manifest:** A JSON schema defining the extension's capabilities (languages, formatters, themes, keybindings).
- **Extension registry:** A central registry in the app that loads extensions on demand.
- **Extension API surface:**
  - `registerLanguage(id, syntaxHighlighter, autocompleteProvider)`
  - `registerFormatter(id, formatFn, filePatterns)`
  - `registerTheme(id, themeDefinition)`
  - `registerCommand(id, keybinding, handler)`
- **Loading mechanism:** Extensions can be:
  - Built-in (shipped with the app, lazy-loaded via dynamic imports).
  - User-provided (URLs or local JS files loaded at runtime — with security sandboxing).
- **Security:** User-provided extensions must be loaded in a sandboxed iframe or Web Worker to prevent XSS.

---

## 3. Vite + React Best Practices for GitHub Pages

### 3.1 Optimal Vite Configuration

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/codeforge/',  // Repository name; use '/' for custom domain
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,wasm}'],
        maximumFileSizeToCacheInBytes: 20 * 1024 * 1024, // 20 MB for WASM
      },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'codemirror-core': ['codemirror', '@codemirror/state', '@codemirror/view'],
          'codemirror-extensions': ['@codemirror/language', '@codemirror/autocomplete',
            '@codemirror/search', '@codemirror/lint'],
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'storage': ['idb', 'jszip'],
          'execution': [],  // Pyodide loaded dynamically
        },
      },
    },
    target: 'esnext',
    sourcemap: false,  // Disable for production to reduce size
    minify: 'terser',
    terserOptions: {
      compress: { drop_console: true, drop_debugger: true },
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'codemirror'],
  },
});
```

### 3.2 Hash Routing Setup

```typescript
// App.tsx
import { HashRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Editor />} />
          <Route path="settings" element={<Settings />} />
          <Route path="projects" element={<ProjectManager />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
```

### 3.3 Deployment via GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
      - uses: actions/deploy-pages@v4
```

### 3.4 Chunk Splitting Strategy

The key to fast loading on GitHub Pages is aggressive code splitting:

| Chunk | Contents | Est. Size | Loading Strategy |
|---|---|---|---|
| `app` | React, router, app shell | ~50 KB | Immediate |
| `codemirror-core` | CM6 core libraries | ~300 KB | Immediate (on editor mount) |
| `codemirror-ext` | Autocomplete, search, lint | ~200 KB | Lazy (on editor mount) |
| `lang-js` | JavaScript/TypeScript mode | ~80 KB | Lazy (on first .js file open) |
| `lang-html` | HTML mode | ~60 KB | Lazy (on first .html file open) |
| `lang-css` | CSS mode | ~50 KB | Lazy (on first .css file open) |
| `lang-python` | Python mode | ~40 KB | Lazy (on first .py file open) |
| `storage` | IndexedDB, JSZip | ~80 KB | Lazy (on first project load) |
| `pyodide` | Python runtime (WASM) | ~20 MB | Lazy (on first "Run" click) |
| `formatter` | Prettier, ESLint | ~500 KB | Lazy (on first format/lint) |

**Target initial load: < 500 KB transferred** (app shell + CM6 core).

---

## 4. Target Audience Analysis

### 4.1 Audience Definition: "Prosumers" of Code Editing

CodeForge targets users in the **gap between simple online editors and heavyweight IDEs**:

| Tool | Target | Why It Doesn't Fit |
|---|---|---|
| **VS Code / CodeSpaces** | Professional developers | Too heavy, requires install or server, overwhelming for learners |
| **CodePen / JSFiddle** | Quick prototyping, learners | Too simple, single-file only, no real project structure |
| **Notepad++** | Lightweight editing | Desktop-only, Windows-only, no browser execution |
| **Replit** | Students, hobbyists | Freemium with paywalls, server-dependent, privacy concerns |
| **StackBlitz** | Professional web devs | Server-dependent, heavy, focused on npm/Node ecosystems |

### 4.2 Feature Prioritization by Audience Segment

**Students/Learners (40% of target):**
- Zero-install, works on Chromebooks and school computers
- Built-in code execution (JS + Python) with visible console output
- Syntax highlighting and autocomplete to reduce errors
- Pre-built project templates (Hello World, Calculator, Todo App)
- Clear error messages and linting hints
- Mobile-responsive for tablet/smartphone use

**Hobbyists/Indie Developers (35% of target):**
- Multi-file project support with folder structure
- Export/Import as .zip for backup and sharing
- Prettier integration for consistent formatting
- Emmet support for fast HTML/CSS writing
- Multiple theme options for personal preference
- Offline support via service worker

**Professional Developers (25% of target):**
- Fast startup time (< 2 seconds to interactive)
- Keyboard shortcuts and configurable keybindings
- Code folding, multi-cursor, find & replace across files
- Language support for common web languages (JS, TS, HTML, CSS, JSON, Markdown, Python)
- Git-friendly workflow (export to .zip → commit manually)

### 4.3 Differentiation Strategy

What makes CodeForge unique:

1. **Zero friction:** Open a browser tab, start coding. No login, no install, no server.
2. **Real projects, not just snippets:** Multi-file project structure with folder hierarchy — unlike CodePen/JSFiddle.
3. **Offline-capable:** Service worker caches everything. Works on airplanes, in tunnels, at school.
4. **Privacy-first:** All code stays in the browser. No cloud sync, no analytics on code content, no accounts needed.
5. **Custom design:** A distinctive, non-generic UI that feels modern and unique — not a VS Code clone.
6. **Lightweight but capable:** Notepad++ simplicity with enough features for real work.

---

## 5. Open Source Considerations

### 5.1 License Recommendation: MIT License

The **MIT License** is recommended for CodeForge because:

- **Maximum adoption:** MIT is the most popular open-source license (~30% of all OSS projects). It allows anyone to use, modify, and distribute the code with minimal restrictions.
- **Community-friendly:** Contributors aren't forced to open-source their modifications, which encourages adoption by companies and individuals alike.
- **Simplicity:** The license is short and easy to understand — no legal complexity.
- **Ecosystem alignment:** React, Vite, CodeMirror, and most related tools use MIT or similar permissive licenses.
- **No copyleft concerns:** Unlike GPL, MIT doesn't require derivative works to be open-sourced, which is important for a tool that users may want to customize privately.

**Alternatives considered:**
- **Apache 2.0:** Good, but adds patent clause complexity. Unnecessary for this project.
- **GPL v3:** Too restrictive. Would prevent some users and companies from adopting the project.
- **AGPL v3:** Even more restrictive. Would require anyone hosting a modified version to share source code.

### 5.2 Repository Structure for Community Engagement

```
codeforge/
├── .github/
│   ├── workflows/
│   │   ├── deploy.yml          # GitHub Pages deployment
│   │   ├── ci.yml              # Lint, test, build checks
│   │   └── release.yml         # Automated releases
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.yml
│   │   ├── feature_request.yml
│   │   └── question.yml
│   ├── PULL_REQUEST_TEMPLATE.md
│   ├── CODE_OF_CONDUCT.md
│   ├── CONTRIBUTING.md
│   ├── SECURITY.md
│   └── dependabot.yml
├── src/
│   ├── components/
│   ├── stores/
│   ├── services/
│   ├── extensions/
│   ├── themes/
│   ├── hooks/
│   ├── utils/
│   └── types/
├── public/
│   └── favicon.svg
├── docs/
│   ├── architecture.md
│   ├── extensions-guide.md
│   └── deployment.md
├── LICENSE
├── README.md
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.ts
```

### 5.3 Contribution Guidelines

Key elements for `CONTRIBUTING.md`:

1. **Development setup:** Clear `npm install` → `npm run dev` → open browser instructions.
2. **Branch naming convention:** `feature/`, `fix/`, `docs/` prefixes.
3. **Commit message format:** Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`).
4. **PR requirements:** All CI checks must pass; at least one review; meaningful description.
5. **Code style:** Enforced via ESLint + Prettier (automated in CI).
6. **Testing requirements:** New features must include tests; bug fixes must include regression tests.
7. **Extension contributions:** Guide for adding new language modes, themes, and formatters.

### 5.4 Community Building Strategies

- **Good First Issues:** Tag approachable issues for new contributors.
- **Extension Gallery:** A community-driven collection of themes, language packs, and formatters.
- **Discord/Matrix server:** For real-time discussion and support.
- **Monthly community calls:** Short sync meetings for roadmap discussion.
- **Hacktoberfest participation:** Active participation in October to attract contributors.
- **Demo projects:** Showcase projects built entirely in CodeForge as inspiration.

---

## 6. Performance Constraints

### 6.1 Initial Load Time Targets

| Metric | Target | Strategy |
|---|---|---|
| First Contentful Paint (FCP) | < 1.0 s | Minimal app shell, inline critical CSS |
| Time to Interactive (TTI) | < 2.0 s | Code-split editor, lazy-load everything else |
| Largest Contentful Paint (LCP) | < 2.5 s | Preload CM6 core, skeleton UI |
| Cumulative Layout Shift (CLS) | < 0.1 | Fixed layout dimensions, skeleton screens |
| Total Transfer Size (initial) | < 500 KB | Aggressive chunking, tree-shaking |

### 6.2 Lazy Loading Strategy

**Phase 1 — Immediate (app shell, ~100 KB):**
- React, React Router, Zustand
- App layout, navigation, skeleton screens

**Phase 2 — On editor mount (~500 KB):**
- CodeMirror 6 core + essential extensions
- Active language mode (likely JS/HTML)
- Theme CSS

**Phase 3 — On demand:**
- Additional language modes: loaded when a file of that type is opened
- Prettier/ESLint: loaded on first format/lint action
- JSZip: loaded on first export/import action
- Pyodide: loaded on first "Run Python" click (~20 MB WASM download)

**Phase 4 — Background:**
- Service worker installation and caching
- Other language mode prefetching (for languages used in the current project)

### 6.3 Tree-Shaking Considerations

Vite (via Rollup) performs tree-shaking automatically, but it must be enabled correctly:

- **Use ES module imports only:** Never use CommonJS `require()`.
- **Avoid side-effect-heavy libraries:** Mark packages with `"sideEffects": false` in `package.json`.
- **CodeMirror 6 is tree-shakeable by design:** Only the extensions you import are included. This is a major advantage over Monaco.
- **Prettier is large (~500 KB):** Import only the parsers you need (e.g., `prettier/plugins/estree`, `prettier/plugins/html`), not the full bundle.
- **Use `import()` for dynamic loading:** Language modes, formatters, and Pyodide should all use dynamic imports to enable code splitting.

### 6.4 Browser Code Execution: Sandboxing Strategy

**JavaScript Execution:**
- Execute JS code in a **sandboxed iframe** with `sandbox="allow-scripts"` attribute.
- The iframe has no access to the parent page's DOM, cookies, or storage.
- Communication between CodeForge and the sandbox happens via `postMessage()`.
- Console output is captured by overriding `console.log/warn/error` inside the sandbox.
- Alternative: Use a **Web Worker** for JS execution. Workers have no DOM access but can compute. Output is sent back via `postMessage()`. This is cleaner but doesn't support `document.write()` or DOM manipulation.

**Python Execution (Pyodide):**
- Load Pyodide in a **dedicated Web Worker** to avoid blocking the main thread.
- Pyodide's WASM binary (~20 MB) is lazy-loaded only when the user clicks "Run Python."
- Once loaded, the worker stays alive for the session to avoid re-initialization.
- Communication via `postMessage()` with structured result objects (stdout, stderr, errors, return values).
- **Performance note:** Pyodide is 3–5× slower than native CPython. This is acceptable for educational/small scripts but should be communicated to users.
- **Storage concern:** The Pyodide WASM binary should be served from the same origin (bundled in `/public/`) to avoid CORS and ensure it's cached by the service worker.

### 6.5 Memory Management

- **Editor instances:** Only one CodeMirror instance should be active per tab. When switching tabs, save the editor state (cursor, scroll, selection) and destroy the old instance. Re-create on switch-back using `EditorState.create()`.
- **File contents:** Keep only the contents of open files in memory. Close files from IndexedDB when their tab is closed.
- **Pyodide worker:** Terminate after 5 minutes of inactivity to free ~100 MB of WASM memory.
- **Virtualized file tree:** For projects with 1000+ files, use a virtualized list component (e.g., `@tanstack/react-virtual`) for the file explorer.

### 6.6 Mobile Performance

- CodeMirror 6 has excellent mobile support with virtual keyboard handling.
- Use **responsive design** with Tailwind CSS breakpoints: sidebar collapses to a hamburger menu on mobile.
- **Touch-friendly targets:** All interactive elements must be at least 44×44 px.
- **Reduced features on mobile:** Hide file tree by default; use bottom sheet for settings; simplify toolbar.
- **Debounce input handling:** On mobile, debounce auto-save and linting to 2 seconds to reduce CPU usage.

---

## 7. Recommendations Summary

### Critical Path Decisions

| Decision | Recommendation | Rationale |
|---|---|---|
| Editor engine | **CodeMirror 6** | Lightweight, mobile-friendly, tree-shakeable, extensible |
| Routing | **HashRouter** | Works perfectly on GitHub Pages, no server config needed |
| State management | **Zustand** | Lightweight, simple, persistent middleware available |
| Storage | **IndexedDB** (primary) + **localStorage** (prefs) | IndexedDB handles large files; localStorage for small config |
| CSS framework | **Tailwind CSS 4** | Utility-first, tiny production bundle, responsive design |
| Python runtime | **Pyodide in Web Worker** | Only browser-native Python option; lazy-loaded |
| Export/Import | **JSZip** | Battle-tested, small (~30 KB), client-side ZIP creation |
| Service worker | **vite-plugin-pwa + Workbox** | Auto-generates SW, handles caching strategies |
| License | **MIT** | Maximum adoption, community-friendly, simple |
| Deployment | **GitHub Actions → GitHub Pages** | Automated, free, integrated with repo |

### Key Risks and Mitigations

| Risk | Severity | Mitigation |
|---|---|---|
| Pyodide 20 MB download | High | Lazy-load on demand; cache via service worker; show progress bar |
| GitHub Pages 1 GB repo limit | Medium | Host Pyodide WASM on CDN; compress builds; monitor size |
| Mobile UX complexity | Medium | Dedicated mobile layout; progressive disclosure; touch testing |
| IndexedDB data loss | Low | Auto-export reminders; clear data warnings; cloud sync as future feature |
| Browser storage eviction | Medium | Notify user about storage usage; encourage exports; request persistent storage via `navigator.storage.persist()` |
| Community adoption | Medium | Good docs, easy contribution path, demo projects, social presence |

### Technology Stack (Final)

```
Runtime:     React 18+ / TypeScript
Build:       Vite 5+ with Rollup
Editor:      CodeMirror 6 (@uiw/react-codemirror)
State:       Zustand with persist middleware
Storage:     IndexedDB (via idb library) + localStorage
Styling:     Tailwind CSS 4
Routing:     React Router 6 (HashRouter)
Execution:   Sandboxed iframe (JS) + Pyodide Web Worker (Python)
Export:      JSZip + FileSaver.js
PWA:         vite-plugin-pwa + Workbox
Linting:     ESLint (in-browser, pre-configured rules)
Formatting:  Prettier (lazy-loaded parsers)
CI/CD:       GitHub Actions
Hosting:     GitHub Pages
```

---

## References

- [GitHub Pages SPA Routing Discussion](https://github.com/orgs/community/discussions/64096)
- [rafgraph/spa-github-pages](https://github.com/rafgraph/spa-github-pages) — SPA hosting workaround
- [CodeMirror 6 Bundling Guide](https://codemirror.net/examples/bundle) — Bundle size optimization
- [Replit: Ace, CodeMirror, and Monaco Comparison](https://replit.com/blog/code-editors) — Editor comparison
- [Pyodide Documentation](https://pyodide.org/en/stable/) — Browser Python runtime
- [Pyodide Roadmap](https://pyodide.org/en/stable/project/roadmap.html) — Performance benchmarks
- [Web.dev: Storage for the Web](https://web.dev/articles/storage-for-the-web) — Browser storage limits
- [RxDB: IndexedDB Storage Limits](https://rxdb.info/articles/indexeddb-max-storage-limit.html) — Detailed quota analysis
- [emmetio/codemirror6-plugin](https://github.com/emmetio/codemirror6-plugin) — Official CM6 Emmet plugin
- [JSZip Documentation](https://stuk.github.io/jszip/) — Client-side ZIP creation
- [VitePWA Plugin](https://vite-pwa-org.netlify.app/) — PWA support for Vite
- [MIT License Guide (MIT TLO)](https://tlo.mit.edu/understand-ip/exploring-mit-open-source-license-comprehensive-guide)

---

*End of Report*
