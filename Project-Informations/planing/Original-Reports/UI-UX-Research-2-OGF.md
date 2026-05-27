# CodeCraft — UI/UX Research Report

**Task ID:** 2  
**Agent:** UI-UX-Research-2  
**Date:** 2026-05-28  
**Scope:** UI/UX patterns, component architecture, and Phase 0 scope for CodeCraft browser-based IDE

---

## Table of Contents

1. [Best-in-Class Browser IDE UI Patterns](#1-best-in-class-browser-ide-ui-patterns)
2. [File Tree Sidebar Design](#2-file-tree-sidebar-design)
3. [Tab System Design](#3-tab-system-design)
4. [Live Preview Panel](#4-live-preview-panel)
5. [Search & Replace UX](#5-search--replace-ux)
6. [Theme & Visual Polish](#6-theme--visual-polish)
7. [Phase 0 UI Scope](#7-phase-0-ui-scope)
8. [Component Architecture for UI](#8-component-architecture-for-ui)

---

## 1. Best-in-Class Browser IDE UI Patterns

### 1.1 Competitor Analysis

| IDE | First-Glance Strength | Layout Philosophy | Weakness |
|-----|----------------------|-------------------|----------|
| **VS Code for Web** | Instant familiarity — identical to desktop | Activity Bar + Sidebar + Editor + Panel = 4-zone layout | Heavy initial load (~5MB+) |
| **StackBlitz** | Lightning-fast boot (<2s) | VS Code layout via Monaco | No preview panel in default view |
| **CodeSandbox** | Beautiful onboarding with templates | Sidebar + editor + right preview (3-zone) | Less customizable layout |
| **Replit** | Collaborative-first; AI features | Sidebar + editor + right panel | Cluttered with features |
| **CodePen** | Immediate "write and see" | Simple 2x2 or column layout | Not a project editor |

### 1.2 What Makes "First Glance" Impressive

1. **Instant visual structure** — Recognizable IDE layout from the first moment
2. **Dark theme by default** — Developers expect it
3. **Professional typography** — Monospace at 13-14px with proper line height
4. **Minimal chrome, maximum content** — Thin title bars, compact tab strips
5. **Responsive panels** — Drag-to-resize that "feels right"
6. **Working preview in <3 seconds** — "Wow" moment
7. **Skeleton loading states** — Show structural outline while loading

### 1.3 Canonical Layout Pattern (CodeCraft Simplified 3-Zone)

```
┌──────────────────────────────────────────────────┐
│ Title Bar                        [Theme] [Run ▶] │
├──────┬───────────────────────────────────────────┤
│      │ Tab Bar  [index.js●] [style.css]          │
│ F    ├───────────────────────────────────────────┤
│ i    │                                           │
│ l    │        Editor (CodeMirror 6)              │
│ e    │                                           │
│      ├───────────────────────────────────────────┤
│ T    │ Output Panel (Console / Preview)          │
│ r    │  ┌─ Console ─┬─ Preview ─┐               │
│ e    │  │            │           │               │
│ e    │  └────────────┴───────────┘               │
├──────┴───────────────────────────────────────────┤
│ Ln 1, Col 1  │  JavaScript  │  UTF-8  │  Spaces:2│
└──────────────────────────────────────────────────┘
```

---

## 2. File Tree Sidebar Design

### 2.1 Data Structure

```typescript
interface FileNode {
  id: string;          // unique path like "src/components/App.js"
  name: string;        // "App.js"
  type: 'file' | 'directory';
  parentId: string | null;
  childrenIds: string[];
  isExpanded?: boolean;
  depth: number;       // for indentation without recursion
}

type FileTree = Record<string, FileNode>;
```

### 2.2 Context Menu Actions (Phase 0)

| Action | File | Folder |
|--------|------|--------|
| New File | Y | Y |
| New Folder | Y | Y |
| Rename | Y | Y |
| Delete | Y | Y |

### 2.3 File Icons by Type

```typescript
const FILE_ICONS: Record<string, { icon: string; color: string }> = {
  '.js':   { icon: 'file-code-2', color: '#F7DF1E' },
  '.jsx':  { icon: 'file-code-2', color: '#61DAFB' },
  '.ts':   { icon: 'file-code-2', color: '#3178C6' },
  '.css':  { icon: 'file-code-2', color: '#1572B6' },
  '.html': { icon: 'file-code-2', color: '#E34F26' },
  '.json': { icon: 'file-json',   color: '#A8B9CC' },
  '.md':   { icon: 'file-text',   color: '#ffffff' },
};
```

---

## 3. Tab System Design

### 3.1 Tab Bar Layout

- Each tab: file icon + file name + close button (x) on hover
- Active tab: highlighted background, bottom border accent
- Modified indicator: small filled circle replacing close button on hover
- Middle-click = close tab
- Horizontal scroll for overflow

### 3.2 Phase 0 Scope

- Horizontal scroll overflow
- Close buttons
- Modified indicator dot
- No drag reorder, no pinning

---

## 4. Live Preview Panel

### 4.1 Sandboxed iframe with srcdoc

```typescript
const iframe = document.createElement('iframe');
iframe.sandbox = 'allow-scripts allow-modals';
iframe.srcdoc = compiledHTML;
```

### 4.2 Hot Reload Strategy

- Phase 0: Debounced full refresh (300ms)
- Phase 1: CSS hot injection
- Phase 2: HMR

---

## 5. Search & Replace UX

- Phase 0: Current-file search only (CM6 `@codemirror/search`)
- Phase 1: Cross-file search panel in sidebar

---

## 6. Theme & Visual Polish

### 6.1 Color Palette (Catppuccin Mocha-inspired)

```
Background hierarchy:
  Editor background:    #1e1e2e
  Sidebar background:  #181825
  Activity bar:        #11111b
  Tab bar:             #1e1e2e
  Bottom panel:        #181825
  Status bar:          #181825

Foreground hierarchy:
  Primary text:        #cdd6f4
  Secondary text:      #a6adc8
  Inactive text:       #585b70
  Accent:              #89b4fa

Borders:
  Panel borders:       #313244
  Active tab border:   #89b4fa
```

### 6.2 Icons Library

**Primary: Lucide React** — tree-shakeable, MIT, 1600+ icons, ~5KB for 20 icons

### 6.3 Micro-Interactions

| Interaction | Duration | Easing |
|-------------|----------|--------|
| Sidebar collapse/expand | 200ms | ease-out |
| Tab activate | 100ms | ease |
| File tree expand/collapse | 150ms | ease-out |
| Context menu appear | 100ms | ease-out |
| Button hover | 80ms | ease |

---

## 7. Phase 0 UI Scope

**Must-have:**

| Component | Scope |
|-----------|-------|
| File Tree Sidebar | Collapsible, single-level, basic icons |
| Tab Bar | Horizontal scroll, close buttons, modified dot |
| Code Editor | CodeMirror 6 with JS syntax highlighting |
| Output Panel | Console tab only (captured console.log) |
| Status Bar | Line/col, language, encoding |
| Dark Theme | Single dark theme (Catppuccin-inspired) |
| Run Button | Executes JS, shows output in console |

**Visual Target:** A visitor opens the page, sees a professional-looking IDE, types code, and sees output — in under 5 seconds.

---

## 8. Component Architecture for UI

### 8.1 React Component Tree

```
<App>
  <ThemeProvider>
    <WorkspaceLayout>
      <PanelGroup direction="horizontal">
        <Panel defaultSize={20}>  ← Sidebar
          <Sidebar>
            <FileTree>
              <FileTreeNode />
            </FileTree>
          </Sidebar>
        </Panel>
        <PanelResizeHandle />
        <Panel defaultSize={80}>  ← Main area
          <PanelGroup direction="vertical">
            <Panel defaultSize={70}>  ← Editor
              <TabBar><Tab /></TabBar>
              <CodeMirrorEditor />
            </Panel>
            <PanelResizeHandle />
            <Panel defaultSize={30}>  ← Bottom panel
              <BottomPanel>
                <ConsoleOutput />
              </BottomPanel>
            </Panel>
          </PanelGroup>
        </Panel>
      </PanelGroup>
      <StatusBar />
    </WorkspaceLayout>
  </ThemeProvider>
</App>
```

### 8.2 Layout System

**Recommendation: `react-resizable-panels`** — ~8KB, built by React team member, auto-persists layout, collapse API, pixel-based min/max.

### 8.3 Key Dependencies (Phase 0)

| Package | Purpose | Size |
|---------|---------|------|
| `react` + `react-dom` | UI framework | 45KB |
| `@uiw/react-codemirror` | CM6 React wrapper | 15KB |
| `@codemirror/lang-javascript` | JS syntax | 25KB |
| `react-resizable-panels` | Panel layout | 8KB |
| `zustand` | State management | 1KB |
| `lucide-react` | UI icons | ~5KB |
| **Total Phase 0 JS** | | **~104KB** |
