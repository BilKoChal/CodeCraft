/**
 * CodeCraft — Dexie Database
 *
 * Defines the IndexedDB schema using Dexie.js. This is the single source of
 * truth for all persistent data: projects, files, and app settings.
 *
 * Design decisions:
 * - Version 1 schema matches the TypeScript types in src/types/index.ts
 * - Compound indexes on [projectId + name] for fast "does file exist?" lookups
 * - AppSettings stored as a single-row table (id always "app-settings")
 * - Dexie's versioned migrations allow seamless schema evolution in Phase 1+
 *
 * @see Project-Plan.md Section 7.1 — Data Flow
 * @see src/types/index.ts — Shared TypeScript types
 */

import Dexie, { type Table } from 'dexie';
import type { Project, FileEntry, AppSettings } from '../types';

// ─── Database Interface ───────────────────────────────────────

/**
 * Typed Dexie database interface.
 * Each property corresponds to an IndexedDB object store (table).
 */
export interface CodeCraftDB extends Dexie {
  /** All projects */
  projects: Table<Project, string>;

  /** All files across all projects */
  files: Table<FileEntry, string>;

  /** Singleton app settings (single row with id "app-settings") */
  settings: Table<AppSettings, string>;
}

// ─── Database Class ───────────────────────────────────────────

/**
 * CodeCraft's IndexedDB database.
 *
 * Usage:
 *   import { db } from '../db';
 *   const project = await db.projects.get(id);
 *
 * For reactive queries in React components:
 *   import { useLiveQuery } from 'dexie-react-hooks';
 *   const files = useLiveQuery(() => db.files.where('projectId').equals(pid).toArray());
 */
class CodeCraftDatabase extends Dexie implements CodeCraftDB {
  projects!: Table<Project, string>;
  files!: Table<FileEntry, string>;
  settings!: Table<AppSettings, string>;

  constructor() {
    super('codecraft-db');

    // ── Version 1: Phase 0 Schema ──────────────────────────────
    //
    // Indexes are defined as comma-separated strings:
    //   - Primary key is always the first field (id for all tables)
    //   - Additional indexes follow after &
    //
    // projects table:
    //   - updatedAt: for "recently modified" sorting
    //   - name: for alphabetical listing
    //
    // files table:
    //   - [projectId+name]: compound index for "does this file exist
    //     in this project?" — prevents duplicate filenames
    //   - projectId: for listing all files in a project
    //   - path: for path-based lookups
    //
    // settings table:
    //   - Only one row (id = "app-settings"), no extra indexes needed

    this.version(1).stores({
      projects: 'id, updatedAt, name',
      files: 'id, [projectId+name], projectId, path',
      settings: 'id',
    });
  }
}

// ─── Singleton Instance ───────────────────────────────────────

/**
 * The single Dexie database instance used throughout the app.
 * Import this wherever you need IndexedDB access.
 */
export const db = new CodeCraftDatabase();

// ─── Default App Settings ─────────────────────────────────────

/**
 * Default application settings, used when no saved settings exist.
 * These match the AppSettings interface in src/types/index.ts.
 */
export const DEFAULT_APP_SETTINGS: AppSettings = {
  id: 'app-settings',
  theme: 'dark',
  fontSize: 14,
  tabSize: 2,
  wordWrap: true,
  autoSave: true,
  autoSaveDelay: 1000, // 1 second debounce
  recentProjects: [],
};

/**
 * Initialize app settings if they don't exist yet.
 * Safe to call multiple times — only writes on first run.
 */
export async function initializeSettings(): Promise<AppSettings> {
  const existing = await db.settings.get('app-settings');
  if (existing) return existing;

  await db.settings.add(DEFAULT_APP_SETTINGS);
  return DEFAULT_APP_SETTINGS;
}

/**
 * Get the current app settings, falling back to defaults.
 * This is the recommended way to read settings outside of React
 * (in React components, prefer useLiveQuery).
 */
export async function getSettings(): Promise<AppSettings> {
  return (await db.settings.get('app-settings')) ?? DEFAULT_APP_SETTINGS;
}
