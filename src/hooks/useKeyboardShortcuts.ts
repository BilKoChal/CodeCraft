/**
 * CodeCraft — Keyboard Shortcuts Hook
 *
 * Global keyboard shortcut handler for the IDE workspace.
 * Registers shortcuts at the document level and cleans up on unmount.
 *
 * Shortcuts (Phase 0):
 *   Ctrl+S / Cmd+S   → Save all dirty files
 *   Ctrl+B / Cmd+B   → Toggle sidebar
 *   Ctrl+J / Cmd+J   → Toggle bottom panel
 *   Ctrl+W / Cmd+W   → Close active tab
 *   Ctrl+Enter / Cmd+Enter → Run code
 *   Ctrl+L / Cmd+L   → Clear console (handled in ConsoleOutput)
 *
 * Design decisions:
 * - Uses `useEffect` with document.addEventListener for global capture
 * - Checks `e.target` to avoid intercepting input field typing
 * - Uses both Ctrl (Windows/Linux) and Meta/Cmd (macOS) modifiers
 * - Calls `preventDefault()` to stop browser default actions
 * - No React state dependencies in the handler — reads from store.getState()
 *   to avoid re-registering on every state change
 *
 * @see Project-Plan.md TASK-15 — Keyboard shortcuts
 */

import { useEffect, useCallback } from 'react';
import { useProjectStore } from '../stores/projectStore';
import { useEditorStore } from '../stores/editorStore';
import { useUIStore } from '../stores/uiStore';
import { useConsoleStore } from '../stores/consoleStore';
import { saveAllDirtyFiles } from './useAutoSave';
import { jsRunner } from '../runner/jsRunner';
import { getFile } from '../db';
import { isExecutable } from '../utils/languageDetection';

// ─── Helper: Check if event target is an input field ──────────

/**
 * Returns true if the keyboard event originated from an input element
 * where we should not intercept shortcuts (e.g., rename input, search box).
 *
 * We still allow Ctrl+S even in inputs (save is always safe).
 */
function isInputTarget(e: KeyboardEvent): boolean {
  const target = e.target as HTMLElement;
  const tagName = target.tagName.toLowerCase();
  return (
    tagName === 'input' ||
    tagName === 'textarea' ||
    tagName === 'select' ||
    target.isContentEditable
  );
}

// ─── Hook ─────────────────────────────────────────────────────

/**
 * useKeyboardShortcuts — Register global IDE keyboard shortcuts.
 *
 * Call this once in the IDEWorkspace component. It handles its own
 * lifecycle and requires no parameters or return values.
 */
export function useKeyboardShortcuts(): void {
  // We use store references for the handler (not React state)
  // to avoid re-registering the listener on every state change.
  // Zustand's getState() always returns the latest state.

  useEffect(() => {
    /**
     * Global keyboard shortcut handler.
     * Uses capture phase (third arg = true) to intercept before
     * CodeMirror's keymap can swallow the event.
     */
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMod = e.ctrlKey || e.metaKey;

      // ─── Ctrl+S / Cmd+S → Save all dirty files ──────────
      if (isMod && e.key === 's') {
        e.preventDefault();
        e.stopPropagation();

        saveAllDirtyFiles()
          .then((count) => {
            if (count > 0) {
              console.log(`[Shortcuts] Saved ${count} file(s)`);
            }
          })
          .catch((err) => {
            console.error('[Shortcuts] Save failed:', err);
          });
        return;
      }

      // Skip remaining shortcuts if focus is in an input field
      // (Ctrl+S is the only shortcut that works everywhere)
      if (isInputTarget(e)) return;

      // ─── Ctrl+B / Cmd+B → Toggle sidebar ────────────────
      if (isMod && e.key === 'b') {
        e.preventDefault();
        e.stopPropagation();
        useUIStore.getState().toggleSidebar();
        return;
      }

      // ─── Ctrl+J / Cmd+J → Toggle bottom panel ───────────
      if (isMod && e.key === 'j') {
        e.preventDefault();
        e.stopPropagation();
        useUIStore.getState().toggleBottomPanel();
        return;
      }

      // ─── Ctrl+W / Cmd+W → Close active tab ──────────────
      if (isMod && e.key === 'w') {
        e.preventDefault();
        e.stopPropagation();

        const { activeFileId, closeFile } = useProjectStore.getState();
        if (activeFileId) {
          closeFile(activeFileId);
        }
        return;
      }

      // ─── Ctrl+Enter / Cmd+Enter → Run code ──────────────
      if (isMod && e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();

        // Execute the active file if it's JavaScript
        const { activeFileId } = useProjectStore.getState();
        if (!activeFileId) return;

        const { getContent } = useEditorStore.getState();
        const consoleStore = useConsoleStore.getState();

        // Check if already running
        if (consoleStore.status === 'running') return;

        // Get file metadata to check if executable
        getFile(activeFileId).then((file) => {
          if (!file) return;

          if (!isExecutable(file.language)) {
            consoleStore.addEntry('error', [
              `Cannot execute .${file.name.split('.').pop()} files. Only JavaScript is supported.`,
            ]);
            useUIStore.getState().setBottomPanelOpen(true);
            return;
          }

          const code = getContent(activeFileId) ?? '';
          if (!code.trim()) {
            consoleStore.addEntry('warn', ['No code to execute.']);
            return;
          }

          // Open console panel and start execution
          useUIStore.getState().setBottomPanelOpen(true);
          consoleStore.startExecution();

          jsRunner.execute(code, {
            onOutput: (method, text) => {
              if (method === 'clear') {
                useConsoleStore.getState().clearConsole();
              } else {
                consoleStore.addEntry(method, [text]);
              }
            },
            onDone: (_id, exitCode) => {
              consoleStore.addEntry('result', [`Process exited with code ${exitCode}`]);
              consoleStore.endExecution(exitCode === 0 ? 'idle' : 'error');
            },
            onError: (error, stack) => {
              consoleStore.addEntry('error', [stack || error]);
              consoleStore.endExecution('error');
            },
            onTimeout: () => {
              consoleStore.addEntry('error', [
                'Execution timed out (5s limit). Your code may have an infinite loop.',
              ]);
              consoleStore.endExecution('timeout');
            },
          });
        });
        return;
      }
    };

    // Register in capture phase to intercept before CodeMirror
    document.addEventListener('keydown', handleKeyDown, true);

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, []);
}
