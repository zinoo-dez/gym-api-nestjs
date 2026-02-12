import { useState } from "react";
import { Link } from "react-router-dom";
import { members as initialMembers, Member } from "@/data/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";

const Members = () => {
  const [memberList, setMemberList] = useState<Member[]>(initialMembers);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Member | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", plan: "Basic", status: "active" as Member["status"] });

  const filtered = memberList.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()) || m.email.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setEditing(null);
    setForm({ name: "", email: "", phone: "", plan: "Basic", status: "active" });
    setDialogOpen(true);
  };

  const openEdit = (m: Member) => {
    setEditing(m);
    setForm({ name: m.name, email: m.email, phone: m.phone, plan: m.plan, status: m.status });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name || !form.email) return;
    if (editing) {
      setMemberList((prev) => prev.map((m) => m.id === editing.id ? { ...m, ...form } : m));
    } else {
      setMemberList((prev) => [...prev, { ...form, id: Date.now().toString(), joinDate: new Date().toISOString().split("T")[0] }]);
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => setMemberList((prev) => prev.filter((m) => m.id !== id));

  const statusColor = (s: Member["status"]) => s === "active" ? "default" : s === "inactive" ? "secondary" : "destructive";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Members</h1>
          <p className="text-muted-foreground">{memberList.length} total members</p>
        </div>
        <Button onClick={openAdd}><Plus className="h-4 w-4 mr-2" />Add Member</Button>
      </div>

      <Card>
        <CardHeader>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search members..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="hidden md:table-cell">Email</TableHead>
                <TableHead className="hidden sm:table-cell">Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden lg:table-cell">Join Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium"><Link to={`/member/${m.id}`} className="text-primary hover:underline">{m.name}</Link></TableCell>
                  <TableCell className="hidden md:table-cell">{m.email}</TableCell>
                  <TableCell className="hidden sm:table-cell">{m.plan}</TableCell>
                  <TableCell><Badge variant={statusColor(m.status)}>{m.status}</Badge></TableCell>
                  <TableCell className="hidden lg:table-cell">{m.joinDate}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(m)}><Pencil className="h-4 w-4" /></Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild><Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button></AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Member</AlertDialogTitle>
                            <AlertDialogDescription>Are you sure you want to delete {m.name}?</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(m.id)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit Member" : "Add Member"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="space-y-2"><Label>Email</Label><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div className="space-y-2"><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            <div className="space-y-2">
              <Label>Plan</Label>
              <Select value={form.plan} onValueChange={(v) => setForm({ ...form, plan: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="Basic">Basic</SelectItem><SelectItem value="Premium">Premium</SelectItem><SelectItem value="VIP">VIP</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as Member["status"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem><SelectItem value="expired">Expired</SelectItem></SelectContent>
              </Select>
            </div>
            <Button onClick={handleSave} className="w-full">{editing ? "Update" : "Add"} Member</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Members;
