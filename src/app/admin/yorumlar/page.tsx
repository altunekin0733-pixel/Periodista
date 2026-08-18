import { Check, ExternalLink, X } from 'lucide-react';
import Link from 'next/link';

import { AdminTopbar } from '@/components/admin/AdminTopbar';
import { ConfirmSubmit } from '@/components/admin/ConfirmSubmit';
import { CommentStatus, type Prisma } from '@/generated/prisma/client';
import { formatRelativeTime } from '@/lib/format';
import { prisma } from '@/lib/prisma';
import { articleHref } from '@/lib/routes';
import { deleteComment, setCommentStatus } from '@/server/actions/moderation';

import styles from './page.module.css';

export const metadata = { title: 'Yorumlar' };

const FILTERS = [
  { key: 'bekleyen', label: 'Bekleyen', status: CommentStatus.PENDING },
  { key: 'onayli', label: 'Onaylı', status: CommentStatus.APPROVED },
  { key: 'reddedilen', label: 'Reddedilen', status: CommentStatus.REJECTED },
  { key: 'tumu', label: 'Tümü', status: null },
] as const;

type PageProps = {
  searchParams: Promise<{ durum?: string }>;
};

export default async function AdminCommentsPage({ searchParams }: PageProps) {
  const { durum } = await searchParams;
  const active = FILTERS.find((filter) => filter.key === durum) ?? FILTERS[0];

  const where: Prisma.CommentWhereInput = active.status ? { status: active.status } : {};

  const [comments, counts] = await Promise.all([
    prisma.comment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
      select: {
        id: true,
        authorName: true,
        authorEmail: true,
        body: true,
        status: true,
        createdAt: true,
        article: { select: { title: true, slug: true, category: { select: { slug: true } } } },
      },
    }),
    prisma.comment.groupBy({ by: ['status'], _count: true }),
  ]);

  const countFor = (status: CommentStatus) =>
    counts.find((row) => row.status === status)?._count ?? 0;

  return (
    <>
      <AdminTopbar eyebrow="Etkileşim" title="Yorumlar" />

      <div className="admin-content">
        <nav className={styles.tabs} aria-label="Yorum durumu">
          {FILTERS.map((filter) => {
            const isActive = filter.key === active.key;
            const count = filter.status ? countFor(filter.status) : counts.reduce((sum, row) => sum + row._count, 0);

            return (
              <Link
                key={filter.key}
                href={`/admin/yorumlar?durum=${filter.key}`}
                className={`${styles.tab} ${isActive ? styles.tabActive : ''}`}
                aria-current={isActive ? 'page' : undefined}
              >
                {filter.label}
                <span className={`${styles.tabCount} tabular`}>{count}</span>
              </Link>
            );
          })}
        </nav>

        {comments.length === 0 ? (
          <div className="admin-empty">
            <p>Bu durumda yorum yok.</p>
          </div>
        ) : (
          <ul className={styles.list}>
            {comments.map((comment) => (
              <li key={comment.id} className={styles.comment}>
                <div className={styles.head}>
                  <div>
                    <p className={styles.author}>
                      {comment.authorName}
                      {comment.authorEmail && (
                        <span className={styles.email}>{comment.authorEmail}</span>
                      )}
                    </p>
                    <p className="admin-hint">
                      {formatRelativeTime(comment.createdAt)} ·{' '}
                      <Link
                        href={articleHref(comment.article.category.slug, comment.article.slug)}
                        target="_blank"
                        className={styles.articleLink}
                      >
                        {comment.article.title}
                        <ExternalLink size={11} aria-hidden="true" />
                      </Link>
                    </p>
                  </div>

                  <span
                    className={`admin-badge ${
                      comment.status === CommentStatus.APPROVED
                        ? 'is-published'
                        : comment.status === CommentStatus.REJECTED
                          ? 'is-rejected'
                          : 'is-pending'
                    }`}
                  >
                    {comment.status === CommentStatus.APPROVED
                      ? 'Onaylı'
                      : comment.status === CommentStatus.REJECTED
                        ? 'Reddedildi'
                        : 'Bekliyor'}
                  </span>
                </div>

                <p className={styles.body}>{comment.body}</p>

                <div className={styles.actions}>
                  {comment.status !== CommentStatus.APPROVED && (
                    <form action={setCommentStatus}>
                      <input type="hidden" name="id" value={comment.id} />
                      <input type="hidden" name="status" value={CommentStatus.APPROVED} />
                      <button type="submit" className="admin-button is-small">
                        <Check size={13} aria-hidden="true" />
                        Onayla
                      </button>
                    </form>
                  )}

                  {comment.status !== CommentStatus.REJECTED && (
                    <form action={setCommentStatus}>
                      <input type="hidden" name="id" value={comment.id} />
                      <input type="hidden" name="status" value={CommentStatus.REJECTED} />
                      <button type="submit" className="admin-button is-ghost is-small">
                        <X size={13} aria-hidden="true" />
                        Reddet
                      </button>
                    </form>
                  )}

                  <form action={deleteComment}>
                    <input type="hidden" name="id" value={comment.id} />
                    <ConfirmSubmit
                      className="admin-button is-danger is-small"
                      message="Bu yorum kalıcı olarak silinecek. Onaylıyor musunuz?"
                    >
                      Sil
                    </ConfirmSubmit>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
