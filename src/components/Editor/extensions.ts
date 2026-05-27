/**
 * CodeCraft — Editor Extensions Configuration
 *
 * Composes CodeMirror 6 extensions for Phase 0. Instead of using
 * basicSetup={true}, we manually select extensions for explicit
 * control over the editor behavior and keymaps.
 *
 * @see Project-Plan.md P0-01 — Code Editor (JS/JSX)
 */

import { lineNumbers, highlightActiveLineGutter, highlightSpecialChars, drawSelection, dropCursor, rectangularSelection, highlightActiveLine, keymap } from '@codemirror/view';
import { history, defaultKeymap, historyKeymap, indentWithTab } from '@codemirror/commands';
import { highlightSelectionMatches, searchKeymap } from '@codemirror/search';
import { closeBrackets, closeBracketsKeymap, autocompletion, completionKeymap } from '@codemirror/autocomplete';
import { foldGutter, indentOnInput, syntaxHighlighting, defaultHighlightStyle, bracketMatching, indentUnit, foldKeymap } from '@codemirror/language';
import { lintKeymap } from '@codemirror/lint';
import { EditorState } from '@codemirror/state';
import { javascript } from '@codemirror/lang-javascript';
import { catppuccinMocha } from './catppuccinMocha';
import type { Extension } from '@codemirror/state';
import type { LanguageId } from '../../types';

// ─── Language Extension Mapping ───────────────────────────────

/**
 * Map LanguageId to CM6 LanguageSupport extension.
 * Phase 0: JavaScript and TypeScript (via @codemirror/lang-javascript).
 * Other languages fall back to plaintext (no highlighting).
 */
function getLanguageExtension(language: LanguageId): Extension {
  switch (language) {
    case 'javascript':
      return javascript(); // JS + JSX + local completions
    case 'typescript':
      return javascript({ typescript: true }); // TS + TSX
    // Phase 1: Add html(), css(), json(), markdown() here
    case 'html':
    case 'css':
    case 'json':
    case 'markdown':
    case 'plaintext':
    default:
      return []; // No language extension = plain text
  }
}

// ─── Create Extensions ────────────────────────────────────────

/**
 * Build the full extension array for the CodeMirror editor.
 *
 * @param language - The language for syntax highlighting
 * @param tabSize - Number of spaces per indent (default: 2)
 * @param readOnly - Whether the editor is read-only
 * @returns Extension[] for CodeMirror
 */
export function createExtensions(
  language: LanguageId = 'javascript',
  tabSize: number = 2,
  readOnly: boolean = false,
): Extension[] {
  return [
    // ─── Core ───────────────────────────────────────────────
    lineNumbers(),
    highlightActiveLineGutter(),
    highlightSpecialChars(),
    history(),
    drawSelection(),
    dropCursor(),
    EditorState.allowMultipleSelections.of(true),
    indentOnInput(),
    highlightActiveLine(),
    rectangularSelection(),

    // ─── Syntax Highlighting ────────────────────────────────
    // Fallback highlight for tokens not covered by our theme
    syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
    // Our Catppuccin Mocha theme (editor chrome + syntax colors)
    catppuccinMocha,

    // ─── Language ───────────────────────────────────────────
    getLanguageExtension(language),

    // ─── Bracket & Auto-close ───────────────────────────────
    bracketMatching(),
    closeBrackets(),

    // ─── Autocompletion ─────────────────────────────────────
    autocompletion(),

    // ─── Search ─────────────────────────────────────────────
    highlightSelectionMatches(),

    // ─── Code Folding ───────────────────────────────────────
    foldGutter(),

    // ─── Indent ─────────────────────────────────────────────
    indentUnit.of(' '.repeat(tabSize)),
    keymap.of([indentWithTab]),

    // ─── Keymaps ────────────────────────────────────────────
    keymap.of([
      ...closeBracketsKeymap,
      ...defaultKeymap,
      ...searchKeymap,
      ...historyKeymap,
      ...foldKeymap,
      ...completionKeymap,
      ...lintKeymap,
    ]),

    // ─── Read-only ──────────────────────────────────────────
    ...(readOnly ? [EditorState.readOnly.of(true)] : []),
  ];
}
