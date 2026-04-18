jest.mock('@prisma/client', () => ({
  ...jest.requireActual('@prisma/client'),
  OrganizerType: { individual: 'individual', company: 'company' },
  EventMode: { online: 'online', offline: 'offline', hybrid: 'hybrid' },
}));

import { Test, TestingModule } from '@nestjs/testing';
import { EventController } from './event.controller';
import { EventService } from './event.service';

const mockEventService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  bookEvent: jest.fn(),
  getBookings: jest.fn(),
};

describe('EventController', () => {
  let controller: EventController;
  let service: typeof mockEventService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventController],
      providers: [
        { provide: EventService, useValue: mockEventService },
      ],
    }).compile();

    controller = module.get<EventController>(EventController);
    service = module.get(EventService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all events', async () => {
      service.findAll.mockResolvedValue([{ id: '1' }, { id: '2' }]);
      const result = await controller.findAll();
      expect(service.findAll).toHaveBeenCalled();
      expect(result.length).toBe(2);
    });
  });

  describe('findOne', () => {
    it('should return a single event by id', async () => {
      service.findById.mockResolvedValue({ id: '1', title: 'Test' });
      const result = await controller.findOne('1');
      expect(service.findById).toHaveBeenCalledWith('1');
      expect(result.title).toBe('Test');
    });
  });

  describe('create', () => {
    it('should create a new event', async () => {
      const dto = { title: 'Test', organizerType: 'individual', mode: 'online', schedule: new Date().toISOString() };
      const req = { user: { userId: 'u-1' } };
      service.create.mockResolvedValue({ id: '1', ...dto });

      await controller.create(req, dto as any);
      expect(service.create).toHaveBeenCalledWith('u-1', dto);
    });
  });

  describe('update', () => {
    it('should update an event', async () => {
      const dto = { title: 'Updated' };
      const req = { user: { userId: 'u-1' } };
      service.update.mockResolvedValue({ id: '1', ...dto });

      await controller.update('1', req, dto as any);
      expect(service.update).toHaveBeenCalledWith('1', 'u-1', dto);
    });
  });

  describe('remove', () => {
    it('should delete an event', async () => {
      const req = { user: { userId: 'u-1' } };
      service.remove.mockResolvedValue({ ok: true });

      const result = await controller.remove('1', req);
      expect(service.remove).toHaveBeenCalledWith('1', 'u-1');
      expect(result).toEqual({ ok: true });
    });
  });

  describe('bookEvent', () => {
    it('should book an event', async () => {
      const req = { user: { userId: 'u-1' } };
      service.bookEvent.mockResolvedValue({ id: 'b-1', eventId: '1', userId: 'u-1' });

      const result = await controller.bookEvent('1', req);
      expect(service.bookEvent).toHaveBeenCalledWith('1', 'u-1');
      expect(result.id).toBe('b-1');
    });
  });

  describe('getBookings', () => {
    it('should return event bookings for the host', async () => {
      const req = { user: { userId: 'u-1' } };
      service.getBookings.mockResolvedValue([{ id: 'b-1' }]);

      const result = await controller.getBookings('1', req);
      expect(service.getBookings).toHaveBeenCalledWith('1', 'u-1');
      expect(result.length).toBe(1);
    });
  });
});
