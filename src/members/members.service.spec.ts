import { Test, TestingModule } from '@nestjs/testing';
import { MembersService } from './members.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';

describe('MembersService', () => {
  let service: MembersService;
  let prisma: PrismaService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    member: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    membership: {
      findFirst: jest.fn(),
    },
    classBooking: {
      findMany: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MembersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<MembersService>(MembersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new member', async () => {
      const createMemberDto = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      };

      const mockUser = {
        id: 'user-1',
        email: createMemberDto.email,
        password: 'hashed-password',
        role: Role.MEMBER,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockMember = {
        id: 'member-1',
        userId: mockUser.id,
        firstName: createMemberDto.firstName,
        lastName: createMemberDto.lastName,
        phone: null,
        dateOfBirth: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        user: mockUser,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return callback(mockPrismaService);
      });
      mockPrismaService.user.create.mockResolvedValue(mockUser);
      mockPrismaService.member.create.mockResolvedValue(mockMember);

      const result = await service.create(createMemberDto);

      expect(result).toEqual({
        id: mockMember.id,
        email: mockUser.email,
        firstName: mockMember.firstName,
        lastName: mockMember.lastName,
        phone: mockMember.phone,
        dateOfBirth: mockMember.dateOfBirth,
        isActive: mockMember.isActive,
        createdAt: mockMember.createdAt,
        updatedAt: mockMember.updatedAt,
      });
    });

    it('should throw ConflictException if email already exists', async () => {
      const createMemberDto = {
        email: 'existing@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      };

      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'existing-user',
        email: createMemberDto.email,
      });

      await expect(service.create(createMemberDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findOne', () => {
    it('should return a member by id', async () => {
      const mockMember = {
        id: 'member-1',
        userId: 'user-1',
        firstName: 'John',
        lastName: 'Doe',
        phone: null,
        dateOfBirth: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        user: {
          id: 'user-1',
          email: 'test@example.com',
          role: Role.MEMBER,
        },
      };

      mockPrismaService.member.findUnique.mockResolvedValue(mockMember);

      const result = await service.findOne('member-1');

      expect(result.id).toBe(mockMember.id);
      expect(result.email).toBe(mockMember.user.email);
    });

    it('should throw NotFoundException if member not found', async () => {
      mockPrismaService.member.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated members', async () => {
      const mockMembers = [
        {
          id: 'member-1',
          userId: 'user-1',
          firstName: 'John',
          lastName: 'Doe',
          phone: null,
          dateOfBirth: null,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          user: {
            id: 'user-1',
            email: 'john@example.com',
            role: Role.MEMBER,
          },
          memberships: [],
        },
      ];

      mockPrismaService.member.count.mockResolvedValue(1);
      mockPrismaService.member.findMany.mockResolvedValue(mockMembers);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.total).toBe(1);
      expect(result.totalPages).toBe(1);
    });

    it('should filter members by name', async () => {
      const mockMembers = [
        {
          id: 'member-1',
          userId: 'user-1',
          firstName: 'John',
          lastName: 'Doe',
          phone: null,
          dateOfBirth: null,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          user: {
            id: 'user-1',
            email: 'john@example.com',
            role: Role.MEMBER,
          },
          memberships: [],
        },
      ];

      mockPrismaService.member.count.mockResolvedValue(1);
      mockPrismaService.member.findMany.mockResolvedValue(mockMembers);

      const result = await service.findAll({
        name: 'John',
        page: 1,
        limit: 10,
      });

      expect(result.data).toHaveLength(1);
      expect(mockPrismaService.member.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.any(Array),
          }),
        }),
      );
    });

    it('should filter members by email', async () => {
      const mockMembers = [
        {
          id: 'member-1',
          userId: 'user-1',
          firstName: 'John',
          lastName: 'Doe',
          phone: null,
          dateOfBirth: null,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          user: {
            id: 'user-1',
            email: 'john@example.com',
            role: Role.MEMBER,
          },
          memberships: [],
        },
      ];

      mockPrismaService.member.count.mockResolvedValue(1);
      mockPrismaService.member.findMany.mockResolvedValue(mockMembers);

      const result = await service.findAll({
        email: 'john',
        page: 1,
        limit: 10,
      });

      expect(result.data).toHaveLength(1);
      expect(mockPrismaService.member.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            user: expect.any(Object),
          }),
        }),
      );
    });

    it('should filter members by membership status', async () => {
      const mockMembers = [
        {
          id: 'member-1',
          userId: 'user-1',
          firstName: 'John',
          lastName: 'Doe',
          phone: null,
          dateOfBirth: null,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          user: {
            id: 'user-1',
            email: 'john@example.com',
            role: Role.MEMBER,
          },
          memberships: [],
        },
      ];

      mockPrismaService.member.count.mockResolvedValue(1);
      mockPrismaService.member.findMany.mockResolvedValue(mockMembers);

      const result = await service.findAll({
        status: 'ACTIVE' as any,
        page: 1,
        limit: 10,
      });

      expect(result.data).toHaveLength(1);
      expect(mockPrismaService.member.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            memberships: expect.any(Object),
          }),
        }),
      );
    });

    it('should support partial name matching (case-insensitive)', async () => {
      mockPrismaService.member.count.mockResolvedValue(0);
      mockPrismaService.member.findMany.mockResolvedValue([]);

      await service.findAll({
        name: 'joh',
        page: 1,
        limit: 10,
      });

      expect(mockPrismaService.member.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: [
              { firstName: { contains: 'joh', mode: 'insensitive' } },
              { lastName: { contains: 'joh', mode: 'insensitive' } },
            ],
          }),
        }),
      );
    });
  });

  describe('update', () => {
    it('should update a member', async () => {
      const updateDto = {
        firstName: 'Jane',
        lastName: 'Smith',
      };

      const existingMember = {
        id: 'member-1',
        userId: 'user-1',
        firstName: 'John',
        lastName: 'Doe',
        isActive: true,
      };

      const updatedMember = {
        ...existingMember,
        ...updateDto,
        createdAt: new Date(),
        updatedAt: new Date(),
        user: {
          id: 'user-1',
          email: 'test@example.com',
        },
      };

      mockPrismaService.member.findUnique.mockResolvedValue(existingMember);
      mockPrismaService.member.update.mockResolvedValue(updatedMember);

      const result = await service.update('member-1', updateDto);

      expect(result.firstName).toBe(updateDto.firstName);
      expect(result.lastName).toBe(updateDto.lastName);
    });

    it('should throw NotFoundException if member not found', async () => {
      mockPrismaService.member.findUnique.mockResolvedValue(null);

      await expect(
        service.update('non-existent', { firstName: 'Jane' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deactivate', () => {
    it('should deactivate a member', async () => {
      const existingMember = {
        id: 'member-1',
        isActive: true,
      };

      mockPrismaService.member.findUnique.mockResolvedValue(existingMember);
      mockPrismaService.member.update.mockResolvedValue({
        ...existingMember,
        isActive: false,
      });

      await service.deactivate('member-1');

      expect(mockPrismaService.member.update).toHaveBeenCalledWith({
        where: { id: 'member-1' },
        data: { isActive: false },
      });
    });

    it('should throw NotFoundException if member not found', async () => {
      mockPrismaService.member.findUnique.mockResolvedValue(null);

      await expect(service.deactivate('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('hasActiveMembership', () => {
    it('should return true if member has active membership', async () => {
      mockPrismaService.membership.findFirst.mockResolvedValue({
        id: 'membership-1',
        status: 'ACTIVE',
      });

      const result = await service.hasActiveMembership('member-1');

      expect(result).toBe(true);
    });

    it('should return false if member has no active membership', async () => {
      mockPrismaService.membership.findFirst.mockResolvedValue(null);

      const result = await service.hasActiveMembership('member-1');

      expect(result).toBe(false);
    });
  });

  describe('getBookings', () => {
    it('should return all bookings for a member', async () => {
      const mockMember = {
        id: 'member-1',
        userId: 'user-1',
        firstName: 'John',
        lastName: 'Doe',
        isActive: true,
      };

      const mockBookings = [
        {
          id: 'booking-1',
          memberId: 'member-1',
          classId: 'class-1',
          status: 'CONFIRMED',
          createdAt: new Date(),
          updatedAt: new Date(),
          class: {
            id: 'class-1',
            name: 'Yoga Class',
            description: 'Morning yoga',
            schedule: new Date(),
            duration: 60,
            capacity: 20,
            classType: 'yoga',
            trainer: {
              id: 'trainer-1',
              firstName: 'Jane',
              lastName: 'Smith',
            },
          },
        },
      ];

      mockPrismaService.member.findUnique.mockResolvedValue(mockMember);
      mockPrismaService.classBooking.findMany.mockResolvedValue(mockBookings);

      const result = await service.getBookings('member-1');

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('booking-1');
      expect(result[0].status).toBe('CONFIRMED');
      expect(result[0].class.name).toBe('Yoga Class');
      expect(result[0].class.trainer.firstName).toBe('Jane');
    });

    it('should throw NotFoundException if member not found', async () => {
      mockPrismaService.member.findUnique.mockResolvedValue(null);

      await expect(service.getBookings('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return empty array if member has no bookings', async () => {
      const mockMember = {
        id: 'member-1',
        userId: 'user-1',
        firstName: 'John',
        lastName: 'Doe',
        isActive: true,
      };

      mockPrismaService.member.findUnique.mockResolvedValue(mockMember);
      mockPrismaService.classBooking.findMany.mockResolvedValue([]);

      const result = await service.getBookings('member-1');

      expect(result).toHaveLength(0);
    });
  });
});
