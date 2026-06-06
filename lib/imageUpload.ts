/** Max upload size for raster images (client crop + API). */
export const MAX_IMAGE_UPLOAD_BYTES = 20 * 1024 * 1024;

/** Warn in dev/mock when storing large base64 in localStorage. */
export const LARGE_IMAGE_WARN_BYTES = 500 * 1024;

export const OUTPUT_IMAGE_MIME_WEBP = 'image/webp';
export const OUTPUT_IMAGE_MIME_JPEG = 'image/jpeg';
export const OUTPUT_IMAGE_EXT = '.webp';

const RASTER_EXT = /\.(jpe?g|png|gif|webp|avif|bmp|tiff?|heic|heif|ico)$/i;
const BLOCKED_MIMES = new Set(['image/svg+xml']);

function fileName(file: File | Blob): string {
  return 'name' in file && typeof file.name === 'string' ? file.name : '';
}

export function isSvgImage(file: File | Blob): boolean {
  const type = file.type?.toLowerCase() ?? '';
  if (type === 'image/svg+xml') return true;
  return /\.svg$/i.test(fileName(file));
}

/** Raster images suitable for canvas encode (excludes SVG). */
export function isAcceptedImageFile(file: File | Blob): boolean {
  if (file.size <= 0 || file.size > MAX_IMAGE_UPLOAD_BYTES) return false;
  if (isSvgImage(file)) return false;

  const type = file.type?.toLowerCase() ?? '';
  if (type) {
    return type.startsWith('image/') && !BLOCKED_MIMES.has(type);
  }

  return RASTER_EXT.test(fileName(file));
}

export type ImageUploadValidationError = 'too_large' | 'svg' | 'invalid';

export function getImageUploadValidationError(file: File | Blob): ImageUploadValidationError | null {
  if (file.size > MAX_IMAGE_UPLOAD_BYTES) return 'too_large';
  if (isSvgImage(file)) return 'svg';
  if (!isAcceptedImageFile(file)) return 'invalid';
  return null;
}

/** File input accept list — broad raster support; SVG excluded (not canvas-safe). */
export const ACCEPTED_IMAGE_TYPES =
  'image/jpeg,image/png,image/gif,image/webp,image/avif,image/bmp,image/tiff,image/heic,image/heif,.jpg,.jpeg,.png,.gif,.webp,.avif,.bmp,.tif,.tiff,.heic,.heif';
