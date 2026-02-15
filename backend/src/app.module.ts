import {
  Module,
  NestModule,
  MiddlewareConsumer,
  RequestMethod,
} from '@nestjs/common';
import { APP_GUARD, APP_FILTER } from '@nestjs/core';
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
import { UsersModule } from './users/users.module';
import { PricingModule } from './pricing/pricing.module';
import { GymSettingsModule } from './gym-settings/gym-settings.module';
import { NotificationsModule } from './notifications/notifications.module';
import { SanitizationMiddleware } from './common/middleware';
import { LoggingModule } from './logging/logging.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { LoggerService } from './logging/logger.service';
import { LoggingInterceptor } from './common/interceptors';
import { DiscountCodesModule } from './discount-codes/discount-codes.module';
import { GymOperatingHoursModule } from './gym-operating-hours/gym-operating-hours.module';
import { FeaturesModule } from './features/features.module';
import { StaffModule } from './staff/staff.module';
import { PaymentsModule } from './payments/payments.module';
import { UploadsModule } from './uploads/uploads.module';
import { RetentionModule } from './retention/retention.module';
import { TrainerSessionsModule } from './trainer-sessions/trainer-sessions.module';
import { MarketingModule } from './marketing/marketing.module';

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
    LoggingModule,
    PrismaModule,
    AuthModule,
    MembersModule,
    MembershipsModule,
    TrainersModule,
    ClassesModule,
    AttendanceModule,
    WorkoutPlansModule,
    UsersModule,
    PricingModule,
    NotificationsModule,
    GymSettingsModule,
    DiscountCodesModule,
    GymOperatingHoursModule,
    FeaturesModule,
    StaffModule,
    PaymentsModule,
    UploadsModule,
    RetentionModule,
    TrainerSessionsModule,
    MarketingModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    LoggingInterceptor,
    // Apply ThrottlerGuard globally to all routes
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    // Apply GlobalExceptionFilter with LoggerService injection
    {
      provide: APP_FILTER,
      useFactory: (loggerService: LoggerService) => {
        return new GlobalExceptionFilter(loggerService);
      },
      inject: [LoggerService],
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply sanitization middleware to all routes
    consumer
      .apply(SanitizationMiddleware)
      .forRoutes({ path: '*path', method: RequestMethod.ALL });
  }
}
