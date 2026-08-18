import type { MetadataRoute } from 'next';

import { articleHref, categoryHref, tagHref } from '@/lib/routes';
import { absoluteUrl } from '@/lib/site-config';
import { getAllPublishedForFeed, getCategories, getPopularTags } from '@/server/queries';

// Tarayıcılara açık dosya; derleme anında veritabanına bağlanmaya gerek yok.
export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articles, categories, tags] = await Promise.all([
    getAllPublishedForFeed(5000),
    getCategories(),
    getPopularTags(100),
  ]);

  const newest = articles[0]?.publishedAt ?? new Date();

  return [
    {
      url: absoluteUrl('/'),
      lastModified: newest,
      changeFrequency: 'hourly',
      priority: 1,
    },
    ...categories.map((category) => ({
      url: absoluteUrl(categoryHref(category.slug)),
      lastModified: newest,
      changeFrequency: 'hourly' as const,
      priority: 0.8,
    })),
    ...articles.map((article) => ({
      url: absoluteUrl(articleHref(article.category.slug, article.slug)),
      lastModified: article.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
    ...tags.map((tag) => ({
      url: absoluteUrl(tagHref(tag.slug)),
      lastModified: newest,
      changeFrequency: 'weekly' as const,
      priority: 0.4,
    })),
  ];
}
