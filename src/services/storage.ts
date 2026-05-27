/**
 * CodeCraft — Storage Service (Dexie.js / IndexedDB)
 *
 * Database schema and CRUD operations for projects, files, and settings.
 * To be fully implemented in PH2-01.
 *
 * Schema:
 * - projects: id, name, updatedAt
 * - files: id, projectId, parentId, name, type, sortOrder
 * - fileContents: fileId (1:1 with files)
 * - binaryFiles: fileId (1:1 with files)
 * - settings: key (key-value store)
 * - customThemes: id, name
 * - autoSaves: fileId, timestamp
 */

// PH2-01: Dexie.js database class will be defined here
// For now, export an empty placeholder

export const STORAGE_KEYS = {
  theme: 'cc-theme',
  fontSize: 'cc-font-size',
  recentProjects: 'cc-recent-projects',
  lastProject: 'cc-last-project',
} as const;

/** Get a setting from LocalStorage with type safety */
export function getSetting<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : defaultValue;
  } catch {
    return defaultValue;
  }
}

/** Set a setting in LocalStorage */
export function setSetting(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('LocalStorage write failed:', e);
  }
}
