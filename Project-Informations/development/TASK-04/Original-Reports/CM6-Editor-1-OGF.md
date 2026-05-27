# TASK-04 — CodeMirror 6 Editor Component (Original Report)

**Task ID:** TASK-04
**Agent:** Sub-agent 1 (CM6 Research) + Main Agent (Implementation)
**Date:** 2026-05-28

---

## Task Description

Implement the CodeMirror 6 editor component with JavaScript/JSX syntax highlighting, custom Catppuccin Mocha theme, and integration with Zustand stores.

## Sub-agent Research Findings

1. **Custom Theme:** Use `EditorView.theme()` with `var()` for chrome colors + `HighlightStyle.define()` with hex for syntax tokens. Mark `{ dark: true }` and `themeType: 'dark'`.
2. **Uncontrolled Mode:** CM6 owns the document; `onChange` pushes to Zustand; file switching via `view.dispatch()`. Never feed value back as prop to avoid cursor jumping.
3. **Extensions:** `basicSetup={false}`, manually compose: lineNumbers, history, bracketMatching, closeBrackets, autocompletion, search, foldGutter, javascript(), catppuccinMocha, keymaps.
4. **Language Switching:** Update `extensions` prop — `@uiw/react-codemirror` handles reconfiguration via `StateEffect.reconfigure` internally.
5. **CSS Custom Properties in Theme:** `EditorView.theme()` supports `var()` for chrome; syntax tokens use hardcoded hex.

## Implementation Details

### Files Created (4 files)

| File | Purpose |
|------|---------|
| `src/components/Editor/catppuccinMocha.ts` | CM6 theme: EditorView.theme() + HighlightStyle.define() with Catppuccin Mocha colors |
| `src/components/Editor/extensions.ts` | Extension composition: lineNumbers, bracketMatching, closeBrackets, autocompletion, JS syntax, keymaps |
| `src/components/Editor/CodeEditor.tsx` | Main editor component: uncontrolled mode, onChange → editorStore, file switch via dispatch |
| `src/components/Editor/index.ts` | Barrel exports |

### Key Design Decisions

1. **Uncontrolled mode** — CM6 owns document state; onChange syncs to Zustand outward only
2. **`theme="none"` on CodeMirror** — Prevents default theme from conflicting with catppuccinMocha extension
3. **`basicSetup={false}`** — Manual extension selection for explicit control
4. **File switching via `view.dispatch()`** — Replaces editor content without controlled mode cursor jumping
5. **Cursor position tracking** — `onUpdate` callback captures selection changes → editorStore.setCursorPosition()
6. **Empty state** — Shows "Open a file to start editing" when no file is active

### Cross-References

- `catppuccinMocha.ts` → Plan P0-07 (Dark Theme), UI-UX-Research Section 6.1
- `extensions.ts` → Plan P0-01 (Code Editor), Generic-Research Section 2
- `CodeEditor.tsx` → Plan P0-01 (Code Editor), editorStore (TASK-02), projectStore (TASK-02)
