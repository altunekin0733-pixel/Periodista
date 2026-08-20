'use client';

import { useEffect } from 'react';

import { registerView } from '@/lib/register-view';

/** Sayfa önbelleğe alındıktan sonra okunmayı tarayıcı tarafından bildirir. */
export function ViewCounter({ articleId }: { articleId: string }) {
  useEffect(() => {
    registerView(articleId);
  }, [articleId]);

  return null;
}
