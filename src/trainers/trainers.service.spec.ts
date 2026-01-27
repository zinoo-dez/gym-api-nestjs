import { Test, TestingModule } from '@nestjs/testing';
import { TrainersService } from './trainers.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

describe('TrainersService', () => {
  let service: TrainersService;
  let prisma: PrismaService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    trainer: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TrainersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<TrainersService>(TrainersService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createTrainerDto = {
      email: 'trainer@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
      specializations: ['Yoga', 'Pilates'],
      certifications: ['Certified Yoga Instructor'],
    };

    it('should create a trainer successfully', async () => {
      const mockUser = {
        id: 'user-id',
        email: createTrainerDto.email,
        password: 'hashed-password',
        role: Role.TRAINER,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockTrainer = {
        id: 'trainer-id',
        userId: mockUser.id,
        firstName: createTrainerDto.firstName,
        lastName: createTrainerDto.lastName,
        specializations: createTrainerDto.specializations,
        certifications: createTrainerDto.certifications,
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
      mockPrismaService.trainer.create.mockResolvedValue(mockTrainer);

      const result = await service.create(createTrainerDto);

      expect(result).toEqual({
        id: mockTrainer.id,
        email: mockUser.email,
        firstName: mockTrainer.firstName,
        lastName: mockTrainer.lastName,
        specializations: mockTrainer.specializations,
        certifications: mockTrainer.certifications,
        isActive: mockTrainer.isActive,
        createdAt: mockTrainer.createdAt,
        updatedAt: mockTrainer.updatedAt,
      });
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: createTrainerDto.email },
      });
    });

    it('should throw ConflictException if email already exists', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'existing-user-id',
        email: createTrainerDto.email,
      });

      await expect(service.create(createTrainerDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of trainers', async () => {
      const mockTrainers = [
        {
          id: 'trainer-1',
          userId: 'user-1',
          firstName: 'John',
          lastName: 'Doe',
          specializations: ['Yoga'],
          certifications: ['Cert1'],
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          user: {
            id: 'user-1',
            email: 'john@example.com',
            password: 'hashed',
            role: Role.TRAINER,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
      ];

      mockPrismaService.trainer.findMany.mockResolvedValue(mockTrainers);

      const result = await service.findAll();

      expect(result).toHaveLength(1);
      expect(result[0].email).toBe('john@example.com');
      expect(mockPrismaService.trainer.findMany).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a trainer by id', async () => {
      const mockTrainer = {
        id: 'trainer-1',
        userId: 'user-1',
        firstName: 'John',
        lastName: 'Doe',
        specializations: ['Yoga'],
        certifications: ['Cert1'],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        user: {
          id: 'user-1',
          email: 'john@example.com',
          password: 'hashed',
          role: Role.TRAINER,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };

      mockPrismaService.trainer.findUnique.mockResolvedValue(mockTrainer);

      const result = await service.findOne('trainer-1');

      expect(result.id).toBe('trainer-1');
      expect(result.email).toBe('john@example.com');
    });

    it('should throw NotFoundException if trainer not found', async () => {
      mockPrismaService.trainer.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a trainer successfully', async () => {
      const updateDto = {
        firstName: 'Jane',
        specializations: ['Cardio'],
      };

      const existingTrainer = {
        id: 'trainer-1',
        userId: 'user-1',
        firstName: 'John',
        lastName: 'Doe',
        specializations: ['Yoga'],
        certifications: ['Cert1'],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedTrainer = {
        ...existingTrainer,
        ...updateDto,
        user: {
          id: 'user-1',
          email: 'john@example.com',
          password: 'hashed',
          role: Role.TRAINER,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };

      mockPrismaService.trainer.findUnique.mockResolvedValue(existingTrainer);
      mockPrismaService.trainer.update.mockResolvedValue(updatedTrainer);

      const result = await service.update('trainer-1', updateDto);

      expect(result.firstName).toBe('Jane');
      expect(result.specializations).toEqual(['Cardio']);
    });

    it('should throw NotFoundException if trainer not found', async () => {
      mockPrismaService.trainer.findUnique.mockResolvedValue(null);

      await expect(
        service.update('non-existent-id', { firstName: 'Jane' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deactivate', () => {
    it('should deactivate a trainer successfully', async () => {
      const existingTrainer = {
        id: 'trainer-1',
        userId: 'user-1',
        firstName: 'John',
        lastName: 'Doe',
        specializations: ['Yoga'],
        certifications: ['Cert1'],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.trainer.findUnique.mockResolvedValue(existingTrainer);
      mockPrismaService.trainer.update.mockResolvedValue({
        ...existingTrainer,
        isActive: false,
      });

      await service.deactivate('trainer-1');

      expect(mockPrismaService.trainer.update).toHaveBeenCalledWith({
        where: { id: 'trainer-1' },
        data: { isActive: false },
      });
    });

    it('should throw NotFoundException if trainer not found', async () => {
      mockPrismaService.trainer.findUnique.mockResolvedValue(null);

      await expect(service.deactivate('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
