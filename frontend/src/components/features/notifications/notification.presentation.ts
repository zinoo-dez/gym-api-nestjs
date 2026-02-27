import { formatDate } from "@/lib/date-utils";
import type {
  NotificationCategory,
  NotificationRecord,
  NotificationTone,
} from "@/services/notifications.service";

interface ToneStyle {
  iconContainerClassName: string;
  iconClassName: string;
  badgeClassName: string;
}

interface NotificationVisual {
  materialIcon: string;
  toneStyle: ToneStyle;
}

const CATEGORY_LABELS: Record<NotificationCategory, string> = {
  system: "System",
  payments: "Payments",
  members: "Members",
};

const TONE_STYLES: Record<NotificationTone, ToneStyle> = {
  danger: {
    iconContainerClassName: "bg-destructive/10",
    iconClassName: "text-destructive",
    badgeClassName: "bg-destructive text-destructive-foreground",
  },
  warning: {
    iconContainerClassName: "bg-warning/10",
    iconClassName: "text-warning",
    badgeClassName: "bg-warning text-warning-foreground",
  },
  success: {
    iconContainerClassName: "bg-success/10",
    iconClassName: "text-success",
    badgeClassName: "bg-success text-success-foreground",
  },
  info: {
    iconContainerClassName: "bg-primary/10",
    iconClassName: "text-primary",
    badgeClassName: "bg-primary text-primary-foreground",
  },
};

const includesKeyword = (text: string, keywords: string[]): boolean => {
  return keywords.some((keyword) => text.includes(keyword));
};

const resolveMaterialIcon = (notification: NotificationRecord): string => {
  const content = `${notification.title} ${notification.message}`.toLowerCase();

  if (includesKeyword(content, ["low stock", "restock"])) {
    return "inventory_2";
  }

  if (
    includesKeyword(content, [
      "joined",
      "new member",
      "new trainer",
      "registered",
      "signup",
    ])
  ) {
    return "person_add";
  }

  if (
    includesKeyword(content, [
      "overdue",
      "failed",
      "rejected",
      "high-risk",
      "high risk",
    ])
  ) {
    return "report_problem";
  }

  if (notification.category === "payments") {
    return "payments";
  }

  if (notification.category === "members") {
    return "group";
  }

  return "notifications";
};

export const getNotificationVisual = (
  notification: NotificationRecord,
): NotificationVisual => {
  return {
    materialIcon: resolveMaterialIcon(notification),
    toneStyle: TONE_STYLES[notification.tone],
  };
};

export const getNotificationCategoryLabel = (
  category: NotificationCategory,
): string => {
  return CATEGORY_LABELS[category];
};

export const formatNotificationTimestamp = (createdAt: string): string => {
  const formatted = formatDate(createdAt, "MMM d, yyyy p");

  if (formatted.length > 0) {
    return formatted;
  }

  return "Unknown time";
};
