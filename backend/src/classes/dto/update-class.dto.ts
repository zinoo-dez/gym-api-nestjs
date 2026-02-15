import {
  IsString,
  IsDateString,
  IsInt,
  Min,
  IsOptional,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateClassDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  trainerId?: string;

  @ApiPropertyOptional({
    example: '2026-02-15T10:30:00.000Z',
    format: 'date-time',
  })
  @IsOptional()
  @IsDateString()
  schedule?: string;

  @IsOptional()
  @IsInt()
  @Min(15)
  duration?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  capacity?: number;

  @IsOptional()
  @IsString()
  classType?: string;
}
