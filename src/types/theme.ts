/**
 * CodeCraft — Theme Type Definitions
 *
 * Defines the data model for themes (built-in and custom).
 * Used by the theme system and settings store.
 */

/** A complete theme definition including all CSS custom property values */
export interface ThemeDefinition {
  id: string;
  name: string;
  type: 'dark' | 'light';
  colors: ThemeColors;
}

/** All color tokens used in a theme */
export interface ThemeColors {
  surfaceBase: string;
  surfaceRaised: string;
  surfaceSunken: string;
  surfaceOverlay: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;
  accentPrimary: string;
  accentSecondary: string;
  accentDanger: string;
  borderSubtle: string;
  borderVisible: string;
  syntaxKeyword: string;
  syntaxString: string;
  syntaxNumber: string;
  syntaxComment: string;
  syntaxFunction: string;
  syntaxVariable: string;
  syntaxType: string;
  syntaxOperator: string;
  syntaxTag: string;
  syntaxAttribute: string;
  gutterBg: string;
  gutterText: string;
  gutterActive: string;
  selectionBg: string;
  selectionActiveBg: string;
  cursorColor: string;
}

/** Custom theme stored in IndexedDB (user-created) */
export interface CustomTheme {
  id: string;
  name: string;
  type: 'dark' | 'light';
  colors: ThemeColors;
  createdAt: number;
  updatedAt: number;
}

/** Theme import/export JSON format */
export interface ThemeExportFormat {
  format: 'codecraft-theme-v1';
  name: string;
  type: 'dark' | 'light';
  colors: ThemeColors;
}
