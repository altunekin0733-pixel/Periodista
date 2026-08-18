'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { CommentStatus } from '@/generated/prisma/enums';
import { prisma } from '@/lib/prisma';
import { articleHref } from '@/lib/routes';
import { sanitizePlainText } from '@/lib/sanitize';
import { getSettings } from '@/lib/settings';
import type { CommentState } from './form-state';

const schema = z.object({
  articleId: z.string().min(1),
  authorName: z.string().trim().min(2, 'Adınız en az 2 karakter olmalı.').max(60),
  authorEmail: z
    .string()
    .trim()
    .toLowerCase()
    .email('Geçerli bir e-posta adresi girin.')
    .optional()
    .or(z.literal('')),
  body: z
    .string()
    .trim()
    .min(4, 'Yorumunuz en az 4 karakter olmalı.')
    .max(2000, 'Yorumunuz en fazla 2000 karakter olabilir.'),
  website: z.string().max(0).optional().or(z.literal('')),
});

export async function submitComment(
  _previous: CommentState,
  formData: FormData,
): Promise<CommentState> {
  const settings = await getSettings();

  if (!settings.commentsEnabled) {
    return { status: 'error', message: 'Yorumlar şu anda kapalı.' };
  }

  const parsed = schema.safeParse({
    articleId: formData.get('articleId'),
    authorName: formData.get('authorName'),
    authorEmail: formData.get('authorEmail') ?? '',
    body: formData.get('body'),
    website: formData.get('website') ?? '',
  });

  if (!parsed.success) {
    return {
      status: 'error',
      message: parsed.error.issues[0]?.message ?? 'Lütfen alanları kontrol edin.',
    };
  }

  if (parsed.data.website) {
    return { status: 'success', message: 'Yorumunuz alındı.' };
  }

  const article = await prisma.article.findUnique({
    where: { id: parsed.data.articleId },
    select: { id: true, slug: true, category: { select: { slug: true } } },
  });

  if (!article) {
    return { status: 'error', message: 'Haber bulunamadı.' };
  }

  const status = settings.commentsModerated ? CommentStatus.PENDING : CommentStatus.APPROVED;

  await prisma.comment.create({
    data: {
      articleId: article.id,
      authorName: sanitizePlainText(parsed.data.authorName),
      authorEmail: parsed.data.authorEmail || null,
      body: sanitizePlainText(parsed.data.body),
      status,
    },
  });

  if (status === CommentStatus.APPROVED) {
    revalidatePath(articleHref(article.category.slug, article.slug));

    return { status: 'success', message: 'Yorumunuz yayınlandı.' };
  }

  return { status: 'success', message: 'Yorumunuz alındı, editör onayından sonra yayınlanacak.' };
}
