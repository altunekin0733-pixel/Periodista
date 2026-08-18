import type { Metadata } from 'next';

import { ArticleCard } from '@/components/site/ArticleCard';
import { Pagination } from '@/components/site/Pagination';
import { SearchForm } from '@/components/site/SearchForm';
import { parsePageParam, tagHref } from '@/lib/routes';
import { getPopularTags, searchArticles } from '@/server/queries';

import Link from 'next/link';

import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Arama',
  description: 'Periodista arşivinde haber arayın.',
  // Arama sonuç sayfaları dizine eklenmez; kanonik içerik haber sayfalarıdır.
  robots: { index: false, follow: true },
};

// Sorgu her istekte değiştiği için sonuçlar önbelleğe alınmaz.
export const dynamic = 'force-dynamic';

type PageProps = {
  searchParams: Promise<{ q?: string; sayfa?: string }>;
};

export default async function SearchPage({ searchParams }: PageProps) {
  const query = await searchParams;
  const term = (query.q ?? '').trim();
  const page = parsePageParam(query.sayfa);

  const [results, tags] = await Promise.all([searchArticles(term, page), getPopularTags(12)]);

  const hasQuery = term.length >= 2;

  return (
    <div className="container">
      <div className={styles.wrapper}>
        <header className={styles.header}>
          <h1 className={styles.title}>Arama</h1>
          <SearchForm defaultValue={term} />
        </header>

        {!hasQuery ? (
          <section className={styles.suggestions}>
            <p className={styles.hint}>
              {term.length === 0
                ? 'Aramak istediğiniz kelimeyi yazın.'
                : 'En az 2 karakter girin.'}
            </p>

            {tags.length > 0 && (
              <>
                <p className="label-caps">Popüler etiketler</p>
                <div className={styles.tags}>
                  {tags.map((tag) => (
                    <Link key={tag.slug} href={tagHref(tag.slug)} className={styles.tag}>
                      #{tag.name}
                      <span className={`${styles.tagCount} tabular`}>{tag._count.articles}</span>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </section>
        ) : (
          <>
            <p className={styles.summary} role="status">
              <strong>{term}</strong> için {results.total} sonuç bulundu
              {results.pageCount > 1 && ` · sayfa ${page}/${results.pageCount}`}
            </p>

            {results.items.length === 0 ? (
              <p className={styles.empty}>
                Aramanızla eşleşen haber bulunamadı. Farklı bir kelime deneyin.
              </p>
            ) : (
              <div className={styles.grid}>
                {results.items.map((article) => (
                  <ArticleCard key={article.id} article={article} showDek />
                ))}
              </div>
            )}

            <Pagination
              basePath="/arama"
              page={page}
              pageCount={results.pageCount}
              extraParams={{ q: term }}
            />
          </>
        )}
      </div>
    </div>
  );
}
