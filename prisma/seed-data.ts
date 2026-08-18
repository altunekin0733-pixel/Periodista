export type SeedCategory = {
  slug: string;
  name: string;
  icon: string;
  description: string;
  position: number;
  logoVariant: 'default' | 'sports';
};

export type SeedArticle = {
  slug: string;
  category: string;
  title: string;
  dek: string;
  author: string;
  publishedAt: string;
  paragraphs: string[];
  tags: string[];
  featured?: boolean;
  breaking?: boolean;
  draft?: boolean;
};

export const SEED_CATEGORIES: SeedCategory[] = [
  {
    slug: 'gundem',
    name: 'Gündem',
    icon: 'newspaper',
    description: 'Ülke ve şehir gündeminden öne çıkan gelişmeler.',
    position: 0,
    logoVariant: 'default',
  },
  {
    slug: 'spor',
    name: 'Spor',
    icon: 'sports_soccer',
    description: 'Sahadan sahaya, güncel spor gelişmeleri.',
    position: 1,
    logoVariant: 'sports',
  },
  {
    slug: 'dunya',
    name: 'Dünya',
    icon: 'public',
    description: 'Küresel siyaset ve dış politikadan seçmeler.',
    position: 2,
    logoVariant: 'default',
  },
  {
    slug: 'ekonomi',
    name: 'Ekonomi',
    icon: 'trending_up',
    description: 'Piyasalar, para politikası ve iş dünyası.',
    position: 3,
    logoVariant: 'default',
  },
  {
    slug: 'teknoloji',
    name: 'Teknoloji',
    icon: 'memory',
    description: 'Yazılım, donanım ve yapay zekâdan gelişmeler.',
    position: 4,
    logoVariant: 'default',
  },
  {
    slug: 'kultur-sanat',
    name: 'Kültür-Sanat',
    icon: 'theater_comedy',
    description: 'Sahne, sinema ve sanattan öne çıkanlar.',
    position: 5,
    logoVariant: 'default',
  },
  {
    slug: 'yasam',
    name: 'Yaşam',
    icon: 'eco',
    description: 'Şehir hayatı, sağlık ve günlük yaşam.',
    position: 6,
    logoVariant: 'default',
  },
  {
    slug: 'podcast',
    name: 'Podcast',
    icon: 'mic',
    description: 'Periodista seslerinden haftalık bölümler.',
    position: 7,
    logoVariant: 'default',
  },
];

