# CodeForge — Comprehensive Project Research Report

**Report ID:** Generic-Research-1-FIN  
**Original Report:** Generic-Research-1-OGF  
**Date:** 2025-03-04  
**Finalized:** 2026-05-27  
**Prepared by:** Sub-Agent 1 (Generic Project Researcher)  
**Enriched with:** CodeCraft Project Plan v1.0

---

## Plan Integration Notes

This section maps each research finding from the original OGF report to the specific Task IDs and Phases in the [CodeCraft Project Plan](../Project-Plan.md). This mapping ensures traceability from research decisions to implementation tasks.

### Finding-to-Task Mapping

| # | Research Finding (OGF Section) | Plan Phase/Task ID | Implementation Detail |
|---|-------------------------------|---------------------|-----------------------|
| 1 | GitHub Pages hosting constraints (§1.1) | **PH0-04** | Configure Vite for GitHub Pages (`base` path, chunk splitting) |
| 2 | GitHub Pages deployment pipeline (§1.1) | **PH0-05** | GitHub Actions CI/CD workflow |
| 3 | Service Worker / offline support (§1.4) | **PH0-07** | Configure PWA (vite-plugin-pwa + Workbox) |
| 4 | HashRouter for SPA routing (§1.2) | **PH0-04** | HashRouter setup in Vite config + App.tsx |
| 5 | CORS considerations (§1.3) | **PH0-04**, **PH4-06** | Bundle assets from same origin; Pyodide served locally |
| 6 | CodeMirror 6 as editor engine (§2.1) | **PH1-02** | Create CodeMirror editor component with base extensions |
| 7 | Language detection & lazy-loading (§2.1, §6.2) | **PH1-03** | `@codemirror/language-data`, dynamic import on file open |
| 8 | Zustand state management (§2.3) | **PH1-01** | Three store slices: editorStore, projectStore, settingsStore |
| 9 | Multi-file project state / IndexedDB (§2.4) | **PH2-01** | Dexie.js database with full schema (projects, files, fileContents, binaryFiles, etc.) |
| 10 | Auto-save to IndexedDB (§2.4) | **PH1-11** | Debounced save (1s after last keystroke), dirty tracking |
| 11 | Tab state persistence (§2.4) | **PH1-06** | Open/close/switch/pin/reorder tabs, save/restore cursor & scroll state |
| 12 | Theme system architecture (§2.5) | **PH3-01** through **PH3-07** | CSS custom properties, `data-theme` attribute, CM6 `EditorView.theme`, custom theme editor |
| 13 | Plugin/extension architecture (§2.6) | **Long-term roadmap v2.0** | Extension system with `registerLanguage`, `registerFormatter`, `registerTheme`, `registerCommand` APIs |
| 14 | Vite configuration optimization (§3.1) | **PH0-04** | Manual chunk splitting, terser minification, base path |
| 15 | Deployment via GitHub Actions (§3.3) | **PH0-05** | Deploy workflow with upload-pages-artifact + deploy-pages |
| 16 | Chunk splitting strategy (§3.4) | **PH0-04**, **PH6-01** | Aggressive code splitting; performance audit to verify |
| 17 | JS execution in sandboxed iframe (§6.4) | **PH4-01** | Sandboxed iframe with `sandbox="allow-scripts"`, `srcdoc`, `postMessage` |
| 18 | Python execution via Pyodide (§6.4) | **PH4-06** | Lazy-load Pyodide in Web Worker, progress bar, session caching |
| 19 | HTML live preview (§6.4) | **PH4-02** | Sandboxed iframe rendering, hot reload on save |
| 20 | JSZip export/import (Rec. §7) | **PH2-07**, **PH2-08** | .zip export with project metadata; .zip import with validation |
| 21 | MIT License (§5.1) | **PH0-08** | Create README.md and LICENSE (MIT) |
| 22 | Repository structure (§5.2) | **PH0-03**, **PH6-09** | Project folder structure; GitHub repo setup with templates |
| 23 | Contribution guidelines (§5.3) | **PH6-08** | Documentation (CONTRIBUTING.md, architecture docs) |
| 24 | Community building (§5.4) | **PH6-08**, **PH6-09**, **PH6-10** | Documentation, repo setup, launch preparation |
| 25 | Performance targets (§6.1) | **PH6-01** | Performance audit & optimisation (Lighthouse, bundle analysis) |
| 26 | Lazy loading strategy (§6.2) | **PH0-04**, **PH1-03**, **PH4-06**, **PH5-01**, **PH5-04** | Lazy-load language modes, Pyodide, Prettier, ESLint |
| 27 | Tree-shaking considerations (§6.3) | **PH0-04**, **PH6-01** | ES module imports only; verified in performance audit |
| 28 | Memory management (§6.5) | **PH6-01** | Memory leak checks, virtualized file tree, Pyodide worker lifecycle |
| 29 | Mobile performance (§6.6) | **PH3-08** | Responsive design refinement, virtual keyboard handling |
| 30 | Formatter integration (Rec. §7) | **PH5-01**, **PH5-02**, **PH5-03** | Prettier in Web Worker + js-beautify as lightweight alternative |
| 31 | Linting integration (Rec. §7) | **PH5-04**, **PH5-05**, **PH5-06** | ESLint browser build in Web Worker + lightweight regex linting |
| 32 | Emmet support (Rec. §7) | **PH5-07**, **PH5-08** | Official CM6 Emmet plugin with Tab key priority handling |

