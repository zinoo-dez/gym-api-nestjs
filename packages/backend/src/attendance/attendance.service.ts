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
import { AttendanceType, Prisma } from '@prisma/client';
import { PaginatedResponseDto } from '../common/dto';

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  async checkIn(checkInDto: CheckInDto): Promise<AttendanceResponseDto> {
    // Verify member exists - only select needed fields
    const member = await this.prisma.member.findUnique({
      where: { id: checkInDto.memberId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        user: { select: { email: true } },
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
    if (checkInDto.type === AttendanceType.CLASS_ATTENDANCE) {
      if (!checkInDto.classId) {
        throw new BadRequestException(
          'Class ID is required for class attendance',
        );
      }

      const classExists = await this.prisma.class.findUnique({
        where: { id: checkInDto.classId },
        select: { id: true },
      });

      if (!classExists) {
        throw new NotFoundException(
          `Class with ID ${checkInDto.classId} not found`,
        );
      }

      // Verify member has a booking for this class
      const booking = await this.prisma.classBooking.findUnique({
        where: {
          memberId_classId: {
            memberId: checkInDto.memberId,
            classId: checkInDto.classId,
          },
        },
        select: { status: true },
      });

      if (!booking || booking.status !== 'CONFIRMED') {
        throw new ForbiddenException(
          'Member does not have a confirmed booking for this class',
        );
      }
    }

    // Create attendance record
    const attendance = await this.prisma.attendance.create({
      data: {
        memberId: checkInDto.memberId,
        classId: checkInDto.classId,
        type: checkInDto.type,
        checkInTime: new Date(),
      },
      include: {
        member: {
          include: {
            user: true,
          },
        },
        class: true,
      },
    });

    return this.toResponseDto(attendance);
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
        class: true,
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

    if (filters?.classId) {
      where.classId = filters.classId;
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
        class: true,
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
        firstName: true,
        lastName: true,
        user: { select: { email: true } },
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
      memberName: `${member.firstName} ${member.lastName}`,
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
    const activeMembership = await this.prisma.membership.findFirst({
      where: {
        memberId,
        status: 'ACTIVE',
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

  private toResponseDto(attendance: any): AttendanceResponseDto {
    return {
      id: attendance.id,
      memberId: attendance.memberId,
      classId: attendance.classId,
      checkInTime: attendance.checkInTime,
      checkOutTime: attendance.checkOutTime,
      type: attendance.type,
      createdAt: attendance.createdAt,
      member: attendance.member
        ? {
            id: attendance.member.id,
            firstName: attendance.member.firstName,
            lastName: attendance.member.lastName,
            email: attendance.member.user.email,
          }
        : undefined,
      class: attendance.class
        ? {
            id: attendance.class.id,
            name: attendance.class.name,
            schedule: attendance.class.schedule,
          }
        : undefined,
    };
  }
}
