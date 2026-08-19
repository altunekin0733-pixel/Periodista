import { readFileSync } from 'node:fs';
import path from 'node:path';

import { z } from 'zod';

import { formatRate } from './format';

export type RateDirection = 'up' | 'down' | 'flat';

export type RateItem = {
  key: string;
  label: string;
  formatted: string;
  change: number;
  direction: RateDirection;
};

export type RatesSnapshot = {
  items: RateItem[];
  updatedAt: string | null;
};

const SNAPSHOT_PATH = path.join(process.cwd(), 'content', 'piyasa.json');

const snapshotSchema = z.object({
  updatedAt: z.string(),
  items: z
    .array(
      z.object({
        key: z.string(),
        label: z.string(),
        value: z.number(),
        digits: z.number().int().min(0).max(6),
        change: z.number(),
      }),
    )
    .min(1),
});

function toDirection(change: number): RateDirection {
  if (change > 0) return 'up';
  if (change < 0) return 'down';

  return 'flat';
}

/**
 * Piyasa verisi derleme sırasında ağdan çekilmez; `content/piyasa.json`
 * dosyasından okunur.
 *
 * Kaynak servis yanıtı rastgele bozuk döndürebiliyor. Veri doğrudan derlemede
 * çekilseydi, kötü bir ana denk gelen her yayın şeridi siteden silerdi —
 * nitekim bir kez oldu. Dosyayı ayrı bir zamanlanmış iş güncelliyor
 * (scripts/piyasa-guncelle.mjs) ve yalnızca geçerli veri aldığında yazıyor;
 * böylece site her zaman son iyi bilinen değerlerle yayında kalıyor.
 */
export function getRates(): RatesSnapshot {
  try {
    const parsed = snapshotSchema.parse(JSON.parse(readFileSync(SNAPSHOT_PATH, 'utf8')));

    return {
      updatedAt: parsed.updatedAt,
      items: parsed.items.map((item) => ({
        key: item.key,
        label: item.label,
        formatted: formatRate(item.value, item.digits),
        change: item.change,
        direction: toDirection(item.change),
      })),
    };
  } catch {
    // Dosya yoksa ya da bozuksa şerit çizilmez.
    return { items: [], updatedAt: null };
  }
}
