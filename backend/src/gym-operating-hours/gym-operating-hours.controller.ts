import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { GymOperatingHoursService } from './gym-operating-hours.service';
import { CreateGymClosureDto, UpdateOperatingHoursDto } from './dto';
import { Public } from '../auth/decorators/public.decorator';

@Controller('operating-hours')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GymOperatingHoursController {
  constructor(private readonly service: GymOperatingHoursService) {}

  @Get()
  @Public()
  getOperatingHours() {
    return this.service.getOperatingHours();
  }

  @Patch()
  @Roles(UserRole.ADMIN)
  updateOperatingHours(@Body() dto: UpdateOperatingHoursDto) {
    return this.service.updateOperatingHours(dto);
  }

  @Get('closures')
  @Public()
  getClosures() {
    return this.service.getClosures();
  }

  @Post('closures')
  @Roles(UserRole.ADMIN)
  createClosure(@Body() dto: CreateGymClosureDto) {
    return this.service.createClosure(dto);
  }

  @Delete('closures/:id')
  @Roles(UserRole.ADMIN)
  deleteClosure(@Param('id') id: string) {
    return this.service.deleteClosure(id);
  }
}
