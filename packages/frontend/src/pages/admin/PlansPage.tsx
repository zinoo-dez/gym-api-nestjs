
import { useEffect, useMemo, useState } from "react";
import { AdminLayout } from "@/layouts";
import { PrimaryButton } from "@/components/gym";
import { Badge } from "@/components/ui/badge";
import { membershipsService, type MembershipPlan } from "@/services/memberships.service";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  DollarSign,
  Users,
  TrendingUp,
  Check,
  X,
} from "lucide-react";

export default function AdminPlansPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPlans = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await membershipsService.getAllPlans({ limit: 50 });
        setPlans(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        console.error("Error loading plans:", err);
        setError("Failed to load plans.");
        setPlans([]);
      } finally {
        setLoading(false);
      }
    };

    loadPlans();
  }, []);

  const filteredPlans = useMemo(
    () =>
      plans.filter((plan) =>
        plan.name.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [plans, searchQuery],
  );

  const totalRevenue = filteredPlans.reduce((acc, plan) => acc + plan.price, 0);

  const totalSubscribers = 0;

  const getStatusBadge = () => (
    <Badge className="bg-primary/20 text-primary border-primary/30">
      Active
    </Badge>
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Membership Plans
            </h1>
            <p className="text-muted-foreground">
              Manage pricing plans and subscriptions
            </p>
          </div>
          <PrimaryButton>
            <Plus className="mr-2 h-4 w-4" />
            Create New Plan
          </PrimaryButton>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  ${totalRevenue.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">Monthly Revenue</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {totalSubscribers}
                </p>
                <p className="text-sm text-muted-foreground">
                  Active Subscribers
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {totalSubscribers ? `$${(totalRevenue / totalSubscribers).toFixed(0)}` : "—"}
                </p>
                <p className="text-sm text-muted-foreground">Avg Revenue/User</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {plans.length}
                </p>
                <p className="text-sm text-muted-foreground">Active Plans</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search plans..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-border bg-card py-2 pl-10 pr-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Plans Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <div className="col-span-full text-center text-muted-foreground">
              Loading plans...
            </div>
          ) : error ? (
            <div className="col-span-full text-center text-destructive">
              {error}
            </div>
          ) : filteredPlans.length === 0 ? (
            <div className="col-span-full text-center text-muted-foreground">
              No plans found.
            </div>
          ) : (
          filteredPlans.map((plan, index) => (
            <div
              key={plan.id}
              className={`relative rounded-lg border bg-card p-6 transition-all hover:border-primary/50 ${
                index === 1 ? "border-primary" : "border-border"
              }`}
            >
              {index === 1 && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">
                    Most Popular
                  </Badge>
                </div>
              )}

              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold text-foreground">
                    {plan.name}
                  </h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-primary">
                      ${plan.price}
                    </span>
                    <span className="text-muted-foreground">
                      /month
                    </span>
                  </div>
                </div>
                {getStatusBadge()}
              </div>

              <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                — active subscribers
              </div>

              <ul className="mt-4 space-y-2">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2 text-sm text-foreground"
                  >
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                <p className="text-sm text-muted-foreground">
                  Revenue: —/mo
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    aria-label="Edit plan"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    aria-label="Delete plan"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )))}
        </div>
      </div>
    </AdminLayout>
  );
}
