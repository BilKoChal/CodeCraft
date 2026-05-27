# CodeCraft — Bug & Bad Code Analysis Summary

**Analysis Date**: 2026-05-28  
**Scope**: Full codebase analysis for bugs, security vulnerabilities, and anti-patterns  
**Analysts**: 3 parallel sub-agents (Architecture/Logic, Security/Data Integrity, React/State)  
**Reports**: 3 OGF reports with 45 total findings (after deduplication: 27 unique issues)

---

## Executive Summary

A comprehensive analysis of the CodeCraft browser-based code editor identified **27 unique issues** across 8 categories, with severity ranging from Critical to Low. The most impactful findings are: a **Critical XSS vulnerability** in the "Open in New Tab" feature that gives user code same-origin access to all app data; **Zustand store function selectors** that silently break reactivity for dirty indicators and live preview; a **hardcoded JavaScript language** in the editor that prevents syntax highlighting for non-JS files; and **multiple data loss scenarios** due to missing `beforeunload` handling and unreliable async cleanup.

**Critical**: 4 issues | **High**: 10 issues | **Medium**: 10 issues | **Low**: 3 issues

---

## Top 5 Priority Fixes

| # | Issue | Severity | Impact | Fix Effort |
|---|-------|----------|--------|------------|
| 1 | SEC-01: Blob URL same-origin XSS via "Open in New Tab" | Critical | User code can steal/destroy all IndexedDB data | Medium |
| 2 | BUG-01 + RS#1: Zustand `Set<string>` + function selectors break reactivity | Critical | Dirty indicators, live preview, status bar show stale data | Medium |
| 3 | BUG-02: Hardcoded `language = 'javascript'` in CodeEditor | High | No syntax highlighting for TS/HTML/CSS/JSON/MD files | Low |
| 4 | BUG-14 + SEC-04: No `beforeunload` handler | High | Users lose unsaved work when closing browser tab | Low |
| 5 | BUG-04: Double-delete race in `deleteProject` | High | Files deleted twice; orphaned project on partial failure | Low |

---

## Consolidated Findings (Deduplicated)

### Critical Issues (4)

| ID | Category | Location | Title |
|----|----------|----------|-------|
| SEC-01 | XSS | PreviewFrame.tsx:212-218 | Blob URL same-origin XSS via "Open in New Tab" — user code gets full access to IndexedDB |
| BUG-01 | Data Integrity | editorStore.ts | `Set<string>` for `dirtyFileIds` — O(n) on every keystroke, breaks with persist middleware |
| RS-#1 | Zustand Anti-pattern | editorStore.ts / TabBar / StatusBar | Store function selectors (`isDirty`, `getContent`, `dirtyCount`) never trigger re-renders |
| RS-#2 | Re-render | PreviewFrame.tsx:150,201 | `getContent` selector stable reference — live preview never updates on content change |

### High Issues (10)

| ID | Category | Location | Title |
|----|----------|----------|-------|
| BUG-02 | Logic Bug | CodeEditor.tsx:39 | Hardcoded `language = 'javascript'` — no syntax highlighting for non-JS files |
| BUG-03 | Data Integrity | useFileTree.ts | Silent data loss when closing tabs with unsaved changes |
| BUG-04 | Logic Bug | useProjects.ts:122-147 | Double-delete race condition — `deleteFilesByProject()` + `dbDeleteProject()` cascade |
| BUG-05 | Architecture | TabBar.tsx:167 | Module-level `fileMetaCache` never invalidated, no re-render on populate |
| BUG-07 | Data Integrity | useAutoSave.ts:178-190 | Async cleanup cannot guarantee save on unmount |
| BUG-14 | Data Integrity | App-wide | No `beforeunload` handler — tab close loses unsaved work |
| SEC-02 | Sandbox Escape | jsRunner.ts:50-54 | Incomplete global deletion — WebSocket, EventSource, Worker not blocked |
| SEC-03 | Sandbox Escape | jsRunner.ts:52-54 | `delete self.X` may not remove prototype-inherited globals |
| SEC-05 | XSS | PreviewFrame.tsx:258-263 | User JS can break out of `<script>` via `</script>` injection |
| RS-#4 | Zustand Anti-pattern | App.tsx:121, useProjects.ts:137,165 | `useProjectStore.setState()` bypasses immer actions |
| RS-#5 | Component Design | App.tsx | No error boundaries — any render crash = white screen |
| RS-#7 | Re-render | StatusBar.tsx:156 | `cursorPositions` over-selects — StatusBar re-renders on every cursor move in any file |

