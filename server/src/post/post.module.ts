import { Module } from '@nestjs/common';
import { PostController } from './post.controller';
import { PostService } from './post.service';

import { MediaModule } from '../media/media.module';

@Module({
  imports: [MediaModule],
  controllers: [PostController],
  providers: [PostService],
  exports: [PostService],
})
export class PostModule {}
