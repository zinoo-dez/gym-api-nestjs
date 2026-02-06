import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateGymSettingDto } from './dto';

@Injectable()
export class GymSettingsService {
  constructor(private prisma: PrismaService) {}

  async getSettings() {
    const settings = await this.prisma.gymSetting.findFirst();

    if (!settings) {
      // Create default settings if none exist
      return this.prisma.gymSetting.create({
        data: {
          name: 'PowerFit Gym',
          tagLine: 'Transform Your Body, Transform Your Life',
          address: '123 Fitness Street, Workout City, WC 12345',
          phone: '+1 (555) 123-4567',
          email: 'info@powerfit.com',
          logo: '/logo.png',
          description:
            'State-of-the-art fitness facility with world-class equipment and expert trainers.',
          favicon: '/favicon.ico',
          primaryColor: '#22c55e',
          secondaryColor: '#4ade80',
        },
      });
    }

    return settings;
  }

  async updateSettings(dto: UpdateGymSettingDto) {
    const settings = await this.prisma.gymSetting.findFirst();

    if (!settings) {
      throw new NotFoundException('Gym settings not found');
    }

    return this.prisma.gymSetting.update({
      where: { id: settings.id },
      data: dto,
    });
  }
}
