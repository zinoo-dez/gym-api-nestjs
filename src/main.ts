import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';
import { GlobalExceptionFilter } from './common/filters';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configure global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter());

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
  await prismaService.enableShutdownHooks(app);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
