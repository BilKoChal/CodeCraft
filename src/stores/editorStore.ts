/**
 * CodeCraft — Editor Store
 *
 * Zustand store for editor state: tabs, active tab, cursor, scroll.
 * To be fully implemented in PH1-01 and PH1-06.
 */
import { create } from 'zustand';
import type { TabState } from '@/types';

interface EditorState {
  /** Open tabs in the editor */
  tabs: TabState[];
  /** Currently active tab ID */
  activeTabId: string | null;
  /** Whether the file navigator panel is open */
  isNavigatorOpen: boolean;
  /** Whether the console drawer is open */
  isConsoleOpen: boolean;

  // Actions (stubs — to be implemented in PH1)
  openTab: (fileId: string, filePath: string, fileName: string, language: string) => void;
  closeTab: (tabId: string) => void;
  switchTab: (tabId: string) => void;
  setTabDirty: (tabId: string, isDirty: boolean) => void;
  toggleNavigator: () => void;
  toggleConsole: () => void;
}

export const useEditorStore = create<EditorState>()((set) => ({
  tabs: [],
  activeTabId: null,
  isNavigatorOpen: false,
  isConsoleOpen: false,

  openTab: () => {
    // PH1-06: Full implementation
  },
  closeTab: () => {
    // PH1-06: Full implementation
  },
  switchTab: () => {
    // PH1-06: Full implementation
  },
  setTabDirty: () => {
    // PH1-06: Full implementation
  },
  toggleNavigator: () => set((s) => ({ isNavigatorOpen: !s.isNavigatorOpen })),
  toggleConsole: () => set((s) => ({ isConsoleOpen: !s.isConsoleOpen })),
}));
