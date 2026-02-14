import { useCallback, useEffect, useMemo, useState } from "react";
import { notificationsService, type NotificationItem } from "@/services/notifications.service";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Check, Trash2 } from "lucide-react";
import { toast } from "sonner";

const Notifications = () => {
  const [list, setList] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    message: "",
    type: "info",
    targetRole: "ALL",
    actionUrl: "",
  });
  const [search, setSearch] = useState("");

  const loadNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await notificationsService.getAdmin();
      setList(Array.isArray(response) ? response : []);
    } catch (err) {
      console.error("Failed to load notifications", err);
      setList([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const filtered = useMemo(() => {
    if (!search) return list;
    const lower = search.toLowerCase();
    return list.filter(
      (n) =>
        n.title.toLowerCase().includes(lower) ||
        n.message.toLowerCase().includes(lower) ||
        (n.role || "").toLowerCase().includes(lower),
    );
  }, [list, search]);

  const unreadCount = list.filter((n) => !n.read).length;

  const markRead = async (id: string) => {
    try {
      await notificationsService.markRead(id);
      setList((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } catch (err) {
      toast.error("Failed to mark notification as read.");
    }
  };

  const markAllRead = async () => {
    try {
      await notificationsService.markAllAdminRead();
      setList((prev) => prev.map((n) => ({ ...n, read: true })));
      toast.success("All notifications marked as read");
    } catch (err) {
      toast.error("Failed to mark all as read.");
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await notificationsService.delete(id);
      setList((prev) => prev.filter((n) => n.id !== id));
      toast.success("Notification deleted");
    } catch (err) {
      toast.error("Failed to delete notification.");
    }
  };

  const handleCreate = async () => {
    if (!form.title.trim()) {
      toast.error("Title is required.");
      return;
    }
    if (!form.message.trim()) {
      toast.error("Message is required.");
      return;
    }
    try {
      await notificationsService.createAdmin({
        title: form.title.trim(),
        message: form.message.trim(),
        type: form.type,
        targetRole: form.targetRole,
        actionUrl: form.actionUrl.trim() || undefined,
      });
      toast.success("Notification sent");
      setDialogOpen(false);
      setForm({ title: "", message: "", type: "info", targetRole: "ALL", actionUrl: "" });
      loadNotifications();
    } catch (err: any) {
      const message = err?.response?.data?.message || "Failed to send notification.";
      toast.error(message);
    }
  };

  const typeColor = (t: string) => {
    switch (t) {
      case "error":
        return "bg-destructive";
      case "warning":
        return "bg-yellow-500";
      case "success":
        return "bg-primary";
      default:
        return "bg-blue-500";
    }
  };

  return (
    <div className="space-y-6 px-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">{unreadCount} unread</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={markAllRead}>
            Mark all read
          </Button>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Notification
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="relative max-w-sm">
            <Input
              placeholder="Search notifications..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <div className="text-center text-muted-foreground py-6">
              Loading notifications...
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center text-muted-foreground py-6">
              No notifications found.
            </div>
          ) : (
            filtered.map((n) => (
              <Card key={n.id} className={n.read ? "opacity-60" : ""}>
                <CardContent className="p-4 flex items-start gap-3">
                  <div className={`h-2 w-2 rounded-full mt-2 shrink-0 ${typeColor(n.type)}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="font-medium text-sm">{n.title}</p>
                      {n.role && <Badge variant="outline" className="text-xs">{n.role}</Badge>}
                      {!n.read && <Badge className="text-xs">New</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">{n.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(n.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {!n.read && (
                      <Button variant="ghost" size="sm" onClick={() => markRead(n.id)}>
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => deleteNotification(n.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Notification</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Target</Label>
              <Select value={form.targetRole} onValueChange={(v) => setForm({ ...form, targetRole: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Users</SelectItem>
                  <SelectItem value="ADMIN">Admins</SelectItem>
                  <SelectItem value="MEMBER">Members</SelectItem>
                  <SelectItem value="TRAINER">Trainers</SelectItem>
                  <SelectItem value="STAFF">Staff</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Action URL (optional)</Label>
              <Input value={form.actionUrl} onChange={(e) => setForm({ ...form, actionUrl: e.target.value })} />
            </div>
            <Button onClick={handleCreate} className="w-full">Send Notification</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Notifications;
