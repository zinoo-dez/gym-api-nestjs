import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { MembershipsService } from './memberships.service';
import { MembershipsController } from './memberships.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
    imports: [ScheduleModule, NotificationsModule],
    controllers: [MembershipsController],
    providers: [MembershipsService],
    exports: [MembershipsService],
})
export class MembershipsModule { }
