import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PricingCategory } from '@prisma/client';

export class PricingResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id!: string;

  @ApiProperty({ example: 'Premium Membership' })
  name!: string;

  @ApiPropertyOptional({ example: 'Full access to all facilities and classes' })
  description?: string;

  @ApiProperty({ enum: PricingCategory, example: 'MEMBERSHIP' })
  category!: PricingCategory;

  @ApiProperty({ example: 99.99 })
  price!: number;

  @ApiProperty({ example: 'USD' })
  currency!: string;

  @ApiPropertyOptional({ example: 30 })
  duration?: number;

  @ApiProperty({
    example: ['Unlimited gym access', '10 group classes per month'],
    type: [String],
  })
  features!: string[];

  @ApiProperty({ example: true })
  isActive!: boolean;

  @ApiProperty({ example: 1 })
  sortOrder!: number;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updatedAt!: Date;
}
