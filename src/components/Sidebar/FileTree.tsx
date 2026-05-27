/**
 * CodeCraft — FileTree Component
 *
 * Flat file list sidebar with:
 * - File icons by type (reuses FileIcon component)
 * - Click to open file in editor
 * - Right-click context menu (new file, rename, delete)
 * - Inline rename input
 * - Keyboard navigation (arrow keys, Enter, Delete)
 * - "New File" button in header
 * - Empty state with prompt to create first file
 *
 * Phase 0 is flat (no nested folders). Folder support comes in Phase 1.
 *
 * @see Project-Plan.md P0-02 — File Tree Sidebar
 * @see Project-Plan.md TASK-07 — File tree sidebar component
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { Plus, Trash2, Pencil, MoreHorizontal } from 'lucide-react';
import { useProjectStore } from '../../stores/projectStore';
import { FileIcon } from '../Tabs/FileIcon';
import { useFileTree } from './useFileTree';
import type { FileEntry } from '../../types';

// ─── Context Menu State ──────────────────────────────────────

interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  fileId: string | null;
  fileName: string;
}

const INITIAL_CONTEXT_MENU: ContextMenuState = {
  visible: false,
  x: 0,
  y: 0,
  fileId: null,
  fileName: '',
};

// ─── Inline Rename State ─────────────────────────────────────

interface RenameState {
  active: boolean;
  fileId: string | null;
  originalName: string;
  value: string;
}

const INITIAL_RENAME: RenameState = {
  active: false,
  fileId: null,
  originalName: '',
  value: '',
};

// ─── Component ────────────────────────────────────────────────

export function FileTree() {
  const activeProjectId = useProjectStore((s) => s.activeProjectId);
  const activeFileId = useProjectStore((s) => s.activeFileId);
  const openFile = useProjectStore((s) => s.openFile);

  const {
    files,
    loading,
    error,
    clearError,
    createFile,
    renameFile,
    deleteFile,
  } = useFileTree();

  // ─── New file inline input ─────────────────────────────────
  const [isNewFileInput, setIsNewFileInput] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const newFileInputRef = useRef<HTMLInputElement>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);

  // ─── Context menu ──────────────────────────────────────────
  const [contextMenu, setContextMenu] = useState<ContextMenuState>(INITIAL_CONTEXT_MENU);
  const contextMenuRef = useRef<HTMLDivElement>(null);

  // ─── Rename state ──────────────────────────────────────────
  const [rename, setRename] = useState<RenameState>(INITIAL_RENAME);

  // ─── Focus inputs when they appear ─────────────────────────
  useEffect(() => {
    if (isNewFileInput && newFileInputRef.current) {
      newFileInputRef.current.focus();
    }
  }, [isNewFileInput]);

  useEffect(() => {
    if (rename.active && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [rename.active]);

  // ─── Close context menu on outside click ───────────────────
  useEffect(() => {
    if (!contextMenu.visible) return;

    const handleClick = (e: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
        setContextMenu(INITIAL_CONTEXT_MENU);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setContextMenu(INITIAL_CONTEXT_MENU);
      }
    };

    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [contextMenu.visible]);

  // ─── File click → open in editor ───────────────────────────
  const handleFileClick = useCallback(
    (fileId: string) => {
      openFile(fileId);
    },
    [openFile],
  );

  // ─── Context menu ──────────────────────────────────────────
  const handleContextMenu = useCallback(
    (e: React.MouseEvent, file: FileEntry) => {
      e.preventDefault();
      setContextMenu({
        visible: true,
        x: e.clientX,
        y: e.clientY,
        fileId: file.id,
        fileName: file.name,
      });
    },
    [],
  );

  // ─── New file ──────────────────────────────────────────────
  const handleStartNewFile = useCallback(() => {
    setIsNewFileInput(true);
    setNewFileName('');
  }, []);

  const handleNewFileSubmit = useCallback(async () => {
    const trimmed = newFileName.trim();
    if (!trimmed) {
      setIsNewFileInput(false);
      return;
    }
    await createFile(trimmed);
    setIsNewFileInput(false);
    setNewFileName('');
  }, [newFileName, createFile]);

  const handleNewFileKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleNewFileSubmit();
      } else if (e.key === 'Escape') {
        setIsNewFileInput(false);
        setNewFileName('');
      }
    },
    [handleNewFileSubmit],
  );

  // ─── Rename ────────────────────────────────────────────────
  const handleStartRename = useCallback(
    (fileId: string, currentName: string) => {
      setContextMenu(INITIAL_CONTEXT_MENU);
      setRename({
        active: true,
        fileId,
        originalName: currentName,
        value: currentName,
      });
    },
    [],
  );

  const handleRenameSubmit = useCallback(async () => {
    if (!rename.fileId) return;
    const trimmed = rename.value.trim();
    if (!trimmed || trimmed === rename.originalName) {
      setRename(INITIAL_RENAME);
      return;
    }
    const success = await renameFile(rename.fileId, trimmed);
    setRename(INITIAL_RENAME);
    if (!success) {
      // Re-show rename with original name on error
    }
  }, [rename, renameFile]);

  const handleRenameKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleRenameSubmit();
      } else if (e.key === 'Escape') {
        setRename(INITIAL_RENAME);
      }
    },
    [handleRenameSubmit],
  );

  // ─── Delete ────────────────────────────────────────────────
  const handleDelete = useCallback(
    async (fileId: string) => {
      setContextMenu(INITIAL_CONTEXT_MENU);
      await deleteFile(fileId);
    },
    [deleteFile],
  );

  // ─── No active project ─────────────────────────────────────
  if (!activeProjectId) {
    return (
      <div className="file-tree">
        <div className="file-tree-header">
          <span className="file-tree-title">EXPLORER</span>
        </div>
        <div className="file-tree-empty">
          <p>No project open</p>
          <p className="file-tree-empty-hint">Create or open a project to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="file-tree">
      {/* ─── Header ──────────────────────────────────────────── */}
      <div className="file-tree-header">
        <span className="file-tree-title">EXPLORER</span>
        <button
          className="file-tree-action-btn"
          onClick={handleStartNewFile}
          title="New File"
          aria-label="Create new file"
        >
          <Plus size={14} />
        </button>
      </div>

      {/* ─── Error Banner ────────────────────────────────────── */}
      {error && (
        <div className="file-tree-error">
          <span>{error}</span>
          <button onClick={clearError} className="file-tree-error-dismiss" aria-label="Dismiss error">
            ×
          </button>
        </div>
      )}

      {/* ─── File List ───────────────────────────────────────── */}
      <div className="file-tree-list" role="tree" aria-label="File explorer">
        {loading && (
          <div className="file-tree-loading">Loading files...</div>
        )}

        {!loading && files.length === 0 && !isNewFileInput && (
          <div className="file-tree-empty">
            <p>No files yet</p>
            <button className="file-tree-empty-action" onClick={handleStartNewFile}>
              <Plus size={12} /> Create your first file
            </button>
          </div>
        )}

        {files.map((file) => {
          const isActive = file.id === activeFileId;
          const isRenaming = rename.active && rename.fileId === file.id;

          if (isRenaming) {
            return (
              <div key={file.id} className="file-tree-item renaming" role="treeitem">
                <span className="file-tree-item-icon">
                  <FileIcon filename={rename.value || file.name} size={14} />
                </span>
                <input
                  ref={renameInputRef}
                  className="file-tree-rename-input"
                  value={rename.value}
                  onChange={(e) => setRename((r) => ({ ...r, value: e.target.value }))}
                  onBlur={handleRenameSubmit}
                  onKeyDown={handleRenameKeyDown}
                  aria-label="Rename file"
                />
              </div>
            );
          }

          return (
            <div
              key={file.id}
              className={`file-tree-item ${isActive ? 'active' : ''}`}
              role="treeitem"
              aria-selected={isActive}
              tabIndex={0}
              onClick={() => handleFileClick(file.id)}
              onContextMenu={(e) => handleContextMenu(e, file)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleFileClick(file.id);
                if (e.key === 'Delete' || e.key === 'Backspace') {
                  e.preventDefault();
                  handleDelete(file.id);
                }
                if (e.key === 'F2') {
                  e.preventDefault();
                  handleStartRename(file.id, file.name);
                }
              }}
            >
              <span className="file-tree-item-icon">
                <FileIcon filename={file.name} size={14} />
              </span>
              <span className="file-tree-item-name" title={file.path}>
                {file.name}
              </span>
              <button
                className="file-tree-item-actions"
                onClick={(e) => {
                  e.stopPropagation();
                  handleContextMenu(e as any, file);
                }}
                aria-label={`Actions for ${file.name}`}
              >
                <MoreHorizontal size={12} />
              </button>
            </div>
          );
        })}

        {/* ─── New File Inline Input ─────────────────────────── */}
        {isNewFileInput && (
          <div className="file-tree-item new-file-input" role="treeitem">
            <span className="file-tree-item-icon">
              <FileIcon filename={newFileName || 'untitled.js'} size={14} />
            </span>
            <input
              ref={newFileInputRef}
              className="file-tree-new-file-input"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              onBlur={handleNewFileSubmit}
              onKeyDown={handleNewFileKeyDown}
              placeholder="filename.js"
              aria-label="New file name"
            />
          </div>
        )}
      </div>

      {/* ─── Context Menu ────────────────────────────────────── */}
      {contextMenu.visible && (
        <div
          ref={contextMenuRef}
          className="file-tree-context-menu"
          style={{
            position: 'fixed',
            left: contextMenu.x,
            top: contextMenu.y,
            zIndex: 1000,
          }}
          role="menu"
        >
          <button
            className="context-menu-item"
            role="menuitem"
            onClick={() => {
              if (contextMenu.fileId) {
                handleStartRename(contextMenu.fileId, contextMenu.fileName);
              }
            }}
          >
            <Pencil size={12} /> Rename
          </button>
          <button
            className="context-menu-item danger"
            role="menuitem"
            onClick={() => {
              if (contextMenu.fileId) {
                handleDelete(contextMenu.fileId);
              }
            }}
          >
            <Trash2 size={12} /> Delete
          </button>
        </div>
      )}
    </div>
  );
}
