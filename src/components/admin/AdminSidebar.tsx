'use client';

import {
  ExternalLink,
  FileText,
  FolderTree,
  LayoutDashboard,
  LayoutPanelLeft,
  LogOut,
  Mail,
  MessageSquare,
  Newspaper,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

import { Logo } from '@/components/site/Logo';
import { ThemeToggle } from '@/components/site/ThemeToggle';
import { logout } from '@/server/actions/auth';

import styles from './AdminSidebar.module.css';

const NAV_ITEMS = [
  { href: '/admin', label: 'Genel Bakış', icon: LayoutDashboard, exact: true },
  { href: '/admin/haberler', label: 'Haberler', icon: Newspaper, exact: false },
  { href: '/admin/kategoriler', label: 'Kategoriler', icon: FolderTree, exact: false },
  { href: '/admin/paneller', label: 'Paneller', icon: LayoutPanelLeft, exact: false },
  { href: '/admin/sayfalar', label: 'Sayfalar', icon: FileText, exact: false },
  { href: '/admin/yorumlar', label: 'Yorumlar', icon: MessageSquare, exact: false, badge: true },
  { href: '/admin/aboneler', label: 'Aboneler', icon: Mail, exact: false },
  { href: '/admin/ayarlar', label: 'Ayarlar', icon: Settings, exact: false },
] as const;

type AdminSidebarProps = {
  username: string;
  pendingComments: number;
};

export function AdminSidebar({ username, pendingComments }: AdminSidebarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  function isActive(href: string, exact: boolean): boolean {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  return (
    <>
      <button
        type="button"
        className={styles.toggle}
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? 'Menüyü kapat' : 'Menüyü aç'}
        aria-expanded={open}
      >
        {open ? <PanelLeftClose size={18} aria-hidden="true" /> : <PanelLeftOpen size={18} aria-hidden="true" />}
      </button>

      {open && <div className={styles.backdrop} onClick={() => setOpen(false)} aria-hidden="true" />}

      <aside className={`${styles.sidebar} ${open ? styles.sidebarOpen : ''}`}>
        <div className={styles.brand}>
          <Logo height={26} href="/admin" />
        </div>

        <nav className={styles.nav} aria-label="Yönetim menüsü">
          <ul className={styles.navList}>
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href, item.exact);
              const showBadge = 'badge' in item && item.badge && pendingComments > 0;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`${styles.navLink} ${active ? styles.navLinkActive : ''}`}
                    aria-current={active ? 'page' : undefined}
                    onClick={() => setOpen(false)}
                  >
                    <Icon size={17} aria-hidden="true" />
                    <span className={styles.navLabel}>{item.label}</span>
                    {showBadge && (
                      <span className={styles.badge} aria-label={`${pendingComments} bekleyen`}>
                        {pendingComments}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className={styles.footer}>
          {username && (
            <p className={styles.user}>
              <span className={styles.userLabel}>Oturum</span>
              <span className={styles.userName}>{username}</span>
            </p>
          )}

          <div className={styles.footerRow}>
            <ThemeToggle />

            <Link href="/" className={styles.footerLink} title="Siteyi görüntüle">
              <ExternalLink size={16} aria-hidden="true" />
              <span>Siteyi gör</span>
            </Link>
          </div>

          <form action={logout}>
            <button type="submit" className={styles.logout}>
              <LogOut size={16} aria-hidden="true" />
              Çıkış yap
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
