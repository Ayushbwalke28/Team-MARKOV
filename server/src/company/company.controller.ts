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
import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Controller('companies')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  /**
   * POST /companies
   * Create a new company. Requires `company_owner` role.
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('company_owner')
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Req() req: any, @Body() body: CreateCompanyDto) {
    return this.companyService.create(req.user.userId, body);
  }

  /**
   * GET /companies
   * Public – list all companies.
   */
  @Get()
  findAll() {
    return this.companyService.findAll();
  }

  /**
   * GET /companies/mine
   * Returns the authenticated user's company.
   */
  @UseGuards(JwtAuthGuard)
  @Get('mine')
  findMine(@Req() req: any) {
    return this.companyService.findByOwner(req.user.userId);
  }

  /**
   * GET /companies/:id
   * Public – get a single company by ID.
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.companyService.findById(id);
  }

  /**
   * PATCH /companies/:id
   * Update a company. Authenticated owner only.
   */
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Req() req: any, @Body() body: UpdateCompanyDto) {
    return this.companyService.update(id, req.user.userId, body);
  }

  /**
   * DELETE /companies/:id
   * Delete a company. Authenticated owner only.
   */
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string, @Req() req: any) {
    return this.companyService.remove(id, req.user.userId);
  }
}
