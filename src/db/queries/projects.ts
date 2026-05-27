/**
 * CodeCraft — Project Database Queries
 *
 * CRUD operations for projects in IndexedDB via Dexie.js.
 * These are plain async functions — use them in React components
 * with useLiveQuery for reactive updates, or call directly for
 * one-shot mutations.
 *
 * All functions are deliberately simple wrappers around Dexie's API.
 * This layer exists so that:
 * 1. Business logic (e.g., cascading deletes, timestamps) is centralized
 * 2. Components don't import Dexie directly
 * 3. Future migrations can update the query layer without touching components
 *
 * @see Project-Plan.md P0-08 — Project CRUD
 * @see TASK-09 — Project list page (consumer of these queries)
 */

import { db } from '../database';
import { generateId } from '../../utils/id';
import type { Project, ProjectSettings } from '../../types';

// ─── Default Project Settings ─────────────────────────────────

/** Default settings applied to every new project */
const DEFAULT_PROJECT_SETTINGS: ProjectSettings = {
  fontSize: 14,
  tabSize: 2,
  wordWrap: true,
};

// ─── Create ───────────────────────────────────────────────────

/**
 * Create a new project with the given name.
 * Generates a UUID, sets timestamps, and applies default settings.
 *
 * @param name - Human-readable project name (e.g., "My App")
 * @returns The newly created Project object
 */
export async function createProject(name: string): Promise<Project> {
  const now = Date.now();
  const project: Project = {
    id: generateId(),
    name,
    createdAt: now,
    updatedAt: now,
    settings: { ...DEFAULT_PROJECT_SETTINGS },
  };

  await db.projects.add(project);
  return project;
}

// ─── Read ─────────────────────────────────────────────────────

/**
 * Get a single project by ID.
 * Returns undefined if the project doesn't exist.
 */
export async function getProject(id: string): Promise<Project | undefined> {
  return db.projects.get(id);
}

/**
 * List all projects, sorted by most recently updated.
 * This is the primary query for the project list landing page.
 */
export async function listProjects(): Promise<Project[]> {
  return db.projects.orderBy('updatedAt').reverse().toArray();
}

// ─── Update ───────────────────────────────────────────────────

/**
 * Update a project's name.
 * Automatically bumps the updatedAt timestamp.
 */
export async function renameProject(id: string, name: string): Promise<void> {
  await db.projects.update(id, {
    name,
    updatedAt: Date.now(),
  });
}

/**
 * Update a project's settings (font size, tab size, word wrap).
 * Merges the partial settings with existing ones.
 *
 * @param id - Project ID
 * @param settings - Partial settings to merge
 */
export async function updateProjectSettings(
  id: string,
  settings: Partial<ProjectSettings>,
): Promise<void> {
  const project = await db.projects.get(id);
  if (!project) return;

  await db.projects.update(id, {
    settings: { ...project.settings, ...settings },
    updatedAt: Date.now(),
  });
}

/**
 * Touch a project's updatedAt timestamp.
 * Called when a file within the project is saved, so the project
 * floats to the top of the "recent projects" list.
 */
export async function touchProject(id: string): Promise<void> {
  await db.projects.update(id, { updatedAt: Date.now() });
}

// ─── Delete ───────────────────────────────────────────────────

/**
 * Delete a project AND all its associated files.
 * This is a cascading delete — all FileEntry rows with matching
 * projectId are removed in a single transaction.
 *
 * @param id - Project ID to delete
 */
export async function deleteProject(id: string): Promise<void> {
  await db.transaction('rw', [db.projects, db.files], async () => {
    // Delete all files belonging to this project first
    await db.files.where('projectId').equals(id).delete();
    // Then delete the project itself
    await db.projects.delete(id);
  });
}
