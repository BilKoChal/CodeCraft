# SEC-01 + BUG-14 + SEC-04 Fix — Security & Data Loss Protection

**Task ID**: SEC-01, BUG-14, SEC-04
**Date**: 2026-05-28
**Status**: Complete
**Files Modified**: `src/components/Preview/PreviewFrame.tsx`, `src/hooks/useAutoSave.ts`

---

## SEC-01: Blob URL Same-Origin XSS via "Open in New Tab"

### Problem
The "Open in New Tab" feature created a Blob URL from user HTML content and opened it via `window.open()`. Blob URLs inherit the origin of the creating context, meaning the new tab had full same-origin access to IndexedDB, localStorage, cookies, and DOM — completely bypassing the `sandbox="allow-scripts"` protection of the in-page iframe.

### Fix
Replaced Blob URL with `data:text/html;charset=utf-8` URL + `encodeURIComponent()`. Data URLs have a null/opaque origin, so user code in the new tab cannot access any app data.

### Before
```typescript
const blob = new Blob([srcdoc], { type: 'text/html' });
const url = URL.createObjectURL(blob);
window.open(url, '_blank');
setTimeout(() => URL.revokeObjectURL(url), 5000);
```

### After
```typescript
const dataUrl = `data:text/html;charset=utf-8,${encodeURIComponent(srcdoc)}`;
window.open(dataUrl, '_blank');
```

---

## BUG-14 + SEC-04: No beforeunload Handler — Data Lost on Tab Close

### Problem
The application had no `beforeunload` event handler. When users closed the browser tab with unsaved (dirty) changes, their work was silently lost. The auto-save debounce timer may not have fired yet, and the cleanup effect could not guarantee the save completes.

### Fix
1. Added a `beforeunload` handler that warns the user when dirty files exist
2. Added a `visibilitychange` handler that flushes dirty files when the tab becomes hidden (more reliable than unmount cleanup for actually persisting data)

### Implementation
```typescript
// beforeunload: Warn user about unsaved changes
useEffect(() => {
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    const currentDirty = useEditorStore.getState().dirtyFileIds;
    if (Object.keys(currentDirty).length > 0) {
      e.preventDefault();
      e.returnValue = '';
    }
  };
  window.addEventListener('beforeunload', handleBeforeUnload);
  return () => window.removeEventListener('beforeunload', handleBeforeUnload);
}, []);

// visibilitychange: Best-effort save when tab becomes hidden
useEffect(() => {
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'hidden') {
      const currentDirty = useEditorStore.getState().dirtyFileIds;
      if (Object.keys(currentDirty).length > 0) {
        flushDirtyFiles();
      }
    }
  };
  document.addEventListener('visibilitychange', handleVisibilityChange);
  return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
}, [flushDirtyFiles]);
```

---

## Also Fixed (SEC-05): User JS `</script>` Injection

While fixing SEC-01, also escaped `</script>` in user JS content embedded in inline script tags in the preview HTML. This prevents script context breakout where user code containing `</script>` could escape the inline script and execute arbitrary HTML.

```typescript
const escapedContent = activeFileContent.replace(/<\/script>/gi, '<\\/script>');
```

---

## Verification
- TypeScript: `tsc --noEmit` passes with zero errors
- Build: `npm run build` succeeds (513KB gzipped main chunk)
- Manual: Data URLs in new tabs cannot access IndexedDB (opaque origin)
- Manual: Browser shows "unsaved changes" dialog on tab close when files are dirty
