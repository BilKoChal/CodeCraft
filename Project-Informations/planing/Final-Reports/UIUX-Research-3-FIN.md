# Code Editor: UI/UX, Theme System, Responsive Layout, Storage & Project Management Research

**Report ID:** UIUX-Research-3-FIN  
**Original Report:** UIUX-Research-3-OGF  
**Date:** 2026-03-04  
**Finalized:** 2026-05-27  
**Prepared by:** Sub-Agent 3 (UI/UX & Storage Researcher)  
**Enriched with:** CodeCraft Project Plan v1.0

---

## Plan Integration Notes

This section maps each research finding from the original OGF report to the specific Task IDs and Phases in the [CodeCraft Project Plan](../Project-Plan.md). This mapping ensures traceability from research decisions to implementation tasks.

### Finding-to-Task Mapping

| # | Research Finding (OGF Section) | Plan Phase/Task ID | Implementation Detail |
|---|-------------------------------|---------------------|-----------------------|
| 1 | "Paper Desk" design philosophy (§1.2) | **Plan §1** | Design Philosophy: "Paper Desk" — adopted as project-wide guiding principle |
| 2 | Color palette / CSS custom property system (§1.3) | **PH3-01** | Create CSS custom property system with all semantic tokens, `data-theme` attribute switching |
| 3 | Tailwind CSS 4 `@theme` integration (§1.3, §7.2) | **PH0-02** | Install and configure Tailwind CSS 4 with `@tailwindcss/vite` plugin, custom `@theme` tokens |
| 4 | Lucide Icons selection (§1.4) | **Plan §2** | Technology stack specifies `lucide-react` (latest); tree-shaken subset ~20 KB |
| 5 | Main editor layout wireframe (§1.5) | **PH1-10** | Build main Editor Layout: CSS Grid (titlebar → tabbar → editor → infostrip), `100dvh`, responsive breakpoint switching |
| 6 | Title Bar component (§1.5) | **PH1-08** | Build Title Bar: logo, project name dropdown, menu bar, global actions |
| 7 | Tab Bar component — desktop (§1.5, §4) | **PH1-04** | Horizontal scrollable tabs, amber active indicator, dirty dot, close button, "+" new tab, overflow dropdown |
| 8 | Tab Bar component — mobile (§3.2) | **PH1-05** | Bottom tab bar with file type icons, Run button, touch-friendly targets |
| 9 | Info Strip component (§1.5) | **PH1-09** | Cursor position, encoding, language mode, indent type, Run button |
| 10 | File Navigator slide-over panel (§1.6) | **PH2-03** | Build "Sheet Stack" File Navigator: slide-over panel, search-first, flat-with-groups, action buttons |
| 11 | No persistent sidebar (§1.5) | **PH1-10**, **PH2-03** | Anti-VS-Code decision: overlay panel, not sidebar; implemented in layout + navigator |
| 12 | CM6 extension-based theming (§2.1) | **PH3-02** | Build "Cosmic Dusk" default theme: CM6 `EditorView.theme` + `HighlightStyle`, complete syntax tokens |
| 13 | CSS custom properties bridge to CM6 (§2.2) | **PH3-01**, **PH3-05** | Hybrid strategy: CSS vars for chrome, `EditorView.theme` for editor, both from same source; theme switching reconfigures CM6 extensions |
| 14 | Theme persistence in LocalStorage (§2.3) | **PH3-05** | `setTheme()` with LocalStorage persistence, CM6 extension reconfiguration, `data-theme` attribute swap |
| 15 | "Cosmic Dusk" default theme (§2.4) | **PH3-02** | Dark navy + warm amber, CM6 theme + HighlightStyle, complete syntax token coverage |
| 16 | "Morning Paper" light theme (§2.4) | **PH3-03** | Warm off-white, charcoal text, amber accent |
| 17 | 8 remaining built-in themes (§2.4) | **PH3-04** | Midnight Oil, Forest Canopy, Arctic Clear, Ember, Sakura, Terminal Green, Solar Flare, Blueprint |
| 18 | Custom theme editor UI (§2.5) | **PH3-07** | Live-preview editor with color pickers, JSON import/export, save to IndexedDB |
| 19 | Theme Selector UI (§2.5) | **PH3-06** | Dropdown/panel with theme previews (mini color swatches), dark/light filter, keyboard navigation |
| 20 | 10 built-in themes, not all @uiw themes (§2.6) | **PH3-04** | Selectively curate 10 themes (5 dark, 4 light, 1 retro); lazy-load additional from gallery |
| 21 | Responsive breakpoint system (§3.1) | **PH1-10**, **PH3-08** | Breakpoints xs through 2xl; CSS Grid with named areas; `@media` breakpoint switching |
| 22 | Mobile layout — bottom tab bar (§3.2) | **PH1-05**, **PH3-08** | Bottom tab bar with file type icons; mobile toolbar simplification; single-file view |
| 23 | Virtual keyboard handling (§3.2) | **PH3-08** | `visualViewport` API listener; editor resize when keyboard shows; bottom tab bar animates above keyboard |
| 24 | CM6 mobile contenteditable config (§3.2) | **PH3-08** | Disable autocorrect/autocapitalize/spellcheck; `drawSelection()` for mobile selection |
| 25 | Tablet layout (§3.3) | **PH3-08** | Top tab bar, slide-over file panel, optional split view |
| 26 | Desktop layout — full features (§3.4) | **PH1-10**, **PH3-08** | Keyboard shortcuts, drag-and-drop, resizable panels, optional minimap |
| 27 | CSS Grid layout with `100dvh` (§3.5) | **PH1-10** | CSS Grid with named areas; `100dvh` with `100vh` fallback for mobile browser chrome |
| 28 | Tab state management (§4.1) | **PH1-01**, **PH1-06** | Zustand `editorStore` (tabs, active tab, cursor, scroll); open/close/switch/pin/reorder tabs, save/restore state |
| 29 | Tab operations — open/close/switch/pin/reorder (§4.2) | **PH1-06** | Full tab operation set: open, close, close others/saved/all, switch, reorder, pin, duplicate |
| 30 | Tab overflow behavior (§4.3) | **PH1-04** | Horizontal scroll + overflow dropdown + compact mode; never stack or wrap |
| 31 | Dirty indicator (●) (§4.4) | **PH1-06**, **PH1-11** | Amber dot for unsaved; inline popover "Save?"; auto-save on ⌘+W if enabled |
| 32 | Tab preview on hover (§4.5) | **PH1-04** | 500ms hover tooltip with file preview, path, language, modified badge |
| 33 | Drag-and-drop tab reordering (§4.6) | **PH1-07** | `@dnd-kit/core` + `@dnd-kit/sortable`, horizontal list strategy |
| 34 | Tab performance — single CM6 instance (§4.7) | **PH1-06** | Only active tab's CM6 mounted; save state → unmount → mount → restore; LRU eviction at 30+ tabs |
| 35 | Project data model (§5.1) | **PH2-01** | Dexie.js schema: projects, files, fileContents, binaryFiles, settings, customThemes, autoSaves |
| 36 | "Sheet Stack" File Navigator (§5.2) | **PH2-03** | Slide-over panel, search-first, flat-with-groups, max 3 levels, size shown |
| 37 | Context menu actions for files (§5.3) | **PH2-05** | Right-click menu: New File, Rename, Delete, Duplicate, Move To, Copy Path |
| 38 | Drag-and-drop file moving (§5.4) | **PH2-06** | Drag file onto folder, reorder within folder, visual feedback |
| 39 | Binary file handling (§5.5) | **PH2-09** | Detection by extension, preview pane (image/SVG), ArrayBuffer storage, binary-aware export/import |
| 40 | .editorconfig support (§5.6) | **PH2-10** | Lightweight regex-based parser, apply settings to project configuration |
| 41 | IndexedDB schema with Dexie.js (§6.1–6.2) | **PH2-01** | Dexie.js v4.4.x; 7 object stores with indexed fields; migration strategy |
| 42 | LocalStorage for quick settings (§6.3) | **PH1-01** | Zustand `settingsStore` with persist middleware; `cc-*` prefixed keys |
| 43 | .zip export with JSZip (§6.4) | **PH2-07** | JSZip: iterate all files, build ZIP, add project metadata, trigger download |
| 44 | .zip import (§6.5) | **PH2-08** | Parse uploaded .zip, validate structure, create project with files, handle binary files as ArrayBuffer |
| 45 | 3-tier auto-save strategy (§6.6) | **PH1-11** | Debounced save to IndexedDB (1s after last keystroke in plan), dirty tracking |
| 46 | Dexie.js data migration strategy (§6.7) | **PH2-01** | Versioned migrations via Dexie; `.upgrade()` callbacks; migration test suite |
| 47 | Storage quota monitoring (§6.8) | **PH2-12** | `navigator.storage.estimate()`, warn user when approaching limits, request persistent storage |
| 48 | Full backup and restore (§6.9) | **PH2-07**, **PH2-08** | Export all projects + settings + themes as ZIP; import with conflict resolution |
| 49 | Tailwind CSS 4 Vite plugin setup (§7.1) | **PH0-02** | `@tailwindcss/vite` plugin; CSS-first configuration; no `tailwind.config.js` |
| 50 | Custom `@theme` tokens (§7.2) | **PH3-01**, **PH0-02** | CSS custom properties → Tailwind `@theme`; editor spacing, font families |
| 51 | Multi-theme via `data-theme`, NOT `dark:` (§7.3) | **PH3-01**, **PH3-05** | Class-based via CSS custom properties; unlimited themes; single `data-theme` swap |
| 52 | Tailwind CSS 4 performance (§7.4) | **PH0-02**, **PH6-01** | Rust (Oxide) engine; automatic content scanning; ~15 KB gzipped; no duplicated dark/light classes |
| 53 | Component patterns with Tailwind + CSS vars (§7.5) | **PH3-01**, **PH1-04–PH1-09** | Reusable Button, InfoStrip components using design tokens via `@theme` |
| 54 | Animation and transitions (§7.6) | **PH3-08**, **PH6-01** | Subtle only: panels, modals; instant for code; custom `@keyframes` via `@theme` |
| 55 | Project Manager page | **PH2-02** | List projects, create/delete/rename, "Open Recent" on startup |
| 56 | Welcome/startup screen | **PH2-11** | "Open Recent" projects, "New Project" button, "Import .zip" button |
| 57 | Console/Output drawer | **PH4-04** | Resizable bottom drawer for execution output; slides up when code is run |
| 58 | Menu system | **PH3-09** | Dropdown menus (File, Edit, View, Run, Help); keyboard shortcut display |
| 59 | Command palette (Ctrl+P) | **PH3-09**, **PH6-03** | Fuzzy file search, command search; power-user entry point for "discoverable complexity" |
| 60 | Settings panel | **PH3-10** | Preferences UI (font size, tab size, word wrap, auto-save, format on save, keybindings) |

