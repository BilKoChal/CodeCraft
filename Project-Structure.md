# CodeCraft — Project Structure (Root)

**Last Updated:** 2026-05-28 (after TASK-01 + TASK-02)

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
│   │   └── TASK-02/                         # ✅ Zustand stores
│   └── Structure.md
├── src/                                     # Application source code
│   ├── components/                          # React components (placeholder dirs)
│   │   ├── Editor/
│   │   ├── Sidebar/
│   │   ├── Tabs/
│   │   ├── Layout/
│   │   ├── Modals/
│   │   ├── StatusBar/
│   │   └── Console/
│   ├── hooks/                               # Custom React hooks
│   ├── stores/                              # ✅ Zustand state stores
│   │   ├── index.ts                         # Barrel exports
│   │   ├── projectStore.ts                  # Project navigation state
│   │   ├── editorStore.ts                   # Editor content + dirty tracking
│   │   ├── uiStore.ts                       # UI layout state
│   │   └── consoleStore.ts                  # Console output state
│   ├── db/                                  # Dexie.js database (TASK-03)
│   ├── utils/                               # ✅ Utility functions
│   │   ├── id.ts                            # UUID generation
│   │   ├── languageDetection.ts             # Language detection
│   │   └── storage.ts                       # localStorage helper
│   ├── pages/                               # Page components
│   ├── types/                               # ✅ Shared TypeScript types
│   │   └── index.ts
│   ├── styles/                              # ✅ CSS styles
│   │   ├── globals.css                      # Theme variables + global reset
│   │   └── editor.css                       # CodeMirror 6 overrides
│   ├── App.tsx                              # ✅ Root component with panel layout
│   ├── main.tsx                             # ✅ React entry point
│   └── vite-env.d.ts                        # ✅ Vite type declarations
├── public/                                  # ✅ Static assets
│   ├── favicon.svg
│   ├── robots.txt
│   └── icons/                               # PWA icons (to be created)
├── .github/workflows/deploy.yml             # ✅ GitHub Pages auto-deploy
├── package.json                             # ✅ Dependencies and scripts
├── vite.config.ts                           # ✅ Vite configuration
├── tsconfig.json                            # ✅ TypeScript project references
├── tsconfig.app.json                        # ✅ App TS config
├── tsconfig.node.json                       # ✅ Node/Vite TS config
├── index.html                               # ✅ SPA entry point
├── .gitignore                               # ✅ Ignore patterns
└── node_modules/                            # Installed dependencies
```

## Phase Status

| Phase | Status | Key Deliverables |
|-------|--------|-----------------|
| **Phase 0** | 🟡 In Progress (M1 started) | TASK-01 ✅, TASK-02 ✅, 18 tasks remaining |
| **Phase 1** | ⚪ Not Started | Multi-language, nested folders, theme switcher |
| **Phase 2** | ⚪ Not Started | Terminal, drag-and-drop, C/Lua/Ruby support |
| **Phase 3** | ⚪ Not Started | C++/Java/PHP, HMR, collaboration |

## Task Status

| Task | Status | Description |
|------|--------|-------------|
| TASK-01 | ✅ Done | Project scaffold |
| TASK-02 | ✅ Done | Zustand stores |
| TASK-03 | ⚪ Pending | Dexie database schema + queries |
| TASK-04 | ⚪ Pending | CodeMirror 6 editor component |
| TASK-05 | ⚪ Pending | Tab bar component |
| TASK-06 | ⚪ Pending | Auto-save hook |
| TASK-07 | ⚪ Pending | File tree sidebar component |
| TASK-08 | ⚪ Pending | File CRUD operations |
| TASK-09 | ⚪ Pending | Project list page + CRUD |
| TASK-10 | ⚪ Pending | ZIP import/export |
| TASK-11 | ⚪ Pending | JS code runner |
| TASK-12 | ⚪ Pending | Console output panel |
| TASK-13 | ⚪ Pending | Dark theme + CSS variables |
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
