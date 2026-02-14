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
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { StaffService } from './staff.service';
import {
  CreateStaffDto,
  UpdateStaffDto,
  StaffFiltersDto,
  StaffResponseDto,
} from './dto';
import { PaginatedResponseDto } from '../common/dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('staff')
@ApiBearerAuth('JWT-auth')
@Controller('staff')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a staff member' })
  @ApiResponse({ status: 201, type: StaffResponseDto })
  async create(@Body() dto: CreateStaffDto): Promise<StaffResponseDto> {
    return this.staffService.create(dto);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all staff' })
  async findAll(
    @Query() filters: StaffFiltersDto,
  ): Promise<PaginatedResponseDto<StaffResponseDto>> {
    return this.staffService.findAll(filters);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get staff by id' })
  async findOne(@Param('id') id: string): Promise<StaffResponseDto> {
    return this.staffService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update staff' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateStaffDto,
  ): Promise<StaffResponseDto> {
    return this.staffService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Deactivate staff' })
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    await this.staffService.deactivate(id);
    return { message: 'Staff deactivated' };
  }
}
