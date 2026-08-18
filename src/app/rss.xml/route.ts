import { getArticles, getSettings } from '@/lib/content';
import { articleHref } from '@/lib/routes';
import { SITE, absoluteUrl } from '@/lib/site-config';
import { escapeXml } from '@/lib/xml';

// Statik dışa aktarımda bu uç, derleme anında tek bir dosyaya dönüşür.
export const dynamic = 'force-static';

export function GET() {
  const settings = getSettings();

  const items = getArticles()
    .slice(0, 50)
    .map((article) => {
      const url = absoluteUrl(articleHref(article.category.slug, article.slug));

      return `    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${escapeXml(url)}</link>
      <guid isPermaLink="true">${escapeXml(url)}</guid>
      <description>${escapeXml(article.dek)}</description>
      <category>${escapeXml(article.category.name)}</category>
      <dc:creator>${escapeXml(article.authorName)}</dc:creator>
      <pubDate>${new Date(article.publishedAt).toUTCString()}</pubDate>
    </item>`;
    })
    .join('\n');

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE.name)}</title>
    <link>${escapeXml(absoluteUrl('/'))}</link>
    <description>${escapeXml(settings.aciklama || SITE.description)}</description>
    <language>tr</language>
    <atom:link href="${escapeXml(absoluteUrl('/rss.xml'))}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(feed, {
    headers: { 'content-type': 'application/rss+xml; charset=utf-8' },
  });
}
