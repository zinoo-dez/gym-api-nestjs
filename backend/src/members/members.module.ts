import { Module } from '@nestjs/common';
import { MembersService } from './members.service';
import { MembersController } from './members.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { WorkoutPlansModule } from '../workout-plans/workout-plans.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [PrismaModule, WorkoutPlansModule, NotificationsModule],
  controllers: [MembersController],
  providers: [MembersService],
  exports: [MembersService],
})
export class MembersModule {}
