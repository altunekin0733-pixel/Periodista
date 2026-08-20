import { AdminTopbar } from '@/components/admin/AdminTopbar';
import { MoviesForm, StandingsForm } from '@/components/admin/PanelsForm';
import { toMoviesText, toStandingsText } from '@/lib/panels';
import { LEAGUES } from '@/lib/site-config';
import { getMovies, getStandings } from '@/lib/panels-store';

export const metadata = { title: 'Kategori Panelleri' };

export default async function AdminPanelsPage() {
  const [standings, movies] = await Promise.all([getStandings(), getMovies()]);

  const leagueText: Record<string, string> = {};
  for (const league of LEAGUES) {
    leagueText[league.slug] = toStandingsText(standings.leagues[league.slug] ?? []);
  }

  return (
    <>
      <AdminTopbar eyebrow="İçerik Yönetimi" title="Kategori Panelleri" />

      <div className="admin-content">
        <p className="admin-hint">
          Spor sayfasındaki puan durumu ve Kültür-Sanat sayfasındaki vizyondaki filmler listesi
          dış bir servise bağlı değildir; buradan elle güncellenir.
        </p>

        <div className="admin-columns">
          <StandingsForm leagues={leagueText} note={standings.note} />
          <MoviesForm films={toMoviesText(movies.films)} note={movies.note} />
        </div>
      </div>
    </>
  );
}
