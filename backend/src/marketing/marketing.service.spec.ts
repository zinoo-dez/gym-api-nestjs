import { BadRequestException } from '@nestjs/common';
import {
  CampaignAudienceType,
  MarketingCampaignStatus,
  NotificationCategory,
  NotificationType,
} from '@prisma/client';
import { MarketingService } from './marketing.service';

describe('MarketingService', () => {
  let service: MarketingService;
  let prismaMock: any;
  let notificationsMock: any;

  beforeEach(() => {
    prismaMock = {
      notificationTemplate: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
      },
      marketingCampaign: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
        findMany: jest.fn(),
      },
      campaignRecipient: {
        upsert: jest.fn(),
        count: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      campaignEvent: {
        create: jest.fn(),
      },
      marketingAutomation: {
        create: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        findUnique: jest.fn(),
      },
      notificationLog: {
        create: jest.fn(),
      },
      user: {
        findMany: jest.fn(),
      },
      member: {
        findMany: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    notificationsMock = {
      createForUser: jest.fn(),
    };

    service = new MarketingService(prismaMock, notificationsMock);
  });

  it('rejects scheduled campaign without scheduledAt', async () => {
    await expect(
      service.createCampaign({
        name: 'Scheduled Promo',
        type: NotificationType.EMAIL,
        content: 'Hello {{firstName}}',
        status: MarketingCampaignStatus.SCHEDULED,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('marks campaign as failed when audience has no recipients', async () => {
    prismaMock.marketingCampaign.findUnique.mockResolvedValue({
      id: 'camp-1',
      name: 'No Recipients Campaign',
      type: NotificationType.EMAIL,
      category: NotificationCategory.MARKETING,
      status: MarketingCampaignStatus.DRAFT,
      audienceType: CampaignAudienceType.ALL_MEMBERS,
      customUserIds: [],
      classId: null,
      template: null,
      subject: 'Hello',
      content: 'Hello {{firstName}}',
      specialOffer: null,
    });
    prismaMock.user.findMany.mockResolvedValue([]);

    await expect(service.sendCampaign('camp-1')).rejects.toBeInstanceOf(
      BadRequestException,
    );

    expect(prismaMock.marketingCampaign.update).toHaveBeenNthCalledWith(1, {
      where: { id: 'camp-1' },
      data: { status: MarketingCampaignStatus.SENDING },
    });
    expect(prismaMock.marketingCampaign.update).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        where: { id: 'camp-1' },
        data: expect.objectContaining({
          status: MarketingCampaignStatus.FAILED,
        }),
      }),
    );
  });

  it('sends in-app campaign to active members and marks SENT', async () => {
    prismaMock.marketingCampaign.findUnique.mockResolvedValue({
      id: 'camp-2',
      name: 'In App Promo',
      type: NotificationType.IN_APP,
      category: NotificationCategory.MARKETING,
      status: MarketingCampaignStatus.DRAFT,
      audienceType: CampaignAudienceType.ALL_MEMBERS,
      customUserIds: [],
      classId: null,
      template: null,
      subject: 'Special Offer',
      content: 'Hi {{firstName}}',
      specialOffer: 'Free shake',
    });

    prismaMock.user.findMany.mockResolvedValue([
      {
        id: 'u-1',
        email: 'a@example.com',
        phone: null,
        firstName: 'Alice',
        lastName: 'Member',
      },
      {
        id: 'u-2',
        email: 'b@example.com',
        phone: null,
        firstName: 'Bob',
        lastName: 'Member',
      },
    ]);

    prismaMock.campaignRecipient.upsert
      .mockResolvedValueOnce({ id: 'r-1' })
      .mockResolvedValueOnce({ id: 'r-2' });

    const result = await service.sendCampaign('camp-2');

    expect(result).toMatchObject({
      campaignId: 'camp-2',
      totalRecipients: 2,
      deliveredCount: 2,
      failedCount: 0,
      status: MarketingCampaignStatus.SENT,
    });

    expect(prismaMock.notificationLog.create).toHaveBeenCalledTimes(2);
    expect(prismaMock.campaignEvent.create).toHaveBeenCalledTimes(2);
    expect(notificationsMock.createForUser).toHaveBeenCalledTimes(2);
    expect(prismaMock.marketingCampaign.update).toHaveBeenLastCalledWith(
      expect.objectContaining({
        where: { id: 'camp-2' },
        data: expect.objectContaining({ status: MarketingCampaignStatus.SENT }),
      }),
    );
  });

  it('returns open and click rates from campaign analytics', async () => {
    prismaMock.marketingCampaign.findUnique.mockResolvedValue({ id: 'camp-3' });
    prismaMock.campaignRecipient.count
      .mockResolvedValueOnce(100)
      .mockResolvedValueOnce(80)
      .mockResolvedValueOnce(20)
      .mockResolvedValueOnce(40)
      .mockResolvedValueOnce(20);

    const analytics = await service.getCampaignAnalytics('camp-3');

    expect(analytics).toEqual({
      campaignId: 'camp-3',
      totalRecipients: 100,
      deliveredCount: 80,
      failedCount: 20,
      openedCount: 40,
      clickedCount: 20,
      openRate: 50,
      clickRate: 25,
    });
  });
});
