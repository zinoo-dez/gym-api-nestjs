import { useState } from "react";
import { Link } from "react-router-dom";
import { trainers as initialTrainers, Trainer } from "@/data/mockData";
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

const Trainers = () => {
  const [list, setList] = useState<Trainer[]>(initialTrainers);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Trainer | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", specialization: "", schedule: "", status: "active" as Trainer["status"], clients: 0 });

  const filtered = list.filter((t) => t.name.toLowerCase().includes(search.toLowerCase()) || t.specialization.toLowerCase().includes(search.toLowerCase()));

  const openAdd = () => { setEditing(null); setForm({ name: "", email: "", phone: "", specialization: "", schedule: "", status: "active", clients: 0 }); setDialogOpen(true); };
  const openEdit = (t: Trainer) => { setEditing(t); setForm({ name: t.name, email: t.email, phone: t.phone, specialization: t.specialization, schedule: t.schedule, status: t.status, clients: t.clients }); setDialogOpen(true); };

  const handleSave = () => {
    if (!form.name) return;
    if (editing) setList((p) => p.map((t) => t.id === editing.id ? { ...t, ...form } : t));
    else setList((p) => [...p, { ...form, id: Date.now().toString() }]);
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => setList((p) => p.filter((t) => t.id !== id));
  const statusColor = (s: Trainer["status"]) => s === "active" ? "default" : s === "on-leave" ? "secondary" : "destructive";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h1 className="text-2xl font-bold">Trainers</h1><p className="text-muted-foreground">{list.length} trainers</p></div>
        <Button onClick={openAdd}><Plus className="h-4 w-4 mr-2" />Add Trainer</Button>
      </div>
      <Card>
        <CardHeader>
          <div className="relative max-w-sm"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search trainers..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" /></div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Name</TableHead><TableHead className="hidden md:table-cell">Specialization</TableHead><TableHead className="hidden sm:table-cell">Schedule</TableHead><TableHead>Status</TableHead><TableHead className="hidden lg:table-cell">Clients</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {filtered.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium"><Link to={`/trainer/${t.id}`} className="text-primary hover:underline">{t.name}</Link></TableCell>
                  <TableCell className="hidden md:table-cell">{t.specialization}</TableCell>
                  <TableCell className="hidden sm:table-cell">{t.schedule}</TableCell>
                  <TableCell><Badge variant={statusColor(t.status)}>{t.status}</Badge></TableCell>
                  <TableCell className="hidden lg:table-cell">{t.clients}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(t)}><Pencil className="h-4 w-4" /></Button>
                      <AlertDialog><AlertDialogTrigger asChild><Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete Trainer</AlertDialogTitle><AlertDialogDescription>Delete {t.name}?</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(t.id)}>Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
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
          <DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} Trainer</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="space-y-2"><Label>Email</Label><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div className="space-y-2"><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            <div className="space-y-2"><Label>Specialization</Label><Input value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} /></div>
            <div className="space-y-2"><Label>Schedule</Label><Input value={form.schedule} onChange={(e) => setForm({ ...form, schedule: e.target.value })} /></div>
            <div className="space-y-2"><Label>Status</Label><Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as Trainer["status"] })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="on-leave">On Leave</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent></Select></div>
            <Button onClick={handleSave} className="w-full">{editing ? "Update" : "Add"} Trainer</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Trainers;
