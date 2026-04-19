import { INestApplication, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  private readonly pool: Pool;

  constructor() {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error('DATABASE_URL is not defined in environment variables');
    }

    // Configure pg Pool with SSL for production/deployment environments (like Neon/Supabase)
    const pool = new Pool({
      connectionString: url,
      ssl: url.includes('sslmode=require') ? { rejectUnauthorized: false } : false,
    });

    super({
      adapter: new PrismaPg(pool),
      log: ['warn', 'error'],
    });
    this.pool = pool;
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('PrismaService: Connected to database');
    } catch (error) {
      this.logger.error('PrismaService: Failed to connect to database', error);
      // Re-throw to prevent app from starting with a broken database connection
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
      await this.pool.end();
      this.logger.log('PrismaService: Disconnected from database');
    } catch (error) {
      this.logger.error('PrismaService: Error during disconnection', error);
    }
  }

  async enableShutdownHooks(app: INestApplication) {
    // NestJS handles SIGTERM/SIGINT by default if app.enableShutdownHooks() is called in main.ts
    // This is kept for compatibility if called elsewhere.
    process.once('SIGINT', async () => {
      await app.close();
    });
    process.once('SIGTERM', async () => {
      await app.close();
    });
  }
}

