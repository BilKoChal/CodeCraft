# Code Editor: UI/UX, Theme System, Responsive Layout, Storage & Project Management Research

> **Sub-Agent 3 Report** | UI/UX & Storage Research  
> **Date:** 2026-03-04  
> **Project:** Lightweight browser-based code editor (Notepad++ style, React + Vite, GitHub Pages)

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

**Core Philosophy:** A code editor should feel like a clean desk with papers on it — not like a cockpit dashboard. The code is the star. Everything else recedes until needed.

**Design Language: Refined Minimalism with Subtle Warmth**

- **NOT glassmorphism** — frosted glass over code is distracting and hurts readability
- **NOT neumorphism** — shadows on a code editor look dated and waste space
- **NOT bento-style** — code needs flexible space, not rigid grid cells
- **YES: "Soft Industrial"** — Think: a well-designed notebook. Matte surfaces, precise typography, subtle depth cues, warm accents. Modern but human.

**Visual Principles:**

1. **Code-first layout** — The editor takes 90%+ of screen real estate. No permanent sidebars.
2. **Receding chrome** — Toolbars, panels, and navigation use lower contrast than the code. They exist but don't compete.
3. **Warm accent color** — A single warm accent (amber/gold) for active states, selections, and CTAs. This differentiates from the cold blue/purple of VS Code.
4. **Typography-forward** — The UI font should feel as considered as the code font. We use the same monospace for code and a clean sans-serif for UI.
5. **Spatial breathing room** — Generous padding in panels and toolbars. No "dense mode" by default.
6. **Discoverable complexity** — Simple by default, powerful when you look. Command palette (Ctrl+P) is the power-user entry point.

### 1.3 Color Palette Approach

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

**Recommended: Lucide Icons** (`lucide-react`)

- Stroke-based (1.5px), consistent with our "refined" aesthetic
- 24×24 default, scales well to 16×16 and 20×20
- 1,400+ icons, tree-shakeable
- Open source, actively maintained
- Lighter and more modern than Font Awesome; more complete than Heroicons

**Alternative:** Phosphor Icons — similar stroke style, slightly more playful. Good for a student-friendly feel.

### 1.5 Wireframe: Main Editor Layout (Desktop)

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
| **Title Bar** | Project name + menu + global actions | Fixed height (40px). Project name is a dropdown that opens the file navigator. Menus are dropdown menus (not ribbons). |
| **Tab Bar** | Horizontal tabs with scroll/overflow | Fixed height (36px). Active tab has amber bottom border + slight background lift. Dirty dot (●) for unsaved. "+" button and overflow dropdown. |
| **Editor Area** | CodeMirror 6 instance, full remaining space | Flex-grow. Optional minimap (right gutter). Gutter shows line numbers. |
| **Info Strip** | Single-line status: cursor position, encoding, language, indent, run button | Fixed height (28px). Minimal — NOT a full VS Code status bar. The "Run" button lives here because it's the most common action. |

**Key Anti-VS-Code Decisions:**

1. **No persistent sidebar file tree** — Files are accessed via the project name dropdown or a slide-over panel (⌘+\)
2. **No bottom panel by default** — Console/terminal output appears as a resizable drawer that slides up from the bottom only when code is run
3. **Single-line info strip, not status bar** — Shows essential info only; no notification center, no branch info
4. **Tab bar is the primary navigation** — Not the sidebar. This is the Notepad++ DNA.

### 1.6 Wireframe: File Navigator (Slide-Over Panel)

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
- Supports drag-and-drop reordering of files
- Right-click context menu for rename/delete/duplicate

---

## 2. Theme System Architecture

### 2.1 How CodeMirror 6 Theming Works

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

1. Store custom themes in IndexedDB (`themes` object store)
2. On app load, read custom themes and inject them as `<style>` elements
3. Theme selector shows built-in themes first, then a divider, then custom themes
4. "Create Theme" opens a live-preview editor where users pick colors and see results instantly
5. "Import Theme" accepts a JSON file via file input

### 2.6 Number of Built-In Themes to Ship

**Recommendation: Ship 10 built-in themes** (5 dark, 4 light, 1 special).

Rationale:
- 10 provides enough variety without overwhelming users
- 5:4 dark-to-light ratio matches developer preference (dark dominant) while respecting light-mode users
- The `@uiw/codemirror-themes-all` package provides 36 themes but ships ~47 KB unpacked — do NOT ship all of them. Instead, selectively import only the 10 we curate.
- Additional themes from `@uiw/codemirror-theme-*` can be lazy-loaded from a "Theme Gallery" section

---

## 3. Responsive Design Strategy

### 3.1 Breakpoint System

| Breakpoint | Width | Target | Layout Changes |
|-----------|-------|--------|----------------|
| **xs** | < 640px | Phone (portrait) | Single-file view; bottom tab bar; simplified toolbar; no minimap; console as full-screen overlay |
| **sm** | 640–767px | Phone (landscape) | Same as xs but wider editor; toolbar can show more icons |
| **md** | 768–1023px | Tablet (portrait) | Slide-over file panel; bottom tab bar; optional split editor |
| **lg** | 1024–1279px | Tablet (landscape) / small laptop | Desktop layout starts; top tab bar; compact file panel option |
| **xl** | 1280–1535px | Standard laptop | Full desktop layout |
| **2xl** | ≥ 1536px | Desktop / external monitor | Full layout with generous spacing; optional side-by-side editors |

