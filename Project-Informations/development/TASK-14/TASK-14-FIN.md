# TASK-14 — Status Bar Component (Final Report)

**Task ID:** TASK-14  
**Milestone:** M6 — Polish + PWA  
**Status:** ✅ Complete  
**Date:** 2026-05-28

---

## Summary

Implemented a dynamic, reactive status bar component that replaces the previous hardcoded static footer in App.tsx. The status bar provides real-time information about the editor state, active file, and code execution status.

## Implementation Details

### New Files
- **`src/components/StatusBar/StatusBar.tsx`** — Main StatusBar component
- **`src/components/StatusBar/index.ts`** — Barrel export

### Modified Files
- **`src/App.tsx`** — Replaced hardcoded `<footer>` with `<StatusBar />` component; added import
- **`src/styles/globals.css`** — Added `.statusbar-clickable`, `.statusbar-separator` styles for interactive items

### Features Implemented
1. **Save status indicator** — Shows "Saved" (green) or "Modified" (yellow) with icon, tracks total dirty file count
2. **Cursor position** — Real-time Ln/Col display from editorStore.cursorPositions
3. **Language indicator** — Dynamically reads active file's language from IndexedDB, with display names (JavaScript, TypeScript, etc.)
4. **Encoding display** — Shows "UTF-8" (clickable for Phase 1 encoding settings)
5. **Tab size display** — Shows "Spaces: 2" (clickable for Phase 1 settings)
6. **Execution status indicator** — Shows Ready/Running/Error/Timeout with colored icons matching the console panel

### Design Decisions
- All status bar items are `<button>` elements for accessibility and Phase 1 click interactivity
- File metadata cached in module-level variable to avoid IndexedDB reads on every cursor update
- Cache invalidated when active file changes
- Store reads use `getState()` pattern in the component body (not in event handlers) for simplicity
- Status bar height: 22px (consistent with CSS variable `--statusbar-height`)

### Data Flow
```
editorStore.cursorPositions → StatusBar → Ln/Col display
editorStore.dirtyFileIds   → StatusBar → Save status
projectStore.activeFileId  → StatusBar → File metadata lookup
consoleStore.status        → StatusBar → Execution indicator
IndexedDB (file metadata)  → StatusBar → Language display
```
