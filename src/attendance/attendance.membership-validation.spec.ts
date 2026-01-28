import { Test, TestingModule } from '@nestjs/testing';
import { AttendanceService } from './attendance.service';
import { PrismaService } from '../prisma/prisma.service';
import { ForbiddenException } from '@nestjs/common';
import { AttendanceType } from '@prisma/client';

describe('AttendanceService - Membership Validation (Task 11.3)', () => {
  let service: AttendanceService;
  let prisma: PrismaService;

  const mockPrismaService = {
    member: {
      findUnique: jest.fn(),
    },
    membership: {
      findFirst: jest.fn(),
    },
    attendance: {
      create: jest.fn(),
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

    jest.clearAllMocks();
  });

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

  describe('Requirement 6.2: Verify member has active membership before check-in', () => {
    it('should allow check-in for member with active membership', async () => {
      const checkInDto = {
        memberId: 'member-1',
        type: AttendanceType.GYM_VISIT,
      };

      const activeMembership = {
        id: 'membership-1',
        memberId: 'member-1',
        status: 'ACTIVE',
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
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
        activeMembership,
      );
      mockPrismaService.attendance.create.mockResolvedValue(mockAttendance);

      const result = await service.checkIn(checkInDto);

      expect(result).toBeDefined();
      expect(result.id).toBe('attendance-1');
      expect(prisma.membership.findFirst).toHaveBeenCalledWith({
        where: {
          memberId: 'member-1',
          status: 'ACTIVE',
          endDate: {
            gte: expect.any(Date),
          },
        },
        select: {
          id: true,
        },
      });
    });
  });

  describe('Requirement 6.3: Reject check-in for expired or missing memberships', () => {
    it('should reject check-in for member with no membership', async () => {
      const checkInDto = {
        memberId: 'member-1',
        type: AttendanceType.GYM_VISIT,
      };

      mockPrismaService.member.findUnique.mockResolvedValue(mockMember);
      mockPrismaService.membership.findFirst.mockResolvedValue(null);

      await expect(service.checkIn(checkInDto)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(service.checkIn(checkInDto)).rejects.toThrow(
        'Member does not have an active membership',
      );
    });

    it('should reject check-in for member with expired membership', async () => {
      const checkInDto = {
        memberId: 'member-1',
        type: AttendanceType.GYM_VISIT,
      };

      // Membership with end date in the past
      const expiredMembership = {
        id: 'membership-1',
        memberId: 'member-1',
        status: 'EXPIRED',
        endDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      };

      mockPrismaService.member.findUnique.mockResolvedValue(mockMember);
      // findFirst will return null because the query filters for ACTIVE status and endDate >= now
      mockPrismaService.membership.findFirst.mockResolvedValue(null);

      await expect(service.checkIn(checkInDto)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should reject check-in for member with cancelled membership', async () => {
      const checkInDto = {
        memberId: 'member-1',
        type: AttendanceType.GYM_VISIT,
      };

      mockPrismaService.member.findUnique.mockResolvedValue(mockMember);
      // findFirst will return null because the query filters for ACTIVE status
      mockPrismaService.membership.findFirst.mockResolvedValue(null);

      await expect(service.checkIn(checkInDto)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should reject check-in for member with membership ending today but already passed', async () => {
      const checkInDto = {
        memberId: 'member-1',
        type: AttendanceType.GYM_VISIT,
      };

      // Membership that ended 1 hour ago
      const justExpiredMembership = {
        id: 'membership-1',
        memberId: 'member-1',
        status: 'ACTIVE',
        endDate: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
      };

      mockPrismaService.member.findUnique.mockResolvedValue(mockMember);
      // findFirst will return null because endDate is in the past
      mockPrismaService.membership.findFirst.mockResolvedValue(null);

      await expect(service.checkIn(checkInDto)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('Edge cases', () => {
    it('should allow check-in on the last day of membership', async () => {
      const checkInDto = {
        memberId: 'member-1',
        type: AttendanceType.GYM_VISIT,
      };

      // Membership ending in 1 hour
      const expiringTodayMembership = {
        id: 'membership-1',
        memberId: 'member-1',
        status: 'ACTIVE',
        endDate: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
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
        expiringTodayMembership,
      );
      mockPrismaService.attendance.create.mockResolvedValue(mockAttendance);

      const result = await service.checkIn(checkInDto);

      expect(result).toBeDefined();
      expect(result.id).toBe('attendance-1');
    });
  });
});
