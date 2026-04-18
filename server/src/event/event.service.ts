import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { OrganizerType } from '@prisma/client';

/** Default include shape for event queries — organizer info + aggregated counts */
const EVENT_INCLUDE = {
  organizerUser: { select: { id: true, name: true } },
  organizerCompany: { select: { id: true, name: true } },
  _count: {
    select: { bookings: true },
  },
} as const;

@Injectable()
export class EventService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateEventDto) {
    let organizerCompanyId: string | undefined = undefined;
    let organizerUserId: string | undefined = undefined;

    if (dto.organizerType === OrganizerType.company) {
      const company = await this.prisma.company.findUnique({
        where: { ownerId: userId },
      });

      if (!company) {
        throw new ForbiddenException(
          'You must own a company to create a company event.',
        );
      }
      organizerCompanyId = company.id;
    } else {
      organizerUserId = userId;
    }

    return this.prisma.event.create({
      data: {
        title: dto.title,
        description: dto.description,
        category: dto.category,
        organizerType: dto.organizerType,
        schedule: new Date(dto.schedule),
        fees: dto.fees || 0,
        mode: dto.mode,
        venue: dto.venue,
        onlinePlatform: dto.onlinePlatform,
        organizerUserId,
        organizerCompanyId,
      },
      include: EVENT_INCLUDE,
    });
  }

  async findAll() {
    return this.prisma.event.findMany({
      include: EVENT_INCLUDE,
      orderBy: { schedule: 'asc' },
    });
  }

  async findById(id: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: EVENT_INCLUDE,
    });
    if (!event) throw new NotFoundException('Event not found');
    return event;
  }

  private async verifyOwnership(id: string, userId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: { organizerCompany: true },
    });

    if (!event) throw new NotFoundException('Event not found');

    if (event.organizerType === OrganizerType.individual) {
      if (event.organizerUserId !== userId) {
        throw new ForbiddenException('Not your event');
      }
    } else if (event.organizerType === OrganizerType.company) {
      if (event.organizerCompany?.ownerId !== userId) {
        throw new ForbiddenException('Not your event');
      }
    }

    return event;
  }

  async update(id: string, userId: string, dto: UpdateEventDto) {
    await this.verifyOwnership(id, userId);

    return this.prisma.event.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        category: dto.category,
        schedule: dto.schedule ? new Date(dto.schedule) : undefined,
        fees: dto.fees,
        mode: dto.mode,
        venue: dto.venue,
        onlinePlatform: dto.onlinePlatform,
      },
      include: EVENT_INCLUDE,
    });
  }

  async remove(id: string, userId: string) {
    await this.verifyOwnership(id, userId);

    await this.prisma.event.delete({ where: { id } });
    return { ok: true };
  }

  async bookEvent(id: string, userId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
    });

    if (!event) throw new NotFoundException('Event not found');

    const existingBooking = await this.prisma.eventBooking.findUnique({
      where: {
        eventId_userId: {
          eventId: id,
          userId,
        },
      },
    });

    if (existingBooking) {
      throw new ConflictException('You have already booked this event');
    }

    return this.prisma.eventBooking.create({
      data: {
        eventId: id,
        userId,
      },
      include: {
        event: {
          select: { id: true, title: true, schedule: true, mode: true },
        },
      },
    });
  }

  async cancelBooking(id: string, userId: string) {
    const booking = await this.prisma.eventBooking.findUnique({
      where: {
        eventId_userId: {
          eventId: id,
          userId,
        },
      },
    });

    if (!booking) {
      throw new NotFoundException('You have not booked this event');
    }

    await this.prisma.eventBooking.delete({
      where: {
        eventId_userId: {
          eventId: id,
          userId,
        },
      },
    });
    return { ok: true };
  }

  async getBookings(id: string, userId: string) {
    await this.verifyOwnership(id, userId);

    return this.prisma.eventBooking.findMany({
      where: { eventId: id },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getMyBookings(userId: string) {
    return this.prisma.eventBooking.findMany({
      where: { userId },
      include: {
        event: {
          include: EVENT_INCLUDE,
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getMyEvents(userId: string) {
    // Fetch events organized by the user directly OR via their company
    const company = await this.prisma.company.findUnique({
      where: { ownerId: userId },
    });

    return this.prisma.event.findMany({
      where: {
        OR: [
          { organizerUserId: userId },
          ...(company ? [{ organizerCompanyId: company.id }] : []),
        ],
      },
      include: EVENT_INCLUDE,
      orderBy: { schedule: 'asc' },
    });
  }
}
