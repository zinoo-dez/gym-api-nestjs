import React, { useEffect, useMemo, useState } from "react";
import { AdminLayout } from "@/layouts";
import { PrimaryButton } from "@/components/gym";
import { workoutPlansService, type WorkoutPlan } from "@/services/workout-plans.service";

export default function AdminWorkoutPlansPage() {
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
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

    loadPlans();
  }, []);

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
          <PrimaryButton>Create Workout Plan</PrimaryButton>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search plans..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-border bg-card py-2 pl-4 pr-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
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
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Trainer</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Exercises</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Created</th>
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
                          <p className="text-sm text-muted-foreground">{plan.description || "—"}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-muted-foreground">{plan.goal}</td>
                      <td className="px-4 py-4 text-muted-foreground">{plan.memberId}</td>
                      <td className="px-4 py-4 text-muted-foreground">{plan.trainerId}</td>
                      <td className="px-4 py-4 text-muted-foreground">
                        {plan.exercises ? plan.exercises.length : 0}
                      </td>
                      <td className="px-4 py-4 text-muted-foreground">
                        {new Date(plan.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
