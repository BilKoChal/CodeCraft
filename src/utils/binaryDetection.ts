/**
 * CodeCraft — Binary File Detection Utility
 *
 * Determines if a file is binary (image, font, etc.) based on extension.
 */

const BINARY_EXTENSIONS = new Set([
  'png', 'jpg', 'jpeg', 'gif', 'bmp', 'ico', 'webp', 'svg',
  'pdf', 'zip', 'gz', 'tar', 'rar',
  'woff', 'woff2', 'ttf', 'eot', 'otf',
  'mp3', 'mp4', 'webm', 'avi', 'mov',
  'wasm',
]);

/** Check if a file is binary based on its extension */
export function isBinaryFile(fileName: string): boolean {
  const ext = fileName.split('.').pop()?.toLowerCase() ?? '';
  return BINARY_EXTENSIONS.has(ext);
}

/** Get the MIME type for common binary files */
export function getMimeType(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase() ?? '';
  const mimeMap: Record<string, string> = {
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    svg: 'image/svg+xml',
    webp: 'image/webp',
    ico: 'image/x-icon',
    pdf: 'application/pdf',
    zip: 'application/zip',
    woff: 'font/woff',
    woff2: 'font/woff2',
    ttf: 'font/ttf',
    wasm: 'application/wasm',
  };
  return mimeMap[ext] ?? 'application/octet-stream';
}
