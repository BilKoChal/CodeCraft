/**
 * CodeCraft — Project Store
 *
 * Zustand store for project state: files, folders, current project.
 * To be fully implemented in PH2-01.
 */
import { create } from 'zustand';
import type { Project, FileNode } from '@/types';

interface ProjectState {
  /** Currently active project (null if none open) */
  currentProject: Project | null;
  /** All file nodes for the current project */
  files: FileNode[];
  /** Currently selected file ID in the navigator */
  selectedFileId: string | null;
  /** Loading state for async operations */
  isLoading: boolean;

  // Actions (stubs — to be implemented in PH2)
  loadProject: (projectId: string) => Promise<void>;
  createProject: (name: string) => Promise<Project>;
  deleteProject: (projectId: string) => Promise<void>;
  createFile: (parentId: string | null, name: string, type: 'file' | 'folder') => Promise<FileNode>;
  deleteFile: (fileId: string) => Promise<void>;
  renameFile: (fileId: string, newName: string) => Promise<void>;
}

export const useProjectStore = create<ProjectState>()(() => ({
  currentProject: null,
  files: [],
  selectedFileId: null,
  isLoading: false,

  loadProject: async () => {
    // PH2-01: Full implementation
  },
  createProject: async () => {
    // PH2-01: Full implementation
    throw new Error('Not implemented');
  },
  deleteProject: async () => {
    // PH2-01: Full implementation
  },
  createFile: async () => {
    // PH2-01: Full implementation
    throw new Error('Not implemented');
  },
  deleteFile: async () => {
    // PH2-01: Full implementation
  },
  renameFile: async () => {
    // PH2-01: Full implementation
  },
}));
