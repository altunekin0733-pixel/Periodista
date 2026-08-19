import { ArrowDown, ArrowUp } from 'lucide-react';

import { formatChange, formatTimeOfDay } from '@/lib/format';
import { getRates, type RateItem } from '@/lib/rates';

import styles from './MarketTicker.module.css';

function RateChip({ item }: { item: RateItem }) {
  const Arrow = item.direction === 'up' ? ArrowUp : ArrowDown;

  return (
    <span className={styles.chip}>
      <span className={styles.label}>{item.label}</span>
      <span className={`${styles.value} tabular`}>{item.formatted}</span>
      {item.direction !== 'flat' && (
        <span className={`${styles.change} ${styles[item.direction]} tabular`}>
          <Arrow size={12} strokeWidth={2.5} aria-hidden="true" />
          {formatChange(item.change)}
        </span>
      )}
    </span>
  );
}

/**
 * Veriler derleme anında gömülür; şerit ilk boyamada hazırdır ve sayfayı
 * sonradan itmez. Tazeleme, zamanlanmış yeniden derlemeyle olur.
 */
export function MarketTicker() {
  const { items, updatedAt } = getRates();

  if (items.length === 0) return null;

  return (
    <section className={styles.ticker} aria-label="Piyasa verileri">
      {/* Ekran okuyucular için kaydırmayan, tek kopya bir özet. */}
      <ul className="visually-hidden">
        {items.map((item) => (
          <li key={item.key}>
            {item.label}: {item.formatted}
          </li>
        ))}
        {updatedAt && <li>Son güncelleme: {formatTimeOfDay(updatedAt)}</li>}
      </ul>

      <div className={styles.viewport} aria-hidden="true">
        <div className={styles.track}>
          {/* İkinci kopya kesintisiz döngü içindir. */}
          {[0, 1].map((copy) => (
            <div className={styles.group} key={copy}>
              {items.map((item) => (
                <RateChip key={`${copy}-${item.key}`} item={item} />
              ))}
              {updatedAt && (
                <span className={styles.chip}>
                  <span className={styles.stamp}>{formatTimeOfDay(updatedAt)} itibarıyla</span>
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
