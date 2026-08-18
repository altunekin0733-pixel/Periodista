'use client';

import { Moon, Sun } from 'lucide-react';
import { useSyncExternalStore } from 'react';

import styles from './ThemeToggle.module.css';

const STORAGE_KEY = 'periodista-theme';

type Theme = 'dark' | 'light';

/**
 * Tema, `<html data-theme>` özniteliğinde yaşar — tek doğruluk kaynağı DOM'dur.
 * Bunu bir dış depo gibi okuyoruz; böylece sayfadaki birden fazla düğme
 * (site başlığı ve yönetim kenar çubuğu) kendiliğinden eşleşir.
 */
function subscribe(onChange: () => void): () => void {
  const observer = new MutationObserver(onChange);

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  });

  return () => observer.disconnect();
}

function getSnapshot(): Theme {
  return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
}

/** Sunucuda koyu tema varsayılır; tasarımın varsayılanı budur. */
function getServerSnapshot(): Theme {
  return 'dark';
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  function toggle() {
    const next: Theme = getSnapshot() === 'dark' ? 'light' : 'dark';

    document.documentElement.setAttribute('data-theme', next);

    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Gizli sekmede localStorage kapalı olabilir; tema yine de bu oturumda çalışır.
    }
  }

  const label = theme === 'light' ? 'Koyu temaya geç' : 'Açık temaya geç';

  return (
    <button
      type="button"
      onClick={toggle}
      className={styles.button}
      aria-label={label}
      title={label}
    >
      <Sun size={17} className={styles.sun} aria-hidden="true" />
      <Moon size={17} className={styles.moon} aria-hidden="true" />
    </button>
  );
}
