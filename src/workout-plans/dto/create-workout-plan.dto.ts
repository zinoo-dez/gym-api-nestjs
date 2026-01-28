import {
  IsString,
  IsOptional,
  IsUUID,
  IsEnum,
  IsArray,
  ValidateNested,
  MinLength,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { WorkoutGoal } from '@prisma/client';
import { CreateExerciseDto } from './create-exercise.dto';

export class CreateWorkoutPlanDto {
  @IsString({ message: 'Name must be a string' })
  @MinLength(1, { message: 'Name must not be empty' })
  name!: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @IsUUID('4', { message: 'Member ID must be a valid UUID' })
  memberId!: string;

  @IsEnum(WorkoutGoal, {
    message:
      'Goal must be a valid workout goal (WEIGHT_LOSS, MUSCLE_GAIN, ENDURANCE, FLEXIBILITY)',
  })
  goal!: WorkoutGoal;

  @IsArray({ message: 'Exercises must be an array' })
  @ArrayMinSize(1, { message: 'At least one exercise must be provided' })
  @ValidateNested({ each: true })
  @Type(() => CreateExerciseDto)
  exercises!: CreateExerciseDto[];
}
