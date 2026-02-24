import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';
import { ResponseInterceptor, LoggingInterceptor } from './common/interceptors';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import * as express from 'express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Set global API prefix
  app.setGlobalPrefix('api');

  // Configure security headers with helmet
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: [`'self'`],
          styleSrc: [`'self'`, `'unsafe-inline'`],
          scriptSrc: [`'self'`, `'unsafe-inline'`],
          imgSrc: [`'self'`, 'data:', 'https:'],
        },
      },
      crossOriginEmbedderPolicy: false, // Allow Swagger UI to work
    }),
  );

  // Configure CORS
  const configService = app.get(ConfigService);
  const corsOrigins = configService.get<string>('CORS_ORIGINS');
  const defaultOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5173',
    'http://localhost:4173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:4173',
  ];
  const envOrigins = corsOrigins
    ? corsOrigins.split(',').map((origin) => origin.trim())
    : [];
  const allowAll = envOrigins.includes('*');
  const allowedOrigins = new Set(
    [...defaultOrigins, ...envOrigins].filter(Boolean),
  );
  const isPrivateNetworkHost = (hostname: string): boolean => {
    if (hostname.startsWith('10.')) return true;
    if (hostname.startsWith('192.168.')) return true;
    if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname)) return true;
    return false;
  };
  const isLocalDevOrigin = (origin: string): boolean => {
    try {
      const parsed = new URL(origin);
      const { hostname, protocol } = parsed;
      if (protocol !== 'http:' && protocol !== 'https:') {
        return false;
      }

      return (
        hostname === 'localhost' ||
        hostname === '127.0.0.1' ||
        hostname === '::1' ||
        isPrivateNetworkHost(hostname)
      );
    } catch {
      return false;
    }
  };

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin || allowAll) {
        return callback(null, true);
      }

      if (allowedOrigins.has(origin) || isLocalDevOrigin(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    exposedHeaders: ['X-Total-Count', 'X-Page', 'X-Limit'],
    maxAge: 3600, // Cache preflight requests for 1 hour
  });

  // Serve uploaded files (allow cross-origin image embedding for frontend apps)
  app.use(
    '/uploads',
    express.static(join(process.cwd(), 'uploads'), {
      setHeaders: (res) => {
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      },
    }),
  );

  // Note: GlobalExceptionFilter is now provided via APP_FILTER in AppModule
  // This ensures proper dependency injection of LoggerService

  // Configure global logging interceptor (DI-enabled)
  app.useGlobalInterceptors(app.get(LoggingInterceptor));

  // Configure global response interceptor
  app.useGlobalInterceptors(new ResponseInterceptor());

  // Configure global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip unknown properties
      forbidNonWhitelisted: true, // Throw error on unknown properties
      transform: true, // Auto-transform to DTO types
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Configure Swagger/OpenAPI documentation
  const config = new DocumentBuilder()
    .setTitle('Gym Management API')
    .setDescription(
      'A comprehensive gym management API built with NestJS, PostgreSQL, and Prisma. ' +
        'Manage members, memberships, trainers, classes, attendance, and workout plans.',
    )
    .setVersion('1.0')
    .addTag('auth', 'Authentication and authorization endpoints')
    .addTag('members', 'Member management endpoints')
    .addTag('trainers', 'Trainer management endpoints')
    .addTag('memberships', 'Membership plan and subscription endpoints')
    .addTag('classes', 'Class scheduling and booking endpoints')
    .addTag('attendance', 'Attendance tracking endpoints')
    .addTag('workout-plans', 'Workout plan management endpoints')
    .addTag(
      'body-composition',
      'Body composition and progress tracking endpoints',
    )
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT token',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Enable shutdown hooks for Prisma
  const prismaService = app.get(PrismaService);
  prismaService.enableShutdownHooks(app);

  // Fail fast if database is unavailable before accepting HTTP traffic.
  const maxAttempts = 5;
  let databaseReady = false;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      await prismaService.$queryRaw`SELECT 1`;
      databaseReady = true;
      break;
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      console.error(
        `[Startup] Database health check failed (${attempt}/${maxAttempts}): ${reason}`,
      );
      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
      }
    }
  }

  if (!databaseReady) {
    console.error(
      '[Startup] Database is unavailable. Exiting without starting HTTP server.',
    );
    await app.close();
    process.exit(1);
  }

  void app.listen(process.env.PORT ?? 3000, () => {
    console.log(
      `Server is running on port http://localhost:${process.env.PORT ?? 3000}`,
      `Server is running on port http://localhost:${process.env.PORT ?? 3000}/api/docs`,
    );
  });
}

void bootstrap();
