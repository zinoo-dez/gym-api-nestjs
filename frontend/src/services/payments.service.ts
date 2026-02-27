import axios from "axios";

import api from "./api";

export const BILLING_PAYMENT_METHODS = ["CARD", "CASH", "TRANSFER"] as const;
export const BILLING_PAYMENT_STATUSES = [
  "SUCCESS",
  "PENDING",
  "FAILED",
  "REFUNDED",
] as const;
export const PAYMENT_CATEGORIES = [
  "MEMBERSHIP",
  "PERSONAL_TRAINING",
  "PRODUCT",
] as const;
export const MANUAL_OFFLINE_PAYMENT_METHODS = [
  "CASH",
  "CARD",
  "BANK",
  "WALLET",
] as const;

export type BillingPaymentMethod = (typeof BILLING_PAYMENT_METHODS)[number];
export type BillingPaymentStatus = (typeof BILLING_PAYMENT_STATUSES)[number];
export type PaymentCategory = (typeof PAYMENT_CATEGORIES)[number];
export type ManualOfflinePaymentMethod =
  (typeof MANUAL_OFFLINE_PAYMENT_METHODS)[number];

export interface PaymentsQueryFilters {
  search?: string;
  status?: BillingPaymentStatus | "ALL";
  paymentMethod?: BillingPaymentMethod | "ALL";
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface PaymentSubscriptionSnapshot {
  id: string;
  status: string;
  planName?: string;
  startDate?: string;
  endDate?: string;
  autoRenew?: boolean;
}

export interface PaymentTransaction {
  id: string;
  transactionId: string;
  memberId: string;
  memberName: string;
  memberEmail?: string;
  amount: number;
  currency: string;
  paymentMethod: BillingPaymentMethod;
  paymentCategory?: PaymentCategory;
  status: BillingPaymentStatus;
  date: string;
  notes?: string;
  invoiceId: string;
  subscription?: PaymentSubscriptionSnapshot;
  rawStatus?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ManualPaymentPayload {
  memberId: string;
  amount: number;
  paymentMethod: ManualOfflinePaymentMethod;
  paymentCategory: PaymentCategory;
  notes?: string;
  discountCodeId?: string;
}

export interface ProcessRefundPayload {
  reason: string;
  amount?: number;
}

export interface PaymentInvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface PaymentInvoice {
  id: string;
  invoiceNumber: string;
  issuedAt: string;
  dueAt?: string;
  status: string;
  currency: string;
  gym: {
    name: string;
    logoUrl?: string;
    address?: string;
    email?: string;
    phone?: string;
  };
  member: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
  };
  items: PaymentInvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  notes?: string;
}

export interface InvoicePdfDownload {
  blob: Blob;
  filename: string;
}

export interface PaymentSummary {
  totalRevenueMtd: number;
  pendingInvoicesDues: number;
  recentFailedPayments: number;
}

export interface PaymentCapabilities {
  invoice: boolean;
  refund: boolean;
}

interface ManualPaymentCreateRequestDto {
  memberId: string;
  amount: number;
  methodType: "WALLET" | "BANK";
  provider: "CASH" | "CARD" | "KBZ" | "KBZ_PAY";
  notes?: string;
  description: string;
  discountCodeId?: string;
}

const paymentCategoryDescription: Record<PaymentCategory, string> = {
  MEMBERSHIP: "membership",
  PERSONAL_TRAINING: "personal training",
  PRODUCT: "product",
};

const manualPaymentMethodDescription: Record<
  ManualOfflinePaymentMethod,
  string
> = {
  CASH: "cash",
  CARD: "card",
  BANK: "bank",
  WALLET: "wallet",
};

const manualPaymentMethodToDto: Record<
  ManualOfflinePaymentMethod,
  Pick<ManualPaymentCreateRequestDto, "methodType" | "provider">
> = {
  CASH: { methodType: "WALLET", provider: "CASH" },
  CARD: { methodType: "WALLET", provider: "CARD" },
  BANK: { methodType: "BANK", provider: "KBZ" },
  WALLET: { methodType: "WALLET", provider: "KBZ_PAY" },
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const toNumber = (value: unknown, fallback = 0): number => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
};

const toStringOrUndefined = (value: unknown): string | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const toBooleanOrUndefined = (value: unknown): boolean | undefined => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true") {
      return true;
    }

    if (normalized === "false") {
      return false;
    }
  }

  return undefined;
};

