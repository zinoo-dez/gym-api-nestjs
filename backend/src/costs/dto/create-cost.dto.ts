import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

import {
  COST_BILLING_PERIODS,
  COST_CATEGORIES,
  COST_PAYMENT_METHODS,
  COST_PAYMENT_STATUSES,
  COST_STATUSES,
  COST_TYPES,
} from '../costs.constants';

export class CreateCostDto {
  @ApiProperty()
  @IsString()
  @MaxLength(180)
  title!: string;

  @ApiProperty({ enum: COST_CATEGORIES })
  @IsIn(COST_CATEGORIES)
  category!: string;

  @ApiProperty({ enum: COST_TYPES })
  @IsIn(COST_TYPES)
  costType!: string;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  amount!: number;

  @ApiPropertyOptional({ default: 0 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  taxAmount?: number;

  @ApiProperty({ enum: COST_PAYMENT_METHODS })
  @IsIn(COST_PAYMENT_METHODS)
  paymentMethod!: string;

  @ApiProperty({ enum: COST_BILLING_PERIODS })
  @IsIn(COST_BILLING_PERIODS)
  billingPeriod!: string;

  @ApiProperty({ example: '2026-02-01' })
  @Type(() => Date)
  @IsDate()
  costDate!: Date;

  @ApiProperty({ example: '2026-02-03' })
  @Type(() => Date)
  @IsDate()
  dueDate!: Date;

  @ApiPropertyOptional({ nullable: true, example: '2026-02-02' })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  paidDate?: Date;

  @ApiPropertyOptional({ default: 'pending', enum: COST_PAYMENT_STATUSES })
  @IsIn(COST_PAYMENT_STATUSES)
  @IsOptional()
  paymentStatus?: string;

  @ApiPropertyOptional({ default: 'active', enum: COST_STATUSES })
  @IsIn(COST_STATUSES)
  @IsOptional()
  status?: string;

  @ApiPropertyOptional()
  @IsString()
  @MaxLength(120)
  @IsOptional()
  budgetGroup?: string;

  @ApiPropertyOptional()
  @IsString()
  @MaxLength(160)
  @IsOptional()
  vendor?: string;

  @ApiPropertyOptional()
  @IsString()
  @MaxLength(120)
  @IsOptional()
  referenceNumber?: string;

  @ApiPropertyOptional()
  @IsString()
  @MaxLength(3000)
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional()
  @IsString()
  @MaxLength(120)
  @IsOptional()
  createdBy?: string;
}
