import type { MetadataRoute } from 'next';

import { getAllTags, getArticles, getCategories } from '@/lib/content';
import { articleHref, categoryHref, tagHref } from '@/lib/routes';
import { absoluteUrl } from '@/lib/site-config';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const articles = getArticles();
  const newest = articles[0]?.publishedAt ?? new Date().toISOString();

  return [
    { url: absoluteUrl('/'), lastModified: newest, changeFrequency: 'hourly', priority: 1 },
    ...getCategories().map((category) => ({
      url: absoluteUrl(categoryHref(category.slug)),
      lastModified: newest,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    })),
    ...articles.map((article) => ({
      url: absoluteUrl(articleHref(article.category.slug, article.slug)),
      lastModified: article.publishedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
    ...getAllTags().map((tag) => ({
      url: absoluteUrl(tagHref(tag.slug)),
      lastModified: newest,
      changeFrequency: 'weekly' as const,
      priority: 0.4,
    })),
  ];
}
