import { Module } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { MembersModule } from '../members/members.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
    imports: [MembersModule, NotificationsModule],
    controllers: [AttendanceController],
    providers: [AttendanceService],
    exports: [AttendanceService],
})
export class AttendanceModule { }
