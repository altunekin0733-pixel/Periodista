# Periodista

Türkçe haber sitesi. Next.js 16 (App Router) + PostgreSQL üzerine kurulu; yayın
tarafı ve yönetim paneli tek uygulamada.

> Tasarımın özgün Claude Design dosyaları `design-reference/canvas/` altında
> referans olarak duruyor. Uygulama bu tasarımın çalışan karşılığıdır.

## Depodaki iki sürüm

Bu depo aynı tasarımın iki ayrı sürümünü barındırır:

| Dal | Nerede yayınlanır | Ne var |
|---|---|---|
| `dinamik-vercel` | **Vercel** (üretim) | Yönetim paneli, PostgreSQL, yorumlar, e-bülten, görsel yükleme, anında yayın |
| `main` | **GitHub Pages** | Tamamen statik; haberler markdown dosyası, panel yok |

Bu dosya `dinamik-vercel` dalını anlatır. Vercel'de **Settings → Environments →
Production → Branch Tracking** alanının `dinamik-vercel` olarak ayarlı olması
gerekir; aksi halde Vercel statik sürümü yayınlar.

İki sürüm ayrı içerik deposu kullandığı için içerikleri kendiliğinden
eşleşmez — Vercel panelinden girilen haber, Pages'teki siteye yansımaz.

---

## İçindekiler

