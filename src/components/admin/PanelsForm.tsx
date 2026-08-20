'use client';

import { LoaderCircle, Save } from 'lucide-react';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';

import { LEAGUES } from '@/lib/panels';
import { PANELS_INITIAL_STATE } from '@/server/actions/form-state';
import { updateMovies, updateStandings } from '@/server/actions/panels';

import styles from './PanelsForm.module.css';

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className="admin-button" disabled={pending}>
      {pending ? (
        <LoaderCircle size={15} className={styles.spinner} aria-hidden="true" />
      ) : (
        <Save size={15} aria-hidden="true" />
      )}
      {pending ? 'Kaydediliyor…' : label}
    </button>
  );
}

function Feedback({ state }: { state: { status: string; message: string } }) {
  if (state.status === 'error') {
    return (
      <p className="admin-alert is-error" role="alert">
        {state.message}
      </p>
    );
  }

  if (state.status === 'success') {
    return (
      <p className="admin-alert is-success" role="status">
        {state.message}
      </p>
    );
  }

  return null;
}

export function StandingsForm({
  leagues,
  note,
}: {
  leagues: Record<string, string>;
  note: string;
}) {
  const [state, formAction] = useActionState(updateStandings, PANELS_INITIAL_STATE);

  return (
    <form action={formAction} className="admin-panel">
      <p className="admin-panel-title">Puan durumu</p>
      <Feedback state={state} />

      <p className="admin-hint">
        Her satıra bir takım, alanları noktalı virgülle ayırın:{' '}
        <code>Takım;O;G;B;M;P</code> — örnek: <code>Galatasaray;34;25;5;4;80</code>. Satırların
        sırası tabloda göründüğü sıradır. Boş bıraktığınız lig Spor sayfasında hiç görünmez.
      </p>

      {LEAGUES.map((league) => (
        <div className="admin-field" key={league.slug}>
          <label htmlFor={`league-${league.slug}`} className="admin-label">
            {league.name}
          </label>
          <textarea
            id={`league-${league.slug}`}
            name={`league.${league.slug}`}
            rows={8}
            defaultValue={leagues[league.slug] ?? ''}
            className={`admin-textarea ${styles.mono}`}
            placeholder="Takım;O;G;B;M;P"
            spellCheck={false}
          />
        </div>
      ))}

      <div className="admin-field">
        <label htmlFor="standings-note" className="admin-label">
          Not
        </label>
        <input
          id="standings-note"
          name="note"
          type="text"
          maxLength={120}
          defaultValue={note}
          className="admin-input"
          placeholder="Örn. 34. hafta sonu"
        />
        <p className="admin-hint">Panel başlığının sağında küçük punto ile görünür.</p>
      </div>

      <SubmitButton label="Puan durumunu kaydet" />
    </form>
  );
}

export function MoviesForm({ films, note }: { films: string; note: string }) {
  const [state, formAction] = useActionState(updateMovies, PANELS_INITIAL_STATE);

  return (
    <form action={formAction} className="admin-panel">
      <p className="admin-panel-title">Vizyondaki filmler</p>
      <Feedback state={state} />

      <p className="admin-hint">
        Her satıra bir film: <code>Başlık;Tür;Vizyon tarihi;Afiş adresi;Bağlantı</code>. Başlık
        dışındaki alanlar boş bırakılabilir; afiş ve bağlantı <code>https://</code> ile
        başlamalıdır.
      </p>

      <div className="admin-field">
        <label htmlFor="films" className="admin-label">
          Film listesi
        </label>
        <textarea
          id="films"
          name="films"
          rows={12}
          defaultValue={films}
          className={`admin-textarea ${styles.mono}`}
          placeholder="Başlık;Tür;Vizyon tarihi;Afiş adresi;Bağlantı"
          spellCheck={false}
        />
      </div>

      <div className="admin-field">
        <label htmlFor="movies-note" className="admin-label">
          Not
        </label>
        <input
          id="movies-note"
          name="note"
          type="text"
          maxLength={120}
          defaultValue={note}
          className="admin-input"
          placeholder="Örn. 22 Ağustos haftası"
        />
      </div>

      <SubmitButton label="Film listesini kaydet" />
    </form>
  );
}
