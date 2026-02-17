import { ProductCategory } from '@prisma/client';

export class MemberProductResponseDto {
  id!: string;
  name!: string;
  sku!: string;
  category!: ProductCategory;
  description?: string;
  salePrice!: number;
  stockQuantity!: number;
  isAvailable!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
}
