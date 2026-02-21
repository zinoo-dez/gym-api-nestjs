import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  workoutPlansService,
  type WorkoutPlan,
} from "@/services/workout-plans.service";
import { WorkoutPlanModal } from "@/components/gym/WorkoutPlanModal";
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

const WorkoutPlansPage = () => {
  const [rows, setRows] = useState<WorkoutPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<WorkoutPlan | null>(null);

  const loadRows = useCallback(async () => {
    setLoading(true);
    try {
      const response = await workoutPlansService.getAll({ limit: 200 });
      const items = Array.isArray(response?.data) ? response.data : [];
      setRows(items);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to load workout plans");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRows();
  }, [loadRows]);

  const visibleRows = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return rows.filter((row) => {
      const passStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "active"
            ? row.isActive
            : !row.isActive;
      if (!passStatus) return false;
      if (!keyword) return true;
      return (
        row.name.toLowerCase().includes(keyword) ||
        row.memberName?.toLowerCase().includes(keyword) ||
        row.goal.toLowerCase().includes(keyword)
      );
    });
  }, [rows, search, statusFilter]);

  const openCreate = () => {
    setEditingPlan(null);
    setModalOpen(true);
  };

  const openEdit = async (id: string) => {
    try {
      const plan = await workoutPlansService.getById(id);
      setEditingPlan(plan);
      setModalOpen(true);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to load plan details");
    }
  };

  const deactivatePlan = async (id: string) => {
    try {
      await workoutPlansService.deactivate(id);
      setRows((prev) => prev.map((item) => (item.id === id ? { ...item, isActive: false } : item)));
      toast.success("Workout plan deactivated");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to deactivate plan");
    }
  };

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-border bg-card p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="m3-title-md">Workout Plans</h1>
            <p className="text-sm text-muted-foreground">
              Create and manage personalized workout plans for members.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={loadRows} disabled={loading}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Create Plan
            </Button>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="mb-5 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by member or plan"
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant={statusFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("all")}
            >
              All
            </Button>
            <Button
              variant={statusFilter === "active" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("active")}
            >
              Active
            </Button>
            <Button
              variant={statusFilter === "inactive" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("inactive")}
            >
              Inactive
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          {loading ? (
            <p className="py-10 text-center text-sm text-muted-foreground">Loading workout plans...</p>
          ) : visibleRows.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">No workout plans found.</p>
          ) : (
            visibleRows.map((row) => (
              <div
                key={row.id}
                className="flex flex-col gap-3 rounded-xl border p-4 md:flex-row md:items-center md:justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{row.name}</p>
                    <Badge variant="outline">{row.goal}</Badge>
                    <Badge
                      className={
                        row.isActive
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-muted text-muted-foreground"
                      }
                    >
                      {row.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Member: {row.memberName} | Trainer: {row.trainerId}
                  </p>
                  {row.description && (
                    <p className="text-sm text-muted-foreground">{row.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(row.id)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  {row.isActive && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Deactivate workout plan?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will disable the workout plan but keep history for reporting.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deactivatePlan(row.id)}>
                            Deactivate
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <WorkoutPlanModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={loadRows}
        plan={editingPlan}
      />
    </div>
  );
};

export default WorkoutPlansPage;
