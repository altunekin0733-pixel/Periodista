import { z } from 'zod';

import { formatRate } from './format';

export type RateDirection = 'up' | 'down' | 'flat';

export type RateItem = {
  key: string;
  label: string;
  value: number;
  formatted: string;
  change: number;
  direction: RateDirection;
};

export type RatesSnapshot = {
  items: RateItem[];
  updatedAt: string;
  source: 'truncgil' | 'tcmb' | 'fallback';
};

export type Instrument = { key: string; label: string; digits: number };

/** Şeritte hangi kalemler, hangi sırayla ve kaç ondalıkla görünecek. */
export const TICKER_SPEC: Instrument[] = [
  { key: 'USD', label: 'USD/TRY', digits: 2 },
  { key: 'EUR', label: 'EUR/TRY', digits: 2 },
  { key: 'GBP', label: 'GBP/TRY', digits: 2 },
  { key: 'CHF', label: 'CHF/TRY', digits: 2 },
  { key: 'JPY', label: 'JPY/TRY', digits: 4 },
  { key: 'GRA', label: 'Gram Altın', digits: 2 },
  { key: 'CEYREKALTIN', label: 'Çeyrek Altın', digits: 2 },
  { key: 'GUMUS', label: 'Gram Gümüş', digits: 2 },
  { key: 'XU100', label: 'BIST 100', digits: 2 },
];

/** Ekonomi kategorisindeki panelde görünen kalemler. */
export const PANEL_SPEC: Instrument[] = [
  { key: 'USD', label: 'Dolar', digits: 2 },
  { key: 'EUR', label: 'Euro', digits: 2 },
  { key: 'GBP', label: 'Sterlin', digits: 2 },
  { key: 'JPY', label: 'Yen', digits: 4 },
  { key: 'CNY', label: 'Yuan', digits: 4 },
  { key: 'GRA', label: 'Gram Altın', digits: 2 },
  { key: 'CEYREKALTIN', label: 'Çeyrek Altın', digits: 2 },
  { key: 'YARIMALTIN', label: 'Yarım Altın', digits: 2 },
  { key: 'CUMHURIYETALTINI', label: 'Cumhuriyet Altını', digits: 2 },
  { key: 'XU100', label: 'BIST 100', digits: 2 },
];

const REVALIDATE_SECONDS = 300; // 5 dakika
const FETCH_TIMEOUT_MS = 6000;

const truncgilEntrySchema = z.object({
  Buying: z.number().optional(),
  Selling: z.number().optional(),
  Change: z.number().optional(),
});

const truncgilSchema = z.object({ Update_Date: z.string().optional() }).catchall(z.unknown());

/**
 * Son çare: dış servislerin hepsi düşerse ticker boş kalmasın diye kullanılan
 * gösterge değerler. `source: 'fallback'` ile işaretlenir, arayüzde "veri
 * alınamadı" durumu buradan ayırt edilir.
 */
const FALLBACK: RatesSnapshot = {
  source: 'fallback',
  updatedAt: new Date(0).toISOString(),
  items: [
    { key: 'USD', label: 'USD/TRY', value: 0, formatted: '—', change: 0, direction: 'flat' },
    { key: 'EUR', label: 'EUR/TRY', value: 0, formatted: '—', change: 0, direction: 'flat' },
    { key: 'GRA', label: 'Gram Altın', value: 0, formatted: '—', change: 0, direction: 'flat' },
    { key: 'XU100', label: 'BIST 100', value: 0, formatted: '—', change: 0, direction: 'flat' },
  ],
};

/**
 * Truncgil JPY'yi yüz kat küçük yayımlıyor: 1 yen ≈ 0,30 TL iken 0,0030 yazıyor.
 * Diğer para birimlerinde böyle bir sapma yok. Sağlayıcı düzeltirse kuralın
 * kendiliğinden devre dışı kalması için ölçek sabit değil, aynı yanıttaki USD
 * kuruna göre makullük kontrolüyle uygulanır.
 */
const MAX_PLAUSIBLE_USD_JPY = 1000;

