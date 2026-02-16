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
import { Plus, Check, Trash2, Bell, Search, Filter, CheckCircle2, MessageSquare, AlertTriangle, XCircle, MoreVertical, Send } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

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
    <div className="space-y-4">
      {/* Header section */}
      <section className="rounded-2xl border border-gray-200 bg-white p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-900">Notification Command Center</p>
            <p className="text-sm text-gray-500">
              Broadcast system-wide alerts, manage staff messages, and monitor audit signals.
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={markAllRead}
              className="h-10 rounded-xl border-gray-200 font-bold font-mono text-xs hover:bg-gray-50"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Squelch All Unread
            </Button>
            <Button 
              onClick={() => setDialogOpen(true)}
              className="h-10 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold font-mono text-xs shadow-lg shadow-blue-100 transition-all active:scale-95"
            >
              <Plus className="h-4 w-4 mr-2" />
              Broadcast Alert
            </Button>
          </div>
        </div>
      </section>

      {/* Metrics & Search Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <section className="flex-1 rounded-2xl border border-gray-200 bg-white p-3 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              className="h-11 pl-10 rounded-xl border-none bg-gray-50/50 focus:ring-blue-600 font-medium placeholder:text-gray-400"
              placeholder="Query alerts by title, message, or target role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" className="h-11 rounded-xl border-gray-100 text-gray-500">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </section>
        
        <div className="flex gap-4">
          <div className="px-5 py-3 rounded-2xl border border-gray-200 bg-white flex flex-col justify-center min-w-[140px]">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pending</p>
            <p className="text-xl font-bold text-blue-600 font-mono">{unreadCount}</p>
          </div>
        </div>
      </div>

      {/* Notification Stream */}
      <div className="grid gap-3">
        {isLoading ? (
          <div className="py-20 text-center rounded-2xl border-2 border-dashed border-gray-100 bg-white/50">
            <RefreshCcw className="h-12 w-12 mb-3 mx-auto text-blue-100 animate-spin" />
            <p className="font-medium text-gray-400">Synchronizing alert stream...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center rounded-2xl border-2 border-dashed border-gray-100 bg-white/50">
            <Bell className="h-12 w-12 mb-3 mx-auto text-gray-100" />
            <p className="font-medium text-gray-400">The transmission log is currently quiet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((n) => (
              <Card 
                key={n.id} 
                className={cn(
                  "overflow-hidden border-gray-200 transition-all shadow-none rounded-2xl",
                  !n.read ? "bg-white border-l-4 border-l-blue-600" : "bg-gray-50/50 opacity-70"
                )}
              >
                <CardContent className="p-0">
                  <div className="p-4 flex items-start gap-4">
                    <div className={cn(
                      "p-3 rounded-xl shrink-0 mt-0.5",
                      n.type === "error" ? "bg-red-50 text-red-600" :
                      n.type === "warning" ? "bg-amber-50 text-amber-600" :
                      n.type === "success" ? "bg-emerald-50 text-emerald-600" :
                      "bg-blue-50 text-blue-600"
                    )}>
                      {n.type === "error" ? <XCircle className="h-5 w-5" /> :
                       n.type === "warning" ? <AlertTriangle className="h-5 w-5" /> :
                       n.type === "success" ? <CheckCircle2 className="h-5 w-5" /> :
                       <MessageSquare className="h-5 w-5" />}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-gray-900 text-sm truncate">{n.title}</h4>
                        {!n.read && (
                          <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                        )}
                        {n.role && (
                          <Badge variant="outline" className="h-5 rounded-md border-gray-200 bg-gray-50 text-gray-500 font-bold text-[9px] uppercase tracking-tight">
                            {n.role}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 leading-relaxed font-medium">
                        {n.message}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-[10px] font-medium text-gray-400">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <span>•</span>
                        <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 self-center">
                      {!n.read && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => markRead(n.id)}
                          className="h-10 w-10 rounded-xl text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                        >
                          <Check className="h-5 w-5" />
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => deleteNotification(n.id)}
                        className="h-10 w-10 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xl rounded-2xl border-none shadow-2xl p-0 overflow-hidden">
          <div className="bg-blue-600 p-6 text-white">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-white/20">
                <Send className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight">Compose Broadcast</h2>
                <p className="text-blue-100 text-xs font-medium opacity-80">
                  Transmit a new signal to users based on their systemic role.
                </p>
              </div>
            </div>
          </div>
          
          <ScrollArea className="max-h-[80vh]">
            <div className="p-6 space-y-5">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Alert Headline</Label>
                <Input 
                  className="h-12 rounded-xl border-gray-100 bg-gray-50/50 focus:ring-blue-600 font-medium"
                  placeholder="Summarize the core message..."
                  value={form.title} 
                  onChange={(e) => setForm({ ...form, title: e.target.value })} 
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Detailed Payload</Label>
                <Textarea 
                  className="min-h-[120px] rounded-xl border-gray-100 bg-gray-50/50 focus:ring-blue-600 font-medium"
                  placeholder="What do the recipients need to know?"
                  value={form.message} 
                  onChange={(e) => setForm({ ...form, message: e.target.value })} 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Urgency Tier</Label>
                  <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                    <SelectTrigger className="h-12 rounded-xl border-gray-100 bg-gray-50/50 focus:ring-blue-600 font-bold text-xs uppercase tracking-tight">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="info" className="rounded-lg">INFO (GENERIC)</SelectItem>
                      <SelectItem value="success" className="rounded-lg">SUCCESS (POS/AUDIT)</SelectItem>
                      <SelectItem value="warning" className="rounded-lg">WARNING (SYSTEM)</SelectItem>
                      <SelectItem value="error" className="rounded-lg">ERROR (CRITICAL)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Recipient Pool</Label>
                  <Select value={form.targetRole} onValueChange={(v) => setForm({ ...form, targetRole: v })}>
                    <SelectTrigger className="h-12 rounded-xl border-gray-100 bg-gray-50/50 focus:ring-blue-600 font-bold text-xs uppercase tracking-tight">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="ALL" className="rounded-lg">ALL USERS</SelectItem>
                      <SelectItem value="ADMIN" className="rounded-lg">ADMIN REGISTRY</SelectItem>
                      <SelectItem value="MEMBER" className="rounded-lg">ACTIVE MEMBERS</SelectItem>
                      <SelectItem value="TRAINER" className="rounded-lg">TRAINER ROSTER</SelectItem>
                      <SelectItem value="STAFF" className="rounded-lg">STAFF ON-DUTY</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Action Link Reference (Optional)</Label>
                <Input 
                  className="h-12 rounded-xl border-gray-100 bg-gray-50/50 focus:ring-blue-600 font-mono text-xs"
                  placeholder="/admin/audit/log-ref-123"
                  value={form.actionUrl} 
                  onChange={(e) => setForm({ ...form, actionUrl: e.target.value })} 
                />
              </div>

              <div className="pt-4 flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1 h-12 rounded-xl border-gray-200 font-bold text-gray-500"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreate} 
                  className="flex-[2] h-12 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-100 transition-all active:scale-95"
                >
                  Initiate Transmission
                </Button>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Notifications;
