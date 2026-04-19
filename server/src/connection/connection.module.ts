import { Module } from '@nestjs/common';
import { ConnectionService } from './connection.service';
import { ConnectionController } from './connection.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [ConnectionController],
  providers: [ConnectionService],
  exports: [ConnectionService]
})
export class ConnectionModule {}
