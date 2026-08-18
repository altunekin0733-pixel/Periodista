/** Ortamdan bağımsız, derleme zamanında bilinen site sabitleri. */
export const SITE = {
  name: 'Periodista',
  tagline: 'Günün öne çıkan gelişmeleri, tek yerde.',
  description:
    'Periodista; gündem, spor, dünya, ekonomi, teknoloji ve kültür-sanat başlıklarında güncel haberleri tek bir yerde toplar.',
  locale: 'tr_TR',
  language: 'tr',
} as const;

/**
 * GitHub Pages proje sitesinde adresler `/Periodista` ön ekiyle yayınlanır.
 * `<Link>` ve `next/image` bu ön eki kendiliğinden ekler; kanonik adres,
 * site haritası ve RSS gibi tam adres üreten yerlerde elle eklenmesi gerekir.
 */
export const BASE_PATH = (process.env.NEXT_PUBLIC_BASE_PATH ?? '').replace(/\/$/, '');

/** Şemayla birlikte alan adı — ön ek içermez. Örn. `https://ornek.github.io` */
export function getSiteOrigin(): string {
  return (process.env.NEXT_PUBLIC_SITE_ORIGIN ?? 'http://localhost:3000').replace(/\/$/, '');
}

/**
 * Tam adres üretir: `https://ornek.github.io` + `/Periodista` + `/gundem`
 *
 * `new URL()` kullanılmaz; mutlak bir yol verildiğinde temel adresteki
 * `/Periodista` ön ekini silerdi.
 */
export function absoluteUrl(path: string): string {
  const suffix = path.startsWith('/') ? path : `/${path}`;

  return `${getSiteOrigin()}${BASE_PATH}${suffix}`;
}

export const SOCIAL_PLATFORMS = [
  { key: 'instagram', name: 'Instagram' },
  { key: 'x', name: 'X' },
  { key: 'youtube', name: 'YouTube' },
  { key: 'tiktok', name: 'TikTok' },
  { key: 'telegram', name: 'Telegram' },
  { key: 'facebook', name: 'Facebook' },
  { key: 'linkedin', name: 'LinkedIn' },
] as const;

export type SocialKey = (typeof SOCIAL_PLATFORMS)[number]['key'];