const unwrapData = (value: unknown): unknown => {
  if (isRecord(value) && "data" in value) {
    return value.data;
  }

  return value;
};

const joinName = (firstName?: string, lastName?: string): string => {
  const fullName = `${firstName ?? ""} ${lastName ?? ""}`.trim();
  return fullName.length > 0 ? fullName : "Unknown Member";
};

const normalizePaymentStatus = (value: unknown): BillingPaymentStatus => {
  const normalized = toStringOrUndefined(value)?.toUpperCase() ?? "";

  if (
    normalized === "SUCCESS" ||
    normalized === "PAID" ||
    normalized === "COMPLETED"
  ) {
    return "SUCCESS";
  }

  if (
    normalized === "FAILED" ||
    normalized === "REJECTED" ||
    normalized === "DECLINED" ||
    normalized === "ERROR"
  ) {
    return "FAILED";
  }

  if (normalized === "REFUNDED" || normalized === "PARTIALLY_REFUNDED") {
    return "REFUNDED";
  }

  return "PENDING";
};

const normalizePaymentMethod = (value: unknown): BillingPaymentMethod => {
  const normalized = toStringOrUndefined(value)?.toUpperCase() ?? "";

  if (normalized === "BANK") {
    return "TRANSFER";
  }

  if (normalized === "WALLET") {
    return "CASH";
  }

  if (
    normalized === "CARD" ||
    normalized === "CREDIT_CARD" ||
    normalized === "DEBIT_CARD"
  ) {
    return "CARD";
  }

  if (normalized === "CASH") {
    return "CASH";
  }

  if (
    normalized === "TRANSFER" ||
    normalized === "BANK_TRANSFER" ||
    normalized === "KBZ" ||
    normalized === "AYA" ||
    normalized === "CB" ||
    normalized === "UAB" ||
    normalized === "A_BANK" ||
    normalized === "YOMA" ||
    normalized === "KBZ_PAY" ||
    normalized === "AYA_PAY" ||
    normalized === "CB_PAY" ||
    normalized === "UAB_PAY" ||
    normalized === "WAVE_MONEY"
  ) {
    return "TRANSFER";
  }

  return "CARD";
};

const normalizePaymentCategory = (
  value: unknown,
): PaymentCategory | undefined => {
  const normalized = toStringOrUndefined(value)?.toUpperCase() ?? "";

  if (
    normalized === "MEMBERSHIP" ||
    normalized === "PERSONAL_TRAINING" ||
    normalized === "PRODUCT"
  ) {
    return normalized;
  }

  if (normalized === "PT") {
    return "PERSONAL_TRAINING";
  }

  return undefined;
};

const compactObject = <T extends Record<string, unknown>>(
  value: T,
): Partial<T> => {
  return Object.entries(value).reduce<Partial<T>>(
    (accumulator, [key, entry]) => {
      if (entry === undefined || entry === null) {
        return accumulator;
      }

      if (typeof entry === "string" && entry.trim().length === 0) {
        return accumulator;
      }

      accumulator[key as keyof T] = entry as T[keyof T];
      return accumulator;
    },
    {},
  );
};

const normalizeSubscription = (
  value: unknown,
): PaymentSubscriptionSnapshot | undefined => {
  if (!isRecord(value)) {
    return undefined;
  }

  const membershipPlan = isRecord(value.membershipPlan)
    ? value.membershipPlan
    : undefined;
  const planName =
    toStringOrUndefined(value.planName) ??
    (membershipPlan ? toStringOrUndefined(membershipPlan.name) : undefined);

  const id =
    toStringOrUndefined(value.id) ??
    toStringOrUndefined(value.subscriptionId) ??
    toStringOrUndefined(value.membershipId);

  if (!id) {
    return undefined;
  }

  return {
    id,
    status: toStringOrUndefined(value.status) ?? "UNKNOWN",
    planName,
    startDate:
      toStringOrUndefined(value.startDate) ??
      toStringOrUndefined(value.startsAt) ??
      toStringOrUndefined(value.periodStart),
    endDate:
      toStringOrUndefined(value.endDate) ??
      toStringOrUndefined(value.endsAt) ??
      toStringOrUndefined(value.periodEnd),
    autoRenew:
      toBooleanOrUndefined(value.autoRenew) ??
      toBooleanOrUndefined(value.isAutoRenew) ??
      toBooleanOrUndefined(value.autoRenewEnabled),
  };
};

