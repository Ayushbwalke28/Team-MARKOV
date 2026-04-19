"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectionService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let ConnectionService = class ConnectionService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async sendRequest(senderId, receiverId) {
        if (senderId === receiverId) {
            throw new common_1.ConflictException('Cannot connect with yourself');
        }
        const receiver = await this.prisma.user.findUnique({ where: { id: receiverId } });
        if (!receiver) {
            throw new common_1.NotFoundException('User not found');
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
            throw new common_1.ConflictException('Connection or request already exists');
        }
        return this.prisma.connection.create({
            data: {
                senderId,
                receiverId,
                status: client_1.ConnectionStatus.pending,
            }
        });
    }
    async acceptRequest(userId, connectionId) {
        const connection = await this.prisma.connection.findUnique({
            where: { id: connectionId }
        });
        if (!connection) {
            throw new common_1.NotFoundException('Connection request not found');
        }
        if (connection.receiverId !== userId) {
            throw new common_1.ConflictException('Not authorized to accept this request');
        }
        if (connection.status !== client_1.ConnectionStatus.pending) {
            throw new common_1.ConflictException('Connection request is not pending');
        }
        return this.prisma.connection.update({
            where: { id: connectionId },
            data: { status: client_1.ConnectionStatus.accepted }
        });
    }
    async declineRequest(userId, connectionId) {
        const connection = await this.prisma.connection.findUnique({
            where: { id: connectionId }
        });
        if (!connection) {
            throw new common_1.NotFoundException('Connection request not found');
        }
        if (connection.receiverId !== userId) {
            throw new common_1.ConflictException('Not authorized to decline this request');
        }
        return this.prisma.connection.update({
            where: { id: connectionId },
            data: { status: client_1.ConnectionStatus.declined }
        });
    }
    async removeConnection(userId, connectionId) {
        const connection = await this.prisma.connection.findUnique({
            where: { id: connectionId }
        });
        if (!connection) {
            throw new common_1.NotFoundException('Connection not found');
        }
        if (connection.senderId !== userId && connection.receiverId !== userId) {
            throw new common_1.ConflictException('Not authorized to remove this connection');
        }
        return this.prisma.connection.delete({
            where: { id: connectionId }
        });
    }
    async getMyConnections(userId) {
        const connections = await this.prisma.connection.findMany({
            where: {
                OR: [
                    { senderId: userId },
                    { receiverId: userId }
                ],
                status: client_1.ConnectionStatus.accepted
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
    async getPendingRequests(userId) {
        const requests = await this.prisma.connection.findMany({
            where: {
                receiverId: userId,
                status: client_1.ConnectionStatus.pending
            },
            include: {
                sender: {
                    select: { id: true, name: true, avatarUrl: true, profile: { select: { about: true } } }
                }
            }
        });
        return requests;
    }
    async getSuggestions(userId) {
        const existingConnections = await this.prisma.connection.findMany({
            where: {
                OR: [
                    { senderId: userId },
                    { receiverId: userId }
                ]
            }
        });
        const excludedIds = existingConnections.map(c => c.senderId === userId ? c.receiverId : c.senderId);
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
};
exports.ConnectionService = ConnectionService;
exports.ConnectionService = ConnectionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ConnectionService);
//# sourceMappingURL=connection.service.js.map