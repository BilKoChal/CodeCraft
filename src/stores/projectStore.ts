/**
 * CodeCraft — Project Store
 *
 * Manages the currently active project and file state.
 * Persists project navigation state (active project, open files)
 * to localStorage via Zustand's persist middleware.
 *
 * Data persistence (actual file content) is handled by Dexie.js
 * (TASK-03). This store only tracks UI-level project state.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

// ─── State Interface ─────────────────────────────────────────

interface ProjectState {
  /** ID of the currently active project */
  activeProjectId: string | null;

  /** Ordered list of currently open file IDs (maps to tabs) */
  openFileIds: string[];

  /** ID of the currently active (focused) file in the editor */
  activeFileId: string | null;

  // ─── Actions ─────────────────────────────────────────────

  /** Set the active project (switching projects closes all tabs) */
  setActiveProject: (id: string) => void;

  /** Open a file in a new tab (or focus if already open) */
  openFile: (id: string) => void;

  /** Close a file tab */
  closeFile: (id: string) => void;

  /** Set the active (focused) file without opening a new tab */
  setActiveFile: (id: string) => void;

  /** Close all open tabs (e.g., when deleting a project) */
  closeAllFiles: () => void;
}

// ─── Store ───────────────────────────────────────────────────

export const useProjectStore = create<ProjectState>()(
  persist(
    immer((set) => ({
      activeProjectId: null,
      openFileIds: [],
      activeFileId: null,

      setActiveProject: (id) =>
        set((state) => {
          state.activeProjectId = id;
          // Switching projects resets the tab state
          state.openFileIds = [];
          state.activeFileId = null;
        }),

      openFile: (id) =>
        set((state) => {
          // Add to open tabs if not already there
          if (!state.openFileIds.includes(id)) {
            state.openFileIds.push(id);
          }
          // Always focus the opened file
          state.activeFileId = id;
        }),

      closeFile: (id) =>
        set((state) => {
          const idx = state.openFileIds.indexOf(id);
          state.openFileIds = state.openFileIds.filter((fileId: string) => fileId !== id);

          // If we closed the active file, focus the next most recent tab
          if (state.activeFileId === id) {
            if (state.openFileIds.length === 0) {
              state.activeFileId = null;
            } else {
              // Focus the tab that was to the right, or the last one
              const newIdx = Math.min(idx, state.openFileIds.length - 1);
              state.activeFileId = state.openFileIds[newIdx];
            }
          }
        }),

      setActiveFile: (id) =>
        set((state) => {
          state.activeFileId = id;
        }),

      closeAllFiles: () =>
        set((state) => {
          state.openFileIds = [];
          state.activeFileId = null;
        }),
    })),
    {
      name: 'codecraft-project', // localStorage key
      // Only persist navigation state, not transient UI state
      partialize: (state) => ({
        activeProjectId: state.activeProjectId,
        openFileIds: state.openFileIds,
        activeFileId: state.activeFileId,
      }),
    },
  ),
);
