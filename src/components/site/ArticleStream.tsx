'use client';

import { LoaderCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

import { registerView } from '@/lib/register-view';
import type { FeedArticle } from '@/lib/reader-feed';
import { SITE } from '@/lib/site-config';

import layout from './article-layout.module.css';
import styles from './ArticleStream.module.css';

type ArticleStreamProps = {
  /** Sayfanın kendi haberi — akış bunun devamından başlar. */
  current: { id: string; href: string; title: string; elementId: string };
  /** Sayfadaki haberin yayın tarihi; akışın imleci. */
  cursor: string;
};

/**
 * Haber bittiğinde kaydırmaya devam eden okura sonraki haberler eklenir.
 * Görünür hale gelen haber adres çubuğuna yazılır ve okunmuş sayılır — okur
 * bağlantıya tıklamış gibi.
 */
export function ArticleStream({ current, cursor }: ArticleStreamProps) {
  const [items, setItems] = useState<FeedArticle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const sentinelRef = useRef<HTMLDivElement>(null);
  const sectionsRef = useRef(new Map<string, HTMLElement>());
  const activeIdRef = useRef(current.id);

  const loadMore = useCallback(async () => {
    if (isLoading || isDone) return;

    setIsLoading(true);

    const before = items.at(-1)?.isoDate ?? cursor;
    const excluded = [current.id, ...items.map((item) => item.id)];

    try {
      const params = new URLSearchParams({ once: before, haric: excluded.join(',') });
      const response = await fetch(`/api/haber-akisi?${params}`);

      if (!response.ok) throw new Error('Akış alınamadı');

      const payload: { articles: FeedArticle[] } = await response.json();

      if (payload.articles.length === 0) {
        setIsDone(true);
      } else {
        setItems((existing) => [...existing, ...payload.articles]);
      }
    } catch {
      // Ağ hatasında akış durur; okur sayfayı yenileyerek yeniden deneyebilir.
      setIsDone(true);
    } finally {
      setIsLoading(false);
    }
  }, [cursor, current.id, isDone, isLoading, items]);

  // Dip nöbetçisi görününce bir sonraki grup istenir.
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || isDone) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) void loadMore();
      },
      { rootMargin: '600px 0px' },
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [loadMore, isDone]);

  // Ekranın üst bandındaki haber adres çubuğuna yazılır ve okunmuş sayılır.
  useEffect(() => {
    const entries = [
      { id: current.id, href: current.href, title: current.title },
      ...items.map((item) => ({ id: item.id, href: item.href, title: item.title })),
    ];

    const byElement = new Map<Element, (typeof entries)[number]>();

    for (const entry of entries) {
      const element =
        entry.id === current.id
          ? document.getElementById(current.elementId)
          : sectionsRef.current.get(entry.id);

      if (element) byElement.set(element, entry);
    }

    if (byElement.size === 0) return;

    const observer = new IntersectionObserver(
      (observed) => {
        const visible = observed.find((entry) => entry.isIntersecting);
        if (!visible) return;

        const entry = byElement.get(visible.target);
        if (!entry || entry.id === activeIdRef.current) return;

        activeIdRef.current = entry.id;
        window.history.replaceState(null, '', entry.href);
        document.title = `${entry.title} — ${SITE.name}`;

        if (entry.id !== current.id) registerView(entry.id);
      },
      // Ekranın üst çeyreğinde duran bölüm "okunan haber" sayılır.
      { rootMargin: '-15% 0px -75% 0px' },
    );

    for (const element of byElement.keys()) observer.observe(element);

    return () => observer.disconnect();
  }, [items, current]);

  return (
    <div className={styles.stream}>
      {items.map((item) => (
        <article
          key={item.id}
          className={layout.article}
          ref={(element) => {
            if (element) sectionsRef.current.set(item.id, element);
            else sectionsRef.current.delete(item.id);
          }}
        >
          <p className={styles.eyebrow}>Sıradaki haber</p>

          <header className={layout.header}>
            <Link href={item.categoryHref} className={layout.categoryChip}>
              {item.categoryName}
            </Link>

            <h2 className={layout.title}>
              <Link href={item.href} className={styles.titleLink}>
                {item.title}
              </Link>
            </h2>

            {item.dek && <p className={layout.dek}>{item.dek}</p>}

            <div className={layout.byline}>
              <span className={layout.author}>{item.authorName}</span>
              {item.isoDate && (
                <>
                  <span aria-hidden="true">·</span>
                  <time dateTime={item.isoDate} className="tabular">
                    {item.dateLabel}
                  </time>
                </>
              )}
              <span aria-hidden="true">·</span>
              <span className="tabular">{item.readMins} dk okuma</span>
            </div>
          </header>

          {item.coverImage && (
            <figure className={layout.cover}>
              <Image
                src={item.coverImage}
                alt={item.coverAlt}
                width={1200}
                height={675}
                sizes="(max-width: 48rem) 100vw, 760px"
                className={layout.coverImage}
              />
            </figure>
          )}

          {/* Gövde kayıt anında sanitize edildi; burada güvenli HTML basılır. */}
          <div className={layout.body} dangerouslySetInnerHTML={{ __html: item.body }} />

          {item.tags.length > 0 && (
            <nav className={layout.tags} aria-label="Etiketler">
              {item.tags.map((tag) => (
                <Link key={tag.slug} href={`/etiket/${tag.slug}`} className={layout.tag}>
                  #{tag.name}
                </Link>
              ))}
            </nav>
          )}
        </article>
      ))}

      {!isDone && (
        <div ref={sentinelRef} className={styles.sentinel}>
          {isLoading && (
            <p className={styles.loading} role="status">
              <LoaderCircle size={16} className={styles.spinner} aria-hidden="true" />
              Sonraki haber yükleniyor…
            </p>
          )}
        </div>
      )}

      {isDone && items.length > 0 && <p className={styles.end}>Akışın sonuna geldiniz.</p>}
    </div>
  );
}
