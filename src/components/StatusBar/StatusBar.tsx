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
 * Data sources:
 * - Cursor position → editorStore.cursorPositions[activeFileId]
 * - Dirty status    → editorStore.isDirty(activeFileId)
 * - Language        → File metadata from IndexedDB (via cache)
 * - Tab size        → editorStore / project settings
 * - Exec status     → consoleStore.status
 *
 * @see Project-Plan.md TASK-14 — Status bar component
 */

import { useEffect, useState, useCallback } from 'react';
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

// ─── File Meta Cache ──────────────────────────────────────────

/**
 * In-memory cache for active file metadata.
 * Avoids repeated IndexedDB reads on every cursor update.
 * Invalidated when the active file changes.
 */
let cachedFileMeta: {
  fileId: string;
  name: string;
  language: LanguageId;
} | null = null;

/**
 * Clear the file meta cache. Called when the active file changes.
 */
export function clearFileMetaCache(): void {
  cachedFileMeta = null;
}

/**
 * Get the cached file metadata, or fetch it from IndexedDB.
 * Returns a promise that resolves to the file metadata.
 */
async function getFileMeta(fileId: string): Promise<{
  name: string;
  language: LanguageId;
} | null> {
  // Return cache hit
  if (cachedFileMeta && cachedFileMeta.fileId === fileId) {
    return { name: cachedFileMeta.name, language: cachedFileMeta.language };
  }

  // Fetch from IndexedDB
  const file = await getFile(fileId);
  if (!file) return null;

  // Update cache
  cachedFileMeta = {
    fileId,
    name: file.name,
    language: file.language,
  };

  return { name: file.name, language: file.language };
}

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
  const cursorPositions = useEditorStore((s) => s.cursorPositions);
  const isDirty = useEditorStore((s) => s.isDirty);
  const dirtyCount = useEditorStore((s) => s.dirtyCount);

  // File metadata (language) — reactive via useState + effect
  const [language, setLanguage] = useState<LanguageId>('javascript');

  // Current cursor position for the active file
  const cursor = activeFileId
    ? cursorPositions[activeFileId] ?? { line: 1, column: 1 }
    : { line: 1, column: 1 };

  // Whether the active file has unsaved changes
  const dirty = activeFileId ? isDirty(activeFileId) : false;
  const totalDirty = dirtyCount();

  // ─── Load file metadata when active file changes ──────────
  useEffect(() => {
    if (!activeFileId) {
      setLanguage('javascript');
      return;
    }

    let cancelled = false;
    getFileMeta(activeFileId).then((meta) => {
      if (!cancelled && meta) {
        setLanguage(meta.language);
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
