import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { useEffect, useMemo, useState } from "react";
import { goeyToast } from "goey-toast";

import {
    formatNotificationTimestamp,
    getNotificationCategoryLabel,
    getNotificationVisual,
} from "@/components/features/notifications";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { DataTable, DataTableColumn } from "@/components/ui/DataTable";
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
            goeyToast.error(toNotificationErrorMessage(error));
        }
    };

    const handleDeleteNotification = async (notification: NotificationRecord) => {
        if (deleteMutation.isPending) {
            return;
        }

        try {
            await deleteMutation.mutateAsync({ id: notification.id });
            setSelectedIds((value) => value.filter((id) => id !== notification.id));
            goeyToast.success("Notification deleted.");
        } catch (error) {
            goeyToast.error(toNotificationErrorMessage(error));
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
            goeyToast.success(`${selectedCount} notification(s) deleted.`);
        } catch (error) {
            goeyToast.error(toNotificationErrorMessage(error));
        }
    };

    const handleMarkAllAsRead = async () => {
        if (unreadCount === 0 || markAllMutation.isPending) {
            return;
        }

        try {
            await markAllMutation.mutateAsync();
            goeyToast.success("All notifications marked as read.");
        } catch (error) {
            goeyToast.error(toNotificationErrorMessage(error));
        }
    };

    const notificationColumns: DataTableColumn<NotificationRecord>[] = [
        {
            id: "select",
            label: "",
            headerClassName: "w-12",
            headerRender: () => (
                <input
                    type="checkbox"
                    aria-label="Select all visible notifications"
                    className="size-4 rounded border-input text-primary focus:ring-2 focus:ring-ring"
                    checked={allVisibleSelected}
                    onChange={toggleSelectAllVisible}
                />
            ),
            render: (row) => (
                <input
                    type="checkbox"
                    aria-label={`Select ${row.title}`}
                    className="mt-1 size-4 rounded border-input text-primary focus:ring-2 focus:ring-ring"
                    checked={selectedIds.includes(row.id)}
                    onChange={() => toggleSelection(row.id)}
                />
            ),
        },
        {
            id: "notification",
            label: "Notification",
            render: (row) => {
                const visual = getNotificationVisual(row);
                return (
                    <div className="flex gap-4">
                        <span className={cn("mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full shadow-sm", visual.toneStyle.iconContainerClassName)}>
                            <MaterialIcon icon={visual.materialIcon} className={cn("text-xl", visual.toneStyle.iconClassName)} />
                        </span>
                        <div className="min-w-0 space-y-1">
                            <p className="font-medium text-foreground">{row.title}</p>
                            <p className="text-sm text-muted-foreground">{row.message}</p>
                            {!row.read ? <span className="text-xs font-semibold text-primary">Unread</span> : null}
                        </div>
                    </div>
                );
            },
        },
        {
            id: "category",
            label: "Category",
            render: (row) => {
                const visual = getNotificationVisual(row);
                return (
                    <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold", visual.toneStyle.badgeClassName)}>
                        {getNotificationCategoryLabel(row.category)}
                    </span>
                );
            },
        },
        {
            id: "received",
            label: "Received",
            render: (row) => <span className="text-xs text-muted-foreground">{formatNotificationTimestamp(row.createdAt)}</span>,
        },
        {
            id: "actions",
            label: "Actions",
            align: "right" as const,
            render: (row) => (
                <div className="flex justify-end gap-1">
                    {!row.read ? (
                        <Button type="button" variant="text" size="sm" onClick={() => void handleMarkAsRead(row)} disabled={markReadMutation.isPending}>
                            Mark read
                        </Button>
                    ) : null}
                    <Button
                        type="button"
                        variant="text"
                        size="sm"
                        className="text-destructive hover:bg-destructive/10 active:bg-destructive/20"
                        onClick={() => void handleDeleteNotification(row)}
                        disabled={deleteMutation.isPending}
                    >
                        Delete
                    </Button>
                </div>
            ),
        },
    ];

    const notificationMobileCard = (notification: NotificationRecord) => {
        const visual = getNotificationVisual(notification);
        return (
            <article className={cn("rounded-lg border p-4 shadow-sm", !notification.read ? "bg-primary/5" : "")}>
                <div className="flex items-start gap-3">
                    <input
                        type="checkbox"
                        aria-label={`Select ${notification.title}`}
                        className="mt-1 size-4 rounded border-input text-primary focus:ring-2 focus:ring-ring"
                        checked={selectedIds.includes(notification.id)}
                        onChange={() => toggleSelection(notification.id)}
                    />
                    <span className={cn("mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full shadow-sm", visual.toneStyle.iconContainerClassName)}>
                        <MaterialIcon icon={visual.materialIcon} className={cn("text-xl", visual.toneStyle.iconClassName)} />
                    </span>
                    <div className="min-w-0 flex-1 space-y-1">
                        <p className="text-sm font-medium text-foreground">{notification.title}</p>
                        <p className="text-sm text-muted-foreground">{notification.message}</p>
                        <p className="text-xs text-muted-foreground">{formatNotificationTimestamp(notification.createdAt)}</p>
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                            <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold", visual.toneStyle.badgeClassName)}>
                                {getNotificationCategoryLabel(notification.category)}
                            </span>
                            {!notification.read ? <span className="text-xs font-semibold text-primary">Unread</span> : null}
                        </div>
                    </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                    {!notification.read ? (
                        <Button type="button" variant="outlined" size="sm" onClick={() => void handleMarkAsRead(notification)} disabled={markReadMutation.isPending}>
                            Mark read
                        </Button>
                    ) : null}
                    <Button
                        type="button"
                        variant="text"
                        size="sm"
                        className="text-destructive hover:bg-destructive/10 active:bg-destructive/20"
                        onClick={() => void handleDeleteNotification(notification)}
                        disabled={deleteMutation.isPending}
                    >
                        Delete
                    </Button>
                </div>
            </article>
        );
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
                        variant="outlined"
                        onClick={() => void handleMarkAllAsRead()}
                        disabled={unreadCount === 0 || markAllMutation.isPending}
                    >
                        <MaterialIcon icon="done_all" className="text-lg" />
                        <span>Mark all as read</span>
                    </Button>

                    <Button
                        type="button"
                        variant="error"
                        onClick={() => void handleBulkDelete()}
                        disabled={selectedIds.length === 0 || bulkDeleteMutation.isPending}
                    >
                        <MaterialIcon icon="delete" className="text-lg" />
                        <span>Delete selected ({selectedIds.length})</span>
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
                                variant={activeFilter === filter.id ? "tonal" : "outlined"}
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
                        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
                            <MaterialIcon icon="refresh" className="text-lg animate-spin" />
                            <span>Loading notifications...</span>
                        </div>
                    ) : null}

                    {notificationsQuery.isError ? (
                        <div className="space-y-4 rounded-2xl border border-destructive/50 bg-destructive/5 p-6">
                            <p className="text-base font-bold text-destructive">Unable to load notifications.</p>
                            <Button type="button" variant="tonal" onClick={() => void notificationsQuery.refetch()}>
                                <MaterialIcon icon="refresh" className="text-lg" />
                                <span>Retry</span>
                            </Button>
                        </div>
                    ) : null}

                    {!notificationsQuery.isLoading &&
                        !notificationsQuery.isError &&
                        filteredNotifications.length === 0 ? (
                        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border p-12 text-center bg-background">
                            <div className="flex size-16 items-center justify-center rounded-full bg-card text-muted-foreground">
                                <MaterialIcon icon="notifications_off" className="text-3xl" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-base font-bold text-foreground">No notifications found</p>
                                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                                    Try another filter or check back later for new alerts.
                                </p>
                            </div>
                        </div>
                    ) : null}

                    {!notificationsQuery.isLoading &&
                        !notificationsQuery.isError &&
                        filteredNotifications.length > 0 ? (
                        <>
                            <DataTable<NotificationRecord>
                                columns={notificationColumns}
                                rows={visibleNotifications}
                                rowKey={(row) => row.id}
                                mobileCard={notificationMobileCard}
                                emptyTitle="No notifications found"
                                emptyDescription="Try another filter or check back later for new alerts."
                                minWidth="900px"
                            />

                            <div className="flex items-center justify-between gap-3">
                                <p className="text-sm text-muted-foreground">
                                    Page {currentPage} of {totalPages}
                                </p>

                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant="outlined"
                                        size="sm"
                                        onClick={() => setCurrentPage((value) => Math.max(1, value - 1))}
                                        disabled={currentPage <= 1}
                                    >
                                        <MaterialIcon icon="chevron_left" className="text-lg" />
                                        <span>Previous</span>
                                    </Button>

                                    <Button
                                        type="button"
                                        variant="outlined"
                                        size="sm"
                                        onClick={() => setCurrentPage((value) => Math.min(totalPages, value + 1))}
                                        disabled={currentPage >= totalPages}
                                    >
                                        <span>Next</span>
                                        <MaterialIcon icon="chevron_right" className="text-lg" />
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
