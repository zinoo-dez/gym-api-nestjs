import { useCallback, useEffect, useMemo, useState } from "react";
import {
  featuresService,
  type CreateFeatureRequest,
  type Feature,
  type UpdateFeatureRequest,
} from "@/services/features.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Pencil, Trash2, RefreshCcw, Search, RotateCcw } from "lucide-react";
import { toast } from "sonner";

const FeaturesPage = () => {
  const [rows, setRows] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Feature | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    isSystem: false,
    defaultName: "",
  });

  const loadRows = useCallback(async () => {
    setLoading(true);
    try {
      const response = await featuresService.getAll({ limit: 200, name: search || undefined });
      setRows(Array.isArray(response?.data) ? response.data : []);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to load features");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    loadRows();
  }, [loadRows]);

  const visibleRows = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return rows;
    return rows.filter(
      (feature) =>
        feature.name.toLowerCase().includes(keyword) ||
        feature.description?.toLowerCase().includes(keyword),
    );
  }, [rows, search]);

  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      isSystem: false,
      defaultName: "",
    });
  };

  const openCreate = () => {
    setEditing(null);
    resetForm();
    setDialogOpen(true);
  };

  const openEdit = (feature: Feature) => {
    setEditing(feature);
    setForm({
      name: feature.name,
      description: feature.description || "",
      isSystem: feature.isSystem,
      defaultName: feature.defaultName || "",
    });
    setDialogOpen(true);
  };

  const saveFeature = async () => {
    if (!form.name.trim()) {
      toast.error("Feature name is required");
      return;
    }

    try {
      if (editing) {
        const payload: UpdateFeatureRequest = {
          name: form.name.trim(),
          description: form.description.trim() || undefined,
        };
        const updated = await featuresService.update(editing.id, payload);
        setRows((prev) => prev.map((row) => (row.id === updated.id ? updated : row)));
        toast.success("Feature updated");
      } else {
        const payload: CreateFeatureRequest = {
          name: form.name.trim(),
          description: form.description.trim() || undefined,
          isSystem: form.isSystem,
          defaultName: form.defaultName.trim() || undefined,
        };
        const created = await featuresService.create(payload);
        setRows((prev) => [created, ...prev]);
        toast.success("Feature created");
      }
      setDialogOpen(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to save feature");
    }
  };

  const removeFeature = async (id: string) => {
    try {
      await featuresService.remove(id);
      setRows((prev) => prev.filter((row) => row.id !== id));
      toast.success("Feature deleted");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to delete feature");
    }
  };

  const restoreDefault = async (feature: Feature) => {
    try {
      const updated = await featuresService.restoreDefaultName(feature.id);
      setRows((prev) => prev.map((row) => (row.id === updated.id ? updated : row)));
      toast.success("Default feature name restored");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to restore default name");
    }
  };

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-border bg-card p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="m3-title-md">Feature Catalog</h1>
            <p className="text-sm text-muted-foreground">
              Manage reusable features used in membership plan configuration.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={loadRows} disabled={loading}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Add Feature
            </Button>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="mb-5 flex items-center gap-2">
          <div className="relative w-full lg:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search feature catalog"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-y border-border bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Feature</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Default Name</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-muted-foreground">
                    Loading features...
                  </td>
                </tr>
              ) : visibleRows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-muted-foreground">
                    No features found.
                  </td>
                </tr>
              ) : (
                visibleRows.map((feature) => (
                  <tr key={feature.id} className="border-b border-border hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <p className="font-medium">{feature.name}</p>
                      {feature.description && (
                        <p className="text-xs text-muted-foreground">{feature.description}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={feature.isSystem ? "default" : "outline"}>
                        {feature.isSystem ? "System" : "Custom"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {feature.defaultName || "-"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        {feature.isSystem && feature.defaultName && feature.defaultName !== feature.name && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => restoreDefault(feature)}
                            title="Restore default name"
                          >
                            <RotateCcw className="h-4 w-4 text-amber-600" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" onClick={() => openEdit(feature)}>
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
                              <AlertDialogTitle>Delete feature?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This may affect membership plan feature mappings.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => removeFeature(feature.id)}>
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
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Feature" : "Create Feature"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Feature name"
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Optional description"
              />
            </div>

            {!editing && (
              <>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="feature-is-system"
                    checked={form.isSystem}
                    onCheckedChange={(checked) =>
                      setForm((prev) => ({ ...prev, isSystem: Boolean(checked) }))
                    }
                  />
                  <Label htmlFor="feature-is-system">System feature</Label>
                </div>

                {form.isSystem && (
                  <div className="space-y-2">
                    <Label>Default Name</Label>
                    <Input
                      value={form.defaultName}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, defaultName: e.target.value }))
                      }
                      placeholder="Default system name"
                    />
                  </div>
                )}
              </>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={saveFeature}>{editing ? "Update" : "Create"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FeaturesPage;
