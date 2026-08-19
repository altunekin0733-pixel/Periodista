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
  /** Verinin kaynakta güncellendiği an (ISO). */
  updatedAt: string | null;
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
const FETCH_TIMEOUT_MS = 10_000;
const MAX_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1500;

function toDirection(change: number): RateDirection {
  if (change > 0) return 'up';
  if (change < 0) return 'down';

  return 'flat';
}

function readNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : null;
}

/** `2026-08-19 03:06:02` biçimini Istanbul saati kabul ederek ISO'ya çevirir. */
function parseUpdateDate(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;

  const parsed = new Date(`${raw.replace(' ', 'T')}+03:00`);

  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function parse(payload: unknown): RatesSnapshot {
  if (typeof payload !== 'object' || payload === null) return { items: [], updatedAt: null };

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

  return { items, updatedAt: parseUpdateDate(record.Update_Date) };
}

/**
 * Piyasa verisi DERLEME ANINDA çekilir, tarayıcıdan değil.
 *
 * Kaynak sunucu HTTP/2 akışını hatalı kapattığı için tarayıcı isteklerini
 * `ERR_HTTP2_PROTOCOL_ERROR` ile düşürüyor; Node tarafında aynı istek sorunsuz
 * çalışıyor. Bu yüzden veri statik HTML'e gömülür ve zamanlanmış yeniden
 * derlemeyle tazelenir (bkz. .github/workflows/pages.yml).
 *
 * Yan fayda: şerit ilk boyamada hazır gelir, sonradan belirip düzeni itmez.
 */
export async function getRates(): Promise<RatesSnapshot> {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      const response = await fetch(SOURCE_URL, {
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
        headers: { accept: 'application/json' },
      });

      if (response.ok) {
        // Gövde bazen yarım geliyor; metni alıp ayrıştırarak hatayı yakalıyoruz.
        const snapshot = parse(JSON.parse(await response.text()));

        if (snapshot.items.length > 0) return snapshot;
      }
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'bilinmeyen hata';
      console.warn(`Piyasa verisi alınamadı (deneme ${attempt}/${MAX_ATTEMPTS}): ${reason}`);
    }

    if (attempt < MAX_ATTEMPTS) {
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    }
  }

  // Veri yoksa şerit hiç çizilmez — eski ya da yanlış değer göstermeyiz.
  console.warn('Piyasa şeridi bu derlemede veri olmadan yayınlanıyor.');

  return { items: [], updatedAt: null };
}