const normalizeTransaction = (value: unknown): PaymentTransaction => {
  if (!isRecord(value)) {
    return {
      id: "unknown",
      transactionId: "unknown",
      memberId: "unknown",
      memberName: "Unknown Member",
      amount: 0,
      currency: "USD",
      paymentMethod: "CARD",
      status: "PENDING",
      date: new Date().toISOString(),
      invoiceId: "unknown",
    };
  }

  const member = isRecord(value.member) ? value.member : undefined;
  const memberName =
    toStringOrUndefined(value.memberName) ??
    joinName(
      member ? toStringOrUndefined(member.firstName) : undefined,
      member ? toStringOrUndefined(member.lastName) : undefined,
    );

  const id =
    toStringOrUndefined(value.id) ??
    toStringOrUndefined(value.paymentId) ??
    "unknown";
  const transactionId =
    toStringOrUndefined(value.transactionId) ??
    toStringOrUndefined(value.transactionNo) ??
    toStringOrUndefined(value.referenceNo) ??
    id;

  const invoiceId =
    toStringOrUndefined(value.invoiceId) ??
    toStringOrUndefined(value.invoiceNumber) ??
    id;

  const rawStatus =
    toStringOrUndefined(value.status) ??
    toStringOrUndefined(value.paymentStatus) ??
    "";

  const methodValue =
    toStringOrUndefined(value.paymentMethod) ??
    toStringOrUndefined(value.provider) ??
    toStringOrUndefined(value.methodType) ??
    toStringOrUndefined(value.method);

  const date =
    toStringOrUndefined(value.date) ??
    toStringOrUndefined(value.paidAt) ??
    toStringOrUndefined(value.createdAt) ??
    new Date().toISOString();

  const notes =
    toStringOrUndefined(value.notes) ??
    toStringOrUndefined(value.description) ??
    toStringOrUndefined(value.adminNote);

  return {
    id,
    transactionId,
    memberId:
      toStringOrUndefined(value.memberId) ??
      (member ? toStringOrUndefined(member.id) : undefined) ??
      "unknown",
    memberName,
    memberEmail: member ? toStringOrUndefined(member.email) : undefined,
    amount: toNumber(value.amount),
    currency: toStringOrUndefined(value.currency) ?? "USD",
    paymentMethod: normalizePaymentMethod(methodValue),
    paymentCategory: normalizePaymentCategory(
      value.paymentCategory ?? value.category,
    ),
    status: normalizePaymentStatus(rawStatus),
    rawStatus,
    date,
    notes,
    invoiceId,
    subscription: normalizeSubscription(value.subscription),
  };
};

