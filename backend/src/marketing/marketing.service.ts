import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  BookingStatus,
  CampaignAudienceType,
  CampaignEventType,
  CampaignRecipientStatus,
  MarketingAutomationType,
  MarketingCampaignStatus,
  NotificationCategory,
  NotificationLogStatus,
  NotificationType,
  Prisma,
  UserRole,
  UserStatus,
} from '@prisma/client';
import { PaginatedResponseDto } from '../common/dto';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  CampaignFiltersDto,
  CreateCampaignDto,
  CreateMarketingAutomationDto,
  CreateMarketingTemplateDto,
  LogCampaignEventDto,
  MarketingAnalyticsResponseDto,
  UpdateCampaignDto,
  UpdateMarketingAutomationDto,
  UpdateMarketingTemplateDto,
} from './dto';

type CampaignRecipientUser = {
  id: string;
  email: string;
  phone: string | null;
  firstName: string;
  lastName: string;
};

@Injectable()
export class MarketingService {
  private readonly logger = new Logger(MarketingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async createTemplate(dto: CreateMarketingTemplateDto) {
    return this.prisma.notificationTemplate.create({
      data: {
        name: dto.name,
        type: dto.type,
        category: dto.category ?? NotificationCategory.MARKETING,
        subject: dto.subject,
        body: dto.body,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async listTemplates() {
    return this.prisma.notificationTemplate.findMany({
      where: { category: NotificationCategory.MARKETING },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateTemplate(id: string, dto: UpdateMarketingTemplateDto) {
    await this.ensureTemplateExists(id);

    return this.prisma.notificationTemplate.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.type !== undefined ? { type: dto.type } : {}),
        ...(dto.category !== undefined ? { category: dto.category } : {}),
        ...(dto.subject !== undefined ? { subject: dto.subject } : {}),
        ...(dto.body !== undefined ? { body: dto.body } : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      },
    });
  }

  async createCampaign(dto: CreateCampaignDto, createdByUserId?: string) {
    if (
      dto.audienceType === CampaignAudienceType.CLASS_ATTENDEES &&
      !dto.classId
    ) {
      throw new BadRequestException(
        'classId is required for CLASS_ATTENDEES campaigns',
      );
    }

    if (
      dto.audienceType === CampaignAudienceType.CUSTOM &&
      !dto.customUserIds?.length
    ) {
      throw new BadRequestException(
        'customUserIds is required for CUSTOM campaigns',
      );
    }

    if (dto.templateId) {
      await this.ensureTemplateExists(dto.templateId);
    }

    const status = dto.status ?? MarketingCampaignStatus.DRAFT;
    if (status === MarketingCampaignStatus.SCHEDULED && !dto.scheduledAt) {
      throw new BadRequestException(
        'scheduledAt is required when status is SCHEDULED',
      );
    }

    return this.prisma.marketingCampaign.create({
      data: {
        name: dto.name,
        description: dto.description,
        type: dto.type,
        category: dto.category ?? NotificationCategory.MARKETING,
        status,
        audienceType: dto.audienceType ?? CampaignAudienceType.ALL_MEMBERS,
        customUserIds: dto.customUserIds ?? [],
        classId: dto.classId,
        templateId: dto.templateId,
        createdByUserId,
        subject: dto.subject,
        content: dto.content,
        specialOffer: dto.specialOffer,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
      },
    });
  }

  async listCampaigns(
    filters: CampaignFiltersDto,
  ): Promise<PaginatedResponseDto<any>> {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.MarketingCampaignWhereInput = {
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.type ? { type: filters.type } : {}),
      ...(filters.audienceType ? { audienceType: filters.audienceType } : {}),
      ...(filters.search
        ? {
            OR: [
              { name: { contains: filters.search, mode: 'insensitive' } },
              {
                description: { contains: filters.search, mode: 'insensitive' },
              },
              { content: { contains: filters.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [total, rows] = await Promise.all([
      this.prisma.marketingCampaign.count({ where }),
      this.prisma.marketingCampaign.findMany({
        where,
        include: {
          _count: { select: { recipients: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    const data = rows.map((row) => ({
      ...row,
      recipientsCount: row._count.recipients,
    }));

    return new PaginatedResponseDto(data, page, limit, total);
  }

  async getCampaign(id: string) {
    const campaign = await this.prisma.marketingCampaign.findUnique({
      where: { id },
      include: {
        recipients: {
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
      },
    });

    if (!campaign) {
      throw new NotFoundException(`Campaign ${id} not found`);
    }

    return campaign;
  }

  async updateCampaign(id: string, dto: UpdateCampaignDto) {
    await this.ensureCampaignExists(id);

    if (dto.templateId) {
      await this.ensureTemplateExists(dto.templateId);
    }

    if (
      dto.audienceType === CampaignAudienceType.CLASS_ATTENDEES &&
      !dto.classId
    ) {
      throw new BadRequestException(
        'classId is required for CLASS_ATTENDEES campaigns',
      );
    }

    if (
      dto.audienceType === CampaignAudienceType.CUSTOM &&
      !dto.customUserIds?.length
    ) {
      throw new BadRequestException(
        'customUserIds is required for CUSTOM campaigns',
      );
    }

    const newStatus = dto.status;
    if (newStatus === MarketingCampaignStatus.SCHEDULED && !dto.scheduledAt) {
      throw new BadRequestException(
        'scheduledAt is required when status is SCHEDULED',
      );
    }

    return this.prisma.marketingCampaign.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.description !== undefined
          ? { description: dto.description }
          : {}),
        ...(dto.type !== undefined ? { type: dto.type } : {}),
        ...(dto.category !== undefined ? { category: dto.category } : {}),
        ...(dto.status !== undefined ? { status: dto.status } : {}),
        ...(dto.audienceType !== undefined
          ? { audienceType: dto.audienceType }
          : {}),
        ...(dto.customUserIds !== undefined
          ? { customUserIds: dto.customUserIds }
          : {}),
        ...(dto.classId !== undefined ? { classId: dto.classId } : {}),
        ...(dto.templateId !== undefined ? { templateId: dto.templateId } : {}),
        ...(dto.subject !== undefined ? { subject: dto.subject } : {}),
        ...(dto.content !== undefined ? { content: dto.content } : {}),
        ...(dto.specialOffer !== undefined
          ? { specialOffer: dto.specialOffer }
          : {}),
        ...(dto.scheduledAt !== undefined
          ? { scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null }
          : {}),
      },
    });
  }

  async sendCampaign(id: string) {
    const campaign = await this.prisma.marketingCampaign.findUnique({
      where: { id },
      include: {
        template: {
          select: { subject: true, body: true },
        },
      },
    });

    if (!campaign) {
      throw new NotFoundException(`Campaign ${id} not found`);
    }

    if (campaign.status === MarketingCampaignStatus.SENDING) {
      throw new BadRequestException('Campaign is currently sending');
    }

    await this.prisma.marketingCampaign.update({
      where: { id },
      data: { status: MarketingCampaignStatus.SENDING },
    });

    const recipients = await this.resolveRecipients(campaign);
    if (!recipients.length) {
      await this.prisma.marketingCampaign.update({
        where: { id },
        data: {
          status: MarketingCampaignStatus.FAILED,
          sentAt: new Date(),
        },
      });
      throw new BadRequestException('No recipients matched campaign audience');
    }

    let deliveredCount = 0;
    let failedCount = 0;

    for (const user of recipients) {
      const destination = this.resolveDestination(campaign.type, user);
      const renderedSubject =
        campaign.subject || campaign.template?.subject
          ? this.renderTemplate(
              campaign.subject ?? campaign.template?.subject ?? '',
              user,
              campaign.specialOffer,
            )
          : null;
      const renderedContent = this.renderTemplate(
        campaign.content || campaign.template?.body || '',
        user,
        campaign.specialOffer,
      );

      if (!destination) {
        failedCount += 1;

        const recipient = await this.prisma.campaignRecipient.upsert({
          where: {
            campaignId_userId_type: {
              campaignId: campaign.id,
              userId: user.id,
              type: campaign.type,
            },
          },
          update: {
            destination: campaign.type,
            status: CampaignRecipientStatus.FAILED,
            failReason: `No destination for ${campaign.type}`,
          },
          create: {
            campaignId: campaign.id,
            userId: user.id,
            destination: campaign.type,
            type: campaign.type,
            status: CampaignRecipientStatus.FAILED,
            failReason: `No destination for ${campaign.type}`,
          },
        });

        await this.prisma.campaignEvent.create({
          data: {
            recipientId: recipient.id,
            eventType: CampaignEventType.FAILED,
            metadata: 'Missing destination',
          },
        });

        continue;
      }

      deliveredCount += 1;

      const recipient = await this.prisma.campaignRecipient.upsert({
        where: {
          campaignId_userId_type: {
            campaignId: campaign.id,
            userId: user.id,
            type: campaign.type,
          },
        },
        update: {
          destination,
          status: CampaignRecipientStatus.SENT,
          sentAt: new Date(),
          failReason: null,
        },
        create: {
          campaignId: campaign.id,
          userId: user.id,
          destination,
          type: campaign.type,
          status: CampaignRecipientStatus.SENT,
          sentAt: new Date(),
        },
      });

      await this.prisma.notificationLog.create({
        data: {
          userId: user.id,
          type: campaign.type,
          category: campaign.category,
          subject: renderedSubject,
          content: renderedContent,
          status: NotificationLogStatus.SENT,
          sentAt: new Date(),
          metadata: JSON.stringify({
            campaignId: campaign.id,
            recipientId: recipient.id,
          }),
        },
      });

      await this.prisma.campaignEvent.create({
        data: {
          recipientId: recipient.id,
          eventType: CampaignEventType.DELIVERED,
        },
      });

      if (campaign.type === NotificationType.IN_APP) {
        await this.notificationsService.createForUser({
          userId: user.id,
          title: renderedSubject ?? campaign.name,
          message: renderedContent,
          type: NotificationType.IN_APP,
          actionUrl: '/member/dashboard',
        });
      }
    }

    const status =
      failedCount === 0
        ? MarketingCampaignStatus.SENT
        : deliveredCount > 0
          ? MarketingCampaignStatus.PARTIAL
          : MarketingCampaignStatus.FAILED;

    await this.prisma.marketingCampaign.update({
      where: { id: campaign.id },
      data: {
        status,
        sentAt: new Date(),
      },
    });

    return {
      campaignId: campaign.id,
      totalRecipients: recipients.length,
      deliveredCount,
      failedCount,
      status,
    };
  }

  async getCampaignAnalytics(
    id: string,
  ): Promise<MarketingAnalyticsResponseDto> {
    await this.ensureCampaignExists(id);

    const [
      totalRecipients,
      deliveredCount,
      failedCount,
      openedCount,
      clickedCount,
    ] = await Promise.all([
      this.prisma.campaignRecipient.count({ where: { campaignId: id } }),
      this.prisma.campaignRecipient.count({
        where: {
          campaignId: id,
          status: {
            in: [
              CampaignRecipientStatus.SENT,
              CampaignRecipientStatus.OPENED,
              CampaignRecipientStatus.CLICKED,
            ],
          },
        },
      }),
      this.prisma.campaignRecipient.count({
        where: {
          campaignId: id,
          status: CampaignRecipientStatus.FAILED,
        },
      }),
      this.prisma.campaignRecipient.count({
        where: {
          campaignId: id,
          OR: [
            { openedAt: { not: null } },
            {
              status: {
                in: [
                  CampaignRecipientStatus.OPENED,
                  CampaignRecipientStatus.CLICKED,
                ],
              },
            },
          ],
        },
      }),
      this.prisma.campaignRecipient.count({
        where: {
          campaignId: id,
          OR: [
            { clickedAt: { not: null } },
            { status: CampaignRecipientStatus.CLICKED },
          ],
        },
      }),
    ]);

    const openRate = deliveredCount
      ? Number(((openedCount / deliveredCount) * 100).toFixed(2))
      : 0;
    const clickRate = deliveredCount
      ? Number(((clickedCount / deliveredCount) * 100).toFixed(2))
      : 0;

    return {
      campaignId: id,
      totalRecipients,
      deliveredCount,
      failedCount,
      openedCount,
      clickedCount,
      openRate,
      clickRate,
    };
  }

  async logCampaignEvent(
    campaignId: string,
    recipientId: string,
    dto: LogCampaignEventDto,
  ) {
    const recipient = await this.prisma.campaignRecipient.findFirst({
      where: {
        id: recipientId,
        campaignId,
      },
    });

    if (!recipient) {
      throw new NotFoundException('Campaign recipient not found');
    }

    const now = new Date();
    let recipientUpdateData: Prisma.CampaignRecipientUpdateInput = {};

    if (dto.eventType === CampaignEventType.OPENED) {
      recipientUpdateData = {
        status:
          recipient.status === CampaignRecipientStatus.CLICKED
            ? CampaignRecipientStatus.CLICKED
            : CampaignRecipientStatus.OPENED,
        openedAt: recipient.openedAt ?? now,
      };
    } else if (dto.eventType === CampaignEventType.CLICKED) {
      recipientUpdateData = {
        status: CampaignRecipientStatus.CLICKED,
        clickedAt: now,
        openedAt: recipient.openedAt ?? now,
      };
    } else if (dto.eventType === CampaignEventType.FAILED) {
      recipientUpdateData = {
        status: CampaignRecipientStatus.FAILED,
      };
    } else if (dto.eventType === CampaignEventType.DELIVERED) {
      recipientUpdateData = {
        status:
          recipient.status === CampaignRecipientStatus.OPENED ||
          recipient.status === CampaignRecipientStatus.CLICKED
            ? recipient.status
            : CampaignRecipientStatus.SENT,
        sentAt: recipient.sentAt ?? now,
      };
    }

    await this.prisma.$transaction([
      this.prisma.campaignRecipient.update({
        where: { id: recipient.id },
        data: recipientUpdateData,
      }),
      this.prisma.campaignEvent.create({
        data: {
          recipientId: recipient.id,
          eventType: dto.eventType,
        },
      }),
    ]);

    return { message: 'Campaign event logged' };
  }

  async createAutomation(dto: CreateMarketingAutomationDto) {
    if (dto.templateId) {
      await this.ensureTemplateExists(dto.templateId);
    }

    return this.prisma.marketingAutomation.create({
      data: {
        type: dto.type,
        name: dto.name,
        isActive: dto.isActive ?? true,
        channel: dto.channel ?? NotificationType.EMAIL,
        templateId: dto.templateId,
        subject: dto.subject,
        content: dto.content,
        specialOffer: dto.specialOffer,
        inactiveDays: dto.inactiveDays ?? 30,
        classId: dto.classId,
      },
    });
  }

  async listAutomations() {
    return this.prisma.marketingAutomation.findMany({
      include: {
        template: {
          select: { id: true, name: true, type: true },
        },
      },
      orderBy: [{ type: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async updateAutomation(id: string, dto: UpdateMarketingAutomationDto) {
    await this.ensureAutomationExists(id);

    if (dto.templateId) {
      await this.ensureTemplateExists(dto.templateId);
    }

    return this.prisma.marketingAutomation.update({
      where: { id },
      data: {
        ...(dto.type !== undefined ? { type: dto.type } : {}),
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
        ...(dto.channel !== undefined ? { channel: dto.channel } : {}),
        ...(dto.templateId !== undefined ? { templateId: dto.templateId } : {}),
        ...(dto.subject !== undefined ? { subject: dto.subject } : {}),
        ...(dto.content !== undefined ? { content: dto.content } : {}),
        ...(dto.specialOffer !== undefined
          ? { specialOffer: dto.specialOffer }
          : {}),
        ...(dto.inactiveDays !== undefined
          ? { inactiveDays: dto.inactiveDays }
          : {}),
        ...(dto.classId !== undefined ? { classId: dto.classId } : {}),
      },
    });
  }

  async runAutomations(type?: MarketingAutomationType) {
    const where = {
      isActive: true,
      ...(type ? { type } : {}),
    };

    const automations = await this.prisma.marketingAutomation.findMany({
      where,
      include: {
        template: {
          select: { subject: true, body: true },
        },
      },
    });

    const summary = {
      processed: 0,
      results: [] as Array<{
        automationId: string;
        type: MarketingAutomationType;
        sent: number;
      }>,
    };

    for (const automation of automations) {
      const sent = await this.runSingleAutomation(automation);
      summary.processed += 1;
      summary.results.push({
        automationId: automation.id,
        type: automation.type,
        sent,
      });

      await this.prisma.marketingAutomation.update({
        where: { id: automation.id },
        data: { lastRunAt: new Date() },
      });
    }

    return summary;
  }

  @Cron(CronExpression.EVERY_HOUR)
  async processScheduledCampaigns() {
    const now = new Date();
    const scheduledCampaigns = await this.prisma.marketingCampaign.findMany({
      where: {
        status: MarketingCampaignStatus.SCHEDULED,
        scheduledAt: { lte: now },
      },
      select: { id: true },
      take: 50,
      orderBy: { scheduledAt: 'asc' },
    });

    for (const campaign of scheduledCampaigns) {
      try {
        await this.sendCampaign(campaign.id);
      } catch (error) {
        this.logger.error(
          `Failed to send scheduled campaign ${campaign.id}`,
          error instanceof Error ? error.stack : String(error),
        );
      }
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async runDailyAutomations() {
    try {
      await this.runAutomations(MarketingAutomationType.BIRTHDAY_WISHES);
      await this.runAutomations(MarketingAutomationType.REENGAGEMENT);
    } catch (error) {
      this.logger.error(
        'Failed to run daily marketing automations',
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  private async runSingleAutomation(automation: any): Promise<number> {
    let recipients: CampaignRecipientUser[] = [];

    if (automation.type === MarketingAutomationType.BIRTHDAY_WISHES) {
      recipients = await this.findBirthdayMembers();
    } else if (automation.type === MarketingAutomationType.REENGAGEMENT) {
      recipients = await this.findInactiveMembers(
        automation.inactiveDays ?? 30,
      );
    } else if (
      automation.type === MarketingAutomationType.CLASS_PROMOTION &&
      automation.classId
    ) {
      recipients = await this.findClassAttendees(automation.classId);
    } else if (automation.type === MarketingAutomationType.NEWSLETTER) {
      recipients = await this.findAllMembers();
    }

    if (!recipients.length) {
      return 0;
    }

    const createdCampaign = await this.prisma.marketingCampaign.create({
      data: {
        name: `${automation.name} - ${new Date().toISOString().slice(0, 10)}`,
        type: automation.channel,
        category: NotificationCategory.MARKETING,
        status: MarketingCampaignStatus.DRAFT,
        audienceType: this.resolveAudienceTypeByAutomation(automation.type),
        classId: automation.classId,
        templateId: automation.templateId,
        subject: automation.subject ?? automation.template?.subject,
        content: automation.content || automation.template?.body || '',
        specialOffer: automation.specialOffer,
      },
    });

    const result = await this.sendCampaign(createdCampaign.id);
    return result.deliveredCount;
  }

  private resolveAudienceTypeByAutomation(
    type: MarketingAutomationType,
  ): CampaignAudienceType {
    if (type === MarketingAutomationType.BIRTHDAY_WISHES) {
      return CampaignAudienceType.BIRTHDAY_MEMBERS;
    }

    if (type === MarketingAutomationType.REENGAGEMENT) {
      return CampaignAudienceType.INACTIVE_MEMBERS;
    }

    if (type === MarketingAutomationType.CLASS_PROMOTION) {
      return CampaignAudienceType.CLASS_ATTENDEES;
    }

    return CampaignAudienceType.ALL_MEMBERS;
  }

  private async resolveRecipients(campaign: {
    audienceType: CampaignAudienceType;
    classId: string | null;
    customUserIds: string[];
  }): Promise<CampaignRecipientUser[]> {
    if (campaign.audienceType === CampaignAudienceType.ALL_MEMBERS) {
      return this.findAllMembers();
    }

    if (campaign.audienceType === CampaignAudienceType.BIRTHDAY_MEMBERS) {
      return this.findBirthdayMembers();
    }

    if (campaign.audienceType === CampaignAudienceType.INACTIVE_MEMBERS) {
      return this.findInactiveMembers(30);
    }

    if (campaign.audienceType === CampaignAudienceType.CLASS_ATTENDEES) {
      if (!campaign.classId) {
        throw new BadRequestException(
          'Campaign classId is required for CLASS_ATTENDEES audience',
        );
      }
      return this.findClassAttendees(campaign.classId);
    }

    if (!campaign.customUserIds.length) {
      throw new BadRequestException('Campaign customUserIds are empty');
    }

    return this.findUsersByIds(campaign.customUserIds);
  }

  private async findAllMembers(): Promise<CampaignRecipientUser[]> {
    return this.prisma.user.findMany({
      where: {
        role: UserRole.MEMBER,
        status: UserStatus.ACTIVE,
        member: { isNot: null },
      },
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
      },
    });
  }

  private async findBirthdayMembers(): Promise<CampaignRecipientUser[]> {
    const today = new Date();
    const month = today.getMonth();
    const day = today.getDate();

    const members = await this.prisma.member.findMany({
      where: {
        dateOfBirth: { not: null },
        user: {
          role: UserRole.MEMBER,
          status: UserStatus.ACTIVE,
        },
      },
      select: {
        user: {
          select: {
            id: true,
            email: true,
            phone: true,
            firstName: true,
            lastName: true,
          },
        },
        dateOfBirth: true,
      },
    });

    return members
      .filter((item) => {
        if (!item.dateOfBirth) {
          return false;
        }
        return (
          item.dateOfBirth.getMonth() === month &&
          item.dateOfBirth.getDate() === day
        );
      })
      .map((item) => item.user);
  }

  private async findInactiveMembers(
    inactiveDays: number,
  ): Promise<CampaignRecipientUser[]> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - inactiveDays);

    const members = await this.prisma.member.findMany({
      where: {
        user: {
          role: UserRole.MEMBER,
          status: UserStatus.ACTIVE,
        },
      },
      select: {
        user: {
          select: {
            id: true,
            email: true,
            phone: true,
            firstName: true,
            lastName: true,
          },
        },
        attendance: {
          orderBy: { checkInTime: 'desc' },
          take: 1,
          select: { checkInTime: true },
        },
      },
    });

    return members
      .filter((item) => {
        const lastAttendance = item.attendance[0]?.checkInTime;
        return !lastAttendance || lastAttendance < cutoff;
      })
      .map((item) => item.user);
  }

  private async findClassAttendees(
    classId: string,
  ): Promise<CampaignRecipientUser[]> {
    const members = await this.prisma.member.findMany({
      where: {
        user: {
          role: UserRole.MEMBER,
          status: UserStatus.ACTIVE,
        },
        classBookings: {
          some: {
            status: { in: [BookingStatus.CONFIRMED, BookingStatus.COMPLETED] },
            classSchedule: {
              classId,
            },
          },
        },
      },
      select: {
        user: {
          select: {
            id: true,
            email: true,
            phone: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return members.map((item) => item.user);
  }

  private async findUsersByIds(
    userIds: string[],
  ): Promise<CampaignRecipientUser[]> {
    return this.prisma.user.findMany({
      where: {
        id: { in: userIds },
        role: UserRole.MEMBER,
        status: UserStatus.ACTIVE,
      },
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
      },
    });
  }

  private resolveDestination(
    type: NotificationType,
    user: CampaignRecipientUser,
  ): string | null {
    if (type === NotificationType.EMAIL) {
      return user.email || null;
    }

    if (type === NotificationType.SMS) {
      return user.phone || null;
    }

    return user.id;
  }

  private renderTemplate(
    raw: string,
    user: CampaignRecipientUser,
    specialOffer: string | null,
  ): string {
    return raw
      .replaceAll('{{firstName}}', user.firstName)
      .replaceAll('{{lastName}}', user.lastName)
      .replaceAll('{{email}}', user.email)
      .replaceAll('{{specialOffer}}', specialOffer ?? 'an exclusive offer');
  }

  private async ensureTemplateExists(id: string) {
    const exists = await this.prisma.notificationTemplate.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!exists) {
      throw new NotFoundException(`Template ${id} not found`);
    }
  }

  private async ensureCampaignExists(id: string) {
    const exists = await this.prisma.marketingCampaign.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!exists) {
      throw new NotFoundException(`Campaign ${id} not found`);
    }
  }

  private async ensureAutomationExists(id: string) {
    const exists = await this.prisma.marketingAutomation.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!exists) {
      throw new NotFoundException(`Automation ${id} not found`);
    }
  }
}
