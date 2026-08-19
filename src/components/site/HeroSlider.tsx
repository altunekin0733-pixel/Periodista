'use client';

import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

import { assetPath } from '@/lib/site-config';

import styles from './HeroSlider.module.css';

export type HeroSlide = {
  id: string;
  href: string;
  categoryName: string;
  categoryHref: string;
  title: string;
  dek: string;
  authorName: string;
  dateLabel: string;
  isoDate: string | null;
  readMins: number;
  coverImage: string | null;
  coverAlt: string;
};

const ROTATE_MS = 7000;

export function HeroSlider({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const regionRef = useRef<HTMLElement>(null);

  const total = slides.length;

  const goTo = useCallback(
    (next: number) => {
      if (total === 0) return;
      setIndex(((next % total) + total) % total);
    },
    [total],
  );

  useEffect(() => {
    if (total <= 1 || paused) return;

    // Hareket azaltma tercihinde otomatik geçiş çalışmaz.
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    const timer = window.setInterval(() => setIndex((current) => (current + 1) % total), ROTATE_MS);

    return () => window.clearInterval(timer);
  }, [total, paused]);

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      goTo(index + 1);
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      goTo(index - 1);
    }
  }

  if (total === 0) return null;

  return (
    <section
      ref={regionRef}
      className={styles.slider}
      aria-roledescription="karusel"
      aria-label="Manşet haberler"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(event) => {
        if (!regionRef.current?.contains(event.relatedTarget as Node)) setPaused(false);
      }}
      onKeyDown={onKeyDown}
    >
      {slides.map((slide, slideIndex) => {
        const isActive = slideIndex === index;

        return (
          <article
            key={slide.id}
            className={`${styles.slide} ${isActive ? styles.active : ''}`}
            aria-hidden={!isActive}
            aria-roledescription="slayt"
            aria-label={`${slideIndex + 1} / ${total}`}
          >
            {slide.coverImage ? (
              <Image
                src={assetPath(slide.coverImage)}
                alt={slide.coverAlt}
                fill
                sizes="(max-width: 64rem) 100vw, 720px"
                priority={slideIndex === 0}
                className={styles.image}
              />
            ) : (
              <span className={styles.placeholder} />
            )}

            <div className={styles.scrim} />

            <div className={styles.content}>
              <Link
                href={slide.categoryHref}
                className={styles.category}
                tabIndex={isActive ? 0 : -1}
              >
                {slide.categoryName}
              </Link>

              <h2 className={styles.title}>
                <Link href={slide.href} className={styles.titleLink} tabIndex={isActive ? 0 : -1}>
                  {slide.title}
                </Link>
              </h2>

              {slide.dek && <p className={styles.dek}>{slide.dek}</p>}

              <p className={styles.meta}>
                <span className={styles.author}>{slide.authorName}</span>
                {slide.isoDate && (
                  <>
                    <span aria-hidden="true">·</span>
                    <time dateTime={slide.isoDate} className="tabular">
                      {slide.dateLabel}
                    </time>
                  </>
                )}
                <span aria-hidden="true">·</span>
                <span className="tabular">{slide.readMins} dk okuma</span>
              </p>
            </div>
          </article>
        );
      })}

      {total > 1 && (
        <div className={styles.controls}>
          <button
            type="button"
            className={styles.arrow}
            onClick={() => goTo(index - 1)}
            aria-label="Önceki manşet"
          >
            <ChevronLeft size={16} aria-hidden="true" />
          </button>

          <div className={styles.dots} role="tablist" aria-label="Manşet seçimi">
            {slides.map((slide, dotIndex) => (
              <button
                key={slide.id}
                type="button"
                role="tab"
                aria-selected={dotIndex === index}
                aria-label={`${dotIndex + 1}. manşet`}
                className={`${styles.dot} ${dotIndex === index ? styles.dotActive : ''}`}
                onClick={() => goTo(dotIndex)}
              />
            ))}
          </div>

          <button
            type="button"
            className={styles.arrow}
            onClick={() => goTo(index + 1)}
            aria-label="Sonraki manşet"
          >
            <ChevronRight size={16} aria-hidden="true" />
          </button>

          <button
            type="button"
            className={styles.arrow}
            onClick={() => setPaused((value) => !value)}
            aria-label={paused ? 'Otomatik geçişi başlat' : 'Otomatik geçişi durdur'}
          >
            {paused ? <Play size={14} aria-hidden="true" /> : <Pause size={14} aria-hidden="true" />}
          </button>
        </div>
      )}
    </section>
  );
}
