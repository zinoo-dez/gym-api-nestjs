import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
  Logger,
  Inject,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import {
  CreateMembershipPlanDto,
  AssignMembershipDto,
  UpdateMembershipPlanDto,
  MembershipPlanResponseDto,
  MembershipResponseDto,
  UpgradeMembershipDto,
  MembershipPlanFiltersDto,
  SubscribeMembershipDto,
} from './dto';
import { PaginatedResponseDto } from '../common/dto';
import {
  Prisma,
  UserRole,
  SubscriptionStatus,
  FeatureLevel,
  DiscountType,
} from '@prisma/client';
import PDFDocument from 'pdfkit';

@Injectable()
export class MembershipsService {
  private readonly logger = new Logger(MembershipsService.name);
  private readonly CACHE_TTL = 3600000; // 1 hour in milliseconds
  private readonly PLANS_CACHE_KEY = 'membership_plans';
  private plansCacheVersion = 0;

  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly notificationsService: NotificationsService,
  ) {}

  // Membership Plan CRUD operations

  async createPlan(
    createPlanDto: CreateMembershipPlanDto,
  ): Promise<MembershipPlanResponseDto> {
    // Check if plan with same name already exists - only select id field
    const existingPlan = await this.prisma.membershipPlan.findFirst({
      where: { name: createPlanDto.name },
      select: { id: true },
    });

    if (existingPlan) {
      throw new ConflictException(
        'Membership plan with this name already exists',
      );
    }

    const featureInputs = createPlanDto.features ?? [];
    await this.ensurePlanFeaturesValid(featureInputs);

    const plan = await this.prisma.$transaction(async (tx) => {
      const created = await tx.membershipPlan.create({
        data: {
          name: createPlanDto.name,
          description: createPlanDto.description,
          duration: createPlanDto.durationDays, // Map durationDays to duration
          price: createPlanDto.price,
          unlimitedClasses: createPlanDto.unlimitedClasses ?? false,
          personalTrainingHours: createPlanDto.personalTrainingHours ?? 0,
          accessToEquipment: createPlanDto.accessToEquipment ?? true,
          accessToLocker: createPlanDto.accessToLocker ?? false,
          nutritionConsultation: createPlanDto.nutritionConsultation ?? false,
        },
      });

      if (featureInputs.length > 0) {
        await tx.membershipPlanFeature.createMany({
          data: featureInputs.map((feature) => ({
            membershipPlanId: created.id,
            featureId: feature.featureId,
            level: feature.level ?? FeatureLevel.BASIC,
          })),
        });
      }

      return tx.membershipPlan.findUnique({
        where: { id: created.id },
        include: { planFeatures: { include: { feature: true } } },
      });
    });

    if (!plan) {
      throw new NotFoundException('Membership plan not found after creation');
    }

    const settings = await this.prisma.gymSetting.findFirst({
      select: { newPaymentNotification: true },
    });
    if (settings?.newPaymentNotification !== false) {
      await this.notificationsService.createForRole({
        role: UserRole.ADMIN,
        title: 'Membership plan created',
        message: `Plan "${plan.name}" has been created.`,
        type: 'success',
        actionUrl: '/admin/plans',
      });
    }

    // Invalidate cache when a new plan is created
    this.invalidatePlansCache();

    return this.toPlanResponseDto(plan);
  }

  async findAllPlans(
    filters?: MembershipPlanFiltersDto,
  ): Promise<PaginatedResponseDto<MembershipPlanResponseDto>> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const skip = (page - 1) * limit;

    // Build where clause based on filters
    const where: Prisma.MembershipPlanWhereInput = {};

    if (filters?.name) {
      where.name = {
        contains: filters.name,
        mode: 'insensitive',
      };
    }

    // Create cache key based on filters
    const cacheKey = `${this.PLANS_CACHE_KEY}:v${this.plansCacheVersion}:${JSON.stringify({ where, page, limit, skip })}`;

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
      include: { planFeatures: { include: { feature: true } } },
    });

    const planDtos = plans.map((plan) => this.toPlanResponseDto(plan));

    const result = new PaginatedResponseDto(planDtos, page, limit, total);

    // Store in cache with 1 hour TTL
    await this.cacheManager.set(cacheKey, result, this.CACHE_TTL);

    return result;
  }

  async findPlanById(id: string): Promise<MembershipPlanResponseDto> {
    const cacheKey = `${this.PLANS_CACHE_KEY}:v${this.plansCacheVersion}:${id}`;

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
      include: { planFeatures: { include: { feature: true } } },
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
      const nameConflict = await this.prisma.membershipPlan.findFirst({
        where: { name: updatePlanDto.name },
        select: { id: true },
      });

      if (nameConflict) {
        throw new ConflictException(
          'Membership plan with this name already exists',
        );
      }
    }

    const featureInputs = updatePlanDto.features;
    if (featureInputs) {
      await this.ensurePlanFeaturesValid(featureInputs);
    }

    const updatedPlan = await this.prisma.$transaction(async (tx) => {
      await tx.membershipPlan.update({
        where: { id },
        data: {
          name: updatePlanDto.name,
          description: updatePlanDto.description,
          duration: updatePlanDto.durationDays,
          price: updatePlanDto.price,
          unlimitedClasses: updatePlanDto.unlimitedClasses,
          personalTrainingHours: updatePlanDto.personalTrainingHours,
          accessToEquipment: updatePlanDto.accessToEquipment,
          accessToLocker: updatePlanDto.accessToLocker,
          nutritionConsultation: updatePlanDto.nutritionConsultation,
        },
      });

      if (featureInputs) {
        await tx.membershipPlanFeature.deleteMany({
          where: { membershipPlanId: id },
        });

        if (featureInputs.length > 0) {
          await tx.membershipPlanFeature.createMany({
            data: featureInputs.map((feature) => ({
              membershipPlanId: id,
              featureId: feature.featureId,
              level: feature.level ?? FeatureLevel.BASIC,
            })),
          });
        }
      }

      return tx.membershipPlan.findUnique({
        where: { id },
        include: { planFeatures: { include: { feature: true } } },
      });
    });

    if (!updatedPlan) {
      throw new NotFoundException(`Membership plan with ID ${id} not found`);
    }

    const settings = await this.prisma.gymSetting.findFirst({
      select: { newPaymentNotification: true },
    });
    if (settings?.newPaymentNotification !== false) {
      await this.notificationsService.createForRole({
        role: UserRole.ADMIN,
        title: 'Membership plan updated',
        message: `Plan "${updatedPlan.name}" has been updated.`,
        type: 'info',
        actionUrl: '/admin/plans',
      });
    }

    // Invalidate cache when a plan is updated
    this.invalidatePlansCache();

    return this.toPlanResponseDto(updatedPlan);
  }

  async deletePlan(id: string): Promise<void> {
    const existingPlan = await this.prisma.membershipPlan.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existingPlan) {
      throw new NotFoundException(`Membership plan with ID ${id} not found`);
    }

    const activeSubscriptions = await this.prisma.subscription.count({
      where: {
        membershipPlanId: id,
        status: SubscriptionStatus.ACTIVE,
      },
    });

    if (activeSubscriptions > 0) {
      throw new BadRequestException(
        'Cannot delete a plan with active subscriptions',
      );
    }

    const deletedPlan = await this.prisma.membershipPlan.delete({ where: { id } });

    const settings = await this.prisma.gymSetting.findFirst({
      select: { newPaymentNotification: true },
    });
    if (settings?.newPaymentNotification !== false) {
      await this.notificationsService.createForRole({
        role: UserRole.ADMIN,
        title: 'Membership plan deleted',
        message: `Plan "${deletedPlan.name}" has been deleted.`,
        type: 'warning',
        actionUrl: '/admin/plans',
      });
    }

    this.invalidatePlansCache();
  }

  // Membership assignment and management

  async assignMembership(
    assignDto: AssignMembershipDto,
  ): Promise<MembershipResponseDto> {
    // Verify member exists - only select id field
    const member = await this.prisma.member.findUnique({
      where: { id: assignDto.memberId },
      select: { id: true, userId: true },
    });

    if (!member) {
      throw new NotFoundException(
        `Member with ID ${assignDto.memberId} not found`,
      );
    }

    // Verify plan exists - only select needed fields
    const plan = await this.prisma.membershipPlan.findUnique({
      where: { id: assignDto.planId },
      select: { id: true, duration: true, price: true },
    });

    if (!plan) {
      throw new NotFoundException(
        `Membership plan with ID ${assignDto.planId} not found`,
      );
    }

    // Check if member already has an active membership
    const activeMembership = await this.prisma.subscription.findFirst({
      where: {
        memberId: assignDto.memberId,
        status: SubscriptionStatus.ACTIVE,
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
    endDate.setDate(endDate.getDate() + (plan.duration || 30));

    const pricing = await this.resolveDiscountPricing(
      plan.price,
      assignDto.discountCode,
    );

    // Create membership
    const membership = await this.prisma.subscription.create({
      data: {
        memberId: assignDto.memberId,
        membershipPlanId: assignDto.planId,
        startDate,
        endDate,
        status: SubscriptionStatus.ACTIVE,
        originalPrice: pricing.originalPrice,
        finalPrice: pricing.finalPrice,
        discountAmount: pricing.discountAmount,
        discountCodeId: pricing.discountCodeId,
      },
      include: {
        membershipPlan: true,
        discountCode: true,
      },
    });

    const settings = await this.prisma.gymSetting.findFirst({
      select: { newMembershipNotification: true },
    });
    if (settings?.newMembershipNotification !== false) {
      const memberUser = await this.prisma.user.findUnique({
        where: { id: member.userId },
        select: { firstName: true, lastName: true, email: true },
      });
      const fullName = memberUser
        ? `${memberUser.firstName} ${memberUser.lastName}`.trim()
        : 'Member';
      await this.notificationsService.createForRole({
        role: UserRole.ADMIN,
        title: 'Membership assigned',
        message: `${fullName} was assigned a membership.`,
        type: 'info',
        actionUrl: '/admin/members',
      });
      if (member.userId) {
        await this.notificationsService.createForUser({
          userId: member.userId,
          title: 'Membership assigned',
          message: 'A membership has been assigned to your account.',
          type: 'success',
          actionUrl: '/member/plans',
        });
      }
    }

    return this.toMembershipResponseDto(membership);
  }

  async subscribeMembership(
    userId: string,
    subscribeDto: SubscribeMembershipDto,
  ): Promise<MembershipResponseDto> {
    const member = await this.prisma.member.findUnique({
      where: { userId },
      select: { id: true, user: { select: { firstName: true, lastName: true } } },
    });

    if (!member) {
      throw new NotFoundException('Member profile not found');
    }

    const plan = await this.prisma.membershipPlan.findUnique({
      where: { id: subscribeDto.planId },
      select: { id: true, duration: true, name: true, price: true },
    });

    if (!plan) {
      throw new NotFoundException(
        `Membership plan with ID ${subscribeDto.planId} not found`,
      );
    }

    const activeMembership = await this.prisma.subscription.findFirst({
      where: {
        memberId: member.id,
        status: SubscriptionStatus.ACTIVE,
        endDate: {
          gte: new Date(),
        },
      },
      select: { id: true },
    });

    if (activeMembership) {
      throw new ConflictException(
        'You already have an active membership. Use upgrade to change plans.',
      );
    }

    const startDate = subscribeDto.startDate
      ? new Date(subscribeDto.startDate)
      : new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + (plan.duration || 30));

    const pricing = await this.resolveDiscountPricing(
      plan.price,
      subscribeDto.discountCode,
    );

    const membership = await this.prisma.subscription.create({
      data: {
        memberId: member.id,
        membershipPlanId: subscribeDto.planId,
        startDate,
        endDate,
        status: SubscriptionStatus.ACTIVE,
        originalPrice: pricing.originalPrice,
        finalPrice: pricing.finalPrice,
        discountAmount: pricing.discountAmount,
        discountCodeId: pricing.discountCodeId,
      },
      include: {
        membershipPlan: true,
        discountCode: true,
      },
    });

    const settings = await this.prisma.gymSetting.findFirst({
      select: { newMembershipNotification: true },
    });
    if (settings?.newMembershipNotification !== false) {
      const fullName = member.user
        ? `${member.user.firstName} ${member.user.lastName}`.trim()
        : 'Member';
      await this.notificationsService.createForRole({
        role: UserRole.ADMIN,
        title: 'New membership subscription',
        message: `${fullName} subscribed to ${plan.name}.`,
        type: 'success',
        actionUrl: '/admin/members',
      });
    }

    return this.toMembershipResponseDto(membership);
  }

  async findMembershipById(
    id: string,
    currentUser?: any,
  ): Promise<MembershipResponseDto> {
    const membership = await this.prisma.subscription.findUnique({
      where: { id },
      include: {
        membershipPlan: true,
        discountCode: true,
        member: {
          select: { userId: true },
        },
      },
    });

    if (!membership) {
      throw new NotFoundException(`Membership with ID ${id} not found`);
    }

    // Authorization check - Members can only access their own membership
    if (
      currentUser?.role === UserRole.MEMBER &&
      membership.member.userId !== currentUser.userId
    ) {
      throw new ForbiddenException('You can only access your own membership');
    }

    return this.toMembershipResponseDto(membership);
  }

  async upgradeMembership(
    memberId: string,
    upgradeDto: UpgradeMembershipDto,
    currentUser?: any,
  ): Promise<MembershipResponseDto> {
    // Verify member exists - only select id field
    const member = await this.prisma.member.findUnique({
      where: { id: memberId },
      select: { id: true, userId: true },
    });

    if (!member) {
      throw new NotFoundException(`Member with ID ${memberId} not found`);
    }

    // Authorization check - Members can only upgrade their own membership
    if (
      currentUser?.role === UserRole.MEMBER &&
      member.userId !== currentUser.userId
    ) {
      throw new ForbiddenException('You can only upgrade your own membership');
    }

    // Verify new plan exists - only select needed fields
    const newPlan = await this.prisma.membershipPlan.findUnique({
      where: { id: upgradeDto.newPlanId },
      select: { id: true, duration: true, price: true },
    });

    if (!newPlan) {
      throw new NotFoundException(
        `Membership plan with ID ${upgradeDto.newPlanId} not found`,
      );
    }

    // Find current active membership
    const currentMembership = await this.prisma.subscription.findFirst({
      where: {
        memberId,
        status: SubscriptionStatus.ACTIVE,
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
      await tx.subscription.update({
        where: { id: currentMembership.id },
        data: {
          status: SubscriptionStatus.CANCELLED,
        },
      });

      // Create new membership starting today
      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + (newPlan.duration || 30));

      const newMembership = await tx.subscription.create({
        data: {
          memberId,
          membershipPlanId: upgradeDto.newPlanId,
          startDate,
          endDate,
          status: SubscriptionStatus.ACTIVE,
          originalPrice: Number(newPlan.price || 0),
          finalPrice: Number(newPlan.price || 0),
          discountAmount: 0,
        },
        include: {
          membershipPlan: true,
          discountCode: true,
        },
      });

      return newMembership;
    });

    const settings = await this.prisma.gymSetting.findFirst({
      select: { newMembershipNotification: true },
    });
    if (settings?.newMembershipNotification !== false) {
      const memberUser = await this.prisma.user.findUnique({
        where: { id: member.userId },
        select: { firstName: true, lastName: true, email: true },
      });
      const fullName = memberUser
        ? `${memberUser.firstName} ${memberUser.lastName}`.trim()
        : 'Member';
      await this.notificationsService.createForRole({
        role: UserRole.ADMIN,
        title: 'Membership upgraded',
        message: `${fullName} upgraded their membership.`,
        type: 'info',
        actionUrl: '/admin/members',
      });
      if (member.userId) {
        await this.notificationsService.createForUser({
          userId: member.userId,
          title: 'Membership upgraded',
          message: 'Your membership has been upgraded successfully.',
          type: 'success',
          actionUrl: '/member/plans',
        });
      }
    }

    return this.toMembershipResponseDto(result);
  }

  async isValid(membershipId: string): Promise<boolean> {
    const membership = await this.prisma.subscription.findUnique({
      where: { id: membershipId },
      select: { status: true, startDate: true, endDate: true },
    });

    if (!membership) {
      return false;
    }

    const now = new Date();
    return (
      membership.status === SubscriptionStatus.ACTIVE &&
      membership.startDate <= now &&
      membership.endDate >= now
    );
  }

  async freezeMembership(id: string): Promise<MembershipResponseDto> {
    const membership = await this.prisma.subscription.findUnique({
      where: { id },
      include: { membershipPlan: true, discountCode: true },
    });

    if (!membership) {
      throw new NotFoundException(`Membership with ID ${id} not found`);
    }

    const updated = await this.prisma.subscription.update({
      where: { id },
      data: { status: SubscriptionStatus.FROZEN },
      include: { membershipPlan: true, discountCode: true },
    });

    const settings = await this.prisma.gymSetting.findFirst({
      select: { newMembershipNotification: true },
    });
    if (settings?.newMembershipNotification !== false) {
      const memberRecord = await this.prisma.member.findUnique({
        where: { id: updated.memberId },
        select: { userId: true, user: { select: { firstName: true, lastName: true } } },
      });
      const fullName = memberRecord?.user
        ? `${memberRecord.user.firstName} ${memberRecord.user.lastName}`.trim()
        : 'Member';
      await this.notificationsService.createForRole({
        role: UserRole.ADMIN,
        title: 'Membership frozen',
        message: `${fullName} membership was frozen.`,
        type: 'warning',
        actionUrl: '/admin/members',
      });
      if (memberRecord?.userId) {
        await this.notificationsService.createForUser({
          userId: memberRecord.userId,
          title: 'Membership frozen',
          message: 'Your membership has been frozen.',
          type: 'warning',
          actionUrl: '/member/plans',
        });
      }
    }

    return this.toMembershipResponseDto(updated);
  }

  async unfreezeMembership(id: string): Promise<MembershipResponseDto> {
    const membership = await this.prisma.subscription.findUnique({
      where: { id },
      include: { membershipPlan: true, discountCode: true },
    });

    if (!membership) {
      throw new NotFoundException(`Membership with ID ${id} not found`);
    }

    const newStatus =
      membership.endDate >= new Date()
        ? SubscriptionStatus.ACTIVE
        : SubscriptionStatus.EXPIRED;

    const updated = await this.prisma.subscription.update({
      where: { id },
      data: { status: newStatus },
      include: { membershipPlan: true, discountCode: true },
    });

    const settings = await this.prisma.gymSetting.findFirst({
      select: { newMembershipNotification: true },
    });
    if (settings?.newMembershipNotification !== false) {
      const memberRecord = await this.prisma.member.findUnique({
        where: { id: updated.memberId },
        select: { userId: true, user: { select: { firstName: true, lastName: true } } },
      });
      const fullName = memberRecord?.user
        ? `${memberRecord.user.firstName} ${memberRecord.user.lastName}`.trim()
        : 'Member';
      await this.notificationsService.createForRole({
        role: UserRole.ADMIN,
        title: 'Membership unfrozen',
        message: `${fullName} membership was unfrozen.`,
        type: 'info',
        actionUrl: '/admin/members',
      });
      if (memberRecord?.userId) {
        await this.notificationsService.createForUser({
          userId: memberRecord.userId,
          title: 'Membership reactivated',
          message: 'Your membership is active again.',
          type: 'success',
          actionUrl: '/member/plans',
        });
      }
    }

    return this.toMembershipResponseDto(updated);
  }

  async cancelMembership(id: string): Promise<MembershipResponseDto> {
    const membership = await this.prisma.subscription.findUnique({
      where: { id },
      include: { membershipPlan: true, discountCode: true },
    });

    if (!membership) {
      throw new NotFoundException(`Membership with ID ${id} not found`);
    }

    const updated = await this.prisma.subscription.update({
      where: { id },
      data: { status: SubscriptionStatus.CANCELLED },
      include: { membershipPlan: true, discountCode: true },
    });

    const settings = await this.prisma.gymSetting.findFirst({
      select: { newMembershipNotification: true },
    });
    if (settings?.newMembershipNotification !== false) {
      const memberRecord = await this.prisma.member.findUnique({
        where: { id: updated.memberId },
        select: { userId: true, user: { select: { firstName: true, lastName: true } } },
      });
      const fullName = memberRecord?.user
        ? `${memberRecord.user.firstName} ${memberRecord.user.lastName}`.trim()
        : 'Member';
      await this.notificationsService.createForRole({
        role: UserRole.ADMIN,
        title: 'Membership cancelled',
        message: `${fullName} membership was cancelled.`,
        type: 'warning',
        actionUrl: '/admin/members',
      });
      if (memberRecord?.userId) {
        await this.notificationsService.createForUser({
          userId: memberRecord.userId,
          title: 'Membership cancelled',
          message: `${fullName}, your membership has been cancelled.`,
          type: 'warning',
          actionUrl: '/member/plans',
        });
      }
    }

    return this.toMembershipResponseDto(updated);
  }

  async generateInvoicePdf(
    membershipId: string,
    currentUser: { userId: string; role: UserRole },
  ): Promise<{ filename: string; buffer: Buffer }> {
    const membership = await this.prisma.subscription.findUnique({
      where: { id: membershipId },
      include: {
        membershipPlan: true,
        discountCode: true,
        member: {
          include: { user: true },
        },
      },
    });

    if (!membership) {
      throw new NotFoundException(`Membership with ID ${membershipId} not found`);
    }

    if (
      currentUser.role === UserRole.MEMBER &&
      membership.member?.userId !== currentUser.userId
    ) {
      throw new ForbiddenException('You can only access your own invoice');
    }

    const gymSettings = await this.prisma.gymSetting.findFirst();
    const gymName = gymSettings?.name || 'Your Gym';
    const gymAddress = gymSettings?.address || '';
    const gymPhone = gymSettings?.phone || '';
    const gymEmail = gymSettings?.email || '';

    const memberName = membership.member?.user
      ? `${membership.member.user.firstName} ${membership.member.user.lastName}`.trim()
      : 'Member';
    const memberEmail = membership.member?.user?.email || '';

    const planName = membership.membershipPlan?.name || 'Membership Plan';
    const discountCode = membership.discountCode?.code;
    const planPrice = Number(
      membership.originalPrice ?? membership.membershipPlan?.price ?? 0,
    );
    const discountAmount = Number(membership.discountAmount || 0);
    const finalPrice =
      membership.finalPrice !== undefined
        ? Number(membership.finalPrice)
        : Math.max(0, planPrice - discountAmount);

    const issueDate = new Date().toLocaleDateString();
    const startDate = new Date(membership.startDate).toLocaleDateString();
    const endDate = new Date(membership.endDate).toLocaleDateString();

    const invoiceId = membership.id.slice(-8).toUpperCase();
    const filename = `invoice_${invoiceId}.pdf`;

    const doc = new PDFDocument({ size: 'A4', margin: 40 });
    const chunks: Buffer[] = [];

    const bufferPromise = new Promise<Buffer>((resolve, reject) => {
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err: Error) => reject(err));
    });

    doc.fontSize(20).text(gymName, { align: 'left' });
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor('#555');
    if (gymAddress) doc.text(gymAddress);
    if (gymPhone) doc.text(`Phone: ${gymPhone}`);
    if (gymEmail) doc.text(`Email: ${gymEmail}`);

    doc.moveDown();
    doc.fillColor('#000');
    doc.fontSize(16).text('Invoice', { align: 'right' });
    doc.fontSize(10).text(`Invoice #: ${invoiceId}`, { align: 'right' });
    doc.text(`Date: ${issueDate}`, { align: 'right' });

    doc.moveDown(2);
    doc.fontSize(12).text('Billed To:', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11).text(memberName);
    if (memberEmail) doc.text(memberEmail);

    doc.moveDown(1.5);
    doc.fontSize(12).text('Plan Details', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11).text(`Plan: ${planName}`);
    if (discountCode) {
      doc.text(`Discount Code: ${discountCode}`);
    }
    doc.text(`Start Date: ${startDate}`);
    doc.text(`End Date: ${endDate}`);

    doc.moveDown(1.5);
    doc.fontSize(12).text('Amount Due', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11).text(`Original Price: $${planPrice.toFixed(2)}`);
    if (discountAmount > 0) {
      doc.text(`Discount: -$${discountAmount.toFixed(2)}`);
    }
    doc.fontSize(14).text(`Total: $${finalPrice.toFixed(2)}`);

    doc.moveDown(2);
    doc.fontSize(10).fillColor('#555');
    doc.text('Thank you for your membership!', { align: 'left' });

    doc.end();

    const buffer = await bufferPromise;
    return { filename, buffer };
  }

  async expireMemberships(): Promise<number> {
    const now = new Date();

    const result = await this.prisma.subscription.updateMany({
      where: {
        status: SubscriptionStatus.ACTIVE,
        endDate: {
          lt: now,
        },
      },
      data: {
        status: SubscriptionStatus.EXPIRED,
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
      this.plansCacheVersion += 1;
      this.logger.debug(
        `Membership plans cache version bumped to ${this.plansCacheVersion}`,
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
      durationDays: plan.duration, // Map duration back to durationDays for DTO
      price: Number(plan.price),
      unlimitedClasses: plan.unlimitedClasses,
      personalTrainingHours: plan.personalTrainingHours,
      accessToEquipment: plan.accessToEquipment,
      accessToLocker: plan.accessToLocker,
      nutritionConsultation: plan.nutritionConsultation,
      planFeatures: Array.isArray(plan.planFeatures)
        ? plan.planFeatures.map((planFeature: any) => ({
            featureId: planFeature.featureId,
            name: planFeature.feature?.name ?? '',
            description: planFeature.feature?.description ?? undefined,
            level: planFeature.level,
          }))
        : [],
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt,
    };
  }

  private async ensurePlanFeaturesValid(
    features: { featureId: string; level: FeatureLevel }[],
  ): Promise<void> {
    if (!features || features.length === 0) return;
    const featureIds = features.map((feature) => feature.featureId);
    const uniqueIds = Array.from(new Set(featureIds));
    const existing = await this.prisma.feature.findMany({
      where: { id: { in: uniqueIds } },
      select: { id: true },
    });
    if (existing.length !== uniqueIds.length) {
      throw new BadRequestException('One or more features are invalid');
    }
  }

  private toMembershipResponseDto(membership: any): MembershipResponseDto {
    const planPrice = Number(membership.membershipPlan?.price ?? 0);
    const originalPrice =
      membership.originalPrice && Number(membership.originalPrice) > 0
        ? Number(membership.originalPrice)
        : planPrice;
    const discountAmount = Number(membership.discountAmount ?? 0);
    const finalPrice =
      membership.finalPrice && Number(membership.finalPrice) > 0
        ? Number(membership.finalPrice)
        : Math.max(0, originalPrice - discountAmount);

    return {
      id: membership.id,
      memberId: membership.memberId,
      planId: membership.membershipPlanId,
      plan: membership.membershipPlan
        ? this.toPlanResponseDto(membership.membershipPlan)
        : undefined,
      originalPrice,
      finalPrice,
      discountAmount,
      discountCode: membership.discountCode?.code,
      startDate: membership.startDate,
      endDate: membership.endDate,
      status: membership.status,
      createdAt: membership.createdAt,
      updatedAt: membership.updatedAt,
    };
  }

  private async resolveDiscountPricing(
    originalPrice: number,
    discountCode?: string,
  ): Promise<{
    originalPrice: number;
    finalPrice: number;
    discountAmount: number;
    discountCodeId?: string;
  }> {
    const basePrice = Number(originalPrice || 0);
    if (!discountCode) {
      return {
        originalPrice: basePrice,
        finalPrice: basePrice,
        discountAmount: 0,
      };
    }

    const normalized = discountCode.trim().toUpperCase();
    const now = new Date();

    return this.prisma.$transaction(async (tx) => {
      const code = await tx.discountCode.findFirst({
        where: { code: { equals: normalized, mode: 'insensitive' } },
      });

      if (!code) {
        throw new NotFoundException('Discount code not found');
      }
      if (!code.isActive) {
        throw new BadRequestException('Discount code is inactive');
      }
      if (code.startsAt && now < code.startsAt) {
        throw new BadRequestException('Discount code not active yet');
      }
      if (code.endsAt && now > code.endsAt) {
        throw new BadRequestException('Discount code has expired');
      }
      if (code.maxRedemptions !== null && code.usedCount >= code.maxRedemptions) {
        throw new BadRequestException('Discount code redemption limit reached');
      }

      if (code.type === DiscountType.PERCENTAGE && code.amount > 100) {
        throw new BadRequestException('Discount percent cannot exceed 100');
      }

      const discountAmount =
        code.type === DiscountType.PERCENTAGE
          ? (basePrice * code.amount) / 100
          : code.amount;
      const finalPrice = Math.max(0, basePrice - discountAmount);

      await tx.discountCode.update({
        where: { id: code.id },
        data: { usedCount: { increment: 1 } },
      });

      return {
        originalPrice: basePrice,
        finalPrice,
        discountAmount,
        discountCodeId: code.id,
      };
    });
  }

  async previewDiscount(planId: string, code?: string) {
    if (!code) {
      return {
        originalPrice: 0,
        finalPrice: 0,
        discountAmount: 0,
      };
    }

    const plan = await this.prisma.membershipPlan.findUnique({
      where: { id: planId },
      select: { price: true },
    });

    if (!plan) {
      throw new NotFoundException(`Membership plan with ID ${planId} not found`);
    }

    const basePrice = Number(plan.price || 0);
    const normalized = code.trim().toUpperCase();
    const now = new Date();

    const discount = await this.prisma.discountCode.findFirst({
      where: { code: { equals: normalized, mode: 'insensitive' } },
    });

    if (!discount) {
      throw new NotFoundException('Discount code not found');
    }
    if (!discount.isActive) {
      throw new BadRequestException('Discount code is inactive');
    }
    if (discount.startsAt && now < discount.startsAt) {
      throw new BadRequestException('Discount code not active yet');
    }
    if (discount.endsAt && now > discount.endsAt) {
      throw new BadRequestException('Discount code has expired');
    }
    if (
      discount.maxRedemptions !== null &&
      discount.usedCount >= discount.maxRedemptions
    ) {
      throw new BadRequestException('Discount code redemption limit reached');
    }
    if (discount.type === DiscountType.PERCENTAGE && discount.amount > 100) {
      throw new BadRequestException('Discount percent cannot exceed 100');
    }

    const discountAmount =
      discount.type === DiscountType.PERCENTAGE
        ? (basePrice * discount.amount) / 100
        : discount.amount;
    const finalPrice = Math.max(0, basePrice - discountAmount);

    return {
      originalPrice: basePrice,
      finalPrice,
      discountAmount,
      discountCode: discount.code,
    };
  }
}
