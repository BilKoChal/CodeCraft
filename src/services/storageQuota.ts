/**
 * CodeCraft — Storage Quota Monitor
 *
 * Monitors IndexedDB storage usage and warns when approaching limits.
 * To be fully implemented in PH2-12.
 */

/** Request persistent storage to prevent browser eviction */
export async function requestPersistentStorage(): Promise<boolean> {
  if (navigator.storage && navigator.storage.persist) {
    return await navigator.storage.persist();
  }
  return false;
}

/** Get current storage quota estimate */
export async function getStorageEstimate(): Promise<{
  usage: number;
  quota: number;
  usagePercent: number;
} | null> {
  if (navigator.storage && navigator.storage.estimate) {
    const estimate = await navigator.storage.estimate();
    return {
      usage: estimate.usage ?? 0,
      quota: estimate.quota ?? 0,
      usagePercent: estimate.usage && estimate.quota
        ? (estimate.usage / estimate.quota) * 100
        : 0,
    };
  }
  return null;
}
