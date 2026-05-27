# Code Editor: Component, Language, Execution & Tooling Research Report

**Report ID:** Editor-Research-2-FIN  
**Original Report:** Editor-Research-2-OGF  
**Date:** 2026-03-04  
**Finalized:** 2026-05-27  
**Prepared by:** Sub-Agent 2 (Editor & Execution Researcher)  
**Enriched with:** CodeCraft Project Plan v1.0

---

## Plan Integration Notes

This section maps each research finding from the original OGF report to the specific Task IDs and Phases in the [CodeCraft Project Plan](../Project-Plan.md). This mapping ensures traceability from research decisions to implementation tasks.

### Finding-to-Task Mapping

| # | Research Finding (OGF Section) | Plan Phase/Task ID | Implementation Detail |
|---|-------------------------------|---------------------|-----------------------|
| 1 | CodeMirror 6 selected over Monaco (§1) | **PH1-02** | Create CodeMirror editor component with `@uiw/react-codemirror`, base extensions (line numbers, bracket matching, active line, fold, search) |
| 2 | CM6 bundle size advantage (10–15× smaller) (§1.1) | **PH0-04**, **PH6-01** | Vite chunk splitting strategy; performance audit & bundle size analysis |
| 3 | Mobile/touch support for students (§1.2) | **PH1-05**, **PH3-08** | Mobile tab bar component; responsive design refinement & virtual keyboard handling |
| 4 | 143 languages via `@codemirror/language-data` (§2.1) | **PH1-03** | Language detection from file extension, dynamic import on file open, cache loaded extensions |
| 5 | Lezer grammar system & custom language modes (§2.2–2.3) | **PH1-03** | Dynamic import architecture supports Lezer grammars natively; StreamLanguage fallback for legacy modes |
| 6 | Tiered language priority list (§2.4) | **PH1-02**, **PH1-03** | Tier 1 languages (JS, TS, HTML, CSS, Python, JSON, Markdown, SQL) included in initial load; others lazy-loaded |
| 7 | Lazy-loading language strategy via dynamic imports (§2.5) | **PH1-03**, **PH0-04** | `LanguageDescription.matchFilename()` + `desc.load()` for on-demand import; Vite auto code-splits |
| 8 | JS execution in sandboxed iframe (§3.1) | **PH4-01** | Sandboxed iframe with `sandbox="allow-scripts"`, `srcdoc`, `postMessage` console capture, 10s timeout |
| 9 | QuickJS WASM as sandboxed JS alternative (§3.1) | **PH4-01** (optional extension) | Plan specifies iframe as primary; QuickJS remains an option for enhanced sandboxing |
| 10 | TypeScript execution via Sucrase transpile (§3.1) | **PH4-03** | Sucrase transpile TS → JS, then run through iframe sandbox |
| 11 | Python execution via Pyodide (§3.2) | **PH4-06** | Lazy-load Pyodide in Web Worker, stdout/stderr capture, ~12 MB download progress bar, cache worker for session |
| 12 | C/C++ execution via JSCPP (§3.3) | **PH4-07** | JSCPP interpreter integration, basic stdin support, display limitations warning |
| 13 | Java (CheerpJ) — not worth it for v1 (§3.4) | **Long-term v3.0** | Deferred to v3.0 roadmap as opt-in heavy download |
| 14 | Go — not feasible (§3.5) | — | Syntax highlighting only; no execution path planned |
| 15 | Rust — not feasible (§3.6) | — | Syntax highlighting only; no execution path planned |
| 16 | Ruby — Opal/ruby.wasm (§3.7) | **Long-term v3.0** | Deferred to v3.0 roadmap (Opal transpiler or ruby.wasm lazy-load) |
| 17 | PHP — php-wasm (§3.8) | **Long-term v3.0** | Deferred to v3.0 roadmap (php-wasm lazy-load) |
| 18 | Execution tier strategy (Tier 1–4) (§3.10) | **PH4-01–PH4-09** | Phase 4 implements Tier 1 (JS/TS/HTML) and Tier 2 (Python/C++); Tiers 3–4 deferred to v3.0 |
| 19 | Prettier standalone in Web Worker (§4.1–4.3) | **PH5-01** | Lazy-load Prettier in Web Worker, format on save + format on demand (Shift+Alt+F), configurable options |
| 20 | js-beautify as lightweight formatter (§4.2) | **PH5-02** | Quick formatting when Prettier isn't loaded, HTML/CSS/JSON support |
| 21 | Format on Save + Format on Demand (§4.4) | **PH5-01**, **PH5-03** | Both modes with user configuration; PH5-03 builds Formatter Settings UI |
| 22 | ESLint in browser via `eslint-linter-browserify` (§5.1) | **PH5-04** | Lazy-load in Web Worker, integrate with `@codemirror/lint`, configurable rules |
| 23 | `@codemirror/lint` integration (§5.2) | **PH5-06** | Gutter icons, inline messages, diagnostics panel, F8/Shift+F8 navigation |
| 24 | Lightweight linting for non-JS languages (§5.3) | **PH5-05** | Regex-based checks for Python, HTML (htmlhint), JSON (parse validation), basic SQL |
| 25 | Emmet via `@emmetio/codemirror6-plugin` (§6) | **PH5-07** | HTML/CSS abbreviation expansion, Tab key binding, JSX support |
| 26 | Tab key conflict resolution (Emmet vs autocomplete vs indent) (§6.6) | **PH5-08** | Configurable priority, smart context detection for Tab behavior |
| 27 | Console/Output drawer for execution results (§3 implied) | **PH4-04** | Resizable bottom drawer, stdout/stderr/error display, clear button, copy output |
| 28 | Run button & language-aware execution dispatch (§3 implied) | **PH4-05** | Detect language, choose executor, show loading state, stream output |
| 29 | Execution progress/loading UI (§3 implied) | **PH4-08** | Progress bar for Pyodide, spinner for other engines, inline error messages |
| 30 | Multi-file project execution (linking CSS/JS in HTML) (§3 implied) | **PH4-09** | Resolve imports within project files for HTML preview |
| 31 | Bundle size budget (§7.2) | **Plan §13** | Plan refines budget to ~495 KB initial load (vs ~460 KB in OGF) with additional packages |
| 32 | Priority implementation order (§7.3) | **PH1→PH4→PH5→v3.0** | Plan structures P0–P4 priorities across Phase 1, Phase 4, Phase 5, and long-term roadmap |
| 33 | Key risks & mitigations (§7.4) | **Plan §12** | Plan risk register aligns closely; adds IndexedDB data loss and community adoption risks |

