'use client';

import { LoaderCircle, Save } from 'lucide-react';
import Link from 'next/link';
import { useActionState, useCallback, useState } from 'react';
import { useFormStatus } from 'react-dom';

import { estimateReadingMinutes } from '@/lib/reading-time';
import { saveArticle } from '@/server/actions/articles';
import { ARTICLE_INITIAL_STATE } from '@/server/actions/form-state';

import { CoverImageField } from './CoverImageField';
import { RichTextEditor } from './RichTextEditor';
import styles from './ArticleForm.module.css';

export type ArticleFormValues = {
  id?: string;
  title: string;
  slug: string;
  dek: string;
  body: string;
  categoryId: string;
  authorName: string;
  coverImage: string;
  coverAlt: string;
  tags: string;
  status: 'DRAFT' | 'PUBLISHED';
  featured: boolean;
  breaking: boolean;
  readMins: number;
  /** `datetime-local` girdisi için `YYYY-MM-DDTHH:mm` biçiminde. */
  publishedAt: string;
  seoTitle: string;
  seoDescription: string;
};

type ArticleFormProps = {
  categories: { id: string; name: string }[];
  values: ArticleFormValues;
};

function SubmitButton({ isEdit }: { isEdit: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className="admin-button" disabled={pending}>
      {pending ? (
        <LoaderCircle size={16} className={styles.spinner} aria-hidden="true" />
      ) : (
        <Save size={16} aria-hidden="true" />
      )}
      {pending ? 'Kaydediliyor…' : isEdit ? 'Değişiklikleri kaydet' : 'Haberi kaydet'}
    </button>
  );
}

