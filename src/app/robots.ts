import type { MetadataRoute } from 'next';

import { absoluteUrl } from '@/lib/site-config';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Yönetim, arama sonuçları ve RSS akışı dizine eklenmez.
        disallow: ['/admin', '/giris', '/api/', '/arama', '/rss.xml'],
      },
    ],
    sitemap: [absoluteUrl('/sitemap.xml'), absoluteUrl('/haber-sitemap.xml')],
    host: absoluteUrl('/'),
  };
}
