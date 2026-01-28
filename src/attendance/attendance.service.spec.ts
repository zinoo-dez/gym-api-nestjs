import { Test, TestingModule } from '@nestjs/testing';
import { AttendanceService } from './attendance.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { AttendanceType } from '@prisma/client';

describe('AttendanceService', () => {
  let service: AttendanceService;
  let prisma: PrismaService;

  const mockPrismaService = {
    member: {
      findUnique: jest.fn(),
    },
    class: {
      findUnique: jest.fn(),
    },
    classBooking: {
      findUnique: jest.fn(),
    },
    membership: {
      findFirst: jest.fn(),
    },
    attendance: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttendanceService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AttendanceService>(AttendanceService);
    prisma = module.get<PrismaService>(PrismaService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('checkIn', () => {
    const mockMember = {
      id: 'member-1',
      userId: 'user-1',
      firstName: 'John',
      lastName: 'Doe',
      isActive: true,
      user: {
        id: 'user-1',
        email: 'john@example.com',
      },
    };

    const mockActiveMembership = {
      id: 'membership-1',
      memberId: 'member-1',
      status: 'ACTIVE',
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    };

    it('should create gym visit attendance for member with active membership', async () => {
      const checkInDto = {
        memberId: 'member-1',
        type: AttendanceType.GYM_VISIT,
      };

      const mockAttendance = {
        id: 'attendance-1',
        memberId: 'member-1',
        classId: null,
        type: AttendanceType.GYM_VISIT,
        checkInTime: new Date(),
        checkOutTime: null,
        createdAt: new Date(),
        member: mockMember,
        class: null,
      };

      mockPrismaService.member.findUnique.mockResolvedValue(mockMember);
      mockPrismaService.membership.findFirst.mockResolvedValue(
        mockActiveMembership,
      );
      mockPrismaService.attendance.create.mockResolvedValue(mockAttendance);

      const result = await service.checkIn(checkInDto);

      expect(result.id).toBe('attendance-1');
      expect(result.type).toBe(AttendanceType.GYM_VISIT);
      expect(result.memberId).toBe('member-1');
      expect(prisma.member.findUnique).toHaveBeenCalledWith({
        where: { id: 'member-1' },
        include: { user: true },
      });
    });

    it('should throw NotFoundException if member does not exist', async () => {
      const checkInDto = {
        memberId: 'non-existent',
        type: AttendanceType.GYM_VISIT,
      };

      mockPrismaService.member.findUnique.mockResolvedValue(null);

      await expect(service.checkIn(checkInDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if member has no active membership', async () => {
      const checkInDto = {
        memberId: 'member-1',
        type: AttendanceType.GYM_VISIT,
      };

      mockPrismaService.member.findUnique.mockResolvedValue(mockMember);
      mockPrismaService.membership.findFirst.mockResolvedValue(null);

      await expect(service.checkIn(checkInDto)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw BadRequestException if class attendance without classId', async () => {
      const checkInDto = {
        memberId: 'member-1',
        type: AttendanceType.CLASS_ATTENDANCE,
      };

      mockPrismaService.member.findUnique.mockResolvedValue(mockMember);
      mockPrismaService.membership.findFirst.mockResolvedValue(
        mockActiveMembership,
      );

      await expect(service.checkIn(checkInDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should create class attendance for member with booking', async () => {
      const checkInDto = {
        memberId: 'member-1',
        type: AttendanceType.CLASS_ATTENDANCE,
        classId: 'class-1',
      };

      const mockClass = {
        id: 'class-1',
        name: 'Yoga',
        schedule: new Date(),
      };

      const mockBooking = {
        id: 'booking-1',
        memberId: 'member-1',
        classId: 'class-1',
        status: 'CONFIRMED',
      };

      const mockAttendance = {
        id: 'attendance-1',
        memberId: 'member-1',
        classId: 'class-1',
        type: AttendanceType.CLASS_ATTENDANCE,
        checkInTime: new Date(),
        checkOutTime: null,
        createdAt: new Date(),
        member: mockMember,
        class: mockClass,
      };

      mockPrismaService.member.findUnique.mockResolvedValue(mockMember);
      mockPrismaService.membership.findFirst.mockResolvedValue(
        mockActiveMembership,
      );
      mockPrismaService.class.findUnique.mockResolvedValue(mockClass);
      mockPrismaService.classBooking.findUnique.mockResolvedValue(mockBooking);
      mockPrismaService.attendance.create.mockResolvedValue(mockAttendance);

      const result = await service.checkIn(checkInDto);

      expect(result.id).toBe('attendance-1');
      expect(result.type).toBe(AttendanceType.CLASS_ATTENDANCE);
      expect(result.classId).toBe('class-1');
    });
  });

  describe('checkOut', () => {
    it('should update attendance with check-out time', async () => {
      const mockAttendance = {
        id: 'attendance-1',
        memberId: 'member-1',
        checkInTime: new Date(),
        checkOutTime: null,
      };

      const mockUpdatedAttendance = {
        ...mockAttendance,
        checkOutTime: new Date(),
        member: {
          id: 'member-1',
          firstName: 'John',
          lastName: 'Doe',
          user: { email: 'john@example.com' },
        },
        class: null,
      };

      mockPrismaService.attendance.findUnique.mockResolvedValue(mockAttendance);
      mockPrismaService.attendance.update.mockResolvedValue(
        mockUpdatedAttendance,
      );

      const result = await service.checkOut('attendance-1');

      expect(result.checkOutTime).toBeDefined();
      expect(prisma.attendance.update).toHaveBeenCalledWith({
        where: { id: 'attendance-1' },
        data: { checkOutTime: expect.any(Date) },
        include: {
          member: { include: { user: true } },
          class: true,
        },
      });
    });

    it('should throw NotFoundException if attendance does not exist', async () => {
      mockPrismaService.attendance.findUnique.mockResolvedValue(null);

      await expect(service.checkOut('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if already checked out', async () => {
      const mockAttendance = {
        id: 'attendance-1',
        checkOutTime: new Date(),
      };

      mockPrismaService.attendance.findUnique.mockResolvedValue(mockAttendance);

      await expect(service.checkOut('attendance-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated attendance records', async () => {
      const filters = {
        page: 1,
        limit: 10,
      };

      const mockAttendanceRecords = [
        {
          id: 'attendance-1',
          memberId: 'member-1',
          type: AttendanceType.GYM_VISIT,
          checkInTime: new Date(),
          checkOutTime: null,
          createdAt: new Date(),
          member: {
            id: 'member-1',
            firstName: 'John',
            lastName: 'Doe',
            user: { email: 'john@example.com' },
          },
          class: null,
        },
      ];

      mockPrismaService.attendance.count.mockResolvedValue(1);
      mockPrismaService.attendance.findMany.mockResolvedValue(
        mockAttendanceRecords,
      );

      const result = await service.findAll(filters);

      expect(result.data).toHaveLength(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.total).toBe(1);
    });
  });

  describe('generateReport', () => {
    it('should generate attendance report for member', async () => {
      const mockMember = {
        id: 'member-1',
        firstName: 'John',
        lastName: 'Doe',
        user: { email: 'john@example.com' },
      };

      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      const mockAttendanceRecords = [
        {
          id: 'attendance-1',
          memberId: 'member-1',
          type: AttendanceType.GYM_VISIT,
          checkInTime: new Date('2024-01-15T10:00:00'),
        },
        {
          id: 'attendance-2',
          memberId: 'member-1',
          type: AttendanceType.CLASS_ATTENDANCE,
          checkInTime: new Date('2024-01-20T14:00:00'),
        },
      ];

      mockPrismaService.member.findUnique.mockResolvedValue(mockMember);
      mockPrismaService.attendance.findMany.mockResolvedValue(
        mockAttendanceRecords,
      );

      const result = await service.generateReport(
        'member-1',
        startDate,
        endDate,
      );

      expect(result.memberId).toBe('member-1');
      expect(result.memberName).toBe('John Doe');
      expect(result.totalGymVisits).toBe(1);
      expect(result.totalClassAttendances).toBe(1);
      expect(result.totalVisits).toBe(2);
      expect(result.averageVisitsPerWeek).toBeGreaterThan(0);
    });

    it('should throw NotFoundException if member does not exist', async () => {
      mockPrismaService.member.findUnique.mockResolvedValue(null);

      await expect(
        service.generateReport('non-existent', new Date(), new Date()),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
