'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { requireSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { isReservedSlug } from '@/lib/routes';
import { slugify, uniqueSlug } from '@/lib/slug';
import type { CategoryFormState } from './form-state';

const schema = z.object({
  id: z.string().optional().or(z.literal('')),
  name: z.string().trim().min(2, 'Kategori adı en az 2 karakter olmalı.').max(60),
  slug: z.string().trim().max(60).optional().or(z.literal('')),
  icon: z.string().trim().min(1).max(60),
  description: z.string().trim().max(240).optional().or(z.literal('')),
  position: z.coerce.number().int().min(0).max(999),
});

export async function saveCategory(
  _previous: CategoryFormState,
  formData: FormData,
): Promise<CategoryFormState> {
  await requireSession();

  const parsed = schema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? 'form');
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }

    return { status: 'error', message: 'Formu kontrol edin.', fieldErrors };
  }

  const input = parsed.data;

  const existing = input.id
    ? await prisma.category.findUnique({ where: { id: input.id }, select: { id: true, slug: true } })
    : null;

  if (input.id && !existing) {
    return { status: 'error', message: 'Kategori bulunamadı.', fieldErrors: {} };
  }

  const desiredSlug = slugify(input.slug || input.name, 'kategori');

  // Kategori slug'ı kök adres alanında yer aldığı için sistem yollarıyla çakışamaz.
  if (isReservedSlug(desiredSlug)) {
    return {
      status: 'error',
      message: 'Bu adres sistem tarafından kullanılıyor.',
      fieldErrors: { slug: `"${desiredSlug}" ayrılmış bir adres. Başka bir ad seçin.` },
    };
  }

  const slug =
    existing && desiredSlug === existing.slug
      ? existing.slug
      : await uniqueSlug(
          desiredSlug,
          async (candidate) => {
            if (isReservedSlug(candidate)) return true;

            const found = await prisma.category.findUnique({
              where: { slug: candidate },
              select: { id: true },
            });

            return Boolean(found) && found?.id !== existing?.id;
          },
          'kategori',
        );

  const data = {
    name: input.name,
    slug,
    icon: input.icon,
    description: input.description ?? '',
    position: input.position,
  };

  if (existing) {
    await prisma.category.update({ where: { id: existing.id }, data });
  } else {
    await prisma.category.create({ data });
  }

  revalidatePath('/', 'layout');
  revalidatePath('/admin/kategoriler');

  return { status: 'success', message: 'Kategori kaydedildi.', fieldErrors: {} };
}

/**
 * Kategori yalnızca boşken silinebilir. Tasarımdaki "kategoriyi silince
 * haberleri de sil" davranışı, tek tıkla içerik kaybına yol açtığı için
 * yerini açık bir taşıma adımına bırakır.
 */
export async function deleteCategory(formData: FormData): Promise<void> {
  await requireSession();

  const id = String(formData.get('id') ?? '');
  if (!id) return;

  const count = await prisma.article.count({ where: { categoryId: id } });
  if (count > 0) return;

  await prisma.category.delete({ where: { id } });

  revalidatePath('/', 'layout');
  revalidatePath('/admin/kategoriler');
}

/** Silme öncesi haberleri başka bir kategoriye taşır. */
export async function moveCategoryArticles(formData: FormData): Promise<void> {
  await requireSession();

  const fromId = String(formData.get('fromId') ?? '');
  const toId = String(formData.get('toId') ?? '');

  if (!fromId || !toId || fromId === toId) return;

  const target = await prisma.category.findUnique({ where: { id: toId }, select: { id: true } });
  if (!target) return;

  await prisma.article.updateMany({ where: { categoryId: fromId }, data: { categoryId: toId } });

  revalidatePath('/', 'layout');
  revalidatePath('/admin/kategoriler');
}
