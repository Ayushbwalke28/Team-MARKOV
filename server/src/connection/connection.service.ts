import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConnectionStatus } from '@prisma/client';

@Injectable()
export class ConnectionService {
  constructor(private prisma: PrismaService) {}

  async sendRequest(senderId: string, receiverId: string) {
    if (senderId === receiverId) {
      throw new ConflictException('Cannot connect with yourself');
    }
    
    const receiver = await this.prisma.user.findUnique({ where: { id: receiverId } });
    if (!receiver) {
      throw new NotFoundException('User not found');
    }

    const existing = await this.prisma.connection.findFirst({
      where: {
        OR: [
          { senderId, receiverId },
          { senderId: receiverId, receiverId: senderId }
        ]
      }
    });

    if (existing) {
      throw new ConflictException('Connection or request already exists');
    }

    return this.prisma.connection.create({
      data: {
        senderId,
        receiverId,
        status: ConnectionStatus.pending,
      }
    });
  }

  async acceptRequest(userId: string, connectionId: string) {
    const connection = await this.prisma.connection.findUnique({
      where: { id: connectionId }
    });

    if (!connection) {
      throw new NotFoundException('Connection request not found');
    }

    if (connection.receiverId !== userId) {
      throw new ConflictException('Not authorized to accept this request');
    }

    if (connection.status !== ConnectionStatus.pending) {
      throw new ConflictException('Connection request is not pending');
    }

    return this.prisma.connection.update({
      where: { id: connectionId },
      data: { status: ConnectionStatus.accepted }
    });
  }

  async declineRequest(userId: string, connectionId: string) {
    const connection = await this.prisma.connection.findUnique({
      where: { id: connectionId }
    });

    if (!connection) {
      throw new NotFoundException('Connection request not found');
    }

    if (connection.receiverId !== userId) {
      throw new ConflictException('Not authorized to decline this request');
    }

    return this.prisma.connection.update({
      where: { id: connectionId },
      data: { status: ConnectionStatus.declined }
    });
  }

  async removeConnection(userId: string, connectionId: string) {
    const connection = await this.prisma.connection.findUnique({
      where: { id: connectionId }
    });

    if (!connection) {
      throw new NotFoundException('Connection not found');
    }

    if (connection.senderId !== userId && connection.receiverId !== userId) {
      throw new ConflictException('Not authorized to remove this connection');
    }

    return this.prisma.connection.delete({
      where: { id: connectionId }
    });
  }

  async getMyConnections(userId: string) {
    const connections = await this.prisma.connection.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId }
        ],
        status: ConnectionStatus.accepted
      },
      include: {
        sender: {
          select: { id: true, name: true, avatarUrl: true, profile: { select: { about: true } } }
        },
        receiver: {
          select: { id: true, name: true, avatarUrl: true, profile: { select: { about: true } } }
        }
      }
    });

    return connections.map(conn => {
      const isSender = conn.senderId === userId;
      const otherUser = isSender ? conn.receiver : conn.sender;
      return {
        id: conn.id,
        connectedSince: conn.updatedAt,
        user: otherUser
      };
    });
  }

  async getPendingRequests(userId: string) {
    const requests = await this.prisma.connection.findMany({
      where: {
        receiverId: userId,
        status: ConnectionStatus.pending
      },
      include: {
        sender: {
          select: { id: true, name: true, avatarUrl: true, profile: { select: { about: true } } }
        }
      }
    });
    return requests;
  }

  async getSuggestions(userId: string) {
    const existingConnections = await this.prisma.connection.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId }
        ]
      }
    });

    const excludedIds = existingConnections.map(c => 
      c.senderId === userId ? c.receiverId : c.senderId
    );
    excludedIds.push(userId);

    return this.prisma.user.findMany({
      where: {
        id: { notIn: excludedIds }
      },
      select: {
        id: true, name: true, avatarUrl: true, profile: { select: { about: true } }
      },
      take: 10
    });
  }
}
