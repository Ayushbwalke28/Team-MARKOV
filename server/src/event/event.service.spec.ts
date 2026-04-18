import { Test, TestingModule } from '@nestjs/testing';
import { EventService } from './event.service';
import { PrismaService } from '../prisma/prisma.service';
import { ForbiddenException, NotFoundException, ConflictException } from '@nestjs/common';

const mockPrismaService = {
  event: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  company: {
    findUnique: jest.fn(),
  },
  eventBooking: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
  },
};

describe('EventService', () => {
  let service: EventService;
  let prisma: typeof mockPrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<EventService>(EventService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an individual event', async () => {
      const dto = {
        title: 'Test Event',
        organizerType: 'individual',
        schedule: new Date().toISOString(),
        mode: 'online',
      };

      prisma.event.create.mockResolvedValue({ id: '1', ...dto });

      const result = await service.create('user-1', dto as any);
      expect(prisma.event.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            organizerUserId: 'user-1',
          }),
        }),
      );
      expect(result.id).toBe('1');
    });

    it('should create a company event when user owns a company', async () => {
      const dto = {
        title: 'Company Event',
        organizerType: 'company',
        schedule: new Date().toISOString(),
        mode: 'online',
      };

      prisma.company.findUnique.mockResolvedValue({ id: 'c-1', ownerId: 'user-1' });
      prisma.event.create.mockResolvedValue({ id: '2', ...dto, organizerCompanyId: 'c-1' });

      const result = await service.create('user-1', dto as any);
      expect(prisma.event.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            organizerCompanyId: 'c-1',
          }),
        }),
      );
      expect(result.id).toBe('2');
    });

    it('should throw ForbiddenException if user tries to create company event without a company', async () => {
      const dto = {
        title: 'Test Event',
        organizerType: 'company',
        schedule: new Date().toISOString(),
        mode: 'online',
      };

      prisma.company.findUnique.mockResolvedValue(null);

      await expect(service.create('user-1', dto as any)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('findAll', () => {
    it('should return an array of events', async () => {
      prisma.event.findMany.mockResolvedValue([{ id: '1' }, { id: '2' }]);
      const result = await service.findAll();
      expect(result.length).toBe(2);
    });
  });

  describe('findById', () => {
    it('should return an event by id', async () => {
      prisma.event.findUnique.mockResolvedValue({ id: '1', title: 'Test' });
      const result = await service.findById('1');
      expect(result.title).toBe('Test');
    });

    it('should throw NotFoundException if event not found', async () => {
      prisma.event.findUnique.mockResolvedValue(null);
      await expect(service.findById('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update an individual event', async () => {
      prisma.event.findUnique.mockResolvedValue({
        id: '1',
        organizerType: 'individual',
        organizerUserId: 'user-1',
      });
      prisma.event.update.mockResolvedValue({ id: '1', title: 'Updated' });

      const result = await service.update('1', 'user-1', { title: 'Updated' } as any);
      expect(result.title).toBe('Updated');
    });

    it('should throw ForbiddenException if user does not own the event', async () => {
      prisma.event.findUnique.mockResolvedValue({
        id: '1',
        organizerType: 'individual',
        organizerUserId: 'other-user',
      });

      await expect(service.update('1', 'user-1', {} as any)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('should delete an event', async () => {
      prisma.event.findUnique.mockResolvedValue({
        id: '1',
        organizerType: 'individual',
        organizerUserId: 'user-1',
      });
      prisma.event.delete.mockResolvedValue({});

      const result = await service.remove('1', 'user-1');
      expect(result).toEqual({ ok: true });
    });
  });

  describe('bookEvent', () => {
    it('should book an event successfully', async () => {
      prisma.event.findUnique.mockResolvedValue({ id: '1' });
      prisma.eventBooking.findUnique.mockResolvedValue(null);
      prisma.eventBooking.create.mockResolvedValue({ id: 'b-1', eventId: '1', userId: 'u-1' });

      const result = await service.bookEvent('1', 'u-1');
      expect(result.id).toBe('b-1');
    });

    it('should throw NotFoundException for unknown event', async () => {
      prisma.event.findUnique.mockResolvedValue(null);
      await expect(service.bookEvent('1', 'u-1')).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if user already booked', async () => {
      prisma.event.findUnique.mockResolvedValue({ id: '1' });
      prisma.eventBooking.findUnique.mockResolvedValue({ id: 'b-1' });

      await expect(service.bookEvent('1', 'u-1')).rejects.toThrow(ConflictException);
    });
  });

  describe('getBookings', () => {
    it('should return bookings for owned event', async () => {
      prisma.event.findUnique.mockResolvedValue({
        id: '1',
        organizerType: 'individual',
        organizerUserId: 'user-1',
      });
      prisma.eventBooking.findMany.mockResolvedValue([{ id: 'b-1' }]);

      const result = await service.getBookings('1', 'user-1');
      expect(result.length).toBe(1);
    });
  });
});
