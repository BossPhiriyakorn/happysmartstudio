import {
  getCloudflareEnv,
  getR2BucketName,
  getR2PublicUrl,
  getSiteId,
} from '@/lib/server/cloudflare/bindings';
import { OUTPUT_IMAGE_MIME_WEBP } from '@/lib/imageUpload';

export interface R2UploadInput {
  body: ArrayBuffer | Uint8Array | Blob;
  contentType?: string;
  originalName?: string;
  /** Override key prefix — default `uploads/` */
  prefix?: string;
}

export interface R2UploadResult {
  mediaId: string;
  r2Key: string;
  publicUrl: string;
  contentType: string;
  sizeBytes: number;
}

function mediaIdNow(): string {
  return `media_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function bodyToArrayBuffer(body: ArrayBuffer | Uint8Array | Blob): Promise<ArrayBuffer> {
  if (body instanceof Blob) return body.arrayBuffer();
  if (body instanceof Uint8Array) {
    const copy = body.slice();
    return Promise.resolve(copy.buffer);
  }
  return Promise.resolve(body);
}

/**
 * Upload bytes to the bound R2 bucket and optionally register metadata in D1.
 * Throws when bindings or R2_PUBLIC_URL are missing — caller maps to HTTP status.
 */
export async function uploadToR2(input: R2UploadInput): Promise<R2UploadResult> {
  const env = await getCloudflareEnv();
  if (!env?.MEDIA) {
    throw new Error('R2 binding MEDIA not available. Check wrangler.toml [[r2_buckets]].');
  }

  const publicBase = getR2PublicUrl(env);
  if (!publicBase) {
    throw new Error('R2_PUBLIC_URL is not set. Configure a public bucket URL or custom domain.');
  }

  const bucketName = getR2BucketName(env);
  if (!bucketName) {
    throw new Error('R2_BUCKET_NAME is not set.');
  }

  const contentType = input.contentType ?? OUTPUT_IMAGE_MIME_WEBP;
  const mediaId = mediaIdNow();
  const prefix = input.prefix ?? 'uploads';
  const ext = contentType === OUTPUT_IMAGE_MIME_WEBP ? '.webp' : '';
  const r2Key = `${prefix}/${mediaId}${ext}`;
  const buffer = await bodyToArrayBuffer(input.body);

  await env.MEDIA.put(r2Key, buffer, {
    httpMetadata: { contentType },
  });

  const publicUrl = `${publicBase}/${r2Key}`;

  if (env.DB) {
    const siteId = getSiteId(env);
    await env.DB.prepare(
      `INSERT INTO media_assets (
        id, site_id, r2_bucket, r2_key, public_url, mime_type, size_bytes, original_filename
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind(
        mediaId,
        siteId,
        bucketName,
        r2Key,
        publicUrl,
        contentType,
        buffer.byteLength,
        input.originalName ?? null,
      )
      .run();
  }

  return {
    mediaId,
    r2Key,
    publicUrl,
    contentType,
    sizeBytes: buffer.byteLength,
  };
}
