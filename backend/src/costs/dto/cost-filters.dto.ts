import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

import {
  COST_CATEGORIES,
  COST_PAYMENT_STATUSES,
  COST_STATUSES,
  COST_TYPES,
} from '../costs.constants';

export class CostFiltersDto {
  @ApiPropertyOptional({ example: 'rent' })
  @IsOptional()
  @IsString()
  @MaxLength(180)
  search?: string;

  @ApiPropertyOptional({ enum: COST_CATEGORIES })
  @IsOptional()
  @IsIn(COST_CATEGORIES)
  category?: string;

  @ApiPropertyOptional({ enum: COST_TYPES })
  @IsOptional()
  @IsIn(COST_TYPES)
  costType?: string;

  @ApiPropertyOptional({ enum: COST_PAYMENT_STATUSES })
  @IsOptional()
  @IsIn(COST_PAYMENT_STATUSES)
  paymentStatus?: string;

  @ApiPropertyOptional({ enum: COST_STATUSES })
  @IsOptional()
  @IsIn(COST_STATUSES)
  status?: string;

  @ApiPropertyOptional({ example: '2026-02-01' })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  dateFrom?: Date;

  @ApiPropertyOptional({ example: '2026-02-28' })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  dateTo?: Date;
}
