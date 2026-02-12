import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { PricingCategory } from './create-pricing.dto';

export class PricingFiltersDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Filter by category',
    enum: PricingCategory,
  })
  @IsEnum(PricingCategory)
  @IsOptional()
  category?: PricingCategory;

  @ApiPropertyOptional({
    description: 'Filter by active status',
    example: true,
  })
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
