# Periodista — statik sürüm

Türkçe haber sitesi. Next.js ile derlenip **GitHub Pages**'te yayınlanan tamamen
statik bir site. Sunucu ve veritabanı yoktur; haberler depoda markdown dosyası
olarak durur.

> **Not:** Yayınlanan sürüm budur (`main`). Aynı tasarımın yönetim paneli,
> veritabanı ve yorum sistemi olan **dinamik sürümü** `dinamik-vercel` dalında
> durur (Vercel için). Fikir değiştirirseniz o dal hazır bekliyor.

---

## Ne var, ne yok

### Çalışanlar

| Özellik | Durum |
|---|---|
| Ana sayfa (manşet karuseli, son dakika paneli, kategori blokları) | ✓ |
| Kategori, haber ve etiket sayfaları | ✓ |
| Arama | ✓ tarayıcı içinde, anlık, sunucusuz |
| Piyasa şeridi (döviz, altın, BIST) | ✓ derlemede gömülür, 30 dk'da bir tazelenir |
| Koyu / açık tema | ✓ |
| Paylaşım butonları, okuma ilerleme çubuğu | ✓ |
| SEO: JSON-LD, OpenGraph, sitemap.xml, rss.xml, robots.txt | ✓ |
| Responsive düzen, klavye erişimi | ✓ |

### Olmayanlar (statik olmanın bedeli)

| Özellik | Neden yok |
|---|---|
| Yönetim paneli | Sunucu ve veritabanı gerektirir |
| Yorumlar | Form gönderimini alacak sunucu yok |
| E-bülten kaydı | Aynı sebep |
| Görsel yükleme arayüzü | Görseller depoya elle eklenir |
| Okunma sayacı | Sayacı tutacak veritabanı yok |

Bu özellikler `dinamik-vercel` dalındaki sürümde mevcuttur.

---

## Haber ekleme

Yeni bir haber = `content/haberler/` klasörüne yeni bir `.md` dosyası.
Dosya adı adresi belirler: `deprem-yardimlari.md` → `/gundem/deprem-yardimlari`

```markdown
---
baslik: "Haber başlığı buraya"
spot: "Bir iki cümlelik özet. Kartlarda ve arama sonuçlarında görünür."
kategori: gundem
yazar: "Ad Soyad"
tarih: 2026-08-19T10:30:00+03:00
etiketler: ["deprem", "yardım"]
kapak: /gorseller/deprem.jpg
kapakAlt: "Görselde ne olduğunu anlatan kısa metin"
mansette: false
sonDakika: false
taslak: false
---

Haber metni buradan başlar. **Kalın**, *italik* ve [bağlantı](https://ornek.com)
kullanabilirsiniz.

## Ara başlık

Liste de olur:

- Birinci madde
- İkinci madde

> Alıntı bloğu böyle görünür.
```

### Alanlar

| Alan | Zorunlu | Açıklama |
|---|---|---|
| `baslik` | evet | Haber başlığı |
| `spot` | hayır | Kısa özet |
| `kategori` | evet | `content/kategoriler.json` içindeki bir `slug` |
| `yazar` | hayır | Varsayılan: Periodista |
| `tarih` | evet | ISO biçimi, saat dilimiyle: `2026-08-19T10:30:00+03:00` |
| `etiketler` | hayır | Liste |
| `kapak` | hayır | `public/` altındaki yol, örn. `/gorseller/x.jpg` |
| `kapakAlt` | hayır | Erişilebilirlik açıklaması |
| `mansette` | hayır | `true` ise ana sayfa karuselinde görünür |
| `sonDakika` | hayır | `true` ise üstteki kayan şeritte görünür |
| `taslak` | hayır | `true` ise hiç yayınlanmaz |
| `okumaDakika` | hayır | Boşsa metinden hesaplanır |
| `seoBaslik`, `seoAciklama` | hayır | Boşsa başlık ve spot kullanılır |

**İleri tarihli yayın:** `tarih` alanı gelecekteyse haber derlemede atlanır.
Tarihi geldiğinde site yeniden derlendiğinde yayınlanır.

**Görseller:** `public/gorseller/` klasörüne koyup `kapak: /gorseller/dosya.jpg`
şeklinde gösterin. Önerilen boyut: 1600 × 900 piksel.

### Yayınlama

Dosyayı GitHub'da oluşturup commit atın (web arayüzünden de yapabilirsiniz:
`content/haberler` → *Add file* → *Create new file*). GitHub Actions siteyi
otomatik derleyip yayınlar — yaklaşık 1-2 dakika sürer.

---

## Kategoriler ve ayarlar

`content/kategoriler.json`:

```json
{
  "slug": "saglik",
  "ad": "Sağlık",
  "simge": "health_and_safety",
  "aciklama": "Sağlık ve yaşam haberleri.",
  "sira": 8,
  "logo": "default"
}
```

