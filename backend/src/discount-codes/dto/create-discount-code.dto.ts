import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsEnum,
  IsInt,
  Min,
  IsDateString,
} from 'class-validator';
import { DiscountType } from '@prisma/client';

export class CreateDiscountCodeDto {
  @IsString()
  code!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(DiscountType)
  type!: DiscountType;

  @IsNumber()
  @Min(0)
  amount!: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxRedemptions?: number;

  @IsOptional()
  @IsDateString()
  startsAt?: string;

  @IsOptional()
  @IsDateString()
  endsAt?: string;
}
