import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
  Inject,
  Logger,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import {
  CreateClassDto,
  UpdateClassDto,
  BookClassDto,
  ClassResponseDto,
  ClassBookingResponseDto,
  ClassFiltersDto,
} from './dto';
import { PaginatedResponseDto } from '../common/dto';
import { Prisma, BookingStatus, UserRole } from '@prisma/client';

@Injectable()
export class ClassesService {
  private readonly logger = new Logger(ClassesService.name);
  private readonly CACHE_TTL = 900000; // 15 minutes in milliseconds
  private readonly CLASSES_CACHE_KEY = 'class_schedules';

  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(
    createClassDto: CreateClassDto,
    currentUser?: any,
  ): Promise<ClassResponseDto> {
    const trainer = await this.prisma.trainer.findUnique({
      where: { id: createClassDto.trainerId },
      select: { id: true, userId: true },
    });

    if (!trainer) {
      throw new NotFoundException(
        `Trainer with ID ${createClassDto.trainerId} not found`,
      );
    }

    if (currentUser?.role === UserRole.TRAINER) {
      const currentTrainer = await this.prisma.trainer.findUnique({
        where: { userId: currentUser.userId },
        select: { id: true },
      });

      if (currentTrainer && currentTrainer.id !== createClassDto.trainerId) {
        throw new ForbiddenException(
          'You can only create classes for yourself',
        );
      }
    }

    const startTime = new Date(createClassDto.schedule);
    const endTime = new Date(
      startTime.getTime() + createClassDto.duration * 60000,
    );

    const hasConflict = await this.hasScheduleConflict(
      createClassDto.trainerId,
      startTime,
      endTime,
    );

    if (hasConflict) {
      throw new ConflictException(
        'Trainer has a scheduling conflict at this time',
      );
    }

    const classSchedule = await this.prisma.$transaction(async (tx) => {
      const newClass = await tx.class.create({
        data: {
          name: createClassDto.name,
          description: createClassDto.description,
          category: createClassDto.classType,
          duration: createClassDto.duration,
          maxCapacity: createClassDto.capacity,
        },
      });

      const occurrences = this.buildOccurrences(
        startTime,
        createClassDto.duration,
        createClassDto.recurrenceRule,
        createClassDto.occurrences,
      );

      const schedules = await Promise.all(
        occurrences.map((occurrence) =>
          tx.classSchedule.create({
            data: {
              classId: newClass.id,
              trainerId: createClassDto.trainerId,
              startTime: occurrence.start,
              endTime: occurrence.end,
              daysOfWeek: JSON.stringify([this.getDayOfWeek(occurrence.start)]),
              isActive: true,
            },
            include: {
              class: true,
              trainer: { include: { user: true } },
              bookings: {
                where: { status: BookingStatus.CONFIRMED },
                select: { id: true },
              },
            },
          }),
        ),
      );

      return schedules[0];
    });

    const settings = await this.prisma.gymSetting.findFirst({
      select: { newSessionNotification: true },
    });
    if (settings?.newSessionNotification !== false) {
      await this.notificationsService.createForRole({
        role: UserRole.ADMIN,
        title: 'New class created',
        message: `Class "${classSchedule.class.name}" was created.`,
        type: 'success',
        actionUrl: '/admin/classes',
      });
    }

    this.invalidateClassesCache();

    return this.toResponseDto(classSchedule);
  }

