# TASK-05 — Tab Bar Component (Original Report)

**Task ID:** TASK-05
**Agent:** Sub-agent 2 (Tab/Theme Research) + Main Agent (Implementation)
**Date:** 2026-05-28

---

## Task Description

Implement the IDE-style tab bar component with horizontal scroll overflow, file icons, modified indicator dots, close buttons, middle-click to close, and keyboard navigation.

## Sub-agent Research Findings

1. **Scroll approach:** `overflow-x: auto` + `scrollbar-width: none` + `scrollIntoView` on active tab
2. **Tab DOM:** `<button role="tab">` with icon + label + close/dot span
3. **Modified indicator:** 8px filled circle replaces X; on hover of dirty tab, X replaces dot
4. **Middle-click close:** `onAuxClick` with `e.button === 1` + `onMouseDown` preventDefault
5. **Accessibility:** Full ARIA tablist pattern, roving tabIndex, keyboard nav (Arrow keys, Home, End, Delete)
6. **File icons:** FileCode2 (JS/TS), FileJson2 (JSON), Globe (HTML), Braces (CSS), FileText (MD)

## Implementation Details

### Files Created (3 files)

| File | Purpose |
|------|---------|
| `src/components/Tabs/FileIcon.tsx` | File type icon mapping using Lucide React with Catppuccin Mocha colors |
| `src/components/Tabs/TabBar.tsx` | Main tab bar component with TabItem sub-component, file meta cache, IndexedDB integration |
| `src/components/Tabs/index.ts` | Barrel exports |

### Files Modified

- `src/App.tsx` — Replaced tab bar placeholder with `<TabBar />` component

### Key Design Decisions

1. **FileIcon as separate component** — Reusable for both tab bar and file tree (TASK-07)
2. **In-memory file meta cache** — Temporary solution until TASK-08 provides proper hook
3. **TabItem as inner function component** — Encapsulated logic for close, activate, keyboard nav
4. **fileMetaCache loads from IndexedDB** — Populates on first render, loads content into editorStore
5. **Full ARIA tablist pattern** — Keyboard accessible with roving tabIndex

### Cross-References

- `TabBar.tsx` → Plan P0-03 (Multi-file Tabs), projectStore (TASK-02), editorStore (TASK-02)
- `FileIcon.tsx` → TASK-07 (File tree will reuse this component)
- `globals.css` tab styles → Plan P0-07 (Dark Theme), TASK-13
