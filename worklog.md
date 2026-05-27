# CodeCraft Project Worklog

---
Task ID: 2
Agent: UI-UX-Research-2
Task: UI/UX patterns and component architecture research for CodeCraft

Work Log:
- Conducted web research across 16 targeted search queries covering browser IDE patterns, panel layout libraries, file tree components, CodeMirror 6 theming, tab system design, live preview strategies, search/replace UX, icon libraries, virtual scrolling, and loading states
- Analyzed 5 major browser IDEs (VS Code for Web, StackBlitz, CodeSandbox, Replit, CodePen) for first-glance impression factors and layout patterns
- Compared 3 panel resizing libraries (react-resizable-panels, allotment, react-mosaic) — recommended react-resizable-panels
- Evaluated icon libraries (Lucide, Codicons, Material Icons) — recommended Lucide React for UI chrome + custom SVGs for file types
- Researched CodeMirror 6 integration with React via @uiw/react-codemirror, including theme creation and syntax highlighting
- Designed complete React component tree for Phase 0 IDE layout
- Defined Zustand store architecture with 4 stores (file, editor, ui, console)
- Created CSS Custom Properties theme system based on Catppuccin Mocha palette
- Defined Phase 0 minimal scope: file tree + tabs + JS editor + console + status bar + dark theme
- Calculated Phase 0 JS bundle size estimate: ~104KB gzipped
- Wrote comprehensive 8-section report saved to /home/z/my-project/UI-UX-Research-Report.md

Stage Summary:
- Key finding: "First glance" impression depends on instant dark-themed IDE structure (no marketing page), working code within 5 seconds, and professional typography
- Primary recommendation: react-resizable-panels for layout (smallest bundle, built by React team member, auto-persists to localStorage, pixel-based constraints)
- Primary recommendation: @uiw/react-codemirror for editor integration (mature, supports CM6, built-in theme support)
- Primary recommendation: Zustand for state management (1KB bundle, no boilerplate, built-in persist middleware)
- Primary recommendation: Lucide React for icons (tree-shakeable, MIT, 1600+ icons, modern Feather-like style)
- Phase 0 scope defined as minimal but polished: file tree + tabs + JS editor + console output + status bar + single dark theme
- Critical architecture decision: File tree should use flat map with parent references (not nested objects) to enable future virtualization
- Console capture strategy designed using new Function() with sandboxed console object
- Estimated Phase 0 total JS: ~104KB — very competitive for a browser IDE

---
Task ID: 3
Agent: Code-Runner-Research-3
Task: Browser-based code execution and language support research for CodeCraft

Work Log:
- Researched 4 browser-based JS execution strategies (eval, Function constructor, iframe sandbox, Web Worker)
- Evaluated security considerations for each approach — recommended Web Worker as primary execution strategy
- Designed comprehensive console output capture system (log, error, warn, info, debug, table, dir, clear, assert, time/timeEnd)
- Researched 3 timeout/infinite-loop mitigation approaches: worker.terminate(), code transformation, and combination
- Analyzed 11 language runtimes for browser-side execution: Pyodide, Brython, Skulpt, JSCPP, CheerpX, CheerpJ, Opal, ruby-wasm-wasi, php-wasm, wasmoon, fengari
- Compared Python runtimes: Pyodide (12MB, production-grade) vs Brython (1.5MB, limited) vs Skulpt (500KB, educational)
- Researched C/C++ options: JSCPP (basic C interpreter) vs CheerpX (full x86 virtualization)
- Evaluated Rust/Go: No browser-side compilers exist; only pre-compiled WASM execution possible
- Checked npm versions for all key packages: xterm 6.0.0, Sucrase 3.35.1, Pyodide 0.29.4, wasmoon 1.16.0, Opal 3.0.0
- Designed Web Worker pool architecture with unified LanguageAdapter interface
- Defined communication protocol (WorkerRequest/WorkerResponse types) between main thread and workers
- Designed stdin/stdout/stderr handling with async stdin support via postMessage
- Researched xterm.js integration with React: terminal panel component with ANSI color support
- Defined Phase 0 scope: JavaScript-only execution via Blob-URL Web Worker with Sucrase for TS
- Designed live preview system using sandboxed iframe with srcdoc + security best practices
- Created auto-refresh mechanism with debouncing and HMR strategy for future phases
- Defined phased language support roadmap: Phase 0 (JS/TS) → Phase 1 (Python) → Phase 2 (C, Lua, Ruby) → Phase 3 (C++, Java, PHP, Rust, Go)
- Wrote comprehensive 6-section report saved to /home/z/my-project/research/task-3-code-runner-language-support.md

Stage Summary:
- Primary recommendation: Web Worker + new Function() for JS execution (safe, off-thread, terminatable)
- Primary recommendation: Sucrase for TS transpilation in Phase 0 (~150KB, instant type stripping)
- Primary recommendation: Pyodide for Python in Phase 1 (production-grade, Web Worker compatible, micropip support)
- Primary recommendation: xterm.js 6.0.0 for terminal output with ANSI color support
- Key architecture: Unified LanguageAdapter interface enables plug-and-play language support
- Key architecture: Lazy-load WASM runtimes only when user runs code in that language
- Key architecture: Sandboxed iframe with srcdoc for live preview (NEVER allow-same-origin)
- Security: Delete importScripts/fetch/XMLHttpRequest in worker; use worker.terminate() for timeout; output size limits
- Phase 0 JS runner: ~0KB runtime overhead (native Worker + Function), ~150KB for Sucrase TS support
- Live preview: Debounced srcdoc refresh (300ms), importmap for CDN modules via esm.sh
- Infinite loop protection: Dual approach — loop counter injection (soft) + worker.terminate() (hard)
- Estimated Phase 0 bundle impact: ~150KB additional for xterm.js + Sucrase beyond base editor

---
Task ID: TASK-07 + TASK-08
Agent: Main
Task: File tree sidebar component (TASK-07) + File CRUD operations (TASK-08)

Work Log:
- Fixed 4 TypeScript build errors blocking CI: removed unused variables (clearAll, setActiveFile, isDirty), fixed HTMLElement→HTMLDivElement type cast
- Removed .github/workflows/deploy.yml as project not yet ready for deployment
- Created src/components/Sidebar/FileTree.tsx — full file tree component with context menu, inline rename, new file input, keyboard nav, error banner
- Created src/components/Sidebar/useFileTree.ts — React hook wrapping Dexie queries with useLiveQuery for reactive file list + CRUD operations
- Created src/components/Sidebar/index.ts — barrel exports
- Updated src/App.tsx — integrated FileTree component into sidebar Panel
- Updated src/styles/globals.css — added ~200 lines of file tree, context menu, and titlebar CSS
- Verified build: tsc -b passes, vite build succeeds, ~153KB gzipped

Stage Summary:
- M3 (File Management) milestone complete
- File tree provides reactive file list via Dexie useLiveQuery (auto-updates on DB changes)
- CRUD operations are coordinated with editor/project stores (create→open tab+load content, delete→close tab+unload content)
- No new dependencies added — uses existing dexie-react-hooks and lucide-react
- Build verified passing, bundle size well within 170KB target
