import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';
import { GlobalExceptionFilter } from './common/filters';
import { ResponseInterceptor, LoggingInterceptor } from './common/interceptors';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

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
    const allowedOrigins = corsOrigins
        ? corsOrigins.split(',')
        : ['http://localhost:3000', 'http://localhost:3001'];
    // const allowedOrigins = process.env.CORS_ORIGINS
    //     ? process.env.CORS_ORIGINS.split(',')
    //     : ['http://localhost:3000', 'http://localhost:3001'];

    app.enableCors({
        origin: (
            origin: string | undefined,
            callback: (err: Error | null, allow?: boolean) => void,
        ) => {
            // Allow requests with no origin (like mobile apps or curl requests)
            if (!origin) {
                return callback(null, true);
            }

            if (allowedOrigins.includes(origin)) {
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

    // Configure global exception filter
    app.useGlobalFilters(new GlobalExceptionFilter());

    // Configure global logging interceptor
    app.useGlobalInterceptors(new LoggingInterceptor());

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

    await app.listen(process.env.PORT ?? 3000, () => {
        console.log(`Server is running on port ${process.env.PORT ?? 3000}`);
    });
}
bootstrap();
