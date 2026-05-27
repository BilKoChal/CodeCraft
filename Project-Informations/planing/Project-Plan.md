# CodeCraft — Project Plan

**Created:** 2026-05-28  
**Status:** Phase 0 — Planning Complete  
**Version:** 1.0

---

## 1. Project Overview

**CodeCraft** is a fast, zero-install, browser-based code editor for multi-file projects. It requires no backend, is privacy-first, and deploys to GitHub Pages. Built with React + TypeScript + Vite + CodeMirror 6, it aims to deliver a professional IDE experience entirely in the browser with local code execution support.

### Core Principles

- **Zero install** — Open a URL, start coding. No setup, no accounts, no backend.
- **Privacy first** — All data stays in the browser (IndexedDB + localStorage). Nothing leaves the device.
- **Fast** — Target <170KB gzipped initial load. Skeleton loading, code-split languages.
- **Progressive** — Phase 0 delivers a polished prototype; each phase adds depth without breaking what works.

---

## 2. Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **UI Framework** | React 19 + TypeScript 5 | Type safety, component ecosystem, DX |
| **Editor Engine** | CodeMirror 6 via `@uiw/react-codemirror` | Lightweight, extensible, best React integration |
| **Build Tool** | Vite 6 | Fast HMR, native ESM, Rollup code-splitting |
| **Styling** | CSS Custom Properties + CSS Modules | Pixel-precise IDE layouts, zero-runtime theming |
| **Layout** | `react-resizable-panels` | 8KB, built by React team member, auto-persists layout |
| **State** | Zustand + persist + immer middleware | 1KB, selector re-renders, localStorage sync |
| **Persistence** | Dexie.js (IndexedDB) + localStorage | Reactive queries via `useLiveQuery`, schema migrations |
| **ZIP** | fflate (~8KB gzipped) | Fastest bidirectional ZIP library |
| **Icons** | Lucide React | Tree-shakeable, MIT, 1600+ icons, ~5KB for 20 icons |
| **PWA** | `vite-plugin-pwa` + Workbox | Auto service worker + manifest, offline support |
| **Routing** | Hash routing (Phase 0), Browser routing (Phase 1) | Zero GitHub Pages config issues |
| **Deploy** | GitHub Actions → GitHub Pages | Automatic on push to main |
| **Code Runner** | Web Worker + Blob URL + `new Function('console', code)` | Off-thread, terminatable, sandboxed JS execution |
| **TS Transpilation** | Sucrase (~150KB) | Fast type stripping for Phase 0 |

---

## 3. Phase 0 — Quick Prototyping (v1.0)

**Goal:** A working, polished single-language code editor that creates a strong first impression. Deployable in ~7-8 days.

**Motto:** "Open the page, see a professional IDE, type code, see output — in under 5 seconds."

### 3.1 Phase 0 Features

| # | Feature | Priority | Description |
|---|---------|----------|-------------|
| P0-01 | Code Editor (JS/JSX) | Must | CodeMirror 6 with syntax highlighting, line numbers, bracket matching, auto-close brackets, basic autocomplete |
| P0-02 | File Tree Sidebar | Must | Collapsible, flat file list, context menu (new/rename/delete), file icons by type |
| P0-03 | Multi-file Tabs | Must | Open multiple files, switch tabs, close buttons, modified indicator dot, horizontal scroll overflow |
| P0-04 | JS Code Runner | Must | Run JavaScript in sandboxed Web Worker, capture console output, timeout protection |
| P0-05 | Console Output Panel | Must | Display console.log/warn/error/info, clear button, ANSI-style coloring |
| P0-06 | Auto-save to IndexedDB | Must | Debounced 1s save on every change via Dexie.js |
| P0-07 | Dark Theme | Must | Catppuccin Mocha-inspired dark theme, single theme, CSS custom properties |
| P0-08 | Project CRUD | Must | Create, open, delete projects; project list landing page |
| P0-09 | ZIP Export/Import | Must | Download project as .zip, upload .zip to create project |
| P0-10 | Status Bar | Should | Line/column, language indicator, encoding, save status |
| P0-11 | PWA | Should | Installable, offline-capable, manifest + service worker |
| P0-12 | Keyboard Shortcuts | Should | Ctrl+S save, Ctrl+B toggle sidebar, Ctrl+J toggle panel, Ctrl+W close tab, Ctrl+/ comment |
| P0-13 | Live Preview | Should | Sandboxed iframe with srcdoc for HTML/CSS/JS preview, debounced auto-refresh |
| P0-14 | Skeleton Loading | Should | Show IDE structure outline while assets load |

### 3.2 Phase 0 — What's NOT Included

- ❌ Multiple language support (only JS/JSX in Phase 0)
- ❌ Nested folder support in file tree
- ❌ Light theme / theme switcher
- ❌ Settings modal
- ❌ Search & replace across files (current-file only via CM6)
- ❌ Terminal (xterm.js)
- ❌ Collaboration
- ❌ Drag and drop
- ❌ TypeScript execution (syntax highlighting only)

### 3.3 Phase 0 Milestones

