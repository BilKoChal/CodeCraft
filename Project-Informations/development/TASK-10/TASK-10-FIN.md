# TASK-10 — ZIP Import/Export (fflate)

**Status:** ✅ Complete
**Milestone:** M4 — Project Management
**Date Completed:** 2026-05-28

---

## Summary

Implemented bidirectional ZIP operations using fflate. Import reads a .zip file and creates a project with all contained files. Export reads a project's files from IndexedDB and generates a downloadable .zip.

## Files Created

| File | Description |
|------|-------------|
| `src/utils/zipImport.ts` | ZIP import + export utilities (~130 lines) |

## Files Modified

| File | Changes |
|------|---------|
| `src/App.tsx` | Added "Export ZIP" button in IDE titlebar |
| `src/components/ProjectList/ProjectList.tsx` | Added "Import ZIP" button with file picker |

## API

```typescript
// Import: Read a .zip file → create a project with all files
importProjectFromZip(zipFile: File): Promise<{ id: string; name: string }>

// Export: Read project files → write a .zip → trigger browser download
exportProjectToZip(projectId: string, projectName: string): Promise<Blob>
```

## Design Decisions

1. **fflate over JSZip** — fflate is already in package.json (added in TASK-01). It's the fastest bidirectional ZIP library at ~8KB gzipped.
2. **Flat file structure for Phase 0** — Import flattens directory structures (only uses filename, not full path). Export also outputs flat. This matches Phase 0's flat file model. Phase 1 will preserve directory structure.
3. **Smart ZIP name** — Project name is derived from the ZIP filename (without .zip extension).
4. **Duplicate handling** — If a ZIP contains multiple files with the same name in different folders, duplicates are skipped with a console warning (since Phase 0 is flat).
5. **Browser download** — Export creates a Blob URL and triggers download via a temporary `<a>` element. The ZIP filename is the sanitized project name.
6. **Hidden files excluded** — Import skips `__MACOSX/` entries and dotfiles (`.DS_Store`, etc.).
