/**
 * CodeCraft — ConsoleOutput Component
 *
 * Displays captured console output from the JS code runner.
 * Each entry is styled with ANSI-inspired coloring based on its
 * console method (log=white, warn=yellow, error=red, info=blue, etc.)
 *
 * Features:
 * - Color-coded entries by console method
 * - Clear button in the header
 * - Execution status indicator (idle / running / error / timeout)
 * - Execution duration display
 * - Entry count badge
 * - Auto-scroll to bottom on new output
 * - Keyboard shortcut: Ctrl+L to clear
 * - Click-to-filter by method type
 *
 * @see Project-Plan.md TASK-12 — Console output panel
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { Trash2, AlertTriangle, CheckCircle2, Clock, Loader2, ChevronDown } from 'lucide-react';
import { useConsoleStore } from '../../stores/consoleStore';
import type { ConsoleEntry, ConsoleMethod } from '../../types';

// ─── Method → Display Config ────────────────────────────────────

interface MethodConfig {
  label: string;
  cssClass: string;
  prefix: string;
}

const METHOD_CONFIG: Record<ConsoleMethod, MethodConfig> = {
  log:    { label: 'log',    cssClass: 'console-entry-log',    prefix: '' },
  warn:   { label: 'warn',   cssClass: 'console-entry-warn',   prefix: '⚠ ' },
  error:  { label: 'error',  cssClass: 'console-entry-error',  prefix: '✕ ' },
  info:   { label: 'info',   cssClass: 'console-entry-info',   prefix: 'ℹ ' },
  debug:  { label: 'debug',  cssClass: 'console-entry-debug',  prefix: '▸ ' },
  table:  { label: 'table',  cssClass: 'console-entry-table',  prefix: '⊞ ' },
  dir:    { label: 'dir',    cssClass: 'console-entry-dir',    prefix: '▸ ' },
  clear:  { label: 'clear',  cssClass: 'console-entry-clear',  prefix: '' },
  result: { label: 'result', cssClass: 'console-entry-result', prefix: '← ' },
};

// ─── Status Indicator ───────────────────────────────────────────

function StatusIndicator() {
  const status = useConsoleStore((s) => s.status);

  switch (status) {
    case 'running':
      return (
        <span className="console-status console-status-running" title="Running">
          <Loader2 size={12} className="console-spin-icon" />
          <span>Running</span>
        </span>
      );
    case 'error':
      return (
        <span className="console-status console-status-error" title="Error">
          <AlertTriangle size={12} />
          <span>Error</span>
        </span>
      );
    case 'timeout':
      return (
        <span className="console-status console-status-timeout" title="Timed out">
          <Clock size={12} />
          <span>Timeout</span>
        </span>
      );
    case 'idle':
    default:
      return (
        <span className="console-status console-status-idle" title="Idle">
          <CheckCircle2 size={12} />
          <span>Ready</span>
        </span>
      );
  }
}

// ─── Console Entry Component ────────────────────────────────────

function ConsoleEntryRow({ entry }: { entry: ConsoleEntry }) {
  const config = METHOD_CONFIG[entry.method];

  // Handle `clear` method — it's a visual separator, not an output line
  if (entry.method === 'clear') {
    return <div className="console-entry-clear-divider" />;
  }

  return (
    <div className={`console-entry ${config.cssClass}`} role="listitem">
      <span className="console-entry-badge">{config.label}</span>
      <span className="console-entry-text">
        {config.prefix}
        {entry.args.join(' ')}
      </span>
      <span className="console-entry-time">
        {new Date(entry.timestamp).toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })}
      </span>
    </div>
  );
}

// ─── Filter Button ──────────────────────────────────────────────

const ALL_METHODS: ConsoleMethod[] = ['log', 'warn', 'error', 'info', 'debug', 'table', 'dir', 'result'];

function FilterBar({
  activeFilter,
  onFilterChange,
}: {
  activeFilter: ConsoleMethod | null;
  onFilterChange: (method: ConsoleMethod | null) => void;
}) {
  const entries = useConsoleStore((s) => s.entries);

  // Count entries per method
  const counts = entries.reduce<Partial<Record<ConsoleMethod, number>>>(
    (acc, entry) => {
      acc[entry.method] = (acc[entry.method] || 0) + 1;
      return acc;
    },
    {},
  );

  return (
    <div className="console-filter-bar">
      <button
        className={`console-filter-btn ${activeFilter === null ? 'active' : ''}`}
        onClick={() => onFilterChange(null)}
      >
        All
        {entries.length > 0 && <span className="console-filter-count">{entries.length}</span>}
      </button>
      {ALL_METHODS.map((method) => {
        const count = counts[method] || 0;
        if (count === 0) return null;
        const config = METHOD_CONFIG[method];
        return (
          <button
            key={method}
            className={`console-filter-btn ${activeFilter === method ? 'active' : ''} ${config.cssClass}`}
            onClick={() => onFilterChange(activeFilter === method ? null : method)}
          >
            {config.label}
            <span className="console-filter-count">{count}</span>
          </button>
        );
      })}
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────

export function ConsoleOutput() {
  const entries = useConsoleStore((s) => s.entries);
  const status = useConsoleStore((s) => s.status);
  const lastExecutionDuration = useConsoleStore((s) => s.lastExecutionDuration);
  const clearConsole = useConsoleStore((s) => s.clearConsole);

  const listRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [activeFilter, setActiveFilter] = useState<ConsoleMethod | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Filter entries
  const filteredEntries = activeFilter
    ? entries.filter((e) => e.method === activeFilter)
    : entries;

  // Auto-scroll to bottom when new entries arrive
  useEffect(() => {
    if (autoScroll && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [filteredEntries.length, autoScroll]);

  // Detect if user has scrolled up (disable auto-scroll)
  const handleScroll = useCallback(() => {
    if (!listRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = listRef.current;
    // If user is within 40px of bottom, keep auto-scroll on
    setAutoScroll(scrollHeight - scrollTop - clientHeight < 40);
  }, []);

  // Keyboard shortcut: Ctrl+L to clear console
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
        e.preventDefault();
        clearConsole();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [clearConsole]);

  // Scroll to bottom button
  const handleScrollToBottom = useCallback(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
      setAutoScroll(true);
    }
  }, []);

  return (
    <div className="console-output">
      {/* ─── Header ──────────────────────────────────────────── */}
      <div className="console-header">
        <div className="console-header-left">
          <StatusIndicator />
          <span className="console-entry-count">{entries.length} entries</span>
          {lastExecutionDuration !== null && (
            <span className="console-duration">
              {lastExecutionDuration < 1
                ? '<1ms'
                : `${lastExecutionDuration}ms`}
            </span>
          )}
        </div>
        <div className="console-header-right">
          <button
            className="console-header-btn"
            onClick={() => setShowFilters(!showFilters)}
            title="Filter output"
            aria-label="Toggle filter bar"
          >
            <ChevronDown
              size={12}
              style={{
                transform: showFilters ? 'rotate(0deg)' : 'rotate(-90deg)',
                transition: 'transform 100ms ease',
              }}
            />
          </button>
          <button
            className="console-header-btn"
            onClick={clearConsole}
            title="Clear console (Ctrl+L)"
            aria-label="Clear console output"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* ─── Filter Bar ──────────────────────────────────────── */}
      {showFilters && (
        <FilterBar activeFilter={activeFilter} onFilterChange={setActiveFilter} />
      )}

      {/* ─── Entry List ──────────────────────────────────────── */}
      <div
        ref={listRef}
        className="console-entry-list"
        onScroll={handleScroll}
        role="list"
        aria-label="Console output"
      >
        {filteredEntries.length === 0 && (
          <div className="console-empty">
            {status === 'idle'
              ? 'No output yet. Click Run to execute your code.'
              : status === 'running'
                ? 'Executing...'
                : 'No matching entries.'}
          </div>
        )}
        {filteredEntries.map((entry) => (
          <ConsoleEntryRow key={entry.id} entry={entry} />
        ))}
      </div>

      {/* ─── Scroll-to-bottom button ─────────────────────────── */}
      {!autoScroll && filteredEntries.length > 0 && (
        <button
          className="console-scroll-bottom-btn"
          onClick={handleScrollToBottom}
          title="Scroll to bottom"
          aria-label="Scroll to latest output"
        >
          <ChevronDown size={14} />
        </button>
      )}
    </div>
  );
}
