'use client';

import { ArrowDown, ArrowUp, Minus } from 'lucide-react';
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

const CHART_WIDTH = 200;
const CHART_HEIGHT = 40;

/** 0–1 aralığındaki noktaları SVG polyline'ına çevirir. */
function toPolyline(points: number[]): string {
  const step = points.length > 1 ? CHART_WIDTH / (points.length - 1) : 0;

  return points
    .map((point, index) => `${(index * step).toFixed(1)},${((1 - point) * CHART_HEIGHT).toFixed(1)}`)
    .join(' ');
}

function ChangeLabel({ label, value }: { label: string; value: number | null }) {
  if (value === null) {
    return (
      <span className={styles.changeSlot}>
        <span className={styles.changeLabel}>{label}</span>
        <span className={styles.changeMissing}>—</span>
      </span>
    );
  }

  const direction = value > 0 ? 'up' : value < 0 ? 'down' : 'flat';
  const Arrow = direction === 'up' ? ArrowUp : direction === 'down' ? ArrowDown : Minus;

  return (
    <span className={styles.changeSlot}>
      <span className={styles.changeLabel}>{label}</span>
      <span className={`${styles.changeValue} ${styles[direction]} tabular`}>
        <Arrow size={11} strokeWidth={2.5} aria-hidden="true" />
        {formatChange(value)}
      </span>
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

      {/* Bir satırın üzerine gelindiğinde o kalemin seyri burada belirir. */}
      <div className={styles.chart}>
        <div className={styles.chartHead}>
          <span className={styles.chartTitle}>{active.label}</span>
          <span className={`${styles.chartValue} tabular`}>{active.formatted}</span>
        </div>

        {trend ? (
          <svg
            className={styles.spark}
            viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
            preserveAspectRatio="none"
            role="img"
            aria-label={`${active.label} son 24 saatlik seyri`}
          >
            <polyline className={styles.sparkLine} points={toPolyline(trend.points)} />
          </svg>
        ) : (
          <p className={styles.sparkEmpty}>Saatlik seyir için geçmiş veri birikiyor.</p>
        )}

        <div className={styles.changes}>
          <ChangeLabel label="Son 1 saat" value={trend?.changeOneHour ?? null} />
          <ChangeLabel label="Son 24 saat" value={trend?.changeOneDay ?? null} />
        </div>
      </div>

      <ul className={panel.body}>
        {items.map((item) => (
          <li key={item.key}>
            <button
              type="button"
              className={`${styles.row} ${item.key === active.key ? styles.rowActive : ''}`}
              onMouseEnter={() => setActiveKey(item.key)}
              onFocus={() => setActiveKey(item.key)}
              aria-pressed={item.key === active.key}
            >
              <span className={styles.rowLabel}>{item.label}</span>
              <span className={`${styles.rowValue} tabular`}>{item.formatted}</span>
              <span className={`${styles.rowChange} ${styles[item.direction]} tabular`}>
                {item.direction === 'down' ? '−' : item.direction === 'up' ? '+' : ''}
                {formatChange(item.change)}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
