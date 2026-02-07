import { Module } from '@nestjs/common';
import { GymSettingsController } from './gym-settings.controller';
import { GymSettingsService } from './gym-settings.service';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [PrismaModule, NotificationsModule],
  controllers: [GymSettingsController],
  providers: [GymSettingsService],
  exports: [GymSettingsService],
})
export class GymSettingsModule {}
