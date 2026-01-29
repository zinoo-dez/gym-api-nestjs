import {
  Injectable,
  NotFoundException,
  BadRequestException,
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
import { Prisma } from '@prisma/client';

@Injectable()
export class WorkoutPlansService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createWorkoutPlanDto: CreateWorkoutPlanDto,
    userId: string,
  ): Promise<WorkoutPlanResponseDto> {
    // Validate exercise order
    this.validateExerciseOrder(createWorkoutPlanDto.exercises);

    // Verify member exists - only select id field
    const member = await this.prisma.member.findUnique({
      where: { id: createWorkoutPlanDto.memberId },
      select: { id: true },
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
        exercises: {
          create: createWorkoutPlanDto.exercises.map((exercise) => ({
            name: exercise.name,
            description: exercise.description,
            sets: exercise.sets,
            reps: exercise.reps,
            duration: exercise.duration,
            targetMuscles: exercise.targetMuscles,
            order: exercise.order,
          })),
        },
      },
      include: {
        exercises: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    return this.toResponseDto(workoutPlan);
  }

  async findAll(
    filters?: WorkoutPlanFiltersDto,
  ): Promise<PaginatedResponseDto<WorkoutPlanResponseDto>> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const skip = filters?.skip || 0;

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
      include: {
        exercises: {
          orderBy: {
            order: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    });

    const planDtos = workoutPlans.map((plan) => this.toResponseDto(plan));

    return new PaginatedResponseDto(planDtos, page, limit, total);
  }

  async findOne(id: string): Promise<WorkoutPlanResponseDto> {
    const workoutPlan = await this.prisma.workoutPlan.findUnique({
      where: { id },
      include: {
        exercises: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    if (!workoutPlan) {
      throw new NotFoundException(`Workout plan with ID ${id} not found`);
    }

    return this.toResponseDto(workoutPlan);
  }

  async findByMember(memberId: string): Promise<WorkoutPlanResponseDto[]> {
    // Verify member exists - only select id field
    const member = await this.prisma.member.findUnique({
      where: { id: memberId },
      select: { id: true },
    });

    if (!member) {
      throw new NotFoundException(`Member with ID ${memberId} not found`);
    }

    const workoutPlans = await this.prisma.workoutPlan.findMany({
      where: { memberId },
      include: {
        exercises: {
          orderBy: {
            order: 'asc',
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
      include: {
        exercises: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    if (!existingPlan) {
      throw new NotFoundException(`Workout plan with ID ${id} not found`);
    }

    // Validate exercise order if exercises are provided
    if (updateWorkoutPlanDto.exercises) {
      this.validateExerciseOrder(updateWorkoutPlanDto.exercises);
    }

    // Store current version before updating
    await this.storeVersion(existingPlan);

    // Use transaction for update with exercises deletion and creation
    const updatedPlan = await this.prisma.$transaction(async (tx) => {
      // If exercises are provided, delete old ones first
      if (updateWorkoutPlanDto.exercises) {
        await tx.exercise.deleteMany({
          where: { workoutPlanId: id },
        });
      }

      // Update the workout plan
      const updateData: any = {
        name: updateWorkoutPlanDto.name,
        description: updateWorkoutPlanDto.description,
        goal: updateWorkoutPlanDto.goal,
      };

      if (updateWorkoutPlanDto.exercises) {
        updateData.exercises = {
          create: updateWorkoutPlanDto.exercises.map((exercise) => ({
            name: exercise.name,
            description: exercise.description,
            sets: exercise.sets,
            reps: exercise.reps,
            duration: exercise.duration,
            targetMuscles: exercise.targetMuscles,
            order: exercise.order,
          })),
        };
      }

      return await tx.workoutPlan.update({
        where: { id },
        data: updateData,
        include: {
          exercises: {
            orderBy: {
              order: 'asc',
            },
          },
        },
      });
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
    workoutPlanId: string,
  ): Promise<WorkoutPlanVersionResponseDto[]> {
    // Check if workout plan exists - only select id field
    const workoutPlan = await this.prisma.workoutPlan.findUnique({
      where: { id: workoutPlanId },
      select: { id: true },
    });

    if (!workoutPlan) {
      throw new NotFoundException(
        `Workout plan with ID ${workoutPlanId} not found`,
      );
    }

    // Get all versions ordered by version number descending
    const versions = await this.prisma.workoutPlanVersion.findMany({
      where: { workoutPlanId },
      orderBy: {
        version: 'desc',
      },
    });

    return versions.map((version) => ({
      id: version.id,
      workoutPlanId: version.workoutPlanId,
      version: version.version,
      name: version.name,
      description: version.description ?? undefined,
      goal: version.goal,
      exercises: version.exercises as any[],
      createdAt: version.createdAt,
    }));
  }

  async getVersion(
    workoutPlanId: string,
    version: number,
  ): Promise<WorkoutPlanVersionResponseDto> {
    // Check if workout plan exists - only select id field
    const workoutPlan = await this.prisma.workoutPlan.findUnique({
      where: { id: workoutPlanId },
      select: { id: true },
    });

    if (!workoutPlan) {
      throw new NotFoundException(
        `Workout plan with ID ${workoutPlanId} not found`,
      );
    }

    // Get specific version
    const versionRecord = await this.prisma.workoutPlanVersion.findUnique({
      where: {
        workoutPlanId_version: {
          workoutPlanId,
          version,
        },
      },
    });

    if (!versionRecord) {
      throw new NotFoundException(
        `Version ${version} not found for workout plan ${workoutPlanId}`,
      );
    }

    return {
      id: versionRecord.id,
      workoutPlanId: versionRecord.workoutPlanId,
      version: versionRecord.version,
      name: versionRecord.name,
      description: versionRecord.description ?? undefined,
      goal: versionRecord.goal,
      exercises: versionRecord.exercises as any[],
      createdAt: versionRecord.createdAt,
    };
  }

  private async storeVersion(workoutPlan: any): Promise<void> {
    // Get the current highest version number - only select version field
    const latestVersion = await this.prisma.workoutPlanVersion.findFirst({
      where: { workoutPlanId: workoutPlan.id },
      orderBy: { version: 'desc' },
      select: { version: true },
    });

    const nextVersion = latestVersion ? latestVersion.version + 1 : 1;

    // Store the current state as a version
    await this.prisma.workoutPlanVersion.create({
      data: {
        workoutPlanId: workoutPlan.id,
        version: nextVersion,
        name: workoutPlan.name,
        description: workoutPlan.description,
        goal: workoutPlan.goal,
        exercises: workoutPlan.exercises.map((exercise: any) => ({
          id: exercise.id,
          name: exercise.name,
          description: exercise.description,
          sets: exercise.sets,
          reps: exercise.reps,
          duration: exercise.duration,
          targetMuscles: exercise.targetMuscles,
          order: exercise.order,
        })),
      },
    });
  }

  private toResponseDto(workoutPlan: any): WorkoutPlanResponseDto {
    return {
      id: workoutPlan.id,
      name: workoutPlan.name,
      description: workoutPlan.description,
      memberId: workoutPlan.memberId,
      trainerId: workoutPlan.trainerId,
      goal: workoutPlan.goal,
      isActive: workoutPlan.isActive,
      createdAt: workoutPlan.createdAt,
      updatedAt: workoutPlan.updatedAt,
      exercises: workoutPlan.exercises?.map((exercise: any) => ({
        id: exercise.id,
        name: exercise.name,
        description: exercise.description,
        sets: exercise.sets,
        reps: exercise.reps,
        duration: exercise.duration,
        targetMuscles: exercise.targetMuscles,
        order: exercise.order,
        createdAt: exercise.createdAt,
        updatedAt: exercise.updatedAt,
      })),
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
