import { cache } from 'react';

import { ArticleStatus, CommentStatus } from '@/generated/prisma/enums';
import { isDatabaseConfigured, prisma } from '@/lib/prisma';
import { BREAKING_LIMIT, PAGE_SIZE } from '@/lib/site-config';

/**
 * Veritabanı adresi hiç tanımlanmamışsa boş sonuç döner — böylece kurulum
 * tamamlanmadan da derleme geçer ve site "kuruluma devam edin" ekranı gösterir.
 *
 * Dikkat: adres tanımlıysa ama bağlantı kurulamıyorsa hata bastırılmaz;
 * gerçek arıza sessizce boş listeye dönüşmemelidir.
 */
async function whenConfigured<T>(run: () => Promise<T>, fallback: T): Promise<T> {
  if (!isDatabaseConfigured()) return fallback;

  return run();
}

/** Liste/kart görünümleri için gereken en küçük alan kümesi. */
const cardSelect = {
  id: true,
  slug: true,
  title: true,
  dek: true,
  coverImage: true,
  coverAlt: true,
  authorName: true,
  publishedAt: true,
  readMins: true,
  featured: true,
  category: { select: { slug: true, name: true, icon: true } },
} as const;

export type ArticleCard = Awaited<ReturnType<typeof getLatestArticles>>[number];

/** Yayın filtresi her sorguda `new Date()` ile kurulur (ileri tarihli yayınlar gizli kalır). */
function published() {
  return {
    status: ArticleStatus.PUBLISHED,
    publishedAt: { not: null, lte: new Date() },
  };
}

export const getCategories = cache(async () => {
  return whenConfigured(
    () =>
      prisma.category.findMany({
        orderBy: [{ position: 'asc' }, { name: 'asc' }],
        select: {
          id: true,
          slug: true,
          name: true,
          icon: true,
          description: true,
        },
      }),
    [],
  );
});

export const getCategoryBySlug = cache(async (slug: string) => {
  return prisma.category.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      name: true,
      icon: true,
      description: true,
    },
  });
});

export async function getLatestArticles(limit = 10) {
  return whenConfigured(
    () =>
      prisma.article.findMany({
        where: published(),
        orderBy: { publishedAt: 'desc' },
        take: limit,
        select: cardSelect,
      }),
    [],
  );
}

export async function getFeaturedArticles(limit = 5) {
  const featured = await whenConfigured(
    () =>
      prisma.article.findMany({
        where: { ...published(), featured: true },
        orderBy: { publishedAt: 'desc' },
        take: limit,
        select: cardSelect,
      }),
    [],
  );

  // Hiç manşet işaretlenmemişse ana sayfa boş kalmasın diye en yeni habere düşeriz.
  if (featured.length > 0) return featured;

  return getLatestArticles(1);
}

/**
 * Son dakika kuyruğu = en son yayınlanan `limit` haber. Panelden işaretleme
 * yapılmaz: yayınlanan her haber kuyruğun başına girer, sınırın dışında kalan
 * en eski haber kendiliğinden düşer.
 */
export async function getBreakingArticles(limit = BREAKING_LIMIT) {
  return getLatestArticles(limit);
}

/**
 * Ana sayfadaki kategori blokları. Kategori başına ayrı sorgu çalışır ancak
 * hepsi paralel gider; sıralı bekleme (waterfall) yoktur.
 */
export async function getCategorySections(perCategory = 4) {
  const categories = await getCategories();

  const sections = await Promise.all(
    categories.map(async (category) => ({
      category,
      articles: await prisma.article.findMany({
        where: { ...published(), categoryId: category.id },
        orderBy: { publishedAt: 'desc' },
        take: perCategory,
        select: cardSelect,
      }),
    })),
  );

  return sections.filter((section) => section.articles.length > 0);
}

