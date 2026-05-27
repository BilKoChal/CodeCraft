/**
 * CodeCraft — File Utilities
 *
 * Path manipulation, size formatting, and other file-related helpers.
 */

/** Format bytes into a human-readable string */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = bytes / Math.pow(1024, i);
  return `${size.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

/** Get the relative path of a file within a project */
export function getRelativePath(filePath: string, basePath: string = ''): string {
  if (!basePath) return filePath;
  return filePath.startsWith(basePath)
    ? filePath.slice(basePath.length).replace(/^\//, '')
    : filePath;
}

/** Get the directory portion of a path */
export function getDirectoryPath(filePath: string): string {
  const parts = filePath.split('/');
  parts.pop();
  return parts.join('/');
}

/** Get the filename from a full path */
export function getFileName(filePath: string): string {
  return filePath.split('/').pop() ?? filePath;
}

/** Join path segments */
export function joinPath(...segments: string[]): string {
  return segments
    .filter(Boolean)
    .join('/')
    .replace(/\/+/g, '/');
}
