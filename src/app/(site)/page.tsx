import type { Metadata } from 'next';
import Link from 'next/link';

import { CategorySection } from '@/components/site/CategorySection';
import { HeadlineList } from '@/components/site/HeadlineList';
import { HeroSlider, type HeroSlide } from '@/components/site/HeroSlider';
import { formatShortDate, toIsoString } from '@/lib/format';
import { isDatabaseConfigured } from '@/lib/prisma';
import { articleHref, categoryHref } from '@/lib/routes';
import { SITE, absoluteUrl } from '@/lib/site-config';
import {
  getBreakingArticles,
  getCategorySections,
  getFeaturedArticles,
  getLatestArticles,
  type ArticleCard,
} from '@/server/queries';

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

function toSlide(article: ArticleCard): HeroSlide {
  return {
    id: article.id,
    href: articleHref(article.category.slug, article.slug),
    categoryName: article.category.name,
    categoryHref: categoryHref(article.category.slug),
    title: article.title,
    dek: article.dek,
    authorName: article.authorName,
    dateLabel: article.publishedAt ? formatShortDate(article.publishedAt) : '',
    isoDate: article.publishedAt ? toIsoString(article.publishedAt) : null,
    readMins: article.readMins,
    coverImage: article.coverImage,
    coverAlt: article.coverAlt || article.title,
  };
}

export default async function HomePage() {
  const [featured, breaking, sections] = await Promise.all([
    getFeaturedArticles(5),
    getBreakingArticles(6),
    getCategorySections(4),
  ]);

  // Son dakika işaretli haber yoksa panel en yeni haberlerle dolar.
  const sidebarArticles = breaking.length > 0 ? breaking : await getLatestArticles(6);
  const slides = featured.map(toSlide);

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
      <div className={styles.hero}>
        {slides.length > 0 && <HeroSlider slides={slides} />}
        <HeadlineList
          title={breaking.length > 0 ? 'Son Dakika' : 'Son Eklenenler'}
          articles={sidebarArticles}
          live={breaking.length > 0}
        />
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
