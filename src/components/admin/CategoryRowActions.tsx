'use client';

import { useState } from 'react';

import { deleteCategory, moveCategoryArticles } from '@/server/actions/categories';

import { ConfirmSubmit } from './ConfirmSubmit';
import styles from './CategoryRowActions.module.css';

type CategoryRowActionsProps = {
  category: { id: string; name: string; articleCount: number };
  others: { id: string; name: string }[];
};

/**
 * Dolu bir kategori doğrudan silinemez. Önce haberleri başka bir kategoriye
 * taşımak gerekir; böylece tek tıkla içerik kaybı yaşanmaz.
 */
export function CategoryRowActions({ category, others }: CategoryRowActionsProps) {
  const [showMove, setShowMove] = useState(false);
  const hasArticles = category.articleCount > 0;

  if (!hasArticles) {
    return (
      <form action={deleteCategory}>
        <input type="hidden" name="id" value={category.id} />
        <ConfirmSubmit
          className="admin-button is-danger is-small"
          message={`"${category.name}" kategorisini silmek istediğinize emin misiniz?`}
        >
          Sil
        </ConfirmSubmit>
      </form>
    );
  }

  if (others.length === 0) {
    return (
      <span className="admin-hint" title="Taşınacak başka kategori yok">
        {category.articleCount} haber
      </span>
    );
  }

  return (
    <div className={styles.wrapper}>
      <button
        type="button"
        className="admin-button is-ghost is-small"
        onClick={() => setShowMove((value) => !value)}
        aria-expanded={showMove}
      >
        Haberleri taşı
      </button>

      {showMove && (
        <form action={moveCategoryArticles} className={styles.movePanel}>
          <input type="hidden" name="fromId" value={category.id} />

          <label htmlFor={`move-${category.id}`} className="admin-hint">
            {category.articleCount} haber şu kategoriye taşınsın:
          </label>

          <div className={styles.moveRow}>
            <select
              id={`move-${category.id}`}
              name="toId"
              className="admin-select"
              defaultValue={others[0].id}
            >
              {others.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>

            <ConfirmSubmit
              className="admin-button is-small"
              message={`${category.articleCount} haber taşınacak. Onaylıyor musunuz?`}
            >
              Taşı
            </ConfirmSubmit>
          </div>
        </form>
      )}
    </div>
  );
}
