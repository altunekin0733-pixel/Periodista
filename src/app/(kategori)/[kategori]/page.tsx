import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { ArticleCard } from '@/components/site/ArticleCard';
import { CategoryRail } from '@/components/site/CategoryRail';
import { Pagination } from '@/components/site/Pagination';
import { SubcategoryFilter } from '@/components/site/SubcategoryFilter';
import { CategoryIcon } from '@/components/ui/Icon';
import { categoryHref, parsePageParam } from '@/lib/routes';
import {
  CATEGORY_RAIL_LIMIT,
  CATEGORY_SIDE_LIMIT,
  SITE,
  absoluteUrl,
  getSubsections,
} from '@/lib/site-config';
import { getArticlesByCategory, getCategoryBySlug, getCategoryRail } from '@/server/queries';

import styles from './page.module.css';

export const revalidate = 120;

type PageProps = {
  params: Promise<{ kategori: string }>;
  searchParams: Promise<{ sayfa?: string; dal?: string }>;
};

/** `?dal=` yalnızca kategoriye tanımlı bir dalsa kabul edilir. */
function resolveSubsection(categorySlug: string, raw: string | undefined): string | null {
  if (!raw) return null;

  return getSubsections(categorySlug).some((item) => item.slug === raw) ? raw : null;
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const [{ kategori }, query] = await Promise.all([params, searchParams]);
  const category = await getCategoryBySlug(kategori);

  if (!category) return { title: 'Kategori bulunamadı' };

  const subsection = resolveSubsection(category.slug, query.dal);
  const subsectionName = getSubsections(category.slug).find(
    (item) => item.slug === subsection,
  )?.name;

  const title = subsectionName ? `${category.name} — ${subsectionName}` : category.name;
  const description = category.description || `${category.name} kategorisindeki güncel haberler.`;

  return {
    title,
    // Dal filtresi kanonik adresi bölmesin: her zaman kategori kökü gösterilir.
    description,
    alternates: { canonical: categoryHref(category.slug) },
    openGraph: {
      type: 'website',
      title: `${title} — ${SITE.name}`,
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
  const subsection = resolveSubsection(category.slug, query.dal);

  const [rail, { items, total, pageCount }] = await Promise.all([
    getCategoryRail(category.id, CATEGORY_RAIL_LIMIT + CATEGORY_SIDE_LIMIT),
    getArticlesByCategory(category.id, page, subsection ?? undefined),
  ]);

  if (page > 1 && items.length === 0) notFound();

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
        {/* Karusel ve yan panel yalnızca ilk sayfada, filtresiz görünümde. */}
        {page === 1 && !subsection && (
          <CategoryRail categorySlug={category.slug} articles={rail} />
        )}

        <SubcategoryFilter
          categorySlug={category.slug}
          categoryName={category.name}
          active={subsection}
        />

        {items.length === 0 ? (
          <p className={styles.empty}>
            {subsection
              ? 'Bu dalda henüz yayınlanmış haber yok.'
              : 'Bu kategoride henüz yayınlanmış haber yok.'}
          </p>
        ) : (
          <div className={styles.grid}>
            {items.map((article) => (
              <ArticleCard key={article.id} article={article} showDek />
            ))}
          </div>
        )}

        <Pagination
          basePath={categoryHref(category.slug)}
          page={page}
          pageCount={pageCount}
          extraParams={subsection ? { dal: subsection } : undefined}
        />
      </div>
    </>
  );
}
