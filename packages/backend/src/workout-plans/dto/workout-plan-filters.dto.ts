import { IsOptional, IsUUID, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { WorkoutGoal } from '@prisma/client';
import { PaginationDto } from '../../common/dto';

export class WorkoutPlanFiltersDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Filter by member ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  memberId?: string;

  @ApiPropertyOptional({
    description: 'Filter by trainer ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  trainerId?: string;

  @ApiPropertyOptional({
    description: 'Filter by workout goal',
    enum: WorkoutGoal,
    example: WorkoutGoal.MUSCLE_GAIN,
  })
  @IsOptional()
  @IsEnum(WorkoutGoal)
  goal?: WorkoutGoal;
}
