import { IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateGymClosureDto {
  @IsDateString()
  date!: string;

  @IsString()
  @IsOptional()
  reason?: string;
}
