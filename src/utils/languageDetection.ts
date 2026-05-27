/**
 * CodeCraft — Language Detection Utility
 *
 * Maps file extensions to language identifiers for CodeMirror 6
 * syntax highlighting and code execution routing.
 */

import type { LanguageId } from '../types';

/** Map of file extension (without dot) to language ID */
const EXTENSION_MAP: Record<string, LanguageId> = {
  js: 'javascript',
  jsx: 'javascript',
  mjs: 'javascript',
  cjs: 'javascript',
  ts: 'typescript',
  tsx: 'typescript',
  html: 'html',
  htm: 'html',
  css: 'css',
  json: 'json',
  md: 'markdown',
  markdown: 'markdown',
  txt: 'plaintext',
};

/**
 * Detect the language of a file based on its extension.
 * Falls back to 'plaintext' if the extension is unknown.
 */
export function detectLanguage(filename: string): LanguageId {
  const dotIndex = filename.lastIndexOf('.');
  if (dotIndex === -1) return 'plaintext';

  const ext = filename.slice(dotIndex + 1).toLowerCase();
  return EXTENSION_MAP[ext] ?? 'plaintext';
}

/**
 * Get the file extension (without dot) from a filename.
 */
export function getExtension(filename: string): string {
  const dotIndex = filename.lastIndexOf('.');
  if (dotIndex === -1) return '';
  return filename.slice(dotIndex + 1).toLowerCase();
}

/**
 * Check if a language is executable (has a code runner).
 * In Phase 0, only JavaScript is executable.
 */
export function isExecutable(language: LanguageId): boolean {
  return language === 'javascript';
}
