import { Test, TestingModule } from '@nestjs/testing';
import { ConnectionService } from './connection.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ConnectionService', () => {
  let service: ConnectionService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConnectionService,
        {
          provide: PrismaService,
          useValue: {
            user: { findUnique: jest.fn(), findMany: jest.fn() },
            connection: {
              findFirst: jest.fn(),
              findUnique: jest.fn(),
              findMany: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<ConnectionService>(ConnectionService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
