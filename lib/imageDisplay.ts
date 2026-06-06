/**
 * Next/Image optimizer cannot process data/blob URLs.
 * WebP (and other formats) in data URLs must use unoptimized or a plain <img>.
 */
export function shouldBypassImageOptimizer(src: string): boolean {
  if (!src) return false;
  return src.startsWith('data:') || src.startsWith('blob:');
}

/** True when URL points at a WebP asset (R2/CDN or relative path). */
export function isWebpImageUrl(src: string): boolean {
  return /\.webp(\?|#|$)/i.test(src) || src.startsWith('data:image/webp');
}
