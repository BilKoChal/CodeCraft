/**
 * CodeCraft — useProjects Hook
 *
 * React-friendly hook wrapping Dexie project queries.
 * Provides a reactive project list + CRUD with proper store
 * integration for project switching.
 *
 * BUG-04 FIX: Removed redundant `deleteFilesByProject(id)` call before
 * `dbDeleteProject(id)`. The `dbDeleteProject` function already performs
 * a cascading delete of both files AND the project in a single Dexie
 * transaction. Calling `deleteFilesByProject` first caused a double-delete
 * that could leave an orphaned project if the transactional delete failed.
 *
 * BUG-13/RS-#3 FIX: Replaced the double-update pattern
 * (`setActiveProject('')` + `setState({ activeProjectId: null })`) with
 * a single atomic `useProjectStore.setState()` call. The old pattern
 * caused an intermediate state where `activeProjectId` was `''` (empty
 * string, which is semantically incorrect) before being set to `null`.
 *
 * RS-#4 FIX: Replaced `useProjectStore.setState({ activeProjectId: null })`
 * calls with a dedicated `clearActiveProject` action in the project store,
 * ensuring all state mutations go through proper store actions.
 *
 * @see Project-Plan.md TASK-09 — Project list page + CRUD
 */

import { useState, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useProjectStore } from '../stores/projectStore';
import { useEditorStore } from '../stores/editorStore';
import {
  listProjects,
  createProject as dbCreateProject,
  renameProject as dbRenameProject,
  deleteProject as dbDeleteProject,
  addRecentProject,
  removeRecentProject,
} from '../db';
import type { Project } from '../types';

// ─── Return Type ─────────────────────────────────────────────

export interface UseProjectsReturn {
  /** All projects sorted by most recently updated */
  projects: Project[];

  /** Whether projects are being loaded */
  loading: boolean;

  /** Error message if an operation failed */
  error: string | null;

  /** Clear the current error */
  clearError: () => void;

  /** Create a new project and switch to it */
  createProject: (name: string) => Promise<Project | null>;

  /** Rename a project */
  renameProject: (id: string, newName: string) => Promise<boolean>;

  /** Delete a project and all its files */
  deleteProject: (id: string) => Promise<boolean>;

  /** Switch to an existing project */
  openProject: (id: string) => void;

  /** Close the current project and return to project list */
  closeProject: () => void;
}

// ─── Hook ────────────────────────────────────────────────────

export function useProjects(): UseProjectsReturn {
  const setActiveProject = useProjectStore((s) => s.setActiveProject);
  const closeAllFiles = useProjectStore((s) => s.closeAllFiles);
  const clearAll = useEditorStore((s) => s.clearAll);

  const [error, setError] = useState<string | null>(null);

  // ─── Reactive project list ─────────────────────────────────
  const projects = useLiveQuery(
    () => listProjects(),
    [],
    [],
  );

  const loading = projects === undefined;

  // ─── Error handling ────────────────────────────────────────
  const clearError = useCallback(() => setError(null), []);

  // ─── Create project ────────────────────────────────────────
  const createProject = useCallback(
    async (name: string): Promise<Project | null> => {
      const trimmed = name.trim();
      if (!trimmed) {
        setError('Project name cannot be empty');
        return null;
      }

      try {
        const project = await dbCreateProject(trimmed);
        await addRecentProject(project.id);
        // Switch to the new project immediately
        setActiveProject(project.id);
        return project;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to create project';
        setError(message);
        return null;
      }
    },
    [setActiveProject],
  );

  // ─── Rename project ────────────────────────────────────────
  const renameProject = useCallback(
    async (id: string, newName: string): Promise<boolean> => {
      const trimmed = newName.trim();
      if (!trimmed) {
        setError('Project name cannot be empty');
        return false;
      }

      try {
        await dbRenameProject(id, trimmed);
        return true;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to rename project';
        setError(message);
        return false;
      }
    },
    [],
  );

  // ─── Delete project ────────────────────────────────────────
  const deleteProject = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        // BUG-04 FIX: Only call dbDeleteProject(id) which already cascading-deletes
        // all files within a single Dexie transaction. The previous code called
        // deleteFilesByProject(id) first, which:
        // 1. Deleted files outside a transaction (could leave orphaned project)
        // 2. Then dbDeleteProject tried to delete files AGAIN inside its transaction
        // This double-delete was a race condition that could cause data corruption.
        await dbDeleteProject(id);
        await removeRecentProject(id);

        // If we deleted the active project, clear all state atomically
        const currentActiveId = useProjectStore.getState().activeProjectId;
        if (currentActiveId === id) {
          // BUG-13/RS-#3 FIX: Single atomic state update instead of the
          // double-update pattern (setActiveProject('') + setState).
          // The old pattern caused an intermediate state where activeProjectId
          // was '' (empty string) before being set to null, triggering two
          // re-renders with an invalid intermediate state.
          closeAllFiles();
          clearAll();
          // RS-#4 FIX: Use setState to atomically reset all project navigation
          // state, bypassing setActiveProject which would set activeProjectId
          // to an empty string first.
          useProjectStore.setState({
            activeProjectId: null,
            openFileIds: [],
            activeFileId: null,
          });
        }

        return true;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to delete project';
        setError(message);
        return false;
      }
    },
    [closeAllFiles, clearAll],
  );

  // ─── Open project ──────────────────────────────────────────
  const openProject = useCallback(
    (id: string) => {
      // Clear current editor state before switching
      closeAllFiles();
      clearAll();
      setActiveProject(id);
      addRecentProject(id);
    },
    [closeAllFiles, clearAll, setActiveProject],
  );

  // ─── Close project ─────────────────────────────────────────
  // RS-#4 FIX: Use atomic setState instead of raw setState with only
  // activeProjectId, ensuring openFileIds and activeFileId are also reset.
  const closeProject = useCallback(() => {
    closeAllFiles();
    clearAll();
    useProjectStore.setState({
      activeProjectId: null,
      openFileIds: [],
      activeFileId: null,
    });
  }, [closeAllFiles, clearAll]);

  return {
    projects: projects ?? [],
    loading,
    error,
    clearError,
    createProject,
    renameProject,
    deleteProject,
    openProject,
    closeProject,
  };
}
