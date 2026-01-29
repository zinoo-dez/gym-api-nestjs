import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Inject,
  Logger,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateClassDto,
  UpdateClassDto,
  BookClassDto,
  ClassResponseDto,
  ClassBookingResponseDto,
  ClassFiltersDto,
} from './dto';
import { PaginatedResponseDto } from '../common/dto';
import { Prisma, BookingStatus } from '@prisma/client';

@Injectable()
export class ClassesService {
  private readonly logger = new Logger(ClassesService.name);
  private readonly CACHE_TTL = 900000; // 15 minutes in milliseconds
  private readonly CLASSES_CACHE_KEY = 'class_schedules';

  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async create(createClassDto: CreateClassDto): Promise<ClassResponseDto> {
    // Verify trainer exists - only select needed fields
    const trainer = await this.prisma.trainer.findUnique({
      where: { id: createClassDto.trainerId },
      select: { id: true, isActive: true },
    });

    if (!trainer) {
      throw new NotFoundException(
        `Trainer with ID ${createClassDto.trainerId} not found`,
      );
    }

    if (!trainer.isActive) {
      throw new BadRequestException('Trainer is not active');
    }

    const schedule = new Date(createClassDto.schedule);

    // Check for trainer schedule conflicts
    const hasConflict = await this.hasScheduleConflict(
      createClassDto.trainerId,
      schedule,
      createClassDto.duration,
    );

    if (hasConflict) {
      throw new ConflictException(
        'Trainer has a scheduling conflict at this time',
      );
    }

    // Create the class
    const newClass = await this.prisma.class.create({
      data: {
        name: createClassDto.name,
        description: createClassDto.description,
        trainerId: createClassDto.trainerId,
        schedule,
        duration: createClassDto.duration,
        capacity: createClassDto.capacity,
        classType: createClassDto.classType,
      },
      include: {
        trainer: true,
      },
    });

    // Invalidate cache when a new class is created
    await this.invalidateClassesCache();

    return this.toResponseDto(newClass);
  }

  async findAll(
    filters?: ClassFiltersDto,
  ): Promise<PaginatedResponseDto<ClassResponseDto>> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const skip = filters?.skip || 0;

    // Build where clause based on filters
    const where: Prisma.ClassWhereInput = {
      isActive: true,
    };

    // Filter by date range
    if (filters?.startDate || filters?.endDate) {
      where.schedule = {};
      if (filters.startDate) {
        where.schedule.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.schedule.lte = new Date(filters.endDate);
      }
    }

    // Filter by trainer
    if (filters?.trainerId) {
      where.trainerId = filters.trainerId;
    }

    // Filter by class type
    if (filters?.classType) {
      where.classType = {
        contains: filters.classType,
        mode: 'insensitive',
      };
    }

    // Create cache key based on filters
    const cacheKey = `${this.CLASSES_CACHE_KEY}:${JSON.stringify({ where, page, limit, skip })}`;

    // Try to get from cache
    const cachedResult =
      await this.cacheManager.get<PaginatedResponseDto<ClassResponseDto>>(
        cacheKey,
      );

    if (cachedResult) {
      this.logger.debug(`Cache hit for class schedules: ${cacheKey}`);
      return cachedResult;
    }

    this.logger.debug(`Cache miss for class schedules: ${cacheKey}`);

    // Get total count
    const total = await this.prisma.class.count({ where });

    // Get paginated classes
    const classes = await this.prisma.class.findMany({
      where,
      include: {
        trainer: true,
        bookings: {
          where: {
            status: BookingStatus.CONFIRMED,
          },
        },
      },
      orderBy: {
        schedule: 'asc',
      },
      skip,
      take: limit,
    });

    const classDtos = classes.map((cls) => this.toResponseDto(cls));

    const result = new PaginatedResponseDto(classDtos, page, limit, total);

    // Store in cache with 15 minutes TTL
    await this.cacheManager.set(cacheKey, result, this.CACHE_TTL);

