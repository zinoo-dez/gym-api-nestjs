import {
  AlertTriangle,
  Bell,
  CreditCard,
  PackageMinus,
  UserPlus,
  Users,
  type LucideIcon,
} from "lucide-react";

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
  Icon: LucideIcon;
  toneStyle: ToneStyle;
}

const CATEGORY_LABELS: Record<NotificationCategory, string> = {
  system: "System",
  payments: "Payments",
  members: "Members",
};

const TONE_STYLES: Record<NotificationTone, ToneStyle> = {
  danger: {
    iconContainerClassName: "bg-danger/15",
    iconClassName: "text-danger",
    badgeClassName: "bg-danger/15 text-danger",
  },
  warning: {
    iconContainerClassName: "bg-warning/20",
    iconClassName: "text-warning",
    badgeClassName: "bg-warning/20 text-warning",
  },
  success: {
    iconContainerClassName: "bg-success/15",
    iconClassName: "text-success",
    badgeClassName: "bg-success/15 text-success",
  },
  info: {
    iconContainerClassName: "bg-info/15",
    iconClassName: "text-info",
    badgeClassName: "bg-info/15 text-info",
  },
};

const includesKeyword = (text: string, keywords: string[]): boolean => {
  return keywords.some((keyword) => text.includes(keyword));
};

const resolveIcon = (notification: NotificationRecord): LucideIcon => {
  const content = `${notification.title} ${notification.message}`.toLowerCase();

  if (includesKeyword(content, ["low stock", "restock"])) {
    return PackageMinus;
  }

  if (includesKeyword(content, ["joined", "new member", "new trainer", "registered", "signup"])) {
    return UserPlus;
  }

  if (includesKeyword(content, ["overdue", "failed", "rejected", "high-risk", "high risk"])) {
    return AlertTriangle;
  }

  if (notification.category === "payments") {
    return CreditCard;
  }

  if (notification.category === "members") {
    return Users;
  }

  return Bell;
};

export const getNotificationVisual = (notification: NotificationRecord): NotificationVisual => {
  return {
    Icon: resolveIcon(notification),
    toneStyle: TONE_STYLES[notification.tone],
  };
};

export const getNotificationCategoryLabel = (category: NotificationCategory): string => {
  return CATEGORY_LABELS[category];
};

export const formatNotificationTimestamp = (createdAt: string): string => {
  const formatted = formatDate(createdAt, "MMM d, yyyy p");

  if (formatted.length > 0) {
    return formatted;
  }

  return "Unknown time";
};
