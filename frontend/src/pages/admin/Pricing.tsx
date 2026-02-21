import { useCallback, useEffect, useMemo, useState } from "react";
import {
  pricingService,
  type CreatePricingRequest,
  type PricingCategory,
  type PricingItem,
  type UpdatePricingRequest,
} from "@/services/pricing.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Plus, Pencil, Trash2, RefreshCcw, Search } from "lucide-react";
import { toast } from "sonner";

const CATEGORY_OPTIONS: PricingCategory[] = [
  "MEMBERSHIP",
  "CLASS",
  "MERCHANDISE",
];

const PricingPage = () => {
  const [rows, setRows] = useState<PricingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"all" | PricingCategory>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<PricingItem | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "MEMBERSHIP" as PricingCategory,
    price: "",
    currency: "USD",
    duration: "",
    features: "",
    isActive: true,
    sortOrder: "0",
  });

  const loadRows = useCallback(async () => {
    setLoading(true);
    try {
      const response = await pricingService.getAll({
        limit: 200,
        category: categoryFilter === "all" ? undefined : categoryFilter,
        isActive:
          statusFilter === "all" ? undefined : statusFilter === "active",
      });
      setRows(Array.isArray(response?.data) ? response.data : []);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to load pricing data");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [categoryFilter, statusFilter]);

  useEffect(() => {
    loadRows();
  }, [loadRows]);

  const visibleRows = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return rows;
    return rows.filter(
      (item) =>
        item.name.toLowerCase().includes(keyword) ||
        item.description?.toLowerCase().includes(keyword),
    );
  }, [rows, search]);

  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      category: "MEMBERSHIP",
      price: "",
      currency: "USD",
      duration: "",
      features: "",
      isActive: true,
      sortOrder: "0",
    });
  };

  const openCreate = () => {
    setEditing(null);
    resetForm();
    setDialogOpen(true);
  };

  const openEdit = (item: PricingItem) => {
    setEditing(item);
    setForm({
      name: item.name,
      description: item.description || "",
      category: item.category,
      price: String(item.price),
      currency: item.currency || "USD",
      duration: item.duration ? String(item.duration) : "",
      features: Array.isArray(item.features) ? item.features.join("\n") : "",
      isActive: item.isActive,
      sortOrder: String(item.sortOrder ?? 0),
    });
    setDialogOpen(true);
  };

  const parseFeatures = (input: string) =>
    input
      .split(/\n|,/)
      .map((feature) => feature.trim())
      .filter(Boolean);

  const savePricing = async () => {
    if (!form.name.trim()) {
      toast.error("Pricing name is required");
      return;
    }
    if (!form.price || Number(form.price) < 0) {
      toast.error("Price must be 0 or greater");
      return;
    }

    const payload: CreatePricingRequest | UpdatePricingRequest = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      category: form.category,
      price: Number(form.price),
      currency: form.currency.trim() || "USD",
      duration: form.duration ? Number(form.duration) : undefined,
      features: parseFeatures(form.features),
      isActive: form.isActive,
      sortOrder: Number(form.sortOrder || 0),
    };

    try {
      if (editing) {
        const updated = await pricingService.update(editing.id, payload);
        setRows((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
        toast.success("Pricing updated");
      } else {
        const created = await pricingService.create(payload as CreatePricingRequest);
        setRows((prev) => [created, ...prev]);
        toast.success("Pricing created");
      }
      setDialogOpen(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to save pricing");
    }
  };

  const toggleStatus = async (item: PricingItem) => {
    try {
      const updated = await pricingService.update(item.id, {
        isActive: !item.isActive,
      });
      setRows((prev) => prev.map((row) => (row.id === item.id ? updated : row)));
      toast.success(updated.isActive ? "Pricing activated" : "Pricing deactivated");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update status");
    }
  };

  const removePricing = async (id: string) => {
    try {
      await pricingService.remove(id);
      setRows((prev) => prev.filter((item) => item.id !== id));
      toast.success("Pricing deleted");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to delete pricing");
    }
  };

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-border bg-card p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="m3-title-md">Pricing Catalog</h1>
            <p className="text-sm text-muted-foreground">
              Manage membership, class, and merchandise pricing entries.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={loadRows}
              disabled={loading}
              className="h-10 rounded-xl"
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button onClick={openCreate} className="h-10 rounded-xl">
              <Plus className="mr-2 h-4 w-4" />
              Add Pricing
            </Button>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search pricing by name..."
              className="h-10 rounded-xl pl-9"
            />
          </div>

          <div className="flex w-full gap-2 lg:w-auto">
            <Select
              value={categoryFilter}
              onValueChange={(value) => setCategoryFilter(value as any)}
            >
              <SelectTrigger className="h-10 w-full rounded-xl lg:w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORY_OPTIONS.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as any)}
            >
              <SelectTrigger className="h-10 w-full rounded-xl lg:w-44">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto -mx-5 px-5">
          <table className="min-w-full text-sm">
            <thead className="border-y border-border bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Duration</th>
                <th className="px-4 py-3">Features</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                    Loading pricing catalog...
                  </td>
                </tr>
              ) : visibleRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                    No pricing entries found.
                  </td>
                </tr>
              ) : (
                visibleRows.map((item) => (
                  <tr key={item.id} className="border-b border-border hover:bg-muted/40">
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{item.name}</p>
                      {item.description && (
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline">{item.category}</Badge>
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      {item.currency} {item.price.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {item.duration ? `${item.duration} days` : "-"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {item.features?.length ? `${item.features.length} features` : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        className={
                          item.isActive
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-muted text-muted-foreground"
                        }
                      >
                        {item.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleStatus(item)}
                        >
                          {item.isActive ? "Disable" : "Enable"}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openEdit(item)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete pricing item?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => removePricing(item.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Pricing" : "Create Pricing"}</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label>Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Premium Membership"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Description</Label>
              <Input
                value={form.description}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Optional summary"
              />
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={form.category}
                onValueChange={(value) =>
                  setForm((prev) => ({ ...prev, category: value as PricingCategory }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Price</Label>
              <Input
                type="number"
                min="0"
                value={form.price}
                onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Currency</Label>
              <Input
                value={form.currency}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, currency: e.target.value.toUpperCase() }))
                }
                placeholder="USD"
              />
            </div>

            <div className="space-y-2">
              <Label>Duration (days)</Label>
              <Input
                type="number"
                min="1"
                value={form.duration}
                onChange={(e) => setForm((prev) => ({ ...prev, duration: e.target.value }))}
                placeholder="Optional"
              />
            </div>

            <div className="space-y-2">
              <Label>Sort Order</Label>
              <Input
                type="number"
                min="0"
                value={form.sortOrder}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, sortOrder: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Features (comma or new line separated)</Label>
              <Textarea
                value={form.features}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, features: e.target.value }))
                }
                placeholder="Unlimited gym access\nWeekly class credits"
              />
            </div>

            <div className="flex items-center gap-2 md:col-span-2">
              <input
                id="pricing-active"
                type="checkbox"
                checked={form.isActive}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, isActive: e.target.checked }))
                }
              />
              <Label htmlFor="pricing-active">Active</Label>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={savePricing}>{editing ? "Update" : "Create"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PricingPage;
