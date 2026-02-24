import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, UserRole } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import {
  CostFiltersDto,
  CostResponseDto,
  CreateCostDto,
  UpdateCostDto,
} from './dto';

const costInclude = {
  auditLogs: {
    orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
  },
} satisfies Prisma.CostInclude;

type CostWithRelations = Prisma.CostGetPayload<{
  include: typeof costInclude;
}>;

interface AuthenticatedUser {
  userId: string;
  role: UserRole;
}

@Injectable()
export class CostsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters: CostFiltersDto): Promise<CostResponseDto[]> {
    const where: Prisma.CostWhereInput = {};

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { category: { contains: filters.search, mode: 'insensitive' } },
        { vendor: { contains: filters.search, mode: 'insensitive' } },
        { budgetGroup: { contains: filters.search, mode: 'insensitive' } },
        { referenceNumber: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.category) {
      where.category = filters.category;
    }

    if (filters.costType) {
      where.costType = filters.costType;
    }

    if (filters.paymentStatus) {
      where.paymentStatus = filters.paymentStatus;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.dateFrom || filters.dateTo) {
      where.costDate = {};
      if (filters.dateFrom) {
        where.costDate.gte = this.startOfDay(filters.dateFrom);
      }
      if (filters.dateTo) {
        where.costDate.lte = this.endOfDay(filters.dateTo);
      }
    }

    const rows = await this.prisma.cost.findMany({
      where,
      include: costInclude,
      orderBy: [{ costDate: 'desc' }, { updatedAt: 'desc' }],
    });

