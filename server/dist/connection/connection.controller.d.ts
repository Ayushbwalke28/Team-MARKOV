import { ConnectionService } from './connection.service';
export declare class ConnectionController {
    private readonly connectionService;
    constructor(connectionService: ConnectionService);
    sendRequest(req: any, receiverId: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.ConnectionStatus;
        createdAt: Date;
        updatedAt: Date;
        senderId: string;
        receiverId: string;
    }>;
    acceptRequest(req: any, connectionId: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.ConnectionStatus;
        createdAt: Date;
        updatedAt: Date;
        senderId: string;
        receiverId: string;
    }>;
    declineRequest(req: any, connectionId: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.ConnectionStatus;
        createdAt: Date;
        updatedAt: Date;
        senderId: string;
        receiverId: string;
    }>;
    removeConnection(req: any, connectionId: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.ConnectionStatus;
        createdAt: Date;
        updatedAt: Date;
        senderId: string;
        receiverId: string;
    }>;
    getMyConnections(req: any): Promise<{
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
    getPendingRequests(req: any): Promise<({
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
    getSuggestions(req: any): Promise<{
        id: string;
        name: string;
        avatarUrl: string;
        profile: {
            about: string;
        };
    }[]>;
}
