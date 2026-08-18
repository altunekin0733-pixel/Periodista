import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

import matter from 'gray-matter';
import { z } from 'zod';

import { markdownToHtml, plainTextFromMarkdown } from './markdown';
import { estimateReadingMinutes } from './reading-time';
import { slugify } from './slug';

/**
 * İçerik dosya sisteminden okunur; veritabanı yoktur. Tüm okumalar derleme
 * anında bir kez yapılır ve sonuç statik HTML'e gömülür.
 */
const CONTENT_DIR = path.join(process.cwd(), 'content');
const ARTICLES_DIR = path.join(CONTENT_DIR, 'haberler');

const categorySchema = z.object({
  slug: z.string().min(1),
  ad: z.string().min(1),
  simge: z.string().default('newspaper'),
  aciklama: z.string().default(''),
  sira: z.number().int().default(0),
  logo: z.enum(['default', 'sports']).default('default'),
});

const settingsSchema = z.object({
  slogan: z.string().default('Günün öne çıkan gelişmeleri, tek yerde.'),
  aciklama: z.string().default(''),
  sosyal: z.record(z.string(), z.string()).default({}),
  piyasaSeridi: z.boolean().default(true),
});

const frontmatterSchema = z.object({
  baslik: z.string().min(1),
  spot: z.string().default(''),
  kategori: z.string().min(1),
  yazar: z.string().default('Periodista'),
  tarih: z.union([z.string(), z.date()]),
  etiketler: z.array(z.string()).default([]),
  kapak: z.string().nullable().optional(),
  kapakAlt: z.string().default(''),
  mansette: z.boolean().default(false),
  sonDakika: z.boolean().default(false),
  taslak: z.boolean().default(false),
  okumaDakika: z.number().int().positive().optional(),
  seoBaslik: z.string().optional(),
  seoAciklama: z.string().optional(),
});

export type Category = {
  slug: string;
  name: string;
  icon: string;
  description: string;
  position: number;
  logoVariant: string;
};

export type Tag = { slug: string; name: string };

export type Article = {
  slug: string;
  title: string;
  dek: string;
  html: string;
  plainText: string;
  category: Category;
  authorName: string;
  publishedAt: string;
  tags: Tag[];
  coverImage: string | null;
  coverAlt: string;
  featured: boolean;
  breaking: boolean;
  readMins: number;
  seoTitle?: string;
  seoDescription?: string;
};

export type SiteSettings = z.infer<typeof settingsSchema>;

function readJson(file: string): unknown {
  return JSON.parse(readFileSync(path.join(CONTENT_DIR, file), 'utf8'));
}

let categoryCache: Category[] | null = null;
let articleCache: Article[] | null = null;
let settingsCache: SiteSettings | null = null;

export function getSettings(): SiteSettings {
  if (!settingsCache) {
    settingsCache = settingsSchema.parse(readJson('ayarlar.json'));
  }

  return settingsCache;
}

export function getCategories(): Category[] {
  if (categoryCache) return categoryCache;

  const parsed = z.array(categorySchema).parse(readJson('kategoriler.json'));

  categoryCache = parsed
    .map((item) => ({
      slug: item.slug,
      name: item.ad,
      icon: item.simge,
      description: item.aciklama,
      position: item.sira,
      logoVariant: item.logo,
    }))
    .sort((a, b) => a.position - b.position || a.name.localeCompare(b.name, 'tr'));

  return categoryCache;
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return getCategories().find((category) => category.slug === slug);
}

