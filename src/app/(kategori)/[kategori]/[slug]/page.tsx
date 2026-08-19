import { ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { ArticleCard } from '@/components/site/ArticleCard';
import { ReadingProgress } from '@/components/site/ReadingProgress';
import { ShareBar } from '@/components/site/ShareBar';
import { getArticleBySlug, getArticles, getRelatedArticles } from '@/lib/content';
import { formatLongDate } from '@/lib/format';
import { articleHref, categoryHref, tagHref } from '@/lib/routes';
import { truncate } from '@/lib/sanitize';
import { SITE, absoluteUrl, assetPath } from '@/lib/site-config';

import styles from './page.module.css';

type PageProps = {
  params: Promise<{ kategori: string; slug: string }>;
};

export function generateStaticParams() {
  return getArticles().map((article) => ({
    kategori: article.category.slug,
    slug: article.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) return { title: 'Haber bulunamadı' };

  const title = article.seoTitle || article.title;
  const description =
    article.seoDescription || article.dek || truncate(article.plainText, 160) || SITE.description;
  const canonical = articleHref(article.category.slug, article.slug);

  return {
    title,
    description,
    alternates: { canonical: absoluteUrl(canonical) },
    openGraph: {
      type: 'article',
      title,
      description,
      url: absoluteUrl(canonical),
      publishedTime: article.publishedAt,
      authors: [article.authorName],
      section: article.category.name,
      tags: article.tags.map((tag) => tag.name),
      images: article.coverImage
        ? [{ url: absoluteUrl(article.coverImage), alt: article.coverAlt || title }]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: article.coverImage ? [absoluteUrl(article.coverImage)] : undefined,
    },
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const { kategori, slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article || article.category.slug !== kategori) notFound();

  const related = getRelatedArticles(article, 3);
  const canonical = absoluteUrl(articleHref(article.category.slug, article.slug));
  const description = article.seoDescription || article.dek || truncate(article.plainText, 160);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'NewsArticle',
        headline: truncate(article.title, 110),
        description,
        image: article.coverImage ? [absoluteUrl(article.coverImage)] : undefined,
        datePublished: article.publishedAt,
        dateModified: article.publishedAt,
        author: [{ '@type': 'Person', name: article.authorName }],
        publisher: {
          '@type': 'NewsMediaOrganization',
          name: SITE.name,
          logo: { '@type': 'ImageObject', url: absoluteUrl('/marka/logo-black.png') },
        },
        mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
        articleSection: article.category.name,
        keywords: article.tags.map((tag) => tag.name).join(', ') || undefined,
        inLanguage: SITE.language,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: absoluteUrl('/') },
          {
            '@type': 'ListItem',
            position: 2,
            name: article.category.name,
            item: absoluteUrl(categoryHref(article.category.slug)),
          },
          { '@type': 'ListItem', position: 3, name: article.title, item: canonical },
        ],
      },
    ],
  };

  return (
    <>
      <ReadingProgress />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className={styles.article}>
        <nav className={styles.breadcrumb} aria-label="Sayfa yolu">
          <Link href="/">Ana Sayfa</Link>
          <span aria-hidden="true">/</span>
          <Link href={categoryHref(article.category.slug)}>{article.category.name}</Link>
        </nav>

        <header className={styles.header}>
          <Link href={categoryHref(article.category.slug)} className={styles.categoryChip}>
            {article.category.name}
          </Link>

          <h1 className={styles.title}>{article.title}</h1>

          {article.dek && <p className={styles.dek}>{article.dek}</p>}

          <div className={styles.byline}>
            <span className={styles.author}>{article.authorName}</span>
            <span aria-hidden="true">·</span>
            <time dateTime={article.publishedAt} className="tabular">
              {formatLongDate(article.publishedAt)}
            </time>
            <span aria-hidden="true">·</span>
            <span className="tabular">{article.readMins} dk okuma</span>
          </div>
        </header>

        {article.coverImage && (
          <figure className={styles.cover}>
            <Image
              src={assetPath(article.coverImage)}
              alt={article.coverAlt || article.title}
              width={1200}
              height={675}
              priority
              className={styles.coverImage}
            />
            {article.coverAlt && (
              <figcaption className={styles.caption}>{article.coverAlt}</figcaption>
            )}
          </figure>
        )}

        {/* Markdown derleme anında HTML'e çevrilip sanitize edilir. */}
        <div className={styles.body} dangerouslySetInnerHTML={{ __html: article.html }} />

        {article.tags.length > 0 && (
          <nav className={styles.tags} aria-label="Etiketler">
            {article.tags.map((tag) => (
              <Link key={tag.slug} href={tagHref(tag.slug)} className={styles.tag}>
                #{tag.name}
              </Link>
            ))}
          </nav>
        )}

        <ShareBar url={canonical} title={article.title} />

        {related.length > 0 && (
          <section className={styles.related} aria-labelledby="ilgili-haberler">
            <div className={styles.relatedHeader}>
              <h2 id="ilgili-haberler" className="label-caps">
                İlgili Haberler
              </h2>
              <Link href={categoryHref(article.category.slug)} className={styles.relatedMore}>
                {article.category.name}
                <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </div>

            <div className={styles.relatedGrid}>
              {related.map((item) => (
                <ArticleCard key={item.slug} article={item} />
              ))}
            </div>
          </section>
        )}
      </article>
    </>
  );
}
