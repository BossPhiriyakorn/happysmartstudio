import type {NextConfig} from 'next';

/** โดเมน tunnel (Cloudflare/ngrok) ต้องอนุญาตใน dev — ไม่งั้น JS/HMR ถูก block */
function getAllowedDevOrigins(): string[] {
  const origins = new Set<string>([
    '*.trycloudflare.com',
    '*.ngrok-free.app',
    '*.ngrok.io',
  ]);

  const appUrl = process.env.APP_URL;
  if (appUrl && appUrl !== 'MY_APP_URL') {
    try {
      origins.add(new URL(appUrl).hostname);
    } catch {
      // invalid APP_URL — ignore
    }
  }

  return [...origins];
}

function getR2ImageRemotePattern(): {protocol: 'https' | 'http'; hostname: string; port: string; pathname: string} | null {
  const r2Public = process.env.R2_PUBLIC_URL;
  if (!r2Public || r2Public === 'MY_APP_URL') return null;
  try {
    const parsed = new URL(r2Public);
    const protocol = parsed.protocol === 'http:' ? 'http' : 'https';
    return {
      protocol,
      hostname: parsed.hostname,
      port: parsed.port,
      pathname: '/**',
    };
  } catch {
    return null;
  }
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: getAllowedDevOrigins(),
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    formats: ['image/webp', 'image/avif'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      ...(getR2ImageRemotePattern() ? [getR2ImageRemotePattern()!] : []),
    ],
  },
  output: 'standalone',
  transpilePackages: ['motion'],
  webpack: (config, {dev}) => {
    // HMR is disabled in AI Studio via DISABLE_HMR env var.
    // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
    if (dev && process.env.DISABLE_HMR === 'true') {
      config.watchOptions = {
        ignored: /.*/,
      };
    }
    return config;
  },
};

export default nextConfig;
