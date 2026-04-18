import { Controller, Post, Param, Patch, Delete, Get, UseGuards, Request } from '@nestjs/common';
import { ConnectionService } from './connection.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

@UseGuards(JwtAuthGuard)
@Controller('api/connections')
export class ConnectionController {
  constructor(private readonly connectionService: ConnectionService) {}

  @Post('request/:receiverId')
  sendRequest(@Request() req, @Param('receiverId') receiverId: string) {
    return this.connectionService.sendRequest(req.user.userId, receiverId);
  }

  @Patch('accept/:connectionId')
  acceptRequest(@Request() req, @Param('connectionId') connectionId: string) {
    return this.connectionService.acceptRequest(req.user.userId, connectionId);
  }

  @Patch('decline/:connectionId')
  declineRequest(@Request() req, @Param('connectionId') connectionId: string) {
    return this.connectionService.declineRequest(req.user.userId, connectionId);
  }

  @Delete(':connectionId')
  removeConnection(@Request() req, @Param('connectionId') connectionId: string) {
    return this.connectionService.removeConnection(req.user.userId, connectionId);
  }

  @Get()
  getMyConnections(@Request() req) {
    return this.connectionService.getMyConnections(req.user.userId);
  }

  @Get('requests')
  getPendingRequests(@Request() req) {
    return this.connectionService.getPendingRequests(req.user.userId);
  }

  @Get('suggestions')
  getSuggestions(@Request() req) {
    return this.connectionService.getSuggestions(req.user.userId);
  }
}
