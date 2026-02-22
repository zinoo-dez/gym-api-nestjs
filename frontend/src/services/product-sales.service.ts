import axios from "axios";

import api from "./api";

export type ProductCategory = "SUPPLEMENT" | "MERCHANDISE" | "PROTEIN_SHAKE" | "OTHER";
export type PosPaymentMethod =
  | "CASH"
  | "CARD"
  | "KBZ_PAY"
  | "AYA_PAY"
  | "WAVE_MONEY"
  | "BANK_TRANSFER";

export type ProductSaleStatus = "COMPLETED" | "REFUNDED" | "VOIDED";

interface ApiEnvelope<T> {
  data: T;
  statusCode: number;
  timestamp: string;
  path: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ProductRecord {
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
  isActive: boolean;
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

export interface SaleRecord {
  id: string;
  saleNumber: string;
  memberId?: string;
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
  member?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface SalesByPaymentMethod {
  paymentMethod: PosPaymentMethod;
  count: number;
  totalRevenue: number;
}

export interface TopSellingProduct {
  productId: string;
  name: string;
  sku: string;
  quantitySold: number;
  revenue: number;
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
  byPaymentMethod: SalesByPaymentMethod[];
  topProducts: TopSellingProduct[];
  lowStockCount: number;
}

export interface LowStockAlert {
  productId: string;
  name: string;
  sku: string;
  category: ProductCategory;
  stockQuantity: number;
  lowStockThreshold: number;
  deficit: number;
}

export interface ProductQueryFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: ProductCategory;
  lowStockOnly?: boolean;
  isActive?: boolean;
}

export interface SalesHistoryFilters {
  page?: number;
  limit?: number;
  search?: string;
  memberId?: string;
  startDate?: string;
  endDate?: string;
}

export interface SalesReportFilters {
  startDate?: string;
  endDate?: string;
  topN?: number;
}

export interface CreateProductInput {
  name: string;
  description?: string;
  category: ProductCategory;
  costPrice?: number;
  salePrice: number;
  sku: string;
  stockQuantity: number;
  lowStockThreshold?: number;
  isActive?: boolean;
}

export interface UpdateProductInput {
  name?: string;
  description?: string;
  category?: ProductCategory;
  costPrice?: number;
  salePrice?: number;
  sku?: string;
  stockQuantity?: number;
  lowStockThreshold?: number;
  isActive?: boolean;
}

export interface CreateSaleItemInput {
  productId: string;
  quantity: number;
  unitPrice?: number;
}

export interface CreateSaleInput {
  memberId?: string;
  paymentMethod?: PosPaymentMethod;
  discount?: number;
  tax?: number;
  notes?: string;
  soldAt?: string;
  items: CreateSaleItemInput[];
}

interface ProductApi {
  id: string;
  name: string;
  sku: string;
  category: string;
  description?: string;
  salePrice: number;
  costPrice?: number;
  stockQuantity: number;
  lowStockThreshold?: number;
  isLowStock?: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SaleLineItemApi {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

interface SaleMemberApi {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface SaleApi {
  id: string;
  saleNumber: string;
  memberId?: string;
  paymentMethod: string;
  status: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  notes?: string;
  soldAt: string;
  createdAt: string;
  updatedAt: string;
  items?: SaleLineItemApi[];
  member?: SaleMemberApi;
}

interface SalesByPaymentMethodApi {
  paymentMethod: string;
  count: number;
  totalRevenue: number;
}

interface TopSellingProductApi {
  productId: string;
  name: string;
  sku: string;
  quantitySold: number;
  revenue: number;
}

interface SalesReportApi {
  startDate: string;
  endDate: string;
  totalSalesCount: number;
  grossRevenue: number;
  totalDiscount: number;
  totalTax: number;
  netRevenue: number;
  averageOrderValue: number;
  byPaymentMethod: SalesByPaymentMethodApi[];
  topProducts: TopSellingProductApi[];
  lowStockCount: number;
}

interface LowStockAlertApi {
  productId: string;
  name: string;
  sku: string;
  category: string;
  stockQuantity: number;
  lowStockThreshold: number;
  deficit: number;
}

const PRODUCT_ENDPOINTS = ["/products", "/inventory-sales/products"] as const;
const SALES_CREATE_ENDPOINTS = ["/sales", "/inventory-sales/sales"] as const;
const SALES_HISTORY_ENDPOINTS = ["/sales/history", "/inventory-sales/sales"] as const;
const SALES_REPORT_ENDPOINTS = ["/sales/report", "/inventory-sales/reports/sales"] as const;
const LOW_STOCK_ENDPOINTS = ["/products/low-stock", "/inventory-sales/products/low-stock"] as const;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const toNumber = (value: unknown, fallback = 0): number => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
};

const normalizeCategory = (value: string): ProductCategory => {
  const normalized = value.toUpperCase();

  if (
    normalized === "SUPPLEMENT" ||
    normalized === "MERCHANDISE" ||
    normalized === "PROTEIN_SHAKE" ||
    normalized === "OTHER"
  ) {
    return normalized;
  }

  return "OTHER";
};

const normalizePaymentMethod = (value: string): PosPaymentMethod => {
  const normalized = value.toUpperCase();

  if (
    normalized === "CASH" ||
    normalized === "CARD" ||
    normalized === "KBZ_PAY" ||
    normalized === "AYA_PAY" ||
    normalized === "WAVE_MONEY" ||
    normalized === "BANK_TRANSFER"
  ) {
    return normalized;
  }

  return "CASH";
};

const normalizeSaleStatus = (value: string): ProductSaleStatus => {
  const normalized = value.toUpperCase();

  if (normalized === "REFUNDED" || normalized === "VOIDED" || normalized === "COMPLETED") {
    return normalized;
  }

  return "COMPLETED";
};

const normalizePaginatedPayload = <T>(payload: unknown): PaginatedResponse<T> => {
  if (Array.isArray(payload)) {
    return {
      data: payload as T[],
      page: 1,
      limit: payload.length,
      total: payload.length,
      totalPages: 1,
    };
  }

  if (isRecord(payload) && Array.isArray(payload.data)) {
    const data = payload.data as T[];
    const page = Math.max(toNumber(payload.page, 1), 1);
    const limit = Math.max(toNumber(payload.limit, data.length), 1);
    const total = Math.max(toNumber(payload.total, data.length), data.length);
    const computedPages = Math.max(Math.ceil(total / limit), 1);
    const totalPages = Math.max(toNumber(payload.totalPages, computedPages), 1);

    return {
      data,
      page,
      limit,
      total,
      totalPages,
    };
  }

  return {
    data: [],
    page: 1,
    limit: 1,
    total: 0,
    totalPages: 1,
  };
};

const shouldTryFallback = (error: unknown): boolean => {
  if (!axios.isAxiosError(error)) {
    return false;
  }

  const statusCode = error.response?.status;
  return statusCode === 404 || statusCode === 405;
};

const requestWithFallback = async <T>(attempts: Array<() => Promise<T>>): Promise<T> => {
  let lastError: unknown;

  for (const attempt of attempts) {
    try {
      return await attempt();
    } catch (error) {
      lastError = error;

      if (!shouldTryFallback(error)) {
        throw error;
      }
    }
  }

  throw lastError ?? new Error("Unable to complete inventory request.");
};

const toProductRecord = (product: ProductApi): ProductRecord => ({
  id: product.id,
  name: product.name,
  sku: product.sku,
  category: normalizeCategory(product.category),
  description: product.description,
  salePrice: toNumber(product.salePrice),
  costPrice:
    typeof product.costPrice === "number" && Number.isFinite(product.costPrice)
      ? product.costPrice
      : undefined,
  stockQuantity: Math.max(Math.trunc(toNumber(product.stockQuantity)), 0),
  lowStockThreshold: Math.max(Math.trunc(toNumber(product.lowStockThreshold, 5)), 0),
  isLowStock: Boolean(product.isLowStock),
  isActive: Boolean(product.isActive),
  createdAt: product.createdAt,
  updatedAt: product.updatedAt,
});

const toSaleLineItem = (item: SaleLineItemApi): SaleLineItem => ({
  id: item.id,
  productId: item.productId,
  productName: item.productName,
  productSku: item.productSku,
  quantity: Math.max(Math.trunc(toNumber(item.quantity)), 0),
  unitPrice: toNumber(item.unitPrice),
  lineTotal: toNumber(item.lineTotal),
});

const toSaleRecord = (sale: SaleApi): SaleRecord => ({
  id: sale.id,
  saleNumber: sale.saleNumber,
  memberId: sale.memberId,
  paymentMethod: normalizePaymentMethod(sale.paymentMethod),
  status: normalizeSaleStatus(sale.status),
  subtotal: toNumber(sale.subtotal),
  discount: toNumber(sale.discount),
  tax: toNumber(sale.tax),
  total: toNumber(sale.total),
  notes: sale.notes,
  soldAt: sale.soldAt,
  createdAt: sale.createdAt,
  updatedAt: sale.updatedAt,
  items: (sale.items ?? []).map(toSaleLineItem),
  member: sale.member
    ? {
        id: sale.member.id,
        firstName: sale.member.firstName,
        lastName: sale.member.lastName,
        email: sale.member.email,
      }
    : undefined,
});

const toSalesReport = (report: SalesReportApi): SalesReport => ({
  startDate: report.startDate,
  endDate: report.endDate,
  totalSalesCount: toNumber(report.totalSalesCount),
  grossRevenue: toNumber(report.grossRevenue),
  totalDiscount: toNumber(report.totalDiscount),
  totalTax: toNumber(report.totalTax),
  netRevenue: toNumber(report.netRevenue),
  averageOrderValue: toNumber(report.averageOrderValue),
  byPaymentMethod: (report.byPaymentMethod ?? []).map((entry) => ({
    paymentMethod: normalizePaymentMethod(entry.paymentMethod),
    count: toNumber(entry.count),
    totalRevenue: toNumber(entry.totalRevenue),
  })),
  topProducts: (report.topProducts ?? []).map((product) => ({
    productId: product.productId,
    name: product.name,
    sku: product.sku,
    quantitySold: toNumber(product.quantitySold),
    revenue: toNumber(product.revenue),
  })),
  lowStockCount: toNumber(report.lowStockCount),
});

const toLowStockAlert = (alert: LowStockAlertApi): LowStockAlert => ({
  productId: alert.productId,
  name: alert.name,
  sku: alert.sku,
  category: normalizeCategory(alert.category),
  stockQuantity: Math.max(Math.trunc(toNumber(alert.stockQuantity)), 0),
  lowStockThreshold: Math.max(Math.trunc(toNumber(alert.lowStockThreshold, 5)), 0),
  deficit: Math.max(Math.trunc(toNumber(alert.deficit)), 0),
});

const toAbsoluteUploadUrl = (value: string): string => {
  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  const baseUrl = api.defaults.baseURL;
  if (!baseUrl) {
    return value;
  }

  try {
    const parsedBase = new URL(baseUrl);
    const normalizedPath = value.startsWith("/") ? value : `/${value}`;
    return `${parsedBase.origin}${normalizedPath}`;
  } catch {
    return value;
  }
};

const sanitizeProductPayload = (
  values: CreateProductInput | UpdateProductInput,
): Record<string, string | number | boolean> => {
  const payload: Record<string, string | number | boolean> = {};

  if (typeof values.name === "string") {
    payload.name = values.name.trim();
  }

  if (typeof values.description === "string") {
    const trimmedDescription = values.description.trim();
    if (trimmedDescription.length > 0) {
      payload.description = trimmedDescription;
    }
  }

  if (typeof values.category === "string") {
    payload.category = values.category;
  }

  if (typeof values.costPrice === "number" && Number.isFinite(values.costPrice)) {
    payload.costPrice = values.costPrice;
  }

  if (typeof values.salePrice === "number" && Number.isFinite(values.salePrice)) {
    payload.salePrice = values.salePrice;
  }

  if (typeof values.sku === "string") {
    payload.sku = values.sku.trim();
  }

  if (typeof values.stockQuantity === "number" && Number.isFinite(values.stockQuantity)) {
    payload.stockQuantity = Math.max(Math.trunc(values.stockQuantity), 0);
  }

  if (typeof values.lowStockThreshold === "number" && Number.isFinite(values.lowStockThreshold)) {
    payload.lowStockThreshold = Math.max(Math.trunc(values.lowStockThreshold), 0);
  }

  if (typeof values.isActive === "boolean") {
    payload.isActive = values.isActive;
  }

  return payload;
};

const buildProductQueryParams = (
  filters: ProductQueryFilters,
): Record<string, string | number | boolean> => {
  const params: Record<string, string | number | boolean> = {};

  if (typeof filters.page === "number") {
    params.page = filters.page;
  }

  if (typeof filters.limit === "number") {
    params.limit = filters.limit;
  }

  if (filters.search && filters.search.trim().length > 0) {
    params.search = filters.search.trim();
  }

  if (filters.category) {
    params.category = filters.category;
  }

  if (typeof filters.lowStockOnly === "boolean") {
    params.lowStockOnly = filters.lowStockOnly;
  }

  if (typeof filters.isActive === "boolean") {
    params.isActive = filters.isActive;
  }

  return params;
};

const buildSalesQueryParams = (
  filters: SalesHistoryFilters,
): Record<string, string | number | boolean> => {
  const params: Record<string, string | number | boolean> = {};

  if (typeof filters.page === "number") {
    params.page = filters.page;
  }

  if (typeof filters.limit === "number") {
    params.limit = filters.limit;
  }

  if (filters.search && filters.search.trim().length > 0) {
    params.search = filters.search.trim();
  }

  if (filters.memberId && filters.memberId.trim().length > 0) {
    params.memberId = filters.memberId.trim();
  }

  if (filters.startDate && filters.startDate.trim().length > 0) {
    params.startDate = filters.startDate;
  }

  if (filters.endDate && filters.endDate.trim().length > 0) {
    params.endDate = filters.endDate;
  }

  return params;
};

const buildSalesReportParams = (
  filters: SalesReportFilters,
): Record<string, string | number | boolean> => {
  const params: Record<string, string | number | boolean> = {};

  if (filters.startDate && filters.startDate.trim().length > 0) {
    params.startDate = filters.startDate;
  }

  if (filters.endDate && filters.endDate.trim().length > 0) {
    params.endDate = filters.endDate;
  }

  if (typeof filters.topN === "number") {
    params.topN = filters.topN;
  }

  return params;
};

export const productSalesService = {
  async listProducts(filters: ProductQueryFilters = {}): Promise<PaginatedResponse<ProductRecord>> {
    const params = buildProductQueryParams(filters);

    const attempts = PRODUCT_ENDPOINTS.map(
      (endpoint) => async (): Promise<PaginatedResponse<ProductRecord>> => {
        const response = await api.get<ApiEnvelope<unknown>>(endpoint, { params });
        const pagePayload = normalizePaginatedPayload<ProductApi>(response.data.data);

        return {
          ...pagePayload,
          data: pagePayload.data.map(toProductRecord),
        };
      },
    );

    return requestWithFallback(attempts);
  },

  async createProduct(input: CreateProductInput): Promise<ProductRecord> {
    const payload = sanitizeProductPayload(input);

    const attempts = PRODUCT_ENDPOINTS.map(
      (endpoint) => async (): Promise<ProductRecord> => {
        const response = await api.post<ApiEnvelope<ProductApi>>(endpoint, payload);
        return toProductRecord(response.data.data);
      },
    );

    return requestWithFallback(attempts);
  },

  async updateProduct(productId: string, input: UpdateProductInput): Promise<ProductRecord> {
    const payload = sanitizeProductPayload(input);

    const attempts: Array<() => Promise<ProductRecord>> = [];

    for (const endpoint of PRODUCT_ENDPOINTS.map((base) => `${base}/${productId}`)) {
      attempts.push(async () => {
        const response = await api.put<ApiEnvelope<ProductApi>>(endpoint, payload);
        return toProductRecord(response.data.data);
      });

      attempts.push(async () => {
        const response = await api.patch<ApiEnvelope<ProductApi>>(endpoint, payload);
        return toProductRecord(response.data.data);
      });
    }

    return requestWithFallback(attempts);
  },

  async createSale(input: CreateSaleInput): Promise<SaleRecord> {
    const payload: Record<string, unknown> = {
      items: input.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        ...(typeof item.unitPrice === "number" ? { unitPrice: item.unitPrice } : {}),
      })),
    };

    if (input.memberId && input.memberId.trim().length > 0) {
      payload.memberId = input.memberId;
    }

    if (input.paymentMethod) {
      payload.paymentMethod = input.paymentMethod;
    }

    if (typeof input.discount === "number") {
      payload.discount = input.discount;
    }

    if (typeof input.tax === "number") {
      payload.tax = input.tax;
    }

    if (input.notes && input.notes.trim().length > 0) {
      payload.notes = input.notes.trim();
    }

    if (input.soldAt && input.soldAt.trim().length > 0) {
      payload.soldAt = input.soldAt;
    }

    const attempts = SALES_CREATE_ENDPOINTS.map(
      (endpoint) => async (): Promise<SaleRecord> => {
        const response = await api.post<ApiEnvelope<SaleApi>>(endpoint, payload);
        return toSaleRecord(response.data.data);
      },
    );

    return requestWithFallback(attempts);
  },

  async getSalesHistory(filters: SalesHistoryFilters = {}): Promise<PaginatedResponse<SaleRecord>> {
    const params = buildSalesQueryParams(filters);

    const attempts = SALES_HISTORY_ENDPOINTS.map(
      (endpoint) => async (): Promise<PaginatedResponse<SaleRecord>> => {
        const response = await api.get<ApiEnvelope<unknown>>(endpoint, { params });
        const pagePayload = normalizePaginatedPayload<SaleApi>(response.data.data);

        return {
          ...pagePayload,
          data: pagePayload.data.map(toSaleRecord),
        };
      },
    );

    return requestWithFallback(attempts);
  },

  async getSalesReport(filters: SalesReportFilters = {}): Promise<SalesReport> {
    const params = buildSalesReportParams(filters);

    const attempts = SALES_REPORT_ENDPOINTS.map(
      (endpoint) => async (): Promise<SalesReport> => {
        const response = await api.get<ApiEnvelope<SalesReportApi>>(endpoint, { params });
        return toSalesReport(response.data.data);
      },
    );

    return requestWithFallback(attempts);
  },

  async getLowStockAlerts(): Promise<LowStockAlert[]> {
    const attempts = LOW_STOCK_ENDPOINTS.map(
      (endpoint) => async (): Promise<LowStockAlert[]> => {
        const response = await api.get<ApiEnvelope<unknown>>(endpoint);
        const payload = response.data.data;

        if (Array.isArray(payload)) {
          return payload.map((item) => toLowStockAlert(item as LowStockAlertApi));
        }

        if (isRecord(payload) && Array.isArray(payload.data)) {
          return payload.data.map((item) => toLowStockAlert(item as LowStockAlertApi));
        }

        return [];
      },
    );

    return requestWithFallback(attempts);
  },

  async uploadProductImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post<ApiEnvelope<{ url: string }>>("/uploads", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    const uploadUrl = response.data.data?.url;

    if (typeof uploadUrl !== "string" || uploadUrl.length === 0) {
      throw new Error("Image upload did not return a file URL.");
    }

    return toAbsoluteUploadUrl(uploadUrl);
  },
};
