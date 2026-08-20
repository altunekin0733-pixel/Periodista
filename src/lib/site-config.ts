/** Ortamdan bağımsız, derleme zamanında bilinen site sabitleri. */
export const SITE = {
  name: 'Periodista',
  tagline: 'Gündemin nabzı',
  description:
    'Periodista; gündem, spor, dünya, ekonomi, teknoloji ve kültür-sanat başlıklarında güncel haberleri tek bir yerde toplar.',
  locale: 'tr_TR',
  language: 'tr',
} as const;

/**
 * Kanonik adres. Vercel'de otomatik gelen `VERCEL_PROJECT_PRODUCTION_URL`
 * kullanılır; kendi alan adınızı bağladığınızda `NEXT_PUBLIC_SITE_URL` ile
 * ezersiniz.
 */
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, '');

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;

  return 'http://localhost:3000';
}

export function absoluteUrl(path: string): string {
  return new URL(path, `${getSiteUrl()}/`).toString();
}

export const PAGE_SIZE = 12;

/**
 * Son dakika kuyruğunun uzunluğu. Yayınlanan her haber kuyruğun başına girer,
 * on beşinciden sonrası kendiliğinden düşer — panelden işaretleme yapılmaz.
 */
export const BREAKING_LIMIT = 15;

/** Kategori sayfasının tepesindeki karusele giren haber sayısı. */
export const CATEGORY_RAIL_LIMIT = 6;

export const SOCIAL_PLATFORMS = [
  { key: 'instagram', name: 'Instagram', placeholder: 'https://instagram.com/...' },
  { key: 'x', name: 'X', placeholder: 'https://x.com/...' },
  { key: 'youtube', name: 'YouTube', placeholder: 'https://youtube.com/@...' },
  { key: 'spotify', name: 'Spotify', placeholder: 'https://open.spotify.com/show/...' },
  { key: 'applemusic', name: 'Apple Music', placeholder: 'https://podcasts.apple.com/...' },
  { key: 'tiktok', name: 'TikTok', placeholder: 'https://tiktok.com/@...' },
  { key: 'telegram', name: 'Telegram', placeholder: 'https://t.me/...' },
  { key: 'facebook', name: 'Facebook', placeholder: 'https://facebook.com/...' },
  { key: 'linkedin', name: 'LinkedIn', placeholder: 'https://linkedin.com/company/...' },
] as const;

export type SocialKey = (typeof SOCIAL_PLATFORMS)[number]['key'];

export const CATEGORY_ICONS = [
  'newspaper',
  'sports_soccer',
  'public',
  'trending_up',
  'memory',
  'theater_comedy',
  'eco',
  'mic',
  'category',
  'star',
  'local_fire_department',
  'restaurant',
  'movie',
  'science',
  'gavel',
  'health_and_safety',
  'directions_car',
  'travel_explore',
  'school',
  'music_note',
] as const;

/**
 * Kategori içi dallar. Üst menüde yer almazlar; yalnızca kategori sayfasında
 * bir filtre şeridi olarak görünür ve habere aynı adla etiket verildiğinde
 * o dalın altında listelenir. `slug` etiket slug'ının birebir karşılığıdır.
 */
export const CATEGORY_SUBSECTIONS: Record<string, { slug: string; name: string }[]> = {
  spor: [
    { slug: 'futbol', name: 'Futbol' },
    { slug: 'voleybol', name: 'Voleybol' },
    { slug: 'basketbol', name: 'Basketbol' },
    { slug: 'formula-1', name: 'Formula 1' },
    { slug: 'motogp', name: 'MotoGP' },
    { slug: 'takim-sporlari', name: 'Takım Sporları' },
    { slug: 'olimpik-sporlar', name: 'Olimpik Sporlar' },
  ],
};

export function getSubsections(categorySlug: string): { slug: string; name: string }[] {
  return CATEGORY_SUBSECTIONS[categorySlug] ?? [];
}

/**
 * Altbilginin alt satırındaki kurumsal sayfalar. Adresleri `RESERVED_SLUGS`
 * içinde de yer alır; kategori slug'ı ile çakışamazlar.
 */
export const FOOTER_PAGES = [
  { slug: 'hakkimizda', title: 'Hakkımızda' },
  { slug: 'kunye', title: 'Künye' },
  { slug: 'iletisim', title: 'İletişim' },
  { slug: 'reklam', title: 'Reklam Ver' },
  { slug: 'cerez-politikasi', title: 'Çerez Politikası' },
  { slug: 'gizlilik-politikasi', title: 'Gizlilik Politikası' },
] as const;
