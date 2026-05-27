/**
 * CodeCraft — CodeEditor Component
 *
 * The main CodeMirror 6 editor wrapper. Uses **uncontrolled mode** —
 * CM6 owns the document state, and onChange pushes changes to the
 * Zustand editorStore. The store is the persistence layer, not the
 * source of truth for the active editor content.
 *
 * Why uncontrolled?
 * - Controlled mode causes cursor jumping on every keystroke
 * - CM6's internal state management is highly optimized
 * - File switching is handled via EditorView.dispatch()
 *
 * @see Project-Plan.md P0-01 — Code Editor (JS/JSX)
 * @see src/stores/editorStore.ts — Content + dirty tracking
 */

import { useCallback, useRef, useEffect, useMemo } from 'react';
import CodeMirror, { type ReactCodeMirrorRef } from '@uiw/react-codemirror';
import { useEditorStore } from '../../stores/editorStore';
import { useProjectStore } from '../../stores/projectStore';
import { createExtensions } from './extensions';
import type { LanguageId } from '../../types';

// ─── Component ────────────────────────────────────────────────

export function CodeEditor() {
  const activeFileId = useProjectStore((s) => s.activeFileId);
  const updateContent = useEditorStore((s) => s.updateContent);
  const setCursorPosition = useEditorStore((s) => s.setCursorPosition);
  const getContent = useEditorStore((s) => s.getContent);
  const editorRef = useRef<ReactCodeMirrorRef>(null);

  // Current file content (for initial render only)
  const content = activeFileId ? getContent(activeFileId) ?? '' : '';

  // TODO: Derive language from file metadata (TASK-08 will provide this)
  // For now, default to JavaScript since Phase 0 is JS-only
  const language: LanguageId = 'javascript';

  // Build extensions (memoized by language)
  const extensions = useMemo(
    () => createExtensions(language),
    [language],
  );

  // ─── onChange: Push to Zustand (uncontrolled) ────────────
  const handleChange = useCallback(
    (value: string) => {
      if (activeFileId) {
        updateContent(activeFileId, value);
      }
    },
    [activeFileId, updateContent],
  );

  // ─── onUpdate: Track cursor position ─────────────────────
  const handleUpdate = useCallback(
    (viewUpdate: any) => {
      if (viewUpdate.selectionSet && activeFileId) {
        const pos = viewUpdate.state.selection.main.head;
        const line = viewUpdate.state.doc.lineAt(pos);
        setCursorPosition(activeFileId, line.number, pos - line.from + 1);
      }
    },
    [activeFileId, setCursorPosition],
  );

  // ─── File switching: Replace editor content via dispatch ──
  const prevFileIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (activeFileId !== prevFileIdRef.current) {
      prevFileIdRef.current = activeFileId;
      const view = editorRef.current?.view;
      if (view && activeFileId) {
        const newContent = getContent(activeFileId) ?? '';
        const currentContent = view.state.doc.toString();
        if (newContent !== currentContent) {
          view.dispatch({
            changes: {
              from: 0,
              to: currentContent.length,
              insert: newContent,
            },
            selection: { anchor: 0 },
          });
        }
      }
    }
  }, [activeFileId, getContent]);

  // ─── No file open: Show empty state ──────────────────────
  if (!activeFileId) {
    return (
      <div className="editor-empty-state">
        <p className="editor-empty-text">Open a file to start editing</p>
      </div>
    );
  }

  return (
    <CodeMirror
      ref={editorRef}
      value={content}
      height="100%"
      theme="none"
      basicSetup={false}
      extensions={extensions}
      onChange={handleChange}
      onUpdate={handleUpdate}
      onCreateEditor={(view) => {
        editorRef.current = { view, state: view.state, editor: view.dom as HTMLDivElement };
      }}
    />
  );
}
