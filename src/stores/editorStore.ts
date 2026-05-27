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
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

// ─── State Interface ─────────────────────────────────────────

interface EditorState {
  /** In-memory file contents, keyed by file ID */
  fileContents: Record<string, string>;

  /** Set of file IDs with unsaved changes */
  dirtyFileIds: Set<string>;

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

  // ─── Selectors ───────────────────────────────────────────

  /** Check if a specific file has unsaved changes */
  isDirty: (fileId: string) => boolean;

  /** Get the content for a specific file */
  getContent: (fileId: string) => string | undefined;

  /** Get the total number of dirty files */
  dirtyCount: () => number;
}

// ─── Store ───────────────────────────────────────────────────

export const useEditorStore = create<EditorState>()(
  immer((set, get) => ({
    fileContents: {},
    dirtyFileIds: new Set<string>(),
    cursorPositions: {},

    updateContent: (fileId, content) =>
      set((state) => {
        state.fileContents[fileId] = content;
        state.dirtyFileIds = new Set([...state.dirtyFileIds, fileId]);
      }),

    setCursorPosition: (fileId, line, column) =>
      set((state) => {
        state.cursorPositions[fileId] = { line, column };
      }),

    markSaved: (fileId) =>
      set((state) => {
        state.dirtyFileIds = new Set(
          [...state.dirtyFileIds].filter((id) => id !== fileId),
        );
      }),

    loadContent: (fileId, content) =>
      set((state) => {
        state.fileContents[fileId] = content;
      }),

    unloadContent: (fileId) =>
      set((state) => {
        delete state.fileContents[fileId];
        delete state.cursorPositions[fileId];
        state.dirtyFileIds = new Set(
          [...state.dirtyFileIds].filter((id) => id !== fileId),
        );
      }),

    clearAll: () =>
      set((state) => {
        state.fileContents = {};
        state.dirtyFileIds = new Set();
        state.cursorPositions = {};
      }),

    // Selectors — these read state without modifying it
    isDirty: (fileId) => get().dirtyFileIds.has(fileId),

    getContent: (fileId) => get().fileContents[fileId],

    dirtyCount: () => get().dirtyFileIds.size,
  })),
);