| Milestone | Days | Deliverable |
|-----------|------|-------------|
| **M1: Project Scaffold** | Day 1 | Vite + React + TS + Zustand + Dexie + Tailwind/CSS setup, folder structure, GitHub Actions |
| **M2: Editor Integration** | Day 2-3 | CodeMirror 6 with JS support, tab system, auto-save |
| **M3: File Management** | Day 3-4 | File tree sidebar, new/delete/rename file, IndexedDB persistence |
| **M4: Project Management** | Day 4-5 | Create/delete project, project list page, ZIP import/export |
| **M5: Code Runner + Console** | Day 5-6 | Web Worker JS execution, console capture, output panel |
| **M6: Polish + PWA** | Day 6-7 | Dark theme, status bar, keyboard shortcuts, PWA manifest, live preview |
| **M7: Deploy + Test** | Day 7-8 | GitHub Pages deploy, cross-browser testing, bug fixes |

### 3.4 Phase 0 Task Breakdown

| Task ID | Task | Milestone | Estimated Effort | Sub-agents |
|---------|------|-----------|------------------|------------|
| TASK-01 | Project scaffold (Vite + React + TS + deps + GitHub Actions) | M1 | 0.5 day | No |
| TASK-02 | Zustand stores (project, editor, UI, console) | M1 | 0.5 day | No |
| TASK-03 | Dexie database schema + queries | M1 | 0.5 day | No |
| TASK-04 | CodeMirror 6 editor component | M2 | 1 day | Optional |
| TASK-05 | Tab bar component | M2 | 0.5 day | No |
| TASK-06 | Auto-save hook | M2 | 0.5 day | No |
| TASK-07 | File tree sidebar component | M3 | 1 day | Optional |
| TASK-08 | File CRUD operations (IndexedDB) | M3 | 0.5 day | No |
| TASK-09 | Project list page + CRUD | M4 | 1 day | Optional |
| TASK-10 | ZIP import/export (fflate) | M4 | 0.5 day | No |
| TASK-11 | JS code runner (Web Worker) | M5 | 1 day | Optional |
| TASK-12 | Console output panel | M5 | 0.5 day | No |
| TASK-13 | Dark theme + CSS custom properties | M6 | 0.5 day | No |
| TASK-14 | Status bar component | M6 | 0.5 day | No |
| TASK-15 | Keyboard shortcuts | M6 | 0.5 day | No |
| TASK-16 | PWA setup (vite-plugin-pwa) | M6 | 0.5 day | No |
| TASK-17 | Live preview (iframe + srcdoc) | M6 | 0.5 day | No |
| TASK-18 | Skeleton loading states | M6 | 0.25 day | No |
| TASK-19 | Deploy + cross-browser testing | M7 | 1 day | No |
| TASK-20 | Sample project template | M7 | 0.25 day | No |

---

## 4. Phase 1 — Multi-File Workflows & Languages (v1.1)

**Goal:** Transform CodeCraft from a single-language prototype into a multi-language, multi-project workspace.

| # | Feature | Description |
|---|---------|---------|
| P1-01 | Multi-language syntax | HTML, CSS, JSON, TypeScript highlighting (lazy-loaded CM6 language packages) |
| P1-02 | TypeScript execution | Sucrase transpilation in Web Worker |
| P1-03 | Nested folders | Folder hierarchy in file tree, create/rename/move folders |
| P1-04 | Light theme + theme switcher | Light/dark/system preference toggle |
| P1-05 | Settings modal | Font size, tab size, word wrap, auto-save config |
| P1-06 | Search & replace across files | Dedicated sidebar search panel |
| P1-07 | Multiple projects | Project list with switching |
| P1-08 | File rename/move | Between folders |
| P1-09 | Browser routing | Switch from hash to browser routing + 404.html trick |
| P1-10 | Python support | Pyodide integration (lazy-loaded from CDN) |
| P1-11 | CSS hot reload | Inject CSS updates without full iframe refresh |

---

## 5. Phase 2 — Advanced Editor Features (v2.0)

**Goal:** Professional-grade features that make CodeCraft competitive with desktop editors.

| # | Feature | Description |
|---|---------|---------|
| P2-01 | Terminal | xterm.js integration for interactive stdin/stdout |
| P2-02 | Drag and drop | @dnd-kit for file tree reordering and tab reordering |
| P2-03 | C language support | JSCPP integration |
| P2-04 | Lua support | wasmoon (~460KB WASM) |
| P2-05 | Ruby support | Opal transpiler (~2MB) |
| P2-06 | Emmet support | HTML/CSS abbreviation expansion |
| P2-07 | Linting | ESLint integration via Web Workers |
| P2-08 | Pinned tabs | Icon-only tabs locked to the left |
| P2-09 | Template projects | Starter templates (React, Vanilla JS, Python, etc.) |
| P2-10 | Split editor | Side-by-side editing |

---

## 6. Phase 3 — Power User Features (v3.0)

**Goal:** Feature-complete IDE with runtime support for compiled languages.

