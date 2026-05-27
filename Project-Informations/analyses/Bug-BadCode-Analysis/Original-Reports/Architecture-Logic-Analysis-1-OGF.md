# Architecture-Logic-Analysis-1-OGF

**Project**: CodeCraft — Browser-based Code Editor  
**Analysis Type**: Architecture, Logic Bugs, Anti-patterns, Memory Leaks, Data Integrity  
**Date**: 2026-03-04  
**Analyst**: Architecture & Logic Bug Analyst

---

## Executive Summary

Deep analysis of the CodeCraft codebase (React + TypeScript + Vite + CodeMirror 6 + IndexedDB/Dexie + Zustand) identified **15 significant issues** across 6 categories. Key findings include: a critical data-loss scenario when closing tabs with unsaved changes, a Zustand `Set` serialization bug that corrupts persisted state, a hardcoded language in the editor that breaks syntax highlighting for non-JS files, a double-delete race condition in project deletion, and multiple module-level mutable caches that become stale and never trigger re-renders.

---

## Findings

### BUG-01: Zustand `Set<string>` Serialization Corruption in editorStore

| Field | Value |
|-------|-------|
| **Severity** | Critical |
| **Category** | Data Integrity |
| **Location** | `src/stores/editorStore.ts` lines 24, 66, 72, 82-84, 96-98, 104 |
| **Description** | The `dirtyFileIds` field is typed as `Set<string>`. While editorStore is not persisted (no `persist` middleware), the `Set` type creates a subtle problem: every mutation creates a new Set via `new Set([...state.dirtyFileIds, fileId])`, which requires spreading the entire set. More critically, if `persist` middleware is ever added to this store (as the partialize pattern in projectStore suggests was considered), `JSON.stringify` converts `Set` to `{}`, silently losing all dirty tracking data. Even without persist, the `Set` approach forces full reconstruction on every update, which is O(n) instead of O(1) for add/delete operations. |
| **Evidence** | ```typescript
// Line 72: Spreading the entire Set on every keystroke
state.dirtyFileIds = new Set([...state.dirtyFileIds, fileId]);

// Line 82-84: Spreading again to remove
state.dirtyFileIds = new Set(
  [...state.dirtyFileIds].filter((id) => id !== fileId),
);
``` |
| **Research** | [Zustand Issue #618](https://github.com/pmndrs/zustand/issues/618): "By default, persist serializes the state using JSON.stringify. Unfortunately JSON doesn't fit very well with Sets and Maps." — This is a documented incompatibility. |
| **Fix** | Replace `Set<string>` with `Record<string, boolean>` (or `Record<string, true>`). This is O(1) for add/delete, JSON-serializable, and works correctly with immer's draft pattern: `state.dirtyFileIds[fileId] = true;` / `delete state.dirtyFileIds[fileId];` |

---

### BUG-02: Hardcoded Language in CodeEditor — No Syntax Highlighting for Non-JS Files

| Field | Value |
|-------|-------|
| **Severity** | High |
| **Category** | Logic Bug |
| **Location** | `src/components/Editor/CodeEditor.tsx` line 39 |
| **Description** | The `language` variable is hardcoded to `'javascript'` with a TODO comment. This means when a user opens a TypeScript, HTML, CSS, JSON, or Markdown file, the editor will use JavaScript syntax highlighting instead of the correct one. The file's actual language is stored in IndexedDB (`file.language`) and is available via the `getFile()` query, but it's never used. |
| **Evidence** | ```typescript
// Line 39: Hardcoded!
const language: LanguageId = 'javascript';

// The correct language IS available from the file metadata
// but is never fetched or used
``` |
| **Research** | CodeMirror's `@codemirror/lang-javascript` with `{ typescript: true }` correctly handles TS/TSX. Without the correct language extension passed, CM6 falls back to plain text mode for all non-JS files. This is a fundamental editor functionality bug. |
| **Fix** | Fetch the file metadata in CodeEditor and derive the language from it. Use a `useState` + `useEffect` pattern (like StatusBar does) or pass language as a prop from the parent that already has file metadata. Consider lifting file metadata to a shared context/store to avoid redundant IndexedDB reads. |

---

### BUG-03: Data Loss When Closing a Tab with Unsaved Changes

| Field | Value |
|-------|-------|
| **Severity** | High |
| **Category** | Data Integrity |
| **Location** | `src/components/Sidebar/useFileTree.ts` lines 168-183; `src/stores/projectStore.ts` lines 73-88 |
| **Description** | When a file is deleted from the file tree, `closeFile()` is called followed by `unloadContent()`. The `unloadContent` removes the file's content from memory in editorStore, but if the file had unsaved (dirty) changes, those changes are silently discarded — there is no save-before-close or confirmation prompt. Similarly, the `closeFile` action in `projectStore` doesn't check for dirty state. The user loses work without warning. |
| **Evidence** | ```typescript
// useFileTree.ts lines 168-176
const deleteFile = useCallback(async (fileId: string): Promise<boolean> => {
  try {
    closeFile(fileId);       // No dirty check!
    unloadContent(fileId);   // Content lost if unsaved!
    await dbDeleteFile(fileId);
    return true;
  } catch (err: any) {
    // ...
  }
}, [closeFile, unloadContent]);
``` |
| **Research** | [MDN: beforeunload event](https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event) and [Stack Overflow: Confirmation before closing](https://stackoverflow.com/questions/74672901) — The standard pattern is to warn users about unsaved changes before destructive actions. VS Code, CodeSandbox, and all major editors implement this. |
| **Fix** | Before closing a tab or deleting a file, check `editorStore.isDirty(fileId)`. If dirty, either (a) auto-save first, or (b) show a confirmation dialog. Also add a `window.beforeunload` listener when there are dirty files. |

---

### BUG-04: Double-Delete Race Condition in useProjects.deleteProject

| Field | Value |
|-------|-------|
| **Severity** | High |
| **Category** | Logic Bug / Data Integrity |
| **Location** | `src/hooks/useProjects.ts` lines 122-147 |
| **Description** | The `deleteProject` function in `useProjects.ts` calls `deleteFilesByProject(id)` followed by `dbDeleteProject(id)` separately. However, `dbDeleteProject` (from `db/queries/projects.ts`) already performs a cascading delete of both files AND the project inside a single transaction. This means files are deleted TWICE — once outside a transaction, and once inside the transaction. If the first `deleteFilesByProject` succeeds but `dbDeleteProject` fails (e.g., IndexedDB error), the project record remains but all its files are gone, leaving an orphaned project. |
| **Evidence** | ```typescript
// useProjects.ts lines 126-127
await deleteFilesByProject(id);   // Step 1: Deletes all files (no transaction)
await dbDeleteProject(id);         // Step 2: Tries to delete files AGAIN + project

// db/queries/projects.ts lines 124-131
export async function deleteProject(id: string): Promise<void> {
  await db.transaction('rw', [db.projects, db.files], async () => {
    await db.files.where('projectId').equals(id).delete();  // Deletes files again!
    await db.projects.delete(id);
  });
}
``` |
| **Research** | [Dexie.js Issue #1932](https://github.com/dexie/Dexie.js/issues/1932) — The recommended pattern for cascading deletes is to use a single transaction. The current code violates this by performing a non-transactional delete followed by a transactional one. |
| **Fix** | Remove the `deleteFilesByProject(id)` call from `useProjects.ts`. Use only `dbDeleteProject(id)` which already handles the cascade correctly within a transaction. |

---

### BUG-05: Module-Level Mutable Cache in TabBar Never Invalidated

| Field | Value |
|-------|-------|
| **Severity** | High |
| **Category** | Architecture / Logic Bug |
| **Location** | `src/components/Tabs/TabBar.tsx` lines 167, 178-193 |
| **Description** | `fileMetaCache` is a module-level `Map` that stores file metadata (name, language) to avoid repeated IndexedDB reads. However, this cache is **never invalidated** when files are renamed. When a user renames a file, the IndexedDB record is updated, but the cache still holds the old name. The tab continues to show the old filename until the page is refreshed. Additionally, because the cache is populated asynchronously inside `useEffect` with `.then()`, setting the cache doesn't trigger a re-render, so the tab label remains "Loading..." until some other state change forces a re-render. |
| **Evidence** | ```typescript
// Line 167: Module-level cache — persists across renders, never cleared
const fileMetaCache = new Map<string, { name: string; language: LanguageId }>();

// Lines 180-191: Async cache population that doesn't trigger re-render
useEffect(() => {
  for (const fileId of openFileIds) {
    if (!fileMetaCache.has(fileId)) {
      getFile(fileId).then((file) => {
        if (file) {
          fileMetaCache.set(fileId, { name: file.name, language: file.language });
          // No state update to trigger re-render!
        }
      });
    }
  }
}, [openFileIds, loadContent]);
``` |
| **Research** | Module-level mutable state in React components is a well-known anti-pattern. [React docs](https://react.dev/learn/you-might-not-need-an-effect) recommend using state or refs for component-level data, and external stores with subscriptions for shared data. The cache-then-no-re-render pattern means the UI shows stale data. |
| **Fix** | (1) Move file metadata to a Zustand store or use `useLiveQuery` from Dexie for reactive data. (2) If keeping a cache, use React state (`useState`) so cache updates trigger re-renders, and invalidate entries on rename. (3) Clear the cache when switching projects. |

---

### BUG-06: Module-Level Mutable Cache in StatusBar Never Invalidated

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Category** | Architecture / Logic Bug |
| **Location** | `src/components/StatusBar/StatusBar.tsx` lines 46-84 |
| **Description** | Same pattern as BUG-05 but in StatusBar. `cachedFileMeta` is a module-level variable that caches file metadata. It's never cleared when switching projects or when a file is renamed. The `clearFileMetaCache()` function exists but is never called anywhere in the codebase. |
| **Evidence** | ```typescript
// Lines 46-50: Module-level cache
let cachedFileMeta: {
  fileId: string;
  name: string;
  language: LanguageId;
} | null = null;

// Lines 55-57: Clear function that is NEVER called
export function clearFileMetaCache(): void {
  cachedFileMeta = null;
}
``` |
| **Research** | Same as BUG-05 — module-level mutable state in React is an anti-pattern that leads to stale UI. |
| **Fix** | Use `useLiveQuery` from Dexie for the active file's metadata, or call `clearFileMetaCache()` when the active file changes (it's already exported but unused). Better: use a shared reactive data source. |

---

### BUG-07: Auto-Save Cleanup Effect Cannot Guarantee Data Persistence

| Field | Value |
|-------|-------|
| **Severity** | High |
| **Category** | Data Integrity |
| **Location** | `src/hooks/useAutoSave.ts` lines 178-190 |
| **Description** | The cleanup effect attempts to flush dirty files on unmount by calling `flushDirtyFiles()`. However, `flushDirtyFiles` is an async function that writes to IndexedDB. The cleanup function in `useEffect` cannot await promises — it must return synchronously. This means if the component unmounts (e.g., user navigates away), the `flushDirtyFiles` promise may never complete because the browser can garbage-collect or abort the operation. The comment even acknowledges this: "we can't await in cleanup but we can start the save operations." Starting is not enough — the operations may not finish. |
| **Evidence** | ```typescript
// Lines 178-190
useEffect(() => {
  return () => {
    const dirtyIds = useEditorStore.getState().dirtyFileIds;
    if (dirtyIds.size > 0) {
      // This async call may never complete!
      flushDirtyFiles();
    }
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);
``` |
| **Research** | [Stack Overflow](https://stackoverflow.com/questions/75725559): "You can't return the cleanup function if it's defined inside the asynchronous context, because the cleanup function needs to be returned synchronously." [Dmitri Pavlutin's article](https://dmitripavlutin.com/react-cleanup-async-effects) recommends using AbortController for async cleanup. |
| **Fix** | (1) Add a `window.beforeunload` handler that blocks navigation when there are dirty files (using `event.preventDefault()`). (2) Use `navigator.sendBeacon()` or synchronous XHR as a last-resort save in the beforeunload handler. (3) Consider using `document.visibilitychange` to save when the tab becomes hidden (which is more reliable than unmount). |

---

### BUG-08: Auto-Save Debounce Race Condition with Async Settings Read

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Category** | Logic Bug / Race Condition |
| **Location** | `src/hooks/useAutoSave.ts` lines 144-174 |
| **Description** | The debounce scheduling is async because `getDebounceDelay()` reads settings from IndexedDB. The `scheduleSave()` function awaits the delay, then sets a timeout. But the effect cleanup runs synchronously — if the effect re-runs or the component unmounts while `scheduleSave` is still awaiting the settings, the timeout will be set AFTER cleanup has already run. The cleanup function won't know about this new timeout, so it won't be cleared. |
| **Evidence** | ```typescript
// Lines 154-163: Async scheduling
const scheduleSave = async () => {
  const delay = await getDebounceDelay();  // Async!
  if (delay < 0) return;
  // This timeout may be set AFTER the cleanup function has run
  timerRef.current = setTimeout(() => {
    flushDirtyFiles();
  }, delay);
};
scheduleSave();  // Fire and forget

// Lines 168-173: Synchronous cleanup that won't catch the above timeout
return () => {
  if (timerRef.current !== null) {
    clearTimeout(timerRef.current);  // May be null if scheduleSave hasn't completed
    timerRef.current = null;
  }
};
``` |
| **Research** | React's effect cleanup is synchronous. Async operations started in effects but completing after cleanup is a well-documented race condition pattern. [React docs](https://react.dev/reference/react/useEffect) recommend using a `cancelled` flag or AbortController. |
| **Fix** | Cache the debounce delay in a ref (read settings once on mount and on settings change), eliminating the need for async scheduling. Read the delay synchronously from a ref instead of querying IndexedDB on every dirty change. |

---

### BUG-09: PreviewFrame Uses Stale IndexedDB Content Instead of Editor Store

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Category** | Data Integrity |
| **Location** | `src/components/Preview/PreviewFrame.tsx` lines 159-182 |
| **Description** | The `updatePreview` function gets the active file content from `getContent(activeFileId)` (which reads from the in-memory editorStore — correct), but then calls `getFilesByProject(activeProjectId)` which reads ALL project files from IndexedDB. For the active file, the content is correctly from the editor store. However, `buildPreviewHTML` uses `files.find(f => f.name === 'index.html')` to find an index.html file — this reads the **stale IndexedDB content** for index.html, not the latest editor content. If the user has unsaved changes in index.html and is viewing another file, the preview will show outdated index.html content. |
| **Evidence** | ```typescript
// Lines 166-180
const content = getContent(activeFileId) ?? '';   // Correct: from editor store
const file = await getFile(activeFileId);
const language: LanguageId = file?.language ?? 'plaintext';
const files = await getFilesByProject(activeProjectId);  // BUG: reads from IndexedDB!

// buildPreviewHTML uses files[indexHtml].content which is STALE
const html = buildPreviewHTML(files, content, language);
``` |
| **Research** | In browser-based IDEs (CodeSandbox, StackBlitz), the preview always uses the latest in-memory content, not persisted content. This is because auto-save is debounced and the user expects immediate feedback. |
| **Fix** | When building preview HTML, overlay the editor store's in-memory content on top of the IndexedDB files. For each file returned by `getFilesByProject`, check if the editor store has a newer version: `const finalContent = getContent(file.id) ?? file.content;` |

---

### BUG-10: PreviewFrame useEffect Dependency Includes Function Call

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Category** | Anti-pattern |
| **Location** | `src/components/Preview/PreviewFrame.tsx` line 201 |
| **Description** | The useEffect dependency array includes `getContent(activeFileId ?? '')`, which is a function call. This means React calls `getContent()` during render to compute the dependency value. While this technically works to re-trigger the effect when content changes, it violates React's rules for dependency arrays. The React docs state that dependencies should be values from the component scope, not function call results. More importantly, `getContent` reads from the Zustand store without subscribing, so React can't detect when the content changes without calling the function — but calling it in the dependency array means the effect re-runs on every render even if the content hasn't changed, because the string comparison might pass but the intent is wrong. |
| **Evidence** | ```typescript
// Line 201: Function call in dependency array
}, [activeFileId, activeBottomTab, updatePreview, getContent(activeFileId ?? '')]);
``` |
| **Research** | [React useEffect docs](https://react.dev/reference/react/useEffect): "React will compare each dependency with its previous value using the Object.is comparison." Including a function call result in deps is an anti-pattern because it's evaluated during render, not as a reactive subscription. [ESLint react-hooks/exhaustive-deps rule](https://stackoverflow.com/questions/55228102) warns against this. |
| **Fix** | Subscribe to the content via `useEditorStore(s => s.fileContents[activeFileId ?? ''])` and use that state variable in the dependency array. This provides proper reactive subscription. |

---

### BUG-11: Zustand Selector Functions Using `get()` Don't Optimize Re-renders

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Category** | Performance / Anti-pattern |
| **Location** | `src/stores/editorStore.ts` lines 108-113; `src/components/StatusBar/StatusBar.tsx` lines 157-158 |
| **Description** | The `isDirty`, `getContent`, and `dirtyCount` methods are defined as functions in the store that use `get()`. When components use these as selectors (e.g., `useEditorStore(s => s.isDirty)`), they receive a function reference. But when they CALL these functions (e.g., `isDirty(activeFileId)`, `dirtyCount()`), the result is computed from the store's current state without participating in Zustand's subscription mechanism. This means: (1) `const isDirty = useEditorStore(s => s.isDirty)` subscribes to the `isDirty` function reference (which never changes), so the component never re-renders when dirty state changes; (2) `const dirty = isDirty(activeFileId)` computes the value but doesn't subscribe to changes. In StatusBar, `isDirty(activeFileId)` and `dirtyCount()` are called during render but don't cause re-renders when their results change — the component only re-renders because `cursorPositions` changes. |
| **Evidence** | ```typescript
// editorStore.ts lines 109-113
isDirty: (fileId) => get().dirtyFileIds.has(fileId),
getContent: (fileId) => get().fileContents[fileId],
dirtyCount: () => get().dirtyFileIds.size,

// StatusBar.tsx line 157-158
const isDirty = useEditorStore((s) => s.isDirty);   // Gets function ref
const dirtyCount = useEditorStore((s) => s.dirtyCount); // Gets function ref
// These are called during render but don't subscribe to changes!
const dirty = activeFileId ? isDirty(activeFileId) : false;
const totalDirty = dirtyCount();
``` |
| **Research** | [TkDodo's blog on Zustand](https://tkdodo.eu/blog/working-with-zustand): "Selectors should return primitive values or stable references. If you return a function, the component subscribes to the function reference, not its result." Zustand's subscription uses `Object.is` comparison on the selector result. |
| **Fix** | Replace selector functions with inline selectors that return the computed value: `const dirty = useEditorStore(s => s.dirtyFileIds.has(activeFileId ?? ''))` and `const totalDirty = useEditorStore(s => s.dirtyFileIds.size)`. This subscribes to the actual values and triggers re-renders when they change. |

---

### BUG-12: PWA Service Worker setInterval Never Cleared — Memory Leak

| Field | Value |
|-------|-------|
| **Severity** | Low |
| **Category** | Memory Leak |
| **Location** | `src/main.tsx` lines 54-56 |
| **Description** | The `onRegisteredSW` callback creates a `setInterval` that checks for service worker updates every hour. This interval is never cleared because it runs for the entire lifetime of the application. While this is generally acceptable for a long-lived SPA, it's technically a resource leak. More importantly, if the service worker registration changes or the app is hot-reloaded during development, multiple intervals could stack up. |
| **Evidence** | ```typescript
// Lines 54-56
if (registration) {
  setInterval(() => {
    registration.update();
  }, 60 * 60 * 1000); // Never cleared!
}
``` |
| **Research** | [vite-plugin-pwa documentation](https://vite-pwa-org.netlify.app/) recommends using `registration.update()` on visibility change instead of fixed intervals, which is more efficient and avoids the leak. |
| **Fix** | Replace the interval with a `visibilitychange` listener: `document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') registration.update(); })`. This is the recommended pattern for PWA update checks. |

---

### BUG-13: `setActiveProject('')` in useProjects.deleteProject — Invalid State

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Category** | Logic Bug |
| **Location** | `src/hooks/useProjects.ts` lines 135-137 |
| **Description** | When deleting the currently active project, the code calls `setActiveProject('')` (which sets `activeProjectId` to an empty string), then immediately calls `useProjectStore.setState({ activeProjectId: null })`. The `setActiveProject('')` call first triggers `setActiveProject` which sets `activeProjectId = ''` and clears `openFileIds` and `activeFileId`. Then the second call overrides `activeProjectId` to `null`. This causes TWO state mutations and briefly puts the store in an invalid state where `activeProjectId` is `''` (a truthy string), which would render the IDE workspace instead of the project list. |
| **Evidence** | ```typescript
// Lines 135-137
setActiveProject('');                          // Sets activeProjectId = '' (truthy!)
useProjectStore.setState({ activeProjectId: null });  // Then overrides to null
``` |
| **Research** | The `setActiveProject` action in projectStore (line 55-61) sets `state.activeProjectId = id` directly. An empty string `''` is truthy in this context because the App.tsx check is `if (!activeProjectId)` — and `!'' === true`, so it would actually show the project list. But it's still a two-step mutation that causes an intermediate render with `activeProjectId = ''` and `openFileIds = []`, which is wrong. |
| **Fix** | Replace lines 135-137 with a single: `useProjectStore.setState({ activeProjectId: null, openFileIds: [], activeFileId: null });`. This is atomic and avoids the intermediate invalid state. |

---

### BUG-14: No `beforeunload` Handler — Users Can Lose Unsaved Work by Closing Browser Tab

| Field | Value |
|-------|-------|
| **Severity** | High |
| **Category** | Data Integrity |
| **Location** | Application-wide (missing from `App.tsx` or `useAutoSave.ts`) |
| **Description** | The application has no `beforeunload` event handler. If a user has unsaved (dirty) changes in the editor and closes the browser tab, they lose their work. The auto-save debounce timer may not have fired yet, and the cleanup effect (BUG-07) cannot guarantee the save completes. This is a standard feature in any editor application. |
| **Evidence** | No `window.addEventListener('beforeunload', ...)` exists anywhere in the codebase. The only data protection is the debounced auto-save, which has known gaps (BUG-07, BUG-08). |
| **Research** | [MDN: beforeunload event](https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event): "When this event returns a non-void value, the user agent will ask the user to confirm they want to leave the page." This is the standard mechanism used by VS Code, Google Docs, and all major editors. |
| **Fix** | Add a `beforeunload` handler in `useAutoSave` or a dedicated hook: `useEffect(() => { const handler = (e: BeforeUnloadEvent) => { if (useEditorStore.getState().dirtyFileIds.size > 0) { e.preventDefault(); } }; window.addEventListener('beforeunload', handler); return () => window.removeEventListener('beforeunload', handler); }, []);` |

---

### BUG-15: CodeEditor File Switch Dispatch Conflicts with Controlled Value Prop

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Category** | Architecture / Anti-pattern |
| **Location** | `src/components/Editor/CodeEditor.tsx` lines 35, 69-91, 105 |
| **Description** | The CodeEditor component claims to use "uncontrolled mode" but passes `value={content}` to the `<CodeMirror>` component. In `@uiw/react-codemirror`, passing a `value` prop makes the editor controlled — every re-render with a different `value` will overwrite the editor content. The file switching logic (lines 72-91) manually dispatches content changes via `view.dispatch()`, but the `value` prop also tries to update the editor. This creates a conflict: during file switches, both mechanisms attempt to set the content simultaneously, potentially causing cursor jumps or content flashing. Additionally, the `content` variable is computed from `getContent(activeFileId)` during render, which changes whenever `activeFileId` changes — triggering the controlled value update before the dispatch has a chance. |
| **Evidence** | ```typescript
// Line 35: Computed value for the "controlled" prop
const content = activeFileId ? getContent(activeFileId) ?? '' : '';

// Lines 72-91: Manual dispatch for file switching
useEffect(() => {
  if (activeFileId !== prevFileIdRef.current) {
    // ...
    view.dispatch({ changes: { from: 0, to: currentContent.length, insert: newContent } });
  }
}, [activeFileId, getContent]);

// Line 105: The controlled value prop
<CodeMirror value={content} ... />
``` |
| **Research** | [CodeMirror Discussion](https://discuss.codemirror.net/t/editor-crashing-when-used-as-controlled-component-in-react/8457): Controlled mode in CodeMirror React wrappers is known to cause issues with cursor jumping and state conflicts. The `@uiw/react-codemirror` docs recommend using `onChange` for uncontrolled mode by NOT passing `value`, or using `value` carefully with controlled mode. |
| **Fix** | Choose one approach: (A) Fully controlled: Remove the manual dispatch and let `value` handle content updates. Ensure `content` is always the latest from the store. (B) Fully uncontrolled: Remove the `value` prop and use only the manual dispatch for file switching. Set initial content via `onCreateEditor`. Approach (B) is more aligned with the stated design intent and avoids cursor jumping. |

---

## Summary Table

| ID | Severity | Category | Location | Title |
|----|----------|----------|----------|-------|
| BUG-01 | Critical | Data Integrity | editorStore.ts | `Set<string>` serialization corruption with immer/persist |
| BUG-02 | High | Logic Bug | CodeEditor.tsx:39 | Hardcoded language = no syntax highlighting for non-JS |
| BUG-03 | High | Data Integrity | useFileTree.ts | Silent data loss when closing tabs with unsaved changes |
| BUG-04 | High | Logic Bug | useProjects.ts | Double-delete race condition in project deletion |
| BUG-05 | High | Architecture | TabBar.tsx:167 | Module-level cache never invalidated, no re-render on populate |
| BUG-06 | Medium | Architecture | StatusBar.tsx:46 | Module-level cache never cleared, `clearFileMetaCache` never called |
| BUG-07 | High | Data Integrity | useAutoSave.ts:178 | Async cleanup cannot guarantee save on unmount |
| BUG-08 | Medium | Race Condition | useAutoSave.ts:154 | Async debounce scheduling races with synchronous cleanup |
| BUG-09 | Medium | Data Integrity | PreviewFrame.tsx | Preview uses stale IndexedDB content for non-active files |
| BUG-10 | Medium | Anti-pattern | PreviewFrame.tsx:201 | Function call in useEffect dependency array |
| BUG-11 | Medium | Performance | editorStore.ts / StatusBar.tsx | `get()` selectors don't optimize re-renders |
| BUG-12 | Low | Memory Leak | main.tsx:54 | PWA setInterval never cleared |
| BUG-13 | Medium | Logic Bug | useProjects.ts:135 | `setActiveProject('')` creates invalid intermediate state |
| BUG-14 | High | Data Integrity | App-wide | No `beforeunload` handler — tab close loses work |
| BUG-15 | Medium | Architecture | CodeEditor.tsx | Controlled value prop conflicts with manual dispatch |

---

## Priority Recommendations

1. **Immediate (Critical/High)**: Fix BUG-01 (Set→Record), BUG-02 (hardcoded language), BUG-03 (data loss on tab close), BUG-04 (double-delete), BUG-14 (beforeunload handler), BUG-07 (auto-save cleanup)
2. **Short-term (Medium)**: Fix BUG-05/06 (module-level caches → reactive data), BUG-08 (async debounce), BUG-09 (stale preview), BUG-10 (dep array), BUG-11 (selectors), BUG-13 (invalid state), BUG-15 (controlled conflict)
3. **Nice-to-have (Low)**: Fix BUG-12 (PWA interval)
