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
import { Roles } from '../auth/decorators';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PaginatedResponseDto } from '../common/dto';
import {
  CreateProductDto,
  CreateSaleDto,
  LowStockAlertResponseDto,
  ProductFiltersDto,
  ProductResponseDto,
  RestockProductDto,
  SaleFiltersDto,
  SaleResponseDto,
  SalesReportQueryDto,
  SalesReportResponseDto,
  UpdateProductDto,
} from './dto';
import { InventorySalesService } from './inventory-sales.service';

@ApiTags('inventory-sales')
@Controller('inventory-sales')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InventorySalesController {
  constructor(private readonly inventorySalesService: InventorySalesService) {}

  @Post('products')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: 'Create inventory product' })
  @ApiResponse({ status: 201, type: ProductResponseDto })
  async createProduct(
    @Body() dto: CreateProductDto,
  ): Promise<ProductResponseDto> {
    return this.inventorySalesService.createProduct(dto);
  }

  @Get('products')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: 'List inventory products' })
  async findProducts(
    @Query() filters: ProductFiltersDto,
  ): Promise<PaginatedResponseDto<ProductResponseDto>> {
    return this.inventorySalesService.findProducts(filters);
  }

  @Get('products/low-stock')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: 'Get low-stock alerts' })
  async getLowStockAlerts(): Promise<LowStockAlertResponseDto[]> {
    return this.inventorySalesService.getLowStockAlerts();
  }

  @Patch('products/:id')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: 'Update product details' })
  async updateProduct(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
    @CurrentUser() user: any,
  ): Promise<ProductResponseDto> {
    return this.inventorySalesService.updateProduct(id, dto, user);
  }

  @Post('products/:id/restock')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: 'Restock product inventory' })
  async restockProduct(
    @Param('id') id: string,
    @Body() dto: RestockProductDto,
    @CurrentUser() user: any,
  ): Promise<ProductResponseDto> {
    return this.inventorySalesService.restockProduct(id, dto, user);
  }

  @Post('sales')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: 'Process POS sale' })
  async createSale(
    @Body() dto: CreateSaleDto,
    @CurrentUser() user: any,
  ): Promise<SaleResponseDto> {
    return this.inventorySalesService.createSale(dto, user);
  }

  @Get('sales')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: 'List POS sales' })
  async findSales(
    @Query() filters: SaleFiltersDto,
  ): Promise<PaginatedResponseDto<SaleResponseDto>> {
    return this.inventorySalesService.findSales(filters);
  }

  @Get('reports/sales')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: 'Get POS sales report summary' })
  async getSalesReport(
    @Query() query: SalesReportQueryDto,
  ): Promise<SalesReportResponseDto> {
    return this.inventorySalesService.getSalesReport(query);
  }
}
