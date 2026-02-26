import api from "@/services/api";

export type NotificationCategory = "system" | "payments" | "members";
export type NotificationTone = "danger" | "warning" | "success" | "info";
export type NotificationPriority = "high" | "medium" | "low";

export interface NotificationRecord {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  actionUrl?: string;
  role?: string;
  createdAt: string;
  category: NotificationCategory;
  tone: NotificationTone;
  priority: NotificationPriority;
}

export interface NotificationListParams {
  page?: number;
  limit?: number;
  category?: NotificationCategory;
  unreadOnly?: boolean;
}

export interface NotificationListResponse {
  data: NotificationRecord[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface NotificationRequestContext {
  isAdmin: boolean;
}

interface NotificationApiRecord {
  id?: string;
  title?: string;
  message?: string;
  type?: string;
  read?: boolean;
  actionUrl?: string;
  role?: string;
  createdAt?: string | Date;
  category?: string;
  tone?: string;
  priority?: string;
}

interface NormalizedListPayload {
  notifications: NotificationApiRecord[];
}

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 50;

const PAYMENT_KEYWORDS = [
  "payment",
  "invoice",
  "billing",
  "transaction",
  "recovery",
  "subscription",
  "charge",
  "refund",
];

const MEMBER_KEYWORDS = [
  "member",
  "membership",
  "trainer",
  "check-in",
  "check in",
  "class",
  "workout",
  "signup",
  "joined",
  "attendance",
];

const DANGER_KEYWORDS = [
  "failed",
  "failure",
  "overdue",
  "rejected",
  "high-risk",
  "high risk",
  "cancelled",
  "canceled",
  "critical",
  "urgent",
];

const WARNING_KEYWORDS = [
  "low stock",
  "pending",
  "reminder",
  "due",
  "expir",
  "queue",
  "follow-up",
  "follow up",
];

const SUCCESS_KEYWORDS = [
  "new member",
  "new trainer",
  "registered",
  "joined",
  "created",
  "assigned",
  "upgraded",
  "reactivated",
  "completed",
  "success",
  "approved",
];

const ROLE_SCOPED_LIST_ENDPOINTS = {
  admin: "/notifications/admin",
  me: "/notifications/me",
};

const ROLE_SCOPED_READ_ALL_ENDPOINTS = {
  admin: "/notifications/admin/read-all",
  me: "/notifications/me/read-all",
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const toSearchableText = (notification: NotificationApiRecord): string =>
  `${notification.title ?? ""} ${notification.message ?? ""}`.toLowerCase();

const includesKeyword = (text: string, keywords: string[]): boolean =>
  keywords.some((keyword) => text.includes(keyword));

const toCategory = (value: string | undefined): NotificationCategory | null => {
  if (!value) {
    return null;
  }

  const normalized = value.trim().toLowerCase();

  if (normalized === "payments") {
    return "payments";
  }

  if (normalized === "members") {
    return "members";
  }

  if (normalized === "system") {
    return "system";
  }

  return null;
};

const inferCategory = (notification: NotificationApiRecord): NotificationCategory => {
  const explicitCategory = toCategory(notification.category);

  if (explicitCategory) {
    return explicitCategory;
  }

  const text = toSearchableText(notification);

  if (includesKeyword(text, PAYMENT_KEYWORDS)) {
    return "payments";
  }

  if (includesKeyword(text, MEMBER_KEYWORDS)) {
    return "members";
  }

  return "system";
};

const toTone = (value: string | undefined): NotificationTone | null => {
  if (!value) {
    return null;
  }

  const normalized = value.trim().toLowerCase();

  if (normalized === "danger") {
    return "danger";
  }

  if (normalized === "warning") {
    return "warning";
  }

  if (normalized === "success") {
    return "success";
  }

  if (normalized === "info") {
    return "info";
  }

  return null;
};

const inferTone = (notification: NotificationApiRecord): NotificationTone => {
  const explicitTone = toTone(notification.tone);

  if (explicitTone) {
    return explicitTone;
  }

  const text = toSearchableText(notification);

  if (includesKeyword(text, DANGER_KEYWORDS)) {
    return "danger";
  }

  if (includesKeyword(text, WARNING_KEYWORDS)) {
    return "warning";
  }

  if (includesKeyword(text, SUCCESS_KEYWORDS)) {
    return "success";
  }

  return "info";
};

const toPriority = (value: string | undefined): NotificationPriority | null => {
  if (!value) {
    return null;
  }

  const normalized = value.trim().toLowerCase();

  if (normalized === "high") {
    return "high";
  }

  if (normalized === "medium") {
    return "medium";
  }

  if (normalized === "low") {
    return "low";
  }

  return null;
};

const inferPriority = (notification: NotificationApiRecord, tone: NotificationTone): NotificationPriority => {
  const explicitPriority = toPriority(notification.priority);

  if (explicitPriority) {
    return explicitPriority;
  }

  if (tone === "danger") {
    return "high";
  }

  if (tone === "warning") {
    return "medium";
  }

  return "low";
};

const toIsoDate = (value: string | Date | undefined): string => {
  const parsed = value instanceof Date ? value : new Date(value ?? Date.now());

  if (Number.isNaN(parsed.getTime())) {
    return new Date().toISOString();
  }

  return parsed.toISOString();
};

const normalizeNotification = (notification: NotificationApiRecord): NotificationRecord => {
  const tone = inferTone(notification);

  return {
    id: notification.id ?? `${Date.now()}-${Math.random()}`,
    title: notification.title ?? "Notification",
    message: notification.message ?? "",
    type: notification.type ?? "IN_APP",
    read: Boolean(notification.read),
    actionUrl: notification.actionUrl,
    role: notification.role,
    createdAt: toIsoDate(notification.createdAt),
    category: inferCategory(notification),
    tone,
    priority: inferPriority(notification, tone),
  };
};

const compareByCreatedAtDesc = (left: NotificationRecord, right: NotificationRecord): number => {
  return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
};

const normalizeListPayload = (payload: unknown): NormalizedListPayload => {
  if (Array.isArray(payload)) {
    return {
      notifications: payload as NotificationApiRecord[],
    };
  }

  if (!isRecord(payload)) {
    return {
      notifications: [],
    };
  }

  if (Array.isArray(payload.data)) {
    return {
      notifications: payload.data as NotificationApiRecord[],
    };
  }

  if (Array.isArray(payload.items)) {
    return {
      notifications: payload.items as NotificationApiRecord[],
    };
  }

  if (isRecord(payload.data)) {
    const nestedData = payload.data;

    if (Array.isArray(nestedData.data)) {
      return {
        notifications: nestedData.data as NotificationApiRecord[],
      };
    }

    if (Array.isArray(nestedData.items)) {
      return {
        notifications: nestedData.items as NotificationApiRecord[],
      };
    }
  }

  return {
    notifications: [],
  };
};

const filterNotifications = (
  notifications: NotificationRecord[],
  params: NotificationListParams,
): NotificationRecord[] => {
  return notifications.filter((notification) => {
    if (params.unreadOnly && notification.read) {
      return false;
    }

    if (params.category && notification.category !== params.category) {
      return false;
    }

    return true;
  });
};

const paginateNotifications = (
  notifications: NotificationRecord[],
  params: NotificationListParams,
): NotificationListResponse => {
  const page = params.page && params.page > 0 ? params.page : DEFAULT_PAGE;
  const limit = params.limit && params.limit > 0 ? params.limit : DEFAULT_LIMIT;
  const total = notifications.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;

  return {
    data: notifications.slice(startIndex, endIndex),
    page,
    limit,
    total,
    totalPages,
  };
};

const normalizeListResponse = (
  payload: unknown,
  params: NotificationListParams,
): NotificationListResponse => {
  const { notifications } = normalizeListPayload(payload);

  const normalized = notifications
    .map(normalizeNotification)
    .sort(compareByCreatedAtDesc);

  const filtered = filterNotifications(normalized, params);

  return paginateNotifications(filtered, params);
};

const roleScopedListEndpoint = (context: NotificationRequestContext): string =>
  context.isAdmin ? ROLE_SCOPED_LIST_ENDPOINTS.admin : ROLE_SCOPED_LIST_ENDPOINTS.me;

const roleScopedReadAllEndpoint = (context: NotificationRequestContext): string =>
  context.isAdmin ? ROLE_SCOPED_READ_ALL_ENDPOINTS.admin : ROLE_SCOPED_READ_ALL_ENDPOINTS.me;

export const toNotificationErrorMessage = (error: unknown): string => {
  if (typeof error === "object" && error !== null) {
    const typedError = error as {
      message?: string;
      response?: {
        data?: {
          message?: string | string[];
        };
      };
    };

    const apiMessage = typedError.response?.data?.message;

    if (Array.isArray(apiMessage) && apiMessage.length > 0) {
      return apiMessage.join(", ");
    }

    if (typeof apiMessage === "string" && apiMessage.length > 0) {
      return apiMessage;
    }

    if (typeof typedError.message === "string" && typedError.message.length > 0) {
      return typedError.message;
    }
  }

  return "Unable to complete notification request.";
};

export const notificationsService = {
  async listNotifications(
    params: NotificationListParams,
    context: NotificationRequestContext,
  ): Promise<NotificationListResponse> {
    const response = await api.get(roleScopedListEndpoint(context));
    return normalizeListResponse(response.data, params);
  },

  async markNotificationAsRead(id: string): Promise<void> {
    await api.patch(`/notifications/${id}/read`);
  },

  async markAllAsRead(context: NotificationRequestContext): Promise<void> {
    await api.patch(roleScopedReadAllEndpoint(context));
  },

  async deleteNotification(id: string): Promise<void> {
    await api.delete(`/notifications/${id}`);
  },

  async deleteNotifications(ids: string[]): Promise<void> {
    await Promise.all(ids.map((id) => this.deleteNotification(id)));
  },
};