/** Yayınlanmış tüm haberler, yeniden eskiye sıralı. */
export function getArticles(): Article[] {
  if (articleCache) return articleCache;

  const categories = getCategories();
  const files = readdirSync(ARTICLES_DIR).filter((file) => file.endsWith('.md'));
  const articles: Article[] = [];

  for (const file of files) {
    const slug = file.replace(/\.md$/, '');
    const raw = readFileSync(path.join(ARTICLES_DIR, file), 'utf8');
    const { data, content } = matter(raw);

    const parsed = frontmatterSchema.safeParse(data);

    if (!parsed.success) {
      // Bozuk bir dosya tüm derlemeyi düşürmeli — sessizce atlanırsa haber kaybolur.
      throw new Error(
        `İçerik hatası — content/haberler/${file}: ${parsed.error.issues
          .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
          .join(', ')}`,
      );
    }

    const front = parsed.data;

    if (front.taslak) continue;

    const category = categories.find((item) => item.slug === front.kategori);

    if (!category) {
      throw new Error(
        `İçerik hatası — content/haberler/${file}: "${front.kategori}" kategorisi content/kategoriler.json içinde yok.`,
      );
    }

    const publishedAt = new Date(front.tarih);

    if (Number.isNaN(publishedAt.getTime())) {
      throw new Error(`İçerik hatası — content/haberler/${file}: "tarih" alanı okunamadı.`);
    }

    // İleri tarihli haberler derlemede atlanır; tarihi gelince yeniden yayınlanır.
    if (publishedAt.getTime() > Date.now()) continue;

    const plainText = plainTextFromMarkdown(content);

    articles.push({
      slug,
      title: front.baslik,
      dek: front.spot,
      html: markdownToHtml(content),
      plainText,
      category,
      authorName: front.yazar,
      publishedAt: publishedAt.toISOString(),
      tags: front.etiketler.map((name) => ({ name, slug: slugify(name, 'etiket') })),
      coverImage: front.kapak ?? null,
      coverAlt: front.kapakAlt,
      featured: front.mansette,
      breaking: front.sonDakika,
      readMins: front.okumaDakika ?? estimateReadingMinutes(plainText),
      seoTitle: front.seoBaslik,
      seoDescription: front.seoAciklama,
    });
  }

  articleCache = articles.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );

  return articleCache;
}

export function getArticleBySlug(slug: string): Article | undefined {
  return getArticles().find((article) => article.slug === slug);
}

export function getArticlesByCategory(categorySlug: string): Article[] {
  return getArticles().filter((article) => article.category.slug === categorySlug);
}

export function getFeaturedArticles(limit = 5): Article[] {
  const featured = getArticles().filter((article) => article.featured);

  return featured.length > 0 ? featured.slice(0, limit) : getArticles().slice(0, 1);
}

export function getBreakingArticles(limit = 6): Article[] {
  return getArticles()
    .filter((article) => article.breaking)
    .slice(0, limit);
}

export function getCategorySections(perCategory = 4) {
  return getCategories()
    .map((category) => ({
      category,
      articles: getArticlesByCategory(category.slug).slice(0, perCategory),
    }))
    .filter((section) => section.articles.length > 0);
}

export function getRelatedArticles(article: Article, limit = 3): Article[] {
  return getArticlesByCategory(article.category.slug)
    .filter((item) => item.slug !== article.slug)
    .slice(0, limit);
}

export function getAllTags(): (Tag & { count: number })[] {
  const counts = new Map<string, Tag & { count: number }>();

  for (const article of getArticles()) {
    for (const tag of article.tags) {
      const existing = counts.get(tag.slug);

      if (existing) {
        existing.count += 1;
      } else {
        counts.set(tag.slug, { ...tag, count: 1 });
      }
    }
  }

  return [...counts.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'tr'));
}

export function getTagBySlug(slug: string): (Tag & { count: number }) | undefined {
  return getAllTags().find((tag) => tag.slug === slug);
}

export function getArticlesByTag(tagSlug: string): Article[] {
  return getArticles().filter((article) => article.tags.some((tag) => tag.slug === tagSlug));
}

/** Tarayıcıda çalışan arama için derleme anında üretilen küçük indeks. */
export type SearchEntry = {
  slug: string;
  title: string;
  dek: string;
  category: string;
  categorySlug: string;
  author: string;
  date: string;
  readMins: number;
  cover: string | null;
  tags: string[];
  /** Başlık + spot + gövde metninin kısaltılmış, küçük harfe indirilmiş hali. */
  haystack: string;
};

const SEARCH_BODY_LIMIT = 600;

export function buildSearchIndex(): SearchEntry[] {
  return getArticles().map((article) => ({
    slug: article.slug,
    title: article.title,
    dek: article.dek,
    category: article.category.name,
    categorySlug: article.category.slug,
    author: article.authorName,
    date: article.publishedAt,
    readMins: article.readMins,
    cover: article.coverImage,
    tags: article.tags.map((tag) => tag.name),
    haystack: [
      article.title,
      article.dek,
      article.authorName,
      article.category.name,
      article.tags.map((tag) => tag.name).join(' '),
      article.plainText.slice(0, SEARCH_BODY_LIMIT),
    ]
      .join(' ')
      .toLocaleLowerCase('tr-TR'),
  }));
}
