import { ApiPropertyOptional } from '@nestjs/swagger';
import { RetentionTaskStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class RetentionTaskFiltersDto {
  @ApiPropertyOptional({ enum: RetentionTaskStatus })
  @IsOptional()
  @IsEnum(RetentionTaskStatus)
  status?: RetentionTaskStatus;

  @ApiPropertyOptional({ example: 1, minimum: 1, maximum: 3 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(3)
  priority?: number;

  @ApiPropertyOptional({ example: 'cm1234567890abcdefghijkl' })
  @IsOptional()
  @IsString()
  assignedToId?: string;

  @ApiPropertyOptional({ example: 'cm1234567890abcdefghijkl' })
  @IsOptional()
  @IsString()
  memberId?: string;

  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 20, default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
