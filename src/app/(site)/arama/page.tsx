import type { Metadata } from 'next';
import { Suspense } from 'react';

import { StaticSearch } from '@/components/site/StaticSearch';
import { buildSearchIndex, getAllTags } from '@/lib/content';

import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Arama',
  description: 'Periodista arşivinde haber arayın.',
  // Arama sonuçları dizine eklenmez; kanonik içerik haber sayfalarıdır.
  robots: { index: false, follow: true },
};

export default function SearchPage() {
  // İndeks derleme anında üretilip sayfaya gömülür; tarayıcı ek istek yapmaz.
  const index = buildSearchIndex();
  const popularTags = getAllTags().slice(0, 12);

  return (
    <div className="container">
      <div className={styles.wrapper}>
        <h1 className={styles.title}>Arama</h1>
        {/* useSearchParams istemci tarafında çözülür; Suspense sınırı gerekir. */}
        <Suspense fallback={<p className={styles.loading}>Arama yükleniyor…</p>}>
          <StaticSearch index={index} popularTags={popularTags} />
        </Suspense>
      </div>
    </div>
  );
}
