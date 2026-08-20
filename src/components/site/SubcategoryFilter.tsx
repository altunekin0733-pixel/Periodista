import Link from 'next/link';

import { subsectionHref } from '@/lib/routes';
import { getSubsections } from '@/lib/site-config';

import styles from './SubcategoryFilter.module.css';

type SubcategoryFilterProps = {
  categorySlug: string;
  categoryName: string;
  /** Etkin dal slug'ı; `null` ise "Tümü" seçilidir. */
  active: string | null;
};

/**
 * Kategori içi dallar. Üst menüye eklenmez — dal seçimi habere verilen etikete
 * göre çalışır, bu yüzden yalnızca kategori sayfasında bir şerit olarak durur.
 */
export function SubcategoryFilter({ categorySlug, categoryName, active }: SubcategoryFilterProps) {
  const subsections = getSubsections(categorySlug);

  if (subsections.length === 0) return null;

  return (
    <nav className={styles.bar} aria-label={`${categoryName} dalları`}>
      <Link
        href={subsectionHref(categorySlug, null)}
        className={`${styles.chip} ${active === null ? styles.active : ''}`}
        aria-current={active === null ? 'page' : undefined}
      >
        Tümü
      </Link>

      {subsections.map((subsection) => (
        <Link
          key={subsection.slug}
          href={subsectionHref(categorySlug, subsection.slug)}
          className={`${styles.chip} ${active === subsection.slug ? styles.active : ''}`}
          aria-current={active === subsection.slug ? 'page' : undefined}
        >
          {subsection.name}
        </Link>
      ))}
    </nav>
  );
}
