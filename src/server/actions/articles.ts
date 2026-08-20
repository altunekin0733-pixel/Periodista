'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

import { ArticleStatus } from '@/generated/prisma/enums';
import { requireSession } from '@/lib/auth';
import { fromDateTimeLocal } from '@/lib/datetime-local';
import { prisma } from '@/lib/prisma';
import { estimateReadingMinutes } from '@/lib/reading-time';
import { articleHref, categoryHref } from '@/lib/routes';
import { htmlToPlainText, sanitizeArticleHtml } from '@/lib/sanitize';
import { slugify, uniqueSlug } from '@/lib/slug';
import type { ArticleFormState } from './form-state';

const MAX_TAGS = 10;

const schema = z.object({
  id: z.string().optional().or(z.literal('')),
  title: z.string().trim().min(5, 'Başlık en az 5 karakter olmalı.').max(200),
  slug: z.string().trim().max(90).optional().or(z.literal('')),
  dek: z.string().trim().max(320, 'Spot en fazla 320 karakter olabilir.').optional().or(z.literal('')),
  body: z.string().trim().min(1, 'Haber metni boş olamaz.'),
  categoryId: z.string().min(1, 'Kategori seçin.'),
  authorName: z.string().trim().min(2, 'Yazar adı gerekli.').max(80),
  coverImage: z.string().trim().url('Görsel adresi geçersiz.').optional().or(z.literal('')),
  coverAlt: z.string().trim().max(200).optional().or(z.literal('')),
  tags: z.string().trim().max(400).optional().or(z.literal('')),
  status: z.enum(['DRAFT', 'PUBLISHED']),
  featured: z.coerce.boolean().optional(),
  readMins: z.coerce.number().int().min(0).max(600).optional(),
  publishedAt: z.string().trim().optional().or(z.literal('')),
  seoTitle: z.string().trim().max(70).optional().or(z.literal('')),
  seoDescription: z.string().trim().max(180).optional().or(z.literal('')),
});

function toFieldErrors(error: z.ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};

  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? 'form');
    if (!fieldErrors[key]) fieldErrors[key] = issue.message;
  }

  return fieldErrors;
}

/** Virgülle ayrılmış etiket metnini benzersiz slug/ad çiftlerine dönüştürür. */
function parseTags(raw: string | undefined): { slug: string; name: string }[] {
  if (!raw) return [];

  const seen = new Map<string, string>();

  for (const piece of raw.split(',')) {
    const name = piece.trim().replace(/^#/, '');
    if (!name) continue;

    const slug = slugify(name, '');
    if (!slug || seen.has(slug)) continue;

    seen.set(slug, name);
    if (seen.size >= MAX_TAGS) break;
  }

  return [...seen].map(([slug, name]) => ({ slug, name }));
}

export async function saveArticle(
  _previous: ArticleFormState,
  formData: FormData,
): Promise<ArticleFormState> {
  await requireSession();

  const parsed = schema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return {
      status: 'error',
      message: 'Formda eksik veya hatalı alanlar var.',
      fieldErrors: toFieldErrors(parsed.error),
    };
  }

  const input = parsed.data;
  const body = sanitizeArticleHtml(input.body);
  const plainText = htmlToPlainText(body);

  if (plainText.length < 20) {
    return {
      status: 'error',
      message: 'Haber metni çok kısa.',
      fieldErrors: { body: 'En az 20 karakterlik bir metin girin.' },
    };
  }

  const category = await prisma.category.findUnique({
    where: { id: input.categoryId },
    select: { id: true, slug: true },
  });

  if (!category) {
    return {
      status: 'error',
      message: 'Seçilen kategori bulunamadı.',
      fieldErrors: { categoryId: 'Kategori geçersiz.' },
    };
  }

  const existing = input.id
    ? await prisma.article.findUnique({
        where: { id: input.id },
        select: { id: true, slug: true, publishedAt: true, category: { select: { slug: true } } },
      })
    : null;

  if (input.id && !existing) {
    return { status: 'error', message: 'Düzenlenecek haber bulunamadı.', fieldErrors: {} };
  }

  // Slug bir kez yayınlandıktan sonra kendiliğinden değişmez (SEO); yalnızca
  // yönetici alanı elle doldurursa güncellenir.
  const desiredSlug = input.slug ? slugify(input.slug) : existing?.slug ?? slugify(input.title);
  const slug =
    existing && desiredSlug === existing.slug
      ? existing.slug
      : await uniqueSlug(desiredSlug, async (candidate) => {
          const found = await prisma.article.findUnique({
            where: { slug: candidate },
            select: { id: true },
          });

          return Boolean(found) && found?.id !== existing?.id;
        });

  const tags = parseTags(input.tags);
  const readMins = input.readMins && input.readMins > 0 ? input.readMins : estimateReadingMinutes(plainText);

  const publishedAt = resolvePublishedAt({
    status: input.status,
    provided: input.publishedAt,
    existing: existing?.publishedAt ?? null,
  });

  const data = {
    title: input.title,
    slug,
    dek: input.dek ?? '',
    body,
    plainText,
    categoryId: category.id,
    authorName: input.authorName,
    coverImage: input.coverImage || null,
    coverAlt: input.coverAlt ?? '',
    status: input.status as ArticleStatus,
    featured: Boolean(input.featured),
    readMins,
    publishedAt,
    seoTitle: input.seoTitle || null,
    seoDescription: input.seoDescription || null,
  };

  const connectOrCreate = tags.map((tag) => ({
    where: { slug: tag.slug },
    create: { slug: tag.slug, name: tag.name },
  }));

  const saved = existing
    ? await prisma.article.update({
        where: { id: existing.id },
        // `set: []` önce eski etiket bağlarını koparır, sonra yenileri kurulur.
        data: { ...data, tags: { set: [], connectOrCreate } },
      })
    : await prisma.article.create({
        // Oluşturmada bağ zaten yok; Prisma create girdisi `set` kabul etmez.
        data: { ...data, tags: { connectOrCreate } },
      });

  revalidateArticlePaths({
    categorySlug: category.slug,
    slug: saved.slug,
    previousCategorySlug: existing?.category.slug,
    previousSlug: existing?.slug,
  });

  redirect(`/admin/haberler?kaydedildi=${saved.id}`);
}

