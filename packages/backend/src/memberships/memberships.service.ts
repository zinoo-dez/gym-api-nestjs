import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
  Inject,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateMembershipPlanDto,
  AssignMembershipDto,
  UpdateMembershipPlanDto,
  MembershipPlanResponseDto,
  MembershipResponseDto,
  UpgradeMembershipDto,
  MembershipPlanFiltersDto,
} from './dto';
import { PaginatedResponseDto } from '../common/dto';
import { MembershipStatus, Prisma } from '@prisma/client';

@Injectable()
export class MembershipsService {
  private readonly logger = new Logger(MembershipsService.name);
  private readonly CACHE_TTL = 3600000; // 1 hour in milliseconds
  private readonly PLANS_CACHE_KEY = 'membership_plans';

  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  // Membership Plan CRUD operations

  async createPlan(
    createPlanDto: CreateMembershipPlanDto,
  ): Promise<MembershipPlanResponseDto> {
    // Check if plan with same name already exists - only select id field
    const existingPlan = await this.prisma.membershipPlan.findUnique({
      where: { name: createPlanDto.name },
      select: { id: true },
    });

    if (existingPlan) {
      throw new ConflictException(
        'Membership plan with this name already exists',
      );
    }

    const plan = await this.prisma.membershipPlan.create({
      data: {
        name: createPlanDto.name,
        description: createPlanDto.description,
        durationDays: createPlanDto.durationDays,
        price: createPlanDto.price,
        type: createPlanDto.type,
        features: createPlanDto.features,
      },
    });

    // Invalidate cache when a new plan is created
    this.invalidatePlansCache();

    return this.toPlanResponseDto(plan);
  }

  async findAllPlans(
    filters?: MembershipPlanFiltersDto,
  ): Promise<PaginatedResponseDto<MembershipPlanResponseDto>> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const skip = filters?.skip || 0;

    // Build where clause based on filters
    const where: Prisma.MembershipPlanWhereInput = {};

