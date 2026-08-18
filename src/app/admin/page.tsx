import { Eye, Plus } from 'lucide-react';
import Link from 'next/link';

import { AdminTopbar } from '@/components/admin/AdminTopbar';
import { ArticleStatus, CommentStatus } from '@/generated/prisma/enums';
import { formatCount, formatMediumDate } from '@/lib/format';
import { prisma } from '@/lib/prisma';
import { articleHref } from '@/lib/routes';

export const metadata = { title: 'Genel Bakış' };

async function loadStats() {
  const [total, published, drafts, pendingComments, subscribers, views, recent, mostRead] =
    await Promise.all([
      prisma.article.count(),
      prisma.article.count({ where: { status: ArticleStatus.PUBLISHED } }),
      prisma.article.count({ where: { status: ArticleStatus.DRAFT } }),
      prisma.comment.count({ where: { status: CommentStatus.PENDING } }),
      prisma.subscriber.count({ where: { active: true } }),
      prisma.article.aggregate({ _sum: { viewCount: true } }),
      prisma.article.findMany({
        orderBy: { updatedAt: 'desc' },
        take: 6,
        select: {
          id: true,
          title: true,
          slug: true,
          status: true,
          updatedAt: true,
          category: { select: { name: true, slug: true } },
        },
      }),
      prisma.article.findMany({
        where: { status: ArticleStatus.PUBLISHED },
        orderBy: { viewCount: 'desc' },
        take: 5,
        select: {
          id: true,
          title: true,
          slug: true,
          viewCount: true,
          category: { select: { slug: true } },
        },
      }),
    ]);

  return {
    total,
    published,
    drafts,
    pendingComments,
    subscribers,
    views: views._sum.viewCount ?? 0,
    recent,
    mostRead,
  };
}

export default async function AdminDashboard() {
  const stats = await loadStats();

  return (
    <>
      <AdminTopbar eyebrow="İçerik Yönetimi" title="Genel Bakış">
        <Link href="/admin/haberler/yeni" className="admin-button">
          <Plus size={16} aria-hidden="true" />
          Yeni Haber
        </Link>
      </AdminTopbar>

      <div className="admin-content">
        <div className="admin-stats">
          <div className="admin-stat">
            <span className="admin-stat-label">Toplam Haber</span>
            <span className="admin-stat-value">{formatCount(stats.total)}</span>
          </div>
          <div className="admin-stat">
            <span className="admin-stat-label">Yayında</span>
            <span className="admin-stat-value is-success">{formatCount(stats.published)}</span>
          </div>
          <div className="admin-stat">
            <span className="admin-stat-label">Taslak</span>
            <span className="admin-stat-value is-warning">{formatCount(stats.drafts)}</span>
          </div>
          <div className="admin-stat">
            <span className="admin-stat-label">Bekleyen Yorum</span>
            <span className="admin-stat-value is-warning">
              {formatCount(stats.pendingComments)}
            </span>
          </div>
          <div className="admin-stat">
            <span className="admin-stat-label">Bülten Abonesi</span>
            <span className="admin-stat-value is-primary">{formatCount(stats.subscribers)}</span>
          </div>
          <div className="admin-stat">
            <span className="admin-stat-label">Toplam Okunma</span>
            <span className="admin-stat-value">{formatCount(stats.views)}</span>
          </div>
        </div>

        <div className="admin-columns">
          <section>
            <h2 className="admin-section-title">Son düzenlenenler</h2>

            {stats.recent.length === 0 ? (
              <div className="admin-empty">
                <p>Henüz haber eklenmemiş.</p>
                <div className="admin-empty-actions">
                  <Link href="/admin/haberler/yeni" className="admin-button">
                    İlk haberi ekle
                  </Link>
                </div>
              </div>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table is-compact">
                  <thead>
                    <tr>
                      <th scope="col">Başlık</th>
                      <th scope="col">Durum</th>
                      <th scope="col">Güncelleme</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recent.map((article) => (
                      <tr key={article.id}>
                        <td>
                          <Link href={`/admin/haberler/${article.id}`} className="admin-cell-title">
                            {article.title}
                          </Link>
                        </td>
                        <td>
                          <span
                            className={`admin-badge ${
                              article.status === ArticleStatus.PUBLISHED ? 'is-published' : 'is-draft'
                            }`}
                          >
                            {article.status === ArticleStatus.PUBLISHED ? 'Yayında' : 'Taslak'}
                          </span>
                        </td>
                        <td className="admin-cell-muted tabular">
                          {formatMediumDate(article.updatedAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section>
            <h2 className="admin-section-title">En çok okunanlar</h2>

            {stats.mostRead.length === 0 ? (
              <div className="admin-empty">
                <p>Henüz okunma verisi yok.</p>
              </div>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table is-compact">
                  <thead>
                    <tr>
                      <th scope="col">Başlık</th>
                      <th scope="col">Okunma</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.mostRead.map((article) => (
                      <tr key={article.id}>
                        <td>
                          <Link
                            href={articleHref(article.category.slug, article.slug)}
                            className="admin-cell-title"
                            target="_blank"
                          >
                            {article.title}
                          </Link>
                        </td>
                        <td className="admin-cell-muted tabular">
                          <span className="admin-inline">
                            <Eye size={14} aria-hidden="true" />
                            {formatCount(article.viewCount)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
