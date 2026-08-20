import Link from 'next/link';

import { categoryHref } from '@/lib/routes';
import { getCategories } from '@/server/queries';

import { HeaderActions } from './HeaderActions';
import { Logo } from './Logo';
import styles from './SiteHeader.module.css';

export async function SiteHeader() {
  const categories = await getCategories();

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <Logo height={36} priority />
        </div>

        <nav className={styles.nav} aria-label="Kategoriler">
          <ul className={styles.navList}>
            {categories.map((category) => (
              <li key={category.slug}>
                <Link href={categoryHref(category.slug)} className={styles.navLink}>
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <HeaderActions categories={categories} />
      </div>
    </header>
  );
}