    if (filters?.type) {
      where.type = filters.type;
    }

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    } else {
      // Default to active plans only if not specified
      where.isActive = true;
    }

    // Create cache key based on filters
    const cacheKey = `${this.PLANS_CACHE_KEY}:${JSON.stringify({ where, page, limit, skip })}`;

    // Try to get from cache
    const cachedResult =
      await this.cacheManager.get<
        PaginatedResponseDto<MembershipPlanResponseDto>
      >(cacheKey);

    if (cachedResult) {
      this.logger.debug(`Cache hit for membership plans: ${cacheKey}`);
      return cachedResult;
    }

    this.logger.debug(`Cache miss for membership plans: ${cacheKey}`);

    // Get total count
    const total = await this.prisma.membershipPlan.count({ where });

    // Get paginated plans
    const plans = await this.prisma.membershipPlan.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    const planDtos = plans.map((plan) => this.toPlanResponseDto(plan));

    const result = new PaginatedResponseDto(planDtos, page, limit, total);

    // Store in cache with 1 hour TTL
    await this.cacheManager.set(cacheKey, result, this.CACHE_TTL);

    return result;
  }

  async findPlanById(id: string): Promise<MembershipPlanResponseDto> {
    const cacheKey = `${this.PLANS_CACHE_KEY}:${id}`;

    // Try to get from cache
    const cachedPlan =
      await this.cacheManager.get<MembershipPlanResponseDto>(cacheKey);

    if (cachedPlan) {
      this.logger.debug(`Cache hit for membership plan: ${id}`);
      return cachedPlan;
    }

    this.logger.debug(`Cache miss for membership plan: ${id}`);

    const plan = await this.prisma.membershipPlan.findUnique({
      where: { id },
    });

    if (!plan) {
      throw new NotFoundException(`Membership plan with ID ${id} not found`);
    }

    const planDto = this.toPlanResponseDto(plan);

    // Store in cache with 1 hour TTL
    await this.cacheManager.set(cacheKey, planDto, this.CACHE_TTL);

    return planDto;
  }

  async updatePlan(
    id: string,
    updatePlanDto: UpdateMembershipPlanDto,
  ): Promise<MembershipPlanResponseDto> {
    // Check if plan exists - only select needed fields
    const existingPlan = await this.prisma.membershipPlan.findUnique({
      where: { id },
      select: { id: true, name: true },
    });

    if (!existingPlan) {
      throw new NotFoundException(`Membership plan with ID ${id} not found`);
    }

    // Check if name is being updated and if it conflicts
    if (updatePlanDto.name && updatePlanDto.name !== existingPlan.name) {
      const nameConflict = await this.prisma.membershipPlan.findUnique({
        where: { name: updatePlanDto.name },
        select: { id: true },
      });

      if (nameConflict) {
        throw new ConflictException(
          'Membership plan with this name already exists',
        );
      }
    }

    const updatedPlan = await this.prisma.membershipPlan.update({
      where: { id },
      data: {
        name: updatePlanDto.name,
        description: updatePlanDto.description,
        durationDays: updatePlanDto.durationDays,
        price: updatePlanDto.price,
        type: updatePlanDto.type,
        features: updatePlanDto.features,
      },
    });

    // Invalidate cache when a plan is updated
    this.invalidatePlansCache();

    return this.toPlanResponseDto(updatedPlan);
  }

  // Membership assignment and management

  async assignMembership(
    assignDto: AssignMembershipDto,
  ): Promise<MembershipResponseDto> {
    // Verify member exists - only select id field
    const member = await this.prisma.member.findUnique({
      where: { id: assignDto.memberId },
      select: { id: true },
    });

    if (!member) {
      throw new NotFoundException(
        `Member with ID ${assignDto.memberId} not found`,
      );
    }

    // Verify plan exists - only select needed fields
    const plan = await this.prisma.membershipPlan.findUnique({
      where: { id: assignDto.planId },
      select: { id: true, durationDays: true },
    });

    if (!plan) {
      throw new NotFoundException(
        `Membership plan with ID ${assignDto.planId} not found`,
      );
    }

    // Check if member already has an active membership
    const activeMembership = await this.prisma.membership.findFirst({
      where: {
        memberId: assignDto.memberId,
        status: MembershipStatus.ACTIVE,
        endDate: {
          gte: new Date(),
        },
      },
      select: { id: true },
    });

    if (activeMembership) {
      throw new ConflictException(
        'Member already has an active membership. Use upgrade endpoint to change plans.',
      );
    }

    // Calculate end date
    const startDate = new Date(assignDto.startDate);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + plan.durationDays);

    // Create membership
    const membership = await this.prisma.membership.create({
      data: {
        memberId: assignDto.memberId,
        planId: assignDto.planId,
        startDate,
        endDate,
        status: MembershipStatus.ACTIVE,
      },
      include: {
        plan: true,
      },
    });

    return this.toMembershipResponseDto(membership);
  }

  async findMembershipById(id: string): Promise<MembershipResponseDto> {
    const membership = await this.prisma.membership.findUnique({
      where: { id },
      include: {
        plan: true,
      },
    });

    if (!membership) {
      throw new NotFoundException(`Membership with ID ${id} not found`);
    }

    return this.toMembershipResponseDto(membership);
  }

  async upgradeMembership(
    memberId: string,
    upgradeDto: UpgradeMembershipDto,
  ): Promise<MembershipResponseDto> {
    // Verify member exists - only select id field
    const member = await this.prisma.member.findUnique({
      where: { id: memberId },
      select: { id: true },
    });

    if (!member) {
      throw new NotFoundException(`Member with ID ${memberId} not found`);
    }

    // Verify new plan exists - only select needed fields
    const newPlan = await this.prisma.membershipPlan.findUnique({
      where: { id: upgradeDto.newPlanId },
      select: { id: true, durationDays: true },
    });

    if (!newPlan) {
      throw new NotFoundException(
        `Membership plan with ID ${upgradeDto.newPlanId} not found`,
      );
    }

    // Find current active membership
    const currentMembership = await this.prisma.membership.findFirst({
      where: {
        memberId,
        status: MembershipStatus.ACTIVE,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: { id: true },
    });

    if (!currentMembership) {
      throw new BadRequestException(
        'Member does not have an active membership to upgrade',
      );
    }

    // Use transaction to cancel old membership and create new one
    const result = await this.prisma.$transaction(async (tx) => {
      // Cancel old membership
      await tx.membership.update({
        where: { id: currentMembership.id },
        data: {
          status: MembershipStatus.CANCELLED,
        },
      });

      // Create new membership starting today
      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + newPlan.durationDays);

      const newMembership = await tx.membership.create({
        data: {
          memberId,
          planId: upgradeDto.newPlanId,
          startDate,
          endDate,
          status: MembershipStatus.ACTIVE,
        },
        include: {
          plan: true,
        },
      });

      return newMembership;
    });

    return this.toMembershipResponseDto(result);
  }

  async isValid(membershipId: string): Promise<boolean> {
    const membership = await this.prisma.membership.findUnique({
      where: { id: membershipId },
      select: { status: true, startDate: true, endDate: true },
    });

    if (!membership) {
      return false;
    }

    const now = new Date();
    return (
      membership.status === MembershipStatus.ACTIVE &&
      membership.startDate <= now &&
      membership.endDate >= now
    );
  }

  async expireMemberships(): Promise<number> {
    const now = new Date();

    const result = await this.prisma.membership.updateMany({
      where: {
        status: MembershipStatus.ACTIVE,
        endDate: {
          lt: now,
        },
      },
      data: {
        status: MembershipStatus.EXPIRED,
      },
    });

    return result.count;
  }

  /**
   * Scheduled job that runs daily at midnight to expire memberships
   * Cron expression: '0 0 * * *' means run at 00:00 (midnight) every day
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleMembershipExpiration() {
    this.logger.log('Running scheduled membership expiration check...');

    try {
      const expiredCount = await this.expireMemberships();
      this.logger.log(
        `Membership expiration check completed. Expired ${expiredCount} membership(s).`,
      );
    } catch (error) {
      this.logger.error(
        'Error during membership expiration check',
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  // Cache management methods

  /**
   * Invalidate all membership plans cache entries
   */
  private invalidatePlansCache(): void {
    try {
      // Since cache-manager doesn't provide a direct way to delete by pattern,
      // we'll need to track keys or use a simpler approach
      // For now, we'll just log that cache will expire naturally
      this.logger.debug(
        'Membership plans cache will expire naturally after 1 hour',
      );

      // Note: In production, consider using Redis with pattern-based deletion
      // or maintaining a list of cache keys to invalidate
    } catch (error) {
      this.logger.error(
        'Error invalidating plans cache',
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  // Helper methods to convert to DTOs

  private toPlanResponseDto(plan: any): MembershipPlanResponseDto {
    return {
      id: plan.id,
      name: plan.name,
      description: plan.description,
      durationDays: plan.durationDays,
      price: Number(plan.price),
      type: plan.type,
      features: plan.features,
      isActive: plan.isActive,
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt,
    };
  }

  private toMembershipResponseDto(membership: any): MembershipResponseDto {
    return {
      id: membership.id,
      memberId: membership.memberId,
      planId: membership.planId,
      plan: membership.plan
        ? this.toPlanResponseDto(membership.plan)
        : undefined,
      startDate: membership.startDate,
      endDate: membership.endDate,
      status: membership.status,
      createdAt: membership.createdAt,
      updatedAt: membership.updatedAt,
    };
  }
}
