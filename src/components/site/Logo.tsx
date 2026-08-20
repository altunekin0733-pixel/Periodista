import Image from 'next/image';
import Link from 'next/link';

import { SITE } from '@/lib/site-config';

import styles from './Logo.module.css';

type LogoProps = {
  height?: number;
  priority?: boolean;
  href?: string | null;
};

/**
 * Tek marka, tek dosya. Logo tek renklidir; koyu temada CSS `invert` ile
 * beyaza döner, böylece ikinci bir görsel indirmeye gerek kalmaz.
 */
const ASSET = { src: '/marka/logo-black.png', width: 1413, height: 277 } as const;

export function Logo({ height = 40, priority = false, href = '/' }: LogoProps) {
  const width = Math.round((ASSET.width / ASSET.height) * height);

  const image = (
    <Image
      src={ASSET.src}
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
