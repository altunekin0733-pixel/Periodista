'use client';

import { ArrowDown, ArrowUp } from 'lucide-react';
import { useEffect, useState } from 'react';

import { formatChange } from '@/lib/format';
import { fetchRates, type RateItem } from '@/lib/rates';

import styles from './MarketTicker.module.css';

/** Sekme uzun süre açık kalırsa veriyi tazele. */
const REFRESH_MS = 5 * 60 * 1000;

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

export function MarketTicker() {
  const [items, setItems] = useState<RateItem[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    let timer = 0;

    async function load() {
      const next = await fetchRates(controller.signal);

      if (!controller.signal.aborted) setItems(next);
    }

    void load();
    timer = window.setInterval(() => void load(), REFRESH_MS);

    return () => {
      controller.abort();
      window.clearInterval(timer);
    };
  }, []);

  // Veri gelmeden şerit hiç çizilmez; boş bir kutu düzeni bozmasın.
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
      </ul>

      <div className={styles.viewport} aria-hidden="true">
        <div className={styles.track}>
          {/* İkinci kopya kesintisiz döngü içindir. */}
          {[0, 1].map((copy) => (
            <div className={styles.group} key={copy}>
              {items.map((item) => (
                <RateChip key={`${copy}-${item.key}`} item={item} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
