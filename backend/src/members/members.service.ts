import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateMemberDto,
  UpdateMemberDto,
  MemberResponseDto,
  MemberFiltersDto,
  PaginatedResponseDto,
} from './dto';
import * as bcrypt from 'bcrypt';
import { UserRole, UserStatus, Prisma, SubscriptionStatus } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class MembersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(createMemberDto: CreateMemberDto): Promise<MemberResponseDto> {
    // Check if user with email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createMemberDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createMemberDto.password, 10);

    // Create user and member in a transaction
    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: createMemberDto.email,
          password: hashedPassword,
          role: UserRole.MEMBER,
          firstName: createMemberDto.firstName,
          lastName: createMemberDto.lastName,
          phone: createMemberDto.phone,
          avatarUrl: createMemberDto.avatarUrl ?? '',
        },
      });

      const member = await tx.member.create({
        data: {
          userId: user.id,
          dateOfBirth: createMemberDto.dateOfBirth
            ? new Date(createMemberDto.dateOfBirth)
            : undefined,
          gender: createMemberDto.gender,
          height: createMemberDto.height,
          currentWeight: createMemberDto.currentWeight,
          targetWeight: createMemberDto.targetWeight,
          emergencyContact: createMemberDto.emergencyContact,
        },
        include: {
          user: true,
        },
      });

      // Combine for response
      return { ...member, user };
    });

    const settings = await this.prisma.gymSetting.findFirst({
      select: { newMemberNotification: true },
    });
    if (settings?.newMemberNotification !== false) {
      await this.notificationsService.createForRole({
        role: UserRole.ADMIN,
        title: 'New member registered',
        message: `${result.user.firstName} ${result.user.lastName} (${result.user.email}) joined.`,
        type: 'success',
        actionUrl: '/admin/members',
      });
    }

    return this.toResponseDto(result);
  }

  async findAll(
    filters?: MemberFiltersDto,
    currentUser?: any,
  ): Promise<PaginatedResponseDto<MemberResponseDto>> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const skip = (page - 1) * limit;

    // Build where clause based on filters
    const where: Prisma.MemberWhereInput = {};

    // If trainer, only show assigned members
    if (currentUser?.role === UserRole.TRAINER) {
      const trainer = await this.prisma.trainer.findUnique({
        where: { userId: currentUser.userId },
        select: { id: true },
      });

      if (trainer) {
        where.workoutPlans = {
          some: {
            trainerId: trainer.id,
          },
        };
      }
    }

    // Filter by name (search in firstName or lastName on USER)
    if (filters?.name) {
      where.user = {
        OR: [
          { firstName: { contains: filters.name, mode: 'insensitive' } },
          { lastName: { contains: filters.name, mode: 'insensitive' } },
        ],
      };
    }

    // Filter by email
    if (filters?.email) {
      // If where.user is already defined (by name filter), we need to merge or use AND
      if (where.user) {
        // Prisma simple API limits deep merging. Easier to use explicit AND if needed or just property merge usually works if keys distinct.
        // But here both use `user`.
        // Let's restructure to use user: { AND: [...] } or merge.
        // Actually, if 'name' filter is present, it sets `where.user`.
        const prevUserWhere = where.user as Prisma.UserWhereInput;
        where.user = {
          AND: [
            prevUserWhere,
            { email: { contains: filters.email, mode: 'insensitive' } },
          ],
        };
      } else {
        where.user = {
          email: { contains: filters.email, mode: 'insensitive' },
        };
      }
    }

    // Filter by membership status or plan
    if (filters?.status || filters?.planId) {
      const subscriptionWhere: Prisma.SubscriptionWhereInput = {};

      if (filters.status) {
        subscriptionWhere.status = filters.status;
      }

      if (filters.planId) {
        subscriptionWhere.membershipPlanId = filters.planId;
      }

      where.subscriptions = {
        some: subscriptionWhere,
      };
    }

    if (filters?.isActive !== undefined) {
      const userStatus: Prisma.UserWhereInput = {
        status: filters.isActive ? UserStatus.ACTIVE : UserStatus.INACTIVE,
      };
      if (where.user) {
        const prevUserWhere = where.user as Prisma.UserWhereInput;
        where.user = {
          AND: [prevUserWhere, userStatus],
        };
      } else {
        where.user = userStatus;
      }
    }

    // Get total count
    const total = await this.prisma.member.count({ where });

    // Get paginated members
    const members = await this.prisma.member.findMany({
      where,
      include: {
        user: true,
        subscriptions: {
          include: {
            membershipPlan: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    });

    const memberDtos = members.map((member) => this.toResponseDto(member));

    return new PaginatedResponseDto(memberDtos, page, limit, total);
  }

  async findOne(id: string, currentUser?: any): Promise<MemberResponseDto> {
    const member = await this.prisma.member.findUnique({
      where: { id },
      include: {
        user: true,
        subscriptions: {
          include: {
            membershipPlan: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
    });

    if (!member) {
      throw new NotFoundException(`Member with ID ${id} not found`);
    }

    // Authorization check
    if (currentUser) {
      // Members can only access their own record
      if (
        currentUser.role === UserRole.MEMBER &&
        member.userId !== currentUser.userId
      ) {
        throw new ForbiddenException(
          'You can only access your own member record',
        );
      }

      // Trainers can only access assigned members
      if (currentUser.role === UserRole.TRAINER) {
        const trainer = await this.prisma.trainer.findUnique({
          where: { userId: currentUser.userId },
          select: { id: true },
        });

        if (trainer) {
          const isAssigned = await this.prisma.workoutPlan.findFirst({
            where: {
              memberId: id,
              trainerId: trainer.id,
            },
            select: { id: true },
          });

          if (!isAssigned) {
            throw new ForbiddenException(
              'You can only access members assigned to you',
            );
          }
        }
      }
    }

    return this.toResponseDto(member);
  }

  async findByUserId(userId: string): Promise<any> {
    const member = await this.prisma.member.findUnique({
      where: { userId },
      include: {
        user: true,
        subscriptions: {
          include: {
            membershipPlan: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
    });

    if (!member) {
      throw new NotFoundException(`Member not found for user ID ${userId}`);
    }

    return member;
  }

  async update(
    id: string,
    updateMemberDto: UpdateMemberDto,
    currentUser?: any,
  ): Promise<MemberResponseDto> {
    // Check if member exists - only select id, userId
    const existingMember = await this.prisma.member.findUnique({
      where: { id },
      select: { id: true, userId: true },
    });

    if (!existingMember) {
      throw new NotFoundException(`Member with ID ${id} not found`);
    }

    // Authorization check - Members can only update their own record
    if (
      currentUser?.role === UserRole.MEMBER &&
      existingMember.userId !== currentUser.userId
    ) {
      throw new ForbiddenException(
        'You can only update your own member record',
      );
    }

    // Update member and user
    const updatedMember = await this.prisma.member.update({
      where: { id },
      data: {
        dateOfBirth: updateMemberDto.dateOfBirth
          ? new Date(updateMemberDto.dateOfBirth)
          : undefined,
        gender: updateMemberDto.gender,
        height: updateMemberDto.height,
        currentWeight: updateMemberDto.currentWeight,
        targetWeight: updateMemberDto.targetWeight,
        emergencyContact: updateMemberDto.emergencyContact,
        user: {
          update: {
            firstName: updateMemberDto.firstName,
            lastName: updateMemberDto.lastName,
            phone: updateMemberDto.phone,
            avatarUrl: updateMemberDto.avatarUrl,
          },
        },
      },
      include: {
        user: true,
      },
    });

    return this.toResponseDto(updatedMember);
  }

  async deactivate(id: string): Promise<void> {
    const existingMember = await this.prisma.member.findUnique({
      where: { id },
      select: { id: true, userId: true },
    });

    if (!existingMember) {
      throw new NotFoundException(`Member with ID ${id} not found`);
    }

    await this.prisma.member.update({
      where: { id },
      data: {
        user: {
          update: {
            status: UserStatus.INACTIVE,
          },
        },
      },
    });
  }

  async activate(id: string): Promise<void> {
    const existingMember = await this.prisma.member.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existingMember) {
      throw new NotFoundException(`Member with ID ${id} not found`);
    }

    await this.prisma.member.update({
      where: { id },
      data: {
        user: {
          update: {
            status: UserStatus.ACTIVE,
          },
        },
      },
    });
  }

  async deleteHard(id: string): Promise<void> {
    const existingMember = await this.prisma.member.findUnique({
      where: { id },
      select: { id: true, userId: true },
    });

    if (!existingMember) {
      throw new NotFoundException(`Member with ID ${id} not found`);
    }

    await this.prisma.user.delete({
      where: { id: existingMember.userId },
    });
  }

  async hasActiveMembership(memberId: string): Promise<boolean> {
    const activeMembership = await this.prisma.subscription.findFirst({
      where: {
        memberId,
        status: SubscriptionStatus.ACTIVE,
        endDate: {
          gte: new Date(),
        },
      },
      select: {
        id: true,
      },
    });

    return !!activeMembership;
  }

  async getBookings(memberId: string, currentUser?: any): Promise<any[]> {
    // Check if member exists
    const member = await this.prisma.member.findUnique({
      where: { id: memberId },
      select: { id: true, userId: true },
    });

    if (!member) {
      throw new NotFoundException(`Member with ID ${memberId} not found`);
    }

    // Authorization check
    if (
      currentUser?.role === UserRole.MEMBER &&
      member.userId !== currentUser.userId
    ) {
      throw new ForbiddenException('You can only access your own bookings');
    }

    // Get all bookings
    const bookings = await this.prisma.classBooking.findMany({
      where: {
        memberId,
      },
      include: {
        classSchedule: {
          include: {
            class: true,
            trainer: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { bookedAt: 'desc' },
    });

    return bookings.map((booking: any) => ({
      id: booking.id,
      status: booking.status,
      createdAt: booking.bookedAt,
      updatedAt: booking.updatedAt,
      class: {
        id: booking.classSchedule.class.id,
        name: booking.classSchedule.class.name,
        description: booking.classSchedule.class.description,
        schedule: booking.classSchedule.startTime,
        duration: booking.classSchedule.class.duration,
        capacity: booking.classSchedule.class.maxCapacity,
        classType: booking.classSchedule.class.category,
        trainer: {
          id: booking.classSchedule.trainer.id,
          firstName: booking.classSchedule.trainer.user.firstName,
          lastName: booking.classSchedule.trainer.user.lastName,
        },
      },
      classSchedule: {
        id: booking.classSchedule.id,
        startTime: booking.classSchedule.startTime,
        endTime: booking.classSchedule.endTime,
        daysOfWeek: booking.classSchedule.daysOfWeek,
        isActive: booking.classSchedule.isActive,
      },
    }));
  }

  toResponseDto(member: any): MemberResponseDto {
    const isActive = member.user?.status
      ? member.user.status === UserStatus.ACTIVE
      : false;

    return {
      id: member.id,
      email: member.user.email,
      firstName: member.user.firstName,
      lastName: member.user.lastName,
      phone: member.user.phone,
      avatarUrl: member.user.avatarUrl,
      dateOfBirth: member.dateOfBirth,
      gender: member.gender,
      height: member.height,
      currentWeight: member.currentWeight,
      targetWeight: member.targetWeight,
      emergencyContact: member.emergencyContact,
      isActive,
      createdAt: member.createdAt,
      updatedAt: member.updatedAt,
      subscriptions: Array.isArray(member.subscriptions)
        ? member.subscriptions.map((subscription: any) => ({
            id: subscription.id,
            status: subscription.status,
            startDate: subscription.startDate,
            endDate: subscription.endDate,
            membershipPlan: subscription.membershipPlan
              ? {
                  id: subscription.membershipPlan.id,
                  name: subscription.membershipPlan.name,
                  price: Number(subscription.membershipPlan.price),
                  durationDays: subscription.membershipPlan.duration,
                }
              : undefined,
          }))
        : undefined,
    };
  }
}
