import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
    CheckInDto,
    AttendanceResponseDto,
    AttendanceReportDto,
    AttendanceFiltersDto,
} from './dto';
import {
    AttendanceType,
    Prisma,
    SubscriptionStatus,
    UserRole,
    type Attendance,
    type Member,
    type User,
} from '@prisma/client';
import { PaginatedResponseDto } from '../common/dto';
import { NotificationsService } from '../notifications/notifications.service';

type AttendanceWithMember = Attendance & {
    member?: (Member & { user: User }) | null;
};

@Injectable()
export class AttendanceService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly notificationsService: NotificationsService,
    ) { }

    async checkIn(checkInDto: CheckInDto): Promise<AttendanceResponseDto> {
        // Verify member exists - only select needed fields
        const member = await this.prisma.member.findUnique({
            where: { id: checkInDto.memberId },
            select: {
                id: true,
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
        });

        if (!member) {
            throw new NotFoundException(
                `Member with ID ${checkInDto.memberId} not found`,
            );
        }

        // Check if member has active membership
        const hasActiveMembership = await this.hasActiveMembership(
            checkInDto.memberId,
        );

        if (!hasActiveMembership) {
            throw new ForbiddenException('Member does not have an active membership');
        }

        // If type is CLASS_ATTENDANCE, verify class exists and member has booking
        let classScheduleForResponse:
            | {
                id: string;
                classId: string;
                className: string;
                startTime: Date;
                endTime: Date;
            }
            | undefined;

        if (checkInDto.type === AttendanceType.CLASS_ATTENDANCE) {
            if (!checkInDto.classScheduleId) {
                throw new BadRequestException(
                    'Class schedule ID is required for class attendance',
                );
            }

            const classSchedule = await this.prisma.classSchedule.findUnique({
                where: { id: checkInDto.classScheduleId },
                include: {
                    class: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            });

            if (!classSchedule) {
                throw new NotFoundException(
                    `Class schedule with ID ${checkInDto.classScheduleId} not found`,
                );
            }

            // Verify member has a booking for this class
            const booking = await this.prisma.classBooking.findUnique({
                where: {
                    memberId_classScheduleId: {
                        memberId: checkInDto.memberId,
                        classScheduleId: checkInDto.classScheduleId,
                    },
                },
                select: { status: true },
            });

            if (!booking || booking.status !== 'CONFIRMED') {
                throw new ForbiddenException(
                    'Member does not have a confirmed booking for this class',
                );
            }

            await this.prisma.classBooking.update({
                where: {
                    memberId_classScheduleId: {
                        memberId: checkInDto.memberId,
                        classScheduleId: checkInDto.classScheduleId,
                    },
                },
                data: {
                    checkedInAt: new Date(),
                },
            });

            classScheduleForResponse = {
                id: classSchedule.id,
                classId: classSchedule.class.id,
                className: classSchedule.class.name,
                startTime: classSchedule.startTime,
                endTime: classSchedule.endTime,
            };
        }

        // Create attendance record
        const attendance = await this.prisma.attendance.create({
            data: {
                memberId: checkInDto.memberId,
                type: checkInDto.type,
                checkInTime: new Date(),
            },
            include: {
                member: {
                    include: {
                        user: true,
                    },
                },
            },
        });

        const fullName = member.user
            ? `${member.user.firstName} ${member.user.lastName}`.trim()
            : 'Member';
        const detail =
            checkInDto.type === AttendanceType.CLASS_ATTENDANCE &&
                classScheduleForResponse?.className
                ? ` for ${classScheduleForResponse.className}`
                : '';
        await this.notificationsService.notifyIfEnabled('newAttendanceNotification', {
            role: UserRole.ADMIN,
            title: 'New attendance check-in',
            message: `${fullName} checked in${detail}.`,
            type: 'info',
            actionUrl: '/admin/attendance',
        });

        return this.toResponseDto(attendance, classScheduleForResponse);
    }

    async checkOut(attendanceId: string): Promise<AttendanceResponseDto> {
        // Verify attendance record exists - only select needed fields
        const attendance = await this.prisma.attendance.findUnique({
            where: { id: attendanceId },
            select: { id: true, checkOutTime: true },
        });

        if (!attendance) {
            throw new NotFoundException(
                `Attendance record with ID ${attendanceId} not found`,
            );
        }

        // Check if already checked out
        if (attendance.checkOutTime) {
            throw new BadRequestException('Already checked out');
        }

        // Update with check-out time
        const updatedAttendance = await this.prisma.attendance.update({
            where: { id: attendanceId },
            data: {
                checkOutTime: new Date(),
            },
            include: {
                member: {
                    include: {
                        user: true,
                    },
                },
            },
        });

        return this.toResponseDto(updatedAttendance);
    }

    async findAll(
        filters?: AttendanceFiltersDto,
    ): Promise<PaginatedResponseDto<AttendanceResponseDto>> {
        const page = filters?.page || 1;
        const limit = filters?.limit || 10;
        const skip = filters?.skip || 0;

        // Build where clause
        const where: Prisma.AttendanceWhereInput = {};

        if (filters?.memberId) {
            where.memberId = filters.memberId;
        }

        if (filters?.type) {
            where.type = filters.type;
        }

        // Date range filter
        if (filters?.startDate || filters?.endDate) {
            where.checkInTime = {};

            if (filters.startDate) {
                where.checkInTime.gte = new Date(filters.startDate);
            }

            if (filters.endDate) {
                where.checkInTime.lte = new Date(filters.endDate);
            }
        }

        // Get total count
        const total = await this.prisma.attendance.count({ where });

        // Get paginated attendance records
        const attendanceRecords = await this.prisma.attendance.findMany({
            where,
            include: {
                member: {
                    include: {
                        user: true,
                    },
                },
            },
            orderBy: {
                checkInTime: 'desc',
            },
            skip,
            take: limit,
        });

        const attendanceDtos = attendanceRecords.map((record) =>
            this.toResponseDto(record),
        );

        return new PaginatedResponseDto(attendanceDtos, page, limit, total);
    }

    async generateReport(
        memberId: string,
        startDate: Date,
        endDate: Date,
    ): Promise<AttendanceReportDto> {
        // Verify member exists - only select needed fields
        const member = await this.prisma.member.findUnique({
            where: { id: memberId },
            select: {
                id: true,
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
        });

        if (!member) {
            throw new NotFoundException(`Member with ID ${memberId} not found`);
        }

        // Get all attendance records in date range - only select needed fields
        const attendanceRecords = await this.prisma.attendance.findMany({
            where: {
                memberId,
                checkInTime: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            select: {
                type: true,
                checkInTime: true,
            },
            orderBy: {
                checkInTime: 'asc',
            },
        });

        // Calculate statistics
        const totalGymVisits = attendanceRecords.filter(
            (record) => record.type === AttendanceType.GYM_VISIT,
        ).length;

        const totalClassAttendances = attendanceRecords.filter(
            (record) => record.type === AttendanceType.CLASS_ATTENDANCE,
        ).length;

        const totalVisits = attendanceRecords.length;

        // Calculate weeks in date range
        const millisecondsPerWeek = 7 * 24 * 60 * 60 * 1000;
        const weeks = Math.max(
            1,
            (endDate.getTime() - startDate.getTime()) / millisecondsPerWeek,
        );
        const averageVisitsPerWeek = totalVisits / weeks;

        // Calculate peak visit hours
        const hourCounts = new Map<number, number>();
        attendanceRecords.forEach((record) => {
            const hour = record.checkInTime.getHours();
            hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
        });

        const peakVisitHours = Array.from(hourCounts.entries())
            .map(([hour, count]) => ({ hour, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        // Calculate visits by day of week
        const dayNames = [
            'Sunday',
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
        ];
        const dayCounts = new Map<number, number>();
        attendanceRecords.forEach((record) => {
            const day = record.checkInTime.getDay();
            dayCounts.set(day, (dayCounts.get(day) || 0) + 1);
        });

        const visitsByDayOfWeek = Array.from(dayCounts.entries())
            .map(([day, count]) => ({
                dayOfWeek: dayNames[day],
                count,
            }))
            .sort((a, b) => b.count - a.count);

        return {
            memberId,
            memberName: `${member.user.firstName} ${member.user.lastName}`,
            startDate,
            endDate,
            totalGymVisits,
            totalClassAttendances,
            totalVisits,
            averageVisitsPerWeek: Math.round(averageVisitsPerWeek * 100) / 100,
            peakVisitHours,
            visitsByDayOfWeek,
        };
    }

    private async hasActiveMembership(memberId: string): Promise<boolean> {
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

    async qrCheckIn(qrCodeToken: string): Promise<AttendanceResponseDto> {
        // Find member by QR code token
        const member = await this.prisma.member.findUnique({
            where: { qrCodeToken },
            select: {
                id: true,
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
        });

        if (!member) {
            throw new NotFoundException('Invalid QR code');
        }

        // Check if member has active membership
        const hasActiveMembership = await this.hasActiveMembership(member.id);

        if (!hasActiveMembership) {
            throw new ForbiddenException('Member does not have an active membership');
        }

        // Create attendance record
        const attendance = await this.prisma.attendance.create({
            data: {
                memberId: member.id,
                type: AttendanceType.GYM_VISIT,
                checkInTime: new Date(),
            },
            include: {
                member: {
                    include: {
                        user: true,
                    },
                },
            },
        });

        // Send notification
        const fullName = member.user
            ? `${member.user.firstName} ${member.user.lastName}`.trim()
            : 'Member';
        await this.notificationsService.notifyIfEnabled('newAttendanceNotification', {
            role: UserRole.ADMIN,
            title: 'QR Check-in',
            message: `${fullName} checked in via QR code.`,
            type: 'info',
            actionUrl: '/admin/attendance',
        });

        return this.toResponseDto(attendance);
    }

    private toResponseDto(
        attendance: AttendanceWithMember,
        classSchedule?: {
            id: string;
            classId: string;
            className: string;
            startTime: Date;
            endTime: Date;
        },
    ): AttendanceResponseDto {
        return {
            id: attendance.id,
            memberId: attendance.memberId,
            classScheduleId: classSchedule?.id,
            checkInTime: attendance.checkInTime,
            checkOutTime: attendance.checkOutTime ?? undefined,
            type: attendance.type,
            createdAt: attendance.createdAt,
            member: attendance.member
                ? {
                    id: attendance.member.id,
                    firstName: attendance.member.user.firstName,
                    lastName: attendance.member.user.lastName,
                    email: attendance.member.user.email,
                }
                : undefined,
            classSchedule: classSchedule,
        };
    }
}
