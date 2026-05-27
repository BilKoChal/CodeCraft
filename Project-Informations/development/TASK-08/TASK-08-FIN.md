# TASK-08 — File CRUD Operations (useFileTree Hook)

**Status:** ✅ Complete
**Milestone:** M3 — File Management
**Date Completed:** 2026-05-28

---

## Summary

Created the `useFileTree` React hook that wraps Dexie.js file queries into a reactive, React-friendly interface. This hook is the data layer for the file tree sidebar (TASK-07), providing real-time file list updates via Dexie's `useLiveQuery` and coordinated CRUD operations that update both IndexedDB and the Zustand editor/project stores.

## Files Created

| File | Description |
|------|-------------|
| `src/components/Sidebar/useFileTree.ts` | React hook: reactive file list + CRUD (~160 lines) |

## API Surface

```typescript
interface UseFileTreeReturn {
  files: FileEntry[];          // Reactive file list (sorted by name)
  loading: boolean;            // Whether files are being loaded
  error: string | null;       // Error message if an operation failed
  clearError: () => void;     // Clear the current error
  createFile: (name: string) => Promise<FileEntry | null>;
  renameFile: (fileId: string, newName: string) => Promise<boolean>;
  deleteFile: (fileId: string) => Promise<boolean>;
  fileNameExists: (name: string) => Promise<boolean>;
}
```

## Features Implemented

- **Reactive file list** — uses `useLiveQuery` from `dexie-react-hooks` for automatic DB → UI sync
- **createFile(name)** — validates input, computes flat path (`/` + name), creates in DB, loads content into editorStore, opens tab in projectStore
- **renameFile(fileId, newName)** — validates input, checks for duplicate names (excluding self), updates DB
- **deleteFile(fileId)** — closes tab in projectStore, unloads content from editorStore, deletes from DB
- **fileNameExists(name)** — async check for duplicate filenames
- **Error handling** — stateful `error` + `clearError` for user-facing error messages
- **Input validation** — rejects empty names, names with `/` (Phase 0 = flat), and duplicate filenames

## Design Decisions

1. **useLiveQuery over manual subscription**: Dexie's `useLiveQuery` provides automatic re-rendering when the underlying IndexedDB data changes. This eliminates the need for manual refresh logic and ensures the file tree always reflects the current DB state.

2. **Store coordination on create**: When a file is created, we immediately call `loadContent` (editorStore) and `openFile` (projectStore) so the user sees the new file in the editor without any extra clicks.

3. **Store coordination on delete**: We close the tab and unload content before deleting from DB. This prevents the editor from showing stale content for a deleted file.

4. **Hook colocation**: The hook lives in `src/components/Sidebar/` alongside its sole consumer (FileTree). This follows the "colocate related code" principle and makes the component self-contained.

5. **No optimistic mutations**: Unlike create/delete, rename doesn't optimistically update the UI. Since `useLiveQuery` auto-refreshes, the UI updates almost instantly after the DB write completes. This simplifies error handling.

## Dependencies

- TASK-03 (Dexie database + queries) — provides the DB layer
- TASK-02 (Zustand stores) — editorStore and projectStore integration
- `dexie-react-hooks` — provides `useLiveQuery` for reactive queries
