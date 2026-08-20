import { ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

import { ArticleCard } from '@/components/site/ArticleCard';
import { ArticleStream } from '@/components/site/ArticleStream';
import { CommentSection } from '@/components/site/CommentSection';
import { ReadingProgress } from '@/components/site/ReadingProgress';
import { ShareBar } from '@/components/site/ShareBar';
import { ViewCounter } from '@/components/site/ViewCounter';
import { embedMediaLinks } from '@/lib/embeds';
import { formatLongDate, toIsoString } from '@/lib/format';
import { articleHref, categoryHref, tagHref } from '@/lib/routes';
import { truncate } from '@/lib/sanitize';
import { getSettings } from '@/lib/settings';
import { SITE, absoluteUrl } from '@/lib/site-config';
import { getArticleBySlug, getRelatedArticles } from '@/server/queries';

import layout from '@/components/site/article-layout.module.css';

import styles from './page.module.css';

export const revalidate = 120;

/** Kesintisiz okuma akışı, adres çubuğunu güncellerken bu bölümü izler. */
const ARTICLE_ELEMENT_ID = 'haber-govdesi';

type PageProps = {
  params: Promise<{ kategori: string; slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) return { title: 'Haber bulunamadı' };

  const title = article.seoTitle || article.title;
  const description =
    article.seoDescription || article.dek || truncate(article.plainText, 160) || SITE.description;
  const canonical = articleHref(article.category.slug, article.slug);

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: 'article',
      title,
      description,
      url: absoluteUrl(canonical),
      publishedTime: article.publishedAt ? toIsoString(article.publishedAt) : undefined,
      modifiedTime: toIsoString(article.updatedAt),
      authors: [article.authorName],
      section: article.category.name,
      tags: article.tags.map((tag) => tag.name),
      images: article.coverImage ? [{ url: article.coverImage, alt: article.coverAlt || title }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: article.coverImage ? [article.coverImage] : undefined,
    },
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const { kategori, slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) notFound();

  // Kategori değiştiyse eski adres kalıcı olarak yeni adrese yönlenir.
  if (article.category.slug !== kategori) {
    redirect(articleHref(article.category.slug, article.slug));
  }

  const [related, settings] = await Promise.all([
    getRelatedArticles(article.id, article.category.id, 3),
    getSettings(),
  ]);

  const canonical = absoluteUrl(articleHref(article.category.slug, article.slug));
  const description = article.seoDescription || article.dek || truncate(article.plainText, 160);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'NewsArticle',
        headline: truncate(article.title, 110),
        description,
        image: article.coverImage ? [article.coverImage] : undefined,
        datePublished: article.publishedAt ? toIsoString(article.publishedAt) : undefined,
        dateModified: toIsoString(article.updatedAt),
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
      <ReadingProgress targetId={ARTICLE_ELEMENT_ID} />
      <ViewCounter articleId={article.id} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article id={ARTICLE_ELEMENT_ID} className={layout.article}>
        <nav className={styles.breadcrumb} aria-label="Sayfa yolu">
          <Link href="/">Ana Sayfa</Link>
          <span aria-hidden="true">/</span>
          <Link href={categoryHref(article.category.slug)}>{article.category.name}</Link>
        </nav>

        <header className={layout.header}>
          <Link href={categoryHref(article.category.slug)} className={layout.categoryChip}>
            {article.category.name}
          </Link>

          <h1 className={layout.title}>{article.title}</h1>

          {article.dek && <p className={layout.dek}>{article.dek}</p>}

          <div className={layout.byline}>
            <span className={layout.author}>{article.authorName}</span>
            {article.publishedAt && (
              <>
                <span aria-hidden="true">·</span>
                <time dateTime={toIsoString(article.publishedAt)} className="tabular">
                  {formatLongDate(article.publishedAt)}
                </time>
              </>
            )}
            <span aria-hidden="true">·</span>
            <span className="tabular">{article.readMins} dk okuma</span>
          </div>
        </header>

        {article.coverImage && (
          <figure className={layout.cover}>
            <Image
              src={article.coverImage}
              alt={article.coverAlt || article.title}
              width={1200}
              height={675}
              priority
              sizes="(max-width: 48rem) 100vw, 760px"
              className={layout.coverImage}
            />
            {article.coverAlt && <figcaption className={layout.caption}>{article.coverAlt}</figcaption>}
          </figure>
        )}

        {/* Gövde kaydedilirken sanitize edilir; burada güvenli HTML basılır. */}
        <div
          className={layout.body}
          dangerouslySetInnerHTML={{ __html: embedMediaLinks(article.body) }}
        />

        {article.tags.length > 0 && (
          <nav className={layout.tags} aria-label="Etiketler">
            {article.tags.map((tag) => (
              <Link key={tag.slug} href={tagHref(tag.slug)} className={layout.tag}>
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
                <ArticleCard key={item.id} article={item} />
              ))}
            </div>
          </section>
        )}

        {settings.commentsEnabled && (
          <CommentSection articleId={article.id} moderated={settings.commentsModerated} />
        )}
      </article>

      {/* Okur aşağı kaydırmayı sürdürdükçe sonraki haberler buraya eklenir. */}
      {article.publishedAt && (
        <ArticleStream
          current={{
            id: article.id,
            href: articleHref(article.category.slug, article.slug),
            title: article.title,
            elementId: ARTICLE_ELEMENT_ID,
          }}
          cursor={toIsoString(article.publishedAt)}
        />
      )}
    </>
  );
}
