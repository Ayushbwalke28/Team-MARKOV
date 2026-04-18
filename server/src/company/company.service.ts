import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompanyService {
  constructor(private readonly prisma: PrismaService) {}

  async create(ownerId: string, dto: CreateCompanyDto) {
    // Guard: only users with company_owner role may create a company
    const ownerRole = await this.prisma.userRole.findUnique({
      where: { userId_role: { userId: ownerId, role: 'company_owner' } },
    });
    if (!ownerRole) {
      throw new ForbiddenException(
        'You must have the company_owner role to create a company. ' +
          'Set ownsCompany to true via PATCH /users/me/owns-company first.',
      );
    }

    // Guard: one company per owner (also enforced by DB unique constraint)
    const existing = await this.prisma.company.findUnique({ where: { ownerId } });
    if (existing) {
      throw new ConflictException('You already own a company');
    }

    return this.prisma.company.create({
      data: {
        name: dto.name,
        ownerId,
        location: dto.location,
        startYear: dto.startYear,
        description: dto.description,
        size: dto.size,
        domain: dto.domain,
      },
      include: { owner: { select: { id: true, name: true, email: true } } },
    });
  }

  async findAll() {
    return this.prisma.company.findMany({
      include: { owner: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const company = await this.prisma.company.findUnique({
      where: { id },
      include: { owner: { select: { id: true, name: true, email: true } } },
    });
    if (!company) throw new NotFoundException('Company not found');
    return company;
  }

  async findByOwner(ownerId: string) {
    const company = await this.prisma.company.findUnique({
      where: { ownerId },
      include: { owner: { select: { id: true, name: true, email: true } } },
    });
    if (!company) throw new NotFoundException('You do not own a company yet');
    return company;
  }

  async update(id: string, requesterId: string, dto: UpdateCompanyDto) {
    const company = await this.prisma.company.findUnique({ where: { id } });
    if (!company) throw new NotFoundException('Company not found');
    if (company.ownerId !== requesterId) throw new ForbiddenException('Not your company');

    return this.prisma.company.update({
      where: { id },
      data: {
        name: dto.name,
        location: dto.location,
        startYear: dto.startYear,
        description: dto.description,
        size: dto.size,
        domain: dto.domain,
      },
      include: { owner: { select: { id: true, name: true, email: true } } },
    });
  }

  async remove(id: string, requesterId: string) {
    const company = await this.prisma.company.findUnique({ where: { id } });
    if (!company) throw new NotFoundException('Company not found');
    if (company.ownerId !== requesterId) throw new ForbiddenException('Not your company');

    await this.prisma.company.delete({ where: { id } });
    return { ok: true };
  }
}