  private buildOccurrences(
    startTime: Date,
    durationMinutes: number,
    recurrenceRule?: string,
    occurrencesLimit?: number,
  ): Array<{ start: Date; end: Date }> {
    if (!recurrenceRule) {
      return [
        {
          start: startTime,
          end: new Date(startTime.getTime() + durationMinutes * 60000),
        },
      ];
    }

    const rule = this.parseRRule(recurrenceRule);
    if (!rule) {
      throw new BadRequestException('Invalid recurrence rule');
    }

    if (rule.freq !== 'WEEKLY') {
      throw new BadRequestException('Only WEEKLY recurrence is supported');
    }

    const byDays = rule.byDay.length > 0 ? rule.byDay : [this.getDayOfWeek(startTime)];
    const byHour = rule.byHour ?? startTime.getHours();
    const byMinute = rule.byMinute ?? startTime.getMinutes();

    const occurrences: Array<{ start: Date; end: Date }> = [];
    const startDate = new Date(startTime);
    const until = rule.until ?? new Date(startTime.getTime() + 84 * 24 * 60 * 60 * 1000);
    const maxCount = occurrencesLimit ?? rule.count ?? 24;

    const dayMap: Record<string, number> = {
      Sunday: 0,
      Monday: 1,
      Tuesday: 2,
      Wednesday: 3,
      Thursday: 4,
      Friday: 5,
      Saturday: 6,
    };

    const byDayIndexes = byDays.map((day) => dayMap[day]).filter((d) => d !== undefined);
    const cursor = new Date(
      startDate.getFullYear(),
      startDate.getMonth(),
      startDate.getDate(),
      0,
      0,
      0,
      0,
    );

    while (cursor <= until && occurrences.length < maxCount) {
      if (byDayIndexes.includes(cursor.getDay())) {
        const occurrenceStart = new Date(
          cursor.getFullYear(),
          cursor.getMonth(),
          cursor.getDate(),
          byHour,
          byMinute,
          0,
          0,
        );
        if (occurrenceStart >= startTime && occurrenceStart <= until) {
          const occurrenceEnd = new Date(
            occurrenceStart.getTime() + durationMinutes * 60000,
          );
          occurrences.push({ start: occurrenceStart, end: occurrenceEnd });
        }
      }
      cursor.setDate(cursor.getDate() + 1);
    }

    if (occurrences.length === 0) {
      return [
        {
          start: startTime,
          end: new Date(startTime.getTime() + durationMinutes * 60000),
        },
      ];
    }

    return occurrences;
  }

  private parseRRule(rule: string): {
    freq: string;
    byDay: string[];
    byHour?: number;
    byMinute?: number;
    count?: number;
    until?: Date;
  } | null {
    const parts = rule.split(';').reduce<Record<string, string>>((acc, part) => {
      const [key, value] = part.split('=');
      if (key && value) acc[key.trim().toUpperCase()] = value.trim();
      return acc;
    }, {});

    if (!parts.FREQ) return null;

    const byDay = (parts.BYDAY ?? '')
      .split(',')
      .map((day) => day.trim())
      .filter(Boolean)
      .map((day) => this.mapRRuleDay(day));

    const byHour = parts.BYHOUR ? Number(parts.BYHOUR) : undefined;
    const byMinute = parts.BYMINUTE ? Number(parts.BYMINUTE) : undefined;
    const count = parts.COUNT ? Number(parts.COUNT) : undefined;
    const until = parts.UNTIL ? this.parseRRuleDate(parts.UNTIL) : undefined;

    return {
      freq: parts.FREQ,
      byDay: byDay.filter(Boolean),
      byHour: Number.isFinite(byHour) ? byHour : undefined,
      byMinute: Number.isFinite(byMinute) ? byMinute : undefined,
      count: Number.isFinite(count) ? count : undefined,
      until,
    };
  }

  private mapRRuleDay(value: string): string {
    const map: Record<string, string> = {
      SU: 'Sunday',
      MO: 'Monday',
      TU: 'Tuesday',
      WE: 'Wednesday',
      TH: 'Thursday',
      FR: 'Friday',
      SA: 'Saturday',
    };
    return map[value] ?? value;
  }

  private parseRRuleDate(value: string): Date | undefined {
    // Supports YYYYMMDD or YYYYMMDDTHHMMSSZ
    if (/^\d{8}T\d{6}Z$/.test(value)) {
      const year = Number(value.slice(0, 4));
      const month = Number(value.slice(4, 6)) - 1;
      const day = Number(value.slice(6, 8));
      const hour = Number(value.slice(9, 11));
      const minute = Number(value.slice(11, 13));
      const second = Number(value.slice(13, 15));
      return new Date(Date.UTC(year, month, day, hour, minute, second));
    }
    if (/^\d{8}$/.test(value)) {
      const year = Number(value.slice(0, 4));
      const month = Number(value.slice(4, 6)) - 1;
      const day = Number(value.slice(6, 8));
      return new Date(year, month, day);
    }
    return undefined;
  }

