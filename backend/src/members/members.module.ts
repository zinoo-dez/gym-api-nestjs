import { Module } from '@nestjs/common';
import { MembersService } from './members.service';
import { MembersController } from './members.controller';
import { WorkoutPlansModule } from '../workout-plans/workout-plans.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
    imports: [WorkoutPlansModule, NotificationsModule],
    controllers: [MembersController],
    providers: [MembersService],
    exports: [MembersService],
})
export class MembersModule { }
