# CodeCraft — Architecture & Tech Stack Research Report

**Task ID:** 1  
**Agent:** Generic-Research-1  
**Date:** 2026-05-28  

---

## Table of Contents

1. [Architecture & Tech Stack](#1-architecture--tech-stack)
2. [Data Persistence](#2-data-persistence)
3. [GitHub Pages Auto-Deploy](#3-github-pages-auto-deploy)
4. [Project Structure Recommendation](#4-project-structure-recommendation)
5. [Phase Planning Considerations](#5-phase-planning-considerations)

---

## 1. Architecture & Tech Stack

### 1.1 Core Stack: React + TypeScript + Vite + CodeMirror 6

| Technology | Role | Version Target |
|---|---|---|
| React | UI framework | 19.x |
| TypeScript | Type safety | 5.x |
| Vite | Build tool & dev server | 6.x |
| CodeMirror 6 | Code editor engine | 6.x |

### 1.2 CodeMirror 6 + React Integration

#### Options Compared

| Approach | Pros | Cons | Recommendation |
|---|---|---|---|
| **`@uiw/react-codemirror`** (wrapper) | Drop-in React component; handles lifecycle, re-renders, theming; active maintenance (~1.5k stars); supports controlled/uncontrolled mode | Adds thin abstraction layer; minor version lag behind CM6 core; less control over EditorView lifecycle | **Recommended for Phase 0** |
| **Raw `@codemirror/view` + `@codemirror/state`** | Full control; zero abstraction overhead; direct access to CM6 API | Must manage React lifecycle manually (useRef, useEffect cleanup); easy to create memory leaks; boilerplate-heavy | Consider for Phase 1+ when advanced customization needed |
| **Custom thin wrapper** | Tailored to exact needs; no extra deps | Time cost; must handle edge cases yourself | Overkill for Phase 0 |

#### Recommended Approach

**Use `@uiw/react-codemirror` for Phase 0**, with a thin internal adapter layer so swapping to raw CM6 later is straightforward:

```tsx
// src/components/Editor/CodeEditor.tsx
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';

interface CodeEditorProps {
  value: string;
  language: string;
  onChange: (value: string) => void;
  theme?: 'light' | 'dark';
}

export function CodeEditor({ value, language, onChange, theme = 'dark' }: CodeEditorProps) {
  const extensions = [javascript({ jsx: true })]; // dynamically load per language

  return (
    <CodeMirror
      value={value}
      height="100%"
      theme={theme === 'dark' ? oneDark : undefined}
      extensions={extensions}
      onChange={onChange}
      basicSetup={{
        lineNumbers: true,
        highlightActiveLineGutter: true,
        highlightActiveLine: true,
        foldGutter: true,
        bracketMatching: true,
        closeBrackets: true,
        autocompletion: true,
        indentOnInput: true,
      }}
    />
  );
}
```

#### Key Integration Best Practices

- **Controlled vs Uncontrolled**: Use **uncontrolled mode** (let CM6 own the state) with `onUpdate` callbacks syncing to Zustand store. Controlled mode causes performance issues with large files.
- **Cleanup**: Always destroy `EditorView` on unmount. `@uiw/react-codemirror` handles this.
- **Extension composition**: Build extensions array dynamically per file type. Lazy-load language packages.
- **Theme**: Use `@codemirror/theme-one-dark` for dark mode; light mode can use `basicSetup` defaults.
- **Performance**: Avoid re-creating extensions array on every render — memoize with `useMemo`.

#### CodeMirror 6 Language Packages (Phase 0 vs Later)

| Phase | Languages | Packages |
|---|---|---|
| Phase 0 | JavaScript/JSX | `@codemirror/lang-javascript` |
| Phase 1 | HTML, CSS, JSON | `@codemirror/lang-html`, `@codemirror/lang-css`, `@codemirror/lang-json` |
| Phase 1+ | Python, Markdown, etc. | `@codemirror/lang-python`, `@codemirror/lang-markdown` |

**Bundle optimization**: Dynamically import language packages via `React.lazy`-style patterns so unused languages don't bloat the initial load.

---

### 1.3 Vite Configuration for GitHub Pages

#### Core `vite.config.ts`

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  // GitHub Pages base path — use repo name for project pages
  base: process.env.GITHUB_PAGES ? '/codecraft/' : '/',
  
  plugins: [
    react(),
    VitePWA({ /* see PWA section */ }),
  ],

  build: {
    target: 'esnext',
    outDir: 'dist',
    sourcemap: false,
    
    // Rollup options for code splitting
    rollupOptions: {
      output: {
        manualChunks: {
          'codemirror-core': [
            '@codemirror/view',
            '@codemirror/state',
            '@codemirror/language',
          ],
          'codemirror-extensions': [
            '@codemirror/autocomplete',
            '@codemirror/commands',
            '@codemirror/search',
            '@codemirror/lint',
          ],
          'react-vendor': ['react', 'react-dom'],
        },
      },
    },
    
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    
    chunkSizeWarningLimit: 500,
  },

  server: {
    port: 3000,
    open: true,
  },
});
```

---

### 1.4 PWA Setup with Vite

Using `vite-plugin-pwa` with Workbox:

```typescript
VitePWA({
  registerType: 'autoUpdate',
  includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
  
  manifest: {
    name: 'CodeCraft — Browser Code Editor',
    short_name: 'CodeCraft',
    description: 'Fast, zero-install, browser-based code editor for multi-file projects',
    theme_color: '#1e1e2e',
    background_color: '#1e1e2e',
    display: 'standalone',
    scope: '/',
    start_url: '/',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  },

  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
    runtimeCaching: [
      {
        urlPattern: /\/assets\/lang-.*\.js$/,
        handler: 'CacheFirst',
        options: {
          cacheName: 'lang-cache',
          expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 30 },
        },
      },
    ],
  },
  
  devOptions: {
    enabled: false,
  },
})
```

---

### 1.5 Bundle Size Optimization Techniques

1. **Tree Shaking** (automatic with Vite/Rollup)
2. **Code Splitting / Dynamic Imports** — Language packages loaded on-demand
3. **Manual Chunks** — Separate CM6 core, extensions, React, and app code
4. **Minification** — terser with `drop_console`
5. **Asset Optimization** — SVG for icons, Brotli via GitHub Actions
6. **Bundle Analysis** — `rollup-plugin-visualizer` in dev config

**Estimated Bundle Sizes (gzipped):**

| Chunk | Estimated Size |
|---|---|
| React + React DOM | ~45 KB |
| CodeMirror 6 core + basic setup | ~80 KB |
| @uiw/react-codemirror | ~5 KB |
| @codemirror/lang-javascript | ~25 KB |
| App code | ~15 KB |
| **Total initial load** | **~170 KB** |

---

## 2. Data Persistence

### 2.1 IndexedDB Library Choice

| Library | Size | API Style | React Integration | Query Power | Maintenance |
|---|---|---|---|---|---|
| **Dexie.js** | ~25KB | Promise-based, chainable | `useLiveQuery` | Excellent | Very active |
| **idb** | ~1.2KB | Promise-based, raw-ish | Manual | Basic | Active |
| **localForage** | ~8KB | Promise-based | Manual | Basic | Low activity |

**Recommendation: Dexie.js** — `useLiveQuery` provides reactive data binding, built-in migration support.

### 2.2 Schema Design

```typescript
// src/db/database.ts
import Dexie, { type Table } from 'dexie';

export interface Project {
  id: string;           // UUID
  name: string;
  createdAt: number;
  updatedAt: number;
  settings: ProjectSettings;
}

export interface ProjectSettings {
  theme: 'light' | 'dark';
  fontSize: number;
  tabSize: number;
  wordWrap: boolean;
}

export interface FileEntry {
  id: string;           // UUID
  projectId: string;    // FK to Project
  name: string;         // e.g., "index.js"
  path: string;         // e.g., "/src/index.js"
  content: string;
  language: string;     // e.g., "javascript"
  isDirty: boolean;     // unsaved changes
  createdAt: number;
  updatedAt: number;
}

export interface AppSettings {
  id: string;           // always "app-settings"
  theme: 'light' | 'dark' | 'system';
  fontSize: number;
  tabSize: number;
  wordWrap: boolean;
  autoSave: boolean;
  autoSaveDelay: number; // ms
  recentProjects: string[]; // project IDs
}

class CodeCraftDB extends Dexie {
  projects!: Table<Project>;
  files!: Table<FileEntry>;
  settings!: Table<AppSettings>;

  constructor() {
    super('codecraft-db');
    this.version(1).stores({
      projects: 'id, name, updatedAt',
      files: 'id, projectId, path, &[projectId+path]',
      settings: 'id',
    });
  }
}

export const db = new CodeCraftDB();
```

### 2.3 localStorage for User Preferences

| Storage | Data | Reason |
|---|---|---|
| **localStorage** | Theme, sidebar width, last opened project, layout preference | Small, synchronous, needed before React hydrates |
| **IndexedDB** | Projects, files, app settings | Large data, async access fine, structured queries needed |

### 2.4 ZIP Export/Import

| Library | Size (gzipped) | Speed | Direction |
|---|---|---|---|
| **fflate** | ~8 KB | Fastest | Both |
| JSZip | ~45 KB | Slow | Both |
| client-zip | ~2.6 KB | Very fast | Export only |

**Recommendation: fflate** — Smallest + fastest bidirectional ZIP library.

---

## 3. GitHub Pages Auto-Deploy

### 3.1 GitHub Actions Workflow

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm run build
        env:
          GITHUB_PAGES: true
      - run: cp dist/index.html dist/404.html
      - uses: actions/configure-pages@v4
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

### 3.2 SPA Routing on GitHub Pages

**Recommendation: 404.html trick + Hash routing as fallback**

- Phase 0: Hash routing (`createHashRouter`) — zero config issues
- Phase 1+: Browser routing + 404.html trick for clean URLs

---

## 4. Project Structure Recommendation

```
codecraft/
├── .github/
│   └── workflows/
│       └── deploy.yml
├── public/
│   ├── 404.html
│   ├── favicon.svg
│   ├── icons/
│   └── robots.txt
├── src/
│   ├── components/
│   │   ├── Editor/
│   │   │   ├── CodeEditor.tsx
│   │   │   ├── extensions.ts
│   │   │   └── themes.ts
│   │   ├── Sidebar/
│   │   │   ├── FileTree.tsx
│   │   │   ├── FileTreeItem.tsx
│   │   │   └── Sidebar.tsx
│   │   ├── Tabs/
│   │   │   ├── TabBar.tsx
│   │   │   └── TabItem.tsx
│   │   ├── Layout/
│   │   │   ├── AppLayout.tsx
│   │   │   └── SplitPane.tsx
│   │   └── Modals/
│   ├── hooks/
│   ├── stores/
│   │   ├── projectStore.ts
│   │   ├── editorStore.ts
│   │   └── uiStore.ts
│   ├── db/
│   │   ├── database.ts
│   │   ├── projectQueries.ts
│   │   └── fileQueries.ts
│   ├── utils/
│   │   ├── zip.ts
│   │   ├── storage.ts
│   │   └── languageDetection.ts
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   └── EditorPage.tsx
│   ├── types/
│   ├── styles/
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

### 4.2 State Management: Zustand

**Why Zustand:** ~1.1KB, selector-based re-renders, built-in `persist` middleware, `immer` middleware for nested updates.

---

## 5. Phase Planning Considerations

### 5.1 Phase 0 (v1) — Quick Prototyping, Minimal but Polished

| Feature | Priority |
|---|---|
| CodeMirror 6 with JS/JSX support, syntax highlighting | Must |
| Single project | Must |
| Multi-file tabs | Must |
| File tree (flat list) | Must |
| Auto-save to IndexedDB | Must |
| Dark theme | Must |
| ZIP export/import | Must |
| PWA basics | Should |
| Keyboard shortcuts | Should |
| Status bar | Should |

### 5.2 Phase 1 — Multi-File Workflows & Languages

- Multi-language (HTML, CSS, JSON, TypeScript)
- Nested folders in file tree
- Light theme + theme switcher
- Settings modal
- Search & replace across files
- Multiple projects

### 5.3 Phase 2+ — Advanced Features

- Code execution (Web Workers)
- Live preview for HTML/CSS/JS
- Terminal (xterm.js)
- Emmet, linting
- Git/Gist integration
- Snippets, split editor, minimap

---

## Summary of Key Recommendations

| Decision | Recommendation | Rationale |
|---|---|---|
| **CM6 + React** | `@uiw/react-codemirror` | Best DX, handles lifecycle |
| **Build tool** | Vite 6 with manual chunks | Fast builds, code splitting |
| **PWA** | `vite-plugin-pwa` with Workbox | Auto-generated SW + manifest |
| **IndexedDB** | Dexie.js with `useLiveQuery` | Reactive queries, migrations |
| **ZIP** | fflate | Smallest + fastest bidirectional |
| **State** | Zustand + persist middleware | Simple, performant, built-in localStorage sync |
| **Routing** | Hash routing (Phase 0) | Zero config on GitHub Pages |
| **Deploy** | GitHub Actions | Official, automatic |
| **Styling** | CSS Custom Properties + CSS Modules | Pixel-precise IDE layouts |
| **Target bundle** | ~170KB gzipped | Achievable with code splitting |
