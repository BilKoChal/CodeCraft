/**
 * CodeCraft — Project & File Type Definitions
 *
 * Defines the data model for projects, files, and folders.
 * Used by the project store and storage service.
 */

/** Represents a CodeCraft project */
export interface Project {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  settings: ProjectSettings;
  rootFolderId: string;
}

/** Project-level editor and runtime settings */
export interface ProjectSettings {
  defaultLanguage: string;
  indentSize: number;
  indentType: 'spaces' | 'tabs';
  encoding: string;
  lineEnding: 'lf' | 'crlf';
  formatOnSave: boolean;
  runCommand: string;
}

/** A file or folder node in the project tree */
export interface FileNode {
  id: string;
  projectId: string;
  parentId: string | null;
  name: string;
  type: 'file' | 'folder';
  sortOrder: number;
  language?: string;
  createdAt: number;
  updatedAt: number;
}

/** File content stored separately for performance (lazy loading) */
export interface FileContent {
  fileId: string;
  content: string;
  version: number;
}

/** Binary file data stored as ArrayBuffer (images, fonts, etc.) */
export interface BinaryFileData {
  fileId: string;
  mimeType: string;
  data: ArrayBuffer;
  size: number;
}

/** Auto-save snapshot entry */
export interface AutoSaveEntry {
  fileId: string;
  content: string;
  timestamp: number;
}
