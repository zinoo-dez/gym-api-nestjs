import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateFeatureDto,
  FeatureFiltersDto,
  FeatureResponseDto,
  UpdateFeatureDto,
} from './dto';
import { PaginatedResponseDto } from '../common/dto';
import { Prisma } from '@prisma/client';

const DEFAULT_FEATURES = [
  {
    name: 'Full equipment access',
    description: 'Access to all gym equipment and machines.',
  },
  {
    name: 'Unlimited group classes',
    description: 'Join any scheduled group fitness classes.',
  },
  {
    name: 'Personal training hours',
    description: 'Includes personal training sessions with coaches.',
  },
  {
    name: 'Locker access',
    description: 'Access to lockers for personal belongings.',
  },
  {
    name: 'Nutrition consultation',
    description: 'Nutrition guidance and consultation support.',
  },
];

@Injectable()
export class FeaturesService implements OnModuleInit {
  private readonly logger = new Logger(FeaturesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.ensureDefaultFeaturesWithRetry();
  }

  async create(dto: CreateFeatureDto): Promise<FeatureResponseDto> {
    const existing = await this.prisma.feature.findFirst({
      where: { name: dto.name },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictException('Feature with this name already exists');
    }

    const feature = await this.prisma.feature.create({
      data: {
        name: dto.name,
        description: dto.description,
        isSystem: dto.isSystem ?? false,
        defaultName: dto.defaultName ?? dto.name,
      },
    });

    return this.toResponseDto(feature);
  }

  async findAll(
    filters?: FeatureFiltersDto,
  ): Promise<PaginatedResponseDto<FeatureResponseDto>> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 50;
    const skip = (page - 1) * limit;

    const where: Prisma.FeatureWhereInput = {};
    if (filters?.name) {
      where.name = { contains: filters.name, mode: 'insensitive' };
    }

    const [total, data] = await Promise.all([
      this.prisma.feature.count({ where }),
      this.prisma.feature.findMany({
        where,
        orderBy: { isSystem: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return new PaginatedResponseDto(
      data.map((feature) => this.toResponseDto(feature)),
      page,
      limit,
      total,
    );
  }

  async findById(id: string): Promise<FeatureResponseDto> {
    const feature = await this.prisma.feature.findUnique({ where: { id } });
    if (!feature) {
      throw new NotFoundException(`Feature with ID ${id} not found`);
    }
    return this.toResponseDto(feature);
  }

  async update(id: string, dto: UpdateFeatureDto): Promise<FeatureResponseDto> {
    const existing = await this.prisma.feature.findUnique({
      where: { id },
      select: { id: true, name: true, isSystem: true },
    });

    if (!existing) {
      throw new NotFoundException(`Feature with ID ${id} not found`);
    }

    if (dto.name && dto.name !== existing.name) {
      const nameConflict = await this.prisma.feature.findFirst({
        where: { name: dto.name },
        select: { id: true },
      });
      if (nameConflict) {
        throw new ConflictException('Feature with this name already exists');
      }
    }

    const updated = await this.prisma.feature.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
      },
    });
    return this.toResponseDto(updated);
  }

  async restoreDefaultName(id: string): Promise<FeatureResponseDto> {
    const feature = await this.prisma.feature.findUnique({
      where: { id },
      select: { id: true, isSystem: true, defaultName: true },
    });

    if (!feature) {
      throw new NotFoundException(`Feature with ID ${id} not found`);
    }

    if (!feature.isSystem || !feature.defaultName) {
      throw new BadRequestException(
        'Feature is not a system feature or has no default name',
      );
    }

    const updated = await this.prisma.feature.update({
      where: { id },
      data: { name: feature.defaultName },
    });

    return this.toResponseDto(updated);
  }

  async remove(id: string): Promise<void> {
    const existing = await this.prisma.feature.findUnique({
      where: { id },
      select: { id: true, isSystem: true },
    });

    if (!existing) {
      throw new NotFoundException(`Feature with ID ${id} not found`);
    }

    if (existing.isSystem) {
      throw new BadRequestException('System features cannot be deleted');
    }

    await this.prisma.feature.delete({ where: { id } });
  }

  private async ensureDefaultFeatures(): Promise<void> {
    for (const feature of DEFAULT_FEATURES) {
      const existing =
        (await this.prisma.feature.findFirst({
          where: { defaultName: feature.name },
        })) ??
        (await this.prisma.feature.findFirst({
          where: { name: feature.name },
        }));

      if (!existing) {
        await this.prisma.feature.create({
          data: {
            name: feature.name,
            description: feature.description,
            isSystem: true,
            defaultName: feature.name,
          },
        });
        continue;
      }

      if (!existing.isSystem || existing.defaultName !== feature.name) {
        await this.prisma.feature.update({
          where: { id: existing.id },
          data: {
            isSystem: true,
            defaultName: feature.name,
          },
        });
      }
    }
  }

  private async ensureDefaultFeaturesWithRetry(): Promise<void> {
    const maxAttempts = 3;

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      try {
        await this.ensureDefaultFeatures();
        return;
      } catch (error) {
        const code = this.extractErrorCode(error);
        const isTransientDbError = code === 'ECONNREFUSED' || code === 'P1001';

        if (!isTransientDbError || attempt === maxAttempts) {
          this.logger.error(
            `Failed to ensure default features (attempt ${attempt}/${maxAttempts})`,
            error instanceof Error ? error.stack : String(error),
          );
          return;
        }

        this.logger.warn(
          `Database temporarily unavailable while seeding default features (attempt ${attempt}/${maxAttempts}). Retrying...`,
        );
        await this.delay(attempt * 1000);
      }
    }
  }

  private extractErrorCode(error: unknown): string | undefined {
    if (error && typeof error === 'object' && 'code' in error) {
      const code = (error as { code?: unknown }).code;
      return typeof code === 'string' ? code : undefined;
    }
    return undefined;
  }

  private async delay(ms: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }

  async ensureFeaturesExist(featureIds: string[]): Promise<void> {
    if (featureIds.length === 0) return;

    const uniqueIds = Array.from(new Set(featureIds));
    const existing = await this.prisma.feature.findMany({
      where: { id: { in: uniqueIds } },
      select: { id: true },
    });

    if (existing.length !== uniqueIds.length) {
      throw new BadRequestException('One or more features are invalid');
    }
  }

  private toResponseDto(feature: {
    id: string;
    name: string;
    description: string | null;
    isSystem: boolean;
    defaultName: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): FeatureResponseDto {
    return {
      id: feature.id,
      name: feature.name,
      description: feature.description ?? undefined,
      isSystem: feature.isSystem,
      defaultName: feature.defaultName ?? undefined,
      createdAt: feature.createdAt,
      updatedAt: feature.updatedAt,
    };
  }
}