- `slug` sitenin kökünde adres olur (`/saglik`). `arama`, `etiket`, `rss.xml`
  gibi adlarla çakışmamalıdır.
- `sira` menüdeki konumu belirler (küçükten büyüğe).
- `logo` değeri `sports` yapılırsa o kategoride Periodista Sports logosu görünür.
- `simge` seçenekleri: `newspaper`, `sports_soccer`, `public`, `trending_up`,
  `memory`, `theater_comedy`, `eco`, `mic`, `category`, `star`,
  `local_fire_department`, `restaurant`, `movie`, `science`, `gavel`,
  `health_and_safety`, `directions_car`, `travel_explore`, `school`, `music_note`

`content/ayarlar.json`: slogan, site açıklaması, sosyal medya bağlantıları ve
piyasa şeridinin açık/kapalı durumu.

---

## GitHub Pages kurulumu

1. Depo → **Settings → Pages**
2. **Source** olarak **GitHub Actions** seçin (Branch değil)
3. `main` dalına yapılan her push otomatik yayınlar

Yayın adresi: `https://<kullanici>.github.io/Periodista/`

### Kendi alan adınızı bağlama

1. **Settings → Pages → Custom domain** alanına alan adınızı yazın
2. Alan adı sağlayıcınızda DNS kaydı ekleyin:
   - Alt alan adı (`www.ornek.com`) için: `CNAME` → `<kullanici>.github.io`
   - Kök alan adı (`ornek.com`) için dört `A` kaydı:
     `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
3. **Enforce HTTPS** kutusunu işaretleyin (sertifika birkaç dakikada hazırlanır)
4. `.github/workflows/pages.yml` içindeki derleme adımını güncelleyin — kendi
   alan adında `/Periodista` ön eki olmamalıdır:

   ```yaml
   env:
     NEXT_PUBLIC_BASE_PATH: ''
     NEXT_PUBLIC_SITE_ORIGIN: 'https://ornek.com'
   ```

---

## Yerel geliştirme

```bash
npm install
npm run dev          # http://localhost:3000
```

Statik çıktıyı yerelde denemek için:

```bash
npm run build        # out/ klasörünü üretir
npm run preview      # out/ klasörünü sunar
```

| Komut | Ne yapar |
|---|---|
| `npm run dev` | Geliştirme sunucusu |
| `npm run build` | Statik siteyi `out/` klasörüne üretir |
| `npm run preview` | Üretilen statik siteyi yerelde sunar |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript denetimi |

---

## Proje yapısı

```
content/
├── haberler/*.md        # haberler — içerik buraya
├── kategoriler.json
└── ayarlar.json

src/
├── app/
│   ├── (site)/          # ana sayfa, arama, etiket
│   ├── (kategori)/      # kategori ve haber sayfaları
│   ├── sitemap.ts, robots.ts, rss.xml/
│   └── layout.tsx
├── components/site/     # arayüz bileşenleri
├── lib/
│   ├── content.ts       # markdown okuma katmanı
│   ├── markdown.ts      # md → HTML
│   └── rates.ts         # piyasa verisi (tarayıcıdan)
└── styles/tokens.css    # tasarım token'ları

.github/workflows/pages.yml   # otomatik yayın
design-reference/             # özgün tasarım dosyaları
```

---

## Bilinen sınırlar

- **Her haber yeniden derleme gerektirir.** Yazıp commit attıktan ~1-2 dakika
  sonra yayınlanır.
- **Arama indeksi sayfaya gömülür.** Haber sayısı birkaç bini aştığında arama
  sayfası ağırlaşır; o noktada indeksi ayrı bir dosyaya taşımak gerekir.
- **Piyasa verisi 30 dakikaya kadar gecikmeli.** Veri kaynağı (Truncgil)
  HTTP/2 akışını hatalı kapattığı için tarayıcıdan çağrılamıyor —
  `ERR_HTTP2_PROTOCOL_ERROR` veriyor. Bu yüzden veri derleme anında çekilip
  HTML'e gömülüyor ve `.github/workflows/pages.yml` içindeki zamanlanmış görev
  (`*/30 * * * *`) ile tazeleniyor. Veri hiç alınamazsa şerit gizlenir; eski
  değer gösterilmez.
- **Zamanlanmış görev 60 gün hareketsizlikte durur.** GitHub, uzun süre commit
  almayan depolarda cron'u devre dışı bırakır. Actions sekmesinden tek tıkla
  yeniden etkinleştirilir.
- **Bozuk bir markdown dosyası derlemeyi durdurur.** Bu bilinçlidir — hatalı
  dosya sessizce atlanıp haber kaybolmasın diye. Hata mesajı hangi dosyada ne
  sorun olduğunu söyler.
