import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateGymSettingDto } from './dto';

@Injectable()
export class GymSettingsService {
  constructor(private prisma: PrismaService) {}

  async getSettings() {
    const settings = await this.prisma.gymSetting.findFirst();

    if (!settings) {
      // Create settings with environment-driven defaults to avoid hardcoded values
      return this.prisma.gymSetting.create({
        data: {
          name: process.env.GYM_NAME ?? '',
          tagLine: process.env.GYM_TAGLINE ?? '',
          address: process.env.GYM_ADDRESS ?? '',
          phone: process.env.GYM_PHONE ?? '',
          email: process.env.GYM_EMAIL ?? '',
          logo: process.env.GYM_LOGO ?? '',
          description: process.env.GYM_DESCRIPTION ?? '',
          favicon: process.env.GYM_FAVICON ?? '',
          primaryColor: process.env.GYM_PRIMARY_COLOR ?? '',
          secondaryColor: process.env.GYM_SECONDARY_COLOR ?? '',
          backgroundColor: process.env.GYM_BACKGROUND_COLOR ?? '',
          textColor: process.env.GYM_TEXT_COLOR ?? '',
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
