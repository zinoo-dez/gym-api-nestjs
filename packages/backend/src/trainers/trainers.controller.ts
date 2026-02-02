import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { TrainersService } from './trainers.service';
import {
  CreateTrainerDto,
  UpdateTrainerDto,
  TrainerResponseDto,
  TrainerFiltersDto,
} from './dto';
import { PaginatedResponseDto } from '../common/dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@ApiTags('trainers')
@ApiBearerAuth('JWT-auth')
@Controller('trainers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TrainersController {
  constructor(private readonly trainersService: TrainersService) {}

  @Post()
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({
    summary: 'Create a new trainer',
    description: 'Create a new trainer account. Requires ADMIN role.',
  })
  @ApiResponse({
    status: 201,
    description: 'Trainer successfully created',
    type: TrainerResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async create(
    @Body() createTrainerDto: CreateTrainerDto,
  ): Promise<TrainerResponseDto> {
    return this.trainersService.create(createTrainerDto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.TRAINER, Role.MEMBER, Role.SUPERADMIN)
  @ApiOperation({
    summary: 'Get all trainers',
    description:
      'Retrieve a paginated list of trainers with optional filters (specialization, availability).',
  })
  @ApiResponse({
    status: 200,
    description: 'List of trainers retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(
    @Query() filters: TrainerFiltersDto,
  ): Promise<PaginatedResponseDto<TrainerResponseDto>> {
    return this.trainersService.findAll(filters);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.TRAINER, Role.MEMBER, Role.SUPERADMIN)
  @ApiOperation({
    summary: 'Get trainer by ID',
    description:
      'Retrieve detailed information about a specific trainer including their classes.',
  })
  @ApiParam({
    name: 'id',
    description: 'Trainer UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Trainer details retrieved successfully',
    type: TrainerResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Trainer not found' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ): Promise<TrainerResponseDto> {
    return this.trainersService.findOne(id, user);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.TRAINER, Role.SUPERADMIN)
  @ApiOperation({
    summary: 'Update trainer information',
    description:
      'Update trainer profile information. Requires ADMIN or TRAINER role.',
  })
  @ApiParam({
    name: 'id',
    description: 'Trainer UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Trainer updated successfully',
    type: TrainerResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Trainer not found' })
  async update(
    @Param('id') id: string,
    @Body() updateTrainerDto: UpdateTrainerDto,
    @CurrentUser() user: any,
  ): Promise<TrainerResponseDto> {
    return this.trainersService.update(id, updateTrainerDto, user);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({
    summary: 'Deactivate trainer',
    description:
      'Soft delete a trainer account (sets isActive to false). Requires ADMIN role.',
  })
  @ApiParam({
    name: 'id',
    description: 'Trainer UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Trainer deactivated successfully',
    schema: {
      example: { message: 'Trainer deactivated successfully' },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'Trainer not found' })
  async deactivate(@Param('id') id: string): Promise<{ message: string }> {
    await this.trainersService.deactivate(id);
    return { message: 'Trainer deactivated successfully' };
  }
}
