import type {
  CampaignAudienceType,
  MarketingAutomationType,
  MarketingCampaignStatus,
  NotificationType,
} from "@/services/marketing.service";

export const marketingChannelOptions: NotificationType[] = [
  "EMAIL",
  "SMS",
  "IN_APP",
  "PUSH",
];

export const marketingAudienceOptions: CampaignAudienceType[] = [
  "ALL_MEMBERS",
  "INACTIVE_MEMBERS",
  "BIRTHDAY_MEMBERS",
  "CLASS_ATTENDEES",
  "CUSTOM",
];

export const marketingAutomationTypeOptions: MarketingAutomationType[] = [
  "BIRTHDAY_WISHES",
  "REENGAGEMENT",
  "CLASS_PROMOTION",
  "NEWSLETTER",
];

export const defaultTemplateForm = {
  name: "",
  type: "EMAIL" as NotificationType,
  subject: "",
  body: "",
};

export const defaultCampaignForm = {
  name: "",
  description: "",
  type: "EMAIL" as NotificationType,
  status: "DRAFT" as MarketingCampaignStatus,
  audienceType: "ALL_MEMBERS" as CampaignAudienceType,
  customUserIds: "",
  classId: "",
  templateId: "",
  subject: "",
  content: "",
  specialOffer: "",
  scheduledAt: "",
};

export const defaultAutomationForm = {
  type: "BIRTHDAY_WISHES" as MarketingAutomationType,
  name: "",
  channel: "EMAIL" as NotificationType,
  templateId: "",
  subject: "",
  content: "",
  specialOffer: "",
  inactiveDays: "30",
  classId: "",
};
