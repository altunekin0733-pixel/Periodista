import { NextResponse } from 'next/server';
import { z } from 'zod';

import { FEED_BATCH_SIZE, toFeedArticle } from '@/lib/reader-feed';
import { getReaderFeed } from '@/server/queries';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Okuyucunun akışında zaten görünen haber sayısının üst sınırı. */
const MAX_EXCLUDED = 40;

const querySchema = z.object({
  // İmleç: bu tarihten daha eski haberler getirilir.
  once: z.iso.datetime(),
  haric: z.string().max(2000).optional(),
});

function parseExcluded(raw: string | undefined): string[] {
  if (!raw) return [];

  return raw
    .split(',')
    .map((value) => value.trim())
    .filter((value) => /^[A-Za-z0-9_-]{1,40}$/.test(value))
    .slice(0, MAX_EXCLUDED);
}

/**
 * Haber sayfasında aşağı kaydırma sürdükçe gelen sonraki haberler.
 * Yalnızca yayınlanmış içerik döner; gövdeler kayıt anında sanitize edilmiştir.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);

  const parsed = querySchema.safeParse({
    once: url.searchParams.get('once') ?? '',
    haric: url.searchParams.get('haric') ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: 'Geçersiz istek.' }, { status: 400 });
  }

  const articles = await getReaderFeed({
    before: new Date(parsed.data.once),
    excludeIds: parseExcluded(parsed.data.haric),
    limit: FEED_BATCH_SIZE,
  });

  return NextResponse.json(
    { articles: articles.map(toFeedArticle) },
    { headers: { 'cache-control': 'private, max-age=60' } },
  );
}
