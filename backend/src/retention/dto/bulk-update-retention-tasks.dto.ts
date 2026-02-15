import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RetentionTaskStatus } from '@prisma/client';
import {
  ArrayNotEmpty,
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class BulkUpdateRetentionTasksDto {
  @ApiProperty({ type: [String], example: ['cm123', 'cm456'] })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  taskIds!: string[];

  @ApiPropertyOptional({ enum: RetentionTaskStatus })
  @IsOptional()
  @IsEnum(RetentionTaskStatus)
  status?: RetentionTaskStatus;

  @ApiPropertyOptional({ example: 1, minimum: 1, maximum: 3 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(3)
  priority?: number;

  @ApiPropertyOptional({ example: 'cm1234567890abcdefghijkl' })
  @IsOptional()
  @IsString()
  assignedToId?: string;

  @ApiPropertyOptional({ example: 'Call members with renewal offer' })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional({
    example: '2026-02-16T12:00:00.000Z',
    format: 'date-time',
  })
  @IsOptional()
  @IsDateString()
  dueDate?: string;
}