  async findAll(
    filters?: ClassFiltersDto,
  ): Promise<PaginatedResponseDto<ClassResponseDto>> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const skip = filters?.skip || 0;

    const where: Prisma.ClassScheduleWhereInput = {
      isActive: true,
    };

    if (filters?.startDate || filters?.endDate) {
      where.startTime = {};
      if (filters.startDate) {
        where.startTime.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.startTime.lte = new Date(filters.endDate);
      }
    }

    if (filters?.trainerId) {
      where.trainerId = filters.trainerId;
    }

    if (filters?.classType) {
      where.class = {
        category: {
          contains: filters.classType,
          mode: 'insensitive',
        },
      };
    }

    const cacheKey = `${this.CLASSES_CACHE_KEY}:${JSON.stringify({ where, page, limit, skip })}`;

    const cachedResult =
      await this.cacheManager.get<PaginatedResponseDto<ClassResponseDto>>(
        cacheKey,
      );

    if (cachedResult) {
      this.logger.debug(`Cache hit for class schedules: ${cacheKey}`);
      return cachedResult;
    }

    this.logger.debug(`Cache miss for class schedules: ${cacheKey}`);

    const total = await this.prisma.classSchedule.count({ where });

    const classSchedules = await this.prisma.classSchedule.findMany({
      where,
      include: {
        class: true,
        trainer: { include: { user: true } },
        bookings: {
          where: { status: BookingStatus.CONFIRMED },
          select: { id: true },
        },
      },
      orderBy: {
        startTime: 'asc',
      },
      skip,
      take: limit,
    });

    const classDtos = classSchedules.map((schedule) =>
      this.toResponseDto(schedule),
    );

    const result = new PaginatedResponseDto(classDtos, page, limit, total);

    await this.cacheManager.set(cacheKey, result, this.CACHE_TTL);

