import type { PixelCrop } from 'react-image-crop';
import { ImageAspectRatio } from '@/types/content';
import {
  ACCEPTED_IMAGE_TYPES,
  OUTPUT_IMAGE_MIME_JPEG,
  OUTPUT_IMAGE_MIME_WEBP,
} from '@/lib/imageUpload';

export { ACCEPTED_IMAGE_TYPES };

export const WEBP_OUTPUT_QUALITY = 0.82;
export const WEBP_MAX_DIMENSION = 1600;

export const ASPECT_RATIO_VALUES: Record<ImageAspectRatio, number> = {
  '1:1': 1,
  '4:3': 4 / 3,
  '16:9': 16 / 9,
  '9:16': 9 / 16,
  '3:4': 3 / 4,
};

export const ASPECT_RATIO_OPTIONS: ImageAspectRatio[] = ['1:1', '4:3', '16:9', '9:16', '3:4'];

export const RECOMMENDED_IMAGE_PIXELS: Record<
  ImageAspectRatio,
  { width: number; height: number; minWidth: number; minHeight: number }
> = {
  '1:1': { width: 800, height: 800, minWidth: 600, minHeight: 600 },
  '4:3': { width: 1200, height: 900, minWidth: 800, minHeight: 600 },
  '16:9': { width: 1280, height: 720, minWidth: 854, minHeight: 480 },
  '9:16': { width: 720, height: 1280, minWidth: 480, minHeight: 854 },
  '3:4': { width: 900, height: 1200, minWidth: 600, minHeight: 800 },
};

export const SLIDE_DEFAULT_ASPECT_RATIO: ImageAspectRatio = '4:3';

export function formatImageSizeGuide(ratio: ImageAspectRatio): string {
  const spec = RECOMMENDED_IMAGE_PIXELS[ratio];
  return `แนะนำ ${spec.width}×${spec.height} px (${ratio}) · ขั้นต่ำ ${spec.minWidth}×${spec.minHeight} px · บันทึกเป็น WebP`;
}

export function aspectRatioClass(ratio: ImageAspectRatio): string {
  const map: Record<ImageAspectRatio, string> = {
    '1:1': 'aspect-square',
    '4:3': 'aspect-[4/3]',
    '16:9': 'aspect-video',
    '9:16': 'aspect-[9/16]',
    '3:4': 'aspect-[3/4]',
  };
  return map[ratio];
}

export function detectClosestAspectRatio(width: number, height: number): ImageAspectRatio {
  if (width <= 0 || height <= 0) return '4:3';
  const value = width / height;

  if (Math.abs(value - 1) <= 0.08) return '1:1';

  const landscape: ImageAspectRatio[] = ['4:3', '16:9'];
  const portrait: ImageAspectRatio[] = ['3:4', '9:16'];
  const candidates = value > 1 ? landscape : portrait;

  return candidates.reduce((best, current) =>
    Math.abs(value - ASPECT_RATIO_VALUES[current]) < Math.abs(value - ASPECT_RATIO_VALUES[best])
      ? current
      : best,
  );
}

/** Encode canvas as WebP; fall back to JPEG when the browser cannot emit WebP. */
export function canvasToStoredImageDataUrl(
  canvas: HTMLCanvasElement,
  quality = WEBP_OUTPUT_QUALITY,
): string {
  const webp = canvas.toDataURL(OUTPUT_IMAGE_MIME_WEBP, quality);
  if (webp.startsWith(`data:${OUTPUT_IMAGE_MIME_WEBP}`)) return webp;
  return canvas.toDataURL(OUTPUT_IMAGE_MIME_JPEG, quality);
}

/** Resize full image (no crop) for storage — keeps aspect ratio, caps pixel size. */
export async function fullImageToDataUrl(
  image: HTMLImageElement,
  maxSize = WEBP_MAX_DIMENSION,
  quality = WEBP_OUTPUT_QUALITY,
): Promise<string> {
  let width = image.naturalWidth;
  let height = image.naturalHeight;

  if (width <= 0 || height <= 0) {
    throw new Error('Invalid image dimensions');
  }

  if (width > maxSize || height > maxSize) {
    const ratio = Math.min(maxSize / width, maxSize / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');

  ctx.drawImage(image, 0, 0, width, height);
  return canvasToStoredImageDataUrl(canvas, quality);
}

export async function cropImageToDataUrl(
  image: HTMLImageElement,
  pixelCrop: PixelCrop,
  maxSize = WEBP_MAX_DIMENSION,
  quality = WEBP_OUTPUT_QUALITY,
): Promise<string> {
  const canvas = document.createElement('canvas');
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  let width = pixelCrop.width * scaleX;
  let height = pixelCrop.height * scaleY;

  if (width > maxSize || height > maxSize) {
    const ratio = Math.min(maxSize / width, maxSize / height);
    width *= ratio;
    height *= ratio;
  }

  canvas.width = Math.round(width);
  canvas.height = Math.round(height);

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');

  ctx.drawImage(
    image,
    pixelCrop.x * scaleX,
    pixelCrop.y * scaleY,
    pixelCrop.width * scaleX,
    pixelCrop.height * scaleY,
    0,
    0,
    canvas.width,
    canvas.height,
  );

  return canvasToStoredImageDataUrl(canvas, quality);
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
