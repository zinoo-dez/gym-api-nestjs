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
} from './dto';

@Injectable()
export class WorkoutPlansService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createWorkoutPlanDto: CreateWorkoutPlanDto,
    userId: string,
  ): Promise<WorkoutPlanResponseDto> {
    // Validate exercise order
    this.validateExerciseOrder(createWorkoutPlanDto.exercises);

    // Verify member exists
    const member = await this.prisma.member.findUnique({
      where: { id: createWorkoutPlanDto.memberId },
    });

    if (!member) {
      throw new NotFoundException(
        `Member with ID ${createWorkoutPlanDto.memberId} not found`,
      );
    }

    // Get trainer from user ID
    const trainer = await this.prisma.trainer.findUnique({
      where: { userId },
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

  async findAll(): Promise<WorkoutPlanResponseDto[]> {
    const workoutPlans = await this.prisma.workoutPlan.findMany({
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
    // Verify member exists
    const member = await this.prisma.member.findUnique({
      where: { id: memberId },
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

    // If exercises are provided, delete old ones and create new ones
    const updateData: any = {
      name: updateWorkoutPlanDto.name,
      description: updateWorkoutPlanDto.description,
      goal: updateWorkoutPlanDto.goal,
    };

    if (updateWorkoutPlanDto.exercises) {
      // Delete existing exercises and create new ones
      await this.prisma.exercise.deleteMany({
        where: { workoutPlanId: id },
      });

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

    const updatedPlan = await this.prisma.workoutPlan.update({
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

    return this.toResponseDto(updatedPlan);
  }

  async deactivate(id: string): Promise<void> {
    // Check if workout plan exists
    const existingPlan = await this.prisma.workoutPlan.findUnique({
      where: { id },
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
    // Check if workout plan exists
    const workoutPlan = await this.prisma.workoutPlan.findUnique({
      where: { id: workoutPlanId },
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
    // Check if workout plan exists
    const workoutPlan = await this.prisma.workoutPlan.findUnique({
      where: { id: workoutPlanId },
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
    // Get the current highest version number
    const latestVersion = await this.prisma.workoutPlanVersion.findFirst({
      where: { workoutPlanId: workoutPlan.id },
      orderBy: { version: 'desc' },
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
