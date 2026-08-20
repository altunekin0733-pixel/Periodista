import { after } from 'next/server';
import type { ReactNode } from 'react';

import { HeadlineList } from '@/components/site/HeadlineList';
import { toHeroSlide } from '@/components/site/hero-slide';
import { HeroSlider } from '@/components/site/HeroSlider';
import { MarketPanel } from '@/components/site/MarketPanel';
import { MoviesPanel } from '@/components/site/MoviesPanel';
import { StandingsPanel } from '@/components/site/StandingsPanel';
import { formatRelativeTime } from '@/lib/format';
import { getMovies, getStandings } from '@/lib/panels-store';
import { buildTrend, getRateHistory, recordRateSample, type RateTrend } from '@/lib/rate-history';
import { getRates, PANEL_SPEC } from '@/lib/rates';
import type { ArticleCard } from '@/server/queries';

import styles from './CategoryRail.module.css';

/**
 * Kategori sayfasının tepesi: solda kategorinin en yeni haberlerinden oluşan
 * karusel, sağda kategoriye özel yan panel. Panel genişliği ana sayfadaki son
 * dakika bloğuyla aynıdır. İkisinden biri boşsa diğeri satırı tek başına
 * kullanır — piyasa paneli, kategoride henüz haber yokken de görünür.
 */
type CategoryRailProps = {
  categorySlug: string;
  articles: ArticleCard[];
};

async function marketSide(): Promise<ReactNode> {
  const [rates, samples] = await Promise.all([getRates(PANEL_SPEC), getRateHistory()]);

  if (rates.source === 'fallback' || rates.items.length === 0) return null;

  // Geçmiş yazımı yanıtı bekletmesin; en fazla 15 dakikada bir örnek eklenir.
  after(() => recordRateSample(rates.items));

  const trends: Record<string, RateTrend | null> = {};
  for (const item of rates.items) {
    trends[item.key] = buildTrend(samples, item.key, item.value);
  }

  return (
    <MarketPanel
      items={rates.items}
      trends={trends}
      updatedLabel={formatRelativeTime(rates.updatedAt)}
    />
  );
}

async function standingsSide(): Promise<ReactNode> {
  const standings = await getStandings();
  const hasRows = Object.values(standings.leagues).some((rows) => rows.length > 0);

  if (!hasRows) return null;

  return <StandingsPanel leagues={standings.leagues} note={standings.note} />;
}

async function moviesSide(): Promise<ReactNode> {
  const movies = await getMovies();

  if (movies.films.length === 0) return null;

  return <MoviesPanel films={movies.films} note={movies.note} />;
}

/** Kategoriye göre yan panel; özel paneli olmayan kategori başlık listesi gösterir. */
async function loadSide({ categorySlug, articles }: CategoryRailProps): Promise<ReactNode> {
  if (categorySlug === 'ekonomi') return marketSide();
  if (categorySlug === 'spor') return standingsSide();
  if (categorySlug === 'kultur-sanat') return moviesSide();

  if (articles.length === 0) return null;

  return <HeadlineList title="Bu Kategoride Son" articles={articles} />;
}

export async function CategoryRail({ categorySlug, articles }: CategoryRailProps) {
  const side = await loadSide({ categorySlug, articles });
  const hasSlider = articles.length > 0;

  if (!hasSlider && !side) return null;

  const className = hasSlider && side ? styles.rail : hasSlider ? styles.sliderOnly : styles.sideOnly;

  return (
    <div className={className}>
      {hasSlider && <HeroSlider slides={articles.map(toHeroSlide)} />}
      {side}
    </div>
  );
}
