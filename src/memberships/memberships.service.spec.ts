import { Test, TestingModule } from '@nestjs/testing';
import { MembershipsService } from './memberships.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { MembershipStatus, MembershipType } from '@prisma/client';

describe('MembershipsService - Assignment Endpoints', () => {
  let service: MembershipsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    membershipPlan: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    membership: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    member: {
      findUnique: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MembershipsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<MembershipsService>(MembershipsService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe('assignMembership', () => {
    it('should assign membership to member with calculated end date', async () => {
      const assignDto = {
        memberId: 'member-123',
        planId: 'plan-123',
        startDate: '2024-01-01',
      };

      const mockMember = { id: 'member-123', firstName: 'John' };
      const mockPlan = {
        id: 'plan-123',
        name: 'Premium',
        durationDays: 30,
        price: 99.99,
        type: MembershipType.PREMIUM,
      };

      const expectedEndDate = new Date('2024-01-01');
      expectedEndDate.setDate(expectedEndDate.getDate() + 30);

      mockPrismaService.member.findUnique.mockResolvedValue(mockMember);
      mockPrismaService.membershipPlan.findUnique.mockResolvedValue(mockPlan);
      mockPrismaService.membership.findFirst.mockResolvedValue(null);
      mockPrismaService.membership.create.mockResolvedValue({
        id: 'membership-123',
        memberId: 'member-123',
        planId: 'plan-123',
        startDate: new Date('2024-01-01'),
        endDate: expectedEndDate,
        status: MembershipStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
        plan: mockPlan,
      });

      const result = await service.assignMembership(assignDto);

      expect(result.memberId).toBe('member-123');
      expect(result.planId).toBe('plan-123');
      expect(result.status).toBe(MembershipStatus.ACTIVE);
      expect(mockPrismaService.membership.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            memberId: 'member-123',
            planId: 'plan-123',
            status: MembershipStatus.ACTIVE,
          }),
        }),
      );
    });

    it('should throw NotFoundException if member does not exist', async () => {
      const assignDto = {
        memberId: 'nonexistent-member',
        planId: 'plan-123',
        startDate: '2024-01-01',
      };

      mockPrismaService.member.findUnique.mockResolvedValue(null);

      await expect(service.assignMembership(assignDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException if member already has active membership', async () => {
      const assignDto = {
        memberId: 'member-123',
        planId: 'plan-123',
        startDate: '2024-01-01',
      };

      mockPrismaService.member.findUnique.mockResolvedValue({
        id: 'member-123',
      });
      mockPrismaService.membershipPlan.findUnique.mockResolvedValue({
        id: 'plan-123',
        durationDays: 30,
      });
      mockPrismaService.membership.findFirst.mockResolvedValue({
        id: 'existing-membership',
        status: MembershipStatus.ACTIVE,
        endDate: new Date('2024-12-31'),
      });

      await expect(service.assignMembership(assignDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findMembershipById', () => {
    it('should return membership details with plan', async () => {
      const mockMembership = {
        id: 'membership-123',
        memberId: 'member-123',
        planId: 'plan-123',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
        status: MembershipStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
        plan: {
          id: 'plan-123',
          name: 'Premium',
          durationDays: 30,
          price: 99.99,
          type: MembershipType.PREMIUM,
          features: ['Access to all equipment'],
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };

      mockPrismaService.membership.findUnique.mockResolvedValue(mockMembership);

      const result = await service.findMembershipById('membership-123');

      expect(result.id).toBe('membership-123');
      expect(result.plan).toBeDefined();
      expect(result.plan?.name).toBe('Premium');
    });

    it('should throw NotFoundException if membership does not exist', async () => {
      mockPrismaService.membership.findUnique.mockResolvedValue(null);

      await expect(
        service.findMembershipById('nonexistent-membership'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('upgradeMembership', () => {
    it('should upgrade membership by cancelling old and creating new', async () => {
      const upgradeDto = { newPlanId: 'new-plan-123' };
      const memberId = 'member-123';

      const mockMember = { id: memberId };
      const mockNewPlan = {
        id: 'new-plan-123',
        name: 'VIP',
        durationDays: 60,
        price: 199.99,
        type: MembershipType.VIP,
      };
      const mockCurrentMembership = {
        id: 'current-membership',
        memberId,
        status: MembershipStatus.ACTIVE,
      };

      mockPrismaService.member.findUnique.mockResolvedValue(mockMember);
      mockPrismaService.membershipPlan.findUnique.mockResolvedValue(
        mockNewPlan,
      );
      mockPrismaService.membership.findFirst.mockResolvedValue(
        mockCurrentMembership,
      );

      const expectedEndDate = new Date();
      expectedEndDate.setDate(expectedEndDate.getDate() + 60);

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return callback({
          membership: {
            update: jest.fn().mockResolvedValue({}),
            create: jest.fn().mockResolvedValue({
              id: 'new-membership-123',
              memberId,
              planId: 'new-plan-123',
              startDate: new Date(),
              endDate: expectedEndDate,
              status: MembershipStatus.ACTIVE,
              createdAt: new Date(),
              updatedAt: new Date(),
              plan: mockNewPlan,
            }),
          },
        });
      });

      const result = await service.upgradeMembership(memberId, upgradeDto);

      expect(result.planId).toBe('new-plan-123');
      expect(result.status).toBe(MembershipStatus.ACTIVE);
      expect(mockPrismaService.$transaction).toHaveBeenCalled();
    });

    it('should throw BadRequestException if member has no active membership', async () => {
      const upgradeDto = { newPlanId: 'new-plan-123' };
      const memberId = 'member-123';

      mockPrismaService.member.findUnique.mockResolvedValue({ id: memberId });
      mockPrismaService.membershipPlan.findUnique.mockResolvedValue({
        id: 'new-plan-123',
        durationDays: 60,
      });
      mockPrismaService.membership.findFirst.mockResolvedValue(null);

      await expect(
        service.upgradeMembership(memberId, upgradeDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('isValid', () => {
    it('should return true for valid active membership within date range', async () => {
      const now = new Date();
      const startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 10); // 10 days ago
      const endDate = new Date(now);
      endDate.setDate(endDate.getDate() + 20); // 20 days from now

      mockPrismaService.membership.findUnique.mockResolvedValue({
        id: 'membership-123',
        status: MembershipStatus.ACTIVE,
        startDate,
        endDate,
      });

      const result = await service.isValid('membership-123');

      expect(result).toBe(true);
    });

    it('should return false for expired membership', async () => {
      const now = new Date();
      const startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 40); // 40 days ago
      const endDate = new Date(now);
      endDate.setDate(endDate.getDate() - 10); // 10 days ago (expired)

      mockPrismaService.membership.findUnique.mockResolvedValue({
        id: 'membership-123',
        status: MembershipStatus.ACTIVE,
        startDate,
        endDate,
      });

      const result = await service.isValid('membership-123');

      expect(result).toBe(false);
    });

    it('should return false for membership that has not started yet', async () => {
      const now = new Date();
      const startDate = new Date(now);
      startDate.setDate(startDate.getDate() + 5); // 5 days from now
      const endDate = new Date(now);
      endDate.setDate(endDate.getDate() + 35); // 35 days from now

      mockPrismaService.membership.findUnique.mockResolvedValue({
        id: 'membership-123',
        status: MembershipStatus.ACTIVE,
        startDate,
        endDate,
      });

      const result = await service.isValid('membership-123');

      expect(result).toBe(false);
    });

    it('should return false for non-active membership', async () => {
      const now = new Date();
      const startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 10);
      const endDate = new Date(now);
      endDate.setDate(endDate.getDate() + 20);

      mockPrismaService.membership.findUnique.mockResolvedValue({
        id: 'membership-123',
        status: MembershipStatus.EXPIRED,
        startDate,
        endDate,
      });

      const result = await service.isValid('membership-123');

      expect(result).toBe(false);
    });

    it('should return false for non-existent membership', async () => {
      mockPrismaService.membership.findUnique.mockResolvedValue(null);

      const result = await service.isValid('nonexistent-membership');

      expect(result).toBe(false);
    });
  });

  describe('expireMemberships', () => {
    it('should expire all active memberships past their end date', async () => {
      mockPrismaService.membership.updateMany.mockResolvedValue({ count: 3 });

      const result = await service.expireMemberships();

      expect(result).toBe(3);
      expect(mockPrismaService.membership.updateMany).toHaveBeenCalledWith({
        where: {
          status: MembershipStatus.ACTIVE,
          endDate: {
            lt: expect.any(Date),
          },
        },
        data: {
          status: MembershipStatus.EXPIRED,
        },
      });
    });

    it('should return 0 if no memberships need to be expired', async () => {
      mockPrismaService.membership.updateMany.mockResolvedValue({ count: 0 });

      const result = await service.expireMemberships();

      expect(result).toBe(0);
    });
  });

  describe('handleMembershipExpiration (Scheduled Job)', () => {
    it('should call expireMemberships and log success', async () => {
      const logSpy = jest.spyOn(service['logger'], 'log');
      mockPrismaService.membership.updateMany.mockResolvedValue({ count: 2 });

      await service.handleMembershipExpiration();

      expect(logSpy).toHaveBeenCalledWith(
        'Running scheduled membership expiration check...',
      );
      expect(logSpy).toHaveBeenCalledWith(
        'Membership expiration check completed. Expired 2 membership(s).',
      );
      expect(mockPrismaService.membership.updateMany).toHaveBeenCalled();
    });

    it('should log error if expiration check fails', async () => {
      const logSpy = jest.spyOn(service['logger'], 'log');
      const errorSpy = jest.spyOn(service['logger'], 'error');
      const error = new Error('Database connection failed');

      mockPrismaService.membership.updateMany.mockRejectedValue(error);

      await service.handleMembershipExpiration();

      expect(logSpy).toHaveBeenCalledWith(
        'Running scheduled membership expiration check...',
      );
      expect(errorSpy).toHaveBeenCalledWith(
        'Error during membership expiration check',
        error.stack,
      );
    });
  });
});
