/**
 * CodeCraft — App Settings Database Queries
 *
 * Read and update the singleton AppSettings row in IndexedDB.
 * AppSettings controls global preferences like theme, font size,
 * tab size, word wrap, auto-save configuration, and recent projects.
 *
 * The settings table always contains exactly one row with id "app-settings".
 * If the row doesn't exist, initializeSettings() (in database.ts) creates it
 * with DEFAULT_APP_SETTINGS.
 *
 * @see Project-Plan.md P1-05 — Settings modal (future consumer)
 * @see src/db/database.ts — DEFAULT_APP_SETTINGS, initializeSettings()
 */

import { db } from '../database';
import type { AppSettings } from '../../types';

// ─── Read ─────────────────────────────────────────────────────

/**
 * Get the current app settings.
 * Returns the full AppSettings object, never undefined
 * (falls back to defaults if somehow missing).
 */
export async function getAppSettings(): Promise<AppSettings> {
  const settings = await db.settings.get('app-settings');
  return settings ?? {
    id: 'app-settings',
    theme: 'dark',
    fontSize: 14,
    tabSize: 2,
    wordWrap: true,
    autoSave: true,
    autoSaveDelay: 1000,
    recentProjects: [],
  };
}

// ─── Update ───────────────────────────────────────────────────

/**
 * Update app settings by merging a partial object.
 * Only the provided fields are updated; others remain unchanged.
 *
 * @param partial - Partial settings to merge into the existing row
 */
export async function updateAppSettings(
  partial: Partial<Omit<AppSettings, 'id'>>,
): Promise<void> {
  await db.settings.update('app-settings', partial);
}

/**
 * Add a project ID to the "recent projects" list.
 * Moves it to the front if it already exists.
 * Keeps at most 20 recent project IDs to prevent unbounded growth.
 *
 * @param projectId - Project ID to mark as recently accessed
 */
export async function addRecentProject(projectId: string): Promise<void> {
  const settings = await getAppSettings();
  const recent = settings.recentProjects.filter((id) => id !== projectId);

  // Add to front, cap at 20 entries
  recent.unshift(projectId);
  if (recent.length > 20) recent.length = 20;

  await db.settings.update('app-settings', { recentProjects: recent });
}

/**
 * Remove a project ID from the "recent projects" list.
 * Called when a project is deleted.
 *
 * @param projectId - Project ID to remove
 */
export async function removeRecentProject(projectId: string): Promise<void> {
  const settings = await getAppSettings();
  const recent = settings.recentProjects.filter((id) => id !== projectId);

  await db.settings.update('app-settings', { recentProjects: recent });
}

/**
 * Update the auto-save configuration.
 * Convenience method for the most frequently changed setting pair.
 *
 * @param enabled - Whether auto-save is active
 * @param delayMs - Debounce delay in milliseconds (default: 1000)
 */
export async function setAutoSaveConfig(
  enabled: boolean,
  delayMs: number = 1000,
): Promise<void> {
  await db.settings.update('app-settings', {
    autoSave: enabled,
    autoSaveDelay: delayMs,
  });
}
