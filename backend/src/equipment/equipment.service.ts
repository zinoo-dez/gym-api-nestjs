import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, UserRole } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import {
  EQUIPMENT_CATEGORIES,
  EQUIPMENT_CONDITIONS,
  MAINTENANCE_FREQUENCIES,
} from './equipment.constants';
import {
  CreateEquipmentDto,
  EquipmentFiltersDto,
  EquipmentResponseDto,
  LogEquipmentMaintenanceDto,
  UpdateEquipmentDto,
} from './dto';

const equipmentInclude = {
  maintenanceLogs: {
    orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
  },
  auditLogs: {
    orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
  },
} satisfies Prisma.EquipmentInclude;

type EquipmentWithRelations = Prisma.EquipmentGetPayload<{
  include: typeof equipmentInclude;
}>;

interface AuthenticatedUser {
  userId: string;
  email?: string;
  role: UserRole;
}

@Injectable()
export class EquipmentService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters: EquipmentFiltersDto): Promise<EquipmentResponseDto[]> {
    const where: Prisma.EquipmentWhereInput = {};

    if (filters.search) {
      where.OR = [
        {
          name: {
            contains: filters.search,
            mode: 'insensitive',
          },
        },
        {
          category: {
            contains: filters.search,
            mode: 'insensitive',
          },
        },
        {
          brandModel: {
            contains: filters.search,
            mode: 'insensitive',
          },
        },
        {
          assignedArea: {
            contains: filters.search,
            mode: 'insensitive',
          },
        },
      ];
    }

    if (filters.category) {
      where.category = filters.category;
    }

    if (filters.condition) {
      where.condition = filters.condition;
    }

    if (typeof filters.isActive === 'boolean') {
      where.isActive = filters.isActive;
    }

    if (filters.maintenanceDue && filters.maintenanceDue !== 'all') {
      const today = this.startOfDay(new Date());
      const next30Days = this.addDays(today, 30);

      if (filters.maintenanceDue === 'overdue') {
        where.nextMaintenanceDate = { lt: today };
      }

      if (filters.maintenanceDue === 'next_30_days') {
        where.nextMaintenanceDate = {
          gte: today,
          lte: next30Days,
        };
      }
    }

    const records = await this.prisma.equipment.findMany({
      where,
      orderBy: [{ updatedAt: 'desc' }, { name: 'asc' }],
      include: equipmentInclude,
    });

