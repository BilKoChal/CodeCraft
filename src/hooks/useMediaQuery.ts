/**
 * CodeCraft — useMediaQuery Hook
 *
 * Reactive CSS media query hook for responsive design.
 * Returns true when the media query matches.
 */
import { useSyncExternalStore } from 'react';

/** Subscribe to a media query and return whether it matches */
function subscribeToMediaQuery(query: string, callback: () => void): () => void {
  const mediaQuery = window.matchMedia(query);
  mediaQuery.addEventListener('change', callback);
  return () => mediaQuery.removeEventListener('change', callback);
}

/** Get the current match state of a media query */
function getMediaQuerySnapshot(query: string): boolean {
  return window.matchMedia(query).matches;
}

/** Server-side snapshot (always false) */
function getServerSnapshot(): boolean {
  return false;
}

/** Hook that reactively tracks a CSS media query */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (callback) => subscribeToMediaQuery(query, callback),
    () => getMediaQuerySnapshot(query),
    getServerSnapshot,
  );
}

/** Predefined breakpoint hooks matching the responsive design strategy */
export function useIsMobile() {
  return useMediaQuery('(max-width: 767px)');
}

export function useIsTablet() {
  return useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
}

export function useIsDesktop() {
  return useMediaQuery('(min-width: 1024px)');
}
