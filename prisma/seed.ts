import 'dotenv/config';

import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '../src/generated/prisma/client';
import { ArticleStatus } from '../src/generated/prisma/enums';
import { SEED_ARTICLES, SEED_CATEGORIES } from './seed-data';

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL tanımlı değil. .env dosyanızı kontrol edin.');
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

const WORDS_PER_MINUTE = 200;

function toHtml(paragraphs: string[]): string {
  return paragraphs.map((paragraph) => `<p>${paragraph}</p>`).join('');
}

function toPlainText(paragraphs: string[]): string {
  return paragraphs.join(' ');
}

function slugifyTag(name: string): string {
  const map: Record<string, string> = {
    ç: 'c',
    ğ: 'g',
    ı: 'i',
    İ: 'i',
    ö: 'o',
    ş: 's',
    ü: 'u',
  };

  return Array.from(name.toLowerCase())
    .map((char) => map[char] ?? char)
    .join('')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function main() {
  console.log('Kategoriler yazılıyor…');

  for (const category of SEED_CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      create: category,
      update: {
        name: category.name,
        icon: category.icon,
        description: category.description,
        position: category.position,
        logoVariant: category.logoVariant,
      },
    });
  }

  const categories = await prisma.category.findMany({ select: { id: true, slug: true } });
  const categoryIdBySlug = new Map(categories.map((item) => [item.slug, item.id]));

  console.log('Haberler yazılıyor…');

  for (const article of SEED_ARTICLES) {
    const categoryId = categoryIdBySlug.get(article.category);

    if (!categoryId) {
      console.warn(`  atlandı: "${article.slug}" için kategori bulunamadı (${article.category})`);
      continue;
    }

    const plainText = toPlainText(article.paragraphs);
    const readMins = Math.max(1, Math.round(plainText.split(/\s+/).length / WORDS_PER_MINUTE));

    const tags = article.tags.map((name) => ({ name, slug: slugifyTag(name) })).filter((tag) => tag.slug);

    const data = {
      title: article.title,
      dek: article.dek,
      body: toHtml(article.paragraphs),
      plainText,
      categoryId,
      authorName: article.author,
      status: article.draft ? ArticleStatus.DRAFT : ArticleStatus.PUBLISHED,
      featured: Boolean(article.featured),
      breaking: Boolean(article.breaking),
      publishedAt: new Date(article.publishedAt),
      readMins,
    };

    const connectOrCreate = tags.map((tag) => ({ where: { slug: tag.slug }, create: tag }));

    await prisma.article.upsert({
      where: { slug: article.slug },
      // Prisma create girdisi `set` kabul etmez; yalnızca update dalında kullanılır.
      create: { slug: article.slug, ...data, tags: { connectOrCreate } },
      update: { ...data, tags: { set: [], connectOrCreate } },
    });
  }

  console.log(
    `Tamam: ${SEED_CATEGORIES.length} kategori, ${SEED_ARTICLES.length} haber hazır.`,
  );
}

main()
  .catch((error) => {
    console.error('Seed başarısız:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
