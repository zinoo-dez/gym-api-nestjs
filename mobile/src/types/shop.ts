export type ProductCategory =
  | "SUPPLEMENT"
  | "MERCHANDISE"
  | "PROTEIN_SHAKE"
  | "OTHER";

export type PosPaymentMethod =
  | "CASH"
  | "CARD"
  | "KBZ_PAY"
  | "AYA_PAY"
  | "WAVE_MONEY"
  | "BANK_TRANSFER";

export interface MemberProduct {
  id: string;
  name: string;
  sku: string;
  category: ProductCategory;
  description?: string;
  salePrice: number;
  stockQuantity: number;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
