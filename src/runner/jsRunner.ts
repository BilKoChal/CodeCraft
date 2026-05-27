/**
 * CodeCraft — JS Code Runner (Web Worker Sandbox)
 *
 * Executes JavaScript code inside a sandboxed Web Worker created
 * from a Blob URL. The worker mocks all console methods and posts
 * captured output back to the main thread via postMessage.
 *
 * Security measures:
 * - `importScripts`, `fetch`, `XMLHttpRequest` are deleted inside the worker
 * - Worker is terminated after a configurable timeout (default 5s)
 * - Output size is capped to prevent memory exhaustion
 *
 * Flow:
 *   User clicks "Run" → JSRunner.execute(code) → Create Blob-URL Worker
 *   → Worker runs `new Function('console', code)` → Mock console captures output
 *   → postMessage → Main thread → ConsoleStore → Console UI
 *
 * @see Project-Plan.md TASK-11 — JS code runner (Web Worker)
 */

import type { ConsoleMethod, WorkerMessage } from '../types';

// ─── Configuration ──────────────────────────────────────────────

/** Maximum execution time before the worker is forcefully terminated */
const DEFAULT_TIMEOUT_MS = 5000;

/** Maximum total output characters (across all entries) before truncation */
const MAX_OUTPUT_CHARS = 100_000;

/** Maximum number of individual console entries before stopping capture */
const MAX_ENTRIES = 10_000;

/** Maximum stringified argument length before truncation */
const MAX_ARG_LENGTH = 10_000;

// ─── Worker Source (Inline String) ─────────────────────────────

/**
 * The Web Worker code as a string template.
 * This is turned into a Blob URL at runtime — no separate .worker.js file needed.
 *
 * The worker:
 * 1. Deletes dangerous globals (importScripts, fetch, XMLHttpRequest)
 * 2. Creates a mock `console` object that captures method calls
 * 3. Runs user code inside `new Function('console', code)`
 * 4. Posts each captured output as a WorkerOutputMessage
 * 5. Posts a WorkerDoneMessage on success or WorkerErrorMessage on failure
 */
const WORKER_SOURCE = `
// ─── Security: Remove dangerous globals ──────────────────────
delete self.importScripts;
delete self.fetch;
delete self.XMLHttpRequest;

// ─── Output tracking ────────────────────────────────────────
let totalChars = 0;
let entryCount = 0;
const MAX_OUTPUT_CHARS = ${MAX_OUTPUT_CHARS};
const MAX_ENTRIES = ${MAX_ENTRIES};
const MAX_ARG_LENGTH = ${MAX_ARG_LENGTH};

// ─── Serialization helpers ──────────────────────────────────
function truncate(str, maxLen) {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen) + '... [truncated]';
}

function stringify(arg) {
  if (arg === undefined) return 'undefined';
  if (arg === null) return 'null';
  if (typeof arg === 'string') return arg;
  if (typeof arg === 'number' || typeof arg === 'boolean') return String(arg);
  if (arg instanceof Error) return arg.stack || arg.message;
  if (typeof arg === 'function') return arg.toString();
  try {
    return truncate(JSON.stringify(arg, null, 2), MAX_ARG_LENGTH);
  } catch (e) {
    return String(arg);
  }
}

function sendOutput(method, args) {
  if (entryCount >= MAX_ENTRIES) return;
  if (totalChars >= MAX_OUTPUT_CHARS) return;

  const text = args.map(stringify).join(' ');
  const truncated = truncate(text, MAX_ARG_LENGTH);

  totalChars += truncated.length;
  entryCount++;

  self.postMessage({
    type: 'output',
    method: method,
    text: truncated
  });

  if (totalChars >= MAX_OUTPUT_CHARS) {
    self.postMessage({
      type: 'output',
      method: 'warn',
      text: '[CodeCraft] Output limit reached. Further output suppressed.'
    });
  }
}

// ─── Mock console ────────────────────────────────────────────
const console = {
  log:   (...args) => sendOutput('log', args),
  warn:  (...args) => sendOutput('warn', args),
  error: (...args) => sendOutput('error', args),
  info:  (...args) => sendOutput('info', args),
  debug: (...args) => sendOutput('debug', args),
  table: (...args) => sendOutput('table', args),
  dir:   (...args) => sendOutput('dir', args),
  clear: () => self.postMessage({ type: 'output', method: 'clear', text: '' }),
};

// ─── Execute user code ──────────────────────────────────────
self.onmessage = function(e) {
  const { code, id } = e.data;

  try {
    // Wrap in new Function so 'console' is injected as a parameter
    const fn = new Function('console', code);
    const result = fn(console);

    // If the code returns a value, display it
    if (result !== undefined) {
      self.postMessage({
        type: 'output',
        method: 'result',
        text: stringify(result)
      });
    }

    self.postMessage({ type: 'done', id: id, exitCode: 0 });
  } catch (err) {
    self.postMessage({
      type: 'error',
      id: id,
      error: err.message || String(err),
      stack: err.stack || undefined
    });
  }

  self.close();
};
`;

