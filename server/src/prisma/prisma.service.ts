import { INestApplication, Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly pool: Pool;

  constructor() {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    super({
      adapter: new PrismaPg(pool as never),
    });
    this.pool = pool;
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

