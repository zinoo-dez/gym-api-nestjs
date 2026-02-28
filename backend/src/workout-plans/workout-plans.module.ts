import { Module } from '@nestjs/common';
import { WorkoutPlansService } from './workout-plans.service';
import { WorkoutPlansController } from './workout-plans.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
    imports: [NotificationsModule],
    controllers: [WorkoutPlansController],
    providers: [WorkoutPlansService],
    exports: [WorkoutPlansService],
})
export class WorkoutPlansModule { }
