import { useMutation, useQuery, useQueryClient, type QueryKey } from "@tanstack/react-query";

import type { MemberProfile } from "@/features/people";
import { peopleService } from "@/services/people.service";
import {
  type CreateProductInput,
  type CreateSaleInput,
  type PaginatedResponse,
  type ProductQueryFilters,
  type ProductRecord,
  type SaleRecord,
  type SalesHistoryFilters,
  type TopSellingProduct,
  productSalesService,
} from "@/services/product-sales.service";

export const productSalesKeys = {
  all: ["product-sales"] as const,
  products: {
    all: ["product-sales", "products"] as const,
    list: (filters: ProductQueryFilters) => ["product-sales", "products", "list", filters] as const,
  },
  sales: {
    all: ["product-sales", "sales"] as const,
    history: (filters: SalesHistoryFilters) => ["product-sales", "sales", "history", filters] as const,
  },
  lowStock: () => ["product-sales", "low-stock"] as const,
  summary: {
    all: ["product-sales", "summary"] as const,
    todayRevenue: () => ["product-sales", "summary", "today-revenue"] as const,
    topProduct: () => ["product-sales", "summary", "top-product"] as const,
  },
  members: () => ["product-sales", "members"] as const,
};

interface SaleMutationContext {
  snapshots: Array<[QueryKey, PaginatedResponse<ProductRecord> | undefined]>;
}

const getTodayDateRange = () => {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);

  const end = new Date(now);
  end.setHours(23, 59, 59, 999);

  return {
    startDate: start.toISOString(),
    endDate: end.toISOString(),
  };
};

const getLastThirtyDaysRange = () => {
  const end = new Date();
  const start = new Date(end);
  start.setDate(end.getDate() - 29);
  start.setHours(0, 0, 0, 0);

  return {
    startDate: start.toISOString(),
    endDate: end.toISOString(),
  };
};

const aggregateTopSellingProduct = (sales: SaleRecord[]): TopSellingProduct | null => {
  const totals = new Map<
    string,
    {
      productId: string;
      name: string;
      sku: string;
      quantitySold: number;
      revenue: number;
    }
  >();

  for (const sale of sales) {
    for (const item of sale.items) {
      const current = totals.get(item.productId) ?? {
        productId: item.productId,
        name: item.productName,
        sku: item.productSku,
        quantitySold: 0,
        revenue: 0,
      };

      current.quantitySold += item.quantity;
      current.revenue += item.lineTotal;
      totals.set(item.productId, current);
    }
  }

  let topProduct: TopSellingProduct | null = null;

  for (const entry of totals.values()) {
    if (!topProduct || entry.quantitySold > topProduct.quantitySold) {
      topProduct = entry;
    }
  }

  return topProduct;
};

export const useProductListQuery = (filters: ProductQueryFilters) =>
  useQuery({
    queryKey: productSalesKeys.products.list(filters),
    queryFn: () => productSalesService.listProducts(filters),
    staleTime: 30_000,
  });

export const useSalesHistoryQuery = (filters: SalesHistoryFilters) =>
  useQuery({
    queryKey: productSalesKeys.sales.history(filters),
    queryFn: () => productSalesService.getSalesHistory(filters),
    staleTime: 30_000,
  });

export const useLowStockAlertsQuery = () =>
  useQuery({
    queryKey: productSalesKeys.lowStock(),
    queryFn: () => productSalesService.getLowStockAlerts(),
    staleTime: 30_000,
  });

export const useMembersForSaleQuery = () =>
  useQuery({
    queryKey: productSalesKeys.members(),
    queryFn: async (): Promise<MemberProfile[]> => {
      const members = await peopleService.listMembers();
      return members
        .filter((member) => member.isActive)
        .sort((a, b) => {
          const left = `${a.firstName} ${a.lastName}`.trim().toLowerCase();
          const right = `${b.firstName} ${b.lastName}`.trim().toLowerCase();
          return left.localeCompare(right);
        });
    },
    staleTime: 120_000,
  });

export const useTodayRevenueQuery = () =>
  useQuery({
    queryKey: productSalesKeys.summary.todayRevenue(),
    queryFn: async () => {
      const { startDate, endDate } = getTodayDateRange();

      try {
        const report = await productSalesService.getSalesReport({
          startDate,
          endDate,
          topN: 1,
        });

        return report.netRevenue;
      } catch {
        const sales = await productSalesService.getSalesHistory({
          startDate,
          endDate,
          page: 1,
          limit: 200,
        });

        return sales.data.reduce((total, sale) => total + sale.total, 0);
      }
    },
    staleTime: 30_000,
  });

export const useTopSellingProductQuery = () =>
  useQuery({
    queryKey: productSalesKeys.summary.topProduct(),
    queryFn: async () => {
      const { startDate, endDate } = getLastThirtyDaysRange();

      try {
        const report = await productSalesService.getSalesReport({
          startDate,
          endDate,
          topN: 1,
        });

        return report.topProducts[0] ?? null;
      } catch {
        const sales = await productSalesService.getSalesHistory({
          startDate,
          endDate,
          page: 1,
          limit: 200,
        });

        return aggregateTopSellingProduct(sales.data);
      }
    },
    staleTime: 30_000,
  });

export const useCreateProductMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateProductInput) => productSalesService.createProduct(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: productSalesKeys.products.all });
      void queryClient.invalidateQueries({ queryKey: productSalesKeys.lowStock() });
    },
  });
};

export const useUpdateProductMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, payload }: { productId: string; payload: CreateProductInput }) =>
      productSalesService.updateProduct(productId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: productSalesKeys.products.all });
      void queryClient.invalidateQueries({ queryKey: productSalesKeys.lowStock() });
    },
  });
};

export const useCreateSaleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<SaleRecord, unknown, CreateSaleInput, SaleMutationContext>({
    mutationFn: (payload) => productSalesService.createSale(payload),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: productSalesKeys.products.all });

      const snapshots = queryClient.getQueriesData<PaginatedResponse<ProductRecord>>({
        queryKey: productSalesKeys.products.all,
      });

      for (const [queryKey, cachedPage] of snapshots) {
        if (!cachedPage) {
          continue;
        }

        const adjustedProducts = cachedPage.data.map((product) => {
          const saleItem = payload.items.find((item) => item.productId === product.id);

          if (!saleItem) {
            return product;
          }

          const nextStock = Math.max(product.stockQuantity - saleItem.quantity, 0);

          return {
            ...product,
            stockQuantity: nextStock,
            isLowStock: nextStock <= Math.max(product.lowStockThreshold, 5),
          };
        });

        queryClient.setQueryData<PaginatedResponse<ProductRecord>>(queryKey, {
          ...cachedPage,
          data: adjustedProducts,
        });
      }

      return { snapshots };
    },
    onError: (_error, _payload, context) => {
      if (!context) {
        return;
      }

      for (const [queryKey, snapshot] of context.snapshots) {
        queryClient.setQueryData(queryKey, snapshot);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: productSalesKeys.products.all });
      void queryClient.invalidateQueries({ queryKey: productSalesKeys.sales.all });
      void queryClient.invalidateQueries({ queryKey: productSalesKeys.summary.all });
      void queryClient.invalidateQueries({ queryKey: productSalesKeys.lowStock() });
    },
  });
};
