/* ============================================================
   CodeCraft — Shared TypeScript Types
   
   Central type definitions used across the application.
   These types mirror the Dexie.js schema but are also used
   by Zustand stores and React components independently.
   ============================================================ */

// ─── Project ─────────────────────────────────────────────────

/** Project-level settings stored alongside the project */
export interface ProjectSettings {
  fontSize: number;
  tabSize: number;
  wordWrap: boolean;
}

/** A project containing multiple files */
export interface Project {
  id: string; // UUID, client-generated
  name: string;
  createdAt: number; // Unix timestamp (ms)
  updatedAt: number;
  settings: ProjectSettings;
}

// ─── File ────────────────────────────────────────────────────

/** Supported language identifiers for syntax highlighting & execution */
export type LanguageId =
  | 'javascript'
  | 'typescript'
  | 'html'
  | 'css'
  | 'json'
  | 'markdown'
  | 'plaintext';

/** A single file within a project */
export interface FileEntry {
  id: string; // UUID, client-generated
  projectId: string; // FK → Project.id
  name: string; // e.g., "index.js"
  path: string; // e.g., "/src/index.js"
  content: string;
  language: LanguageId;
  isDirty: boolean; // unsaved changes flag
  createdAt: number;
  updatedAt: number;
}

// ─── File Tree ───────────────────────────────────────────────

/** Node in the file tree (file or directory) */
export interface FileNode {
  id: string; // path-based ID like "src/components/App.js"
  name: string; // display name
  type: 'file' | 'directory';
  parentId: string | null;
  childrenIds: string[];
  isExpanded?: boolean;
  depth: number; // indentation level
}

/** Flat map of file tree nodes for O(1) lookups */
export type FileTreeMap = Record<string, FileNode>;

// ─── Console ─────────────────────────────────────────────────

/** Console output entry from code execution */
export interface ConsoleEntry {
  id: string; // unique entry ID
  method: ConsoleMethod;
  args: string[]; // serialized arguments
  timestamp: number;
}

/** Supported console methods */
export type ConsoleMethod =
  | 'log'
  | 'error'
  | 'warn'
  | 'info'
  | 'debug'
  | 'table'
  | 'dir'
  | 'clear'
  | 'result';

/** Message from the Web Worker execution */
export interface WorkerOutputMessage {
  type: 'output';
  method: ConsoleMethod;
  text: string;
}

export interface WorkerDoneMessage {
  type: 'done';
  id: string;
  exitCode: number;
}

export interface WorkerErrorMessage {
  type: 'error';
  id?: string;
  error: string;
  stack?: string;
}

export type WorkerMessage =
  | WorkerOutputMessage
  | WorkerDoneMessage
  | WorkerErrorMessage;

// ─── App Settings ────────────────────────────────────────────

/** Global application settings (stored in IndexedDB) */
export interface AppSettings {
  id: string; // always "app-settings"
  theme: 'light' | 'dark' | 'system';
  fontSize: number;
  tabSize: number;
  wordWrap: boolean;
  autoSave: boolean;
  autoSaveDelay: number; // ms
  recentProjects: string[]; // project IDs ordered by recency
}

// ─── UI ──────────────────────────────────────────────────────

/** Bottom panel active tab */
export type BottomPanelTab = 'console' | 'preview';

/** Layout orientation for panels */
export type PanelDirection = 'horizontal' | 'vertical';
