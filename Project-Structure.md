# CodeCraft — Project Structure (Root)

**Last Updated:** 2026-05-28 (after SEC-01 + BUG-01 + BUG-02 + BUG-04 + BUG-14 security & bug fixes)

---

## Overall Project Layout

```
codecraft/                                   # Project root
├── Project-Structure.md                     # This file — overall structure overview
├── AGENT_PROMPT.md                          # Agent prompt copy for reference
├── Project-Informations/                    # All project meta-data, plans, reports, worklogs
│   ├── planing/
│   ├── worklogs/
│   ├── analyses/ (placeholder)
│   ├── development/
│   │   ├── TASK-01/                         # ✅ Project scaffold
│   │   ├── TASK-02/                         # ✅ Zustand stores
│   │   ├── TASK-03/                         # ✅ Dexie database
│   │   ├── TASK-04/                         # ✅ CM6 editor component
│   │   ├── TASK-05/                         # ✅ Tab bar component
│   │   ├── TASK-06/                         # ✅ Auto-save hook
│   │   ├── TASK-07/                         # ✅ File tree sidebar
│   │   ├── TASK-08/                         # ✅ File CRUD operations (useFileTree hook)
│   │   ├── TASK-09/                         # ✅ Project list page + CRUD
│   │   ├── TASK-10/                         # ✅ ZIP import/export (fflate)
│   │   ├── TASK-11/                         # ✅ JS code runner (Web Worker)
│   │   ├── TASK-12/                         # ✅ Console output panel
│   │   ├── TASK-13/                         # ✅ Dark theme + CSS
│   │   ├── TASK-14/                         # ✅ Status bar component
│   │   ├── TASK-15/                         # ✅ Keyboard shortcuts
│   │   ├── TASK-16/                         # ✅ PWA setup
│   │   ├── TASK-17/                         # ✅ Live preview (iframe + srcdoc)
│   │   └── TASK-18/                         # ✅ Skeleton loading
│   └── Structure.md
├── src/                                     # Application source code
│   ├── components/                          # ✅ React components
│   │   ├── Editor/                          # ✅ CodeMirror 6 editor
│   │   │   ├── CodeEditor.tsx               # Main editor (uncontrolled mode)
│   │   │   ├── catppuccinMocha.ts           # CM6 theme (EditorView.theme + HighlightStyle)
│   │   │   ├── extensions.ts               # Extension composition (basicSetup replacement)
│   │   │   └── index.ts                     # Barrel exports
│   │   ├── Tabs/                            # ✅ Tab bar
│   │   │   ├── TabBar.tsx                   # Tab bar with scroll, keyboard nav (BUG-05: React state cache)
│   │   │   ├── FileIcon.tsx                 # File type icon mapping (Lucide + Catppuccin colors)
│   │   │   └── index.ts                     # Barrel exports
│   │   ├── Sidebar/                         # ✅ File tree sidebar (TASK-07 + TASK-08)
│   │   │   ├── FileTree.tsx                 # File tree with context menu, inline rename, new file
│   │   │   ├── useFileTree.ts              # React hook: reactive file list + CRUD via Dexie useLiveQuery
│   │   │   └── index.ts                     # Barrel exports
│   │   ├── ProjectList/                     # ✅ Project list landing page (TASK-09)
│   │   │   ├── ProjectList.tsx              # Project cards, create/rename/delete, ZIP import
│   │   │   └── index.ts                     # Barrel exports
│   │   ├── Layout/                          # (placeholder)
│   │   ├── Modals/                          # (placeholder)
│   │   ├── StatusBar/                       # ✅ Status bar (TASK-14, BUG-06/RS-#7 fix)
│   │   │   ├── StatusBar.tsx               # Dynamic status bar (narrow selectors, reactive language)
│   │   │   └── index.ts                     # Barrel exports
│   │   ├── Console/                         # ✅ Console output (TASK-12)
│   │   ├── Preview/                         # ✅ Live preview (TASK-17, SEC-01/SEC-05 fix)
│   │   │   ├── PreviewFrame.tsx             # Sandboxed iframe preview (data: URL, script escape)
│   │   │   └── index.ts                     # Barrel exports
│   │   └── Skeleton/                        # ✅ Skeleton loading (TASK-18)
│   │       ├── IDESkeleton.tsx              # Shimmer skeleton mimicking IDE layout
│   │       └── index.ts                     # Barrel exports
│   ├── hooks/                               # ✅ Custom React hooks
│   │   ├── useAutoSave.ts                   # Auto-save with debounce, beforeunload + visibilitychange (BUG-14/SEC-04)
│   │   ├── useKeyboardShortcuts.ts          # Global IDE shortcuts (Ctrl+S/B/J/W/Enter, TASK-15)
│   │   └── useProjects.ts                   # Project CRUD (BUG-04: single transactional delete)
│   ├── runner/                              # ✅ Code execution engine
│   │   └── jsRunner.ts                      # Web Worker sandbox for JS execution (TASK-11)
│   ├── stores/                              # ✅ Zustand state stores
│   │   ├── index.ts, projectStore.ts, editorStore.ts (BUG-01: Record<string,boolean>), uiStore.ts, consoleStore.ts
│   ├── db/                                  # ✅ Dexie.js database
│   │   ├── index.ts, database.ts
│   │   └── queries/ (projects.ts, files.ts, settings.ts)
│   ├── utils/                               # ✅ Utility functions
│   │   ├── id.ts, languageDetection.ts, storage.ts, zipImport.ts
│   ├── pages/                               # (placeholder)
│   ├── types/                               # ✅ Shared TypeScript types
│   │   └── index.ts
│   ├── styles/                              # ✅ CSS styles (enhanced)
│   │   ├── globals.css                      # Theme variables + global reset + tab bar + resize + status bar + file tree + context menu + project list + titlebar + console
│   │   └── editor.css                       # CodeMirror 6 overrides
│   ├── App.tsx                              # ✅ Root component (RS-#1/#4: reactive selectors + atomic setState)
│   ├── main.tsx                             # ✅ React entry point
│   └── vite-env.d.ts                        # ✅ Vite + PWA virtual module type declarations
├── public/                                  # ✅ Static assets
├── package.json, vite.config.ts, tsconfig*.json, index.html, .gitignore
└── node_modules/
```

