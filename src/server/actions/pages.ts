'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { requireSession } from '@/lib/auth';
import { htmlToPlainText, sanitizeArticleHtml } from '@/lib/sanitize';
import { saveStaticPage } from '@/lib/static-pages-store';
import type { PageFormState } from './form-state';

const schema = z.object({
  slug: z.string().trim().min(1),
  title: z.string().trim().min(2, 'Başlık en az 2 karakter olmalı.').max(120),
  intro: z.string().trim().max(600, 'Giriş en fazla 600 karakter olabilir.'),
  body: z.string().trim().min(1, 'Sayfa metni boş olamaz.'),
});

export async function updateStaticPage(
  _previous: PageFormState,
  formData: FormData,
): Promise<PageFormState> {
  await requireSession();

  const parsed = schema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return { status: 'error', message: parsed.error.issues[0]?.message ?? 'Formu kontrol edin.' };
  }

  const input = parsed.data;
  const body = sanitizeArticleHtml(input.body);

  if (htmlToPlainText(body).length < 20) {
    return { status: 'error', message: 'Sayfa metni çok kısa.' };
  }

  try {
    await saveStaticPage(input.slug, { title: input.title, intro: input.intro, body });
  } catch {
    return { status: 'error', message: 'Sayfa kaydedilemedi.' };
  }

  revalidatePath(`/${input.slug}`);
  revalidatePath('/admin/sayfalar');

  return { status: 'success', message: 'Sayfa kaydedildi.' };
}
