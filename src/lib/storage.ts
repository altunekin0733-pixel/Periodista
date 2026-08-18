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

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new UploadError(
      'Görsel deposu yapılandırılmamış. Vercel panelinde Storage → Blob oluşturup projeye bağlayın (BLOB_READ_WRITE_TOKEN).',
    );
  }

  const extension = EXTENSION_BY_TYPE[file.type] ?? 'bin';
  const baseName = slugify(file.name.replace(/\.[^.]+$/, ''), 'gorsel');

  const blob = await put(`haber/${baseName}-${Date.now()}.${extension}`, file, {
    access: 'public',
    contentType: file.type,
    addRandomSuffix: true,
  });

  return { url: blob.url, contentType: file.type, size: file.size };
}
