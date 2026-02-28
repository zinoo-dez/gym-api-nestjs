import {
    Injectable,
    NotFoundException,
    ConflictException,
    BadRequestException,
    ForbiddenException,
    Inject,
    Logger,
} from '@nestjs/common';
import { CurrentUserPayload } from '../common/interfaces/current-user-payload.interface';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
    CreateClassDto,
    UpdateClassDto,
    BookClassDto,
    ClassResponseDto,
    ClassBookingResponseDto,
    ClassFiltersDto,
    ClassWaitlistResponseDto,
    ClassFavoriteResponseDto,
    CreateClassPackageDto,
    ClassPackageResponseDto,
    PurchaseClassPackageDto,
    MemberClassCreditsResponseDto,
    RateInstructorDto,
    InstructorProfileResponseDto,
} from './dto';
import { PaginatedResponseDto } from '../common/dto';
import {
    Prisma,
    BookingStatus,
    UserRole,
    WaitlistStatus,
    ClassPassType,
    PassStatus,
    NotificationType,
    type ClassWaitlist,
    type ClassPackage,
    type ClassSchedule,
    type Class,
    type ClassBooking,
    type Trainer,
    type User,
} from '@prisma/client';

type ClassScheduleWithRelations = ClassSchedule & {
    class: Class;
    trainer: (Trainer & { user: User }) | null;
    bookings?: { id: string }[];
};

@Injectable()
export class ClassesService {
    private readonly logger = new Logger(ClassesService.name);
    private readonly CACHE_TTL = 900000; // 15 minutes in milliseconds
    private readonly CLASSES_CACHE_KEY = 'class_schedules';

    constructor(
        private readonly prisma: PrismaService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        private readonly notificationsService: NotificationsService,
    ) { }

