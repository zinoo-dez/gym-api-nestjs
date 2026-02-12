import { Module } from '@nestjs/common';
import { WorkoutPlansService } from './workout-plans.service';
import { WorkoutPlansController } from './workout-plans.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [PrismaModule, NotificationsModule],
  controllers: [WorkoutPlansController],
  providers: [WorkoutPlansService],
  exports: [WorkoutPlansService],
})
export class WorkoutPlansModule {}
