import { Module } from '@nestjs/common';
import { NotificationsModule } from '../notifications/notifications.module';
import { RetentionController } from './retention.controller';
import { RetentionService } from './retention.service';

@Module({
    imports: [NotificationsModule],
    controllers: [RetentionController],
    providers: [RetentionService],
    exports: [RetentionService],
})
export class RetentionModule { }
