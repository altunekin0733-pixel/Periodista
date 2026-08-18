const TURKISH_MAP: Record<string, string> = {
  ç: 'c',
  Ç: 'c',
  ğ: 'g',
  Ğ: 'g',
  ı: 'i',
  I: 'i',
  İ: 'i',
  ö: 'o',
  Ö: 'o',
  ş: 's',
  Ş: 's',
  ü: 'u',
  Ü: 'u',
};

const MAX_SLUG_LENGTH = 90;

/**
 * Türkçe karakterleri ASCII karşılıklarına çevirip URL uyumlu bir slug üretir.
 * `İstanbul'da` -> `istanbulda`
 */
export function slugify(input: string, fallback = 'icerik'): string {
  const normalized = Array.from(input.trim())
    .map((char) => TURKISH_MAP[char] ?? char)
    .join('')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['’`]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  if (!normalized) return fallback;

  return normalized.slice(0, MAX_SLUG_LENGTH).replace(/-+$/g, '');
}

/**
 * `isExisting` ile çakışma kontrolü yaparak benzersiz slug üretir:
 * `baslik`, `baslik-2`, `baslik-3` ...
 */
export async function uniqueSlug(
  base: string,
  isExisting: (candidate: string) => Promise<boolean>,
  fallback = 'icerik',
): Promise<string> {
  const root = slugify(base, fallback);

  if (!(await isExisting(root))) return root;

  for (let suffix = 2; suffix < 200; suffix += 1) {
    const candidate = `${root}-${suffix}`;
    if (!(await isExisting(candidate))) return candidate;
  }

  return `${root}-${Date.now()}`;
}
