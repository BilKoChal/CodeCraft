/**
 * CodeCraft — useFileTree Hook
 *
 * React-friendly hook that wraps Dexie file queries for the current
 * project. Provides reactive file list + CRUD operations with
 * optimistic UI updates and proper store integration.
 *
 * Features:
 * - Reactive file list via Dexie's useLiveQuery
 * - createFile: creates + opens the new file in editor
 * - renameFile: renames + updates editor store references
 * - deleteFile: deletes + closes tab + unloads content
 * - Duplicate name detection with user-friendly error messages
 *
 * @see Project-Plan.md TASK-07 — File tree sidebar
 * @see Project-Plan.md TASK-08 — File CRUD operations
 * @see src/db/queries/files.ts — Dexie query layer
 */

import { useCallback, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useProjectStore } from '../../stores/projectStore';
import { useEditorStore } from '../../stores/editorStore';
import {
  getFilesByProject,
  createFile as dbCreateFile,
  renameFile as dbRenameFile,
  deleteFile as dbDeleteFile,
  getFileByName,
} from '../../db';
import type { FileEntry } from '../../types';

// ─── Return Type ─────────────────────────────────────────────

export interface UseFileTreeReturn {
  /** Files for the current project, sorted by name */
  files: FileEntry[];

  /** Whether files are being loaded */
  loading: boolean;

  /** Error message if an operation failed */
  error: string | null;

  /** Clear the current error */
  clearError: () => void;

  /** Create a new file in the current project */
  createFile: (name: string) => Promise<FileEntry | null>;

  /** Rename a file by ID */
  renameFile: (fileId: string, newName: string) => Promise<boolean>;

  /** Delete a file by ID */
  deleteFile: (fileId: string) => Promise<boolean>;

  /** Check if a filename already exists in the project */
  fileNameExists: (name: string) => Promise<boolean>;
}

// ─── Hook ────────────────────────────────────────────────────

/**
 * useFileTree — Provides reactive file list + CRUD for the sidebar.
 *
 * Must be called within a component that has access to the project store.
 * If no project is active, returns an empty file list.
 */
export function useFileTree(): UseFileTreeReturn {
  const activeProjectId = useProjectStore((s) => s.activeProjectId);
  const openFile = useProjectStore((s) => s.openFile);
  const closeFile = useProjectStore((s) => s.closeFile);
  const loadContent = useEditorStore((s) => s.loadContent);
  const unloadContent = useEditorStore((s) => s.unloadContent);

  const [error, setError] = useState<string | null>(null);

  // ─── Reactive file list (auto-updates when DB changes) ──────
  const files = useLiveQuery(
    () => {
      if (!activeProjectId) return [];
      return getFilesByProject(activeProjectId);
    },
    [activeProjectId],
    [], // default while loading
  );

  const loading = files === undefined && activeProjectId !== null;

  // ─── Error handling ─────────────────────────────────────────
  const clearError = useCallback(() => setError(null), []);

  // ─── Create file ────────────────────────────────────────────
  const createFile = useCallback(
    async (name: string): Promise<FileEntry | null> => {
      if (!activeProjectId) {
        setError('No active project');
        return null;
      }

      const trimmed = name.trim();
      if (!trimmed) {
        setError('Filename cannot be empty');
        return null;
      }

      // Validate filename: no slashes (Phase 0 = flat), no weird chars
      if (trimmed.includes('/')) {
        setError('Filenames cannot contain "/" (nested folders not supported yet)');
        return null;
      }

      try {
        // Compute path (Phase 0: flat = "/" + name)
        const path = `/${trimmed}`;
        const file = await dbCreateFile(activeProjectId, trimmed, path);

        // Load content into editor store and open the file
        loadContent(file.id, file.content);
        openFile(file.id);

        return file;
      } catch (err: any) {
        // Dexie duplicate key error or our custom error
        const msg = err?.message ?? 'Failed to create file';
        setError(msg.includes('already exists') ? `A file named "${trimmed}" already exists` : msg);
        return null;
      }
    },
    [activeProjectId, loadContent, openFile],
  );

  // ─── Rename file ────────────────────────────────────────────
  const renameFile = useCallback(
    async (fileId: string, newName: string): Promise<boolean> => {
      const trimmed = newName.trim();
      if (!trimmed) {
        setError('Filename cannot be empty');
        return false;
      }

      if (trimmed.includes('/')) {
        setError('Filenames cannot contain "/"');
        return false;
      }

      try {
        // Check for duplicate names (excluding the file being renamed)
        const existing = await getFileByName(activeProjectId!, trimmed);
        if (existing && existing.id !== fileId) {
          setError(`A file named "${trimmed}" already exists`);
          return false;
        }

        // Phase 0: flat path = "/" + name
        const newPath = `/${trimmed}`;
        await dbRenameFile(fileId, trimmed, newPath);
        return true;
      } catch (err: any) {
        setError(err?.message ?? 'Failed to rename file');
        return false;
      }
    },
    [activeProjectId],
  );

  // ─── Delete file ────────────────────────────────────────────
  const deleteFile = useCallback(
    async (fileId: string): Promise<boolean> => {
      try {
        // Close the tab if open
        closeFile(fileId);
        // Unload content from editor store
        unloadContent(fileId);
        // Delete from database
        await dbDeleteFile(fileId);
        return true;
      } catch (err: any) {
        setError(err?.message ?? 'Failed to delete file');
        return false;
      }
    },
    [closeFile, unloadContent],
  );

  // ─── Check duplicate name ───────────────────────────────────
  const fileNameExists = useCallback(
    async (name: string): Promise<boolean> => {
      if (!activeProjectId) return false;
      const existing = await getFileByName(activeProjectId, name);
      return existing !== undefined;
    },
    [activeProjectId],
  );

  return {
    files: files ?? [],
    loading,
    error,
    clearError,
    createFile,
    renameFile,
    deleteFile,
    fileNameExists,
  };
}