### Key Decision Points — Plan Annotations

The following annotations mark critical decision points in the original report and indicate exactly where in the Project Plan each decision is implemented:

- **[PLAN: PH0-04]** — Decision to use HashRouter; implemented in Vite configuration and App.tsx routing setup
- **[PLAN: PH1-02]** — Decision to use CodeMirror 6; implemented as the core editor component wrapper
- **[PLAN: PH1-01]** — Decision to use Zustand; implemented as three modular store slices with persist middleware
- **[PLAN: PH2-01]** — Decision to use IndexedDB; implemented via Dexie.js (not raw idb as originally suggested — see refinements below)
- **[PLAN: PH3-01–PH3-07]** — Decision for CSS custom property theme system; expanded from 4–6 themes to 10 built-in themes plus custom theme editor
- **[PLAN: PH4-01]** — Decision for sandboxed iframe JS execution; extended to also include TypeScript via Sucrase transpilation
- **[PLAN: PH4-06]** — Decision for Pyodide in Web Worker; plan specifies v0.29.x (~12 MB download, not ~20 MB as originally estimated)
- **[PLAN: PH5-01]** — Decision for Prettier formatting; augmented with js-beautify as a lightweight fallback (PH5-02)
- **[PLAN: Long-term v2.0]** — Plugin/extension architecture deferred to v2.0 roadmap; not in initial launch scope

### Additional Insights & Refinements from Plan Context

After cross-referencing the OGF report with the full Project Plan, the following refinements and additional insights emerge:

1. **Dexie.js over raw idb:** The plan specifies `dexie` (v4.4.x) instead of the raw `idb` library for IndexedDB access. Dexie provides a richer query API, schema migration support, and better developer ergonomics — a sensible upgrade from the OGF recommendation.

2. **Expanded language execution:** The plan adds **JSCPP** (v2.0.x) for C/C++ execution and **Sucrase** (v3.35.x) for TypeScript transpilation, neither of which were in the original OGF report. This significantly broadens the editor's appeal beyond JS/Python.

3. **Dual-formatter strategy:** The plan introduces **js-beautify** (v1.15.x) as a lightweight formatter alongside Prettier. This addresses the OGF concern about Prettier's ~500 KB size by offering a fast, lightweight alternative for basic formatting needs (PH5-02).

4. **ESLint browser build:** The plan specifies `eslint-linter-browserify` (v10.4.x) rather than generic "ESLint in-browser." This is a pre-built browser-compatible ESLint bundle, avoiding the complexity of bundling ESLint for the browser from scratch.

