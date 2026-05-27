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
import { detectLanguage } from '../../utils/languageDetection';
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
        const result = (function() { ${activeFileContent} })();
        if (result !== undefined) appendLine('→ ' + JSON.stringify(result));
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
  const getContent = useEditorStore((s) => s.getContent);
  const activeBottomTab = useUIStore((s) => s.activeBottomTab);

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
    const content = getContent(activeFileId) ?? '';
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
  }, [activeProjectId, activeFileId, getContent]);

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
  }, [activeFileId, activeBottomTab, updatePreview, getContent(activeFileId ?? '')]);

  // ─── Manual refresh ──────────────────────────────────────────
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    updatePreview().finally(() => {
      setTimeout(() => setIsRefreshing(false), 300);
    });
  }, [updatePreview]);

  // ─── Open in new tab ─────────────────────────────────────────
  const handleOpenInNewTab = useCallback(() => {
    if (!srcdoc) return;
    const blob = new Blob([srcdoc], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    // Revoke after a delay to allow the new tab to load
    setTimeout(() => URL.revokeObjectURL(url), 5000);
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
            title="Open in new tab"
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
          srcdoc={srcdoc}
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
