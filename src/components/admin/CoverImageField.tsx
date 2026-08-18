'use client';

import { ImagePlus, LoaderCircle, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';

import styles from './CoverImageField.module.css';

type CoverImageFieldProps = {
  defaultUrl: string;
  defaultAlt: string;
};

const RECOMMENDED = '1600 × 900 piksel (16:9), en az 1200 × 675';

export function CoverImageField({ defaultUrl, defaultAlt }: CoverImageFieldProps) {
  const [url, setUrl] = useState(defaultUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/yukle', { method: 'POST', body: formData });
      const payload = await response.json();

      if (!response.ok) {
        setError(payload.error ?? 'Görsel yüklenemedi.');
        return;
      }

      setUrl(payload.url);
    } catch {
      setError('Görsel yüklenirken bağlantı hatası oluştu.');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.head}>
        <span className="admin-label">Kapak görseli</span>
        <span className="admin-hint">Önerilen: {RECOMMENDED}</span>
      </div>

      <div
        className={styles.dropzone}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          const file = event.dataTransfer.files?.[0];
          if (file) void handleFile(file);
        }}
      >
        {url ? (
          <>
            {/* Yükleme önizlemesi — optimizasyon gerekmez, ham adres gösterilir. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className={styles.preview} />
            <button
              type="button"
              className={styles.remove}
              onClick={() => setUrl('')}
              aria-label="Kapak görselini kaldır"
              title="Kaldır"
            >
              <Trash2 size={15} aria-hidden="true" />
            </button>
          </>
        ) : (
          <label className={styles.placeholder}>
            {uploading ? (
              <LoaderCircle size={24} className={styles.spinner} aria-hidden="true" />
            ) : (
              <ImagePlus size={24} aria-hidden="true" />
            )}
            <span className={styles.placeholderTitle}>
              {uploading ? 'Yükleniyor…' : 'Görsel seçin veya sürükleyin'}
            </span>
            <span className="admin-hint">JPG, PNG, WebP veya AVIF · en fazla 8 MB</span>
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              className={styles.fileInput}
              disabled={uploading}
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void handleFile(file);
              }}
            />
          </label>
        )}
      </div>

      {error && (
        <p className="admin-error" role="alert">
          {error}
        </p>
      )}

      <div className="admin-field">
        <label htmlFor="coverAlt" className="admin-label">
          Görsel açıklaması
        </label>
        <input
          id="coverAlt"
          name="coverAlt"
          type="text"
          defaultValue={defaultAlt}
          maxLength={200}
          className="admin-input"
          placeholder="Görselde ne olduğunu kısaca anlatın"
        />
        <p className="admin-hint">
          Ekran okuyucular ve görselin yüklenemediği durumlar için kullanılır.
        </p>
      </div>

      <input type="hidden" name="coverImage" value={url} readOnly />
    </div>
  );
}
