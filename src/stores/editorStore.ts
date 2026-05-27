/**
 * CodeCraft — Editor Store
 *
 * Manages editor-specific state: in-memory file contents (which may
 * differ from what's saved to IndexedDB), dirty tracking, and
 * per-file editor configuration.
 *
 * Why separate from projectStore?
 * - Editor content changes very frequently (every keystroke)
 * - We don't want to persist raw content to localStorage
 * - Content sync to IndexedDB is handled by auto-save (TASK-06)
 *
 * BUG-01 FIX: Replaced `Set<string>` with `Record<string, boolean>` for
 * dirtyFileIds. Set is O(n) for immutable updates with immer, not
 * JSON-serializable (corrupts if persist middleware is added), and
 * doesn't work with Zustand's reactivity model. Record<string,boolean>
 * is O(1) for add/delete, JSON-safe, and immer-friendly.
 *
 * RS-#1 FIX: Removed function selectors (isDirty, getContent, dirtyCount)
 * from the store. These returned stable function references that never
 * triggered re-renders when underlying data changed. Components now use
 * inline selectors that subscribe to the reactive data directly.
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

// ─── State Interface ─────────────────────────────────────────

interface EditorState {
  /** In-memory file contents, keyed by file ID */
  fileContents: Record<string, string>;

  /**
   * Track which files have unsaved changes.
   * BUG-01 FIX: Changed from Set<string> to Record<string, boolean>.
   * - O(1) add/delete with immer drafts: `state.dirtyFileIds[id] = true` / `delete state.dirtyFileIds[id]`
   * - JSON-serializable (safe if persist middleware is added later)
   * - Zustand selectors can subscribe to individual keys or .size
   */
  dirtyFileIds: Record<string, boolean>;

  /** Cursor position per file { line, column } */
  cursorPositions: Record<string, { line: number; column: number }>;

  // ─── Actions ─────────────────────────────────────────────

  /** Update the content of a file (marks it as dirty) */
  updateContent: (fileId: string, content: string) => void;

  /** Set the cursor position for a file */
  setCursorPosition: (fileId: string, line: number, column: number) => void;

  /** Mark a file as saved (clear dirty flag) */
  markSaved: (fileId: string) => void;

  /** Load content for a file (from IndexedDB, does NOT mark dirty) */
  loadContent: (fileId: string, content: string) => void;

  /** Remove a file's content from memory (when closing a tab) */
  unloadContent: (fileId: string) => void;

  /** Clear all in-memory state (e.g., when switching projects) */
  clearAll: () => void;
}

// ─── Store ───────────────────────────────────────────────────

export const useEditorStore = create<EditorState>()(
  immer((set) => ({
    fileContents: {},
    dirtyFileIds: {},
    cursorPositions: {},

    updateContent: (fileId, content) =>
      set((state) => {
        state.fileContents[fileId] = content;
        // BUG-01 FIX: O(1) assignment instead of O(n) Set spread
        state.dirtyFileIds[fileId] = true;
      }),

    setCursorPosition: (fileId, line, column) =>
      set((state) => {
        state.cursorPositions[fileId] = { line, column };
      }),

    markSaved: (fileId) =>
      set((state) => {
        // BUG-01 FIX: O(1) delete instead of O(n) Set filter
        delete state.dirtyFileIds[fileId];
      }),

    loadContent: (fileId, content) =>
      set((state) => {
        state.fileContents[fileId] = content;
      }),

    unloadContent: (fileId) =>
      set((state) => {
        delete state.fileContents[fileId];
        delete state.cursorPositions[fileId];
        // BUG-01 FIX: O(1) delete instead of O(n) Set filter
        delete state.dirtyFileIds[fileId];
      }),

    clearAll: () =>
      set((state) => {
        state.fileContents = {};
        state.dirtyFileIds = {};
        state.cursorPositions = {};
      }),
  })),
);

// ─── Selector Helpers ─────────────────────────────────────────
//
// RS-#1 FIX: Function selectors (isDirty, getContent, dirtyCount) have
// been REMOVED from the store. They returned stable function references
// that never triggered re-renders when underlying data changed.
//
// Components should now use inline selectors that subscribe to the
// reactive data directly. Examples:
//
//   // Check if a specific file is dirty:
//   const dirty = useEditorStore(s => !!s.dirtyFileIds[activeFileId]);
//
//   // Get the content of a specific file:
//   const content = useEditorStore(s => s.fileContents[activeFileId ?? '']);
//
//   // Get the count of dirty files:
//   const dirtyCount = useEditorStore(s => Object.keys(s.dirtyFileIds).length);
//
// For non-React contexts (event handlers, async callbacks), use:
//   useEditorStore.getState().dirtyFileIds[fileId]
//   useEditorStore.getState().fileContents[fileId]