// ─── JSRunner Class ─────────────────────────────────────────────

/** Callback types for runner events */
export interface JSRunnerCallbacks {
  /** Called for each console output entry */
  onOutput: (method: ConsoleMethod, text: string) => void;

  /** Called when execution completes successfully */
  onDone: (id: string, exitCode: number) => void;

  /** Called when execution fails with an error */
  onError: (error: string, stack?: string) => void;

  /** Called when execution times out and worker is terminated */
  onTimeout: () => void;
}

export class JSRunner {
  private worker: Worker | null = null;
  private timeoutHandle: ReturnType<typeof setTimeout> | null = null;
  private executionId = 0;
  private disposed = false;

  /**
   * Execute JavaScript code in a sandboxed Web Worker.
   *
   * @param code - The JavaScript source code to execute
   * @param callbacks - Event callbacks for output, completion, error, and timeout
   * @param timeoutMs - Maximum execution time in ms (default: 5000)
   */
  execute(
    code: string,
    callbacks: JSRunnerCallbacks,
    timeoutMs: number = DEFAULT_TIMEOUT_MS,
  ): void {
    // Terminate any previous execution
    this.cancel();

    if (this.disposed) {
      throw new Error('JSRunner has been disposed');
    }

    this.executionId++;
    const currentId = `exec-${this.executionId}`;

    // Create a Blob URL for the inline worker source
    const blob = new Blob([WORKER_SOURCE], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);

    try {
      this.worker = new Worker(url);

      // Handle messages from the worker
      this.worker.onmessage = (e: MessageEvent<WorkerMessage>) => {
        const msg = e.data;

        switch (msg.type) {
          case 'output':
            callbacks.onOutput(msg.method, msg.text);
            break;

          case 'done':
            this.clearTimeout();
            callbacks.onDone(msg.id, msg.exitCode);
            this.cleanup();
            break;

          case 'error':
            this.clearTimeout();
            callbacks.onError(msg.error, msg.stack);
            this.cleanup();
            break;
        }
      };

      // Handle worker errors (syntax errors in Blob URL, etc.)
      this.worker.onerror = (e: ErrorEvent) => {
        this.clearTimeout();
        callbacks.onError(e.message || 'Unknown worker error');
        this.cleanup();
      };

      // Set timeout for runaway code
      this.timeoutHandle = setTimeout(() => {
        callbacks.onTimeout();
        this.terminateWorker();
      }, timeoutMs);

      // Send the code to the worker
      this.worker.postMessage({ code, id: currentId });
    } catch (err) {
      // If Worker creation fails (e.g., CSP), report as error
      callbacks.onError(
        err instanceof Error ? err.message : 'Failed to create Web Worker',
      );
      this.cleanup();
    } finally {
      // Release the Blob URL — worker has already loaded the code
      URL.revokeObjectURL(url);
    }
  }

  /**
   * Cancel the current execution (terminates the worker).
   * Safe to call even if nothing is running.
   */
  cancel(): void {
    this.clearTimeout();
    this.terminateWorker();
  }

  /**
   * Dispose of the runner. After calling this, execute() will throw.
   */
  dispose(): void {
    this.cancel();
    this.disposed = true;
  }

  // ─── Private Helpers ────────────────────────────────────────

  private clearTimeout(): void {
    if (this.timeoutHandle !== null) {
      clearTimeout(this.timeoutHandle);
      this.timeoutHandle = null;
    }
  }

  private terminateWorker(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
  }

  private cleanup(): void {
    this.clearTimeout();
    this.worker = null;
  }
}

// ─── Singleton Instance ─────────────────────────────────────────

/**
 * Global JSRunner instance.
 * A single instance is sufficient — only one execution runs at a time,
 * and the previous one is cancelled when a new one starts.
 */
export const jsRunner = new JSRunner();
