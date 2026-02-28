import { Module } from '@nestjs/common';
import { NotificationsModule } from '../notifications/notifications.module';
import { InventorySalesController } from './inventory-sales.controller';
import { InventorySalesService } from './inventory-sales.service';

@Module({
    imports: [NotificationsModule],
    controllers: [InventorySalesController],
    providers: [InventorySalesService],
})
export class InventorySalesModule { }
