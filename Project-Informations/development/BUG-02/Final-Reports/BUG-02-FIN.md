# BUG-02 Fix — Dynamic Language Detection in CodeEditor

**Task ID**: BUG-02
**Date**: 2026-05-28
**Status**: Complete
**Files Modified**: `src/components/Editor/CodeEditor.tsx`

---

## Problem
The `language` variable was hardcoded to `'javascript'` with a TODO comment. When a user opened a TypeScript, HTML, CSS, JSON, or Markdown file, the editor used JavaScript syntax highlighting instead of the correct one. The file's actual language was stored in IndexedDB (`file.language`) and available, but never used.

## Fix
Replaced the hardcoded language with a `useState` + `useEffect` pattern that fetches file metadata from IndexedDB when the active file changes:

```typescript
// Before (hardcoded)
const language: LanguageId = 'javascript';

// After (dynamic from file metadata)
const [language, setLanguage] = useState<LanguageId>('javascript');

useEffect(() => {
  if (!activeFileId) {
    setLanguage('javascript');
    return;
  }

  let cancelled = false;
  getFile(activeFileId).then((file) => {
    if (!cancelled && file) {
      setLanguage(file.language);
    }
  });

  return () => { cancelled = true; };
}, [activeFileId]);
```

The `createExtensions(language)` call already supports all language IDs via the `getLanguageExtension()` function in `extensions.ts`, so TypeScript, HTML, CSS, etc. now get proper syntax highlighting automatically.

## Verification
- TypeScript: passes
- Build: succeeds
- Opening a `.ts` file now shows TypeScript syntax highlighting
- Opening a `.html` file now shows HTML syntax highlighting
