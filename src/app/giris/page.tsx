import type { Metadata } from 'next';

import { Logo } from '@/components/site/Logo';

import { LoginForm } from './LoginForm';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Yönetici Girişi',
  robots: { index: false, follow: false },
};

type PageProps = {
  searchParams: Promise<{ devam?: string }>;
};

export default async function LoginPage({ searchParams }: PageProps) {
  const { devam } = await searchParams;
  const redirectTo = devam?.startsWith('/') && !devam.startsWith('//') ? devam : '/admin';

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <Logo height={30} href="/" />
        </div>

        <div className={styles.intro}>
          <h1 className={styles.title}>Yönetim Paneli</h1>
          <p className={styles.subtitle}>İçerik yönetimine erişmek için giriş yapın.</p>
        </div>

        <LoginForm redirectTo={redirectTo} />
      </div>
    </main>
  );
}
