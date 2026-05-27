/**
 * CodeCraft — Database Module Index
 *
 * Re-exports the Dexie database instance and all query modules.
 * Import from here in application code:
 *
 *   import { db, createProject, saveFileContent } from '../db';
 */

// Database singleton
export { db, initializeSettings, getSettings, DEFAULT_APP_SETTINGS } from './database';

// Project queries
export {
  createProject,
  getProject,
  listProjects,
  renameProject,
  updateProjectSettings,
  touchProject,
  deleteProject,
} from './queries/projects';

// File queries
export {
  createFile,
  getFile,
  getFilesByProject,
  getFileByName,
  getFileByPath,
  saveFileContent,
  renameFile,
  setFileDirty,
  setFileLanguage,
  deleteFile,
  deleteFilesByProject,
  saveMultipleFiles,
  countFilesInProject,
} from './queries/files';

// Settings queries
export {
  getAppSettings,
  updateAppSettings,
  addRecentProject,
  removeRecentProject,
  setAutoSaveConfig,
} from './queries/settings';
