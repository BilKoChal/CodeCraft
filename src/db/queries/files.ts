/**
 * CodeCraft — File Database Queries
 *
 * CRUD operations for file entries in IndexedDB via Dexie.js.
 * Files belong to projects (FK: projectId) and store the actual
 * source code content that appears in the CodeMirror editor.
 *
 * Key design choices:
 * - Content is stored as a plain string (not compressed) for fast reads
 * - isDirty is persisted so we can warn about unsaved changes on reload
 *   (though auto-save in TASK-06 should keep this false most of the time)
 * - The [projectId+name] compound index prevents duplicate filenames
 *   within a project
 * - All mutations bump the file's updatedAt and the parent project's updatedAt
 *
 * @see Project-Plan.md P0-03 — Multi-file Tabs, P0-06 — Auto-save
 * @see TASK-07 — File tree component (consumer)
 * @see TASK-08 — File CRUD operations (consumer)
 */

import { db } from '../database';
import { generateId } from '../../utils/id';
import { detectLanguage } from '../../utils/languageDetection';
import { touchProject } from './projects';
import type { FileEntry, LanguageId } from '../../types';

// ─── Create ───────────────────────────────────────────────────

/**
 * Create a new file in a project.
 * Automatically detects the language from the filename.
 *
 * @param projectId - Parent project ID
 * @param name - Filename with extension (e.g., "index.js")
 * @param path - Full path (e.g., "/index.js") — must be unique per project
 * @param content - Initial file content (defaults to empty string)
 * @returns The newly created FileEntry
 * @throws if a file with the same name already exists in this project
 */
export async function createFile(
  projectId: string,
  name: string,
  path: string,
  content: string = '',
): Promise<FileEntry> {
  // Prevent duplicate filenames within the same project
  const existing = await db.files
    .where('[projectId+name]')
    .equals([projectId, name])
    .first();

  if (existing) {
    throw new Error(
      `File "${name}" already exists in this project. Please use a different name.`,
    );
  }

  const now = Date.now();
  const file: FileEntry = {
    id: generateId(),
    projectId,
    name,
    path,
    content,
    language: detectLanguage(name),
    isDirty: false,
    createdAt: now,
    updatedAt: now,
  };

  await db.transaction('rw', [db.files, db.projects], async () => {
    await db.files.add(file);
    // Touch the parent project so it appears as recently modified
    await touchProject(projectId);
  });

  return file;
}

// ─── Read ─────────────────────────────────────────────────────

/**
 * Get a single file by ID.
 * Returns undefined if the file doesn't exist.
 */
export async function getFile(id: string): Promise<FileEntry | undefined> {
  return db.files.get(id);
}

/**
 * Get all files belonging to a project, ordered by name.
 * Used by the file tree (TASK-07) and ZIP export (TASK-10).
 */
export async function getFilesByProject(projectId: string): Promise<FileEntry[]> {
  return db.files
    .where('projectId')
    .equals(projectId)
    .sortBy('name');
}

/**
 * Get a file by its project ID and filename.
 * Useful for checking if a file already exists before creating it.
 */
export async function getFileByName(
  projectId: string,
  name: string,
): Promise<FileEntry | undefined> {
  return db.files
    .where('[projectId+name]')
    .equals([projectId, name])
    .first();
}

/**
 * Get a file by its path within a project.
 * Used for path-based lookups (e.g., resolving imports in live preview).
 */
export async function getFileByPath(
  projectId: string,
  path: string,
): Promise<FileEntry | undefined> {
  return db.files
    .where('path')
    .equals(path)
    .and((f) => f.projectId === projectId)
    .first();
}

// ─── Update ───────────────────────────────────────────────────

/**
 * Update a file's content and mark it as NOT dirty.
 * This is the primary save operation, called by auto-save (TASK-06).
 *
 * Also updates the parent project's updatedAt so the project
 * appears as "recently modified" in the project list.
 *
 * @param id - File ID
 * @param content - New file content
 */
export async function saveFileContent(
  id: string,
  content: string,
): Promise<void> {
  const now = Date.now();

  const file = await db.files.get(id);
  if (!file) return;

  await db.transaction('rw', [db.files, db.projects], async () => {
    await db.files.update(id, {
      content,
      isDirty: false,
      updatedAt: now,
    });
    // Touch parent project so it appears as recently modified
    await touchProject(file.projectId);
  });
}

/**
 * Rename a file.
 * Updates the name, path, and language detection in a single operation.
 * The caller must compute the new path (e.g., if the file is in a folder).
 *
 * @param id - File ID
 * @param newName - New filename with extension
 * @param newPath - New full path
 */
export async function renameFile(
  id: string,
  newName: string,
  newPath: string,
): Promise<void> {
  await db.files.update(id, {
    name: newName,
    path: newPath,
    language: detectLanguage(newName),
    isDirty: false,
    updatedAt: Date.now(),
  });
}

/**
 * Update a file's dirty flag.
 * Called by the editor store when content changes in memory
 * but hasn't been persisted to IndexedDB yet.
 */
export async function setFileDirty(id: string, isDirty: boolean): Promise<void> {
  await db.files.update(id, { isDirty, updatedAt: Date.now() });
}

/**
 * Update a file's language override.
 * Normally auto-detected from the extension, but users may
 * want to override it (Phase 1+ feature).
 */
export async function setFileLanguage(
  id: string,
  language: LanguageId,
): Promise<void> {
  await db.files.update(id, { language, updatedAt: Date.now() });
}

// ─── Delete ───────────────────────────────────────────────────

/**
 * Delete a single file by ID.
 * Also touches the parent project to update its updatedAt.
 *
 * @param id - File ID to delete
 */
export async function deleteFile(id: string): Promise<void> {
  const file = await db.files.get(id);
  if (!file) return;

  await db.transaction('rw', [db.files, db.projects], async () => {
    await db.files.delete(id);
    await touchProject(file.projectId);
  });
}

/**
 * Delete all files belonging to a project.
 * Used by deleteProject() cascade and ZIP import (overwrite).
 *
 * @param projectId - Project ID whose files to delete
 */
export async function deleteFilesByProject(projectId: string): Promise<void> {
  await db.files.where('projectId').equals(projectId).delete();
}

// ─── Bulk Operations ─────────────────────────────────────────

/**
 * Save content for multiple files in a single transaction.
 * Used by auto-save when multiple dirty files need flushing.
 *
 * @param updates - Array of { id, content } pairs
 */
export async function saveMultipleFiles(
  updates: Array<{ id: string; content: string }>,
): Promise<void> {
  const now = Date.now();

  await db.transaction('rw', [db.files, db.projects], async () => {
    for (const { id, content } of updates) {
      const file = await db.files.get(id);
      if (!file) continue;

      await db.files.update(id, {
        content,
        isDirty: false,
        updatedAt: now,
      });
      await touchProject(file.projectId);
    }
  });
}

/**
 * Count the number of files in a project.
 * Useful for displaying stats in the project list.
 */
export async function countFilesInProject(projectId: string): Promise<number> {
  return db.files.where('projectId').equals(projectId).count();
}
