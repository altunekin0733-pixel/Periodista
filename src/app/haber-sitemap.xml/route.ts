import { prisma } from '@/lib/prisma';
import { ArticleStatus } from '@/generated/prisma/enums';
import { articleHref } from '@/lib/routes';
import { SITE, absoluteUrl } from '@/lib/site-config';
import { escapeXml } from '@/lib/xml';

// Google News penceresi 48 saat; içerik her istekte tazelenip CDN'de tutulur.
export const dynamic = 'force-dynamic';

/** Google News son 48 saatteki içeriği okur; sınır bilinçli olarak dardır. */
const NEWS_WINDOW_HOURS = 48;
const MAX_ITEMS = 1000;

export async function GET() {
  const since = new Date(Date.now() - NEWS_WINDOW_HOURS * 60 * 60 * 1000);

  const articles = await prisma.article.findMany({
    where: {
      status: ArticleStatus.PUBLISHED,
      publishedAt: { not: null, gte: since, lte: new Date() },
    },
    orderBy: { publishedAt: 'desc' },
    take: MAX_ITEMS,
    select: {
      slug: true,
      title: true,
      publishedAt: true,
      category: { select: { slug: true } },
      tags: { select: { name: true } },
    },
  });

  const entries = articles
    .map((article) => {
      const url = absoluteUrl(articleHref(article.category.slug, article.slug));
      const keywords = article.tags.map((tag) => tag.name).join(', ');

      return `  <url>
    <loc>${escapeXml(url)}</loc>
    <news:news>
      <news:publication>
        <news:name>${escapeXml(SITE.name)}</news:name>
        <news:language>tr</news:language>
      </news:publication>
      <news:publication_date>${article.publishedAt?.toISOString()}</news:publication_date>
      <news:title>${escapeXml(article.title)}</news:title>${
        keywords ? `\n      <news:keywords>${escapeXml(keywords)}</news:keywords>` : ''
      }
    </news:news>
  </url>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${entries}
</urlset>`;

  return new Response(xml, {
    headers: {
      'content-type': 'application/xml; charset=utf-8',
      'cache-control': 'public, max-age=0, s-maxage=300, stale-while-revalidate=600',
    },
  });
}
