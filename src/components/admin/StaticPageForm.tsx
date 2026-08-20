'use client';

import { ExternalLink, LoaderCircle, Save } from 'lucide-react';
import Link from 'next/link';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';

import { PAGE_INITIAL_STATE } from '@/server/actions/form-state';
import { updateStaticPage } from '@/server/actions/pages';

import { RichTextEditor } from './RichTextEditor';
import styles from './StaticPageForm.module.css';

export type StaticPageValues = {
  slug: string;
  title: string;
  intro: string;
  body: string;
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className="admin-button" disabled={pending}>
      {pending ? (
        <LoaderCircle size={15} className={styles.spinner} aria-hidden="true" />
      ) : (
        <Save size={15} aria-hidden="true" />
      )}
      {pending ? 'Kaydediliyor…' : 'Sayfayı kaydet'}
    </button>
  );
}

export function StaticPageForm({ values }: { values: StaticPageValues }) {
  const [state, formAction] = useActionState(updateStaticPage, PAGE_INITIAL_STATE);

  return (
    <form action={formAction} className="admin-panel">
      <input type="hidden" name="slug" value={values.slug} />

      <div className={styles.head}>
        <p className="admin-panel-title">{values.title}</p>
        <Link href={`/${values.slug}`} target="_blank" className="admin-button is-ghost is-small">
          <ExternalLink size={13} aria-hidden="true" />
          Sitede gör
        </Link>
      </div>

      {state.status === 'error' && (
        <p className="admin-alert is-error" role="alert">
          {state.message}
        </p>
      )}

      {state.status === 'success' && (
        <p className="admin-alert is-success" role="status">
          {state.message}
        </p>
      )}

      <div className="admin-field">
        <label htmlFor={`title-${values.slug}`} className="admin-label">
          Sayfa başlığı
        </label>
        <input
          id={`title-${values.slug}`}
          name="title"
          type="text"
          required
          maxLength={120}
          defaultValue={values.title}
          className="admin-input"
        />
        <p className="admin-hint">
          Sayfanın tepesinde ve altbilgideki bağlantıda görünen ad değişmez;
          bu başlık yalnızca sayfa içindedir.
        </p>
      </div>

      <div className="admin-field">
        <label htmlFor={`intro-${values.slug}`} className="admin-label">
          Giriş
        </label>
        <textarea
          id={`intro-${values.slug}`}
          name="intro"
          rows={3}
          maxLength={600}
          defaultValue={values.intro}
          className="admin-textarea"
        />
        <p className="admin-hint">Başlığın hemen altındaki iri punto paragraf.</p>
      </div>

      <div className="admin-field">
        <span className="admin-label">Sayfa metni</span>
        <RichTextEditor name="body" defaultValue={values.body} />
      </div>

      <SubmitButton />
    </form>
  );
}
