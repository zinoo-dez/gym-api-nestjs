import { useState } from "react";
import { discounts as initialDiscounts, Discount } from "@/data/mockData";
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

const Discounts = () => {
  const [list, setList] = useState<Discount[]>(initialDiscounts);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Discount | null>(null);
  const [form, setForm] = useState({ code: "", type: "percentage" as Discount["type"], value: 0, validFrom: "", validTo: "", applicablePlans: "", status: "active" as Discount["status"] });

  const filtered = list.filter((d) => d.code.toLowerCase().includes(search.toLowerCase()));

  const openAdd = () => { setEditing(null); setForm({ code: "", type: "percentage", value: 0, validFrom: "", validTo: "", applicablePlans: "", status: "active" }); setDialogOpen(true); };
  const openEdit = (d: Discount) => { setEditing(d); setForm({ code: d.code, type: d.type, value: d.value, validFrom: d.validFrom, validTo: d.validTo, applicablePlans: d.applicablePlans.join(", "), status: d.status }); setDialogOpen(true); };

  const handleSave = () => {
    if (!form.code) return;
    const item = { code: form.code, type: form.type, value: form.value, validFrom: form.validFrom, validTo: form.validTo, applicablePlans: form.applicablePlans.split(",").map((s) => s.trim()).filter(Boolean), status: form.status, usageCount: 0 };
    if (editing) setList((p) => p.map((d) => d.id === editing.id ? { ...d, ...item } : d));
    else setList((p) => [...p, { ...item, id: Date.now().toString() }]);
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => setList((p) => p.filter((d) => d.id !== id));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h1 className="text-2xl font-bold">Discounts</h1><p className="text-muted-foreground">{list.length} discount codes</p></div>
        <Button onClick={openAdd}><Plus className="h-4 w-4 mr-2" />Add Discount</Button>
      </div>
      <Card>
        <CardHeader>
          <div className="relative max-w-sm"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search codes..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" /></div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Code</TableHead><TableHead>Type</TableHead><TableHead>Value</TableHead><TableHead className="hidden md:table-cell">Valid Period</TableHead><TableHead>Status</TableHead><TableHead className="hidden lg:table-cell">Used</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {filtered.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="font-mono font-medium">{d.code}</TableCell>
                  <TableCell>{d.type}</TableCell>
                  <TableCell>{d.type === "percentage" ? `${d.value}%` : `$${d.value}`}</TableCell>
                  <TableCell className="hidden md:table-cell">{d.validFrom} → {d.validTo}</TableCell>
                  <TableCell><Badge variant={d.status === "active" ? "default" : "secondary"}>{d.status}</Badge></TableCell>
                  <TableCell className="hidden lg:table-cell">{d.usageCount}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(d)}><Pencil className="h-4 w-4" /></Button>
                      <AlertDialog><AlertDialogTrigger asChild><Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete Discount</AlertDialogTitle><AlertDialogDescription>Delete {d.code}?</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(d.id)}>Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
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
          <DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} Discount</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Code</Label><Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} /></div>
            <div className="space-y-2"><Label>Type</Label><Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as Discount["type"] })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="percentage">Percentage</SelectItem><SelectItem value="fixed">Fixed Amount</SelectItem></SelectContent></Select></div>
            <div className="space-y-2"><Label>Value</Label><Input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Valid From</Label><Input type="date" value={form.validFrom} onChange={(e) => setForm({ ...form, validFrom: e.target.value })} /></div>
              <div className="space-y-2"><Label>Valid To</Label><Input type="date" value={form.validTo} onChange={(e) => setForm({ ...form, validTo: e.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label>Applicable Plans (comma-separated)</Label><Input value={form.applicablePlans} onChange={(e) => setForm({ ...form, applicablePlans: e.target.value })} /></div>
            <Button onClick={handleSave} className="w-full">{editing ? "Update" : "Add"} Discount</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Discounts;
