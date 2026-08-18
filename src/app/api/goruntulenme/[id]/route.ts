import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import { checkRateLimit, pruneRateLimits } from '@/lib/rate-limit';

export const runtime = 'nodejs';

/** Aynı ziyaretçi aynı haberi dakikada en fazla bu kadar kez sayabilir. */
const MAX_VIEWS_PER_MINUTE = 3;
const WINDOW_MS = 60_000;

async function clientKey(): Promise<string> {
  const headerList = await headers();
  const forwarded = headerList.get('x-forwarded-for');

  return forwarded?.split(',')[0]?.trim() || headerList.get('x-real-ip') || 'bilinmeyen';
}

/**
 * Okunma sayacı. İstemci tarafındaki tekrar koruması atlanabildiği için
 * sunucuda da IP başına sınır uygulanır. Hata durumunda sessizce 204 döner;
 * sayaç arızası okuma deneyimini etkilememelidir.
 */
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  pruneRateLimits();

  const limit = checkRateLimit(`view:${await clientKey()}:${id}`, MAX_VIEWS_PER_MINUTE, WINDOW_MS);

  if (!limit.allowed) {
    return new NextResponse(null, { status: 204 });
  }

  try {
    await prisma.article.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });
  } catch {
    return new NextResponse(null, { status: 204 });
  }

  return new NextResponse(null, { status: 204 });
}