function normalizeJpy(value: number, usdTry: number): number {
  if (usdTry <= 0 || value <= 0) return value;

  return usdTry / value > MAX_PLAUSIBLE_USD_JPY ? value * 100 : value;
}

function toDirection(change: number): RateDirection {
  if (change > 0) return 'up';
  if (change < 0) return 'down';

  return 'flat';
}

async function fetchWithTimeout(url: string, revalidate: number): Promise<Response> {
  return fetch(url, {
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    headers: { accept: 'application/json, text/xml, */*' },
    next: { revalidate },
  });
}

async function fetchFromTruncgil(spec: Instrument[]): Promise<RatesSnapshot | null> {
  try {
    const response = await fetchWithTimeout('https://finans.truncgil.com/v4/today.json', REVALIDATE_SECONDS);
    if (!response.ok) return null;

    const parsed = truncgilSchema.safeParse(await response.json());
    if (!parsed.success) return null;

    const payload = parsed.data;
    const items: RateItem[] = [];

    const usd = truncgilEntrySchema.safeParse(payload.USD);
    const usdTry = usd.success ? (usd.data.Selling ?? usd.data.Buying ?? 0) : 0;

    for (const item of spec) {
      const entry = truncgilEntrySchema.safeParse(payload[item.key]);
      if (!entry.success) continue;

      const raw = entry.data.Selling ?? entry.data.Buying;
      if (typeof raw !== 'number' || raw <= 0) continue;

      const value = item.key === 'JPY' ? normalizeJpy(raw, usdTry) : raw;
      const change = entry.data.Change ?? 0;

      items.push({
        key: item.key,
        label: item.label,
        value,
        formatted: formatRate(value, item.digits),
        change,
        direction: toDirection(change),
      });
    }

    if (items.length === 0) return null;

    return {
      items,
      updatedAt: parseTruncgilDate(payload.Update_Date),
      source: 'truncgil',
    };
  } catch {
    return null;
  }
}

/** `2026-08-18 22:00:02` biçimini Istanbul saati kabul ederek ISO'ya çevirir. */
function parseTruncgilDate(raw: string | undefined): string {
  if (!raw) return new Date().toISOString();

  const parsed = new Date(raw.replace(' ', 'T') + '+03:00');

  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
}

/** TCMB yedeği: yalnızca döviz kurları var, altın ve endeks yok. */
async function fetchFromTcmb(spec: Instrument[]): Promise<RatesSnapshot | null> {
  try {
    const response = await fetchWithTimeout('https://www.tcmb.gov.tr/kurlar/today.xml', REVALIDATE_SECONDS);
    if (!response.ok) return null;

    const xml = await response.text();
    const items: RateItem[] = [];

    for (const item of spec) {
      const block = xml.match(new RegExp(`<Currency[^>]*Kod="${item.key}"[\\s\\S]*?</Currency>`, 'i'));
      if (!block) continue;

      const selling = block[0].match(/<ForexSelling>([\d.]+)<\/ForexSelling>/);
      const unit = block[0].match(/<Unit>(\d+)<\/Unit>/);
      if (!selling) continue;

      const raw = Number(selling[1]);
      const perUnit = Number(unit?.[1] ?? '1') || 1;
      const value = raw / perUnit;
      if (!Number.isFinite(value) || value <= 0) continue;

      items.push({
        key: item.key,
        label: item.label,
        value,
        formatted: formatRate(value, item.digits),
        change: 0,
        direction: 'flat',
      });
    }

    if (items.length === 0) return null;

    return { items, updatedAt: new Date().toISOString(), source: 'tcmb' };
  } catch {
    return null;
  }
}

/**
 * Piyasa verisi. Next fetch önbelleği sayesinde 5 dakikada bir yenilenir;
 * her istek dış servise gitmez. Aynı adres iki kalem listesi için de
 * kullanıldığından ikinci çağrı önbellekten döner.
 */
export async function getRates(spec: Instrument[] = TICKER_SPEC): Promise<RatesSnapshot> {
  const primary = await fetchFromTruncgil(spec);
  if (primary) return primary;

  const secondary = await fetchFromTcmb(spec);
  if (secondary) return secondary;

  return FALLBACK;
}
