# CodeCraft — Code Runner & Language Support Research Report

**Task ID:** 3  
**Agent:** Code-Runner-Research-3  
**Date:** 2026-05-28  

---

## Table of Contents

1. [Browser-Based Code Execution](#1-browser-based-code-execution)
2. [Language Support via Browser-Side Libraries](#2-language-support-via-browser-side-libraries)
3. [Recommended Execution Architecture](#3-recommended-execution-architecture)
4. [Terminal Emulation](#4-terminal-emulation)
5. [Phase 0 Scope — JavaScript Only](#5-phase-0-scope--javascript-only)
6. [Live Preview for Web Projects](#6-live-preview-for-web-projects)

---

## 1. Browser-Based Code Execution

### 1.1 JavaScript Execution Strategies

| Strategy | Isolation | Main Thread | Terminatable | Verdict |
|----------|-----------|-------------|--------------|---------|
| `eval()` | None | Yes | No | ❌ Never use |
| `Function` constructor | None | Yes | No | ⚠️ Unsafe |
| Sandboxed iframe + postMessage | Good | Yes (blocks UI) | Partial | ✅ Good for preview |
| **Web Worker + Function** | **Good** | **No (off-thread)** | **Yes (terminate)** | **✅ Best for execution** |

### 1.2 Security: Web Worker Sandboxing

```js
// Inside worker — strip dangerous APIs
delete self.importScripts;
delete self.XMLHttpRequest;
delete self.fetch;
```

### 1.3 Console Output Capture

- Override `console` entirely in `new Function('console', code)` wrapper
- Support: log, error, warn, info, debug, table, dir, clear, assert, time/timeEnd
- Serialize objects with JSON.stringify, handle circular refs
- Enforce output size limit (1 MB default)

### 1.4 Execution Timeout Handling

**Best: Combination approach**
- Loop counter injection (soft limit — friendly error)
- `worker.terminate()` after timeout (hard limit — kills stuck code)

---

## 2. Language Support via Browser-Side Libraries

### 2.1 JavaScript / TypeScript

| Solution | Size | Notes |
|----------|------|-------|
| JS Execution (native Worker) | 0 KB | Built-in |
| **Sucrase** (TS stripping) | ~150 KB | Fast, dev-focused |
| @swc/wasm-web | ~2.5 MB | Full transpilation |
| esbuild-wasm | ~12 MB | Full bundler |

**Recommendation:** Sucrase for Phase 0 (fast TS stripping).

### 2.2 Python

| Library | Size | Web Worker | stdlib | pip |
|---------|------|------------|--------|-----|
| **Pyodide** ⭐ | ~12 MB | ✅ | ✅ Most | ✅ Micropip |
| Brython | ~1.5 MB | ⚠️ | ❌ Partial | ❌ |
| Skulpt | ~500 KB | ✅ | ❌ Very limited | ❌ |

### 2.3 Language Support Summary Matrix

| Language | Phase | Library | Size | Web Worker | Maturity |
|----------|-------|---------|------|------------|----------|
| JavaScript | 0 | Native (Worker) | 0 KB | ✅ | ⭐⭐⭐⭐⭐ |
| TypeScript | 0 | Sucrase | ~150 KB | ✅ | ⭐⭐⭐⭐⭐ |
| Python | 1 | Pyodide | ~12 MB | ✅ | ⭐⭐⭐⭐⭐ |
| C | 2 | JSCPP | ~20 MB | ✅ | ⭐⭐ |
| C++ | 3 | CheerpX | ~30 MB | ⚠️ | ⭐⭐⭐⭐ |
| Lua | 2 | wasmoon | ~460 KB | ✅ | ⭐⭐⭐⭐ |
| Ruby | 2 | Opal | ~2 MB | ✅ | ⭐⭐⭐⭐ |
| Java | 3 | CheerpJ | ~20 MB | ⚠️ | ⭐⭐⭐⭐ |
| PHP | 3 | @php-wasm/web | ~25 MB | ⚠️ | ⭐⭐⭐ |
| Rust | 3 | N/A (pre-compiled) | Varies | ✅ | ⭐⭐ |
| Go | 3 | N/A (pre-compiled) | Varies | ✅ | ⭐⭐ |

---

## 3. Recommended Execution Architecture

### 3.1 Architecture Overview

```
Main Thread
  ├── Editor (CodeMirror 6)
  ├── xterm.js (Output)
  ├── Iframe Preview (HTML/CSS/JS)
  └── Execution Manager
       ├── Dispatches code to workers
       ├── Routes output to xterm/preview
       └── Manages timeouts & limits
            │ postMessage
            ▼
       Worker Pool
       ├── Worker 1 (JS/TS)
       ├── Worker 2 (Pyodide)
       └── Worker N (Lua...)
```

### 3.2 Unified Language Interface

```typescript
interface LanguageAdapter {
  language: string;
  fileExtensions: string[];
  init(worker: DedicatedWorkerGlobalScope): Promise<void>;
  execute(code: string, stdin?: string): Promise<ExecutionResult>;
  isReady(): boolean;
  getWorkerScript(): string;
}
```

### 3.3 Communication Protocol

```typescript
// Main → Worker
type WorkerRequest = 
  | { type: 'execute'; id: string; code: string; language: string; stdin?: string }
  | { type: 'stdin'; id: string; data: string }
  | { type: 'kill'; id: string };

// Worker → Main
type WorkerResponse =
  | { type: 'stdout'; id: string; data: string }
  | { type: 'stderr'; id: string; data: string }
  | { type: 'result'; id: string; returnValue?: unknown; exitCode: number }
  | { type: 'error'; id: string; error: string; stack?: string }
  | { type: 'timeout'; id: string }
  | { type: 'ready'; language: string };
```

---

## 4. Terminal Emulation

### 4.1 xterm.js Integration

| Package | Version | Purpose |
|---------|---------|---------|
| `@xterm/xterm` | 6.0.0 | Core terminal emulator |
| `@xterm/addon-fit` | 0.11.0 | Auto-resize |

- Console methods mapped to ANSI colors: errors=red, warnings=yellow, info=cyan
- Support keyboard input (stdin) via `term.onData()`
- Phase 2 feature (Phase 0 uses simple console output panel)

---

## 5. Phase 0 Scope — JavaScript Only

### 5.1 Simplest Approach

**Blob-URL Web Worker with console capture:**

```typescript
const WORKER_CODE = `
'use strict';
delete self.importScripts;
// ... mock console, new Function('console', code), output capture
`;

export class JSRunner {
  private worker: Worker | null = null;
  
  async execute(code: string, options: { timeout?: number } = {}): Promise<void> {
    this.kill();
    this.worker = this.createWorker();
    // ... timeout + message handling
    this.worker.postMessage({ type: 'execute', id: Date.now().toString(), code });
  }
  
  kill(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
  }
}
```

### 5.2 What to Defer

| Feature | Phase | Reason |
|---------|-------|--------|
| Python (Pyodide) | Phase 1 | Large WASM download |
| Multi-file module resolution | Phase 1 | Need virtual FS + import map |
| stdin support | Phase 1 | Requires xterm input handling |
| C/C++ support | Phase 2 | JSCPP or CheerpX integration |
| Lua (wasmoon) | Phase 2 | Easy to add, small WASM |
| Ruby (Opal) | Phase 2 | Moderate effort |
| Java/CheerpJ | Phase 3 | Heavy runtime |
| PHP | Phase 3 | Very large WASM |

---

## 6. Live Preview for Web Projects

### 6.1 Sandboxed iframe with srcdoc (Phase 0)

```tsx
function LivePreview({ html, css, js }: { html: string; css: string; js: string }) {
  const srcdoc = `
    <!DOCTYPE html>
    <html>
    <head><style>${css}</style></head>
    <body>
      ${html}
      <script>try { ${js} } catch(e) { document.body.innerHTML += '<pre style="color:red">Error: ' + e.message + '</pre>'; }</script>
    </body>
    </html>
  `;

  return (
    <iframe
      sandbox="allow-scripts allow-modals"
      srcDoc={srcdoc}
      style={{ width: '100%', height: '100%', border: 'none' }}
    />
  );
}
```

### 6.2 Key Rules

- **NEVER add `allow-same-origin`** to sandbox flags (breaks isolation)
- Use `srcdoc` for Phase 0 (simpler), Blob URL for Phase 1+ (more flexible)
- **Debounced auto-refresh** (300ms) on file changes
- **importmap + esm.sh CDN** for resolving module imports in preview