### Key Decision Points — Plan Annotations

The following annotations mark critical decision points in the original report and indicate exactly where in the Project Plan each decision is implemented:

- **[PLAN: §1 / PH1-10]** — Decision for "Paper Desk" design philosophy: code-first layout, no permanent sidebars, tab-centric navigation; implemented across all UI tasks
- **[PLAN: PH3-01]** — Decision for CSS custom property system as the single source of truth for colors; both Tailwind `@theme` and CM6 `EditorView.theme` consume from the same CSS variable source
- **[PLAN: PH1-04]** — Decision for tab bar as primary navigation (Notepad++ DNA); not sidebar — active tab amber border, dirty dot, overflow dropdown
- **[PLAN: PH1-06]** — Decision for single CM6 instance at a time (destroy old, mount new on tab switch); critical for memory management on GitHub Pages
- **[PLAN: PH2-03]** — Decision for "Sheet Stack" slide-over file navigator instead of VS Code persistent sidebar; overlay approach, search-first
- **[PLAN: PH2-01]** — Decision for Dexie.js v4.4.x over raw IndexedDB; TypeScript support, reactive queries, migration handling; 7 object stores with separated file content/metadata
- **[PLAN: PH3-02–PH3-04]** — Decision for 10 curated built-in themes (5 dark, 4 light, 1 retro) instead of shipping all 36 from `@uiw/codemirror-themes-all`
- **[PLAN: PH3-07]** — Decision for custom theme editor with live preview, color pickers, JSON import/export — going beyond "community themes via plugin" to immediate user theming
- **[PLAN: PH1-05]** — Decision for mobile-first bottom tab bar; thumb-reachable, file type icons, not full filenames
- **[PLAN: PH3-08]** — Decision for `visualViewport` API + `100dvh` for mobile keyboard handling; not relying on `100vh` alone
- **[PLAN: PH1-07]** — Decision for `@dnd-kit/core` over `react-beautiful-dnd`; active maintenance, better touch support, smaller bundle
- **[PLAN: PH2-09]** — Decision for binary file support with ArrayBuffer storage in separate IndexedDB store; avoids base64 bloat
- **[PLAN: PH0-02]** — Decision for Tailwind CSS 4 with `@tailwindcss/vite`; Rust engine, zero-config, no `tailwind.config.js`
- **[PLAN: PH2-12]** — Decision for storage quota monitoring with `navigator.storage.estimate()` and persistent storage requests
- **[PLAN: PH1-01]** — Decision for Zustand with three modular store slices (editorStore, projectStore, settingsStore) with persist middleware for LocalStorage settings

### Additional Insights & Refinements from Plan Context

After cross-referencing the OGF report with the full Project Plan, the following refinements and additional insights emerge:

1. **"Paper Desk" adopted as formal project philosophy:** The OGF report proposed this as a design direction. The plan elevates it to a formal Design Philosophy (Plan §1): "The code is the star. Everything else recedes until needed. No persistent sidebar, no heavy chrome." This is not just a visual style — it's a product identity that differentiates CodeCraft from VS Code clones and should inform every UI decision across all phases.

2. **Zustand store architecture aligns with UI/UX data models:** The OGF report defines `TabState`, `TabManagerState`, `Project`, `FileNode`, and `FileContent` TypeScript interfaces. The plan maps these directly to three Zustand store slices (PH1-01): `editorStore` (tabs, active tab, cursor, scroll), `projectStore` (files, folders), and `settingsStore` (theme, preferences, persist middleware). This is a clean decomposition that avoids prop drilling and enables cross-component state sharing.

3. **Auto-save debounce discrepancy:** The OGF report specifies a 3-tier auto-save with 500ms in-memory debounce and 5s IndexedDB write. The plan specifies "debounced save to IndexedDB (1s after last keystroke)." The plan's 1s is more aggressive than the OGF's 5s periodic write, reducing the risk of data loss on browser crash. The implementation should use the plan's 1s debounce for IndexedDB writes.

4. **Console/Output drawer is a Phase 4 component, not Phase 1:** The OGF wireframe (§1.5) shows an Info Strip with a Run button, implying the console drawer is part of the core editor. The plan correctly separates this: PH1-09 builds the Info Strip (with Run button), while PH4-04 builds the Console/Output drawer. This means the Run button in PH1-09 should be present but non-functional (or show a "Code execution coming soon" message) until Phase 4 is complete.

5. **Command palette spans two phases:** The OGF report mentions "Discoverable complexity — Command palette (Ctrl+P) is the power-user entry point" (§1.2). The plan implements this in two stages: PH3-09 builds the menu system (which includes command palette infrastructure), and PH6-03 adds full command palette with fuzzy file search and command search. The Phase 3 version should be a basic command palette; Phase 6 adds the full fuzzy search experience.

6. **Welcome/startup screen not in OGF report:** The plan adds PH2-11 (welcome/startup screen with "Open Recent," "New Project," "Import .zip" buttons). This is a significant UI surface not covered in the OGF wireframes. It should follow the same "Paper Desk" aesthetic — minimal, warm, action-oriented — and serve as the first impression of the editor's design identity.

7. **Project Manager page not in OGF report:** The plan adds PH2-02 (Project Manager page for listing, creating, deleting, renaming projects). This is another significant UI surface. It should present projects as cards or a clean list with last-modified timestamps, using the same `--surface-base`, `--accent-primary`, and `--text-*` token system.

8. **Menu system implementation detail:** The OGF wireframe shows a menu bar (File, Edit, View, Run, Help) but doesn't specify behavior. The plan adds PH3-09 with dropdown menus, keyboard shortcut display, and command palette. This is critical for the "Notepad++ style" identity — traditional dropdown menus (not a hamburger-only approach) are part of the desktop editor DNA.

9. **Settings panel details:** The OGF report doesn't include a dedicated Settings panel wireframe. The plan adds PH3-10 with preferences UI for font size, tab size, word wrap, auto-save, format on save, and keybindings. This should use the same slide-over panel pattern as the File Navigator for consistency with the "Paper Desk" overlay philosophy.

10. **Parallel phase execution opportunity:** The plan notes that PH2 (Projects & Storage), PH3 (Themes & Design), and PH5 (Formatting, Linting, Emmet) can run in parallel after PH1 completes. This means the storage schema (PH2-01) and theme system (PH3-01) will be developed concurrently. The CSS custom property system (PH3-01) should be designed early enough that the project data model UI (PH2-02, PH2-03) can consume the theme tokens from the start.

11. **Risk register alignment — Mobile UX:** The plan's risk register (§12) identifies "Mobile UX feels cramped" as Medium severity and probability. This directly validates the OGF report's extensive mobile design (§3.2) with bottom tab bar, virtual keyboard handling, single-file view, and touch gestures. The PH3-08 responsive refinement task is the explicit mitigation.

12. **Risk register alignment — IndexedDB data loss:** The plan identifies "IndexedDB data loss (browser eviction)" as Medium severity, Low probability. The OGF report's 3-tier auto-save (§6.6) and the plan's PH2-12 (storage quota monitoring + `navigator.storage.persist()`) directly address this risk. The plan also adds auto-export reminders and clear data warnings.

