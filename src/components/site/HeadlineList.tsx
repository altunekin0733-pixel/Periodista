import Link from 'next/link';

import { formatRelativeTime, toIsoString } from '@/lib/format';
import { articleHref } from '@/lib/routes';
import type { Article } from '@/lib/content';

import styles from './HeadlineList.module.css';

type HeadlineListProps = {
  title: string;
  articles: Article[];
  live?: boolean;
};

export function HeadlineList({ title, articles, live = false }: HeadlineListProps) {
  if (articles.length === 0) return null;

  return (
    <section className={styles.panel} aria-labelledby="headline-list-title">
      <header className={styles.header}>
        {live && <span className={styles.pulse} aria-hidden="true" />}
        <h2 id="headline-list-title" className="label-caps">
          {title}
        </h2>
      </header>

      <ol className={styles.list}>
        {articles.map((article, index) => (
          <li key={article.slug} className={styles.item}>
            <span className={`${styles.index} tabular`} aria-hidden="true">
              {String(index + 1).padStart(2, '0')}
            </span>

            <div className={styles.text}>
              <h3 className={styles.title}>
                <Link
                  href={articleHref(article.category.slug, article.slug)}
                  className={styles.link}
                >
                  {article.title}
                </Link>
              </h3>

              {article.publishedAt && (
                <time dateTime={toIsoString(article.publishedAt)} className={styles.time}>
                  {formatRelativeTime(article.publishedAt)}
                </time>
              )}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
