import { isDeveloperMode, isProductMode } from '@/lib/config/appMode';
import { loadSiteFromLocalStorage } from '@/lib/data/siteLoader';
import { fetchSiteSnapshot, saveSiteSnapshot, uploadImage } from '@/lib/data/productClient';
import type { SiteSnapshot } from '@/lib/data/types';

/**
 * Client-side content repository — routes by APP_MODE.
 * AppContext uses persistence.ts directly; this module is for future callers.
 */
export const contentRepository = {
  isDeveloper: isDeveloperMode,
  isProduct: isProductMode,

  async load(): Promise<SiteSnapshot> {
    if (isProductMode()) {
      const remote = await fetchSiteSnapshot();
      return remote ?? loadSiteFromLocalStorage();
    }
    return loadSiteFromLocalStorage();
  },

  async save(snapshot: SiteSnapshot): Promise<void> {
    if (isProductMode()) {
      await saveSiteSnapshot(snapshot);
    }
  },

  uploadImage,
};