const normalizePaginatedPayload = <T>(
  payload: unknown,
  normalizeItem: (item: unknown) => T,
): PaginatedResponse<T> => {
  const unwrapped = unwrapData(payload);

  if (Array.isArray(unwrapped)) {
    return {
      data: unwrapped.map(normalizeItem),
      page: 1,
      limit: unwrapped.length || 1,
      total: unwrapped.length,
      totalPages: 1,
    };
  }

  if (isRecord(unwrapped)) {
    if (Array.isArray(unwrapped.data)) {
      const page = Math.max(toNumber(unwrapped.page, 1), 1);
      const limit = Math.max(
        toNumber(unwrapped.limit, unwrapped.data.length || 1),
        1,
      );
      const total = Math.max(
        toNumber(unwrapped.total, unwrapped.data.length),
        unwrapped.data.length,
      );
      const computedPages = Math.max(Math.ceil(total / limit), 1);

      return {
        data: unwrapped.data.map(normalizeItem),
        page,
        limit,
        total,
        totalPages: Math.max(toNumber(unwrapped.totalPages, computedPages), 1),
      };
    }

    if (Array.isArray(unwrapped.items)) {
      const page = Math.max(toNumber(unwrapped.page, 1), 1);
      const limit = Math.max(
        toNumber(unwrapped.limit, unwrapped.items.length || 1),
        1,
      );
      const total = Math.max(
        toNumber(unwrapped.total, unwrapped.items.length),
        unwrapped.items.length,
      );

      return {
        data: unwrapped.items.map(normalizeItem),
        page,
        limit,
        total,
        totalPages: Math.max(
          toNumber(unwrapped.totalPages, Math.ceil(total / limit)),
          1,
        ),
      };
    }

    if ("data" in unwrapped) {
      return normalizePaginatedPayload(unwrapped.data, normalizeItem);
    }
  }

  return {
    data: [],
    page: 1,
    limit: 1,
    total: 0,
    totalPages: 1,
  };
};

const normalizeInvoiceItem = (
  value: unknown,
  index: number,
): PaymentInvoiceItem => {
  if (!isRecord(value)) {
    return {
      id: `line-${index + 1}`,
      description: "Charge",
      quantity: 1,
      unitPrice: 0,
      lineTotal: 0,
    };
  }

  const quantity = Math.max(toNumber(value.quantity, 1), 1);
  const unitPrice = toNumber(value.unitPrice ?? value.amount, 0);
  const lineTotal = toNumber(
    value.lineTotal ?? value.total ?? quantity * unitPrice,
    quantity * unitPrice,
  );

  return {
    id: toStringOrUndefined(value.id) ?? `line-${index + 1}`,
    description:
      toStringOrUndefined(value.description) ??
      toStringOrUndefined(value.name) ??
      toStringOrUndefined(value.itemName) ??
      "Charge",
    quantity,
    unitPrice,
    lineTotal,
  };
};

const normalizeInvoice = (payload: unknown): PaymentInvoice => {
  const unwrapped = unwrapData(payload);

  if (!isRecord(unwrapped)) {
    return {
      id: "unknown",
      invoiceNumber: "N/A",
      issuedAt: new Date().toISOString(),
      status: "UNKNOWN",
      currency: "USD",
      gym: {
        name: "Gym",
      },
      member: {
        id: "unknown",
        name: "Unknown Member",
      },
      items: [],
      subtotal: 0,
      taxRate: 0,
      taxAmount: 0,
      total: 0,
    };
  }

  const gym = isRecord(unwrapped.gym) ? unwrapped.gym : undefined;
  const member = isRecord(unwrapped.member) ? unwrapped.member : undefined;

  const itemsSource = Array.isArray(unwrapped.items)
    ? unwrapped.items
    : Array.isArray(unwrapped.lineItems)
      ? unwrapped.lineItems
      : [];
  const items = itemsSource.map(normalizeInvoiceItem);

  const subtotal = toNumber(
    unwrapped.subtotal ?? unwrapped.subTotal,
    items.reduce((sum, item) => sum + item.lineTotal, 0),
  );

  const taxRate = toNumber(unwrapped.taxRate ?? unwrapped.taxPercentage, 0);
  const taxAmount = toNumber(
    unwrapped.taxAmount ?? unwrapped.tax,
    subtotal * (taxRate > 1 ? taxRate / 100 : taxRate),
  );

  const total = toNumber(unwrapped.total, subtotal + taxAmount);

  return {
    id:
      toStringOrUndefined(unwrapped.id) ??
      toStringOrUndefined(unwrapped.invoiceId) ??
      "unknown",
    invoiceNumber:
      toStringOrUndefined(unwrapped.invoiceNumber) ??
      toStringOrUndefined(unwrapped.referenceNumber) ??
      toStringOrUndefined(unwrapped.id) ??
      "N/A",
    issuedAt:
      toStringOrUndefined(unwrapped.issuedAt) ??
      toStringOrUndefined(unwrapped.date) ??
      toStringOrUndefined(unwrapped.createdAt) ??
      new Date().toISOString(),
    dueAt:
      toStringOrUndefined(unwrapped.dueAt) ??
      toStringOrUndefined(unwrapped.dueDate),
    status: toStringOrUndefined(unwrapped.status) ?? "OPEN",
    currency: toStringOrUndefined(unwrapped.currency) ?? "USD",
    gym: {
      name:
        toStringOrUndefined(gym?.name) ??
        toStringOrUndefined(unwrapped.gymName) ??
        "Gym",
      logoUrl: toStringOrUndefined(gym?.logoUrl),
      address: toStringOrUndefined(gym?.address),
      email: toStringOrUndefined(gym?.email),
      phone: toStringOrUndefined(gym?.phone),
    },
    member: {
      id:
        toStringOrUndefined(member?.id) ??
        toStringOrUndefined(unwrapped.memberId) ??
        "unknown",
      name:
        toStringOrUndefined(member?.name) ??
        joinName(
          member ? toStringOrUndefined(member.firstName) : undefined,
          member ? toStringOrUndefined(member.lastName) : undefined,
        ),
      email: member ? toStringOrUndefined(member.email) : undefined,
      phone: member ? toStringOrUndefined(member.phone) : undefined,
    },
    items,
    subtotal,
    taxRate,
    taxAmount,
    total,
    notes: toStringOrUndefined(unwrapped.notes),
  };
};

