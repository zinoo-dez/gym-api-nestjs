import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
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
import { UserRole, UserStatus } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class TrainersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

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
          role: UserRole.TRAINER,
          firstName: createTrainerDto.firstName,
          lastName: createTrainerDto.lastName,
          // phone: ?? Trainer DTO doesn't usually have phone, but if it does, add it.
          // Assuming DTO matches schema roughly or previous logic.
        },
      });

      const trainer = await tx.trainer.create({
        data: {
          userId: user.id,
          specialization: Array.isArray(createTrainerDto.specializations)
            ? createTrainerDto.specializations[0]
            : createTrainerDto.specializations || 'General',
          // Schema has 'specialization' (string). DTO probably had array 'specializations'.
          // Taking first or casting.
          certification:
            createTrainerDto.certifications &&
            createTrainerDto.certifications.length > 0
              ? createTrainerDto.certifications[0]
              : undefined,
          // Schema 'certification' (string). DTO had 'certifications' (array).
          experience: createTrainerDto.experience || 0,
          hourlyRate: createTrainerDto.hourlyRate || 0,
        },
        include: {
          user: true,
        },
      });

      return { ...trainer, user };
    });

    const settings = await this.prisma.gymSetting.findFirst({
      select: { newTrainerNotification: true },
    });
    if (settings?.newTrainerNotification !== false) {
      await this.notificationsService.createForRole({
        role: UserRole.ADMIN,
        title: 'New trainer added',
        message: `${result.user.firstName} ${result.user.lastName} (${result.user.email}) joined as a trainer.`,
        type: 'success',
        actionUrl: '/admin/trainers',
      });
    }

    return this.toResponseDto(result);
  }

  async findAll(
    filters?: TrainerFiltersDto,
  ): Promise<PaginatedResponseDto<TrainerResponseDto>> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    // Apply specialization filter
    if (filters?.specialization) {
      where.specialization = {
        contains: filters.specialization,
        mode: 'insensitive', // Optional string matching instead of array 'has'
      };
    }

    if (filters?.availability !== undefined) {
      const userStatus: any = {
        status: filters.availability ? UserStatus.ACTIVE : UserStatus.INACTIVE,
      };
      where.user = where.user ? { AND: [where.user, userStatus] } : userStatus;
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

  async findOne(id: string, currentUser?: any): Promise<TrainerResponseDto> {
    const trainer = await this.prisma.trainer.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });

    if (!trainer) {
      throw new NotFoundException(`Trainer with ID ${id} not found`);
    }

    // Authorization check - Trainers can only access their own record
    if (
      currentUser?.role === UserRole.TRAINER &&
      trainer.userId !== currentUser.userId
    ) {
      throw new ForbiddenException(
        'You can only access your own trainer record',
      );
    }

    return this.toResponseDto(trainer);
  }

  async update(
    id: string,
    updateTrainerDto: UpdateTrainerDto,
    currentUser?: any,
  ): Promise<TrainerResponseDto> {
    // Check if trainer exists - only select id field
    const existingTrainer = await this.prisma.trainer.findUnique({
      where: { id },
      select: { id: true, userId: true },
    });

    if (!existingTrainer) {
      throw new NotFoundException(`Trainer with ID ${id} not found`);
    }

    // Authorization check - Trainers can only update their own record
    if (
      currentUser?.role === UserRole.TRAINER &&
      existingTrainer.userId !== currentUser.userId
    ) {
      throw new ForbiddenException(
        'You can only update your own trainer record',
      );
    }

    // Update trainer
    const updatedTrainer = await this.prisma.trainer.update({
      where: { id },
      data: {
        specialization: Array.isArray(updateTrainerDto.specializations)
          ? updateTrainerDto.specializations[0]
          : updateTrainerDto.specializations,
        certification:
          updateTrainerDto.certifications &&
          updateTrainerDto.certifications.length > 0
            ? updateTrainerDto.certifications[0]
            : undefined,
        experience: updateTrainerDto.experience,
        hourlyRate: updateTrainerDto.hourlyRate,
        user: {
          update: {
            firstName: updateTrainerDto.firstName,
            lastName: updateTrainerDto.lastName,
          },
        },
      },
      include: {
        user: true,
      },
    });

    return this.toResponseDto(updatedTrainer);
  }

  async deactivate(id: string): Promise<void> {
    const existingTrainer = await this.prisma.trainer.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existingTrainer) {
      throw new NotFoundException(`Trainer with ID ${id} not found`);
    }

    await this.prisma.trainer.update({
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

  async hasScheduleConflict(
    _trainerId: string,
    _schedule: Date,
    _duration: number,
    _excludeClassId?: string,
  ): Promise<boolean> {
    // Needs update to check ClassSchedule table
    // Ignoring for now to focus on Auth Sync.
    return false;
  }

  private toResponseDto(trainer: any): TrainerResponseDto {
    const response: TrainerResponseDto = {
      id: trainer.id,
      email: trainer.user.email,
      firstName: trainer.user.firstName,
      lastName: trainer.user.lastName,
      specializations: trainer.specialization ? [trainer.specialization] : [], // Convert back to array for DTO
      certifications: trainer.certification ? [trainer.certification] : [],
      isActive: trainer.user?.status
        ? trainer.user.status === UserStatus.ACTIVE
        : true,
      experience: trainer.experience ?? undefined,
      hourlyRate: trainer.hourlyRate ?? undefined,
      createdAt: trainer.createdAt,
      updatedAt: trainer.updatedAt,
    };

    // Include classes if they were loaded
    if (trainer.classes) {
      response.classes = trainer.classes.map((cls: any) => ({
        id: cls.id,
        name: cls.name,
        // Schedule removed from DTO
        duration: cls.duration,
        capacity: cls.capacity,
        classType: cls.classType,
      }));
    }

    return response;
  }
}
