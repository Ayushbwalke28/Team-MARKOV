import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  // ── Static routes MUST come before :id wildcard ──

  @Get()
  findAll() {
    return this.eventService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-events')
  getMyEvents(@Req() req: any) {
    return this.eventService.getMyEvents(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-bookings')
  getMyBookings(@Req() req: any) {
    return this.eventService.getMyBookings(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Req() req: any, @Body() dto: CreateEventDto) {
    return this.eventService.create(req.user.userId, dto);
  }

  // ── Parameterized routes ──

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventService.findById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Req() req: any,
    @Body() dto: UpdateEventDto,
  ) {
    return this.eventService.update(id, req.user.userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string, @Req() req: any) {
    return this.eventService.remove(id, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/book')
  @HttpCode(HttpStatus.CREATED)
  bookEvent(@Param('id') id: string, @Req() req: any) {
    return this.eventService.bookEvent(id, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/book')
  @HttpCode(HttpStatus.OK)
  cancelBooking(@Param('id') id: string, @Req() req: any) {
    return this.eventService.cancelBooking(id, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/bookings')
  getBookings(@Param('id') id: string, @Req() req: any) {
    return this.eventService.getBookings(id, req.user.userId);
  }
}
