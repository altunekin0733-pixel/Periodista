'use client';

import { useEffect, useState } from 'react';

import styles from './ReadingProgress.module.css';

/**
 * Okuma ilerleme çubuğu. Scroll dinleyicisi yerine rAF ile bir sonraki
 * boyama karesine kilitlenir; kaydırma sırasında düzen hesabı tetiklemez.
 *
 * `targetId` verildiğinde ilerleme yalnızca o bölümün içinde ölçülür. Haber
 * sayfasında altta kesintisiz akış büyüdüğü için belge yüksekliği ölçüt
 * olamaz: çubuk okuyucu ilerledikçe geri gider.
 */
export function ReadingProgress({ targetId }: { targetId?: string }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;

    function ratioWithin(element: HTMLElement): number {
      const rect = element.getBoundingClientRect();
      const scrollable = rect.height - window.innerHeight;

      if (scrollable <= 0) return rect.bottom <= window.innerHeight ? 1 : 0;

      return -rect.top / scrollable;
    }

    function update() {
      frame = 0;

      const target = targetId ? document.getElementById(targetId) : null;

      const ratio = target
        ? ratioWithin(target)
        : (() => {
            const scrollable = document.documentElement.scrollHeight - window.innerHeight;

            return scrollable > 0 ? window.scrollY / scrollable : 0;
          })();

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
  }, [targetId]);

  return (
    <div className={styles.track} aria-hidden="true">
      <div className={styles.bar} style={{ transform: `scaleX(${progress})` }} />
    </div>
  );
}
