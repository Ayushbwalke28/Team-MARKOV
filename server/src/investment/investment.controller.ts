import { Controller, Post, Get, Patch, Body, Param, UseGuards, Request } from '@nestjs/common';
import { InvestmentService } from './investment.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/investments')
export class InvestmentController {
  constructor(private readonly investmentService: InvestmentService) {}

  @UseGuards(JwtAuthGuard)
  @Post('company/:companyId/profile')
  createCompanyProfile(@Request() req, @Param('companyId') companyId: string, @Body() body: any) {
    return this.investmentService.createCompanyInvestmentProfile(companyId, req.user.userId, body);
  }

  @UseGuards(JwtAuthGuard)
  @Post('investor/profile')
  createInvestorProfile(@Request() req, @Body() body: any) {
    return this.investmentService.createInvestorProfile(req.user.userId, body);
  }

  @UseGuards(JwtAuthGuard)
  @Post('deal-room/:companyId')
  requestDealRoom(@Request() req, @Param('companyId') companyId: string) {
    return this.investmentService.requestDealRoom(companyId, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('deal-room/:id/nda')
  signNda(@Request() req, @Param('id') dealRoomId: string, @Body('ndaUrl') ndaUrl: string) {
    return this.investmentService.signNda(dealRoomId, req.user.userId, ndaUrl);
  }

  @UseGuards(JwtAuthGuard)
  @Get('deal-room/:id')
  getDealRoom(@Request() req, @Param('id') dealRoomId: string) {
    return this.investmentService.getDealRoom(dealRoomId, req.user.userId);
  }
}