5. **Theme expansion:** The OGF report recommended 4–6 built-in themes. The plan expands this to **10 built-in themes** with specific names (Cosmic Dusk, Morning Paper, Midnight Oil, Forest Canopy, Arctic Clear, Ember, Sakura, Terminal Green, Solar Flare, Blueprint) plus a custom theme editor — a richer out-of-the-box experience.

6. **Pyodide size revision:** The OGF report estimated Pyodide at ~20 MB. The plan specifies v0.29.x with a ~12 MB download. This reflects Pyodide's ongoing size optimisation and is a meaningful reduction in the primary performance risk.

7. **"Paper Desk" design philosophy:** The plan introduces a "Paper Desk" design identity — "the code is the star, everything else recedes until needed." This aligns with the OGF's "custom design, non-generic UI" differentiation but adds a specific philosophical framework: no persistent sidebar, tab-centric workspace, warm distinctive identity. This philosophy should guide all UI decisions across PH1–PH3.

8. **Binary file handling:** The plan adds binary file support (PH2-09) with ArrayBuffer storage, image/SVG preview, and binary-aware export/import — not addressed in the OGF report.

9. **Storage quota monitoring:** The plan adds PH2-12 (`navigator.storage.estimate()`, persistent storage requests, user warnings), directly mitigating the "browser storage eviction" risk identified in OGF §6.5.

10. **.editorconfig support:** The plan adds PH2-10 for `.editorconfig` parsing, a lightweight quality-of-life feature not mentioned in the OGF report.

11. **Command palette:** The plan includes a command palette (PH3-09, PH6-03) with fuzzy file search and command search — a pro-user feature that reinforces the "lightweight but capable" positioning from OGF §4.3.

12. **Project templates:** The plan adds starter templates (PH6-05) for Hello World, Calculator, Todo App, and Portfolio — directly serving the "Students/Learners" audience segment (40% of target per OGF §4.2).

13. **dnd-kit integration:** The plan specifies `@dnd-kit/core` (v6.3.x) for both tab reordering (PH1-07) and file moving (PH2-06), providing consistent drag-and-drop UX across the application.

14. **Initial load budget refined:** The OGF report targeted < 500 KB initial load. The plan's bundle size budget (§13) breaks this down precisely: app shell ~150 KB + CM6 core ~200 KB + 5 languages ~80 KB + Emmet ~30 KB + icons ~20 KB + Tailwind ~15 KB = **~495 KB** — meeting the target with margin.

15. **Extension system deferred:** The OGF report's detailed extension architecture (§2.6) is explicitly deferred to the v2.0 roadmap in the plan. This is a pragmatic scoping decision — the extension API surface (`registerLanguage`, `registerFormatter`, `registerTheme`, `registerCommand`) is documented for future implementation but won't block v1.0 launch.

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

GitHub Pages is a static-site hosting service, which imposes several critical constraints on CodeForge: *[PLAN: PH0-04 addresses deployment configuration; PH0-05 sets up automated CI/CD]*

- **No server-side processing:** All logic must execute in the browser. There is no backend, no serverless functions, no API proxies. Every feature — from code execution to file management — must be purely client-side.
- **Repository size limit:** The source repository must not exceed **1 GB**. This is a hard constraint for a project bundling editor libraries, language support, and Pyodide (which alone is ~20 MB for the core WASM + standard library). *[PLAN: PH6-01 includes bundle size monitoring; long-term roadmap considers CDN hosting for WASM runtimes]*
- **Published site size limit:** The built/deployed `dist` folder should stay under **1 GB** as well.
- **Bandwidth limit:** **100 GB/month** soft limit. For a code editor with heavy assets (WASM runtimes, language modes), this could be reached with moderate traffic.
- **Build time limit:** GitHub Actions (used for deployment) has a **10-minute build timeout**. Vite builds are fast, so this should not be an issue.
- **No custom HTTP headers:** GitHub Pages does not allow setting `Cache-Control`, `Content-Security-Policy`, or other headers. This limits caching strategies and security hardening.
- **No server-side redirects:** Only a single `404.html` fallback is available, which can be leveraged for SPA routing.

### 1.2 SPA Routing Strategy

