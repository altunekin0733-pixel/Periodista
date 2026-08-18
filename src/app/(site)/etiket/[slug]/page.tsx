import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { ArticleCard } from '@/components/site/ArticleCard';
import { Pagination } from '@/components/site/Pagination';
import { parsePageParam, tagHref } from '@/lib/routes';
import { SITE, absoluteUrl } from '@/lib/site-config';
import { getArticlesByTag, getTagBySlug } from '@/server/queries';

import styles from './page.module.css';

export const revalidate = 300;

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sayfa?: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const tag = await getTagBySlug(slug);

  if (!tag) return { title: 'Etiket bulunamadı' };

  const description = `${tag.name} etiketiyle işaretlenmiş haberler.`;

  return {
    title: `#${tag.name}`,
    description,
    alternates: { canonical: tagHref(tag.slug) },
    openGraph: {
      title: `#${tag.name} — ${SITE.name}`,
      description,
      url: absoluteUrl(tagHref(tag.slug)),
    },
  };
}

export default async function TagPage({ params, searchParams }: PageProps) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const tag = await getTagBySlug(slug);

  if (!tag) notFound();

  const page = parsePageParam(query.sayfa);
  const { items, total, pageCount } = await getArticlesByTag(tag.id, page);

  if (page > 1 && items.length === 0) notFound();

  return (
    <div className="container">
      <div className={styles.wrapper}>
        <header className={styles.header}>
          <p className="label-caps">Etiket</p>
          <h1 className={styles.title}>#{tag.name}</h1>
          <p className={`${styles.count} tabular`}>{total} haber</p>
        </header>

        {items.length === 0 ? (
          <p className={styles.empty}>Bu etiketle yayınlanmış haber yok.</p>
        ) : (
          <div className={styles.grid}>
            {items.map((article) => (
              <ArticleCard key={article.id} article={article} showDek />
            ))}
          </div>
        )}

        <Pagination basePath={tagHref(tag.slug)} page={page} pageCount={pageCount} />
      </div>
    </div>
  );
}
