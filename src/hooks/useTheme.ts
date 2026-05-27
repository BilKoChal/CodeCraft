/**
 * CodeCraft — useTheme Hook
 *
 * Theme switching with LocalStorage persistence.
 * To be fully implemented in PH3-05.
 */
import { useCallback } from 'react';
import { useSettingsStore } from '@/stores';

/** Hook for theme management */
export function useTheme() {
  const theme = useSettingsStore((s) => s.theme);
  const setTheme = useSettingsStore((s) => s.setTheme);

  const applyTheme = useCallback(
    (themeName: string) => {
      document.documentElement.setAttribute('data-theme', themeName);
      setTheme(themeName);
    },
    [setTheme],
  );

  return { theme, setTheme: applyTheme };
}
