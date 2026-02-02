
import { useState } from "react";
import { AdminLayout } from "@/layouts";
import { PrimaryButton, SecondaryButton } from "@/components/gym";
import { Badge } from "@/components/ui/badge";
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

interface Plan {
  id: string;
  name: string;
  price: number;
  billingPeriod: "monthly" | "quarterly" | "yearly";
  features: string[];
  activeSubscribers: number;
  status: "active" | "inactive" | "archived";
  popular: boolean;
  createdAt: string;
}

const mockPlans: Plan[] = [
  {
    id: "1",
    name: "Basic",
    price: 29,
    billingPeriod: "monthly",
    features: [
      "Access to gym equipment",
      "Locker room access",
      "Free WiFi",
      "2 guest passes/month",
    ],
    activeSubscribers: 245,
    status: "active",
    popular: false,
    createdAt: "2023-01-01",
  },
  {
    id: "2",
    name: "Pro",
    price: 59,
    billingPeriod: "monthly",
    features: [
      "Everything in Basic",
      "Unlimited group classes",
      "Personal training session/month",
      "Nutrition consultation",
      "Priority booking",
    ],
    activeSubscribers: 412,
    status: "active",
    popular: true,
    createdAt: "2023-01-01",
  },
  {
    id: "3",
    name: "Elite",
    price: 99,
    billingPeriod: "monthly",
    features: [
      "Everything in Pro",
      "4 PT sessions/month",
      "Access to premium areas",
      "Free merchandise",
      "Bring 2 friends free",
      "Recovery room access",
    ],
    activeSubscribers: 156,
    status: "active",
    popular: false,
    createdAt: "2023-01-01",
  },
  {
    id: "4",
    name: "Student",
    price: 19,
    billingPeriod: "monthly",
    features: [
      "Access to gym equipment",
      "Locker room access",
      "Free WiFi",
      "Valid student ID required",
    ],
    activeSubscribers: 89,
    status: "active",
    popular: false,
    createdAt: "2023-06-15",
  },
  {
    id: "5",
    name: "Corporate",
    price: 499,
    billingPeriod: "monthly",
    features: [
      "Up to 10 employees",
      "Dedicated account manager",
      "Custom wellness programs",
      "On-site fitness events",
    ],
    activeSubscribers: 23,
    status: "inactive",
    popular: false,
    createdAt: "2023-03-10",
  },
];

export default function AdminPlansPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPlans = mockPlans.filter((plan) =>
    plan.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalRevenue = mockPlans.reduce(
    (acc, plan) => acc + plan.price * plan.activeSubscribers,
    0
  );

  const totalSubscribers = mockPlans.reduce(
    (acc, plan) => acc + plan.activeSubscribers,
    0
  );

  const getStatusBadge = (status: Plan["status"]) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-primary/20 text-primary border-primary/30">
            Active
          </Badge>
        );
      case "inactive":
        return (
          <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30">
            Inactive
          </Badge>
        );
      case "archived":
        return (
          <Badge className="bg-muted text-muted-foreground border-border">
            Archived
          </Badge>
        );
    }
  };

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
                  ${(totalRevenue / totalSubscribers).toFixed(0)}
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
                  {mockPlans.filter((p) => p.status === "active").length}
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
          {filteredPlans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-lg border bg-card p-6 transition-all hover:border-primary/50 ${
                plan.popular ? "border-primary" : "border-border"
              }`}
            >
              {plan.popular && (
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
                      /{plan.billingPeriod}
                    </span>
                  </div>
                </div>
                {getStatusBadge(plan.status)}
              </div>

              <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                {plan.activeSubscribers} active subscribers
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
                  Revenue: ${(plan.price * plan.activeSubscribers).toLocaleString()}/mo
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
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