| # | Feature | Description |
|---|---------|---------|
| P3-01 | C++ support | CheerpX (x86-to-WASM virtualization) |
| P3-02 | Java support | CheerpJ (full JVM in WASM) |
| P3-03 | PHP support | @php-wasm/web |
| P3-04 | HMR for JS | Hot module replacement in live preview |
| P3-05 | Minimap | Code minimap like VS Code |
| P3-06 | Custom themes | User-created editor themes |
| P3-07 | Snippets library | User-defined code snippets |
| P3-08 | Git/Gist integration | Export/import from GitHub Gist (client-side OAuth) |
| P3-09 | Extension system | Plugin API for community extensions |
| P3-10 | Mobile responsive preview | Device frame toggle (iPhone, iPad, Desktop) |
| P3-11 | Collaboration | WebRTC-based real-time editing |

---

## 7. Architecture Summary

### 7.1 Data Flow

```
User → CodeMirror Editor → Zustand Store → Dexie.js (IndexedDB)
                                    ↓
                              Auto-save (1s debounce)
                                    ↓
                              ZIP Export (fflate)
```

### 7.2 Code Execution Flow

```
User clicks "Run" → JSRunner.execute(code)
                       ↓
                  Create Blob-URL Web Worker
                       ↓
                  new Function('console', code)
                       ↓
                  Mock console captures output
                       ↓
                  postMessage → Main Thread
                       ↓
                  Console Store → Console UI
```

### 7.3 Live Preview Flow

```
File changes → Debounce 300ms → Build srcdoc HTML
                                       ↓
                                  iframe.srcdoc = html
                                       ↓
                                  Sandboxed rendering
```

### 7.4 Component Tree

```
<App>
  <ThemeProvider>
    <WorkspaceLayout>
      <PanelGroup direction="horizontal">
        <Panel> → <Sidebar> → <FileTree>
        <PanelResizeHandle />
        <Panel>
          <PanelGroup direction="vertical">
            <Panel> → <TabBar> + <CodeEditor>
            <PanelResizeHandle />
            <Panel> → <BottomPanel> → <ConsoleOutput> / <PreviewFrame>
          </PanelGroup>
        </Panel>
      </PanelGroup>
      <StatusBar />
    </WorkspaceLayout>
  </ThemeProvider>
</App>
```

---

## 8. Key Technical Decisions

| Decision | Choice | Alternative Considered | Rationale |
|----------|--------|----------------------|-----------|
| Editor engine | CodeMirror 6 | Monaco Editor | Lighter, modular, faster load |
| CM6 React binding | @uiw/react-codemirror | Raw CM6 API | Best DX, handles React lifecycle |
| Layout system | react-resizable-panels | allotment, react-mosaic | Smallest, built by React team, auto-persist |
| State management | Zustand | Jotai, Redux, Context | 1KB, persist middleware, selector re-renders |
| IndexedDB library | Dexie.js | idb, localForage | useLiveQuery reactive binding, migrations |
| ZIP library | fflate | JSZip, client-zip | 8KB, fastest, bidirectional |
| Icons | Lucide React | Codicons, Material Icons | Tree-shakeable, MIT, modern |
| JS execution | Web Worker + Blob URL | eval, iframe | Off-thread, terminatable, sandboxed |
| TS transpilation | Sucrase | @swc/wasm-web, esbuild-wasm | ~150KB, fast, sufficient for type stripping |
| Routing (Phase 0) | Hash routing | Browser routing | Zero GitHub Pages config issues |
| Deploy | GitHub Actions | Manual, Netlify | Official, automatic on push to main |
| Styling | CSS Custom Properties + Modules | Tailwind | Pixel-precise IDE layouts, zero-runtime |

---

## 9. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| CodeMirror 6 performance with large files | Medium | High | Use uncontrolled mode, lazy extensions, virtualization in Phase 1+ |
| Web Worker security bypass | Low | High | Strip importScripts/fetch, enforce timeout, output size limit |
| IndexedDB storage limits | Low | Medium | Implement storage quota check, warn user, ZIP export as backup |
| GitHub Pages SPA routing issues | Medium | Low | Hash routing in Phase 0, 404.html trick in Phase 1 |
| Bundle size creep | Medium | Medium | Code splitting, lazy language loads, bundle analysis CI check |
| Browser compatibility (Safari) | Medium | Low | Test early, polyfill as needed, progressive enhancement |

---

## 10. Success Metrics (Phase 0)

| Metric | Target |
|--------|--------|
| Initial load time (3G) | < 3 seconds |
| Initial load time (broadband) | < 1.5 seconds |
| Bundle size (gzipped) | < 200KB |
| First meaningful paint | < 2 seconds |
| Code execution latency (simple script) | < 500ms |
| Lighthouse Performance score | > 90 |
| Browser support | Chrome 90+, Firefox 90+, Safari 15+, Edge 90+ |

---

## 11. Research References

- [OGF-1] Generic-Research-1-OGF.md — Architecture, tech stack, persistence, deployment
- [OGF-2] UI-UX-Research-2-OGF.md — UI/UX patterns, component architecture
- [OGF-3] Code-Runner-Research-3-OGF.md — Code execution, language support, live preview
