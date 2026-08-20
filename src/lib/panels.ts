import { z } from 'zod';

/**
 * Kategori sayfalarındaki yan panellerin şekli ve metin biçimi. Bu modül
 * veritabanına dokunmaz; hem sunucu hem yönetim paneli arayüzü kullanır.
 * Okuma/yazma `panels-store.ts` içindedir.
 */

/** Puan tablosu tutulan ligler — Süper Lig ve Avrupa'nın beş büyük ligi. */
export const LEAGUES = [
  { slug: 'super-lig', name: 'Süper Lig' },
  { slug: 'premier-lig', name: 'Premier Lig' },
  { slug: 'laliga', name: 'LaLiga' },
  { slug: 'serie-a', name: 'Serie A' },
  { slug: 'bundesliga', name: 'Bundesliga' },
  { slug: 'ligue-1', name: 'Ligue 1' },
] as const;

export type LeagueSlug = (typeof LEAGUES)[number]['slug'];

const standingRowSchema = z.object({
  team: z.string().min(1).max(60),
  played: z.number().int().min(0).max(99),
  won: z.number().int().min(0).max(99),
  drawn: z.number().int().min(0).max(99),
  lost: z.number().int().min(0).max(99),
  points: z.number().int().min(0).max(999),
});

export const standingsSchema = z.object({
  /** Lig slug'ı -> sıralı takım satırları. */
  leagues: z.record(z.string(), z.array(standingRowSchema)).default({}),
  note: z.string().max(120).default(''),
});

const movieSchema = z.object({
  title: z.string().min(1).max(120),
  genre: z.string().max(60).default(''),
  releaseLabel: z.string().max(40).default(''),
  poster: z.string().max(400).default(''),
  url: z.string().max(400).default(''),
});

export const moviesSchema = z.object({
  films: z.array(movieSchema).default([]),
  note: z.string().max(120).default(''),
});

export type StandingRow = z.infer<typeof standingRowSchema>;
export type Standings = z.infer<typeof standingsSchema>;
export type Movie = z.infer<typeof movieSchema>;
export type Movies = z.infer<typeof moviesSchema>;

export const EMPTY_STANDINGS: Standings = standingsSchema.parse({});
export const EMPTY_MOVIES: Movies = moviesSchema.parse({});

/**
 * Panelde satır başına bir takım: `Takım;O;G;B;M;P`. Sayı alanları boş veya
 * hatalıysa o satır atlanır — yarım girilmiş bir satır tabloyu bozmasın.
 */
export function parseStandingsText(raw: string): StandingRow[] {
  const rows: StandingRow[] = [];

  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const [team, played, won, drawn, lost, points] = trimmed.split(';').map((part) => part.trim());
    if (!team) continue;

    const candidate = {
      team,
      played: Number(played),
      won: Number(won),
      drawn: Number(drawn),
      lost: Number(lost),
      points: Number(points),
    };

    const parsed = standingRowSchema.safeParse(candidate);
    if (parsed.success) rows.push(parsed.data);
  }

  return rows;
}

export function toStandingsText(rows: StandingRow[]): string {
  return rows
    .map((row) => [row.team, row.played, row.won, row.drawn, row.lost, row.points].join(';'))
    .join('\n');
}

/** Satır başına bir film: `Başlık;Tür;Vizyon tarihi;Görsel adresi;Bağlantı` */
export function parseMoviesText(raw: string): Movie[] {
  const films: Movie[] = [];

  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const [title, genre, releaseLabel, poster, url] = trimmed.split(';').map((part) => part.trim());
    if (!title) continue;

    const parsed = movieSchema.safeParse({
      title,
      genre: genre ?? '',
      releaseLabel: releaseLabel ?? '',
      poster: isHttpUrl(poster) ? poster : '',
      url: isHttpUrl(url) ? url : '',
    });

    if (parsed.success) films.push(parsed.data);
  }

  return films;
}

export function toMoviesText(films: Movie[]): string {
  return films
    .map((film) => [film.title, film.genre, film.releaseLabel, film.poster, film.url].join(';'))
    .join('\n');
}

function isHttpUrl(value: string | undefined): boolean {
  return Boolean(value) && /^https?:\/\/\S+$/i.test(value as string);
}
