import { SITE } from './site-config';

/**
 * Kurumsal sayfaların metinleri. Kişi ve kurum bilgileri buraya gömülmez;
 * onlar yönetim panelindeki "Künye ve iletişim" alanlarından gelir ve boş
 * bırakılan satır sayfada hiç görünmez.
 */
export type PageSection = {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
};

export type StaticPage = {
  slug: string;
  title: string;
  description: string;
  intro: string;
  sections: PageSection[];
  /** Künye satırları bu sayfada listelensin mi? */
  showMasthead?: boolean;
  /** İletişim kutusu bu sayfada görünsün mü? */
  showContact?: boolean;
};

export const STATIC_PAGES: Record<string, StaticPage> = {
  hakkimizda: {
    slug: 'hakkimizda',
    title: 'Hakkımızda',
    description: `${SITE.name} nasıl bir yayın: yayın ilkeleri, kapsamı ve çalışma biçimi.`,
    intro: `${SITE.name}, gündem, spor, dünya, ekonomi, teknoloji ve kültür-sanat başlıklarında günün öne çıkan gelişmelerini tek bir yerde toplayan bir haber yayınıdır.`,
    sections: [
      {
        heading: 'Ne yapıyoruz',
        paragraphs: [
          'Günün akışını takip edip okurun bilmesi gerekeni sade bir dille aktarıyoruz. Haberi uzatmak yerine doğrulamayı, başlığı büyütmek yerine bağlamı önemsiyoruz.',
          'Her haberde kaynağı, yayın tarihini ve yazarı açıkça gösteriyoruz. Sonradan yapılan düzeltmeler haberin güncellenme tarihine yansır.',
        ],
      },
      {
        heading: 'Yayın ilkelerimiz',
        bullets: [
          'Doğruluk her şeyden önce gelir; teyit edilmemiş bilgi yayımlanmaz.',
          'Haber ile yorum ayrı tutulur, ikisi karıştırılmaz.',
          'Hata yapıldığında düzeltilir ve düzeltme görünür biçimde belirtilir.',
          'Reklam ve sponsorlu içerik, haber içeriğinden açıkça ayrılır.',
          'Kişilik hakları, özel hayatın gizliliği ve masumiyet karinesi gözetilir.',
        ],
      },
      {
        heading: 'Düzeltme talepleri',
        paragraphs: [
          'Bir haberde hata olduğunu düşünüyorsanız iletişim kanallarımızdan bize ulaşın. Talebi inceleyip haklı bulduğumuzda haberi düzeltir, düzeltmeyi sayfada belirtiriz.',
        ],
      },
    ],
    showContact: true,
  },

  kunye: {
    slug: 'kunye',
    title: 'Künye',
    description: `${SITE.name} yayın künyesi: yayın sahibi, sorumlu müdür ve iletişim bilgileri.`,
    intro: `${SITE.name} internet haber sitesinin yayın künyesi aşağıdadır.`,
    sections: [
      {
        heading: 'Yayın bilgileri',
        bullets: [
          `Yayının adı: ${SITE.name}`,
          'Yayın türü: Süreli yayın — internet haber sitesi',
          'Yayın dili: Türkçe',
        ],
      },
      {
        heading: 'Telif',
        paragraphs: [
          `Sitede yayımlanan haber, görsel ve diğer içeriklerin hakları ${SITE.name}'ya veya ilgili hak sahiplerine aittir. Kaynak gösterilerek ve bağlantı verilerek kısa alıntı yapılabilir; içeriğin tamamının izinsiz kopyalanması ve yeniden yayımlanması yasaktır.`,
        ],
      },
    ],
    showMasthead: true,
    showContact: true,
  },

  iletisim: {
    slug: 'iletisim',
    title: 'İletişim',
    description: `${SITE.name} ile iletişime geçin: haber ihbarı, düzeltme talebi ve genel sorular.`,
    intro:
      'Haber ihbarı, düzeltme talebi, iş birliği önerisi veya aklınıza takılan her şey için bize yazabilirsiniz.',
    sections: [
      {
        heading: 'Hangi konuda yazmalı',
        bullets: [
          'Haber ihbarı ve belge paylaşımı',
          'Yayımlanan bir haberde düzeltme veya cevap hakkı talebi',
          'Kurumsal iş birliği ve içerik ortaklığı',
          'Teknik sorunlar ve erişilebilirlik geri bildirimi',
        ],
      },
      {
        heading: 'Yanıt süresi',
        paragraphs: [
          'Mesajları hafta içi mesai saatlerinde okuyoruz. Düzeltme talepleri öncelikli olarak değerlendirilir.',
        ],
      },
    ],
    showContact: true,
  },

  reklam: {
    slug: 'reklam',
    title: 'Reklam Ver',
    description: `${SITE.name} üzerinde reklam ve iş birliği olanakları.`,
    intro: `${SITE.name}'da markanızı gündemi takip eden bir okur kitlesinin karşısına çıkarabilirsiniz.`,
    sections: [
      {
        heading: 'Reklam biçimleri',
        bullets: [
          'Ana sayfa ve kategori sayfalarında görüntülü reklam alanları',
          'Haber içi banner ve alt bilgi alanları',
          'Sponsorlu içerik — haber içeriğinden ayrı, açıkça etiketlenmiş biçimde',
          'Bülten sponsorluğu',
        ],
      },
      {
        heading: 'Nasıl ilerliyoruz',
        paragraphs: [
          'Bize ulaştığınızda kampanya hedefinizi, süreyi ve bütçe aralığını konuşuyor; ardından uygun alanları ve fiyatlandırmayı içeren bir teklif iletiyoruz.',
        ],
      },
      {
        heading: 'Editoryal bağımsızlık',
        paragraphs: [
          'Reklam ve sponsorluk ilişkileri haber içeriğine müdahale hakkı vermez. Sponsorlu içerikler okurun ayırt edebileceği biçimde etiketlenir.',
        ],
      },
    ],
    showContact: true,
  },

  'cerez-politikasi': {
    slug: 'cerez-politikasi',
    title: 'Çerez Politikası',
    description: `${SITE.name} sitesinde kullanılan çerezler ve tarayıcı depolaması hakkında bilgi.`,
    intro:
      'Bu politika, siteyi kullandığınızda tarayıcınızda hangi verilerin saklandığını ve bunları neden sakladığımızı açıklar.',
    sections: [
      {
        heading: 'Çerez nedir',
        paragraphs: [
          'Çerez, bir siteyi ziyaret ettiğinizde tarayıcınıza kaydedilen küçük bir metin dosyasıdır. Sitenin sizi hatırlamasını, tercihlerinizi korumasını sağlar.',
        ],
      },
      {
        heading: 'Bu sitede neler saklanıyor',
        bullets: [
          'Tema tercihi: koyu veya açık temayı seçtiğinizde bu tercih tarayıcınızda saklanır ve sonraki ziyaretinizde uygulanır.',
          'Okuma sayacı işareti: aynı haberin aynı oturumda birden fazla kez sayılmaması için haber kimliği oturum belleğinde tutulur.',
          'Oturum çerezi: yalnızca yönetim paneline giriş yapan kullanıcılar için oluşturulur; imzalı ve `httpOnly` bir çerezdir.',
        ],
      },
      {
        heading: 'Üçüncü taraf çerezleri',
        paragraphs: [
          'Sitede reklam ağı veya takip amaçlı üçüncü taraf çerezi kullanılmaz. Haber içine gömülü video ve ses oynatıcıları (örneğin YouTube, Spotify) yalnızca siz oynatıcıyla etkileşime girdiğinizde kendi çerezlerini kullanabilir.',
        ],
      },
      {
        heading: 'Çerezleri nasıl yönetirsiniz',
        paragraphs: [
          'Tarayıcınızın ayarlarından çerezleri silebilir veya engelleyebilirsiniz. Tema tercihini sakladığımız kaydı silerseniz site varsayılan temaya döner; sitenin çalışması etkilenmez.',
        ],
      },
    ],
  },

  'gizlilik-politikasi': {
    slug: 'gizlilik-politikasi',
    title: 'Gizlilik Politikası',
    description: `${SITE.name} kişisel verilerinizi nasıl işliyor: toplanan veriler, amaçlar ve haklarınız.`,
    intro:
      'Bu politika, siteyi kullandığınızda hangi kişisel verilerin işlendiğini, hangi amaçla işlendiğini ve haklarınızı açıklar.',
    sections: [
      {
        heading: 'İşlenen veriler',
        bullets: [
          'Bülten kaydı: yalnızca verdiğiniz e-posta adresi ve kayıt tarihi saklanır.',
          'Yorumlar: yazdığınız ad, isteğe bağlı e-posta adresi ve yorum metni saklanır.',
          'Teknik kayıtlar: kötüye kullanımı sınırlamak için istek anında IP adresi geçici olarak bellekte tutulur; kalıcı olarak kaydedilmez.',
          'Okunma sayısı: haber başına toplam sayı tutulur, kişiye bağlanmaz.',
        ],
      },
      {
        heading: 'İşleme amaçları',
        bullets: [
          'Bülteni göndermek',
          'Yorumları yayımlamak ve moderasyonunu yapmak',
          'Spam ve otomatik kötüye kullanımı engellemek',
          'Hangi haberlerin ilgi gördüğünü toplu olarak ölçmek',
        ],
      },
      {
        heading: 'Paylaşım',
        paragraphs: [
          'Kişisel verileriniz pazarlama amacıyla üçüncü kişilere satılmaz veya kiralanmaz. Veriler yalnızca sitenin barındırma ve veritabanı hizmet sağlayıcılarının altyapısında, hizmetin sunulması amacıyla işlenir.',
        ],
      },
      {
        heading: 'Saklama süresi',
        paragraphs: [
          'Bülten kaydınız siz aboneliği bırakana kadar saklanır. Yorumlar yayından kaldırılana kadar durur. Silme talebiniz üzerine ilgili kayıtlar makul sürede silinir.',
        ],
      },
      {
        heading: 'Haklarınız',
        paragraphs: [
          'Kişisel verilerinize erişme, düzeltilmesini veya silinmesini isteme ve işlemeye itiraz etme hakkına sahipsiniz. Talebinizi iletişim kanallarımızdan bize iletebilirsiniz.',
        ],
      },
    ],
    showContact: true,
  },
};

export function getStaticPage(slug: string): StaticPage {
  const page = STATIC_PAGES[slug];

  if (!page) {
    // Yol dosyaları sabit slug geçirir; buraya düşmek programlama hatasıdır.
    throw new Error(`Tanımsız kurumsal sayfa: ${slug}`);
  }

  return page;
}
