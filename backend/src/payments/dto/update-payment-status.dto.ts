import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaymentStatus } from '@prisma/client';

export class UpdatePaymentStatusDto {
  @ApiProperty({
    description: 'Payment status',
    enum: PaymentStatus,
    example: PaymentStatus.PAID,
  })
  @IsEnum(PaymentStatus)
  status!: PaymentStatus;

  @ApiPropertyOptional({
    description: 'Admin note',
    example: 'Verified in bank statement',
  })
  @IsOptional()
  @IsString()
  adminNote?: string;
}
