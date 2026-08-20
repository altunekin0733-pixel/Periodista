'use client';

import { ArrowDown, ArrowUp } from 'lucide-react';
import { useState } from 'react';

import { formatChange } from '@/lib/format';
import type { RateTrend } from '@/lib/rate-history';
import type { RateItem } from '@/lib/rates';

import panel from './side-panel.module.css';
import styles from './MarketPanel.module.css';

type MarketPanelProps = {
  items: RateItem[];
  /** Kalem anahtarı -> seyir. Yeterli geçmiş yoksa değer `null` olur. */
  trends: Record<string, RateTrend | null>;
  updatedLabel: string;
};

const CHART_WIDTH = 240;
const CHART_HEIGHT = 44;

/** 0–1 aralığındaki noktaları SVG polyline'ına çevirir. */
function toPolyline(points: number[]): string {
  const step = points.length > 1 ? CHART_WIDTH / (points.length - 1) : 0;

  return points
    .map((point, index) => `${(index * step).toFixed(1)},${((1 - point) * CHART_HEIGHT).toFixed(1)}`)
    .join(' ');
}

function directionOf(value: number): 'up' | 'down' | 'flat' {
  if (value > 0) return 'up';
  if (value < 0) return 'down';

  return 'flat';
}

/** Yüzde değişim rozeti. `flat` durumda ok gösterilmez. */
function ChangeBadge({ value, size = 'sm' }: { value: number; size?: 'sm' | 'lg' }) {
  const direction = directionOf(value);
  const Arrow = direction === 'up' ? ArrowUp : ArrowDown;

  return (
    <span
      className={`${styles.badge} ${styles[direction]} ${size === 'lg' ? styles.badgeLarge : ''} tabular`}
    >
      {direction !== 'flat' && <Arrow size={size === 'lg' ? 13 : 11} strokeWidth={2.5} aria-hidden="true" />}
      {formatChange(value)}
    </span>
  );
}

export function MarketPanel({ items, trends, updatedLabel }: MarketPanelProps) {
  const [activeKey, setActiveKey] = useState(items[0]?.key ?? '');

  if (items.length === 0) return null;

  const active = items.find((item) => item.key === activeKey) ?? items[0];
  const trend = trends[active.key] ?? null;

  return (
    <section className={panel.panel} aria-labelledby="piyasa-paneli-baslik">
      <header className={panel.header}>
        <h2 id="piyasa-paneli-baslik" className="label-caps">
          Piyasalar
        </h2>
        <span className={panel.meta}>{updatedLabel}</span>
      </header>

      {/* Bir satırın üzerine gelindiğinde o kalem burada açılır. */}
      <div className={styles.featured}>
        <div className={styles.featuredHead}>
          <span className={styles.featuredLabel}>{active.label}</span>
          <span className={styles.featuredDay}>
            <span className={styles.dayCaption}>Günlük</span>
            <ChangeBadge value={active.change} />
          </span>
        </div>

        <p className={`${styles.featuredValue} tabular`}>{active.formatted}</p>

        {trend ? (
          <>
            <svg
              className={styles.spark}
              viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
              preserveAspectRatio="none"
              role="img"
              aria-label={`${active.label} son 24 saatlik seyri`}
            >
              <polyline className={styles.sparkLine} points={toPolyline(trend.points)} />
            </svg>

            <div className={styles.spans}>
              {trend.changeOneHour !== null && (
                <span className={styles.span}>
                  <span className={styles.spanCaption}>1 saat</span>
                  <ChangeBadge value={trend.changeOneHour} />
                </span>
              )}
              {trend.changeOneDay !== null && (
                <span className={styles.span}>
                  <span className={styles.spanCaption}>24 saat</span>
                  <ChangeBadge value={trend.changeOneDay} />
                </span>
              )}
            </div>
          </>
        ) : (
          <p className={styles.pending}>Saatlik seyir grafiği veri biriktikçe açılır.</p>
        )}
      </div>

      <ul className={panel.body}>
        {items.map((item) => (
          <li key={item.key}>
            <button
              type="button"
              className={`${styles.row} ${item.key === active.key ? styles.rowActive : ''}`}
              onMouseEnter={() => setActiveKey(item.key)}
              onFocus={() => setActiveKey(item.key)}
              onClick={() => setActiveKey(item.key)}
              aria-pressed={item.key === active.key}
            >
              <span className={styles.rowLabel}>{item.label}</span>
              <span className={`${styles.rowValue} tabular`}>{item.formatted}</span>
              <ChangeBadge value={item.change} />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
