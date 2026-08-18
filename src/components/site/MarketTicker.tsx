import { ArrowDown, ArrowUp, Minus } from 'lucide-react';

import { formatChange } from '@/lib/format';
import { getRates, type RateItem } from '@/lib/rates';

import styles from './MarketTicker.module.css';

function RateChip({ item }: { item: RateItem }) {
  const Arrow = item.direction === 'up' ? ArrowUp : item.direction === 'down' ? ArrowDown : Minus;

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

export async function MarketTicker() {
  const rates = await getRates();

  if (rates.source === 'fallback') return null;

  return (
    <section className={styles.ticker} aria-label="Piyasa verileri">
      {/* Ekran okuyucular için kaydırmayan, tek kopya bir özet. */}
      <ul className="visually-hidden">
        {rates.items.map((item) => (
          <li key={item.key}>
            {item.label}: {item.formatted}
          </li>
        ))}
      </ul>

      <div className={styles.viewport} aria-hidden="true">
        <div className={styles.track}>
          {/* İkinci kopya kesintisiz döngü içindir. */}
          {[0, 1].map((copy) => (
            <div className={styles.group} key={copy}>
              {rates.items.map((item) => (
                <RateChip key={`${copy}-${item.key}`} item={item} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
