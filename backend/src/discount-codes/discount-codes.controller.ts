import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { DiscountCodesService } from './discount-codes.service';
import {
  CreateDiscountCodeDto,
  UpdateDiscountCodeDto,
  DiscountCodeResponseDto,
  DiscountCodeFiltersDto,
} from './dto';
import { PaginatedResponseDto } from '../common/dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('discount-codes')
@Controller('discount-codes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DiscountCodesController {
  constructor(private readonly discountCodesService: DiscountCodesService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create discount code' })
  @ApiResponse({ status: 201, type: DiscountCodeResponseDto })
  async create(
    @Body() dto: CreateDiscountCodeDto,
  ): Promise<DiscountCodeResponseDto> {
    return this.discountCodesService.create(dto);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'List discount codes' })
  @ApiResponse({ status: 200 })
  async findAll(
    @Query() filters: DiscountCodeFiltersDto,
  ): Promise<PaginatedResponseDto<DiscountCodeResponseDto>> {
    return this.discountCodesService.findAll(filters);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update discount code' })
  @ApiParam({ name: 'id', description: 'Discount code ID' })
  @ApiResponse({ status: 200, type: DiscountCodeResponseDto })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateDiscountCodeDto,
  ): Promise<DiscountCodeResponseDto> {
    return this.discountCodesService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete discount code' })
  @ApiParam({ name: 'id', description: 'Discount code ID' })
  @ApiResponse({ status: 200, description: 'Deleted' })
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    await this.discountCodesService.remove(id);
    return { message: 'Discount code deleted' };
  }

  @Get('usage')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Discount code usage summary' })
  async usage() {
    return this.discountCodesService.getUsage();
  }
}