*[PLAN: PH0-04 — HashRouter setup is part of Vite configuration for GitHub Pages]*

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
- **Third-party CDN fetches** — If loading Pyodide from a CDN (e.g., `cdn.jsdelivr.net`), CORS headers are typically set correctly by the CDN. However, **bundling Pyodide with the app** (or loading it from the same GitHub Pages origin) avoids CORS entirely and is recommended. *[PLAN: PH4-06 specifies Pyodide served from same origin for CORS avoidance and service worker caching]*
- **No API calls planned** — Since the project avoids external APIs, CORS should not be a concern in normal operation.

### 1.4 Service Worker for Offline Support

*[PLAN: PH0-07 — Configure PWA (vite-plugin-pwa + Workbox)]*

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

*[PLAN: PH1-02 — Create CodeMirror editor component; PH1-03 — Language detection & lazy-loading]*

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

*[PLAN: PH0-03 — Project folder structure mirrors this architecture]*

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

*[PLAN: PH1-01 — Implement Zustand store slices: editorStore, projectStore, settingsStore]*

- **Zustand** is recommended over Redux for CodeForge because:
  - Minimal boilerplate — essential for a lightweight project.
  - Built-in support for **persisting state to localStorage/IndexedDB** via middleware.
  - Excellent TypeScript support.
  - ~1 KB bundle size vs. Redux's ~7 KB (plus React-Redux).
  - Supports **slices** for modular state (editor, project, settings).
  - Can be used outside React components (useful for service layer).

### 2.4 Multi-File Project State

*[PLAN: PH2-01 — Dexie.js database implementation; PH1-06 — Tab state management; PH1-11 — Auto-save]*

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

> **Plan Refinement:** The plan expands the IndexedDB schema beyond the OGF proposal. PH2-01 specifies Dexie.js tables for: projects, files, fileContents, binaryFiles, settings, customThemes, and autoSaves. This is more granular — file contents are separated from file metadata, and binary files get their own table with ArrayBuffer storage. The plan also adds PH2-09 for binary file handling (image/SVG preview, ArrayBuffer storage, binary-aware export/import) and PH2-12 for storage quota monitoring.

### 2.5 Theme System Architecture

*[PLAN: PH3-01 — CSS custom property system; PH3-02–PH3-04 — 10 built-in themes; PH3-05 — Theme switching; PH3-07 — Custom Theme Editor]*

- Define themes as **CSS custom properties** (CSS variables) on the `:root` element.
- Each theme provides a complete set of variables: `--bg-primary`, `--text-primary`, `--accent`, `--border`, etc.
- CodeMirror themes are generated dynamically from the same variable values using CodeMirror 6's `EditorView.theme()`.
- Store the active theme preference in Zustand (persisted to localStorage).
- Ship with **4–6 built-in themes**: Light, Dark, Monokai, Solarized, Nord, Dracula.
- Support community themes via the plugin system.

> **Plan Refinement:** The plan significantly expands the theme offering from 4–6 to **10 built-in themes** with distinctive names aligned to the "Paper Desk" design philosophy: Cosmic Dusk (default dark), Morning Paper (default light), Midnight Oil, Forest Canopy, Arctic Clear, Ember, Sakura, Terminal Green, Solar Flare, Blueprint. The plan also adds a full **Custom Theme Editor** (PH3-07) with live preview, color pickers, JSON import/export, and IndexedDB persistence — going beyond the OGF's "community themes via plugin system" vision with an immediate, user-friendly theming experience.

### 2.6 Plugin / Extension Architecture

*[PLAN: Deferred to Long-term roadmap v2.0 — Extension system]*

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

> **Plan Insight:** The extension architecture documented here is explicitly deferred to the v2.0 roadmap. The API surface design (`registerLanguage`, `registerFormatter`, `registerTheme`, `registerCommand`) is preserved for future implementation. The v2.0 roadmap also adds real-time collaboration, Git integration, Live Share, and LSP client — none of which were in the original OGF scope.

---

## 3. Vite + React Best Practices for GitHub Pages

