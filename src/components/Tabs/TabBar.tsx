/**
 * CodeCraft — TabBar Component
 *
 * IDE-style horizontal tab bar with:
 * - Smooth horizontal scroll overflow
 * - File icons per language type (via FileIcon component)
 * - Modified indicator dot (replaces close button, swaps on hover)
 * - Middle-click to close
 * - Full keyboard navigation (ARIA tablist pattern)
 * - Auto-scroll active tab into view
 *
 * RS-#1 FIX: Replaced `isDirty` function selector with inline reactive
 * selector subscribing to `dirtyFileIds` directly. The old pattern
 * `useEditorStore(s => s.isDirty)` returned a stable function reference
 * that never triggered re-renders when dirty state changed.
 *
 * BUG-05 FIX: Replaced module-level `fileMetaCache` Map with React state
 * so cache updates trigger re-renders. The old cache was populated
 * asynchronously but never caused the component to re-render, leaving
 * tabs showing "Loading..." indefinitely.
 *
 * @see Project-Plan.md P0-03 — Multi-file Tabs
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { useProjectStore } from '../../stores/projectStore';
import { useEditorStore } from '../../stores/editorStore';
import { getFile } from '../../db';
import { FileIcon } from './FileIcon';
import type { LanguageId } from '../../types';

// ─── TabItem Sub-component ────────────────────────────────────

interface TabItemProps {
  fileId: string;
  fileName: string;
  isActive: boolean;
  isDirty: boolean;
  onClose: (id: string) => void;
  onActivate: (id: string) => void;
  openFileIds: string[];
}

function TabItem({
  fileId,
  fileName,
  isActive,
  isDirty,
  onClose,
  onActivate,
  openFileIds,
}: TabItemProps) {
  const tabRef = useRef<HTMLButtonElement>(null);

  // Auto-scroll into view when this tab becomes active
  useEffect(() => {
    if (isActive && tabRef.current) {
      tabRef.current.scrollIntoView({
        block: 'nearest',
        inline: 'nearest',
        behavior: 'smooth',
      });
    }
  }, [isActive]);

  const handleClick = useCallback(() => {
    onActivate(fileId);
  }, [onActivate, fileId]);

  const handleClose = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onClose(fileId);
    },
    [onClose, fileId],
  );

  // Middle-click to close
  const handleAuxClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.button === 1) {
        e.preventDefault();
        onClose(fileId);
      }
    },
    [onClose, fileId],
  );

  // Prevent browser autoscroll on middle-click
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button === 1) {
        e.preventDefault();
      }
    },
    [],
  );

  // Keyboard navigation (ARIA tablist pattern)
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const currentIndex = openFileIds.indexOf(fileId);
      let nextIndex: number | null = null;

      switch (e.key) {
        case 'ArrowRight':
          nextIndex = (currentIndex + 1) % openFileIds.length;
          break;
        case 'ArrowLeft':
          nextIndex = (currentIndex - 1 + openFileIds.length) % openFileIds.length;
          break;
        case 'Home':
          nextIndex = 0;
          break;
        case 'End':
          nextIndex = openFileIds.length - 1;
          break;
        case 'Delete':
        case 'Backspace':
          e.preventDefault();
          onClose(fileId);
          return;
        default:
          return;
      }

      if (nextIndex !== null) {
        e.preventDefault();
        const nextFileId = openFileIds[nextIndex];
        onActivate(nextFileId);
        document.getElementById(`tab-${nextFileId}`)?.focus();
      }
    },
    [openFileIds, fileId, onActivate, onClose],
  );

  return (
    <button
      ref={tabRef}
      id={`tab-${fileId}`}
      className={`tab-item ${isActive ? 'active' : ''} ${isDirty ? 'dirty' : ''}`}
      role="tab"
      aria-selected={isActive}
      aria-controls="editor-panel"
      tabIndex={isActive ? 0 : -1}
      onClick={handleClick}
      onAuxClick={handleAuxClick}
      onMouseDown={handleMouseDown}
      onKeyDown={handleKeyDown}
      title={fileName}
    >
      <span className="tab-icon">
        <FileIcon filename={fileName} />
      </span>
      <span className="tab-label">{fileName}</span>
      <span className="tab-close" onClick={handleClose}>
        <X size={14} className="tab-close-x" />
        {isDirty && <span className="tab-modified-dot" />}
      </span>
    </button>
  );
}

// ─── TabBar Component ─────────────────────────────────────────

/**
 * TabBar renders the horizontal strip of open file tabs.
 *
 * BUG-05 FIX: File metadata is now stored in React state instead of a
 * module-level Map. This ensures cache updates trigger re-renders so
 * tab labels appear immediately instead of showing "Loading..." forever.
 * The cache is also properly invalidated when files are renamed (via
 * the reactive useLiveQuery in FileTree) and cleared on project switch.
 */

export function TabBar() {
  const openFileIds = useProjectStore((s) => s.openFileIds);
  const activeFileId = useProjectStore((s) => s.activeFileId);
  const openFile = useProjectStore((s) => s.openFile);
  const closeFile = useProjectStore((s) => s.closeFile);
  const loadContent = useEditorStore((s) => s.loadContent);

  // RS-#1 FIX: Subscribe to dirtyFileIds directly instead of isDirty function
  const dirtyFileIds = useEditorStore((s) => s.dirtyFileIds);

  // BUG-05 FIX: Use React state instead of module-level cache
  const [fileMetas, setFileMetas] = useState<Map<string, { name: string; language: LanguageId }>>(new Map());

  // Populate file meta cache from IndexedDB for any uncached files
  useEffect(() => {
    if (openFileIds.length === 0) return;

    let cancelled = false;
    const uncachedIds = openFileIds.filter((id) => !fileMetas.has(id));

    if (uncachedIds.length === 0) return;

    Promise.all(uncachedIds.map((id) => getFile(id))).then((files) => {
      if (cancelled) return;

      setFileMetas((prev) => {
        const next = new Map(prev);
        for (const file of files) {
          if (file) {
            next.set(file.id, { name: file.name, language: file.language });
            // Also load the content into editorStore if not already there
            const currentContent = useEditorStore.getState().fileContents[file.id];
            if (currentContent === undefined) {
              loadContent(file.id, file.content);
            }
          }
        }
        return next;
      });
    });

    return () => {
      cancelled = true;
    };
  }, [openFileIds, fileMetas, loadContent]);

  // Clear stale entries when openFileIds shrinks (e.g., tab closed)
  useEffect(() => {
    setFileMetas((prev) => {
      const openSet = new Set(openFileIds);
      let changed = false;
      const next = new Map(prev);
      for (const key of next.keys()) {
        if (!openSet.has(key)) {
          next.delete(key);
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [openFileIds]);

  // Empty state
  if (openFileIds.length === 0) {
    return (
      <div className="tab-bar tab-bar-empty" role="tablist" aria-label="Open files">
        <span className="tab-bar-placeholder">No files open</span>
      </div>
    );
  }

  return (
    <div
      className="tab-bar"
      role="tablist"
      aria-label="Open files"
      aria-orientation="horizontal"
    >
      {openFileIds.map((fileId) => {
        const meta = fileMetas.get(fileId);
        const fileName = meta?.name ?? 'Loading...';
        return (
          <TabItem
            key={fileId}
            fileId={fileId}
            fileName={fileName}
            isActive={fileId === activeFileId}
            isDirty={!!dirtyFileIds[fileId]}
            onClose={closeFile}
            onActivate={openFile}
            openFileIds={openFileIds}
          />
        );
      })}
    </div>
  );
}