const mapStatusToApiFilter = (
  status: BillingPaymentStatus | "ALL" | undefined,
): "PAID" | "PENDING" | "REJECTED" | undefined => {
  if (!status || status === "ALL" || status === "REFUNDED") {
    return undefined;
  }

  if (status === "SUCCESS") {
    return "PAID";
  }

  if (status === "FAILED") {
    return "REJECTED";
  }

  return "PENDING";
};

const mapMethodToApiFilter = (
  method: BillingPaymentMethod | "ALL" | undefined,
): "BANK" | "WALLET" | undefined => {
  if (!method || method === "ALL") {
    return undefined;
  }

  if (method === "TRANSFER") {
    return "BANK";
  }

  if (method === "CASH") {
    return "WALLET";
  }

  return undefined;
};

const buildQueryParams = (
  filters: PaymentsQueryFilters,
): Record<string, string | number> => {
  const params: Record<string, string | number> = {};

  if (typeof filters.page === "number") {
    params.page = filters.page;
  }

  if (typeof filters.limit === "number") {
    params.limit = filters.limit;
  }

  if (filters.search && filters.search.trim().length > 0) {
    params.search = filters.search.trim();
  }

  const statusFilter = mapStatusToApiFilter(filters.status);
  if (statusFilter) {
    params.status = statusFilter;
  }

  const methodFilter = mapMethodToApiFilter(filters.paymentMethod);
  if (methodFilter) {
    params.methodType = methodFilter;
  }

  return params;
};

const mapManualPaymentToCreatePaymentDto = (
  payload: ManualPaymentPayload,
): ManualPaymentCreateRequestDto => {
  const trimmedNotes = payload.notes?.trim();
  const categoryTag = `[CATEGORY:${payload.paymentCategory}]`;
  const methodTag = `[METHOD:${payload.paymentMethod}]`;
  const mappedMethod = manualPaymentMethodToDto[payload.paymentMethod];

  // Keep one canonical backend contract for manual collections.
  const requestPayload: ManualPaymentCreateRequestDto = {
    memberId: payload.memberId,
    amount: payload.amount,
    methodType: mappedMethod.methodType,
    provider: mappedMethod.provider,
    description: `Manual offline ${manualPaymentMethodDescription[payload.paymentMethod]} payment (${paymentCategoryDescription[payload.paymentCategory]})`,
    notes: trimmedNotes
      ? `${methodTag} ${categoryTag} ${trimmedNotes}`
      : `${methodTag} ${categoryTag}`,
    discountCodeId: payload.discountCodeId,
  };

  return requestPayload;
};

let capabilitiesCache: PaymentCapabilities | null = null;

