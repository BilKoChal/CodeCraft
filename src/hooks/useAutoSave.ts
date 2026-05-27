/**
 * CodeCraft — Auto-Save Hook
 *
 * Automatically persists dirty file contents from the editor store
 * to IndexedDB via Dexie.js with a configurable debounce delay.
 *
 * How it works:
 * 1. The hook subscribes to editorStore's dirtyFileIds
 * 2. When dirty files are detected, a debounced timer starts
 * 3. After the debounce delay (default 1 second), each dirty file's
 *    content is read from editorStore and written to IndexedDB
 * 4. After successful save, the file is marked as clean in editorStore
 * 5. The cycle repeats whenever new dirty files appear
 *
 * BUG-01 FIX: Adapted all dirtyFileIds access from Set methods (.size,
 * .has(), iteration) to Record<string, boolean> methods
 * (Object.keys().length, !!record[id], Object.keys() iteration).
 *
 * BUG-14 + SEC-04 FIX: Added beforeunload handler that warns the user
 * when they try to close the browser tab with unsaved changes. Also
 * added a visibilitychange handler that attempts to flush dirty files
 * when the tab becomes hidden (more reliable than unmount cleanup).
 *
 * Usage in App.tsx:
 *   function App() {
 *     useAutoSave();
 *     return <WorkspaceLayout />;
 *   }
 *
 * @see Project-Plan.md P0-06 — Auto-save to IndexedDB
 * @see src/stores/editorStore.ts — In-memory editor content + dirty tracking
 * @see src/db/queries/files.ts — saveFileContent(), saveMultipleFiles()
 */

import { useEffect, useRef, useCallback } from 'react';
import { useEditorStore } from '../stores/editorStore';
import { saveFileContent, saveMultipleFiles } from '../db';
import { getAppSettings } from '../db';

// ─── Configuration ────────────────────────────────────────────

/** Minimum debounce delay (ms) to prevent excessive IndexedDB writes */
const MIN_DEBOUNCE_MS = 300;

/** Maximum debounce delay (ms) to ensure data isn't delayed too long */
const MAX_DEBOUNCE_MS = 5000;

/** Default debounce when settings aren't available yet */
const DEFAULT_DEBOUNCE_MS = 1000;

// ─── Hook ─────────────────────────────────────────────────────

/**
 * useAutoSave — Automatically persists editor changes to IndexedDB.
 *
 * Call this hook once at the top level of your application (e.g., App.tsx).
 * It manages its own lifecycle and requires no parameters or return values.
 *
 * The hook:
 * - Only runs when there are dirty files in the editor store
 * - Debounces saves by 1 second (configurable in app settings)
 * - Batches multiple dirty files into a single save operation
 * - Handles errors gracefully (logs but doesn't crash)
 * - Warns on tab close if unsaved changes exist (BUG-14/SEC-04)
 * - Flushes dirty files when tab becomes hidden (SEC-04)
 * - Cleans up timers on unmount
 */
