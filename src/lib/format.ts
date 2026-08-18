const TIME_ZONE = 'Europe/Istanbul';
const LOCALE = 'tr-TR';

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** `18 Ağu` — kart ve liste satırları için kısa tarih */
export function formatShortDate(value: Date | string): string {
  return new Intl.DateTimeFormat(LOCALE, {
    day: '2-digit',
    month: 'short',
    timeZone: TIME_ZONE,
  }).format(new Date(value));
}

/** `18 Ağustos 2026, 11:10` — haber detayı künyesi */
export function formatLongDate(value: Date | string): string {
  return new Intl.DateTimeFormat(LOCALE, {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: TIME_ZONE,
  }).format(new Date(value));
}

/** `18 Ağu 2026` — kategori ve yönetim listeleri */
export function formatMediumDate(value: Date | string): string {
  return new Intl.DateTimeFormat(LOCALE, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: TIME_ZONE,
  }).format(new Date(value));
}

/** `3 saat önce` — son dakika şeridi ve yorumlar için */
export function formatRelativeTime(value: Date | string, now: Date = new Date()): string {
  const target = new Date(value);
  const diff = now.getTime() - target.getTime();

  if (diff < MINUTE) return 'az önce';
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)} dakika önce`;
  if (diff < DAY) return `${Math.floor(diff / HOUR)} saat önce`;
  if (diff < 7 * DAY) return `${Math.floor(diff / DAY)} gün önce`;

  return formatMediumDate(target);
}

/** Piyasa değerleri: `47,91` / `6.708,11` */
export function formatRate(value: number, fractionDigits = 2): string {
  return new Intl.NumberFormat(LOCALE, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

/** Yüzde değişim: `%0,03` */
export function formatChange(value: number): string {
  return `%${new Intl.NumberFormat(LOCALE, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(value))}`;
}

export function formatCount(value: number): string {
  return new Intl.NumberFormat(LOCALE).format(value);
}

/** ISO 8601 — `<time dateTime>` ve JSON-LD için */
export function toIsoString(value: Date | string): string {
  return new Date(value).toISOString();
}
