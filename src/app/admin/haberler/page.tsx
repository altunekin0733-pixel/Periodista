import { ExternalLink, Pencil, Plus } from 'lucide-react';
import Link from 'next/link';

import { AdminTopbar } from '@/components/admin/AdminTopbar';
import { ArticleFilters } from '@/components/admin/ArticleFilters';
import { ConfirmSubmit } from '@/components/admin/ConfirmSubmit';
import { ArticleStatus, type Prisma } from '@/generated/prisma/client';
import { formatCount, formatMediumDate } from '@/lib/format';
import { prisma } from '@/lib/prisma';
import { articleHref, parsePageParam } from '@/lib/routes';
import { deleteArticle, toggleArticleStatus } from '@/server/actions/articles';
import { getCategories } from '@/server/queries';

import { Pagination } from '@/components/site/Pagination';

export const metadata = { title: 'Haberler' };

const ADMIN_PAGE_SIZE = 20;

type PageProps = {
  searchParams: Promise<{
    q?: string;
    durum?: string;
    kategori?: string;
    sayfa?: string;
    kaydedildi?: string;
  }>;
};

export default async function AdminArticlesPage({ searchParams }: PageProps) {
  const query = await searchParams;
  const page = parsePageParam(query.sayfa);
  const term = (query.q ?? '').trim();

  const where: Prisma.ArticleWhereInput = {
    ...(query.durum === 'yayinda' ? { status: ArticleStatus.PUBLISHED } : {}),
    ...(query.durum === 'taslak' ? { status: ArticleStatus.DRAFT } : {}),
    ...(query.kategori ? { category: { slug: query.kategori } } : {}),
    ...(term
      ? {
          OR: [
            { title: { contains: term, mode: 'insensitive' } },
            { authorName: { contains: term, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  const [categories, articles, total] = await Promise.all([
    getCategories(),
    prisma.article.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      skip: (page - 1) * ADMIN_PAGE_SIZE,
      take: ADMIN_PAGE_SIZE,
      select: {
        id: true,
        title: true,
        slug: true,
        authorName: true,
        status: true,
        featured: true,
        publishedAt: true,
        updatedAt: true,
        viewCount: true,
        category: { select: { name: true, slug: true } },
        _count: { select: { comments: true } },
      },
    }),
    prisma.article.count({ where }),
  ]);

  const pageCount = Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE));

  const filterParams: Record<string, string> = {};
  if (term) filterParams.q = term;
  if (query.durum) filterParams.durum = query.durum;
  if (query.kategori) filterParams.kategori = query.kategori;

  return (
    <>
      <AdminTopbar eyebrow="İçerik Yönetimi" title="Haberler">
        <Link href="/admin/haberler/yeni" className="admin-button">
          <Plus size={16} aria-hidden="true" />
          Yeni Haber
        </Link>
      </AdminTopbar>

      <div className="admin-content">
        {query.kaydedildi && (
          <p className="admin-alert is-success" role="status">
            Haber kaydedildi.
          </p>
        )}

        <ArticleFilters
          categories={categories}
          defaultQuery={term}
          defaultStatus={query.durum ?? ''}
          defaultCategory={query.kategori ?? ''}
        />

        <p className="admin-hint">
          {formatCount(total)} kayıt{pageCount > 1 && ` · sayfa ${page}/${pageCount}`}
        </p>

        {articles.length === 0 ? (
          <div className="admin-empty">
            <p>Bu filtrelerle eşleşen haber yok.</p>
            <div className="admin-empty-actions">
              <Link href="/admin/haberler/yeni" className="admin-button">
                Yeni haber ekle
              </Link>
            </div>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th scope="col">Başlık</th>
                  <th scope="col">Kategori</th>
                  <th scope="col">Yazar</th>
                  <th scope="col">Durum</th>
                  <th scope="col">Okunma</th>
                  <th scope="col">Tarih</th>
                  <th scope="col">
                    <span className="visually-hidden">İşlemler</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {articles.map((article) => {
                  const isPublished = article.status === ArticleStatus.PUBLISHED;

                  return (
                    <tr key={article.id}>
                      <td>
                        <Link href={`/admin/haberler/${article.id}`} className="admin-cell-title">
                          {article.title}
                        </Link>
                        <div className="admin-inline admin-hint">
                          {article.featured && <span className="admin-badge is-neutral">Manşet</span>}
                          {article._count.comments > 0 && (
                            <span className="admin-hint">{article._count.comments} yorum</span>
                          )}
                        </div>
                      </td>
                      <td className="admin-cell-muted">{article.category.name}</td>
                      <td className="admin-cell-muted">{article.authorName}</td>
                      <td>
                        {/* Rozet aynı zamanda yayın durumunu değiştiren düğmedir. */}
                        <form action={toggleArticleStatus}>
                          <input type="hidden" name="id" value={article.id} />
                          <button
                            type="submit"
                            className={`admin-badge ${isPublished ? 'is-published' : 'is-draft'}`}
                            title={isPublished ? 'Taslağa al' : 'Yayına al'}
                          >
                            {isPublished ? 'Yayında' : 'Taslak'}
                          </button>
                        </form>
                      </td>
                      <td className="admin-cell-muted tabular">{formatCount(article.viewCount)}</td>
                      <td className="admin-cell-muted tabular">
                        {formatMediumDate(article.publishedAt ?? article.updatedAt)}
                      </td>
                      <td>
                        <div className="admin-actions">
                          {isPublished && (
                            <Link
                              href={articleHref(article.category.slug, article.slug)}
                              target="_blank"
                              className="admin-button is-ghost is-small"
                              title="Sitede görüntüle"
                            >
                              <ExternalLink size={13} aria-hidden="true" />
                            </Link>
                          )}
                          <Link
                            href={`/admin/haberler/${article.id}`}
                            className="admin-button is-ghost is-small"
                          >
                            <Pencil size={13} aria-hidden="true" />
                            Düzenle
                          </Link>
                          <form action={deleteArticle}>
                            <input type="hidden" name="id" value={article.id} />
                            <ConfirmSubmit
                              className="admin-button is-danger is-small"
                              message={`"${article.title}" haberini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`}
                            >
                              Sil
                            </ConfirmSubmit>
                          </form>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          basePath="/admin/haberler"
          page={page}
          pageCount={pageCount}
          extraParams={filterParams}
        />
      </div>
    </>
  );
}
