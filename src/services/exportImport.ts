/**
 * CodeCraft — Export/Import Service (JSZip)
 *
 * .zip export and import for project files.
 * To be fully implemented in PH2-07 and PH2-08.
 */

// PH2-07: exportProject() — Create ZIP from project files
// PH2-08: importProject() — Parse uploaded ZIP into project

export const EXPORT_METADATA_PATH = '.codecraft/project.json';

/** Metadata embedded in exported .zip files */
export interface ProjectExportMetadata {
  name: string;
  version: string;
  exportedAt: number;
  codecraftVersion: string;
}
