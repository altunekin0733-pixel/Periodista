import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

import { pageHref } from '@/lib/routes';

import styles from './Pagination.module.css';

type PaginationProps = {
  basePath: string;
  page: number;
  pageCount: number;
  extraParams?: Record<string, string>;
};

/** Uzun listelerde `1 … 4 5 6 … 20` biçiminde kısaltılmış sayfa dizisi üretir. */
function buildPages(page: number, pageCount: number): (number | 'gap')[] {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, index) => index + 1);
  }

  const pages = new Set<number>([1, pageCount, page, page - 1, page + 1]);
  const sorted = [...pages].filter((value) => value >= 1 && value <= pageCount).sort((a, b) => a - b);

  return sorted.flatMap((value, index) => {
    const previous = sorted[index - 1];

    return previous && value - previous > 1 ? ['gap' as const, value] : [value];
  });
}

export function Pagination({ basePath, page, pageCount, extraParams }: PaginationProps) {
  if (pageCount <= 1) return null;

  const pages = buildPages(page, pageCount);

  return (
    <nav className={styles.nav} aria-label="Sayfalama">
      <Link
        href={pageHref(basePath, page - 1, extraParams)}
        className={`${styles.arrow} ${page === 1 ? styles.disabled : ''}`}
        aria-disabled={page === 1}
        tabIndex={page === 1 ? -1 : undefined}
        rel="prev"
      >
        <ChevronLeft size={16} aria-hidden="true" />
        <span className="visually-hidden">Önceki sayfa</span>
      </Link>

      <ol className={styles.list}>
        {pages.map((value, index) =>
          value === 'gap' ? (
            <li key={`gap-${index}`} className={styles.gap} aria-hidden="true">
              …
            </li>
          ) : (
            <li key={value}>
              <Link
                href={pageHref(basePath, value, extraParams)}
                className={`${styles.page} ${value === page ? styles.current : ''}`}
                aria-current={value === page ? 'page' : undefined}
                aria-label={`Sayfa ${value}`}
              >
                {value}
              </Link>
            </li>
          ),
        )}
      </ol>

      <Link
        href={pageHref(basePath, page + 1, extraParams)}
        className={`${styles.arrow} ${page === pageCount ? styles.disabled : ''}`}
        aria-disabled={page === pageCount}
        tabIndex={page === pageCount ? -1 : undefined}
        rel="next"
      >
        <ChevronRight size={16} aria-hidden="true" />
        <span className="visually-hidden">Sonraki sayfa</span>
      </Link>
    </nav>
  );
}