/** Tasarımdaki örnek içerik; ilk kurulumda siteyi dolu göstermek için. */
export const SEED_ARTICLES: SeedArticle[] = [
  {
    slug: 'kentsel-donusumde-yeni-donem-basvurular-aciliyor',
    category: 'gundem',
    title: 'Kentsel dönüşümde yeni dönem: başvurular bugün açılıyor',
    dek: 'Çevre ve Şehircilik Bakanlığı, deprem riski taşıyan bölgelerde dönüşüm başvuru sürecini yeniden düzenledi.',
    author: 'Elif Kaya',
    publishedAt: '2026-08-18T08:10:00+03:00',
    featured: true,
    breaking: true,
    tags: ['kentsel dönüşüm', 'deprem', 'e-Devlet'],
    paragraphs: [
      'Bakanlık, kentsel dönüşüm başvurularında dijital sisteme geçildiğini duyurdu. Vatandaşlar e-Devlet üzerinden başvuru durumunu adım adım takip edebilecek.',
      'Yeni süreçte başvurular önceliklendirilecek; deprem riski yüksek bölgeler ilk sırada değerlendirilecek. Riskli yapı tespiti yapılan binalar için ek finansman desteği de gündemde.',
      'Yetkililer, sürecin yıl sonuna kadar tamamlanmasını hedeflediklerini belirtti. Başvuru yoğunluğuna göre takvimin güncellenebileceği ifade edildi.',
    ],
  },
  {
    slug: 'meclis-tatile-giriyor-gundemdeki-son-maddeler',
    category: 'gundem',
    title: 'Meclis tatile giriyor: bu hafta gündemdeki son maddeler',
    dek: 'Genel Kurul, tatile girmeden önce bekleyen kanun tekliflerini bu hafta görüşecek.',
    author: 'Mert Aydın',
    publishedAt: '2026-08-17T14:30:00+03:00',
    tags: ['meclis', 'yasama'],
    paragraphs: [
      'Meclis gündeminde bekleyen düzenlemeler bu hafta sırasıyla ele alınacak. Komisyon aşamasını tamamlayan metinler öncelik kazanacak.',
      'Komisyonlarda görüşülen metinler Genel Kurul onayına sunulacak. Muhalefet partileri bazı maddelerde değişiklik önergesi vereceklerini açıkladı.',
    ],
  },
  {
    slug: 'super-ligde-acilis-haftasi-one-cikan-5-mucadele',
    category: 'spor',
    title: "Süper Lig'de sezonun açılış haftası: öne çıkan 5 mücadele",
    dek: 'Yeni sezonun ilk haftasında dikkat çeken karşılaşmaları derledik.',
    author: 'Barış Onur',
    publishedAt: '2026-08-18T09:00:00+03:00',
    breaking: true,
    featured: true,
    tags: ['süper lig', 'futbol'],
    paragraphs: [
      'Açılış haftasında şampiyonluk adayları sahne alacak. İlk hafta fikstürü, sezonun tonunu belirleyecek eşleşmeler içeriyor.',
      'Transfer döneminde yapılan takviyeler ilk maçlarda test edilecek. Teknik ekipler, hazırlık kampında denedikleri sistemleri sahaya taşıyacak.',
    ],
  },
  {
    slug: 'milli-takim-kadrosu-aciklandi',
    category: 'spor',
    title: 'Milli takımın kadrosu açıklandı: iki yeni isim var',
    dek: 'Teknik direktör, yaklaşan hazırlık maçları için 24 kişilik kadroyu duyurdu.',
    author: 'Barış Onur',
    publishedAt: '2026-08-16T11:20:00+03:00',
    tags: ['milli takım', 'futbol'],
    paragraphs: [
      'Kadroda genç oyunculara yer verildi. Alt yaş kategorilerinden yükselen iki isim ilk kez A takıma çağrıldı.',
      'Hazırlık maçları önümüzdeki ay oynanacak. Kamp programı ve maç takvimi federasyon tarafından paylaşıldı.',
    ],
  },
  {
    slug: 'avrupada-enerji-politikalari-yeniden-masada',
    category: 'dunya',
    title: "Avrupa'da enerji politikaları yeniden masada",
    dek: 'Kış öncesi enerji tedarik güvenliği görüşmeleri hız kazandı.',
    author: 'Zeynep Ilgaz',
    publishedAt: '2026-08-17T18:05:00+03:00',
    tags: ['enerji', 'avrupa birliği'],
    paragraphs: [
      'Avrupa Birliği üyeleri enerji depolama kapasitesini artırmayı planlıyor. Ortak alım mekanizmasının genişletilmesi de masada.',
      'Görüşmelerin sonbaharda sonuçlanması bekleniyor. Üye ülkeler arasındaki maliyet paylaşımı en tartışmalı başlık olmayı sürdürüyor.',
    ],
  },
  {
    slug: 'bolgesel-ticaret-anlasmasinda-son-adim',
    category: 'dunya',
    title: 'Bölgesel ticaret anlaşmasında son adım bekleniyor',
    dek: 'Taraflar, anlaşmanın teknik detaylarında uzlaşmaya yaklaştı.',
    author: 'Zeynep Ilgaz',
    publishedAt: '2026-08-15T10:00:00+03:00',
    tags: ['ticaret', 'diplomasi'],
    paragraphs: [
      'Müzakereler son aşamaya girdi. Gümrük tarifeleri ve menşe kuralları başlıklarında mutabakat sağlandı.',
      'Anlaşmanın yıl içinde imzalanması öngörülüyor. Onay süreçlerinin ardından yürürlük takvimi belirlenecek.',
    ],
  },
  {
    slug: 'merkez-bankasi-faiz-karari-piyasa-tepkisi',
    category: 'ekonomi',
    title: 'Merkez Bankası faiz kararını açıkladı: piyasalar nasıl tepki verdi',
    dek: 'Karar sonrası döviz ve borsa endeksinde hareketlilik gözlendi.',
    author: 'Onur Ateş',
    publishedAt: '2026-08-18T15:00:00+03:00',
    breaking: true,
    tags: ['merkez bankası', 'faiz', 'piyasalar'],
    paragraphs: [
      'Karar, analistlerin beklentileriyle büyük ölçüde örtüştü. Karar metnindeki ifade değişiklikleri yakından incelendi.',
      'Piyasa oyuncuları önümüzdeki toplantıya odaklandı. Kurumlar, yıl sonu tahminlerini güncellemeye hazırlanıyor.',
    ],
  },
  {
    slug: 'enflasyon-verileri-beklentilerin-altinda',
    category: 'ekonomi',
    title: 'Enflasyon verileri beklentilerin altında kaldı',
    dek: 'Temmuz ayı verileri, yıllık bazda yavaşlayan bir seyir gösterdi.',
    author: 'Onur Ateş',
    publishedAt: '2026-08-14T09:30:00+03:00',
    tags: ['enflasyon', 'ekonomi'],
    paragraphs: [
      'Gıda ve enerji fiyatlarındaki yavaşlama öne çıktı. Çekirdek göstergelerdeki gerileme de dikkat çekti.',
      'Ekonomistler, düşüş eğiliminin sürebileceğini belirtti. Baz etkisinin önümüzdeki aylarda belirleyici olacağı vurgulandı.',
    ],
  },
  {
    slug: 'yerli-yazilim-girisimlerine-yeni-destek-programi',
    category: 'teknoloji',
    title: 'Yerli yazılım girişimleri için yeni destek programı başladı',
    dek: 'Program kapsamında seçilen girişimlere finansman ve mentorluk desteği sağlanacak.',
    author: 'Deniz Kural',
    publishedAt: '2026-08-16T12:40:00+03:00',
    featured: true,
    tags: ['girişimcilik', 'yazılım'],
    paragraphs: [
      'Başvurular bu ay içinde değerlendirilecek. Programa erken aşamadaki ekiplerin yanı sıra ürünü olan girişimler de kabul ediliyor.',
      'Programın ikinci fazı yıl sonunda başlayacak. Seçilen ekipler uluslararası hızlandırma programlarına yönlendirilecek.',
    ],
  },
  {
    slug: 'yapay-zeka-destekli-uretim-hatlari-yayginlasiyor',
    category: 'teknoloji',
    title: 'Yapay zekâ destekli üretim hatları fabrikalarda yaygınlaşıyor',
    dek: 'Üreticiler, kalite kontrol süreçlerinde görüntü işleme sistemlerine yöneliyor.',
    author: 'Deniz Kural',
    publishedAt: '2026-08-13T08:00:00+03:00',
    tags: ['yapay zekâ', 'üretim'],
    paragraphs: [
      'Sistemler, hata oranlarını düşürmeyi hedefliyor. Görüntü işleme modelleri hattan geçen ürünleri saniyeler içinde denetliyor.',
      'Yatırımların önümüzdeki yıl artması bekleniyor. Sektör temsilcileri, geri dönüş süresinin kısaldığını belirtiyor.',
    ],
  },
  {
    slug: 'istanbulda-yeni-sezon-sahnelenecek-10-oyun',
    category: 'kultur-sanat',
    title: "İstanbul'da yeni sezon: sahnelenecek 10 oyun",
    dek: 'Şehir tiyatroları, yeni sezon programını duyurdu.',
    author: 'Selin Batur',
    publishedAt: '2026-08-12T17:15:00+03:00',
    tags: ['tiyatro', 'istanbul'],
    paragraphs: [
      'Programda klasik ve modern eserler yer alıyor. Sezonun açılışı eylül ayında yapılacak.',
      'Bilet satışları bu hafta başlıyor. Öğrenci ve öğretmenlere yönelik indirimli tarife de açıklandı.',
    ],
  },
  {
    slug: 'sehir-ici-bisiklet-yollarinda-son-durum',
    category: 'yasam',
    title: 'Şehir içi bisiklet yollarında son durum',
    dek: 'Yeni hatların tamamlanmasıyla toplam uzunluk iki katına çıktı.',
    author: 'Selin Batur',
    publishedAt: '2026-08-11T09:45:00+03:00',
    tags: ['bisiklet', 'ulaşım'],
    paragraphs: [
      'Yeni hatlar merkez ilçeleri birbirine bağlıyor. Güzergâhlarda dinlenme ve park noktaları oluşturuldu.',
      'Kullanım verileri yaz aylarında arttı. Belediye, kış aylarında da bakım çalışmalarının süreceğini açıkladı.',
    ],
  },
  {
    slug: 'periodista-podcast-bu-haftanin-gundemi',
    category: 'podcast',
    title: 'Periodista Podcast: bu haftanın gündemi',
    dek: 'Haftalık gündem değerlendirmesi bu bölümde.',
    author: 'Periodista Ekibi',
    publishedAt: '2026-08-18T07:00:00+03:00',
    draft: true,
    tags: ['podcast'],
    paragraphs: [
      'Bu bölümde haftanın öne çıkan başlıkları ele alınıyor. Konuklarımızla gündemdeki gelişmeleri değerlendiriyoruz.',
    ],
  },
];
