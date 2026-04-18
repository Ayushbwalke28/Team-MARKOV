import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'npx ts-node prisma/seed.ts',
  },
  datasource: {
    // Prisma CLI (migrations/studio) should use a *direct* database URL.
    // If you are using Supabase pgBouncer (pooler) for runtime, keep it in DATABASE_URL
    // and set DATABASE_URL_MIGRATE to the direct 5432 URL.
    url: process.env.DATABASE_URL_MIGRATE || process.env.DATABASE_URL || '',
  },
});

