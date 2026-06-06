import { isServerProductMode } from '@/lib/config/appMode';
import { MemorySiteStore } from '@/lib/server/siteStore/memory';
import { D1SiteStore } from '@/lib/server/siteStore/d1';
import type { SiteStore } from '@/lib/server/siteStore/types';

let store: SiteStore | null = null;

/**
 * Returns the active site persistence backend.
 *
 * | SITE_STORE | Where data lives |
 * |------------|------------------|
 * | memory     | In-process RAM (local product API smoke tests) |
 * | d1         | Cloudflare D1 via wrangler binding `DB` |
 */
export function getSiteStore(): SiteStore {
  if (!store) {
    const backend = process.env.SITE_STORE?.trim().toLowerCase() ?? 'memory';
    if (backend === 'd1') {
      store = new D1SiteStore();
    } else {
      store = new MemorySiteStore();
    }
  }
  return store;
}

export function assertProductApiEnabled(): void {
  if (!isServerProductMode()) {
    throw new Error('Site API is only available when APP_MODE=product');
  }
}

/** Reset singleton — for tests only */
export function resetSiteStoreForTests(): void {
  store = null;
}
