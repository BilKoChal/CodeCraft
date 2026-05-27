# CodeCraft — Worklog: TASK-07 + TASK-08

**Date:** 2026-05-28
**Tasks:** TASK-07 (File Tree Sidebar) + TASK-08 (File CRUD Operations)
**Milestone:** M3 — File Management

---

## Pre-Work: Build Error Fixes

Before starting TASK-07/08, fixed 4 TypeScript build errors reported by GitHub Actions:

1. `useAutoSave.ts:62` — `clearAll` declared but never read → Removed unused variable
2. `TabBar.tsx:174` — `setActiveFile` declared but never read → Removed unused variable
3. `CodeEditor.tsx:115` — Property 'align' missing in type `HTMLElement` vs `HTMLDivElement` → Added `as HTMLDivElement` cast on `view.dom`
4. `CodeEditor.tsx:32` — `isDirty` declared but never read → Removed unused variable

Also removed `.github/workflows/deploy.yml` as requested — project is not yet ready for CI/CD deployment. Will be re-added in TASK-19.

Build verified passing after all fixes.

---

## TASK-07: File Tree Sidebar Component

### Files Created

1. **`src/components/Sidebar/FileTree.tsx`** — Full file tree component with:
   - Flat file list for Phase 0 (no nested folders)
   - Click to open file in editor
   - Right-click context menu (Rename, Delete)
   - Inline rename input with Enter/Escape keyboard support
   - "New File" button with inline name input
   - Empty state with "Create your first file" prompt
   - No-project state with "No project open" message
   - Keyboard navigation: Enter=open, Delete=delete, F2=rename
   - File icons via `FileIcon` component (shared with TabBar)
   - Active file highlighting
   - Error banner for failed operations
   - "..." action button per file (visible on hover)

2. **`src/components/Sidebar/index.ts`** — Barrel exports for FileTree, useFileTree, UseFileTreeReturn

### Files Modified

3. **`src/App.tsx`** — Integrated `<FileTree />` into the sidebar Panel, replacing the placeholder text
4. **`src/styles/globals.css`** — Added ~200 lines of file tree CSS:
   - `.file-tree` container styles
   - `.file-tree-header` with title + action button
   - `.file-tree-item` with hover/active states
   - `.file-tree-error` error banner
   - `.file-tree-empty` empty state
   - `.file-tree-rename-input` / `.file-tree-new-file-input` inline inputs
   - `.file-tree-context-menu` floating context menu
   - `.context-menu-item` with `.danger` variant
   - `.titlebar` styles (extracted from inline to CSS class)

---

## TASK-08: File CRUD Operations (useFileTree Hook)

### Files Created

1. **`src/components/Sidebar/useFileTree.ts`** — React hook wrapping Dexie file queries:
   - `useLiveQuery` for reactive file list (auto-updates when DB changes)
   - `createFile(name)` — Creates file + opens it in editor + loads content
   - `renameFile(fileId, newName)` — Renames + duplicate name check
   - `deleteFile(fileId)` — Deletes + closes tab + unloads editor content
   - `fileNameExists(name)` — Duplicate name check
   - `error` / `clearError` — Error state management
   - `loading` state for async DB queries
   - Input validation (no empty names, no slashes for Phase 0)
   - Flat path computation (`/` + filename for Phase 0)

### Design Decisions

- **useLiveQuery from dexie-react-hooks**: Provides reactive DB queries that auto-update when the underlying IndexedDB data changes. This means the file tree updates in real-time whenever files are created/renamed/deleted — no manual refresh needed.
- **Optimistic UI with store coordination**: When creating a file, we immediately load content into editorStore and open the tab. When deleting, we close the tab and unload content before the DB delete. This ensures the UI stays responsive.
- **Hook colocation**: The useFileTree hook lives in the Sidebar directory alongside the FileTree component that consumes it. This follows the "colocate related code" principle.

---

## Build Verification

```
✓ tsc -b — 0 errors
✓ vite build — success
  Bundle: ~153KB gzipped (under 170KB target)
```

---

## Milestone Status

**M3: File Management** — ✅ Complete (TASK-07 + TASK-08)

Remaining Phase 0 tasks:
- M4: TASK-09 (Project list page), TASK-10 (ZIP import/export)
- M5: TASK-11 (JS code runner), TASK-12 (Console output panel)
- M6: TASK-14 (Status bar), TASK-15 (Keyboard shortcuts), TASK-16 (PWA), TASK-17 (Live preview), TASK-18 (Skeleton loading)
- M7: TASK-19 (Deploy + testing), TASK-20 (Sample project template)
