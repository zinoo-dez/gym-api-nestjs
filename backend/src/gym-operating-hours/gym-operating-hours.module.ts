import { Module } from '@nestjs/common';
import { GymOperatingHoursController } from './gym-operating-hours.controller';
import { GymOperatingHoursService } from './gym-operating-hours.service';

@Module({
  controllers: [GymOperatingHoursController],
  providers: [GymOperatingHoursService],
  exports: [GymOperatingHoursService],
})
export class GymOperatingHoursModule {}
