import { Test, TestingModule } from '@nestjs/testing';
import { WorkoutPlansService } from './workout-plans.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { WorkoutGoal } from '@prisma/client';

describe('WorkoutPlansService', () => {
  let service: WorkoutPlansService;

  const mockPrismaService = {
    member: {
      findUnique: jest.fn(),
    },
    trainer: {
      findUnique: jest.fn(),
    },
    workoutPlan: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    exercise: {
      deleteMany: jest.fn(),
    },
    workoutPlanVersion: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkoutPlansService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<WorkoutPlansService>(WorkoutPlansService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a workout plan with exercises', async () => {
      const memberId = 'member-123';
      const userId = 'user-123';
      const trainerId = 'trainer-123';
      const createDto = {
        name: 'Strength Training',
        description: 'Build muscle',
        memberId,
        goal: WorkoutGoal.MUSCLE_GAIN,
        exercises: [
          {
            name: 'Bench Press',
            sets: 3,
            reps: 10,
            targetMuscles: ['chest', 'triceps'],
            order: 0,
          },
        ],
      };

      const mockMember = { id: memberId };
      const mockTrainer = { id: trainerId, userId };
      const mockWorkoutPlan = {
        id: 'plan-123',
        name: createDto.name,
        description: createDto.description,
        memberId,
        trainerId,
        goal: createDto.goal,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        exercises: [
          {
            id: 'exercise-123',
            name: 'Bench Press',
            sets: 3,
            reps: 10,
            targetMuscles: ['chest', 'triceps'],
            order: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      };

      mockPrismaService.member.findUnique.mockResolvedValue(mockMember);
      mockPrismaService.trainer.findUnique.mockResolvedValue(mockTrainer);
      mockPrismaService.workoutPlan.create.mockResolvedValue(mockWorkoutPlan);

      const result = await service.create(createDto, userId);

      expect(result).toBeDefined();
      expect(result.name).toBe(createDto.name);
      expect(result.exercises).toHaveLength(1);
      expect(mockPrismaService.member.findUnique).toHaveBeenCalledWith({
        where: { id: memberId },
        select: { id: true },
      });
      expect(mockPrismaService.trainer.findUnique).toHaveBeenCalledWith({
        where: { userId },
        select: { id: true },
      });
    });

    it('should throw NotFoundException if member does not exist', async () => {
      const createDto = {
        name: 'Strength Training',
        memberId: 'invalid-member',
        goal: WorkoutGoal.MUSCLE_GAIN,
        exercises: [],
      };

      mockPrismaService.member.findUnique.mockResolvedValue(null);

      await expect(service.create(createDto, 'user-123')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if trainer does not exist', async () => {
      const createDto = {
        name: 'Strength Training',
        memberId: 'member-123',
        goal: WorkoutGoal.MUSCLE_GAIN,
        exercises: [],
      };

      mockPrismaService.member.findUnique.mockResolvedValue({
        id: 'member-123',
      });
      mockPrismaService.trainer.findUnique.mockResolvedValue(null);

      await expect(service.create(createDto, 'invalid-user')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException for duplicate exercise orders', async () => {
      const createDto = {
        name: 'Strength Training',
        memberId: 'member-123',
        goal: WorkoutGoal.MUSCLE_GAIN,
        exercises: [
          {
            name: 'Bench Press',
            sets: 3,
            reps: 10,
            targetMuscles: ['chest'],
            order: 0,
          },
          {
            name: 'Squats',
            sets: 3,
            reps: 10,
            targetMuscles: ['legs'],
            order: 0, // Duplicate order
          },
        ],
      };

      mockPrismaService.member.findUnique.mockResolvedValue({
        id: 'member-123',
      });
      mockPrismaService.trainer.findUnique.mockResolvedValue({
        id: 'trainer-123',
        userId: 'user-123',
      });

      await expect(service.create(createDto, 'user-123')).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.create(createDto, 'user-123')).rejects.toThrow(
        'Exercise orders must be unique',
      );
    });

    it('should throw BadRequestException for negative exercise orders', async () => {
      const createDto = {
        name: 'Strength Training',
        memberId: 'member-123',
        goal: WorkoutGoal.MUSCLE_GAIN,
        exercises: [
          {
            name: 'Bench Press',
            sets: 3,
            reps: 10,
            targetMuscles: ['chest'],
            order: -1, // Negative order
          },
        ],
      };

      mockPrismaService.member.findUnique.mockResolvedValue({
        id: 'member-123',
      });
      mockPrismaService.trainer.findUnique.mockResolvedValue({
        id: 'trainer-123',
        userId: 'user-123',
      });

      await expect(service.create(createDto, 'user-123')).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.create(createDto, 'user-123')).rejects.toThrow(
        'Exercise orders must be non-negative',
      );
    });

    it('should accept exercises with unique non-negative orders', async () => {
      const memberId = 'member-123';
      const userId = 'user-123';
      const trainerId = 'trainer-123';
      const createDto = {
        name: 'Strength Training',
        description: 'Build muscle',
        memberId,
        goal: WorkoutGoal.MUSCLE_GAIN,
        exercises: [
          {
            name: 'Bench Press',
            sets: 3,
            reps: 10,
            targetMuscles: ['chest', 'triceps'],
            order: 0,
          },
          {
            name: 'Squats',
            sets: 4,
            reps: 8,
            targetMuscles: ['legs', 'glutes'],
            order: 1,
          },
          {
            name: 'Deadlifts',
            sets: 3,
            reps: 5,
            targetMuscles: ['back', 'legs'],
            order: 2,
          },
        ],
      };

      const mockMember = { id: memberId };
      const mockTrainer = { id: trainerId, userId };
      const mockWorkoutPlan = {
        id: 'plan-123',
        name: createDto.name,
        description: createDto.description,
        memberId,
        trainerId,
        goal: createDto.goal,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        exercises: createDto.exercises.map((ex, idx) => ({
          id: `exercise-${idx}`,
          ...ex,
          createdAt: new Date(),
          updatedAt: new Date(),
        })),
      };

      mockPrismaService.member.findUnique.mockResolvedValue(mockMember);
      mockPrismaService.trainer.findUnique.mockResolvedValue(mockTrainer);
      mockPrismaService.workoutPlan.create.mockResolvedValue(mockWorkoutPlan);

      const result = await service.create(createDto, userId);

      expect(result).toBeDefined();
      expect(result.exercises).toHaveLength(3);
      expect(result.exercises![0].order).toBe(0);
      expect(result.exercises![1].order).toBe(1);
      expect(result.exercises![2].order).toBe(2);
    });
  });

  describe('findOne', () => {
    it('should return a workout plan with exercises', async () => {
      const mockWorkoutPlan = {
        id: 'plan-123',
        name: 'Strength Training',
        memberId: 'member-123',
        trainerId: 'trainer-123',
        goal: WorkoutGoal.MUSCLE_GAIN,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        exercises: [],
      };

      mockPrismaService.workoutPlan.findUnique.mockResolvedValue(
        mockWorkoutPlan,
      );

      const result = await service.findOne('plan-123');

      expect(result).toBeDefined();
      expect(result.id).toBe('plan-123');
    });

    it('should throw NotFoundException if workout plan does not exist', async () => {
      mockPrismaService.workoutPlan.findUnique.mockResolvedValue(null);

      await expect(service.findOne('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('deactivate', () => {
    it('should deactivate a workout plan', async () => {
      const mockWorkoutPlan = {
        id: 'plan-123',
        isActive: true,
      };

      mockPrismaService.workoutPlan.findUnique.mockResolvedValue(
        mockWorkoutPlan,
      );
      mockPrismaService.workoutPlan.update.mockResolvedValue({
        ...mockWorkoutPlan,
        isActive: false,
      });

      await service.deactivate('plan-123');

      expect(mockPrismaService.workoutPlan.update).toHaveBeenCalledWith({
        where: { id: 'plan-123' },
        data: { isActive: false },
      });
    });

    it('should throw NotFoundException if workout plan does not exist', async () => {
      mockPrismaService.workoutPlan.findUnique.mockResolvedValue(null);

      await expect(service.deactivate('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should throw BadRequestException for duplicate exercise orders on update', async () => {
      const updateDto = {
        name: 'Updated Plan',
        exercises: [
          {
            name: 'Bench Press',
            sets: 3,
            reps: 10,
            targetMuscles: ['chest'],
            order: 0,
          },
          {
            name: 'Squats',
            sets: 3,
            reps: 10,
            targetMuscles: ['legs'],
            order: 0, // Duplicate order
          },
        ],
      };

      mockPrismaService.workoutPlan.findUnique.mockResolvedValue({
        id: 'plan-123',
        isActive: true,
        exercises: [],
      });

      await expect(service.update('plan-123', updateDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.update('plan-123', updateDto)).rejects.toThrow(
        'Exercise orders must be unique',
      );
    });

    it('should update workout plan with valid exercise orders and store version', async () => {
      const updateDto = {
        name: 'Updated Plan',
        exercises: [
          {
            name: 'Bench Press',
            sets: 3,
            reps: 10,
            targetMuscles: ['chest'],
            order: 0,
          },
          {
            name: 'Squats',
            sets: 3,
            reps: 10,
            targetMuscles: ['legs'],
            order: 1,
          },
        ],
      };

      const existingPlan = {
        id: 'plan-123',
        name: 'Original Plan',
        description: 'Original description',
        goal: WorkoutGoal.MUSCLE_GAIN,
        isActive: true,
        exercises: [
          {
            id: 'exercise-old-1',
            name: 'Old Exercise',
            sets: 2,
            reps: 8,
            targetMuscles: ['back'],
            order: 0,
          },
        ],
      };

      const mockUpdatedPlan = {
        id: 'plan-123',
        name: updateDto.name,
        memberId: 'member-123',
        trainerId: 'trainer-123',
        goal: WorkoutGoal.MUSCLE_GAIN,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        exercises: updateDto.exercises.map((ex, idx) => ({
          id: `exercise-${idx}`,
          workoutPlanId: 'plan-123',
          ...ex,
          createdAt: new Date(),
          updatedAt: new Date(),
        })),
      };

      mockPrismaService.workoutPlan.findUnique.mockResolvedValue(existingPlan);
      mockPrismaService.workoutPlanVersion.findFirst.mockResolvedValue(null);
      mockPrismaService.workoutPlanVersion.create.mockResolvedValue({
        id: 'version-1',
        workoutPlanId: 'plan-123',
        version: 1,
      });

      // Mock transaction to execute the callback immediately
      mockPrismaService.$transaction.mockImplementation((callback) => {
        const tx = {
          exercise: mockPrismaService.exercise,
          workoutPlan: mockPrismaService.workoutPlan,
        };
        return callback(tx);
      });

      mockPrismaService.exercise.deleteMany.mockResolvedValue({ count: 1 });
      mockPrismaService.workoutPlan.update.mockResolvedValue(mockUpdatedPlan);

      const result = await service.update('plan-123', updateDto);

      expect(result).toBeDefined();
      expect(result.name).toBe(updateDto.name);
      expect(result.exercises).toHaveLength(2);
      expect(mockPrismaService.workoutPlanVersion.create).toHaveBeenCalled();
      expect(mockPrismaService.exercise.deleteMany).toHaveBeenCalledWith({
        where: { workoutPlanId: 'plan-123' },
      });
    });
  });

  describe('getVersionHistory', () => {
    it('should return version history for a workout plan', async () => {
      const workoutPlanId = 'plan-123';
      const mockVersions = [
        {
          id: 'version-2',
          workoutPlanId,
          version: 2,
          name: 'Version 2',
          description: 'Second version',
          goal: WorkoutGoal.MUSCLE_GAIN,
          exercises: [{ name: 'Exercise 2', sets: 3, reps: 10 }],
          createdAt: new Date(),
        },
        {
          id: 'version-1',
          workoutPlanId,
          version: 1,
          name: 'Version 1',
          description: 'First version',
          goal: WorkoutGoal.MUSCLE_GAIN,
          exercises: [{ name: 'Exercise 1', sets: 2, reps: 8 }],
          createdAt: new Date(),
        },
      ];

      mockPrismaService.workoutPlan.findUnique.mockResolvedValue({
        id: workoutPlanId,
      });
      mockPrismaService.workoutPlanVersion.findMany.mockResolvedValue(
        mockVersions,
      );

      const result = await service.getVersionHistory(workoutPlanId);

      expect(result).toHaveLength(2);
      expect(result[0].version).toBe(2);
      expect(result[1].version).toBe(1);
      expect(
        mockPrismaService.workoutPlanVersion.findMany,
      ).toHaveBeenCalledWith({
        where: { workoutPlanId },
        orderBy: { version: 'desc' },
      });
    });

    it('should throw NotFoundException if workout plan does not exist', async () => {
      mockPrismaService.workoutPlan.findUnique.mockResolvedValue(null);

      await expect(service.getVersionHistory('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getVersion', () => {
    it('should return a specific version of a workout plan', async () => {
      const workoutPlanId = 'plan-123';
      const version = 1;
      const mockVersion = {
        id: 'version-1',
        workoutPlanId,
        version,
        name: 'Version 1',
        description: 'First version',
        goal: WorkoutGoal.MUSCLE_GAIN,
        exercises: [{ name: 'Exercise 1', sets: 2, reps: 8 }],
        createdAt: new Date(),
      };

      mockPrismaService.workoutPlan.findUnique.mockResolvedValue({
        id: workoutPlanId,
      });
      mockPrismaService.workoutPlanVersion.findUnique.mockResolvedValue(
        mockVersion,
      );

      const result = await service.getVersion(workoutPlanId, version);

      expect(result).toBeDefined();
      expect(result.version).toBe(version);
      expect(result.name).toBe('Version 1');
      expect(
        mockPrismaService.workoutPlanVersion.findUnique,
      ).toHaveBeenCalledWith({
        where: {
          workoutPlanId_version: {
            workoutPlanId,
            version,
          },
        },
      });
    });

    it('should throw NotFoundException if workout plan does not exist', async () => {
      mockPrismaService.workoutPlan.findUnique.mockResolvedValue(null);

      await expect(service.getVersion('invalid-id', 1)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if version does not exist', async () => {
      mockPrismaService.workoutPlan.findUnique.mockResolvedValue({
        id: 'plan-123',
      });
      mockPrismaService.workoutPlanVersion.findUnique.mockResolvedValue(null);

      await expect(service.getVersion('plan-123', 999)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.getVersion('plan-123', 999)).rejects.toThrow(
        'Version 999 not found',
      );
    });
  });
});
