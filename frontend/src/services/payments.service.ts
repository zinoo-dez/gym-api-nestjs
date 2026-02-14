import { apiClient } from "@/lib/api-client";

export type PaymentStatus = "PENDING" | "PAID" | "REJECTED";
export type PaymentMethodType = "BANK" | "WALLET";
export type PaymentProvider =
  | "AYA"
  | "KBZ"
  | "CB"
  | "UAB"
  | "A_BANK"
  | "YOMA"
  | "KBZ_PAY"
  | "AYA_PAY"
  | "CB_PAY"
  | "UAB_PAY"
  | "WAVE_MONEY";

export interface PaymentMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface PaymentPlan {
  id: string;
  name: string;
  price?: number;
}

export interface PaymentSubscription {
  id: string;
  status: string;
  startDate: string;
  endDate: string;
  membershipPlan?: PaymentPlan;
}

export interface Payment {
  id: string;
  memberId: string;
  subscriptionId?: string;
  amount: number;
  currency: string;
  methodType: PaymentMethodType;
  provider: PaymentProvider;
  transactionNo: string;
  screenshotUrl?: string;
  status: PaymentStatus;
  adminNote?: string;
  description?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
  member?: PaymentMember;
  subscription?: PaymentSubscription;
}

export interface PaymentsResponse {
  data: Payment[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CreatePaymentRequest {
  subscriptionId: string;
  amount: number;
  currency?: string;
  methodType: PaymentMethodType;
  provider: PaymentProvider;
  transactionNo: string;
  screenshotUrl?: string;
  description?: string;
}

export interface UpdatePaymentStatusRequest {
  status: PaymentStatus;
  adminNote?: string;
}

interface ApiResponse<T> {
  data: T;
  statusCode: number;
  timestamp: string;
  path: string;
}

export const paymentsService = {
  async getAll(params?: {
    page?: number;
    limit?: number;
    status?: PaymentStatus;
    methodType?: PaymentMethodType;
    provider?: PaymentProvider;
    memberId?: string;
    search?: string;
  }) {
    const response = await apiClient.get<ApiResponse<PaymentsResponse>>(
      "/payments",
      { params },
    );
    return response.data.data ?? response.data;
  },

  async getMyPayments() {
    const response = await apiClient.get<ApiResponse<Payment[]>>(
      "/payments/me",
    );
    return response.data.data ?? response.data;
  },

  async create(data: CreatePaymentRequest) {
    const response = await apiClient.post<ApiResponse<Payment>>(
      "/payments",
      data,
    );
    return response.data.data ?? response.data;
  },

  async updateStatus(id: string, data: UpdatePaymentStatusRequest) {
    const response = await apiClient.patch<ApiResponse<Payment>>(
      `/payments/${id}/status`,
      data,
    );
    return response.data.data ?? response.data;
  },
};
