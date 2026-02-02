import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsNumber,
  IsOptional,
  IsArray,
  IsBoolean,
  Min,
} from 'class-validator';
import { PricingCategory } from '@prisma/client';

export class CreatePricingDto {
  @ApiProperty({ description: 'Pricing name', example: 'Premium Membership' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({
    description: 'Pricing description',
    example: 'Full access to all facilities and classes',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Pricing category',
    enum: PricingCategory,
    example: 'MEMBERSHIP',
  })
  @IsEnum(PricingCategory)
  @IsNotEmpty()
  category!: PricingCategory;

  @ApiProperty({ description: 'Price amount', example: 99.99 })
  @IsNumber()
  @Min(0)
  price!: number;

  @ApiPropertyOptional({
    description: 'Currency code',
    example: 'USD',
    default: 'USD',
  })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiPropertyOptional({
    description: 'Duration in days (for time-based pricing)',
    example: 30,
  })
  @IsNumber()
  @IsOptional()
  @Min(1)
  duration?: number;

  @ApiPropertyOptional({
    description: 'List of features included',
    example: ['Unlimited gym access', '10 group classes per month'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  features?: string[];

  @ApiPropertyOptional({
    description: 'Whether the pricing is active',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Sort order for display',
    example: 1,
    default: 0,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  sortOrder?: number;
}
