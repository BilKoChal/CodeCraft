/**
 * CodeCraft — .editorconfig Parser
 *
 * Lightweight regex-based parser for .editorconfig files.
 * To be fully implemented in PH2-10.
 */

export interface EditorConfigSettings {
  indent_style?: 'space' | 'tab';
  indent_size?: number;
  end_of_line?: 'lf' | 'crlf';
  charset?: string;
  trim_trailing_whitespace?: boolean;
  insert_final_newline?: boolean;
}

/** Parse an .editorconfig file content into settings */
export function parseEditorConfig(content: string): EditorConfigSettings {
  // PH2-10: Full implementation with section support
  const settings: EditorConfigSettings = {};
  const lines = content.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith(';')) continue;
    if (trimmed.startsWith('[')) break; // Stop at first section for root-only parsing

    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;

    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim();

    switch (key) {
      case 'indent_style':
        settings.indent_style = value === 'tab' ? 'tab' : 'space';
        break;
      case 'indent_size':
        settings.indent_size = parseInt(value, 10) || undefined;
        break;
      case 'end_of_line':
        settings.end_of_line = value === 'crlf' ? 'crlf' : 'lf';
        break;
      case 'charset':
        settings.charset = value;
        break;
      case 'trim_trailing_whitespace':
        settings.trim_trailing_whitespace = value === 'true';
        break;
      case 'insert_final_newline':
        settings.insert_final_newline = value === 'true';
        break;
    }
  }

  return settings;
}
