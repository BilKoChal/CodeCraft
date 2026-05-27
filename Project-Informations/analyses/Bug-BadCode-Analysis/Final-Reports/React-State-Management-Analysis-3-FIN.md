# React-State-Management-Analysis-3-OGF

**Project**: CodeCraft — Browser-based Code Editor  
**Scope**: React patterns, Zustand store design, and performance issues  
**Date**: 2026-03-04  
**Analyst**: React & State Management Analyst  

---

## Executive Summary

Deep analysis of CodeCraft's React + Zustand architecture identified **18 distinct issues** across 7 categories. The most critical findings are: (1) **Zustand store function selectors that never trigger re-renders**, causing stale UI for dirty indicators and preview updates; (2) **`useProjectStore.setState()` called inside React components**, bypassing store actions and creating inconsistent state; (3) **Missing error boundaries** leaving the entire app vulnerable to crash from any render error. Collectively, the critical and high-severity issues can cause broken UI state, stale data display, and complete app crashes.

---

## Issue Index

| # | Severity | Category | Location | Summary |
|---|----------|----------|----------|---------|
| 1 | Critical | Zustand Anti-pattern | editorStore.ts / TabBar / StatusBar | Store function selectors (`isDirty`, `getContent`, `dirtyCount`) never re-render components |
| 2 | Critical | Re-render | PreviewFrame.tsx:150,201 | `getContent` selector returns stable reference — live preview never updates on content change |
| 3 | Critical | Zustand Anti-pattern | useProjects.ts:135-137 | `setActiveProject('')` + `setState({activeProjectId:null})` double-update with inconsistent intermediate state |
| 4 | High | Zustand Anti-pattern | App.tsx:121, useProjects.ts:137,165 | `useProjectStore.setState()` bypasses immer actions inside React components |
| 5 | High | Component Design | App.tsx (entire tree) | No error boundaries — any render crash = white screen |
| 6 | High | Hook Issue | useAutoSave.ts:178-190 | Async `flushDirtyFiles()` called in unmount cleanup — save may not complete |
| 7 | High | Re-render | StatusBar.tsx:156 | `cursorPositions` selector returns new reference when ANY file's cursor changes |
| 8 | High | Type Safety | CodeEditor.tsx:59 | `viewUpdate: any` bypasses type safety on CM6 update callback |
| 9 | High | Type Safety | useProjects.ts:93,113,141; useFileTree.ts:123,159,178; ProjectList.tsx:208 | `catch (err: any)` — 7 instances of `any` in error handlers |
| 10 | High | Type Safety | useFileTree.ts:149 | `activeProjectId!` non-null assertion bypasses null safety |
| 11 | Medium | Re-render | App.tsx:111-116 | `handleExportZip` not memoized — recreated every render |
| 12 | Medium | Re-render | App.tsx:118-122 | `handleCloseProject` not memoized — recreated every render |
| 13 | Medium | Component Design | TabBar.tsx:167 | Module-level mutable `fileMetaCache` Map — not reactive, goes stale on rename |
| 14 | Medium | Component Design | StatusBar.tsx:46-50 | Module-level mutable `cachedFileMeta` — not reactive, goes stale on rename |
| 15 | Medium | Hook Issue | TabBar.tsx:178-193 | Async cache population without cleanup — race condition on rapid tab changes |
| 16 | Medium | Effect Issue | PreviewFrame.tsx:201 | `getContent(activeFileId ?? '')` function call in dependency array — non-standard pattern |
| 17 | Medium | Type Safety | FileTree.tsx:339 | `e as any` type assertion bypasses safety for context menu handler |
| 18 | Low | Re-render | App.tsx:183,186,197 | Inline style objects recreated on every render |

---

## Detailed Findings

### Issue #1 — Store Function Selectors Never Re-render Components

