import type { SiteSnapshot } from '@/lib/data/types';

const SITE_API = '/api/site';

export async function fetchSiteSnapshot(): Promise<SiteSnapshot | null> {
  const res = await fetch(SITE_API, { cache: 'no-store' });
  if (!res.ok) {
    console.error('[product] GET /api/site failed', res.status);
    return null;
  }
  const data = (await res.json()) as { snapshot?: SiteSnapshot };
  return data.snapshot ?? null;
}

export async function saveSiteSnapshot(snapshot: SiteSnapshot): Promise<boolean> {
  const res = await fetch(SITE_API, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ snapshot }),
  });
  if (!res.ok) {
    console.error('[product] PUT /api/site failed', res.status);
    return false;
  }
  return true;
}

export interface UploadImageResult {
  url: string;
  mediaId: string;
  r2Key?: string;
}

export async function uploadImage(file: Blob, filename?: string): Promise<UploadImageResult | null> {
  const form = new FormData();
  form.append('file', file, filename ?? 'upload.webp');
  const res = await fetch('/api/upload', { method: 'POST', body: form });
  if (!res.ok) {
    console.error('[product] POST /api/upload failed', res.status);
    return null;
  }
  return (await res.json()) as UploadImageResult;
}
