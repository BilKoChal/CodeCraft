# CodeCraft — Project Structure (Root)

**Last Updated:** 2026-05-28 (after TASK-04 + TASK-05 + TASK-13)

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
│   │   └── TASK-13/                         # ✅ Dark theme + CSS
│   └── Structure.md
├── src/                                     # Application source code
│   ├── components/                          # ✅ React components
│   │   ├── Editor/                          # ✅ CodeMirror 6 editor
│   │   │   ├── CodeEditor.tsx               # Main editor (uncontrolled mode)
│   │   │   ├── catppuccinMocha.ts           # CM6 theme (EditorView.theme + HighlightStyle)
│   │   │   ├── extensions.ts               # Extension composition (basicSetup replacement)
│   │   │   └── index.ts                     # Barrel exports
│   │   ├── Tabs/                            # ✅ Tab bar
│   │   │   ├── TabBar.tsx                   # Tab bar with scroll, keyboard nav, file meta cache
│   │   │   ├── FileIcon.tsx                 # File type icon mapping (Lucide + Catppuccin colors)
│   │   │   └── index.ts                     # Barrel exports
│   │   ├── Sidebar/                         # (placeholder)
│   │   ├── Layout/                          # (placeholder)
│   │   ├── Modals/                          # (placeholder)
│   │   ├── StatusBar/                       # (placeholder)
│   │   └── Console/                         # (placeholder)
│   ├── hooks/                               # ✅ Custom React hooks
│   │   └── useAutoSave.ts                   # Auto-save with 1s debounce → IndexedDB
│   ├── stores/                              # ✅ Zustand state stores
│   │   ├── index.ts, projectStore.ts, editorStore.ts, uiStore.ts, consoleStore.ts
│   ├── db/                                  # ✅ Dexie.js database
│   │   ├── index.ts, database.ts
│   │   └── queries/ (projects.ts, files.ts, settings.ts)
│   ├── utils/                               # ✅ Utility functions
│   │   ├── id.ts, languageDetection.ts, storage.ts
│   ├── pages/                               # (placeholder)
│   ├── types/                               # ✅ Shared TypeScript types
│   │   └── index.ts
│   ├── styles/                              # ✅ CSS styles (enhanced)
│   │   ├── globals.css                      # Theme variables + global reset + tab bar + resize + status bar
│   │   └── editor.css                       # CodeMirror 6 overrides
│   ├── App.tsx                              # ✅ Root component with TabBar + CodeEditor
│   ├── main.tsx                             # ✅ React entry point
│   └── vite-env.d.ts                        # ✅ Vite type declarations
├── public/                                  # ✅ Static assets
├── .github/workflows/deploy.yml             # ✅ GitHub Pages auto-deploy
├── package.json, vite.config.ts, tsconfig*.json, index.html, .gitignore
└── node_modules/
```

## Phase Status

| Phase | Status | Key Deliverables |
|-------|--------|-----------------|
| **Phase 0** | 🟡 In Progress (M2 partially done) | TASK-01 ✅, TASK-02 ✅, TASK-03 ✅, TASK-04 ✅, TASK-05 ✅, TASK-06 ✅, TASK-13 ✅ |
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
| TASK-07 | ⚪ Pending | File tree sidebar component |
| TASK-08 | ⚪ Pending | File CRUD operations |
| TASK-09 | ⚪ Pending | Project list page + CRUD |
| TASK-10 | ⚪ Pending | ZIP import/export |
| TASK-11 | ⚪ Pending | JS code runner |
| TASK-12 | ⚪ Pending | Console output panel |
| TASK-13 | ✅ Done | Dark theme + CSS variables |
| TASK-14 | ⚪ Pending | Status bar component |
| TASK-15 | ⚪ Pending | Keyboard shortcuts |
| TASK-16 | ⚪ Pending | PWA setup |
| TASK-17 | ⚪ Pending | Live preview |
| TASK-18 | ⚪ Pending | Skeleton loading |
| TASK-19 | ⚪ Pending | Deploy + testing |
| TASK-20 | ⚪ Pending | Sample project template |

## Quick Links

- [Project Plan](Project-Informations/planing/Project-Plan.md)
- [Architecture Research (OGF)](Project-Informations/planing/Original-Reports/Generic-Research-1-OGF.md)
- [UI/UX Research (OGF)](Project-Informations/planing/Original-Reports/UI-UX-Research-2-OGF.md)
- [Code Runner Research (OGF)](Project-Informations/planing/Original-Reports/Code-Runner-Research-3-OGF.md)
