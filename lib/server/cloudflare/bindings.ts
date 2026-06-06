import type { CloudflareBindings, CloudflareEnv } from '@/lib/server/cloudflare/types';

/**
 * Resolve Cloudflare Worker bindings at runtime.
 *
 * Production (OpenNext on Cloudflare Workers):
 *   Install @opennextjs/cloudflare and deploy with wrangler.toml bindings.
 *
 * Local wrangler dev:
 *   `wrangler dev` injects bindings into the same context.
 *
 * Plain `next dev`:
 *   Returns null — use APP_MODE=developer or SITE_STORE=memory for local work.
 */
export async function getCloudflareEnv(): Promise<CloudflareEnv | null> {
  try {
    const mod = await import('@opennextjs/cloudflare');
    const ctx = await mod.getCloudflareContext({ async: true });
    const env = ctx?.env as CloudflareEnv | undefined;
    if (env?.DB && env?.MEDIA) return env;
  } catch {
    // @opennextjs/cloudflare not installed — expected during local Next dev
  }
  return null;
}

export async function getCloudflareBindings(): Promise<CloudflareBindings | null> {
  const env = await getCloudflareEnv();
  if (!env?.DB || !env?.MEDIA) return null;
  return { DB: env.DB, MEDIA: env.MEDIA };
}

/** Site tenant id — single-tenant default from schema.sql */
export function getSiteId(env?: CloudflareEnv | null): string {
  return env?.SITE_ID?.trim() || process.env.SITE_ID?.trim() || 'default';
}

/** Public base URL for R2 objects (custom domain or r2.dev). */
export function getR2PublicUrl(env?: CloudflareEnv | null): string | null {
  const raw = env?.R2_PUBLIC_URL ?? process.env.R2_PUBLIC_URL;
  if (!raw || raw === 'MY_APP_URL') return null;
  return raw.replace(/\/$/, '');
}

export function getR2BucketName(env?: CloudflareEnv | null): string | null {
  const name = env?.R2_BUCKET_NAME ?? process.env.R2_BUCKET_NAME;
  return name?.trim() || null;
}
