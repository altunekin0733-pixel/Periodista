import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

import { CategoryIcon } from '@/components/ui/Icon';
import { categoryHref } from '@/lib/routes';
import type { ArticleCard as ArticleCardData } from '@/server/queries';

import { ArticleCard } from './ArticleCard';
import styles from './CategorySection.module.css';

type CategorySectionProps = {
  category: { slug: string; name: string; icon: string };
  articles: ArticleCardData[];
};

export function CategorySection({ category, articles }: CategorySectionProps) {
  if (articles.length === 0) return null;

  const [lead, ...rest] = articles;
  const headingId = `kategori-${category.slug}`;

  return (
    <section className={styles.section} aria-labelledby={headingId}>
      <header className={styles.header}>
        <div className={styles.heading}>
          <CategoryIcon name={category.icon} size={15} className={styles.icon} />
          <h2 id={headingId} className="label-caps">
            {category.name}
          </h2>
        </div>

        <Link href={categoryHref(category.slug)} className={styles.more}>
          Tümünü gör
          <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </header>

      <div className={styles.grid}>
        <div className={styles.lead}>
          <ArticleCard article={lead} variant="lead" showDek />
        </div>

        {rest.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </section>
  );
}
