'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

import type { Movie } from '@/lib/panels';

import panel from './side-panel.module.css';
import styles from './MoviesPanel.module.css';

type MoviesPanelProps = {
  films: Movie[];
  note: string;
};

export function MoviesPanel({ films, note }: MoviesPanelProps) {
  const [index, setIndex] = useState(0);

  if (films.length === 0) return null;

  const total = films.length;
  const film = films[index];

  function goTo(next: number) {
    setIndex(((next % total) + total) % total);
  }

  const details = [film.genre, film.releaseLabel].filter(Boolean).join(' · ');

  return (
    <section className={panel.panel} aria-labelledby="vizyondaki-filmler-baslik">
      <header className={panel.header}>
        <h2 id="vizyondaki-filmler-baslik" className="label-caps">
          Vizyondaki Filmler
        </h2>
        <span className={panel.meta}>
          {index + 1}/{total}
        </span>
      </header>

      <div className={panel.body}>
        <div className={styles.slide}>
          {film.poster && (
            /*
             * Afiş adresi editör tarafından girilen üçüncü taraf bağlantısıdır;
             * next/image için her alan adını izinli hale getirmek gerekirdi.
             */
            // eslint-disable-next-line @next/next/no-img-element
            <img src={film.poster} alt="" className={styles.poster} loading="lazy" />
          )}

          <div className={styles.text}>
            <h3 className={styles.title}>
              {film.url ? (
                <a href={film.url} target="_blank" rel="noopener noreferrer" className={styles.link}>
                  {film.title}
                </a>
              ) : (
                film.title
              )}
            </h3>

            {details && <p className={styles.details}>{details}</p>}
          </div>
        </div>
      </div>

      <div className={styles.controls}>
        <button
          type="button"
          className={styles.arrow}
          onClick={() => goTo(index - 1)}
          aria-label="Önceki film"
        >
          <ChevronLeft size={15} aria-hidden="true" />
        </button>

        <p className={styles.note}>{note || 'Haftalık olarak güncellenir.'}</p>

        <button
          type="button"
          className={styles.arrow}
          onClick={() => goTo(index + 1)}
          aria-label="Sonraki film"
        >
          <ChevronRight size={15} aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
