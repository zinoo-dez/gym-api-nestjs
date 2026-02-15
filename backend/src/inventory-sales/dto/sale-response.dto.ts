import { PosPaymentMethod, ProductSaleStatus } from '@prisma/client';

export class SaleLineItemResponseDto {
  id!: string;
  productId!: string;
  productName!: string;
  productSku!: string;
  quantity!: number;
  unitPrice!: number;
  lineTotal!: number;
}

export class SaleMemberResponseDto {
  id!: string;
  firstName!: string;
  lastName!: string;
  email!: string;
}

export class SaleProcessedByResponseDto {
  id!: string;
  email!: string;
  firstName!: string;
  lastName!: string;
}

export class SaleResponseDto {
  id!: string;
  saleNumber!: string;
  memberId?: string;
  processedByUserId?: string;
  paymentMethod!: PosPaymentMethod;
  status!: ProductSaleStatus;
  subtotal!: number;
  discount!: number;
  tax!: number;
  total!: number;
  notes?: string;
  soldAt!: Date;
  createdAt!: Date;
  updatedAt!: Date;
  items!: SaleLineItemResponseDto[];
  member?: SaleMemberResponseDto;
  processedBy?: SaleProcessedByResponseDto;
}