export function useAutoSave(): void {
  // Access editor store state and actions
  // BUG-01 FIX: dirtyFileIds is now Record<string, boolean>, not Set<string>
  const dirtyFileIds = useEditorStore((s) => s.dirtyFileIds);
  const fileContents = useEditorStore((s) => s.fileContents);
  const markSaved = useEditorStore((s) => s.markSaved);

  // Refs for timer and state that shouldn't trigger re-renders
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSavingRef = useRef(false);
  const lastSaveTimeRef = useRef<number>(0);

  /**
   * Perform the actual save operation for all currently dirty files.
   * Wrapped in useCallback to maintain stable reference for the effect.
   */
  const flushDirtyFiles = useCallback(async () => {
    // Prevent concurrent saves
    if (isSavingRef.current) return;

    // Snapshot the current dirty file IDs
    // BUG-01 FIX: Use Object.keys() instead of Set constructor
    const currentDirty = useEditorStore.getState().dirtyFileIds;
    const dirtyIds = Object.keys(currentDirty);

    if (dirtyIds.length === 0) return;

    isSavingRef.current = true;

    try {
      const contents = useEditorStore.getState().fileContents;
      const updates: Array<{ id: string; content: string }> = [];

      for (const fileId of dirtyIds) {
        const content = contents[fileId];
        if (content !== undefined) {
          updates.push({ id: fileId, content });
        }
      }

      if (updates.length === 0) {
        isSavingRef.current = false;
        return;
      }

      // Use the batch save for efficiency (single transaction)
      if (updates.length === 1) {
        // Single file — use the simpler query
        await saveFileContent(updates[0].id, updates[0].content);
      } else {
        // Multiple files — batch save in one transaction
        await saveMultipleFiles(updates);
      }

      // Mark all saved files as clean in the editor store
      for (const { id } of updates) {
        markSaved(id);
      }

      lastSaveTimeRef.current = Date.now();
    } catch (error) {
      // Don't crash the app — just log the error
      // The user can manually save with Ctrl+S (TASK-15)
      console.error('[AutoSave] Failed to save files:', error);
    } finally {
      isSavingRef.current = false;
    }
  }, [markSaved]);

  /**
   * Get the current auto-save debounce delay from app settings.
   * Falls back to default if settings aren't available.
   */
  const getDebounceDelay = useCallback(async (): Promise<number> => {
    try {
      const settings = await getAppSettings();

      // Respect the user's auto-save toggle
      if (!settings.autoSave) return -1; // -1 means disabled

      // Clamp the delay to reasonable bounds
      const delay = settings.autoSaveDelay ?? DEFAULT_DEBOUNCE_MS;
      return Math.max(MIN_DEBOUNCE_MS, Math.min(delay, MAX_DEBOUNCE_MS));
    } catch {
      return DEFAULT_DEBOUNCE_MS;
    }
  }, []);

  // ─── Main Effect: Watch dirty files and schedule saves ──────

  useEffect(() => {
    // BUG-01 FIX: Use Object.keys().length instead of .size
    if (Object.keys(dirtyFileIds).length === 0) return;

    // Clear any existing timer (debounce reset)
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
    }

    // Schedule the save with debounce
    const scheduleSave = async () => {
      const delay = await getDebounceDelay();

      // Auto-save disabled in settings
      if (delay < 0) return;

      timerRef.current = setTimeout(() => {
        flushDirtyFiles();
      }, delay);
    };

    scheduleSave();

    // Cleanup on unmount or before next effect run
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [dirtyFileIds, fileContents, flushDirtyFiles, getDebounceDelay]);

  // ─── BUG-14 + SEC-04: beforeunload handler ──────────────────
  // Warn the user when they try to close the tab with unsaved changes.
  // This is the standard mechanism used by VS Code, Google Docs, etc.
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const currentDirty = useEditorStore.getState().dirtyFileIds;
      // BUG-01 FIX: Use Object.keys().length instead of .size
      if (Object.keys(currentDirty).length > 0) {
        // Standard way to trigger the browser's "unsaved changes" dialog
        e.preventDefault();
        // Required for legacy browsers (Chrome < 119, Firefox)
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // ─── SEC-04: visibilitychange handler ───────────────────────
  // When the tab becomes hidden (user switches tabs, minimizes browser),
  // attempt to flush any dirty files. This is more reliable than unmount
  // cleanup because the browser actually waits for this event to complete.
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        const currentDirty = useEditorStore.getState().dirtyFileIds;
        // BUG-01 FIX: Use Object.keys().length instead of .size
        if (Object.keys(currentDirty).length > 0) {
          // Best-effort save — may not complete if the browser is
          // terminating the page, but IndexedDB writes started before
          // "hidden" are generally completed by the browser.
          flushDirtyFiles();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [flushDirtyFiles]);
}

// ─── Manual Save Utility ──────────────────────────────────────

/**
 * Immediately save all dirty files, bypassing the debounce timer.
 * Called by keyboard shortcut Ctrl+S (TASK-15).
 *
 * This is exported as a standalone function (not a hook) so it can
 * be called from event handlers without a React component context.
 */
export async function saveAllDirtyFiles(): Promise<number> {
  const { dirtyFileIds, fileContents } = useEditorStore.getState();

  // BUG-01 FIX: Use Object.keys() instead of Set iteration
  const dirtyKeys = Object.keys(dirtyFileIds);

  if (dirtyKeys.length === 0) return 0;

  const updates: Array<{ id: string; content: string }> = [];

  for (const fileId of dirtyKeys) {
    const content = fileContents[fileId];
    if (content !== undefined) {
      updates.push({ id: fileId, content });
    }
  }

  if (updates.length === 0) return 0;

  try {
    if (updates.length === 1) {
      await saveFileContent(updates[0].id, updates[0].content);
    } else {
      await saveMultipleFiles(updates);
    }

    // Mark all as saved
    const { markSaved } = useEditorStore.getState();
    for (const { id } of updates) {
      markSaved(id);
    }

    return updates.length;
  } catch (error) {
    console.error('[AutoSave] Manual save failed:', error);
    throw error; // Re-throw so the caller can show an error message
  }
}
