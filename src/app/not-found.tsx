import Link from 'next/link';

import { SiteChrome } from '@/components/site/SiteChrome';

import styles from './not-found.module.css';

export const metadata = {
  title: 'Sayfa bulunamadı',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <SiteChrome>
      <div className="container">
        <div className={styles.wrapper}>
          <p className={styles.code}>404</p>
          <h1 className={styles.title}>Aradığınız sayfa bulunamadı</h1>
          <p className={styles.text}>
            Bağlantı değişmiş veya haber yayından kaldırılmış olabilir.
          </p>

          <div className={styles.actions}>
            <Link href="/" className={styles.primary}>
              Ana sayfaya dön
            </Link>
            <Link href="/arama" className={styles.secondary}>
              Haber ara
            </Link>
          </div>
        </div>
      </div>
    </SiteChrome>
  );
}
