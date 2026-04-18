import { Module } from '@nestjs/common';
import { EventController } from './event.controller';
import { EventService } from './event.service';

import { MediaModule } from '../media/media.module';

@Module({
  imports: [MediaModule],
  controllers: [EventController],
  providers: [EventService]
})
export class EventModule {}
