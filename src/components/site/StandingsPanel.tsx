'use client';

import { useState } from 'react';

import { LEAGUES, type StandingRow } from '@/lib/panels';

import panel from './side-panel.module.css';
import styles from './StandingsPanel.module.css';

type StandingsPanelProps = {
  /** Lig slug'ı -> sıralı takım satırları. Boş ligler panelde görünmez. */
  leagues: Record<string, StandingRow[]>;
  note: string;
};

export function StandingsPanel({ leagues, note }: StandingsPanelProps) {
  const available = LEAGUES.filter((league) => (leagues[league.slug]?.length ?? 0) > 0);
  const [active, setActive] = useState(available[0]?.slug ?? '');

  if (available.length === 0) return null;

  const rows = leagues[active] ?? [];

  return (
    <section className={panel.panel} aria-labelledby="puan-durumu-baslik">
      <header className={panel.header}>
        <h2 id="puan-durumu-baslik" className="label-caps">
          Puan Durumu
        </h2>
        {note && <span className={panel.meta}>{note}</span>}
      </header>

      <div className={panel.tabs} role="tablist" aria-label="Lig seçimi">
        {available.map((league) => (
          <button
            key={league.slug}
            type="button"
            role="tab"
            aria-selected={league.slug === active}
            className={`${panel.tab} ${league.slug === active ? panel.tabActive : ''}`}
            onClick={() => setActive(league.slug)}
          >
            {league.name}
          </button>
        ))}
      </div>

      <div className={panel.body}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col" className={styles.rank}>
                #
              </th>
              <th scope="col" className={styles.team}>
                Takım
              </th>
              <th scope="col">O</th>
              <th scope="col">G</th>
              <th scope="col">B</th>
              <th scope="col">M</th>
              <th scope="col">P</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.team}>
                <td className={`${styles.rank} tabular`}>{index + 1}</td>
                <td className={styles.team}>{row.team}</td>
                <td className="tabular">{row.played}</td>
                <td className="tabular">{row.won}</td>
                <td className="tabular">{row.drawn}</td>
                <td className="tabular">{row.lost}</td>
                <td className={`${styles.points} tabular`}>{row.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
