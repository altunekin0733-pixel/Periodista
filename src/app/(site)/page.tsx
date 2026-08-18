import type { Metadata } from 'next';
import Link from 'next/link';

import { CategorySection } from '@/components/site/CategorySection';
import { HeadlineList } from '@/components/site/HeadlineList';
import { HeroSlider, type HeroSlide } from '@/components/site/HeroSlider';
import {
  getArticles,
  getBreakingArticles,
  getCategorySections,
  getFeaturedArticles,
  type Article,
} from '@/lib/content';
import { formatShortDate } from '@/lib/format';
import { articleHref, categoryHref } from '@/lib/routes';
import { SITE, absoluteUrl } from '@/lib/site-config';

import styles from './page.module.css';

export const metadata: Metadata = {
  // `absolute`: kök düzendeki "%s — Periodista" şablonu ana sayfada uygulanmaz.
  title: { absolute: `${SITE.name} — Güncel Haberler` },
  description: SITE.description,
  alternates: { canonical: absoluteUrl('/') },
  openGraph: {
    title: `${SITE.name} — Güncel Haberler`,
    description: SITE.description,
    url: absoluteUrl('/'),
  },
};

function toSlide(article: Article): HeroSlide {
  return {
    id: article.slug,
    href: articleHref(article.category.slug, article.slug),
    categoryName: article.category.name,
    categoryHref: categoryHref(article.category.slug),
    title: article.title,
    dek: article.dek,
    authorName: article.authorName,
    dateLabel: formatShortDate(article.publishedAt),
    isoDate: article.publishedAt,
    readMins: article.readMins,
    coverImage: article.coverImage,
    coverAlt: article.coverAlt || article.title,
  };
}

export default function HomePage() {
  const featured = getFeaturedArticles(5);
  const breaking = getBreakingArticles(6);
  const sections = getCategorySections(4);

  // Son dakika işaretli haber yoksa panel en yeni haberlerle dolar.
  const sidebarArticles = breaking.length > 0 ? breaking : getArticles().slice(0, 6);
  const slides = featured.map(toSlide);

  if (slides.length === 0 && sections.length === 0) {
    return (
      <div className="container">
        <div className={styles.empty}>
          <h1 className={styles.emptyTitle}>Henüz yayınlanmış haber yok</h1>
          <p className={styles.emptyText}>
            <code>content/haberler/</code> klasörüne bir markdown dosyası ekleyip depoya
            gönderdiğinizde haber burada görünecek.
          </p>
          <Link href="/arama" className={styles.emptyAction}>
            Arama sayfasına git
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
