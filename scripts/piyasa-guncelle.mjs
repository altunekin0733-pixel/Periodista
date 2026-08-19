#!/usr/bin/env node
/**
 * Piyasa verisini çekip `content/piyasa.json` dosyasına yazar.
 *
 * Neden ayrı bir adım: kaynak sunucu (Truncgil) yanıtı zaman zaman yarıda
 * kesiyor. Veri doğrudan derleme sırasında çekilseydi, böyle bir anda yapılan
 * her yayın şeridi sitede yok ederdi. Bu betik yalnızca GEÇERLİ veri aldığında
 * dosyayı günceller; alamazsa dosyaya dokunmaz ve site son iyi bilinen
 * değerlerle yayında kalır.
 */
import { readFileSync, writeFileSync } from 'node:fs';

const SOURCE_URL = 'https://finans.truncgil.com/v4/today.json';
const OUTPUT = new URL('../content/piyasa.json', import.meta.url);
const TIMEOUT_MS = 10_000;
const MAX_ATTEMPTS = 12;
const RETRY_DELAY_MS = 4000;

const SPEC = [
  { key: 'USD', label: 'USD/TRY', digits: 2 },
  { key: 'EUR', label: 'EUR/TRY', digits: 2 },
  { key: 'GBP', label: 'GBP/TRY', digits: 2 },
  { key: 'CHF', label: 'CHF/TRY', digits: 2 },
  { key: 'JPY', label: 'JPY/TRY', digits: 4 },
  { key: 'GRA', label: 'Gram Altın', digits: 2 },
  { key: 'CEYREKALTIN', label: 'Çeyrek Altın', digits: 2 },
  { key: 'GUMUS', label: 'Gram Gümüş', digits: 2 },
  { key: 'XU100', label: 'BIST 100', digits: 2 },
];

const positive = (value) =>
  typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : null;

function parse(payload) {
  const items = [];

  for (const spec of SPEC) {
    const entry = payload?.[spec.key];
    if (typeof entry !== 'object' || entry === null) continue;

    const value = positive(entry.Selling) ?? positive(entry.Buying);
    if (value === null) continue;

    items.push({
      key: spec.key,
      label: spec.label,
      value,
      digits: spec.digits,
      change: typeof entry.Change === 'number' ? entry.Change : 0,
    });
  }

  // Birkaç kalem gelmiş olsa da yarım veri yayınlamayız.
  if (items.length < SPEC.length - 1) return null;

  const raw = payload?.Update_Date;
  const updatedAt =
    typeof raw === 'string' && !Number.isNaN(new Date(`${raw.replace(' ', 'T')}+03:00`).getTime())
      ? new Date(`${raw.replace(' ', 'T')}+03:00`).toISOString()
      : new Date().toISOString();

  return { updatedAt, items };
}

async function attempt() {
  const response = await fetch(SOURCE_URL, {
    signal: AbortSignal.timeout(TIMEOUT_MS),
    headers: { accept: 'application/json' },
  });

  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  // `.json()` yerine metin: kesik gövdeyi burada yakalayıp yeniden deniyoruz.
  return parse(JSON.parse(await response.text()));
}

for (let tries = 1; tries <= MAX_ATTEMPTS; tries += 1) {
  try {
    const snapshot = await attempt();

    if (snapshot) {
      writeFileSync(OUTPUT, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8');
      console.log(`Piyasa verisi güncellendi: ${snapshot.items.length} kalem, ${snapshot.updatedAt}`);
      process.exit(0);
    }

    console.warn(`Deneme ${tries}/${MAX_ATTEMPTS}: veri eksik geldi.`);
  } catch (error) {
    console.warn(`Deneme ${tries}/${MAX_ATTEMPTS}: ${error.message}`);
  }

  if (tries < MAX_ATTEMPTS) await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
}

// Başarısızlık derlemeyi düşürmez; mevcut dosya olduğu gibi kalır.
try {
  const current = JSON.parse(readFileSync(OUTPUT, 'utf8'));
  console.warn(`Veri alınamadı. Mevcut anlık görüntü korunuyor (${current.updatedAt}).`);
} catch {
  console.warn('Veri alınamadı ve kayıtlı anlık görüntü yok; şerit gizlenecek.');
}
process.exit(0);
