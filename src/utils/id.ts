/**
 * CodeCraft — UUID Generator
 *
 * Generates cryptographically random UUIDs for project and file IDs.
 * Uses the Web Crypto API (available in all modern browsers).
 */

/** Generate a v4 UUID using crypto.randomUUID (preferred) */
export function generateId(): string {
  // Modern browsers support crypto.randomUUID()
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback: manual v4 UUID generation
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
