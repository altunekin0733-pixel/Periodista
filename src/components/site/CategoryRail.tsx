import { after } from 'next/server';

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
 * dakika bloğuyla aynıdır.
 */
type CategoryRailProps = {
  categorySlug: string;
  articles: ArticleCard[];
};

async function MarketSide() {
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

async function StandingsSide() {
  const standings = await getStandings();

  return <StandingsPanel leagues={standings.leagues} note={standings.note} />;
}

async function MoviesSide() {
  const movies = await getMovies();

  return <MoviesPanel films={movies.films} note={movies.note} />;
}

/** Kategoriye göre yan panel; özel paneli olmayan kategori başlık listesi gösterir. */
async function CategorySide({ categorySlug, articles }: CategoryRailProps) {
  if (categorySlug === 'ekonomi') return <MarketSide />;
  if (categorySlug === 'spor') return <StandingsSide />;
  if (categorySlug === 'kultur-sanat') return <MoviesSide />;

  return <HeadlineList title="Bu Kategoride Son" articles={articles} />;
}

export function CategoryRail({ categorySlug, articles }: CategoryRailProps) {
  if (articles.length === 0) return null;

  return (
    <div className={styles.rail}>
      <HeroSlider slides={articles.map(toHeroSlide)} />
      {/* Panelin verisi henüz girilmemişse hiç basılmaz; karusel satırı kaplar. */}
      <CategorySide categorySlug={categorySlug} articles={articles} />
    </div>
  );
}
