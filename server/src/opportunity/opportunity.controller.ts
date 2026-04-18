import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { OpportunityService } from './opportunity.service';
import { CreateOpportunityDto } from './dto/create-opportunity.dto';
import { UpdateOpportunityDto } from './dto/update-opportunity.dto';

@Controller('opportunities')
export class OpportunityController {
  constructor(private readonly opportunityService: OpportunityService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('company_owner')
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Req() req: any, @Body() dto: CreateOpportunityDto) {
    return this.opportunityService.create(req.user.userId, dto);
  }

  @Get()
  findAll() {
    return this.opportunityService.findAll();
  }

  @Get('company/:companyId')
  findAllByCompany(@Param('companyId') companyId: string) {
    return this.opportunityService.findAllByCompany(companyId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.opportunityService.findById(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('company_owner')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Req() req: any,
    @Body() dto: UpdateOpportunityDto,
  ) {
    return this.opportunityService.update(id, req.user.userId, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('company_owner')
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string, @Req() req: any) {
    return this.opportunityService.remove(id, req.user.userId);
  }
}
