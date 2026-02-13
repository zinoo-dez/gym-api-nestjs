import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { FeaturesService } from './features.service';
import {
  CreateFeatureDto,
  FeatureFiltersDto,
  FeatureResponseDto,
  UpdateFeatureDto,
} from './dto';
import { PaginatedResponseDto } from '../common/dto';

@ApiTags('features')
@Controller('features')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FeaturesController {
  constructor(private readonly featuresService: FeaturesService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create feature' })
  @ApiResponse({ status: 201, type: FeatureResponseDto })
  async create(@Body() dto: CreateFeatureDto): Promise<FeatureResponseDto> {
    return this.featuresService.create(dto);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'List features' })
  @ApiResponse({ status: 200 })
  async findAll(
    @Query() filters: FeatureFiltersDto,
  ): Promise<PaginatedResponseDto<FeatureResponseDto>> {
    return this.featuresService.findAll(filters);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get feature by ID' })
  @ApiParam({ name: 'id', description: 'Feature ID' })
  @ApiResponse({ status: 200, type: FeatureResponseDto })
  async findOne(@Param('id') id: string): Promise<FeatureResponseDto> {
    return this.featuresService.findById(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update feature' })
  @ApiParam({ name: 'id', description: 'Feature ID' })
  @ApiResponse({ status: 200, type: FeatureResponseDto })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateFeatureDto,
  ): Promise<FeatureResponseDto> {
    return this.featuresService.update(id, dto);
  }

  @Patch(':id/restore-default')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Restore system feature default name' })
  @ApiParam({ name: 'id', description: 'Feature ID' })
  @ApiResponse({ status: 200, type: FeatureResponseDto })
  async restoreDefault(
    @Param('id') id: string,
  ): Promise<FeatureResponseDto> {
    return this.featuresService.restoreDefaultName(id);
  }

  @Patch(':id/restore-default-name')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Restore system feature default name' })
  @ApiParam({ name: 'id', description: 'Feature ID' })
  @ApiResponse({ status: 200, type: FeatureResponseDto })
  async restoreDefaultName(
    @Param('id') id: string,
  ): Promise<FeatureResponseDto> {
    return this.featuresService.restoreDefaultName(id);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete feature' })
  @ApiParam({ name: 'id', description: 'Feature ID' })
  @ApiResponse({ status: 200, description: 'Deleted' })
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    await this.featuresService.remove(id);
    return { message: 'Feature deleted' };
  }
}
