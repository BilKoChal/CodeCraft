/**
 * CodeCraft — ZIP Import/Export Utilities
 *
 * Uses fflate for fast, bidirectional ZIP operations.
 *
 * Import: Read a .zip file → create a project with all files
 * Export: Read project files from IndexedDB → write a .zip file
 *
 * @see Project-Plan.md TASK-10 — ZIP import/export
 * @see https://github.com/101arrowz/fflate — fflate library
 */

import { unzip, strToU8, zipSync } from 'fflate';
import {
  createProject,
  createFile,
  getFilesByProject,
} from '../db';


// ─── Import ──────────────────────────────────────────────────

/**
 * Import a project from a ZIP file.
 *
 * The ZIP is expected to contain source files at any depth.
 * Directories in the ZIP are flattened for Phase 0 (no nested folders).
 * File paths in the ZIP become the file path in the project.
 *
 * The project name is derived from the ZIP filename (without extension),
 * or falls back to "Imported Project".
 *
 * @param zipFile - The File object from an <input type="file">
 * @returns The newly created Project
 * @throws Error if the ZIP is invalid or empty
 */
export async function importProjectFromZip(zipFile: File): Promise<{
  id: string;
  name: string;
}> {
  // Read the ZIP file as ArrayBuffer
  const buffer = await zipFile.arrayBuffer();
  const uint8 = new Uint8Array(buffer);

  // Parse the ZIP
  const entries = await new Promise<Record<string, Uint8Array>>(
    (resolve, reject) => {
      unzip(uint8, (err, data) => {
        if (err) reject(new Error(`Invalid ZIP file: ${err.message}`));
        else resolve(data);
      });
    },
  );

  // Derive project name from ZIP filename
  const zipName = zipFile.name.replace(/\.zip$/i, '').trim();
  const projectName = zipName || 'Imported Project';

  // Filter out directories (entries ending with /) and hidden files
  const filePaths = Object.keys(entries).filter(
    (path) =>
      !path.endsWith('/') &&
      !path.startsWith('__MACOSX') &&
      !path.split('/').pop()?.startsWith('.'),
  );

  if (filePaths.length === 0) {
    throw new Error('ZIP file contains no files');
  }

  // Create the project
  const project = await createProject(projectName);

  // Create files from ZIP entries
  for (const filePath of filePaths) {
    // Phase 0: Flatten — use just the filename (no directory structure)
    const fileName = filePath.split('/').pop() ?? filePath;
    const content = new TextDecoder().decode(entries[filePath]);
    const path = `/${fileName}`;

    try {
      await createFile(project.id, fileName, path, content);
    } catch (err: any) {
      // Skip duplicate filenames (e.g., same filename in different ZIP folders)
      if (err?.message?.includes('already exists')) {
        console.warn(`[ZIP Import] Skipping duplicate: ${fileName}`);
      } else {
        throw err;
      }
    }
  }

  return project;
}

// ─── Export ──────────────────────────────────────────────────

/**
 * Export a project as a ZIP file.
 *
 * Reads all files from IndexedDB, creates a flat ZIP structure
 * (Phase 0: no directories), and triggers a browser download.
 *
 * @param projectId - The project ID to export
 * @param projectName - The project name (used for the ZIP filename)
 * @returns The Blob of the ZIP file (for testing / programmatic use)
 */
export async function exportProjectToZip(
  projectId: string,
  projectName: string,
): Promise<Blob> {
  const files = await getFilesByProject(projectId);

  if (files.length === 0) {
    throw new Error('Project has no files to export');
  }

  // Build the ZIP structure
  const zipData: Record<string, Uint8Array> = {};

  for (const file of files) {
    // Phase 0: flat structure — just use the filename
    // Phase 1: use file.path to preserve directory structure
    const entryPath = file.name;
    zipData[entryPath] = strToU8(file.content);
  }

  // Create the ZIP
  const zipped = zipSync(zipData);

  // Create a Blob and trigger download
  const blob = new Blob([zipped], { type: 'application/zip' });
  const url = URL.createObjectURL(blob);

  // Trigger browser download
  const a = document.createElement('a');
  a.href = url;
  a.download = `${projectName.replace(/[^a-zA-Z0-9-_]/g, '_')}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  return blob;
}
