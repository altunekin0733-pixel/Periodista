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
    // Çalışma anında OIDC token'ı ortam değişkeninde değil, istek başlığında gelir.
    const result = await uploadImage(file, {
      oidcToken: request.headers.get('x-vercel-oidc-token'),
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof UploadError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.error('Görsel yüklenemedi', error);

    // Bu uç noktaya yalnızca oturum açmış yönetici erişebiliyor; kendi
    // sistemindeki arızayı teşhis edebilmesi için sebebi gizlemiyoruz.
    // Yığın izi değil, yalnızca hata mesajı döner.
    const reason = error instanceof Error ? error.message : 'bilinmeyen hata';

    return NextResponse.json({ error: `Görsel yüklenemedi: ${reason}` }, { status: 500 });
  }
}
