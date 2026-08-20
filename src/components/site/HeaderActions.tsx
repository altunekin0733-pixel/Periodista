'use client';

import { Menu, Search, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useId, useRef, useState } from 'react';

import { categoryHref } from '@/lib/routes';

import { ThemeToggle } from './ThemeToggle';
import styles from './HeaderActions.module.css';

type Category = { slug: string; name: string };

type HeaderActionsProps = {
  categories: Category[];
};

export function HeaderActions({ categories }: HeaderActionsProps) {
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchPanelId = useId();
  const menuPanelId = useId();

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  // Menü açıkken arka planın kaymasını engelle.
  useEffect(() => {
    if (!menuOpen) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previous;
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!searchOpen && !menuOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape') return;

      setSearchOpen(false);
      setMenuOpen(false);
    }

    document.addEventListener('keydown', onKeyDown);

    return () => document.removeEventListener('keydown', onKeyDown);
  }, [searchOpen, menuOpen]);

  function submitSearch(event: React.FormEvent) {
    event.preventDefault();

    const term = query.trim();
    if (term.length < 2) return;

    setSearchOpen(false);
    setMenuOpen(false);
    router.push(`/arama?q=${encodeURIComponent(term)}`);
  }

  return (
    <div className={styles.actions}>
      <button
        type="button"
        className={styles.iconButton}
        onClick={() => setSearchOpen((open) => !open)}
        aria-label={searchOpen ? 'Aramayı kapat' : 'Aramayı aç'}
        aria-expanded={searchOpen}
        aria-controls={searchPanelId}
      >
        {searchOpen ? <X size={18} aria-hidden="true" /> : <Search size={17} aria-hidden="true" />}
      </button>

      <ThemeToggle />

      <button
        type="button"
        className={`${styles.iconButton} ${styles.menuButton}`}
        onClick={() => setMenuOpen((open) => !open)}
        aria-label={menuOpen ? 'Menüyü kapat' : 'Menüyü aç'}
        aria-expanded={menuOpen}
        aria-controls={menuPanelId}
      >
        {menuOpen ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
      </button>

      {/*
        Arama şeridi başlık satırının altına açılır. Satır içinde büyüseydi
        kategori menüsüyle yer kavgasına girer, biri diğerinin üstüne binerdi;
        alt şeritte hem menü hem düğmeler yerinde kalıyor.
      */}
      {searchOpen && (
        <form id={searchPanelId} className={styles.searchPanel} onSubmit={submitSearch} role="search">
          <div className={styles.searchRow}>
            <Search size={17} className={styles.searchIcon} aria-hidden="true" />
            <input
              ref={searchInputRef}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Haberlerde ara…"
              className={styles.searchInput}
              aria-label="Haberlerde ara"
            />
            <button type="submit" className={styles.searchSubmit} disabled={query.trim().length < 2}>
              Ara
            </button>
          </div>
        </form>
      )}

      {menuOpen && (
        <>
          <div className={styles.backdrop} onClick={() => setMenuOpen(false)} aria-hidden="true" />
          <nav id={menuPanelId} className={styles.drawer} aria-label="Kategoriler">
            <p className="label-caps">Kategoriler</p>
            <ul className={styles.drawerList}>
              {categories.map((category) => (
                <li key={category.slug}>
                  <Link
                    href={categoryHref(category.slug)}
                    className={styles.drawerLink}
                    onClick={() => setMenuOpen(false)}
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </>
      )}
    </div>
  );
}
