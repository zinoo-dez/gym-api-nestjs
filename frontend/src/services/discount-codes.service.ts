import api from "./api";
import type { ApiEnvelope, ApiPaginatedResponse } from "./api.types";

export interface DiscountCode {
    id: string;
    code: string;
    description?: string;
    type: "PERCENTAGE" | "FIXED";
    amount: number;
    isActive: boolean;
}

export interface DiscountCodeFilters {
    search?: string;
    isActive?: boolean;
}

export const discountCodesService = {
    async listDiscountCodes(
        filters?: DiscountCodeFilters,
    ): Promise<DiscountCode[]> {
        const response = await api.get<
            ApiEnvelope<ApiPaginatedResponse<DiscountCode>>
        >("/discount-codes", {
            params: {
                ...filters,
                limit: 100,
            },
        });

        return response.data.data.data;
    },
};
