import { ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { AdminTopbar } from '@/components/admin/AdminTopbar';
import { ArticleForm, type ArticleFormValues } from '@/components/admin/ArticleForm';
import { ArticleStatus } from '@/generated/prisma/enums';
import { toDateTimeLocal } from '@/lib/datetime-local';
import { prisma } from '@/lib/prisma';
import { articleHref } from '@/lib/routes';
import { getCategories } from '@/server/queries';

export const metadata = { title: 'Haberi Düzenle' };

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditArticlePage({ params }: PageProps) {
  const { id } = await params;

  const [article, categories] = await Promise.all([
    prisma.article.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        slug: true,
        dek: true,
        body: true,
        categoryId: true,
        authorName: true,
        coverImage: true,
        coverAlt: true,
        status: true,
        featured: true,
        readMins: true,
        publishedAt: true,
        seoTitle: true,
        seoDescription: true,
        tags: { select: { name: true } },
        category: { select: { slug: true } },
      },
    }),
    getCategories(),
  ]);

  if (!article) notFound();

  const values: ArticleFormValues = {
    id: article.id,
    title: article.title,
    slug: article.slug,
    dek: article.dek,
    body: article.body,
    categoryId: article.categoryId,
    authorName: article.authorName,
    coverImage: article.coverImage ?? '',
    coverAlt: article.coverAlt,
    tags: article.tags.map((tag) => tag.name).join(', '),
    status: article.status,
    featured: article.featured,
    readMins: article.readMins,
    publishedAt: toDateTimeLocal(article.publishedAt),
    seoTitle: article.seoTitle ?? '',
    seoDescription: article.seoDescription ?? '',
  };

  return (
    <>
      <AdminTopbar eyebrow="İçerik Yönetimi" title="Haberi Düzenle">
        {article.status === ArticleStatus.PUBLISHED && (
          <Link
            href={articleHref(article.category.slug, article.slug)}
            target="_blank"
            className="admin-button is-ghost"
          >
            <ExternalLink size={15} aria-hidden="true" />
            Sitede gör
          </Link>
        )}
      </AdminTopbar>

      <div className="admin-content">
        <ArticleForm categories={categories} values={values} />
      </div>
    </>
  );
}
