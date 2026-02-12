import * as React from "react";
import { AdminLayout } from "../../layouts";
import { PrimaryButton, SecondaryButton, FormInput, Modal } from "@/components/gym";
import { ConfirmationDialog } from "@/components/gym/confirmation-dialog";
import {
  discountCodesService,
  type DiscountCode,
  type DiscountType,
} from "@/services/discount-codes.service";
import { toast } from "sonner";

const typeOptions: Array<{ value: DiscountType; label: string }> = [
  { value: "PERCENT", label: "Percent (%)" },
  { value: "FIXED", label: "Fixed ($)" },
];

export default function DiscountCodesPage() {
  const [codes, setCodes] = React.useState<DiscountCode[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<DiscountCode | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [usageMap, setUsageMap] = React.useState<
    Record<string, { totalDiscount: number; usedCount: number }>
  >({});

  const [form, setForm] = React.useState({
    code: "",
    description: "",
    type: "PERCENT" as DiscountType,
    amount: 0,
    isActive: true,
    maxRedemptions: "",
    startsAt: "",
    endsAt: "",
  });

  const loadCodes = React.useCallback(async () => {
    setLoading(true);
    try {
      const response = await discountCodesService.getAll({ limit: 200 });
      setCodes(Array.isArray(response.data) ? response.data : []);
      const usage = await discountCodesService.getUsage();
      const map: Record<string, { totalDiscount: number; usedCount: number }> =
        {};
      if (Array.isArray(usage)) {
        usage.forEach((row) => {
          map[row.id] = {
            totalDiscount: Number(row.totalDiscount || 0),
            usedCount: Number(row.usedCount || 0),
          };
        });
      }
      setUsageMap(map);
    } catch (err) {
      console.error("Failed to load discount codes:", err);
      toast.error("Failed to load discount codes");
      setCodes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadCodes();
  }, [loadCodes]);

  const openCreate = () => {
    setForm({
      code: "",
      description: "",
      type: "PERCENT",
      amount: 0,
      isActive: true,
      maxRedemptions: "",
      startsAt: "",
      endsAt: "",
    });
    setIsCreateOpen(true);
  };

  const openEdit = (code: DiscountCode) => {
    setSelected(code);
    setForm({
      code: code.code,
      description: code.description || "",
      type: code.type,
      amount: code.amount,
      isActive: code.isActive,
      maxRedemptions:
        typeof code.maxRedemptions === "number"
          ? String(code.maxRedemptions)
          : "",
      startsAt: code.startsAt ? code.startsAt.split("T")[0] : "",
      endsAt: code.endsAt ? code.endsAt.split("T")[0] : "",
    });
    setIsEditOpen(true);
  };

  const openDelete = (code: DiscountCode) => {
    setSelected(code);
    setIsDeleteOpen(true);
  };

  const handleCreate = async () => {
    setSaving(true);
    try {
      const created = await discountCodesService.create({
        code: form.code,
        description: form.description || undefined,
        type: form.type,
        amount: Number(form.amount),
        isActive: form.isActive,
        maxRedemptions: form.maxRedemptions
          ? Number(form.maxRedemptions)
          : undefined,
        startsAt: form.startsAt || undefined,
        endsAt: form.endsAt || undefined,
      });
      setCodes((prev) => [created, ...prev]);
      setIsCreateOpen(false);
      toast.success("Discount code created");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to create discount code");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const updated = await discountCodesService.update(selected.id, {
        code: form.code,
        description: form.description || undefined,
        type: form.type,
        amount: Number(form.amount),
        isActive: form.isActive,
        maxRedemptions: form.maxRedemptions
          ? Number(form.maxRedemptions)
          : undefined,
        startsAt: form.startsAt || undefined,
        endsAt: form.endsAt || undefined,
      });
      setCodes((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      setIsEditOpen(false);
      setSelected(null);
      toast.success("Discount code updated");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update discount code");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    setDeleting(true);
    try {
      await discountCodesService.remove(selected.id);
      setCodes((prev) => prev.filter((c) => c.id !== selected.id));
      setIsDeleteOpen(false);
      setSelected(null);
      toast.success("Discount code deleted");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete discount code");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Discount Codes</h1>
            <p className="text-muted-foreground">
              Create and manage promotional discount codes.
            </p>
          </div>
          <PrimaryButton onClick={openCreate}>New Code</PrimaryButton>
        </div>

        <div className="rounded-lg border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Redemptions</th>
                  <th className="px-4 py-3">Total Discount</th>
                  <th className="px-4 py-3">Valid</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td className="px-4 py-6 text-muted-foreground" colSpan={7}>
                      Loading discount codes...
                    </td>
                  </tr>
                ) : codes.length === 0 ? (
                  <tr>
                    <td className="px-4 py-6 text-muted-foreground" colSpan={7}>
                      No discount codes found.
                    </td>
                  </tr>
                ) : (
                  codes.map((code) => (
                    <tr key={code.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-3 font-medium text-foreground">{code.code}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {code.type === "PERCENT" ? "Percent" : "Fixed"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {code.type === "PERCENT" ? `${code.amount}%` : `$${code.amount}`}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-semibold ${
                            code.isActive
                              ? "bg-primary/10 text-primary"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {code.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {(usageMap[code.id]?.usedCount ?? code.usedCount)}
                        {code.maxRedemptions ? ` / ${code.maxRedemptions}` : ""}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        ${Number(usageMap[code.id]?.totalDiscount ?? 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {code.startsAt ? code.startsAt.split("T")[0] : "Any"}
                        {" - "}
                        {code.endsAt ? code.endsAt.split("T")[0] : "Any"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <SecondaryButton onClick={() => openEdit(code)}>
                            Edit
                          </SecondaryButton>
                          <SecondaryButton onClick={() => openDelete(code)}>
                            Delete
                          </SecondaryButton>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create Discount Code"
      >
        <div className="space-y-4">
          <FormInput
            label="Code"
            value={form.code}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, code: e.target.value }))
            }
            placeholder="SAVE20"
          />
          <FormInput
            label="Description"
            value={form.description}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, description: e.target.value }))
            }
            placeholder="20% off memberships"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">
                Type
              </label>
              <select
                value={form.type}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    type: e.target.value as DiscountType,
                  }))
                }
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground"
              >
                {typeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <FormInput
              label="Amount"
              type="number"
              value={String(form.amount)}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, amount: Number(e.target.value) }))
              }
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormInput
              label="Max Redemptions"
              type="number"
              value={form.maxRedemptions}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, maxRedemptions: e.target.value }))
              }
              placeholder="Unlimited"
            />
            <div className="flex items-center gap-2 pt-6">
              <input
                id="isActiveCreate"
                type="checkbox"
                checked={form.isActive}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, isActive: e.target.checked }))
                }
              />
              <label htmlFor="isActiveCreate" className="text-sm text-foreground">
                Active
              </label>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormInput
              label="Starts At"
              type="date"
              value={form.startsAt}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, startsAt: e.target.value }))
              }
            />
            <FormInput
              label="Ends At"
              type="date"
              value={form.endsAt}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, endsAt: e.target.value }))
              }
            />
          </div>
          <div className="flex justify-end">
            <PrimaryButton onClick={handleCreate} disabled={saving}>
              {saving ? "Saving..." : "Create Code"}
            </PrimaryButton>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Discount Code"
      >
        <div className="space-y-4">
          <FormInput
            label="Code"
            value={form.code}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, code: e.target.value }))
            }
          />
          <FormInput
            label="Description"
            value={form.description}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, description: e.target.value }))
            }
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">
                Type
              </label>
              <select
                value={form.type}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    type: e.target.value as DiscountType,
                  }))
                }
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground"
              >
                {typeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <FormInput
              label="Amount"
              type="number"
              value={String(form.amount)}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, amount: Number(e.target.value) }))
              }
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormInput
              label="Max Redemptions"
              type="number"
              value={form.maxRedemptions}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, maxRedemptions: e.target.value }))
              }
              placeholder="Unlimited"
            />
            <div className="flex items-center gap-2 pt-6">
              <input
                id="isActiveEdit"
                type="checkbox"
                checked={form.isActive}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, isActive: e.target.checked }))
                }
              />
              <label htmlFor="isActiveEdit" className="text-sm text-foreground">
                Active
              </label>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormInput
              label="Starts At"
              type="date"
              value={form.startsAt}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, startsAt: e.target.value }))
              }
            />
            <FormInput
              label="Ends At"
              type="date"
              value={form.endsAt}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, endsAt: e.target.value }))
              }
            />
          </div>
          <div className="flex justify-end">
            <PrimaryButton onClick={handleUpdate} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </PrimaryButton>
          </div>
        </div>
      </Modal>

      <ConfirmationDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Discount Code"
        message={`Are you sure you want to delete ${selected?.code}?`}
        confirmLabel={deleting ? "Deleting..." : "Delete"}
        confirmVariant="destructive"
        disabled={deleting}
      />
    </AdminLayout>
  );
}
