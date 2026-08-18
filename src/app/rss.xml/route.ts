import { articleHref } from '@/lib/routes';
import { getSettings } from '@/lib/settings';
import { SITE, absoluteUrl } from '@/lib/site-config';
import { escapeXml } from '@/lib/xml';
import { getAllPublishedForFeed } from '@/server/queries';

// Derleme anında değil, ilk istekte üretilir; tazeliği CDN önbelleği yönetir.
export const dynamic = 'force-dynamic';

export async function GET() {
  const [articles, settings] = await Promise.all([getAllPublishedForFeed(50), getSettings()]);

  const items = articles
    .map((article) => {
      const url = absoluteUrl(articleHref(article.category.slug, article.slug));
      const pubDate = (article.publishedAt ?? article.updatedAt).toUTCString();

      return `    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${escapeXml(url)}</link>
      <guid isPermaLink="true">${escapeXml(url)}</guid>
      <description>${escapeXml(article.dek)}</description>
      <category>${escapeXml(article.category.name)}</category>
      <dc:creator>${escapeXml(article.authorName)}</dc:creator>
      <pubDate>${pubDate}</pubDate>
    </item>`;
    })
    .join('\n');

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE.name)}</title>
    <link>${escapeXml(absoluteUrl('/'))}</link>
    <description>${escapeXml(settings.description)}</description>
    <language>tr</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${escapeXml(absoluteUrl('/rss.xml'))}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(feed, {
    headers: {
      'content-type': 'application/rss+xml; charset=utf-8',
      'cache-control': 'public, max-age=0, s-maxage=900, stale-while-revalidate=3600',
    },
  });
}
