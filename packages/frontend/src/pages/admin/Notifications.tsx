import { useState } from "react";
import { notifications as initialNotifs, Notification } from "@/data/mockData";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Bell, Check } from "lucide-react";

const Notifications = () => {
  const [list, setList] = useState<Notification[]>(initialNotifs);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ title: "", message: "", type: "info" as Notification["type"], target: "all" as Notification["target"] });

  const markRead = (id: string) => setList((p) => p.map((n) => n.id === id ? { ...n, read: true } : n));

  const handleCreate = () => {
    if (!form.title) return;
    setList((p) => [{ ...form, id: Date.now().toString(), date: new Date().toISOString().split("T")[0], read: false }, ...p]);
    setDialogOpen(false);
    setForm({ title: "", message: "", type: "info", target: "all" });
  };

  const typeColor = (t: Notification["type"]) => {
    switch (t) {
      case "alert": return "bg-destructive";
      case "warning": return "bg-yellow-500";
      case "success": return "bg-primary";
      default: return "bg-blue-500";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h1 className="text-2xl font-bold">Notifications</h1><p className="text-muted-foreground">{list.filter((n) => !n.read).length} unread</p></div>
        <Button onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4 mr-2" />New Notification</Button>
      </div>

      <div className="space-y-3">
        {list.map((n) => (
          <Card key={n.id} className={n.read ? "opacity-60" : ""}>
            <CardContent className="p-4 flex items-start gap-3">
              <div className={`h-2 w-2 rounded-full mt-2 shrink-0 ${typeColor(n.type)}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-sm">{n.title}</p>
                  <Badge variant="outline" className="text-xs">{n.target}</Badge>
                  {!n.read && <Badge className="text-xs">New</Badge>}
                </div>
                <p className="text-sm text-muted-foreground">{n.message}</p>
                <p className="text-xs text-muted-foreground mt-1">{n.date}</p>
              </div>
              {!n.read && (
                <Button variant="ghost" size="sm" onClick={() => markRead(n.id)}>
                  <Check className="h-4 w-4" />
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Notification</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div className="space-y-2"><Label>Message</Label><Textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} /></div>
            <div className="space-y-2"><Label>Type</Label><Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as Notification["type"] })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="info">Info</SelectItem><SelectItem value="warning">Warning</SelectItem><SelectItem value="success">Success</SelectItem><SelectItem value="alert">Alert</SelectItem></SelectContent></Select></div>
            <div className="space-y-2"><Label>Target</Label><Select value={form.target} onValueChange={(v) => setForm({ ...form, target: v as Notification["target"] })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All</SelectItem><SelectItem value="members">Members</SelectItem><SelectItem value="staff">Staff</SelectItem></SelectContent></Select></div>
            <Button onClick={handleCreate} className="w-full">Send Notification</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Notifications;
