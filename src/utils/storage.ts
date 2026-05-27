/**
 * CodeCraft — Local Storage Helper
 *
 * Simple wrapper around localStorage with JSON serialization
 * and error handling. Used for small, synchronous preferences
 * that need instant access before React hydrates.
 *
 * For larger data (projects, files), use Dexie.js (IndexedDB).
 */

const STORAGE_PREFIX = 'codecraft-';

/** Storage keys used throughout the application */
export const STORAGE_KEYS = {
  THEME: `${STORAGE_PREFIX}theme`,
  SIDEBAR_WIDTH: `${STORAGE_PREFIX}sidebar-width`,
  LAST_PROJECT: `${STORAGE_PREFIX}last-project`,
  EDITOR_LAYOUT: `${STORAGE_PREFIX}editor-layout`,
} as const;

/**
 * Get a value from localStorage, parsing JSON automatically.
 * Returns the fallback value if the key doesn't exist or parsing fails.
 */
export function getStorageItem<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/**
 * Set a value in localStorage, serializing to JSON automatically.
 * Silently fails if localStorage is full or unavailable.
 */
export function setStorageItem(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // localStorage full or unavailable — silently fail
  }
}

/**
 * Remove a value from localStorage.
 */
export function removeStorageItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // Silently fail
  }
}