- **Severity**: Critical  
- **Category**: Zustand Anti-pattern  
- **Location**: `src/stores/editorStore.ts:109-113`, consumed in `TabBar.tsx:174`, `StatusBar.tsx:157-158`  
- **Description**: The `editorStore` defines `isDirty`, `getContent`, and `dirtyCount` as functions stored in the Zustand state object. When components select these via `useEditorStore((s) => s.isDirty)`, they receive a **stable function reference** that never changes. Zustand's equality check (`Object.is`) sees the same reference and skips re-renders. This means when `dirtyFileIds` changes (a file becomes dirty/clean), components subscribed to the function selector **do not re-render**, causing stale dirty indicators in the tab bar and incorrect dirty counts in the status bar.  
- **Evidence**:  
  ```tsx
  // editorStore.ts — stable function references
  isDirty: (fileId) => get().dirtyFileIds.has(fileId),
  getContent: (fileId) => get().fileContents[fileId],
  dirtyCount: () => get().dirtyFileIds.size,

  // TabBar.tsx:174 — subscribes to stable function, never re-renders on dirty change
  const isDirty = useEditorStore((s) => s.isDirty);
  // ...
  isDirty={isDirty(fileId)}  // computed at render time but component won't re-render

  // StatusBar.tsx:157-158 — same problem
  const isDirty = useEditorStore((s) => s.isDirty);
  const dirtyCount = useEditorStore((s) => s.dirtyCount);
  const dirty = activeFileId ? isDirty(activeFileId) : false;  // stale!
  const totalDirty = dirtyCount();  // stale!
  ```  
