'use client';

import { Check, Link2, Share2 } from 'lucide-react';
import { useEffect, useState, useSyncExternalStore } from 'react';

import { SocialIcon } from '@/components/ui/SocialIcon';

import styles from './ShareBar.module.css';

type ShareBarProps = {
  url: string;
  title: string;
};

/** Tarayıcı yeteneği hiç değişmez; abonelik boş, sunucu anlık görüntüsü `false`. */
const NO_SUBSCRIPTION = () => () => {};

function readCanShare(): boolean {
  return typeof navigator !== 'undefined' && typeof navigator.share === 'function';
}

export function ShareBar({ url, title }: ShareBarProps) {
  const [copied, setCopied] = useState(false);
  const canShare = useSyncExternalStore(NO_SUBSCRIPTION, readCanShare, () => false);

  useEffect(() => {
    if (!copied) return;

    const timer = window.setTimeout(() => setCopied(false), 2000);

    return () => window.clearTimeout(timer);
  }, [copied]);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const targets = [
    { key: 'x', name: "X'te paylaş", href: `https://x.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}` },
    { key: 'facebook', name: "Facebook'ta paylaş", href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}` },
    { key: 'telegram', name: "Telegram'da paylaş", href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}` },
  ];

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      // Pano izni yoksa sessizce geç — kullanıcı adresi çubuktan kopyalayabilir.
    }
  }

  async function nativeShare() {
    try {
      await navigator.share({ title, url });
    } catch {
      // Kullanıcı paylaşımı iptal etmiş olabilir.
    }
  }

  return (
    <div className={styles.bar}>
      <span className="label-caps">Paylaş</span>

      <ul className={styles.list}>
        {targets.map((target) => (
          <li key={target.key}>
            <a
              href={target.href}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.button}
              title={target.name}
              aria-label={target.name}
            >
              <SocialIcon platform={target.key} size={16} />
            </a>
          </li>
        ))}

        <li>
          <button
            type="button"
            onClick={copyLink}
            className={styles.button}
            aria-label={copied ? 'Bağlantı kopyalandı' : 'Bağlantıyı kopyala'}
            title={copied ? 'Kopyalandı' : 'Bağlantıyı kopyala'}
          >
            {copied ? (
              <Check size={16} className={styles.copied} aria-hidden="true" />
            ) : (
              <Link2 size={16} aria-hidden="true" />
            )}
          </button>
        </li>

        {canShare && (
          <li>
            <button
              type="button"
              onClick={nativeShare}
              className={styles.button}
              aria-label="Diğer uygulamalarla paylaş"
              title="Diğer uygulamalar"
            >
              <Share2 size={16} aria-hidden="true" />
            </button>
          </li>
        )}
      </ul>

      <span role="status" className="visually-hidden">
        {copied ? 'Bağlantı panoya kopyalandı' : ''}
      </span>
    </div>
  );
}