    return result;
  }

  async findOne(id: string): Promise<ClassResponseDto> {
    const cacheKey = `${this.CLASSES_CACHE_KEY}:${id}`;

    const cachedClass = await this.cacheManager.get<ClassResponseDto>(cacheKey);

    if (cachedClass) {
      this.logger.debug(`Cache hit for class: ${id}`);
      return cachedClass;
    }

    this.logger.debug(`Cache miss for class: ${id}`);

    const classSchedule = await this.prisma.classSchedule.findUnique({
      where: { id },
      include: {
        class: true,
        trainer: { include: { user: true } },
        bookings: {
          where: { status: BookingStatus.CONFIRMED },
          select: { id: true },
        },
      },
    });

    if (!classSchedule) {
      throw new NotFoundException(`Class schedule with ID ${id} not found`);
    }

    const classDto = this.toResponseDto(classSchedule);

    await this.cacheManager.set(cacheKey, classDto, this.CACHE_TTL);

    return classDto;
  }

  async update(
    id: string,
    updateClassDto: UpdateClassDto,
    currentUser?: any,
  ): Promise<ClassResponseDto> {
    const existingSchedule = await this.prisma.classSchedule.findUnique({
      where: { id },
      include: {
        class: true,
        trainer: { select: { userId: true } },
      },
    });

    if (!existingSchedule) {
      throw new NotFoundException(`Class schedule with ID ${id} not found`);
    }

    if (
      currentUser?.role === UserRole.TRAINER &&
      existingSchedule.trainer.userId !== currentUser.userId
    ) {
      throw new ForbiddenException('You can only update your own classes');
    }

    if (updateClassDto.trainerId) {
      const trainer = await this.prisma.trainer.findUnique({
        where: { id: updateClassDto.trainerId },
        select: { id: true, userId: true },
      });

      if (!trainer) {
        throw new NotFoundException(
          `Trainer with ID ${updateClassDto.trainerId} not found`,
        );
      }

      if (
        currentUser?.role === UserRole.TRAINER &&
        trainer.userId !== currentUser.userId
      ) {
        throw new ForbiddenException('You can only assign classes to yourself');
      }
    }

    const updatedDuration =
      updateClassDto.duration ?? existingSchedule.class.duration;
    const updatedStartTime = updateClassDto.schedule
      ? new Date(updateClassDto.schedule)
      : existingSchedule.startTime;
    const updatedEndTime = new Date(
      updatedStartTime.getTime() + updatedDuration * 60000,
    );
    const updatedTrainerId =
      updateClassDto.trainerId ?? existingSchedule.trainerId;

    if (
      updateClassDto.schedule ||
      updateClassDto.duration ||
      updateClassDto.trainerId
    ) {
      const hasConflict = await this.hasScheduleConflict(
        updatedTrainerId,
        updatedStartTime,
        updatedEndTime,
        id,
      );

      if (hasConflict) {
        throw new ConflictException(
          'Trainer has a scheduling conflict at this time',
        );
      }
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.class.update({
        where: { id: existingSchedule.classId },
        data: {
          name: updateClassDto.name,
          description: updateClassDto.description,
          category: updateClassDto.classType,
          duration: updateClassDto.duration,
          maxCapacity: updateClassDto.capacity,
        },
      });

      await tx.classSchedule.update({
        where: { id },
        data: {
          trainerId: updateClassDto.trainerId,
          startTime: updateClassDto.schedule ? updatedStartTime : undefined,
          endTime:
            updateClassDto.schedule || updateClassDto.duration
              ? updatedEndTime
              : undefined,
          daysOfWeek: updateClassDto.schedule
            ? JSON.stringify([this.getDayOfWeek(updatedStartTime)])
            : undefined,
        },
      });
    });

    const updatedSchedule = await this.prisma.classSchedule.findUnique({
      where: { id },
      include: {
        class: true,
        trainer: { include: { user: true } },
        bookings: {
          where: { status: BookingStatus.CONFIRMED },
          select: { id: true },
        },
      },
    });

    if (!updatedSchedule) {
      throw new NotFoundException(`Class schedule with ID ${id} not found`);
    }

    this.invalidateClassesCache();

    return this.toResponseDto(updatedSchedule);
  }

  async deactivate(id: string): Promise<void> {
    const existingSchedule = await this.prisma.classSchedule.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existingSchedule) {
      throw new NotFoundException(`Class schedule with ID ${id} not found`);
    }

    await this.prisma.classSchedule.update({
      where: { id },
      data: {
        isActive: false,
      },
    });

    this.invalidateClassesCache();
  }

  async bookClass(
    bookDto: BookClassDto,
    currentUser?: any,
  ): Promise<ClassBookingResponseDto> {
    const member = await this.prisma.member.findUnique({
      where: { id: bookDto.memberId },
      select: { id: true, userId: true, user: { select: { firstName: true, lastName: true } } },
    });

    if (!member) {
      throw new NotFoundException(
        `Member with ID ${bookDto.memberId} not found`,
      );
    }

    if (
      currentUser?.role === UserRole.MEMBER &&
      member.userId !== currentUser.userId
    ) {
      throw new ForbiddenException('You can only book classes for yourself');
    }

    const classSchedule = await this.prisma.classSchedule.findUnique({
      where: { id: bookDto.classScheduleId },
      select: { id: true, isActive: true },
    });

    if (!classSchedule) {
      throw new NotFoundException(
        `Class schedule with ID ${bookDto.classScheduleId} not found`,
      );
    }

    if (!classSchedule.isActive) {
      throw new BadRequestException('Class schedule is not active');
    }

    const existingBooking = await this.prisma.classBooking.findUnique({
      where: {
        memberId_classScheduleId: {
          memberId: bookDto.memberId,
          classScheduleId: bookDto.classScheduleId,
        },
      },
    });

    if (existingBooking && existingBooking.status === BookingStatus.CONFIRMED) {
      throw new ConflictException(
        'Member already has a booking for this class',
      );
    }

    const hasCapacity = await this.hasCapacity(bookDto.classScheduleId);

    if (!hasCapacity) {
      throw new ConflictException('Class is at full capacity');
    }

    let booking;
    if (existingBooking) {
      booking = await this.prisma.classBooking.update({
        where: { id: existingBooking.id },
        data: {
          status: BookingStatus.CONFIRMED,
        },
      });
    } else {
      booking = await this.prisma.classBooking.create({
        data: {
          memberId: bookDto.memberId,
          classScheduleId: bookDto.classScheduleId,
          status: BookingStatus.CONFIRMED,
        },
      });
    }

    this.invalidateClassesCache();

    const settings = await this.prisma.gymSetting.findFirst({
      select: { newSessionNotification: true },
    });
    if (settings?.newSessionNotification !== false) {
      const fullName = member.user
        ? `${member.user.firstName} ${member.user.lastName}`.trim()
        : 'Member';
      await this.notificationsService.createForRole({
        role: UserRole.ADMIN,
        title: 'New class booking',
        message: `${fullName} booked a class session.`,
        type: 'info',
        actionUrl: '/admin/classes',
      });
    }

    return this.toBookingResponseDto(booking);
  }

  async cancelBooking(bookingId: string, currentUser?: any): Promise<void> {
    const booking = await this.prisma.classBooking.findUnique({
      where: { id: bookingId },
      select: { id: true, status: true, member: { select: { userId: true } } },
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${bookingId} not found`);
    }

    if (booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestException('Booking is already cancelled');
    }

    if (
      currentUser?.role === UserRole.MEMBER &&
      booking.member.userId !== currentUser.userId
    ) {
      throw new ForbiddenException('You can only cancel your own bookings');
    }

    await this.prisma.classBooking.update({
      where: { id: bookingId },
      data: {
        status: BookingStatus.CANCELLED,
      },
    });

    this.invalidateClassesCache();
  }

  async hasCapacity(classScheduleId: string): Promise<boolean> {
    const classSchedule = await this.prisma.classSchedule.findUnique({
      where: { id: classScheduleId },
      include: {
        class: { select: { maxCapacity: true } },
        bookings: {
          where: { status: BookingStatus.CONFIRMED },
          select: { id: true },
        },
      },
    });

    if (!classSchedule) {
      return false;
    }

    const confirmedBookings = classSchedule.bookings.length;
    return confirmedBookings < classSchedule.class.maxCapacity;
  }

  async hasScheduleConflict(
    trainerId: string,
    startTime: Date,
    endTime: Date,
    excludeScheduleId?: string,
  ): Promise<boolean> {
    const where: Prisma.ClassScheduleWhereInput = {
      trainerId,
      isActive: true,
      startTime: { lt: endTime },
      endTime: { gt: startTime },
    };

    if (excludeScheduleId) {
      where.id = { not: excludeScheduleId };
    }

    const conflict = await this.prisma.classSchedule.findFirst({
      where,
      select: { id: true },
    });

    return !!conflict;
  }

  /**
   * Invalidate all class schedules cache entries
   */
  private invalidateClassesCache(): void {
    try {
      this.logger.debug(
        'Class schedules cache will expire naturally after 15 minutes',
      );
    } catch (error) {
      this.logger.error(
        'Error invalidating classes cache',
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  private getDayOfWeek(date: Date): string {
    const dayNames = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];

    return dayNames[date.getDay()];
  }

  private toResponseDto(classSchedule: any): ClassResponseDto {
    const confirmedBookings = classSchedule.bookings
      ? classSchedule.bookings.length
      : 0;

    return {
      id: classSchedule.id,
      name: classSchedule.class.name,
      description: classSchedule.class.description,
      trainerId: classSchedule.trainerId,
      trainerName: classSchedule.trainer
        ? `${classSchedule.trainer.user.firstName} ${classSchedule.trainer.user.lastName}`
        : undefined,
      schedule: classSchedule.startTime,
      duration: classSchedule.class.duration,
      capacity: classSchedule.class.maxCapacity,
      classType: classSchedule.class.category,
      isActive: classSchedule.isActive,
      availableSlots: classSchedule.class.maxCapacity - confirmedBookings,
      createdAt: classSchedule.createdAt,
      updatedAt: classSchedule.updatedAt,
    };
  }

  private toBookingResponseDto(booking: any): ClassBookingResponseDto {
    return {
      id: booking.id,
      memberId: booking.memberId,
      classScheduleId: booking.classScheduleId,
      status: booking.status,
      createdAt: booking.bookedAt,
      updatedAt: booking.updatedAt,
    };
  }
}
