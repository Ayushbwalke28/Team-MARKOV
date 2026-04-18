import { Module } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';
import { UsersModule } from '../users/users.module';
import { MediaModule } from '../media/media.module';

@Module({
  imports: [UsersModule, MediaModule],
  providers: [CompanyService],
  controllers: [CompanyController],
  exports: [CompanyService],
})
export class CompanyModule {}
