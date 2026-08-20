import { z } from 'zod';

import { prisma } from './prisma';
import type { RateItem } from './rates';

/**
 * Kaynak servis yalnızca günlük değişimi veriyor; "son 1 saat" ve saat saat
 * seyir için kendi geçmişimizi tutuyoruz. Yeni tablo açmamak için örnekler
 * `Setting` tablosunda tek bir JSON satırında, döner tampon olarak durur.
 */
const HISTORY_KEY = 'piyasa-gecmisi';

/** Yeni örnek bu aralıktan sık yazılmaz. */
const SAMPLE_INTERVAL_MS = 15 * 60_000;

/** 15 dakikalık örneklerle yaklaşık 24 saat. */
const MAX_SAMPLES = 96;

const HOUR_MS = 60 * 60_000;
const DAY_MS = 24 * HOUR_MS;

const sampleSchema = z.object({
  at: z.string(),
  values: z.record(z.string(), z.number()),
});

const historySchema = z.object({ samples: z.array(sampleSchema).default([]) });

export type RateSample = z.infer<typeof sampleSchema>;

export type RateTrend = {
  /** Eskiden yeniye, 0–1 aralığına ölçeklenmiş seyir. En az iki nokta olur. */
  points: number[];
  /** Yüzde değişim; geçmişte karşılaştıracak örnek yoksa `null`. */
  changeOneHour: number | null;
  changeOneDay: number | null;
};

export async function getRateHistory(): Promise<RateSample[]> {
  try {
    const row = await prisma.setting.findUnique({ where: { key: HISTORY_KEY } });
    if (!row) return [];

    const parsed = historySchema.safeParse(row.value);

    return parsed.success ? parsed.data.samples : [];
  } catch {
    // Geçmiş okunamazsa grafik gizlenir; sayfanın kalanı etkilenmez.
    return [];
  }
}

/**
 * Güncel değerleri geçmişe ekler. Son örnek yeterince yeniyse hiçbir şey
 * yazılmaz, böylece her sayfa üretimi veritabanına yazmaz.
 */
export async function recordRateSample(items: RateItem[]): Promise<void> {
  if (items.length === 0) return;

  const samples = await getRateHistory();
  const newest = samples.at(-1);

  if (newest && Date.now() - new Date(newest.at).getTime() < SAMPLE_INTERVAL_MS) return;

  const values: Record<string, number> = {};
  for (const item of items) values[item.key] = item.value;

  const next = [...samples, { at: new Date().toISOString(), values }].slice(-MAX_SAMPLES);

  try {
    await prisma.setting.upsert({
      where: { key: HISTORY_KEY },
      create: { key: HISTORY_KEY, value: { samples: next } },
      update: { value: { samples: next } },
    });
  } catch {
    // Geçmiş yazımı okuma deneyimini etkilememeli.
  }
}

/** Bir kalemin geçmişteki seyri; iki örnekten azsa `null`. */
export function buildTrend(samples: RateSample[], key: string, current: number): RateTrend | null {
  const series = samples
    .filter((sample) => typeof sample.values[key] === 'number')
    .map((sample) => ({ at: new Date(sample.at).getTime(), value: sample.values[key] }));

  if (series.length < 2) return null;

  const values = [...series.map((point) => point.value), current];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min;

  return {
    // Tümü aynıysa düz çizgi: ortadan geçsin.
    points: values.map((value) => (span === 0 ? 0.5 : (value - min) / span)),
    changeOneHour: percentSince(series, current, HOUR_MS),
    changeOneDay: percentSince(series, current, DAY_MS),
  };
}

/** `agoMs` kadar öncesine en yakın örneğe göre yüzde değişim. */
function percentSince(
  series: { at: number; value: number }[],
  current: number,
  agoMs: number,
): number | null {
  const target = Date.now() - agoMs;
  const candidates = series.filter((point) => point.at <= target);
  const reference = candidates.at(-1);

  if (!reference || reference.value <= 0) return null;

  return ((current - reference.value) / reference.value) * 100;
}
