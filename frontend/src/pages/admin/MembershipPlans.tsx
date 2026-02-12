import { useState } from "react";
import { membershipPlans as initialPlans, MembershipPlan } from "@/data/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, Check } from "lucide-react";

const MembershipPlans = () => {
  const [plans, setPlans] = useState<MembershipPlan[]>(initialPlans);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<MembershipPlan | null>(null);
  const [form, setForm] = useState({ name: "", price: 0, duration: "Monthly", features: "" });

  const openAdd = () => { setEditing(null); setForm({ name: "", price: 0, duration: "Monthly", features: "" }); setDialogOpen(true); };
  const openEdit = (p: MembershipPlan) => { setEditing(p); setForm({ name: p.name, price: p.price, duration: p.duration, features: p.features.join(", ") }); setDialogOpen(true); };

  const handleSave = () => {
    if (!form.name) return;
    const plan = { name: form.name, price: form.price, duration: form.duration, features: form.features.split(",").map((f) => f.trim()).filter(Boolean) };
    if (editing) setPlans((p) => p.map((pl) => pl.id === editing.id ? { ...pl, ...plan } : pl));
    else setPlans((p) => [...p, { ...plan, id: Date.now().toString() }]);
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => setPlans((p) => p.filter((pl) => pl.id !== id));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h1 className="text-2xl font-bold">Membership Plans</h1><p className="text-muted-foreground">{plans.length} plans</p></div>
        <Button onClick={openAdd}><Plus className="h-4 w-4 mr-2" />Add Plan</Button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map((p) => (
          <Card key={p.id} className={p.popular ? "border-primary" : ""}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{p.name}</CardTitle>
                {p.popular && <Badge>Popular</Badge>}
              </div>
              <div className="mt-2">
                <span className="text-3xl font-bold">${p.price}</span>
                <span className="text-muted-foreground">/{p.duration}</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-4">
                {p.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary" />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => openEdit(p)} className="flex-1"><Pencil className="h-3 w-3 mr-1" />Edit</Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild><Button variant="outline" size="sm"><Trash2 className="h-3 w-3 text-destructive" /></Button></AlertDialogTrigger>
                  <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete Plan</AlertDialogTitle><AlertDialogDescription>Delete {p.name}?</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(p.id)}>Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} Plan</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="space-y-2"><Label>Price ($)</Label><Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} /></div>
            <div className="space-y-2"><Label>Duration</Label><Input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} /></div>
            <div className="space-y-2"><Label>Features (comma-separated)</Label><Input value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} /></div>
            <Button onClick={handleSave} className="w-full">{editing ? "Update" : "Add"} Plan</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MembershipPlans;
