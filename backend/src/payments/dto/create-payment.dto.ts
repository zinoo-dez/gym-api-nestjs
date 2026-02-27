import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { PaymentMethodType, PaymentProvider } from '@prisma/client';

export class CreatePaymentDto {
  @ApiPropertyOptional({
    description: 'Subscription ID related to this payment',
    example: 'cml123abc',
  })
  @IsOptional()
  @IsString()
  subscriptionId!: string;

  @ApiPropertyOptional({
    description: 'Member ID for admin/staff manual payment',
    example: 'cmember123abc',
  })
  @IsOptional()
  @IsString()
  memberId?: string;

  @ApiProperty({
    description: 'Payment amount',
    example: 30000,
  })
  @IsNumber()
  amount!: number;

  @ApiPropertyOptional({
    description: 'Currency',
    example: 'MMK',
  })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({
    description: 'Payment method type',
    enum: PaymentMethodType,
    example: PaymentMethodType.BANK,
  })
  @IsOptional()
  @IsEnum(PaymentMethodType)
  methodType?: PaymentMethodType;

  @ApiPropertyOptional({
    description:
      'Legacy compatibility payment method label (manual flow supports CASH, CARD, BANK, WALLET)',
    example: 'CASH',
  })
  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @ApiPropertyOptional({
    description: 'Payment provider',
    enum: PaymentProvider,
    example: PaymentProvider.CASH,
  })
  @IsOptional()
  @IsEnum(PaymentProvider)
  provider?: PaymentProvider;

  @ApiPropertyOptional({
    description: 'Transaction reference / number',
    example: 'TRX-2026-0001',
  })
  @IsOptional()
  @IsString()
  transactionNo?: string;

  @ApiPropertyOptional({
    description: 'Screenshot URL for payment proof',
    example: 'https://example.com/payment-proof.jpg',
  })
  @IsOptional()
  @IsString()
  screenshotUrl?: string;

  @ApiPropertyOptional({
    description: 'Optional description or note',
    example: 'Paid via KBZ mobile transfer',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Compatibility field for admin notes',
    example: 'Manual walk-in payment',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Discount code ID applied to this payment',
    example: 'cdisc123abc',
  })
  @IsOptional()
  @IsString()
  discountCodeId?: string;
}
