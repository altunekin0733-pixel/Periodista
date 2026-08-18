import Image from 'next/image';
import Link from 'next/link';

import { SITE } from '@/lib/site-config';

import styles from './Logo.module.css';

type LogoProps = {
  variant?: string;
  height?: number;
  priority?: boolean;
  href?: string | null;
};

/**
 * Logo tek renklidir; koyu temada CSS `invert` ile beyaza döner. Böylece iki
 * ayrı dosya indirmek yerine tek görsel yeterli olur.
 */
const VARIANTS = {
  default: { src: '/marka/logo-black.png', width: 1413, height: 277 },
  sports: { src: '/marka/logo-sports-black.png', width: 1319, height: 423 },
} as const;

export function Logo({ variant = 'default', height = 40, priority = false, href = '/' }: LogoProps) {
  const asset = VARIANTS[variant as keyof typeof VARIANTS] ?? VARIANTS.default;
  const width = Math.round((asset.width / asset.height) * height);

  const image = (
    <Image
      src={asset.src}
      alt={SITE.name}
      width={width}
      height={height}
      priority={priority}
      className={styles.image}
      sizes={`${width}px`}
    />
  );

  if (!href) {
    return <span className={styles.wrapper}>{image}</span>;
  }

  return (
    <Link href={href} className={styles.wrapper} aria-label={`${SITE.name} ana sayfa`}>
      {image}
    </Link>
  );
}
