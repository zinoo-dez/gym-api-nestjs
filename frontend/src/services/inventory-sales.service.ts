import { apiClient } from "@/lib/api-client";

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

export type ProductSaleStatus = "COMPLETED" | "REFUNDED" | "VOIDED";

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: ProductCategory;
  description?: string;
  salePrice: number;
  costPrice?: number;
  stockQuantity: number;
  lowStockThreshold: number;
  isLowStock: boolean;
  lowStockDeficit: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LowStockAlert {
  productId: string;
  name: string;
  sku: string;
  category: ProductCategory;
  stockQuantity: number;
  lowStockThreshold: number;
  deficit: number;
  createdAt: string;
  updatedAt: string;
}

export interface SaleLineItem {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface Sale {
  id: string;
  saleNumber: string;
  memberId?: string;
  processedByUserId?: string;
  paymentMethod: PosPaymentMethod;
  status: ProductSaleStatus;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  notes?: string;
  soldAt: string;
  createdAt: string;
  updatedAt: string;
  items: SaleLineItem[];
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface SalesReport {
  startDate: string;
  endDate: string;
  totalSalesCount: number;
  grossRevenue: number;
  totalDiscount: number;
  totalTax: number;
  netRevenue: number;
  averageOrderValue: number;
  byPaymentMethod: Array<{
    paymentMethod: PosPaymentMethod;
    count: number;
    totalRevenue: number;
  }>;
  topProducts: Array<{
    productId: string;
    name: string;
    sku: string;
    quantitySold: number;
    revenue: number;
  }>;
  lowStockCount: number;
}

interface ApiResponse<T> {
  data: T;
  statusCode: number;
  timestamp: string;
  path: string;
}

export const inventorySalesService = {
  async getProducts(params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: ProductCategory;
    isActive?: boolean;
    lowStockOnly?: boolean;
  }) {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Product>>>(
      "/inventory-sales/products",
      { params },
    );
    return response.data.data ?? response.data;
  },

  async createProduct(data: {
    name: string;
    sku: string;
    category?: ProductCategory;
    description?: string;
    salePrice: number;
    costPrice?: number;
    stockQuantity?: number;
    lowStockThreshold?: number;
    isActive?: boolean;
  }) {
    const response = await apiClient.post<ApiResponse<Product>>(
      "/inventory-sales/products",
      data,
    );
    return response.data.data ?? response.data;
  },

  async updateProduct(
    id: string,
    data: Partial<{
      name: string;
      sku: string;
      category: ProductCategory;
      description?: string;
      salePrice: number;
      costPrice?: number;
      stockQuantity: number;
      lowStockThreshold: number;
      isActive: boolean;
    }>,
  ) {
    const response = await apiClient.patch<ApiResponse<Product>>(
      `/inventory-sales/products/${id}`,
      data,
    );
    return response.data.data ?? response.data;
  },

  async restockProduct(id: string, data: { quantity: number; note?: string }) {
    const response = await apiClient.post<ApiResponse<Product>>(
      `/inventory-sales/products/${id}/restock`,
      data,
    );
    return response.data.data ?? response.data;
  },

  async getLowStockAlerts() {
    const response = await apiClient.get<ApiResponse<LowStockAlert[]>>(
      "/inventory-sales/products/low-stock",
    );
    return response.data.data ?? response.data;
  },

  async createSale(data: {
    memberId?: string;
    paymentMethod?: PosPaymentMethod;
    discount?: number;
    tax?: number;
    notes?: string;
    soldAt?: string;
    items: Array<{
      productId: string;
      quantity: number;
      unitPrice?: number;
    }>;
  }) {
    const response = await apiClient.post<ApiResponse<Sale>>(
      "/inventory-sales/sales",
      data,
    );
    return response.data.data ?? response.data;
  },

  async getSales(params?: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
    paymentMethod?: PosPaymentMethod;
    status?: ProductSaleStatus;
    memberId?: string;
    search?: string;
  }) {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Sale>>>(
      "/inventory-sales/sales",
      { params },
    );
    return response.data.data ?? response.data;
  },

  async getSalesReport(params?: {
    startDate?: string;
    endDate?: string;
    topN?: number;
  }) {
    const response = await apiClient.get<ApiResponse<SalesReport>>(
      "/inventory-sales/reports/sales",
      { params },
    );
    return response.data.data ?? response.data;
  },
};
