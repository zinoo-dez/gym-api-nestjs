import { Module } from '@nestjs/common';
import { NotificationsModule } from '../notifications/notifications.module';
import { BodyCompositionController } from './body-composition.controller';
import { BodyCompositionService } from './body-composition.service';

@Module({
  imports: [NotificationsModule],
  controllers: [BodyCompositionController],
  providers: [BodyCompositionService],
})
export class BodyCompositionModule {}
