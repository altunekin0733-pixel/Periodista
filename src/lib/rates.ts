import { formatRate } from './format';

export type RateDirection = 'up' | 'down' | 'flat';

export type RateItem = {
  key: string;
  label: string;
  formatted: string;
  change: number;
  direction: RateDirection;
};

/** Ticker'da hangi kalemler, hangi sırayla ve kaç ondalıkla görünecek. */
const TICKER_SPEC = [
  { key: 'USD', label: 'USD/TRY', digits: 2 },
  { key: 'EUR', label: 'EUR/TRY', digits: 2 },
  { key: 'GBP', label: 'GBP/TRY', digits: 2 },
  { key: 'CHF', label: 'CHF/TRY', digits: 2 },
  { key: 'JPY', label: 'JPY/TRY', digits: 4 },
  { key: 'GRA', label: 'Gram Altın', digits: 2 },
  { key: 'CEYREKALTIN', label: 'Çeyrek Altın', digits: 2 },
  { key: 'GUMUS', label: 'Gram Gümüş', digits: 2 },
  { key: 'XU100', label: 'BIST 100', digits: 2 },
] as const;

const SOURCE_URL = 'https://finans.truncgil.com/v4/today.json';
const FETCH_TIMEOUT_MS = 8000;

function toDirection(change: number): RateDirection {
  if (change > 0) return 'up';
  if (change < 0) return 'down';

  return 'flat';
}

function readNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : null;
}

/**
 * Piyasa verisi tarayıcıdan çekilir — statik sitede sunucu yoktur.
 * Kaynak CORS'a izin verdiği için doğrudan çağrılabilir; erişilemezse
 * şerit hiç gösterilmez (yanlış veri göstermektense boş bırakmak yeğdir).
 */
export async function fetchRates(signal?: AbortSignal): Promise<RateItem[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  signal?.addEventListener('abort', () => controller.abort(), { once: true });

  try {
    const response = await fetch(SOURCE_URL, { signal: controller.signal });

    if (!response.ok) return [];

    const payload: unknown = await response.json();

    if (typeof payload !== 'object' || payload === null) return [];

    const record = payload as Record<string, unknown>;
    const items: RateItem[] = [];

    for (const spec of TICKER_SPEC) {
      const entry = record[spec.key];

      if (typeof entry !== 'object' || entry === null) continue;

      const fields = entry as Record<string, unknown>;
      const value = readNumber(fields.Selling) ?? readNumber(fields.Buying);

      if (value === null) continue;

      const change = typeof fields.Change === 'number' ? fields.Change : 0;

      items.push({
        key: spec.key,
        label: spec.label,
        formatted: formatRate(value, spec.digits),
        change,
        direction: toDirection(change),
      });
    }

    return items;
  } catch {
    return [];
  } finally {
    clearTimeout(timer);
  }
}
