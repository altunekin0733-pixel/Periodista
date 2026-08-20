import { cache } from 'react';
import { z } from 'zod';

import { prisma } from './prisma';
import { getStaticPageDefaults, STATIC_PAGES, type StaticPage } from './static-pages';

/**
 * Kurumsal sayfaların panelden düzenlenmiş hâli. Tek bir `Setting` satırında,
 * slug -> alan sözlüğü olarak durur; girilmeyen alan varsayılanına düşer.
 */
const PAGES_KEY = 'kurumsal-sayfalar';

const overrideSchema = z.object({
  title: z.string().max(120).optional(),
  intro: z.string().max(600).optional(),
  body: z.string().max(40_000).optional(),
});

const storeSchema = z.object({
  pages: z.record(z.string(), overrideSchema).default({}),
});

export type PageOverride = z.infer<typeof overrideSchema>;

const readOverrides = cache(async (): Promise<Record<string, PageOverride>> => {
  try {
    const row = await prisma.setting.findUnique({ where: { key: PAGES_KEY } });
    if (!row) return {};

    const parsed = storeSchema.safeParse(row.value);

    return parsed.success ? parsed.data.pages : {};
  } catch {
    // Kayıt okunamazsa sayfa varsayılan metinle yayında kalır.
    return {};
  }
});

/** Varsayılan metin ile panelden girilen metnin birleşimi. */
export async function getStaticPage(slug: string): Promise<StaticPage> {
  const defaults = getStaticPageDefaults(slug);
  const override = (await readOverrides())[slug];

  if (!override) return defaults;

  return {
    ...defaults,
    title: override.title?.trim() || defaults.title,
    intro: override.intro?.trim() || defaults.intro,
    body: override.body?.trim() || defaults.body,
  };
}

/** Panelde formu doldurmak için: her sayfanın yürürlükteki metni. */
export async function getAllStaticPages(): Promise<StaticPage[]> {
  const overrides = await readOverrides();

  return Object.keys(STATIC_PAGES).map((slug) => {
    const defaults = getStaticPageDefaults(slug);
    const override = overrides[slug];

    return {
      ...defaults,
      title: override?.title?.trim() || defaults.title,
      intro: override?.intro?.trim() || defaults.intro,
      body: override?.body?.trim() || defaults.body,
    };
  });
}

export async function saveStaticPage(slug: string, override: PageOverride): Promise<void> {
  // Tanımsız bir slug kaydedilmesin; adresler sabit dosyalarla eşleşiyor.
  getStaticPageDefaults(slug);

  const value = overrideSchema.parse(override);
  const current = await readOverrides();

  await prisma.setting.upsert({
    where: { key: PAGES_KEY },
    create: { key: PAGES_KEY, value: { pages: { [slug]: value } } },
    update: { value: { pages: { ...current, [slug]: value } } },
  });
}
