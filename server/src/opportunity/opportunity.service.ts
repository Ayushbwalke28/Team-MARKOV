import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOpportunityDto } from './dto/create-opportunity.dto';
import { UpdateOpportunityDto } from './dto/update-opportunity.dto';

@Injectable()
export class OpportunityService {
  constructor(private readonly prisma: PrismaService) {}

  async create(ownerId: string, dto: CreateOpportunityDto) {
    const company = await this.prisma.company.findUnique({
      where: { ownerId },
    });

    if (!company) {
      throw new ForbiddenException(
        'You must own a company to create an opportunity.',
      );
    }

    return this.prisma.opportunity.create({
      data: {
        companyId: company.id,
        type: dto.type,
        mode: dto.mode,
        status: dto.status,
        payment: dto.payment,
        postName: dto.postName,
        description: dto.description,
        registrationDeadline: dto.registrationDeadline ? new Date(dto.registrationDeadline) : null,
      },
      include: {
        company: {
          select: { id: true, name: true }
        }
      }
    });
  }

  async findAll() {
    return this.prisma.opportunity.findMany({
      include: {
        company: {
          select: { id: true, name: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAllByCompany(companyId: string) {
    return this.prisma.opportunity.findMany({
      where: { companyId },
      include: {
        company: {
          select: { id: true, name: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const opportunity = await this.prisma.opportunity.findUnique({
      where: { id },
      include: {
        company: {
          select: { id: true, name: true }
        }
      },
    });
    if (!opportunity) throw new NotFoundException('Opportunity not found');
    return opportunity;
  }

  async update(id: string, ownerId: string, dto: UpdateOpportunityDto) {
    const opportunity = await this.prisma.opportunity.findUnique({
      where: { id },
      include: { company: true },
    });

    if (!opportunity) throw new NotFoundException('Opportunity not found');
    if (opportunity.company.ownerId !== ownerId) {
      throw new ForbiddenException('Not your opportunity');
    }

    return this.prisma.opportunity.update({
      where: { id },
      data: {
        type: dto.type,
        mode: dto.mode,
        status: dto.status,
        payment: dto.payment,
        postName: dto.postName,
        description: dto.description,
        registrationDeadline: dto.registrationDeadline ? new Date(dto.registrationDeadline) : undefined,
      },
      include: {
        company: {
          select: { id: true, name: true }
        }
      },
    });
  }

  async remove(id: string, ownerId: string) {
    const opportunity = await this.prisma.opportunity.findUnique({
      where: { id },
      include: { company: true },
    });

    if (!opportunity) throw new NotFoundException('Opportunity not found');
    if (opportunity.company.ownerId !== ownerId) {
      throw new ForbiddenException('Not your opportunity');
    }

    await this.prisma.opportunity.delete({ where: { id } });
    return { ok: true };
  }
}