export function ArticleForm({ categories, values }: ArticleFormProps) {
  const [state, formAction] = useActionState(saveArticle, ARTICLE_INITIAL_STATE);
  const [estimatedMins, setEstimatedMins] = useState(values.readMins || 1);
  const [seoTitle, setSeoTitle] = useState(values.seoTitle);
  const [seoDescription, setSeoDescription] = useState(values.seoDescription);

  const isEdit = Boolean(values.id);

  const handlePlainText = useCallback((text: string) => {
    setEstimatedMins(estimateReadingMinutes(text));
  }, []);

  const fieldError = (key: string) => state.fieldErrors[key];

  return (
    <form action={formAction} className="admin-form has-aside">
      {values.id && <input type="hidden" name="id" value={values.id} />}

      <div className={styles.main}>
        {state.status === 'error' && state.message && (
          <p className="admin-alert is-error" role="alert">
            {state.message}
          </p>
        )}

        <div className="admin-field">
          <label htmlFor="title" className="admin-label">
            Başlık
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            maxLength={200}
            defaultValue={values.title}
            className={`admin-input ${styles.titleInput}`}
            placeholder="Haber başlığı"
            aria-invalid={Boolean(fieldError('title'))}
          />
          {fieldError('title') && <p className="admin-error">{fieldError('title')}</p>}
        </div>

        <div className="admin-field">
          <label htmlFor="dek" className="admin-label">
            Spot
          </label>
          <textarea
            id="dek"
            name="dek"
            rows={2}
            maxLength={320}
            defaultValue={values.dek}
            className="admin-textarea"
            placeholder="Haberi bir iki cümleyle özetleyin"
          />
          <p className="admin-hint">
            Kart görünümlerinde ve arama sonuçlarında görünür. Boş bırakılırsa metin başı kullanılır.
          </p>
          {fieldError('dek') && <p className="admin-error">{fieldError('dek')}</p>}
        </div>

        <div className="admin-field">
          <span className="admin-label">Haber metni</span>
          <RichTextEditor name="body" defaultValue={values.body} onPlainTextChange={handlePlainText} />
          {fieldError('body') && <p className="admin-error">{fieldError('body')}</p>}
        </div>
      </div>

      <aside className={styles.aside}>
        <div className="admin-panel">
          <p className="admin-panel-title">Yayın</p>

          <div className="admin-field">
            <label htmlFor="status" className="admin-label">
              Durum
            </label>
            <select id="status" name="status" defaultValue={values.status} className="admin-select">
              <option value="DRAFT">Taslak</option>
              <option value="PUBLISHED">Yayında</option>
            </select>
          </div>

          <div className="admin-field">
            <label htmlFor="publishedAt" className="admin-label">
              Yayın tarihi
            </label>
            <input
              id="publishedAt"
              name="publishedAt"
              type="datetime-local"
              defaultValue={values.publishedAt}
              className="admin-input"
            />
            <p className="admin-hint">
              Boş bırakılırsa yayına alındığı an damgalanır. İleri bir tarih verirseniz haber o
              zamana kadar sitede görünmez.
            </p>
          </div>

          <label className="admin-checkbox">
            <input type="checkbox" name="featured" defaultChecked={values.featured} />
            Manşette göster
          </label>

          <label className="admin-checkbox">
            <input type="checkbox" name="breaking" defaultChecked={values.breaking} />
            Son dakika şeridine ekle
          </label>

          <div className={styles.actions}>
            <SubmitButton isEdit={isEdit} />
            <Link href="/admin/haberler" className="admin-button is-ghost">
              Vazgeç
            </Link>
          </div>
        </div>

        <div className="admin-panel">
          <p className="admin-panel-title">Sınıflandırma</p>

          <div className="admin-field">
            <label htmlFor="categoryId" className="admin-label">
              Kategori
            </label>
            <select
              id="categoryId"
              name="categoryId"
              required
              defaultValue={values.categoryId}
              className="admin-select"
              aria-invalid={Boolean(fieldError('categoryId'))}
            >
              <option value="">Kategori seçin</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {fieldError('categoryId') && <p className="admin-error">{fieldError('categoryId')}</p>}
          </div>

          <div className="admin-field">
            <label htmlFor="authorName" className="admin-label">
              Yazar
            </label>
            <input
              id="authorName"
              name="authorName"
              type="text"
              required
              maxLength={80}
              defaultValue={values.authorName}
              className="admin-input"
              placeholder="Yazar adı"
            />
            {fieldError('authorName') && <p className="admin-error">{fieldError('authorName')}</p>}
          </div>

          <div className="admin-field">
            <label htmlFor="tags" className="admin-label">
              Etiketler
            </label>
            <input
              id="tags"
              name="tags"
              type="text"
              defaultValue={values.tags}
              className="admin-input"
              placeholder="deprem, kentsel dönüşüm"
            />
            <p className="admin-hint">Virgülle ayırın, en fazla 10 etiket.</p>
          </div>

          <div className="admin-field">
            <label htmlFor="readMins" className="admin-label">
              Okuma süresi (dk)
            </label>
            <input
              id="readMins"
              name="readMins"
              type="number"
              min={0}
              max={600}
              defaultValue={values.readMins || ''}
              className="admin-input"
              placeholder={String(estimatedMins)}
            />
            <p className="admin-hint">Boş bırakılırsa metinden hesaplanır (~{estimatedMins} dk).</p>
          </div>
        </div>

        <div className="admin-panel">
          <CoverImageField defaultUrl={values.coverImage} defaultAlt={values.coverAlt} />
        </div>

        <div className="admin-panel">
          <p className="admin-panel-title">Arama motoru</p>

          <div className="admin-field">
            <label htmlFor="slug" className="admin-label">
              Adres (slug)
            </label>
            <input
              id="slug"
              name="slug"
              type="text"
              maxLength={90}
              defaultValue={values.slug}
              className="admin-input"
              placeholder="otomatik oluşturulur"
            />
            <p className="admin-hint">
              {isEdit
                ? 'Yayındaki bir haberin adresini değiştirmek eski bağlantıları bozar.'
                : 'Boş bırakırsanız başlıktan üretilir.'}
            </p>
            {fieldError('slug') && <p className="admin-error">{fieldError('slug')}</p>}
          </div>

          <div className="admin-field">
            <label htmlFor="seoTitle" className="admin-label">
              SEO başlığı
            </label>
            <input
              id="seoTitle"
              name="seoTitle"
              type="text"
              maxLength={70}
              value={seoTitle}
              onChange={(event) => setSeoTitle(event.target.value)}
              className="admin-input"
              placeholder="Boş bırakılırsa haber başlığı kullanılır"
            />
            <p className={`admin-hint ${seoTitle.length > 60 ? styles.warn : ''}`}>
              {seoTitle.length}/70 karakter
            </p>
          </div>

          <div className="admin-field">
            <label htmlFor="seoDescription" className="admin-label">
              SEO açıklaması
            </label>
            <textarea
              id="seoDescription"
              name="seoDescription"
              rows={3}
              maxLength={180}
              value={seoDescription}
              onChange={(event) => setSeoDescription(event.target.value)}
              className="admin-textarea"
              placeholder="Boş bırakılırsa spot kullanılır"
            />
            <p className={`admin-hint ${seoDescription.length > 160 ? styles.warn : ''}`}>
              {seoDescription.length}/180 karakter
            </p>
          </div>
        </div>
      </aside>
    </form>
  );
}
