import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '@/generated/prisma/client';

const globalForPrisma = globalThis as unknown as { periodistaPrisma?: PrismaClient };

function createClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      'DATABASE_URL tanımlı değil. Vercel proje ayarlarından (ya da yerelde .env dosyasından) Postgres bağlantı adresini ekleyin.',
    );
  }

  return new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });
}

function getClient(): PrismaClient {
  if (!globalForPrisma.periodistaPrisma) {
    globalForPrisma.periodistaPrisma = createClient();
  }

  return globalForPrisma.periodistaPrisma;
}

/**
 * Bağlantı ilk kullanımda kurulur. Böylece `next build` sırasında veritabanı
 * adresi olmadan da modül import edilebilir; hata yalnızca gerçek sorguda çıkar.
 */
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, property) {
    const client = getClient();
    const value = Reflect.get(client, property, client);

    return typeof value === 'function' ? value.bind(client) : value;
  },
});

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}
