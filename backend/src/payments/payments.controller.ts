import {
  Body,
  Controller,
  Get,
  StreamableFile,
  Patch,
  Post,
  Param,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decorators';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../common/interfaces/current-user-payload.interface';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentFiltersDto } from './dto/payment-filters.dto';
import { PaymentResponseDto } from './dto/payment-response.dto';
import { UpdatePaymentStatusDto } from './dto/update-payment-status.dto';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';
import { RecoveryQueueResponseDto } from './dto/recovery-queue-response.dto';
import { SendRecoveryFollowUpDto } from './dto/send-recovery-followup.dto';
import { ProcessRefundDto } from './dto/process-refund.dto';
import { PaymentInvoiceResponseDto } from './dto/payment-invoice-response.dto';
import type { Response } from 'express';

@ApiTags('payments')
@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.STAFF, UserRole.MEMBER)
  @ApiOperation({
    summary: 'Create payment (member submission or manual admin)',
  })
  @ApiResponse({ status: 201, type: PaymentResponseDto })
  async create(
    @Body() dto: CreatePaymentDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<PaymentResponseDto> {
    return this.paymentsService.create(dto, user);
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
  async findMine(@CurrentUser() user: CurrentUserPayload): Promise<PaymentResponseDto[]> {
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

  @Get('recovery-queue')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({
    summary:
      'Get recovery queue (expiring memberships + pending/failed payments)',
  })
  @ApiResponse({ status: 200, type: RecoveryQueueResponseDto })
  async getRecoveryQueue(
    @Query('days') days?: string,
  ): Promise<RecoveryQueueResponseDto> {
    const windowDays = Number(days) || 7;
    return this.paymentsService.getRecoveryQueue(windowDays);
  }

  @Post(':id/follow-up')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({
    summary: 'Send recovery follow-up message for pending/failed payment',
  })
  async sendFollowUp(
    @Param('id') id: string,
    @Body() dto: SendRecoveryFollowUpDto,
  ): Promise<{ message: string }> {
    await this.paymentsService.sendRecoveryFollowUp(id, dto);
    return { message: 'Recovery follow-up sent' };
  }

  @Get('invoice/:id/pdf')
  @Roles(UserRole.ADMIN, UserRole.STAFF, UserRole.MEMBER)
  @ApiOperation({
    summary: 'Download invoice PDF by invoice ID/number or payment ID',
  })
  @ApiResponse({
    status: 200,
    description: 'PDF invoice generated successfully',
  })
  async downloadInvoicePdf(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
    @Res({ passthrough: true }) response: Response,
  ): Promise<StreamableFile> {
    const file = await this.paymentsService.getInvoicePdfByPaymentOrInvoiceId(
      id,
      user,
    );
    response.setHeader('Content-Type', 'application/pdf');
    response.setHeader(
      'Content-Disposition',
      `attachment; filename="${file.filename}"`,
    );
    return new StreamableFile(file.buffer);
  }

  @Get('invoice/:id')
  @Roles(UserRole.ADMIN, UserRole.STAFF, UserRole.MEMBER)
  @ApiOperation({ summary: 'Get invoice by invoice ID/number or payment ID' })
  @ApiResponse({ status: 200, type: PaymentInvoiceResponseDto })
  async getInvoice(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<PaymentInvoiceResponseDto> {
    return this.paymentsService.getInvoiceByPaymentOrInvoiceId(id, user);
  }

  @Post(':id/refund')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: 'Process a payment refund' })
  @ApiResponse({ status: 200, type: PaymentResponseDto })
  async processRefund(
    @Param('id') id: string,
    @Body() dto: ProcessRefundDto,
  ): Promise<PaymentResponseDto> {
    return this.paymentsService.processRefund(id, dto);
  }
}