/**
 * Yayın tarihi kuralları:
 * - Yönetici elle tarih verdiyse o kullanılır (ileri tarihli yayın mümkün).
 * - İlk kez yayına alınıyorsa şu an damgalanır.
 * - Taslağa çekilirse tarih korunur, böylece tekrar yayınlanınca kaybolmaz.
 */
function resolvePublishedAt({
  status,
  provided,
  existing,
}: {
  status: string;
  provided: string | undefined;
  existing: Date | null;
}): Date | null {
  // Girdi Türkiye saatidir; sunucunun saat dilimine göre yorumlanmamalı.
  const explicit = fromDateTimeLocal(provided ?? '');
  if (explicit) return explicit;

  if (status === 'PUBLISHED') return existing ?? new Date();

  return existing;
}

function revalidateArticlePaths({
  categorySlug,
  slug,
  previousCategorySlug,
  previousSlug,
}: {
  categorySlug: string;
  slug: string;
  previousCategorySlug?: string;
  previousSlug?: string;
}): void {
  revalidatePath('/');
  revalidatePath(categoryHref(categorySlug));
  revalidatePath(articleHref(categorySlug, slug));
  revalidatePath('/sitemap.xml');
  revalidatePath('/rss.xml');
  revalidatePath('/haber-sitemap.xml');

  if (previousCategorySlug && previousSlug) {
    revalidatePath(categoryHref(previousCategorySlug));
    revalidatePath(articleHref(previousCategorySlug, previousSlug));
  }
}

export async function deleteArticle(formData: FormData): Promise<void> {
  await requireSession();

  const id = String(formData.get('id') ?? '');
  if (!id) return;

  const article = await prisma.article.findUnique({
    where: { id },
    select: { slug: true, category: { select: { slug: true } } },
  });

  if (!article) return;

  await prisma.article.delete({ where: { id } });

  revalidateArticlePaths({ categorySlug: article.category.slug, slug: article.slug });
  revalidatePath('/admin/haberler');
}

export async function toggleArticleStatus(formData: FormData): Promise<void> {
  await requireSession();

  const id = String(formData.get('id') ?? '');
  if (!id) return;

  const article = await prisma.article.findUnique({
    where: { id },
    select: { id: true, slug: true, status: true, publishedAt: true, category: { select: { slug: true } } },
  });

  if (!article) return;

  const nextStatus =
    article.status === ArticleStatus.PUBLISHED ? ArticleStatus.DRAFT : ArticleStatus.PUBLISHED;

  await prisma.article.update({
    where: { id },
    data: {
      status: nextStatus,
      publishedAt:
        nextStatus === ArticleStatus.PUBLISHED ? (article.publishedAt ?? new Date()) : article.publishedAt,
    },
  });

  revalidateArticlePaths({ categorySlug: article.category.slug, slug: article.slug });
  revalidatePath('/admin/haberler');
}
