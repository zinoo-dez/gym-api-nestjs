import {
  IsString,
  IsOptional,
  IsInt,
  Min,
  IsNumber,
  IsBoolean,
} from 'class-validator';

export class CreateMembershipPlanDto {
  @IsString({ message: 'Name must be a string' })
  name!: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @IsInt({ message: 'Duration days must be an integer' })
  @Min(1, { message: 'Duration must be at least 1 day' })
  durationDays!: number;

  @IsNumber({}, { message: 'Price must be a number' })
  @Min(0, { message: 'Price must be non-negative' })
  price!: number;

  @IsOptional()
  @IsBoolean()
  unlimitedClasses?: boolean;

  @IsOptional()
  @IsNumber({}, { message: 'Personal training hours must be a number' })
  @Min(0, { message: 'Personal training hours must be non-negative' })
  personalTrainingHours?: number;

  @IsOptional()
  @IsBoolean()
  accessToEquipment?: boolean;

  @IsOptional()
  @IsBoolean()
  accessToLocker?: boolean;

  @IsOptional()
  @IsBoolean()
  nutritionConsultation?: boolean;
}
