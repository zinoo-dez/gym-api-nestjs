import * as Popover from "@radix-ui/react-popover";
import { Bell, BellOff, LoaderCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/Button";
import {
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
  useNotificationsRealtimeSync,
} from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";
import {
  toNotificationErrorMessage,
  type NotificationRecord,
} from "@/services/notifications.service";
import { useNotificationStore } from "@/store/notification.store";

import { formatNotificationTimestamp, getNotificationVisual } from "./notification.presentation";

const MAX_RECENT_NOTIFICATIONS = 5;

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const unreadCount = useNotificationStore((state) => state.unreadCount);

  const notificationsQuery = useNotificationsRealtimeSync();
  const markReadMutation = useMarkNotificationReadMutation();
  const markAllMutation = useMarkAllNotificationsReadMutation();

  const recentNotifications = useMemo(
    () => (notificationsQuery.data?.data ?? []).slice(0, MAX_RECENT_NOTIFICATIONS),
    [notificationsQuery.data?.data],
  );

  const hasUnread = unreadCount > 0;

  const handleMarkAllAsRead = async () => {
    if (!hasUnread || markAllMutation.isPending) {
      return;
    }

    try {
      await markAllMutation.mutateAsync();
    } catch (error) {
      toast.error(toNotificationErrorMessage(error));
    }
  };

  const handleMarkAsRead = async (notification: NotificationRecord) => {
    if (notification.read || markReadMutation.isPending) {
      return;
    }

    try {
      await markReadMutation.mutateAsync({ id: notification.id });
    } catch (error) {
      toast.error(toNotificationErrorMessage(error));
    }
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Open notifications"
          className="relative rounded-full"
        >
          <Bell className="size-5" />
          {hasUnread ? (
            <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold text-danger-foreground">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          ) : null}
        </Button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={10}
          className="z-50 w-[360px] rounded-lg border bg-popover text-popover-foreground shadow-lg"
        >
          <div className="space-y-1 border-b p-4">
            <p className="text-sm font-semibold text-foreground">Notifications</p>
            <p className="text-xs text-muted-foreground">
              {hasUnread ? `${unreadCount} unread alerts` : "You are all caught up"}
            </p>
          </div>

          <div className="max-h-[360px] overflow-y-auto">
            {notificationsQuery.isLoading ? (
              <div className="flex items-center gap-2 p-4 text-sm text-muted-foreground">
                <LoaderCircle className="size-4 animate-spin" />
                Loading notifications...
              </div>
            ) : null}

            {notificationsQuery.isError ? (
              <div className="space-y-2 p-4 text-sm">
                <p className="text-danger">Unable to load notifications.</p>
                <Button type="button" variant="outline" size="sm" onClick={() => void notificationsQuery.refetch()}>
                  Retry
                </Button>
              </div>
            ) : null}

            {!notificationsQuery.isLoading && !notificationsQuery.isError && recentNotifications.length === 0 ? (
              <div className="flex flex-col items-center gap-2 p-8 text-center">
                <BellOff className="size-8 text-muted-foreground" />
                <p className="text-sm font-medium text-foreground">No notifications yet</p>
                <p className="text-xs text-muted-foreground">New alerts will appear here in real time.</p>
              </div>
            ) : null}

            {!notificationsQuery.isLoading && !notificationsQuery.isError && recentNotifications.length > 0 ? (
              <ul>
                {recentNotifications.map((notification) => {
                  const visual = getNotificationVisual(notification);

                  return (
                    <li key={notification.id} className="border-b last:border-b-0">
                      <div className={cn("flex gap-3 p-3", !notification.read ? "bg-primary/5" : "")}>
                        <span
                          className={cn(
                            "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full",
                            visual.toneStyle.iconContainerClassName,
                          )}
                        >
                          <visual.Icon className={cn("size-4", visual.toneStyle.iconClassName)} />
                        </span>

                        <div className="min-w-0 flex-1 space-y-1">
                          <p className="text-sm font-medium text-foreground">{notification.title}</p>
                          <p className="text-xs text-muted-foreground">{notification.message}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {formatNotificationTimestamp(notification.createdAt)}
                          </p>
                        </div>

                        {!notification.read ? (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-[11px]"
                            onClick={() => void handleMarkAsRead(notification)}
                          >
                            Mark read
                          </Button>
                        ) : null}
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </div>

          <div className="flex items-center justify-between border-t p-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => void handleMarkAllAsRead()}
              disabled={!hasUnread || markAllMutation.isPending}
            >
              Mark all as read
            </Button>

            <Popover.Close asChild>
              <Button type="button" asChild variant="link" size="sm" className="h-auto p-0">
                <Link to="/admin/notifications">View all</Link>
              </Button>
            </Popover.Close>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
