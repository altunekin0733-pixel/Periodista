import { NextResponse } from 'next/server';

import { getSession } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rate-limit';
import { UploadError, uploadImage } from '@/lib/storage';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: 'Yetkisiz istek.' }, { status: 401 });
  }

  const limit = checkRateLimit(`upload:${session.username}`, 40, 60 * 1000);

  if (!limit.allowed) {
    return NextResponse.json(
      { error: 'Çok fazla yükleme yapıldı, biraz bekleyin.' },
      { status: 429, headers: { 'retry-after': String(limit.retryAfterSeconds) } },
    );
  }

  const formData = await request.formData();
  const file = formData.get('file');

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Dosya bulunamadı.' }, { status: 400 });
  }

  try {
    const result = await uploadImage(file);

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof UploadError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.error('Görsel yüklenemedi', error);

    return NextResponse.json({ error: 'Görsel yüklenemedi.' }, { status: 500 });
  }
}
