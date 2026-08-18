import type { NextConfig } from 'next';

/**
 * GitHub Pages proje sitesi `kullanici.github.io/Periodista/` altında yayınlanır,
 * bu yüzden tüm adreslerin başına `/Periodista` gelmelidir. Kendi alan adınızı
 * bağladığınızda bu değişkeni boş bırakın; ön ek kendiliğinden kalkar.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

const nextConfig: NextConfig = {
  // Sunucu yok: her sayfa derleme anında HTML dosyasına dönüşür.
  output: 'export',

  basePath,
  // Statik sunucularda `/adres/` -> `/adres/index.html` eşlemesi için gerekli.
  trailingSlash: true,

  images: {
    // Görsel optimizasyonu sunucu gerektirir; statik dışa aktarımda kapalıdır.
    unoptimized: true,
  },
};

export default nextConfig;
