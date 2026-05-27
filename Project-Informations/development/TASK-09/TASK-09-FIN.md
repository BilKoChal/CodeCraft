# TASK-09 — Project List Page + CRUD

**Status:** ✅ Complete
**Milestone:** M4 — Project Management
**Date Completed:** 2026-05-28

---

## Summary

Implemented the project list landing page and full project CRUD operations. When no project is active, users see a polished landing page with project cards, create/rename/delete actions, and ZIP import. Clicking a project card opens the IDE workspace.

## Files Created

| File | Description |
|------|-------------|
| `src/components/ProjectList/ProjectList.tsx` | Full project list page (~280 lines) |
| `src/components/ProjectList/index.ts` | Barrel exports |
| `src/hooks/useProjects.ts` | React hook: reactive project list + CRUD (~170 lines) |

## Files Modified

| File | Changes |
|------|---------|
| `src/App.tsx` | Added routing: ProjectList when no project active, IDEWorkspace otherwise. Added Export ZIP button in titlebar. |
| `src/styles/globals.css` | Added ~200 lines of project list page CSS + titlebar action button styles |

## Features Implemented

- **Project list landing page** with Catppuccin Mocha branding
- **Project cards** with file count, relative timestamps, and hover actions
- **Create project** — inline name input with Enter/Escape support
- **Rename project** — double-click or F2 triggers inline rename
- **Delete project** — with confirmation dialog, cascading file deletion
- **Open project** — click card to enter IDE workspace
- **Close project** — click brand logo to return to project list
- **Import from ZIP** — button triggers file picker, calls importProjectFromZip
- **Empty state** — "No projects yet" with create button
- **Error banner** — dismissible error messages
- **Keyboard nav** — Enter=open, F2=rename, Delete=delete

## Design Decisions

1. **No React Router** — Phase 0 uses Zustand store state for routing. When `activeProjectId` is null, we show ProjectList. When set, we show IDEWorkspace. This avoids adding a router dependency.
2. **useProjects hook** — Similar pattern to useFileTree (TASK-08): reactive list via `useLiveQuery`, CRUD operations with store coordination.
3. **Project switch clears editor** — When switching projects, we clear all open tabs and editor content to prevent stale data.
