import { cache } from 'react';
import { z } from 'zod';

import { prisma } from './prisma';
import { SITE, SOCIAL_PLATFORMS, type SocialKey } from './site-config';

const SETTINGS_KEY = 'site';

const settingsSchema = z.object({
  tagline: z.string().max(160).default(SITE.tagline),
  description: z.string().max(320).default(SITE.description),
  social: z.record(z.string(), z.string()).default({}),
  commentsEnabled: z.boolean().default(true),
  /** Yorumlar önce onaya düşsün mü? */
  commentsModerated: z.boolean().default(true),
  newsletterEnabled: z.boolean().default(true),
  tickerEnabled: z.boolean().default(true),
});

export type SiteSettings = z.infer<typeof settingsSchema>;

export const DEFAULT_SETTINGS: SiteSettings = settingsSchema.parse({});

/**
 * Ayarlar her istekte en fazla bir kez okunur (React cache). Veritabanı
 * erişilemezse varsayılanlarla devam edilir — ayar okuması sayfayı düşürmez.
 */
export const getSettings = cache(async (): Promise<SiteSettings> => {
  try {
    const row = await prisma.setting.findUnique({ where: { key: SETTINGS_KEY } });
    if (!row) return DEFAULT_SETTINGS;

    const parsed = settingsSchema.safeParse(row.value);

    return parsed.success ? parsed.data : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
});

export async function saveSettings(input: unknown): Promise<SiteSettings> {
  const value = settingsSchema.parse(input);

  await prisma.setting.upsert({
    where: { key: SETTINGS_KEY },
    create: { key: SETTINGS_KEY, value },
    update: { value },
  });

  return value;
}

export type SocialLink = {
  key: SocialKey;
  name: string;
  url: string;
};

/** Yalnızca doldurulmuş ve http(s) ile başlayan bağlantılar gösterilir. */
export function toSocialLinks(settings: SiteSettings): SocialLink[] {
  return SOCIAL_PLATFORMS.flatMap((platform) => {
    const url = settings.social[platform.key]?.trim();

    if (!url || !/^https?:\/\//i.test(url)) return [];

    return [{ key: platform.key, name: platform.name, url }];
  });
}
