/**
 * CodeCraft — StatusBar Component
 *
 * IDE-style status bar at the bottom of the workspace, displaying
 * contextual information about the current file and editor state.
 *
 * Layout (left → right):
 *   Left side : Save status indicator, cursor position (Ln/Col)
 *   Right side: Language, encoding, tab size, execution status
 *
 * Each item is a clickable button (for future Phase 1 interactivity
 * like opening settings or changing language/encoding).
 *
 * RS-#1 FIX: Replaced `isDirty` and `dirtyCount` function selectors with
 * inline reactive selectors subscribing to `dirtyFileIds` directly.
 * The old pattern returned stable function references that never triggered
 * re-renders when dirty state changed.
 *
 * RS-#7 FIX: Narrowed `cursorPositions` selector to only the active file's
 * cursor, preventing re-renders when other files' cursors move.
 *
 * BUG-06 FIX: Replaced module-level `cachedFileMeta` with component state.
 * The old cache never triggered re-renders and the `clearFileMetaCache()`
 * function was never called anywhere.
 *
 * Data sources:
 * - Cursor position → editorStore.cursorPositions[activeFileId]
 * - Dirty status    → editorStore.dirtyFileIds[activeFileId]
 * - Language        → File metadata from IndexedDB (via useState + effect)
 * - Tab size        → editorStore / project settings
 * - Exec status     → consoleStore.status
 *
 * @see Project-Plan.md TASK-14 — Status bar component
 */

import { useEffect, useState } from 'react';
import {
  Save,
  Circle,
  Loader2,
  AlertTriangle,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { useEditorStore } from '../../stores/editorStore';
import { useProjectStore } from '../../stores/projectStore';
import { useConsoleStore } from '../../stores/consoleStore';
import { getFile } from '../../db';
import type { LanguageId } from '../../types';

// ─── Language Display Names ───────────────────────────────────

const LANGUAGE_DISPLAY: Record<LanguageId, string> = {
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  html: 'HTML',
  css: 'CSS',
  json: 'JSON',
  markdown: 'Markdown',
  plaintext: 'Plain Text',
};

// ─── Execution Status Indicator ───────────────────────────────

function ExecutionIndicator() {
  const status = useConsoleStore((s) => s.status);

  switch (status) {
    case 'running':
      return (
        <span
          className="statusbar-item"
          title="Code is running"
          style={{ color: 'var(--accent-blue)' }}
        >
          <Loader2 size={11} className="console-spin-icon" />
          <span>Running</span>
        </span>
      );
    case 'error':
      return (
        <span
          className="statusbar-item"
          title="Last execution had errors"
          style={{ color: 'var(--accent-red)' }}
        >
          <AlertTriangle size={11} />
          <span>Error</span>
        </span>
      );
    case 'timeout':
      return (
        <span
          className="statusbar-item"
          title="Last execution timed out"
          style={{ color: 'var(--accent-yellow)' }}
        >
          <Clock size={11} />
          <span>Timeout</span>
        </span>
      );
    case 'idle':
    default:
      return (
        <span
          className="statusbar-item"
          title="Ready"
          style={{ color: 'var(--accent-green)' }}
        >
          <CheckCircle2 size={11} />
          <span>Ready</span>
        </span>
      );
  }
}

// ─── StatusBar Component ──────────────────────────────────────

export function StatusBar() {
  const activeFileId = useProjectStore((s) => s.activeFileId);

  // RS-#7 FIX: Select only the active file's cursor instead of the entire
  // cursorPositions object. This prevents re-renders when other files'
  // cursors move.
  const cursor = useEditorStore(
    (s) => activeFileId
      ? s.cursorPositions[activeFileId] ?? { line: 1, column: 1 }
      : { line: 1, column: 1 },
  );

  // RS-#1 FIX: Subscribe to dirtyFileIds directly instead of isDirty function.
  // The old `useEditorStore(s => s.isDirty)` returned a stable function ref.
  const dirty = useEditorStore(
    (s) => activeFileId ? !!s.dirtyFileIds[activeFileId] : false,
  );

  // RS-#1 FIX: Subscribe to dirtyFileIds directly instead of dirtyCount function.
  const totalDirty = useEditorStore(
    (s) => Object.keys(s.dirtyFileIds).length,
  );

  // BUG-06 FIX: Use component state instead of module-level cache.
  // The old module-level cachedFileMeta never triggered re-renders and
  // clearFileMetaCache() was never called.
  const [language, setLanguage] = useState<LanguageId>('javascript');

  // ─── Load file metadata when active file changes ──────────
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

    return () => {
      cancelled = true;
    };
  }, [activeFileId]);

  // ─── Save status text ────────────────────────────────────
  const saveStatusText = totalDirty > 0
    ? `${totalDirty} unsaved file${totalDirty > 1 ? 's' : ''}`
    : 'All saved';

  return (
    <footer className="statusbar" role="status" aria-label="Editor status">
      <div className="statusbar-left">
        {/* Save status */}
        <button
          className="statusbar-item statusbar-clickable"
          title={saveStatusText}
          aria-label={saveStatusText}
          style={{ color: dirty ? 'var(--accent-yellow)' : 'var(--accent-green)' }}
        >
          {dirty ? <Circle size={8} fill="currentColor" /> : <Save size={11} />}
          <span>{dirty ? 'Modified' : 'Saved'}</span>
        </button>

        {/* Cursor position */}
        <button
          className="statusbar-item statusbar-clickable"
          title={`Line ${cursor.line}, Column ${cursor.column}`}
          aria-label={`Line ${cursor.line}, Column ${cursor.column}`}
        >
          <span>Ln {cursor.line}</span>
          <span className="statusbar-separator">,</span>
          <span>Col {cursor.column}</span>
        </button>
      </div>

      <div className="statusbar-right">
        {/* Language */}
        <button
          className="statusbar-item statusbar-clickable"
          title={`Language: ${LANGUAGE_DISPLAY[language]}`}
          aria-label={`Language: ${LANGUAGE_DISPLAY[language]}`}
        >
          <span>{LANGUAGE_DISPLAY[language]}</span>
        </button>

        {/* Encoding */}
        <button
          className="statusbar-item statusbar-clickable"
          title="File encoding: UTF-8"
          aria-label="File encoding: UTF-8"
        >
          <span>UTF-8</span>
        </button>

        {/* Tab size */}
        <button
          className="statusbar-item statusbar-clickable"
          title="Indentation: 2 spaces"
          aria-label="Indentation: 2 spaces"
        >
          <span>Spaces: 2</span>
        </button>

        {/* Execution status */}
        <ExecutionIndicator />
      </div>
    </footer>
  );
}
