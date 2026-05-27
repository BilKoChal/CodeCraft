/**
 * CodeCraft — Auto-Save Hook
 *
 * Automatically persists dirty file contents from the editor store
 * to IndexedDB via Dexie.js with a configurable debounce delay.
 *
 * How it works:
 * 1. The hook subscribes to editorStore's dirtyFileIds set
 * 2. When dirty files are detected, a debounced timer starts
 * 3. After the debounce delay (default 1 second), each dirty file's
 *    content is read from editorStore and written to IndexedDB
 * 4. After successful save, the file is marked as clean in editorStore
 * 5. The cycle repeats whenever new dirty files appear
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
 * - Cleans up timers on unmount
 */
export function useAutoSave(): void {
  // Access editor store state and actions
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
    const dirtyIds = new Set(useEditorStore.getState().dirtyFileIds);

    if (dirtyIds.size === 0) return;

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
    // If no dirty files, nothing to do
    if (dirtyFileIds.size === 0) return;

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

  // ─── Cleanup Effect: Flush remaining dirty files on unmount ─

  useEffect(() => {
    return () => {
      // When the component unmounts, flush any remaining dirty files
      // This prevents data loss if the user closes the tab during a debounce
      const dirtyIds = useEditorStore.getState().dirtyFileIds;
      if (dirtyIds.size > 0) {
        // Use synchronous-style flush — we can't await in cleanup
        // but we can start the save operations
        flushDirtyFiles();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
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

  if (dirtyFileIds.size === 0) return 0;

  const updates: Array<{ id: string; content: string }> = [];

  for (const fileId of dirtyFileIds) {
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
