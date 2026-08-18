const DEFAULT_CATEGORIES = [
  { slug: 'gundem', name: 'Gündem', icon: 'newspaper', desc: 'Ülke ve şehir gündeminden öne çıkan gelişmeler.' },
  { slug: 'spor', name: 'Spor', icon: 'sports_soccer', desc: 'Sahadan sahaya, güncel spor gelişmeleri.' },
  { slug: 'dunya', name: 'Dünya', icon: 'public', desc: 'Küresel siyaset ve dış politikadan seçmeler.' },
  { slug: 'ekonomi', name: 'Ekonomi', icon: 'trending_up', desc: 'Piyasalar, para politikası ve iş dünyası.' },
  { slug: 'teknoloji', name: 'Teknoloji', icon: 'memory', desc: 'Yazılım, donanım ve yapay zekâdan gelişmeler.' },
  { slug: 'kultur-sanat', name: 'Kültür-Sanat', icon: 'theater_comedy', desc: 'Sahne, sinema ve sanattan öne çıkanlar.' },
  { slug: 'yasam', name: 'Yaşam', icon: 'eco', desc: 'Şehir hayatı, sağlık ve günlük yaşam.' },
  { slug: 'podcast', name: 'Podcast', icon: 'mic', desc: 'Periodista seslerinden haftalık bölümler.' },
];

// Kept for any legacy reference; prefer getCategories() which is mutable/persisted.
export const CATEGORIES = DEFAULT_CATEGORIES;

export const CATEGORY_ICONS = ['newspaper', 'sports_soccer', 'public', 'trending_up', 'memory', 'theater_comedy', 'eco', 'mic', 'category', 'star', 'local_fire_department', 'restaurant', 'movie', 'science', 'gavel', 'health_and_safety'];

const CATS_KEY = 'periodista_categories_v1';
const KEY = 'periodista_articles_v1';

