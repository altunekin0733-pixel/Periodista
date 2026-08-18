'use client';

import { useEffect } from 'react';

const SESSION_PREFIX = 'periodista-view:';

/**
 * Okunma sayısını sayfa önbelleğe alındıktan sonra, tarayıcı tarafından
 * bildirir. Aynı sekmede aynı haber tekrar sayılmaz.
 */
export function ViewCounter({ articleId }: { articleId: string }) {
  useEffect(() => {
    const key = `${SESSION_PREFIX}${articleId}`;

    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, '1');
    } catch {
      // sessionStorage kapalıysa yine de bir kez sayılsın.
    }

    const controller = new AbortController();

    fetch(`/api/goruntulenme/${articleId}`, {
      method: 'POST',
      signal: controller.signal,
      keepalive: true,
    }).catch(() => {
      // Sayaç hatası okuma deneyimini etkilemez.
    });

    return () => controller.abort();
  }, [articleId]);

  return null;
}
