import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProfileModule } from './profile/profile.module';
import { VerificationModule } from './verification/verification.module';
import { CompanyModule } from './company/company.module';
import { OpportunityModule } from './opportunity/opportunity.module';
import { EventModule } from './event/event.module';
import { PostModule } from './post/post.module';
import { FeedModule } from './feed/feed.module';
import { MediaModule } from './media/media.module';

@Module({
  imports: [PrismaModule, AuthModule, UsersModule, ProfileModule, VerificationModule, CompanyModule, OpportunityModule, EventModule, PostModule, FeedModule, MediaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
