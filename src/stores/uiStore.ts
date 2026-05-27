/**
 * CodeCraft — UI Store
 *
 * Manages global UI state: panel visibility, sizes, theme, and
 * layout preferences. Persists to localStorage so the user's
 * preferred layout is restored on the next visit.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { BottomPanelTab } from '../types';

// ─── State Interface ─────────────────────────────────────────

interface UIState {
  /** Whether the sidebar (file tree) is visible */
  sidebarOpen: boolean;

  /** Whether the bottom panel (console/preview) is visible */
  bottomPanelOpen: boolean;

  /** Which tab is active in the bottom panel */
  activeBottomTab: BottomPanelTab;

  /** Whether the settings modal is open */
  settingsModalOpen: boolean;

  // ─── Actions ─────────────────────────────────────────────

  /** Toggle the sidebar visibility */
  toggleSidebar: () => void;

  /** Set sidebar visibility explicitly */
  setSidebarOpen: (open: boolean) => void;

  /** Toggle the bottom panel visibility */
  toggleBottomPanel: () => void;

  /** Set bottom panel visibility explicitly */
  setBottomPanelOpen: (open: boolean) => void;

  /** Set the active tab in the bottom panel */
  setActiveBottomTab: (tab: BottomPanelTab) => void;

  /** Toggle the settings modal */
  toggleSettingsModal: () => void;

  /** Set settings modal visibility */
  setSettingsModalOpen: (open: boolean) => void;
}

// ─── Store ───────────────────────────────────────────────────

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      bottomPanelOpen: true,
      activeBottomTab: 'console',
      settingsModalOpen: false,

      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),

      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      toggleBottomPanel: () =>
        set((s) => ({ bottomPanelOpen: !s.bottomPanelOpen })),

      setBottomPanelOpen: (open) => set({ bottomPanelOpen: open }),

      setActiveBottomTab: (tab) => set({ activeBottomTab: tab }),

      toggleSettingsModal: () =>
        set((s) => ({ settingsModalOpen: !s.settingsModalOpen })),

      setSettingsModalOpen: (open) => set({ settingsModalOpen: open }),
    }),
    {
      name: 'codecraft-ui', // localStorage key
      // Persist layout preferences only
      partialize: (state) => ({
        sidebarOpen: state.sidebarOpen,
        bottomPanelOpen: state.bottomPanelOpen,
        activeBottomTab: state.activeBottomTab,
      }),
    },
  ),
);
