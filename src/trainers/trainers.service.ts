import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateTrainerDto,
  UpdateTrainerDto,
  TrainerResponseDto,
  TrainerFiltersDto,
} from './dto';
import { PaginatedResponseDto } from '../common/dto';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';

@Injectable()
export class TrainersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createTrainerDto: CreateTrainerDto,
  ): Promise<TrainerResponseDto> {
    // Check if user with email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createTrainerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createTrainerDto.password, 10);

    // Create user and trainer in a transaction
    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: createTrainerDto.email,
          password: hashedPassword,
          role: Role.TRAINER,
        },
      });

      const trainer = await tx.trainer.create({
        data: {
          userId: user.id,
          firstName: createTrainerDto.firstName,
          lastName: createTrainerDto.lastName,
          specializations: createTrainerDto.specializations,
          certifications: createTrainerDto.certifications || [],
        },
        include: {
          user: true,
        },
      });

      return trainer;
    });

    return this.toResponseDto(result);
  }

  async findAll(
    filters?: TrainerFiltersDto,
  ): Promise<PaginatedResponseDto<TrainerResponseDto>> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const skip = filters?.skip || 0;

    const where: any = {};

    // Apply specialization filter
    if (filters?.specialization) {
      where.specializations = {
        has: filters.specialization,
      };
    }

    // Apply availability filter (active trainers)
    if (filters?.availability !== undefined) {
      where.isActive = filters.availability;
    }

    // Get total count
    const total = await this.prisma.trainer.count({ where });

    // Get paginated trainers
    const trainers = await this.prisma.trainer.findMany({
      where,
      include: {
        user: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    });

    const trainerDtos = trainers.map((trainer) => this.toResponseDto(trainer));

    return new PaginatedResponseDto(trainerDtos, page, limit, total);
  }

  async findOne(id: string): Promise<TrainerResponseDto> {
    const trainer = await this.prisma.trainer.findUnique({
      where: { id },
      include: {
        user: true,
        classes: {
          where: {
            isActive: true,
          },
          orderBy: {
            schedule: 'asc',
          },
        },
      },
    });

    if (!trainer) {
      throw new NotFoundException(`Trainer with ID ${id} not found`);
    }

    return this.toResponseDto(trainer);
  }

  async update(
    id: string,
    updateTrainerDto: UpdateTrainerDto,
  ): Promise<TrainerResponseDto> {
    // Check if trainer exists
    const existingTrainer = await this.prisma.trainer.findUnique({
      where: { id },
    });

    if (!existingTrainer) {
      throw new NotFoundException(`Trainer with ID ${id} not found`);
    }

    // Update trainer
    const updatedTrainer = await this.prisma.trainer.update({
      where: { id },
      data: {
        firstName: updateTrainerDto.firstName,
        lastName: updateTrainerDto.lastName,
        specializations: updateTrainerDto.specializations,
        certifications: updateTrainerDto.certifications,
      },
      include: {
        user: true,
      },
    });

    return this.toResponseDto(updatedTrainer);
  }

  async deactivate(id: string): Promise<void> {
    // Check if trainer exists
    const existingTrainer = await this.prisma.trainer.findUnique({
      where: { id },
    });

    if (!existingTrainer) {
      throw new NotFoundException(`Trainer with ID ${id} not found`);
    }

    // Soft delete by setting isActive to false
    await this.prisma.trainer.update({
      where: { id },
      data: {
        isActive: false,
      },
    });
  }

  /**
   * Check if a trainer has a schedule conflict with an existing class
   * @param trainerId - The trainer's ID
   * @param schedule - The proposed class start time
   * @param duration - The proposed class duration in minutes
   * @param excludeClassId - Optional class ID to exclude from conflict check (for updates)
   * @returns true if there is a conflict, false otherwise
   */
  async hasScheduleConflict(
    trainerId: string,
    schedule: Date,
    duration: number,
    excludeClassId?: string,
  ): Promise<boolean> {
    // Calculate the end time of the proposed class
    const proposedEndTime = new Date(schedule.getTime() + duration * 60000);

    // Build the where clause
    const where: any = {
      trainerId,
      isActive: true,
      schedule: {
        lt: proposedEndTime, // Class starts before proposed class ends
      },
    };

    // Exclude a specific class if provided (for update operations)
    if (excludeClassId) {
      where.id = {
        not: excludeClassId,
      };
    }

    // Find all active classes for this trainer that might overlap
    const existingClasses = await this.prisma.class.findMany({
      where,
      select: {
        id: true,
        schedule: true,
        duration: true,
      },
    });

    // Check each existing class for overlap
    for (const existingClass of existingClasses) {
      const existingEndTime = new Date(
        existingClass.schedule.getTime() + existingClass.duration * 60000,
      );

      // Check if the time ranges overlap
      // Two time ranges overlap if:
      // - Proposed class starts before existing class ends AND
      // - Existing class starts before proposed class ends
      if (
        schedule < existingEndTime &&
        existingClass.schedule < proposedEndTime
      ) {
        return true; // Conflict found
      }
    }

    return false; // No conflict
  }

  private toResponseDto(trainer: any): TrainerResponseDto {
    const response: TrainerResponseDto = {
      id: trainer.id,
      email: trainer.user.email,
      firstName: trainer.firstName,
      lastName: trainer.lastName,
      specializations: trainer.specializations,
      certifications: trainer.certifications,
      isActive: trainer.isActive,
      createdAt: trainer.createdAt,
      updatedAt: trainer.updatedAt,
    };

    // Include classes if they were loaded
    if (trainer.classes) {
      response.classes = trainer.classes.map((cls: any) => ({
        id: cls.id,
        name: cls.name,
        schedule: cls.schedule,
        duration: cls.duration,
        capacity: cls.capacity,
        classType: cls.classType,
      }));
    }

    return response;
  }
}
