import { put } from '@vercel/blob';

import { slugify } from './slug';

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024; // 8 MB
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'] as const;

const EXTENSION_BY_TYPE: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
};

export type UploadResult = { url: string; contentType: string; size: number };

export class UploadError extends Error {}

/**
 * Vercel'de önerilen kimlik doğrulama OIDC'dir; uzun ömürlü statik token
 * tutmaya gerek kalmaz. Ancak token'ın nereden geldiği çalışma bağlamına göre
 * değişir:
 *
 *  - Derleme sırasında  → `process.env.VERCEL_OIDC_TOKEN`
 *  - Çalışma anında     → isteğin `x-vercel-oidc-token` başlığı
 *
 * Bu yüzden başlıktan okunan değeri çağıran taraf geçirir; ortam değişkeni
 * yalnızca yedek yoldur.
 */
function resolveOidcToken(fromRequest?: string | null): string | null {
  return fromRequest || process.env.VERCEL_OIDC_TOKEN || null;
}

/**
 * Statik token yedeği. Depo bağlanırken özel ön ek verilmişse ad
 * `BLOB_READ_WRITE_TOKEN` olmayabilir, o yüzden deseni de tarıyoruz.
 */
function resolveBlobToken(): string | null {
  if (process.env.BLOB_READ_WRITE_TOKEN) return process.env.BLOB_READ_WRITE_TOKEN;

  const fallback = Object.keys(process.env)
    .filter((name) => name.endsWith('_READ_WRITE_TOKEN'))
    .map((name) => process.env[name])
    .find((value) => Boolean(value));

  return fallback ?? null;
}

/** Hata mesajında hangi Blob değişkenlerinin var olduğunu göstermek için. */
function listBlobVariables(): string {
  const names = Object.keys(process.env).filter(
    (name) =>
      name.includes('BLOB') || name.endsWith('_READ_WRITE_TOKEN') || name === 'VERCEL_OIDC_TOKEN',
  );

  return names.length > 0 ? names.join(', ') : 'hiçbiri';
}

/**
 * Görselleri Vercel Blob'a yükler. Vercel'de dosya sistemi yazılabilir
 * olmadığı için tek geçerli yol budur; token yoksa net bir hata veririz.
 */
export async function uploadImage(
  file: File,
  options: { oidcToken?: string | null } = {},
): Promise<UploadResult> {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type as (typeof ACCEPTED_IMAGE_TYPES)[number])) {
    throw new UploadError('Yalnızca JPG, PNG, WebP veya AVIF yükleyebilirsiniz.');
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    throw new UploadError(`Dosya boyutu en fazla ${MAX_UPLOAD_BYTES / (1024 * 1024)} MB olabilir.`);
  }

  if (file.size === 0) {
    throw new UploadError('Boş dosya yüklenemez.');
  }

  const storeId = process.env.BLOB_STORE_ID;
  const oidcToken = resolveOidcToken(options.oidcToken);
  const useOidc = Boolean(storeId && oidcToken);
  const token = useOidc ? null : resolveBlobToken();

  if (!useOidc && !token) {
    throw new UploadError(
      'Görsel deposu yapılandırılmamış. Vercel panelinde Storage → Blob deposunun ' +
        'Projects sekmesinden projeye bağlayın, sonra Redeploy edin. ' +
        `Bu dağıtımda görünen ilgili değişkenler: ${listBlobVariables()}.`,
    );
  }

  const extension = EXTENSION_BY_TYPE[file.type] ?? 'bin';
  const baseName = slugify(file.name.replace(/\.[^.]+$/, ''), 'gorsel');

  const blob = await put(`haber/${baseName}-${Date.now()}.${extension}`, file, {
    access: 'public',
    contentType: file.type,
    addRandomSuffix: true,
    // OIDC varken kısa ömürlü kimlik kullanılır; statik token yalnızca yedek.
    ...(useOidc ? { oidcToken: oidcToken as string, storeId: storeId as string } : {}),
    ...(token ? { token } : {}),
  });

  return { url: blob.url, contentType: file.type, size: file.size };
}
