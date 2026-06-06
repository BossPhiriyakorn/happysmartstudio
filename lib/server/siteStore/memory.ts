import { emptySiteSnapshot } from '@/lib/data/defaults';
import type { SiteSnapshot } from '@/lib/data/types';
import type { SiteStore } from '@/lib/server/siteStore/types';

/** In-process store — used when D1 is not bound (local product API smoke tests). */
export class MemorySiteStore implements SiteStore {
  private snapshot: SiteSnapshot = emptySiteSnapshot();

  async load(): Promise<SiteSnapshot | null> {
    return structuredClone(this.snapshot);
  }

  async save(snapshot: SiteSnapshot): Promise<void> {
    this.snapshot = structuredClone(snapshot);
  }
}
