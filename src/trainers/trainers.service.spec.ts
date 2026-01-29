import { Test, TestingModule } from '@nestjs/testing';
import { TrainersService } from './trainers.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';

describe('TrainersService', () => {
  let service: TrainersService;

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
      count: jest.fn(),
    },
    class: {
      findMany: jest.fn(),
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
      mockPrismaService.$transaction.mockImplementation((callback) => {
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

      mockPrismaService.trainer.count.mockResolvedValue(1);
      mockPrismaService.trainer.findMany.mockResolvedValue(mockTrainers);

      const result = await service.findAll();

      expect(result.data).toHaveLength(1);
      expect(result.data[0].email).toBe('john@example.com');
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.total).toBe(1);
      expect(result.totalPages).toBe(1);
      expect(mockPrismaService.trainer.count).toHaveBeenCalled();
      expect(mockPrismaService.trainer.findMany).toHaveBeenCalled();
    });

    it('should filter trainers by specialization', async () => {
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

      mockPrismaService.trainer.count.mockResolvedValue(1);
      mockPrismaService.trainer.findMany.mockResolvedValue(mockTrainers);

      const result = await service.findAll({ specialization: 'Yoga' });

      expect(result.data).toHaveLength(1);
      expect(mockPrismaService.trainer.count).toHaveBeenCalledWith({
        where: {
          specializations: {
            has: 'Yoga',
          },
        },
      });
      expect(mockPrismaService.trainer.findMany).toHaveBeenCalledWith({
        where: {
          specializations: {
            has: 'Yoga',
          },
        },
        include: {
          user: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: 0,
        take: 10,
      });
    });

    it('should filter trainers by availability', async () => {
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

      mockPrismaService.trainer.count.mockResolvedValue(1);
      mockPrismaService.trainer.findMany.mockResolvedValue(mockTrainers);

      const result = await service.findAll({ availability: true });

      expect(result.data).toHaveLength(1);
      expect(mockPrismaService.trainer.count).toHaveBeenCalledWith({
        where: {
          isActive: true,
        },
      });
      expect(mockPrismaService.trainer.findMany).toHaveBeenCalledWith({
        where: {
          isActive: true,
        },
        include: {
          user: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: 0,
        take: 10,
      });
    });
  });

  describe('findOne', () => {
    it('should return a trainer by id with classes', async () => {
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
        classes: [
          {
            id: 'class-1',
            name: 'Morning Yoga',
            schedule: new Date(),
            duration: 60,
            capacity: 20,
            classType: 'Yoga',
          },
        ],
      };

      mockPrismaService.trainer.findUnique.mockResolvedValue(mockTrainer);

      const result = await service.findOne('trainer-1');

      expect(result.id).toBe('trainer-1');
      expect(result.email).toBe('john@example.com');
      expect(result.classes).toBeDefined();
      expect(result.classes).toHaveLength(1);
      expect(result.classes![0].name).toBe('Morning Yoga');
      expect(mockPrismaService.trainer.findUnique).toHaveBeenCalledWith({
        where: { id: 'trainer-1' },
        include: {
          user: true,
          classes: {
            where: {
              isActive: true,
            },
            orderBy: {
              schedule: 'asc',
            },
          },
        },
      });
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

  describe('hasScheduleConflict', () => {
    const trainerId = 'trainer-1';

    it('should return false when no classes exist for the trainer', async () => {
      mockPrismaService.class.findMany.mockResolvedValue([]);

      const schedule = new Date('2024-01-15T10:00:00Z');
      const duration = 60;

      const result = await service.hasScheduleConflict(
        trainerId,
        schedule,
        duration,
      );

      expect(result).toBe(false);
      expect(mockPrismaService.class.findMany).toHaveBeenCalled();
    });

    it('should return false when classes do not overlap', async () => {
      const existingClasses = [
        {
          id: 'class-1',
          schedule: new Date('2024-01-15T08:00:00Z'), // 8:00 AM - 9:00 AM
          duration: 60,
        },
        {
          id: 'class-2',
          schedule: new Date('2024-01-15T12:00:00Z'), // 12:00 PM - 1:00 PM
          duration: 60,
        },
      ];

      mockPrismaService.class.findMany.mockResolvedValue(existingClasses);

      const schedule = new Date('2024-01-15T10:00:00Z'); // 10:00 AM - 11:00 AM
      const duration = 60;

      const result = await service.hasScheduleConflict(
        trainerId,
        schedule,
        duration,
      );

      expect(result).toBe(false);
    });

    it('should return true when classes overlap - new class starts during existing class', async () => {
      const existingClasses = [
        {
          id: 'class-1',
          schedule: new Date('2024-01-15T10:00:00Z'), // 10:00 AM - 11:00 AM
          duration: 60,
        },
      ];

      mockPrismaService.class.findMany.mockResolvedValue(existingClasses);

      const schedule = new Date('2024-01-15T10:30:00Z'); // 10:30 AM - 11:30 AM
      const duration = 60;

      const result = await service.hasScheduleConflict(
        trainerId,
        schedule,
        duration,
      );

      expect(result).toBe(true);
    });

    it('should return true when classes overlap - new class ends during existing class', async () => {
      const existingClasses = [
        {
          id: 'class-1',
          schedule: new Date('2024-01-15T10:00:00Z'), // 10:00 AM - 11:00 AM
          duration: 60,
        },
      ];

      mockPrismaService.class.findMany.mockResolvedValue(existingClasses);

      const schedule = new Date('2024-01-15T09:30:00Z'); // 9:30 AM - 10:30 AM
      const duration = 60;

      const result = await service.hasScheduleConflict(
        trainerId,
        schedule,
        duration,
      );

      expect(result).toBe(true);
    });

    it('should return true when new class completely contains existing class', async () => {
      const existingClasses = [
        {
          id: 'class-1',
          schedule: new Date('2024-01-15T10:30:00Z'), // 10:30 AM - 11:00 AM
          duration: 30,
        },
      ];

      mockPrismaService.class.findMany.mockResolvedValue(existingClasses);

      const schedule = new Date('2024-01-15T10:00:00Z'); // 10:00 AM - 12:00 PM
      const duration = 120;

      const result = await service.hasScheduleConflict(
        trainerId,
        schedule,
        duration,
      );

      expect(result).toBe(true);
    });

    it('should return true when existing class completely contains new class', async () => {
      const existingClasses = [
        {
          id: 'class-1',
          schedule: new Date('2024-01-15T10:00:00Z'), // 10:00 AM - 12:00 PM
          duration: 120,
        },
      ];

      mockPrismaService.class.findMany.mockResolvedValue(existingClasses);

      const schedule = new Date('2024-01-15T10:30:00Z'); // 10:30 AM - 11:00 AM
      const duration = 30;

      const result = await service.hasScheduleConflict(
        trainerId,
        schedule,
        duration,
      );

      expect(result).toBe(true);
    });

    it('should return true when classes have exact same time', async () => {
      const existingClasses = [
        {
          id: 'class-1',
          schedule: new Date('2024-01-15T10:00:00Z'), // 10:00 AM - 11:00 AM
          duration: 60,
        },
      ];

      mockPrismaService.class.findMany.mockResolvedValue(existingClasses);

      const schedule = new Date('2024-01-15T10:00:00Z'); // 10:00 AM - 11:00 AM
      const duration = 60;

      const result = await service.hasScheduleConflict(
        trainerId,
        schedule,
        duration,
      );

      expect(result).toBe(true);
    });

    it('should return false when classes are back-to-back (no overlap)', async () => {
      const existingClasses = [
        {
          id: 'class-1',
          schedule: new Date('2024-01-15T10:00:00Z'), // 10:00 AM - 11:00 AM
          duration: 60,
        },
      ];

      mockPrismaService.class.findMany.mockResolvedValue(existingClasses);

      const schedule = new Date('2024-01-15T11:00:00Z'); // 11:00 AM - 12:00 PM
      const duration = 60;

      const result = await service.hasScheduleConflict(
        trainerId,
        schedule,
        duration,
      );

      expect(result).toBe(false);
    });

    it('should exclude a specific class when excludeClassId is provided', async () => {
      const existingClasses = [
        {
          id: 'class-2',
          schedule: new Date('2024-01-15T12:00:00Z'), // 12:00 PM - 1:00 PM
          duration: 60,
        },
      ];

      mockPrismaService.class.findMany.mockResolvedValue(existingClasses);

      const schedule = new Date('2024-01-15T10:00:00Z'); // 10:00 AM - 11:00 AM
      const duration = 60;

      const result = await service.hasScheduleConflict(
        trainerId,
        schedule,
        duration,
        'class-1', // Exclude class-1 from conflict check
      );

      expect(result).toBe(false);
      expect(mockPrismaService.class.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          trainerId,
          isActive: true,
          id: {
            not: 'class-1',
          },
        }),
        select: {
          id: true,
          schedule: true,
          duration: true,
        },
      });
    });

    it('should only check active classes', async () => {
      mockPrismaService.class.findMany.mockResolvedValue([]);

      const schedule = new Date('2024-01-15T10:00:00Z');
      const duration = 60;

      await service.hasScheduleConflict(trainerId, schedule, duration);

      expect(mockPrismaService.class.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          isActive: true,
        }),
        select: {
          id: true,
          schedule: true,
          duration: true,
        },
      });
    });
  });
});
