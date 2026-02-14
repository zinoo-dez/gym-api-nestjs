import { Injectable, NotFoundException } from '@nestjs/common';
import sanitizeHtml from 'sanitize-html';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateGymSettingDto } from './dto';
import { NotificationsService } from '../notifications/notifications.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class GymSettingsService {
  constructor(
    private prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async getSettings() {
    const defaults = {
      name: 'Your Gym',
      tagLine: 'Train smarter. Live stronger.',
      address: '',
      phone: '',
      email: '',
      logo: '',
      description:
        'Everything you need to achieve your fitness goals under one roof, backed by expert support.',
      favicon: '',
    };

    const settings = await this.prisma.gymSetting.findFirst();

    if (!settings) {
      // Create settings with environment-driven defaults to avoid hardcoded values
      return this.prisma.gymSetting.create({
        data: {
          name: process.env.GYM_NAME ?? defaults.name,
          tagLine: process.env.GYM_TAGLINE ?? defaults.tagLine,
          address: process.env.GYM_ADDRESS ?? defaults.address,
          phone: process.env.GYM_PHONE ?? defaults.phone,
          email: process.env.GYM_EMAIL ?? defaults.email,
          logo: process.env.GYM_LOGO ?? defaults.logo,
          description: process.env.GYM_DESCRIPTION ?? defaults.description,
          favicon: process.env.GYM_FAVICON ?? defaults.favicon,
        },
      });
    }

    return {
      ...settings,
      name: settings?.name || defaults.name,
      tagLine: settings?.tagLine || defaults.tagLine,
      description: settings?.description || defaults.description,
    };
  }

  async updateSettings(dto: UpdateGymSettingDto) {
    const settings = await this.prisma.gymSetting.findFirst();

    if (!settings) {
      throw new NotFoundException('Gym settings not found');
    }

    const sanitizeContent = (value?: string) => {
      if (value === undefined) return value;
      return sanitizeHtml(value, {
        allowedTags: [
          'p',
          'br',
          'strong',
          'em',
          'u',
          'a',
          'ul',
          'ol',
          'li',
          'img',
          'span',
          'div',
          'h1',
          'h2',
          'h3',
          'h4',
          'h5',
          'h6',
          'blockquote',
        ],
        allowedAttributes: {
          a: ['href', 'target', 'rel'],
          img: ['src', 'alt'],
          span: ['style'],
          div: ['style'],
        },
        allowedSchemes: ['http', 'https', 'data'],
        allowProtocolRelative: false,
      });
    };

    const sanitizedDto: UpdateGymSettingDto = {
      ...dto,
      description: sanitizeContent(dto.description),
    };

    const updated = await this.prisma.gymSetting.update({
      where: { id: settings.id },
      data: sanitizedDto,
    });

    if (settings.newGymSettingNotification !== false) {
      await this.notificationsService.createForRole({
        role: UserRole.ADMIN,
        title: 'Gym settings updated',
        message: 'Gym settings were updated.',
        type: 'info',
        actionUrl: '/admin/settings',
      });
    }

    return updated;
  }
}