### Key Decision Points — Plan Annotations

The following annotations mark critical decision points in the original report and indicate exactly where in the Project Plan each decision is implemented:

- **[PLAN: PH1-02]** — Decision to use CodeMirror 6; implemented as the core editor component wrapping `@uiw/react-codemirror` with base extensions (line numbers, bracket matching, active line, fold, search)
- **[PLAN: PH1-03]** — Decision for lazy-loaded language support via `@codemirror/language-data`; implemented with file-extension detection and dynamic imports with caching
- **[PLAN: PH1-05]** — Decision for mobile-first touch support; implemented as bottom tab bar with file type icons, Run button, touch-friendly targets
- **[PLAN: PH4-01]** — Decision for sandboxed iframe JS execution with `postMessage` communication; console output capture and timeout handling
- **[PLAN: PH4-03]** — Decision for TypeScript execution via Sucrase transpilation; TS → JS → iframe eval pipeline
- **[PLAN: PH4-06]** — Decision for Python execution via Pyodide in Web Worker; lazy-load with ~12 MB progress bar and session caching
- **[PLAN: PH4-07]** — Decision for C/C++ via JSCPP; educational-only with clear limitations warning
- **[PLAN: PH5-01]** — Decision for Prettier formatting in Web Worker; both format-on-save and format-on-demand with configurable options
- **[PLAN: PH5-04]** — Decision for ESLint browser build in Web Worker; `eslint-linter-browserify` integrated with CM6 lint UI
- **[PLAN: PH5-07]** — Decision for Emmet via official CM6 plugin; HTML/CSS abbreviation expansion with Tab key binding
- **[PLAN: Long-term v3.0]** — Decisions to defer Ruby (Opal/ruby.wasm), PHP (php-wasm), and Java (CheerpJ) execution to v3.0 roadmap
- **[PLAN: PH0-04]** — Decision for Vite chunk splitting and tree-shaking; validates CM6's tree-shakeable architecture as critical for <500 KB initial load

### Additional Insights & Refinements from Plan Context

After cross-referencing the OGF report with the full Project Plan, the following refinements and additional insights emerge:

