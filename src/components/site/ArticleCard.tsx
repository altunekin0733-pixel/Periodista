import Image from 'next/image';
import Link from 'next/link';

import { formatShortDate, toIsoString } from '@/lib/format';
import { articleHref } from '@/lib/routes';
import type { ArticleCard as ArticleCardData } from '@/server/queries';

import styles from './ArticleCard.module.css';

type Variant = 'grid' | 'lead' | 'compact';

type ArticleCardProps = {
  article: ArticleCardData;
  variant?: Variant;
  /** İlk ekranda görünen kartlarda görsel öncelikli yüklenir (LCP). */
  priority?: boolean;
  showDek?: boolean;
};

const IMAGE_SIZES: Record<Variant, string> = {
  grid: '(max-width: 40rem) 100vw, (max-width: 64rem) 45vw, 280px',
  lead: '(max-width: 64rem) 100vw, 640px',
  compact: '96px',
};

export function ArticleCard({
  article,
  variant = 'grid',
  priority = false,
  showDek = false,
}: ArticleCardProps) {
  const href = articleHref(article.category.slug, article.slug);

  return (
    <article className={`${styles.card} ${styles[variant]}`}>
      <Link href={href} className={styles.media} tabIndex={-1} aria-hidden="true">
        {article.coverImage ? (
          <Image
            src={article.coverImage}
            alt=""
            fill
            sizes={IMAGE_SIZES[variant]}
            priority={priority}
            className={styles.image}
          />
        ) : (
          <span className={styles.placeholder} />
        )}
      </Link>

      <div className={styles.body}>
        <Link href={`/${article.category.slug}`} className={styles.category}>
          {article.category.name}
        </Link>

        <h3 className={styles.title}>
          {/* Kartın tamamını tıklanabilir yapan görünmez katman. */}
          <Link href={href} className={styles.titleLink}>
            {article.title}
          </Link>
        </h3>

        {showDek && article.dek && <p className={styles.dek}>{article.dek}</p>}

        <p className={styles.meta}>
          <span className={styles.author}>{article.authorName}</span>
          {article.publishedAt && (
            <>
              <span aria-hidden="true">·</span>
              <time dateTime={toIsoString(article.publishedAt)} className="tabular">
                {formatShortDate(article.publishedAt)}
              </time>
            </>
          )}
          <span aria-hidden="true">·</span>
          <span className="tabular">{article.readMins} dk</span>
        </p>
      </div>
    </article>
  );
}
