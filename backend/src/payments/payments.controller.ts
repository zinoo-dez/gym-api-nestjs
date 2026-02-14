import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decorators';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentFiltersDto } from './dto/payment-filters.dto';
import { PaymentResponseDto } from './dto/payment-response.dto';
import { UpdatePaymentStatusDto } from './dto/update-payment-status.dto';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';

@ApiTags('payments')
@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @Roles(UserRole.MEMBER)
  @ApiOperation({ summary: 'Create payment (member submission)' })
  @ApiResponse({ status: 201, type: PaymentResponseDto })
  async create(
    @Body() dto: CreatePaymentDto,
    @CurrentUser() user: any,
  ): Promise<PaymentResponseDto> {
    return this.paymentsService.createForMember(dto, user);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: 'Get all payments (admin/staff)' })
  async findAll(
    @Query() filters: PaymentFiltersDto,
  ): Promise<PaginatedResponseDto<PaymentResponseDto>> {
    return this.paymentsService.findAll(filters);
  }

  @Get('me')
  @Roles(UserRole.MEMBER)
  @ApiOperation({ summary: 'Get current member payments' })
  async findMine(@CurrentUser() user: any): Promise<PaymentResponseDto[]> {
    return this.paymentsService.findMyPayments(user);
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: 'Update payment status (admin/staff)' })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdatePaymentStatusDto,
  ): Promise<PaymentResponseDto> {
    return this.paymentsService.updateStatus(id, dto);
  }
}
