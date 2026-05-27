/**
 * CodeCraft — Tab State Type Definitions
 *
 * Defines the data model for editor tabs.
 * Used by the editor store for multi-tab management.
 */

/** Represents a single open tab in the editor */
export interface TabState {
  id: string;
  fileId: string;
  filePath: string;
  fileName: string;
  isDirty: boolean;
  isPinned: boolean;
  scrollPosition: number;
  cursorPosition: { line: number; col: number };
  language: string;
  lastAccessed: number;
}

/** State shape for the tab manager */
export interface TabManagerState {
  tabs: TabState[];
  activeTabId: string | null;
  tabOrder: string[];
}
