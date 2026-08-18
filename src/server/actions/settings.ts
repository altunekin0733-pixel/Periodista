'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { requireSession } from '@/lib/auth';
import { saveSettings } from '@/lib/settings';
import { SOCIAL_PLATFORMS } from '@/lib/site-config';
import type { SettingsState } from './form-state';

const urlOrEmpty = z
  .string()
  .trim()
  .max(300)
  .refine((value) => value === '' || /^https?:\/\/\S+$/i.test(value), {
    message: 'Bağlantı http:// veya https:// ile başlamalı.',
  });

export async function updateSettings(
  _previous: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  await requireSession();

  const social: Record<string, string> = {};

  for (const platform of SOCIAL_PLATFORMS) {
    const raw = String(formData.get(`social.${platform.key}`) ?? '');
    const parsed = urlOrEmpty.safeParse(raw);

    if (!parsed.success) {
      return {
        status: 'error',
        message: `${platform.name}: ${parsed.error.issues[0]?.message}`,
      };
    }

    if (parsed.data) social[platform.key] = parsed.data;
  }

  const payload = {
    tagline: String(formData.get('tagline') ?? ''),
    description: String(formData.get('description') ?? ''),
    social,
    commentsEnabled: formData.get('commentsEnabled') === 'on',
    commentsModerated: formData.get('commentsModerated') === 'on',
    newsletterEnabled: formData.get('newsletterEnabled') === 'on',
    tickerEnabled: formData.get('tickerEnabled') === 'on',
  };

  try {
    await saveSettings(payload);
  } catch (error) {
    const message =
      error instanceof z.ZodError
        ? (error.issues[0]?.message ?? 'Ayarlar doğrulanamadı.')
        : 'Ayarlar kaydedilemedi.';

    return { status: 'error', message };
  }

  // Ayarlar tüm sayfalarda kullanılan düzeni etkiler.
  revalidatePath('/', 'layout');

  return { status: 'success', message: 'Ayarlar kaydedildi.' };
}
