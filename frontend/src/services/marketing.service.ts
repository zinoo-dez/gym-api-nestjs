import { apiClient } from "@/lib/api-client";

export type NotificationType = "EMAIL" | "SMS" | "PUSH" | "IN_APP";
export type NotificationCategory =
  | "BILLING"
  | "MARKETING"
  | "CLASS_REMINDER"
  | "PT_SESSION"
  | "ACCOUNT_ACTIVITY"
  | "ANNOUNCEMENT"
  | "WORKOUT_PROGRESS"
  | "ATTENDANCE";

export type MarketingCampaignStatus =
  | "DRAFT"
  | "SCHEDULED"
  | "SENDING"
  | "SENT"
  | "PARTIAL"
  | "FAILED"
  | "CANCELLED";

export type CampaignAudienceType =
  | "ALL_MEMBERS"
  | "INACTIVE_MEMBERS"
  | "BIRTHDAY_MEMBERS"
  | "CLASS_ATTENDEES"
  | "CUSTOM";

export type MarketingAutomationType =
  | "BIRTHDAY_WISHES"
  | "REENGAGEMENT"
  | "CLASS_PROMOTION"
  | "NEWSLETTER";

interface ApiResponse<T> {
  data: T;
  statusCode: number;
  timestamp: string;
  path: string;
}

export interface MarketingTemplate {
  id: string;
  name: string;
  type: NotificationType;
  category: NotificationCategory;
  subject?: string;
  body: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MarketingCampaign {
  id: string;
  name: string;
  description?: string;
  type: NotificationType;
  category: NotificationCategory;
  status: MarketingCampaignStatus;
  audienceType: CampaignAudienceType;
  customUserIds: string[];
  classId?: string;
  templateId?: string;
  subject?: string;
  content: string;
  specialOffer?: string;
  scheduledAt?: string;
  sentAt?: string;
  recipientsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignAnalytics {
  campaignId: string;
  totalRecipients: number;
  deliveredCount: number;
  failedCount: number;
  openedCount: number;
  clickedCount: number;
  openRate: number;
  clickRate: number;
}

export interface MarketingAutomation {
  id: string;
  type: MarketingAutomationType;
  name: string;
  isActive: boolean;
  channel: NotificationType;
  templateId?: string;
  subject?: string;
  content: string;
  specialOffer?: string;
  inactiveDays: number;
  classId?: string;
  lastRunAt?: string;
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

export const marketingService = {
  async listTemplates() {
    const response = await apiClient.get<ApiResponse<MarketingTemplate[]>>(
      "/marketing/templates",
    );
    return response.data.data ?? response.data;
  },

  async createTemplate(payload: {
    name: string;
    type: NotificationType;
    category?: NotificationCategory;
    subject?: string;
    body: string;
    isActive?: boolean;
  }) {
    const response = await apiClient.post<ApiResponse<MarketingTemplate>>(
      "/marketing/templates",
      payload,
    );
    return response.data.data ?? response.data;
  },

  async updateTemplate(
    id: string,
    payload: Partial<{
      name: string;
      type: NotificationType;
      category: NotificationCategory;
      subject?: string;
      body: string;
      isActive: boolean;
    }>,
  ) {
    const response = await apiClient.patch<ApiResponse<MarketingTemplate>>(
      `/marketing/templates/${id}`,
      payload,
    );
    return response.data.data ?? response.data;
  },

  async listCampaigns(params?: {
    page?: number;
    limit?: number;
    status?: MarketingCampaignStatus;
    type?: NotificationType;
    audienceType?: CampaignAudienceType;
    search?: string;
  }) {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<MarketingCampaign>>>(
      "/marketing/campaigns",
      { params },
    );
    return response.data.data ?? response.data;
  },

  async getCampaign(id: string) {
    const response = await apiClient.get<ApiResponse<any>>(`/marketing/campaigns/${id}`);
    return response.data.data ?? response.data;
  },

  async createCampaign(payload: {
    name: string;
    description?: string;
    type: NotificationType;
    category?: NotificationCategory;
    status?: MarketingCampaignStatus;
    audienceType?: CampaignAudienceType;
    customUserIds?: string[];
    classId?: string;
    templateId?: string;
    subject?: string;
    content: string;
    specialOffer?: string;
    scheduledAt?: string;
  }) {
    const response = await apiClient.post<ApiResponse<MarketingCampaign>>(
      "/marketing/campaigns",
      payload,
    );
    return response.data.data ?? response.data;
  },

  async updateCampaign(
    id: string,
    payload: Partial<{
      name: string;
      description?: string;
      type: NotificationType;
      category: NotificationCategory;
      status: MarketingCampaignStatus;
      audienceType: CampaignAudienceType;
      customUserIds: string[];
      classId?: string;
      templateId?: string;
      subject?: string;
      content: string;
      specialOffer?: string;
      scheduledAt?: string;
    }>,
  ) {
    const response = await apiClient.patch<ApiResponse<MarketingCampaign>>(
      `/marketing/campaigns/${id}`,
      payload,
    );
    return response.data.data ?? response.data;
  },

  async sendCampaign(id: string) {
    const response = await apiClient.post<ApiResponse<any>>(
      `/marketing/campaigns/${id}/send`,
    );
    return response.data.data ?? response.data;
  },

  async getCampaignAnalytics(id: string) {
    const response = await apiClient.get<ApiResponse<CampaignAnalytics>>(
      `/marketing/campaigns/${id}/analytics`,
    );
    return response.data.data ?? response.data;
  },

  async listAutomations() {
    const response = await apiClient.get<ApiResponse<MarketingAutomation[]>>(
      "/marketing/automations",
    );
    return response.data.data ?? response.data;
  },

  async createAutomation(payload: {
    type: MarketingAutomationType;
    name: string;
    isActive?: boolean;
    channel?: NotificationType;
    templateId?: string;
    subject?: string;
    content: string;
    specialOffer?: string;
    inactiveDays?: number;
    classId?: string;
  }) {
    const response = await apiClient.post<ApiResponse<MarketingAutomation>>(
      "/marketing/automations",
      payload,
    );
    return response.data.data ?? response.data;
  },

  async updateAutomation(
    id: string,
    payload: Partial<{
      type: MarketingAutomationType;
      name: string;
      isActive: boolean;
      channel: NotificationType;
      templateId?: string;
      subject?: string;
      content: string;
      specialOffer?: string;
      inactiveDays?: number;
      classId?: string;
    }>,
  ) {
    const response = await apiClient.patch<ApiResponse<MarketingAutomation>>(
      `/marketing/automations/${id}`,
      payload,
    );
    return response.data.data ?? response.data;
  },

  async runAutomations(type?: MarketingAutomationType) {
    const endpoint = type
      ? `/marketing/automations/run/${type}`
      : "/marketing/automations/run";
    const response = await apiClient.post<ApiResponse<any>>(endpoint);
    return response.data.data ?? response.data;
  },
};
