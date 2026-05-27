/**
 * CodeCraft — Catppuccin Mocha Theme for CodeMirror 6
 *
 * Two-layer theme that integrates with CodeCraft's CSS custom properties:
 *
 * 1. catppuccinMochaTheme — EditorView.theme() for editor chrome
 *    (backgrounds, gutters, cursor, selection, panels, tooltips).
 *    Uses var() references so the editor inherits from the global theme.
 *
 * 2. catppuccinMochaHighlightStyle — HighlightStyle.define() for
 *    syntax token colors (keywords, strings, comments, etc.).
 *    Uses hardcoded hex values because syntax colors are theme-specific
 *    and need different values for light vs dark.
 *
 * @see src/styles/globals.css — CSS custom properties
 * @see Project-Plan.md P0-07 — Dark Theme
 */

import { EditorView } from '@codemirror/view';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags } from '@lezer/highlight';
import type { Extension } from '@codemirror/state';

// ─── Editor Chrome Theme ──────────────────────────────────────
//
// Uses var() references to CSS custom properties defined in globals.css.
// When we add a light theme in Phase 1, we only need to add a
// [data-theme="light"] selector that overrides :root vars — no CM6
// code changes required.

export const catppuccinMochaTheme = EditorView.theme(
  {
    // Root editor element
    '&': {
      color: 'var(--text-primary)',
      backgroundColor: 'var(--bg-editor)',
    },

    // Caret
    '.cm-content': {
      caretColor: 'var(--text-primary)',
    },
    '.cm-cursor, .cm-dropCursor': {
      borderLeftColor: 'var(--text-primary)',
      borderLeftWidth: '2px',
    },

    // Selection
    '&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection':
      {
        backgroundColor: 'var(--bg-selection)',
      },

    // Active line
    '.cm-activeLine': {
      backgroundColor: 'var(--bg-hover)',
    },

    // Gutters (line numbers area)
    '.cm-gutters': {
      backgroundColor: 'var(--bg-editor)',
      color: 'var(--text-muted)',
      border: 'none',
      borderRight: '1px solid var(--border-default)',
    },
    '.cm-activeLineGutter': {
      backgroundColor: 'var(--bg-hover)',
      color: 'var(--text-secondary)',
    },

    // Panels (search bar, etc.)
    '.cm-panels': {
      backgroundColor: 'var(--bg-sidebar)',
      color: 'var(--text-primary)',
    },
    '.cm-panels.cm-panels-top': {
      borderBottom: '1px solid var(--border-default)',
    },

    // Search matches
    '.cm-searchMatch': {
      backgroundColor: 'rgba(137, 180, 250, 0.25)',
      outline: '1px solid var(--accent-blue)',
    },
    '.cm-searchMatch.cm-searchMatch-selected': {
      backgroundColor: 'rgba(137, 180, 250, 0.35)',
    },

    // Selection match (highlight same word)
    '.cm-selectionMatch': {
      backgroundColor: 'rgba(166, 227, 161, 0.12)',
    },

    // Matching brackets
    '&.cm-focused .cm-matchingBracket': {
      backgroundColor: 'rgba(137, 180, 250, 0.25)',
      outline: '1px solid var(--accent-blue)',
    },
    '&.cm-focused .cm-nonmatchingBracket': {
      backgroundColor: 'rgba(243, 139, 168, 0.25)',
      outline: '1px solid var(--accent-red)',
    },

    // Tooltips (autocomplete, hover)
    '.cm-tooltip': {
      backgroundColor: 'var(--bg-sidebar)',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-sm)',
      color: 'var(--text-primary)',
    },
    '.cm-tooltip .cm-tooltip-arrow:before': {
      borderTopColor: 'transparent',
      borderBottomColor: 'transparent',
    },
    '.cm-tooltip .cm-tooltip-arrow:after': {
      borderTopColor: 'var(--bg-sidebar)',
      borderBottomColor: 'var(--bg-sidebar)',
    },
    '.cm-tooltip-autocomplete': {
      '& > ul > li[aria-selected]': {
        backgroundColor: 'var(--bg-hover)',
        color: 'var(--text-accent)',
      },
    },

    // Fold placeholder
    '.cm-foldPlaceholder': {
      backgroundColor: 'transparent',
      border: 'none',
      color: 'var(--text-muted)',
    },

    // Focus outline removal
    '&.cm-focused': {
      outline: 'none',
    },
  },
  { dark: true }, // Tells CM6 this is a dark theme
);

// ─── Syntax Highlighting Style ────────────────────────────────
//
// Maps Lezer highlight tags to Catppuccin Mocha accent colors.
// Hardcoded hex values (not var()) because syntax colors are
// semantic and need different values for light/dark themes.

