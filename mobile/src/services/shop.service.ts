import { apiClient } from "@/lib/api/api-client";
import { unwrapApiData, type ApiResponseEnvelope } from "@/types/api";
import type {
  MemberProduct,
  PaginatedResponse,
  PosPaymentMethod,
} from "@/types/shop";

interface PurchaseRequest {
  paymentMethod: PosPaymentMethod;
  notes?: string;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
}

export const shopService = {
  async getProducts(params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
  }): Promise<PaginatedResponse<MemberProduct>> {
    const response = await apiClient.get<
      PaginatedResponse<MemberProduct> |
        ApiResponseEnvelope<PaginatedResponse<MemberProduct>>
    >("/inventory-sales/member/products", {
      params,
    });

    return unwrapApiData(response.data);
  },

  async purchase(payload: PurchaseRequest) {
    const response = await apiClient.post(
      "/inventory-sales/member/purchase",
      payload,
    );

    return unwrapApiData(response.data);
  },
};
