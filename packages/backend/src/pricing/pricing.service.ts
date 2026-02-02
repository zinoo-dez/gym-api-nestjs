import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreatePricingDto,
  UpdatePricingDto,
  PricingResponseDto,
  PricingFiltersDto,
} from './dto';
import { PaginatedResponseDto } from '../common/dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class PricingService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createPricingDto: CreatePricingDto,
  ): Promise<PricingResponseDto> {
    const pricing = await this.prisma.pricing.create({
      data: {
        ...createPricingDto,
        price: new Prisma.Decimal(createPricingDto.price),
        features: createPricingDto.features || [],
      },
    });

    return this.mapToResponseDto(pricing);
  }

  async findAll(
    filters: PricingFiltersDto,
  ): Promise<PaginatedResponseDto<PricingResponseDto>> {
    const { page = 1, limit = 10, category, isActive } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (category) {
      where.category = category;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const [data, total] = await Promise.all([
      this.prisma.pricing.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      }),
      this.prisma.pricing.count({ where }),
    ]);

    return {
      data: data.map((pricing) => this.mapToResponseDto(pricing)),
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<PricingResponseDto> {
    const pricing = await this.prisma.pricing.findUnique({
      where: { id },
    });

    if (!pricing) {
      throw new NotFoundException(`Pricing with ID ${id} not found`);
    }

    return this.mapToResponseDto(pricing);
  }

  async update(
    id: string,
    updatePricingDto: UpdatePricingDto,
  ): Promise<PricingResponseDto> {
    const existing = await this.prisma.pricing.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Pricing with ID ${id} not found`);
    }

    const updateData: any = { ...updatePricingDto };
    if (updatePricingDto.price !== undefined) {
      updateData.price = new Prisma.Decimal(updatePricingDto.price);
    }

    const pricing = await this.prisma.pricing.update({
      where: { id },
      data: updateData,
    });

    return this.mapToResponseDto(pricing);
  }

  async remove(id: string): Promise<void> {
    const existing = await this.prisma.pricing.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Pricing with ID ${id} not found`);
    }

    await this.prisma.pricing.delete({
      where: { id },
    });
  }

  private mapToResponseDto(pricing: any): PricingResponseDto {
    return {
      id: pricing.id,
      name: pricing.name,
      description: pricing.description,
      category: pricing.category,
      price: parseFloat(pricing.price.toString()),
      currency: pricing.currency,
      duration: pricing.duration,
      features: pricing.features,
      isActive: pricing.isActive,
      sortOrder: pricing.sortOrder,
      createdAt: pricing.createdAt,
      updatedAt: pricing.updatedAt,
    };
  }
}
