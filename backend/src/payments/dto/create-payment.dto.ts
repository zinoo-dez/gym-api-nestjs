import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { PaymentMethodType, PaymentProvider } from '@prisma/client';

export class CreatePaymentDto {
  @ApiProperty({
    description: 'Subscription ID related to this payment',
    example: 'cml123abc',
  })
  @IsString()
  subscriptionId!: string;

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

  @ApiProperty({
    description: 'Payment method type',
    enum: PaymentMethodType,
    example: PaymentMethodType.BANK,
  })
  @IsEnum(PaymentMethodType)
  methodType!: PaymentMethodType;

  @ApiProperty({
    description: 'Payment provider',
    enum: PaymentProvider,
    example: PaymentProvider.KBZ,
  })
  @IsEnum(PaymentProvider)
  provider!: PaymentProvider;

  @ApiProperty({
    description: 'Transaction reference / number',
    example: 'TRX-2026-0001',
  })
  @IsString()
  transactionNo!: string;

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
}
