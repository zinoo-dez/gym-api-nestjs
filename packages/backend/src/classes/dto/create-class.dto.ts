import {
  IsString,
  IsDateString,
  IsInt,
  Min,
  IsOptional,
} from 'class-validator';
import { IsFutureDate } from '../../common/validators';

export class CreateClassDto {
  @IsString({ message: 'Class name must be a string' })
  name!: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @IsString({ message: 'Trainer ID must be a string' })
  trainerId!: string;

  @IsDateString({}, { message: 'Schedule must be a valid ISO 8601 date' })
  @IsFutureDate({ message: 'Schedule must be in the future' })
  schedule!: string;

  @IsInt({ message: 'Duration must be an integer' })
  @Min(15, { message: 'Duration must be at least 15 minutes' })
  duration!: number;

  @IsInt({ message: 'Capacity must be an integer' })
  @Min(1, { message: 'Capacity must be at least 1' })
  capacity!: number;

  @IsString({ message: 'Class type must be a string' })
  classType!: string;
}
