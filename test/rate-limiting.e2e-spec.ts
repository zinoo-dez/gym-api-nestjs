import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { GlobalExceptionFilter } from './../src/common/filters';
import { ResponseInterceptor } from './../src/common/interceptors';

describe('Rate Limiting (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Apply the same configuration as in main.ts
    app.useGlobalFilters(new GlobalExceptionFilter());
    app.useGlobalInterceptors(new ResponseInterceptor());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should allow requests within rate limit', async () => {
    // Make 5 requests (well below the 100 request limit)
    for (let i = 0; i < 5; i++) {
      const response = await request(app.getHttpServer()).get('/');
      expect(response.status).toBe(200);
    }
  });

  it('should include rate limit headers in response', async () => {
    const response = await request(app.getHttpServer()).get('/');

    // Check for rate limit headers
    expect(response.headers['x-ratelimit-limit']).toBeDefined();
    expect(response.headers['x-ratelimit-remaining']).toBeDefined();
    expect(response.headers['x-ratelimit-reset']).toBeDefined();

    // Verify the limit is set to 100
    expect(response.headers['x-ratelimit-limit']).toBe('100');
  });

  it('should decrement remaining count with each request', async () => {
    const response1 = await request(app.getHttpServer()).get('/');
    const remaining1 = parseInt(response1.headers['x-ratelimit-remaining']);

    const response2 = await request(app.getHttpServer()).get('/');
    const remaining2 = parseInt(response2.headers['x-ratelimit-remaining']);

    // The remaining count should decrease
    expect(remaining2).toBeLessThan(remaining1);
  });
});
