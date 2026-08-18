'use client';

import { useEffect, useState } from 'react';

import styles from './ReadingProgress.module.css';

/**
 * Okuma ilerleme çubuğu. Scroll dinleyicisi yerine rAF ile bir sonraki
 * boyama karesine kilitlenir; kaydırma sırasında düzen hesabı tetiklemez.
 */
export function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;

    function update() {
      frame = 0;

      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = scrollable > 0 ? window.scrollY / scrollable : 0;

      setProgress(Math.min(1, Math.max(0, ratio)));
    }

    function onScroll() {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    }

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <div className={styles.track} aria-hidden="true">
      <div className={styles.bar} style={{ transform: `scaleX(${progress})` }} />
    </div>
  );
}
