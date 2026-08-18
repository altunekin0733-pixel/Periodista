type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

/**
 * Basit sabit pencereli sayaç. Sunucusuz ortamda her örneğin kendi belleği
 * olduğu için mutlak bir garanti değildir; kaba kuvvet denemelerini
 * yavaşlatmayı hedefler. Daha sıkı koruma için Vercel Firewall veya
 * paylaşımlı bir sayaç (Upstash/Redis) önerilir.
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });

    return { allowed: true, retryAfterSeconds: 0 };
  }

  bucket.count += 1;

  if (bucket.count > limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000),
    };
  }

  return { allowed: true, retryAfterSeconds: 0 };
}

/** Bellek sızıntısını önlemek için süresi dolmuş kayıtları ayıklar. */
export function pruneRateLimits(): void {
  const now = Date.now();

  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}
