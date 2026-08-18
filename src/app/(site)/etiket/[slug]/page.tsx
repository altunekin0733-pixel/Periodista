import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { ArticleCard } from '@/components/site/ArticleCard';
import { getAllTags, getArticlesByTag, getTagBySlug } from '@/lib/content';
import { tagHref } from '@/lib/routes';
import { SITE, absoluteUrl } from '@/lib/site-config';

import styles from './page.module.css';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getAllTags().map((tag) => ({ slug: tag.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const tag = getTagBySlug(slug);

  if (!tag) return { title: 'Etiket bulunamadı' };

  const description = `${tag.name} etiketiyle işaretlenmiş haberler.`;

  return {
    title: `#${tag.name}`,
    description,
    alternates: { canonical: absoluteUrl(tagHref(tag.slug)) },
    openGraph: {
      title: `#${tag.name} — ${SITE.name}`,
      description,
      url: absoluteUrl(tagHref(tag.slug)),
    },
  };
}

export default async function TagPage({ params }: PageProps) {
  const { slug } = await params;
  const tag = getTagBySlug(slug);

  if (!tag) notFound();

  const items = getArticlesByTag(tag.slug);

  return (
    <div className="container">
      <div className={styles.wrapper}>
        <header className={styles.header}>
          <p className="label-caps">Etiket</p>
          <h1 className={styles.title}>#{tag.name}</h1>
          <p className={`${styles.count} tabular`}>{items.length} haber</p>
        </header>

        {items.length === 0 ? (
          <p className={styles.empty}>Bu etiketle yayınlanmış haber yok.</p>
        ) : (
          <div className={styles.grid}>
            {items.map((article) => (
              <ArticleCard key={article.slug} article={article} showDek />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
