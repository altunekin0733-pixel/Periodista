'use server';

import { revalidatePath } from 'next/cache';

import { CommentStatus } from '@/generated/prisma/enums';
import { requireSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { articleHref } from '@/lib/routes';

async function revalidateForComment(commentId: string): Promise<void> {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { article: { select: { slug: true, category: { select: { slug: true } } } } },
  });

  if (comment) {
    revalidatePath(articleHref(comment.article.category.slug, comment.article.slug));
  }

  revalidatePath('/admin/yorumlar');
}

export async function setCommentStatus(formData: FormData): Promise<void> {
  await requireSession();

  const id = String(formData.get('id') ?? '');
  const next = String(formData.get('status') ?? '');

  if (!id || !(next in CommentStatus)) return;

  await prisma.comment.update({
    where: { id },
    data: { status: next as CommentStatus },
  });

  await revalidateForComment(id);
}

export async function deleteComment(formData: FormData): Promise<void> {
  await requireSession();

  const id = String(formData.get('id') ?? '');
  if (!id) return;

  await revalidateForComment(id);
  await prisma.comment.delete({ where: { id } });
  revalidatePath('/admin/yorumlar');
}

export async function removeSubscriber(formData: FormData): Promise<void> {
  await requireSession();

  const id = String(formData.get('id') ?? '');
  if (!id) return;

  await prisma.subscriber.delete({ where: { id } });
  revalidatePath('/admin/aboneler');
}
