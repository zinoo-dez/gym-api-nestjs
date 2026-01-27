import {
  IsString,
  IsUUID,
  IsDateString,
  IsInt,
  Min,
  IsOptional,
} from 'class-validator';

export class CreateClassDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsUUID()
  trainerId!: string;

  @IsDateString()
  schedule!: string;

  @IsInt()
  @Min(15)
  duration!: number;

  @IsInt()
  @Min(1)
  capacity!: number;

  @IsString()
  classType!: string;
}
