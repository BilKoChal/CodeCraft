/**
 * CodeCraft — useProjects Hook
 *
 * React-friendly hook wrapping Dexie project queries.
 * Provides a reactive project list + CRUD with proper store
 * integration for project switching.
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
  deleteFilesByProject,
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
      } catch (err: any) {
        setError(err?.message ?? 'Failed to create project');
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
      } catch (err: any) {
        setError(err?.message ?? 'Failed to rename project');
        return false;
      }
    },
    [],
  );

  // ─── Delete project ────────────────────────────────────────
  const deleteProject = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        // Delete all files first, then the project
        await deleteFilesByProject(id);
        await dbDeleteProject(id);
        await removeRecentProject(id);

        // If we deleted the active project, close it
        const currentActiveId = useProjectStore.getState().activeProjectId;
        if (currentActiveId === id) {
          closeAllFiles();
          clearAll();
          setActiveProject('');
          // Reset to no project
          useProjectStore.setState({ activeProjectId: null });
        }

        return true;
      } catch (err: any) {
        setError(err?.message ?? 'Failed to delete project');
        return false;
      }
    },
    [closeAllFiles, clearAll, setActiveProject],
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
  const closeProject = useCallback(() => {
    closeAllFiles();
    clearAll();
    useProjectStore.setState({ activeProjectId: null });
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
