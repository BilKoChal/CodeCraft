# BUG-01 + RS#1 Fix — Zustand Store Reactivity Overhaul

**Task ID**: BUG-01, RS-#1, RS-#2, RS-#7, BUG-05, BUG-06, BUG-10, BUG-11, RS-#8
**Date**: 2026-05-28
**Status**: Complete
**Files Modified**: `src/stores/editorStore.ts`, `src/components/Tabs/TabBar.tsx`, `src/components/StatusBar/StatusBar.tsx`, `src/components/Preview/PreviewFrame.tsx`, `src/components/Editor/CodeEditor.tsx`, `src/hooks/useKeyboardShortcuts.ts`, `src/App.tsx`

---

## BUG-01: Set<string> Serialization Corruption + O(n) Performance

### Problem
`dirtyFileIds` was typed as `Set<string>`. Every mutation created a new Set via `new Set([...state.dirtyFileIds, fileId])`, which is O(n). More critically, if `persist` middleware were added, `JSON.stringify` converts `Set` to `{}`, silently losing all dirty tracking data.

### Fix
Replaced `Set<string>` with `Record<string, boolean>`:
- O(1) add: `state.dirtyFileIds[fileId] = true`
- O(1) delete: `delete state.dirtyFileIds[fileId]`
- JSON-serializable (safe for persist middleware)
- Works correctly with immer's draft pattern

---

## RS-#1: Store Function Selectors Never Re-render Components

### Problem
The editorStore defined `isDirty`, `getContent`, and `dirtyCount` as functions stored in the Zustand state object. When components used `useEditorStore(s => s.isDirty)`, they received a stable function reference that never changed. Zustand's equality check (`Object.is`) saw the same reference and skipped re-renders. This caused:
- Dirty indicators in tab bar never updated
- Live preview never refreshed on content change
- Status bar showed stale dirty counts

### Fix
Removed all function selectors from the store. Components now use inline selectors that subscribe to the reactive data directly:

```typescript
// Before (broken — stable function ref, never re-renders)
const isDirty = useEditorStore(s => s.isDirty);
const dirty = isDirty(activeFileId);

// After (reactive — subscribes to actual data)
const dirty = useEditorStore(s => !!s.dirtyFileIds[activeFileId ?? '']);
```

For non-React contexts (event handlers, async callbacks), use `getState()`:
```typescript
// Before
const { getContent } = useEditorStore.getState();
const code = getContent(activeFileId);

// After
const { fileContents } = useEditorStore.getState();
const code = fileContents[activeFileId] ?? '';
```

### Components Fixed
1. **TabBar.tsx**: `isDirty(fileId)` → `!!dirtyFileIds[fileId]`
2. **StatusBar.tsx**: `isDirty(activeFileId)` → `!!s.dirtyFileIds[activeFileId]`, `dirtyCount()` → `Object.keys(s.dirtyFileIds).length`
3. **PreviewFrame.tsx**: `getContent(activeFileId)` → `s.fileContents[activeFileId]`
4. **CodeEditor.tsx**: `getContent(activeFileId)` → `s.fileContents[activeFileId]`
5. **App.tsx**: `getContent(activeFileId)` → `activeFileContent` from selector
6. **useKeyboardShortcuts.ts**: `getContent(activeFileId)` → `fileContents[activeFileId]`

---

## RS-#7: cursorPositions Over-Selection in StatusBar

### Problem
StatusBar subscribed to the entire `cursorPositions` object, re-rendering when ANY file's cursor changed.

### Fix
Select only the active file's cursor:
```typescript
const cursor = useEditorStore(s => activeFileId
  ? s.cursorPositions[activeFileId] ?? { line: 1, column: 1 }
  : { line: 1, column: 1 });
```

---

## BUG-05: Module-Level fileMetaCache in TabBar

### Problem
`fileMetaCache` was a module-level Map that didn't participate in React's rendering model. Cache updates didn't trigger re-renders, so tabs showed "Loading..." indefinitely.

### Fix
Replaced with React `useState<Map>` that triggers re-renders on updates. Added proper cleanup for stale entries and cancellation for async operations.

---

## BUG-06: Module-Level cachedFileMeta in StatusBar

### Problem
Same as BUG-05 but in StatusBar. The `clearFileMetaCache()` function was never called.

### Fix
Replaced with inline `getFile()` call inside useEffect with proper cancellation. Removed the `clearFileMetaCache` export entirely.

---

## BUG-10: Function Call in useEffect Dependency Array

### Problem
`getContent(activeFileId ?? '')` was called in PreviewFrame's useEffect dependency array. Non-standard, fragile, and didn't work because `getContent` was a stable function reference.

### Fix
Replaced with `activeFileContent` from a proper reactive selector.

---

## RS-#8: `viewUpdate: any` in CodeEditor

### Problem
The CM6 update callback parameter was typed as `any`.

### Fix
Imported `ViewUpdate` from `@codemirror/view` and used it as the proper type.

---

## Verification
- TypeScript: `tsc --noEmit` passes with zero errors
- Build: `npm run build` succeeds
- All function selectors removed from editorStore
- All consuming components updated to use inline reactive selectors
