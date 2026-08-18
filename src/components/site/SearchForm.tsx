'use client';

import { Search, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import styles from './SearchForm.module.css';

export function SearchForm({ defaultValue = '' }: { defaultValue?: string }) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);
  const [syncedQuery, setSyncedQuery] = useState(defaultValue);

  // Tarayıcı geri/ileri hareketinde alan adres çubuğuyla eşleşsin. Render
  // sırasında düzeltmek, efektle senkronlamaya göre fazladan boyama yaratmaz.
  if (defaultValue !== syncedQuery) {
    setSyncedQuery(defaultValue);
    setValue(defaultValue);
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();

    const term = value.trim();
    if (term.length < 2) return;

    router.push(`/arama?q=${encodeURIComponent(term)}`);
  }

  return (
    <form onSubmit={onSubmit} className={styles.form} role="search">
      <Search size={18} className={styles.icon} aria-hidden="true" />

      <input
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Haber, yazar veya etiket ara…"
        className={styles.input}
        aria-label="Arama terimi"
        autoFocus={defaultValue.length === 0}
      />

      {value.length > 0 && (
        <button
          type="button"
          onClick={() => setValue('')}
          className={styles.clear}
          aria-label="Aramayı temizle"
        >
          <X size={15} aria-hidden="true" />
        </button>
      )}

      <button type="submit" className={styles.submit} disabled={value.trim().length < 2}>
        Ara
      </button>
    </form>
  );
}
