/// <reference types="@cloudflare/workers-types" />

declare module '@opennextjs/cloudflare' {
  export function getCloudflareContext(options?: {
    async?: boolean;
  }): Promise<{ env: import('@/lib/server/cloudflare/types').CloudflareEnv }>;
}
