import { Module } from '@nestjs/common';
import { NotificationsModule } from '../notifications/notifications.module';
import { PrismaModule } from '../prisma/prisma.module';
import { InventorySalesController } from './inventory-sales.controller';
import { InventorySalesService } from './inventory-sales.service';

@Module({
  imports: [PrismaModule, NotificationsModule],
  controllers: [InventorySalesController],
  providers: [InventorySalesService],
})
export class InventorySalesModule {}
