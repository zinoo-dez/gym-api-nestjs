import {
  IsString,
  IsInt,
  Min,
  IsOptional,
  IsArray,
  MinLength,
  ArrayMinSize,
} from 'class-validator';

export class CreateExerciseDto {
  @IsString({ message: 'Name must be a string' })
  @MinLength(1, { message: 'Name must not be empty' })
  name!: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @IsInt({ message: 'Sets must be an integer' })
  @Min(1, { message: 'Sets must be at least 1' })
  sets!: number;

  @IsInt({ message: 'Reps must be an integer' })
  @Min(1, { message: 'Reps must be at least 1' })
  reps!: number;

  @IsOptional()
  @IsInt({ message: 'Duration must be an integer' })
  @Min(0, { message: 'Duration must be non-negative' })
  duration?: number;

  @IsArray({ message: 'Target muscles must be an array' })
  @ArrayMinSize(1, { message: 'At least one target muscle must be specified' })
  @IsString({ each: true, message: 'Each target muscle must be a string' })
  targetMuscles!: string[];

  @IsInt({ message: 'Order must be an integer' })
  @Min(0, { message: 'Order must be non-negative' })
  order!: number;
}
