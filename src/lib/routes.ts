/**
 * Haber adresleri Google News'in beklediği `/kategori/haber-basligi` biçimindedir.
 * Kategori slug'ı kök seviyede yer aldığı için aşağıdaki adlar rezerve edilir;
 * kategori oluştururken bu listeye karşı kontrol yapılır.
 */
export const RESERVED_SLUGS = new Set([
  'admin',
  'api',
  'arama',
  'etiket',
  'giris',
  'rss.xml',
  'sitemap.xml',
  'robots.txt',
  'marka',
  '_next',
  'favicon.ico',
  'opengraph-image',
]);

export function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS.has(slug);
}

export function articleHref(categorySlug: string, articleSlug: string): string {
  return `/${categorySlug}/${articleSlug}`;
}

export function categoryHref(slug: string): string {
  return `/${slug}`;
}

export function tagHref(slug: string): string {
  return `/etiket/${slug}`;
}

export function searchHref(query: string): string {
  return `/arama?q=${encodeURIComponent(query)}`;
}

/** `?sayfa=2` — birinci sayfada parametre eklenmez (kanonik adres tekilleşir). */
export function pageHref(basePath: string, page: number, extraParams?: Record<string, string>): string {
  const params = new URLSearchParams(extraParams);

  if (page > 1) params.set('sayfa', String(page));

  const query = params.toString();

  return query ? `${basePath}?${query}` : basePath;
}

export function parsePageParam(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number.parseInt(raw ?? '1', 10);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}
