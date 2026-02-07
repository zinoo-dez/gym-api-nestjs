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
      primaryColor: '#22c55e',
      secondaryColor: '#4ade80',
      backgroundColor: '#0a0a0a',
      textColor: '#ffffff',
      heroTitle: 'Build your strongest self',
      heroSubtitle:
        'World-class training, expert coaches, and a community that pushes you forward.',
      heroCtaPrimary: 'Start Free Trial',
      heroCtaSecondary: 'View Membership Plans',
      featuresTitle: 'World-Class Facilities',
      featuresSubtitle:
        'Premium equipment, expert guidance, and a space built for results.',
      classesTitle: 'Group Fitness Classes',
      classesSubtitle:
        'Find the perfect class to match your goals and schedule.',
      trainersTitle: 'Expert Trainers',
      trainersSubtitle:
        'Certified professionals focused on your progress and performance.',
      workoutsTitle: 'Workout Plans',
      workoutsSubtitle:
        'Structured programs designed to help you reach your goals.',
      pricingTitle: 'Transparent Pricing',
      pricingSubtitle: 'Choose a plan that fits your lifestyle and goals.',
      footerTagline: 'Train smarter. Live stronger.',
      appShowcaseTitle: 'Your Gym, In Your Pocket',
      appShowcaseSubtitle:
        'Book classes, track progress, and manage your membership anywhere.',
      ctaTitle: 'Ready to start?',
      ctaSubtitle:
        'Join today and get access to world-class facilities and expert coaching.',
      ctaButtonLabel: 'Get Started',
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
          primaryColor: process.env.GYM_PRIMARY_COLOR ?? defaults.primaryColor,
          secondaryColor:
            process.env.GYM_SECONDARY_COLOR ?? defaults.secondaryColor,
          backgroundColor:
            process.env.GYM_BACKGROUND_COLOR ?? defaults.backgroundColor,
          textColor: process.env.GYM_TEXT_COLOR ?? defaults.textColor,
          heroTitle: process.env.GYM_HERO_TITLE ?? defaults.heroTitle,
          heroSubtitle: process.env.GYM_HERO_SUBTITLE ?? defaults.heroSubtitle,
          heroCtaPrimary:
            process.env.GYM_HERO_CTA_PRIMARY ?? defaults.heroCtaPrimary,
          heroCtaSecondary:
            process.env.GYM_HERO_CTA_SECONDARY ?? defaults.heroCtaSecondary,
          featuresTitle:
            process.env.GYM_FEATURES_TITLE ?? defaults.featuresTitle,
          featuresSubtitle:
            process.env.GYM_FEATURES_SUBTITLE ?? defaults.featuresSubtitle,
          classesTitle:
            process.env.GYM_CLASSES_TITLE ?? defaults.classesTitle,
          classesSubtitle:
            process.env.GYM_CLASSES_SUBTITLE ?? defaults.classesSubtitle,
          trainersTitle:
            process.env.GYM_TRAINERS_TITLE ?? defaults.trainersTitle,
          trainersSubtitle:
            process.env.GYM_TRAINERS_SUBTITLE ?? defaults.trainersSubtitle,
          workoutsTitle:
            process.env.GYM_WORKOUTS_TITLE ?? defaults.workoutsTitle,
          workoutsSubtitle:
            process.env.GYM_WORKOUTS_SUBTITLE ?? defaults.workoutsSubtitle,
          pricingTitle:
            process.env.GYM_PRICING_TITLE ?? defaults.pricingTitle,
          pricingSubtitle:
            process.env.GYM_PRICING_SUBTITLE ?? defaults.pricingSubtitle,
          footerTagline:
            process.env.GYM_FOOTER_TAGLINE ?? defaults.footerTagline,
          appShowcaseTitle:
            process.env.GYM_APP_SHOWCASE_TITLE ?? defaults.appShowcaseTitle,
          appShowcaseSubtitle:
            process.env.GYM_APP_SHOWCASE_SUBTITLE ??
            defaults.appShowcaseSubtitle,
          ctaTitle: process.env.GYM_CTA_TITLE ?? defaults.ctaTitle,
          ctaSubtitle: process.env.GYM_CTA_SUBTITLE ?? defaults.ctaSubtitle,
          ctaButtonLabel:
            process.env.GYM_CTA_BUTTON_LABEL ?? defaults.ctaButtonLabel,
        },
      });
    }

    return {
      ...settings,
      name: settings.name || defaults.name,
      tagLine: settings.tagLine || defaults.tagLine,
      description: settings.description || defaults.description,
      primaryColor: settings.primaryColor || defaults.primaryColor,
      secondaryColor: settings.secondaryColor || defaults.secondaryColor,
      backgroundColor: settings.backgroundColor || defaults.backgroundColor,
      textColor: settings.textColor || defaults.textColor,
      heroTitle: settings.heroTitle || defaults.heroTitle,
      heroSubtitle: settings.heroSubtitle || defaults.heroSubtitle,
      heroCtaPrimary: settings.heroCtaPrimary || defaults.heroCtaPrimary,
      heroCtaSecondary: settings.heroCtaSecondary || defaults.heroCtaSecondary,
      featuresTitle: settings.featuresTitle || defaults.featuresTitle,
      featuresSubtitle:
        settings.featuresSubtitle || defaults.featuresSubtitle,
      classesTitle: settings.classesTitle || defaults.classesTitle,
      classesSubtitle: settings.classesSubtitle || defaults.classesSubtitle,
      trainersTitle: settings.trainersTitle || defaults.trainersTitle,
      trainersSubtitle: settings.trainersSubtitle || defaults.trainersSubtitle,
      workoutsTitle: settings.workoutsTitle || defaults.workoutsTitle,
      workoutsSubtitle: settings.workoutsSubtitle || defaults.workoutsSubtitle,
      pricingTitle: settings.pricingTitle || defaults.pricingTitle,
      pricingSubtitle: settings.pricingSubtitle || defaults.pricingSubtitle,
      footerTagline: settings.footerTagline || defaults.footerTagline,
      appShowcaseTitle:
        settings.appShowcaseTitle || defaults.appShowcaseTitle,
      appShowcaseSubtitle:
        settings.appShowcaseSubtitle || defaults.appShowcaseSubtitle,
      ctaTitle: settings.ctaTitle || defaults.ctaTitle,
      ctaSubtitle: settings.ctaSubtitle || defaults.ctaSubtitle,
      ctaButtonLabel: settings.ctaButtonLabel || defaults.ctaButtonLabel,
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
      heroSubtitle: sanitizeContent(dto.heroSubtitle),
      featuresSubtitle: sanitizeContent(dto.featuresSubtitle),
      classesSubtitle: sanitizeContent(dto.classesSubtitle),
      trainersSubtitle: sanitizeContent(dto.trainersSubtitle),
      workoutsSubtitle: sanitizeContent(dto.workoutsSubtitle),
      pricingSubtitle: sanitizeContent(dto.pricingSubtitle),
      appShowcaseSubtitle: sanitizeContent(dto.appShowcaseSubtitle),
      ctaSubtitle: sanitizeContent(dto.ctaSubtitle),
      footerTagline: sanitizeContent(dto.footerTagline),
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
