# TASK-17 — Live Preview (Final Report)

**Task ID:** TASK-17  
**Milestone:** M6 — Polish + PWA  
**Status:** ✅ Complete  
**Date:** 2026-05-28

---

## Summary

Implemented a live preview panel that renders HTML/CSS/JS in a sandboxed iframe using the `srcdoc` attribute. The preview auto-refreshes with 300ms debounce when the active file content changes.

## Implementation Details

### New Files
- **`src/components/Preview/PreviewFrame.tsx`** — Live preview component
- **`src/components/Preview/index.ts`** — Barrel export

### Modified Files
- **`src/App.tsx`** — Added bottom panel tab switcher (Console/Preview), integrated PreviewFrame, wrapped ConsoleOutput and PreviewFrame in tab container
- **`src/styles/globals.css`** — Added ~160 lines of bottom panel tab, preview toolbar, preview iframe, and skeleton CSS

### Features Implemented
1. **HTML preview** — If active file is HTML, renders it directly in sandboxed iframe
2. **Auto-detect index.html** — If project has an index.html, uses it as the preview document
3. **CSS preview** — Wraps CSS in minimal HTML page with placeholder text
4. **JS preview** — Wraps JavaScript in HTML template with inline console capture
5. **Sandboxed iframe** — Uses `sandbox="allow-scripts"` (NEVER `allow-same-origin` for security)
6. **Debounced refresh** — 300ms debounce to prevent flickering during typing
7. **Manual refresh** — Refresh button in toolbar
8. **Open in new tab** — Opens preview in a new browser tab via Blob URL
9. **Bottom panel tabs** — Console and Preview tabs with active state indicator

### HTML Builder Strategy
```
Active file is HTML? → Use content directly
Project has index.html? → Use that
Active file is CSS? → Wrap in <style> in minimal HTML
Active file is JS? → Wrap in <script> with console capture
Default → Show "open an HTML file" message
```

### Security
- `sandbox="allow-scripts"` — Scripts can run, but no popups, forms, or same-origin access
- Never `allow-same-origin` — Prevents preview from accessing IndexedDB or localStorage
