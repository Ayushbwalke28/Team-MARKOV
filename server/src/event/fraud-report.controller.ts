import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EventService } from './event.service';
import { ReportFraudDto } from './dto/report-fraud.dto';

@Controller('events')
export class FraudReportController {
  constructor(private readonly eventService: EventService) {}

  @UseGuards(JwtAuthGuard)
  @Post(':id/report-fraud')
  @HttpCode(HttpStatus.CREATED)
  reportFraud(@Param('id') eventId: string, @Req() req: any, @Body() dto: ReportFraudDto) {
    return this.eventService.reportFraud(eventId, req.user.userId, dto.reason, dto.details);
  }
}
