-- Son dakika kuyruğu artık panelden işaretlenmiyor: en son yayınlanan
-- haberlerden türetiliyor. Kategoriye özel logo seçeneği de kaldırıldı;
-- tüm kategoriler ana Periodista logosunu kullanıyor.
--
-- Not: uygulama bu sütunları zaten okumadığı için migration uygulanmadan da
-- çalışır. Şemayı veritabanıyla eşitlemek için `npm run db:deploy` çalıştırın.

DROP INDEX IF EXISTS "Article_breaking_status_publishedAt_idx";

ALTER TABLE "Article" DROP COLUMN IF EXISTS "breaking";

ALTER TABLE "Category" DROP COLUMN IF EXISTS "logoVariant";

-- Altbilgideki slogan varsayılanı "Gündemin nabzı" oldu. Panelden kaydedilmiş
-- eski varsayılan metin duruyorsa yenisiyle değiştirilir; yönetici kendi
-- yazdığı bir slogana dokunulmaz.
UPDATE "Setting"
SET "value" = jsonb_set("value", '{tagline}', '"Gündemin nabzı"'::jsonb)
WHERE "key" = 'site'
  AND "value" ->> 'tagline' = 'Günün öne çıkan gelişmeleri, tek yerde.';

-- Podcast kategorisi video haberleri de kapsıyor. Adı elle değiştirilmediyse
-- güncellenir; panelden verilmiş özel bir ada dokunulmaz.
UPDATE "Category"
SET "name" = 'Video Haber & Podcast'
WHERE "slug" = 'podcast'
  AND "name" = 'Podcast';
