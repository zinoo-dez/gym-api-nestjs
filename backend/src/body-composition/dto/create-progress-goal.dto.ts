import { ProgressGoalType, ProgressMetric } from '@prisma/client';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateProgressGoalDto {
  @ApiPropertyOptional({ description: 'Required for ADMIN/TRAINER/STAFF' })
  @IsOptional()
  @IsString()
  memberId?: string;

  @ApiProperty({ enum: ProgressGoalType })
  @IsEnum(ProgressGoalType)
  type!: ProgressGoalType;

  @ApiProperty({ enum: ProgressMetric })
  @IsEnum(ProgressMetric)
  metric!: ProgressMetric;

  @ApiProperty()
  @IsString()
  @MaxLength(120)
  title!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ example: 'kg' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  unit?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  startValue?: number;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  targetValue!: number;

  @ApiPropertyOptional({ format: 'date-time' })
  @IsOptional()
  @IsDateString()
  targetDate?: string;
}