/** `subsectionSlug` verildiğinde kategori, aynı adlı etikete göre daraltılır. */
export async function getArticlesByCategory(
  categoryId: string,
  page: number,
  subsectionSlug?: string,
) {
  const where = {
    ...published(),
    categoryId,
    ...(subsectionSlug ? { tags: { some: { slug: subsectionSlug } } } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.article.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: cardSelect,
    }),
    prisma.article.count({ where }),
  ]);

  return { items, total, pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

/** Kategori sayfasının tepesindeki karusel — kategorinin en yeni haberleri. */
export async function getCategoryRail(categoryId: string, limit: number) {
  return whenConfigured(
    () =>
      prisma.article.findMany({
        where: { ...published(), categoryId },
        orderBy: { publishedAt: 'desc' },
        take: limit,
        select: cardSelect,
      }),
    [],
  );
}

export const getArticleBySlug = cache(async (slug: string) => {
  return prisma.article.findFirst({
    where: { slug, ...published() },
    select: {
      id: true,
      slug: true,
      title: true,
      dek: true,
      body: true,
      plainText: true,
      coverImage: true,
      coverAlt: true,
      authorName: true,
      publishedAt: true,
      updatedAt: true,
      readMins: true,
      viewCount: true,
      seoTitle: true,
      seoDescription: true,
      category: { select: { id: true, slug: true, name: true, icon: true } },
      tags: { select: { slug: true, name: true } },
    },
  });
});

/** Haber sayfasındaki kesintisiz okuma akışı için gövdesiyle birlikte haber. */
const readerSelect = {
  id: true,
  slug: true,
  title: true,
  dek: true,
  body: true,
  coverImage: true,
  coverAlt: true,
  authorName: true,
  publishedAt: true,
  readMins: true,
  category: { select: { slug: true, name: true } },
  tags: { select: { slug: true, name: true } },
} as const;

export type ReaderArticle = Awaited<ReturnType<typeof getReaderFeed>>[number];

/**
 * Okunan haberden daha eski haberler, yayın tarihine göre azalan sırada.
 * `excludeIds` okuyucunun akışında zaten görünen haberlerin tekrarını önler.
 */
export async function getReaderFeed({
  before,
  excludeIds,
  limit,
}: {
  before: Date;
  excludeIds: string[];
  limit: number;
}) {
  return prisma.article.findMany({
    where: {
      ...published(),
      publishedAt: { not: null, lte: new Date(), lt: before },
      ...(excludeIds.length > 0 ? { id: { notIn: excludeIds } } : {}),
    },
    orderBy: { publishedAt: 'desc' },
    take: limit,
    select: readerSelect,
  });
}

export async function getRelatedArticles(articleId: string, categoryId: string, limit = 4) {
  return prisma.article.findMany({
    where: { ...published(), categoryId, id: { not: articleId } },
    orderBy: { publishedAt: 'desc' },
    take: limit,
    select: cardSelect,
  });
}

export async function searchArticles(query: string, page: number) {
  const term = query.trim();

  if (term.length < 2) {
    return { items: [], total: 0, pageCount: 1 };
  }

  // ILIKE tabanlı arama: başlık, spot, gövde metni ve etiket adı taranır.
  const where = {
    ...published(),
    OR: [
      { title: { contains: term, mode: 'insensitive' as const } },
      { dek: { contains: term, mode: 'insensitive' as const } },
      { plainText: { contains: term, mode: 'insensitive' as const } },
      { authorName: { contains: term, mode: 'insensitive' as const } },
      { tags: { some: { name: { contains: term, mode: 'insensitive' as const } } } },
    ],
  };

  const [items, total] = await Promise.all([
    prisma.article.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: cardSelect,
    }),
    prisma.article.count({ where }),
  ]);

  return { items, total, pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

export const getTagBySlug = cache(async (slug: string) => {
  return prisma.tag.findUnique({ where: { slug }, select: { id: true, slug: true, name: true } });
});

export async function getArticlesByTag(tagId: string, page: number) {
  const where = { ...published(), tags: { some: { id: tagId } } };

  const [items, total] = await Promise.all([
    prisma.article.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: cardSelect,
    }),
    prisma.article.count({ where }),
  ]);

  return { items, total, pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

export async function getPopularTags(limit = 20) {
  return whenConfigured(
    () =>
      prisma.tag.findMany({
        orderBy: { articles: { _count: 'desc' } },
        take: limit,
        select: { slug: true, name: true, _count: { select: { articles: true } } },
      }),
    [],
  );
}

export async function getApprovedComments(articleId: string) {
  return prisma.comment.findMany({
    where: { articleId, status: CommentStatus.APPROVED },
    orderBy: { createdAt: 'desc' },
    select: { id: true, authorName: true, body: true, createdAt: true },
  });
}

/** Site haritası ve RSS için tüm yayınlanmış haberlerin özeti. */
export async function getAllPublishedForFeed(limit = 1000) {
  return prisma.article.findMany({
    where: published(),
    orderBy: { publishedAt: 'desc' },
    take: limit,
    select: {
      slug: true,
      title: true,
      dek: true,
      publishedAt: true,
      updatedAt: true,
      coverImage: true,
      authorName: true,
      category: { select: { slug: true, name: true } },
    },
  });
}
