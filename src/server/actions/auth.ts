'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { endSession, startSession } from '@/lib/auth';
import { verifyCredentials } from '@/lib/credentials';
import { checkRateLimit, pruneRateLimits } from '@/lib/rate-limit';
import type { LoginState } from './form-state';

const MAX_ATTEMPTS = 8;
const WINDOW_MS = 10 * 60 * 1000; // 10 dakika

async function clientKey(): Promise<string> {
  const headerList = await headers();
  const forwarded = headerList.get('x-forwarded-for');

  return forwarded?.split(',')[0]?.trim() || headerList.get('x-real-ip') || 'bilinmeyen';
}

export async function login(_previous: LoginState, formData: FormData): Promise<LoginState> {
  const username = String(formData.get('username') ?? '');
  const password = String(formData.get('password') ?? '');
  const redirectTo = String(formData.get('redirectTo') ?? '/admin');

  if (!username.trim() || !password) {
    return { error: 'Kullanıcı adı ve şifre gerekli.' };
  }

  pruneRateLimits();
  const limit = checkRateLimit(`login:${await clientKey()}`, MAX_ATTEMPTS, WINDOW_MS);

  if (!limit.allowed) {
    const minutes = Math.ceil(limit.retryAfterSeconds / 60);

    return { error: `Çok fazla deneme yapıldı. ${minutes} dakika sonra tekrar deneyin.` };
  }

  const result = await verifyCredentials(username, password);

  if (!result.ok) {
    if (result.reason === 'not-configured') {
      return {
        error:
          'Yönetici hesabı tanımlı değil. ADMIN_USERNAME ve ADMIN_PASSWORD_HASH ortam değişkenlerini ayarlayın.',
      };
    }

    if (result.reason === 'not-hashed') {
      return {
        error:
          'ADMIN_PASSWORD_HASH ham şifre içeriyor. Bu alana şifrenin kendisi değil, `npm run admin:hash -- "sifreniz"` komutunun ürettiği $2b$ ile başlayan özet yazılmalı.',
      };
    }

    // Hangi alanın yanlış olduğu belirtilmez.
    return { error: 'Kullanıcı adı veya şifre hatalı.' };
  }

  await startSession(result.username);

  // Açık yönlendirme (open redirect) engellenir: yalnızca site içi yollar.
  redirect(redirectTo.startsWith('/') && !redirectTo.startsWith('//') ? redirectTo : '/admin');
}

export async function logout(): Promise<void> {
  await endSession();
  redirect('/giris');
}
