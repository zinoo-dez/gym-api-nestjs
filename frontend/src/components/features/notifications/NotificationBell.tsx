import * as Popover from "@radix-ui/react-popover";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { goeyToast } from "goey-toast";

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
import { MaterialIcon } from "@/components/ui/MaterialIcon";

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
            goeyToast.error(toNotificationErrorMessage(error));
        }
    };

    const handleMarkAsRead = async (notification: NotificationRecord) => {
        if (notification.read || markReadMutation.isPending) {
            return;
        }

        try {
            await markReadMutation.mutateAsync({ id: notification.id });
        } catch (error) {
            goeyToast.error(toNotificationErrorMessage(error));
        }
    };

    return (
        <Popover.Root open={open} onOpenChange={setOpen}>
            <Popover.Trigger asChild>
                <Button
                    type="button"
                    variant="text"
                    size="icon"
                    aria-label="Open notifications"
                    className="relative size-12 rounded-full"
                >
                    <MaterialIcon icon="notifications" fill={hasUnread} className="text-muted-foreground" />
                    {hasUnread ? (
                        <span className="absolute right-2 top-2 flex size-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground shadow-sm">
                            {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                    ) : null}
                </Button>
            </Popover.Trigger>

            <Popover.Portal>
                <Popover.Content
                    align="end"
                    sideOffset={8}
                    className="z-50 w-[360px] rounded-2xl border border-border bg-card text-foreground shadow-xl focus:outline-none"
                >
                    <div className="space-y-1 p-4">
                        <p className="text-base font-bold">Notifications</p>
                        <p className="text-xs text-muted-foreground">
                            {hasUnread ? `${unreadCount} unread alerts` : "You are all caught up"}
                        </p>
                    </div>

                    <div className="max-h-[400px] overflow-y-auto no-scrollbar border-y border-border">
                        {notificationsQuery.isLoading ? (
                            <div className="flex items-center justify-center gap-3 p-8 text-sm text-muted-foreground">
                                <div className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                Loading notifications...
                            </div>
                        ) : null}

                        {notificationsQuery.isError ? (
                            <div className="space-y-3 p-6 text-center">
                                <p className="text-sm text-destructive">Unable to load notifications.</p>
                                <Button type="button" variant="outlined" size="sm" onClick={() => void notificationsQuery.refetch()}>
                                    Retry
                                </Button>
                            </div>
                        ) : null}

                        {!notificationsQuery.isLoading && !notificationsQuery.isError && recentNotifications.length === 0 ? (
                            <div className="flex flex-col items-center gap-3 p-10 text-center text-muted-foreground">
                                <div className="flex size-14 items-center justify-center rounded-full bg-card">
                                    <MaterialIcon icon="notifications_off" className="text-3xl" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-foreground">No notifications yet</p>
                                    <p className="text-xs">New alerts will appear here in real time.</p>
                                </div>
                            </div>
                        ) : null}

                        {!notificationsQuery.isLoading && !notificationsQuery.isError && recentNotifications.length > 0 ? (
                            <ul className="divide-y divide-outline-variant/30">
                                {recentNotifications.map((notification) => {
                                    const visual = getNotificationVisual(notification);

                                    return (
                                        <li key={notification.id} className="transition-colors hover:bg-muted">
                                            <div className={cn("flex gap-4 p-4", !notification.read ? "bg-primary/5" : "")}>
                                                <div
                                                    className={cn(
                                                        "flex size-10 shrink-0 items-center justify-center rounded-xl",
                                                        visual.toneStyle.iconContainerClassName,
                                                    )}
                                                >
                                                    <MaterialIcon icon={visual.materialIcon || "info"} className={cn("text-xl", visual.toneStyle.iconClassName)} />
                                                </div>

                                                <div className="min-w-0 flex-1 space-y-1">
                                                    <p className="text-sm font-bold text-foreground">{notification.title}</p>
                                                    <p className="text-xs text-muted-foreground line-clamp-2">{notification.message}</p>
                                                    <p className="text-xs text-muted-foreground/70">
                                                        {formatNotificationTimestamp(notification.createdAt)}
                                                    </p>
                                                </div>

                                                {!notification.read ? (
                                                    <Button
                                                        type="button"
                                                        variant="text"
                                                        size="sm"
                                                        className="h-8 rounded-full px-3 text-xs"
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

                    <div className="flex items-center justify-between p-3">
                        <Button
                            type="button"
                            variant="text"
                            size="sm"
                            className="text-primary hover:bg-primary/5"
                            onClick={() => void handleMarkAllAsRead()}
                            disabled={!hasUnread || markAllMutation.isPending}
                        >
                            Mark all read
                        </Button>

                        <Popover.Close asChild>
                            <Link to="/admin/notifications">
                                <Button type="button" variant="text" size="sm" className="text-primary hover:bg-primary/5">
                                    View all
                                </Button>
                            </Link>
                        </Popover.Close>
                    </div>
                </Popover.Content>
            </Popover.Portal>
        </Popover.Root>
    );
}
