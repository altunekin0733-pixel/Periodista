import type { Metadata } from 'next';
import Link from 'next/link';

import { CategorySection } from '@/components/site/CategorySection';
import { HeadlineList } from '@/components/site/HeadlineList';
import { toHeroSlide } from '@/components/site/hero-slide';
import { HeroSlider } from '@/components/site/HeroSlider';
import { isDatabaseConfigured } from '@/lib/prisma';
import { BREAKING_LIMIT, SITE, absoluteUrl } from '@/lib/site-config';
import { getBreakingArticles, getCategorySections, getFeaturedArticles } from '@/server/queries';

import styles from './page.module.css';

export const revalidate = 60;

export const metadata: Metadata = {
  // `absolute`: kök düzendeki "%s — Periodista" şablonu ana sayfada uygulanmaz.
  title: { absolute: `${SITE.name} — Güncel Haberler` },
  description: SITE.description,
  alternates: { canonical: '/' },
  openGraph: {
    title: `${SITE.name} — Güncel Haberler`,
    description: SITE.description,
    url: absoluteUrl('/'),
  },
};

export default async function HomePage() {
  const [featured, breaking, sections] = await Promise.all([
    getFeaturedArticles(5),
    getBreakingArticles(BREAKING_LIMIT),
    getCategorySections(4),
  ]);

  const slides = featured.map(toHeroSlide);

  if (slides.length === 0 && sections.length === 0) {
    // Veritabanı hiç bağlanmamışsa boş içerik değil, kurulum yönergesi gösterilir.
    if (!isDatabaseConfigured()) {
      return (
        <div className="container">
          <div className={styles.empty}>
            <h1 className={styles.emptyTitle}>Kurulum tamamlanmadı</h1>
            <p className={styles.emptyText}>
              Veritabanı bağlantısı tanımlı değil. <code>DATABASE_URL</code> ortam
              değişkenini ekledikten sonra tabloları oluşturup örnek içeriği yükleyin:
            </p>
            <pre className={styles.emptyCode}>
              <code>
                npm run db:push{'\n'}
                npm run db:seed
              </code>
            </pre>
            <p className={styles.emptyText}>
              Ayrıntılı adımlar için depodaki <strong>README.md</strong> dosyasına bakın.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="container">
        <div className={styles.empty}>
          <h1 className={styles.emptyTitle}>Henüz yayınlanmış haber yok</h1>
          <p className={styles.emptyText}>
            Yönetim panelinden ilk haberinizi ekleyip yayına aldığınızda burada görünecek.
          </p>
          <Link href="/admin" className={styles.emptyAction}>
            Yönetim paneline git
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Sayfanın tek h1'i; görsel karşılığı başlıktaki logodur. */}
      <h1 className="visually-hidden">{`${SITE.name} — Güncel Haberler`}</h1>

      <div className={styles.hero}>
        {slides.length > 0 && <HeroSlider slides={slides} />}
        {/* Şeritteki haberlerin aynısı: en son yayınlanan BREAKING_LIMIT haber. */}
        <HeadlineList title="Son Dakika" articles={breaking} live />
      </div>

      {sections.map((section) => (
        <CategorySection
          key={section.category.slug}
          category={section.category}
          articles={section.articles}
        />
      ))}
    </div>
  );
}