- [Neler var](#neler-var)
- [Teknoloji](#teknoloji)
- [Hızlı kurulum](#hızlı-kurulum)
- [Vercel'e yayınlama](#vercele-yayınlama)
- [Ortam değişkenleri](#ortam-değişkenleri)
- [Komutlar](#komutlar)
- [Proje yapısı](#proje-yapısı)
- [Adres yapısı](#adres-yapısı)
- [Yönetim paneli](#yönetim-paneli)
- [Bilinen sınırlar](#bilinen-sınırlar)

---

## Neler var

### Yayın tarafı

| Özellik | Açıklama |
|---|---|
| Ana sayfa | Otomatik dönen manşet karuseli, son dakika paneli, kategori blokları |
| Kategori sayfaları | Öne çıkan haber + ızgara, sayfalama, kategoriye özel logo (Spor) |
| Haber sayfası | Zengin metin gövdesi, kapak görseli, etiketler, okuma ilerleme çubuğu |
| Arama | Başlık, spot, gövde metni, yazar ve etiketlerde arama + sayfalama |
| Etiket sayfaları | Etikete göre haber listesi |
| Son dakika şeridi | `breaking` işaretli haberler, duraklatılabilir kayan şerit |
| Piyasa şeridi | USD, EUR, GBP, CHF, JPY, gram altın, çeyrek altın, gümüş, BIST 100 — **canlı** |
| Yorumlar | Ziyaretçi yorumu, editör onayı, bot tuzağı |
| E-bülten | E-posta toplama, panelden liste kopyalama |
| Paylaşım | X, Facebook, Telegram, bağlantı kopyalama, cihazın kendi paylaşım menüsü |
| Tema | Koyu/açık tema, tercih hatırlanır, ilk boyamada yanıp sönme yok |
| Okunma sayacı | Haber başına görüntülenme, panelde raporlanır |

### SEO

- Sayfa başına `title`, `description`, kanonik adres, OpenGraph ve Twitter kartları
- `NewsArticle` + `BreadcrumbList` JSON-LD şeması
- `/sitemap.xml` — tüm haberler, kategoriler, etiketler
- `/haber-sitemap.xml` — Google News uyumlu, son 48 saat
- `/rss.xml` — RSS 2.0 akışı
- `/robots.txt` — yönetim ve arama sayfaları dizine kapalı
- Google News uyumlu adres yapısı: `/kategori/haber-basligi`

### Yönetim paneli

- Genel bakış: haber/yorum/abone sayıları, toplam okunma, en çok okunanlar
- Haber yönetimi: zengin metin editörü (Tiptap), kapak görseli yükleme,
  etiketler, manşet/son dakika işaretleri, ileri tarihli yayın, SEO alanları
- Kategori yönetimi: simge seçici, sıralama, kategoriye özel logo
- Yorum moderasyonu: onayla / reddet / sil, bekleyen sayısı rozeti
- Abone listesi
- Site ayarları: sosyal medya bağlantıları, bölüm aç/kapa anahtarları

### Güvenlik

- Şifre `bcrypt` ile özetlenir, ham hali hiçbir yerde saklanmaz
- Oturum imzalı JWT, `httpOnly` + `sameSite` çerezde
- `proxy.ts` panel yollarını korur; her server action ayrıca `requireSession()` çağırır
- Girişte oran sınırlama, formlarda bot tuzağı
- Editörden gelen HTML `sanitize-html` ile temizlenir; yorumlarda HTML kabul edilmez
- Tüm girdiler Zod ile doğrulanır
- Güvenlik başlıkları `next.config.ts` içinde

---

## Teknoloji

| Katman | Seçim |
|---|---|
| Çatı | Next.js 16 (App Router, React 19, Turbopack) |
| Dil | TypeScript |
| Veritabanı | PostgreSQL + Prisma 7 (`@prisma/adapter-pg`) |
| Stil | CSS Modules + CSS değişkenleriyle tasarım token'ları |
| Editör | Tiptap |
| İkonlar | lucide-react (SVG) + Simple Icons marka yolları |
| Görsel deposu | Vercel Blob |
| Doğrulama | Zod |
| Oturum | jose (JWT) + bcryptjs |

Bilinçli olarak **kullanılmayanlar:** CSS çatısı yok (tasarım token tabanlı,
CSS bütçesi küçük), ikon fontu yok (dış istek ve render engelleme olmasın diye),
istemci tarafı veri çekme kütüphanesi yok (veriler sunucu bileşenlerinde okunur).

---

## Hızlı kurulum

### 1. Gereksinimler

- Node.js 20 veya üzeri
- Bir PostgreSQL veritabanı ([Neon](https://neon.tech),
  [Supabase](https://supabase.com) veya Vercel Postgres — hepsinin ücretsiz katmanı var)

### 2. Bağımlılıklar

```bash
npm install
```

### 3. Ortam değişkenleri

```bash
cp .env.example .env
```

`.env` dosyasını doldurun:

```bash
# Yönetici şifresinin özetini üretin
npm run admin:hash -- "cok-guclu-bir-sifre"

# Oturum anahtarını üretin
openssl rand -base64 32
```

### 4. Veritabanı

```bash
npm run db:push    # tabloları oluştur
npm run db:seed    # örnek kategoriler ve haberler
```

### 5. Çalıştır

```bash
npm run dev
```

- Site: <http://localhost:3000>
- Panel: <http://localhost:3000/admin>

---

## Vercel'e yayınlama

1. **Depoyu GitHub'a gönderin**, Vercel'de *New Project* ile içe aktarın.

2. **Postgres bağlayın.** Vercel panelinde *Storage → Create Database → Postgres*
   (ya da Neon/Supabase'den aldığınız adresi elle girin). `DATABASE_URL` ve
   `DIRECT_URL` değişkenlerini ekleyin.

3. **Görsel deposu ekleyin.** *Storage → Create → Blob* ve projeye bağlayın.
   `BLOB_READ_WRITE_TOKEN` otomatik gelir. **Bu adım olmadan haber görseli
   yüklenemez** — Vercel'de dosya sistemi yazılabilir değildir.

4. **Kalan değişkenleri girin:** `ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH`,
   `AUTH_SECRET`. Kendi alan adınızı bağladıysanız `NEXT_PUBLIC_SITE_URL`.

5. **Tabloları oluşturun.** İlk deploy'dan sonra bir kez yerelden çalıştırın
   (`.env` içinde üretim `DATABASE_URL` ile):

   ```bash
   npm run db:deploy   # migration varsa
   # veya migration dosyası yoksa:
   npm run db:push
   npm run db:seed     # örnek içerik isterseniz
   ```

6. **Deploy edin.** `npm run build` Vercel'de `prisma generate` + `next build`
   çalıştırır.

> **Not:** Derleme sırasında ana sayfa önceden üretildiği için `DATABASE_URL`
> derleme anında da erişilebilir olmalıdır. Vercel ortam değişkenlerini derleme
> aşamasında sağladığı için ek bir şey yapmanız gerekmez.

---

## Ortam değişkenleri

| Değişken | Zorunlu | Açıklama |
|---|---|---|
| `DATABASE_URL` | evet | Uygulamanın kullandığı (havuzlanmış) Postgres adresi |
| `DIRECT_URL` | önerilir | Migration/seed için havuzsuz adres. Yoksa `DATABASE_URL` kullanılır |
| `ADMIN_USERNAME` | evet | Panel kullanıcı adı |
| `ADMIN_PASSWORD_HASH` | evet | `npm run admin:hash` çıktısı |
| `AUTH_SECRET` | evet | Oturum imzası, en az 32 karakter |
| `BLOB_READ_WRITE_TOKEN` | görsel için | Vercel Blob token'ı |
| `NEXT_PUBLIC_SITE_URL` | hayır | Kanonik adres. Boşsa Vercel adresi kullanılır |

---

## Komutlar

| Komut | Ne yapar |
|---|---|
| `npm run dev` | Geliştirme sunucusu |
| `npm run build` | Prisma client üretir + üretim derlemesi |
| `npm start` | Derlenmiş uygulamayı çalıştırır |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript denetimi |
| `npm run db:push` | Şemayı veritabanına uygular (migration dosyası üretmeden) |
| `npm run db:migrate` | Geliştirme migration'ı oluşturur |
| `npm run db:deploy` | Bekleyen migration'ları uygular (üretim) |
| `npm run db:seed` | Örnek kategori ve haberleri yükler |
| `npm run db:studio` | Prisma Studio |
| `npm run admin:hash -- "sifre"` | Yönetici şifre özeti üretir |

---

## Proje yapısı

```
src/
├── app/
│   ├── (site)/                 # ana sayfa, arama, etiket — varsayılan logo
│   ├── (kategori)/[kategori]/  # kategori ve haber — kategoriye özel logo
│   ├── admin/                  # yönetim paneli
│   ├── giris/                  # yönetici girişi
│   ├── api/                    # görsel yükleme, okunma sayacı
│   ├── sitemap.ts, robots.ts, rss.xml/, haber-sitemap.xml/
│   └── layout.tsx              # font, tema önyüklemesi, temel meta
├── components/
│   ├── site/                   # yayın tarafı bileşenleri
│   ├── admin/                  # panel bileşenleri
│   └── ui/                     # ikonlar
├── lib/                        # yardımcılar (prisma, auth, rates, sanitize, …)
├── server/
│   ├── queries.ts              # okuma sorguları
│   └── actions/                # server action'lar
├── styles/tokens.css           # tasarım token'ları (koyu + açık tema)
└── proxy.ts                    # /admin koruması
```

Kategori sayfalarının ayrı bir route group'ta olmasının nedeni: düzenin
`params`'a erişip Spor gibi kategorilerde farklı logo gösterebilmesi.

---

## Adres yapısı

| Adres | Sayfa |
|---|---|
| `/` | Ana sayfa |
| `/gundem` | Kategori |
| `/gundem/haber-basligi` | Haber |
| `/etiket/deprem` | Etiket |
| `/arama?q=...` | Arama |
| `/admin` | Yönetim paneli |
| `/giris` | Yönetici girişi |
| `/rss.xml`, `/sitemap.xml`, `/haber-sitemap.xml` | Beslemeler |

Kategori adresleri sitenin kökünde olduğu için `admin`, `api`, `arama`,
`etiket`, `giris` gibi adlar rezervedir; panel bu adlarla kategori
oluşturulmasını engeller (`src/lib/routes.ts`).

---

## Yönetim paneli

Tek yönetici hesabı vardır; kullanıcı adı ve şifre özeti ortam değişkenlerinde
tutulur. Şifre değiştirmek için `npm run admin:hash` ile yeni özet üretip
`ADMIN_PASSWORD_HASH` değerini güncelleyin.

**Haber yayınlama akışı:** Haberler → Yeni Haber → başlık, spot ve metni girin →
kategori ve yazar seçin → kapak görseli yükleyin → durumu *Yayında* yapın →
kaydedin. Yayınlanan haber ilgili sayfaların önbelleğini tazeler ve anında
sitede görünür.

**Kategori silme:** İçinde haber olan kategori doğrudan silinemez. Önce
"Haberleri taşı" ile başka bir kategoriye aktarılır, sonra silinir. Bu, tek
tıkla içerik kaybını önlemek içindir.

---

## Bilinen sınırlar

- **Tek yönetici.** Rol ayrımı (editör/yazar) yok. Çok kullanıcılı yapı
  isterseniz `User` tablosu ve rol kontrolü eklenmesi gerekir.
- **Oran sınırlama bellek içi.** Sunucusuz ortamda her örneğin kendi sayacı
  olur. Sıkı koruma için Vercel Firewall veya paylaşımlı bir sayaç (Upstash)
  önerilir.
- **Arama `ILIKE` tabanlı.** On binlerce habere çıkıldığında Postgres tam metin
  arama (`tsvector` + GIN indeksi) eklenmelidir.
- **Bülten yalnızca adres topluyor.** Gönderim entegrasyonu (Resend, Mailchimp)
  yok; adresler panelden kopyalanıp kullanılır.
- **Piyasa verisi üçüncü taraf.** Kaynak sırası: Truncgil → TCMB → veri yoksa
  şerit gizlenir. Ticari kullanımda sağlayıcının şartlarını kontrol edin.
- **`prisma` paketinde bilinen bir uyarı var** (`@prisma/config` →
  `deepmerge-ts`). Yalnızca CLI/derleme zincirini etkiler, çalışan uygulamaya
  dahil değildir; Prisma tarafından düzeltilince sürüm yükseltilmelidir.
