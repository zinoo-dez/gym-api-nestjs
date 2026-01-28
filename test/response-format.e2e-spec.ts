import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { ResponseInterceptor } from '../src/common/interceptors';
import { GlobalExceptionFilter } from '../src/common/filters';

describe('Response Format (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Apply the same configuration as main.ts
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

  it('should return consistent response format for GET /', async () => {
    const response = await request(app.getHttpServer()).get('/').expect(200);

    // Verify response structure
    expect(response.body).toHaveProperty('data');
    expect(response.body).toHaveProperty('statusCode');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('path');

    // Verify data content
    expect(response.body.data).toBe('Hello World!');
    expect(response.body.statusCode).toBe(200);
    expect(response.body.path).toBe('/');

    // Verify timestamp is valid ISO string
    const timestamp = new Date(response.body.timestamp);
    expect(timestamp).toBeInstanceOf(Date);
    expect(timestamp.toISOString()).toBe(response.body.timestamp);
  });

  it('should wrap all successful responses consistently', async () => {
    const response = await request(app.getHttpServer()).get('/').expect(200);

    // Check all required fields are present
    const requiredFields = ['data', 'statusCode', 'timestamp', 'path'];
    requiredFields.forEach((field) => {
      expect(response.body).toHaveProperty(field);
    });

    // Ensure no extra fields are added
    const responseKeys = Object.keys(response.body);
    expect(responseKeys.sort()).toEqual(requiredFields.sort());
  });

  it('should include correct path in response', async () => {
    const response = await request(app.getHttpServer()).get('/').expect(200);

    expect(response.body.path).toBe('/');
  });

  it('should include recent timestamp', async () => {
    const beforeRequest = new Date();
    const response = await request(app.getHttpServer()).get('/').expect(200);
    const afterRequest = new Date();

    const responseTimestamp = new Date(response.body.timestamp);

    // Timestamp should be between before and after request
    expect(responseTimestamp.getTime()).toBeGreaterThanOrEqual(
      beforeRequest.getTime(),
    );
    expect(responseTimestamp.getTime()).toBeLessThanOrEqual(
      afterRequest.getTime(),
    );
  });
});
