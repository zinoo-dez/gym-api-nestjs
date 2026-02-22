import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import {
  EQUIPMENT_CATEGORIES,
  EQUIPMENT_CONDITIONS,
  MAINTENANCE_FREQUENCIES,
} from '../equipment.constants';

export class CreateEquipmentDto {
  @ApiProperty({ example: 'Treadmill A1' })
  @IsString()
  @MaxLength(160)
  name!: string;

  @ApiProperty({ enum: EQUIPMENT_CATEGORIES, example: 'cardio' })
  @IsIn(EQUIPMENT_CATEGORIES)
  category!: string;

  @ApiProperty({ example: 'Life Fitness Integrity+' })
  @IsString()
  @MaxLength(180)
  brandModel!: string;

  @ApiPropertyOptional({ example: 'LF-A1-44211' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  serialNumber?: string;

  @ApiProperty({ example: '2026-02-21' })
  @Type(() => Date)
  @IsDate()
  purchaseDate!: Date;

  @ApiProperty({ example: 6800 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  purchaseCost!: number;

  @ApiProperty({ example: '2029-02-21' })
  @Type(() => Date)
  @IsDate()
  warrantyExpiryDate!: Date;

  @ApiProperty({ enum: EQUIPMENT_CONDITIONS, example: 'good' })
  @IsIn(EQUIPMENT_CONDITIONS)
  condition!: string;

  @ApiProperty({ enum: MAINTENANCE_FREQUENCIES, example: 'monthly' })
  @IsIn(MAINTENANCE_FREQUENCIES)
  maintenanceFrequency!: string;

  @ApiProperty({ example: '2026-02-21' })
  @Type(() => Date)
  @IsDate()
  lastMaintenanceDate!: Date;

  @ApiProperty({ example: 'Cardio Zone - Floor 1' })
  @IsString()
  @MaxLength(180)
  assignedArea!: string;

  @ApiPropertyOptional({ example: 'High usage during evening peak hours.' })
  @IsOptional()
  @IsString()
  @MaxLength(3000)
  notes?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
