import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class UpdateOperatingHoursDto {
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek!: number;

  @IsString()
  @IsOptional()
  openTime?: string;

  @IsString()
  @IsOptional()
  closeTime?: string;

  @IsBoolean()
  @IsOptional()
  isClosed?: boolean;
}

export class UpdateBulkOperatingHoursDto {
  @IsOptional()
  hours?: UpdateOperatingHoursDto[];
}