    return records.map((record) => this.toEquipmentResponseDto(record));
  }

  async findOne(id: string): Promise<EquipmentResponseDto> {
    const record = await this.prisma.equipment.findUnique({
      where: { id },
      include: equipmentInclude,
    });

    if (!record) {
      throw new NotFoundException(`Equipment ${id} not found`);
    }

    return this.toEquipmentResponseDto(record);
  }

  async create(
    dto: CreateEquipmentDto,
    currentUser: AuthenticatedUser,
  ): Promise<EquipmentResponseDto> {
    this.validateDateLogic(
      dto.purchaseDate,
      dto.warrantyExpiryDate,
      dto.lastMaintenanceDate,
    );

    const normalizedNotes = this.normalizeText(dto.notes);
    const nextMaintenanceDate = this.calculateNextMaintenanceDue(
      dto.lastMaintenanceDate,
      dto.maintenanceFrequency,
    );
    const performedBy = this.resolveActor(currentUser);

    const createdId = await this.prisma.$transaction(async (tx) => {
      const equipment = await tx.equipment.create({
        data: {
          name: dto.name.trim(),
          category: dto.category,
          brandModel: dto.brandModel.trim(),
          serialNumber: this.normalizeOptionalText(dto.serialNumber),
          purchaseDate: dto.purchaseDate,
          purchaseCost: dto.purchaseCost,
          warrantyExpiryDate: dto.warrantyExpiryDate,
          condition: dto.condition,
          maintenanceFrequency: dto.maintenanceFrequency,
          maintenanceInterval: this.getMaintenanceIntervalMonths(
            dto.maintenanceFrequency,
          ),
          lastMaintenanceDate: dto.lastMaintenanceDate,
          nextMaintenanceDate,
          assignedArea: dto.assignedArea.trim(),
          notes: normalizedNotes,
          description: normalizedNotes.length > 0 ? normalizedNotes : null,
          isActive: dto.isActive ?? true,
        },
      });

      await tx.equipmentMaintenanceLog.create({
        data: {
          equipmentId: equipment.id,
          date: dto.lastMaintenanceDate,
          type: 'routine',
          description: 'Baseline maintenance schedule recorded',
          cost: 0,
          performedBy,
          nextDueDate: nextMaintenanceDate,
        },
      });

      await tx.equipmentAuditLog.create({
        data: {
          equipmentId: equipment.id,
          date: new Date(),
          action: 'Created',
          description: 'Equipment asset was added to inventory',
          performedBy,
        },
      });

      return equipment.id;
    });

    return this.findOne(createdId);
  }

  async update(
    id: string,
    dto: UpdateEquipmentDto,
    currentUser: AuthenticatedUser,
  ): Promise<EquipmentResponseDto> {
    const existing = await this.prisma.equipment.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Equipment ${id} not found`);
    }

    const purchaseDate = dto.purchaseDate ?? existing.purchaseDate;
    const warrantyExpiryDate = dto.warrantyExpiryDate ?? existing.warrantyExpiryDate;
    const lastMaintenanceDate =
      dto.lastMaintenanceDate ?? existing.lastMaintenanceDate;
    const maintenanceFrequency =
      dto.maintenanceFrequency ?? existing.maintenanceFrequency;

    this.validateDateLogic(
      purchaseDate,
      warrantyExpiryDate,
      lastMaintenanceDate,
    );

    const nextMaintenanceDate = this.calculateNextMaintenanceDue(
      lastMaintenanceDate,
      maintenanceFrequency,
    );
    const performedBy = this.resolveActor(currentUser);

    await this.prisma.$transaction(async (tx) => {
      await tx.equipment.update({
        where: { id },
        data: {
          name: dto.name?.trim(),
          category: dto.category,
          brandModel: dto.brandModel?.trim(),
          serialNumber:
            dto.serialNumber !== undefined
              ? this.normalizeOptionalText(dto.serialNumber)
              : undefined,
          purchaseDate,
          purchaseCost: dto.purchaseCost,
          warrantyExpiryDate,
          condition: dto.condition,
          maintenanceFrequency,
          maintenanceInterval:
            maintenanceFrequency !== existing.maintenanceFrequency
              ? this.getMaintenanceIntervalMonths(maintenanceFrequency)
              : undefined,
          lastMaintenanceDate,
          nextMaintenanceDate,
          assignedArea: dto.assignedArea?.trim(),
          notes: dto.notes !== undefined ? this.normalizeText(dto.notes) : undefined,
          description:
            dto.notes !== undefined
              ? this.normalizeText(dto.notes) || null
              : undefined,
          isActive: dto.isActive,
        },
      });

      await tx.equipmentAuditLog.create({
        data: {
          equipmentId: id,
          date: new Date(),
          action: 'Updated',
          description: 'Equipment details were updated',
          performedBy,
        },
      });
    });

    return this.findOne(id);
  }

  async logMaintenance(
    id: string,
    dto: LogEquipmentMaintenanceDto,
    currentUser: AuthenticatedUser,
  ): Promise<EquipmentResponseDto> {
    const existing = await this.prisma.equipment.findUnique({
      where: { id },
      select: {
        id: true,
        condition: true,
        maintenanceFrequency: true,
      },
    });

    if (!existing) {
      throw new NotFoundException(`Equipment ${id} not found`);
    }

    if (dto.nextDueDate && dto.nextDueDate < dto.date) {
      throw new BadRequestException(
        'Next due date cannot be earlier than maintenance date',
      );
    }

    const nextMaintenanceDate =
      dto.nextDueDate ??
      this.calculateNextMaintenanceDue(dto.date, existing.maintenanceFrequency);

    const nextCondition =
      existing.condition === 'out_of_order'
        ? 'good'
        : dto.type === 'replacement'
          ? 'new'
          : 'good';

    const performedBy = this.resolveActor(currentUser, dto.performedBy);

    await this.prisma.$transaction(async (tx) => {
      await tx.equipmentMaintenanceLog.create({
        data: {
          equipmentId: id,
          date: dto.date,
          type: dto.type,
          description: dto.description.trim(),
          cost: dto.cost,
          performedBy,
          nextDueDate: dto.nextDueDate,
        },
      });

      await tx.equipment.update({
        where: { id },
        data: {
          condition: nextCondition,
          lastMaintenanceDate: dto.date,
          nextMaintenanceDate,
        },
      });

      await tx.equipmentAuditLog.create({
        data: {
          equipmentId: id,
          date: dto.date,
          action: 'Maintenance Logged',
          description: `${dto.type} maintenance recorded with cost ${dto.cost.toFixed(2)}`,
          performedBy,
        },
      });
    });

    return this.findOne(id);
  }

  async markOutOfOrder(
    id: string,
    currentUser: AuthenticatedUser,
  ): Promise<EquipmentResponseDto> {
    await this.assertEquipmentExists(id);

    const performedBy = this.resolveActor(currentUser);

    await this.prisma.$transaction(async (tx) => {
      await tx.equipment.update({
        where: { id },
        data: {
          condition: 'out_of_order',
        },
      });

      await tx.equipmentAuditLog.create({
        data: {
          equipmentId: id,
          date: new Date(),
          action: 'Marked Out of Order',
          description: 'Equipment condition changed to out of order',
          performedBy,
        },
      });
    });

    return this.findOne(id);
  }

  async retire(
    id: string,
    currentUser: AuthenticatedUser,
  ): Promise<EquipmentResponseDto> {
    await this.assertEquipmentExists(id);

    const performedBy = this.resolveActor(currentUser);

    await this.prisma.$transaction(async (tx) => {
      await tx.equipment.update({
        where: { id },
        data: {
          isActive: false,
        },
      });

      await tx.equipmentAuditLog.create({
        data: {
          equipmentId: id,
          date: new Date(),
          action: 'Retired',
          description: 'Equipment was retired from active inventory',
          performedBy,
        },
      });
    });

    return this.findOne(id);
  }

  private async assertEquipmentExists(id: string): Promise<void> {
    const exists = await this.prisma.equipment.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!exists) {
      throw new NotFoundException(`Equipment ${id} not found`);
    }
  }

  private validateDateLogic(
    purchaseDate: Date,
    warrantyExpiryDate: Date,
    lastMaintenanceDate: Date,
  ): void {
    if (warrantyExpiryDate < purchaseDate) {
      throw new BadRequestException(
        'Warranty expiry date must be on or after purchase date',
      );
    }

    if (lastMaintenanceDate < purchaseDate) {
      throw new BadRequestException(
        'Last maintenance date must be on or after purchase date',
      );
    }
  }

  private getMaintenanceIntervalMonths(frequency: string): number {
    switch (frequency) {
      case 'monthly':
        return 1;
      case 'quarterly':
        return 3;
      case 'yearly':
        return 12;
      default:
        return 1;
    }
  }

  private calculateNextMaintenanceDue(
    lastMaintenanceDate: Date,
    frequency: string,
  ): Date {
    const nextDate = this.startOfDay(lastMaintenanceDate);
    nextDate.setUTCMonth(
      nextDate.getUTCMonth() + this.getMaintenanceIntervalMonths(frequency),
    );
    return nextDate;
  }

  private startOfDay(date: Date): Date {
    return new Date(
      Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
    );
  }

  private addDays(date: Date, days: number): Date {
    const next = new Date(date);
    next.setUTCDate(next.getUTCDate() + days);
    return next;
  }

  private resolveActor(
    currentUser: AuthenticatedUser,
    preferredActor?: string,
  ): string {
    const sanitizedPreferred = preferredActor?.trim();
    if (sanitizedPreferred) {
      return sanitizedPreferred;
    }

    if (currentUser.email && currentUser.email.trim().length > 0) {
      return currentUser.email;
    }

    return currentUser.userId;
  }

  private normalizeText(value: string | undefined): string {
    return value?.trim() ?? '';
  }

  private normalizeOptionalText(value: string | undefined): string | null {
    const normalized = value?.trim();
    return normalized && normalized.length > 0 ? normalized : null;
  }

  private toDateOnly(date: Date): string {
    return date.toISOString().slice(0, 10);
  }

  private normalizeCategory(category: string): string {
    const normalized = category.toLowerCase().replaceAll(' ', '_');
    return EQUIPMENT_CATEGORIES.includes(
      normalized as (typeof EQUIPMENT_CATEGORIES)[number],
    )
      ? normalized
      : 'accessories';
  }

  private normalizeCondition(condition: string): string {
    const normalized = condition.toLowerCase().replaceAll(' ', '_');
    return EQUIPMENT_CONDITIONS.includes(
      normalized as (typeof EQUIPMENT_CONDITIONS)[number],
    )
      ? normalized
      : 'good';
  }

  private normalizeFrequency(frequency: string): string {
    const normalized = frequency.toLowerCase();
    return MAINTENANCE_FREQUENCIES.includes(
      normalized as (typeof MAINTENANCE_FREQUENCIES)[number],
    )
      ? normalized
      : 'monthly';
  }

  private toEquipmentResponseDto(
    record: EquipmentWithRelations,
  ): EquipmentResponseDto {
    return {
      id: record.id,
      name: record.name,
      category: this.normalizeCategory(record.category),
      brandModel: record.brandModel,
      serialNumber: record.serialNumber ?? undefined,
      purchaseDate: this.toDateOnly(record.purchaseDate),
      purchaseCost: record.purchaseCost,
      warrantyExpiryDate: this.toDateOnly(record.warrantyExpiryDate),
      condition: this.normalizeCondition(record.condition),
      maintenanceFrequency: this.normalizeFrequency(record.maintenanceFrequency),
      lastMaintenanceDate: this.toDateOnly(record.lastMaintenanceDate),
      nextMaintenanceDue: this.toDateOnly(record.nextMaintenanceDate),
      assignedArea: record.assignedArea,
      notes: record.notes,
      isActive: record.isActive,
      maintenanceLogs: record.maintenanceLogs.map((log) => ({
        id: log.id,
        date: this.toDateOnly(log.date),
        type: log.type,
        description: log.description,
        cost: log.cost,
        performedBy: log.performedBy,
        nextDueDate: log.nextDueDate
          ? this.toDateOnly(log.nextDueDate)
          : undefined,
      })),
      auditTrail: record.auditLogs.map((entry) => ({
        id: entry.id,
        date: this.toDateOnly(entry.date),
        action: entry.action,
        description: entry.description,
        performedBy: entry.performedBy,
      })),
      createdAt: this.toDateOnly(record.createdAt),
      updatedAt: this.toDateOnly(record.updatedAt),
    };
  }
}
