import { ProgressGoalStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';

export class ProgressGoalFiltersDto {
  @ApiPropertyOptional({ enum: ProgressGoalStatus })
  @IsOptional()
  @IsEnum(ProgressGoalStatus)
  status?: ProgressGoalStatus;

  @ApiPropertyOptional({ minimum: 1, maximum: 100, default: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  take?: number;
}
