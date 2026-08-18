import 'dotenv/config';

import { defineConfig } from '@prisma/config';

/**
 * Migration ve seed komutları havuzlanmamış (direct) bağlantıyı tercih eder.
 * Neon/Supabase gibi sağlayıcılarda pooler üzerinden migration çalıştırmak sorun çıkarır.
 */
const migrationUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: migrationUrl,
  },
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
});
