import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateDiscountCodeDto,
  UpdateDiscountCodeDto,
  DiscountCodeResponseDto,
  DiscountCodeFiltersDto,
} from './dto';
import { PaginatedResponseDto } from '../common/dto';

@Injectable()
export class DiscountCodesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateDiscountCodeDto): Promise<DiscountCodeResponseDto> {
    const existing = await this.prisma.discountCode.findFirst({
      where: { code: { equals: dto.code, mode: 'insensitive' } },
      select: { id: true },
    });
    if (existing) {
      throw new ConflictException('Discount code already exists');
    }

    const created = await this.prisma.discountCode.create({
      data: {
        code: dto.code.trim().toUpperCase(),
        description: dto.description,
        type: dto.type,
        amount: dto.amount,
        isActive: dto.isActive ?? true,
        maxRedemptions: dto.maxRedemptions,
        startsAt: dto.startsAt ? new Date(dto.startsAt) : undefined,
        endsAt: dto.endsAt ? new Date(dto.endsAt) : undefined,
      },
    });

    const settings = await this.prisma.gymSetting.findFirst({
      select: { newPaymentNotification: true },
    });
    if (settings?.newPaymentNotification !== false) {
      await this.prisma.notification.create({
        data: {
          title: 'Discount code created',
          message: `Discount code ${created.code} created.`,
          type: 'success',
          role: 'ADMIN',
          actionUrl: '/admin/discount-codes',
        },
      });
    }

    return created;
  }

  async findAll(
    filters?: DiscountCodeFiltersDto,
  ): Promise<PaginatedResponseDto<DiscountCodeResponseDto>> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters?.code) {
      where.code = { contains: filters.code, mode: 'insensitive' };
    }
    if (typeof filters?.isActive === 'boolean') {
      where.isActive = filters.isActive;
    }

    const [total, data] = await Promise.all([
      this.prisma.discountCode.count({ where }),
      this.prisma.discountCode.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      data,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  async update(
    id: string,
    dto: UpdateDiscountCodeDto,
  ): Promise<DiscountCodeResponseDto> {
    const existing = await this.prisma.discountCode.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('Discount code not found');
    }

    if (dto.code) {
      const conflict = await this.prisma.discountCode.findFirst({
        where: {
          code: { equals: dto.code, mode: 'insensitive' },
          NOT: { id },
        },
        select: { id: true },
      });
      if (conflict) {
        throw new ConflictException('Discount code already exists');
      }
    }

    const updated = await this.prisma.discountCode.update({
      where: { id },
      data: {
        code: dto.code ? dto.code.trim().toUpperCase() : undefined,
        description: dto.description,
        type: dto.type,
        amount: dto.amount,
        isActive: dto.isActive,
        maxRedemptions: dto.maxRedemptions,
        startsAt: dto.startsAt ? new Date(dto.startsAt) : undefined,
        endsAt: dto.endsAt ? new Date(dto.endsAt) : undefined,
      },
    });

    const settings = await this.prisma.gymSetting.findFirst({
      select: { newPaymentNotification: true },
    });
    if (settings?.newPaymentNotification !== false) {
      await this.prisma.notification.create({
        data: {
          title: 'Discount code updated',
          message: `Discount code ${updated.code} updated.`,
          type: 'info',
          role: 'ADMIN',
          actionUrl: '/admin/discount-codes',
        },
      });
    }

    return updated;
  }

  async remove(id: string): Promise<void> {
    const existing = await this.prisma.discountCode.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('Discount code not found');
    }
    const deleted = await this.prisma.discountCode.delete({ where: { id } });

    const settings = await this.prisma.gymSetting.findFirst({
      select: { newPaymentNotification: true },
    });
    if (settings?.newPaymentNotification !== false) {
      await this.prisma.notification.create({
        data: {
          title: 'Discount code deleted',
          message: `Discount code ${deleted.code} deleted.`,
          type: 'warning',
          role: 'ADMIN',
          actionUrl: '/admin/discount-codes',
        },
      });
    }
  }

  async getUsage(): Promise<
    Array<{
      id: string;
      code: string;
      usedCount: number;
      totalDiscount: number;
    }>
  > {
    const codes = await this.prisma.discountCode.findMany({
      select: { id: true, code: true, usedCount: true },
    });

    if (codes.length === 0) return [];

    const totals = await this.prisma.subscription.groupBy({
      by: ['discountCodeId'],
      where: { discountCodeId: { not: null } },
      _sum: { discountAmount: true },
    });

    const totalsMap = new Map<string, number>();
    totals.forEach((row) => {
      if (row.discountCodeId) {
        totalsMap.set(row.discountCodeId, Number(row._sum.discountAmount || 0));
      }
    });

    return codes.map((code) => ({
      id: code.id,
      code: code.code,
      usedCount: code.usedCount,
      totalDiscount: totalsMap.get(code.id) || 0,
    }));
  }
}
