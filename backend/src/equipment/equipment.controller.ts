import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

import { CurrentUser, Roles } from '../auth/decorators';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import {
  CreateEquipmentDto,
  EquipmentFiltersDto,
  EquipmentResponseDto,
  LogEquipmentMaintenanceDto,
  UpdateEquipmentDto,
} from './dto';
import { EquipmentService } from './equipment.service';

interface AuthenticatedUser {
  userId: string;
  email?: string;
  role: UserRole;
}

@ApiTags('equipment')
@Controller('equipment')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.OWNER)
export class EquipmentController {
  constructor(private readonly equipmentService: EquipmentService) {}

  @Get()
  @ApiOperation({ summary: 'List equipment records' })
  @ApiResponse({ status: 200, type: [EquipmentResponseDto] })
  async findAll(
    @Query() filters: EquipmentFiltersDto,
  ): Promise<EquipmentResponseDto[]> {
    return this.equipmentService.findAll(filters);
  }

  @Post()
  @ApiOperation({ summary: 'Create equipment record' })
  @ApiResponse({ status: 201, type: EquipmentResponseDto })
  async create(
    @Body() dto: CreateEquipmentDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<EquipmentResponseDto> {
    return this.equipmentService.create(dto, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update equipment record' })
  @ApiResponse({ status: 200, type: EquipmentResponseDto })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateEquipmentDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<EquipmentResponseDto> {
    return this.equipmentService.update(id, dto, user);
  }

  @Post(':id/maintenance')
  @ApiOperation({ summary: 'Log equipment maintenance event' })
  @ApiResponse({ status: 201, type: EquipmentResponseDto })
  async logMaintenance(
    @Param('id') id: string,
    @Body() dto: LogEquipmentMaintenanceDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<EquipmentResponseDto> {
    return this.equipmentService.logMaintenance(id, dto, user);
  }

  @Post(':id/mark-out-of-order')
  @ApiOperation({ summary: 'Mark equipment as out of order' })
  @ApiResponse({ status: 200, type: EquipmentResponseDto })
  async markOutOfOrder(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<EquipmentResponseDto> {
    return this.equipmentService.markOutOfOrder(id, user);
  }

  @Post(':id/retire')
  @ApiOperation({ summary: 'Retire equipment from active inventory' })
  @ApiResponse({ status: 200, type: EquipmentResponseDto })
  async retire(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<EquipmentResponseDto> {
    return this.equipmentService.retire(id, user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one equipment record by id' })
  @ApiResponse({ status: 200, type: EquipmentResponseDto })
  async findOne(@Param('id') id: string): Promise<EquipmentResponseDto> {
    return this.equipmentService.findOne(id);
  }
}
