import Link from 'next/link';

import { articleHref } from '@/lib/routes';
import { getBreakingArticles } from '@/server/queries';

import styles from './BreakingBar.module.css';

export async function BreakingBar() {
  const articles = await getBreakingArticles(6);

  if (articles.length === 0) return null;

  return (
    <section className={styles.bar} aria-label="Son dakika haberleri">
      <p className={styles.badge}>
        <span className={styles.pulse} aria-hidden="true" />
        Son Dakika
      </p>

      <div className={styles.viewport}>
        <div className={styles.track}>
          {[0, 1].map((copy) => (
            <div className={styles.group} key={copy} aria-hidden={copy === 1}>
              {articles.map((article) => (
                <Link
                  key={`${copy}-${article.id}`}
                  href={articleHref(article.category.slug, article.slug)}
                  className={styles.item}
                  tabIndex={copy === 1 ? -1 : undefined}
                >
                  {article.title}
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
