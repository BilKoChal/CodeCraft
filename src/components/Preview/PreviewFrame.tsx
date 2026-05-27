/**
 * CodeCraft — PreviewFrame Component
 *
 * Live preview panel that renders HTML/CSS/JS in a sandboxed iframe
 * using the srcdoc attribute. The preview auto-refreshes when the
 * active HTML file changes, with a configurable debounce delay.
 *
 * Security:
 * - Uses sandbox attribute with restricted permissions
 * - NEVER allows same-origin (prevents access to parent IndexedDB)
 * - Allows scripts for JS execution, but no popups/modals/forms
 *
 * SEC-01 FIX: "Open in New Tab" now uses a data: URL instead of a Blob URL.
 * Blob URLs inherit the creating page's origin, giving user code full
 * same-origin access to IndexedDB, localStorage, etc. Data URLs have an
 * opaque/null origin, so user code in the new tab cannot access app data.
 *
 * SEC-05 FIX: User JS content embedded in inline <script> tags is now
 * escaped to prevent </script> injection that could break out of the
 * script context and execute arbitrary HTML.
 *
 * RS-#1 / BUG-10 FIX: Replaced `getContent` function selector with a
 * direct subscription to `fileContents[activeFileId]`. The old pattern
 * `useEditorStore(s => s.getContent)` returned a stable function reference
 * that never triggered re-renders, making live preview non-reactive.
 * The function call in the dependency array has also been replaced with
 * the properly subscribed state value.
 *
 * How it works:
 * 1. Detects if the active file is HTML (or if the project has an index.html)
 * 2. Builds an srcdoc HTML string from the file content
 * 3. For JS-only projects, wraps in a minimal HTML template
 * 4. Debounces updates by 300ms to avoid flickering during typing
 *
 * @see Project-Plan.md TASK-17 — Live preview (iframe + srcdoc)
 * @see Code-Runner-Research-3-OGF.md — Live preview research
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { RefreshCw, ExternalLink, Eye } from 'lucide-react';
import { useProjectStore } from '../../stores/projectStore';
import { useEditorStore } from '../../stores/editorStore';
import { useUIStore } from '../../stores/uiStore';
import { getFile, getFilesByProject } from '../../db';
import type { LanguageId, FileEntry } from '../../types';

// ─── Configuration ──────────────────────────────────────────────

/** Debounce delay for preview refresh (ms) */
const PREVIEW_DEBOUNCE_MS = 300;

// ─── HTML Builder ───────────────────────────────────────────────

/**
 * Build an HTML document for the preview iframe.
 *
 * Strategy:
 * - If the active file is HTML, use its content directly
 * - If the project has an index.html, use that
 * - Otherwise, wrap JS code in a minimal HTML template with console capture
 *
 * @param files - All files in the project
 * @param activeFileContent - Content of the currently active file
 * @param activeFileLanguage - Language of the active file
 * @returns Complete HTML string for srcdoc
 */
