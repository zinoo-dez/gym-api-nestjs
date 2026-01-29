import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { MembersModule } from './members/members.module';
import { MembershipsModule } from './memberships/memberships.module';
import { TrainersModule } from './trainers/trainers.module';
import { ClassesModule } from './classes/classes.module';
import { AttendanceModule } from './attendance/attendance.module';
import { WorkoutPlansModule } from './workout-plans/workout-plans.module';
import { SanitizationMiddleware } from './common/middleware';

@Module({
  imports: [
    // Configure ConfigModule globally
    ConfigModule.forRoot({ isGlobal: true }),
    // Configure rate limiting: 100 requests per 15 minutes (900 seconds)
    ThrottlerModule.forRoot([
      {
        ttl: 900000, // 15 minutes in milliseconds
        limit: 100, // 100 requests per TTL window
      },
    ]),
    // Configure caching globally
    CacheModule.register({
      isGlobal: true,
      ttl: 3600000, // Default TTL: 1 hour in milliseconds
      max: 100, // Maximum number of items in cache
    }),
    PrismaModule,
    AuthModule,
    MembersModule,
    MembershipsModule,
    TrainersModule,
    ClassesModule,
    AttendanceModule,
    WorkoutPlansModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Apply ThrottlerGuard globally to all routes
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply sanitization middleware to all routes
    consumer.apply(SanitizationMiddleware).forRoutes('*');
  }
}
