import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGymClosureDto, UpdateOperatingHoursDto } from './dto';

@Injectable()
export class GymOperatingHoursService {
  constructor(private prisma: PrismaService) {}

  async getOperatingHours() {
    const hours = await this.prisma.gymOperatingHours.findMany({
      orderBy: { dayOfWeek: 'asc' },
    });

    if (hours.length === 0) {
      // Seed default hours if none exist
      const defaultHours = [
        { dayOfWeek: 0, openTime: '08:00', closeTime: '17:00', isClosed: true }, // Sunday
        {
          dayOfWeek: 1,
          openTime: '06:00',
          closeTime: '22:00',
          isClosed: false,
        }, // Monday
        {
          dayOfWeek: 2,
          openTime: '06:00',
          closeTime: '22:00',
          isClosed: false,
        }, // Tuesday
        {
          dayOfWeek: 3,
          openTime: '06:00',
          closeTime: '22:00',
          isClosed: false,
        }, // Wednesday
        {
          dayOfWeek: 4,
          openTime: '06:00',
          closeTime: '22:00',
          isClosed: false,
        }, // Thursday
        {
          dayOfWeek: 5,
          openTime: '06:00',
          closeTime: '22:00',
          isClosed: false,
        }, // Friday
        {
          dayOfWeek: 6,
          openTime: '08:00',
          closeTime: '20:00',
          isClosed: false,
        }, // Saturday
      ];

      await this.prisma.gymOperatingHours.createMany({
        data: defaultHours,
      });

      return this.prisma.gymOperatingHours.findMany({
        orderBy: { dayOfWeek: 'asc' },
      });
    }

    return hours;
  }

  async updateOperatingHours(dto: UpdateOperatingHoursDto) {
    const { dayOfWeek, ...data } = dto;

    return this.prisma.gymOperatingHours.update({
      where: { dayOfWeek },
      data,
    });
  }

  async getClosures() {
    return this.prisma.gymClosure.findMany({
      where: {
        date: {
          gte: new Date(),
        },
      },
      orderBy: { date: 'asc' },
    });
  }

  async createClosure(dto: CreateGymClosureDto) {
    return this.prisma.gymClosure.create({
      data: {
        date: new Date(dto.date),
        reason: dto.reason,
      },
    });
  }

  async deleteClosure(id: string) {
    const closure = await this.prisma.gymClosure.findUnique({
      where: { id },
    });

    if (!closure) {
      throw new NotFoundException('Closure not found');
    }

    return this.prisma.gymClosure.delete({
      where: { id },
    });
  }
}
