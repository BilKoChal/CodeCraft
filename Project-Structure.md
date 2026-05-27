# CodeCraft — Project Structure

**Project:** CodeCraft — Lightweight Browser-Based Code Editor  
**Tech Stack:** React 18+ / TypeScript / Vite 5+ / CodeMirror 6 / Zustand / Dexie.js / Tailwind CSS 4  
**Last Updated:** 2026-05-27  
**Phase Completed:** PH0 (Scaffolding & Infrastructure)  

---

## Current Source Code Structure

```
codecraft/                              # Project root
├── .github/
│   └── workflows/
│       ├── deploy.yml                  # GitHub Pages auto-deployment
│       └── ci.yml                      # Type check, lint, build verification
├── Project-Informations/               # Planning & documentation
│   ├── planing/
│   │   ├── Project-Plan.md
│   │   ├── Original-Reports/           # OGF reports (never modify)
│   │   └── Final-Reports/              # FIN reports (enriched)
│   ├── worklogs/
│   │   ├── 0-Worklog-20260527-163000.md
│   │   └── PH0-Worklog-Scaffolding-20260527-170000.md
│   ├── analyses/                       # (placeholder for future)
│   ├── development/
│   │   └── PH0-Bulk/
│   │       └── Implementation-Notes.md
│   └── Structure.md
├── public/
│   └── favicon.svg                     # CodeCraft logo (brackets + slash)
├── src/
│   ├── components/
│   │   ├── Editor/                     # PH1-02: CodeMirror editor wrapper
│   │   ├── Tabs/                       # PH1-04/05: Tab bar components
│   │   ├── Layout/                     # PH1-08/09/10: TitleBar, InfoStrip, Layout
│   │   ├── Panels/                     # PH2-03: FileNavigator, ConsoleDrawer
│   │   ├── Project/                    # PH2-02: ProjectManager, WelcomeScreen
│   │   └── Theme/                      # PH3-06/07: ThemeSelector, ThemeEditor
│   ├── stores/
│   │   ├── editorStore.ts              # Editor state (tabs, active, cursor)
│   │   ├── projectStore.ts             # Project state (files, folders)
│   │   ├── settingsStore.ts            # Settings with LocalStorage persist
│   │   └── index.ts                    # Barrel export
│   ├── services/
│   │   ├── storage.ts                  # Dexie.js database + LocalStorage helpers
│   │   ├── exportImport.ts             # JSZip .zip export/import
│   │   ├── autoSave.ts                 # Debounced auto-save (PH1-11)
│   │   └── storageQuota.ts            # Quota monitoring + persistent storage
│   ├── workers/
│   │   └── (PH5-01/04: formatter, linter, pyodide workers)
│   ├── execution/
│   │   └── (PH4-01–07: JS, TS, HTML, Python, C++ executors)
│   ├── themes/
│   │   └── definitions/
│   │       └── (PH3-02–04: 10 theme definition files)
│   ├── hooks/
│   │   ├── useMediaQuery.ts            # Reactive CSS media query (useSyncExternalStore)
│   │   ├── useTheme.ts                 # Theme switching with persistence
│   │   ├── useAutoSave.ts              # (PH1-11 placeholder)
│   │   ├── useKeyboardShortcuts.ts     # (PH6-02 placeholder)
│   │   └── index.ts                    # Barrel export
│   ├── utils/
│   │   ├── languageDetection.ts        # File extension → language mapping
│   │   ├── binaryDetection.ts          # Binary file detection + MIME types
│   │   ├── fileUtils.ts                # Path manipulation, size formatting
│   │   └── editorConfig.ts             # .editorconfig parser (basic)
│   ├── types/
│   │   ├── project.ts                  # Project, FileNode, FileContent, BinaryFileData
│   │   ├── tab.ts                      # TabState, TabManagerState
│   │   ├── theme.ts                    # ThemeDefinition, ThemeColors, CustomTheme
│   │   ├── execution.ts                # ExecutionResult, language tiers
│   │   └── index.ts                    # Barrel export
│   ├── App.tsx                         # Root component with route definitions
│   ├── main.tsx                        # Entry point: HashRouter + SW registration
│   └── index.css                       # Tailwind + theme CSS custom properties
├── Project-Structure.md                # This file
├── LICENSE                             # MIT License
├── README.md                           # Project documentation
├── package.json
├── tsconfig.json
├── tsconfig.app.json                   # With path aliases
├── tsconfig.node.json
├── vite.config.ts                      # Tailwind, PWA, chunk splitting, GitHub Pages
└── eslint.config.js                    # ESLint + react-hooks + typescript-eslint
```

## Build Configuration Notes

- **Base path:** `/codecraft/` (for GitHub Pages)
- **Routing:** HashRouter (no 404.html hack needed)
- **Chunk splitting:** Function-based `manualChunks()` for react-vendor, codemirror-core, codemirror-extensions, storage, state, dnd-kit
- **PWA:** vite-plugin-pwa with autoUpdate, WASM caching (20MB limit)
- **Minification:** Terser with `drop_console` and `drop_debugger`
- **Target:** esnext
