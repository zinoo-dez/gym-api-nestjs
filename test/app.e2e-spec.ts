import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('/health (GET) - should return health status', async () => {
    const response = await request(app.getHttpServer())
      .get('/health')
      .expect(200);

    expect(response.body).toHaveProperty('status');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('database');
    expect(response.body).toHaveProperty('responseTime');
    expect(response.body.status).toBe('ok');
    expect(response.body.database).toBe('connected');
    expect(typeof response.body.responseTime).toBe('number');
  });

  it('/health (GET) - should respond within 100ms', async () => {
    const startTime = Date.now();
    const response = await request(app.getHttpServer())
      .get('/health')
      .expect(200);
    const totalTime = Date.now() - startTime;

    expect(totalTime).toBeLessThan(100);
    expect(response.body.responseTime).toBeLessThan(100);
  });
});
