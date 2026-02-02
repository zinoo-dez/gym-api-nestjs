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
import { PricingService } from './pricing.service';
import {
  CreatePricingDto,
  UpdatePricingDto,
  PricingResponseDto,
  PricingFiltersDto,
} from './dto';
import { PaginatedResponseDto } from '../common/dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { Role } from '@prisma/client';

@ApiTags('pricing')
@Controller('pricing')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

  @Post()
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Create pricing',
    description:
      'Create a new pricing entry. Requires ADMIN or SUPERADMIN role.',
  })
  @ApiResponse({
    status: 201,
    description: 'Pricing successfully created',
    type: PricingResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin or SuperAdmin role required',
  })
  async create(
    @Body() createPricingDto: CreatePricingDto,
  ): Promise<PricingResponseDto> {
    return this.pricingService.create(createPricingDto);
  }

  @Get()
  @Public()
  @ApiOperation({
    summary: 'Get all pricing (Public)',
    description:
      'Retrieve a paginated list of pricing with optional filters. No authentication required.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of pricing retrieved successfully',
  })
  async findAll(
    @Query() filters: PricingFiltersDto,
  ): Promise<PaginatedResponseDto<PricingResponseDto>> {
    return this.pricingService.findAll(filters);
  }

  @Get(':id')
  @Public()
  @ApiOperation({
    summary: 'Get pricing by ID (Public)',
    description:
      'Retrieve detailed information about a specific pricing. No authentication required.',
  })
  @ApiParam({
    name: 'id',
    description: 'Pricing UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Pricing details retrieved successfully',
    type: PricingResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Pricing not found' })
  async findOne(@Param('id') id: string): Promise<PricingResponseDto> {
    return this.pricingService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update pricing',
    description: 'Update pricing details. Requires ADMIN or SUPERADMIN role.',
  })
  @ApiParam({
    name: 'id',
    description: 'Pricing UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Pricing updated successfully',
    type: PricingResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin or SuperAdmin role required',
  })
  @ApiResponse({ status: 404, description: 'Pricing not found' })
  async update(
    @Param('id') id: string,
    @Body() updatePricingDto: UpdatePricingDto,
  ): Promise<PricingResponseDto> {
    return this.pricingService.update(id, updatePricingDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Delete pricing',
    description: 'Delete a pricing entry. Requires ADMIN or SUPERADMIN role.',
  })
  @ApiParam({
    name: 'id',
    description: 'Pricing UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Pricing deleted successfully',
    schema: {
      example: { message: 'Pricing deleted successfully' },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin or SuperAdmin role required',
  })
  @ApiResponse({ status: 404, description: 'Pricing not found' })
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    await this.pricingService.remove(id);
    return { message: 'Pricing deleted successfully' };
  }
}
