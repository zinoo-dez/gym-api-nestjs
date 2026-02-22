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
import { MAINTENANCE_LOG_TYPES } from '../equipment.constants';

export class LogEquipmentMaintenanceDto {
  @ApiProperty({ example: '2026-02-21' })
  @Type(() => Date)
  @IsDate()
  date!: Date;

  @ApiProperty({ enum: MAINTENANCE_LOG_TYPES, example: 'routine' })
  @IsIn(MAINTENANCE_LOG_TYPES)
  type!: string;

  @ApiProperty({ example: 'Belt alignment and motor inspection' })
  @IsString()
  @MaxLength(3000)
  description!: string;

  @ApiProperty({ example: 120 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  cost!: number;

  @ApiPropertyOptional({ example: 'FitTech Services' })
  @IsOptional()
  @IsString()
  @MaxLength(180)
  performedBy?: string;

  @ApiPropertyOptional({ example: '2026-03-21' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  nextDueDate?: Date;
}
