import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateClassPackageDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  passType!: string;

  @IsOptional()
  @IsUUID('4')
  classId?: string;

  @IsNumber()
  @Min(0)
  creditsIncluded!: number;

  @IsNumber()
  @Min(0)
  price!: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  validityDays?: number;

  @IsOptional()
  @IsBoolean()
  monthlyUnlimited?: boolean;
}