1. **Bundle size budget refined upward:** The OGF report estimated ~460 KB initial load. The plan's bundle size budget (§13) calculates ~495 KB, accounting for additional packages not in the original OGF scope: Lucide icons (~20 KB), Tailwind CSS 4 (~15 KB), and Dexie.js + JSZip (~80 KB lazy). The target of <500 KB is still met.

2. **Pyodide size revision:** The OGF report estimated Pyodide at ~12–20 MB. The plan specifies v0.29.x with a ~12 MB download. This reflects Pyodide's ongoing size optimisation and is a meaningful reduction in the primary performance risk. The plan also specifies caching the Pyodide worker for the entire session (PH4-06), avoiding re-initialization.

3. **Execution tier scoping confirmed:** The OGF report's 4-tier execution strategy (Tier 1: ship immediately; Tier 2: lazy-load; Tier 3: heavy download label; Tier 4: syntax only) is precisely mirrored in the plan. Phase 4 implements Tiers 1–2. Tiers 3–4 (Ruby, PHP, Java, Go, Rust) are deferred to the v3.0 long-term roadmap. This is a pragmatic scoping decision that delivers the most value earliest.

4. **Dual-formatter strategy formalized:** The OGF report mentions js-beautify as an option. The plan formalizes this as a deliberate dual-formatter approach (PH5-01 Prettier + PH5-02 js-beautify), with PH5-03 providing a settings UI to choose between them. js-beautify serves as the lightweight (~50 KB) alternative when Prettier's ~600 KB hasn't been loaded yet.

5. **Tab key conflict gets dedicated task:** The OGF report identified the Emmet Tab key conflict as a risk. The plan addresses this with a dedicated task (PH5-08: "Handle Tab key priority — Emmet vs autocomplete vs indentation — configurable priority, smart context detection"), elevating it from a risk mitigation to a first-class implementation task.

6. **Console/Output drawer is a first-class component:** The OGF report's execution code examples imply output display, but the plan makes this explicit with PH4-04: a resizable bottom drawer with stdout/stderr/error display, clear button, and copy output. This is the primary feedback mechanism for all code execution.

7. **Multi-file execution linking:** The OGF report discusses individual language execution. The plan adds PH4-09 (multi-file project execution) to handle CSS/JS linking in HTML preview and resolving imports within project files. This is essential for the multi-file project model established in Phase 2.

8. **Emmet WIP status acknowledged:** The OGF report notes the Emmet plugin is "WIP" but used in production by CodePen and Replit. The plan proceeds with `@emmetio/codemirror6-plugin` (v0.4.x) as the chosen solution. The fallback approach documented in OGF §6.7 (manual `expand()` integration) serves as a contingency if the official plugin proves unstable.

9. **JSCPP limitations warning is explicit:** Both the OGF report and the plan acknowledge JSCPP's limitations (no templates, no exceptions, limited STL). PH4-07 specifically includes "display limitations warning" as part of the task, ensuring users are informed. This aligns with the "Students/Learners" audience segment — JSCPP is adequate for learning basic C/C++ but insufficient for production code.

10. **ESLint lazy-load trigger is "on first lint":** The plan confirms ESLint's ~2.5 MB browserified bundle is lazy-loaded, triggered only when the user first invokes linting. This validates the OGF's recommendation to avoid including it in the initial bundle. The plan also specifies running it in a Web Worker (PH5-04) to avoid UI thread blocking.

