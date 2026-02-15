import { ProductCategory } from '@prisma/client';

export class ProductResponseDto {
  id!: string;
  name!: string;
  sku!: string;
  category!: ProductCategory;
  description?: string;
  salePrice!: number;
  costPrice?: number;
  stockQuantity!: number;
  lowStockThreshold!: number;
  isLowStock!: boolean;
  lowStockDeficit!: number;
  isActive!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
}
