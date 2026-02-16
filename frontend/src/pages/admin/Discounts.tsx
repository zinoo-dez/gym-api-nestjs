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
import { GoogleDateTimePicker } from "@/components/ui/google-date-time-picker";
import { cn } from "@/lib/utils";
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

const toDateTimeLocalValue = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
};

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
      startsAt: toDateTimeLocalValue(discount.startsAt),
      endsAt: toDateTimeLocalValue(discount.endsAt),
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

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success(`Code copied: ${code}`);
    } catch {
      toast.error("Failed to copy code.");
    }
  };

  const shareCode = async (discount: DiscountCode) => {
    const text = `Use discount code ${discount.code} for ${
      discount.type === "PERCENTAGE" ? `${discount.amount}% off` : `$${discount.amount} off`
    }.`;

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `Discount code: ${discount.code}`,
          text,
        });
        return;
      } catch {
        // Ignore and fallback to clipboard copy below.
      }
    }

    await copyCode(discount.code);
  };

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-border bg-card p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">Promotions & Discounts</p>
            <p className="text-sm text-muted-foreground">
              Manage promotional codes, seasonal discounts, and membership referral incentives.
            </p>
          </div>
          <Button onClick={openAdd} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Create Discount Code
          </Button>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold text-foreground">Active Campaign Codes</p>
            <p className="text-xs text-muted-foreground">Track redemptions and campaign effectiveness</p>
          </div>
          <div className="relative w-full lg:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by code (e.g. SUMMER24)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10 rounded-xl border-border"
            />
          </div>
        </div>

        <div className="overflow-x-auto -mx-5">
          <table className="min-w-full text-sm">
            <thead className="bg-muted text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-medium text-center">Code</th>
                <th className="px-5 py-3 font-medium">Type</th>
                <th className="px-5 py-3 font-medium">Benefit</th>
                <th className="px-5 py-3 font-medium hidden md:table-cell">Validity Period</th>
                <th className="px-5 py-3 font-medium hidden md:table-cell text-center">Limit</th>
                <th className="px-5 py-3 font-medium text-center">Status</th>
                <th className="px-5 py-3 font-medium hidden lg:table-cell text-center">Used</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-muted-foreground font-medium">
                    Loading promotional campaigns...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-muted-foreground font-medium">
                    No discount codes found.
                  </td>
                </tr>
              ) : (
                filtered.map((d) => {
                  const isExpired = d.endsAt && new Date(d.endsAt) < new Date();
                  const isExhausted = d.maxRedemptions && d.usedCount >= d.maxRedemptions;
                  const statusLabel = !d.isActive ? "Inactive" : isExpired ? "Expired" : isExhausted ? "Sold Out" : "Active";
                  
                  let statusClass = "bg-emerald-100 text-emerald-700";
                  if (!d.isActive) statusClass = "bg-muted/80 text-foreground";
                  else if (isExpired) statusClass = "bg-red-100 text-red-700";
                  else if (isExhausted) statusClass = "bg-amber-100 text-amber-700";

                  return (
                    <tr key={d.id} className="border-t border-border hover:bg-muted/50 transition-colors">
                      <td className="px-5 py-4 text-center">
                        <button
                          type="button"
                          onClick={() => shareCode(d)}
                          title="Click to share or copy this discount code"
                          aria-label={`Share or copy discount code ${d.code}`}
                          className="inline-flex cursor-pointer rounded-lg transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.02] hover:opacity-95 active:translate-y-0 active:scale-100 focus:outline-none focus:ring-2 focus:ring-blue-300"
                        >
                          <code className="bg-blue-50 px-2.5 py-1 rounded-lg text-xs font-bold text-blue-700 border border-blue-100">
                            {d.code}
                          </code>
                        </button>
                      </td>
                      <td className="px-5 py-4 text-foreground font-medium">
                        {d.type === "PERCENTAGE" ? "Percentage" : "Fixed Amount"}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-col leading-tight">
                          <span className="font-bold text-foreground">
                            {d.type === "PERCENTAGE" ? `${d.amount}% OFF` : `$${d.amount} OFF`}
                          </span>
                          <span className="text-[10px] text-muted-foreground capitalize">{d.type.toLowerCase()} discount</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 hidden md:table-cell">
                        <div className="flex flex-col text-[11px] text-muted-foreground">
                          <span>FS: {d.startsAt ? new Date(d.startsAt).toLocaleDateString() : "Immediate"}</span>
                          <span className={cn(isExpired && "text-red-500 font-medium")}>
                            TO: {d.endsAt ? new Date(d.endsAt).toLocaleDateString() : "Indefinite"}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4 hidden md:table-cell text-center font-medium text-foreground">
                        {d.maxRedemptions ?? "∞"}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className={cn("inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider", statusClass)}>
                          {statusLabel}
                        </span>
                      </td>
                      <td className="px-5 py-4 hidden lg:table-cell text-center">
                        <div className="flex flex-col">
                          <span className="font-bold text-foreground">{d.usedCount}</span>
                          <span className="text-[10px] text-muted-foreground">Claims</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleActive(d)}
                            className={cn("h-8 w-8 rounded-lg", d.isActive ? "text-amber-600 hover:bg-amber-50" : "text-emerald-600 hover:bg-emerald-50")}
                            title={d.isActive ? "Deactivate" : "Activate"}
                          >
                            <span className="text-[10px] font-bold uppercase">{d.isActive ? "Off" : "On"}</span>
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => openEdit(d)} className="h-8 w-8 text-muted-foreground hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-lg">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="rounded-2xl border-none shadow-2xl">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-foreground">Delete Promotion</AlertDialogTitle>
                                <AlertDialogDescription className="text-muted-foreground">
                                  Are you sure you want to delete the code <strong>{d.code}</strong>? Past redemptions will still be visible in reports.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="rounded-xl border-border">Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(d.id)} className="rounded-xl bg-red-600 hover:bg-red-700">
                                  Confirm Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="rounded-2xl border-none shadow-2xl max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-foreground">{editing ? "Modify Campaign Code" : "Design Promotional Offer"}</DialogTitle>
            <p className="text-sm text-muted-foreground">Define the discount structure, lifecycle, and redemption limits.</p>
          </DialogHeader>
          <div className="space-y-6 mt-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Unique Code</Label>
                <Input
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  className="h-11 rounded-xl border-border font-mono font-bold text-blue-600"
                  placeholder="e.g. SAVE50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Internal Status</Label>
                <Select
                  value={form.isActive ? "active" : "inactive"}
                  onValueChange={(value) => setForm({ ...form, isActive: value === "active" })}
                >
                  <SelectTrigger className="h-11 rounded-xl border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-none shadow-xl">
                    <SelectItem value="active">Active (Published)</SelectItem>
                    <SelectItem value="inactive">Paused (Draft)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Description</Label>
              <Input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="h-11 rounded-xl border-border"
                placeholder="e.g. 10% off for new member annual signups"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Calculation Type</Label>
                <Select
                  value={form.type}
                  onValueChange={(value) => setForm({ ...form, type: value as DiscountType })}
                >
                  <SelectTrigger className="h-11 rounded-xl border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-none shadow-xl">
                    <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                    <SelectItem value="FIXED">Flat Amount ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Benefit Amount</Label>
                <Input
                  type="number"
                  min="0"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  className="h-11 rounded-xl border-border font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Rollout Date</Label>
                <GoogleDateTimePicker
                  value={form.startsAt}
                  onChange={(value) => setForm({ ...form, startsAt: value })}
                  label="Start Date"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Expiry Date</Label>
                <GoogleDateTimePicker
                  value={form.endsAt}
                  onChange={(value) => setForm({ ...form, endsAt: value })}
                  label="End Date"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Maximum Redemptions</Label>
              <Input
                type="number"
                min="0"
                value={form.maxRedemptions}
                onChange={(e) => setForm({ ...form, maxRedemptions: e.target.value })}
                className="h-11 rounded-xl border-border"
                placeholder="Leave empty for unlimited"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={() => setDialogOpen(false)} variant="ghost" className="flex-1 h-12 rounded-xl text-muted-foreground font-semibold">
                Cancel
              </Button>
              <Button onClick={handleSave} className="flex-[2] h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-100 uppercase tracking-wider">
                {editing ? "Update Campaign" : "Launch Campaign"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Discounts;