    return rows.map((row) => this.toCostResponseDto(row));
  }

  async findOne(id: string): Promise<CostResponseDto> {
    const row = await this.prisma.cost.findUnique({
      where: { id },
      include: costInclude,
    });

    if (!row) {
      throw new NotFoundException(`Cost ${id} not found`);
    }

    return this.toCostResponseDto(row);
  }

  async create(
    dto: CreateCostDto,
    currentUser: AuthenticatedUser,
  ): Promise<CostResponseDto> {
    if (dto.dueDate < dto.costDate) {
      throw new BadRequestException('Due date cannot be before cost date');
    }

    if (dto.paidDate && dto.paidDate < dto.costDate) {
      throw new BadRequestException('Paid date cannot be before cost date');
    }

    const performedBy = await this.resolveActor(currentUser, dto.createdBy);

    const created = await this.prisma.cost.create({
      data: {
        title: dto.title.trim(),
        category: dto.category,
        costType: dto.costType,
        amount: dto.amount,
        taxAmount: dto.taxAmount ?? 0,
        paymentMethod: dto.paymentMethod,
        billingPeriod: dto.billingPeriod,
        costDate: dto.costDate,
        dueDate: dto.dueDate,
        paidDate: dto.paidDate,
        budgetGroup: this.normalizeText(dto.budgetGroup),
        vendor: this.normalizeText(dto.vendor),
        referenceNumber: this.normalizeText(dto.referenceNumber),
        notes: this.normalizeText(dto.notes),
        createdBy: performedBy,
        paymentStatus: dto.paymentStatus ?? 'pending',
        status: dto.status ?? 'active',
        auditLogs: {
          create: {
            date: new Date(),
            action: 'Created',
            description: 'Cost entry created',
            performedBy,
          },
        },
      },
      include: costInclude,
    });

    return this.toCostResponseDto(created);
  }

  async update(
    id: string,
    dto: UpdateCostDto,
    currentUser: AuthenticatedUser,
  ): Promise<CostResponseDto> {
    const existing = await this.prisma.cost.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException(`Cost ${id} not found`);
    }

    const nextCostDate = dto.costDate ?? existing.costDate;
    const nextDueDate = dto.dueDate ?? existing.dueDate;
    const nextPaidDate = dto.paidDate ?? existing.paidDate;

    if (nextDueDate < nextCostDate) {
      throw new BadRequestException('Due date cannot be before cost date');
    }

    if (nextPaidDate && nextPaidDate < nextCostDate) {
      throw new BadRequestException('Paid date cannot be before cost date');
    }

    const performedBy = await this.resolveActor(currentUser, dto.createdBy);

    await this.prisma.$transaction(async (tx) => {
      await tx.cost.update({
        where: { id },
        data: {
          title: dto.title?.trim(),
          category: dto.category,
          costType: dto.costType,
          amount: dto.amount,
          taxAmount: dto.taxAmount,
          paymentMethod: dto.paymentMethod,
          billingPeriod: dto.billingPeriod,
          costDate: dto.costDate,
          dueDate: dto.dueDate,
          paidDate: dto.paidDate,
          paymentStatus: dto.paymentStatus,
          budgetGroup:
            dto.budgetGroup !== undefined
              ? this.normalizeText(dto.budgetGroup)
              : undefined,
          vendor:
            dto.vendor !== undefined
              ? this.normalizeText(dto.vendor)
              : undefined,
          referenceNumber:
            dto.referenceNumber !== undefined
              ? this.normalizeText(dto.referenceNumber)
              : undefined,
          notes:
            dto.notes !== undefined ? this.normalizeText(dto.notes) : undefined,
          createdBy: dto.createdBy ? dto.createdBy.trim() : undefined,
          status: dto.status,
        },
      });

      await tx.costAuditLog.create({
        data: {
          costId: id,
          date: new Date(),
          action: 'Updated',
          description: 'Cost entry updated',
          performedBy,
        },
      });
    });

    return this.findOne(id);
  }

  async archive(
    id: string,
    currentUser: AuthenticatedUser,
  ): Promise<CostResponseDto> {
    return this.updateStatus(id, 'archived', 'Archived', currentUser);
  }

  async restore(
    id: string,
    currentUser: AuthenticatedUser,
  ): Promise<CostResponseDto> {
    return this.updateStatus(id, 'active', 'Restored', currentUser);
  }

  async duplicate(
    id: string,
    currentUser: AuthenticatedUser,
  ): Promise<CostResponseDto> {
    const existing = await this.prisma.cost.findUnique({
      where: { id },
      include: costInclude,
    });

    if (!existing) {
      throw new NotFoundException(`Cost ${id} not found`);
    }

    const performedBy = await this.resolveActor(currentUser);

    const created = await this.prisma.cost.create({
      data: {
        title: `${existing.title} (Copy)`,
        category: existing.category,
        costType: existing.costType,
        amount: existing.amount,
        taxAmount: existing.taxAmount,
        paymentMethod: existing.paymentMethod,
        billingPeriod: existing.billingPeriod,
        costDate: existing.costDate,
        dueDate: existing.dueDate,
        paidDate: existing.paidDate,
        budgetGroup: existing.budgetGroup,
        vendor: existing.vendor,
        referenceNumber: existing.referenceNumber,
        notes: existing.notes,
        createdBy: performedBy,
        status: 'active',
        paymentStatus: existing.paymentStatus,
        auditLogs: {
          create: {
            date: new Date(),
            action: 'Duplicated',
            description: `Duplicated from ${existing.id}`,
            performedBy,
          },
        },
      },
      include: costInclude,
    });

    return this.toCostResponseDto(created);
  }

  private async updateStatus(
    id: string,
    status: 'active' | 'archived',
    action: string,
    currentUser: AuthenticatedUser,
  ): Promise<CostResponseDto> {
    const existing = await this.prisma.cost.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException(`Cost ${id} not found`);
    }

    const performedBy = await this.resolveActor(currentUser);

    await this.prisma.$transaction(async (tx) => {
      await tx.cost.update({
        where: { id },
        data: { status },
      });

      await tx.costAuditLog.create({
        data: {
          costId: id,
          date: new Date(),
          action,
          description: `Cost entry ${status}`,
          performedBy,
        },
      });
    });

    return this.findOne(id);
  }

  private async resolveActor(
    currentUser: AuthenticatedUser,
    fallback?: string,
  ): Promise<string> {
    if (fallback && fallback.trim().length > 0) {
      return fallback.trim();
    }

    const user = await this.prisma.user.findUnique({
      where: { id: currentUser.userId },
      select: {
        firstName: true,
        lastName: true,
      },
    });

    if (!user) {
      return fallback?.trim() || 'System';
    }

    const fullName = `${user.firstName} ${user.lastName}`.trim();
    return fullName || fallback?.trim() || 'System';
  }

  private toCostResponseDto(row: CostWithRelations): CostResponseDto {
    return {
      id: row.id,
      title: row.title,
      category: row.category,
      costType: row.costType,
      amount: row.amount,
      taxAmount: row.taxAmount,
      paymentMethod: row.paymentMethod,
      billingPeriod: row.billingPeriod,
      costDate: this.toDateOnly(row.costDate),
      dueDate: this.toDateOnly(row.dueDate),
      paidDate: row.paidDate ? this.toDateOnly(row.paidDate) : null,
      budgetGroup: row.budgetGroup,
      vendor: row.vendor,
      referenceNumber: row.referenceNumber,
      notes: row.notes,
      createdBy: row.createdBy,
      status: row.status,
      createdAt: this.toDateOnly(row.createdAt),
      updatedAt: this.toDateOnly(row.updatedAt),
      auditTrail: row.auditLogs.map((entry) => ({
        id: entry.id,
        date: this.toDateOnly(entry.date),
        action: entry.action,
        description: entry.description,
        performedBy: entry.performedBy,
      })),
    };
  }

  private toDateOnly(value: Date): string {
    return value.toISOString().slice(0, 10);
  }

  private startOfDay(value: Date): Date {
    const date = new Date(value);
    date.setHours(0, 0, 0, 0);
    return date;
  }

  private endOfDay(value: Date): Date {
    const date = new Date(value);
    date.setHours(23, 59, 59, 999);
    return date;
  }

  private normalizeText(value: string | undefined): string {
    if (!value) {
      return '';
    }

    return value.trim();
  }
}
