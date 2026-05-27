# BUG-04 + BUG-13 Fix — Project Deletion & State Management

**Task ID**: BUG-04, BUG-13, RS-#3, RS-#4
**Date**: 2026-05-28
**Status**: Complete
**Files Modified**: `src/hooks/useProjects.ts`, `src/App.tsx`

---

## BUG-04: Double-Delete Race Condition in deleteProject

### Problem
`deleteProject` in `useProjects.ts` called `deleteFilesByProject(id)` followed by `dbDeleteProject(id)` separately. However, `dbDeleteProject` already performs a cascading delete of both files AND the project inside a single transaction. This meant:
1. Files were deleted TWICE (once outside a transaction, once inside)
2. If the first `deleteFilesByProject` succeeded but `dbDeleteProject` failed, the project record remained but all its files were gone — an orphaned project

### Fix
Removed the redundant `deleteFilesByProject(id)` call. Now only `dbDeleteProject(id)` is used, which correctly handles the cascade delete within a single Dexie transaction.

```typescript
// Before (double-delete)
await deleteFilesByProject(id);  // Step 1: Deletes files (no transaction)
await dbDeleteProject(id);       // Step 2: Tries to delete files AGAIN + project

// After (single transactional delete)
await dbDeleteProject(id);       // Cascade-deletes files + project in one transaction
```

---

## BUG-13 / RS-#3: Double State Update with Invalid Intermediate State

### Problem
When deleting the active project, the code called `setActiveProject('')` (setting `activeProjectId` to an empty string `''`) followed by `useProjectStore.setState({ activeProjectId: null })`. This caused:
1. An intermediate state where `activeProjectId` was `''` (empty string)
2. Two re-renders instead of one
3. The empty string is semantically incorrect (it's not a valid project ID or `null`)

### Fix
Replaced the double-update with a single atomic `setState` call:

```typescript
// Before (double-update, intermediate invalid state)
setActiveProject('');                          // Sets activeProjectId = '' (truthy string!)
useProjectStore.setState({ activeProjectId: null });  // Then overrides to null

// After (single atomic update)
useProjectStore.setState({
  activeProjectId: null,
  openFileIds: [],
  activeFileId: null,
});
```

---

## RS-#4: Raw setState Bypasses Store Actions

### Problem
`useProjectStore.setState({ activeProjectId: null })` was called directly in React components, bypassing store actions. This is fragile — if `setActiveProject` ever added side effects, they'd be skipped.

### Fix
Used `setState` with all three fields (`activeProjectId`, `openFileIds`, `activeFileId`) atomically. This ensures consistent state without needing a new store action. The `closeAllFiles()` and `clearAll()` calls are still made explicitly to clean up editor state.

Applied to both `useProjects.ts` (deleteProject, closeProject) and `App.tsx` (handleCloseProject).

---

## Verification
- TypeScript: passes
- Build: succeeds
- Deleting the active project no longer causes double-delete
- Deleting the active project now uses a single atomic state update
