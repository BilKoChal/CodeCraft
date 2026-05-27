/**
 * CodeCraft — ProjectList Component
 *
 * Landing page displayed when no project is active.
 * Shows all projects as cards with:
 * - Create new project (with inline name input)
 * - Open existing project (click card)
 * - Rename project (double-click or F2)
 * - Delete project (context menu or card action)
 * - Import project from ZIP (delegates to TASK-10 logic)
 * - Timestamps (created, last modified)
 * - File count per project
 *
 * @see Project-Plan.md TASK-09 — Project list page + CRUD
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Plus,
  Trash2,
  Pencil,
  FolderOpen,
  Clock,
  FileCode2,
  Upload,
} from 'lucide-react';
import { useProjects } from '../../hooks/useProjects';
import { countFilesInProject } from '../../db';
import { importProjectFromZip } from '../../utils/zipImport';
import type { Project } from '../../types';

// ─── Project Card File Count Sub-component ───────────────────

function ProjectFileCount({ projectId }: { projectId: string }) {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    countFilesInProject(projectId).then(setCount);
  }, [projectId]);

  if (count === null) return null;
  return (
    <span className="project-card-stat">
      <FileCode2 size={11} /> {count} file{count !== 1 ? 's' : ''}
    </span>
  );
}

// ─── Relative Time Utility ───────────────────────────────────

function relativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 30) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

// ─── Rename State ────────────────────────────────────────────

interface RenameState {
  active: boolean;
  projectId: string | null;
  originalName: string;
  value: string;
}

const INITIAL_RENAME: RenameState = {
  active: false,
  projectId: null,
  originalName: '',
  value: '',
};

// ─── Component ────────────────────────────────────────────────

export function ProjectList() {
  const {
    projects,
    loading,
    error,
    clearError,
    createProject,
    renameProject,
    deleteProject,
    openProject,
  } = useProjects();

  // ─── New project input ─────────────────────────────────────
  const [isNewProjectInput, setIsNewProjectInput] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const newProjectInputRef = useRef<HTMLInputElement>(null);

  // ─── Rename state ──────────────────────────────────────────
  const [rename, setRename] = useState<RenameState>(INITIAL_RENAME);
  const renameInputRef = useRef<HTMLInputElement>(null);

  // ─── ZIP import ────────────────────────────────────────────
  const zipInputRef = useRef<HTMLInputElement>(null);

  // ─── Focus inputs when they appear ─────────────────────────
  useEffect(() => {
    if (isNewProjectInput && newProjectInputRef.current) {
      newProjectInputRef.current.focus();
    }
  }, [isNewProjectInput]);

  useEffect(() => {
    if (rename.active && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [rename.active]);

  // ─── New project ───────────────────────────────────────────
  const handleNewProjectSubmit = useCallback(async () => {
    const trimmed = newProjectName.trim();
    if (!trimmed) {
      setIsNewProjectInput(false);
      return;
    }
    await createProject(trimmed);
    setIsNewProjectInput(false);
    setNewProjectName('');
  }, [newProjectName, createProject]);

  const handleNewProjectKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleNewProjectSubmit();
      } else if (e.key === 'Escape') {
        setIsNewProjectInput(false);
        setNewProjectName('');
      }
    },
    [handleNewProjectSubmit],
  );

  // ─── Rename ────────────────────────────────────────────────
  const handleStartRename = useCallback(
    (project: Project) => {
      setRename({
        active: true,
        projectId: project.id,
        originalName: project.name,
        value: project.name,
      });
    },
    [],
  );

  const handleRenameSubmit = useCallback(async () => {
    if (!rename.projectId) return;
    const trimmed = rename.value.trim();
    if (!trimmed || trimmed === rename.originalName) {
      setRename(INITIAL_RENAME);
      return;
    }
    await renameProject(rename.projectId, trimmed);
    setRename(INITIAL_RENAME);
  }, [rename, renameProject]);

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
    async (project: Project) => {
      const confirmed = window.confirm(
        `Delete "${project.name}" and all its files? This cannot be undone.`,
      );
      if (!confirmed) return;
      await deleteProject(project.id);
    },
    [deleteProject],
  );

  // ─── ZIP import ────────────────────────────────────────────
  const handleImportZip = useCallback(async () => {
    zipInputRef.current?.click();
  }, []);

  const handleZipFileSelected = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        const project = await importProjectFromZip(file);
        openProject(project.id);
      } catch (err: any) {
        // Error is handled within importProjectFromZip, but we can log
        console.error('[ProjectList] ZIP import failed:', err);
      }

      // Reset the input so the same file can be re-selected
      e.target.value = '';
    },
    [openProject],
  );

  // ─── Render ────────────────────────────────────────────────
  return (
    <div className="project-list-page">
      {/* ─── Header ────────────────────────────────────────── */}
      <div className="project-list-header">
        <div className="project-list-brand">
          <span className="project-list-logo">⌘</span>
          <div>
            <h1 className="project-list-title">CodeCraft</h1>
            <p className="project-list-subtitle">
              Fast, zero-install, browser-based code editor
            </p>
          </div>
        </div>
      </div>

      {/* ─── Error Banner ──────────────────────────────────── */}
      {error && (
        <div className="project-list-error">
          <span>{error}</span>
          <button onClick={clearError} className="project-list-error-dismiss" aria-label="Dismiss">
            ×
          </button>
        </div>
      )}

      {/* ─── Actions Bar ───────────────────────────────────── */}
      <div className="project-list-actions">
        <button
          className="project-list-action-primary"
          onClick={() => setIsNewProjectInput(true)}
        >
          <Plus size={16} /> New Project
        </button>
        <button
          className="project-list-action-secondary"
          onClick={handleImportZip}
        >
          <Upload size={14} /> Import ZIP
        </button>
        <input
          ref={zipInputRef}
          type="file"
          accept=".zip"
          style={{ display: 'none' }}
          onChange={handleZipFileSelected}
          aria-label="Upload ZIP file"
        />
      </div>

      {/* ─── New Project Inline Input ──────────────────────── */}
      {isNewProjectInput && (
        <div className="project-card new-project-card">
          <div className="project-card-icon">
            <FolderOpen size={24} />
          </div>
          <div className="project-card-info">
            <input
              ref={newProjectInputRef}
              className="project-card-rename-input"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              onBlur={handleNewProjectSubmit}
              onKeyDown={handleNewProjectKeyDown}
              placeholder="My Awesome Project"
              aria-label="New project name"
            />
            <span className="project-card-meta">
              Press Enter to create, Escape to cancel
            </span>
          </div>
        </div>
      )}

      {/* ─── Loading ───────────────────────────────────────── */}
      {loading && (
        <div className="project-list-empty">
          <p>Loading projects...</p>
        </div>
      )}

      {/* ─── Empty State ───────────────────────────────────── */}
      {!loading && projects.length === 0 && !isNewProjectInput && (
        <div className="project-list-empty">
          <div className="project-list-empty-icon">📁</div>
          <h2>No projects yet</h2>
          <p>Create your first project or import one from a ZIP file to get started.</p>
          <button
            className="project-list-action-primary"
            onClick={() => setIsNewProjectInput(true)}
          >
            <Plus size={16} /> Create First Project
          </button>
        </div>
      )}

      {/* ─── Project Cards Grid ────────────────────────────── */}
      {!loading && projects.length > 0 && (
        <div className="project-cards">
          {projects.map((project) => {
            const isRenaming = rename.active && rename.projectId === project.id;

            return (
              <div
                key={project.id}
                className="project-card"
                role="button"
                tabIndex={0}
                onClick={() => {
                  if (!isRenaming) openProject(project.id);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isRenaming) openProject(project.id);
                  if (e.key === 'F2') {
                    e.preventDefault();
                    handleStartRename(project);
                  }
                  if (e.key === 'Delete') {
                    e.preventDefault();
                    handleDelete(project);
                  }
                }}
                onDoubleClick={() => handleStartRename(project)}
              >
                <div className="project-card-icon">
                  <FolderOpen size={24} />
                </div>
                <div className="project-card-info">
                  {isRenaming ? (
                    <input
                      ref={renameInputRef}
                      className="project-card-rename-input"
                      value={rename.value}
                      onChange={(e) =>
                        setRename((r) => ({ ...r, value: e.target.value }))
                      }
                      onBlur={handleRenameSubmit}
                      onKeyDown={(e) => {
                        e.stopPropagation();
                        handleRenameKeyDown(e);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      aria-label="Rename project"
                    />
                  ) : (
                    <h3 className="project-card-name">{project.name}</h3>
                  )}
                  <div className="project-card-meta">
                    <ProjectFileCount projectId={project.id} />
                    <span className="project-card-stat">
                      <Clock size={11} /> {relativeTime(project.updatedAt)}
                    </span>
                  </div>
                </div>
                <div className="project-card-actions">
                  <button
                    className="project-card-action-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartRename(project);
                    }}
                    title="Rename"
                    aria-label={`Rename ${project.name}`}
                  >
                    <Pencil size={12} />
                  </button>
                  <button
                    className="project-card-action-btn danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(project);
                    }}
                    title="Delete"
                    aria-label={`Delete ${project.name}`}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
