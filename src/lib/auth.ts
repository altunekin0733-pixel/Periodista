import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';

export const SESSION_COOKIE = 'periodista_session';

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 gün
const ISSUER = 'periodista';
const AUDIENCE = 'periodista-admin';

export type SessionPayload = {
  username: string;
};

function getSecretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error(
      'AUTH_SECRET tanımlı değil veya 32 karakterden kısa. `openssl rand -base64 32` ile üretip ortam değişkenlerine ekleyin.',
    );
  }

  return new TextEncoder().encode(secret);
}

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ username: payload.username })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(getSecretKey());
}

/** Edge (proxy) ve Node çalışma zamanlarının ikisinde de kullanılabilir. */
export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey(), {
      issuer: ISSUER,
      audience: AUDIENCE,
    });

    const username = payload.username;

    return typeof username === 'string' ? { username } : null;
  } catch {
    return null;
  }
}

export async function startSession(username: string): Promise<void> {
  const token = await createSessionToken({ username });
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function endSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) return null;

  return verifySessionToken(token);
}

/**
 * Yönetim işlemlerinde ilk satır olarak çağrılır. Oturum yoksa işlem hiç
 * başlamadan hata fırlatır — proxy katmanına ek olarak ikinci savunma hattı.
 */
export async function requireSession(): Promise<SessionPayload> {
  const session = await getSession();

  if (!session) {
    throw new Error('Bu işlem için yönetici oturumu gerekli.');
  }

  return session;
}
