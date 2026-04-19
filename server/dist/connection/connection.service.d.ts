import { PrismaService } from '../prisma/prisma.service';
export declare class ConnectionService {
    private prisma;
    constructor(prisma: PrismaService);
    sendRequest(senderId: string, receiverId: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.ConnectionStatus;
        createdAt: Date;
        updatedAt: Date;
        senderId: string;
        receiverId: string;
    }>;
    acceptRequest(userId: string, connectionId: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.ConnectionStatus;
        createdAt: Date;
        updatedAt: Date;
        senderId: string;
        receiverId: string;
    }>;
    declineRequest(userId: string, connectionId: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.ConnectionStatus;
        createdAt: Date;
        updatedAt: Date;
        senderId: string;
        receiverId: string;
    }>;
    removeConnection(userId: string, connectionId: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.ConnectionStatus;
        createdAt: Date;
        updatedAt: Date;
        senderId: string;
        receiverId: string;
    }>;
    getMyConnections(userId: string): Promise<{
        id: string;
        connectedSince: Date;
        user: {
            id: string;
            name: string;
            avatarUrl: string;
            profile: {
                about: string;
            };
        };
    }[]>;
    getPendingRequests(userId: string): Promise<({
        sender: {
            id: string;
            name: string;
            avatarUrl: string;
            profile: {
                about: string;
            };
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.ConnectionStatus;
        createdAt: Date;
        updatedAt: Date;
        senderId: string;
        receiverId: string;
    })[]>;
    getSuggestions(userId: string): Promise<{
        id: string;
        name: string;
        avatarUrl: string;
        profile: {
            about: string;
        };
    }[]>;
}