const getFilenameFromDisposition = (
  value: unknown,
  fallback: string,
): string => {
  if (typeof value !== "string") {
    return fallback;
  }

  const match = /filename\*?=(?:UTF-8''|\")?([^\";]+)/i.exec(value);
  if (!match?.[1]) {
    return fallback;
  }

  try {
    return decodeURIComponent(match[1].replace(/\"/g, "").trim());
  } catch {
    return match[1].replace(/\"/g, "").trim();
  }
};

export const calculatePaymentSummary = (
  transactions: PaymentTransaction[],
  now = new Date(),
): PaymentSummary => {
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const recentFailedCutoff = new Date(
    now.getTime() - 1000 * 60 * 60 * 24 * 14,
  ).getTime();

  const summary = transactions.reduce<PaymentSummary>(
    (accumulator, payment) => {
      const paymentDate = new Date(payment.date).getTime();
      const isCurrentMonth =
        Number.isFinite(paymentDate) && paymentDate >= monthStart;

      if (payment.status === "SUCCESS" && isCurrentMonth) {
        accumulator.totalRevenueMtd += payment.amount;
      }

      if (payment.status === "PENDING") {
        accumulator.pendingInvoicesDues += payment.amount;
      }

      if (
        payment.status === "FAILED" &&
        Number.isFinite(paymentDate) &&
        paymentDate >= recentFailedCutoff
      ) {
        accumulator.recentFailedPayments += 1;
      }

      return accumulator;
    },
    {
      totalRevenueMtd: 0,
      pendingInvoicesDues: 0,
      recentFailedPayments: 0,
    },
  );

  return {
    totalRevenueMtd: Number(summary.totalRevenueMtd.toFixed(2)),
    pendingInvoicesDues: Number(summary.pendingInvoicesDues.toFixed(2)),
    recentFailedPayments: summary.recentFailedPayments,
  };
};

export const paymentsService = {
  async getCapabilities(forceRefresh = false): Promise<PaymentCapabilities> {
    if (!forceRefresh && capabilitiesCache) {
      return capabilitiesCache;
    }
    capabilitiesCache = {
      invoice: true,
      refund: true,
    };
    return capabilitiesCache;
  },

  async listPayments(
    filters: PaymentsQueryFilters = {},
  ): Promise<PaginatedResponse<PaymentTransaction>> {
    const params = buildQueryParams(filters);
    const response = await api.get<unknown>("/payments", { params });
    return normalizePaginatedPayload(response.data, normalizeTransaction);
  },

  async createManualPayment(
    payload: ManualPaymentPayload,
  ): Promise<PaymentTransaction> {
    const requestPayload = mapManualPaymentToCreatePaymentDto(payload);
    const response = await api.post<unknown>("/payments", requestPayload);
    return normalizeTransaction(response.data);
  },

  async getInvoice(invoiceId: string): Promise<PaymentInvoice> {
    const response = await api.get<unknown>(`/payments/invoice/${invoiceId}`);
    return normalizeInvoice(response.data);
  },

  async downloadInvoicePdf(invoiceId: string): Promise<InvoicePdfDownload> {
    const response = await api.get<Blob>(`/payments/invoice/${invoiceId}/pdf`, {
      responseType: "blob",
      headers: {
        Accept: "application/pdf",
      },
    });

    const fallbackFilename = `invoice-${invoiceId}.pdf`;

    return {
      blob: response.data,
      filename: getFilenameFromDisposition(
        response.headers["content-disposition"],
        fallbackFilename,
      ),
    };
  },

  async processRefund(
    paymentId: string,
    payload: ProcessRefundPayload,
  ): Promise<PaymentTransaction> {
    const requestPayload = compactObject({
      reason: payload.reason.trim(),
      amount: payload.amount,
    });

    const response = await api.post<unknown>(
      `/payments/${paymentId}/refund`,
      requestPayload,
    );
    return normalizeTransaction(response.data);
  },

  async cancelAutoRenew(subscriptionId: string): Promise<void> {
    await api.post(`/memberships/${subscriptionId}/cancel`);
  },
};
