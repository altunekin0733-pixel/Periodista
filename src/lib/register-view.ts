const SESSION_PREFIX = 'periodista-view:';

/**
 * Okunma sayacını tarayıcı tarafından bildirir. Aynı sekmede aynı haber
 * yalnızca bir kez sayılır; sunucu tarafında ayrıca IP başına sınır vardır.
 */
export function registerView(articleId: string): void {
  const key = `${SESSION_PREFIX}${articleId}`;

  try {
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, '1');
  } catch {
    // sessionStorage kapalıysa yine de bir kez sayılsın.
  }

  fetch(`/api/goruntulenme/${articleId}`, { method: 'POST', keepalive: true }).catch(() => {
    // Sayaç hatası okuma deneyimini etkilemez.
  });
}
