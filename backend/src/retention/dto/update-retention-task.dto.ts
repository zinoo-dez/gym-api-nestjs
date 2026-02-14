import { ApiPropertyOptional } from '@nestjs/swagger';
import { RetentionTaskStatus } from '@prisma/client';
import { IsDateString, IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpdateRetentionTaskDto {
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

  @ApiPropertyOptional({ example: 'Call member with renewal offer' })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional({ example: '2026-02-16T12:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  dueDate?: string;
}

