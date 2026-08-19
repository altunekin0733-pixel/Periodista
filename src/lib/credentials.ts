import bcrypt from 'bcryptjs';

/**
 * Tek yönetici hesabı ortam değişkenlerinde tutulur:
 *   ADMIN_USERNAME       — kullanıcı adı
 *   ADMIN_PASSWORD_HASH  — bcrypt özeti (`npm run admin:hash -- <sifre>`)
 *
 * Bu modül yalnızca Node çalışma zamanında (server action) kullanılır.
 */

const BCRYPT_PREFIX = /^\$2[aby]\$/;

export type CredentialCheck =
  | { ok: true; username: string }
  | { ok: false; reason: 'not-configured' | 'not-hashed' | 'invalid' };

export async function verifyCredentials(
  username: string,
  password: string,
): Promise<CredentialCheck> {
  const expectedUsername = process.env.ADMIN_USERNAME;
  const passwordHash = process.env.ADMIN_PASSWORD_HASH;

  if (!expectedUsername || !passwordHash) {
    return { ok: false, reason: 'not-configured' };
  }

  // Sık yapılan hata: ham şifre yapıştırmak. Bunu "hiç ayarlanmamış" saymak
  // yanıltıcı olduğu için ayrı bir durum olarak bildiriyoruz.
  if (!BCRYPT_PREFIX.test(passwordHash)) {
    return { ok: false, reason: 'not-hashed' };
  }

  // Kullanıcı adı yanlış olsa bile hash karşılaştırması yapılır; böylece
  // yanıt süresi üzerinden kullanıcı adı tahmin edilemez.
  const passwordMatches = await bcrypt.compare(password, passwordHash);
  const usernameMatches = timingSafeEqual(username.trim(), expectedUsername);

  if (!passwordMatches || !usernameMatches) {
    return { ok: false, reason: 'invalid' };
  }

  return { ok: true, username: expectedUsername };
}

function timingSafeEqual(a: string, b: string): boolean {
  const maxLength = Math.max(a.length, b.length);
  let mismatch = a.length === b.length ? 0 : 1;

  for (let index = 0; index < maxLength; index += 1) {
    mismatch |= (a.charCodeAt(index) || 0) ^ (b.charCodeAt(index) || 0);
  }

  return mismatch === 0;
}

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 12);
}
