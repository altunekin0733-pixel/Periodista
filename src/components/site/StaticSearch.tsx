'use client';

import { Search, X } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';

import type { SearchEntry } from '@/lib/content';
import { formatShortDate } from '@/lib/format';
import { articleHref, categoryHref, tagHref } from '@/lib/routes';

import styles from './StaticSearch.module.css';

const MIN_QUERY_LENGTH = 2;
const MAX_RESULTS = 40;

/** Türkçe büyük/küçük harf kuralları (I/İ) doğru çalışsın diye tr-TR ile katlanır. */
function fold(value: string): string {
  return value.toLocaleLowerCase('tr-TR');
}

type StaticSearchProps = {
  index: SearchEntry[];
  popularTags: { slug: string; name: string; count: number }[];
};

export function StaticSearch({ index, popularTags }: StaticSearchProps) {
  // Başlıktaki arama kutusu /arama?q=... adresine yönlendirir; o değeri alırız.
  const urlQuery = useSearchParams().get('q') ?? '';
  const [query, setQuery] = useState(urlQuery);
  const [syncedUrl, setSyncedUrl] = useState(urlQuery);

  // Adres değiştiğinde alanı render sırasında hizala — efektle senkronlamak
  // fazladan bir boyama turu yaratırdı.
  if (urlQuery !== syncedUrl) {
    setSyncedUrl(urlQuery);
    setQuery(urlQuery);
  }

  const term = query.trim();

  const results = useMemo(() => {
    if (term.length < MIN_QUERY_LENGTH) return [];

    // Her kelime ayrı ayrı eşleşmeli — "deprem başvuru" ikisini de arar.
    const words = fold(term).split(/\s+/).filter(Boolean);

    return index
      .filter((entry) => words.every((word) => entry.haystack.includes(word)))
      .slice(0, MAX_RESULTS);
  }, [index, term]);

  const showResults = term.length >= MIN_QUERY_LENGTH;

  return (
    <div className={styles.wrapper}>
      <form
        className={styles.form}
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          // Sonuçlar zaten anlık; gönderim yalnızca klavye alışkanlığı için.
        }}
      >
        <Search size={18} className={styles.icon} aria-hidden="true" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Haber, yazar veya etiket ara…"
          className={styles.input}
          aria-label="Arama terimi"
          autoFocus
        />
        {query.length > 0 && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className={styles.clear}
            aria-label="Aramayı temizle"
          >
            <X size={15} aria-hidden="true" />
          </button>
        )}
      </form>

      {!showResults ? (
        <div className={styles.suggestions}>
          <p className={styles.hint}>
            {term.length === 0
              ? `Aramak istediğiniz kelimeyi yazın. ${index.length} haber arasında anında arar.`
              : 'En az 2 karakter girin.'}
          </p>

          {popularTags.length > 0 && (
            <>
              <p className="label-caps">Popüler etiketler</p>
              <div className={styles.tags}>
                {popularTags.map((tag) => (
                  <Link key={tag.slug} href={tagHref(tag.slug)} className={styles.tag}>
                    #{tag.name}
                    <span className={`${styles.tagCount} tabular`}>{tag.count}</span>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      ) : (
        <>
          <p className={styles.summary} role="status" aria-live="polite">
            <strong>{term}</strong> için {results.length} sonuç
            {results.length === MAX_RESULTS && ' (ilk 40 gösteriliyor)'}
          </p>

          {results.length === 0 ? (
            <p className={styles.empty}>
              Aramanızla eşleşen haber bulunamadı. Farklı bir kelime deneyin.
            </p>
          ) : (
            <ol className={styles.results}>
              {results.map((entry) => (
                <li key={entry.slug} className={styles.result}>
                  <Link
                    href={categoryHref(entry.categorySlug)}
                    className={styles.resultCategory}
                  >
                    {entry.category}
                  </Link>

                  <h2 className={styles.resultTitle}>
                    <Link
                      href={articleHref(entry.categorySlug, entry.slug)}
                      className={styles.resultLink}
                    >
                      {entry.title}
                    </Link>
                  </h2>

                  {entry.dek && <p className={styles.resultDek}>{entry.dek}</p>}

                  <p className={styles.resultMeta}>
                    <span className={styles.resultAuthor}>{entry.author}</span>
                    <span aria-hidden="true">·</span>
                    <time dateTime={entry.date} className="tabular">
                      {formatShortDate(entry.date)}
                    </time>
                    <span aria-hidden="true">·</span>
                    <span className="tabular">{entry.readMins} dk</span>
                  </p>
                </li>
              ))}
            </ol>
          )}
        </>
      )}
    </div>
  );
}
