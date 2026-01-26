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
    },
    membership: {
      findFirst: jest.fn(),
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
});
