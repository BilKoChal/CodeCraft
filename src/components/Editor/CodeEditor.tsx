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
 * BUG-02 FIX: Language is now derived from file metadata instead of being
 * hardcoded to 'javascript'. The editor fetches the file's language from
 * IndexedDB when the active file changes, enabling proper syntax highlighting
 * for TypeScript, HTML, CSS, JSON, and Markdown files.
 *
 * RS-#1 FIX: Replaced `getContent` function selector with a direct
 * subscription to `fileContents[activeFileId]`. The old pattern returned
 * a stable function reference that never triggered re-renders.
 *
 * RS-#8 FIX: Replaced `viewUpdate: any` with the proper `ViewUpdate` type
 * from `@codemirror/view` for type safety on the CM6 update callback.
 *
 * @see Project-Plan.md P0-01 — Code Editor (JS/JSX)
 * @see src/stores/editorStore.ts — Content + dirty tracking
 */

import { useCallback, useRef, useEffect, useMemo, useState } from 'react';
import CodeMirror, { type ReactCodeMirrorRef } from '@uiw/react-codemirror';
import type { ViewUpdate } from '@codemirror/view';
import { useEditorStore } from '../../stores/editorStore';
import { useProjectStore } from '../../stores/projectStore';
import { createExtensions } from './extensions';
import { getFile } from '../../db';
import type { LanguageId } from '../../types';

// ─── Component ────────────────────────────────────────────────

export function CodeEditor() {
  const activeFileId = useProjectStore((s) => s.activeFileId);
  const updateContent = useEditorStore((s) => s.updateContent);
  const setCursorPosition = useEditorStore((s) => s.setCursorPosition);

  // RS-#1 FIX: Subscribe to file content directly instead of using
  // the `getContent` function selector that never triggered re-renders.
  const activeFileContent = useEditorStore(
    (s) => activeFileId ? s.fileContents[activeFileId] : undefined,
  );

  const editorRef = useRef<ReactCodeMirrorRef>(null);

  // Current file content for the CodeMirror value prop
  const content = activeFileContent ?? '';

  // BUG-02 FIX: Derive language from file metadata instead of hardcoding
  // to 'javascript'. This enables proper syntax highlighting for all
  // supported file types (TypeScript, HTML, CSS, JSON, Markdown).
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

    return () => {
      cancelled = true;
    };
  }, [activeFileId]);

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
  // RS-#8 FIX: Use proper ViewUpdate type instead of `any`
  const handleUpdate = useCallback(
    (viewUpdate: ViewUpdate) => {
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
        const newContent = activeFileContent ?? '';
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
  }, [activeFileId, activeFileContent]);

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
