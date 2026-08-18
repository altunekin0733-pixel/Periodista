'use client';

import { Check, Copy } from 'lucide-react';
import { useEffect, useState } from 'react';

/**
 * Adresleri panoya kopyalar. İndirme yerine kopyalama seçildi çünkü liste
 * çoğunlukla doğrudan bir e-posta aracına yapıştırılıyor.
 */
export function SubscriberExport({ emails }: { emails: string[] }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;

    const timer = window.setTimeout(() => setCopied(false), 2000);

    return () => window.clearTimeout(timer);
  }, [copied]);

  async function copyAll() {
    try {
      await navigator.clipboard.writeText(emails.join(', '));
      setCopied(true);
    } catch {
      window.alert('Panoya kopyalanamadı. Tarayıcı izinlerini kontrol edin.');
    }
  }

  return (
    <button type="button" onClick={copyAll} className="admin-button is-ghost">
      {copied ? <Check size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}
      {copied ? 'Kopyalandı' : 'Adresleri kopyala'}
    </button>
  );
}
