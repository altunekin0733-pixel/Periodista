'use client';

import { LoaderCircle, Save } from 'lucide-react';
import Link from 'next/link';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';

import { CategoryIcon } from '@/components/ui/Icon';
import { CATEGORY_ICONS } from '@/lib/site-config';
import { saveCategory } from '@/server/actions/categories';
import { CATEGORY_INITIAL_STATE } from '@/server/actions/form-state';

import styles from './CategoryForm.module.css';

export type CategoryFormValues = {
  id?: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  logoVariant: 'default' | 'sports';
  position: number;
};

function SubmitButton({ isEdit }: { isEdit: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className="admin-button" disabled={pending}>
      {pending ? (
        <LoaderCircle size={15} className={styles.spinner} aria-hidden="true" />
      ) : (
        <Save size={15} aria-hidden="true" />
      )}
      {isEdit ? 'Güncelle' : 'Kategori ekle'}
    </button>
  );
}

export function CategoryForm({ values }: { values: CategoryFormValues }) {
  const [state, formAction] = useActionState(saveCategory, CATEGORY_INITIAL_STATE);
  const isEdit = Boolean(values.id);

  return (
    <form action={formAction} className="admin-panel">
      {values.id && <input type="hidden" name="id" value={values.id} />}

      {state.status === 'error' && state.message && (
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
        <label htmlFor="category-name" className="admin-label">
          Kategori adı
        </label>
        <input
          id="category-name"
          name="name"
          type="text"
          required
          maxLength={60}
          defaultValue={values.name}
          className="admin-input"
          placeholder="Örn. Sağlık"
        />
        {state.fieldErrors.name && <p className="admin-error">{state.fieldErrors.name}</p>}
      </div>

      <div className="admin-field">
        <label htmlFor="category-slug" className="admin-label">
          Adres (slug)
        </label>
        <input
          id="category-slug"
          name="slug"
          type="text"
          maxLength={60}
          defaultValue={values.slug}
          className="admin-input"
          placeholder="otomatik oluşturulur"
        />
        <p className="admin-hint">
          Kategori adresi sitenin kökünde yer alır: <code>/saglik</code>
        </p>
        {state.fieldErrors.slug && <p className="admin-error">{state.fieldErrors.slug}</p>}
      </div>

      <fieldset className={styles.iconGroup}>
        <legend className="admin-label">Simge</legend>
        <div className={styles.iconGrid}>
          {CATEGORY_ICONS.map((icon) => (
            <label key={icon} className={styles.iconOption} title={icon}>
              <input
                type="radio"
                name="icon"
                value={icon}
                defaultChecked={icon === values.icon}
                className={styles.iconInput}
              />
              <span className={styles.iconBox}>
                <CategoryIcon name={icon} size={18} />
              </span>
              <span className="visually-hidden">{icon}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="admin-field">
        <label htmlFor="category-description" className="admin-label">
          Açıklama
        </label>
        <textarea
          id="category-description"
          name="description"
          rows={2}
          maxLength={240}
          defaultValue={values.description}
          className="admin-textarea"
          placeholder="Kategori sayfasının başlığında görünür"
        />
      </div>

      <div className="admin-row-2">
        <div className="admin-field">
          <label htmlFor="category-position" className="admin-label">
            Sıra
          </label>
          <input
            id="category-position"
            name="position"
            type="number"
            min={0}
            max={999}
            required
            defaultValue={values.position}
            className="admin-input"
          />
          <p className="admin-hint">Menüde küçükten büyüğe sıralanır.</p>
        </div>

        <div className="admin-field">
          <label htmlFor="category-logo" className="admin-label">
            Logo
          </label>
          <select
            id="category-logo"
            name="logoVariant"
            defaultValue={values.logoVariant}
            className="admin-select"
          >
            <option value="default">Periodista</option>
            <option value="sports">Periodista Sports</option>
          </select>
          <p className="admin-hint">Bu kategorinin sayfalarında görünecek marka.</p>
        </div>
      </div>

      <div className={styles.actions}>
        <SubmitButton isEdit={isEdit} />
        {isEdit && (
          <Link href="/admin/kategoriler" className="admin-button is-ghost">
            Yeni kategoriye geç
          </Link>
        )}
      </div>
    </form>
  );
}
