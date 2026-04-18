import { INestApplication, Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  constructor() {
    super({
      adapter: new PrismaPg(
        // Prisma expects a pg Pool/Client instance; Pool is recommended.
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        // (types are intentionally loose across adapter boundaries)
        (undefined as unknown) as never,
      ),
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
    await this.pool.end();
  }

  async enableShutdownHooks(app: INestApplication) {
    // Prisma v7 types no longer include the legacy "beforeExit" event in `$on`.
    // We still want graceful shutdown; Nest already handles SIGTERM/SIGINT.
    process.once('SIGINT', async () => app.close());
    process.once('SIGTERM', async () => app.close());
  }
}

