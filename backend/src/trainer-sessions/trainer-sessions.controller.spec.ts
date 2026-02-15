import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { TrainerSessionsController } from './trainer-sessions.controller';
import { TrainerSessionsService } from './trainer-sessions.service';

describe('TrainerSessionsController (integration)', () => {
  let app: INestApplication;

  const trainerSessionsServiceMock = {
    createSession: jest.fn(),
    listSessions: jest.fn(),
    completeSession: jest.fn(),
    recordProgress: jest.fn(),
    getMemberProgress: jest.fn(),
    getMyProgress: jest.fn(),
  };

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [TrainerSessionsController],
      providers: [
        {
          provide: TrainerSessionsService,
          useValue: trainerSessionsServiceMock,
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

  it('GET /api/trainer-sessions returns rows', async () => {
    trainerSessionsServiceMock.listSessions.mockResolvedValue([
      {
        id: 's-1',
        title: 'Morning PT',
        status: 'SCHEDULED',
      },
    ]);

    const response = await request(app.getHttpServer())
      .get('/api/trainer-sessions')
      .query({ upcomingOnly: true });

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].title).toBe('Morning PT');
    expect(trainerSessionsServiceMock.listSessions).toHaveBeenCalled();
  });

  it('POST /api/trainer-sessions creates a session', async () => {
    trainerSessionsServiceMock.createSession.mockResolvedValue({
      id: 's-2',
      title: 'Strength Session',
      status: 'SCHEDULED',
    });

    const response = await request(app.getHttpServer())
      .post('/api/trainer-sessions')
      .send({
        memberId: 'm-1',
        trainerId: 't-1',
        sessionDate: '2026-02-20T11:00:00.000Z',
        duration: 60,
        title: 'Strength Session',
        rate: 30000,
      });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({ id: 's-2', title: 'Strength Session' });
    expect(trainerSessionsServiceMock.createSession).toHaveBeenCalled();
  });

  it('PATCH /api/trainer-sessions/:id/complete updates status', async () => {
    trainerSessionsServiceMock.completeSession.mockResolvedValue({
      id: 's-2',
      status: 'COMPLETED',
    });

    const response = await request(app.getHttpServer()).patch(
      '/api/trainer-sessions/s-2/complete',
    );

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('COMPLETED');
    expect(trainerSessionsServiceMock.completeSession).toHaveBeenCalled();
  });
});
