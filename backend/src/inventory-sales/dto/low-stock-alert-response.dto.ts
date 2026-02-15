import { ProductCategory } from '@prisma/client';

export class LowStockAlertResponseDto {
  productId!: string;
  name!: string;
  sku!: string;
  category!: ProductCategory;
  stockQuantity!: number;
  lowStockThreshold!: number;
  deficit!: number;
  createdAt!: Date;
  updatedAt!: Date;
}