    async create(
        createClassDto: CreateClassDto,
        currentUser?: CurrentUserPayload,
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

        await this.notificationsService.notifyIfEnabled('newSessionNotification', {
            role: UserRole.ADMIN,
            title: 'New class created',
            message: `Class "${classSchedule.class.name}" was created.`,
            type: 'success',
            actionUrl: '/admin/classes',
        });

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

        const byDays =
            rule.byDay.length > 0 ? rule.byDay : [this.getDayOfWeek(startTime)];
        const byHour = rule.byHour ?? startTime.getHours();
        const byMinute = rule.byMinute ?? startTime.getMinutes();

        const occurrences: Array<{ start: Date; end: Date }> = [];
        const startDate = new Date(startTime);
        const until =
            rule.until ?? new Date(startTime.getTime() + 84 * 24 * 60 * 60 * 1000);
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

        const byDayIndexes = byDays
            .map((day) => dayMap[day])
            .filter((d) => d !== undefined);
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
        const parts = rule
            .split(';')
            .reduce<Record<string, string>>((acc, part) => {
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
        currentUser?: CurrentUserPayload,
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
        currentUser?: CurrentUserPayload,
    ): Promise<ClassBookingResponseDto> {
        const member = await this.prisma.member.findUnique({
            where: { id: bookDto.memberId },
            select: {
                id: true,
                userId: true,
                user: { select: { firstName: true, lastName: true } },
            },
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
            const waitlistEntry = await this.joinWaitlist(
                bookDto.classScheduleId,
                bookDto.memberId,
                currentUser,
            );
            throw new ConflictException(
                `Class is at full capacity. Member added to waitlist at position ${waitlistEntry.position}`,
            );
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

        await this.consumeCreditForBooking(booking.id, bookDto.memberId);

        this.invalidateClassesCache();

        const fullName = member.user
            ? `${member.user.firstName} ${member.user.lastName}`.trim()
            : 'Member';
        await this.notificationsService.notifyIfEnabled('newSessionNotification', {
            role: UserRole.ADMIN,
            title: 'New class booking',
            message: `${fullName} booked a class session.`,
            type: 'info',
            actionUrl: '/admin/classes',
        });

        return this.toBookingResponseDto(booking);
    }

    async cancelBooking(bookingId: string, currentUser?: CurrentUserPayload): Promise<void> {
        const booking = await this.prisma.classBooking.findUnique({
            where: { id: bookingId },
            select: {
                id: true,
                status: true,
                classScheduleId: true,
                member: { select: { userId: true } },
            },
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

        const cancelledBooking = await this.prisma.classBooking.update({
            where: { id: bookingId },
            data: {
                status: BookingStatus.CANCELLED,
            },
        });
        await this.refundCreditForBooking(
            cancelledBooking.id,
            cancelledBooking.memberId,
        );

        await this.promoteWaitlist(cancelledBooking.classScheduleId);

        this.invalidateClassesCache();
    }

    async updateBookingStatus(
        bookingId: string,
        status: BookingStatus,
    ): Promise<ClassBookingResponseDto> {
        const booking = await this.prisma.classBooking.findUnique({
            where: { id: bookingId },
            select: {
                id: true,
                memberId: true,
                classScheduleId: true,
                status: true,
            },
        });

        if (!booking) {
            throw new NotFoundException(`Booking with ID ${bookingId} not found`);
        }

        if (status === BookingStatus.WAITLISTED) {
            throw new BadRequestException(
                'WAITLISTED is not a valid direct booking update',
            );
        }

        const updated = await this.prisma.classBooking.update({
            where: { id: bookingId },
            data: { status },
        });

        this.invalidateClassesCache();

        return this.toBookingResponseDto(updated);
    }

    async getMemberBookings(memberId: string, currentUser?: CurrentUserPayload) {
        await this.ensureMemberAccess(memberId, currentUser);
        return this.prisma.classBooking.findMany({
            where: { memberId },
            include: {
                classSchedule: {
                    include: {
                        class: true,
                        trainer: { include: { user: true } },
                    },
                },
            },
            orderBy: { bookedAt: 'desc' },
        });
    }

    async getAllBookings(classScheduleId?: string) {
        return this.prisma.classBooking.findMany({
            where: classScheduleId ? { classScheduleId } : undefined,
            include: {
                member: {
                    include: {
                        user: {
                            select: { firstName: true, lastName: true, email: true },
                        },
                    },
                },
                classSchedule: {
                    include: {
                        class: true,
                        trainer: {
                            include: {
                                user: {
                                    select: { firstName: true, lastName: true },
                                },
                            },
                        },
                    },
                },
            },
            orderBy: { bookedAt: 'desc' },
            take: 500,
        });
    }

    async joinWaitlist(
        classScheduleId: string,
        memberId: string,
        currentUser?: CurrentUserPayload,
    ): Promise<ClassWaitlistResponseDto> {
        await this.ensureMemberAccess(memberId, currentUser);
        await this.ensureClassScheduleActive(classScheduleId);

        const existing = await this.prisma.classWaitlist.findUnique({
            where: { memberId_classScheduleId: { memberId, classScheduleId } },
        });
        if (existing && existing.status !== WaitlistStatus.CANCELLED) {
            return this.toWaitlistResponseDto(existing);
        }

        const maxPosition = await this.prisma.classWaitlist.aggregate({
            where: {
                classScheduleId,
                status: { in: [WaitlistStatus.WAITING, WaitlistStatus.NOTIFIED] },
            },
            _max: { position: true },
        });
        const nextPosition = (maxPosition._max?.position ?? 0) + 1;

        const entry = existing
            ? await this.prisma.classWaitlist.update({
                where: { id: existing.id },
                data: {
                    status: WaitlistStatus.WAITING,
                    position: nextPosition,
                    notifiedAt: null,
                    expiresAt: null,
                },
            })
            : await this.prisma.classWaitlist.create({
                data: { classScheduleId, memberId, position: nextPosition },
            });

        return this.toWaitlistResponseDto(entry);
    }

    async leaveWaitlist(waitlistId: string, currentUser?: CurrentUserPayload): Promise<void> {
        const entry = await this.prisma.classWaitlist.findUnique({
            where: { id: waitlistId },
            include: { member: { select: { userId: true } } },
        });
        if (!entry) {
            throw new NotFoundException(
                `Waitlist entry with ID ${waitlistId} not found`,
            );
        }
        if (
            currentUser?.role === UserRole.MEMBER &&
            entry.member.userId !== currentUser.userId
        ) {
            throw new ForbiddenException('You can only manage your own waitlist');
        }

        await this.prisma.classWaitlist.update({
            where: { id: waitlistId },
            data: { status: WaitlistStatus.CANCELLED },
        });
    }

    async getMemberWaitlist(memberId: string, currentUser?: CurrentUserPayload) {
        await this.ensureMemberAccess(memberId, currentUser);
        return this.prisma.classWaitlist.findMany({
            where: {
                memberId,
                status: { in: [WaitlistStatus.WAITING, WaitlistStatus.NOTIFIED] },
            },
            include: { classSchedule: { include: { class: true } } },
            orderBy: [{ status: 'asc' }, { position: 'asc' }],
        });
    }

    async getAllWaitlist(classScheduleId?: string) {
        return this.prisma.classWaitlist.findMany({
            where: classScheduleId ? { classScheduleId } : undefined,
            include: {
                member: {
                    include: {
                        user: {
                            select: { firstName: true, lastName: true, email: true },
                        },
                    },
                },
                classSchedule: {
                    include: {
                        class: true,
                        trainer: {
                            include: {
                                user: {
                                    select: { firstName: true, lastName: true },
                                },
                            },
                        },
                    },
                },
            },
            orderBy: [{ classScheduleId: 'asc' }, { position: 'asc' }],
            take: 500,
        });
    }

    async promoteNextWaitlistByAdmin(classScheduleId: string): Promise<void> {
        await this.promoteWaitlist(classScheduleId);
    }

    async favoriteClass(
        classId: string,
        memberId: string,
        currentUser?: CurrentUserPayload,
    ): Promise<ClassFavoriteResponseDto> {
        await this.ensureMemberAccess(memberId, currentUser);
        const classEntity = await this.prisma.class.findUnique({
            where: { id: classId },
        });
        if (!classEntity) {
            throw new NotFoundException(`Class with ID ${classId} not found`);
        }
        const favorite = await this.prisma.classFavorite.upsert({
            where: { memberId_classId: { memberId, classId } },
            update: {},
            create: { memberId, classId },
            include: { class: true },
        });

        return {
            id: favorite.id,
            memberId: favorite.memberId,
            classId: favorite.classId,
            className: favorite.class.name,
            classType: favorite.class.category,
            createdAt: favorite.createdAt,
        };
    }

    async unfavoriteClass(
        classId: string,
        memberId: string,
        currentUser?: CurrentUserPayload,
    ): Promise<void> {
        await this.ensureMemberAccess(memberId, currentUser);
        await this.prisma.classFavorite.deleteMany({
            where: { classId, memberId },
        });
    }

    async getMemberFavorites(
        memberId: string,
        currentUser?: CurrentUserPayload,
    ): Promise<ClassFavoriteResponseDto[]> {
        await this.ensureMemberAccess(memberId, currentUser);
        const favorites = await this.prisma.classFavorite.findMany({
            where: { memberId },
            include: { class: true },
            orderBy: { createdAt: 'desc' },
        });
        return favorites.map((favorite) => ({
            id: favorite.id,
            memberId: favorite.memberId,
            classId: favorite.classId,
            className: favorite.class.name,
            classType: favorite.class.category,
            createdAt: favorite.createdAt,
        }));
    }

    async createClassPackage(
        dto: CreateClassPackageDto,
    ): Promise<ClassPackageResponseDto> {
        const pack = await this.prisma.classPackage.create({
            data: {
                name: dto.name,
                description: dto.description,
                passType: this.toClassPassType(dto.passType),
                classId: dto.classId,
                creditsIncluded: dto.creditsIncluded,
                price: dto.price,
                validityDays: dto.validityDays,
                monthlyUnlimited: dto.monthlyUnlimited ?? false,
            },
        });
        return this.toClassPackageResponseDto(pack);
    }

    async getClassPackages(): Promise<ClassPackageResponseDto[]> {
        const packages = await this.prisma.classPackage.findMany({
            where: { isActive: true },
            orderBy: { createdAt: 'desc' },
        });
        return packages.map((pack) => this.toClassPackageResponseDto(pack));
    }

    async purchaseClassPackage(
        classPackageId: string,
        dto: PurchaseClassPackageDto,
        currentUser?: CurrentUserPayload,
    ) {
        await this.ensureMemberAccess(dto.memberId, currentUser);
        const classPackage = await this.prisma.classPackage.findFirst({
            where: { id: classPackageId, isActive: true },
        });
        if (!classPackage) {
            throw new NotFoundException(
                `Class package with ID ${classPackageId} not found`,
            );
        }

        const now = new Date();
        const validityDays =
            classPackage.validityDays ??
            (classPackage.passType === 'MONTHLY' ? 30 : 60);
        const expiresAt = new Date(
            now.getTime() + validityDays * 24 * 60 * 60 * 1000,
        );
        const bonusCredits = classPackage.creditsIncluded === 10 ? 1 : 0;
        const totalCredits = classPackage.monthlyUnlimited
            ? 0
            : classPackage.creditsIncluded + bonusCredits;

        const pass = await this.prisma.memberClassPass.create({
            data: {
                memberId: dto.memberId,
                classPackageId,
                expiresAt,
                totalCredits,
                remainingCredits: totalCredits,
                monthlyUnlimited: classPackage.monthlyUnlimited,
            },
        });

        const balanceAfter = await this.getMemberCreditsBalance(dto.memberId);
        await this.prisma.classCreditTransaction.create({
            data: {
                memberId: dto.memberId,
                memberClassPassId: pass.id,
                transactionType: 'PURCHASE',
                creditsDelta: totalCredits,
                balanceAfter,
                notes: `Purchased package ${classPackage.name}`,
            },
        });

        return {
            passId: pass.id,
            expiresAt: pass.expiresAt,
            remainingCredits: pass.remainingCredits,
            monthlyUnlimited: pass.monthlyUnlimited,
        };
    }

    async getMemberCredits(
        memberId: string,
        currentUser?: CurrentUserPayload,
    ): Promise<MemberClassCreditsResponseDto> {
        await this.ensureMemberAccess(memberId, currentUser);
        const activePasses = await this.prisma.memberClassPass.findMany({
            where: {
                memberId,
                status: PassStatus.ACTIVE,
                expiresAt: { gt: new Date() },
            },
            include: { classPackage: true },
            orderBy: { expiresAt: 'asc' },
        });
        const totalRemainingCredits = activePasses.reduce(
            (sum, pass) => sum + pass.remainingCredits,
            0,
        );
        const hasUnlimitedPass = activePasses.some((pass) => pass.monthlyUnlimited);
        return {
            memberId,
            totalRemainingCredits,
            hasUnlimitedPass,
            activePasses: activePasses.map((pass) => ({
                passId: pass.id,
                packageName: pass.classPackage.name,
                expiresAt: pass.expiresAt,
                remainingCredits: pass.remainingCredits,
                monthlyUnlimited: pass.monthlyUnlimited,
            })),
        };
    }

    async rateInstructor(
        classScheduleId: string,
        memberId: string,
        dto: RateInstructorDto,
        currentUser?: CurrentUserPayload,
    ) {
        await this.ensureMemberAccess(memberId, currentUser);
        const booking = await this.prisma.classBooking.findFirst({
            where: {
                classScheduleId,
                memberId,
                status: { in: [BookingStatus.CONFIRMED, BookingStatus.COMPLETED] },
            },
            include: {
                classSchedule: { select: { trainerId: true, endTime: true } },
            },
        });
        if (!booking) {
            throw new BadRequestException('Member did not book this class');
        }
        if (booking.classSchedule.endTime > new Date()) {
            throw new BadRequestException(
                'Instructor can only be rated after class completion',
            );
        }

        return this.prisma.instructorRating.upsert({
            where: { memberId_classScheduleId: { memberId, classScheduleId } },
            update: { rating: dto.rating, review: dto.review },
            create: {
                memberId,
                classScheduleId,
                trainerId: booking.classSchedule.trainerId,
                rating: dto.rating,
                review: dto.review,
            },
        });
    }

    async getInstructorProfile(
        trainerId: string,
    ): Promise<InstructorProfileResponseDto> {
        const trainer = await this.prisma.trainer.findUnique({
            where: { id: trainerId },
            include: { user: true },
        });
        if (!trainer) {
            throw new NotFoundException(`Trainer with ID ${trainerId} not found`);
        }

        const ratingsAgg = await this.prisma.instructorRating.aggregate({
            where: { trainerId },
            _avg: { rating: true },
            _count: { rating: true },
        });

        const now = new Date();
        const [pastClassesCount, upcomingClassesCount, topClassTypesRaw] =
            await Promise.all([
                this.prisma.classSchedule.count({
                    where: { trainerId, endTime: { lt: now } },
                }),
                this.prisma.classSchedule.count({
                    where: { trainerId, startTime: { gte: now }, isActive: true },
                }),
                this.prisma.classSchedule.findMany({
                    where: { trainerId, endTime: { lt: now } },
                    include: { class: { select: { category: true } } },
                    take: 200,
                }),
            ]);

        const grouped = topClassTypesRaw.reduce<Record<string, number>>(
            (acc, item) => {
                acc[item.class.category] = (acc[item.class.category] ?? 0) + 1;
                return acc;
            },
            {},
        );
        const topClassTypes = Object.entries(grouped)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([category]) => category);

        return {
            trainerId,
            fullName: `${trainer.user.firstName} ${trainer.user.lastName}`.trim(),
            bio: trainer.bio ?? undefined,
            specializations: trainer.specialization
                .split(',')
                .map((item) => item.trim())
                .filter(Boolean),
            experience: trainer.experience,
            certifications: trainer.certification ?? undefined,
            averageRating: Number((ratingsAgg._avg.rating ?? 0).toFixed(2)),
            ratingsCount: ratingsAgg._count.rating,
            classHistory: {
                pastClassesCount,
                upcomingClassesCount,
                topClassTypes,
            },
        };
    }

    @Cron(CronExpression.EVERY_30_MINUTES)
    async sendClassReminders(): Promise<void> {
        const now = new Date();
        const inTwoHoursStart = new Date(now.getTime() + 110 * 60 * 1000);
        const inTwoHoursEnd = new Date(now.getTime() + 130 * 60 * 1000);
        const in24HoursStart = new Date(now.getTime() + 23.5 * 60 * 60 * 1000);
        const in24HoursEnd = new Date(now.getTime() + 24.5 * 60 * 60 * 1000);

        const bookings = await this.prisma.classBooking.findMany({
            where: {
                status: BookingStatus.CONFIRMED,
                classSchedule: {
                    OR: [
                        { startTime: { gte: inTwoHoursStart, lte: inTwoHoursEnd } },
                        { startTime: { gte: in24HoursStart, lte: in24HoursEnd } },
                    ],
                },
            },
            include: {
                member: { include: { user: true } },
                classSchedule: { include: { class: true } },
            },
            take: 500,
        });

        await Promise.all(
            bookings.map((booking) =>
                this.notificationsService.createForUser({
                    userId: booking.member.userId,
                    title: 'Class reminder',
                    message: `${booking.classSchedule.class.name} starts at ${booking.classSchedule.startTime.toISOString()}`,
                    type: NotificationType.IN_APP,
                    actionUrl: '/member/classes',
                }),
            ),
        );
    }

    private async promoteWaitlist(classScheduleId: string): Promise<void> {
        const next = await this.prisma.classWaitlist.findFirst({
            where: { classScheduleId, status: WaitlistStatus.WAITING },
            include: {
                member: { include: { user: true } },
                classSchedule: { include: { class: true } },
            },
            orderBy: { position: 'asc' },
        });
        if (!next) return;

        const hasCapacity = await this.hasCapacity(classScheduleId);
        if (!hasCapacity) return;

        await this.prisma.$transaction(async (tx) => {
            await tx.classBooking.upsert({
                where: {
                    memberId_classScheduleId: {
                        memberId: next.memberId,
                        classScheduleId: next.classScheduleId,
                    },
                },
                update: { status: BookingStatus.CONFIRMED },
                create: {
                    memberId: next.memberId,
                    classScheduleId: next.classScheduleId,
                    status: BookingStatus.CONFIRMED,
                },
            });
            await tx.classWaitlist.update({
                where: { id: next.id },
                data: {
                    status: WaitlistStatus.BOOKED,
                    notifiedAt: new Date(),
                    expiresAt: null,
                },
            });
            await tx.classWaitlist.updateMany({
                where: {
                    classScheduleId,
                    status: WaitlistStatus.WAITING,
                    position: { gt: next.position },
                },
                data: { position: { decrement: 1 } },
            });
        });

        await this.notificationsService.createForUser({
            userId: next.member.userId,
            title: 'Waitlist promotion',
            message: `You have been moved into ${next.classSchedule.class.name}.`,
            type: NotificationType.IN_APP,
            actionUrl: '/member/classes',
        });
    }

    private toClassPassType(passType: string): ClassPassType {
        const normalized = passType.trim().toUpperCase();
        if (normalized === ClassPassType.BUNDLE) return ClassPassType.BUNDLE;
        if (normalized === ClassPassType.MONTHLY) return ClassPassType.MONTHLY;

        throw new BadRequestException(
            `Invalid passType "${passType}". Expected BUNDLE or MONTHLY.`,
        );
    }

    private async ensureClassScheduleActive(
        classScheduleId: string,
    ): Promise<void> {
        const classSchedule = await this.prisma.classSchedule.findUnique({
            where: { id: classScheduleId },
            select: { id: true, isActive: true },
        });
        if (!classSchedule) {
            throw new NotFoundException(
                `Class schedule with ID ${classScheduleId} not found`,
            );
        }
        if (!classSchedule.isActive) {
            throw new BadRequestException('Class schedule is not active');
        }
    }

    private async ensureMemberAccess(
        memberId: string,
        currentUser?: CurrentUserPayload,
    ): Promise<void> {
        const member = await this.prisma.member.findUnique({
            where: { id: memberId },
            select: { id: true, userId: true },
        });
        if (!member) {
            throw new NotFoundException(`Member with ID ${memberId} not found`);
        }
        if (
            currentUser?.role === UserRole.MEMBER &&
            member.userId !== currentUser.userId
        ) {
            throw new ForbiddenException('You can only access your own member data');
        }
    }

    private async getMemberCreditsBalance(memberId: string): Promise<number> {
        const passes = await this.prisma.memberClassPass.findMany({
            where: {
                memberId,
                status: PassStatus.ACTIVE,
                expiresAt: { gt: new Date() },
            },
            select: { remainingCredits: true, monthlyUnlimited: true },
        });
        if (passes.some((pass) => pass.monthlyUnlimited)) return 0;
        return passes.reduce((sum, pass) => sum + pass.remainingCredits, 0);
    }

    private async consumeCreditForBooking(
        bookingId: string,
        memberId: string,
    ): Promise<void> {
        const passes = await this.prisma.memberClassPass.findMany({
            where: {
                memberId,
                status: PassStatus.ACTIVE,
                expiresAt: { gt: new Date() },
            },
            orderBy: { expiresAt: 'asc' },
        });
        if (passes.length === 0) return;
        const unlimitedPass = passes.find((pass) => pass.monthlyUnlimited);
        if (unlimitedPass) return;
        const passWithCredits = passes.find((pass) => pass.remainingCredits > 0);
        if (!passWithCredits) return;

        const updatedPass = await this.prisma.memberClassPass.update({
            where: { id: passWithCredits.id },
            data: { remainingCredits: { decrement: 1 } },
        });
        const balanceAfter = await this.getMemberCreditsBalance(memberId);
        await this.prisma.classCreditTransaction.create({
            data: {
                memberId,
                memberClassPassId: updatedPass.id,
                bookingId,
                transactionType: 'USAGE',
                creditsDelta: -1,
                balanceAfter,
                notes: 'Class booking credit usage',
            },
        });
    }

    private async refundCreditForBooking(
        bookingId: string,
        memberId: string,
    ): Promise<void> {
        const usageTxn = await this.prisma.classCreditTransaction.findFirst({
            where: {
                bookingId,
                memberId,
                transactionType: 'USAGE',
            },
            orderBy: { createdAt: 'desc' },
        });
        if (!usageTxn || !usageTxn.memberClassPassId) return;

        await this.prisma.memberClassPass.update({
            where: { id: usageTxn.memberClassPassId },
            data: { remainingCredits: { increment: 1 } },
        });
        const balanceAfter = await this.getMemberCreditsBalance(memberId);
        await this.prisma.classCreditTransaction.create({
            data: {
                memberId,
                memberClassPassId: usageTxn.memberClassPassId,
                bookingId,
                transactionType: 'REFUND',
                creditsDelta: 1,
                balanceAfter,
                notes: 'Class cancellation credit refund',
            },
        });
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

    private toWaitlistResponseDto(entry: ClassWaitlist): ClassWaitlistResponseDto {
        return {
            id: entry.id,
            memberId: entry.memberId,
            classScheduleId: entry.classScheduleId,
            position: entry.position,
            status: entry.status,
            notifiedAt: entry.notifiedAt ?? undefined,
            expiresAt: entry.expiresAt ?? undefined,
            createdAt: entry.createdAt,
            updatedAt: entry.updatedAt,
        };
    }

    private toClassPackageResponseDto(pack: ClassPackage): ClassPackageResponseDto {
        return {
            id: pack.id,
            name: pack.name,
            description: pack.description ?? undefined,
            passType: pack.passType,
            classId: pack.classId ?? undefined,
            creditsIncluded: pack.creditsIncluded,
            price: pack.price,
            validityDays: pack.validityDays ?? undefined,
            monthlyUnlimited: pack.monthlyUnlimited,
            isActive: pack.isActive,
            createdAt: pack.createdAt,
            updatedAt: pack.updatedAt,
        };
    }

    private toResponseDto(classSchedule: ClassScheduleWithRelations): ClassResponseDto {
        const confirmedBookings = classSchedule.bookings
            ? classSchedule.bookings.length
            : 0;

        return {
            id: classSchedule.id,
            name: classSchedule.class.name,
            description: classSchedule.class.description ?? undefined,
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

    private toBookingResponseDto(booking: ClassBooking): ClassBookingResponseDto {
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
