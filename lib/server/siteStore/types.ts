import type { SiteSnapshot } from '@/lib/data/types';

export interface SiteStore {
  load(siteId?: string): Promise<SiteSnapshot | null>;
  save(snapshot: SiteSnapshot, siteId?: string): Promise<void>;
}
