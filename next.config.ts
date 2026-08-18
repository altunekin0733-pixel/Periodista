import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Vercel Blob'a yüklenen haber görselleri
      { protocol: 'https', hostname: '*.public.blob.vercel-storage.com' },
    ],
    formats: ['image/avif', 'image/webp'],
  },

  // Prisma yalnızca sunucuda çalışır; istemci paketine sürüklenmesin.
  serverExternalPackages: ['@prisma/adapter-pg', 'pg'],

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
