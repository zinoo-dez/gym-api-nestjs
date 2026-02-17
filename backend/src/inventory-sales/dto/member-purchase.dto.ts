import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PosPaymentMethod } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class MemberPurchaseItemDto {
  @ApiProperty({ example: 'cmdabc123', description: 'Product ID' })
  @IsString()
  productId!: string;

  @ApiProperty({ example: 2, description: 'Quantity to purchase' })
  @IsInt()
  @Min(1)
  quantity!: number;
}

export class MemberPurchaseDto {
  @ApiProperty({
    enum: PosPaymentMethod,
    default: PosPaymentMethod.CASH,
    description: 'Payment method',
  })
  @IsEnum(PosPaymentMethod)
  paymentMethod!: PosPaymentMethod;

  @ApiPropertyOptional({ example: 'Buying protein shake after workout' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    type: [MemberPurchaseItemDto],
    description: 'Items to purchase',
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => MemberPurchaseItemDto)
  items!: MemberPurchaseItemDto[];
}