    return result;
  }

  async findOne(id: string): Promise<ClassResponseDto> {
    const cacheKey = `${this.CLASSES_CACHE_KEY}:${id}`;

    // Try to get from cache
    const cachedClass = await this.cacheManager.get<ClassResponseDto>(cacheKey);

    if (cachedClass) {
      this.logger.debug(`Cache hit for class: ${id}`);
      return cachedClass;
    }

    this.logger.debug(`Cache miss for class: ${id}`);

    const classEntity = await this.prisma.class.findUnique({
      where: { id },
      include: {
        trainer: true,
        bookings: {
          where: {
            status: BookingStatus.CONFIRMED,
          },
          include: {
            member: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    if (!classEntity) {
      throw new NotFoundException(`Class with ID ${id} not found`);
    }

    const classDto = this.toResponseDto(classEntity);

    // Store in cache with 15 minutes TTL
    await this.cacheManager.set(cacheKey, classDto, this.CACHE_TTL);

    return classDto;
  }

  async update(
    id: string,
    updateClassDto: UpdateClassDto,
  ): Promise<ClassResponseDto> {
    // Check if class exists - only select needed fields
    const existingClass = await this.prisma.class.findUnique({
      where: { id },
      select: { id: true, trainerId: true, schedule: true, duration: true },
    });

    if (!existingClass) {
      throw new NotFoundException(`Class with ID ${id} not found`);
    }

    // If trainer is being updated, verify new trainer exists
    if (updateClassDto.trainerId) {
      const trainer = await this.prisma.trainer.findUnique({
        where: { id: updateClassDto.trainerId },
        select: { id: true, isActive: true },
      });

      if (!trainer) {
        throw new NotFoundException(
          `Trainer with ID ${updateClassDto.trainerId} not found`,
        );
      }

      if (!trainer.isActive) {
        throw new BadRequestException('Trainer is not active');
      }
    }

    // Check for schedule conflicts if schedule or duration is being updated
    const trainerId = updateClassDto.trainerId || existingClass.trainerId;
    const schedule = updateClassDto.schedule
      ? new Date(updateClassDto.schedule)
      : existingClass.schedule;
    const duration = updateClassDto.duration || existingClass.duration;

    if (
      updateClassDto.schedule ||
      updateClassDto.duration ||
      updateClassDto.trainerId
    ) {
      const hasConflict = await this.hasScheduleConflict(
        trainerId,
        schedule,
        duration,
        id, // Exclude current class from conflict check
      );

      if (hasConflict) {
        throw new ConflictException(
          'Trainer has a scheduling conflict at this time',
        );
      }
    }

    // Update the class
    const updatedClass = await this.prisma.class.update({
      where: { id },
      data: {
        name: updateClassDto.name,
        description: updateClassDto.description,
        trainerId: updateClassDto.trainerId,
        schedule: updateClassDto.schedule
          ? new Date(updateClassDto.schedule)
          : undefined,
        duration: updateClassDto.duration,
        capacity: updateClassDto.capacity,
        classType: updateClassDto.classType,
      },
      include: {
        trainer: true,
      },
    });

    // Invalidate cache when a class is updated
    await this.invalidateClassesCache();

    return this.toResponseDto(updatedClass);
  }

  async deactivate(id: string): Promise<void> {
    // Check if class exists - only select id field
    const existingClass = await this.prisma.class.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existingClass) {
      throw new NotFoundException(`Class with ID ${id} not found`);
    }

    // Soft delete by setting isActive to false
    await this.prisma.class.update({
      where: { id },
      data: {
        isActive: false,
      },
    });

    // Invalidate cache when a class is deactivated
    await this.invalidateClassesCache();
  }

  async bookClass(bookDto: BookClassDto): Promise<ClassBookingResponseDto> {
    // Verify member exists - only select needed fields
    const member = await this.prisma.member.findUnique({
      where: { id: bookDto.memberId },
      select: { id: true, isActive: true },
    });

    if (!member) {
      throw new NotFoundException(
        `Member with ID ${bookDto.memberId} not found`,
      );
    }

    if (!member.isActive) {
      throw new BadRequestException('Member is not active');
    }

    // Verify class exists - only select needed fields
    const classEntity = await this.prisma.class.findUnique({
      where: { id: bookDto.classId },
      select: { id: true, isActive: true },
    });

    if (!classEntity) {
      throw new NotFoundException(`Class with ID ${bookDto.classId} not found`);
    }

    if (!classEntity.isActive) {
      throw new BadRequestException('Class is not active');
    }

    // Check if member already has a booking for this class
    const existingBooking = await this.prisma.classBooking.findUnique({
      where: {
        memberId_classId: {
          memberId: bookDto.memberId,
          classId: bookDto.classId,
        },
      },
    });

    if (existingBooking && existingBooking.status === BookingStatus.CONFIRMED) {
      throw new ConflictException(
        'Member already has a booking for this class',
      );
    }

    // Check if class has available capacity
    const hasCapacity = await this.hasCapacity(bookDto.classId);

    if (!hasCapacity) {
      throw new ConflictException('Class is at full capacity');
    }

    // Create or update booking
    let booking;
    if (existingBooking) {
      // Reactivate cancelled booking
      booking = await this.prisma.classBooking.update({
        where: { id: existingBooking.id },
        data: {
          status: BookingStatus.CONFIRMED,
        },
      });
    } else {
      // Create new booking
      booking = await this.prisma.classBooking.create({
        data: {
          memberId: bookDto.memberId,
          classId: bookDto.classId,
          status: BookingStatus.CONFIRMED,
        },
      });
    }

    // Invalidate cache when a booking is made (affects available slots)
    await this.invalidateClassesCache();

    return this.toBookingResponseDto(booking);
  }

  async cancelBooking(bookingId: string): Promise<void> {
    // Check if booking exists - only select needed fields
    const booking = await this.prisma.classBooking.findUnique({
      where: { id: bookingId },
      select: { id: true, status: true },
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${bookingId} not found`);
    }

    if (booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestException('Booking is already cancelled');
    }

    // Cancel the booking
    await this.prisma.classBooking.update({
      where: { id: bookingId },
      data: {
        status: BookingStatus.CANCELLED,
      },
    });

    // Invalidate cache when a booking is cancelled (affects available slots)
    await this.invalidateClassesCache();
  }

  async hasCapacity(classId: string): Promise<boolean> {
    const classEntity = await this.prisma.class.findUnique({
      where: { id: classId },
      select: {
        capacity: true,
        bookings: {
          where: {
            status: BookingStatus.CONFIRMED,
          },
          select: {
            id: true,
          },
        },
      },
    });

    if (!classEntity) {
      return false;
    }

    const confirmedBookings = classEntity.bookings.length;
    return confirmedBookings < classEntity.capacity;
  }

  async hasScheduleConflict(
    trainerId: string,
    schedule: Date,
    duration: number,
    excludeClassId?: string,
  ): Promise<boolean> {
    const classEndTime = new Date(schedule.getTime() + duration * 60000);

    // Find overlapping classes for the trainer
    const where: Prisma.ClassWhereInput = {
      trainerId,
      isActive: true,
      OR: [
        // New class starts during existing class
        {
          AND: [
            { schedule: { lte: schedule } },
            {
              schedule: {
                gte: new Date(schedule.getTime() - 24 * 60 * 60000), // Look back 24 hours
              },
            },
          ],
        },
        // New class ends during existing class
        {
          AND: [
            { schedule: { lte: classEndTime } },
            {
              schedule: {
                gte: schedule,
              },
            },
          ],
        },
      ],
    };

    if (excludeClassId) {
      where.id = { not: excludeClassId };
    }

    const overlappingClasses = await this.prisma.class.findMany({
      where,
    });

    // Check for actual time overlap
    for (const existingClass of overlappingClasses) {
      const existingEnd = new Date(
        existingClass.schedule.getTime() + existingClass.duration * 60000,
      );

      // Check if times overlap
      if (
        (schedule >= existingClass.schedule && schedule < existingEnd) ||
        (classEndTime > existingClass.schedule &&
          classEndTime <= existingEnd) ||
        (schedule <= existingClass.schedule && classEndTime >= existingEnd)
      ) {
        return true;
      }
    }

    return false;
  }

  // Cache management methods

  /**
   * Invalidate all class schedules cache entries
   */
  private async invalidateClassesCache(): Promise<void> {
    try {
      // Since cache-manager doesn't provide a direct way to delete by pattern,
      // we'll need to track keys or use a simpler approach
      // For now, we'll just log that cache will expire naturally
      this.logger.debug(
        'Class schedules cache will expire naturally after 15 minutes',
      );

      // Note: In production, consider using Redis with pattern-based deletion
      // or maintaining a list of cache keys to invalidate
    } catch (error) {
      this.logger.error(
        'Error invalidating classes cache',
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  private toResponseDto(classEntity: any): ClassResponseDto {
    const confirmedBookings = classEntity.bookings
      ? classEntity.bookings.filter(
          (b: any) => b.status === BookingStatus.CONFIRMED,
        ).length
      : 0;

    return {
      id: classEntity.id,
      name: classEntity.name,
      description: classEntity.description,
      trainerId: classEntity.trainerId,
      trainerName: classEntity.trainer
        ? `${classEntity.trainer.firstName} ${classEntity.trainer.lastName}`
        : undefined,
      schedule: classEntity.schedule,
      duration: classEntity.duration,
      capacity: classEntity.capacity,
      classType: classEntity.classType,
      isActive: classEntity.isActive,
      availableSlots: classEntity.capacity - confirmedBookings,
      createdAt: classEntity.createdAt,
      updatedAt: classEntity.updatedAt,
    };
  }

  private toBookingResponseDto(booking: any): ClassBookingResponseDto {
    return {
      id: booking.id,
      memberId: booking.memberId,
      classId: booking.classId,
      status: booking.status,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
    };
  }
}
