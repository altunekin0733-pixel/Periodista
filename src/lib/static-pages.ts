import { SITE } from './site-config';

/**
 * Kurumsal sayfaların varsayılan metinleri. Yönetim panelinden düzenlenen
 * sürüm `static-pages-store.ts` üzerinden gelir; burada yalnızca hiç
 * düzenlenmemiş sayfanın göstereceği içerik durur.
 *
 * Kişi ve kurum bilgileri gömülü değildir: künye satırları ile iletişim
 * kutusu, panelin "Künye ve iletişim" ayarlarından beslenir ve boş bırakılan
 * satır sayfada hiç görünmez.
 */
export type StaticPage = {
  slug: string;
  title: string;
  description: string;
  intro: string;
  /** Sanitize edilmiş HTML. */
  body: string;
  showMasthead?: boolean;
  showContact?: boolean;
};

export const STATIC_PAGES: Record<string, StaticPage> = {
  hakkimizda: {
    slug: 'hakkimizda',
    title: 'Hakkımızda',
    description: `${SITE.name} nasıl bir yayın: yayın ilkeleri, kapsamı ve çalışma biçimi.`,
    intro: `${SITE.name}, gündem, spor, dünya, ekonomi, teknoloji ve kültür-sanat başlıklarında günün öne çıkan gelişmelerini tek bir yerde toplayan bir haber yayınıdır.`,
    body: [
      '<h2>Ne yapıyoruz</h2>',
      '<p>Günün akışını takip edip okurun bilmesi gerekeni sade bir dille aktarıyoruz. Haberi uzatmak yerine doğrulamayı, başlığı büyütmek yerine bağlamı önemsiyoruz.</p>',
      '<p>Her haberde kaynağı, yayın tarihini ve yazarı açıkça gösteriyoruz. Sonradan yapılan düzeltmeler haberin güncellenme tarihine yansır.</p>',
      '<h2>Yayın ilkelerimiz</h2>',
      '<ul>',
      '<li>Doğruluk her şeyden önce gelir; teyit edilmemiş bilgi yayımlanmaz.</li>',
      '<li>Haber ile yorum ayrı tutulur, ikisi karıştırılmaz.</li>',
      '<li>Hata yapıldığında düzeltilir ve düzeltme görünür biçimde belirtilir.</li>',
      '<li>Reklam ve sponsorlu içerik, haber içeriğinden açıkça ayrılır.</li>',
      '<li>Kişilik hakları, özel hayatın gizliliği ve masumiyet karinesi gözetilir.</li>',
      '</ul>',
      '<h2>Düzeltme talepleri</h2>',
      '<p>Bir haberde hata olduğunu düşünüyorsanız iletişim kanallarımızdan bize ulaşın. Talebi inceleyip haklı bulduğumuzda haberi düzeltir, düzeltmeyi sayfada belirtiriz.</p>',
    ].join(''),
    showContact: true,
  },

  kunye: {
    slug: 'kunye',
    title: 'Künye',
    description: `${SITE.name} yayın künyesi: yayın sahibi, sorumlu müdür ve iletişim bilgileri.`,
    intro: `${SITE.name} internet haber sitesinin yayın künyesi aşağıdadır.`,
    body: [
      '<h2>Yayın bilgileri</h2>',
      '<ul>',
      `<li>Yayının adı: ${SITE.name}</li>`,
      '<li>Yayın türü: Süreli yayın — internet haber sitesi</li>',
      '<li>Yayın dili: Türkçe</li>',
      '</ul>',
      '<h2>Telif</h2>',
      `<p>Sitede yayımlanan haber, görsel ve diğer içeriklerin hakları ${SITE.name}'ya veya ilgili hak sahiplerine aittir. Kaynak gösterilerek ve bağlantı verilerek kısa alıntı yapılabilir; içeriğin tamamının izinsiz kopyalanması ve yeniden yayımlanması yasaktır.</p>`,
    ].join(''),
    showMasthead: true,
    showContact: true,
  },

  iletisim: {
    slug: 'iletisim',
    title: 'İletişim',
    description: `${SITE.name} ile iletişime geçin: haber ihbarı, düzeltme talebi ve genel sorular.`,
    intro:
      'Haber ihbarı, düzeltme talebi, iş birliği önerisi veya aklınıza takılan her şey için bize yazabilirsiniz.',
    body: [
      '<h2>Hangi konuda yazmalı</h2>',
      '<ul>',
      '<li>Haber ihbarı ve belge paylaşımı</li>',
      '<li>Yayımlanan bir haberde düzeltme veya cevap hakkı talebi</li>',
      '<li>Kurumsal iş birliği ve içerik ortaklığı</li>',
      '<li>Teknik sorunlar ve erişilebilirlik geri bildirimi</li>',
      '</ul>',
      '<h2>Yanıt süresi</h2>',
      '<p>Mesajları hafta içi mesai saatlerinde okuyoruz. Düzeltme talepleri öncelikli olarak değerlendirilir.</p>',
    ].join(''),
    showContact: true,
  },

  reklam: {
    slug: 'reklam',
    title: 'Reklam Ver',
    description: `${SITE.name} üzerinde reklam ve iş birliği olanakları.`,
    intro: `${SITE.name}'da markanızı gündemi takip eden bir okur kitlesinin karşısına çıkarabilirsiniz.`,
    body: [
      '<h2>Reklam biçimleri</h2>',
      '<ul>',
      '<li>Ana sayfa ve kategori sayfalarında görüntülü reklam alanları</li>',
      '<li>Haber içi banner ve alt bilgi alanları</li>',
      '<li>Sponsorlu içerik — haber içeriğinden ayrı, açıkça etiketlenmiş biçimde</li>',
      '<li>Bülten sponsorluğu</li>',
      '</ul>',
      '<h2>Nasıl ilerliyoruz</h2>',
      '<p>Bize ulaştığınızda kampanya hedefinizi, süreyi ve bütçe aralığını konuşuyor; ardından uygun alanları ve fiyatlandırmayı içeren bir teklif iletiyoruz.</p>',
      '<h2>Editoryal bağımsızlık</h2>',
      '<p>Reklam ve sponsorluk ilişkileri haber içeriğine müdahale hakkı vermez. Sponsorlu içerikler okurun ayırt edebileceği biçimde etiketlenir.</p>',
    ].join(''),
    showContact: true,
  },

  'cerez-politikasi': {
    slug: 'cerez-politikasi',
    title: 'Çerez Politikası',
    description: `${SITE.name} sitesinde kullanılan çerezler ve tarayıcı depolaması hakkında bilgi.`,
    intro:
      'Bu politika, siteyi kullandığınızda tarayıcınızda hangi verilerin saklandığını ve bunları neden sakladığımızı açıklar.',
    body: [
      '<h2>Çerez nedir</h2>',
      '<p>Çerez, bir siteyi ziyaret ettiğinizde tarayıcınıza kaydedilen küçük bir metin dosyasıdır. Sitenin sizi hatırlamasını, tercihlerinizi korumasını sağlar.</p>',
      '<h2>Bu sitede neler saklanıyor</h2>',
      '<ul>',
      '<li>Tema tercihi: koyu veya açık temayı seçtiğinizde bu tercih tarayıcınızda saklanır ve sonraki ziyaretinizde uygulanır.</li>',
      '<li>Okuma sayacı işareti: aynı haberin aynı oturumda birden fazla kez sayılmaması için haber kimliği oturum belleğinde tutulur.</li>',
      '<li>Oturum çerezi: yalnızca yönetim paneline giriş yapan kullanıcılar için oluşturulur; imzalı ve yalnızca sunucunun okuyabildiği bir çerezdir.</li>',
      '</ul>',
      '<h2>Üçüncü taraf çerezleri</h2>',
      '<p>Sitede reklam ağı veya takip amaçlı üçüncü taraf çerezi kullanılmaz. Haber içine gömülü video ve ses oynatıcıları (örneğin YouTube, Spotify) yalnızca siz oynatıcıyla etkileşime girdiğinizde kendi çerezlerini kullanabilir.</p>',
      '<h2>Çerezleri nasıl yönetirsiniz</h2>',
      '<p>Tarayıcınızın ayarlarından çerezleri silebilir veya engelleyebilirsiniz. Tema tercihini sakladığımız kaydı silerseniz site varsayılan temaya döner; sitenin çalışması etkilenmez.</p>',
    ].join(''),
  },

  'gizlilik-politikasi': {
    slug: 'gizlilik-politikasi',
    title: 'Gizlilik Politikası',
    description: `${SITE.name} kişisel verilerinizi nasıl işliyor: toplanan veriler, amaçlar ve haklarınız.`,
    intro:
      'Bu politika, siteyi kullandığınızda hangi kişisel verilerin işlendiğini, hangi amaçla işlendiğini ve haklarınızı açıklar.',
    body: [
      '<h2>İşlenen veriler</h2>',
      '<ul>',
      '<li>Bülten kaydı: yalnızca verdiğiniz e-posta adresi ve kayıt tarihi saklanır.</li>',
      '<li>Yorumlar: yazdığınız ad, isteğe bağlı e-posta adresi ve yorum metni saklanır.</li>',
      '<li>Teknik kayıtlar: kötüye kullanımı sınırlamak için istek anında IP adresi geçici olarak bellekte tutulur; kalıcı olarak kaydedilmez.</li>',
      '<li>Okunma sayısı: haber başına toplam sayı tutulur, kişiye bağlanmaz.</li>',
      '</ul>',
      '<h2>İşleme amaçları</h2>',
      '<ul>',
      '<li>Bülteni göndermek</li>',
      '<li>Yorumları yayımlamak ve moderasyonunu yapmak</li>',
      '<li>Spam ve otomatik kötüye kullanımı engellemek</li>',
      '<li>Hangi haberlerin ilgi gördüğünü toplu olarak ölçmek</li>',
      '</ul>',
      '<h2>Paylaşım</h2>',
      '<p>Kişisel verileriniz pazarlama amacıyla üçüncü kişilere satılmaz veya kiralanmaz. Veriler yalnızca sitenin barındırma ve veritabanı hizmet sağlayıcılarının altyapısında, hizmetin sunulması amacıyla işlenir.</p>',
      '<h2>Saklama süresi</h2>',
      '<p>Bülten kaydınız siz aboneliği bırakana kadar saklanır. Yorumlar yayından kaldırılana kadar durur. Silme talebiniz üzerine ilgili kayıtlar makul sürede silinir.</p>',
      '<h2>Haklarınız</h2>',
      '<p>Kişisel verilerinize erişme, düzeltilmesini veya silinmesini isteme ve işlemeye itiraz etme hakkına sahipsiniz. Talebinizi iletişim kanallarımızdan bize iletebilirsiniz.</p>',
    ].join(''),
    showContact: true,
  },
};

export function getStaticPageDefaults(slug: string): StaticPage {
  const page = STATIC_PAGES[slug];

  if (!page) {
    // Yol dosyaları sabit slug geçirir; buraya düşmek programlama hatasıdır.
    throw new Error(`Tanımsız kurumsal sayfa: ${slug}`);
  }

  return page;
}
