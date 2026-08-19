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
 * Vercel Blob normalde `BLOB_READ_WRITE_TOKEN` üretir, ancak depo bağlanırken
 * özel bir ön ek verilmişse ad değişir (örn. `GORSEL_READ_WRITE_TOKEN`).
 * Bu yüzden önce standart adı, sonra aynı deseni taşıyan diğerlerini ararız.
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
    (name) => name.includes('BLOB') || name.endsWith('_READ_WRITE_TOKEN'),
  );

  return names.length > 0 ? names.join(', ') : 'hiçbiri';
}

/**
 * Görselleri Vercel Blob'a yükler. Vercel'de dosya sistemi yazılabilir
 * olmadığı için tek geçerli yol budur; token yoksa net bir hata veririz.
 */
export async function uploadImage(file: File): Promise<UploadResult> {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type as (typeof ACCEPTED_IMAGE_TYPES)[number])) {
    throw new UploadError('Yalnızca JPG, PNG, WebP veya AVIF yükleyebilirsiniz.');
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    throw new UploadError(`Dosya boyutu en fazla ${MAX_UPLOAD_BYTES / (1024 * 1024)} MB olabilir.`);
  }

  if (file.size === 0) {
    throw new UploadError('Boş dosya yüklenemez.');
  }

  const token = resolveBlobToken();

  if (!token) {
    throw new UploadError(
      'Görsel deposu yapılandırılmamış: BLOB_READ_WRITE_TOKEN bulunamadı. ' +
        'Vercel panelinde Storage → Blob oluşturup projeye bağlayın, sonra Redeploy edin. ' +
        `Bu dağıtımda görünen ilgili değişkenler: ${listBlobVariables()}.`,
    );
  }

  const extension = EXTENSION_BY_TYPE[file.type] ?? 'bin';
  const baseName = slugify(file.name.replace(/\.[^.]+$/, ''), 'gorsel');

  const blob = await put(`haber/${baseName}-${Date.now()}.${extension}`, file, {
    access: 'public',
    contentType: file.type,
    addRandomSuffix: true,
    token,
  });

  return { url: blob.url, contentType: file.type, size: file.size };
}
