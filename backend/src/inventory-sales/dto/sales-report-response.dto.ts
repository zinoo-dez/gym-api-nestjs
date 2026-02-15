import { PosPaymentMethod } from '@prisma/client';

export class SalesByPaymentMethodDto {
  paymentMethod!: PosPaymentMethod;
  count!: number;
  totalRevenue!: number;
}

export class TopSellingProductDto {
  productId!: string;
  name!: string;
  sku!: string;
  quantitySold!: number;
  revenue!: number;
}

export class SalesReportResponseDto {
  startDate!: Date;
  endDate!: Date;
  totalSalesCount!: number;
  grossRevenue!: number;
  totalDiscount!: number;
  totalTax!: number;
  netRevenue!: number;
  averageOrderValue!: number;
  byPaymentMethod!: SalesByPaymentMethodDto[];
  topProducts!: TopSellingProductDto[];
  lowStockCount!: number;
}