11. **Language support beyond execution:** While the OGF report focuses on execution feasibility, the plan ensures that languages without execution support (Go, Rust, C#, Swift, Kotlin, Scala, etc.) still get full syntax highlighting, code folding, and bracket matching via `@codemirror/language-data` (PH1-03). The 143-language registry provides this automatically.

12. **"Paper Desk" philosophy reinforces CM6 choice:** The plan's "Paper Desk" design philosophy — "the code is the star, everything else recedes until needed" — reinforces the CM6 decision. CM6's composable extension system allows features (linting, Emmet, formatting) to be loaded and activated only when needed, aligning perfectly with the "recedes until needed" principle. Monaco's monolithic bundle would violate this philosophy.

13. **PWA caching validates lazy-load strategy:** The plan's PWA configuration (PH0-07) with Workbox and a 20 MB maximum cache size directly supports the lazy-loading strategy. Once a user downloads Pyodide (~12 MB) or ESLint (~2.5 MB), the service worker caches these assets for offline reuse, making subsequent visits instant even for heavy features.

14. **QuickJS WASM remains an option:** The OGF report identified QuickJS WASM (`@sebastianwessel/quickjs`, v3.0.1, ~300 KB) as an alternative to iframe sandboxing. The plan does not explicitly task QuickJS implementation in Phase 4, but the architecture (sandboxed iframe) is designed to be swappable. QuickJS could be introduced as a "Secure Run" mode in a future iteration without architectural changes.

15. **Formatter and linter configuration surfaces:** The plan adds PH5-03 (Formatter Settings UI) and integrates formatter preferences into PH3-10 (Settings panel). This goes beyond the OGF's programmatic configuration examples by providing a user-facing UI for toggling format-on-save, choosing formatter (Prettier/basic/none), and configuring Prettier options — important for the "Hobbyists/Indie Developers" and "Professional Developers" audience segments.

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

*[PLAN: PH1-02 — Create CodeMirror editor component; this decision is foundational to the entire project architecture]*

### 1.1 Bundle Size Comparison

*[PLAN: PH0-04 — Vite chunk splitting strategy; PH6-01 — Performance audit & bundle size analysis; the ~495 KB initial load target in Plan §13 depends on CM6's tree-shakeable architecture]*

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

*[PLAN: PH1-05 — Mobile tab bar; PH3-08 — Responsive design refinement with virtual keyboard handling; the plan targets students who may use tablets/phones]*

| Feature | CodeMirror 6 | Monaco Editor |
|---------|--------------|---------------|
| **Mobile touch support** | ✅ Excellent — designed for it | ❌ Poor — not designed for mobile |
| **Virtual keyboard handling** | ✅ Works well | ⚠️ Issues on Android/iOS |
| **Responsive layout** | ✅ CSS-based, easy to resize | ⚠️ Requires manual workarounds |
| **Tablet usability** | ✅ Good | ⚠️ Subpar |

CodeMirror 6 was rewritten from the ground up with mobile support as a first-class concern. The editor uses contenteditable and properly handles IME input, virtual keyboards, and touch selections. Monaco was built as a desktop editor (it powers VS Code) and has well-known mobile deficiencies — it's effectively unusable on phones.

**For a tool targeting students (who may use tablets/phones), CodeMirror 6 is the clear choice.**

### 1.3 Language Support Breadth

*[PLAN: PH1-03 — Language detection & lazy-loading via `@codemirror/language-data` with 143 languages]*

| Aspect | CodeMirror 6 | Monaco Editor |
|--------|--------------|---------------|
| **Built-in language modes** | 143 via `@codemirror/language-data` | ~50+ built-in (Monarch grammars) |
| **Community grammars** | Growing (Lezer + StreamLanguage fallback) | Large (Monarch community) |
| **Custom grammar authoring** | Lezer grammar system (LR parser) | Monarch (declarative tokenizer) |
| **Legacy mode compatibility** | ✅ StreamLanguage wrapper for CM5 modes | — |

Both editors cover all mainstream languages. CodeMirror 6 has the edge in breadth (143 languages) and its `@codemirror/language-data` package provides a convenient registry with dynamic imports for all of them. Monaco has strong IntelliSense for TypeScript/JavaScript but is more limited for niche languages.

### 1.4 Extensibility

*[PLAN: PH5-01–PH5-08 — Phase 5 implements linting, formatting, and Emmet as CM6 extensions, leveraging the composable extension system described here]*

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

*[PLAN: PH1-02 — Uses `@uiw/react-codemirror` (v4.25.x) as the React wrapper]*

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

*[PLAN: PH0-04 — Vite configuration enables tree-shaking; PH6-01 — Performance audit verifies effectiveness]*

CodeMirror 6 is published as ES modules with explicit exports. Vite (Rollup under the hood) can tree-shake unused language modes, themes, and extensions effectively. Monaco is a monolithic bundle — tree-shaking is not possible.

### 1.8 Recommendation: **CodeMirror 6**

*[PLAN: PH1-02 — Decision confirmed; CodeMirror 6 is the editor component for CodeCraft]*

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

*[PLAN: PH1-03 — Language detection & lazy-loading is the primary implementation task for this section]*

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

*[PLAN: PH1-03 — Tier 1 languages included in immediate load; Tier 2–3 lazy-loaded on demand]*

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

*[PLAN: PH1-03 — Implements exactly this strategy with `@codemirror/language-data` dynamic imports and extension caching]*

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

*[PLAN: Phase 4 (PH4-01–PH4-09) implements all Tier 1 and Tier 2 execution engines; Tier 3 languages deferred to v3.0 roadmap]*

### 3.1 JavaScript/TypeScript

*[PLAN: PH4-01 — Sandboxed iframe JS execution; PH4-03 — TypeScript via Sucrase transpile]*

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

> **Plan Insight:** The plan implements the sandboxed iframe as the primary JS execution engine (PH4-01). QuickJS WASM is not explicitly tasked in Phase 4 but remains a viable future enhancement for a "Secure Run" mode, given its ~300 KB size and superior isolation.

**Alternative: Web Worker**
- Runs JS in a separate thread (no UI blocking)
- Has `importScripts()` but no DOM access
- Good for compute-heavy tasks
- Can be combined with iframe sandboxing

**TypeScript execution:** Use the `esbuild-wasm` or `sucrase` package to transpile TS → JS in-browser, then execute the resulting JS. *[PLAN: PH4-03 specifies Sucrase (v3.35.x) as the TS→JS transpiler]*

### 3.2 Python — Pyodide

*[PLAN: PH4-06 — Lazy-load Pyodide in Web Worker, ~12 MB download progress bar, cache worker for session]*

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

**Strategy for our project:** Lazy-load Pyodide on demand. Download the ~12 MB WASM bundle only when the user first runs Python code. Cache the Pyodide instance in a Web Worker for subsequent runs. *[PLAN: PH4-06 implements exactly this strategy, adding a progress bar for the download and session-long worker caching]*

### 3.3 C/C++ — JSCPP

*[PLAN: PH4-07 — Integrate JSCPP interpreter with basic stdin support and limitations warning]*

**Engine:** JSCPP (v2.0.9) — A simple C++ interpreter written in JavaScript

| Aspect | Detail |
|--------|--------|
| **How it works** | Pure JavaScript C++ interpreter (no WASM) |
| **Download size** | ~50 KB gzipped |
| **Language support** | C++ subset: variables, functions, arrays, pointers, classes, basic STL |
| **Limitations** | No templates, no exceptions, no preprocessor (#include is limited), no STL containers beyond basic array, no multithreading, no extern |
| **Execution quality** | Adequate for learning/teaching; NOT production-grade |

**Verdict:** JSCPP is viable for **educational purposes only**. It can run simple programs (factorial, sorting, basic class examples) but will fail on anything using templates, complex STL, or modern C++. For students learning C/C++ basics, it's reasonable. For professionals, it's insufficient. *[PLAN: PH4-07 includes "display limitations warning" to set user expectations]*

**Alternative:** CheerpX can run real GCC/Clang via x86 virtualization (see below), but at a massive size cost.

### 3.4 Java — CheerpJ

*[PLAN: Long-term v3.0 — Deferred to v3.0 roadmap as opt-in heavy download]*

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

**Verdict:** **Not feasible** for a lightweight editor. The Go compiler WASM is too large. A simple Go interpreter for the browser does not currently exist in a usable form. *[PLAN: Syntax highlighting only via `@codemirror/lang-*`; no execution planned]*

### 3.6 Rust

**Engine:** No practical in-browser Rust compiler exists.

| Aspect | Detail |
|--------|--------|
| **Rust Playground** | Uses a server-side compiler (not browser-based) |
| **rustc → WASM** | The Rust compiler itself can be compiled to WASM, but it's enormous (>100 MB) |
| **Alternative** | Simple Rust interpreter? None exists for the browser. |

**Verdict:** **Not feasible** for browser-based execution. Rust compilation requires LLVM, which is far too heavy for browser deployment. Syntax highlighting and linting are still fully supported via `@codemirror/lang-rust`. *[PLAN: Syntax highlighting only; no execution planned]*

### 3.7 Ruby

*[PLAN: Long-term v3.0 — Deferred to v3.0 roadmap; plan lists both Opal transpiler and ruby.wasm as options]*

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

*[PLAN: Long-term v3.0 — Deferred to v3.0 roadmap as php-wasm lazy-load]*

**Engine:** php-wasm (seanmorris/php-wasm) — PHP compiled to WebAssembly

| Aspect | Detail |
|--------|--------|
| **How it works** | PHP interpreter compiled to WASM via Emscripten |
| **Download size** | ~10–20 MB |
| **Execution quality** | Full PHP 8.2+ support; runs real PHP code |
| **Features** | Can run in CLI mode or CGI mode |

**Verdict:** **Feasible but heavy.** php-wasm works well but the ~15 MB download is significant. Consider lazy-loading and only fetching when the user explicitly runs PHP.

### 3.9 Feasibility Matrix

*[PLAN: Phase 4 implements Tier 1 (JS/TS/HTML) and Tier 2 (Python/C++); Tier 3 (Ruby/PHP) and Tier 4 (Go/Rust/Java) deferred to v3.0]*

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

*[PLAN: Phase 4 (PH4-01–PH4-09) implements Tiers 1–2; Tiers 3–4 deferred to v3.0 long-term roadmap]*

**Tier 1 — Ship immediately (zero or minimal extra bundle):** *[PLAN: PH4-01, PH4-02, PH4-03]*
- JavaScript (iframe sandbox)
- TypeScript (Sucrase + iframe)
- HTML (live preview in iframe)

**Tier 2 — Lazy-load on first use (user clicks "Run"):** *[PLAN: PH4-06, PH4-07]*
- Python (Pyodide, ~12 MB)
- C/C++ (JSCPP, ~50 KB — small enough to include but limited)

**Tier 3 — Available but clearly labeled as "heavy download":** *[PLAN: Long-term v3.0]*
- Ruby (ruby.wasm or Opal)
- PHP (php-wasm)

**Tier 4 — Syntax highlighting only (no execution):** *[PLAN: No execution task; syntax via PH1-03]*
- Go, Rust, Java, C#, Swift, Kotlin, Scala, and all others

---

## 4. Code Formatting

*[PLAN: Phase 5 (PH5-01–PH5-03) implements the full formatting system with dual-formatter strategy and settings UI]*

### 4.1 Prettier Integration (Browser-Compatible)

*[PLAN: PH5-01 — Lazy-load Prettier standalone in Web Worker, format on save + format on demand]*

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

*[PLAN: PH5-02 — js-beautify as lightweight formatter for when Prettier isn't loaded yet]*

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

**Recommendation:** Use **Prettier standalone** for JS/TS/HTML/CSS/JSON/MD/YAML and **js-beautify** as a lightweight fallback. For other languages, offer basic indentation-based formatting only. *[PLAN: PH5-02 implements js-beautify as the lightweight fallback; PH5-03 provides a settings UI to choose between formatters]*

### 4.3 Running Formatters in a Web Worker

*[PLAN: PH5-01 — Prettier runs in a Web Worker to avoid UI thread blocking]*

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

*[PLAN: PH5-01 — Both modes supported; PH5-03 — Formatter Settings UI for user configuration; PH3-10 — Settings panel integrates format preferences]*

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

*[PLAN: Phase 5 (PH5-04–PH5-06) implements the full linting system — ESLint in Web Worker, lightweight linting for non-JS, and diagnostics UI]*

### 5.1 ESLint in the Browser — Is It Feasible?

*[PLAN: PH5-04 — Lazy-load `eslint-linter-browserify` in Web Worker, integrate with `@codemirror/lint`]*

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

**Size:** ~2–3 MB for the browserified ESLint bundle. This is heavy but can be lazy-loaded. *[PLAN: Plan §13 estimates ~2.5 MB; lazy-loaded on first lint action]*

**Limitations:**
- No filesystem access (no `.eslintrc` loading from disk)
- No custom parser plugins (e.g., `@typescript-eslint/parser`) — wait, actually `eslint-linter-browserify` does include TypeScript parser support
- No custom rule plugins
- Must define rules inline in code
- Some rules that depend on file context (e.g., `import/no-unresolved`) won't work

**Verdict:** Feasible for basic JavaScript/TypeScript linting with built-in rules. Load it lazily in a Web Worker.

### 5.2 CodeMirror 6 Lint Integration

*[PLAN: PH5-06 — Lint Diagnostics UI: gutter icons, inline messages, diagnostics panel, F8/Shift+F8 navigation]*

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

*[PLAN: PH5-05 — Lightweight linting for non-JS languages: regex-based checks for Python, htmlhint for HTML, JSON parse validation, basic SQL]*

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

*[PLAN: PH5-06 — Implements the full diagnostics UI described below]*

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

*[PLAN: PH5-07 — Integrate Emmet; PH5-08 — Handle Tab key priority]*

### 6.1 Official Plugin: `@emmetio/codemirror6-plugin`

*[PLAN: PH5-07 — Uses `@emmetio/codemirror6-plugin` (v0.4.x)]*

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

*[PLAN: PH5-08 — Dedicated task for handling Tab key priority between Emmet, autocomplete, and indentation]*

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

*[PLAN: §2 Technology Stack — Confirms all selections; adds Zustand, Dexie.js, JSZip, dnd-kit, Lucide, vite-plugin-pwa]*

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

*[PLAN: §13 Bundle Size Budget — Refines estimates with additional packages; initial load target ~495 KB]*

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

> **Plan Refinement:** The plan's bundle size budget (§13) adds Lucide icons (~20 KB), Tailwind CSS 4 (~15 KB), and Dexie.js + JSZip (~80 KB lazy) to the budget, bringing the initial load to **~495 KB** — still within the <500 KB target. The plan also specifies JSCPP (~50 KB) as included immediately rather than lazy-loaded, given its small size.

### 7.3 Priority Implementation Order

*[PLAN: Mapped across Phases 1, 4, 5, and long-term roadmap — see annotations below]*

1. **P0 — Core editor:** CodeMirror 6 + React wrapper + 5 basic languages *[PLAN: PH1-02, PH1-03]*
2. **P0 — JS execution:** Sandboxed iframe with console capture *[PLAN: PH4-01]*
3. **P1 — Emmet:** HTML/CSS abbreviation expansion *[PLAN: PH5-07]*
4. **P1 — Basic formatting:** Prettier in Web Worker for JS/TS/HTML/CSS/JSON *[PLAN: PH5-01]*
5. **P1 — Linting UI:** `@codemirror/lint` + basic JS linting *[PLAN: PH5-04, PH5-06]*
6. **P2 — Python execution:** Pyodide lazy-load *[PLAN: PH4-06]*
7. **P2 — C/C++ execution:** JSCPP integration *[PLAN: PH4-07]*
8. **P2 — TS execution:** Sucrase transpile → iframe eval *[PLAN: PH4-03]*
9. **P3 — ESLint:** Full `eslint-linter-browserify` in Web Worker *[PLAN: PH5-04]*
10. **P3 — Ruby/PHP:** Opal / php-wasm lazy-load *[PLAN: Long-term v3.0]*
11. **P4 — Java:** CheerpJ (heavy, optional) *[PLAN: Long-term v3.0]*

### 7.4 Key Risks & Mitigations

*[PLAN: §12 Risk Register — Aligns closely with these risks; adds IndexedDB data loss and community adoption risks]*

| Risk | Impact | Mitigation |
|------|--------|------------|
| Pyodide download too slow for users | Users give up before Python runs | Show progress bar; cache in Service Worker *[PLAN: PH4-06 (progress bar), PH0-07 (Service Worker caching)]* |
| ESLint browser bundle too large | Bloats the page | Lazy-load only on demand; consider lighter alternatives *[PLAN: PH5-04 (lazy-load in Web Worker)]* |
| JSCPP limitations frustrate C++ users | Poor user experience | Clear warning: "Limited C++ support for learning purposes" *[PLAN: PH4-07 (display limitations warning)]* |
| Emmet Tab key conflicts | Broken autocomplete | Configurable keymap; Tab for autocomplete, Ctrl+E for Emmet *[PLAN: PH5-08 (dedicated Tab key priority task)]* |
| Prettier blocks UI thread | Editor freezes | Always run in Web Worker *[PLAN: PH5-01 (Web Worker implementation)]* |
| Monaco users expect VS Code features | Feature gap | Set expectations; this is a Notepad++-style tool, not an IDE *[PLAN: §1 Project Vision — "Not a full IDE, but far more capable than a simple online playground"]* |

> **Plan Addition:** The plan's risk register (§12) adds two risks not in the OGF report: (1) **Mobile UX feels cramped** (Medium severity, Medium probability) — mitigated by dedicated mobile layout and progressive disclosure; (2) **IndexedDB data loss due to browser eviction** (Medium severity, Low probability) — mitigated by `navigator.storage.persist()`, auto-export reminders, and clear data warnings (PH2-12).

---

*End of report. This research should be used as the technical foundation for all editor-related implementation decisions.*
