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
  CostFiltersDto,
  CostResponseDto,
  CreateCostDto,
  UpdateCostDto,
} from './dto';
import { CostsService } from './costs.service';

interface AuthenticatedUser {
  userId: string;
  role: UserRole;
}

@ApiTags('costs')
@Controller('costs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.OWNER)
export class CostsController {
  constructor(private readonly costsService: CostsService) {}

  @Get()
  @ApiOperation({ summary: 'List cost records' })
  @ApiResponse({ status: 200, type: [CostResponseDto] })
  async findAll(@Query() filters: CostFiltersDto): Promise<CostResponseDto[]> {
    return this.costsService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one cost record by id' })
  @ApiResponse({ status: 200, type: CostResponseDto })
  async findOne(@Param('id') id: string): Promise<CostResponseDto> {
    return this.costsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create cost record' })
  @ApiResponse({ status: 201, type: CostResponseDto })
  async create(
    @Body() dto: CreateCostDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<CostResponseDto> {
    return this.costsService.create(dto, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update cost record' })
  @ApiResponse({ status: 200, type: CostResponseDto })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCostDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<CostResponseDto> {
    return this.costsService.update(id, dto, user);
  }

  @Post(':id/archive')
  @ApiOperation({ summary: 'Archive cost record' })
  @ApiResponse({ status: 200, type: CostResponseDto })
  async archive(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<CostResponseDto> {
    return this.costsService.archive(id, user);
  }

  @Post(':id/restore')
  @ApiOperation({ summary: 'Restore cost record' })
  @ApiResponse({ status: 200, type: CostResponseDto })
  async restore(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<CostResponseDto> {
    return this.costsService.restore(id, user);
  }

  @Post(':id/duplicate')
  @ApiOperation({ summary: 'Duplicate cost record' })
  @ApiResponse({ status: 201, type: CostResponseDto })
  async duplicate(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<CostResponseDto> {
    return this.costsService.duplicate(id, user);
  }
}
