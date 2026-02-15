import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { MarketingController } from './marketing.controller';
import { MarketingService } from './marketing.service';

const describeHttp = process.env.ENABLE_HTTP_TESTS === 'true' ? describe : describe.skip;

describeHttp('MarketingController (http e2e)', () => {
  let app: INestApplication;

  const marketingServiceMock = {
    listTemplates: jest.fn(),
    createTemplate: jest.fn(),
    createCampaign: jest.fn(),
    sendCampaign: jest.fn(),
    getCampaignAnalytics: jest.fn(),
    runAutomations: jest.fn(),
  };

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [MarketingController],
      providers: [{ provide: MarketingService, useValue: marketingServiceMock }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /api/marketing/templates', async () => {
    marketingServiceMock.listTemplates.mockResolvedValue([{ id: 'tpl-1' }]);

    const response = await request(app.getHttpServer()).get('/api/marketing/templates');

    expect(response.status).toBe(200);
    expect(response.body).toEqual([{ id: 'tpl-1' }]);
  });

  it('POST /api/marketing/campaigns and send', async () => {
    marketingServiceMock.createCampaign.mockResolvedValue({ id: 'camp-1' });
    marketingServiceMock.sendCampaign.mockResolvedValue({
      campaignId: 'camp-1',
      deliveredCount: 8,
      failedCount: 1,
    });

    const createResponse = await request(app.getHttpServer())
      .post('/api/marketing/campaigns')
      .send({ name: 'Promo', type: 'EMAIL', content: 'Hello' });

    expect(createResponse.status).toBe(201);
    expect(createResponse.body.id).toBe('camp-1');

    const sendResponse = await request(app.getHttpServer()).post(
      '/api/marketing/campaigns/camp-1/send',
    );

    expect(sendResponse.status).toBe(201);
    expect(sendResponse.body.campaignId).toBe('camp-1');
  });

  it('GET /api/marketing/campaigns/:id/analytics', async () => {
    marketingServiceMock.getCampaignAnalytics.mockResolvedValue({
      campaignId: 'camp-1',
      openRate: 50,
      clickRate: 20,
    });

    const response = await request(app.getHttpServer()).get(
      '/api/marketing/campaigns/camp-1/analytics',
    );

    expect(response.status).toBe(200);
    expect(response.body.openRate).toBe(50);
  });

  it('POST /api/marketing/automations/run/:type', async () => {
    marketingServiceMock.runAutomations.mockResolvedValue({ processed: 1 });

    const response = await request(app.getHttpServer()).post(
      '/api/marketing/automations/run/BIRTHDAY_WISHES',
    );

    expect(response.status).toBe(201);
    expect(response.body.processed).toBe(1);
  });
});
