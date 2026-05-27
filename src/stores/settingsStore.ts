/**
 * CodeCraft — Settings Store
 *
 * Zustand store for user preferences with LocalStorage persistence.
 * To be fully implemented in PH3-10.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  /** Active theme ID */
  theme: string;
  /** Editor font size in pixels */
  fontSize: number;
  /** Tab/indent size */
  tabSize: number;
  /** Use spaces instead of tabs */
  insertSpaces: boolean;
  /** Word wrap mode */
  wordWrap: boolean;
  /** Auto-save enabled */
  autoSave: boolean;
  /** Auto-save debounce delay in ms */
  autoSaveDelay: number;
  /** Format on save */
  formatOnSave: boolean;
  /** Show minimap */
  showMinimap: boolean;

  // Actions
  setTheme: (theme: string) => void;
  setFontSize: (size: number) => void;
  setTabSize: (size: number) => void;
  setInsertSpaces: (spaces: boolean) => void;
  setWordWrap: (wrap: boolean) => void;
  setAutoSave: (enabled: boolean) => void;
  setFormatOnSave: (enabled: boolean) => void;
  setShowMinimap: (show: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'cosmic-dusk',
      fontSize: 14,
      tabSize: 2,
      insertSpaces: true,
      wordWrap: false,
      autoSave: true,
      autoSaveDelay: 1000,
      formatOnSave: true,
      showMinimap: false,

      setTheme: (theme) => set({ theme }),
      setFontSize: (fontSize) => set({ fontSize }),
      setTabSize: (tabSize) => set({ tabSize }),
      setInsertSpaces: (insertSpaces) => set({ insertSpaces }),
      setWordWrap: (wordWrap) => set({ wordWrap }),
      setAutoSave: (autoSave) => set({ autoSave }),
      setFormatOnSave: (formatOnSave) => set({ formatOnSave }),
      setShowMinimap: (showMinimap) => set({ showMinimap }),
    }),
    {
      name: 'codecraft-settings', // LocalStorage key
    },
  ),
);
