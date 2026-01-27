import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { TrainersService } from './trainers.service';
import { CreateTrainerDto, UpdateTrainerDto, TrainerResponseDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('trainers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TrainersController {
  constructor(private readonly trainersService: TrainersService) {}

  @Post()
  @Roles(Role.ADMIN)
  async create(
    @Body() createTrainerDto: CreateTrainerDto,
  ): Promise<TrainerResponseDto> {
    return this.trainersService.create(createTrainerDto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.TRAINER, Role.MEMBER)
  async findAll(): Promise<TrainerResponseDto[]> {
    return this.trainersService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.TRAINER, Role.MEMBER)
  async findOne(@Param('id') id: string): Promise<TrainerResponseDto> {
    return this.trainersService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.TRAINER)
  async update(
    @Param('id') id: string,
    @Body() updateTrainerDto: UpdateTrainerDto,
  ): Promise<TrainerResponseDto> {
    return this.trainersService.update(id, updateTrainerDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  async deactivate(@Param('id') id: string): Promise<{ message: string }> {
    await this.trainersService.deactivate(id);
    return { message: 'Trainer deactivated successfully' };
  }
}