### 3.1 Optimal Vite Configuration

*[PLAN: PH0-04 — Configure Vite for GitHub Pages]*

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

> **Plan Refinement:** The plan's technology stack (§2) replaces `idb` with `dexie` in the storage chunk. The manual chunks configuration should be updated to reflect `'storage': ['dexie', 'jszip']`. Additionally, the plan adds `sucrase` for TS transpilation and `JSCPP` for C/C++ execution, which may warrant additional chunk entries (e.g., `'transpilation': ['sucrase']` and `'cpp-execution': ['JSCPP']`).

### 3.2 Hash Routing Setup

*[PLAN: PH0-04 — HashRouter is part of the GitHub Pages Vite configuration]*

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

*[PLAN: PH0-05 — Set up GitHub Actions CI/CD]*

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

*[PLAN: PH0-04 — Chunk splitting; PH6-01 — Performance audit verifies sizes]*

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

> **Plan Refinement:** The plan's bundle size budget (§13) provides more precise estimates with gzipped sizes: App shell ~150 KB, CM6 core ~200 KB, 5 common languages ~80 KB, Emmet ~30 KB, Lucide icons ~20 KB, Tailwind CSS ~15 KB = **~495 KB initial load**. The plan also adds JSCPP (~50 KB) as immediately included for C/C++ support, and separates Prettier (~600 KB) from ESLint (~2.5 MB) with different lazy-load triggers. Pyodide is estimated at ~12 MB in the plan (down from ~20 MB here), reflecting improvements in Pyodide v0.29.x.

---

## 4. Target Audience Analysis

### 4.1 Audience Definition: "Prosumers" of Code Editing

*[PLAN: §1 Project Vision — Directly aligned with "Paper Desk" design philosophy]*

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
- Pre-built project templates (Hello World, Calculator, Todo App) *[PLAN: PH6-05 — Project templates: Hello World (JS/Python/HTML), Calculator, Todo App, Portfolio]*
- Clear error messages and linting hints
- Mobile-responsive for tablet/smartphone use

**Hobbyists/Indie Developers (35% of target):**
- Multi-file project support with folder structure *[PLAN: PH2-01–PH2-06 — Full project/file management]*
- Export/Import as .zip for backup and sharing *[PLAN: PH2-07, PH2-08]*
- Prettier integration for consistent formatting *[PLAN: PH5-01]*
- Emmet support for fast HTML/CSS writing *[PLAN: PH5-07]*
- Multiple theme options for personal preference *[PLAN: PH3-01–PH3-07 — 10 themes + custom editor]*
- Offline support via service worker *[PLAN: PH0-07]*

**Professional Developers (25% of target):**
- Fast startup time (< 2 seconds to interactive) *[PLAN: §14 Success Metrics — TTI < 2.0s]*
- Keyboard shortcuts and configurable keybindings *[PLAN: PH6-02]*
- Code folding, multi-cursor, find & replace across files *[PLAN: PH1-02 — CM6 base extensions]*
- Language support for common web languages (JS, TS, HTML, CSS, JSON, Markdown, Python) *[PLAN: PH1-03 — Language detection & lazy-loading]*
- Git-friendly workflow (export to .zip → commit manually)

### 4.3 Differentiation Strategy

What makes CodeForge unique:

1. **Zero friction:** Open a browser tab, start coding. No login, no install, no server.
2. **Real projects, not just snippets:** Multi-file project structure with folder hierarchy — unlike CodePen/JSFiddle.
3. **Offline-capable:** Service worker caches everything. Works on airplanes, in tunnels, at school.
4. **Privacy-first:** All code stays in the browser. No cloud sync, no analytics on code content, no accounts needed.
5. **Custom design:** A distinctive, non-generic UI that feels modern and unique — not a VS Code clone. *[PLAN: "Paper Desk" philosophy — code is the star, everything else recedes until needed. No persistent sidebar, tab-centric workspace.]*
6. **Lightweight but capable:** Notepad++ simplicity with enough features for real work.

---

## 5. Open Source Considerations

### 5.1 License Recommendation: MIT License

