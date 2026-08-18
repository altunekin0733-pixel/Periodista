'use client';

import { Search, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import styles from './ArticleFilters.module.css';

type ArticleFiltersProps = {
  categories: { slug: string; name: string }[];
  defaultQuery: string;
  defaultStatus: string;
  defaultCategory: string;
};

export function ArticleFilters({
  categories,
  defaultQuery,
  defaultStatus,
  defaultCategory,
}: ArticleFiltersProps) {
  const router = useRouter();
  const [term, setTerm] = useState(defaultQuery);

  function apply(next: { q?: string; durum?: string; kategori?: string }) {
    const params = new URLSearchParams();

    const q = next.q ?? term;
    const durum = next.durum ?? defaultStatus;
    const kategori = next.kategori ?? defaultCategory;

    if (q.trim()) params.set('q', q.trim());
    if (durum) params.set('durum', durum);
    if (kategori) params.set('kategori', kategori);

    const query = params.toString();
    router.push(query ? `/admin/haberler?${query}` : '/admin/haberler');
  }

  const hasFilters = Boolean(defaultQuery || defaultStatus || defaultCategory);

  return (
    <form
      className={styles.filters}
      onSubmit={(event) => {
        event.preventDefault();
        apply({});
      }}
      role="search"
    >
      <div className={styles.searchBox}>
        <Search size={16} className={styles.searchIcon} aria-hidden="true" />
        <input
          type="search"
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          placeholder="Başlık veya yazar ara…"
          className={styles.searchInput}
          aria-label="Haberlerde ara"
        />
      </div>

      <select
        className="admin-select"
        value={defaultStatus}
        onChange={(event) => apply({ durum: event.target.value })}
        aria-label="Duruma göre filtrele"
      >
        <option value="">Tüm durumlar</option>
        <option value="yayinda">Yayında</option>
        <option value="taslak">Taslak</option>
      </select>

      <select
        className="admin-select"
        value={defaultCategory}
        onChange={(event) => apply({ kategori: event.target.value })}
        aria-label="Kategoriye göre filtrele"
      >
        <option value="">Tüm kategoriler</option>
        {categories.map((category) => (
          <option key={category.slug} value={category.slug}>
            {category.name}
          </option>
        ))}
      </select>

      <button type="submit" className="admin-button is-ghost">
        Filtrele
      </button>

      {hasFilters && (
        <button
          type="button"
          className={styles.clear}
          onClick={() => {
            setTerm('');
            router.push('/admin/haberler');
          }}
        >
          <X size={14} aria-hidden="true" />
          Temizle
        </button>
      )}
    </form>
  );
}
