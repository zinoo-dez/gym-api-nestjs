import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateWorkoutPlanDto,
  UpdateWorkoutPlanDto,
  WorkoutPlanResponseDto,
  WorkoutPlanVersionResponseDto,
  WorkoutPlanFiltersDto,
} from './dto';
import { PaginatedResponseDto } from '../common/dto';
import { Prisma, UserRole } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';
// import { WorkoutGoal } from '../common/enums';

@Injectable()
export class WorkoutPlansService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(
    createWorkoutPlanDto: CreateWorkoutPlanDto,
    userId: string,
  ): Promise<WorkoutPlanResponseDto> {
    // Validate exercise order
    this.validateExerciseOrder(createWorkoutPlanDto.exercises);

    // Verify member exists - only select id field
    const member = await this.prisma.member.findUnique({
      where: { id: createWorkoutPlanDto.memberId },
      select: {
        id: true,
        userId: true,
        user: { select: { firstName: true, lastName: true, email: true } },
      },
    });

    if (!member) {
      throw new NotFoundException(
        `Member with ID ${createWorkoutPlanDto.memberId} not found`,
      );
    }

    // Get trainer from user ID - only select id field
    const trainer = await this.prisma.trainer.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!trainer) {
      throw new NotFoundException(`Trainer not found for user ID ${userId}`);
    }

    // Create workout plan with exercises
    const workoutPlan = await this.prisma.workoutPlan.create({
      data: {
        name: createWorkoutPlanDto.name,
        description: createWorkoutPlanDto.description,
        memberId: createWorkoutPlanDto.memberId,
        trainerId: trainer.id,
        goal: createWorkoutPlanDto.goal,
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default 30 days
        exercises: JSON.stringify(createWorkoutPlanDto.exercises),
      },
      include: {
        member: {
          include: {
            user: true,
          },
        },
      },
    });

    const settings = await this.prisma.gymSetting.findFirst({
      select: { newWorkoutPlanNotification: true },
    });
    if (settings?.newWorkoutPlanNotification !== false) {
      const fullName = member.user
        ? `${member.user.firstName} ${member.user.lastName}`.trim()
        : 'Member';
      await this.notificationsService.createForRole({
        role: UserRole.ADMIN,
        title: 'New workout plan',
        message: `Workout plan "${workoutPlan.name}" created for ${fullName}.`,
        type: 'info',
        actionUrl: '/admin/workout-plans',
      });
      if (member.userId) {
        await this.notificationsService.createForUser({
          userId: member.userId,
          title: 'New workout plan assigned',
          message: `Your workout plan "${workoutPlan.name}" is ready.`,
          type: 'success',
          actionUrl: '/member/workouts',
        });
      }
    }

    return this.toResponseDto(workoutPlan);
  }

  async findAll(
    filters?: WorkoutPlanFiltersDto,
  ): Promise<PaginatedResponseDto<WorkoutPlanResponseDto>> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const skip = (page - 1) * limit;

    // Build where clause based on filters
    const where: Prisma.WorkoutPlanWhereInput = {};

    if (filters?.memberId) {
      where.memberId = filters.memberId;
    }

    if (filters?.trainerId) {
      where.trainerId = filters.trainerId;
    }

    if (filters?.goal) {
      where.goal = filters.goal;
    }

    // Get total count
    const total = await this.prisma.workoutPlan.count({ where });

    // Get paginated workout plans
    const workoutPlans = await this.prisma.workoutPlan.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
      include: {
        member: {
          include: {
            user: true,
          },
        },
      },
    });

    const planDtos = workoutPlans.map((plan) => this.toResponseDto(plan));

    return new PaginatedResponseDto(planDtos, page, limit, total);
  }

  async findOne(id: string): Promise<WorkoutPlanResponseDto> {
    const workoutPlan = await this.prisma.workoutPlan.findUnique({
      where: { id },
      include: {
        member: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!workoutPlan) {
      throw new NotFoundException(`Workout plan with ID ${id} not found`);
    }

    return this.toResponseDto(workoutPlan);
  }

  async findByMember(
    memberId: string,
    currentUser?: any,
  ): Promise<WorkoutPlanResponseDto[]> {
    // Verify member exists - only select id field
    const member = await this.prisma.member.findUnique({
      where: { id: memberId },
      select: { id: true, userId: true },
    });

    if (!member) {
      throw new NotFoundException(`Member with ID ${memberId} not found`);
    }

    // Authorization check - Members can only access their own workout plans
    if (
      currentUser?.role === UserRole.MEMBER &&
      member.userId !== currentUser.userId
    ) {
      throw new ForbiddenException(
        'You can only access your own workout plans',
      );
    }

    const workoutPlans = await this.prisma.workoutPlan.findMany({
      where: { memberId },
      include: {
        member: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return workoutPlans.map((plan) => this.toResponseDto(plan));
  }

  async update(
    id: string,
    updateWorkoutPlanDto: UpdateWorkoutPlanDto,
  ): Promise<WorkoutPlanResponseDto> {
    // Check if workout plan exists
    const existingPlan = await this.prisma.workoutPlan.findUnique({
      where: { id },
    });

    if (!existingPlan) {
      throw new NotFoundException(`Workout plan with ID ${id} not found`);
    }

    // Validate exercise order if exercises are provided
    if (updateWorkoutPlanDto.exercises) {
      this.validateExerciseOrder(updateWorkoutPlanDto.exercises);
    }

    // Use transaction for update with exercises deletion and creation
    // Note: Versioning disabled as table missing
    // Note: Exercises treated as JSON string

    const updateData: Prisma.WorkoutPlanUpdateInput = {
      name: updateWorkoutPlanDto.name,
      description: updateWorkoutPlanDto.description,
      goal: updateWorkoutPlanDto.goal,
    };

    if (updateWorkoutPlanDto.exercises) {
      updateData.exercises = JSON.stringify(updateWorkoutPlanDto.exercises);
    }

    const updatedPlan = await this.prisma.workoutPlan.update({
      where: { id },
      data: updateData,
      include: {
        member: {
          include: {
            user: true,
          },
        },
      },
    });

    return this.toResponseDto(updatedPlan);
  }

  async deactivate(id: string): Promise<void> {
    // Check if workout plan exists - only select id field
    const existingPlan = await this.prisma.workoutPlan.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existingPlan) {
      throw new NotFoundException(`Workout plan with ID ${id} not found`);
    }

    // Soft delete by setting isActive to false
    await this.prisma.workoutPlan.update({
      where: { id },
      data: {
        isActive: false,
      },
    });
  }

  async getVersionHistory(
    _workoutPlanId: string,
  ): Promise<WorkoutPlanVersionResponseDto[]> {
    return []; // Not implemented as table missing
  }

  async getVersion(
    _workoutPlanId: string,
    _version: number,
  ): Promise<WorkoutPlanVersionResponseDto> {
    throw new NotFoundException('Version history not enabled');
  }

  // private async storeVersion(_workoutPlan: any): Promise<void> {
  //   // Disabled
  // }

  private toResponseDto(workoutPlan: any): WorkoutPlanResponseDto {
    let exercises = [];
    if (typeof workoutPlan.exercises === 'string') {
      try {
        exercises = JSON.parse(workoutPlan.exercises);
      } catch {
        exercises = [];
      }
    } else {
      exercises = workoutPlan.exercises || [];
    }

    return {
      id: workoutPlan.id,
      name: workoutPlan.name,
      description: workoutPlan.description,
      memberId: workoutPlan.memberId,
      trainerId: workoutPlan.trainerId,
      goal: workoutPlan.goal as any, // Cast to match DTO enum
      isActive: workoutPlan.isActive,
      createdAt: workoutPlan.createdAt,
      updatedAt: workoutPlan.updatedAt,
      exercises: exercises,
      memberName: workoutPlan.member?.user
        ? `${workoutPlan.member.user.firstName} ${workoutPlan.member.user.lastName}`.trim()
        : 'Unknown Member',
    };
  }

  private validateExerciseOrder(exercises: any[]): void {
    if (!exercises || exercises.length === 0) {
      return;
    }

    // Check for duplicate orders
    const orders = exercises.map((ex) => ex.order);
    const uniqueOrders = new Set(orders);

    if (orders.length !== uniqueOrders.size) {
      throw new BadRequestException(
        'Exercise orders must be unique. Duplicate order values found.',
      );
    }

    // Check that all orders are non-negative
    const hasNegativeOrder = orders.some((order) => order < 0);
    if (hasNegativeOrder) {
      throw new BadRequestException(
        'Exercise orders must be non-negative integers.',
      );
    }
  }
}
