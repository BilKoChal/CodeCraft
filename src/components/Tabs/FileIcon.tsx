/**
 * CodeCraft — FileIcon Component
 *
 * Maps file extensions to Lucide React icons with Catppuccin Mocha colors.
 * This is a pure presentational component with no store dependencies.
 *
 * @see Project-Plan.md P0-02 — File Tree Sidebar (icons)
 */

import {
  FileCode2,
  FileJson2,
  Globe,
  Braces,
  FileText,
  File,
} from 'lucide-react';
import { getExtension } from '../../utils/languageDetection';

// ─── Icon Mapping ─────────────────────────────────────────────

/** Maps file extension to a Lucide icon component */
const FILE_ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>> = {
  js: FileCode2,
  jsx: FileCode2,
  mjs: FileCode2,
  cjs: FileCode2,
  ts: FileCode2,
  tsx: FileCode2,
  json: FileJson2,
  html: Globe,
  htm: Globe,
  css: Braces,
  md: FileText,
  markdown: FileText,
  txt: FileText,
};

/** Icon color mapping per extension (Catppuccin Mocha accent colors) */
const FILE_ICON_COLOR_MAP: Record<string, string> = {
  js: 'var(--accent-yellow)',
  jsx: 'var(--accent-yellow)',
  mjs: 'var(--accent-yellow)',
  cjs: 'var(--accent-yellow)',
  ts: 'var(--accent-blue)',
  tsx: 'var(--accent-blue)',
  json: 'var(--accent-green)',
  html: 'var(--accent-peach)',
  htm: 'var(--accent-peach)',
  css: 'var(--accent-sky)',
  md: 'var(--text-secondary)',
  markdown: 'var(--text-secondary)',
  txt: 'var(--text-muted)',
};

// ─── Component ────────────────────────────────────────────────

interface FileIconProps {
  /** Filename with extension (e.g., "index.js") */
  filename: string;
  /** Icon size in pixels (default: 14) */
  size?: number;
  /** Additional CSS class */
  className?: string;
}

/**
 * FileIcon renders the appropriate icon for a file type.
 * Uses Catppuccin Mocha accent colors for each language.
 */
export function FileIcon({ filename, size = 14, className }: FileIconProps) {
  const ext = getExtension(filename);
  const Icon = FILE_ICON_MAP[ext] ?? File;
  const color = FILE_ICON_COLOR_MAP[ext] ?? 'var(--text-muted)';

  return <Icon size={size} className={className} style={{ color, flexShrink: 0 }} />;
}
