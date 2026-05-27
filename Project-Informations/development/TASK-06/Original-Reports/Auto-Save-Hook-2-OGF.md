# TASK-06 — Auto-Save Hook (Original Report)

**Task ID:** TASK-06
**Agent:** Main Agent (no sub-agent — routine task)
**Date:** 2026-05-28

---

## Task Description

Implement a React hook that automatically persists dirty file contents from the editor store to IndexedDB via Dexie.js with a configurable debounce delay (default 1 second).

## Implementation Details

### Files Created (1 file)

| File | Purpose |
|------|---------|
| `src/hooks/useAutoSave.ts` | Auto-save hook with 1s debounce, batch save, error handling, and manual save utility |

### Files Modified (1 file)

| File | Change |
|------|--------|
| `src/App.tsx` | Added `useAutoSave()` hook call in the App component |

### Hook Design

**`useAutoSave()` — React Hook**

Flow:
1. Subscribes to `editorStore.dirtyFileIds` and `editorStore.fileContents`
2. When dirty files are detected, starts a debounce timer
3. After the delay (configurable in AppSettings, default 1000ms), reads all dirty file contents from editorStore
4. Writes to IndexedDB via `saveFileContent()` (single file) or `saveMultipleFiles()` (batch)
5. Calls `editorStore.markSaved()` for each saved file
6. Cleans up timer on unmount or when new changes reset the debounce

**`saveAllDirtyFiles()` — Standalone Function**

- Immediately saves all dirty files, bypassing debounce
- Exported as a non-hook function for use in event handlers (Ctrl+S in TASK-15)
- Returns the count of saved files
- Re-throws errors so callers can display error messages

### Configuration

| Setting | Default | Range | Source |
|---------|---------|-------|--------|
| Auto-save enabled | true | on/off | AppSettings.autoSave |
| Debounce delay | 1000ms | 300ms–5000ms (clamped) | AppSettings.autoSaveDelay |

### Error Handling

- Auto-save failures are logged to console but don't crash the app
- Manual save failures are re-thrown for UI feedback
- Concurrent saves are prevented via `isSavingRef` guard

### Cross-References

- `useAutoSave` → Plan P0-06 (Auto-save to IndexedDB)
- `useAutoSave` → `editorStore` (dirty tracking, content access, markSaved)
- `useAutoSave` → `src/db/queries/files.ts` (saveFileContent, saveMultipleFiles)
- `useAutoSave` → `src/db/queries/settings.ts` (getAppSettings for debounce config)
- `saveAllDirtyFiles` → TASK-15 (Keyboard shortcuts: Ctrl+S)
