# BUG-14 + SEC-04 Fix — beforeunload & Data Loss Protection

**Task ID**: BUG-14, SEC-04
**Date**: 2026-05-28
**Status**: Complete
**Files Modified**: `src/hooks/useAutoSave.ts`

---

## Problem
The application had no `beforeunload` event handler. When a user had unsaved (dirty) changes in the editor and closed the browser tab, they lost their work. The auto-save debounce timer may not have fired yet, and the cleanup effect could not guarantee the save completes (async operations in cleanup are abandoned).

## Fix
Added two event handlers in `useAutoSave.ts`:

### 1. beforeunload Handler
Warns the user when they try to close the tab with unsaved changes. Triggers the standard browser "Leave site?" dialog.

### 2. visibilitychange Handler
Flushes dirty files when the tab becomes hidden (user switches tabs, minimizes browser). This is more reliable than `beforeunload` for actually persisting data because the browser gives the page a brief window to complete IndexedDB writes before suspending.

### Removed
The unreliable unmount cleanup effect that called `flushDirtyFiles()` asynchronously in a synchronous cleanup function. This never worked reliably on tab close because the browser doesn't wait for async operations in cleanup.

## Verification
- TypeScript: passes
- Build: succeeds
- Browser shows "unsaved changes" dialog on tab close when files are dirty
- Switching tabs triggers a best-effort save of dirty files
