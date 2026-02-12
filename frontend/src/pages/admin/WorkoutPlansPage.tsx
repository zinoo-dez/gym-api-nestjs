import React, { useEffect, useMemo, useState } from "react";
import { AdminLayout } from "@/layouts";
import { PrimaryButton, WorkoutPlanModal } from "@/components/gym";
import { workoutPlansService, type WorkoutPlan } from "@/services/workout-plans.service";
import { Edit2, Trash2, Search } from "lucide-react";
import { toast } from "sonner";

export default function AdminWorkoutPlansPage() {
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<WorkoutPlan | null>(null);

  const loadPlans = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await workoutPlansService.getAll({ limit: 50 });
      setPlans(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Error loading workout plans:", err);
      setError("Failed to load workout plans.");
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const handleCreate = () => {
    setSelectedPlan(null);
    setIsModalOpen(true);
  };

  const handleEdit = (plan: WorkoutPlan) => {
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to deactivate this workout plan?")) {
      return;
    }

    try {
      await workoutPlansService.deactivate(id);
      toast.success("Workout plan deactivated");
      loadPlans();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to deactivate workout plan");
    }
  };

  const filteredPlans = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return plans.filter((plan) =>
      plan.name.toLowerCase().includes(query) ||
      (plan.description || "").toLowerCase().includes(query),
    );
  }, [plans, searchQuery]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Workout Plans</h1>
            <p className="text-muted-foreground">Manage workout plans across members.</p>
          </div>
          <PrimaryButton onClick={handleCreate}>Create Workout Plan</PrimaryButton>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search plans..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-border bg-card py-2 pl-10 pr-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Plan</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Goal</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Member</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Exercises</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                      Loading workout plans...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-destructive">
                      {error}
                    </td>
                  </tr>
                ) : filteredPlans.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                      No workout plans found.
                    </td>
                  </tr>
                ) : (
                  filteredPlans.map((plan) => (
                    <tr key={plan.id} className="transition-colors hover:bg-muted/30">
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-medium text-foreground">{plan.name}</p>
                          <p className="text-xs text-muted-foreground">{new Date(plan.createdAt).toLocaleDateString()}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                          {plan.goal.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-muted-foreground">{plan.memberName}</td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${plan.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {plan.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-muted-foreground">
                        {plan.exercises ? plan.exercises.length : 0} exercises
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(plan)}
                            className="rounded-md p-1 hover:bg-muted text-primary"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(plan.id)}
                            className="rounded-md p-1 hover:bg-muted text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
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

      <WorkoutPlanModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadPlans}
        plan={selectedPlan}
      />
    </AdminLayout>
  );
}
