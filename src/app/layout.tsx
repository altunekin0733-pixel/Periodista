import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';

import { SITE, getSiteUrl } from '@/lib/site-config';

import './globals.css';

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: `${SITE.name} — Güncel Haberler`,
    template: `%s — ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  alternates: {
    canonical: '/',
    types: { 'application/rss+xml': '/rss.xml' },
  },
  openGraph: {
    type: 'website',
    siteName: SITE.name,
    locale: SITE.locale,
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0b1326' },
    { media: '(prefers-color-scheme: light)', color: '#f3f5f9' },
  ],
};

/**
 * Tema tercihini ilk boyamadan önce uygular. Bu satır olmadan koyu temadan
 * açık temaya geçen kullanıcı her yüklemede kısa bir yanıp sönme görürdü.
 */
const themeBootstrap = `(function(){try{var t=localStorage.getItem('periodista-theme');if(t==='light'||t==='dark'){document.documentElement.setAttribute('data-theme',t);}}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={SITE.language} className={inter.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