### Medium Issues (10)

| ID | Category | Location | Title |
|----|----------|----------|-------|
| BUG-06 | Architecture | StatusBar.tsx:46-84 | Module-level cache `cachedFileMeta` never cleared; `clearFileMetaCache()` never called |
| BUG-08 | Race Condition | useAutoSave.ts:144-174 | Async debounce scheduling races with synchronous cleanup |
| BUG-09 | Data Integrity | PreviewFrame.tsx | Preview uses stale IndexedDB content for non-active files |
| BUG-10 | Anti-pattern | PreviewFrame.tsx:201 | Function call `getContent(...)` in useEffect dependency array |
| BUG-11 | Performance | editorStore.ts / StatusBar.tsx | `get()` selectors don't optimize re-renders |
| BUG-13 | Logic Bug | useProjects.ts:135-137 | `setActiveProject('')` creates invalid intermediate state |
| BUG-15 | Architecture | CodeEditor.tsx | Controlled value prop conflicts with manual dispatch for file switching |
| SEC-06 | Input Validation | zipImport.ts:37-93 | No ZIP size/bomb protection — memory exhaustion possible |
| SEC-07 | Input Validation | useFileTree.ts | Weak filename validation — allows special chars, long names, null bytes |
| SEC-08 | CSP | index.html, vite.config.ts | No Content Security Policy configured |
| SEC-09 | Data Loss | files.ts, projects.ts | No IndexedDB transaction error recovery — silent data loss on quota exceeded |
| SEC-10 | Data Integrity | db/queries/* | No multi-tab write conflict detection |
| RS-#8 | Type Safety | CodeEditor.tsx:59 | `viewUpdate: any` bypasses type safety |
| RS-#9 | Type Safety | Multiple files | 7 `catch (err: any)` error handlers |
| RS-#10 | Type Safety | useFileTree.ts:149 | `activeProjectId!` non-null assertion bypasses null safety |

### Low Issues (3)

| ID | Category | Location | Title |
|----|----------|----------|-------|
| BUG-12 | Memory Leak | main.tsx:54 | PWA `setInterval` never cleared |
| SEC-11 | Dependency | id.ts:16-20 | `Math.random()` UUID fallback is predictable |
| RS-#18 | Re-render | App.tsx | Inline style objects recreated every render |

---

## Positive Findings

1. **Iframe sandboxing is correct**: `sandbox="allow-scripts"` without `allow-same-origin` properly isolates the preview iframe
2. **Console output is safe**: React text rendering prevents HTML injection through console output
3. **Cascade delete in transaction**: `deleteProject()` uses a proper Dexie transaction
4. **Auto-save concurrency guard**: `isSavingRef` prevents concurrent save operations
5. **Worker has output limits**: `MAX_OUTPUT_CHARS`, `MAX_ENTRIES`, `MAX_ARG_LENGTH` prevent memory exhaustion
6. **Worker timeout**: 5-second timeout with `worker.terminate()` prevents infinite loops
7. **PWA scope correctly set**: `scope: '/CodeCraft/'` limits the service worker
8. **No known dependency vulnerabilities**: `npm audit` returns 0 vulnerabilities
9. **Keyboard shortcuts well-designed**: `getState()` used correctly in non-React handlers
10. **Auto-scroll implementation** in ConsoleOutput is well-designed

---

## Systemic Root Causes

1. **Zustand function selectors**: Storing accessor functions (`isDirty`, `getContent`, `dirtyCount`) in state defeats Zustand's reactivity model. Components subscribe to stable function references, not changing data. This single pattern causes 3 Critical issues.

2. **Module-level mutable caches**: `fileMetaCache` (TabBar) and `cachedFileMeta` (StatusBar) are module-level variables that don't participate in React's rendering model. Cache updates don't trigger re-renders, and the caches go stale on file rename. Affects 4 issues.

3. **Missing data loss protection**: No `beforeunload` handler, unreliable async cleanup, and no `visibilitychange` flush. The auto-save debounce creates a window where data is at risk. Affects 3 issues.

4. **Incomplete sandbox hardening**: The Web Worker sandbox only blocks 3 out of 8+ network-capable globals, and `delete` may not work on prototype-inherited properties. Affects 2 issues.

---

## Recommended Fix Order

### Phase 1 — Critical (Immediate)
1. Fix SEC-01: Replace Blob URL with `data:text/html` or sandboxed iframe for "Open in New Tab"
2. Fix BUG-01: Replace `Set<string>` with `Record<string, boolean>` in editorStore
3. Fix RS-#1/#2: Replace function selectors with reactive data subscriptions
4. Fix BUG-02: Derive language from file metadata instead of hardcoding

### Phase 2 — High (This Sprint)
5. Fix BUG-14/SEC-04: Add `beforeunload` + `visibilitychange` handlers
6. Fix BUG-04: Remove redundant `deleteFilesByProject()` call
7. Fix SEC-02/03: Complete Worker sandbox — delete WebSocket/EventSource/Worker + use `undefined` assignment
8. Fix SEC-05: Escape `</script>` in user JS before embedding in inline script
9. Fix RS-#3: Single atomic `clearActiveProject` action instead of double-update
10. Fix RS-#4: Add `clearActiveProject` store action, stop using raw `setState`
11. Fix RS-#5: Add error boundaries around CodeEditor, ConsoleOutput, PreviewFrame
12. Fix RS-#7: Narrow `cursorPositions` selector to active file only
13. Fix BUG-03: Check dirty state before closing tabs / deleting files

### Phase 3 — Medium (Next Sprint)
14. Fix BUG-05/06/RS-#13/14: Replace module-level caches with reactive state (`useLiveQuery`)
15. Fix BUG-07/08: Cache debounce delay in ref, add `beforeunload` instead of unmount cleanup
16. Fix BUG-09: Overlay editor store content on IndexedDB files in preview
17. Fix BUG-10/RS-#16: Replace function call in deps with proper reactive subscription
18. Fix BUG-15: Choose controlled OR uncontrolled mode for CodeMirror, not both
19. Fix SEC-06: Add ZIP size limits, entry count limits, file size limits
20. Fix SEC-07: Strengthen filename validation (whitelist + length limit)
21. Fix SEC-08: Add CSP meta tag to index.html
22. Fix SEC-09: Only mark saved after confirmed IndexedDB write
23. Fix SEC-10: Add basic multi-tab conflict detection (BroadcastChannel)
24. Fix RS-#8-10: Replace `any` types and non-null assertions

### Phase 4 — Low (Nice to Have)
25. Fix BUG-12: Replace PWA setInterval with visibilitychange listener
26. Fix SEC-11: Replace Math.random() UUID fallback with crypto.getRandomValues()
27. Fix RS-#18: Extract inline styles to CSS classes or constants

---

## Source Reports

| Report | Analyst | Findings | File |
|--------|---------|----------|------|
| Architecture-Logic-Analysis-1-OGF | Architecture & Logic Analyst | 15 issues | Original-Reports/Architecture-Logic-Analysis-1-OGF.md |
| Security-Data-Integrity-Analysis-2-OGF | Security & Data Integrity Analyst | 12 issues | Original-Reports/Security-Data-Integrity-Analysis-2-OGF.md |
| React-State-Management-Analysis-3-OGF | React & State Management Analyst | 18 issues | Original-Reports/React-State-Management-Analysis-3-OGF.md |

After deduplication (overlapping findings consolidated): **27 unique issues**
