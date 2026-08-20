'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { requireSession } from '@/lib/auth';
import {
  LEAGUES,
  parseMoviesText,
  parseStandingsText,
  type StandingRow,
} from '@/lib/panels';
import { saveMovies, saveStandings } from '@/lib/panels-store';
import { categoryHref } from '@/lib/routes';
import type { PanelsState } from './form-state';

const noteSchema = z.string().trim().max(120);

export async function updateStandings(
  _previous: PanelsState,
  formData: FormData,
): Promise<PanelsState> {
  await requireSession();

  const note = noteSchema.safeParse(String(formData.get('note') ?? ''));

  if (!note.success) {
    return { status: 'error', message: 'Not en fazla 120 karakter olabilir.' };
  }

  const leagues: Record<string, StandingRow[]> = {};

  for (const league of LEAGUES) {
    const rows = parseStandingsText(String(formData.get(`league.${league.slug}`) ?? ''));

    if (rows.length > 0) leagues[league.slug] = rows;
  }

  try {
    await saveStandings({ leagues, note: note.data });
  } catch {
    return { status: 'error', message: 'Puan durumu kaydedilemedi.' };
  }

  revalidatePath(categoryHref('spor'));

  const total = Object.values(leagues).reduce((sum, rows) => sum + rows.length, 0);

  return { status: 'success', message: `Puan durumu kaydedildi (${total} takım satırı).` };
}

export async function updateMovies(
  _previous: PanelsState,
  formData: FormData,
): Promise<PanelsState> {
  await requireSession();

  const note = noteSchema.safeParse(String(formData.get('note') ?? ''));

  if (!note.success) {
    return { status: 'error', message: 'Not en fazla 120 karakter olabilir.' };
  }

  const films = parseMoviesText(String(formData.get('films') ?? ''));

  try {
    await saveMovies({ films, note: note.data });
  } catch {
    return { status: 'error', message: 'Film listesi kaydedilemedi.' };
  }

  revalidatePath(categoryHref('kultur-sanat'));

  return { status: 'success', message: `Film listesi kaydedildi (${films.length} film).` };
}
