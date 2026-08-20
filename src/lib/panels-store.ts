import { cache } from 'react';
import type { z } from 'zod';

import {
  EMPTY_MOVIES,
  EMPTY_STANDINGS,
  moviesSchema,
  standingsSchema,
} from './panels';
import { prisma } from './prisma';

/**
 * Panel verisi `Setting` tablosunda JSON olarak durur; yeni tablo gerektirmez.
 */
const STANDINGS_KEY = 'puan-durumu';
const MOVIES_KEY = 'vizyondaki-filmler';

async function readPanel<T>(key: string, schema: z.ZodType<T>, fallback: T): Promise<T> {
  try {
    const row = await prisma.setting.findUnique({ where: { key } });
    if (!row) return fallback;

    const parsed = schema.safeParse(row.value);

    return parsed.success ? parsed.data : fallback;
  } catch {
    // Panel verisi okunamazsa kategori sayfası düşmemeli; panel gizlenir.
    return fallback;
  }
}

export const getStandings = cache(() => readPanel(STANDINGS_KEY, standingsSchema, EMPTY_STANDINGS));

export const getMovies = cache(() => readPanel(MOVIES_KEY, moviesSchema, EMPTY_MOVIES));

export async function saveStandings(input: unknown): Promise<void> {
  const value = standingsSchema.parse(input);

  await prisma.setting.upsert({
    where: { key: STANDINGS_KEY },
    create: { key: STANDINGS_KEY, value },
    update: { value },
  });
}

export async function saveMovies(input: unknown): Promise<void> {
  const value = moviesSchema.parse(input);

  await prisma.setting.upsert({
    where: { key: MOVIES_KEY },
    create: { key: MOVIES_KEY, value },
    update: { value },
  });
}
