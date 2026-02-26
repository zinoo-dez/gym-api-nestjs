import { useMutation, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

import { useAuthStore } from "@/store/auth.store";
import { useNotificationStore } from "@/store/notification.store";
import { hasManagementAccess } from "@/lib/roles";
import {
  notificationsService,
  type NotificationListResponse,
  type NotificationRecord,
} from "@/services/notifications.service";

const FEED_PAGE_SIZE = 100;
const POLLING_INTERVAL_MS = 15_000;

export const notificationKeys = {
  all: ["notifications"] as const,
  feed: (role: string | undefined) => ["notifications", "feed", role] as const,
};

const isHighPriorityAlert = (notification: NotificationRecord): boolean => {
  return notification.priority === "high";
};

const applyFeedUpdate = (
  queryClient: QueryClient,
  setUnreadCount: (value: number) => void,
  updater: (notifications: NotificationRecord[]) => NotificationRecord[],
) => {
  let updatedUnreadCount: number | null = null;

  queryClient.setQueriesData<NotificationListResponse>(
    { queryKey: notificationKeys.all },
    (current) => {
      if (!current) {
        return current;
      }

      const nextNotifications = updater(current.data);
      const nextUnreadCount = nextNotifications.filter((notification) => !notification.read).length;
      updatedUnreadCount = nextUnreadCount;

      return {
        ...current,
        data: nextNotifications,
        total: nextNotifications.length,
        totalPages: Math.max(1, Math.ceil(nextNotifications.length / Math.max(current.limit, 1))),
      };
    },
  );

  if (updatedUnreadCount !== null) {
    setUnreadCount(updatedUnreadCount);
  }
};

const useNotificationContext = () => {
  const role = useAuthStore((state) => state.user?.role);

  return {
    role,
    isAdmin: hasManagementAccess(role),
  };
};

export const useNotificationsFeedQuery = () => {
  const { role, isAdmin } = useNotificationContext();

  return useQuery({
    queryKey: notificationKeys.feed(role),
    queryFn: () => notificationsService.listNotifications({ page: 1, limit: FEED_PAGE_SIZE }, { isAdmin }),
    enabled: Boolean(role),
    staleTime: 8_000,
    refetchInterval: POLLING_INTERVAL_MS,
    refetchIntervalInBackground: true,
  });
};

export const useNotificationsRealtimeSync = () => {
  const query = useNotificationsFeedQuery();
  const setUnreadCount = useNotificationStore((state) => state.setUnreadCount);
  const knownNotificationIdsRef = useRef<Set<string>>(new Set());
  const initializedRef = useRef(false);

  useEffect(() => {
    const notifications = query.data?.data ?? [];
    const unreadCount = notifications.filter((notification) => !notification.read).length;
    setUnreadCount(unreadCount);
  }, [query.data?.data, setUnreadCount]);

  useEffect(() => {
    const notifications = query.data?.data ?? [];

    if (!initializedRef.current) {
      knownNotificationIdsRef.current = new Set(notifications.map((notification) => notification.id));
      initializedRef.current = true;
      return;
    }

    const newNotifications = notifications.filter(
      (notification) => !knownNotificationIdsRef.current.has(notification.id),
    );

    for (const notification of newNotifications) {
      if (!isHighPriorityAlert(notification)) {
        continue;
      }

      toast.error(notification.title, {
        description: notification.message,
        duration: 7000,
        position: "top-right",
      });
    }

    knownNotificationIdsRef.current = new Set(notifications.map((notification) => notification.id));
  }, [query.data?.data]);

  return query;
};

export const useMarkNotificationReadMutation = () => {
  const queryClient = useQueryClient();
  const setUnreadCount = useNotificationStore((state) => state.setUnreadCount);

  return useMutation({
    mutationFn: ({ id }: { id: string }) => notificationsService.markNotificationAsRead(id),
    onSuccess: (_response, variables) => {
      applyFeedUpdate(queryClient, setUnreadCount, (notifications) =>
        notifications.map((notification) =>
          notification.id === variables.id ? { ...notification, read: true } : notification,
        ),
      );

      void queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
};

export const useMarkAllNotificationsReadMutation = () => {
  const queryClient = useQueryClient();
  const { isAdmin } = useNotificationContext();
  const setUnreadCount = useNotificationStore((state) => state.setUnreadCount);

  return useMutation({
    mutationFn: () => notificationsService.markAllAsRead({ isAdmin }),
    onSuccess: () => {
      applyFeedUpdate(queryClient, setUnreadCount, (notifications) =>
        notifications.map((notification) => ({ ...notification, read: true })),
      );

      void queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
};

export const useDeleteNotificationMutation = () => {
  const queryClient = useQueryClient();
  const setUnreadCount = useNotificationStore((state) => state.setUnreadCount);

  return useMutation({
    mutationFn: ({ id }: { id: string }) => notificationsService.deleteNotification(id),
    onSuccess: (_response, variables) => {
      applyFeedUpdate(queryClient, setUnreadCount, (notifications) =>
        notifications.filter((notification) => notification.id !== variables.id),
      );

      void queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
};

export const useBulkDeleteNotificationsMutation = () => {
  const queryClient = useQueryClient();
  const setUnreadCount = useNotificationStore((state) => state.setUnreadCount);

  return useMutation({
    mutationFn: ({ ids }: { ids: string[] }) => notificationsService.deleteNotifications(ids),
    onSuccess: (_response, variables) => {
      const idsToDelete = new Set(variables.ids);

      applyFeedUpdate(queryClient, setUnreadCount, (notifications) =>
        notifications.filter((notification) => !idsToDelete.has(notification.id)),
      );

      void queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
};
