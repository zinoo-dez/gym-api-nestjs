import { BellOff, CheckCheck, LoaderCircle, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import {
  formatNotificationTimestamp,
  getNotificationCategoryLabel,
  getNotificationVisual,
} from "@/components/features/notifications";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  useBulkDeleteNotificationsMutation,
  useDeleteNotificationMutation,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
  useNotificationsFeedQuery,
} from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";
import {
  toNotificationErrorMessage,
  type NotificationRecord,
} from "@/services/notifications.service";
import { useNotificationStore } from "@/store/notification.store";

const PAGE_SIZE = 10;

const NOTIFICATION_FILTERS = [
  { id: "all", label: "All" },
  { id: "unread", label: "Unread" },
  { id: "system", label: "System" },
  { id: "payments", label: "Payments" },
  { id: "members", label: "Members" },
] as const;

type NotificationFilterId = (typeof NOTIFICATION_FILTERS)[number]["id"];

export function NotificationsPage() {
  const [activeFilter, setActiveFilter] = useState<NotificationFilterId>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const unreadCount = useNotificationStore((state) => state.unreadCount);

  const notificationsQuery = useNotificationsFeedQuery();
  const markReadMutation = useMarkNotificationReadMutation();
  const markAllMutation = useMarkAllNotificationsReadMutation();
  const deleteMutation = useDeleteNotificationMutation();
  const bulkDeleteMutation = useBulkDeleteNotificationsMutation();

  const notifications = notificationsQuery.data?.data ?? [];

  const filteredNotifications = useMemo(() => {
    if (activeFilter === "all") {
      return notifications;
    }

    if (activeFilter === "unread") {
      return notifications.filter((notification) => !notification.read);
    }

    return notifications.filter((notification) => notification.category === activeFilter);
  }, [activeFilter, notifications]);

  const totalPages = Math.max(1, Math.ceil(filteredNotifications.length / PAGE_SIZE));

  const visibleNotifications = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;

    return filteredNotifications.slice(startIndex, endIndex);
  }, [currentPage, filteredNotifications]);

  const visibleNotificationIds = useMemo(
    () => visibleNotifications.map((notification) => notification.id),
    [visibleNotifications],
  );

  const allVisibleSelected =
    visibleNotificationIds.length > 0 &&
    visibleNotificationIds.every((notificationId) => selectedIds.includes(notificationId));

  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter]);

  useEffect(() => {
    setCurrentPage((value) => Math.min(value, totalPages));
  }, [totalPages]);

  useEffect(() => {
    const visibleSet = new Set(filteredNotifications.map((notification) => notification.id));
    setSelectedIds((value) => value.filter((id) => visibleSet.has(id)));
  }, [filteredNotifications]);

  const toggleSelection = (notificationId: string) => {
    setSelectedIds((value) => {
      if (value.includes(notificationId)) {
        return value.filter((id) => id !== notificationId);
      }

      return [...value, notificationId];
    });
  };

  const toggleSelectAllVisible = () => {
    setSelectedIds((value) => {
      if (allVisibleSelected) {
        const visibleIdSet = new Set(visibleNotificationIds);
        return value.filter((id) => !visibleIdSet.has(id));
      }

      return Array.from(new Set([...value, ...visibleNotificationIds]));
    });
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

  const handleDeleteNotification = async (notification: NotificationRecord) => {
    if (deleteMutation.isPending) {
      return;
    }

    try {
      await deleteMutation.mutateAsync({ id: notification.id });
      setSelectedIds((value) => value.filter((id) => id !== notification.id));
      toast.success("Notification deleted.");
    } catch (error) {
      toast.error(toNotificationErrorMessage(error));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0 || bulkDeleteMutation.isPending) {
      return;
    }

    const selectedCount = selectedIds.length;

    try {
      await bulkDeleteMutation.mutateAsync({ ids: selectedIds });
      setSelectedIds([]);
      toast.success(`${selectedCount} notification(s) deleted.`);
    } catch (error) {
      toast.error(toNotificationErrorMessage(error));
    }
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0 || markAllMutation.isPending) {
      return;
    }

    try {
      await markAllMutation.mutateAsync();
      toast.success("All notifications marked as read.");
    } catch (error) {
      toast.error(toNotificationErrorMessage(error));
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="page-title">Notification Center</h1>
          <p className="body-text text-muted-foreground">
            Monitor system alerts, payment updates, and member activity in one place.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => void handleMarkAllAsRead()}
            disabled={unreadCount === 0 || markAllMutation.isPending}
          >
            <CheckCheck className="size-4" />
            Mark all as read
          </Button>

          <Button
            type="button"
            variant="danger"
            onClick={() => void handleBulkDelete()}
            disabled={selectedIds.length === 0 || bulkDeleteMutation.isPending}
          >
            <Trash2 className="size-4" />
            Delete selected ({selectedIds.length})
          </Button>
        </div>
      </header>

      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
          <div className="flex flex-wrap gap-2">
            {NOTIFICATION_FILTERS.map((filter) => (
              <Button
                key={filter.id}
                type="button"
                size="sm"
                variant={activeFilter === filter.id ? "default" : "outline"}
                onClick={() => setActiveFilter(filter.id)}
              >
                {filter.label}
              </Button>
            ))}
          </div>

          <p className="text-sm text-muted-foreground">
            Showing {filteredNotifications.length} of {notifications.length} notifications
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>All Alerts</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {notificationsQuery.isLoading ? (
            <div className="flex items-center gap-2 rounded-md border bg-muted/20 p-4 text-sm text-muted-foreground">
              <LoaderCircle className="size-4 animate-spin" />
              Loading notifications...
            </div>
          ) : null}

          {notificationsQuery.isError ? (
            <div className="space-y-3 rounded-md border border-danger/40 bg-danger/5 p-4">
              <p className="text-sm text-danger">Unable to load notifications.</p>
              <Button type="button" variant="outline" onClick={() => void notificationsQuery.refetch()}>
                Retry
              </Button>
            </div>
          ) : null}

          {!notificationsQuery.isLoading &&
          !notificationsQuery.isError &&
          filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-md border border-dashed p-10 text-center">
              <BellOff className="size-10 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">No notifications found</p>
              <p className="text-sm text-muted-foreground">
                Try another filter or check back later for new alerts.
              </p>
            </div>
          ) : null}

          {!notificationsQuery.isLoading &&
          !notificationsQuery.isError &&
          filteredNotifications.length > 0 ? (
            <>
              <div className="hidden overflow-x-auto rounded-md border md:block">
                <table className="w-full min-w-[900px] text-sm">
                  <thead>
                    <tr className="border-b bg-muted/30 text-left">
                      <th className="w-12 px-4 py-3">
                        <input
                          type="checkbox"
                          aria-label="Select all visible notifications"
                          className="size-4 rounded border-input text-primary focus:ring-2 focus:ring-ring"
                          checked={allVisibleSelected}
                          onChange={toggleSelectAllVisible}
                        />
                      </th>
                      <th className="px-4 py-3 font-medium text-muted-foreground">Notification</th>
                      <th className="px-4 py-3 font-medium text-muted-foreground">Category</th>
                      <th className="px-4 py-3 font-medium text-muted-foreground">Received</th>
                      <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {visibleNotifications.map((notification) => {
                      const visual = getNotificationVisual(notification);

                      return (
                        <tr
                          key={notification.id}
                          className={cn(
                            "border-b transition-colors last:border-0 hover:bg-muted/30",
                            !notification.read ? "bg-primary/5" : "",
                          )}
                        >
                          <td className="px-4 py-3 align-top">
                            <input
                              type="checkbox"
                              aria-label={`Select ${notification.title}`}
                              className="mt-1 size-4 rounded border-input text-primary focus:ring-2 focus:ring-ring"
                              checked={selectedIds.includes(notification.id)}
                              onChange={() => toggleSelection(notification.id)}
                            />
                          </td>

                          <td className="px-4 py-3 align-top">
                            <div className="flex gap-3">
                              <span
                                className={cn(
                                  "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full",
                                  visual.toneStyle.iconContainerClassName,
                                )}
                              >
                                <visual.Icon className={cn("size-4", visual.toneStyle.iconClassName)} />
                              </span>

                              <div className="min-w-0 space-y-1">
                                <p className="font-medium text-foreground">{notification.title}</p>
                                <p className="text-sm text-muted-foreground">{notification.message}</p>
                                {!notification.read ? (
                                  <span className="text-xs font-semibold text-primary">Unread</span>
                                ) : null}
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-3 align-top">
                            <span
                              className={cn(
                                "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold",
                                visual.toneStyle.badgeClassName,
                              )}
                            >
                              {getNotificationCategoryLabel(notification.category)}
                            </span>
                          </td>

                          <td className="px-4 py-3 align-top text-xs text-muted-foreground">
                            {formatNotificationTimestamp(notification.createdAt)}
                          </td>

                          <td className="px-4 py-3 align-top">
                            <div className="flex justify-end gap-2">
                              {!notification.read ? (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => void handleMarkAsRead(notification)}
                                  disabled={markReadMutation.isPending}
                                >
                                  Mark read
                                </Button>
                              ) : null}

                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="text-danger hover:bg-danger/10 hover:text-danger"
                                onClick={() => void handleDeleteNotification(notification)}
                                disabled={deleteMutation.isPending}
                              >
                                Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="space-y-3 md:hidden">
                {visibleNotifications.map((notification) => {
                  const visual = getNotificationVisual(notification);

                  return (
                    <article
                      key={notification.id}
                      className={cn("rounded-lg border p-4 shadow-sm", !notification.read ? "bg-primary/5" : "")}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          aria-label={`Select ${notification.title}`}
                          className="mt-1 size-4 rounded border-input text-primary focus:ring-2 focus:ring-ring"
                          checked={selectedIds.includes(notification.id)}
                          onChange={() => toggleSelection(notification.id)}
                        />

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
                          <p className="text-sm text-muted-foreground">{notification.message}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatNotificationTimestamp(notification.createdAt)}
                          </p>

                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            <span
                              className={cn(
                                "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold",
                                visual.toneStyle.badgeClassName,
                              )}
                            >
                              {getNotificationCategoryLabel(notification.category)}
                            </span>

                            {!notification.read ? (
                              <span className="text-xs font-semibold text-primary">Unread</span>
                            ) : null}
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {!notification.read ? (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => void handleMarkAsRead(notification)}
                            disabled={markReadMutation.isPending}
                          >
                            Mark read
                          </Button>
                        ) : null}

                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-danger hover:bg-danger/10 hover:text-danger"
                          onClick={() => void handleDeleteNotification(notification)}
                          disabled={deleteMutation.isPending}
                        >
                          Delete
                        </Button>
                      </div>
                    </article>
                  );
                })}
              </div>

              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </p>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((value) => Math.max(1, value - 1))}
                    disabled={currentPage <= 1}
                  >
                    Previous
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((value) => Math.min(totalPages, value + 1))}
                    disabled={currentPage >= totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
