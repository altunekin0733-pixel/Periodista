'use server';

import { z } from 'zod';

import { prisma } from '@/lib/prisma';
import { getSettings } from '@/lib/settings';
import type { NewsletterState } from './form-state';

const schema = z.object({
  email: z.string().trim().toLowerCase().email('Geçerli bir e-posta adresi girin.'),
  // Botlar görünmez alanı doldurur; gerçek kullanıcı boş bırakır.
  website: z.string().max(0).optional().or(z.literal('')),
});

export async function subscribeToNewsletter(
  _previous: NewsletterState,
  formData: FormData,
): Promise<NewsletterState> {
  const settings = await getSettings();

  if (!settings.newsletterEnabled) {
    return { status: 'error', message: 'E-bülten kaydı şu anda kapalı.' };
  }

  const parsed = schema.safeParse({
    email: formData.get('email'),
    website: formData.get('website') ?? '',
  });

  if (!parsed.success) {
    return {
      status: 'error',
      message: parsed.error.issues[0]?.message ?? 'Geçerli bir e-posta adresi girin.',
    };
  }

  // Honeypot dolmuşsa isteği sessizce başarılı gösterip kaydetmiyoruz.
  if (parsed.data.website) {
    return { status: 'success', message: 'Kaydınız alındı.' };
  }

  try {
    await prisma.subscriber.upsert({
      where: { email: parsed.data.email },
      create: { email: parsed.data.email },
      update: { active: true },
    });

    return { status: 'success', message: 'Kaydınız alındı. Bültenimize hoş geldiniz.' };
  } catch {
    return { status: 'error', message: 'Kayıt sırasında bir sorun oluştu. Lütfen tekrar deneyin.' };
  }
}