export const catppuccinMochaHighlightStyle = HighlightStyle.define([
  // ─── Keywords ────────────────────────────────────────────
  { tag: tags.keyword, color: '#cba6f7' },           // Mauve
  { tag: tags.controlKeyword, color: '#cba6f7' },
  { tag: tags.definitionKeyword, color: '#cba6f7' },
  { tag: tags.moduleKeyword, color: '#cba6f7' },
  { tag: tags.operatorKeyword, color: '#cba6f7' },

  // ─── Names ───────────────────────────────────────────────
  { tag: tags.variableName, color: '#cdd6f4' },      // Text
  { tag: tags.function(tags.variableName), color: '#89b4fa' }, // Blue
  { tag: tags.definition(tags.variableName), color: '#89dceb' }, // Sky
  { tag: tags.propertyName, color: '#89b4fa' },
  { tag: tags.function(tags.propertyName), color: '#89b4fa' },
  { tag: tags.name, color: '#cdd6f4' },
  { tag: tags.labelName, color: '#89b4fa' },
  { tag: tags.className, color: '#f9e2af' },         // Yellow
  { tag: tags.typeName, color: '#f9e2af' },
  { tag: tags.namespace, color: '#f9e2af' },
  { tag: tags.macroName, color: '#89b4fa' },

  // ─── Literals ────────────────────────────────────────────
  { tag: tags.string, color: '#a6e3a1' },            // Green
  { tag: tags.special(tags.string), color: '#a6e3a1' },
  { tag: tags.inserted, color: '#a6e3a1' },
  { tag: tags.number, color: '#fab387' },            // Peach
  { tag: tags.integer, color: '#fab387' },
  { tag: tags.float, color: '#fab387' },
  { tag: tags.bool, color: '#fab387' },
  { tag: tags.null, color: '#fab387' },
  { tag: tags.atom, color: '#fab387' },
  { tag: tags.unit, color: '#fab387' },

  // ─── Operators ───────────────────────────────────────────
  { tag: tags.operator, color: '#89dceb' },          // Sky
  { tag: tags.arithmeticOperator, color: '#89dceb' },
  { tag: tags.compareOperator, color: '#89dceb' },
  { tag: tags.logicOperator, color: '#89dceb' },
  { tag: tags.bitwiseOperator, color: '#89dceb' },
  { tag: tags.definitionOperator, color: '#89dceb' },
  { tag: tags.typeOperator, color: '#89dceb' },
  { tag: tags.updateOperator, color: '#89dceb' },
  { tag: tags.derefOperator, color: '#89dceb' },

  // ─── Comments ────────────────────────────────────────────
  { tag: tags.comment, color: '#585b70', fontStyle: 'italic' },
  { tag: tags.lineComment, color: '#585b70', fontStyle: 'italic' },
  { tag: tags.blockComment, color: '#585b70', fontStyle: 'italic' },
  { tag: tags.docComment, color: '#6c7086', fontStyle: 'italic' },

  // ─── Meta & Special ─────────────────────────────────────
  { tag: tags.meta, color: '#f5c2e7' },              // Pink
  { tag: tags.annotation, color: '#f5c2e7' },
  { tag: tags.modifier, color: '#f5c2e7' },
  { tag: tags.self, color: '#f38ba8' },              // Red
  { tag: tags.regexp, color: '#f38ba8' },
  { tag: tags.escape, color: '#f5c2e7' },
  { tag: tags.special(tags.variableName), color: '#f38ba8' },

  // ─── Markup (Markdown) ──────────────────────────────────
  { tag: tags.heading, color: '#89b4fa', fontWeight: 'bold' },
  { tag: tags.heading1, color: '#89b4fa', fontWeight: 'bold' },
  { tag: tags.heading2, color: '#cba6f7', fontWeight: 'bold' },
  { tag: tags.heading3, color: '#a6e3a1', fontWeight: 'bold' },
  { tag: tags.heading4, color: '#f9e2af', fontWeight: 'bold' },
  { tag: tags.strong, fontWeight: 'bold' },
  { tag: tags.emphasis, fontStyle: 'italic' },
  { tag: tags.strikethrough, textDecoration: 'line-through' },
  { tag: tags.link, color: '#89b4fa', textDecoration: 'underline' },
  { tag: tags.url, color: '#89b4fa' },
  { tag: tags.monospace, color: '#a6e3a1' },
  { tag: tags.quote, color: '#585b70', fontStyle: 'italic' },
  { tag: tags.list, color: '#89b4fa' },

  // ─── HTML/XML ───────────────────────────────────────────
  { tag: tags.tagName, color: '#89b4fa' },
  { tag: tags.attributeName, color: '#f9e2af' },
  { tag: tags.attributeValue, color: '#a6e3a1' },

  // ─── Invalid ─────────────────────────────────────────────
  { tag: tags.invalid, color: '#f38ba8' },
  { tag: tags.deleted, color: '#f38ba8' },
  { tag: tags.changed, color: '#f9e2af' },

  // ─── Separators / Brackets ──────────────────────────────
  { tag: tags.separator, color: '#cdd6f4' },
  { tag: tags.punctuation, color: '#bac2de' },
  { tag: tags.bracket, color: '#bac2de' },
  { tag: tags.angleBracket, color: '#bac2de' },
  { tag: tags.paren, color: '#bac2de' },
  { tag: tags.brace, color: '#bac2de' },
  { tag: tags.squareBracket, color: '#bac2de' },

  // ─── Processing ─────────────────────────────────────────
  { tag: tags.processingInstruction, color: '#cba6f7' },
  { tag: tags.docString, color: '#a6e3a1' },
  { tag: tags.content, color: '#cdd6f4' },
  { tag: tags.contentSeparator, color: '#585b70' },
  { tag: tags.color, color: '#fab387' },
  { tag: tags.constant(tags.name), color: '#fab387' },
  { tag: tags.standard(tags.name), color: '#89b4fa' },
], {
  themeType: 'dark', // Only active when editor theme is dark
});

// ─── Combined Extension ───────────────────────────────────────

/** Catppuccin Mocha theme extension — import and add to extensions array */
export const catppuccinMocha: Extension = [
  catppuccinMochaTheme,
  syntaxHighlighting(catppuccinMochaHighlightStyle),
];
