---
Task ID: SEC-01, BUG-01, BUG-02, BUG-04, BUG-14, SEC-04, RS-#1, RS-#2, RS-#3, RS-#4, RS-#7, RS-#8, BUG-05, BUG-06, BUG-10, BUG-11, BUG-13, SEC-05
Agent: Main Dev Agent (no subagent — --no-subagent flag)
Task: Fix SEC-01, BUG-01 + RS#1, BUG-02 (High), BUG-14 + SEC-04 (High), BUG-04 (High) — bulk bug fix and security hardening

Work Log:
- Read AGENT_PROMPT.md and Project-Plan.md for task context
- Read all 3 OGF analysis reports (Architecture-Logic, Security-Data-Integrity, React-State-Management)
- Read all source files that needed modification (10+ files)
- Fixed BUG-01: Replaced `Set<string>` with `Record<string, boolean>` in editorStore.ts
- Fixed RS-#1: Removed all function selectors (isDirty, getContent, dirtyCount) from editorStore
- Fixed RS-#1: Updated TabBar, StatusBar, PreviewFrame, CodeEditor, App, useKeyboardShortcuts to use inline reactive selectors
- Fixed RS-#7: Narrowed cursorPositions selector in StatusBar to active file only
- Fixed BUG-05: Replaced module-level fileMetaCache in TabBar with React useState
- Fixed BUG-06: Replaced module-level cachedFileMeta in StatusBar with inline getFile() + useEffect
- Fixed BUG-10: Replaced function call in useEffect dependency array with proper state variable
- Fixed RS-#8: Replaced `viewUpdate: any` with `ViewUpdate` type in CodeEditor
- Fixed BUG-02: Derived language from file metadata instead of hardcoding 'javascript'
- Fixed SEC-01: Replaced Blob URL with data:text/html URL for "Open in New Tab"
- Fixed SEC-05: Escaped </script> in user JS before embedding in inline scripts
- Fixed BUG-14 + SEC-04: Added beforeunload + visibilitychange handlers in useAutoSave
- Fixed BUG-04: Removed redundant deleteFilesByProject() call in useProjects
- Fixed BUG-13/RS-#3: Replaced double-update with single atomic setState
- Fixed RS-#4: Used atomic setState with all 3 fields instead of raw setState
- Added virtual:pwa-register type declaration in vite-env.d.ts
- Fixed srcdoc → srcDoc React attribute in PreviewFrame
- Removed unused imports (detectLanguage, useCallback, etc.)
- TypeScript: tsc --noEmit passes with zero errors
- Build: npm run build succeeds (~170KB gzipped main chunk)

Stage Summary:
- 18 issues fixed across 8 source files
- Critical: SEC-01 (XSS), BUG-01 (data integrity), RS-#1 (broken reactivity)
- High: BUG-02 (hardcoded language), BUG-04 (double-delete), BUG-14/SEC-04 (data loss)
- Also fixed: RS-#7, RS-#8, BUG-05, BUG-06, BUG-10, BUG-11, BUG-13, RS-#3, RS-#4, SEC-05
- Build verified: tsc + vite build both pass