- **Research**: Zustand's documentation and community discussions confirm that selectors returning stable references (like functions) don't cause re-renders when underlying data changes. See: [Zustand docs — Selectors](https://zustand.docs.pmnd.rs/guides/adding-computed-properties), [GitHub Discussion #1653](https://github.com/pmndrs/zustand/discussions/1653), [Medium — Zustand DOs and DON'Ts](https://medium.com/@nfailla93/zustand-in-react-dos-and-donts-5a608c26c68).  
- **Fix Recommendation**: Replace function selectors with proper Zustand selectors that subscribe to the reactive data:  
  ```tsx
  // TabBar — subscribe to dirtyFileIds, not the isDirty function
  const dirtyFileIds = useEditorStore((s) => s.dirtyFileIds);
  // In render: isDirty={dirtyFileIds.has(fileId)}

  // StatusBar — subscribe to the actual data
  const dirtyFileIds = useEditorStore((s) => s.dirtyFileIds);
  const dirty = activeFileId ? dirtyFileIds.has(activeFileId) : false;
  const totalDirty = dirtyFileIds.size;
  ```

---

### Issue #2 — Live Preview Never Updates on Content Change

- **Severity**: Critical  
- **Category**: Re-render  
- **Location**: `src/components/Preview/PreviewFrame.tsx:150,201`  
- **Description**: The `PreviewFrame` component subscribes to `useEditorStore((s) => s.getContent)` which returns a stable function reference (same as Issue #1). The effect at line 185-201 attempts to use `getContent(activeFileId ?? '')` as a dependency, but since the component never re-renders when `fileContents` changes (the `getContent` selector is stable), the effect never re-runs and the preview never updates when the user types. The "live preview" feature is effectively broken — it only updates when `activeFileId` or `activeBottomTab` changes.  
- **Evidence**:  
  ```tsx
  // PreviewFrame.tsx:150 — stable function reference
  const getContent = useEditorStore((s) => s.getContent);

  // PreviewFrame.tsx:185-201 — effect depends on stable getContent + function call result
  useEffect(() => {
    // ...
    debounceRef.current = setTimeout(() => {
      updatePreview();
    }, PREVIEW_DEBOUNCE_MS);
    // ...
  }, [activeFileId, activeBottomTab, updatePreview, getContent(activeFileId ?? '')]);
  // ^ getContent is stable, so component doesn't re-render on content change
  // ^ getContent(activeFileId ?? '') is evaluated but component never re-runs to re-evaluate it
  ```  
- **Research**: Same root cause as Issue #1. Zustand selectors must return the actual reactive data, not accessor functions. See: [Egghead — Implement Zustand State Selectors](https://egghead.io/lessons/react-implement-zustand-state-selectors-in-react-to-prevent-unneeded-rerenders).  
- **Fix Recommendation**: Subscribe directly to the content of the active file:  
  ```tsx
  const activeFileContent = useEditorStore((s) =>
    activeFileId ? s.fileContents[activeFileId] : undefined
  );
  // Use activeFileContent as effect dependency instead of getContent(...)
  ```

---

### Issue #3 — Double State Update with Inconsistent Intermediate State

- **Severity**: Critical  
- **Category**: Zustand Anti-pattern  
- **Location**: `src/hooks/useProjects.ts:133-138`  
- **Description**: When deleting the active project, `deleteProject` performs two sequential state mutations: first `setActiveProject('')` (which sets `activeProjectId` to an empty string — not null), then `useProjectStore.setState({ activeProjectId: null })`. This creates an intermediate state where `activeProjectId` is `''` (empty string), which is semantically incorrect and could trigger unintended side effects. Components subscribed to `activeProjectId` will re-render twice — once with `''` and once with `null`.  
- **Evidence**:  
  ```tsx
  // useProjects.ts:133-138
  const currentActiveId = useProjectStore.getState().activeProjectId;
  if (currentActiveId === id) {
    closeAllFiles();
    clearAll();
    setActiveProject('');  // sets activeProjectId to '' (not null!)
    useProjectStore.setState({ activeProjectId: null });  // then overrides to null
  }
  ```  
- **Research**: Zustand best practice is to perform a single atomic state update. Multiple sequential updates cause multiple re-renders and can expose inconsistent intermediate state. See: [Zustand docs — Store patterns](https://zustand.docs.pmnd.rs/guides/flux-inspired-practice).  
- **Fix Recommendation**: Use a single action or `setState` call:  
  ```tsx
  if (currentActiveId === id) {
    closeAllFiles();
    clearAll();
    useProjectStore.setState({ activeProjectId: null, openFileIds: [], activeFileId: null });
  }
  ```

---

### Issue #4 — `useProjectStore.setState()` Bypasses Store Actions in React Components

- **Severity**: High  
- **Category**: Zustand Anti-pattern  
- **Location**: `src/App.tsx:121`, `src/hooks/useProjects.ts:137,165`  
- **Description**: `useProjectStore.setState({ activeProjectId: null })` is called directly in React components/hooks, bypassing the `setActiveProject` action. This is problematic because: (1) It doesn't go through immer's draft system in the same way (though `setState` works with immer, it's less idiomatic); (2) It bypasses any logic that `setActiveProject` would execute (like resetting `openFileIds` and `activeFileId`); (3) It creates a fragile pattern where state mutations are split between actions and raw `setState` calls, making the code harder to maintain. In `App.tsx:121`, `handleCloseProject` calls `closeAllFiles()` first and then `setState`, but this ordering is fragile — if `closeAllFiles` ever stopped resetting `activeFileId`, the state would be inconsistent.  
- **Evidence**:  
  ```tsx
  // App.tsx:118-122
  const handleCloseProject = () => {
    closeAllFiles();
    editorClearAll();
    useProjectStore.setState({ activeProjectId: null });  // bypasses setActiveProject
  };

  // useProjects.ts:165
  useProjectStore.setState({ activeProjectId: null });  // bypasses setActiveProject
  ```  
- **Research**: Zustand's recommended pattern is to define all state mutations as store actions and call those actions from components. Raw `setState` should only be used outside React or for store-to-store communication. See: [Zustand docs — Flux-inspired practice](https://zustand.docs.pmnd.rs/guides/flux-inspired-practice), [GitHub Discussion #2310](https://github.com/pmndrs/zustand/discussions/2310).  
- **Fix Recommendation**: Add a `clearActiveProject` action to the store and use it instead:  
  ```tsx
  // In projectStore.ts
  clearActiveProject: () => set((state) => {
    state.activeProjectId = null;
    state.openFileIds = [];
    state.activeFileId = null;
  }),

  // In components
  const clearActiveProject = useProjectStore((s) => s.clearActiveProject);
  clearActiveProject();  // single atomic action
  ```

---

### Issue #5 — No Error Boundaries

- **Severity**: High  
- **Category**: Component Design  
- **Location**: `src/App.tsx` (entire component tree)  
- **Description**: The application has no React error boundaries anywhere in the component tree. If any component throws during rendering (e.g., due to a null reference, failed store access, or unexpected data shape), the entire application will crash with an unhandled error and a white screen. This is especially dangerous for a code editor where user data (unsaved files) could be lost. The `CodeEditor` component, `ConsoleOutput`, `PreviewFrame`, and `FileTree` all perform operations that could fail during render.  
- **Evidence**: No `componentDidCatch` or error boundary wrapper found anywhere in the component tree. All components render directly under `App` → `IDEWorkspace` without any error isolation.  
- **Research**: React's official documentation strongly recommends error boundaries for production applications. "Error boundaries are React components that catch JavaScript errors anywhere in their child component tree, log those errors, and display a fallback UI." — [React Error Boundaries docs](https://legacy.reactjs.org/docs/error-boundaries.html).  
- **Fix Recommendation**: Add error boundaries around high-risk subtrees:  
  ```tsx
  <ErrorBoundary fallback={<EditorErrorPanel />}>
    <CodeEditor />
  </ErrorBoundary>
  <ErrorBoundary fallback={<ConsoleErrorPanel />}>
    <ConsoleOutput />
  </ErrorBoundary>
  <ErrorBoundary fallback={<PreviewErrorPanel />}>
    <PreviewFrame />
  </ErrorBoundary>
  ```

---

### Issue #6 — Async Save in Unmount Cleanup May Lose Data

- **Severity**: High  
- **Category**: Hook Issue  
- **Location**: `src/hooks/useAutoSave.ts:178-190`  
- **Description**: The unmount cleanup effect calls `flushDirtyFiles()` which is async, but the cleanup function runs synchronously during unmount. The returned Promise is not awaited, and in a tab-close scenario, the browser will not wait for the Promise to resolve. This means dirty files may not be saved before the component unmounts, potentially causing data loss. Additionally, the `flushDirtyFiles` dependency is omitted from the effect's dependency array (with an eslint-disable comment), which could cause a stale closure where the function references outdated state.  
- **Evidence**:  
  ```tsx
  useEffect(() => {
    return () => {
      const dirtyIds = useEditorStore.getState().dirtyFileIds;
      if (dirtyIds.size > 0) {
        flushDirtyFiles();  // async — but cleanup is synchronous
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  ```  
- **Research**: "Race conditions with asynchronous operations in useEffect are a common source of bugs." React's cleanup runs synchronously, and any async work initiated in cleanup may not complete. The recommended approach is to use `beforeunload` events for critical saves. See: [Medium — Race conditions in useEffect with async](https://medium.com/@sureshdotariya/race-conditions-in-useeffect-with-async-modern-patterns-for-reactjs-2025-9efe12d727b0), [Max Rozen — Fixing Race Conditions in React](https://maxrozen.com/race-conditions-fetching-data-react-with-useeffect).  
- **Fix Recommendation**: Add a `beforeunload` listener for critical save scenarios and remove the unreliable unmount cleanup:  
  ```tsx
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const dirtyIds = useEditorStore.getState().dirtyFileIds;
      if (dirtyIds.size > 0) {
        e.preventDefault();
        // Attempt synchronous save
        saveAllDirtyFiles();
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);
  ```

---

### Issue #7 — `cursorPositions` Selector Causes Excessive Re-renders

- **Severity**: High  
- **Category**: Re-render  
- **Location**: `src/components/StatusBar/StatusBar.tsx:156`  
- **Description**: The StatusBar subscribes to the entire `cursorPositions` object: `useEditorStore((s) => s.cursorPositions)`. When any file's cursor position changes (which happens on every cursor move in the editor), a new `cursorPositions` object is created by immer, causing the StatusBar to re-render even if the active file's cursor didn't change. Since cursor position updates are extremely frequent (every key press, click, or selection change in the editor), this causes excessive StatusBar re-renders.  
- **Evidence**:  
  ```tsx
  // StatusBar.tsx:156
  const cursorPositions = useEditorStore((s) => s.cursorPositions);
  // ...
  const cursor = activeFileId
    ? cursorPositions[activeFileId] ?? { line: 1, column: 1 }
    : { line: 1, column: 1 };
  ```  
- **Research**: Zustand selectors should select only the specific data a component needs. "When picking state from a Zustand store, you have to take into account how does that affect components re-rendering. If the slice you select returns a new reference, the component re-renders." — [Medium — Zustand DOs and DON'Ts](https://medium.com/@nfailla93/zustand-in-react-dos-and-donts-5a608c26c68).  
- **Fix Recommendation**: Select only the active file's cursor position:  
  ```tsx
  const cursor = useEditorStore(
    (s) => activeFileId
      ? s.cursorPositions[activeFileId] ?? { line: 1, column: 1 }
      : { line: 1, column: 1 }
  );
  ```
  Note: This requires `useShallow` or a custom equality function since `{ line, column }` objects would be new references each time. With immer, the same position object retains its reference, so this should work correctly.

---

### Issue #8 — `any` Type on CodeMirror ViewUpdate

- **Severity**: High  
- **Category**: Type Safety  
- **Location**: `src/components/Editor/CodeEditor.tsx:59`  
- **Description**: The `handleUpdate` callback parameter is typed as `any`, bypassing all TypeScript safety. This makes it impossible to catch property access errors on the `viewUpdate` object and hides potential runtime errors.  
- **Evidence**:  
  ```tsx
  const handleUpdate = useCallback(
    (viewUpdate: any) => {
      if (viewUpdate.selectionSet && activeFileId) {
        const pos = viewUpdate.state.selection.main.head;
        const line = viewUpdate.state.doc.lineAt(pos);
        // ...
      }
    },
    [activeFileId, setCursorPosition],
  );
  ```  
- **Research**: CodeMirror 6 provides `ViewUpdate` type from `@codemirror/view`. Using `any` disables all TypeScript benefits for this callback. See: [CodeMirror 6 TypeScript API](https://codemirror.net/docs/ref/#view.ViewUpdate).  
- **Fix Recommendation**: Import and use the proper type:  
  ```tsx
  import type { ViewUpdate } from '@codemirror/view';
  
  const handleUpdate = useCallback(
    (viewUpdate: ViewUpdate) => { /* ... */ },
    [activeFileId, setCursorPosition],
  );
  ```

---

### Issue #9 — Seven `catch (err: any)` Error Handlers

- **Severity**: High  
- **Category**: Type Safety  
- **Location**: `useProjects.ts:93,113,141`, `useFileTree.ts:123,159,178`, `ProjectList.tsx:208`  
- **Description**: Seven catch blocks use `err: any` type, bypassing TypeScript's error type checking. This forces unsafe property access like `err?.message` without compile-time verification. While JavaScript errors are indeed `unknown` by default in strict TypeScript, the proper pattern is to use `unknown` and narrow the type.  
- **Evidence**:  
  ```tsx
  // useProjects.ts:93
  catch (err: any) {
    setError(err?.message ?? 'Failed to create project');
  }
  
  // useFileTree.ts:123
  catch (err: any) {
    const msg = err?.message ?? 'Failed to create file';
  }
  ```  
- **Research**: TypeScript 4.4+ defaults catch variables to `unknown` with `useUnknownInCatchVariables`. The recommended pattern is to use `unknown` and narrow with type guards. See: [TypeScript 4.4 release notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-4.html#useunknownincatchvariables).  
- **Fix Recommendation**: Use `unknown` with proper narrowing:  
  ```tsx
  catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create project';
    setError(message);
  }
  ```

---

### Issue #10 — Non-null Assertion on `activeProjectId`

- **Severity**: High  
- **Category**: Type Safety  
- **Location**: `src/components/Sidebar/useFileTree.ts:149`  
- **Description**: The `!` non-null assertion on `activeProjectId!` bypasses TypeScript's null check. The `activeProjectId` is `string | null`, and the assertion tells TypeScript it's definitely a string, but this is only implicitly guaranteed by the calling context. If the hook is ever called without an active project, this would pass `null` to `getFileByName`.  
- **Evidence**:  
  ```tsx
  const existing = await getFileByName(activeProjectId!, trimmed);
  ```  
- **Research**: Non-null assertions are a known TypeScript anti-pattern that bypasses the type system's safety guarantees. "The `!` non-null assertion operator removes null and undefined from a type without doing any explicit check. Use it only when you know the value can't be null." — [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/2/narrowing.html).  
- **Fix Recommendation**: Add an explicit guard:  
  ```tsx
  if (!activeProjectId) {
    setError('No active project');
    return false;
  }
  const existing = await getFileByName(activeProjectId, trimmed);
  ```

---

### Issue #11 — `handleExportZip` Not Memoized

- **Severity**: Medium  
- **Category**: Re-render  
- **Location**: `src/App.tsx:111-116`  
- **Description**: The `handleExportZip` async function is defined inside the component body without `useCallback`, causing it to be recreated on every render. While this doesn't cause performance issues for the button itself (DOM buttons aren't memoized), it's inconsistent with the `handleRun` and `handleStop` callbacks which are properly memoized with `useCallback`.  
- **Evidence**:  
  ```tsx
  const handleExportZip = async () => {
    if (!activeProjectId) return;
    const project = await getProject(activeProjectId);
    if (!project) return;
    await exportProjectToZip(project.id, project.name);
  };
  ```  
- **Research**: React's documentation recommends `useCallback` for functions passed as props to memoized child components. For inline handlers on DOM elements, it's less critical but still a best practice for consistency. See: [React docs — useCallback](https://react.dev/reference/react/useCallback).  
- **Fix Recommendation**:  
  ```tsx
  const handleExportZip = useCallback(async () => {
    if (!activeProjectId) return;
    const project = await getProject(activeProjectId);
    if (!project) return;
    await exportProjectToZip(project.id, project.name);
  }, [activeProjectId]);
  ```

---

### Issue #12 — `handleCloseProject` Not Memoized

- **Severity**: Medium  
- **Category**: Re-render  
- **Location**: `src/App.tsx:118-122`  
- **Description**: The `handleCloseProject` function is defined inline without `useCallback`. It also calls `useProjectStore.setState()` directly (see Issue #4). The function is used as an `onClick` handler on the brand text, so while it doesn't cause child re-renders, it's inconsistent with the other handlers.  
- **Evidence**:  
  ```tsx
  const handleCloseProject = () => {
    closeAllFiles();
    editorClearAll();
    useProjectStore.setState({ activeProjectId: null });
  };
  ```  
- **Research**: Same as Issue #11.  
- **Fix Recommendation**: Wrap in `useCallback` and use a store action (see Issue #4 fix).  

---

### Issue #13 — Module-Level Mutable `fileMetaCache` in TabBar

- **Severity**: Medium  
- **Category**: Component Design  
- **Location**: `src/components/Tabs/TabBar.tsx:167`  
- **Description**: A `Map` cache is declared at module scope (`const fileMetaCache = new Map<...>()`). This cache: (1) Is not reactive — when a file is renamed in `FileTree`, the cache still holds the old name, so `TabBar` shows stale file names; (2) Persists across component mounts/unmounts, potentially holding stale data for deleted files; (3) Never gets cleared when the user switches projects, so file IDs from a previous project could collide with a new project's IDs.  
- **Evidence**:  
  ```tsx
  // TabBar.tsx:167
  const fileMetaCache = new Map<string, { name: string; language: LanguageId }>();

  // TabBar.tsx:178-193 — populates cache but doesn't trigger re-render
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
  ```  
- **Research**: Module-level mutable state in React components is an anti-pattern because it's not part of React's rendering model. State changes to module-level variables don't trigger re-renders. See: [React docs — State and Lifecycle](https://react.dev/learn/state-as-a-snapshot).  
- **Fix Recommendation**: Replace with React state or use `useLiveQuery` from Dexie:  
  ```tsx
  const [fileMetas, setFileMetas] = useState<Map<string, { name: string; language: LanguageId }>>(new Map());

  useEffect(() => {
    // Fetch all file metadata and update state
    Promise.all(openFileIds.map(id => getFile(id))).then((files) => {
      const newMetas = new Map(fileMetas);
      for (const file of files) {
        if (file) newMetas.set(file.id, { name: file.name, language: file.language });
      }
      setFileMetas(newMetas);
    });
  }, [openFileIds]);
  ```

---

### Issue #14 — Module-Level Mutable `cachedFileMeta` in StatusBar

- **Severity**: Medium  
- **Category**: Component Design  
- **Location**: `src/components/StatusBar/StatusBar.tsx:46-50`  
- **Description**: A module-level `cachedFileMeta` variable stores the last-fetched file metadata. Similar to Issue #13, this cache is not reactive — if a file is renamed, the StatusBar continues to show the old language until the active file changes. Additionally, this variable is shared across all instances of the StatusBar component (though there's currently only one), which could cause issues if the component were ever duplicated.  
- **Evidence**:  
  ```tsx
  let cachedFileMeta: {
    fileId: string;
    name: string;
    language: LanguageId;
  } | null = null;
  ```  
- **Research**: Same as Issue #13.  
- **Fix Recommendation**: Move the cache into the component as `useRef` or use Dexie's `useLiveQuery` for reactive data.  

---

### Issue #15 — Async Cache Population Without Cleanup (Race Condition)

- **Severity**: Medium  
- **Category**: Hook Issue  
- **Location**: `src/components/Tabs/TabBar.tsx:178-193`  
- **Description**: The `useEffect` that populates `fileMetaCache` fires off multiple async `getFile()` calls without any cleanup or cancellation. If `openFileIds` changes rapidly (e.g., closing many tabs at once), the previous promises may still resolve and write stale data to the cache. There's also no error handling for failed `getFile` calls.  
- **Evidence**:  
  ```tsx
  useEffect(() => {
    for (const fileId of openFileIds) {
      if (!fileMetaCache.has(fileId)) {
        getFile(fileId).then((file) => {  // No cleanup/cancellation
          if (file) {
            fileMetaCache.set(fileId, ...);
            const currentContent = useEditorStore.getState().getContent(fileId);
            if (currentContent === undefined) {
              loadContent(fileId, file.content);
            }
          }
        });
      }
    }
  }, [openFileIds, loadContent]);
  ```  
- **Research**: React's useEffect cleanup should cancel pending async operations to avoid race conditions. "When fetching data in useEffect, you should clean up the effect to avoid race conditions." — [React docs — Synchronizing with Effects](https://react.dev/learn/synchronizing-with-effects).  
- **Fix Recommendation**: Add an `ignore` flag in the cleanup:  
  ```tsx
  useEffect(() => {
    let cancelled = false;
    Promise.all(openFileIds.map(id => getFile(id))).then((files) => {
      if (cancelled) return;
      for (const file of files) {
        if (file) { /* update cache/state */ }
      }
    });
    return () => { cancelled = true; };
  }, [openFileIds, loadContent]);
  ```

---

### Issue #16 — Function Call in useEffect Dependency Array

- **Severity**: Medium  
- **Category**: Effect Issue  
- **Location**: `src/components/Preview/PreviewFrame.tsx:201`  
- **Description**: The dependency array includes `getContent(activeFileId ?? '')` — a function call evaluated during render. This is non-standard and confusing because: (1) It's evaluated at render time, not tracked by React's dependency system; (2) Since `getContent` is a stable function reference (Issue #2), the component never re-renders to re-evaluate this expression, making the dependency inert; (3) It reads store state during render, which is fragile.  
- **Evidence**:  
  ```tsx
  }, [activeFileId, activeBottomTab, updatePreview, getContent(activeFileId ?? '')]);
  ```  
- **Research**: React's dependency arrays should contain values (not function calls) that the effect depends on. The React team recommends against computed values in dependency arrays. See: [React docs — Removing Effect Dependencies](https://react.dev/learn/removing-effect-dependencies).  
- **Fix Recommendation**: Replace with a proper subscription (see Issue #2 fix):  
  ```tsx
  const activeFileContent = useEditorStore((s) =>
    activeFileId ? s.fileContents[activeFileId] : undefined
  );
  // Then use activeFileContent as the dependency
  ```

---

### Issue #17 — Type Assertion `e as any` in FileTree

- **Severity**: Medium  
- **Category**: Type Safety  
- **Location**: `src/components/Sidebar/FileTree.tsx:339`  
- **Description**: The "more actions" button handler casts the `React.MouseEvent` to `any` to pass it to `handleContextMenu`, which expects a `React.MouseEvent`. This is because the button's `onClick` provides a `React.MouseEvent<HTMLButtonElement>` while `handleContextMenu` expects `React.MouseEvent`. The `as any` bypasses TypeScript's structural typing which would normally allow this assignment.  
- **Evidence**:  
  ```tsx
  onClick={(e) => {
    e.stopPropagation();
    handleContextMenu(e as any, file);  // unnecessary type assertion
  }}
  ```  
- **Research**: TypeScript's structural type system should allow `React.MouseEvent<HTMLButtonElement>` to be passed where `React.MouseEvent` is expected (it's a subtype). The `as any` is likely unnecessary. See: [TypeScript Handbook — Type Compatibility](https://www.typescriptlang.org/docs/handbook/type-compatibility.html).  
- **Fix Recommendation**: Change `handleContextMenu` to accept the correct event type or remove the assertion:  
  ```tsx
  onClick={(e) => {
    e.stopPropagation();
    handleContextMenu(e as React.MouseEvent, file);
  }}
  ```

---

### Issue #18 — Inline Style Objects Recreated Every Render

- **Severity**: Low  
- **Category**: Re-render  
- **Location**: `src/App.tsx:183,186,197`  
- **Description**: Multiple inline `style={{ ... }}` objects are created in JSX, generating new object references on every render. While React's diffing algorithm handles this efficiently for DOM elements, it's still an anti-pattern that can be avoided by extracting styles to constants or CSS classes.  
- **Evidence**:  
  ```tsx
  style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}
  style={{ display: 'flex', alignItems: 'center', gap: 8 }}
  style={{ display: 'flex', alignItems: 'center', gap: 6 }}
  style={{ cursor: 'pointer' }}
  style={{ color: 'var(--text-muted)', fontSize: 12 }}
  style={{ fontSize: 11, marginLeft: 4 }}
  ```  
- **Research**: Inline styles create new objects on every render. While not a performance bottleneck for DOM elements, it's a code quality issue. See: [React docs — Inline Styles](https://react.dev/reference/react-dom/components/common#applying-css-styles).  
- **Fix Recommendation**: Move static styles to CSS classes or extract as constants:  
  ```tsx
  const APP_ROOT_STYLE = { height: '100vh', display: 'flex', flexDirection: 'column' } as const;
  ```

---

## Summary Statistics

| Category | Critical | High | Medium | Low | Total |
|----------|----------|------|--------|-----|-------|
| Re-render | 1 | 1 | 2 | 1 | 5 |
| Hook Issue | 0 | 1 | 1 | 0 | 2 |
| Zustand Anti-pattern | 2 | 1 | 0 | 0 | 3 |
| React Key | 0 | 0 | 0 | 0 | 0 |
| Effect Issue | 0 | 0 | 1 | 0 | 1 |
| Type Safety | 0 | 3 | 1 | 0 | 4 |
| Component Design | 0 | 1 | 2 | 0 | 3 |
| **Total** | **3** | **7** | **7** | **1** | **18** |

---

## Priority Remediation Plan

### Phase 1 — Fix Critical Issues (Immediate)
1. **Issue #1**: Replace `isDirty`/`getContent`/`dirtyCount` function selectors with reactive subscriptions to `dirtyFileIds` and `fileContents`
2. **Issue #2**: Fix `PreviewFrame` to subscribe to `fileContents[activeFileId]` instead of `getContent`
3. **Issue #3**: Fix `deleteProject` double-update — use single `setState` or store action

### Phase 2 — Fix High Issues (This Sprint)
4. **Issue #4**: Replace all `useProjectStore.setState()` with proper store actions
5. **Issue #5**: Add error boundaries around `CodeEditor`, `ConsoleOutput`, `PreviewFrame`
6. **Issue #6**: Replace unmount cleanup with `beforeunload` listener
7. **Issue #7**: Narrow `cursorPositions` selector to active file only
8. **Issues #8-10**: Fix `any` types and non-null assertions

### Phase 3 — Fix Medium Issues (Next Sprint)
9. **Issues #11-12**: Memoize `handleExportZip` and `handleCloseProject`
10. **Issues #13-14**: Replace module-level caches with reactive state
11. **Issue #15**: Add cleanup to async cache population effect
12. **Issue #16**: Fix PreviewFrame dependency array pattern
13. **Issue #17**: Remove `as any` type assertion

---

## Appendix: Key Architectural Observations

### Positive Patterns Found
- Proper use of Zustand selector slicing (e.g., `useUIStore((s) => s.sidebarOpen)`)
- `useKeyboardShortcuts` correctly uses `getState()` inside non-React event handlers (appropriate usage)
- `useAutoSave` correctly uses `getState()` inside async callbacks (appropriate usage)
- `IDESkeleton` loading state is properly cleaned up with timer
- `ConsoleOutput` auto-scroll implementation is well-designed
- File tree keyboard navigation is thorough and accessible

### Systemic Concern
The root cause of Issues #1, #2, and #7 is the **pattern of storing accessor functions in Zustand state**. The `editorStore` uses `isDirty`, `getContent`, and `dirtyCount` as state properties, which defeats Zustand's reactivity model. The store should be refactored to expose raw data, and components should derive computed values at the selector level or in render.
