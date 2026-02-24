import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import {
  EQUIPMENT_CATEGORIES,
  EQUIPMENT_CONDITIONS,
  MAINTENANCE_DUE_FILTERS,
} from '../equipment.constants';

export class EquipmentFiltersDto {
  @ApiPropertyOptional({
    description: 'Search by name, category, model, or area',
  })
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

  @ApiPropertyOptional({ description: 'Page number (for paginated list only)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    description: 'Items per page (for paginated list only)',
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({
    enum: [
      'name',
      'category',
      'condition',
      'assignedArea',
      'lastMaintenanceDate',
      'isActive',
      'purchaseDate',
      'purchaseCost',
      'nextMaintenanceDue',
      'updatedAt',
    ],
    default: 'updatedAt',
  })
  @IsOptional()
  @IsIn([
    'name',
    'category',
    'condition',
    'assignedArea',
    'lastMaintenanceDate',
    'isActive',
    'purchaseDate',
    'purchaseCost',
    'nextMaintenanceDue',
    'updatedAt',
  ])
  sortBy?:
    | 'name'
    | 'category'
    | 'condition'
    | 'assignedArea'
    | 'lastMaintenanceDate'
    | 'isActive'
    | 'purchaseDate'
    | 'purchaseCost'
    | 'nextMaintenanceDue'
    | 'updatedAt';

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'desc' })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortDirection?: 'asc' | 'desc';
}
