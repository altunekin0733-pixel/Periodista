'use client';

import { LoaderCircle, Save } from 'lucide-react';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';

import { SocialIcon } from '@/components/ui/SocialIcon';
import type { SiteSettings } from '@/lib/settings';
import { SOCIAL_PLATFORMS } from '@/lib/site-config';
import { SETTINGS_INITIAL_STATE } from '@/server/actions/form-state';
import { updateSettings } from '@/server/actions/settings';

import styles from './SettingsForm.module.css';

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className="admin-button" disabled={pending}>
      {pending ? (
        <LoaderCircle size={15} className={styles.spinner} aria-hidden="true" />
      ) : (
        <Save size={15} aria-hidden="true" />
      )}
      {pending ? 'Kaydediliyor…' : 'Ayarları kaydet'}
    </button>
  );
}

export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const [state, formAction] = useActionState(updateSettings, SETTINGS_INITIAL_STATE);

  return (
    <form action={formAction} className={styles.form}>
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

      <div className="admin-columns">
        <section className="admin-panel">
          <p className="admin-panel-title">Site kimliği</p>

          <div className="admin-field">
            <label htmlFor="tagline" className="admin-label">
              Slogan
            </label>
            <input
              id="tagline"
              name="tagline"
              type="text"
              maxLength={160}
              defaultValue={settings.tagline}
              className="admin-input"
            />
            <p className="admin-hint">Altbilgide logonun altında görünür.</p>
          </div>

          <div className="admin-field">
            <label htmlFor="description" className="admin-label">
              Site açıklaması
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              maxLength={320}
              defaultValue={settings.description}
              className="admin-textarea"
            />
            <p className="admin-hint">
              Arama motorlarında ve RSS akışında kullanılan varsayılan açıklama.
            </p>
          </div>
        </section>

        <section className="admin-panel">
          <p className="admin-panel-title">Bölümler</p>

          <label className="admin-checkbox">
            <input type="checkbox" name="tickerEnabled" defaultChecked={settings.tickerEnabled} />
            Piyasa şeridini göster (döviz, altın, BIST)
          </label>

          <label className="admin-checkbox">
            <input
              type="checkbox"
              name="newsletterEnabled"
              defaultChecked={settings.newsletterEnabled}
            />
            Bülten kayıt formunu göster
          </label>

          <label className="admin-checkbox">
            <input type="checkbox" name="commentsEnabled" defaultChecked={settings.commentsEnabled} />
            Haberlerde yorumlara izin ver
          </label>

          <label className="admin-checkbox">
            <input
              type="checkbox"
              name="commentsModerated"
              defaultChecked={settings.commentsModerated}
            />
            Yorumlar önce editör onayına düşsün
          </label>

          <p className="admin-hint">
            Onay kapalıyken yorumlar anında yayınlanır. Moderasyon olmadan spam riski artar.
          </p>
        </section>
      </div>

      <section className="admin-panel">
        <p className="admin-panel-title">Künye ve iletişim</p>
        <p className="admin-hint">
          Künye, İletişim ve Reklam Ver sayfalarında yayınlanır. Boş bırakılan satır o
          sayfalarda hiç görünmez.
        </p>

        <div className="admin-row-2">
          <div className="admin-field">
            <label htmlFor="publisherName" className="admin-label">
              Yayın sahibi
            </label>
            <input
              id="publisherName"
              name="publisherName"
              type="text"
              maxLength={120}
              defaultValue={settings.publisherName}
              className="admin-input"
            />
          </div>

          <div className="admin-field">
            <label htmlFor="contactEmail" className="admin-label">
              İletişim e-postası
            </label>
            <input
              id="contactEmail"
              name="contactEmail"
              type="email"
              maxLength={160}
              defaultValue={settings.contactEmail}
              className="admin-input"
            />
          </div>
        </div>

        <div className="admin-row-2">
          <div className="admin-field">
            <label htmlFor="editorInChief" className="admin-label">
              Genel yayın yönetmeni
            </label>
            <input
              id="editorInChief"
              name="editorInChief"
              type="text"
              maxLength={120}
              defaultValue={settings.editorInChief}
              className="admin-input"
            />
          </div>

          <div className="admin-field">
            <label htmlFor="managingEditor" className="admin-label">
              Sorumlu yazı işleri müdürü
            </label>
            <input
              id="managingEditor"
              name="managingEditor"
              type="text"
              maxLength={120}
              defaultValue={settings.managingEditor}
              className="admin-input"
            />
          </div>
        </div>

        <div className="admin-field">
          <label htmlFor="contactAddress" className="admin-label">
            Adres
          </label>
          <textarea
            id="contactAddress"
            name="contactAddress"
            rows={2}
            maxLength={240}
            defaultValue={settings.contactAddress}
            className="admin-textarea"
          />
        </div>
      </section>

      <section className="admin-panel">
        <p className="admin-panel-title">Sosyal medya</p>
        <p className="admin-hint">
          Boş bırakılan platform altbilgide görünmez. Tam adresi yazın.
        </p>

        <div className={styles.socialGrid}>
          {SOCIAL_PLATFORMS.map((platform) => (
            <div className="admin-field" key={platform.key}>
              <label htmlFor={`social-${platform.key}`} className={styles.socialLabel}>
                <SocialIcon platform={platform.key} size={14} />
                {platform.name}
              </label>
              <input
                id={`social-${platform.key}`}
                name={`social.${platform.key}`}
                type="url"
                maxLength={300}
                defaultValue={settings.social[platform.key] ?? ''}
                className="admin-input"
                placeholder={platform.placeholder}
              />
            </div>
          ))}
        </div>
      </section>

      <div className="admin-sticky-actions">
        <SubmitButton />
      </div>
    </form>
  );
}