## Phase Status

| Phase | Status | Key Deliverables |
|-------|--------|-----------------|
| **Phase 0** | 🟡 In Progress (M6 complete, security fixes applied, M7 pending) | TASK-01 ✅ through TASK-18 ✅, SEC-01 ✅, BUG-01 ✅, BUG-02 ✅, BUG-04 ✅, BUG-14 ✅ |
| **Phase 1** | ⚪ Not Started | Multi-language, nested folders, theme switcher |
| **Phase 2** | ⚪ Not Started | Terminal, drag-and-drop, C/Lua/Ruby support |
| **Phase 3** | ⚪ Not Started | C++/Java/PHP, HMR, collaboration |

## Task Status

| Task | Status | Description |
|------|--------|-------------|
| TASK-01 | ✅ Done | Project scaffold |
| TASK-02 | ✅ Done | Zustand stores |
| TASK-03 | ✅ Done | Dexie database schema + queries |
| TASK-04 | ✅ Done | CodeMirror 6 editor component |
| TASK-05 | ✅ Done | Tab bar component |
| TASK-06 | ✅ Done | Auto-save hook |
| TASK-07 | ✅ Done | File tree sidebar component |
| TASK-08 | ✅ Done | File CRUD operations (useFileTree hook) |
| TASK-09 | ✅ Done | Project list page + CRUD |
| TASK-10 | ✅ Done | ZIP import/export (fflate) |
| TASK-11 | ✅ Done | JS code runner |
| TASK-12 | ✅ Done | Console output panel |
| TASK-13 | ✅ Done | Dark theme + CSS variables |
| TASK-14 | ✅ Done | Status bar component |
| TASK-15 | ✅ Done | Keyboard shortcuts |
| TASK-16 | ✅ Done | PWA setup |
| TASK-17 | ✅ Done | Live preview |
| TASK-18 | ✅ Done | Skeleton loading |
| TASK-19 | ⚪ Pending | Deploy + testing |
| TASK-20 | ⚪ Pending | Sample project template |

## Quick Links

- [Project Plan](Project-Informations/planing/Project-Plan.md)
- [Architecture Research (OGF)](Project-Informations/planing/Original-Reports/Generic-Research-1-OGF.md)
- [UI/UX Research (OGF)](Project-Informations/planing/Original-Reports/UI-UX-Research-2-OGF.md)
- [Code Runner Research (OGF)](Project-Informations/planing/Original-Reports/Code-Runner-Research-3-OGF.md)
