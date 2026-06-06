/** Minimal Cloudflare binding types — matches wrangler.toml binding names. */
export interface CloudflareBindings {
  /** D1 database binding (wrangler: [[d1_databases]] binding = "DB") */
  DB: D1Database;
  /** R2 bucket binding (wrangler: [[r2_buckets]] binding = "MEDIA") */
  MEDIA: R2Bucket;
}

export interface CloudflareEnv extends CloudflareBindings {
  /** Optional — set via wrangler [vars] or Cloudflare dashboard */
  R2_PUBLIC_URL?: string;
  R2_BUCKET_NAME?: string;
  SITE_ID?: string;
}
