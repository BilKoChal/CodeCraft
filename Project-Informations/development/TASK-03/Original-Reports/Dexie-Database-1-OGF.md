# TASK-03 — Dexie Database Schema + Queries (Original Report)

**Task ID:** TASK-03
**Agent:** Main Agent (no sub-agent — routine task)
**Date:** 2026-05-28

---

## Task Description

Implement the Dexie.js database layer for CodeCraft: schema definition, singleton instance, versioned migrations, and CRUD query functions for projects, files, and app settings.

## Implementation Details

### Files Created (5 files)

| File | Purpose |
|------|---------|
| `src/db/database.ts` | Dexie DB class with Version 1 schema, singleton instance, default settings, initializeSettings() |
| `src/db/queries/projects.ts` | Project CRUD: create, get, list (sorted by updatedAt), rename, updateSettings, touch, delete (cascading) |
| `src/db/queries/files.ts` | File CRUD: create (with duplicate check), get, getByProject, getByName, getByPath, saveContent, rename, setDirty, setLanguage, delete, deleteByProject, saveMultiple (batch), countByProject |
| `src/db/queries/settings.ts` | AppSettings CRUD: get, update (partial merge), addRecentProject (cap 20), removeRecentProject, setAutoSaveConfig |
| `src/db/index.ts` | Barrel exports for all DB modules |

### Schema Design

**Version 1 (Phase 0):**

| Table | Primary Key | Indexes |
|-------|-------------|---------|
| `projects` | `id` | `updatedAt`, `name` |
| `files` | `id` | `[projectId+name]` (compound), `projectId`, `path` |
| `settings` | `id` | (none — singleton row) |

### Key Design Decisions

1. **Compound index `[projectId+name]`** — Prevents duplicate filenames within a project and enables fast existence checks
2. **Cascading deletes** — `deleteProject()` uses a transaction to delete all files first, then the project
3. **touchProject()** — Bumps parent project's `updatedAt` whenever a file is saved, so projects sort by "last modified"
4. **Batch saveMultipleFiles()** — Single-transaction bulk save for auto-save with multiple dirty files
5. **initializeSettings()** — Idempotent initialization of the singleton settings row on first run
6. **Default settings** — Dark theme, 14px font, 2-space tabs, word wrap on, auto-save 1s delay

### Cross-References

- `database.ts` → Plan Section 2 (Tech Stack: Dexie.js), Section 7.1 (Data Flow)
- `projects.ts` → Plan P0-08 (Project CRUD), TASK-09 (Project list page)
- `files.ts` → Plan P0-06 (Auto-save), TASK-06 (Auto-save hook), TASK-07 (File tree), TASK-08 (File CRUD), TASK-10 (ZIP import/export)
- `settings.ts` → Plan P1-05 (Settings modal), TASK-16 (PWA)
