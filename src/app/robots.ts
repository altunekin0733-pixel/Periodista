import type { MetadataRoute } from 'next';

import { absoluteUrl } from '@/lib/site-config';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Yönetim ve arama sonuçları dizine eklenmez.
        disallow: ['/admin', '/giris', '/api/', '/arama'],
      },
    ],
    sitemap: [absoluteUrl('/sitemap.xml'), absoluteUrl('/haber-sitemap.xml')],
    host: absoluteUrl('/'),
  };
}
