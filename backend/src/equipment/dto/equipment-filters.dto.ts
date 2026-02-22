import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsIn, IsOptional, IsString } from 'class-validator';
import {
  EQUIPMENT_CATEGORIES,
  EQUIPMENT_CONDITIONS,
  MAINTENANCE_DUE_FILTERS,
} from '../equipment.constants';

export class EquipmentFiltersDto {
  @ApiPropertyOptional({ description: 'Search by name, category, model, or area' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: EQUIPMENT_CATEGORIES })
  @IsOptional()
  @IsIn(EQUIPMENT_CATEGORIES)
  category?: string;

  @ApiPropertyOptional({ enum: EQUIPMENT_CONDITIONS })
  @IsOptional()
  @IsIn(EQUIPMENT_CONDITIONS)
  condition?: string;

  @ApiPropertyOptional({ enum: MAINTENANCE_DUE_FILTERS })
  @IsOptional()
  @IsIn(MAINTENANCE_DUE_FILTERS)
  maintenanceDue?: string;

  @ApiPropertyOptional({ description: 'Filter by active/retired flag' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;
}
