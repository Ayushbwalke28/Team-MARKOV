import { Test, TestingModule } from '@nestjs/testing';
import { ConnectionController } from './connection.controller';
import { ConnectionService } from './connection.service';

describe('ConnectionController', () => {
  let controller: ConnectionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConnectionController],
      providers: [
        {
          provide: ConnectionService,
          useValue: {
            sendRequest: jest.fn(),
            acceptRequest: jest.fn(),
            declineRequest: jest.fn(),
            removeConnection: jest.fn(),
            getMyConnections: jest.fn(),
            getPendingRequests: jest.fn(),
            getSuggestions: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ConnectionController>(ConnectionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
