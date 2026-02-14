import { useCallback, useEffect, useMemo, useState } from "react";
import {
  discountCodesService,
  type DiscountCode,
  type DiscountType,
  type CreateDiscountCodeRequest,
  type UpdateDiscountCodeRequest,
} from "@/services/discount-codes.service";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

const Discounts = () => {
  const [list, setList] = useState<DiscountCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<DiscountCode | null>(null);
  const [form, setForm] = useState({
    code: "",
    description: "",
    type: "PERCENTAGE" as DiscountType,
    amount: "",
    startsAt: "",
    endsAt: "",
    maxRedemptions: "",
    isActive: true,
  });

  const loadDiscounts = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await discountCodesService.getAll({
        limit: 200,
        code: search || undefined,
      });
      setList(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Failed to load discount codes", err);
      setList([]);
    } finally {
      setIsLoading(false);
    }
  }, [search]);

  useEffect(() => {
    loadDiscounts();
  }, [loadDiscounts]);

  const filtered = useMemo(() => {
    if (!search) return list;
    const lower = search.toLowerCase();
    return list.filter((d) => d.code.toLowerCase().includes(lower));
  }, [list, search]);

  const resetForm = () => {
    setForm({
      code: "",
      description: "",
      type: "PERCENTAGE",
      amount: "",
      startsAt: "",
      endsAt: "",
      maxRedemptions: "",
      isActive: true,
    });
  };

  const openAdd = () => {
    setEditing(null);
    resetForm();
    setDialogOpen(true);
  };

  const openEdit = (discount: DiscountCode) => {
    setEditing(discount);
    setForm({
      code: discount.code,
      description: discount.description || "",
      type: discount.type,
      amount: String(discount.amount),
      startsAt: discount.startsAt ? discount.startsAt.slice(0, 10) : "",
      endsAt: discount.endsAt ? discount.endsAt.slice(0, 10) : "",
      maxRedemptions: discount.maxRedemptions ? String(discount.maxRedemptions) : "",
      isActive: discount.isActive,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.code.trim()) {
      toast.error("Code is required.");
      return;
    }
    if (!form.amount || Number(form.amount) <= 0) {
      toast.error("Amount must be greater than 0.");
      return;
    }
    if (form.type === "PERCENTAGE" && Number(form.amount) > 100) {
      toast.error("Percent discount cannot exceed 100.");
      return;
    }

    const payload: CreateDiscountCodeRequest | UpdateDiscountCodeRequest = {
      code: form.code.trim().toUpperCase(),
      description: form.description.trim() || undefined,
      type: form.type,
      amount: Number(form.amount),
      isActive: form.isActive,
      maxRedemptions: form.maxRedemptions ? Number(form.maxRedemptions) : undefined,
      startsAt: form.startsAt || undefined,
      endsAt: form.endsAt || undefined,
    };

    try {
      if (editing) {
        const updated = await discountCodesService.update(editing.id, payload);
        setList((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
        toast.success("Discount updated");
      } else {
        const created = await discountCodesService.create(payload as CreateDiscountCodeRequest);
        setList((prev) => [created, ...prev]);
        toast.success("Discount created");
      }
      setDialogOpen(false);
    } catch (err: any) {
      const message = err?.response?.data?.message || "Failed to save discount.";
      toast.error(message);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await discountCodesService.remove(id);
      setList((prev) => prev.filter((d) => d.id !== id));
      toast.success("Discount deleted");
    } catch (err: any) {
      const message = err?.response?.data?.message || "Failed to delete discount.";
      toast.error(message);
    }
  };

  const toggleActive = async (discount: DiscountCode) => {
    try {
      const updated = await discountCodesService.update(discount.id, {
        isActive: !discount.isActive,
      });
      setList((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
      toast.success(updated.isActive ? "Discount activated" : "Discount deactivated");
    } catch (err: any) {
      const message = err?.response?.data?.message || "Failed to update status.";
      toast.error(message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Discounts</h1>
          <p className="text-muted-foreground">{list.length} discount codes</p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Add Discount
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search codes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead className="hidden md:table-cell">Valid Period</TableHead>
                <TableHead className="hidden md:table-cell">Max Redemptions</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden lg:table-cell">Used</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    Loading discount codes...
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No discount codes found.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-mono font-medium">{d.code}</TableCell>
                    <TableCell>{d.type === "PERCENTAGE" ? "Percentage" : "Fixed"}</TableCell>
                    <TableCell>
                      {d.type === "PERCENTAGE" ? `${d.amount}%` : `$${d.amount}`}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {d.startsAt ? d.startsAt.slice(0, 10) : "—"} →{" "}
                      {d.endsAt ? d.endsAt.slice(0, 10) : "—"}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {d.maxRedemptions ?? "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={d.isActive ? "default" : "secondary"}>
                        {d.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">{d.usedCount}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleActive(d)}
                          title={d.isActive ? "Deactivate" : "Activate"}
                        >
                          <span className="text-xs font-semibold">
                            {d.isActive ? "Off" : "On"}
                          </span>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openEdit(d)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Discount</AlertDialogTitle>
                              <AlertDialogDescription>
                                Delete {d.code}?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(d.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit" : "Add"} Discount</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Code</Label>
              <Input
                value={form.code}
                onChange={(e) =>
                  setForm({ ...form, code: e.target.value.toUpperCase() })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={form.type}
                onValueChange={(value) =>
                  setForm({ ...form, type: value as DiscountType })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                  <SelectContent>
                  <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                  <SelectItem value="FIXED">Fixed Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Amount</Label>
              <Input
                type="number"
                min="0"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Valid From</Label>
                <Input
                  type="date"
                  value={form.startsAt}
                  onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Valid To</Label>
                <Input
                  type="date"
                  value={form.endsAt}
                  onChange={(e) => setForm({ ...form, endsAt: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Max redemptions</Label>
              <Input
                type="number"
                min="0"
                value={form.maxRedemptions}
                onChange={(e) =>
                  setForm({ ...form, maxRedemptions: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={form.isActive ? "active" : "inactive"}
                onValueChange={(value) =>
                  setForm({ ...form, isActive: value === "active" })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleSave} className="w-full">
              {editing ? "Update" : "Add"} Discount
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Discounts;