function loadCategories() {
  try {
    const raw = localStorage.getItem(CATS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  saveCategories(DEFAULT_CATEGORIES);
  return DEFAULT_CATEGORIES.slice();
}

function saveCategories(list) {
  localStorage.setItem(CATS_KEY, JSON.stringify(list));
}

export function getCategories() {
  return loadCategories();
}

export function slugify(name) {
  const map = { ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u', İ: 'i' };
  return name.toLowerCase().split('').map(ch => map[ch] || ch).join('')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'kategori';
}

export function upsertCategory(cat) {
  const list = loadCategories();
  const i = list.findIndex(c => c.slug === cat.slug);
  if (i >= 0) list[i] = cat; else list.push(cat);
  saveCategories(list);
}

export function deleteCategory(slug) {
  saveCategories(loadCategories().filter(c => c.slug !== slug));
}

const SOCIAL_KEY = 'periodista_social_v1';
const DEFAULT_SOCIAL = { instagram: 'https://www.instagram.com/periodistacomtr/', x: '', tiktok: '', telegram: '' };

export function getSocialLinks() {
  try {
    const raw = localStorage.getItem(SOCIAL_KEY);
    if (raw) return { ...DEFAULT_SOCIAL, ...JSON.parse(raw) };
  } catch (e) {}
  return { ...DEFAULT_SOCIAL };
}

export function saveSocialLinks(links) {
  localStorage.setItem(SOCIAL_KEY, JSON.stringify(links));
}

function seed() {
  return [
    { id: 'a1', category: 'gundem', title: 'Kentsel dönüşümde yeni dönem: başvurular bugün açılıyor', dek: 'Çevre ve Şehircilik Bakanlığı, deprem riski taşıyan bölgelerde dönüşüm başvuru sürecini yeniden düzenledi.', author: 'Elif Kaya', publishedAt: '2026-08-18T08:10:00', readMins: 4, image: null, featured: true, breaking: true, status: 'published', body: ['Bakanlık, kentsel dönüşüm başvurularında dijital sisteme geçildiğini duyurdu. Vatandaşlar e-Devlet üzerinden başvuru durumunu takip edebilecek.', 'Yeni süreçte başvurular önceliklendirilecek; deprem riski yüksek bölgeler ilk sırada değerlendirilecek.', 'Yetkililer, sürecin yıl sonuna kadar tamamlanmasını hedeflediklerini belirtti.'] },
    { id: 'a2', category: 'gundem', title: 'Meclis tatile giriyor: bu hafta gündemdeki son maddeler', dek: 'Genel Kurul, tatile girmeden önce bekleyen kanun tekliflerini bu hafta görüşecek.', author: 'Mert Aydın', publishedAt: '2026-08-17T14:30:00', readMins: 3, image: null, featured: false, breaking: false, status: 'published', body: ['Meclis gündeminde bekleyen düzenlemeler bu hafta sırasıyla ele alınacak.', 'Komisyonlarda görüşülen metinler Genel Kurul onayına sunulacak.'] },
    { id: 'a3', category: 'spor', title: "Süper Lig'de sezonun açılış haftası: öne çıkan 5 mücadele", dek: 'Yeni sezonun ilk haftasında dikkat çeken karşılaşmaları derledik.', author: 'Barış Onur', publishedAt: '2026-08-18T09:00:00', readMins: 5, image: null, featured: false, breaking: true, status: 'published', body: ['Açılış haftasında şampiyonluk adayları sahne alacak.', 'Transfer döneminde yapılan takviyeler ilk maçlarda test edilecek.'] },
    { id: 'a4', category: 'spor', title: 'Milli takımın kadrosu açıklandı: iki yeni isim var', dek: 'Teknik direktör, yaklaşan hazırlık maçları için 24 kişilik kadroyu duyurdu.', author: 'Barış Onur', publishedAt: '2026-08-16T11:20:00', readMins: 3, image: null, featured: false, breaking: false, status: 'published', body: ['Kadroda genç oyunculara yer verildi.', 'Hazırlık maçları önümüzdeki ay oynanacak.'] },
    { id: 'a5', category: 'dunya', title: "Avrupa'da enerji politikaları yeniden masada", dek: 'Kış öncesi enerji tedarik güvenliği görüşmeleri hız kazandı.', author: 'Zeynep Ilgaz', publishedAt: '2026-08-17T18:05:00', readMins: 4, image: null, featured: false, breaking: false, status: 'published', body: ['Avrupa Birliği üyeleri enerji depolama kapasitesini artırmayı planlıyor.', 'Görüşmelerin sonbaharda sonuçlanması bekleniyor.'] },
    { id: 'a6', category: 'dunya', title: 'Bölgesel ticaret anlaşmasında son adım bekleniyor', dek: 'Taraflar, anlaşmanın teknik detaylarında uzlaşmaya yaklaştı.', author: 'Zeynep Ilgaz', publishedAt: '2026-08-15T10:00:00', readMins: 3, image: null, featured: false, breaking: false, status: 'published', body: ['Müzakereler son aşamaya girdi.', 'Anlaşmanın yıl içinde imzalanması öngörülüyor.'] },
    { id: 'a7', category: 'ekonomi', title: 'Merkez Bankası faiz kararını açıkladı: piyasalar nasıl tepki verdi', dek: 'Karar sonrası döviz ve borsa endeksinde hareketlilik gözlendi.', author: 'Onur Ateş', publishedAt: '2026-08-18T15:00:00', readMins: 4, image: null, featured: false, breaking: true, status: 'published', body: ['Karar, analistlerin beklentileriyle büyük ölçüde örtüştü.', 'Piyasa oyuncuları önümüzdeki toplantıya odaklandı.'] },
    { id: 'a8', category: 'ekonomi', title: 'Enflasyon verileri beklentilerin altında kaldı', dek: 'Temmuz ayı verileri, yıllık bazda yavaşlayan bir seyir gösterdi.', author: 'Onur Ateş', publishedAt: '2026-08-14T09:30:00', readMins: 3, image: null, featured: false, breaking: false, status: 'published', body: ['Gıda ve enerji fiyatlarındaki yavaşlama öne çıktı.', 'Ekonomistler, düşüş eğiliminin sürebileceğini belirtti.'] },
    { id: 'a9', category: 'teknoloji', title: 'Yerli yazılım girişimleri için yeni destek programı başladı', dek: 'Program kapsamında seçilen girişimlere finansman ve mentorluk desteği sağlanacak.', author: 'Deniz Kural', publishedAt: '2026-08-16T12:40:00', readMins: 4, image: null, featured: false, breaking: false, status: 'published', body: ['Başvurular bu ay içinde değerlendirilecek.', 'Programın ikinci fazı yıl sonunda başlayacak.'] },
    { id: 'a10', category: 'teknoloji', title: 'Yapay zekâ destekli üretim hatları fabrikalarda yaygınlaşıyor', dek: 'Üreticiler, kalite kontrol süreçlerinde görüntü işleme sistemlerine yöneliyor.', author: 'Deniz Kural', publishedAt: '2026-08-13T08:00:00', readMins: 5, image: null, featured: false, breaking: false, status: 'published', body: ['Sistemler, hata oranlarını düşürmeyi hedefliyor.', 'Yatırımların önümüzdeki yıl artması bekleniyor.'] },
    { id: 'a11', category: 'kultur-sanat', title: "İstanbul'da yeni sezon: sahnelenecek 10 oyun", dek: 'Şehir tiyatroları, yeni sezon programını duyurdu.', author: 'Selin Batur', publishedAt: '2026-08-12T17:15:00', readMins: 3, image: null, featured: false, breaking: false, status: 'published', body: ['Programda klasik ve modern eserler yer alıyor.', 'Bilet satışları bu hafta başlıyor.'] },
    { id: 'a12', category: 'yasam', title: 'Şehir içi bisiklet yollarında son durum', dek: 'Yeni hatların tamamlanmasıyla toplam uzunluk iki katına çıktı.', author: 'Selin Batur', publishedAt: '2026-08-11T09:45:00', readMins: 3, image: null, featured: false, breaking: false, status: 'published', body: ['Yeni hatlar merkez ilçeleri birbirine bağlıyor.', 'Kullanım verileri yaz aylarında arttı.'] },
    { id: 'a13', category: 'podcast', title: 'Periodista Podcast: bu haftanın gündemi', dek: 'Haftalık gündem değerlendirmesi bu bölümde.', author: 'Periodista Ekibi', publishedAt: '2026-08-18T07:00:00', readMins: 32, image: null, featured: false, breaking: false, status: 'draft', body: ['Bu bölümde haftanın öne çıkan başlıkları ele alınıyor.'] },
  ];
}

function loadAll() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  const s = seed();
  save(s);
  return s;
}

function save(list) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function getAll() {
  return loadAll().slice().sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
}

export function getPublished() {
  return getAll().filter(a => a.status === 'published');
}

export function getByCategory(slug) {
  return getPublished().filter(a => a.category === slug);
}

export function getById(id) {
  return loadAll().find(a => String(a.id) === String(id));
}

export function upsert(article) {
  const list = loadAll();
  const i = list.findIndex(a => String(a.id) === String(article.id));
  if (i >= 0) list[i] = article; else list.unshift(article);
  save(list);
}

export function remove(id) {
  save(loadAll().filter(a => String(a.id) !== String(id)));
}

export function removeByCategory(slug) {
  save(loadAll().filter(a => a.category !== slug));
}

export function countByCategory(slug) {
  return loadAll().filter(a => a.category === slug).length;
}

export function nextId() {
  return 'a' + Date.now();
}