### 3.2 Mobile (xs/sm) — Phone Experience

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

1. **Bottom tab bar replaces top tab bar** — Thumb-reachable; shows file type icons (not full filenames)
2. **Hamburger menu** opens the file navigator as a full-screen overlay
3. **Single file view** — No split panes; switching files via bottom bar or file navigator
4. **Touch gestures:**
   - Long press → context menu (copy, paste, select all)
   - Two-finger pinch → zoom (adjust font size)
   - Two-finger scroll → scroll through code
   - Tap on gutter line number → select line
   - Double tap → select word
5. **Virtual keyboard handling:**
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

6. **CodeMirror 6 mobile specifics:**
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

Standard layout as described in Section 1.5 wireframe. Additional desktop-only features:

- **Keyboard shortcuts** — Full keybinding support
- **Drag-and-drop** — File reordering, tab reordering, file import by drag
- **Resizable panels** — Console drawer height adjustable
- **Multiple editor panes** — Split horizontally or vertically (up to 2 panes in v1)
- **Minimap** — Optional (toggle in View menu)

### 3.5 Responsive Implementation with Tailwind

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

### 4.1 Tab State Management

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

- **Dot (●)** after filename in amber color for unsaved changes
- **Modified asterisk** in tab tooltip: "index.html — Modified"
- Tab close behavior for dirty tabs:
  1. Show a small inline popover: "Save? [Save] [Don't Save] [Cancel]"
  2. NOT a full modal dialog — too disruptive for rapid tab closing
  3. If ⌘+W on dirty tab, save automatically (if auto-save is on) then close

### 4.5 Tab Preview on Hover

- On desktop, hovering a tab for 500ms shows a tooltip with:
  - First 3 lines of the file (preview)
  - Full file path
  - Language mode
  - "Modified" badge if dirty
- On mobile, no hover preview — long press shows context menu instead

### 4.6 Drag-and-Drop Tab Reordering

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

### 5.1 Project Data Model

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

- Drag a file onto a folder → move it into that folder
- Drag a file between two files → reorder
- Visual feedback: the target folder highlights with a border glow
- On mobile: long-press to pick up, drag to target (or use "Move To…" dialog as fallback)

### 5.5 Binary File Handling

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

### 6.1 Architecture Overview

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

**Three-tier auto-save:**

1. **In-memory debounce (500ms)** — Save to React state on every keystroke (debounced)
2. **IndexedDB auto-save (5s)** — Write current content to `autoSaves` store periodically
3. **Explicit save (⌘+S)** — Write to `fileContents` store permanently

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

### 6.7 Data Migration Strategy

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

### 7.1 Setup with Vite + React

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
- ✅ File navigator opening/closing
- ✅ Console drawer sliding up
- ✅ Tab switching (subtle content fade)
- ✅ Modals and popovers appearing
- ❌ Code content changes (instant — no animation)
- ❌ Tab reordering (instant snap, no slide)
- ❌ Cursor movement

---

## Summary: Key Technical Recommendations

| Area | Recommendation | Rationale |
|------|---------------|-----------|
| **Design language** | "Soft Industrial" — warm, minimal, code-first | Distinct from VS Code; friendly for students; professional feel |
| **Color system** | CSS custom properties → Tailwind `@theme` → CM6 theme bridge | Single source of truth; runtime switching; unlimited themes |
| **Icon library** | Lucide React | Stroke-based, modern, tree-shakeable |
| **Default theme** | "Cosmic Dusk" (warm amber accent on deep navy) | Unique identity; not another blue/purple theme |
| **Built-in themes** | 10 themes (5 dark, 4 light, 1 retro) | Enough variety without bloat; lazy-load additional from gallery |
| **Tab management** | Single CM6 instance, state save/restore | Memory efficient; only active tab is mounted |
| **Drag-and-drop** | @dnd-kit/core | Active, accessible, touch-friendly |
| **File navigation** | Slide-over panel, search-first, flat-with-groups | NOT a VS Code sidebar; overlay approach saves space |
| **IndexedDB** | Dexie.js v4.4.2 | Best TypeScript support; migrations; reactive queries |
| **LocalStorage** | Quick settings only (< 5 KB) | Synchronous access for theme/font size before render |
| **ZIP export/import** | JSZip v3.10.1 | Industry standard; handles binary files; Deflate compression |
| **Auto-save** | 3-tier: in-memory → IndexedDB (5s) → explicit save | Never lose work; minimal I/O |
| **Binary files** | ArrayBuffer in separate IndexedDB store | Avoids base64 bloat; handles images/assets |
| **CSS framework** | Tailwind CSS 4 + @tailwindcss/vite | Rust engine; zero-config; automatic purging |
| **Mobile layout** | Bottom tab bar, single-file, `100dvh`, `visualViewport` API | Thumb-reachable; keyboard-aware |
| **Virtual keyboard** | `visualViewport` resize listener + CM6 contenteditable | Proper mobile editing experience |
| **Responsive** | CSS Grid with named areas; `@media` breakpoints | Clean layout shifts; no layout thrashing |
| **Animations** | Subtle only (panels, modals); instant for code | Snappy feel; code is never animated |

---

*End of report. This research provides the UI/UX, theming, responsive design, and storage architecture foundation for the code editor project. It should be used alongside Sub-Agent 2's editor/execution research for complete implementation guidance.*