function buildPreviewHTML(
  files: FileEntry[],
  activeFileContent: string,
  activeFileLanguage: LanguageId,
): string {
  // ─── If active file is HTML, use it as the document ─────────
  if (activeFileLanguage === 'html') {
    return activeFileContent;
  }

  // ─── If project has an index.html, use it ───────────────────
  const indexHtml = files.find(
    (f) => f.name === 'index.html' || f.path === '/index.html',
  );
  if (indexHtml) {
    return indexHtml.content;
  }

  // ─── If active file is CSS, wrap in a minimal HTML page ─────
  if (activeFileLanguage === 'css') {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${activeFileContent}</style>
</head>
<body>
  <p style="color:#888;font-family:sans-serif;padding:20px;">
    CSS preview — Add HTML to index.html for a full preview.
  </p>
</body>
</html>`;
  }

  // ─── If active file is JavaScript, wrap in HTML with console capture ──
  if (activeFileLanguage === 'javascript' || activeFileLanguage === 'typescript') {
    // SEC-05 FIX: Escape </script> in user JS to prevent breaking out of
    // the inline script context. A user writing `</script><script>alert(1)</script>`
    // would otherwise escape the script tag and execute arbitrary HTML.
    const escapedContent = activeFileContent.replace(/<\/script>/gi, '<\\/script>');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: monospace; background: #1e1e2e; color: #cdd6f4; margin: 16px; }
    .preview-output { white-space: pre-wrap; font-size: 13px; line-height: 1.6; }
    .preview-error { color: #f38ba8; }
    .preview-warn { color: #f9e2af; }
  </style>
</head>
<body>
  <div class="preview-output" id="output"></div>
  <script>
    (function() {
      const output = document.getElementById('output');
      function appendLine(text, className) {
        const div = document.createElement('div');
        div.className = className || '';
        div.textContent = typeof text === 'object' ? JSON.stringify(text, null, 2) : String(text);
        output.appendChild(div);
      }
      const console = {
        log: (...args) => args.forEach(a => appendLine(a)),
        warn: (...args) => args.forEach(a => appendLine(a, 'preview-warn')),
        error: (...args) => args.forEach(a => appendLine(a, 'preview-error')),
        info: (...args) => args.forEach(a => appendLine(a)),
      };
      try {
        const result = (function() { ${escapedContent} })();
        if (result !== undefined) appendLine('\\u2192 ' + JSON.stringify(result));
      } catch(e) {
        appendLine('Error: ' + e.message, 'preview-error');
      }
    })();
  </script>
</body>
</html>`;
  }

  // ─── Default: Show a message ────────────────────────────────
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: sans-serif; background: #1e1e2e; color: #585b70; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
  </style>
</head>
<body>
  <p>Open an HTML file to see a live preview, or add an index.html to your project.</p>
</body>
</html>`;
}

// ─── PreviewFrame Component ─────────────────────────────────────

export function PreviewFrame() {
  const activeProjectId = useProjectStore((s) => s.activeProjectId);
  const activeFileId = useProjectStore((s) => s.activeFileId);
  const activeBottomTab = useUIStore((s) => s.activeBottomTab);

  // RS-#1 FIX: Subscribe to the active file's content directly instead of
  // using the `getContent` function selector. The old pattern
  // `useEditorStore(s => s.getContent)` returned a stable function ref
  // that never triggered re-renders when content changed.
  const activeFileContent = useEditorStore(
    (s) => activeFileId ? s.fileContents[activeFileId] : undefined,
  );

  const [srcdoc, setSrcdoc] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─── Build preview HTML when active file changes ──────────────
  const updatePreview = useCallback(async () => {
    if (!activeProjectId || !activeFileId) {
      setSrcdoc('');
      return;
    }

    // Get the active file content
    const content = activeFileContent ?? '';
    if (!content.trim()) {
      setSrcdoc('');
      return;
    }

    // Detect language from file metadata
    const file = await getFile(activeFileId);
    const language: LanguageId = file?.language ?? 'plaintext';

    // Get all project files for building the preview
    const files = await getFilesByProject(activeProjectId);

    // Build the preview HTML
    const html = buildPreviewHTML(files, content, language);
    setSrcdoc(html);
  }, [activeProjectId, activeFileId, activeFileContent]);

  // ─── Debounced update ───────────────────────────────────────
  useEffect(() => {
    if (activeBottomTab !== 'preview') return;

    if (debounceRef.current !== null) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      updatePreview();
    }, PREVIEW_DEBOUNCE_MS);

    return () => {
      if (debounceRef.current !== null) {
        clearTimeout(debounceRef.current);
      }
    };
  // BUG-10 FIX: Replaced `getContent(activeFileId ?? '')` function call in
  // the dependency array with `activeFileContent`, which is a properly
  // subscribed state value. Function calls in dependency arrays are
  // non-standard and don't participate in React's reactivity system.
  }, [activeFileId, activeBottomTab, updatePreview, activeFileContent]);

  // ─── Manual refresh ──────────────────────────────────────────
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    updatePreview().finally(() => {
      setTimeout(() => setIsRefreshing(false), 300);
    });
  }, [updatePreview]);

  // ─── Open in new tab ─────────────────────────────────────────
  // SEC-01 FIX: Replaced Blob URL with data: URL. Blob URLs inherit the
  // creating page's origin, allowing user code in the new tab to access
  // IndexedDB, localStorage, and all app data (same-origin XSS). Data URLs
  // have an opaque/null origin, so the new tab cannot access any app data.
  const handleOpenInNewTab = useCallback(() => {
    if (!srcdoc) return;
    const dataUrl = `data:text/html;charset=utf-8,${encodeURIComponent(srcdoc)}`;
    window.open(dataUrl, '_blank');
  }, [srcdoc]);

  // ─── Don't render if not the active tab ─────────────────────
  if (activeBottomTab !== 'preview') return null;

  return (
    <div className="preview-frame">
      {/* ─── Preview Toolbar ────────────────────────────────── */}
      <div className="preview-toolbar">
        <div className="preview-toolbar-left">
          <Eye size={12} style={{ color: 'var(--text-muted)' }} />
          <span className="preview-toolbar-label">Live Preview</span>
          {isRefreshing && (
            <span className="preview-refresh-indicator">Updating...</span>
          )}
        </div>
        <div className="preview-toolbar-right">
          <button
            className="preview-toolbar-btn"
            onClick={handleRefresh}
            title="Refresh preview"
            aria-label="Refresh preview"
          >
            <RefreshCw size={12} className={isRefreshing ? 'console-spin-icon' : ''} />
          </button>
          <button
            className="preview-toolbar-btn"
            onClick={handleOpenInNewTab}
            title="Open in new tab (sandboxed — no access to app data)"
            aria-label="Open preview in new tab"
          >
            <ExternalLink size={12} />
          </button>
        </div>
      </div>

      {/* ─── Preview Iframe ──────────────────────────────────── */}
      {srcdoc ? (
        <iframe
          ref={iframeRef}
          className="preview-iframe"
          srcDoc={srcdoc}
          title="Live Preview"
          sandbox="allow-scripts"
        />
      ) : (
        <div className="preview-empty">
          <p>Open an HTML file to see a live preview</p>
          <p className="preview-empty-hint">
            Or add an index.html to your project for automatic preview
          </p>
        </div>
      )}
    </div>
  );
}
