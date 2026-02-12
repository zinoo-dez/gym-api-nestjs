import { useState } from "react";
import { Link } from "react-router-dom";
import { staff as initialStaff, Staff as StaffType } from "@/data/mockData";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";

const Staff = () => {
  const [list, setList] = useState<StaffType[]>(initialStaff);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<StaffType | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", role: "", department: "", status: "active" as StaffType["status"] });

  const filtered = list.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()) || s.role.toLowerCase().includes(search.toLowerCase()));

  const openAdd = () => { setEditing(null); setForm({ name: "", email: "", phone: "", role: "", department: "", status: "active" }); setDialogOpen(true); };
  const openEdit = (s: StaffType) => { setEditing(s); setForm({ name: s.name, email: s.email, phone: s.phone, role: s.role, department: s.department, status: s.status }); setDialogOpen(true); };

  const handleSave = () => {
    if (!form.name) return;
    if (editing) setList((p) => p.map((s) => s.id === editing.id ? { ...s, ...form } : s));
    else setList((p) => [...p, { ...form, id: Date.now().toString() }]);
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => setList((p) => p.filter((s) => s.id !== id));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h1 className="text-2xl font-bold">Staff</h1><p className="text-muted-foreground">{list.length} staff members</p></div>
        <Button onClick={openAdd}><Plus className="h-4 w-4 mr-2" />Add Staff</Button>
      </div>
      <Card>
        <CardHeader>
          <div className="relative max-w-sm"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search staff..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" /></div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Name</TableHead><TableHead className="hidden md:table-cell">Role</TableHead><TableHead className="hidden sm:table-cell">Department</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {filtered.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium"><Link to={`/staff-profile/${s.id}`} className="text-primary hover:underline">{s.name}</Link></TableCell>
                  <TableCell className="hidden md:table-cell">{s.role}</TableCell>
                  <TableCell className="hidden sm:table-cell">{s.department}</TableCell>
                  <TableCell><Badge variant={s.status === "active" ? "default" : "secondary"}>{s.status}</Badge></TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(s)}><Pencil className="h-4 w-4" /></Button>
                      <AlertDialog><AlertDialogTrigger asChild><Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete Staff</AlertDialogTitle><AlertDialogDescription>Delete {s.name}?</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(s.id)}>Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
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
          <DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} Staff</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="space-y-2"><Label>Email</Label><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div className="space-y-2"><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            <div className="space-y-2"><Label>Role</Label><Input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} /></div>
            <div className="space-y-2"><Label>Department</Label><Input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} /></div>
            <div className="space-y-2"><Label>Status</Label><Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as StaffType["status"] })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent></Select></div>
            <Button onClick={handleSave} className="w-full">{editing ? "Update" : "Add"} Staff</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Staff;
