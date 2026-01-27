import { Test, TestingModule } from '@nestjs/testing';
import { ClassesService } from './classes.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { BookingStatus } from '@prisma/client';

describe('ClassesService', () => {
  let service: ClassesService;
  let prisma: PrismaService;

  const mockPrismaService = {
    class: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    trainer: {
      findUnique: jest.fn(),
    },
    member: {
      findUnique: jest.fn(),
    },
    classBooking: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClassesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ClassesService>(ClassesService);
    prisma = module.get<PrismaService>(PrismaService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw NotFoundException when trainer does not exist', async () => {
      mockPrismaService.trainer.findUnique.mockResolvedValue(null);

      await expect(
        service.create({
          name: 'Yoga Class',
          trainerId: 'non-existent-id',
          schedule: new Date().toISOString(),
          duration: 60,
          capacity: 20,
          classType: 'yoga',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when trainer is not active', async () => {
      mockPrismaService.trainer.findUnique.mockResolvedValue({
        id: 'trainer-1',
        isActive: false,
      });

      await expect(
        service.create({
          name: 'Yoga Class',
          trainerId: 'trainer-1',
          schedule: new Date().toISOString(),
          duration: 60,
          capacity: 20,
          classType: 'yoga',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException when trainer has scheduling conflict', async () => {
      const schedule = new Date('2026-02-01T10:00:00Z');
      mockPrismaService.trainer.findUnique.mockResolvedValue({
        id: 'trainer-1',
        isActive: true,
      });

      // Mock existing class that overlaps
      mockPrismaService.class.findMany.mockResolvedValue([
        {
          id: 'class-1',
          trainerId: 'trainer-1',
          schedule: new Date('2026-02-01T09:30:00Z'),
          duration: 60,
          isActive: true,
        },
      ]);

      await expect(
        service.create({
          name: 'Yoga Class',
          trainerId: 'trainer-1',
          schedule: schedule.toISOString(),
          duration: 60,
          capacity: 20,
          classType: 'yoga',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should create class successfully when all validations pass', async () => {
      const schedule = new Date('2026-02-01T10:00:00Z');
      mockPrismaService.trainer.findUnique.mockResolvedValue({
        id: 'trainer-1',
        isActive: true,
        firstName: 'John',
        lastName: 'Doe',
      });

      mockPrismaService.class.findMany.mockResolvedValue([]);

      mockPrismaService.class.create.mockResolvedValue({
        id: 'class-1',
        name: 'Yoga Class',
        description: null,
        trainerId: 'trainer-1',
        schedule,
        duration: 60,
        capacity: 20,
        classType: 'yoga',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        trainer: {
          id: 'trainer-1',
          firstName: 'John',
          lastName: 'Doe',
        },
      });

      const result = await service.create({
        name: 'Yoga Class',
        trainerId: 'trainer-1',
        schedule: schedule.toISOString(),
        duration: 60,
        capacity: 20,
        classType: 'yoga',
      });

      expect(result).toBeDefined();
      expect(result.name).toBe('Yoga Class');
      expect(result.trainerId).toBe('trainer-1');
    });
  });

  describe('bookClass', () => {
    it('should throw NotFoundException when member does not exist', async () => {
      mockPrismaService.member.findUnique.mockResolvedValue(null);

      await expect(
        service.bookClass({
          memberId: 'non-existent-id',
          classId: 'class-1',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when class does not exist', async () => {
      mockPrismaService.member.findUnique.mockResolvedValue({
        id: 'member-1',
        isActive: true,
      });
      mockPrismaService.class.findUnique.mockResolvedValue(null);

      await expect(
        service.bookClass({
          memberId: 'member-1',
          classId: 'non-existent-id',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when member already has confirmed booking', async () => {
      mockPrismaService.member.findUnique.mockResolvedValue({
        id: 'member-1',
        isActive: true,
      });
      mockPrismaService.class.findUnique.mockResolvedValueOnce({
        id: 'class-1',
        isActive: true,
        capacity: 20,
      });
      mockPrismaService.classBooking.findUnique.mockResolvedValue({
        id: 'booking-1',
        memberId: 'member-1',
        classId: 'class-1',
        status: BookingStatus.CONFIRMED,
      });

      await expect(
        service.bookClass({
          memberId: 'member-1',
          classId: 'class-1',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException when class is at full capacity', async () => {
      mockPrismaService.member.findUnique.mockResolvedValue({
        id: 'member-1',
        isActive: true,
      });
      mockPrismaService.class.findUnique.mockResolvedValueOnce({
        id: 'class-1',
        isActive: true,
        capacity: 1,
      });
      mockPrismaService.classBooking.findUnique.mockResolvedValue(null);

      // Mock hasCapacity to return false
      mockPrismaService.class.findUnique.mockResolvedValueOnce({
        id: 'class-1',
        capacity: 1,
        bookings: [{ id: 'booking-1', status: BookingStatus.CONFIRMED }],
      });

      await expect(
        service.bookClass({
          memberId: 'member-1',
          classId: 'class-1',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('cancelBooking', () => {
    it('should throw NotFoundException when booking does not exist', async () => {
      mockPrismaService.classBooking.findUnique.mockResolvedValue(null);

      await expect(service.cancelBooking('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException when booking is already cancelled', async () => {
      mockPrismaService.classBooking.findUnique.mockResolvedValue({
        id: 'booking-1',
        status: BookingStatus.CANCELLED,
      });

      await expect(service.cancelBooking('booking-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should cancel booking successfully', async () => {
      mockPrismaService.classBooking.findUnique.mockResolvedValue({
        id: 'booking-1',
        status: BookingStatus.CONFIRMED,
      });
      mockPrismaService.classBooking.update.mockResolvedValue({
        id: 'booking-1',
        status: BookingStatus.CANCELLED,
      });

      await expect(service.cancelBooking('booking-1')).resolves.not.toThrow();
      expect(mockPrismaService.classBooking.update).toHaveBeenCalledWith({
        where: { id: 'booking-1' },
        data: { status: BookingStatus.CANCELLED },
      });
    });
  });

  describe('hasCapacity', () => {
    it('should return false when class does not exist', async () => {
      mockPrismaService.class.findUnique.mockResolvedValue(null);

      const result = await service.hasCapacity('non-existent-id');
      expect(result).toBe(false);
    });

    it('should return true when class has available capacity', async () => {
      mockPrismaService.class.findUnique.mockResolvedValue({
        id: 'class-1',
        capacity: 20,
        bookings: [
          { id: 'booking-1', status: BookingStatus.CONFIRMED },
          { id: 'booking-2', status: BookingStatus.CONFIRMED },
        ],
      });

      const result = await service.hasCapacity('class-1');
      expect(result).toBe(true);
    });

    it('should return false when class is at full capacity', async () => {
      mockPrismaService.class.findUnique.mockResolvedValue({
        id: 'class-1',
        capacity: 2,
        bookings: [
          { id: 'booking-1', status: BookingStatus.CONFIRMED },
          { id: 'booking-2', status: BookingStatus.CONFIRMED },
        ],
      });

      const result = await service.hasCapacity('class-1');
      expect(result).toBe(false);
    });
  });

  describe('hasScheduleConflict', () => {
    it('should return false when no overlapping classes exist', async () => {
      mockPrismaService.class.findMany.mockResolvedValue([]);

      const result = await service.hasScheduleConflict(
        'trainer-1',
        new Date('2026-02-01T10:00:00Z'),
        60,
      );

      expect(result).toBe(false);
    });

    it('should return true when classes overlap', async () => {
      mockPrismaService.class.findMany.mockResolvedValue([
        {
          id: 'class-1',
          trainerId: 'trainer-1',
          schedule: new Date('2026-02-01T09:30:00Z'),
          duration: 60,
          isActive: true,
        },
      ]);

      const result = await service.hasScheduleConflict(
        'trainer-1',
        new Date('2026-02-01T10:00:00Z'),
        60,
      );

      expect(result).toBe(true);
    });

    it('should exclude specified class from conflict check', async () => {
      mockPrismaService.class.findMany.mockResolvedValue([]);

      const result = await service.hasScheduleConflict(
        'trainer-1',
        new Date('2026-02-01T10:00:00Z'),
        60,
        'class-1',
      );

      expect(result).toBe(false);
    });
  });
});
