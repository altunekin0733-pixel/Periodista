import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { ArticleCard } from '@/components/site/ArticleCard';
import { CategoryIcon } from '@/components/ui/Icon';
import { getArticlesByCategory, getCategories, getCategoryBySlug } from '@/lib/content';
import { categoryHref } from '@/lib/routes';
import { SITE, absoluteUrl } from '@/lib/site-config';

import styles from './page.module.css';

type PageProps = {
  params: Promise<{ kategori: string }>;
};

export function generateStaticParams() {
  return getCategories().map((category) => ({ kategori: category.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { kategori } = await params;
  const category = getCategoryBySlug(kategori);

  if (!category) return { title: 'Kategori bulunamadı' };

  const description = category.description || `${category.name} kategorisindeki güncel haberler.`;

  return {
    title: category.name,
    description,
    alternates: { canonical: absoluteUrl(categoryHref(category.slug)) },
    openGraph: {
      type: 'website',
      title: `${category.name} — ${SITE.name}`,
      description,
      url: absoluteUrl(categoryHref(category.slug)),
    },
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { kategori } = await params;
  const category = getCategoryBySlug(kategori);

  if (!category) notFound();

  const items = getArticlesByCategory(category.slug);
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

            <p className={`${styles.count} tabular`}>{items.length} haber</p>
          </div>
        </div>
      </header>

      <div className="container">
        {items.length === 0 ? (
          <p className={styles.empty}>Bu kategoride henüz yayınlanmış haber yok.</p>
        ) : (
          <div className={styles.list}>
            {/* İlk haber geniş kart olarak öne çıkar. */}
            {lead && (
              <div className={styles.lead}>
                <ArticleCard article={lead} variant="lead" showDek priority />
              </div>
            )}

            <div className={styles.grid}>
              {rest.map((article) => (
                <ArticleCard key={article.slug} article={article} showDek />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
