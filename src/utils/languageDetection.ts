/**
 * CodeCraft — Language Detection Utility
 *
 * Maps file extensions to CodeMirror language modes.
 * To be fully implemented in PH1-03 with @codemirror/language-data.
 */

/** Map of file extensions to language identifiers */
const EXTENSION_TO_LANGUAGE: Record<string, string> = {
  js: 'javascript',
  jsx: 'javascript',
  ts: 'typescript',
  tsx: 'typescript',
  html: 'html',
  htm: 'html',
  css: 'css',
  scss: 'scss',
  less: 'less',
  json: 'json',
  md: 'markdown',
  py: 'python',
  java: 'java',
  c: 'cpp',
  cpp: 'cpp',
  h: 'cpp',
  hpp: 'cpp',
  go: 'go',
  rs: 'rust',
  sql: 'sql',
  php: 'php',
  xml: 'xml',
  yaml: 'yaml',
  yml: 'yaml',
  rb: 'ruby',
  swift: 'swift',
  kt: 'kotlin',
  sh: 'shell',
  bash: 'shell',
  lua: 'lua',
  r: 'r',
  dart: 'dart',
  vue: 'vue',
};

/** Detect the language from a file extension */
export function detectLanguage(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase() ?? '';
  return EXTENSION_TO_LANGUAGE[ext] ?? 'plaintext';
}

/** Get the file extension from a filename */
export function getFileExtension(fileName: string): string {
  return fileName.split('.').pop()?.toLowerCase() ?? '';
}
