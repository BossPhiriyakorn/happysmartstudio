/** Hosts that already serve sized/cropped assets — skip Next.js server-side fetch. */
const REMOTE_OPTIMIZER_BYPASS_HOSTS = new Set([
  'images.unsplash.com',
  'plus.unsplash.com',
  'picsum.photos',
]);

function isRemoteUrl(src: string): boolean {
  return /^https?:\/\//i.test(src);
}

/**
 * When true, use `<Image unoptimized />` so the browser loads the URL directly.
 * Avoids dev-server ETIMEDOUT from `/_next/image` proxying Unsplash/external CDNs (common on WSL/tunnel).
 */
export function shouldBypassImageOptimizer(src: string): boolean {
  if (!src) return false;
  if (src.startsWith('data:') || src.startsWith('blob:')) return true;
  if (!isRemoteUrl(src)) return false;

  try {
    const { hostname } = new URL(src);
    if (REMOTE_OPTIMIZER_BYPASS_HOSTS.has(hostname)) return true;
  } catch {
    return false;
  }

  if (process.env.NODE_ENV === 'development') return true;

  return false;
}

/** True when URL points at a WebP asset (R2/CDN or relative path). */
export function isWebpImageUrl(src: string): boolean {
  return /\.webp(\?|#|$)/i.test(src) || src.startsWith('data:image/webp');
}
