# Code Editor: Component, Language, Execution & Tooling Research Report

> **Sub-Agent 2 Report** | Editor & Execution Research  
> **Date:** 2026-03-04  
> **Project:** Lightweight browser-based code editor (Notepad++ style, React + Vite, GitHub Pages)

---

## Table of Contents

1. [Editor Component: CodeMirror 6 vs Monaco Editor](#1-editor-component-codemirror-6-vs-monaco-editor)
2. [Syntax Highlighting & Language Support](#2-syntax-highlighting--language-support)
3. [Code Execution (Browser-Based Only)](#3-code-execution-browser-based-only)
4. [Code Formatting](#4-code-formatting)
5. [Linting](#5-linting)
6. [Emmet Support](#6-emmet-support)
7. [Summary & Key Recommendations](#7-summary--key-recommendations)

---

## 1. Editor Component: CodeMirror 6 vs Monaco Editor

### 1.1 Bundle Size Comparison

| Metric | CodeMirror 6 | Monaco Editor |
|--------|--------------|---------------|
| **Core (gzipped)** | ~116 KB (`codemirror` base package) | ~2,000–5,000 KB (full) |
| **Core + View (gzipped)** | ~77 KB (`@codemirror/view`) | — (bundled in full) |
| **Full editor with basic setup** | ~200–350 KB gzipped | ~3–5 MB gzipped |
| **Tree-shakeable** | ✅ Yes — only import what you use | ❌ No — monolithic bundle |
| **Lazy-load languages** | ✅ Native dynamic `import()` | ⚠️ Difficult / not officially supported |
| **Typical prod bundle** | 200–400 KB | 3–5 MB |

**Key insight:** Monaco's bundle is roughly **10–15× larger** than CodeMirror 6. For a GitHub Pages deployment where every kilobyte affects Time to Interactive, this is a decisive difference. Multiple sources (Sourcegraph, Replit, PkgPulse) confirm Monaco contributes 50+ MB to source builds and ~3–5 MB gzipped. One Reddit user reported Monaco was "about 70% of my total bundle size."

### 1.2 Mobile / Touch Support

| Feature | CodeMirror 6 | Monaco Editor |
|---------|--------------|---------------|
| **Mobile touch support** | ✅ Excellent — designed for it | ❌ Poor — not designed for mobile |
| **Virtual keyboard handling** | ✅ Works well | ⚠️ Issues on Android/iOS |
| **Responsive layout** | ✅ CSS-based, easy to resize | ⚠️ Requires manual workarounds |
| **Tablet usability** | ✅ Good | ⚠️ Subpar |

CodeMirror 6 was rewritten from the ground up with mobile support as a first-class concern. The editor uses contenteditable and properly handles IME input, virtual keyboards, and touch selections. Monaco was built as a desktop editor (it powers VS Code) and has well-known mobile deficiencies — it's effectively unusable on phones.

**For a tool targeting students (who may use tablets/phones), CodeMirror 6 is the clear choice.**

### 1.3 Language Support Breadth

| Aspect | CodeMirror 6 | Monaco Editor |
|--------|--------------|---------------|
| **Built-in language modes** | 143 via `@codemirror/language-data` | ~50+ built-in (Monarch grammars) |
| **Community grammars** | Growing (Lezer + StreamLanguage fallback) | Large (Monarch community) |
| **Custom grammar authoring** | Lezer grammar system (LR parser) | Monarch (declarative tokenizer) |
| **Legacy mode compatibility** | ✅ StreamLanguage wrapper for CM5 modes | — |

Both editors cover all mainstream languages. CodeMirror 6 has the edge in breadth (143 languages) and its `@codemirror/language-data` package provides a convenient registry with dynamic imports for all of them. Monaco has strong IntelliSense for TypeScript/JavaScript but is more limited for niche languages.

### 1.4 Extensibility

| Extension Type | CodeMirror 6 | Monaco Editor |
|---------------|--------------|---------------|
| **Emmet** | ✅ `@emmetio/codemirror6-plugin` (v0.4.0) | Community, less official |
| **Linting framework** | ✅ `@codemirror/lint` (v6.9.6) — built-in | `monaco.editor.onMarker` |
| **Code formatting** | ✅ via extensions + Prettier worker | Via registerDocumentFormattingEditProvider |
| **Autocomplete** | ✅ `@codemirror/autocomplete` | Built-in (strong for JS/TS) |
| **Collaborative editing** | ✅ `@codemirror/collab` | Possible but harder |
| **Theme system** | ✅ Extension-based, CSS variables | JSON theme definition |

CodeMirror 6's extension system is **fundamentally more composable**. Every feature (keymap, linting, highlighting, etc.) is an extension that can be mixed and matched. Monaco uses a more traditional API surface that's harder to compose.

### 1.5 Performance with Large Files

| Aspect | CodeMirror 6 | Monaco Editor |
|--------|--------------|---------------|
| **Large file handling** | Good (viewport rendering) | Good (viewport rendering) |
| **Memory usage** | Lower (~30–50 MB for large files) | Higher (~100+ MB for large files) |
| **Initial load time** | Fast (200 KB) | Slow (3–5 MB) |
| **Parse performance** | Incremental via Lezer | Full re-parse sometimes |

Both editors use viewport-based rendering (only rendering visible lines), so both handle large files reasonably well. However, CodeMirror 6's incremental Lezer parsing gives it an edge in responsiveness when editing, and its dramatically smaller footprint means less memory pressure overall.

### 1.6 React Integration Quality

| Package | Version | Quality |
|---------|---------|---------|
| `@uiw/react-codemirror` | 4.25.10 | ✅ Excellent — well-maintained, wraps CM6 fully |
| `@codemirror/view` (direct) | 6.43.0 | ✅ Works with `useEffect` + `useRef` |
| `@monaco-editor/react` | 4.7.0 | ✅ Good — well-maintained wrapper |

`@uiw/react-codemirror` is the recommended React wrapper for CodeMirror 6. It provides:
- `CodeMirror` component with `value`, `onChange`, `extensions`, `theme` props
- `useCodeMirror` hook for imperative control
- Full TypeScript support
- Active maintenance (100+ releases)

### 1.7 Tree-Shaking Support

CodeMirror 6 is published as ES modules with explicit exports. Vite (Rollup under the hood) can tree-shake unused language modes, themes, and extensions effectively. Monaco is a monolithic bundle — tree-shaking is not possible.

### 1.8 Recommendation: **CodeMirror 6**

**Verdict: CodeMirror 6 is the clear winner for this project.**

| Criterion | Winner | Why |
|-----------|--------|-----|
| Bundle size | **CM6** | 10–15× smaller; critical for GitHub Pages |
| Mobile support | **CM6** | First-class; Monaco is desktop-only |
| Language breadth | **CM6** | 143 languages via language-data |
| Extensibility | **CM6** | Composable extension system |
| React integration | **CM6** | `@uiw/react-codemirror` is excellent |
| Tree-shaking | **CM6** | Full ESM support |
| IntelliSense (JS/TS) | Monaco | Stronger built-in, but not critical for our use case |
| Performance | **CM6** | Smaller footprint, incremental parsing |

Monaco's only real advantage (IntelliSense for JS/TS) does not outweigh its massive bundle size and poor mobile support for a lightweight, browser-only editor.

---

## 2. Syntax Highlighting & Language Support

### 2.1 How Many Languages Does CodeMirror 6 Support?

The `@codemirror/language-data` package (v6.5.2) provides **143 languages** out of the box. These include:

**Official `@codemirror/lang-*` packages** (22 with native Lezer grammars):
- JavaScript/JSX/TypeScript/TSX, Python, HTML, CSS, C/C++, Java, Go, Rust, SQL, JSON, Markdown, PHP, XML, YAML, Less, Sass/SCSS, Vue, Angular, Jinja, Liquid, WebAssembly (WAT)

**Legacy StreamLanguage modes** (121 additional languages via `@codemirror/legacy-modes`):
- C#, Ruby, Swift, Kotlin, Scala, Perl, Lua, Shell/Bash, R, Dart, Fortran, Haskell, Erlang, Clojure, Scheme, OCaml, F#, Cobol, Smalltalk, and many more.

### 2.2 How Lezer Grammar System Works

Lezer is CodeMirror 6's parsing system, inspired by Tree-sitter. Key concepts:

1. **Grammar Definition**: Languages are defined in `.grammar` files using a declarative LR(1) grammar syntax
2. **Parse Table Generation**: The `lezer-generator` tool compiles grammars into efficient parse tables
3. **Incremental Parsing**: Lezer reuses previous parse results, only re-parsing changed regions — this is key for editor performance
4. **Syntax Tree**: Produces a concrete syntax tree that CodeMirror uses for highlighting, indentation, and code folding
5. **Mixed Language Parsing**: Supports nested grammars (e.g., JavaScript inside HTML inside Markdown)

**Example: Minimal Lezer grammar structure:**
```
@top Program { expression }
expression { Number | AddExpr }
AddExpr { expression "+" expression }
@tokens { Number { @digit+ } }
```

### 2.3 How to Add Custom Language Modes

**Option A: Write a Lezer grammar (recommended for quality)**
```bash
npm install lezer-generator
# Write your .grammar file
# Generate parser: lezer-generator mylang.grammar -o mylang.js
```

**Option B: Use StreamLanguage wrapper (quick port from CM5)**
```typescript
import { StreamLanguage } from '@codemirror/language';
import { myLegacyMode } from './my-legacy-mode';

const myLang = StreamLanguage.define(myLegacyMode);
```

StreamLanguage wraps CodeMirror 5-style stateful tokenizers, making it easy to port existing modes. It's less efficient than native Lezer grammars but works well for less common languages.

**Option C: Use `@codemirror/lang-*/codemirror-lang-*` community packages**
Several community packages exist for languages not in the official set (e.g., `codemirror-lang-elixir`, `codemirror-lang-toml`).

### 2.4 Most Important Languages to Support (25+ Priority List)

| Tier | Languages | Rationale |
|------|-----------|-----------|
| **Tier 1 (Must-have)** | JavaScript, TypeScript, HTML, CSS, Python | Most widely used; students + professionals |
| **Tier 1 (Must-have)** | JSON, Markdown, SQL | Ubiquitous data/config languages |
| **Tier 2 (Important)** | Java, C, C++, C#, Go, Rust | Core programming languages |
| **Tier 2 (Important)** | PHP, Ruby, Swift, Kotlin | Popular backend/mobile languages |
| **Tier 2 (Important)** | Shell/Bash, YAML, XML | DevOps / config essential |
| **Tier 3 (Nice-to-have)** | Sass/SCSS, Less, Lua, Perl, R, Dart | Specialist but common |
| **Tier 3 (Nice-to-have)** | Scala, Haskell, Erlang, Clojure, Fortran | Niche / academic |
| **Tier 3 (Nice-to-have)** | Dockerfile, TOML, GraphQL, Vue | DevOps / modern frameworks |

### 2.5 Strategy for Lazy-Loading Language Support

**Recommended approach: Use `@codemirror/language-data` with dynamic imports.**

```typescript
import { LanguageDescription } from '@codemirror/language';
import { languages } from '@codemirror/language-data';

// languages is an array of LanguageDescription objects
// Each has a .load() method that returns a dynamic import Promise

async function getLanguageExtension(fileName: string) {
  const desc = LanguageDescription.matchFilename(languages, fileName);
  if (desc) {
    return await desc.load(); // Dynamic import — only loads what's needed
  }
  return [];
}
```

**Implementation strategy:**
1. **Never import all languages at once.** The `@codemirror/language-data` package uses dynamic `import()` internally for each language.
2. **Detect language from file extension** using `LanguageDescription.matchFilename()`.
3. **Load on demand** when user opens a file or switches language mode.
4. **Cache loaded language extensions** in a `Map<string, LanguageSupport>` so they're only fetched once.
5. **Vite code-splitting** automatically creates separate chunks for each language — the browser only downloads what's needed.

**Bundle impact estimate:**
- Core editor: ~300 KB gzipped
- Each additional language: 5–30 KB gzipped (Lezer grammars are small)
- Loading 5 common languages: ~400 KB total
- All 143 languages would be ~2 MB but never loaded at once

---

## 3. Code Execution (Browser-Based Only)

### 3.1 JavaScript/TypeScript

**Recommended: Sandboxed iframe with `srcdoc`**

```typescript
function executeJavaScript(code: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const iframe = document.createElement('iframe');
    iframe.sandbox.add('allow-scripts'); // No allow-same-origin for isolation
    iframe.style.display = 'none';
    
    const html = `
      <html><body><script>
        try {
          const _output = [];
          const console = { log: (...a) => _output.push(a.join(' ')), error: (...a) => _output.push('Error: ' + a.join(' ')) };
          const _result = eval(${JSON.stringify(code)});
          parent.postMessage({ type: 'result', output: _output.join('\\n'), result: String(_result) }, '*');
        } catch(e) {
          parent.postMessage({ type: 'error', message: e.message, stack: e.stack }, '*');
        }
      <\/script></body></html>`;
    
    iframe.srcdoc = html;
    document.body.appendChild(iframe);
    
    window.addEventListener('message', function handler(e) {
      if (e.source === iframe.contentWindow) {
        resolve(JSON.stringify(e.data));
        window.removeEventListener('message', handler);
        iframe.remove();
      }
    });
    
    setTimeout(() => { iframe.remove(); reject(new Error('Timeout')); }, 10000);
  });
}
```

**Alternative: QuickJS in WebAssembly** (`@sebastianwessel/quickjs` v3.0.1)
- Full sandbox via WASM — no access to DOM or browser APIs
- Supports both JS and TS execution
- ~300 KB gzipped for the WASM binary
- Better security isolation than iframe
- **Best for untrusted code execution**

**Alternative: Web Worker**
- Runs JS in a separate thread (no UI blocking)
- Has `importScripts()` but no DOM access
- Good for compute-heavy tasks
- Can be combined with iframe sandboxing

**TypeScript execution:** Use the `esbuild-wasm` or `sucrase` package to transpile TS → JS in-browser, then execute the resulting JS.

### 3.2 Python — Pyodide

**Engine:** Pyodide (v0.29.4) — CPython compiled to WebAssembly

| Aspect | Detail |
|--------|--------|
| **How it works** | Full CPython interpreter compiled to WASM; runs in a Web Worker |
| **Download size** | ~12–20 MB (core); +packages for numpy/pandas etc. |
| **Startup time** | 2–5 seconds for initial load |
| **Execution speed** | 3–5× slower than native Python |
| **Packages** | 400+ scientific packages pre-built (numpy, pandas, matplotlib, etc.) |
| **Limitations** | No filesystem access, no C extensions not compiled for WASM, no threading, no networking |

**Implementation:**
```typescript
async function executePython(code: string) {
  const pyodide = await loadPyodide();
  // Redirect stdout
  pyodide.runPython(`
    import sys
    from io import StringIO
    sys.stdout = StringIO()
    sys.stderr = StringIO()
  `);
  try {
    const result = pyodide.runPython(code);
    const stdout = pyodide.runPython('sys.stdout.getvalue()');
    const stderr = pyodide.runPython('sys.stderr.getvalue()');
    return { result, stdout, stderr };
  } catch (e) {
    return { error: e.message };
  }
}
```

**Strategy for our project:** Lazy-load Pyodide on demand. Download the ~12 MB WASM bundle only when the user first runs Python code. Cache the Pyodide instance in a Web Worker for subsequent runs.

### 3.3 C/C++ — JSCPP

**Engine:** JSCPP (v2.0.9) — A simple C++ interpreter written in JavaScript

| Aspect | Detail |
|--------|--------|
| **How it works** | Pure JavaScript C++ interpreter (no WASM) |
| **Download size** | ~50 KB gzipped |
| **Language support** | C++ subset: variables, functions, arrays, pointers, classes, basic STL |
| **Limitations** | No templates, no exceptions, no preprocessor (#include is limited), no STL containers beyond basic array, no multithreading, no extern |
| **Execution quality** | Adequate for learning/teaching; NOT production-grade |

**Verdict:** JSCPP is viable for **educational purposes only**. It can run simple programs (factorial, sorting, basic class examples) but will fail on anything using templates, complex STL, or modern C++. For students learning C/C++ basics, it's reasonable. For professionals, it's insufficient.

**Alternative:** CheerpX can run real GCC/Clang via x86 virtualization (see below), but at a massive size cost.

### 3.4 Java — CheerpJ

**Engine:** CheerpJ (v3.1+) — Full WebAssembly-based JVM

| Aspect | Detail |
|--------|--------|
| **How it works** | Complete JVM (OpenJDK) compiled to WASM; runs real Java bytecode |
| **Download size** | ~10–30 MB for the JVM runtime |
| **Startup time** | 5–15 seconds |
| **Execution quality** | Full Java compatibility — runs real compiled .class files |
| **Limitations** | Large download, slow startup, no direct filesystem (virtual FS), no native JNI |

**Verdict:** CheerpJ is technically impressive but the 10–30 MB download makes it **not worth it** for a lightweight editor. Only consider if Java execution is a hard requirement.

### 3.5 Go

**Engine:** Hackpad/Go WASM — Go compiler cross-compiled to WebAssembly

| Aspect | Detail |
|--------|--------|
| **How it works** | Go compiler (`go build`) compiled to WASM; can compile and run Go programs in-browser |
| **Download size** | ~30–50 MB for the Go toolchain WASM |
| **Feasibility** | Technically possible (Hackpad demo proves it) but impractically large |

**Verdict:** **Not feasible** for a lightweight editor. The Go compiler WASM is too large. A simple Go interpreter for the browser does not currently exist in a usable form.

### 3.6 Rust

**Engine:** No practical in-browser Rust compiler exists.

| Aspect | Detail |
|--------|--------|
| **Rust Playground** | Uses a server-side compiler (not browser-based) |
| **rustc → WASM** | The Rust compiler itself can be compiled to WASM, but it's enormous (>100 MB) |
| **Alternative** | Simple Rust interpreter? None exists for the browser. |

**Verdict:** **Not feasible** for browser-based execution. Rust compilation requires LLVM, which is far too heavy for browser deployment. Syntax highlighting and linting are still fully supported via `@codemirror/lang-rust`.

### 3.7 Ruby

**Engine:** ruby.wasm — Official CRuby compiled to WebAssembly

| Aspect | Detail |
|--------|--------|
| **How it works** | CRuby interpreter compiled to WASM |
| **Download size** | ~5–15 MB (varies by build; "minimal" is smaller) |
| **Startup time** | 3–8 seconds |
| **Execution quality** | Full Ruby compatibility; runs standard Ruby code |
| **Limitations** | No C extensions, no filesystem, no networking; large download |

**Alternative: Opal** — Ruby-to-JavaScript transpiler
- Compiles Ruby code to JavaScript, then executes it
- Much smaller footprint (~200 KB)
- But: Not full Ruby compatibility, some features missing
- Better for quick execution of simple Ruby scripts

**Verdict:** ruby.wasm is **feasible but heavy**. Opal is lighter but incomplete. For a lightweight editor, Opal is the more practical choice for simple scripts; ruby.wasm for full compatibility at a size cost.

### 3.8 PHP

**Engine:** php-wasm (seanmorris/php-wasm) — PHP compiled to WebAssembly

| Aspect | Detail |
|--------|--------|
| **How it works** | PHP interpreter compiled to WASM via Emscripten |
| **Download size** | ~10–20 MB |
| **Execution quality** | Full PHP 8.2+ support; runs real PHP code |
| **Features** | Can run in CLI mode or CGI mode |

**Verdict:** **Feasible but heavy.** php-wasm works well but the ~15 MB download is significant. Consider lazy-loading and only fetching when the user explicitly runs PHP.

### 3.9 Feasibility Matrix

| Language | Engine | Bundle Size (approx.) | Execution Quality | Feasibility | Recommendation |
|----------|--------|-----------------------|-------------------|-------------|----------------|
| **JavaScript** | Sandboxed iframe / QuickJS WASM | 0 KB / ~300 KB | ⭐⭐⭐⭐⭐ | ✅ Excellent | **Ship with iframe; offer QuickJS for sandboxed mode** |
| **TypeScript** | Sucrase transpile → JS eval | ~200 KB | ⭐⭐⭐⭐ | ✅ Great | **Ship — transpile then eval** |
| **Python** | Pyodide (CPython WASM) | ~12 MB | ⭐⭐⭐⭐ | ✅ Good | **Lazy-load on demand** |
| **C/C++** | JSCPP interpreter | ~50 KB | ⭐⭐ | ⚠️ Limited | **Include for basic use; warn about limitations** |
| **Java** | CheerpJ (JVM WASM) | ~15 MB | ⭐⭐⭐⭐ | ⚠️ Heavy | **Skip for v1; consider as premium feature** |
| **Go** | Go WASM compiler | ~40 MB | ⭐⭐⭐ | ❌ Impractical | **Skip — no lightweight option** |
| **Rust** | None practical | N/A | ⭐ | ❌ Not feasible | **Skip — syntax-only support** |
| **Ruby** | Opal (transpiler) / ruby.wasm | ~200 KB / ~10 MB | ⭐⭐⭐ / ⭐⭐⭐⭐ | ✅/⚠️ | **Opal for basic; ruby.wasm lazy-load for full** |
| **PHP** | php-wasm | ~15 MB | ⭐⭐⭐⭐ | ⚠️ Heavy | **Lazy-load on demand** |

### 3.10 Recommended Execution Strategy

**Tier 1 — Ship immediately (zero or minimal extra bundle):**
- JavaScript (iframe sandbox)
- TypeScript (Sucrase + iframe)
- HTML (live preview in iframe)

**Tier 2 — Lazy-load on first use (user clicks "Run"):**
- Python (Pyodide, ~12 MB)
- C/C++ (JSCPP, ~50 KB — small enough to include but limited)

**Tier 3 — Available but clearly labeled as "heavy download":**
- Ruby (ruby.wasm or Opal)
- PHP (php-wasm)

**Tier 4 — Syntax highlighting only (no execution):**
- Go, Rust, Java, C#, Swift, Kotlin, Scala, and all others

---

## 4. Code Formatting

### 4.1 Prettier Integration (Browser-Compatible)

Prettier officially supports browser execution via its **standalone build**.

**Package:** `prettier` (v3.8.3) — standalone API works in browser

```typescript
import * as prettier from 'prettier';

async function formatCode(code: string, language: string) {
  const formatted = await prettier.format(code, {
    parser: language, // 'javascript', 'typescript', 'css', 'html', 'json', 'markdown', etc.
    semi: true,
    singleQuote: true,
    tabWidth: 2,
    // No config file support in browser — must pass options explicitly
  });
  return formatted;
}
```

**Supported languages in browser:** JavaScript, TypeScript, JSX, CSS, SCSS, Less, HTML, JSON, Markdown, YAML, GraphQL, Vue

**Browser bundle size:** ~600 KB–1 MB for the standalone build (includes all built-in parsers). This is significant but can be loaded in a Web Worker.

**Limitations of Prettier standalone:**
- No config file support (must pass options as arguments)
- No plugin support for external parsers (only built-in parsers work)
- No `.prettierignore` support
- Some third-party plugins (e.g., `prettier-plugin-java`) require Node.js and won't work

### 4.2 Language-Specific Formatters in Browser

| Language | Formatter | Browser-OK? | Size |
|----------|-----------|-------------|------|
| JS/TS | Prettier standalone | ✅ | ~600 KB |
| HTML | Prettier / js-beautify | ✅ | ~50 KB (js-beautify) |
| CSS | Prettier / js-beautify | ✅ | ~50 KB (js-beautify) |
| JSON | Prettier / built-in `JSON.stringify(obj, null, 2)` | ✅ | 0 KB (native) |
| SQL | sql-formatter | ✅ | ~50 KB |
| Python | No good browser formatter | ❌ | — |
| Go | No browser formatter | ❌ | — |
| Rust | rustfmt → No browser version | ❌ | — |

**Recommendation:** Use **Prettier standalone** for JS/TS/HTML/CSS/JSON/MD/YAML and **js-beautify** as a lightweight fallback. For other languages, offer basic indentation-based formatting only.

### 4.3 Running Formatters in a Web Worker

**Critical:** Formatting can block the UI thread for 50–200ms on large files. Web Workers are essential.

```typescript
// formatter.worker.ts
import * as prettier from 'prettier';

self.onmessage = async (e) => {
  const { code, language, options } = e.data;
  try {
    const formatted = await prettier.format(code, {
      parser: language,
      ...options,
    });
    self.postMessage({ type: 'success', result: formatted });
  } catch (error) {
    self.postMessage({ type: 'error', message: error.message });
  }
};
```

```typescript
// Main thread
const worker = new Worker(new URL('./formatter.worker.ts', import.meta.url), { type: 'module' });

function formatWithWorker(code: string, language: string) {
  return new Promise((resolve, reject) => {
    worker.onmessage = (e) => {
      if (e.data.type === 'success') resolve(e.data.result);
      else reject(new Error(e.data.message));
    };
    worker.postMessage({ code, language });
  });
}
```

**Key considerations:**
- Create the Web Worker lazily (on first format request) to avoid loading Prettier upfront
- Reuse the same worker instance across format requests
- Add a timeout (5 seconds) to handle runaway formatting
- Prettier's WASM parser (used internally) works fine in Web Workers

### 4.4 Format on Save vs Format on Demand

**Recommended: Both, with user configuration.**

```typescript
// Configuration
interface EditorConfig {
  formatOnSave: boolean;       // default: true
  formatOnType: boolean;       // default: false (can be distracting)
  formatter: 'prettier' | 'basic' | 'none';
}
```

**Format on Save** (default on):
- Trigger when user presses Ctrl+S / Cmd+S
- Format the document, then show the result
- If formatting fails (syntax error), show a notification but don't block save

**Format on Demand:**
- Button in toolbar or keyboard shortcut (Shift+Alt+F)
- Format the current document immediately
- Show formatting errors inline

**Basic indentation formatting** (for languages without Prettier support):
```typescript
function basicFormat(code: string, indent: string = '  '): string {
  // Simple brace-level indentation
  let level = 0;
  return code.split('\n').map(line => {
    const trimmed = line.trim();
    if (trimmed.startsWith('}') || trimmed.startsWith(']') || trimmed.startsWith(')')) level--;
    const formatted = indent.repeat(Math.max(0, level)) + trimmed;
    if (trimmed.endsWith('{') || trimmed.endsWith('[') || trimmed.endsWith('(')) level++;
    return formatted;
  }).join('\n');
}
```

---

## 5. Linting

### 5.1 ESLint in the Browser — Is It Feasible?

**Yes, but with caveats.** ESLint is not officially designed for browser use, but the community has made it work.

**Package:** `eslint-linter-browserify` (v10.4.0)

This is a browserified build of ESLint's core `Linter` class. It works entirely in the browser without Node.js.

```typescript
import { Linter } from 'eslint-linter-browserify';

const linter = new Linter();

const code = 'const x = 1;';
const messages = linter.verify(code, {
  parserOptions: { ecmaVersion: 2024, sourceType: 'module' },
  rules: {
    'no-unused-vars': 'warn',
    'no-undef': 'error',
    'semi': ['error', 'always'],
  },
}, { filename: 'example.js' });

// messages: [{ ruleId: 'semi', severity: 1, message: "...", line: 1, column: 12 }]
```

**Size:** ~2–3 MB for the browserified ESLint bundle. This is heavy but can be lazy-loaded.

**Limitations:**
- No filesystem access (no `.eslintrc` loading from disk)
- No custom parser plugins (e.g., `@typescript-eslint/parser`) — wait, actually `eslint-linter-browserify` does include TypeScript parser support
- No custom rule plugins
- Must define rules inline in code
- Some rules that depend on file context (e.g., `import/no-unresolved`) won't work

**Verdict:** Feasible for basic JavaScript/TypeScript linting with built-in rules. Load it lazily in a Web Worker.

### 5.2 CodeMirror 6 Lint Integration

**Package:** `@codemirror/lint` (v6.9.6)

This provides the UI framework for displaying lint diagnostics in the editor:

```typescript
import { linter, lintGutter, lintKeymap } from '@codemirror/lint';
import { Linter } from 'eslint-linter-browserify';

const eslintLinter = linter(async (view) => {
  const code = view.state.doc.toString();
  const linter = new Linter();
  const messages = linter.verify(code, {
    parserOptions: { ecmaVersion: 2024, sourceType: 'module' },
    rules: { 'no-unused-vars': 'warn', 'semi': 'error' },
  });
  
  return messages.map(msg => ({
    from: Math.min(view.state.doc.line(msg.line).from + msg.column - 1, view.state.doc.length),
    to: view.state.doc.line(msg.line).to,
    severity: msg.severity === 1 ? 'warning' : 'error',
    message: msg.message,
    source: msg.ruleId,
  }));
});

// Use in extensions
const extensions = [
  eslintLinter,
  lintGutter(),
  lintKeymap,
];
```

**Features provided by `@codemirror/lint`:**
- Diagnostics gutter with error/warning icons
- Inline error/warning messages on hover
- Keyboard navigation between diagnostics (F8 / Shift+F8)
- Panel listing all diagnostics
- Configurable delay (default 500ms after typing stops)

### 5.3 Language-Specific Linters in Browser

| Language | Linter | Browser-OK? | Size |
|----------|--------|-------------|------|
| JavaScript | `eslint-linter-browserify` | ✅ | ~2–3 MB |
| TypeScript | `eslint-linter-browserify` (includes TS parser) | ✅ | ~3 MB |
| CSS | `stylelint` browserified? | ⚠️ Unofficial | — |
| HTML | `htmlhint` | ✅ | ~100 KB |
| JSON | JSON.parse + schema validation | ✅ | ~50 KB |
| Python | `pyodide` + `pyflakes` | ✅ (via Pyodide) | Part of Pyodide |
| SQL | Basic syntax check | ✅ | ~20 KB |

**Recommended lightweight approach for non-JS languages:**

```typescript
// Simple Python linter using regex-based checks
const pythonLinter = linter((view) => {
  const code = view.state.doc.toString();
  const diagnostics = [];
  // Check for common issues: mismatched indentation, missing colons, etc.
  const lines = code.split('\n');
  lines.forEach((line, i) => {
    if (line.trim().endsWith(')') && !line.includes('(')) {
      diagnostics.push({
        from: view.state.doc.line(i + 1).from,
        to: view.state.doc.line(i + 1).to,
        severity: 'warning',
        message: 'Possible unmatched parenthesis',
      });
    }
  });
  return diagnostics;
});
```

### 5.4 Showing Lint Diagnostics in the Editor

CodeMirror 6 provides several UI mechanisms:

1. **Lint Gutter** (`lintGutter()`): Shows colored dots (🔴 errors, 🟡 warnings) in the gutter
2. **Inline tooltips**: Hover over a diagnostic to see the full message
3. **Diagnostics panel**: Toggle a panel listing all diagnostics
4. **Underline decorations**: Wavy red/yellow underlines on problematic code

**Recommended configuration:**
```typescript
const lintExtensions = [
  linter(eslintLinterFn, { delay: 750 }), // Wait 750ms after typing stops
  lintGutter(),                            // Show gutter icons
  lintKeymap,                              // F8/Shift+F8 navigation
];
```

---

## 6. Emmet Support

### 6.1 Official Plugin: `@emmetio/codemirror6-plugin`

**Package:** `@emmetio/codemirror6-plugin` (v0.4.0)

This is the **official** Emmet plugin for CodeMirror 6, developed by the Emmet team. Development is sponsored by CodePen and Replit.

**Status:** The package is labeled "WIP" (Work In Progress) on GitHub but is functional and used in production by CodePen and Replit.

### 6.2 Installation & Integration

```bash
npm install @emmetio/codemirror6-plugin
```

```typescript
import { emmetPlugin } from '@emmetio/codemirror6-plugin';

// The plugin exports extensions you add to your CodeMirror configuration
const extensions = [
  emmetPlugin({ /* options */ }),
];
```

### 6.3 What It Supports

The plugin provides:

1. **HTML abbreviations**: Type `ul>li*5` → press Tab → expands to full HTML
2. **CSS abbreviations**: Type `m10` → expands to `margin: 10px;`
3. **Wrap with abbreviation**: Select text → wrap with Emmet abbreviation
4. **Balance outward/inward**: Select matching tag pairs
5. **Go to matching pair**: Navigate between opening/closing tags
6. **Remove tag**: Remove HTML tag while keeping inner content
7. **Split/Join tags**: Toggle between `<div></div>` and `<div />`
8. **Toggle comment**: Comment/uncomment HTML elements

### 6.4 Configuration Options

```typescript
emmetPlugin({
  // Mode: 'html' | 'css' | 'jsx' | 'xsl' | 'xml' | 'sass' | 'scss' | 'less'
  // Auto-detected from the active language mode
  
  // Custom keybindings
  keymap: {
    expandAbbreviation: 'Tab',      // Default: Tab
    wrapWithAbbreviation: 'Ctrl-Shift-A',
    balanceOutward: 'Ctrl-Shift-Down',
    balanceInward: 'Ctrl-Shift-Up',
  },
  
  // Custom snippets
  snippets: {
    // Override or add custom Emmet snippets
    'custom': 'div.custom>span.inner',
  },
  
  // Syntax profiles
  syntaxProfiles: {
    html: { selfClosingStyle: 'xhtml' }, // <br /> vs <br>
  },
});
```

### 6.5 How to Combine with Language Modes

Emmet needs to know which syntax profile to use based on the current language:

```typescript
import { emmetPlugin } from '@emmetio/codemirror6-plugin';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';

// For HTML files
const htmlExtensions = [
  html(),
  emmetPlugin(), // Auto-detects HTML mode from LanguageDescription
];

// For CSS files
const cssExtensions = [
  css(),
  emmetPlugin(), // Auto-detects CSS mode
];

// For JSX/TSX
const jsxExtensions = [
  javascript({ jsx: true }),
  emmetPlugin(), // Works in JSX context
];
```

The plugin automatically detects the active language from CodeMirror's language infrastructure and applies the appropriate Emmet syntax profile.

### 6.6 Limitations

- Tab key conflict: Emmet's Tab expansion can conflict with existing Tab-key behaviors (indentation, autocomplete). Must configure priority carefully.
- JSX support works but may have edge cases with TypeScript-aware completions.
- The "WIP" label means the API may change, but it's stable enough for production (used by CodePen).

### 6.7 Fallback Approach

If `@emmetio/codemirror6-plugin` has issues, an alternative approach:

```typescript
import { expand } from 'emmet'; // Core emmet expansion engine (~30 KB)

// Manual integration: intercept Tab key, expand abbreviation if applicable
const emmetKeymap = keymap.of([{
  key: 'Tab',
  run(view) {
    const pos = view.state.selection.main.head;
    const line = view.state.doc.lineAt(pos);
    const beforeCursor = line.text.slice(0, pos - line.from);
    
    // Check if the text before cursor looks like an Emmet abbreviation
    try {
      const syntax = detectSyntax(view); // html or css
      const expanded = expand(beforeCursor, { syntax });
      if (expanded && expanded !== beforeCursor) {
        view.dispatch({
          changes: { from: line.from, to: pos, insert: expanded },
        });
        return true;
      }
    } catch {}
    return false;
  }
}]);
```

---

## 7. Summary & Key Recommendations

### 7.1 Final Technology Stack

| Component | Choice | Package | Version |
|-----------|--------|---------|---------|
| **Editor** | CodeMirror 6 | `@uiw/react-codemirror` | 4.25.10 |
| **Language Support** | CM6 Language Data | `@codemirror/language-data` | 6.5.2 |
| **Linting UI** | CM6 Lint | `@codemirror/lint` | 6.9.6 |
| **Emmet** | Official CM6 Plugin | `@emmetio/codemirror6-plugin` | 0.4.0 |
| **Formatting** | Prettier Standalone | `prettier` | 3.8.3 |
| **Lightweight Formatter** | js-beautify | `js-beautify` | 1.15.4 |
| **JS Linting** | ESLint Browser | `eslint-linter-browserify` | 10.4.0 |
| **JS Execution** | Sandboxed iframe | Built-in | — |
| **TS Transpilation** | Sucrase | `sucrase` | 3.35.0 |
| **Sandboxed JS** | QuickJS WASM | `@sebastianwessel/quickjs` | 3.0.1 |
| **Python Execution** | Pyodide | `pyodide` | 0.29.4 |
| **C/C++ Execution** | JSCPP | `JSCPP` | 2.0.9 |

### 7.2 Bundle Size Budget

| Component | Estimated Size (gzipped) | Load Strategy |
|-----------|--------------------------|---------------|
| React + Vite core | ~150 KB | Immediate |
| CodeMirror 6 core | ~200 KB | Immediate |
| 5 common languages | ~80 KB | Immediate |
| Emmet plugin | ~30 KB | Immediate |
| Prettier standalone | ~600 KB | Lazy (on first format) |
| eslint-linter-browserify | ~2.5 MB | Lazy (on first lint) |
| QuickJS WASM | ~300 KB | Lazy (on sandboxed run) |
| Pyodide | ~12 MB | Lazy (on first Python run) |
| JSCPP | ~50 KB | Can include immediately |
| **Initial load total** | **~460 KB** | |
| **Full lazy total** | **~16 MB** | Only if user uses everything |

### 7.3 Priority Implementation Order

1. **P0 — Core editor:** CodeMirror 6 + React wrapper + 5 basic languages
2. **P0 — JS execution:** Sandboxed iframe with console capture
3. **P1 — Emmet:** HTML/CSS abbreviation expansion
4. **P1 — Basic formatting:** Prettier in Web Worker for JS/TS/HTML/CSS/JSON
5. **P1 — Linting UI:** `@codemirror/lint` + basic JS linting
6. **P2 — Python execution:** Pyodide lazy-load
7. **P2 — C/C++ execution:** JSCPP integration
8. **P2 — TS execution:** Sucrase transpile → iframe eval
9. **P3 — ESLint:** Full `eslint-linter-browserify` in Web Worker
10. **P3 — Ruby/PHP:** Opal / php-wasm lazy-load
11. **P4 — Java:** CheerpJ (heavy, optional)

### 7.4 Key Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Pyodide download too slow for users | Users give up before Python runs | Show progress bar; cache in Service Worker |
| ESLint browser bundle too large | Bloats the page | Lazy-load only on demand; consider lighter alternatives |
| JSCPP limitations frustrate C++ users | Poor user experience | Clear warning: "Limited C++ support for learning purposes" |
| Emmet Tab key conflicts | Broken autocomplete | Configurable keymap; Tab for autocomplete, Ctrl+E for Emmet |
| Prettier blocks UI thread | Editor freezes | Always run in Web Worker |
| Monaco users expect VS Code features | Feature gap | Set expectations; this is a Notepad++-style tool, not an IDE |

---

*End of report. This research should be used as the technical foundation for all editor-related implementation decisions.*
