/**
 * Application mode — switch at deploy via env (rebuild required for NEXT_PUBLIC_*).
 *
 * developer: localStorage + optional mock (current local workflow)
 * product:   API → D1 + R2 (production)
 */
export type AppMode = 'developer' | 'product';

const PUBLIC_MODE = process.env.NEXT_PUBLIC_APP_MODE;
const SERVER_MODE = process.env.APP_MODE;

function resolveMode(raw: string | undefined): AppMode {
  if (raw === 'product') return 'product';
  return 'developer';
}

/** Server-side mode (API routes, getSiteStore). */
export function getServerAppMode(): AppMode {
  return resolveMode(SERVER_MODE ?? PUBLIC_MODE);
}

/** Client-safe mode (bundled at build). */
export function getClientAppMode(): AppMode {
  return resolveMode(PUBLIC_MODE ?? SERVER_MODE);
}

export function isDeveloperMode(): boolean {
  return getClientAppMode() === 'developer';
}

export function isProductMode(): boolean {
  return getClientAppMode() === 'product';
}

export function isServerDeveloperMode(): boolean {
  return getServerAppMode() === 'developer';
}

export function isServerProductMode(): boolean {
  return getServerAppMode() === 'product';
}
