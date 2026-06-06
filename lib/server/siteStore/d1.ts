import { getCloudflareBindings, getSiteId } from '@/lib/server/cloudflare/bindings';
import { emptySiteSnapshot } from '@/lib/data/defaults';
import type { SiteSnapshot } from '@/lib/data/types';
import {
  buildSaveSnapshotBatch,
  loadSnapshotFromD1,
} from '@/lib/server/siteStore/d1Mapper';
import type { SiteStore } from '@/lib/server/siteStore/types';

/**
 * D1-backed site persistence — maps SiteSnapshot ↔ normalized tables in schema.sql.
 * Requires wrangler binding `DB` (see wrangler.toml).
 */
export class D1SiteStore implements SiteStore {
  private async getDb(): Promise<D1Database> {
    const bindings = await getCloudflareBindings();
    if (!bindings?.DB) {
      throw new Error(
        'D1 binding DB not available. Deploy with wrangler.toml [[d1_databases]] or run wrangler dev.',
      );
    }
    return bindings.DB;
  }

  async load(siteId?: string): Promise<SiteSnapshot | null> {
    const db = await this.getDb();
    const id = siteId ?? getSiteId();
    const snapshot = await loadSnapshotFromD1(db, id);
    return snapshot ?? emptySiteSnapshot();
  }

  async save(snapshot: SiteSnapshot, siteId?: string): Promise<void> {
    const db = await this.getDb();
    const id = siteId ?? getSiteId();
    const batch = buildSaveSnapshotBatch(db, snapshot, id);
    await db.batch(batch);
  }
}
