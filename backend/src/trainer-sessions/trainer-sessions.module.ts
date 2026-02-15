import { Module } from '@nestjs/common';
import { NotificationsModule } from '../notifications/notifications.module';
import { PrismaModule } from '../prisma/prisma.module';
import { TrainerSessionsController } from './trainer-sessions.controller';
import { TrainerSessionsService } from './trainer-sessions.service';

@Module({
  imports: [PrismaModule, NotificationsModule],
  controllers: [TrainerSessionsController],
  providers: [TrainerSessionsService],
})
export class TrainerSessionsModule {}
