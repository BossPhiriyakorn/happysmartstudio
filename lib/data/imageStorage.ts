/**
 * Resolve image URL after crop — developer: data URL in localStorage;
 * product: upload WebP to R2 via /api/upload.
 */
import { isProductMode } from '@/lib/config/appMode';
import { uploadImage } from '@/lib/data/productClient';
import { OUTPUT_IMAGE_EXT } from '@/lib/imageUpload';

export async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const res = await fetch(dataUrl);
  return res.blob();
}

export async function resolveImageUrlForStorage(dataUrl: string): Promise<string> {
  if (!isProductMode()) return dataUrl;

  const blob = await dataUrlToBlob(dataUrl);
  const result = await uploadImage(blob, `upload${OUTPUT_IMAGE_EXT}`);
  if (!result?.url) {
    throw new Error('Image upload failed in product mode');
  }
  return result.url;
}