*[PLAN: PH0-08 — Create README.md and LICENSE (MIT)]*

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

*[PLAN: PH0-03 — Project folder structure; PH6-09 — GitHub repo setup with issue templates, PR template, dependabot]*

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

> **Plan Refinement:** The plan adds `src/workers/` to the folder structure (for Web Workers running Pyodide, Prettier, and ESLint). The plan also adds `src/stores/` explicitly for Zustand store slices, which aligns with the structure above. The `src/extensions/` directory is relevant for v2.0 when the extension system is implemented.

### 5.3 Contribution Guidelines

*[PLAN: PH6-08 — Documentation includes CONTRIBUTING.md, architecture docs, extension guide, deployment guide]*

Key elements for `CONTRIBUTING.md`:

1. **Development setup:** Clear `npm install` → `npm run dev` → open browser instructions.
2. **Branch naming convention:** `feature/`, `fix/`, `docs/` prefixes.
3. **Commit message format:** Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`).
4. **PR requirements:** All CI checks must pass; at least one review; meaningful description.
5. **Code style:** Enforced via ESLint + Prettier (automated in CI).
6. **Testing requirements:** New features must include tests; bug fixes must include regression tests.
7. **Extension contributions:** Guide for adding new language modes, themes, and formatters.

### 5.4 Community Building Strategies

*[PLAN: PH6-08, PH6-09, PH6-10 — Documentation, repo setup, and launch preparation address community building]*

- **Good First Issues:** Tag approachable issues for new contributors.
- **Extension Gallery:** A community-driven collection of themes, language packs, and formatters.
- **Discord/Matrix server:** For real-time discussion and support.
- **Monthly community calls:** Short sync meetings for roadmap discussion.
- **Hacktoberfest participation:** Active participation in October to attract contributors.
- **Demo projects:** Showcase projects built entirely in CodeForge as inspiration.

> **Plan Insight:** The plan's success metrics (§14) include "GitHub Stars (first 3 months): 500+" and "Community contributions (first 3 months): 20+ PRs," providing concrete targets for community building efforts.

---

## 6. Performance Constraints

### 6.1 Initial Load Time Targets

*[PLAN: PH6-01 — Performance audit & optimisation; §14 Success Metrics]*

| Metric | Target | Strategy |
|---|---|---|
| First Contentful Paint (FCP) | < 1.0 s | Minimal app shell, inline critical CSS |
| Time to Interactive (TTI) | < 2.0 s | Code-split editor, lazy-load everything else |
| Largest Contentful Paint (LCP) | < 2.5 s | Preload CM6 core, skeleton UI |
| Cumulative Layout Shift (CLS) | < 0.1 | Fixed layout dimensions, skeleton screens |
| Total Transfer Size (initial) | < 500 KB | Aggressive chunking, tree-shaking |

> **Plan Alignment:** The plan's success metrics (§14) mirror these targets exactly and add: Lighthouse Performance score > 90. The plan's bundle size budget (§13) confirms the < 500 KB initial transfer target at ~495 KB gzipped.

### 6.2 Lazy Loading Strategy

*[PLAN: PH0-04 — Chunk splitting; PH1-03 — Language lazy-loading; PH4-06 — Pyodide lazy-loading; PH5-01 — Prettier lazy-loading; PH5-04 — ESLint lazy-loading]*

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

> **Plan Refinement:** The plan adds JSCPP (~50 KB, included immediately for C/C++ support), Sucrase (for TS→JS transpilation), and js-beautify (lightweight formatter loaded as Prettier alternative). ESLint is estimated at ~2.5 MB in the plan (larger than the ~500 KB combined formatter estimate here), justifying its own separate lazy-load trigger. The plan also specifies Dexie.js + JSZip as a combined ~80 KB lazy-loaded chunk on first project load.

### 6.3 Tree-Shaking Considerations

*[PLAN: PH0-04 — Vite configuration; PH6-01 — Performance audit verifies tree-shaking effectiveness]*

Vite (via Rollup) performs tree-shaking automatically, but it must be enabled correctly:

- **Use ES module imports only:** Never use CommonJS `require()`.
- **Avoid side-effect-heavy libraries:** Mark packages with `"sideEffects": false` in `package.json`.
- **CodeMirror 6 is tree-shakeable by design:** Only the extensions you import are included. This is a major advantage over Monaco.
- **Prettier is large (~500 KB):** Import only the parsers you need (e.g., `prettier/plugins/estree`, `prettier/plugins/html`), not the full bundle.
- **Use `import()` for dynamic loading:** Language modes, formatters, and Pyodide should all use dynamic imports to enable code splitting.

### 6.4 Browser Code Execution: Sandboxing Strategy

*[PLAN: PH4-01 — JS execution; PH4-02 — HTML preview; PH4-03 — TypeScript via Sucrase; PH4-06 — Python via Pyodide; PH4-07 — C/C++ via JSCPP]*

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

> **Plan Refinements:**
> - The plan adds **TypeScript execution** via Sucrase transpilation (PH4-03): TS → JS transpilation, then run through the iframe sandbox. This addresses a gap in the OGF report which only covered JS and Python.
> - The plan adds **C/C++ execution** via JSCPP (PH4-07), a lightweight (~50 KB) interpreter for basic C++ support. The plan notes a "display limitations warning" — acknowledging JSCPP is suitable for learning, not production C++.
> - The plan adds **HTML live preview** as a dedicated feature (PH4-02) with sandboxed iframe rendering and hot reload on save — a key feature for web development workflows.
> - The plan refines the Pyodide size to ~12 MB (v0.29.x), down from the ~20 MB estimate here.
> - The plan adds **multi-file project execution** (PH4-09) for linking CSS/JS files in HTML preview and resolving imports within project files.

### 6.5 Memory Management

*[PLAN: PH6-01 — Performance audit includes memory leak checks]*

- **Editor instances:** Only one CodeMirror instance should be active per tab. When switching tabs, save the editor state (cursor, scroll, selection) and destroy the old instance. Re-create on switch-back using `EditorState.create()`.
- **File contents:** Keep only the contents of open files in memory. Close files from IndexedDB when their tab is closed.
- **Pyodide worker:** Terminate after 5 minutes of inactivity to free ~100 MB of WASM memory.
- **Virtualized file tree:** For projects with 1000+ files, use a virtualized list component (e.g., `@tanstack/react-virtual`) for the file explorer.

> **Plan Insight:** The plan's PH2-12 (Storage quota monitoring) directly addresses the "browser storage eviction" risk with `navigator.storage.estimate()` and `navigator.storage.persist()` — proactive measures beyond the OGF's reactive "notify user" approach.

### 6.6 Mobile Performance

*[PLAN: PH3-08 — Refine responsive design; PH1-05 — Mobile Tab Bar]*

- CodeMirror 6 has excellent mobile support with virtual keyboard handling.
- Use **responsive design** with Tailwind CSS breakpoints: sidebar collapses to a hamburger menu on mobile.
- **Touch-friendly targets:** All interactive elements must be at least 44×44 px.
- **Reduced features on mobile:** Hide file tree by default; use bottom sheet for settings; simplify toolbar.
- **Debounce input handling:** On mobile, debounce auto-save and linting to 2 seconds to reduce CPU usage.

> **Plan Refinement:** The "Paper Desk" philosophy reinforces mobile-first thinking — "no persistent sidebar" means the mobile experience is not a degraded desktop experience, but the canonical design. The plan adds a dedicated mobile Tab Bar component (PH1-05) with file type icons, Run button, and touch-friendly targets, and PH3-08 specifically tests and adjusts all breakpoints (xs through 2xl).

---

## 7. Recommendations Summary

### Critical Path Decisions

*[Each decision mapped to its implementing Phase/Task ID]*

| Decision | Recommendation | Rationale | Plan Implementation |
|---|---|---|---|
| Editor engine | **CodeMirror 6** | Lightweight, mobile-friendly, tree-shakeable, extensible | PH1-02, PH1-03 |
| Routing | **HashRouter** | Works perfectly on GitHub Pages, no server config needed | PH0-04 |
| State management | **Zustand** | Lightweight, simple, persistent middleware available | PH1-01 |
| Storage | **IndexedDB** (primary) + **localStorage** (prefs) | IndexedDB handles large files; localStorage for small config | PH2-01 (Dexie.js) |
| CSS framework | **Tailwind CSS 4** | Utility-first, tiny production bundle, responsive design | PH0-02 |
| Python runtime | **Pyodide in Web Worker** | Only browser-native Python option; lazy-loaded | PH4-06 |
| C/C++ runtime | **JSCPP** *(plan addition)* | Lightweight interpreter for basic C++ support | PH4-07 |
| TS transpilation | **Sucrase** *(plan addition)* | Fast TS→JS for browser execution | PH4-03 |
| Export/Import | **JSZip** | Battle-tested, small (~30 KB), client-side ZIP creation | PH2-07, PH2-08 |
| Service worker | **vite-plugin-pwa + Workbox** | Auto-generates SW, handles caching strategies | PH0-07 |
| License | **MIT** | Maximum adoption, community-friendly, simple | PH0-08 |
| Deployment | **GitHub Actions → GitHub Pages** | Automated, free, integrated with repo | PH0-05 |

### Key Risks and Mitigations

*[Cross-referenced with Project Plan §12 Risk Register]*

| Risk | Severity | Mitigation (OGF) | Plan Task |
|---|---|---|---|
| Pyodide 20 MB download | High | Lazy-load on demand; cache via service worker; show progress bar | PH4-06 (progress bar, service worker caching) |
| GitHub Pages 1 GB repo limit | Medium | Host Pyodide WASM on CDN; compress builds; monitor size | PH6-01 (bundle size monitoring in CI) |
| Mobile UX complexity | Medium | Dedicated mobile layout; progressive disclosure; touch testing | PH1-05, PH3-08 |
| IndexedDB data loss | Low | Auto-export reminders; clear data warnings; cloud sync as future feature | PH2-12 (quota monitoring, persistent storage) |
| Browser storage eviction | Medium | Notify user about storage usage; encourage exports; request persistent storage via `navigator.storage.persist()` | PH2-12 |
| Community adoption | Medium | Good docs, easy contribution path, demo projects, social presence | PH6-08, PH6-09, PH6-10 |

> **Plan Additions to Risk Register:**
> - **Emmet Tab key conflicts with autocomplete** (Low severity, Medium probability) — Mitigated by PH5-08 (configurable keymap, context-aware Tab behavior)
> - **JSCPP limitations frustrate C++ users** (Low severity, High probability) — Mitigated by clear "Basic C++ support for learning" warning label (PH4-07)

### Technology Stack (Final)

*[Updated with plan refinements — additions marked with ★]*

```
Runtime:       React 18+ / TypeScript
Build:         Vite 5+ with Rollup
Editor:        CodeMirror 6 (@uiw/react-codemirror)
Language Data: @codemirror/language-data ★
State:         Zustand with persist middleware
Storage:       Dexie.js (IndexedDB) ★ + localStorage
Styling:       Tailwind CSS 4
Routing:       React Router 6 (HashRouter)
Emmet:         @emmetio/codemirror6-plugin ★
Execution:     Sandboxed iframe (JS) + Sucrase (TS) ★ + Pyodide Web Worker (Python) + JSCPP (C/C++) ★
Export:        JSZip + FileSaver.js
Drag-and-Drop: @dnd-kit/core ★
Icons:         Lucide React ★
PWA:           vite-plugin-pwa + Workbox
Formatting:    Prettier (lazy-loaded parsers) + js-beautify (lightweight) ★
Linting:       eslint-linter-browserify (in Web Worker) ★ + @codemirror/lint ★
CI/CD:         GitHub Actions
Hosting:       GitHub Pages
```

★ = Added/refined in the Project Plan beyond the original OGF report

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
- **CodeCraft Project Plan v1.0** — Source for task IDs, phase structure, and technology refinements

---

*End of Report — Generic-Research-1-FIN*
