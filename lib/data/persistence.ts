import { isDeveloperMode, isProductMode } from '@/lib/config/appMode';
import { readLocalJson, writeLocalJson } from '@/lib/data/localPersistence';
import { fetchSiteSnapshot, saveSiteSnapshot } from '@/lib/data/productClient';
import type { SiteSnapshot } from '@/lib/data/types';

let productSaveTimer: ReturnType<typeof setTimeout> | null = null;
const PRODUCT_SAVE_DEBOUNCE_MS = 800;

/** Load full site state — developer: localStorage; product: API */
export async function loadSiteSnapshot(): Promise<SiteSnapshot | null> {
  if (isProductMode()) {
    return fetchSiteSnapshot();
  }
  return null;
}

/** Persist a single storage key (developer mode only). */
export function persistLocalField<K extends keyof typeof import('@/lib/storageKeys').STORAGE_KEYS>(
  key: K,
  data: unknown,
): void {
  if (!isDeveloperMode()) return;
  writeLocalJson(key, data);
}

export { readLocalJson, writeLocalJson };

/** Debounced full snapshot save for product mode */
export function scheduleProductSnapshotSave(snapshot: SiteSnapshot): void {
  if (!isProductMode()) return;
  if (productSaveTimer) clearTimeout(productSaveTimer);
  productSaveTimer = setTimeout(() => {
    void saveSiteSnapshot(snapshot);
  }, PRODUCT_SAVE_DEBOUNCE_MS);
}

export async function flushProductSnapshotSave(snapshot: SiteSnapshot): Promise<boolean> {
  if (!isProductMode()) return true;
  if (productSaveTimer) {
    clearTimeout(productSaveTimer);
    productSaveTimer = null;
  }
  return saveSiteSnapshot(snapshot);
}