13. **Bundle size budget validates theme approach:** The plan's bundle size budget (§13) allocates ~15 KB for Tailwind CSS 4 (purged). The OGF's decision to use CSS custom properties for theming (not Tailwind's `dark:` prefix) means no duplicate utility classes for dark/light modes, keeping the Tailwind output at the lower end. The 10 curated themes (not all 36 from `@uiw/codemirror-themes-all`) avoid the ~47 KB overhead of shipping all themes.

14. **Dexie.js replaces raw idb:** The OGF report uses `Dexie` in its code examples. The plan confirms `dexie` (v4.4.x) as the IndexedDB wrapper, providing a richer query API, schema migration support (critical for §6.7 data migration strategy), and better TypeScript support than raw `idb`. The OGF's migration examples (§6.7) with `this.version(N).stores({...})` are native Dexie patterns.

15. **`@dnd-kit/core` used consistently for both tabs and files:** The OGF report recommends `@dnd-kit/core` for tab reordering (§4.6). The plan specifies the same package (v6.3.x) for both PH1-07 (tab reordering) and PH2-06 (file moving). This consistency reduces bundle size (single DnD library) and provides a unified interaction model — the same drag gesture works for both tabs and files.

16. **Lucide icons are in the tech stack:** The OGF report recommends Lucide React (§1.4). The plan confirms `lucide-react` in the technology stack (§2) with an estimated ~20 KB tree-shaken subset. This validates the OGF's reasoning: stroke-based, 1,400+ icons, tree-shakeable, lighter than Font Awesome.

17. **Success metrics inform UX targets:** The plan's success metrics (§14) include FCP < 1.0s, TTI < 2.0s, LCP < 2.5s, CLS < 0.1. These directly impact UX decisions: the CSS Grid layout with fixed-height zones (titlebar 40px, tabbar 36px, infostrip 28px) prevents layout shift (CLS < 0.1), and the lazy CM6 instance mounting (§4.7) keeps TTI low by avoiding multiple editor mounts.

18. **PWA polish includes install prompt and splash screen:** PH6-04 covers PWA polish including app icon, splash screen, and install prompt. The "Paper Desk" identity should extend to these surfaces — the splash screen should use `--surface-base` and `--accent-primary`, and the app icon should feature the warm amber accent on the deep navy background.

19. **Project templates serve the student audience:** PH6-05 adds starter templates (Hello World, Calculator, Todo App, Portfolio). These directly serve the "Students/Learners" audience (40% of target per Generic-Research-1-OGF §4.2). The template selection UI should follow the "Sheet Stack" overlay pattern for consistency.

20. **Accessibility audit (PH6-06) reinforces design decisions:** The plan includes an accessibility audit covering keyboard navigation, ARIA labels, screen reader support, and contrast checks. The OGF's `--text-primary`/`--text-secondary`/`--text-tertiary` hierarchy (§1.3) must pass WCAG contrast requirements in all 10 themes. The warm amber accent (`#f0a500` on `#1a1a2e`) has excellent contrast, but light themes (Morning Paper, Sakura, Blueprint, Arctic Clear) need verification.

---

## Table of Contents

1. [Unique Design Identity](#1-unique-design-identity)
2. [Theme System Architecture](#2-theme-system-architecture)
3. [Responsive Design Strategy](#3-responsive-design-strategy)
4. [Multi-Tab System Design](#4-multi-tab-system-design)
5. [Multi-File Project Management](#5-multi-file-project-management)
6. [Storage Strategy (IndexedDB + LocalStorage + Export/Import)](#6-storage-strategy-indexeddb--localstorage--exportimport)
7. [Tailwind CSS 4 Integration](#7-tailwind-css-4-integration)

---

## 1. Unique Design Identity

*[PLAN: §1 Project Vision — "Paper Desk" design philosophy; PH1-10 — Main Editor Layout implementation]*

### 1.1 Analysis of Existing Lightweight Editors

| Editor | Visual Signature | What Makes It Unique | Weaknesses |
|--------|-----------------|---------------------|------------|
| **Notepad++** | Dense, menu-driven, native OS chrome | Maximum screen real-estate for code; minimal UI; tab bar is the primary navigation | Dated Windows aesthetic; cluttered menus; no modern design language |
| **Sublime Text** | Clean, dark, minimal chrome, iconic minimap | Speed-first feel; minimap is iconic; sidebar is optional; command palette (Ctrl+Shift+P) | Feels slightly austere; not browser-native |
| **CodePen** | Split-pane (editor + preview), colorful branding | Code/Preview split is the identity; social/embed focus; bright accent colors | Limited to web playground; not a file editor |
| **JSFiddle** | 3-4 panel grid, functional | Panel-per-language layout (HTML/CSS/JS/Result); no file tree needed | Visually dated; cramped panels |
| **Replit** | Full IDE in browser, dark, sidebar + tabs | AI-first; mobile-friendly; Nix-based; conversational UI | Looks increasingly like VS Code; heavy |
| **CodeSandbox** | VS Code-inspired, cloud-native | Sandboxed environments; live collaboration; embed mode | VS Code clone aesthetic; heavy |

**Key Insight:** Most browser editors converge on the VS Code look (sidebar file tree, bottom panel, tab bar). The ones with the strongest identities — CodePen and JSFiddle — achieve it by centering a *workflow* rather than imitating a desktop IDE. Notepad++ proves that a tab-centric, chrome-minimal approach can be beloved for decades.

### 1.2 Proposed Design Direction: "Paper Desk" Concept

*[PLAN: §1 — Adopted as the project's formal Design Philosophy]*

**Core Philosophy:** A code editor should feel like a clean desk with papers on it — not like a cockpit dashboard. The code is the star. Everything else recedes until needed.

**Design Language: Refined Minimalism with Subtle Warmth**

- **NOT glassmorphism** — frosted glass over code is distracting and hurts readability
- **NOT neumorphism** — shadows on a code editor look dated and waste space
- **NOT bento-style** — code needs flexible space, not rigid grid cells
- **YES: "Soft Industrial"** — Think: a well-designed notebook. Matte surfaces, precise typography, subtle depth cues, warm accents. Modern but human.

**Visual Principles:**

1. **Code-first layout** — The editor takes 90%+ of screen real estate. No permanent sidebars. *[PLAN: PH1-10 — CSS Grid layout gives editor flex-grow; PH2-03 — File navigator is overlay, not persistent]*
2. **Receding chrome** — Toolbars, panels, and navigation use lower contrast than the code. They exist but don't compete.
3. **Warm accent color** — A single warm accent (amber/gold) for active states, selections, and CTAs. This differentiates from the cold blue/purple of VS Code. *[PLAN: PH3-02 — "Cosmic Dusk" default theme uses warm amber `#f0a500` as accent]*
4. **Typography-forward** — The UI font should feel as considered as the code font. We use the same monospace for code and a clean sans-serif for UI. *[PLAN: PH3-01 — Custom font families in `@theme`: JetBrains Mono for code, Inter for UI]*
5. **Spatial breathing room** — Generous padding in panels and toolbars. No "dense mode" by default.
6. **Discoverable complexity** — Simple by default, powerful when you look. Command palette (Ctrl+P) is the power-user entry point. *[PLAN: PH3-09 — Menu system with command palette; PH6-03 — Full command palette with fuzzy search]*

### 1.3 Color Palette Approach

*[PLAN: PH3-01 — Create CSS custom property system; PH0-02 — Tailwind CSS 4 `@theme` configuration]*

**Semantic Token System** — all colors defined as CSS custom properties mapped to semantic names:

```css
:root {
  /* Core surfaces */
  --surface-base: #1a1a2e;        /* Main editor background */
  --surface-raised: #22223a;      /* Panels, modals */
  --surface-sunken: #141428;      /* Active tab, inputs */
  --surface-overlay: rgba(26, 26, 46, 0.95); /* Popovers */

  /* Text hierarchy */
  --text-primary: #e8e6f0;        /* Code, primary labels */
  --text-secondary: #8b89a0;      /* Tab labels, descriptions */
  --text-tertiary: #5c5a72;       /* Disabled, hints */
  --text-inverse: #1a1a2e;        /* Text on accent */

  /* Accent */
  --accent-primary: #f0a500;      /* Warm amber — active tab, selection, CTA */
  --accent-secondary: #00c9a7;    /* Teal — success, links, secondary actions */
  --accent-danger: #ff6b6b;       /* Red — errors, destructive actions */

  /* Borders & dividers */
  --border-subtle: rgba(139, 137, 160, 0.12);
  --border-visible: rgba(139, 137, 160, 0.25);
  --border-focus: var(--accent-primary);

  /* Syntax (mapped to CM6 tokens) */
  --syntax-keyword: #c792ea;
  --syntax-string: #c3e88d;
  --syntax-number: #f78c6c;
  --syntax-comment: #676e95;
  --syntax-function: #82aaff;
  --syntax-variable: #f0a500;
  --syntax-type: #ffcb6b;
  --syntax-operator: #89ddff;
  --syntax-tag: #f07178;
  --syntax-attribute: #c792ea;

  /* Gutter */
  --gutter-bg: rgba(20, 20, 40, 0.6);
  --gutter-text: #5c5a72;
  --gutter-active: #8b89a0;

  /* Selection */
  --selection-bg: rgba(240, 165, 0, 0.15);
  --selection-active-bg: rgba(240, 165, 0, 0.25);
  --cursor-color: #f0a500;
}
```

**Light theme counterpart** — the same token names with light values (paper-white base, dark text, same accent colors adjusted for contrast).

### 1.4 Icon Style

*[PLAN: Plan §2 — Technology stack specifies `lucide-react` (latest); ~20 KB tree-shaken subset in bundle size budget §13]*

**Recommended: Lucide Icons** (`lucide-react`)

- Stroke-based (1.5px), consistent with our "refined" aesthetic
- 24×24 default, scales well to 16×16 and 20×20
- 1,400+ icons, tree-shakeable
- Open source, actively maintained
- Lighter and more modern than Font Awesome; more complete than Heroicons

**Alternative:** Phosphor Icons — similar stroke style, slightly more playful. Good for a student-friendly feel.

### 1.5 Wireframe: Main Editor Layout (Desktop)

*[PLAN: PH1-08 — Title Bar; PH1-04 — Tab Bar (desktop); PH1-09 — Info Strip; PH1-10 — Main Editor Layout with CSS Grid]*

```
┌─────────────────────────────────────────────────────────────────────┐
│ [Logo]  Project Name ▾   │  File  Edit  View  Run  Help   │ ☀️ 🔍 ⚙️ │
├─────────────────────────────────────────────────────────────────────┤
│  × index.html ●  │  style.css  │  app.js  │  + │  ···more (3) ▾   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1 │ <!DOCTYPE html>                                               │
│  2 │ <html lang="en">                                              │
│  3 │ <head>                                                        │
│  4 │   <meta charset="UTF-8">                                      │
│  5 │   <title>My Project</title>                                   │
│  6 │   <link rel="stylesheet" href="style.css">                    │
│  7 │ </head>                                                       │
│  8 │ <body>                                                        │
│  9 │   <script src="app.js"></script>                              │
│ 10 │ </body>                                                       │
│ 11 │ </html>                                                       │
│                                                                     │
│                                                     ▲ Minimap      │
│                                                     │ (optional)    │
│                                                     ▼              │
├─────────────────────────────────────────────────────────────────────┤
│ Ln 5, Col 12  │  UTF-8  │  HTML  │  Spaces: 2  │  ▶ Run          │
└─────────────────────────────────────────────────────────────────────┘
```

**Layout Breakdown:**

| Zone | Description | Behavior |
|------|-------------|----------|
| **Title Bar** | Project name + menu + global actions | Fixed height (40px). Project name is a dropdown that opens the file navigator. Menus are dropdown menus (not ribbons). *[PLAN: PH1-08]* |
| **Tab Bar** | Horizontal tabs with scroll/overflow | Fixed height (36px). Active tab has amber bottom border + slight background lift. Dirty dot (●) for unsaved. "+" button and overflow dropdown. *[PLAN: PH1-04]* |
| **Editor Area** | CodeMirror 6 instance, full remaining space | Flex-grow. Optional minimap (right gutter). Gutter shows line numbers. *[PLAN: PH1-02]* |
| **Info Strip** | Single-line status: cursor position, encoding, language, indent, run button | Fixed height (28px). Minimal — NOT a full VS Code status bar. The "Run" button lives here because it's the most common action. *[PLAN: PH1-09]* |

**Key Anti-VS-Code Decisions:**

*[PLAN: These decisions define CodeCraft's "Paper Desk" identity and are enforced across PH1-10 layout and PH2-03 navigator]*

1. **No persistent sidebar file tree** — Files are accessed via the project name dropdown or a slide-over panel (⌘+\)
2. **No bottom panel by default** — Console/terminal output appears as a resizable drawer that slides up from the bottom only when code is run *[PLAN: PH4-04 — Console/Output drawer]*
3. **Single-line info strip, not status bar** — Shows essential info only; no notification center, no branch info
4. **Tab bar is the primary navigation** — Not the sidebar. This is the Notepad++ DNA.

### 1.6 Wireframe: File Navigator (Slide-Over Panel)

*[PLAN: PH2-03 — Build "Sheet Stack" File Navigator: slide-over panel with search-first, flat-with-groups layout]*

Activated by clicking the project name dropdown or pressing ⌘+\:

```
┌──────────────────────┐
│ 📁 My Project     ✕  │
│ ─────────────────── │
│ 📄 index.html       │
│ 📄 style.css        │
│ 📄 app.js           │
│ 📁 components/      │
│   ├ 📄 Header.jsx   │
│   ├ 📄 Footer.jsx   │
│   └ 📄 Card.jsx     │
│ 📁 utils/           │
│   └ 📄 helpers.js   │
│ ─────────────────── │
│ + New File   📁 Add │
│ 📥 Import   📤 Export│
└──────────────────────┘
```

- Slides in from the left as an overlay (300px wide on desktop)
- Does NOT push the editor — it overlays
- Dismisses on click outside, Escape, or ⌘+\
- Supports drag-and-drop reordering of files *[PLAN: PH2-06]*
- Right-click context menu for rename/delete/duplicate *[PLAN: PH2-05]*

---

## 2. Theme System Architecture

*[PLAN: Phase 3 (PH3-01–PH3-10) implements the complete theme and design system]*

### 2.1 How CodeMirror 6 Theming Works

*[PLAN: PH3-02 — Builds "Cosmic Dusk" default theme using exactly this CM6 extension-based approach]*

CodeMirror 6 uses an **extension-based theme system**. A theme is created with the `ThemeSpec` type:

```typescript
import { EditorView } from '@codemirror/view';

const myTheme = EditorView.theme({
  '&': { backgroundColor: '#1a1a2e', color: '#e8e6f0' },
  '.cm-content': { caretColor: '#f0a500' },
  '.cm-cursor': { borderLeftColor: '#f0a500' },
  '.cm-selectionBackground': { backgroundColor: 'rgba(240, 165, 0, 0.15)' },
  '.cm-gutters': { backgroundColor: 'rgba(20, 20, 40, 0.6)', color: '#5c5a72' },
  '.cm-activeLineGutter': { backgroundColor: 'rgba(240, 165, 0, 0.1)' },
  '&.cm-focused .cm-selectionBackground': { backgroundColor: 'rgba(240, 165, 0, 0.25)' },
});

// Syntax highlighting is a SEPARATE extension:
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';

const myHighlightStyle = HighlightStyle.define([
  { tag: tags.keyword, color: '#c792ea' },
  { tag: tags.string, color: '#c3e88d' },
  { tag: tags.number, color: '#f78c6c' },
  { tag: tags.comment, color: '#676e95', fontStyle: 'italic' },
  { tag: tags.function(tags.variableName), color: '#82aaff' },
  { tag: tags.variableName, color: '#f0a500' },
  { tag: tags.typeName, color: '#ffcb6b' },
  { tag: tags.operator, color: '#89ddff' },
  { tag: tags.tagName, color: '#f07178' },
  { tag: tags.attributeName, color: '#c792ea' },
]);
```

**Key Insight:** CM6 separates *chrome theming* (EditorView.theme) from *syntax highlighting* (HighlightStyle). A complete theme is the combination of both.

### 2.2 CSS Custom Properties Approach (Recommended)

*[PLAN: PH3-01 — CSS custom property system; PH3-05 — Theme switching implementation]*

**Hybrid strategy:** Use CSS custom properties for the application chrome (toolbars, panels, tabs) and CodeMirror's `EditorView.theme` for the editor itself, with both reading from the same CSS custom property source.

```typescript
// Theme bridge: read CSS custom properties and feed them to CM6
function createCM6ThemeFromCSSVars() {
  const style = getComputedStyle(document.documentElement);
  const getVar = (name: string) => style.getPropertyValue(name).trim();

  return EditorView.theme({
    '&': {
      backgroundColor: getVar('--surface-base'),
      color: getVar('--text-primary'),
    },
    '.cm-cursor': { borderLeftColor: getVar('--cursor-color') },
    '.cm-selectionBackground': {
      backgroundColor: getVar('--selection-bg'),
    },
    '.cm-gutters': {
      backgroundColor: getVar('--gutter-bg'),
      color: getVar('--gutter-text'),
    },
    // ... etc
  });
}
```

**Benefits:**
- One source of truth (CSS custom properties)
- Tailwind CSS 4 can consume the same variables
- Easy to add custom themes (just swap CSS variable values)
- Runtime theme switching with zero re-render

### 2.3 Theme Persistence

*[PLAN: PH3-05 — Theme switching with LocalStorage persistence; PH1-01 — settingsStore with persist middleware]*

```typescript
// LocalStorage for quick settings
const THEME_KEY = 'editor-theme';
const ACCENT_KEY = 'editor-accent-color';

function setTheme(themeName: string) {
  localStorage.setItem(THEME_KEY, themeName);
  document.documentElement.setAttribute('data-theme', themeName);
  // CM6 theme is recreated reactively via extension reconfiguration
}

function getTheme(): string {
  return localStorage.getItem(THEME_KEY) || 'cosmic-dusk';
}
```

Store in LocalStorage (not IndexedDB) because theme preference is:
- Small (< 100 bytes)
- Needed before the app fully renders (synchronous access)
- Changed infrequently

### 2.4 Built-In Themes (Recommended 10)

*[PLAN: PH3-02 — Cosmic Dusk; PH3-03 — Morning Paper; PH3-04 — 8 remaining themes]*

| # | Theme Name | Type | Description | Inspiration |
|---|-----------|------|-------------|-------------|
| 1 | **Cosmic Dusk** | Dark | Default theme — deep navy with warm amber accent | Material Palenight + our identity |
| 2 | **Morning Paper** | Light | Warm off-white, charcoal text, amber accent | iA Writer, Notion light |
| 3 | **Midnight Oil** | Dark | Pure black background, high contrast syntax colors | VS Code "One Dark Pro" variant |
| 4 | **Forest Canopy** | Dark | Deep forest green base, golden green accent | Gruvbox-inspired, nature palette |
| 5 | **Arctic Clear** | Light | Cool blue-white base, teal accent | Nord light, macOS native |
| 6 | **Ember** | Dark | Dark charcoal with orange-red accent, warm tones | Sublime's "Mariana" meets fire |
| 7 | **Sakura** | Light | Soft pink-white base, rose accent | Japanese aesthetic, gentle |
| 8 | **Terminal Green** | Dark | Black background, green monochrome text, no syntax colors | Retro CRT terminal |
| 9 | **Solar Flare** | Dark | Solarized dark variant with warm orange accent | Solarized Dark enhanced |
| 10 | **Blueprint** | Light | Blue-tinted white, navy accent, technical feel | Engineering drawings |

### 2.5 Custom User Themes

*[PLAN: PH3-07 — Build Custom Theme Editor with live preview, color pickers, JSON import/export, save to IndexedDB]*

**Theme Editor UI:**

```typescript
interface CustomTheme {
  id: string;
  name: string;
  type: 'dark' | 'light';
  colors: {
    surfaceBase: string;
    surfaceRaised: string;
    textPrimary: string;
    textSecondary: string;
    accentPrimary: string;
    // ... all CSS custom properties
    syntaxKeyword: string;
    syntaxString: string;
    // ... all syntax tokens
  };
}
```

**Import/Export:** Custom themes can be exported as JSON files and imported by other users. Format:

```json
{
  "format": "codecraft-theme-v1",
  "name": "My Custom Theme",
  "type": "dark",
  "colors": { ... }
}
```

**Implementation:**

1. Store custom themes in IndexedDB (`themes` object store) *[PLAN: PH2-01 — Dexie schema includes `customThemes` store]*
2. On app load, read custom themes and inject them as `<style>` elements
3. Theme selector shows built-in themes first, then a divider, then custom themes *[PLAN: PH3-06 — Theme Selector UI]*
4. "Create Theme" opens a live-preview editor where users pick colors and see results instantly
5. "Import Theme" accepts a JSON file via file input

### 2.6 Number of Built-In Themes to Ship

*[PLAN: PH3-04 — Confirms 10 built-in themes; NOT shipping all 36 from @uiw/codemirror-themes-all]*

**Recommendation: Ship 10 built-in themes** (5 dark, 4 light, 1 special).

Rationale:
- 10 provides enough variety without overwhelming users
- 5:4 dark-to-light ratio matches developer preference (dark dominant) while respecting light-mode users
- The `@uiw/codemirror-themes-all` package provides 36 themes but ships ~47 KB unpacked — do NOT ship all of them. Instead, selectively import only the 10 we curate.
- Additional themes from `@uiw/codemirror-theme-*` can be lazy-loaded from a "Theme Gallery" section

---

## 3. Responsive Design Strategy

*[PLAN: PH1-10 — Main Editor Layout with responsive breakpoint switching; PH3-08 — Refine responsive design across all breakpoints]*

### 3.1 Breakpoint System

*[PLAN: PH3-08 — Test and adjust all breakpoints; PH1-10 — CSS Grid layout with breakpoint switching]*

| Breakpoint | Width | Target | Layout Changes |
|-----------|-------|--------|----------------|
| **xs** | < 640px | Phone (portrait) | Single-file view; bottom tab bar; simplified toolbar; no minimap; console as full-screen overlay |
| **sm** | 640–767px | Phone (landscape) | Same as xs but wider editor; toolbar can show more icons |
| **md** | 768–1023px | Tablet (portrait) | Slide-over file panel; bottom tab bar; optional split editor |
| **lg** | 1024–1279px | Tablet (landscape) / small laptop | Desktop layout starts; top tab bar; compact file panel option |
| **xl** | 1280–1535px | Standard laptop | Full desktop layout |
| **2xl** | ≥ 1536px | Desktop / external monitor | Full layout with generous spacing; optional side-by-side editors |

### 3.2 Mobile (xs/sm) — Phone Experience

*[PLAN: PH1-05 — Mobile tab bar; PH3-08 — Mobile toolbar simplification, virtual keyboard handling]*

```
┌─────────────────────┐
│ ≡  index.html  ···  │  ← Minimal top bar: hamburger, filename, menu
├─────────────────────┤
│                     │
│ 1 │ <!DOCTYPE html>│
│ 2 │ <html>         │
│ 3 │ <head>         │
│ 4 │   <meta ...>   │
│ 5 │ </head>        │
│ 6 │ <body>         │
│                     │
├─────────────────────┤
│ HTML │ CSS │ JS │ ▶│  ← Bottom tab bar: file type tabs + Run
└─────────────────────┘
```

**Mobile-specific behaviors:**

1. **Bottom tab bar replaces top tab bar** — Thumb-reachable; shows file type icons (not full filenames) *[PLAN: PH1-05]*
2. **Hamburger menu** opens the file navigator as a full-screen overlay
3. **Single file view** — No split panes; switching files via bottom bar or file navigator
4. **Touch gestures:**
   - Long press → context menu (copy, paste, select all)
   - Two-finger pinch → zoom (adjust font size)
   - Two-finger scroll → scroll through code
   - Tap on gutter line number → select line
   - Double tap → select word
5. **Virtual keyboard handling:** *[PLAN: PH3-08 — Explicitly tasked: virtual keyboard handling]*
   - CodeMirror 6 uses `contenteditable` which works with virtual keyboards natively
   - When keyboard appears, the editor viewport scrolls to keep the cursor visible
   - Add `visualViewport` API listener to resize editor when keyboard shows:
   ```typescript
   if (window.visualViewport) {
     window.visualViewport.addEventListener('resize', () => {
       const viewport = window.visualViewport!;
       // Offset editor from bottom by the keyboard height
       document.documentElement.style.setProperty(
         '--keyboard-height',
         `${window.innerHeight - viewport.height}px`
       );
     });
   }
   ```
   - The bottom tab bar should animate above the keyboard

6. **CodeMirror 6 mobile specifics:** *[PLAN: PH3-08 — CM6 mobile configuration is part of responsive refinement]*
   - CM6 uses contenteditable, not a textarea — this means IME input, autocorrect, and dictation work
   - `EditorView.editable.of(true)` must be set
   - Disable `autocorrect`, `autocapitalize`, and `spellcheck` on the contenteditable:
     ```typescript
     EditorView.editorAttributes.of({
       autocorrect: 'off',
       autocapitalize: 'off',
       spellcheck: 'false',
     })
     ```
   - Use `drawSelection()` extension for proper mobile selection rendering
   - The default keymaps work but consider adding mobile-specific touch keymaps

### 3.3 Tablet (md) — Portrait Experience

*[PLAN: PH3-08 — Responsive refinement includes tablet breakpoints]*

```
┌───────────────────────────────┐
│ ≡  My Project ▾      🔍 ⚙️  │  ← Top bar with project selector
├───────────────────────────────┤
│ × index.html ● │ style.css + │  ← Scrollable top tab bar
├───────────────────────────────┤
│                               │
│  1 │ <!DOCTYPE html>          │
│  2 │ <html lang="en">         │
│                               │
├───────────────────────────────┤
│ Ln 5, Col 12  │  HTML  │  ▶  │  ← Info strip with Run
└───────────────────────────────┘
```

- Top tab bar now feasible (enough width)
- File navigator as slide-over (tappable, not drag-and-drop)
- Optional: "Split View" button in toolbar opens a second editor pane (50/50 split)
- Touch selections work well on tablet screen size

### 3.4 Desktop (lg+) — Full Experience

*[PLAN: PH1-10 — Desktop layout; PH3-08 — Desktop responsive refinement]*

Standard layout as described in Section 1.5 wireframe. Additional desktop-only features:

- **Keyboard shortcuts** — Full keybinding support *[PLAN: PH6-02 — Keyboard shortcuts system]*
- **Drag-and-drop** — File reordering, tab reordering, file import by drag *[PLAN: PH1-07, PH2-06]*
- **Resizable panels** — Console drawer height adjustable *[PLAN: PH4-04]*
- **Multiple editor panes** — Split horizontally or vertically (up to 2 panes in v1)
- **Minimap** — Optional (toggle in View menu) *[PLAN: PH1-02 — CM6 extensions include minimap]*

### 3.5 Responsive Implementation with Tailwind

*[PLAN: PH1-10 — CSS Grid layout with named areas and responsive switching]*

```tsx
// Responsive tab bar component
function TabBar() {
  const isMobile = useMediaQuery('(max-width: 767px)');
  
  if (isMobile) {
    return <MobileTabBar />; // Bottom tab bar
  }
  return <DesktopTabBar />; // Top tab bar
}
```

```css
/* CSS approach for layout shifts */
.editor-layout {
  display: grid;
  grid-template-rows: auto auto 1fr auto;
  grid-template-areas:
    "titlebar"
    "tabbar"
    "editor"
    "infostrip";
  height: 100dvh; /* Dynamic viewport height — accounts for mobile browser chrome */
}

@media (max-width: 767px) {
  .editor-layout {
    grid-template-rows: auto 1fr auto;
    grid-template-areas:
      "titlebar"
      "editor"
      "tabbar"; /* Tab bar moves to bottom */
  }
}
```

**Critical: Use `100dvh` (dynamic viewport height)** instead of `100vh` to handle mobile browser address bar. Fallback:

```css
height: 100dvh;
height: 100vh; /* Fallback for browsers without dvh support */
```

---

## 4. Multi-Tab System Design

*[PLAN: PH1-01 — Zustand editorStore; PH1-04 — Desktop Tab Bar; PH1-05 — Mobile Tab Bar; PH1-06 — Tab state management; PH1-07 — Drag-and-drop tab reordering]*

### 4.1 Tab State Management

*[PLAN: PH1-01 — editorStore implements tabs, active tab, cursor, scroll; PH1-06 — Full tab state management]*
```typescript
interface TabState {
  id: string;                    // Unique tab ID (crypto.randomUUID())
  fileId: string;                // Reference to file in project
  filePath: string;              // Display path: "components/Header.jsx"
  fileName: string;              // Display name: "Header.jsx"
  isDirty: boolean;              // Unsaved changes
  isPinned: boolean;             // Pinned tab (can't close easily)
  scrollPosition: number;        // Scroll state for restoration
  cursorPosition: { line: number; col: number };
  language: string;              // Current language mode
  lastAccessed: number;          // Timestamp for LRU eviction
}

interface TabManagerState {
  tabs: TabState[];
  activeTabId: string | null;
  tabOrder: string[];            // Ordered tab IDs
}
```

### 4.2 Tab Operations

*[PLAN: PH1-06 — Open/close/switch/pin/reorder tabs, save/restore cursor & scroll state, LRU eviction at 30+ tabs]*

| Operation | Trigger | Behavior |
|-----------|---------|----------|
| **Open** | Click file in navigator, ⌘+P, ⌘+click | Add tab to end; switch to it; if already open, just switch |
| **Close** | Click ×, ⌘+W, middle-click | Close tab; switch to previously active; if dirty, prompt |
| **Close Others** | Right-click → "Close Others" | Close all except this tab |
| **Close Saved** | Right-click → "Close Saved" | Close all tabs without unsaved changes |
| **Close All** | Right-click → "Close All" | Close all; prompt for each dirty tab |
| **Switch** | Click tab, ⌘+1–9, Ctrl+Tab | Activate tab; restore scroll & cursor position |
| **Reorder** | Drag tab horizontally | Move tab in order; animate |
| **Pin** | Right-click → "Pin Tab" | Tab shrinks to icon-only; × moves behind long-press; pinned tabs group on left |
| **Duplicate** | Right-click → "Duplicate" | Open same file in a new tab (same content, independent scroll/cursor) |

### 4.3 Tab Overflow Behavior

*[PLAN: PH1-04 — Desktop Tab Bar includes overflow dropdown]*

When tabs exceed the available width:

1. **Primary: Horizontal scroll** — Tab bar becomes horizontally scrollable with fade indicators on edges
2. **Overflow dropdown** — A "··· (N)" button appears at the right end, showing a dropdown of all open tabs with search
3. **Compact mode** — Tabs automatically shrink (filename only, no path) when space is tight
4. **Never: Tab stacking or wrapping** — These patterns are confusing

```tsx
function TabBar() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [overflowCount, setOverflowCount] = useState(0);

  // Measure visible tabs vs total
  useLayoutEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    const tabs = container.querySelectorAll('[data-tab]');
    let hidden = 0;
    tabs.forEach((tab) => {
      if ((tab as HTMLElement).offsetLeft + (tab as HTMLElement).offsetWidth > container.scrollLeft + container.clientWidth) {
        hidden++;
      }
    });
    setOverflowCount(hidden);
  }, [tabs, containerWidth]);

  return (
    <div className="relative flex items-center h-9 border-b border-[var(--border-subtle)]">
      <div ref={scrollRef} className="flex-1 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => (
          <Tab key={tab.id} tab={tab} isActive={tab.id === activeTabId} />
        ))}
      </div>
      {overflowCount > 0 && (
        <button className="px-2 text-xs text-[var(--text-secondary)]">
          ···{overflowCount}
        </button>
      )}
      <button onClick={openNewTab} className="px-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
        +
      </button>
    </div>
  );
}
```

### 4.4 Dirty Indicator

*[PLAN: PH1-06 — Dirty tracking; PH1-11 — Auto-save integration]*

- **Dot (●)** after filename in amber color for unsaved changes
- **Modified asterisk** in tab tooltip: "index.html — Modified"
- Tab close behavior for dirty tabs:
  1. Show a small inline popover: "Save? [Save] [Don't Save] [Cancel]"
  2. NOT a full modal dialog — too disruptive for rapid tab closing
  3. If ⌘+W on dirty tab, save automatically (if auto-save is on) then close

### 4.5 Tab Preview on Hover

*[PLAN: PH1-04 — Desktop Tab Bar component includes hover behavior]*

- On desktop, hovering a tab for 500ms shows a tooltip with:
  - First 3 lines of the file (preview)
  - Full file path
  - Language mode
  - "Modified" badge if dirty
- On mobile, no hover preview — long press shows context menu instead

### 4.6 Drag-and-Drop Tab Reordering

*[PLAN: PH1-07 — @dnd-kit/core + @dnd-kit/sortable, horizontal list strategy; Plan §2 specifies @dnd-kit/core v6.3.x]*

```typescript
// Using @dnd-kit/core for accessible drag-and-drop
import { DndContext, closestCenter, PointerSensor } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';

function DraggableTabBar() {
  return (
    <DndContext
      sensors={[PointerSensor.create({ activationConstraint: { distance: 5 } })]}
      onDragEnd={handleTabReorder}
    >
      <SortableContext items={tabOrder} strategy={horizontalListSortingStrategy}>
        {tabs.map((tab) => (
          <SortableTab key={tab.id} tab={tab} />
        ))}
      </SortableContext>
    </DndContext>
  );
}
```

**`@dnd-kit/core`** (v6.3.1) is recommended over `react-beautiful-dnd` because:
- Active maintenance (react-beautiful-dnd is deprecated)
- Better touch support for mobile
- Smaller bundle size
- Accessible by default

### 4.7 Many Open Tabs — Performance

*[PLAN: PH1-06 — LRU eviction at 30+ tabs; single CM6 instance approach]*

- **Virtualize tab rendering** — Only render visible tabs (use `@tanstack/react-virtual`)
- **Tab content recycling** — When a tab is not active, destroy its CodeMirror instance. Recreate it when switched to (restore from state). This is critical for memory.
- **LRU eviction** — If more than 20 tabs are open, show a warning. At 30 tabs, auto-close the least-recently-used non-dirty tab.
- **Lazy CodeMirror instances** — Don't mount a CM6 editor for each tab. Keep only the active tab's editor mounted. When switching tabs, save state → unmount old → mount new → restore state.

```typescript
// Only one CodeMirror instance is mounted at a time
function EditorArea({ activeTab }: { activeTab: TabState | null }) {
  // The key prop forces remount when switching tabs
  // CM6 state is saved/restored via EditorState.create({ doc, selection })
  return (
    <CodeMirror
      key={activeTab?.id}
      value={activeTab?.content ?? ''}
      extensions={getExtensions(activeTab)}
      onCreateEditor={restoreTabState(activeTab)}
    />
  );
}
```

---

## 5. Multi-File Project Management

*[PLAN: Phase 2 (PH2-01–PH2-12) implements the complete project/file management and storage system]*

### 5.1 Project Data Model

*[PLAN: PH2-01 — Dexie.js database schema implements these interfaces as IndexedDB object stores]*

```typescript
interface Project {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  settings: ProjectSettings;
  rootFolderId: string;  // Reference to root folder
}

interface ProjectSettings {
  defaultLanguage: string;
  indentSize: number;
  indentType: 'spaces' | 'tabs';
  encoding: string;
  lineEnding: 'lf' | 'crlf';
  formatOnSave: boolean;
  runCommand: string;        // e.g., "python main.py"
  editorConfig: Record<string, unknown>;  // .editorconfig equivalents
}

interface FileNode {
  id: string;
  projectId: string;
  parentId: string | null;  // null for root
  name: string;
  type: 'file' | 'folder';
  sortOrder: number;        // For custom ordering within parent
  content?: string;         // Only for files; stored separately in IndexedDB for size
  language?: string;        // Auto-detected or manually set
  createdAt: number;
  updatedAt: number;
}

// Content stored separately for performance
interface FileContent {
  fileId: string;
  content: string;
  version: number;          // For optimistic concurrency
}
```

### 5.2 File Tree UI — NOT a VS Code Sidebar

*[PLAN: PH2-03 — Build "Sheet Stack" File Navigator: slide-over panel with search-first, flat-with-groups layout, folder collapse, action buttons]*

**Design: "Sheet Stack" Navigator**

Instead of a persistent sidebar tree, use a **slide-over panel** that presents files as a flat, search-filtered list with folder grouping — more like macOS Finder's list view than a tree.

```
┌────────────────────────────────┐
│ 🔍 Search files...            │
│ ───────────────────────────── │
│ 📁 components/               │
│    📄 Header.jsx      2.1 KB │
│    📄 Footer.jsx      1.8 KB │
│    📄 Card.jsx        3.4 KB │
│ 📁 utils/                    │
│    📄 helpers.js       512 B │
│ 📄 index.html          890 B │
│ 📄 style.css          1.2 KB │
│ 📄 app.js             2.7 KB │
│ ───────────────────────────── │
│ + New File    📁 New Folder   │
│ 📥 Import .zip   📤 Export   │
└────────────────────────────────┘
```

**Why this is NOT VS Code:**
1. **Overlay, not persistent** — It appears on demand and disappears
2. **Search-first** — The search bar is always focused when opened
3. **Flat-with-groups, not tree** — Folders are collapsible sections, not nested trees (max 3 levels)
4. **No icons for Git/status** — Pure file management, no source control chrome
5. **Size shown** — Quick mental model of what's in the project
6. **Action buttons at bottom** — Not scattered in a toolbar

### 5.3 Context Menu Actions

*[PLAN: PH2-05 — Implement context menus for files: right-click menu with New File, Rename, Delete, Duplicate, Move To, Copy Path]*

| Action | File | Folder | Shortcut |
|--------|------|--------|----------|
| New File | ✅ | ✅ | ⌘+N |
| New Folder | — | ✅ | ⌘+Shift+N |
| Rename | ✅ | ✅ | F2 |
| Delete | ✅ | ✅ | Delete |
| Duplicate | ✅ | — | ⌘+D |
| Move To… | ✅ | ✅ | — |
| Copy Path | ✅ | ✅ | ⌘+Shift+C |
| Reveal in Tabs | ✅ | — | — |

**Delete behavior:**
- Single file: inline confirmation "Delete index.html? [Delete] [Cancel]"
- Folder with children: "Delete 'components/' and 3 files? [Delete] [Cancel]"
- Deleted files go to a project-level "trash" (recoverable within session)

### 5.4 Drag-and-Drop to Move Files

*[PLAN: PH2-06 — Implement drag-and-drop file moving: drag file onto folder, reorder within folder, visual feedback; same @dnd-kit/core as PH1-07]*

- Drag a file onto a folder → move it into that folder
- Drag a file between two files → reorder
- Visual feedback: the target folder highlights with a border glow
- On mobile: long-press to pick up, drag to target (or use "Move To…" dialog as fallback)

### 5.5 Binary File Handling

*[PLAN: PH2-09 — Handle binary files: detection by extension, preview pane (image/SVG), ArrayBuffer storage, binary-aware export/import]*

Binary files (images, PDFs, fonts) need special treatment:

1. **Detection:** Check file extension against a binary list (`png, jpg, gif, svg, ico, pdf, zip, woff, woff2, ttf, eot`)
2. **Display:** Instead of a code editor, show a preview pane:
   - Images: `<img>` preview with dimensions and file size
   - SVG: Rendered preview + "View Source" toggle
   - PDF: `<embed>` or link to open externally
   - Other: File info card with name, size, type
3. **Storage:** Binary content stored as `ArrayBuffer` in IndexedDB (NOT as base64 strings — too large)
4. **Import:** When importing a .zip, binary files are detected and stored as-is
5. **Export:** Binary files are written to the .zip as-is

```typescript
interface BinaryFileData {
  fileId: string;
  mimeType: string;
  data: ArrayBuffer;  // Raw binary, not base64
  size: number;
}
```

### 5.6 .editorconfig Support

*[PLAN: PH2-10 — Implement .editorconfig support: lightweight regex-based parser, apply settings to project configuration]*

Parse `.editorconfig` files when they exist in the project root:

```typescript
import { parse as parseEditorConfig } from 'editorconfig'; // or a lightweight parser

// Apply .editorconfig settings to project settings
async function applyEditorConfig(projectId: string) {
  const editorConfigFile = await findFile(projectId, '.editorconfig');
  if (!editorConfigFile) return;
  
  const content = await getFileContent(editorConfigFile.id);
  const settings = parseEditorConfig(content);
  // Map to ProjectSettings
  updateProjectSettings(projectId, {
    indentSize: settings.indent_size ?? 2,
    indentType: settings.indent_style ?? 'spaces',
    encoding: settings.charset ?? 'utf-8',
    lineEnding: settings.end_of_line ?? 'lf',
  });
}
```

For a browser-based editor, use a lightweight custom parser (the `editorconfig` npm package is Node.js-based). A simple regex-based parser for the common properties (`indent_style`, `indent_size`, `end_of_line`, `charset`, `trim_trailing_whitespace`, `insert_final_newline`) is ~100 lines of code.

---

## 6. Storage Strategy (IndexedDB + LocalStorage + Export/Import)

*[PLAN: PH2-01 — Dexie.js database; PH2-07 — .zip export; PH2-08 — .zip import; PH2-12 — Storage quota monitoring; PH1-11 — Auto-save]*

### 6.1 Architecture Overview

*[PLAN: PH2-01 — Implements the full IndexedDB schema via Dexie.js; PH1-01 — settingsStore with persist middleware for LocalStorage]*

```
┌─────────────────────────────────────────────┐
│                 Application                  │
├──────────────────┬──────────────────────────┤
│  LocalStorage    │       IndexedDB          │
│  (< 5 KB)       │     (unlimited*)          │
│                 │                          │
│  • Active theme │  ┌────────────────────┐  │
│  • Recent proj  │  │ projects           │  │
│  • Font size    │  ├────────────────────┤  │
│  • Keybindings  │  │ files              │  │
│  • UI state     │  ├────────────────────┤  │
│  • Last project │  │ file_contents      │  │
│                 │  ├────────────────────┤  │
│                 │  │ binary_files       │  │
│                 │  ├────────────────────┤  │
│                 │  │ settings           │  │
│                 │  ├────────────────────┤  │
│                 │  │ custom_themes      │  │
│                 │  ├────────────────────┤  │
│                 │  │ auto_saves         │  │
│                 │  └────────────────────┘  │
└──────────────────┴──────────────────────────┘
```

### 6.2 IndexedDB Schema Design

*[PLAN: PH2-01 — Implement Dexie.js database: define schema (projects, files, fileContents, binaryFiles, settings, customThemes, autoSaves), migration strategy; Plan §2 specifies dexie v4.4.x]*

**Using Dexie.js (v4.4.2)** — A minimalistic wrapper for IndexedDB with excellent TypeScript support, reactive queries, and migration handling.

```typescript
import Dexie, { type Table } from 'dexie';

class EditorDB extends Dexie {
  projects!: Table<Project>;
  files!: Table<FileNode>;
  fileContents!: Table<FileContent>;
  binaryFiles!: Table<BinaryFileData>;
  settings!: Table<Setting>;
  customThemes!: Table<CustomTheme>;
  autoSaves!: Table<AutoSaveEntry>;

  constructor() {
    super('CodeCraftEditor');

    this.version(1).stores({
      projects: 'id, name, updatedAt',           // Primary key + indexed fields
      files: 'id, projectId, parentId, name, type, sortOrder',  // Compound queries
      fileContents: 'fileId',                     // One-to-one with files
      binaryFiles: 'fileId',                      // One-to-one with files
      settings: 'key',                            // Key-value store
      customThemes: 'id, name',                   // Custom themes
      autoSaves: 'fileId, timestamp',            // Auto-save snapshots
    });
  }
}

const db = new EditorDB();
```

**Index Design Rationale:**

| Store | Indexes | Why |
|-------|---------|-----|
| `projects` | `id` (PK), `updatedAt` | List projects sorted by last modified |
| `files` | `id` (PK), `[projectId+parentId]` | Get all files in a folder; get all files in a project |
| `fileContents` | `fileId` (PK) | Direct lookup by file ID |
| `binaryFiles` | `fileId` (PK) | Direct lookup by file ID |
| `autoSaves` | `fileId`, `timestamp` | Find auto-saves for a file, sorted by time |

**Why separate `fileContents` from `files`?**

- File metadata (name, path, type) is read frequently for tree rendering
- File content is large (KB-MB) and only needed when the file is open
- Separating them avoids loading megabytes of content when listing files
- Dexie's lazy loading means we only fetch content when explicitly queried

### 6.3 LocalStorage for Quick Settings

*[PLAN: PH1-01 — Zustand settingsStore with persist middleware; `cc-*` prefixed keys align with the OGF's naming convention]*

```typescript
const STORAGE_KEYS = {
  theme: 'cc-theme',
  fontSize: 'cc-font-size',
  recentProjects: 'cc-recent-projects',  // JSON array of project IDs
  lastProject: 'cc-last-project',
  keybindings: 'cc-keybindings',
  sidebarWidth: 'cc-sidebar-width',
  consoleHeight: 'cc-console-height',
  minimap: 'cc-minimap',
  wordWrap: 'cc-word-wrap',
} as const;

function getSetting<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setSetting(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    // LocalStorage full — clear non-essential items
    console.warn('LocalStorage full, clearing cache:', e);
  }
}
```

### 6.4 .zip Export with JSZip

*[PLAN: PH2-07 — Implement .zip export: JSZip iterates all files, builds ZIP, adds project metadata, triggers download; Plan §2 specifies jszip v3.10.x]*

**Package:** `jszip` (v3.10.1) — industry standard for creating/reading ZIP files in the browser.

```typescript
import JSZip from 'jszip';

async function exportProject(projectId: string): Promise<void> {
  const project = await db.projects.get(projectId);
  if (!project) throw new Error('Project not found');

  const allFiles = await db.files.where('projectId').equals(projectId).toArray();
  const zip = new JSZip();

  for (const file of allFiles) {
    if (file.type === 'folder') {
      zip.folder(file.name); // Create empty folder entry
      continue;
    }

    const relativePath = await getRelativePath(file); // e.g., "components/Header.jsx"
    
    // Check if binary
    const binaryData = await db.binaryFiles.get(file.id);
    if (binaryData) {
      zip.file(relativePath, binaryData.data); // ArrayBuffer
    } else {
      const content = await db.fileContents.get(file.id);
      zip.file(relativePath, content?.content ?? '');
    }
  }

  // Add project metadata
  zip.file('.codecraft/project.json', JSON.stringify({
    name: project.name,
    settings: project.settings,
    exportedAt: Date.now(),
    version: 1,
  }));

  const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
  
  // Trigger download
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${project.name}.zip`;
  a.click();
  URL.revokeObjectURL(url);
}
```

### 6.5 .zip Import

*[PLAN: PH2-08 — Implement .zip import: parse uploaded .zip, validate structure, create project with files, handle binary files as ArrayBuffer]*

```typescript
async function importProject(zipFile: File): Promise<Project> {
  const zip = await JSZip.loadAsync(zipFile);
  
  // Check for metadata
  const metaFile = zip.file('.codecraft/project.json');
  const meta = metaFile ? JSON.parse(await metaFile.async('string')) : null;

  const projectId = crypto.randomUUID();
  const project: Project = {
    id: projectId,
    name: meta?.name ?? zipFile.name.replace('.zip', ''),
    createdAt: Date.now(),
    updatedAt: Date.now(),
    settings: meta?.settings ?? defaultProjectSettings,
    rootFolderId: crypto.randomUUID(),
  };

  const fileNodes: FileNode[] = [];
  const fileContents: FileContent[] = [];
  const binaryFiles: BinaryFileData[] = [];

  // Process each file in the zip
  const entries = Object.entries(zip.files);
  for (const [path, zipEntry] of entries) {
    if (zipEntry.dir) {
      // Create folder
      fileNodes.push({
        id: crypto.randomUUID(),
        projectId,
        parentId: findParentId(path, fileNodes),
        name: path.split('/').filter(Boolean).pop() ?? path,
        type: 'folder',
        sortOrder: fileNodes.filter(f => f.type === 'folder').length,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    } else {
      const fileId = crypto.randomUUID();
      const ext = path.split('.').pop()?.toLowerCase() ?? '';
      
      if (isBinaryExtension(ext)) {
        const data = await zipEntry.async('arraybuffer');
        binaryFiles.push({
          fileId,
          mimeType: getMimeType(ext),
          data,
          size: data.byteLength,
        });
      } else {
        const content = await zipEntry.async('string');
        fileContents.push({
          fileId,
          content,
          version: 1,
        });
      }

      fileNodes.push({
        id: fileId,
        projectId,
        parentId: findParentId(path, fileNodes),
        name: path.split('/').pop() ?? path,
        type: 'file',
        language: detectLanguage(ext),
        sortOrder: fileNodes.filter(f => f.type === 'file').length,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
  }

  // Batch write to IndexedDB
  await db.transaction('rw', [db.projects, db.files, db.fileContents, db.binaryFiles], async () => {
    await db.projects.add(project);
    await db.files.bulkAdd(fileNodes);
    await db.fileContents.bulkAdd(fileContents);
    await db.binaryFiles.bulkAdd(binaryFiles);
  });

  return project;
}
```

### 6.6 Auto-Save Strategy

*[PLAN: PH1-11 — Implement auto-save: debounced save to IndexedDB (1s after last keystroke), dirty tracking. Note: Plan specifies 1s debounce, more aggressive than OGF's 5s periodic write]*
```typescript
// Auto-save hook
function useAutoSave(fileId: string, content: string) {
  const timerRef = useRef<number>();
  
  useEffect(() => {
    clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(async () => {
      await db.autoSaves.put({
        fileId,
        content,
        timestamp: Date.now(),
      });
    }, 5000); // 5-second debounce

    return () => clearTimeout(timerRef.current);
  }, [fileId, content]);
}

// On explicit save (⌘+S)
async function saveFile(fileId: string, content: string) {
  await db.fileContents.put({ fileId, content, version: await getNextVersion(fileId) });
  await db.autoSaves.where('fileId').equals(fileId).delete(); // Clean up auto-save
  markTabClean(fileId);
}

// On app load — recover from auto-save if available
async function recoverAutoSave(fileId: string): Promise<string | null> {
  const autoSave = await db.autoSaves.get(fileId);
  if (autoSave && autoSave.timestamp > (await getFileLastSavedTime(fileId))) {
    return autoSave.content; // There are unsaved changes
  }
  return null;
}
```

**Three-tier auto-save:**

1. **In-memory debounce (500ms)** — Save to React state on every keystroke (debounced)
2. **IndexedDB auto-save (5s)** — Write current content to `autoSaves` store periodically
3. **Explicit save (⌘+S)** — Write to `fileContents` store permanently

> **Plan Refinement:** The plan's PH1-11 specifies a 1-second debounce for IndexedDB writes, which is more aggressive than the 5-second interval in this OGF code. The implementation should adopt the plan's 1-second debounce to minimize potential data loss on browser crash while maintaining acceptable I/O frequency.

### 6.7 Data Migration Strategy

*[PLAN: PH2-01 — Dexie.js database with migration strategy; the versioned migration approach shown here is native Dexie.js]*

Dexie supports versioned migrations natively:

```typescript
class EditorDB extends Dexie {
  constructor() {
    super('CodeCraftEditor');

    // v1: Initial schema
    this.version(1).stores({
      projects: 'id, name, updatedAt',
      files: 'id, projectId, parentId, name, type, sortOrder',
      fileContents: 'fileId',
      settings: 'key',
    });

    // v2: Added custom themes and auto-saves
    this.version(2).stores({
      customThemes: 'id, name',
      autoSaves: 'fileId, timestamp',
    });

    // v3: Added binary file support
    this.version(3).stores({
      binaryFiles: 'fileId',
    });

    // v4: Add index for faster project file listing
    this.version(4).stores({
      files: 'id, projectId, parentId, name, type, sortOrder, [projectId+parentId]',
    }).upgrade(tx => {
      // Can perform data transformations here
    });
  }
}
```

**Migration best practices:**
1. Always add new stores/indices in new versions — never modify existing ones in-place
2. Use `.upgrade()` callbacks for data transformations
3. Test migrations with a seeded test database
4. Keep a migration test suite that validates each version transition

### 6.8 Storage Quota Limits

*[PLAN: PH2-12 — Storage quota monitoring: navigator.storage.estimate(), warn user when approaching limits, request persistent storage]*

| Browser | LocalStorage | IndexedDB |
|---------|-------------|-----------|
| Chrome | 10 MB | Up to 80% of disk (typically GBs) |
| Firefox | 10 MB | Up to 50% of disk |
| Safari | 5 MB | 1 GB then prompts; 50 MB per origin initially |

**Handling quota:**

```typescript
async function checkStorageQuota(): Promise<{ usage: number; quota: number }> {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate();
    return {
      usage: estimate.usage ?? 0,
      quota: estimate.quota ?? 0,
    };
  }
  return { usage: 0, quota: Infinity }; // Unknown
}

// Before saving large content, check available space
async function safeSave(fileId: string, content: string): Promise<boolean> {
  const { usage, quota } = await checkStorageQuota();
  const contentSize = new Blob([content]).size;
  
  if (usage + contentSize > quota * 0.9) {
    // Show warning: "Storage is nearly full. Consider exporting and deleting old projects."
    showStorageWarning();
    return false;
  }
  
  await db.fileContents.put({ fileId, content, version: 1 });
  return true;
}
```

### 6.9 Backup and Restore

*[PLAN: PH2-07 — .zip export; PH2-08 — .zip import; full backup extends the single-project export to all projects]*

**Full backup (all projects):**
```typescript
async function createFullBackup(): Promise<Blob> {
  const zip = new JSZip();
  
  // Export all projects as separate folders
  const projects = await db.projects.toArray();
  for (const project of projects) {
    const projectZip = zip.folder(project.name)!;
    await exportProjectToZipFolder(project.id, projectZip);
  }
  
  // Export settings
  const allSettings = await db.settings.toArray();
  zip.file('settings.json', JSON.stringify(allSettings));
  
  // Export custom themes
  const themes = await db.customThemes.toArray();
  zip.file('custom-themes.json', JSON.stringify(themes));
  
  return zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
}
```

**Restore from backup:**
- Import the .zip, parse each project folder, and reconstruct in IndexedDB
- Conflict resolution: if a project with the same ID exists, prompt to overwrite or skip
- Settings: merge with existing (don't overwrite unless user confirms)

---

## 7. Tailwind CSS 4 Integration

*[PLAN: PH0-02 — Install and configure Tailwind CSS 4; PH3-01 — CSS custom property system with @theme; PH6-01 — Performance audit validates Tailwind output size]*

### 7.1 Setup with Vite + React

*[PLAN: PH0-02 — Install and configure Tailwind CSS 4: @tailwindcss/vite plugin, custom @theme tokens, CSS custom properties]*

Tailwind CSS 4 uses a new engine built on Rust (Oxide) with a Vite-native plugin:

```bash
npm install tailwindcss @tailwindcss/vite
```

**vite.config.ts:**
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
});
```

**CSS entry point (src/index.css):**
```css
@import "tailwindcss";
```

That's it. No `tailwind.config.js`, no `postcss.config.js`, no `npx tailwindcss init`. Tailwind 4 auto-detects content files.

### 7.2 Custom Theme Tokens for the Editor

*[PLAN: PH3-01 — CSS custom property system defines all semantic tokens; PH0-02 — Tailwind @theme configuration]*

Tailwind 4 uses CSS-first configuration via `@theme`:

```css
@import "tailwindcss";

@theme {
  /* Editor-specific color tokens */
  --color-surface-base: var(--surface-base);
  --color-surface-raised: var(--surface-raised);
  --color-surface-sunken: var(--surface-sunken);
  --color-surface-overlay: var(--surface-overlay);
  
  --color-text-primary: var(--text-primary);
  --color-text-secondary: var(--text-secondary);
  --color-text-tertiary: var(--text-tertiary);
  
  --color-accent-primary: var(--accent-primary);
  --color-accent-secondary: var(--accent-secondary);
  --color-accent-danger: var(--accent-danger);
  
  --color-border-subtle: var(--border-subtle);
  --color-border-visible: var(--border-visible);
  
  /* Custom spacing for editor chrome */
  --spacing-tab-height: 2.25rem;      /* 36px */
  --spacing-titlebar-height: 2.5rem;  /* 40px */
  --spacing-infostrip-height: 1.75rem; /* 28px */
  
  /* Custom font families */
  --font-mono: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', ui-monospace, monospace;
  --font-sans: 'Inter', 'SF Pro Display', system-ui, sans-serif;
}
```

**Usage in components:**
```tsx
function TabBar() {
  return (
    <div className="h-tab-height flex items-center border-b border-border-subtle bg-surface-raised">
      {tabs.map(tab => (
        <button
          className={cn(
            "px-3 h-full text-sm font-sans transition-colors",
            tab.id === activeTabId
              ? "text-text-primary border-b-2 border-accent-primary bg-surface-sunken"
              : "text-text-secondary hover:text-text-primary"
          )}
        >
          {tab.fileName}
          {tab.isDirty && <span className="ml-1 text-accent-primary">●</span>}
        </button>
      ))}
    </div>
  );
}
```

### 7.3 Dark Mode Support with Tailwind

*[PLAN: PH3-01, PH3-05 — Multi-theme via data-theme attribute and CSS custom properties; NOT using Tailwind's binary dark: prefix]*

**Strategy: Class-based dark mode via CSS custom properties (NOT Tailwind's `dark:` prefix)**

Why NOT use `dark:bg-gray-900`?
- Our themes are not just "dark" and "light" — there are 10+ themes
- Tailwind's `dark:` is binary (light/dark), not multi-theme
- CSS custom properties give us unlimited themes with a single class change

**Implementation:**

```css
/* Theme definitions */
[data-theme="cosmic-dusk"] {
  --surface-base: #1a1a2e;
  --surface-raised: #22223a;
  --text-primary: #e8e6f0;
  --accent-primary: #f0a500;
  /* ... all tokens */
}

[data-theme="morning-paper"] {
  --surface-base: #faf8f5;
  --surface-raised: #ffffff;
  --text-primary: #2d2d2d;
  --accent-primary: #d4920a;
  /* ... all tokens */
}
```

Then Tailwind classes reference these tokens via `@theme` as shown above. Switching themes is one line:

```typescript
document.documentElement.setAttribute('data-theme', themeName);
```

### 7.4 Performance Considerations

*[PLAN: PH0-02 — Tailwind CSS 4 Rust engine; PH6-01 — Performance audit verifies output size; Plan §13 — ~15 KB gzipped for Tailwind in bundle size budget]*

**Tailwind CSS 4 Performance:**

| Aspect | Tailwind 4 | Tailwind 3 |
|--------|-----------|-----------|
| Engine | Rust (Oxide) | JavaScript (PostCSS) |
| Build speed | 10× faster | Baseline |
| Content detection | Automatic (no `content` config) | Manual `content` array |
| PurgeCSS | Built-in, always on | Configured separately |
| JIT | Always on | Configured |
| Output size | Optimized automatically | Depends on config |
| HMR speed | ~1ms | ~50ms |

**Key optimizations for our project:**

1. **No `dark:` prefix overhead** — We use CSS custom properties for theming, so there are no duplicate utility classes for dark/light modes
2. **Automatic content scanning** — Tailwind 4 detects our React component files automatically
3. **Tree-shaking at build time** — Unused utilities are never included in the output
4. **No config file** — Less build-time overhead, faster startup

**Bundle size estimate for Tailwind in our project:**
- Typical Tailwind output for a focused project: 8–15 KB gzipped
- Our editor uses ~60–80 unique utility classes
- With CSS custom properties for theming (no duplicated dark/light classes), we stay at the lower end

### 7.5 Component Patterns with Tailwind + CSS Variables

*[PLAN: PH3-01 — Design tokens via @theme; PH1-04–PH1-09 — Component implementation uses these patterns]*

```tsx
// Reusable button component using design tokens
function Button({ variant = 'primary', children }: ButtonProps) {
  const variants = {
    primary: 'bg-accent-primary text-text-inverse hover:opacity-90',
    secondary: 'bg-surface-raised text-text-primary border border-border-visible hover:bg-surface-sunken',
    ghost: 'text-text-secondary hover:text-text-primary hover:bg-surface-raised',
    danger: 'bg-accent-danger text-text-inverse hover:opacity-90',
  };

  return (
    <button className={cn(
      "px-3 py-1.5 rounded-md text-sm font-sans transition-all duration-150",
      "focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2",
      variants[variant]
    )}>
      {children}
    </button>
  );
}

// Info strip component
function InfoStrip() {
  return (
    <div className="h-infostrip-height flex items-center gap-4 px-4 text-xs text-text-secondary bg-surface-raised border-t border-border-subtle">
      <span>Ln {cursor.line}, Col {cursor.col}</span>
      <span className="text-text-tertiary">│</span>
      <span>UTF-8</span>
      <span className="text-text-tertiary">│</span>
      <span>{language}</span>
      <span className="text-text-tertiary">│</span>
      <span>Spaces: {indentSize}</span>
      <div className="flex-1" />
      <Button variant="primary" className="gap-1.5">
        <Play size={12} /> Run
      </Button>
    </div>
  );
}
```

### 7.6 Animation and Transitions

*[PLAN: PH3-08 — Responsive refinement includes animation behavior; PH6-01 — Performance audit validates no unnecessary animations]*

Keep animations subtle and purposeful — a code editor should feel snappy, not flashy:

```css
@theme {
  --animate-slide-in: slide-in 0.2s ease-out;
  --animate-slide-up: slide-up 0.2s ease-out;
  --animate-fade-in: fade-in 0.15s ease-out;
}

@keyframes slide-in {
  from { transform: translateX(-100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

@keyframes slide-up {
  from { transform: translateY(100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

**When to animate:**
- ✅ File navigator opening/closing *[PLAN: PH2-03 — Sheet Stack slide-over animation]*
- ✅ Console drawer sliding up *[PLAN: PH4-04 — Resizable bottom drawer]*
- ✅ Tab switching (subtle content fade)
- ✅ Modals and popovers appearing
- ❌ Code content changes (instant — no animation)
- ❌ Tab reordering (instant snap, no slide)
- ❌ Cursor movement

---

## Summary: Key Technical Recommendations

| Area | Recommendation | Rationale | Plan Task |
|------|---------------|-----------|-----------|
| **Design language** | "Soft Industrial" — warm, minimal, code-first | Distinct from VS Code; friendly for students; professional feel | §1, PH1-10 |
| **Color system** | CSS custom properties → Tailwind `@theme` → CM6 theme bridge | Single source of truth; runtime switching; unlimited themes | PH3-01, PH3-05 |
| **Icon library** | Lucide React | Stroke-based, modern, tree-shakeable | Plan §2, ~20 KB |
| **Default theme** | "Cosmic Dusk" (warm amber accent on deep navy) | Unique identity; not another blue/purple theme | PH3-02 |
| **Built-in themes** | 10 themes (5 dark, 4 light, 1 retro) | Enough variety without bloat; lazy-load additional from gallery | PH3-02–PH3-04 |
| **Custom themes** | Live-preview editor with color pickers, JSON import/export | User theming without plugin system | PH3-07 |
| **Tab management** | Single CM6 instance, state save/restore | Memory efficient; only active tab is mounted | PH1-06 |
| **Drag-and-drop** | @dnd-kit/core | Active, accessible, touch-friendly | PH1-07, PH2-06 |
| **File navigation** | Slide-over panel, search-first, flat-with-groups | NOT a VS Code sidebar; overlay approach saves space | PH2-03 |
| **IndexedDB** | Dexie.js v4.4.2 | Best TypeScript support; migrations; reactive queries | PH2-01 |
| **LocalStorage** | Quick settings only (< 5 KB) | Synchronous access for theme/font size before render | PH1-01 |
| **ZIP export/import** | JSZip v3.10.1 | Industry standard; handles binary files; Deflate compression | PH2-07, PH2-08 |
| **Auto-save** | 3-tier: in-memory → IndexedDB (1s) → explicit save | Never lose work; minimal I/O | PH1-11 |
| **Binary files** | ArrayBuffer in separate IndexedDB store | Avoids base64 bloat; handles images/assets | PH2-09 |
| **CSS framework** | Tailwind CSS 4 + @tailwindcss/vite | Rust engine; zero-config; automatic purging | PH0-02 |
| **Mobile layout** | Bottom tab bar, single-file, `100dvh`, `visualViewport` API | Thumb-reachable; keyboard-aware | PH1-05, PH3-08 |
| **Virtual keyboard** | `visualViewport` resize listener + CM6 contenteditable | Proper mobile editing experience | PH3-08 |
| **Responsive** | CSS Grid with named areas; `@media` breakpoints | Clean layout shifts; no layout thrashing | PH1-10, PH3-08 |
| **Animations** | Subtle only (panels, modals); instant for code | Snappy feel; code is never animated | PH3-08 |
| **Storage quota** | `navigator.storage.estimate()` + persistent storage | Warn before quota exceeded; prevent data loss | PH2-12 |
| **Data migration** | Dexie.js versioned migrations with `.upgrade()` | Safe schema evolution across app versions | PH2-01 |
| **Menu system** | Dropdown menus (File/Edit/View/Run/Help) + command palette | Notepad++ DNA; discoverable complexity | PH3-09 |
| **Settings** | Slide-over preferences panel | Consistent with "Paper Desk" overlay pattern | PH3-10 |
| **Startup screen** | "Open Recent" + "New Project" + "Import .zip" | First impression; warm, action-oriented | PH2-11 |

---

*End of report. This research provides the UI/UX, theming, responsive design, and storage architecture foundation for the CodeCraft project. It has been enriched with Project Plan v1.0 task mappings and annotations. It should be used alongside Sub-Agent 1's generic project research (Generic-Research-1-FIN) and Sub-Agent 2's editor/execution research (Editor-Research-2-FIN) for complete implementation guidance.*
