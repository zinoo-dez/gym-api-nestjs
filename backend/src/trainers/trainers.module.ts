import { Module } from '@nestjs/common';
import { TrainersService } from './trainers.service';
import { TrainersController } from './trainers.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
    imports: [NotificationsModule],
    controllers: [TrainersController],
    providers: [TrainersService],
    exports: [TrainersService],
})
export class TrainersModule { }
