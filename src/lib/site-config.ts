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

export const SOCIAL_PLATFORMS = [
  { key: 'instagram', name: 'Instagram', placeholder: 'https://instagram.com/...' },
  { key: 'x', name: 'X', placeholder: 'https://x.com/...' },
  { key: 'youtube', name: 'YouTube', placeholder: 'https://youtube.com/@...' },
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
