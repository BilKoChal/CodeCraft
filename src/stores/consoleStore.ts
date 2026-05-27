/**
 * CodeCraft — Console Store
 *
 * Manages the output console state: entries from code execution,
 * execution status, and clearing functionality.
 *
 * Console entries are NOT persisted — they represent transient
 * execution output and are cleared on page reload.
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { ConsoleEntry, ConsoleMethod } from '../types';

// ─── Execution Status ────────────────────────────────────────

export type ExecutionStatus = 'idle' | 'running' | 'error' | 'timeout';

// ─── State Interface ─────────────────────────────────────────

interface ConsoleState {
  /** Ordered list of console output entries */
  entries: ConsoleEntry[];

  /** Current execution status */
  status: ExecutionStatus;

  /** Timestamp of the last execution start */
  lastExecutionStart: number | null;

  /** Duration of the last completed execution (ms) */
  lastExecutionDuration: number | null;

  // ─── Actions ─────────────────────────────────────────────

  /** Add a new console entry */
  addEntry: (method: ConsoleMethod, args: string[]) => void;

  /** Set the execution status */
  setStatus: (status: ExecutionStatus) => void;

  /** Start a new execution (clears previous entries) */
  startExecution: () => void;

  /** End the current execution with a duration */
  endExecution: (status: ExecutionStatus) => void;

  /** Clear all console entries */
  clearConsole: () => void;

  // ─── Selectors ───────────────────────────────────────────

  /** Get the total number of entries */
  entryCount: () => number;

  /** Get entries filtered by method */
  getEntriesByMethod: (method: ConsoleMethod) => ConsoleEntry[];
}

// ─── ID Counter ──────────────────────────────────────────────

let entryIdCounter = 0;

/** Generate a unique entry ID */
function nextEntryId(): string {
  entryIdCounter += 1;
  return `entry-${Date.now()}-${entryIdCounter}`;
}

// ─── Store ───────────────────────────────────────────────────

export const useConsoleStore = create<ConsoleState>()(
  immer((set, get) => ({
    entries: [],
    status: 'idle',
    lastExecutionStart: null,
    lastExecutionDuration: null,

    addEntry: (method, args) =>
      set((state) => {
        state.entries.push({
          id: nextEntryId(),
          method,
          args,
          timestamp: Date.now(),
        });
      }),

    setStatus: (status) =>
      set((state) => {
        state.status = status;
      }),

    startExecution: () =>
      set((state) => {
        // Clear previous output for a fresh run
        state.entries = [];
        state.status = 'running';
        state.lastExecutionStart = Date.now();
        state.lastExecutionDuration = null;
      }),

    endExecution: (status) =>
      set((state) => {
        state.status = status;
        if (state.lastExecutionStart !== null) {
          state.lastExecutionDuration = Date.now() - state.lastExecutionStart;
        }
      }),

    clearConsole: () =>
      set((state) => {
        state.entries = [];
      }),

    // Selectors
    entryCount: () => get().entries.length,

    getEntriesByMethod: (method) =>
      get().entries.filter((e) => e.method === method),
  })),
);
