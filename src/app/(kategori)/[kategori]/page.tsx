import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { ArticleCard } from '@/components/site/ArticleCard';
import { Pagination } from '@/components/site/Pagination';
import { CategoryIcon } from '@/components/ui/Icon';
import { categoryHref, parsePageParam } from '@/lib/routes';
import { SITE, absoluteUrl } from '@/lib/site-config';
import { getArticlesByCategory, getCategoryBySlug } from '@/server/queries';

import styles from './page.module.css';

export const revalidate = 120;

type PageProps = {
  params: Promise<{ kategori: string }>;
  searchParams: Promise<{ sayfa?: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { kategori } = await params;
  const category = await getCategoryBySlug(kategori);

  if (!category) return { title: 'Kategori bulunamadı' };

  const description = category.description || `${category.name} kategorisindeki güncel haberler.`;

  return {
    title: category.name,
    description,
    alternates: { canonical: categoryHref(category.slug) },
    openGraph: {
      type: 'website',
      title: `${category.name} — ${SITE.name}`,
      description,
      url: absoluteUrl(categoryHref(category.slug)),
    },
  };
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const [{ kategori }, query] = await Promise.all([params, searchParams]);
  const category = await getCategoryBySlug(kategori);

  if (!category) notFound();

  const page = parsePageParam(query.sayfa);
  const { items, total, pageCount } = await getArticlesByCategory(category.id, page);

  if (page > 1 && items.length === 0) notFound();

  const [lead, ...rest] = items;

  return (
    <>
      <header className={styles.hero}>
        <div className="container">
          <div className={styles.heroInner}>
            <div className={styles.heading}>
              <p className={styles.eyebrow}>
                <CategoryIcon name={category.icon} size={14} />
                Kategori
              </p>
              <h1 className={styles.title}>{category.name}</h1>
              {category.description && <p className={styles.description}>{category.description}</p>}
            </div>

            <p className={`${styles.count} tabular`}>
              {total} haber
              {pageCount > 1 && (
                <span className={styles.pageInfo}>
                  · sayfa {page}/{pageCount}
                </span>
              )}
            </p>
          </div>
        </div>
      </header>

      <div className="container">
        {items.length === 0 ? (
          <p className={styles.empty}>Bu kategoride henüz yayınlanmış haber yok.</p>
        ) : (
          <div className={styles.list}>
            {/* İlk sayfanın ilk haberi geniş kart olarak öne çıkar. */}
            {page === 1 && lead && (
              <div className={styles.lead}>
                <ArticleCard article={lead} variant="lead" showDek priority />
              </div>
            )}

            <div className={styles.grid}>
              {(page === 1 ? rest : items).map((article) => (
                <ArticleCard key={article.id} article={article} showDek />
              ))}
            </div>
          </div>
        )}

        <Pagination basePath={categoryHref(category.slug)} page={page} pageCount={pageCount} />
      </div>
    </>
  );
}
