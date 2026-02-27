import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { WorkoutGoal } from '../../common/enums';
import { PaginationDto } from '../../common/dto';

export class WorkoutPlanFiltersDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Filter by member ID',
    example: 'cmember123abc',
  })
  @IsOptional()
  @IsString()
  memberId?: string;

  @ApiPropertyOptional({
    description: 'Filter by trainer ID',
    example: 'ctrainer123abc',
  })
  @IsOptional()
  @IsString()
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
