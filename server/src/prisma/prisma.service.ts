import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }

  async enableShutdownHooks(app: INestApplication) {
    // Prisma v7 types no longer include the legacy "beforeExit" event in `$on`.
    // We still want graceful shutdown; Nest already handles SIGTERM/SIGINT.
    process.once('SIGINT', async () => app.close());
    process.once('SIGTERM', async () => app.close());
  }
}

