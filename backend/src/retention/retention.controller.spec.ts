import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RetentionController } from './retention.controller';
import { RetentionService } from './retention.service';

describe('RetentionController (integration)', () => {
  let app: INestApplication;

  const retentionServiceMock = {
    getOverview: jest.fn(),
    getMembers: jest.fn(),
    getMemberDetail: jest.fn(),
    recalculateAll: jest.fn(),
    getTasks: jest.fn(),
    updateTask: jest.fn(),
  };

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [RetentionController],
      providers: [
        {
          provide: RetentionService,
          useValue: retentionServiceMock,
        },
      ],
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

  it('GET /api/retention/overview returns overview', async () => {
    retentionServiceMock.getOverview.mockResolvedValue({
      highRisk: 1,
      mediumRisk: 2,
      lowRisk: 3,
      newHighThisWeek: 1,
      openTasks: 2,
      evaluatedMembers: 6,
    });

    const response = await request(app.getHttpServer()).get(
      '/api/retention/overview',
    );

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      highRisk: 1,
      mediumRisk: 2,
      lowRisk: 3,
    });
    expect(retentionServiceMock.getOverview).toHaveBeenCalled();
  });

  it('GET /api/retention/members returns paginated members', async () => {
    retentionServiceMock.getMembers.mockResolvedValue({
      data: [
        {
          memberId: 'm-1',
          fullName: 'Alice Member',
          email: 'alice@gym.com',
          riskLevel: 'HIGH',
          score: 75,
          reasons: ['NO_CHECKIN_14_DAYS'],
          unpaidPendingCount: 1,
          lastEvaluatedAt: new Date().toISOString(),
        },
      ],
      page: 1,
      limit: 20,
      total: 1,
      totalPages: 1,
    });

    const response = await request(app.getHttpServer())
      .get('/api/retention/members')
      .query({ riskLevel: 'HIGH', minScore: 60 });

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(retentionServiceMock.getMembers).toHaveBeenCalled();
  });

  it('GET /api/retention/tasks and PATCH /api/retention/tasks/:id work', async () => {
    retentionServiceMock.getTasks.mockResolvedValue({
      data: [
        {
          id: 't-1',
          memberId: 'm-1',
          memberName: 'Alice Member',
          memberEmail: 'alice@gym.com',
          status: 'OPEN',
          priority: 1,
          title: 'Follow up high-risk member',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      page: 1,
      limit: 20,
      total: 1,
      totalPages: 1,
    });
    retentionServiceMock.updateTask.mockResolvedValue({
      id: 't-1',
      memberId: 'm-1',
      memberName: 'Alice Member',
      memberEmail: 'alice@gym.com',
      status: 'DONE',
      priority: 1,
      title: 'Follow up high-risk member',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const listResponse = await request(app.getHttpServer()).get(
      '/api/retention/tasks',
    );
    expect(listResponse.status).toBe(200);
    expect(listResponse.body.data[0].status).toBe('OPEN');

    const patchResponse = await request(app.getHttpServer())
      .patch('/api/retention/tasks/t-1')
      .send({ status: 'DONE' });
    expect(patchResponse.status).toBe(200);
    expect(patchResponse.body.status).toBe('DONE');
    expect(retentionServiceMock.updateTask).toHaveBeenCalledWith('t-1', {
      status: 'DONE',
    });
  });
});

