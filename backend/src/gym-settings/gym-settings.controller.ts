import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { GymSettingsService } from './gym-settings.service';
import { UpdateGymSettingDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { UserRole } from '@prisma/client';

@Controller('gym-settings')
export class GymSettingsController {
  constructor(private readonly gymSettingsService: GymSettingsService) {}

  @Get()
  @Public()
  async getSettings() {
    return this.gymSettingsService.getSettings();
  }

  @Patch()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateSettings(
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: false }))
    dto: UpdateGymSettingDto,
  ) {
    return this.gymSettingsService.updateSettings(dto);
  }
}
